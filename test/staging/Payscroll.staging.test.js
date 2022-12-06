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
                console.log("Getting Chainlink Mumbai USDC/ETH Price Feed...");
                assert.equal(priceFeedAddress, networkConfig[chainId]["usdcETHPriceFeed"]);
            });
            it("sets Production status to HasClosedOut", async function () {
                const response = await payscroll.getProductionStatus();
                assert.equal(response, "Production has closed out.");
            });
        });
        describe("Production", function () {
            it("executes as intended through an entire cycle", async function () {
                // HH Acc #1, wizID #0
                await payscroll.addNewWizard(
                    "Cloud Strife",
                    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                    "Mercenary",
                    utils.parseEther("10"),
                    false,
                    false
                );
                // HH Acc #2, wizID #1
                await payscroll.addNewWizard(
                    "Red XIII",
                    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
                    "Tribesman",
                    utils.parseEther("1"),
                    false,
                    false
                );

                // HH Acc #3, wizID #2
                await payscroll.addNewWizard(
                    "Vincent Valentine",
                    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
                    "Unknown",
                    utils.parseEther("5"),
                    false,
                    false
                );
                const wizCount = await payscroll.getWizardCount();
                console.log("Wizard count: ", wizCount);
                const wizArray = payscroll.getAllWizards();
                console.log("Wizards: ", wizArray);
                console.log("Kicking production off...");
                await payscroll.kickOffProduction(utils.parseEther("15"), 1);
                let status = await payscroll.getProductionStatus();
                console.log("Production status: ", status);
                console.log("Payscroll Manager is setting production crew...");
                await payscroll.setProductionCrew([0, 2]);
                let [, , , , vincentOnProductionCrew] = await payscroll.wizardIDToData(2);
                assert.equal(vincentOnProductionCrew, true);
                console.log("Production status: ", status);
                let payscrollBalance = await payscroll.getContractBalance();
                console.log("Contract balance: ", payscrollBalance);
                const thirdParty = await payscroll.connect(accounts[7]);
                console.log("Wizards are getting paid...");
                await thirdParty.payWizards({ value: utils.parseEther("15") });
                console.log("Contract balance: ", payscrollBalance);
                console.log("Production status: ", status);
                console.log("Payscroll Manager is verifying funds...");
                await payscroll.paymentVerified();
                console.log("Production status: ", status);
                const cloudStartingBalance = await accounts[1].balance;
                console.log("Cloud's starting balance: ", cloudStartingBalance);
                const cloudCalling = await payscroll.connect(accounts[1]);
                console.log("Cloud is withdrawing his payment...");
                await cloudCalling.withdrawPayment(0);
                const cloudEndingBalance = await accounts[1].balance;
                console.log("Cloud's ending balance: ", cloudEndingBalance);
                console.log("Vincent is withdrawing his payment...");
                const vincentCalling = await payscroll.connect(accounts[3]);
                await expect(vincentCalling.withdrawPayment(2)).to.emit(
                    payscroll,
                    "AllWizardsHaveBeenPaid"
                );
                console.log("Production status: ", status);
                console.log("Contract balance: ", payscrollBalance);
                console.log("Payscroll Manager is closing out production...");
                await payscroll.closeOutProduction();
                // Everything should be reset here.
                console.log("Production status: ", status);
                assert.equal(vincentOnProductionCrew, false);
                [, , , , , hasBeenPaid] = await payscroll.wizardIDToData(2);
                assert.equal(hasBeenPaid, false);
                console.log(
                    "Production has completed. Payscroll has been reset and is ready for next production."
                );
            });
        });
    });
}
