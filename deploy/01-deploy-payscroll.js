// const { hre, ethers } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let usdcETHPriceFeed = networkConfig[chainId]["usdcETHPriceFeed"];
    let payscroll;

    if (chainId == 31337) {
        const usdcETHAggregator = await deployments.get("MockV3Aggregator");
        let usdcETHPriceFeed_localhost = usdcETHAggregator.address;
        log("Connected to Local network. Deploying Payscroll from:", deployer);
        const payscroll = await deploy("Payscroll", {
            contract: "Payscroll",
            from: deployer,
            log: true,
            args: [usdcETHPriceFeed_localhost],
            waitConfirmations: network.config.blockConfirmations || 1,
        });
        log("Payscroll Deployed at", payscroll.address);
        log("-----------------------------------------------------------");
    } else if (chainId == 80001) {
        log("Connected to Polygon Mumbai Testnet. Deploying Payscroll from:", deployer);
        payscroll = await deploy("Payscroll", {
            from: deployer,
            log: true,
            args: [usdcETHPriceFeed],
        });

        log("Payscroll Deployed!");
        log("-----------------------------------------------------------");
    } else if (chainId == 137) {
        log("Connected to Polygon Mainnet. Deploying Payscroll...");
        payscroll = await deploy("Payscroll", {
            from: deployer,
            log: true,
            args: [usdcETHPriceFeed],
        });
        log("Payscroll Deployed!");
        log("-----------------------------------------------------------");
    } else if (chainId == 4) {
        log("Connected to Ethereum Goerli Testnet. Deploying Payscroll...");
        payscroll = await deploy("Payscroll", {
            from: deployer,
            log: true,
            args: [usdcETHPriceFeed],
        });
        log("Payscroll Deployed!");
        log("-----------------------------------------------------------");
    }

    if (chainId != 31337 && process.env.POLYGONSCAN_API_KEY) {
        log("Verifying contract...");
        await verify(payscroll.address, [usdcETHPriceFeed]);
    }
};

module.exports.tags = ["deploy", "payscroll"];
