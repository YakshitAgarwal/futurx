"use client";
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  Zap,
} from "lucide-react";

const Trading = () => {
  const [selectedMarket, setSelectedMarket] = useState("GOLD-USDC");
  const [selectedPosition, setSelectedPosition] = useState("long");
  const [collateralAmount, setCollateralAmount] = useState("1000");
  const [duration, setDuration] = useState("24h");

  // Mock price data with real-time updates
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

  // Active positions mock data
  const [activePositions] = useState([
    {
      id: 1,
      asset: "GOLD-USDC",
      position: "long",
      entryPrice: 1940.5,
      currentPrice: 1950.25,
      collateral: 1500,
      pnl: 15.08,
      pnlPercent: 1.01,
      expiry: "2h 34m",
      status: "active",
    },
    {
      id: 2,
      asset: "BTC-USDC",
      position: "short",
      entryPrice: 44200.0,
      currentPrice: 43250.8,
      collateral: 2000,
      pnl: 85.6,
      pnlPercent: 4.28,
      expiry: "14h 22m",
      status: "active",
    },
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData((prev) => {
        const newData = { ...prev };
        Object.keys(newData).forEach((market) => {
          const change =
            (Math.random() - 0.5) * (market.includes("BTC") ? 100 : 5);
          const newPrice = Math.max(0, newData[market].price + change);
          const oldPrice = newData[market].price;
          newData[market].price = newPrice;
          newData[market].change = newPrice - oldPrice;
          newData[market].changePercent =
            ((newPrice - oldPrice) / oldPrice) * 100;
        });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FuturX</span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all duration-200">
              My Portfolio
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-all duration-200">
              Orders
            </button>
            <button className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200">
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      <main className="py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Markets Sidebar */}
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

          {/* Main Trading Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Price Chart Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedMarket}
                  </h2>
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

            {/* Trading Panel & Active Positions */}
            <div className="grid md:grid-cols-2 gap-6">
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
                        <span className="text-white">
                          ${collateralAmount} USDC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Max Profit/Loss</span>
                        <span className="text-white">
                          ±${collateralAmount} USDC
                        </span>
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

              {/* Active Positions */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Active Positions
                </h3>

                <div className="space-y-3">
                  {activePositions.map((position) => (
                    <div
                      key={position.id}
                      className="bg-slate-700/50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {position.asset}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              position.position === "long"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {position.position.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Timer className="w-3 h-3" />
                          {position.expiry}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400">Entry</div>
                          <div className="text-white">
                            ${position.entryPrice.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Current</div>
                          <div className="text-white">
                            ${position.currentPrice.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Collateral</div>
                          <div className="text-white">
                            ${position.collateral}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">P&L</div>
                          <div
                            className={`font-medium ${
                              position.pnl >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {position.pnl >= 0 ? "+" : ""}${position.pnl} (
                            {position.pnlPercent >= 0 ? "+" : ""}
                            {position.pnlPercent}%)
                          </div>
                        </div>
                      </div>

                      <button className="w-full mt-3 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded text-sm transition-colors">
                        Close Position
                      </button>
                    </div>
                  ))}

                  {activePositions.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No active positions</p>
                      <p className="text-xs">
                        Create your first position to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Trading;
