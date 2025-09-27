import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

const PriceChart = () => {
  const [selectedMarket, setSelectedMarket] = useState("GOLD-USDC");
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
  return (
    <div>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">{selectedMarket}</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">
                ${currentMarketData.price.toLocaleString()}
              </span>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  currentMarketData.change >= 0
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {currentMarketData.change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {currentMarketData.change >= 0 ? "+" : ""}
                  {currentMarketData.change.toFixed(2)}
                </span>
                <span className="text-sm">
                  ({currentMarketData.changePercent >= 0 ? "+" : ""}
                  {currentMarketData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-400">Live</span>
          </div>
        </div>

        {/* Mock Chart Area */}
        <div className="h-64 bg-slate-900/50 rounded-lg flex items-center justify-center border border-slate-700">
          <div className="text-center">
            <Activity className="w-12 h-12 text-amber-400 mx-auto mb-2" />
            <p className="text-slate-400">Price Chart</p>
            <p className="text-xs text-slate-500">
              Real-time price data from Chainlink oracles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
