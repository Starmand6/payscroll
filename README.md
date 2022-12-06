<a name="readme-top"></a>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#development-stack-and-plugins">Development Stack and Plugins</a></li>
    <li><a href="#cli-and-interaction-steps">CLI and Interaction Steps</a></li>
    <li><a href="#usage">Usage</a></li>
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

Automated payroll ("payscroll" because I'm a principled fantasy nerd) application using smart contracts to record payment transactions on the blockchain. This specific payroll setup is for an organization that gets paid in lump sums for project or event work. 

Roles: 

- Owner (Payroll Manager / Production Manager)
- External Party (Payer of services)
- Employees (Wizards)

Functionality:

- Owner / Payroll Manager:
    - `addNewEmployee`: Populates payroll. Wizard entries include:
        ```sol
        struct Wizard {
        string name;
        address payable wallet;
        string title;
        uint256 dayRate;
        bool onProductionCrew;
        bool hasBeenPaid;
        ```
    - `kickOffProduction`: Manager defines each production by `productionContractTotal` and `productionDays` 
    - `setProductionCrew`: Manager sets which wizards are on the current production. Wizards can only be paid if they are on the current crew. Can be different for each event/project. 
    - `paymentVerified`: A quality control checkpoint. Project cannot move to the payment withdrawal stage until Manager verifies the production payment has been made correctly.
    - `closeOutProduction`: After all wizards have withdrawn, the owner is able to call this function, which resets the wizards struct booleans (`onProductionCrew` and `hasBeenPaid`) to false, effectively closing out the production. Only after a production is closed out, can a new production be kicked off and new production crew be set.
- External Party function: Once a production has kicked off and production crew is set, the external party can `payWizards` for their services. Payment must exactly match the `productionContractTotal`, or the function will revert.
- Employee function: `withdrawPayment` has several qualifiers (must be at correct production status, registered wallet must match registered ID, must be on production crew, can only withdraw once). Once all qualifiers are met, the wizard can withdraw their precalculated payment (based on their `dayRate` multiplied by `productionDays`).
- Public getter functions: 
    - `getWizardData` gets any wizards current data by inputting the wizard ID. 
    - `getContractBalance` gets current contract balance
    - `getProductionStatus` gets current production status
    - `getPriceFeed` gets current Chainlink price feed address
    - `getWizardCount` gets the total count of all wizards on the payscroll (this includes both wizards on and off the current production, if there is one) 
    - `getAllWizards` gets an array of all the wizard profiles

Project Highlights:

- Struct and Enum use
- Chainlink Price Feed integration
- Deployed to Polygon Mumbai Testnet
- Verified on PolygonScan 

Technical Highlights:

- 32 checks passing for unit tests.
- Hardhat network test coverage: 100% Stmts, 92.86% Branch, 93.75% Funcs, 97.47% Lines

<!-- GETTING STARTED -->

## Development Stack and Plugins

-   Your favorite Linux distribution and development environment (I currently use Ubuntu and VS Code, respectively)
-   git (code version control)
-   Nodejs (open-source, cross-platform, back-end JavaScript runtime environment)
-   npm (open-source, online repository; package manager and CLI utility for interacting with repo)
-   Hardhat (local Eth environment for testing, debugging, compiling, and deploying contracts)
-   Hardhat ethers.js plugin (for interacting with the Ethereum blockchain)
-   Hardhat local node and console (to interact with contracts)
-   Mocha, Chai, Waffle, and Chai Helpers (for testing)
-   Alchemy to connect to Polygon Mumbai testnet (Alchemy is a platform that generates APIs and offers scure connections to the Blockchain)

## CLI and Interaction Steps

0. For quickstart, clone the repo
    ```sh
    git clone https://github.com/Starmand6/payscroll.git
    ```
1. Install Node Version Manager (nvm), Node.js, and Node Package Manger (npm)

    - nvm: https://github.com/nvm-sh/nvm
      (`nvm install node` installs latest vesion of Node.js.)
    - npm:
        ```sh
        npm install npm@latest -g
        ```

2. Initialize and Setup Project

    ```sh
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

    ```sh
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
        ```sh
        npx hardhat compile
        npx hardhat node
        npx hardhat run --network polygonMumbai scripts/deploy.js
        npx hardhat console --network polygonMumbai
        npx hardhat test
        ```

## Usage Notes

All payments are denominated in Ether.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FUTURE CONSIDERATIONS -->

## Future Considerations

- Add upgradeability to smart contract.
- Proof of humanity / decentralized ID integrations.
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

- Permanent wizard IDs proved to make iterative testnet testing rather difficult, since partially run tests during debugging led to duplicate wizards being added and the production status being advanced. Future versions would need to give owner ability to clear wizards array and reset production, or the staging tests would need to be broken up and be more agile and more forgiving for human error.   
- Use a MUCH lower amount of Eth/Matic for the productionContractTotal. I wrote all my tests and deployed to Mumbai before even thinking that I wouldn't have 15 testnet Ether to use to satisfy the conditions and advance through the staging test. Overzealous!
- Make a simpler, more flexible App for my next portfolio project!

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
