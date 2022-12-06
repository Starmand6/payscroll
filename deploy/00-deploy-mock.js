const { developmentChains, networkConfig } = require("../helper-hardhat-config.js");
const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
// const BASE_FEE = ethers.utils.parseEther("0.25"); //0.25 LINK is the premium cost.
const DECIMALS = "18";
const INITIAL_PRICE = ethers.utils.parseUnits("1300", "ether");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    // If on a local dev network, we need to deploy Chainlink mock.
    if (chainId == 31337) {
        log("Connected to Local network. Deploying price feed mock...");
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        });
        log("Mock Deployed!");
        log("-----------------------------------------------------------");
    }
};

module.exports.tags = ["deploy", "mock"];
