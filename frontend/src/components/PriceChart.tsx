import { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import GoldChart from "./GoldChart";
import BitcoinChart from "./BitcoinChart";

const PriceChart = ({
  selectedMarket,
  setSelectedMarket,
  marketData,
  setMarketData,
}) => {
  const currentMarketData = marketData[selectedMarket];
  return (
    <div>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">{selectedMarket}</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">
                ${currentMarketData.price}
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
        {/* <div>
          {selectedMarket == "GOLD-USDC" ? <GoldChart /> : <BitcoinChart />}
        </div> */}
      </div>
    </div>
  );
};

export default PriceChart;
