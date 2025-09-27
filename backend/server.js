const { ethers } = require("ethers");
const axios = require("axios");
require("dotenv").config();

// RPC for Citrea testnet
const provider = new ethers.JsonRpcProvider("https://rpc.testnet.citrea.xyz");
//const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");


// Your server wallet private key
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Oracle contract address + ABI
const oracleAddress = "0x9a425C4A33CfDf635E975D078E71C5E31b300c48";// fixed typo: ADRESS → ADDRESS
const oracleABI = [
  "function updatePrices(string[] assets, uint256[] values, string password) external",
];



const oracle = new ethers.Contract(oracleAddress, oracleABI, wallet);

// Load password from .env
const PASSWORD = process.env.PASSWORD;

// Fetch prices from APIs
async function fetchPrices() {
  const btc = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
  );

  const xau = await axios.get("https://www.goldapi.io/api/XAU/USD", {
    headers: { "x-access-token": process.env.GOLD_API_KEY },
  });

  return {
    BTC: btc.data.bitcoin.usd,
    XAU: xau.data.price,
  };
}

// Push prices to oracle
async function updateOracle() {
  try {
    const prices = await fetchPrices();
    console.log("Fetched:", prices);

    // Build arrays for batch update
    const assets = Object.keys(prices);
    const values = Object.values(prices).map(p =>
      ethers.parseUnits(p.toString(), 8)
    );

    // Send single tx for all prices
    const tx = await oracle.updatePrices(assets, values, PASSWORD);
    await tx.wait();

    console.log("✅ Batch updated prices:", prices);
  } catch (err) {
    console.error("❌ Error updating oracle:", err);
  }
}


// Run every minute
setInterval(updateOracle, 15 * 1000);
