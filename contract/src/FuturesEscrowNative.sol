// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IOracle {
    function latestRoundData()
        external
        view
        returns (uint80, int256, uint256, uint256, uint80);
    function decimals() external view returns (uint8);
}

contract FuturesEscrowNative {
    enum Asset { GOLD }
    enum Side { LONG, SHORT }
    enum Status { OPEN, MATCHED, SETTLED }

    struct Position {
        address maker;
        address taker;
        Asset asset;
        Side side;         // maker’s side
        uint256 notional;  // “USD notional”, off-chain scaling
        uint256 entryPrice;
        uint256 expiry;
        uint256 marginMaker;
        uint256 marginTaker;
        Status status;
    }

    IOracle public goldOracle;
    uint256 public nextId;
    mapping(uint256 => Position) public positions;

    constructor(address _goldOracle) {
        goldOracle = IOracle(_goldOracle);
    }

    function matchAndEscrow(
        address taker,
        Side side,
        uint256 notional,
        uint256 expiry,
        uint256 entryPrice
    ) external payable returns (uint256 id) {
        // require both sides send same margin for now
        uint256 margin = msg.value / 2;
        require(margin > 0, "margin=0");

        id = ++nextId;
        positions[id] = Position({
            maker: msg.sender,
            taker: taker,
            asset: Asset.GOLD,
            side: side,
            notional: notional,
            entryPrice: entryPrice,
            expiry: expiry,
            marginMaker: margin,
            marginTaker: margin,
            status: Status.MATCHED
        });
    }

    function settle(uint256 id) external {
        Position storage p = positions[id];
        require(p.status == Status.MATCHED, "not matched");
        require(block.timestamp >= p.expiry, "not expired");

        (, int256 px,,,) = goldOracle.latestRoundData();
        require(px > 0, "bad price");
        uint256 settlePrice = uint256(px);

        // simple pnl: diff * notional
        int256 diff = int256(settlePrice) - int256(p.entryPrice);
        int256 pnlLong = int256(p.notional) * diff / int256(1e8); // assume 8 decimals
        int256 pnlMaker = (p.side == Side.LONG) ? pnlLong : -pnlLong;

        uint256 pot = p.marginMaker + p.marginTaker;
        (uint256 payMaker, uint256 payTaker) = _splitPot(pot, pnlMaker);

        p.status = Status.SETTLED;

        payable(p.maker).transfer(payMaker);
        payable(p.taker).transfer(payTaker);
    }

    function _splitPot(uint256 pot, int256 pnlMaker) internal pure returns (uint256, uint256) {
        int256 half = int256(pot) / 2;
        int256 rawMaker = half + pnlMaker;
        if (rawMaker < 0) rawMaker = 0;
        if (rawMaker > int256(pot)) rawMaker = int256(pot);
        uint256 payMaker = uint256(rawMaker);
        return (payMaker, pot - payMaker);
    }
}
