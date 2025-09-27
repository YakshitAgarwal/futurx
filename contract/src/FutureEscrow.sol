// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";
import {IOracle} from "./interfaces/IOracle.sol";

contract FuturesEscrow {
    enum Asset { GOLD, OIL }
    enum Side { LONG, SHORT }
    enum Status { OPEN, MATCHED, SETTLED }

    struct Position {
        address maker;
        address taker;
        Asset asset;
        Side side;           // maker's side
        uint256 notional;    // contract size in USD terms
        uint256 entryPrice;  // oracle price at match time
        uint256 expiry;      // unix timestamp
        uint256 marginMaker;
        uint256 marginTaker;
        Status status;
    }

    IERC20 public immutable settlementToken;
    IOracle public goldOracle;
    IOracle public oilOracle;

    uint256 public nextId;
    mapping(uint256 => Position) public positions;

    // settlement incentive
    uint256 public constant SETTLE_BOUNTY = 1e6; // 1 token unit, adjust later

    event Matched(uint256 indexed id, address maker, address taker, Asset asset, Side side, uint256 notional, uint256 expiry);
    event Settled(uint256 indexed id, int256 pnlMaker, int256 pnlTaker, uint256 settlePrice);

    constructor(address _token, address _goldOracle, address _oilOracle) {
        settlementToken = IERC20(_token);
        goldOracle = IOracle(_goldOracle);
        oilOracle = IOracle(_oilOracle);
    }

    // called by OrderGateway when both parties are known
    function recordMatch(
        address maker,
        address taker,
        Asset asset,
        Side side,
        uint256 notional,
        uint256 entryPrice,
        uint256 expiry,
        uint256 marginMaker,
        uint256 marginTaker
    ) external returns (uint256 id) {
        id = ++nextId;
        positions[id] = Position({
            maker: maker,
            taker: taker,
            asset: asset,
            side: side,
            notional: notional,
            entryPrice: entryPrice,
            expiry: expiry,
            marginMaker: marginMaker,
            marginTaker: marginTaker,
            status: Status.MATCHED
        });
        emit Matched(id, maker, taker, asset, side, notional, expiry);
    }

    function settle(uint256 id) external {
        Position storage p = positions[id];
        require(p.status == Status.MATCHED, "Not matched");
        require(block.timestamp >= p.expiry, "Not expired");

        // oracle price at expiry
        uint256 settlePrice = _latestPrice(p.asset);

        // compute PnL (difference * notional)
        int256 diff = int256(settlePrice) - int256(p.entryPrice);
        int256 pnlLong = int256(p.notional) * diff / int256(1e8); // assumes 8 decimals normalized
        int256 pnlShort = -pnlLong;

        int256 pnlMaker = (p.side == Side.LONG) ? pnlLong : pnlShort;
        int256 pnlTaker = -pnlMaker;

        uint256 totalPot = p.marginMaker + p.marginTaker;

        (uint256 payMaker, uint256 payTaker) = _splitPot(totalPot, pnlMaker);

        p.status = Status.SETTLED;

        // transfers
        require(settlementToken.transfer(p.maker, payMaker), "maker xfer fail");
        require(settlementToken.transfer(p.taker, payTaker), "taker xfer fail");

        // bounty to settler if contract has enough
        uint256 bal = settlementToken.balanceOf(address(this));
        if (bal >= SETTLE_BOUNTY) {
            settlementToken.transfer(msg.sender, SETTLE_BOUNTY);
        }

        emit Settled(id, pnlMaker, pnlTaker, settlePrice);
    }

    function _latestPrice(Asset a) internal view returns (uint256 p8) {
        (, int256 px,,,) = (a == Asset.GOLD) ? goldOracle.latestRoundData() : oilOracle.latestRoundData();
        require(px > 0, "bad px");
        // assume oracle decimals = 8 for now
        p8 = uint256(px);
    }

    function _splitPot(uint256 pot, int256 pnlMaker) internal pure returns (uint256 payMaker, uint256 payTaker) {
        int256 half = int256(pot) / 2;
        int256 rawMaker = half + pnlMaker;
        if (rawMaker < 0) rawMaker = 0;
        if (rawMaker > int256(pot)) rawMaker = int256(pot);
        payMaker = uint256(rawMaker);
        payTaker = pot - payMaker;
    }
}
