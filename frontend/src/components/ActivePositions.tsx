import { useState } from "react";
import { Clock, Timer } from "lucide-react";

const ActivePositions = () => {
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
  return (
    <div>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Active Positions
        </h3>

        <div className="space-y-3">
          {activePositions.map((position) => (
            <div key={position.id} className="bg-slate-700/50 rounded-lg p-4">
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
                  <div className="text-white">${position.collateral}</div>
                </div>
                <div>
                  <div className="text-slate-400">P&L</div>
                  <div
                    className={`font-medium ${
                      position.pnl >= 0 ? "text-green-400" : "text-red-400"
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
  );
};

export default ActivePositions;
