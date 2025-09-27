// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/mocks/MockOracle.sol";

contract DeployOracle is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        // Start gold at 2000 USD (8 decimals)
        MockOracle gold = new MockOracle(int256(2000 * 1e8), 8);

        vm.stopBroadcast();

        console2.log("Gold Oracle deployed at:", address(gold));
    }
}
