import { useState } from "react";
import { BarChart3, Activity } from "lucide-react";

const MarketSidebar = () => {
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
  return (
    <div>
      <div className="lg:col-span-1">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Markets
          </h3>
          <div className="space-y-3">
            {Object.entries(marketData).map(([market, data]) => (
              <div
                key={market}
                onClick={() => setSelectedMarket(market)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedMarket === market
                    ? "bg-amber-500/20 border border-amber-500/50"
                    : "bg-slate-700/50 hover:bg-slate-700 border border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        data.change >= 0 ? "bg-green-400" : "bg-red-400"
                      }`}
                    ></div>
                    <span className="font-medium text-white text-sm">
                      {market}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      data.change >= 0
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {data.change >= 0 ? "+" : ""}
                    {data.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-200 text-base font-semibold">
                    ${data.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">
                    Vol: {data.volume}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    24h Change:{" "}
                    <span
                      className={
                        data.change >= 0 ? "text-green-400" : "text-red-400"
                      }
                    >
                      {data.change >= 0 ? "+" : ""}$
                      {Math.abs(data.change).toFixed(2)}
                    </span>
                  </span>
                  <div className="w-12 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        data.change >= 0 ? "bg-green-400" : "bg-red-400"
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.abs(data.changePercent) * 10,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Market Stats */}
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              24h Stats
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Volume</span>
                <span className="text-white font-medium">$24.1M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Positions</span>
                <span className="text-white font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TVL</span>
                <span className="text-white font-medium">$2.4B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg. Position Size</span>
                <span className="text-white font-medium">$1,950</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Success Rate</span>
                <span className="text-green-400 font-medium">67.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MarketSidebar;
