// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FutureContract.sol";

contract DeployFutures is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Pass in already deployed oracle address
        address oracleAddr = vm.envAddress("ORACLE_ADDRESS");

        FuturesContract futures = new FuturesContract(oracleAddr);
        console.log("FuturesContract deployed at:", address(futures));

        vm.stopBroadcast();
    }
}
