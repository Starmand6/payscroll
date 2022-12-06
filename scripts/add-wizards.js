const { ethers, network } = require("hardhat");

module.exports = async function () {
    // await deployments.fixture("deploy");
    const Payscroll = await ethers.ContractFactory("Payscroll");
    const payscroll = await Payscroll.deploy();

    // Production status should be initialized at HasClosedOut.

    // HH Acc #1, wizID #0
    await payscroll.addNewWizard(
        "Cloud Strife",
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "Mercenary",
        "10000",
        false,
        false
    );

    // HH Acc #2, wizID #1
    await payscroll.addNewWizard(
        "Red XIII",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "Tribesman",
        "1000",
        false,
        false
    );

    // HH Acc #3, wizID #2
    await payscroll.addNewWizard(
        "Vincent Valentine",
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "Unknown",
        "5000",
        false,
        false
    );
};

module.exports.tags = ["all", "add-wizards"];
