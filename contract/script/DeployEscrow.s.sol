// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/FuturesEscrowNative.sol";

contract DeployEscrow is Script {
    function run() external {
        // load your private key from .env or CLI
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        // load oracle address from .env (this should be the MockOracle you already deployed)
        address oracle = vm.envAddress("ORACLE_ADDRESS");

        // deploy FuturesEscrowNative
        FuturesEscrowNative escrow = new FuturesEscrowNative(oracle);

        vm.stopBroadcast();

        console2.log("FuturesEscrowNative deployed at:", address(escrow));
    }
}
