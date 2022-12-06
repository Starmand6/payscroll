const networkConfig = {
    31337: {
        name: "localhost",
        // Mock aggregator
        // gasLane: "0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd", // 500 gwei key hash
        // callbackGasLimit: "500000", // 500,000 gas
    },

    80001: {
        name: "polygonMumbai",
        // subscriptionId: "2418", // Mumbai Chainlink ID
        usdcETHPriceFeed: "0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0",
        // gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f", // 500 gwei Key Hash
        // callbackGasLimit: "500000", // 500,000 gas
    },
    137: {
        name: "polygonMainnet",
        // subscriptionId: "2418",
        usdcETHPriceFeed: "0xefb7e6be8356cCc6827799B6A7348eE674A80EaE",
        // gasLane: "0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd" // 500 gwei Key Hash
        //
        // callbackGasLimit: "500000", // 500,000 gas
    },

    // 4: {
    // name: "goerli",
    // subscriptionId:
    // ethUSDPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    // gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    // callbackGasLimit: "500000", // 500,000 gas
    // },
};

const DECIMALS = "18";
const INITIAL_PRICE = "200000000000000000000";
const developmentChains = ["hardhat", "localhost"];

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
};
