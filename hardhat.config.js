require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("solidity-coverage");
require("hardhat-deploy");

const POLYGON_MAINNET_RPC_URL = process.env.POLYGON_MAINNET_RPC_URL;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const POLYGON_MUMBAI_RPC_URL = process.env.POLYGON_MUMBAI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; // For Eth mainnet
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || process.env.ALCHEMY_MAINNET_RPC_URL;
const mnemonic = process.env.mnemonic;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL,
                blockNumber: 15971926,
            },
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL,
                blockNumber: 15971926,
            },
        },
        polygonMumbai: {
            url: POLYGON_MUMBAI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 80001,
            blockConfirmations: 3,
        },
        polygonMainnet: {
            url: POLYGON_MAINNET_RPC_URL,
            accounts: [PRIVATE_KEY], // Change to deployment wallet address private key.
            chainId: 137,
            blockConfirmations: 6,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: { mnemonic: mnemonic }, //Account[0]: 0x794a4c92eef32ac6228f6cc1b1a868ec46d33964 has 0.02 ETH.
            chainId: 5,
            blockConfirmations: 6,
        },
        // Eth Mainnet
        /* Mainnet: {
      url: MAINNET_RPC_URL,
      accounts: [PRIVATE_KEY], // Change to mainnet deployment wallet address private key.
      chainId: 1,
      blockConfirmations: 6,
    },*/
    },
    solidity: {
        compilers: [{ version: "0.8.17" }, { version: "0.6.6" }],
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    polygonscan: {
        apiKey: POLYGONSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: false,
        coinmarketcap: COINMARKETCAP_API_KEY,
        // Eth is default base currency.
        // token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
};
