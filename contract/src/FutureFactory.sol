// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./FuturesContract.sol";

contract FuturesFactory {
    address public owner;
    FuturesContract[] public futuresContracts; // store deployed contracts

    event FuturesCreated(
        address indexed contractAddress,
        address indexed creator
    );

    constructor() {
        owner = msg.sender;
    }

    /// @notice Deploy a new FuturesContract
    function createFuturesContract() external returns (address) {
        FuturesContract newContract = new FuturesContract();
        futuresContracts.push(newContract);

        emit FuturesCreated(address(newContract), msg.sender);
        return address(newContract);
    }

    /// @notice Get all deployed contracts
    function getAllFuturesContracts()
        external
        view
        returns (FuturesContract[] memory)
    {
        return futuresContracts;
    }
}
