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
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

### About The Project

Automated payroll ("payscroll" cuz I'm a principled fantasy nerd) application using smart contracts to record transactions on the blockchain. This specific payroll setup is for an organization that gets paid in lump sums for projects or events. The payroll manager can be set as the owner role.

Roles: 

- Owner (Payroll Manager/Production Manager)
- External Party (Payer of services)
- Employee

Functionality:

- Owner functions: addNewEmployee, setPayscroll (sets crew and payment placeholder. Can be different for each project), 
- External Party functions: payContractAmount
- Employee function: withdrawPayment
- Public getter functions: get employee title and dayRate, get current set payscroll, get current contract balance, get current project status  

<!-- GETTING STARTED -->

### Development Stack and Plugins

-   Your favorite Linux distribution and development environment (I currently use Ubuntu and VS Code, respectively)
-   git (code version control)
-   Nodejs (open-source, cross-platform, back-end JavaScript runtime environment)
-   npm (open-source, online repository; package manager and CLI utility for interacting with repo)
-   Hardhat (local Eth env. for testing, debugging, compiling, and deploying contracts)
-   OpenZeppelin contracts (super sweet battle-tested code)
-   Hardhat ethers.js plugin (for interacting with the Ethereum blockchain)
-   Hardhat local node and console (to interact with contracts)
-   Mocha, Chai, Waffle, and Chai Helpers (for testing)
-   OpenZeppelin Test Helpers library (Truffle plugin for Hardhat)
-   Alchemy to connect to Goerli testnet (Alchemy is a platform that generates APIs and offers scure connections to the Blockchain)
-   OpenZeppelin Upgrades Plugins (to deploy upgradeable contracts)

### CLI and Interaction Steps

0. Clone the repo
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

    - Install and populate package.json dependencies.
    - Create folders: contracts, deploy, tests, scripts, utils.
    - Configure hardhat.config file.

4. Coding, Deploying, and Testing on Local Blockchain

    - Code and compile (see repo and/or OZ tutorial for contracts, scripts, and tests).
    - Run local blockchain node.
    - Use scripts to deploy contracts since Hardhat does not have a native deployment feature.
    - Interact with contracts with Hardhat console.
    - Test with Chai and OZ Test Helpers (w/ plugins installed in step #3)

    ```sh
    npx hardhat compile
    npx hardhat node
    npx hardhat run --network localhost scripts/deploy.js
    npx hardhat console --network localhost
    npx hardhat test
    ```

5. Deploying and Testing on Public Testnet (Goerli)

    - Access testnet node via Alchemy
        - Get a free API Key at [https://alchemy.com](https://alchemy.com)
        - Enter your API Key in `dotenv`
            ```js
            const ALCHEMY_API_KEY = "ENTER YOUR API";
            ```
    - Create new eth testnet accounts:
        ```sh
        npx mnemonics
        ```
    - Update `hardhat.config` and `dotenv` file:

        ```js
        // hardhat.config.js
        const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
        const mnemonic = process.env.mnemonic;

        module.exports = {
            solidity: "0.8.9",
            networks: {
                goerli: {
                    url: GOERLI_RPC_URL,
                    accounts: { mnemonic: mnemonic },
                    chainId: 5,
                    blockConfirmations: 6,
                },
            },
        };
        ```

        `dotenv` file:

        ```
        ALCHEMY_API_KEY = "Your API Key"
        mnemonic = your mnemonic here
        GOERLI_RPC_URL = Goerli RPC with Alchemy Key URL
        ```

    - Fill one account with Goerli testnet Eth:
        - Use your developlment MetaMask wallet to get testnet Eth from https://goerlifaucet.com
        - Send Eth from MetaMask wallet to one of the newly created accounts from the mnemonic.
    - Deploy to Goerli testnet (access testnet node via Alchemy):
        ```sh
        npx hardhat compile
        npx hardhat node
        npx hardhat run --network goerli scripts/deploy.js
        npx hardhat console --network goerli
        npx hardhat test
        ```

6. Upgrading smart contracts (via Proxy; dependency already installed in step #3):

    - Use same CLI commands as above, but we need to deploy the new upgradeable Box contract, as well as the ProxyAdmin and proxy contracts.
    - As an example, we create a new `BoxV2` contract with a new incrementing function, create a script to upgrade the previous contract to now use `BoxV2`, then deploy the upgrade (see repo and/or OZ tutorial for contracts, scripts, and tests).
        ```sh
        npx hardhat compile
        npx hardhat node
        npx hardhat run --network localhost scripts/deploy_upgradeable_box.js
        npx hardhat console --network localhost
        npx hardhat test
        npx hardhat run --network localhost scripts/upgrade_box.js
        ```
    - From here, we can use the console to test if the upgrade worked by calling the `increment()` function.

7. Preparing for mainnet:
    - I did not deploy the contracts to mainnet, so this part of the tutorial is not in the repo. Go to https://docs.openzeppelin.com/learn/preparing-for-mainnet to see how it's done.

### Usage Notes

The OpenZeppelin (OZ) "Box" tutorial uses Hardhat testing, as well as a special OZ Test Helpers plugin that you need a Hardhat Truffle plugin for. As such, there are two test files. Using `npm hardhat test` runs all files in the test folder, thus both tests are run. `Box.hardhatversion.test` is the first test in the OZ tutorial. `Box.test` is the second test and uses the OZ Test Helpers plugin. It is also used to test the upgradeable "V2" version of the Box contract. Since that version removed the "Ownable" import/aspect, that code section of the `Box.test` file has been commented out.

There is also a testing error with `Box.test` that I haven't figured out. I tried to add a test to ensure the contract upgrade works, but things are getting squirrely in my brain with Truffle and Hardhat crossing streams. The error:

```
1. Contract: Box
   works before and after upgrading:
   TypeError: Cannot read properties of undefined (reading 'encodeDeploy')
   at getDeployData (node_modules/@openzeppelin/hardhat-upgrades/src/utils/deploy-impl.ts:49:45)
   at deployProxyImpl (node_modules/@openzeppelin/hardhat-upgrades/src/utils/deploy-impl.ts:72:22)
   at Proxy.deployProxy (node_modules/@openzeppelin/hardhat-upgrades/src/deploy-proxy.ts:35:28)
   at Context.<anonymous> (test/Box.test.js:50:26)

```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FUTURE CONSIDERATIONS -->

## Future Considerations

- Add upgradeability to smart contract.
- Proof of humanity / decentralized ID integrations.
- Can make it totally decentralized and autonomous. Change single owner to multisig.
- Add a mapping of projects to Enums, so that multiple projects and crews can be active at once. Would need to add a project parameter to all functions.
- Add a bonus function and/or bonus pool function.
- Add an optional coworker tipping function.
- Add a change hook that is connected with the DAO’s Snapshot, so if the DAO wants to change day rates, it can.
- Add a third party vendor payment function.


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
