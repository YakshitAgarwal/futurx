import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
console.log("Loaded PK:", process.env.PRIVATE_KEY);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ABIs (minimal)
import fs from "fs";

const escrowAbi = JSON.parse(
  fs.readFileSync("../contract/out/FuturesEscrowNative.sol/FuturesEscrowNative.json")
).abi;

const oracleAbi = JSON.parse(
  fs.readFileSync("../contract/out/MockOracle.sol/MockOracle.json")
).abi;


const escrow = new ethers.Contract(process.env.ESCROW_ADDRESS, escrowAbi, wallet);
const oracle = new ethers.Contract(process.env.ORACLE_ADDRESS, oracleAbi, wallet);

async function main() {
  // 1. Read gold price (entry price)
  const [, price] = await oracle.latestRoundData();
  console.log("Gold price:", Number(price) / 1e8, "USD");

  // 2. Define notional = $1
  const notional = 1e8; // $1 with 8 decimals

  // 3. Expiry = 1 day
  const expiry = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  // 4. Both parties margin in cBTC (say 0.00001 each)
  const marginTotal = ethers.parseUnits("0.00002", 18); // 2x 0.00001

  // 5. Call matchAndEscrow
  const tx = await escrow.matchAndEscrow(
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",  // taker address
    0,                     // Side.LONG (maker is long)
    notional,
    expiry,
    price,
    { value: marginTotal }
  );
  await tx.wait();
  console.log("Future opened for $1 notional GOLD");
}

main().catch(console.error);
