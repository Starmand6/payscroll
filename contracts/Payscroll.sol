//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Wizard Payscroll
/// @author Armand Daigle
/// @notice This contract keeps track of an event/production organization
/// by recording payment transactions and employees on the blockchain.
/// @dev Inherits OpenZeppelin ownable and AggregatorV3 interface contracts.
/// @custom:portfolio This contract is purely for portfolio purposes.
contract Payscroll is Ownable {
    /**
     * @dev Employee data struct: Employees are named wizards. If a wizard never works
     * or dies, their entry will still exist forever. This way, employees have same
     * unique ID forever. Wizard.onCurrentProject would just never be set to true.
     */
    struct Wizard {
        string name;
        address payable wallet;
        string title;
        uint256 dayRate;
        bool onProductionCrew;
        bool hasBeenPaid;
    }

    enum Production {
        HasKickedOff,
        CrewIsSet,
        ContractPaymentReceived,
        PaymentsAreAvailable,
        PaymentsAreAllWithdrawn,
        HasClosedOut
    }

    /// The wizards array contains all crew members (and their
    /// associated profiles) that have registered with the organization
    Wizard[] internal wizards;

    /// status keeps track of which stage the production is at.
    Production public status;

    /// These variables are used to define each production.
    uint256 public productionContractTotal;
    uint256 public contractTotalMax = 1000000000000000000;
    uint16 public productionDays;
    uint32[] public wizardsOnProductionCrew;

    /// @dev Chainlink oracle price feed variable
    AggregatorV3Interface internal s_maticUSDPriceFeed;

    /// Mappings to access wizard data
    mapping(uint32 => Wizard) public wizardIDToData;
    mapping(address => Wizard) public walletToData;
    mapping(uint32 => address) public wizardIDToWallet;

    /// Events
    event ANewWizardHasEnteredTheChat(uint32 wizardID, string name);
    event ProductionHasKickedOff();
    event ProductionCrewIsSet(uint32[] wizardsOnProduction);
    event WizardsPaymentProcessing();
    event PaymentsCanBeWithdrawn();
    event AllWizardsHaveBeenPaid();
    event ProductionHasClosedOut();
    event IfYouEraseTheDebtRecordThenWeAllGoBackToZero();

    /// Errors
    error FunctionUnavailableAtThisProductionStatus();
    error TotalMustUnderContractMax();
    error CrewMustMatchContractTotal();
    error PaymentMustEqualContractTotal(uint256 valueSent, uint256 productionContractTotal);
    error WizardHasAlreadyBeenPaid();
    error NotAuthorizedToWithdrawPayment();
    error InsufficientFunds(uint256 amountOwed, uint256 amountAvailable);
    error WizardIsNotOnProductionCrew();

    modifier onlyWhen(Production _status) {
        if (status != _status) {
            revert FunctionUnavailableAtThisProductionStatus();
        }
        _;
    }

    /// @notice Production status starts fresh (HasClosedOut) at deployment.
    /// @dev Contract will be deployed on Polygon Mumbai Testnet. Chainlink
    /// Mumbai MATIC/USD price feed address: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada"
    constructor(address maticPerUSDPriceFeedAddress) {
        s_maticUSDPriceFeed = AggregatorV3Interface(maticPerUSDPriceFeedAddress);
        status = Production.HasClosedOut;
    }

    receive() external payable {}

    fallback() external payable {}

    /**
     * @notice Booleans onProductionCrew and hasBeenPaid are defaulted to false.
     * @dev For this portfolio project, the Payscroll Manager can only add new employees
     * in between productions. This has undesirable limitations and would not be a restraint
     * in a production environment. In said setting, this contract would also have a function
     * to modify the wizard data.
     */
    function addNewWizard(
        string calldata _name,
        address payable _wallet,
        string calldata _title,
        uint256 _dayRate
    ) external /*onlyOwner*/ onlyWhen(Production.HasClosedOut) {
        // Getting wizard (employee) ID programmatically.
        uint32 wizardID;
        // This if statement only runs for the very first wizard, since the wizards
        // array will be empty.
        if (getWizardCount() == 0) {
            wizardID = 0;
        } else {
            // If there is one wizard, getWizardsCount() function returns one, so
            // newest wizard ID would be one, since very first wizard ID# is zero.
            // The last entered wizard will always have a wizardID one less than the wizard count.
            wizardID = getWizardCount();
        }
        wizards.push(Wizard(_name, _wallet, _title, _dayRate, false, false));
        wizardIDToData[wizardID] = Wizard(_name, _wallet, _title, _dayRate, false, false);
        walletToData[_wallet] = Wizard(_name, _wallet, _title, _dayRate, false, false);
        wizardIDToWallet[wizardID] = _wallet;
        emit ANewWizardHasEnteredTheChat(wizardID, wizardIDToData[wizardID].name);
    }

    /// @notice This function is only for testnet purposes, initially set at 1 MATIC.
    function setContractTotalMax(uint256 max) external onlyOwner {
        contractTotalMax = max;
    }

    /// External party paying for production will see production total in app/portal.
    function kickOffProduction(
        uint256 _productionContractTotal,
        uint16 _productionDays
    ) external /*onlyOwner*/ onlyWhen(Production.HasClosedOut) {
        if (_productionContractTotal > contractTotalMax) {
            revert TotalMustUnderContractMax();
        }
        status = Production.HasKickedOff;
        productionContractTotal = _productionContractTotal;
        productionDays = _productionDays;
        emit ProductionHasKickedOff();
    }

    /// @dev This function forces the Payscroll Manager to pick a crew whose combined
    /// dayRates over the # of days match the contract total. This should catch most
    /// of the accidental human oversights, but of course not all. In production, this
    /// contract would have a function that could override production crews, if a wizard
    /// becomes sick, has a conflict, etc.
    function setProductionCrew(
        uint32[] calldata _wizardsOnProductionCrew
    ) external /*onlyOwner*/ onlyWhen(Production.HasKickedOff) {
        wizardsOnProductionCrew = _wizardsOnProductionCrew;
        uint256 totalDayRate;
        uint256 totalCrewCost;
        uint32 i = 0;

        // Owner enters ids of crew and for loop changes all onProductionCrew bools to true.
        for (; i < wizardsOnProductionCrew.length; i++) {
            uint32 wizID = wizardsOnProductionCrew[i];
            wizardIDToData[wizID].onProductionCrew = true;
            walletToData[msg.sender].onProductionCrew = true;
            totalDayRate += wizardIDToData[wizID].dayRate;
        }
        totalCrewCost = totalDayRate * productionDays;
        if (totalCrewCost != productionContractTotal) {
            revert CrewMustMatchContractTotal();
        }
        status = Production.CrewIsSet;
        emit ProductionCrewIsSet(wizardsOnProductionCrew);
    }

    /// Can do a ton of things here, but for this portfolio version, the payment
    /// must exactly equal the contract total for the transaction to complete.
    function payWizards() external payable onlyWhen(Production.CrewIsSet) {
        if (msg.value != productionContractTotal) {
            revert PaymentMustEqualContractTotal(msg.value, productionContractTotal);
        }
        status = Production.ContractPaymentReceived;
        emit WizardsPaymentProcessing();
    }

    /**
     * This is mostly a sanity check. Payscroll Manager can call getContractBalance(),
     * and if the project or crew was set wrong or some unforeseen issue occurs,
     * Manager can at least have this breather in the process to figure out what is wrong
     * and solve problems. At the very least, it keeps them engaged.
     */
    function paymentVerified() external /*onlyOwner*/ onlyWhen(Production.ContractPaymentReceived) {
        status = Production.PaymentsAreAvailable;
        emit PaymentsCanBeWithdrawn();
    }

    /**
     * @notice Function contains several verifications:
     * 1. Production is at PaymentsAreAvailable stage.
     * 2. Wizard can only be paid once per production.
     * 3. Wizard must both know their ID and have their authorized wallet connected.
     * 4. Wizard is on the current production's crew.
     * 5. Payscroll contract must have enough funds.
     * @return wizard sees payment total in both USD and ETH.
     */
    function withdrawPayment(
        uint32 wizID
    ) external onlyWhen(Production.PaymentsAreAvailable) returns (uint256, uint256) {
        if (walletToData[msg.sender].hasBeenPaid == true) {
            revert WizardHasAlreadyBeenPaid();
        }
        if (wizardIDToWallet[wizID] != msg.sender) {
            revert NotAuthorizedToWithdrawPayment();
        }
        if (wizardIDToData[wizID].onProductionCrew == false) {
            revert WizardIsNotOnProductionCrew();
        }

        // Amount owed is auto-calculated, removing opportunity for human error/mischeif.
        uint256 wizDayRate = walletToData[msg.sender].dayRate;
        uint256 maticAmount = productionDays * wizDayRate;
        uint256 contractBalance = address(this).balance;
        contractBalance -= maticAmount;
        (, int256 _maticPerUSDPrice, , , ) = s_maticUSDPriceFeed.latestRoundData();
        uint256 maticPerUSDPrice = uint(_maticPerUSDPrice);
        uint256 usdAmount = maticAmount / maticPerUSDPrice;

        // Two checks to hopefully avoid re-entrancy attacks: 1. Changing state variables
        // first before external call. 2. Using a hasBeenPaid "lock" on the function.
        walletToData[msg.sender].hasBeenPaid = true;
        wizardIDToData[wizID].hasBeenPaid = true;
        (bool success, ) = payable(msg.sender).call{value: maticAmount}("");
        if (!success) {
            walletToData[msg.sender].hasBeenPaid = false;
            wizardIDToData[wizID].hasBeenPaid = false;
        }
        require(success, "Payment withdrawal failed.");

        // contractBalance of 0 should mean that all wizards on crew withdrew.
        if (contractBalance == 0) {
            status = Production.PaymentsAreAllWithdrawn;
        }
        emit AllWizardsHaveBeenPaid();

        return (usdAmount, maticAmount);
    }

    /// Owner (or Payroll Manager or Production Manager) Functions

    /// Resets all wizard booleans and production variables to enable clean slate kickoff
    /// of next production.
    function closeOutProduction()
        public
        /*onlyOwner*/ onlyWhen(Production.PaymentsAreAllWithdrawn)
    {
        status = Production.HasClosedOut;
        productionContractTotal = 0;
        productionDays = 0;
        uint32 i;
        uint32 wizID;
        address wizwallet;
        for (; i < wizardsOnProductionCrew.length; i++) {
            // Since not all wizards will be on the current production crew:
            wizID = wizardsOnProductionCrew[i];
            wizardIDToData[wizID].hasBeenPaid = false;
            wizardIDToData[wizID].onProductionCrew = false;
            wizwallet = wizardIDToWallet[wizID];
            walletToData[wizwallet].hasBeenPaid = false;
            walletToData[wizwallet].onProductionCrew = false;
        }
        delete wizardsOnProductionCrew;
        emit ProductionHasClosedOut();
    }

    /// For Testnet build only, in case someone breaks the dApp. This effectively is the
    /// same as closeOutProduction(), but the contract owner can call this at any time.
    function weAllGoBackToZero() external onlyOwner {
        status = Production.PaymentsAreAllWithdrawn;
        closeOutProduction();
        emit IfYouEraseTheDebtRecordThenWeAllGoBackToZero();
    }

    /// Getters

    /// Wizards can use this function to verify their data, including if they
    /// are on the crew payroll of the current production. They can also get others' data.
    function getWizardData(uint32 wizID) external view returns (Wizard memory) {
        return wizardIDToData[wizID];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getProductionStatus() external view returns (string memory statusText) {
        if (status == Production.HasKickedOff) return "Production has kicked off.";
        if (status == Production.CrewIsSet) return "Production crew is set.";
        if (status == Production.ContractPaymentReceived)
            return "Contract payment has been received.";
        if (status == Production.PaymentsAreAvailable) return "Production payments are available.";
        if (status == Production.PaymentsAreAllWithdrawn)
            return "Production payments are all withdrawn.";
        if (status == Production.HasClosedOut) return "Production has closed out.";
    }

    function getPriceFeed() external view returns (address) {
        return address(s_maticUSDPriceFeed);
    }

    function getWizardCount() public view returns (uint32) {
        uint32 wizardCount = uint32(wizards.length);
        return wizardCount;
    }

    function getAllWizards() public view returns (Wizard[] memory) {
        return wizards;
    }
}
