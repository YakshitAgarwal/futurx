const { ethers } = require("ethers");
const axios = require("axios");
require("dotenv").config();

// RPC for Citrea testnet
const provider = new ethers.JsonRpcProvider("https://rpc.testnet.citrea.xyz");
// anvil test adress
//const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");


// Your server wallet private key
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Oracle contract address + ABI
const oracleAddress = process.env.ORACLE_ADRESS;// fixed typo: ADRESS → ADDRESS
const oracleABI = [
  "function getPriceWithTimestamp(string asset) view returns (uint256 price, uint256 lastUpdated)",
];




const oracle = new ethers.Contract(oracleAddress, oracleABI, wallet);

async function inferOracle() {
  try {
    const [btcPrice, btcTime] = await oracle.getPriceWithTimestamp("BTC");
    const [xauPrice, xauTime] = await oracle.getPriceWithTimestamp("XAU");

    console.log("✅ BTC from oracle:", ethers.formatUnits(btcPrice, 8), "USD");
    console.log("   last updated:", new Date(Number(btcTime) * 1000).toISOString());

    console.log("✅ XAU from oracle:", ethers.formatUnits(xauPrice, 8), "USD");
    console.log("   last updated:", new Date(Number(xauTime) * 1000).toISOString());
  } catch (err) {
    console.error("❌ Error reading oracle:", err);
  }
}

// Run every minute
setInterval(inferOracle, 60 * 1000);