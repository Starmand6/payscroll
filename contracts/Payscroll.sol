//SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Payscroll is Ownable {
    // Employee data struct:
    // If employee never works or dies, their entry will still exist forever.
    // If so, onCurrentProject will never be set to true.
    // This way, employees have same unique ID forever.
    struct Wizard {
        string name;
        address payable wallet;
        bytes32 title;
        uint32 dayRate;
        bool onProductionCrew;
        bool hasBeenPaid;
    }

    // All crew members registered in organization
    Wizard[] public wizards;

    // Variables
    //uint256 public wizardID;
    uint256 public productionContractTotal;
    uint16 public productionDays;
    AggregatorV3Interface internal s_usdcPerETHPriceFeed;

    // Mappings
    // Employee ID to Employee Struct (Information)
    mapping(uint32 => Wizard) public wizardIDToData;
    mapping(address => Wizard) public walletToData;
    mapping(uint32 => address) public wizardIDToWallet;

    // Events
    event ANewWizardHasEnteredTheChat(uint32 wizardID, string name);
    event ProductionHasKickedOff();
    event ProductionCrewIsSet(uint32[] wizardsOnProduction);
    event WizardsPaymentProcessing();
    event PaymentsCanBeWithdrawn();
    event ProductionHasClosedOut();
    event NewPayscrollManagerAssigned(address payable newPayscrollManager);

    // Errors
    // error WizardAlreadyExists(uint256 wizardID, string name);
    error FunctionUnavailableAtThisProductionStatus();
    error PaymentIsLessThanContractTotal(uint256 valueSent, uint256 productionContractTotal);
    error WizardHasAlreadyBeenPaid();
    error NotAuthorizedToWithdrawPayment();
    error InsufficientFunds(uint256 amountOwed, uint256 amountAvailable);
    error WizardIsNotOnProductionCrew();

    // Enum for production status
    enum Production {
        HasKickedOff,
        CrewIsSet,
        PaymentsAreAvailable,
        PaymentsAreAllWithdrawn,
        HasClosedOut
    }

    Production public status;

    modifier onlyWhen(Production _status) {
        if (status != _status) {
            revert FunctionUnavailableAtThisProductionStatus();
        }
        _;
    }

    constructor(
        address usdcPerETHPriceFeedAddress // Polygon Mumbai Testnet ETH/USD Price Feed: 0x0715A7794a1dc8e42615F059dD6e406A6594651A
    ) {
        s_usdcPerETHPriceFeed = AggregatorV3Interface(usdcPerETHPriceFeedAddress);
    }

    receive() external payable {}

    fallback() external payable {}

    // To keep this simple as a portfolio project, the Payscroll Manager can only add new employees
    // in between productions. Obviously, this has undesirable limitations and the contract would
    // not have this restraint on it in a production environment.
    function addNewWizard(
        string memory _name,
        address payable _wallet,
        bytes32 _title,
        uint32 _dayRate,
        bool _onProductionCrew,
        bool _hasBeenPaid
    ) external onlyOwner onlyWhen(Production.HasClosedOut) {
        // Getting wizard (employee) ID programmatically.
        uint32 wizardID;
        // This if statement only runs for the very first wizard, since the wizards
        // array will be empty.
        if (getWizardCount() == 0) {
            wizardID = 0;
        } else {
            // If there is one wizard, getWizardsCount() function returns one, so
            // newest wizard ID would be #1, since very first wizard ID# is zero.
            wizardID = getWizardCount();
        }
        wizards.push(Wizard(_name, _wallet, _title, _dayRate, _onProductionCrew, _hasBeenPaid));
        wizardIDToData[wizardID] = Wizard(
            _name,
            _wallet,
            _title,
            _dayRate,
            _onProductionCrew,
            _hasBeenPaid
        );
        walletToData[_wallet] = Wizard(
            _name,
            _wallet,
            _title,
            _dayRate,
            _onProductionCrew,
            _hasBeenPaid
        );
        wizardIDToWallet[wizardID] = _wallet;
        emit ANewWizardHasEnteredTheChat(wizardID, wizardIDToData[wizardID].name);
    }

    // In production, this contract would have a function to modify the wizard data.

    // External party paying for production will see production total in app.
    function kickOffProduction(uint256 _productionContractTotal, uint16 _productionDays)
        external
        onlyOwner
        onlyWhen(Production.HasClosedOut)
    {
        status = Production.HasKickedOff;
        productionContractTotal = _productionContractTotal;
        productionDays = _productionDays;
        emit ProductionHasKickedOff();
    }

    function setProductionCrew(uint32[] calldata wizardsOnProductionCrew)
        external
        onlyOwner
        onlyWhen(Production.HasKickedOff)
    {
        // Owner enters ids of crew and for loop changes all
        // onProductionCrew bools to true.
        for (uint32 i = 0; i < wizardsOnProductionCrew.length; i++) {
            uint32 wizID = wizardsOnProductionCrew[i];
            wizardIDToData[wizID].onProductionCrew = true;
        }
        status = Production.CrewIsSet;
        emit ProductionCrewIsSet(wizardsOnProductionCrew);
    }

    // Can do a ton of things here, but for this portfolio version, I left it fairly unrestricted
    // and there is one last check in the paymentVerified() call by the Payscroll Manager.
    function payWizards() external payable {
        if (msg.value < productionContractTotal) {
            revert PaymentIsLessThanContractTotal(msg.value, productionContractTotal);
        }
        emit WizardsPaymentProcessing();
    }

    // This is mostly a sanity check. Payscroll Manager can call getContractBalance(), and if the
    // 3rd party paid too much or some other unforeseen issue occurs, Manager can at least have this
    // breather in the process to figure out what is wrong and solve problems.
    function paymentVerified() external onlyOwner onlyWhen(Production.CrewIsSet) {
        status = Production.PaymentsAreAvailable;
        emit PaymentsCanBeWithdrawn();
    }

    /** Function contains five verifications: 1. Production is at PaymentsAreAvailable stage.
     *  2. Wizard can only be paid once per production.
     *  3. Wizard must know their ID and have their authorized wallet connected.
     *  4. Wizard is on the current production's crew.
     *  5. Payscroll contract must have enough funds. */
    function withdrawPayment(uint32 wizID) external onlyWhen(Production.PaymentsAreAvailable) {
        if (walletToData[msg.sender].hasBeenPaid == true) {
            revert WizardHasAlreadyBeenPaid();
        }
        if (wizardIDToWallet[wizID] != msg.sender) {
            revert NotAuthorizedToWithdrawPayment();
        }
        if (wizardIDToData[wizID].onProductionCrew == false) {
            revert WizardIsNotOnProductionCrew();
        }

        // Note: Amount owed is auto-calculated, removing opportunity for human error/mischeif.
        uint256 wizDayRate = walletToData[msg.sender].dayRate;
        uint256 amount = productionDays * wizDayRate;
        uint256 contractBalance = address(this).balance;
        if (amount > contractBalance) {
            revert InsufficientFunds(amount, contractBalance);
        }
        contractBalance -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Payment withdrawal failed.");
        if (success) {
            walletToData[msg.sender].hasBeenPaid = true;
        }
    }

    // Owner (or Payroll Manager or Production Manager) Functions

    // Resets all wizard booleans to enable clean slate kickoff of next production.
    function closeOutProduction() external onlyOwner onlyWhen(Production.PaymentsAreAllWithdrawn) {
        status = Production.HasClosedOut;
        for (uint32 i = 0; i < wizards.length; i++) {
            wizardIDToData[i].hasBeenPaid = false;
            wizardIDToData[i].onProductionCrew = false;
        }
        emit ProductionHasClosedOut();
    }

    // assign a new Payroll Manager function. Can be called at any time.
    function assignPayscrollManager(address payable _newPayscrollManager) external onlyOwner {
        transferOwnership(_newPayscrollManager);
        emit NewPayscrollManagerAssigned(_newPayscrollManager);
    }

    // Getters

    // Wizards can use this function to verify their data, including if they
    // are on the crew payroll of the current production. They can also get others' data.
    function getWizardData(uint32 wizID) external view returns (Wizard memory) {
        return wizardIDToData[wizID];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getProductionStatus() external view returns (string memory statusText) {
        if (status == Production.HasKickedOff) return "Production has Kicked Off.";
        if (status == Production.CrewIsSet) return "Production crew is set.";
        if (status == Production.PaymentsAreAvailable) return "Production payments are available.";
        if (status == Production.PaymentsAreAllWithdrawn)
            return "Production payments are all withdrawn.";
        if (status == Production.HasClosedOut) return "Production has closed out.";
    }

    function getPriceFeed() external view returns (address) {
        return address(s_usdcPerETHPriceFeed);
    }

    function getWizardCount() public view returns (uint32) {
        uint32 wizardCount = uint32(wizards.length);
        return wizardCount;
    }

    // This could be made public, but Solidity gives error saying that return parameters
    // with nested mappings can only be set to storage. Would figure this out in production.
    function getAllWizards() private view returns (mapping(uint32 => Wizard) storage) {
        return wizardIDToData;
    }
}
