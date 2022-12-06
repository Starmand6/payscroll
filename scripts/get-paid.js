const { ethers, network, deployments } = require("hardhat");

module.exports = async function () {
    // const { accounts } = await ethers.getSigners();

    // const Payscroll = await ethers.ContractFactory("Payscroll");
    await deployments.fixture("kickoff-and-set");
    // Production status should be at CrewIsSet.

    await payscroll.connect(accounts[7]); // Simulate 3rd party payment
    // let tx = await connectedContract.YOUR_PAYABLE_FUNCTION(ALL, OTHER, PARAMETERS, {value: ethers.utils.parseEther(ETH_VALUE_AS_STRING)});
    await payscroll.payWizards(15000);
    await payscroll.connect(accounts[0]); // Payscroll Manager
    await payscroll.paymentVerified();

    // Production status should now be PaymentsAreAvailable

    await payscroll.connect(accounts[1]); // Cloud, wizID 0#
    await payscroll.withdrawPayment(0); // Should get paid 10000

    await payscroll.connect(accounts[3]); // Vincent, wizID 2#
    await payscroll.withdrawPayment(0); // Should get paid 5000

    // Production status should be at PaymentsAreAllWithdrawn.
};

module.exports.tags = ["all", "get-paid"];
