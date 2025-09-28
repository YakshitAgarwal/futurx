//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./FuturesContract.sol";

contract FuturesFactory {
    address public owner;
    address public oracleAddress;
    FuturesContract[] public futuresContracts;

    event FuturesCreated(
        address indexed contractAddress,
        address indexed creator
    );

    constructor(address _oracleAddress) {
        owner = msg.sender;
        oracleAddress = _oracleAddress;
    }

    /// @notice Deploy a new FuturesContract with oracle address
    function createFuturesContract() external returns (address) {
        FuturesContract newContract = new FuturesContract(oracleAddress);
        futuresContracts.push(newContract);

        emit FuturesCreated(address(newContract), msg.sender);
        return address(newContract);
    }

    /// @notice Update oracle address (only owner)
    function updateOracleAddress(address _newOracle) external {
        require(msg.sender == owner, "Only owner can update oracle");
        oracleAddress = _newOracle;
    }

    /// @notice Get all deployed contracts
    function getAllFuturesContracts()
        external
        view
        returns (FuturesContract[] memory)
    {
        return futuresContracts;
    }

    /// @notice Get number of deployed contracts
    function getContractCount() external view returns (uint256) {
        return futuresContracts.length;
    }
}
