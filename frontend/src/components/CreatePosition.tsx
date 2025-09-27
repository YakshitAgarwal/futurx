import { useState } from "react";
import { TrendingDown, TrendingUp, Zap, DollarSign } from "lucide-react";

const CreatePosition = () => {
  const [selectedMarket, setSelectedMarket] = useState("GOLD-USDC");
  const [selectedPosition, setSelectedPosition] = useState("long");
  const [collateralAmount, setCollateralAmount] = useState("1000");
  const [duration, setDuration] = useState("1m");

  const [marketData, setMarketData] = useState({
    "GOLD-USDC": {
      price: 1950.25,
      change: 12.45,
      changePercent: 0.64,
      volume: "2.4M",
    },
    "BTC-USDC": {
      price: 43250.8,
      change: -890.2,
      changePercent: -2.02,
      volume: "12.8M",
    },
  });

  const currentMarketData = marketData[selectedMarket];

  const handleCreatePosition = () => {
    // This would integrate with smart contracts
    console.log("Creating position:", {
      market: selectedMarket,
      position: selectedPosition,
      collateral: collateralAmount,
      duration,
    });
  };
  return (
    <div>
      {/* Create Position */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Create Position
        </h3>

        <div className="space-y-4">
          {/* Position Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedPosition("long")}
                className={`py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  selectedPosition === "long"
                    ? "bg-green-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Long
              </button>
              <button
                onClick={() => setSelectedPosition("short")}
                className={`py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  selectedPosition === "short"
                    ? "bg-red-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Short
              </button>
            </div>
          </div>

          {/* Collateral Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Collateral (USDC)
            </label>
            <div className="relative">
              <input
                type="number"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                placeholder="Enter amount"
              />
              <div className="absolute right-3 top-3 text-slate-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              {["500", "1000", "2500", "5000"].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCollateralAmount(amount)}
                  className="px-3 py-1 text-xs bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                >
                  ${amount}
                </button>
              ))}
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
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="1m">1 Minute</option>
              <option value="1h">1 Hour</option>
              <option value="1d">1 Day</option>
            </select>
          </div>

          {/* Position Summary */}
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
                <span className="text-slate-400">Position Size</span>
                <span className="text-white">${collateralAmount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Profit/Loss</span>
                <span className="text-white">±${collateralAmount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement</span>
                <span className="text-white">Oracle-based</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreatePosition}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Create {selectedPosition.toUpperCase()} Position
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePosition;
