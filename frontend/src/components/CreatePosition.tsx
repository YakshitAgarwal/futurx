import { useState } from "react";
import { TrendingDown, TrendingUp, Zap, DollarSign } from "lucide-react";
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
// https://rpc.testnet.citrea.xyz

declare global {
  interface Window {
    ethereum?: any;
  }
}

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
      const ORACLE_ADDR = "0x955669F8BccdAEEb6DFA1E2b2a08172fA27114fe";
    const FUTURES_ADDR = "0x68a2b20Fc8DBF3e24593Dfb8Cce571E8cB5DeACF";
    const FUTURE_ABI = [
	{
		"inputs": [
			{
				"internalType": "enum FuturesContract.Asset",
				"name": "_asset",
				"type": "uint8"
			},
			{
				"internalType": "enum FuturesContract.Side",
				"name": "_side",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "_expiryTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_fraction",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_margin",
				"type": "uint256"
			}
		],
		"name": "createPosition",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_positionId",
				"type": "uint256"
			}
		],
		"name": "matchPosition",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "oracleAddr",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "positionId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "enum FuturesContract.Asset",
				"name": "asset",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "enum FuturesContract.Side",
				"name": "side",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "expiryTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "quantity",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "margin",
				"type": "uint256"
			}
		],
		"name": "PositionCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "positionId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "margin",
				"type": "uint256"
			}
		],
		"name": "PositionMatched",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "int256",
				"name": "pnlSeller",
				"type": "int256"
			},
			{
				"indexed": false,
				"internalType": "int256",
				"name": "pnlBuyer",
				"type": "int256"
			}
		],
		"name": "PositionSettled",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_positionId",
				"type": "uint256"
			}
		],
		"name": "settle",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getBuyer",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getPosition",
		"outputs": [
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"internalType": "enum FuturesContract.Asset",
				"name": "asset",
				"type": "uint8"
			},
			{
				"internalType": "enum FuturesContract.Side",
				"name": "side",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "priceBefore",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "expiryTime",
				"type": "uint256"
			},
			{
				"internalType": "enum FuturesContract.Status",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "margin",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "quantity",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getStatus",
		"outputs": [
			{
				"internalType": "enum FuturesContract.Status",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "oracle",
		"outputs": [
			{
				"internalType": "contract PasswordOracle",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "positionCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "positions",
		"outputs": [
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"internalType": "enum FuturesContract.Asset",
				"name": "asset",
				"type": "uint8"
			},
			{
				"internalType": "enum FuturesContract.Side",
				"name": "side",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "priceBefore",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "expiryTime",
				"type": "uint256"
			},
			{
				"internalType": "enum FuturesContract.Status",
				"name": "status",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "margin",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "quantity",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
    const ORACLE_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_password",
				"type": "string"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "asset",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "PriceUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "asset",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "password",
				"type": "string"
			}
		],
		"name": "updatePrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string[]",
				"name": "assets",
				"type": "string[]"
			},
			{
				"internalType": "uint256[]",
				"name": "values",
				"type": "uint256[]"
			},
			{
				"internalType": "string",
				"name": "password",
				"type": "string"
			}
		],
		"name": "updatePrices",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "asset",
				"type": "string"
			}
		],
		"name": "getHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct PasswordOracle.PriceData[]",
				"name": "out",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "asset",
				"type": "string"
			},
			{
				"internalType": "uint8",
				"name": "iBack",
				"type": "uint8"
			}
		],
		"name": "getHistoryAt",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "asset",
				"type": "string"
			}
		],
		"name": "getHistoryCount",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "asset",
				"type": "string"
			}
		],
		"name": "getLatestFromHistory",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "asset",
				"type": "string"
			}
		],
		"name": "getPrice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "asset",
				"type": "string"
			}
		],
		"name": "getPriceWithTimestamp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "passwordHash",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "WINDOW",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];



const handleCreatePosition = async (
  selectedMarket: string,
  selectedPosition: string,
  duration: string,
  collateralAmount: string,
  FUTURE_ABI: any[]
) => {
  try {
    if (!window.ethereum) {
      alert("No wallet detected. Please install MetaMask.");
      return;
    }

    // 1. Provider & Signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();

    // 2. Contract
    const futures = new ethers.Contract(FUTURES_ADDR, FUTURE_ABI, signer);

    // 3. Params
    const asset: number = selectedMarket === "BTC-USDC" ? 1 : 0; // Mapping nach deinem Contract-Enum
    const side: number = selectedPosition === "long" ? 0 : 1;   // 0 = Long, 1 = Short
    const now: number = Math.floor(Date.now() / 1000);
    let expiry: number;

    switch (duration) {
      case "1m":
        expiry = now + 60;
        break;
      case "1h":
        expiry = now + 3600;
        break;
      default:
        expiry = now + 86400; // 1 Tag
    }

    // Fraction (Menge) – hier als Dummy 1 Token
    const fraction = ethers.utils.parseUnits("1", 18);

    // Margin aus dem CollateralAmount
    const margin = ethers.utils.parseUnits(collateralAmount, 18);

    console.log("Creating position with:", {
      asset,
      side,
      expiry,
      fraction: fraction.toString(),
      margin: margin.toString(),
    });

    // 4. Contract Call
    const tx = await futures.createPosition(
      asset,
      side,
      expiry,
      fraction,
      margin,
      { value: margin }
    );

    console.log("⏳ Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Position created:", receipt);
    alert(`Position created! TX: ${tx.hash}`);
  } catch (err: any) {
    console.error("❌ Error creating position:", err);
    alert("Error: " + (err.message || err));
  }
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
