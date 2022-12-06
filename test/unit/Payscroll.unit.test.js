const { assert, expect } = require("chai");
const { deploy, ethers } = require("hardhat");
const { utils } = require("ethers");
const chainId = network.config.chainId;

if (chainId == 31337) {
    describe("Payscroll Unit Testing", function () {
        let accounts, OracleMockPriceFeed, payscroll;

        beforeEach(async function () {
            accounts = await ethers.getSigners();
            await deployments.fixture(["deploy"]);
            OracleMockPriceFeed = await ethers.getContract("MockV3Aggregator");
            payscroll = await ethers.getContract("Payscroll");
        });
        describe("Constructor", function () {
            it("sets the oracle price feed correctly", async function () {
                const priceFeedAddress = await payscroll.getPriceFeed();
                assert.equal(priceFeedAddress, OracleMockPriceFeed.address);
            });
            it("sets Production status to HasClosedOut", async function () {
                const response = await payscroll.getProductionStatus();
                assert.equal(response, "Production has closed out.");
            });
        });
        describe("addNewWizard", function () {
            beforeEach(async function () {
                await payscroll.addNewWizard(
                    "Cloud Strife", // HH Acc #1, wizID #0
                    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                    "Mercenary",
                    utils.parseEther("10"),
                    false,
                    false
                );
            });
            it("only lets owner call function", async function () {
                const notOwner = await payscroll.connect(accounts[1]);
                await expect(
                    notOwner.addNewWizard(
                        "Tifa Lockhart",
                        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // HH Acc #4
                        "Rebeller",
                        utils.parseEther("1"),
                        false,
                        false
                    )
                ).to.be.revertedWith("Ownable: caller is not the owner");
            });
            it("can only be called between productions", async function () {
                await payscroll.kickOffProduction(utils.parseEther("10"), 1);
                await payscroll.setProductionCrew([0]); // Only Cloud

                await expect(
                    payscroll.addNewWizard(
                        "Tifa Lockhart",
                        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // HH Acc #4
                        "Rebeller",
                        utils.parseEther("1"),
                        false,
                        false
                    )
                ).to.be.revertedWith("FunctionUnavailableAtThisProductionStatus");
            });
            it("sets wizard IDs correctly", async function () {
                let wizardID = await payscroll.getWizardCount();
                assert.equal(wizardID, 1);
                await payscroll.addNewWizard(
                    "Tifa Lockhart",
                    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // HH Acc #4
                    "Rebeller",
                    utils.parseEther("1"),
                    false,
                    false
                );
                wizardID = await payscroll.getWizardCount();
                assert.equal(wizardID, 2);
            });
            it("adds new wizard to three mappings and Wizard array", async function () {
                await payscroll.addNewWizard(
                    "Tifa Lockhart",
                    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // HH Acc #4
                    "Rebeller",
                    utils.parseEther("1"),
                    false,
                    false
                );

                // Wizard array verification
                let [wizName] = await payscroll.getWizardData(1);
                assert.equal(wizName, "Tifa Lockhart");

                // Mappings verifications
                wizName = "Derek Zoolander";
                [wizName] = await payscroll.wizardIDToData(1);
                assert.equal(wizName, "Tifa Lockhart");

                wizName = "Hansel";
                [wizName] = await payscroll.walletToData(accounts[4].address);
                assert.equal(wizName, "Tifa Lockhart");

                const wallet = await payscroll.wizardIDToWallet(0);
                assert.equal(wallet, accounts[1].address);
            });
            it("emits new wizard added event", async function () {
                await expect(
                    payscroll.addNewWizard(
                        "Tifa Lockhart",
                        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // HH Acc #4
                        "Rebeller",
                        utils.parseEther("1"),
                        false,
                        false
                    )
                ).to.emit(payscroll, "ANewWizardHasEnteredTheChat");
            });
        });
        describe("During Production", function () {
            beforeEach(async function () {
                // HH Acc #1, wizID #0
                await payscroll.addNewWizard(
                    "Cloud Strife", // HH Acc #1, wizID #0
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
                // Production status should still be at HasClosedOut.
            });

            describe("kickOffProduction", function () {
                // Should have three wizard profiles (Cloud, Red, Vincent) entered at this point.
                it("only lets owner call function", async function () {
                    const nonOwnerCalling = await payscroll.connect(accounts[7]);
                    await expect(
                        nonOwnerCalling.kickOffProduction(utils.parseEther("15"), 1)
                    ).to.be.revertedWith("Ownable: caller is not the owner");
                });
                it("sets correct production contract details", async function () {
                    await payscroll.kickOffProduction(utils.parseEther("100"), 4); // 1000 and 4 days

                    const contractTotal = await payscroll.productionContractTotal();
                    assert.equal(contractTotal.toString(), utils.parseEther("100"));

                    const days = await payscroll.productionDays();
                    assert.equal(days.toString(), 4);
                });
                it("changes Production status and emits ProductionHasKickedOff event", async function () {
                    await expect(payscroll.kickOffProduction(utils.parseEther("100"), 4)).to.emit(
                        payscroll,
                        "ProductionHasKickedOff"
                    );

                    const status = await payscroll.getProductionStatus();
                    assert.equal(status, "Production has kicked off.");
                });
                it("can only be called once previous production has been closed out", async function () {
                    await payscroll.kickOffProduction(utils.parseEther("15"), 1);
                    await payscroll.setProductionCrew([0, 2]);
                    await expect(
                        payscroll.kickOffProduction(utils.parseEther("100"), 4)
                    ).to.be.revertedWith("FunctionUnavailableAtThisProductionStatus");
                });
            });

            describe("setProductionCrew", function () {
                it("only lets owner call function", async function () {
                    const nonOwnerCalling = await payscroll.connect(accounts[7]);
                    await expect(nonOwnerCalling.setProductionCrew([0, 2])).to.be.revertedWith(
                        "Ownable: caller is not the owner"
                    );
                });
                it("can only be called once production has kicked off", async function () {
                    await expect(payscroll.setProductionCrew([0, 2])).to.be.revertedWith(
                        "FunctionUnavailableAtThisProductionStatus"
                    );
                });
                it("sets correct wizards correctly", async function () {
                    await payscroll.kickOffProduction(utils.parseEther("15"), 1);
                    await payscroll.setProductionCrew([0, 2]);
                    const [, , , cloudDayRate] = await payscroll.wizardIDToData(0);
                    assert.equal(cloudDayRate.toString(), utils.parseEther("10"));
                    const [, , , , vincentOnProductionCrew] = await payscroll.wizardIDToData(2);
                    assert.equal(vincentOnProductionCrew, true);
                });
                it("reverts if total crew cost does not match contract total", async function () {
                    await payscroll.kickOffProduction(utils.parseEther("100000"), 2);
                    await expect(payscroll.setProductionCrew([0, 2])).to.be.revertedWith(
                        "CrewMustMatchContractTotal"
                    );
                });
                it("changes Production status and emits ProductionCrewIsSet event", async function () {
                    await payscroll.kickOffProduction(utils.parseEther("60"), 4);
                    await expect(payscroll.setProductionCrew([0, 2])).to.emit(
                        payscroll,
                        "ProductionCrewIsSet"
                    );

                    const status = await payscroll.getProductionStatus();
                    assert.equal(status, "Production crew is set.");
                });
            });

            describe("payWizards", function () {
                beforeEach(async function () {
                    await payscroll.kickOffProduction(utils.parseEther("15"), 1);
                    await payscroll.setProductionCrew([0, 2]);
                    // Status is "Production crew is set."
                });
                it("reverts if payment is less than production contract total", async function () {
                    const thirdParty = await payscroll.connect(accounts[7]);
                    await expect(
                        thirdParty.payWizards({ value: utils.parseEther("10") })
                    ).to.be.revertedWith("PaymentMustEqualContractTotal");
                });
                it("emits Payment Processing event and changes status", async function () {
                    const thirdParty = await payscroll.connect(accounts[7]);
                    await expect(thirdParty.payWizards({ value: utils.parseEther("15") })).to.emit(
                        payscroll,
                        "WizardsPaymentProcessing"
                    );

                    const status = await payscroll.getProductionStatus();
                    assert.equal(status, "Contract payment has been received.");
                });
            });
            describe("paymentVerified", function () {
                beforeEach(async function () {
                    await payscroll.kickOffProduction(utils.parseEther("15"), 1);
                    await payscroll.setProductionCrew([0, 2]);
                });
                it("only lets owner call function", async function () {
                    await payscroll
                        .connect(accounts[7])
                        .payWizards({ value: utils.parseEther("15") });
                    const nonOwnerCalling = await payscroll.connect(accounts[7]);
                    await expect(nonOwnerCalling.paymentVerified()).to.be.revertedWith(
                        "Ownable: caller is not the owner"
                    );
                });
                it("can only be called after payment has been received", async function () {
                    await expect(payscroll.paymentVerified()).to.be.revertedWith(
                        "FunctionUnavailableAtThisProductionStatus"
                    );
                });

                it("emits PaymentsCanBeWithdrawn event and changes status", async function () {
                    await payscroll
                        .connect(accounts[7])
                        .payWizards({ value: utils.parseEther("15") });
                    await expect(payscroll.paymentVerified()).to.emit(
                        payscroll,
                        "PaymentsCanBeWithdrawn"
                    );

                    const status = await payscroll.getProductionStatus();
                    assert.equal(status, "Production payments are available.");
                });
            });
            describe("withdrawPayment", function () {
                it("cannot be called unless production is at PaymentsAreAvailable status", async function () {
                    const cloudCalling = await payscroll.connect(accounts[1]);
                    await expect(cloudCalling.withdrawPayment(0)).to.be.revertedWith(
                        "FunctionUnavailableAtThisProductionStatus"
                    );
                });
                describe("Checking the pesky details:", function () {
                    beforeEach(async function () {
                        await payscroll.kickOffProduction(utils.parseEther("15"), 1);
                        await payscroll.setProductionCrew([0, 2]);
                        await payscroll
                            .connect(accounts[7])
                            .payWizards({ value: utils.parseEther("15") });
                        await payscroll.paymentVerified();
                    });

                    it("can only pay each wizard once per production", async function () {
                        const cloudCalling = await payscroll.connect(accounts[1]);
                        await cloudCalling.withdrawPayment(0);
                        await expect(cloudCalling.withdrawPayment(0)).to.be.revertedWith(
                            "WizardHasAlreadyBeenPaid"
                        );
                    });
                    it("continues only if authorized IDs && wallets are withdrawing", async function () {
                        const vincentCalling = await payscroll.connect(accounts[3]);
                        // Vincent is on crew and has correct wallet but is calling with the wrong ID.
                        await expect(vincentCalling.withdrawPayment(0)).to.be.revertedWith(
                            "NotAuthorizedToWithdrawPayment"
                        );
                    });
                    it("can only be called by wizards on the current production crew", async function () {
                        // Red XIII is registered in system, but he is not on current crew.
                        const redCalling = await payscroll.connect(accounts[2]);
                        await expect(redCalling.withdrawPayment(1)).to.be.revertedWith(
                            "WizardIsNotOnProductionCrew"
                        );

                        // Random wallet not in wizard array trying to call function.
                        const randoCalling = await payscroll.connect(accounts[10]);
                        await expect(randoCalling.withdrawPayment(10)).to.be.revertedWith(
                            "NotAuthorizedToWithdrawPayment"
                        );
                    });
                    it("calculates and pays wizard correct amount", async function () {
                        const cloudStartingBalance = accounts[1].balance;
                        const cloudCalling = await payscroll.connect(accounts[1]);
                        await cloudCalling.withdrawPayment(0);
                        const cloudEndingBalance = accounts[1].balance;

                        const prodDays = payscroll.productionDays();
                        const [, , , cloudDayRate] = await payscroll.wizardIDToData(0);
                        const expectedPayment = prodDays * cloudDayRate;
                        assert.equal(
                            (cloudEndingBalance - cloudStartingBalance).toString(),
                            expectedPayment.toString()
                        );
                    });
                    it("changes status and emits event when all funds have been withdrawn", async function () {
                        const cloudCalling = await payscroll.connect(accounts[1]);
                        await cloudCalling.withdrawPayment(0);
                        const vincentCalling = await payscroll.connect(accounts[3]);
                        await expect(vincentCalling.withdrawPayment(2)).to.emit(
                            payscroll,
                            "AllWizardsHaveBeenPaid"
                        );

                        const status = await payscroll.getProductionStatus();
                        assert.equal(status, "Production payments are all withdrawn.");
                    });
                });
            });

            describe("closeOutProduction", function () {
                beforeEach(async function () {
                    await payscroll.kickOffProduction(utils.parseEther("15"), 1);
                    await payscroll.setProductionCrew([0, 2]);
                    await payscroll
                        .connect(accounts[7])
                        .payWizards({ value: utils.parseEther("15") });
                    await payscroll.paymentVerified();
                    const cloudCalling = await payscroll.connect(accounts[1]);
                    await cloudCalling.withdrawPayment(0);
                });
                it("can only be called after Payments are all withdrawn", async function () {
                    await expect(payscroll.closeOutProduction()).to.be.revertedWith(
                        "FunctionUnavailableAtThisProductionStatus"
                    );
                });

                describe("after all payments have been withdrawn", function () {
                    let vincentCalling;
                    beforeEach(async function () {
                        vincentCalling = await payscroll.connect(accounts[3]);
                        await vincentCalling.withdrawPayment(2);
                    });
                    it("can only be called by owner", async function () {
                        await expect(vincentCalling.closeOutProduction()).to.be.revertedWith(
                            "Ownable: caller is not the owner"
                        );
                    });
                    it("resets all wizard Struct booleans to false", async function () {
                        let [, , , , , hasBeenPaid] = await payscroll.wizardIDToData(2);
                        assert.equal(hasBeenPaid, true);
                        await payscroll.closeOutProduction();
                        // Everything should be reset here.
                        const [, , , , vincentOnProductionCrew] = await payscroll.wizardIDToData(2);
                        assert.equal(vincentOnProductionCrew, false);
                        [, , , , , hasBeenPaid] = await payscroll.wizardIDToData(2);
                        assert.equal(hasBeenPaid, false);
                    });
                    it("emits ProductionIsClosed event", async function () {
                        await expect(payscroll.closeOutProduction()).to.emit(
                            payscroll,
                            "ProductionHasClosedOut"
                        );
                    });
                });
            });

            describe("Getters", function () {
                // The only getter that hasn't been organically tested is getContractBalance.
                it("return correct contract balance", async function () {
                    await payscroll.kickOffProduction(utils.parseEther("15"), 1);
                    await payscroll.setProductionCrew([0, 2]);
                    await payscroll
                        .connect(accounts[7])
                        .payWizards({ value: utils.parseEther("15") });

                    const balance = await payscroll.getContractBalance();
                    assert.equal(balance.toString(), utils.parseEther("15"));
                });
                it("return all wizard structs", async function () {
                    let [, , vincent] = await payscroll.getAllWizards();
                    assert.equal(vincent.name, "Vincent Valentine");
                });
            });
        });
    });
}
