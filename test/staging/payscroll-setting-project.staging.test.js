const { assert, expect } = require("chai");
const { deploy, ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper-hardhat-config");
const { utils } = require("ethers");
const chainId = network.config.chainId;

if (chainId == 80001) {
    describe("Payscroll Staging Testing", function () {
        let accounts, payscroll, status;

        beforeEach(async function () {
            accounts = await ethers.getSigners();
            payscroll = await ethers.getContract("Payscroll");
            status = await payscroll.getProductionStatus();
        });
        describe("Production", function () {
            it("kicks off project correctly", async function () {
                console.log("Kicking production off...");
                const kicktx = await payscroll.kickOffProduction(utils.parseEther("0.15"), 1);
                await kicktx.wait();
                console.log("Production status: ", status);
            });
            it("sets crew correctly", async function () {
                console.log("Payscroll Manager is setting production crew...");
                const settx = await payscroll.setProductionCrew([0, 2]);
                await settx.wait();
                let [, , , , vincentOnProductionCrew] = await payscroll.wizardIDToData(2);
                assert.equal(vincentOnProductionCrew, true);
                console.log(vincentOnProductionCrew);
                console.log("Production status: ", status);
            });
        });
    });
}
