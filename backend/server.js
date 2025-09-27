import { ethers } from "ethers";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// RPC for Citrea testnet
//const provider = new ethers.JsonRpcProvider("https://rpc.testnet.citrea.xyz");
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");


// Your server wallet private key
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Oracle contract address + ABI
const oracleAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";// fixed typo: ADRESS → ADDRESS
const oracleABI = [
  "function updatePrices(string[] assets, uint256[] values, string password) external",
  "function getHistoryCount(string asset) external view returns (uint8)"
];




const oracle = new ethers.Contract(oracleAddress, oracleABI, wallet);

// Load password from .env
const PASSWORD = process.env.PASSWORD;

// Fetch prices from APIs
async function fetchPrices() {
  const btc = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
  );

  const xauResp = await axios.get(
  `https://api.metalpriceapi.com/v1/latest?api_key=${process.env.GOLD_API_KEY}&base=XAU&currencies=USD`
);

const xau = xauResp.data.rates?.USD ?? 3600;


  return {
    BTC: btc.data.bitcoin.usd,
    XAU: xau,
  };
}

// Push prices to oracle
async function updateOracle() {
  try {
    const prices = await fetchPrices();
    console.log("Fetched:", prices);

    // Round to 8 decimals max before parsing
    //
    const assets = Object.keys(prices);
    const values = Object.values(prices).map(
      p => ethers.parseUnits((p ?? 3600).toFixed(8), 8)
    );


    const tx = await oracle.updatePrices(assets, values, PASSWORD);
    await tx.wait();

    for (const a of assets) {
      const count = await oracle.getHistoryCount(a);
      console.log(`History count for ${a}:`, count.toString());
    }

    console.log("✅ Batch updated prices:", prices);
  } catch (err) {
    console.error("❌ Error updating oracle:", err);
  }
}


// Run every minute
setInterval(updateOracle, 15 * 1000);
