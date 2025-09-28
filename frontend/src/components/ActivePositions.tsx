"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Clock, Timer, RefreshCw } from "lucide-react";

const ActivePositions = () => {
  const [activePositions, setActivePositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === Contract addresses and ABI ===
  const futuresFactoryAddr = "0x77F5F7ab09d1339ce6c70b0e99Ecc0F6d299FF85";

  const futuresFactoryABI = [
    {
      inputs: [],
      name: "getAllFuturesContracts",
      outputs: [
        {
          internalType: "contract FuturesContract[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  // Individual futures contract ABI
  const futuresContractABI = [
    {
      inputs: [],
      name: "getPositionData",
      outputs: [
        { internalType: "string", name: "asset", type: "string" },
        { internalType: "bool", name: "isLong", type: "bool" },
        { internalType: "uint256", name: "entryPrice", type: "uint256" },
        { internalType: "uint256", name: "collateral", type: "uint256" },
        { internalType: "uint256", name: "expiry", type: "uint256" },
        { internalType: "bool", name: "isActive", type: "bool" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getCurrentPrice",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "closePosition",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  // === Initialize ethers ===
  const initializeEthers = async () => {
    if (!window.ethereum) throw new Error("MetaMask not found");

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();

    return { provider, signer };
  };

  // === Fetch active positions ===
  const fetchActivePositions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { provider } = await initializeEthers();
      const factoryContract = new ethers.Contract(
        futuresFactoryAddr,
        futuresFactoryABI,
        provider
      );

      const contractAddresses: string[] =
        await factoryContract.getAllFuturesContracts();

      const positions: any[] = [];

      for (const contractAddr of contractAddresses) {
        try {
          const futuresContract = new ethers.Contract(
            contractAddr,
            futuresContractABI,
            provider
          );

          const positionData = await futuresContract.getPositionData();
          const currentPrice = await futuresContract.getCurrentPrice();

          if (positionData.isActive) {
            const entryPrice = parseFloat(
              ethers.formatUnits(positionData.entryPrice, 18)
            );
            const currentPriceFormatted = parseFloat(
              ethers.formatUnits(currentPrice, 18)
            );
            const collateral = parseFloat(
              ethers.formatUnits(positionData.collateral, 18)
            );

            // P&L
            const priceDiff = positionData.isLong
              ? currentPriceFormatted - entryPrice
              : entryPrice - currentPriceFormatted;

            const pnl = (priceDiff / entryPrice) * collateral;
            const pnlPercent = (priceDiff / entryPrice) * 100;

            // Expiry
            const expiry = Number(positionData.expiry) * 1000;
            const now = Date.now();
            const timeRemaining = expiry - now;

            let expiryString = "Expired";
            if (timeRemaining > 0) {
              const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
              const minutes = Math.floor(
                (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
              );
              expiryString = `${hours}h ${minutes}m`;
            }

            positions.push({
              id: contractAddr,
              contractAddress: contractAddr,
              asset: positionData.asset || "UNKNOWN",
              position: positionData.isLong ? "long" : "short",
              entryPrice,
              currentPrice: currentPriceFormatted,
              collateral,
              pnl,
              pnlPercent,
              expiry: expiryString,
              status: timeRemaining > 0 ? "active" : "expired",
            });
          }
        } catch (contractError) {
          console.warn(
            `Error fetching data from ${contractAddr}`,
            contractError
          );
        }
      }

      setActivePositions(positions);
    } catch (err: any) {
      console.error("Error fetching positions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === Close position ===
  const closePosition = async (contractAddress: string) => {
    try {
      const { signer } = await initializeEthers();
      const futuresContract = new ethers.Contract(
        contractAddress,
        futuresContractABI,
        signer
      );

      const tx = await futuresContract.closePosition();
      await tx.wait();

      await fetchActivePositions();
    } catch (err: any) {
      console.error("Error closing position:", err);
      setError(`Error closing position: ${err.message}`);
    }
  };

  // === Effects ===
  useEffect(() => {
    fetchActivePositions();
    const interval = setInterval(fetchActivePositions, 30000);
    return () => clearInterval(interval);
  }, []);

  // === Render ===
  return (
    <div>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Active Positions
          </h3>
          <button
            onClick={fetchActivePositions}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {loading && activePositions.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p>Loading positions...</p>
            </div>
          )}

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
                  {position.status === "expired" && (
                    <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">
                      EXPIRED
                    </span>
                  )}
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
                    $
                    {position.entryPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Current</div>
                  <div className="text-white">
                    $
                    {position.currentPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Collateral</div>
                  <div className="text-white">
                    $
                    {position.collateral.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">P&L</div>
                  <div
                    className={`font-medium ${
                      position.pnl >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)} (
                    {position.pnlPercent >= 0 ? "+" : ""}
                    {position.pnlPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 mt-2">
                Contract: {position.contractAddress.slice(0, 6)}...
                {position.contractAddress.slice(-4)}
              </div>

              <button
                onClick={() => closePosition(position.contractAddress)}
                disabled={position.status === "expired"}
                className="w-full mt-3 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 rounded text-sm transition-colors"
              >
                {position.status === "expired"
                  ? "Position Expired"
                  : "Close Position"}
              </button>
            </div>
          ))}

          {!loading && activePositions.length === 0 && (
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
