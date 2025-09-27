// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PasswordOracle {
    struct PriceData {
        uint256 price;
        uint256 timestamp;
    }

    mapping(string => PriceData) private prices;

    // keccak256 hash of the password
    bytes32 public passwordHash;

    constructor(string memory _password) {
        // Store only the hash of the password
        passwordHash = keccak256(abi.encodePacked(_password));
    }

function updatePrices(
    string[] calldata assets,
    uint256[] calldata values,
    string calldata password
) external {
    require(
        keccak256(abi.encodePacked(password)) == passwordHash,
        "Invalid password"
    );
    require(assets.length == values.length, "Length mismatch");

    for (uint i = 0; i < assets.length; i++) {
        prices[assets[i]] = PriceData(values[i], block.timestamp);
    }
}


    function getPrice(string calldata asset) external view returns (uint256) {
        return prices[asset].price;
    }

    function getPriceWithTimestamp(string calldata asset) 
        external 
        view 
        returns (uint256, uint256) 
    {
        PriceData memory data = prices[asset];
        return (data.price, data.timestamp);
    }
}
