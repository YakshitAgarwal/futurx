import { useState, useEffect } from "react";
import { ethers } from "ethers"; // ✅ Proper import
import {
  TrendingDown,
  TrendingUp,
  Zap,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";

const CreatePosition = ({ onPositionCreated }) => {
  const [selectedPosition, setSelectedPosition] = useState("long");
  const [collateralAmount, setCollateralAmount] = useState("1"); // ETH
  const [duration, setDuration] = useState("1m");
  const [selectedAsset, setSelectedAsset] = useState("gold");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  // Market data (static for now, could fetch from oracle)
  const [marketData] = useState({
    gold: {
      price: 1950.25,
      change: 12.45,
      changePercent: 0.64,
      volume: "2.4M",
      symbol: "GOLD-USDC",
    },
    btc: {
      price: 43250.8,
      change: -890.2,
      changePercent: -2.02,
      volume: "12.8M",
      symbol: "BTC-USDC",
    },
  });

  const currentMarketData = marketData[selectedAsset];

  // Smart contract config
  const futuresContractAddr = "0x68a2b20Fc8DBF3e24593Dfb8Cce571E8cB5DeACF";
  const futuresContractABI = [
    {
      inputs: [
        {
          internalType: "enum FuturesContract.Asset",
          name: "_asset",
          type: "uint8",
        },
        {
          internalType: "enum FuturesContract.Side",
          name: "_side",
          type: "uint8",
        },
        { internalType: "uint256", name: "_expiryTime", type: "uint256" },
        { internalType: "uint256", name: "_fraction", type: "uint256" },
        { internalType: "uint256", name: "_margin", type: "uint256" },
      ],
      name: "createPosition",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "positionId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "seller",
          type: "address",
        },
        {
          indexed: false,
          internalType: "enum FuturesContract.Asset",
          name: "asset",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "enum FuturesContract.Side",
          name: "side",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "expiryTime",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "quantity",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "margin",
          type: "uint256",
        },
      ],
      name: "PositionCreated",
      type: "event",
    },
  ];

  // Asset and side mappings
  const ASSET_ENUM = { gold: 0, btc: 1 };
  const SIDE_ENUM = { long: 0, short: 1 };

  // Durations
  const DURATION_MAPPING = {
    "1m": 60,
    "1h": 3600,
    "1d": 86400,
  };

  // Initialize ethers
  const initializeEthers = async () => {
    if (!window.ethereum) throw new Error("MetaMask not found. Install it.");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
  };

  // Wallet connection check
  useEffect(() => {
    const checkWallet = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          setWalletConnected(accounts.length > 0);
        }
      } catch (err) {
        console.error("Wallet check failed:", err);
      }
    };
    checkWallet();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletConnected(accounts.length > 0);
      });
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      setError(null);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletConnected(true);
    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
    }
  };

  const handleCreatePosition = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const collateral = parseFloat(collateralAmount);
      if (isNaN(collateral) || collateral <= 0) {
        throw new Error("Enter a valid collateral amount");
      }

      const { signer } = await initializeEthers();
      const futuresContract = new ethers.Contract(
        futuresContractAddr,
        futuresContractABI,
        signer
      );

      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = currentTime + DURATION_MAPPING[duration];
      const collateralWei = ethers.utils.parseUnits(collateralAmount, 18);
      const fraction = ethers.utils.parseUnits("1", 18); // leverage 1x
      const assetEnum = ASSET_ENUM[selectedAsset];
      const sideEnum = SIDE_ENUM[selectedPosition];

      console.log("Params:", {
        assetEnum,
        sideEnum,
        expiryTime,
        fraction,
        collateralWei,
      });

      const tx = await futuresContract.createPosition(
        assetEnum,
        sideEnum,
        expiryTime,
        fraction,
        collateralWei,
        { value: collateralWei }
      );

      const receipt = await tx.wait();
      let positionId = null;

      for (const log of receipt.logs) {
        try {
          const parsedLog = futuresContract.interface.parseLog(log);
          if (parsedLog?.name === "PositionCreated") {
            positionId = parsedLog.args.positionId.toString();
            break;
          }
        } catch {}
      }

      setSuccess(`Position created! ${positionId ? `ID: ${positionId}` : ""}`);

      setCollateralAmount("1");
      setDuration("1m");

      if (onPositionCreated) {
        onPositionCreated({
          positionId,
          asset: selectedAsset,
          side: selectedPosition,
          collateral,
          duration,
          txHash: tx.hash,
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to create position");
    } finally {
      setIsLoading(false);
    }
  };

  // Metrics
  const calculateMetrics = () => {
    const collateral = parseFloat(collateralAmount) || 0;
    const leverage = 1;
    return { leverage, maxProfitLoss: collateral * leverage };
  };
  const metrics = calculateMetrics();

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-400" /> Create Position
      </h3>

      {!walletConnected && (
        <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Wallet Not Connected</span>
          </div>
          <p className="text-sm text-amber-300 mb-3">
            Please connect your wallet to create positions.
          </p>
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {/* Asset */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Asset
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["gold", "btc"].map((asset) => (
              <button
                key={asset}
                onClick={() => setSelectedAsset(asset)}
                className={`py-3 rounded-lg font-medium flex items-center justify-center ${
                  selectedAsset === asset
                    ? asset === "gold"
                      ? "bg-amber-500 text-white"
                      : "bg-orange-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {asset.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedPosition("long")}
              className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                selectedPosition === "long"
                  ? "bg-green-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Long
            </button>
            <button
              onClick={() => setSelectedPosition("short")}
              className={`py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                selectedPosition === "short"
                  ? "bg-red-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <TrendingDown className="w-4 h-4" /> Short
            </button>
          </div>
        </div>

        {/* Collateral */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Collateral (USDC)
          </label>
          <div className="relative">
            <input
              type="number"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none"
              placeholder="Enter amount"
              min="0"
              step="0.001"
            />
            <div className="absolute right-3 top-3 text-slate-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none"
          >
            <option value="1m">1 Minute</option>
            <option value="1h">1 Hour</option>
            <option value="1d">1 Day</option>
          </select>
        </div>

        {/* Market info */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="flex justify-between">
            <span className="text-slate-300 font-medium">
              {currentMarketData.symbol}
            </span>
            <div className="text-right">
              <div className="text-white font-semibold">
                ${currentMarketData.price.toLocaleString()}
              </div>
              <div
                className={`text-sm ${
                  currentMarketData.change >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {currentMarketData.change >= 0 ? "+" : ""}
                {currentMarketData.change} ({currentMarketData.changePercent}%)
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-white">Position Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Entry Price</span>
              <span className="text-white">
                ${currentMarketData.price.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Collateral</span>
              <span className="text-white">{collateralAmount} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Max Profit/Loss</span>
              <span className="text-white">
                ±{metrics.maxProfitLoss.toFixed(4)} ETH
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Settlement</span>
              <span className="text-white">Oracle-based</span>
            </div>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={handleCreatePosition}
          disabled={isLoading || !walletConnected}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
            isLoading || !walletConnected
              ? "bg-slate-600 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg hover:scale-105"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating...
            </>
          ) : (
            `Create ${selectedPosition.toUpperCase()} Position`
          )}
        </button>
      </div>
    </div>
  );
};

export default CreatePosition;
