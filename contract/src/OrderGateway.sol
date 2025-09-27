// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";
import {FuturesEscrow} from "./FuturesEscrow.sol";

contract OrderGateway {
    FuturesEscrow public escrow;
    IERC20 public settlementToken;

    constructor(address _escrow, address _token) {
        escrow = FuturesEscrow(_escrow);
        settlementToken = IERC20(_token);
    }

    function matchAndEscrow(
        address maker,
        address taker,
        FuturesEscrow.Asset asset,
        FuturesEscrow.Side side,
        uint256 notional,
        uint256 expiry,
        uint256 marginMaker,
        uint256 marginTaker,
        uint256 entryPrice
    ) external {
        // pull both margins into escrow
        require(settlementToken.transferFrom(maker, address(escrow), marginMaker), "maker margin fail");
        require(settlementToken.transferFrom(taker, address(escrow), marginTaker), "taker margin fail");

        // record match in escrow
        escrow.recordMatch(
            maker,
            taker,
            asset,
            side,
            notional,
            entryPrice,
            expiry,
            marginMaker,
            marginTaker
        );
    }
}
