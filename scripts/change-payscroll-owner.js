const { ethers } = require("hardhat");

async function changePayscrollOwner() {
    let accounts = await ethers.getSigners();
    const payscroll = await ethers.getContract("Payscroll");
    console.log("Transferring ownership.");
    const acc = await payscroll.connect(accounts[2]);
    await acc.transferOwnership("0x712bA76321a1b4fC4C2Cea6bdd455D25673Ad981");
}

changePayscrollOwner()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

module.exports.tags = ["changeOwner"];
