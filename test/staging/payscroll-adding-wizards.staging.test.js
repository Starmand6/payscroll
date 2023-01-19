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
        describe("Payscroll", function () {
            it("adds wizards correctly", async function () {
                // HH Acc #0, wizID #0
                const addtx1 = await payscroll.addNewWizard(
                    "Cloud Strife",
                    "0x794a4c92eef32Ac6228F6cC1B1a868Ec46D33964",
                    "Mercenary",
                    utils.parseEther("0.1")
                );
                await addtx1.wait(1);
                // HH Acc #1, wizID #1
                const addtx2 = await payscroll.addNewWizard(
                    "Red XIII",
                    "0xe9121d54137404e64Dee9F8A7c19307e4df5E9fa",
                    "Tribesman",
                    utils.parseEther("0.01")
                );
                await addtx2.wait(1);

                // HH Acc #2, wizID #2
                const addtx3 = await payscroll.addNewWizard(
                    "Vincent Valentine",
                    "0x905e7040310040cbBfbEdD79FA80148cda5a46F0",
                    "Unknown",
                    utils.parseEther("0.05")
                );
                await addtx3.wait(1);
                const wizCount = await payscroll.getWizardCount();
                console.log("Wizard count: ", wizCount);
                const wizArray = await payscroll.getAllWizards();
                console.log("Wizards: ", wizArray);
                const [, , , cloudDayRate] = await payscroll.wizardIDToData(0);
                assert.equal(cloudDayRate.toString(), utils.parseEther("0.1"));
            });
        });
    });
}
