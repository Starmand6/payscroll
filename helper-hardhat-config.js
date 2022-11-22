const networkConfig = {
    // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
    31337: {
        name: "localhost",
        // subscriptionId:
        // Mock aggregator
        gasLane: "0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd", // 500 gwei key hash
        callbackGasLimit: "500000", // 500,000 gas
        mintFee: "10000000000000000", // 0.01 ETH
    },

    80001: {
        name: "polygonMumbai",
        subscriptionId: "2418", // Mumbai Chainlink ID
        ethUSDPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
        // vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed", // Chainlink doesn't show "V2" anywhere
        gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f", // 500 gwei Key Hash
        callbackGasLimit: "500000", // 500,000 gas
        mintFee: "10000000000000000", // 0.01 ETH
    },
    137: {
        name: "polygonMainnet",
        subscriptionId: "2418", // ????? same for poly mainnet?
        ethUSDPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
        // vrfCoordinator: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
        // gasLane: "0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd" // 500 gwei Key Hash
        //
        callbackGasLimit: "500000", // 500,000 gas
        mintFee: "10000000000000000", // 0.01 ETH
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
    4: {
        name: "goerli",
        // subscriptionId:
        ethUSDPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        // vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        // gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000", // 500,000 gas
        mintFee: "10000000000000000", // 0.01 ETH
    },
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
