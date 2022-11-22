const { assert, expect } = require("chai");
const { deploy, ethers } = require("hardhat");
const { utils } = require("ethers");

describe("Payscroll Unit Testing", function () {
    let accounts, deployer, OracleMockPriceFeed, payscroll;
    beforeEach(async function () {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["all"]);
        OracleMockPriceFeed = await ethers.getContract("MockV3Aggregator");
        payscroll = await ethers.getContract("Payscroll");
    });

    describe("Constructor", async function () {
        it("sets the oracle price feed correctly", async function () {
            const priceFeedAddress = await payscroll.getPriceFeed();
            assert.equal(priceFeedAddress, OracleMockPriceFeed.address);
        });
    });

    // describe("Receive and Fallback functions", async function () {
    //     it("receive ether when accidentally sent to contract", async function () {
    //         payscroll.transfer(accounts[1]
    //     });
    // });

    describe.only("addNewWizard", async function () {
        it("only lets owner call function", async function () {
            await payscroll.connect(accounts[1]);
            await expect(
                payscroll.addNewWizard(
                    "Cloud Strife",
                    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                    "Boss",
                    "100",
                    false,
                    false
                ).to.be.reverted
            );
        });
        it("can only be called between productions", async function () {});
        it("sets first wizard with ID #0", async function () {});
        it("adds new wizard to three mappings and Wizard array", async function () {});
        it("emits new wizard added event", async function () {});
    });

    describe("setProductionCrew", async function () {
        it("only lets owner call function", async function () {});
        it("can only be called once production has kicked off", async function () {});
        it("sets correct wizards correctly", async function () {});
        it("changes Production status and emits ProductionCrewIsSet event", async function () {});
    });

    describe("payWizards", async function () {
        it("reverts if payment is less than production contract total", async function () {});
        it("emits Payment Processing event", async function () {});
    });

    describe("withdrawPayment", async function () {
        it("cannot be called unless production is at PaymentsAreAvailable status", async function () {});
        it("can only pay each wizard once per production", async function () {});
        it("continues only if authorized wallets are withdrawing", async function () {});
        it("can only be called by wizards on the current production crew", async function () {});
        it("calculates payment correctly using dayRate", async function () {});
        it("works only if Payscroll contract has enough funds", async function () {});
        it("pays wizard correct amount", async function () {});
    });

    describe("closeOutProduction", async function () {
        it("can only be called after Payments are all withdrawn", async function () {});
        it("can only be called by owner", async function () {});
        it("resets all wizard Struct booleans to false", async function () {});
        it("emits Production is closed event", async function () {});
    });

    describe("assignPayscrollManager", async function () {
        it("can only be called by owner / payscroll manager", async function () {});
        it("assigns new payscroll manager", async function () {});
        it("emits new payscroll manager event", async function () {});
    });

    describe("Getters", async function () {
        it("get correct wizard data", async function () {});
        it("get correct contract balance", async function () {});
        it("get correct production status", async function () {});
        it("get correct oracle price feed", async function () {});
        it("get correct wizard count", async function () {});
        it("get all wizard data correctly", async function () {});
    });
});
