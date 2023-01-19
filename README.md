<a name="readme-top"></a>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#development-stack-and-plugins">Development Stack and Plugins</a></li>
    <li><a href="#cli-and-interaction-steps">CLI and Interaction Steps</a></li>
    <li><a href="#usage">Usage Notes</a></li>
    <li><a href="#future-considerations">Future Considerations</a></li>
    <li><a href="#lessons-learned">Lessons Learnedd</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Automated payroll ("payscroll" because I'm a principled fantasy nerd) application using smart contracts to record payment transactions on the blockchain. This specific payroll setup is for an organization that gets paid in lump sums for project or event work. The `onlyOwner` modifiers have been commented out to enable anyone to call functions on the contract. In production, the Payroll Manager is the user in charge of all functionality aside from the payment and withdrawal functions.

Contract Address on Polygon Mumbai Testnet: `0x7937c01F0Bde6a1F428554DF5cc593a8320DDc9f`
[Payscroll Contract Page on Polygonscan](https://mumbai.polygonscan.com/address/0x7937c01F0Bde6a1F428554DF5cc593a8320DDc9f#code)

<u>Roles</u>

- Owner (Payroll Manager / Production Manager)
- External Party (Payer of services)
- Employees (Wizards)

<u>Functionality</u>

- Owner / Payroll Manager:
    - `addNewEmployee()`: Populates payroll. Wizard entries include:
        ```sol
        struct Wizard {
        string name;
        address payable wallet;
        string title;
        uint256 dayRate;
        bool onProductionCrew;
        bool hasBeenPaid;
        }
        ```
    - `kickOffProduction()`: Manager defines each production by `productionContractTotal` and `productionDays` 
    - `setProductionCrew()`: Manager sets which wizards are on the current production. Wizards can only be paid if they are on the current crew. Can be different for each event/project. 
    - `paymentVerified()`: This is a quality control placeholder checkpoint. Project cannot move to the payment withdrawal stage until Manager verifies the production payment has been made correctly and/or can trigger any other logic placed here.
    - `closeOutProduction()`: After all wizards have withdrawn, the owner is able to call this function, which resets the Wizard struct booleans (`onProductionCrew` and `hasBeenPaid`) to false for all wizards, effectively closing out the production. Only after a production is closed out can a new production be kicked off and new production crew be set.
    - `weAllGoBackToZero()`: (Testnet build only) Added this function after first testnet deployment lessons to ensure dApp never gets stuck. This function would not be in a production build or would be highly altered and controlled by a multisig or similar. 
    - `setContractTotalMax()`: (Testnet build only) Added this function aftet first testnet deployment lessons to minimize stuckness frequency. See Usage Notes for more info.
- External Parties: 
    - `payWizards()`: Once a production has kicked off and production crew is set, the external party can pay the wizards for their services. Payment must exactly match the `productionContractTotal`, or the function will revert.
- Employees/Wizards: 
    - `withdrawPayment()` has several qualifiers (must be at correct production status, registered wallet must match registered ID, must be on production crew, can only withdraw once). Once all qualifiers are met, the wizard can withdraw their precalculated payment (based on their `dayRate` multiplied by `productionDays`).
- Public getters: 
    - `getWizardData()` gets any wizards current data by inputting the wizard ID. 
    - `getContractBalance()` gets current contract balance
    - `getProductionStatus()` gets current production status
    - `getPriceFeed()` gets current Chainlink price feed address
    - `getWizardCount()` gets the total count of all wizards on the payscroll (this includes both wizards on and off the current production, if there is one) 
    - `getAllWizards()` gets an array of all the wizard profiles

<u>Project Highlights</u>

- Struct and Enum use
- Chainlink Price Feed integration
- Deployed to Polygon Mumbai Testnet
- Verified on PolygonScan 
- Live Front End hosted on Fleek.co

<u>Technical Highlights</u>

- 36 unit tests passing.
- Hardhat network test coverage: 100% Stmts, 84.62% Branch, 88.89% Funcs, 95.88% Lines

<!-- GETTING STARTED -->

## Development Stack and Plugins

-   Your favorite Linux distribution and development environment (I currently use Ubuntu and VS Code, respectively)
-   git (code version control)
-   Nodejs (open-source, cross-platform, back-end JavaScript runtime environment)
-   npm (open-source, online repository; package manager and CLI utility for interacting with repo)
-   Hardhat (local Eth environment for testing, debugging, compiling, and deploying contracts)
-   Hardhat ethers.js plugin (for interacting with the Ethereum blockchain)
-   Hardhat local node and console (to interact with contracts)
-   Mocha, Chai, Waffle, and Chai Matchers (for testing)
-   Alchemy to connect to Polygon Mumbai testnet (Alchemy is a platform that generates APIs and offers scure connections to the Blockchain)

## CLI and Interaction Steps

0. For quickstart, clone the repo
    ```
    git clone https://github.com/Starmand6/payscroll.git
    ```
1. Install Node Version Manager (nvm), Node.js, and Node Package Manger (npm)

    - nvm: https://github.com/nvm-sh/nvm
      (`nvm install node` installs latest vesion of Node.js.)
    - npm:
        ```
        npm install npm@latest -g
        ```

2. Initialize and Setup Project

    ```
    mkdir payscroll 
    cd payscroll
    npm init
    git init
    npm install --save-dev hardhat
    npx hardhat
    ```

3. Install Dependencies

    ```sh
    npm install --save-dev @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv @openzeppelin/test-helpers @chainlink/contracts
    ```

    - Install and populate package.json dependencies
    - Create folders: contracts, deploy, tests, scripts, utils
    - Configure hardhat.config file

4. Coding, Deploying, and Testing on Local Blockchain

    - Code and compile (see repo for contracts, scripts, and tests)
    - Run local blockchain node
    - Use scripts to deploy contracts
    - Interact with contracts with Hardhat console
    - Test with Chai, Mocha, Waffle, Ethers, and Hardhat plugins

    ```
    npx hardhat compile
    npx hardhat node
    npx hardhat run --network localhost scripts/deploy.js
    npx hardhat console --network localhost
    npx hardhat test
    ```

5. Deploying and Testing on Public Testnet (Polygon Mumbai)

    - Access testnet node via Alchemy
        - Get a free API Key at [https://alchemy.com](https://alchemy.com)
        - Enter your API Key in `dotenv`
            ```js
            const ALCHEMY_API_KEY = "(ENTER YOUR API)";
            ```
    - Create new testnet accounts:
        ```sh
        npx mnemonics
        ```
    - Update `hardhat.config` and `dotenv` file:

        ```js
        // hardhat.config.js
        const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL;
        const mnemonic = process.env.mnemonic;

        module.exports = {
            networks: {
                polygonMumbai: {
                    url: POLYGON_MUMBAI_RPC_URL,
                    accounts: {mnemonic: mnemonic},
                    chainId: 80001,
                    blockConfirmations: 3,
                },
            },
            solidity: {
                compilers: [{ version: "0.8.17" }, { version: "0.6.6" }],
            },
            etherscan: {
                apiKey: POLYGONSCAN_API_KEY,
            },        
        };
        ```

        `dotenv` file:

        ```
        ALCHEMY_API_KEY = "Your API Key"
        mnemonic = "your mnemonic here"
        POLYGON_MUMBAI_RPC_URL = "Mumbai RPC with Alchemy Key URL"
        ```

    - Fill an account with Polygon Mumbai Testnet MATIC:
        - Use your developlment MetaMask wallet to get Testnet MATIC from https://polygon.faucet.technology
    - Deploy to Polygon Mumbai Testnet (access testnet node via Alchemy):
        ```
        npx hardhat compile
        npx hardhat node
        npx hardhat run --network polygonMumbai scripts/deploy.js
        npx hardhat console --network polygonMumbai
        npx hardhat test
        ```

## Usage Notes

Since the contract is deployed to the Polygon Mumbai Testnet, all payments are in MATIC. For testing/portfolio purposes, I have updated `productionContractTotal` to have a maximum value of 1 MATIC. Since this is on a testnet, and the Mumbai testnet faucet currently only gives me 2 MATIC per day, in case a tester runs out of MATIC in the middle of a "production," I need to be able to bail the contract out with MATIC, so that it gets unstuck. I highly recommend and encourage keeping the productionContractTotal below whatever amount of MATIC you have, so that you can pay the amount back and get it unstuck. This also means that all wizard day rates need to be under 1 MATIC (use less than 18 digits) to enable interaction with all functions throughout a production's life cycle.

For easy testing, I recommend adding a wallet you control to the payscroll with a day rate of 0.1 MATIC, and kicking off a production of 1 day for 0.1 MATIC, just so you can walk through all the functions easily.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FUTURE CONSIDERATIONS -->

## Future Considerations

- Add upgradeability to smart contract.
- Proof of Humanity / decentralized ID integrations.
- Implement decentralization (change single owner to multisig, etc) and further autonomy. 
- Add multiple project and crew capability. Would need to utilize a projectID, add a mapping of projects to Enums, etc.
- Add functions to give to a bonus pool and reward bonuses to wizards.
- Add an optional coworker tipping function.
- If the event organization is a DAO, integrate contract with DAO voting, for changing of day rates and other parameters.
- Add a third party vendor / subcontractor payment function.
- Add a line item and multisig wallet for operational expenses to be included in production costs.
- Add one or two additional payscroll manager roles for contingency purposes and/or bigger projects.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LESSONS LEARNED -->

## Lessons Learned

- Permanent wizard IDs proved to make iterative testnet testing rather difficult, since partially run tests during debugging led to duplicate wizards being added and the production status being advanced. Future versions would need to give owner ability to clear wizards array, or the staging tests would need to be broken up and be more agile and more forgiving for human error.   
- Use a MUCH lower amount of Eth/Matic for the productionContractTotal. I originally wrote all my tests and deployed to Mumbai before even thinking that I wouldn't have 15 testnet ETH or MATIC to use to satisfy the conditions and advance through the staging test. Overzealous!
- Make a simpler, more flexible dApp for my next portfolio project!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Not Used for this repo.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Armand Daigle - [@\_Starmand](https://twitter.com/_Starmand) - armanddaoist@gmail.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments and Resources

Patrick Collins and the FreeCodeCamp tutorials have been amazing resources. I've learned a ton from them. Thanks Patrick and FCC!

https://github.com/smartcontractkit/full-blockchain-solidity-course-js

<p align="right">(<a href="#readme-top">back to top</a>)</p>
