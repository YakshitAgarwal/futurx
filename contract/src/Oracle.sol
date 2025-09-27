// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PasswordOracle {
    struct PriceData {
        uint256 price;
        uint256 timestamp;
    }

    // ------- existing latest-value storage (kept for compatibility) -------
    mapping(string => PriceData) private prices;

    // ------- NEW: small rolling history per asset (circular buffer) -------
    uint8 public constant WINDOW = 30;
    mapping(string => PriceData[WINDOW]) private history; // ring buffer
    mapping(string => uint8) private head;   // next index to write (0..WINDOW-1)
    mapping(string => uint8) private count;  // how many entries are currently stored (<= WINDOW)

    // keccak256 hash of the password
    bytes32 public passwordHash;

    // events
    event PriceUpdated(string indexed asset, uint256 price, uint256 timestamp);

    constructor(string memory _password) {
        passwordHash = keccak256(abi.encodePacked(_password));
    }

    // ------------------------ internal helpers ------------------------

    function _auth(string calldata password) internal view {
        require(
            keccak256(abi.encodePacked(password)) == passwordHash,
            "Invalid password"
        );
    }

    function _pushToHistory(string calldata asset, uint256 price) internal {
        uint8 i = head[asset];
        history[asset][i] = PriceData({price: price, timestamp: block.timestamp});

        // advance head, cap count
        head[asset] = (i + 1) % WINDOW;
        if (count[asset] < WINDOW) {
            count[asset]++;
        }
    }

    // ------------------------ write functions ------------------------

    /// @notice Batch update (same signature you already use)
    function updatePrices(
        string[] calldata assets,
        uint256[] calldata values,
        string calldata password
    ) external {
        _auth(password);
        require(assets.length == values.length, "Length mismatch");

        for (uint256 i = 0; i < assets.length; i++) {
            prices[assets[i]] = PriceData(values[i], block.timestamp);
            _pushToHistory(assets[i], values[i]);
            emit PriceUpdated(assets[i], values[i], block.timestamp);
        }
    }

    /// @notice Optional single-asset update (handy sometimes)
    function updatePrice(
        string calldata asset,
        uint256 value,
        string calldata password
    ) external {
        _auth(password);
        prices[asset] = PriceData(value, block.timestamp);
        _pushToHistory(asset, value);
        emit PriceUpdated(asset, value, block.timestamp);
    }

    // ------------------------ read functions (compatible) ------------------------

    /// @notice Latest price only (backward compatible with your existing reads)
    function getPrice(string calldata asset) external view returns (uint256) {
        return prices[asset].price;
    }

    /// @notice Latest price with timestamp (you already had this; kept as-is)
    function getPriceWithTimestamp(string calldata asset)
        external
        view
        returns (uint256, uint256)
    {
        PriceData memory data = prices[asset];
        return (data.price, data.timestamp);
    }

    // ------------------------ NEW: history getters ------------------------

    /// @notice Returns how many samples are available for `asset` (<= WINDOW)
    function getHistoryCount(string calldata asset) external view returns (uint8) {
        return count[asset];
    }

    /// @notice Returns the latest sample (same as getPriceWithTimestamp but from the ring buffer)
    function getLatestFromHistory(string calldata asset)
        external
        view
        returns (uint256 price, uint256 timestamp)
    {
        uint8 n = count[asset];
        require(n > 0, "No history");
        uint8 last = (head[asset] + WINDOW - 1) % WINDOW;
        PriceData memory p = history[asset][last];
        return (p.price, p.timestamp);
    }

    /// @notice Get the i-th sample back from the latest (0 = latest, 1 = previous, ...)
    function getHistoryAt(string calldata asset, uint8 iBack)
        external
        view
        returns (uint256 price, uint256 timestamp)
    {
        uint8 n = count[asset];
        require(n > 0, "No history");
        require(iBack < n, "Out of range");

        uint8 last = (head[asset] + WINDOW - 1) % WINDOW;
        // walk backwards iBack steps (mod WINDOW)
        uint8 idx = (last + WINDOW - (iBack % WINDOW)) % WINDOW;
        PriceData memory p = history[asset][idx];
        return (p.price, p.timestamp);
    }

    /// @notice Return the full history currently stored (ordered oldest -> newest)
    /// NOTE: returning arrays costs gas if called on-chain; best for off-chain calls.
    function getHistory(string calldata asset)
        external
        view
        returns (PriceData[] memory out)
    {
        uint8 n = count[asset];
        require(n > 0, "No history");

        out = new PriceData[](n);

        // oldest element is head - n (mod WINDOW)
        uint8 start = head[asset] >= n ? head[asset] - n : uint8(WINDOW + head[asset] - n);

        for (uint8 j = 0; j < n; j++) {
            out[j] = history[asset][(start + j) % WINDOW];
        }
    }
}
