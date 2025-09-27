// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Oracle.sol";

contract FuturesContract {
    address public owner;
    PasswordOracle public oracle;

    enum Asset {
        GOLD,
        BTC
    }
    enum Side {
        LONG,
        SHORT
    }
    enum Status {
        OPEN,
        MATCHED,
        SETTLED
    }

    event PositionCreated(
        uint256 indexed positionId,
        address indexed seller,
        Asset asset,
        Side side,
        uint256 price,
        uint256 expiryTime,
        uint256 quantity,
        uint256 margin
    );
    event PositionMatched(
        uint256 indexed positionId,
        address indexed buyer,
        uint256 margin
    );
    // event PositionSettled(uint256 indexed positionId, address winner);
    event PositionSettled(uint256 indexed id, int256 pnlSeller, int256 pnlBuyer);

    struct Position {
        address seller;
        address buyer;
        Asset asset;
        Side side;
        uint256 priceBefore; // current price of the asset fetched using oracle
        uint256 expiryTime;
        Status status;
        uint256 margin; // margin deposited by each party
        uint256 quantity;
    }

    uint256 public positionCount;
    mapping(uint256 => Position) public positions;


    constructor(address oracleAddr) {
        owner = msg.sender;
        oracle = PasswordOracle(oracleAddr);
    }

    function _assetKey(Asset a) internal pure returns (string memory) {
        return a == Asset.GOLD ? "GOLD" : "BTC";
    }


    /// @notice Seller creates a futures position
    function createPosition(
        Asset _asset,
        Side _side,
        uint256 _expiryTime,
        uint256 _fraction,
        uint256 _margin
    ) external payable {
        require(_expiryTime > block.timestamp, "Expiry must be in future");
        require(_fraction > 0, "Quantity must be > 0");

        uint256 oraclePrice = oracle.getPrice(_assetKey(_asset));
        require(oraclePrice > 0, "Oracle price not set");

        uint256 notional = oraclePrice * _fraction / 1e18; // adjust for decimals
        require(msg.value == _margin, "Margin must equal declared value");


        positions[positionCount] = Position({
            seller: msg.sender,
            buyer: address(0),
            asset: _asset,
            side: _side,
            priceBefore: oraclePrice,
            expiryTime: _expiryTime,
            status: Status.OPEN,
            margin: _margin,
            quantity : _fraction
        });

        emit PositionCreated(
            positionCount,
            msg.sender,
            _asset,
            _side,
            oraclePrice,
            _expiryTime,
            _fraction,
            _margin
        );
        positionCount++;
    }

    /// @notice Buyer matches seller’s position
    function matchPosition(uint256 _positionId) external payable {
        Position storage pos = positions[_positionId];
        require(pos.status == Status.OPEN, "Position not open");
        require(msg.sender != pos.seller, "Seller cannot buy own position");
        require(msg.value == pos.margin, "Must deposit equal margin");


        pos.buyer = msg.sender;
        pos.status = Status.MATCHED;

        emit PositionMatched(_positionId, msg.sender, msg.value);
    }

    function getPosition(uint256 id) external view returns (
    address seller,
    address buyer,
    Asset asset,
    Side side,
    uint256 priceBefore,
    uint256 expiryTime,
    Status status,
    uint256 margin,
    uint256 quantity
) {
    Position storage p = positions[id];
    return (
        p.seller, p.buyer, p.asset, p.side,
        p.priceBefore, p.expiryTime, p.status, p.margin, p.quantity
    );
}

function getStatus(uint256 id) external view returns (Status) {
    return positions[id].status;
}

function getBuyer(uint256 id) external view returns (address) {
    return positions[id].buyer;
}

    /// @notice Simplified settlement logic (to be replaced with oracle price check)
    // apply fraction to priceAtExpiry before sending as parameter!! 
    function settle(uint256 _positionId) external {
        Position storage pos = positions[_positionId];
        require(pos.status == Status.MATCHED, "Position not matched");
        require(block.timestamp >= pos.expiryTime, "Not expired yet");

        uint256 expiryPrice = oracle.getPrice(_assetKey(pos.asset));
        require(expiryPrice > 0, "No expiry price in oracle");

        int256 pnlSeller;
        int256 pnlBuyer;

        // Price difference scaled by quantity
        int256 diff = (int256(expiryPrice) - int256(pos.priceBefore))
                        * int256(pos.quantity) / 1e18;

        if (pos.side == Side.LONG) {
            pnlSeller = diff;
            pnlBuyer = -diff;
        } else {
            pnlSeller = -diff;
            pnlBuyer = diff;
        }

        uint256 totalPool = pos.margin * 2;
        int256 sellerFinal = int256(pos.margin) + pnlSeller;
        int256 buyerFinal = int256(pos.margin) + pnlBuyer;

        // Clamp within [0, totalPool]
        if (sellerFinal < 0) sellerFinal = 0;
        if (buyerFinal < 0) buyerFinal = 0;
        if (sellerFinal > int256(totalPool)) sellerFinal = int256(totalPool);
        if (buyerFinal > int256(totalPool)) buyerFinal = int256(totalPool);

        if (sellerFinal > 0) payable(pos.seller).transfer(uint256(sellerFinal));
        if (buyerFinal > 0) payable(pos.buyer).transfer(uint256(buyerFinal));

        pos.status = Status.SETTLED;
        emit PositionSettled(_positionId, pnlSeller, pnlBuyer);
    }
}
