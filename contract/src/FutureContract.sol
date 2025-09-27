// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FuturesContract {
    address public owner;

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
        uint256 expiryTime
    );
    event PositionMatched(
        uint256 indexed positionId,
        address indexed buyer,
        uint256 margin
    );
    event PositionSettled(uint256 indexed positionId, address winner);

    struct Position {
        address seller;
        address buyer;
        Asset asset;
        Side side;
        uint256 priceBefore; // current price of the asset fetched using oracle
        uint256 expiryTime;
        Status status;
        uint256 margin; // margin deposited by each party
    }

    uint256 public positionCount;
    mapping(uint256 => Position) public positions;

    constructor() {
        owner = msg.sender;
    }

    /// @notice Seller creates a futures position
    function createPosition(
        Asset _asset,
        Side _side,
        uint256 _priceBefore,
        uint256 _expiryTime
    ) external payable {
        require(msg.value > 0, "Margin required");
        require(_priceBefore > 0, "Price must be > 0");
        require(_expiryTime > block.timestamp, "Expiry must be in future");

        uint256 requiredMargin = (_priceBefore * 10) / 100;
        require(msg.value == requiredMargin, "Must deposit 10% margin");

        positions[positionCount] = Position({
            seller: msg.sender,
            buyer: address(0),
            asset: _asset,
            side: _side,
            priceBefore: _priceBefore,
            expiryTime: _expiryTime,
            status: Status.OPEN,
            margin: requiredMargin
        });

        emit PositionCreated(
            positionCount,
            msg.sender,
            _asset,
            _side,
            _priceBefore,
            _expiryTime
        );
        positionCount++;
    }

    /// @notice Buyer matches seller’s position
    function matchPosition(uint256 _positionId) external payable {
        Position storage pos = positions[_positionId];
        require(pos.status == Status.OPEN, "Position not open");
        require(msg.sender != pos.seller, "Seller cannot buy own position");

        uint256 requiredMargin = pos.margin;
        require(msg.value == requiredMargin, "Must deposit 10% margin");

        pos.buyer = msg.sender;
        pos.status = Status.MATCHED;

        emit PositionMatched(_positionId, msg.sender, msg.value);
    }

    /// @notice Simplified settlement logic (to be replaced with oracle price check)
    function settle(uint256 _positionId, uint256 priceAtExpiry) external {
        Position storage pos = positions[_positionId];
        require(pos.status == Status.MATCHED, "Position not matched");
        require(block.timestamp >= pos.expiryTime, "Not expired yet");

        address winner;
        // If seller was LONG and price went UP → seller wins
        if (pos.side == Side.LONG && priceAtExpiry > pos.priceBefore) {
            winner = pos.seller;
        }
        // If seller was SHORT and price went DOWN → seller wins
        else if (pos.side == Side.SHORT && priceAtExpiry < pos.priceBefore) {
            winner = pos.seller;
        }
        // Otherwise buyer wins
        else {
            winner = pos.buyer;
        }

        // Payout both margins to winner
        payable(winner).transfer(address(this).balance);

        pos.status = Status.SETTLED;
        emit PositionSettled(_positionId, winner);
    }
}
