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
    event PositionSettled(
        uint256 indexed id,
        int256 pnlSeller,
        int256 pnlBuyer
    );

    struct Position {
        address seller;
        address buyer;
        Asset asset;
        Side side;
        uint256 priceBefore;
        uint256 expiryTime;
        Status status;
        uint256 margin;
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
        require(_expiryTime > block.timestamp, "bad expiry");
        require(_fraction > 0, "fraction = 0");

        uint256 oraclePrice = oracle.getPrice(_assetKey(_asset));
        require(oraclePrice > 0, "Oracle price not set");
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
            quantity: _fraction
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

    /// @notice Buyer matches seller's position
    function matchPosition(uint256 _positionId) external payable {
        Position storage pos = positions[_positionId];
        require(pos.status == Status.OPEN, "Position not open");
        require(msg.sender != pos.seller, "Seller cannot buy own position");
        require(msg.value == pos.margin, "Must deposit equal margin");

        pos.buyer = msg.sender;
        pos.status = Status.MATCHED;

        emit PositionMatched(_positionId, msg.sender, msg.value);
    }

    function getPosition(
        uint256 id
    )
        external
        view
        returns (
            address seller,
            address buyer,
            Asset asset,
            Side side,
            uint256 priceBefore,
            uint256 expiryTime,
            Status status,
            uint256 margin,
            uint256 quantity
        )
    {
        Position storage p = positions[id];
        return (
            p.seller,
            p.buyer,
            p.asset,
            p.side,
            p.priceBefore,
            p.expiryTime,
            p.status,
            p.margin,
            p.quantity
        );
    }

    function getStatus(uint256 id) external view returns (Status) {
        return positions[id].status;
    }

    function getBuyer(uint256 id) external view returns (address) {
        return positions[id].buyer;
    }

    /// @notice Settlement with improved safety checks
    function settle(uint256 _positionId) external {
        Position storage pos = positions[_positionId];
        require(pos.status == Status.MATCHED, "Position not matched");
        require(block.timestamp >= pos.expiryTime, "Not expired yet");

        uint256 expiryPrice = oracle.getPrice(_assetKey(pos.asset));
        require(expiryPrice > 0, "No expiry price in oracle");

        // Use SafeMath-style checks to prevent overflow
        int256 priceDiff = int256(expiryPrice) - int256(pos.priceBefore);

        // Scale the difference by quantity with overflow protection
        int256 scaledDiff;
        if (priceDiff == 0) {
            scaledDiff = 0;
        } else {
            // Check for potential overflow before multiplication
            require(
                priceDiff > 0
                    ? int256(pos.quantity) <= type(int256).max / priceDiff
                    : int256(pos.quantity) <= type(int256).max / (-priceDiff),
                "Overflow in PnL calculation"
            );
            scaledDiff = (priceDiff * int256(pos.quantity)) / 1e18;
        }

        int256 pnlSeller;
        int256 pnlBuyer;

        if (pos.side == Side.LONG) {
            pnlSeller = scaledDiff;
            pnlBuyer = -scaledDiff;
        } else {
            pnlSeller = -scaledDiff;
            pnlBuyer = scaledDiff;
        }

        uint256 totalPool = pos.margin * 2;
        int256 sellerFinal = int256(pos.margin) + pnlSeller;
        int256 buyerFinal = int256(pos.margin) + pnlBuyer;

        // Improved clamping logic to ensure total doesn't exceed pool
        if (sellerFinal < 0) {
            sellerFinal = 0;
        } else if (sellerFinal > int256(totalPool)) {
            sellerFinal = int256(totalPool);
        }

        if (buyerFinal < 0) {
            buyerFinal = 0;
        } else if (buyerFinal > int256(totalPool)) {
            buyerFinal = int256(totalPool);
        }

        // Ensure total payouts don't exceed pool
        uint256 totalPayout = uint256(sellerFinal) + uint256(buyerFinal);
        if (totalPayout > totalPool) {
            // Proportionally reduce payouts
            sellerFinal =
                (sellerFinal * int256(totalPool)) /
                int256(totalPayout);
            buyerFinal = (buyerFinal * int256(totalPool)) / int256(totalPayout);
        }

        // Make payments
        if (sellerFinal > 0) {
            payable(pos.seller).transfer(uint256(sellerFinal));
        }
        if (buyerFinal > 0) {
            payable(pos.buyer).transfer(uint256(buyerFinal));
        }

        pos.status = Status.SETTLED;
        emit PositionSettled(_positionId, pnlSeller, pnlBuyer);
    }
}
