const { ethers, network, deployments } = require("hardhat");

module.exports = async function () {
    // const { accounts } = await ethers.getSigners();

    // const Payscroll = await ethers.ContractFactory("Payscroll");
    await deployments.fixture("add-wizards");

    const ownerCalls = await payscroll.connect(accounts[0]);
    await ownerCalls.kickOffProduction(4000, 4);
    await ownerCalls.setProductionCrew([0, 2]); // Only Cloud and Vincent
    console.log(payscroll.getProductionStatus());
    // Production status should now be CrewIsSet.
};

module.exports.tags = ["all", "kickoff-and-set"];
