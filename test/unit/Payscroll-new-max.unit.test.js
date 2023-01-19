const { assert, expect } = require("chai");
const { deploy, ethers, waffle } = require("hardhat");
const provider = waffle.provider;
const { utils } = require("ethers");
const chainId = network.config.chainId;

if (chainId == 31337) {
    // Adding this test because of a lesson learned. See that section and the
    // Usage Notes section in the README for me info!
    describe.skip("Payscroll Unit Testing - New Max Function", function () {
        let accounts, OracleMockPriceFeed, payscroll, nonOwnerCalling;

        beforeEach(async function () {
            accounts = await ethers.getSigners();
            await deployments.fixture(["deploy"]);
            OracleMockPriceFeed = await ethers.getContract("MockV3Aggregator");
            payscroll = await ethers.getContract("Payscroll");
            // HH Acc #1, wizID #0
            await payscroll.addNewWizard(
                "Cloud Strife", // HH Acc #1, wizID #0
                "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                "Mercenary",
                utils.parseEther("0.1")
            );
            nonOwnerCalling = payscroll.connect(accounts[7]);
        });
        describe.skip("Constructor", function () {
            it("sets the oracle price feed correctly", async function () {
                const priceFeedAddress = await payscroll.getPriceFeed();
                assert.equal(priceFeedAddress, OracleMockPriceFeed.address);
            });
            it("sets Production status to HasClosedOut", async function () {
                const response = await payscroll.getProductionStatus();
                assert.equal(response, "Production has closed out.");
            });
        });
        describe("Production Contract Total Checks", function () {
            it("only lets owner call setContractTotalMax", async function () {
                await expect(
                    nonOwnerCalling.setContractTotalMax(utils.parseEther("0.1"))
                ).to.be.revertedWith("Ownable: caller is not the owner");
            });
            it("reverts when contract total input is over max", async function () {
                await expect(
                    nonOwnerCalling.kickOffProduction(utils.parseEther("10"), 1)
                ).to.be.revertedWith("TotalMustBeUnder1MATIC");
            });
            it("sets contract correctly, can be paid out, and wizard can withdraw", async function () {
                await payscroll.kickOffProduction(utils.parseEther("0.1"), 1);
                await payscroll.setProductionCrew([0]);
                const thirdParty = await payscroll.connect(accounts[7]);
                await thirdParty.payWizards({ value: utils.parseEther("0.1") });
                const balance = await ethers.provider.getBalance(payscroll.address);
                await payscroll.paymentVerified();
                const cloudCalling = await payscroll.connect(accounts[1]);
                const cloudStartingBalance = await ethers.provider.getBalance(accounts[1].address);
                const tx = await cloudCalling.withdrawPayment(0);
                const receipt = await tx.wait();
                const gas = receipt.gasUsed.mul(receipt.effectiveGasPrice);
                console.log(gas.toString());
                const cloudEndingBalance = await ethers.provider.getBalance(accounts[1].address);
                // Even using gas, still not getting numbers to equal exactly. At 10 decimal places, numbers start to differ.
                assert.equal(
                    (cloudEndingBalance - cloudStartingBalance).toString(),
                    (1e17 - gas).toString() // 0.1 matic - gas
                );
                // "TypeErro: txResponse.wait is not a function error" is throwing for changeEtherBalance.
                // await expect(
                //     cloudCalling.withdrawPayment(0, { value: utils.parseEther("1") })
                // ).to.changeEtherBalance(accounts[1], 1);
                //await payscroll.closeOutProduction();
            });
        });
    });
}
