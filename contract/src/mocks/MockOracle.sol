// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IOracle {
    function latestRoundData()
        external
        view
        returns (uint80, int256, uint256, uint256, uint80);
    function decimals() external view returns (uint8);
}

contract MockOracle is IOracle {
    address public owner;
    int256  private _price;     // answer
    uint8   private _decimals;  // usually 8 for USD feeds

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(int256 initialPrice, uint8 decimals_) {
        owner = msg.sender;
        _price = initialPrice;
        _decimals = decimals_;
    }

    function setPrice(int256 p) external onlyOwner {
        require(p > 0, "price <= 0");
        _price = p;
    }

    function latestRoundData()
        external
        view
        returns (uint80, int256 answer, uint256, uint256 updatedAt, uint80)
    {
        return (0, _price, block.timestamp, block.timestamp, 0);
    }

    function decimals() external view returns (uint8) {
        return _decimals;
    }
}
