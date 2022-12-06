const { ethers, network, deployments } = require("hardhat");

module.exports = async function () {
    // const { accounts } = await ethers.getSigners();

    // const Payscroll = await ethers.ContractFactory("Payscroll");
    await deployments.fixture("get-paid");
    // Production status should be at PaymentsAreAllWithdrawn.

    await payscroll.connect(accounts[0]); // Payscroll Manager
    await payscroll.closeOutProduction();

    // Production status should now be at HasCloseOut.

    await payscroll.assignPayscrollManager("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");

    await payscroll.getWizardData("2"); // account 0 is no longer Manager.
    await payscroll.getContractBalance();
    await payscroll.getProductionStatus();
    await payscroll.getPriceFeed();
    await payscroll.getWizardCount();

    await payscroll.connect(accounts[1]);
    await payscroll.getAllWizards();
};

module.exports.tags = ["all", "close-out-and-get"];
