// const { hre, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUSDPriceFeed;
    if (chainId == 31337) {
        const ethUSDAggregator = await deployments.get("MockV3Aggregator");
        ethUSDPriceFeed = ethUSDAggregator.address;
        log("Connected to Local network. Deploying Payscroll from:", deployer.address);
        const payscroll = await deploy("Payscroll", {
            contract: "Payscroll",
            from: deployer,
            log: true,
            args: [ethUSDPriceFeed],
            waitConfirmations: network.config.blockConfirmations || 1,
        });
        log("Payscroll Deployed at", payscroll.address);
        log("-----------------------------------------------------------");
    } else if (chainId == 80001) {
        ethUSDPriceFeed = networkConfig[chainId][ethUSDPriceFeed];
        log("Connected to Polygon Mumbai Testnet. Deploying Payscroll from:", deployer.address);
        await deploy("Payscroll", {
            from: deployer,
            log: true,
            args: ethUSDPriceFeed,
        });

        log("Payscroll Deployed!");
        log("-----------------------------------------------------------");
    } else if (chainId == 137) {
        ethUSDPriceFeed = networkConfig[chainId][ethUSDPriceFeed];
        log("Connected to Polygon Mainnet. Deploying Payscroll...");
        await deploy("Payscroll", {
            from: deployer,
            log: true,
            args: ethUSDPriceFeed,
        });
        log("Payscroll Deployed!");
        log("-----------------------------------------------------------");
    } else if (chainId == 4) {
        ethUSDPriceFeed = networkConfig[chainId][ethUSDPriceFeed];
        log("Connected to Ethereum Goerli Testnet. Deploying Payscroll...");
        await deploy("Payscroll", {
            from: deployer,
            log: true,
            args: ethUSDPriceFeed,
        });
        log("Payscroll Deployed!");
        log("-----------------------------------------------------------");
    }
};

module.exports.tags = ["all", "payscroll"];
