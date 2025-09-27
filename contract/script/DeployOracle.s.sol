// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Oracle.sol";

contract DeployOracle is Script {
    function run() external {
        // load private key from env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // start broadcast
        vm.startBroadcast(deployerPrivateKey);

        // deploy with password arg
        new PasswordOracle("Future");

        vm.stopBroadcast();
    }
}
