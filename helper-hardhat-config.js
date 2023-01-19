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
        maticUSDPriceFeed: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
        // gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f", // 500 gwei Key Hash
        // callbackGasLimit: "500000", // 500,000 gas
    },
    137: {
        name: "polygonMainnet",
        // subscriptionId: "2418",
        maticUSDPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
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
const INITIAL_PRICE = "1000000000000000000";
const developmentChains = ["hardhat", "localhost"];

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
};
