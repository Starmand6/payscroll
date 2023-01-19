const { assert, expect } = require("chai");
const { deploy, ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper-hardhat-config");
const { utils } = require("ethers");
const chainId = network.config.chainId;

if (chainId == 80001) {
    describe("Payscroll Staging Testing", function () {
        let accounts, payscroll, status, payscrollBalance;

        beforeEach(async function () {
            accounts = await ethers.getSigners();
            payscroll = await ethers.getContract("Payscroll");
            status = await payscroll.getProductionStatus();
            payscrollBalance = await payscroll.getContractBalance();
        });
        describe("Production", function () {
            it("third party is able to pay and be verified", async function () {
                console.log("Contract balance: ", payscrollBalance.toString());
                const thirdParty = await payscroll.connect(accounts[7]);
                console.log("Wizards are getting paid...");
                const paytx = await thirdParty.payWizards({ value: utils.parseEther("0.15") });
                await paytx.wait(6);
                console.log("Contract balance: ", payscrollBalance.toString());
                console.log("Production status: ", status);
                console.log("Payscroll Manager is verifying funds...");
                const vertx = await payscroll.paymentVerified();
                await vertx.wait(6);
                console.log("Production status: ", status);
            });
            it("wizards can withdraw", async function () {
                const cloudStartingBalance = await accounts[1].balance;
                console.log("Cloud's starting balance: ", cloudStartingBalance);
                const cloudCalling = await payscroll.connect(accounts[0]);
                console.log("Cloud is withdrawing his payment...");
                const withdrawtx = await cloudCalling.withdrawPayment(0);
                await withdrawtx.wait(6);
                const cloudEndingBalance = await accounts[0].balance;
                console.log("Cloud's ending balance: ", cloudEndingBalance);
                console.log("Vincent is withdrawing his payment...");
                const vincentCalling = await payscroll.connect(accounts[2]);
                await expect(vincentCalling.withdrawPayment(2)).to.emit(
                    payscroll,
                    "AllWizardsHaveBeenPaid"
                );
                console.log("Production status: ", status);
                console.log("Contract balance: ", payscrollBalance);
            });
            it("production can be closed out correctly", async function () {
                console.log("Payscroll Manager is closing out production...");
                const closetx = await payscroll.closeOutProduction();
                await closetx.wait(6);
                // Everything should be reset here.
                console.log("Production status: ", status);
                assert.equal(vincentOnProductionCrew, false);
                [, , , , , hasBeenPaid] = await payscroll.wizardIDToData(2);
                assert.equal(hasBeenPaid, false);
            });
        });
    });
}
