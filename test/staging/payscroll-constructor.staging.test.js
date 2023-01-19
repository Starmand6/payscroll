const { assert, expect } = require("chai");
const { deploy, ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper-hardhat-config");
const { utils } = require("ethers");
const chainId = network.config.chainId;

if (chainId == 80001) {
    describe("Payscroll Staging Testing", function () {
        let accounts, payscroll;

        beforeEach(async function () {
            accounts = await ethers.getSigners();
            payscroll = await ethers.getContract("Payscroll");
        });
        describe("Constructor", function () {
            it("sets the oracle price feed correctly", async function () {
                const priceFeedAddress = await payscroll.getPriceFeed();
                console.log("Getting Chainlink MATIC/USD Price Feed for Mumbai Testnet...");
                assert.equal(priceFeedAddress, networkConfig[chainId]["maticUSDPriceFeed"]);
            });
            it("sets Production status to HasClosedOut", async function () {
                const response = await payscroll.getProductionStatus();
                assert.equal(response, "Production has closed out.");
            });
        });
    });
}
