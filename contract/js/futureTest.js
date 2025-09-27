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

// provide expiry in days
const create_future = async (expiry) => {
  const [, price] = await oracle.latestRoundData();
  // 2. Define notional = $1
  const notional = 1e8; // $1 with 8 decimals

  const expiry_time = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  // TODO add proper margin calculation
  const marginTotal = ethers.parseUnits("0.00002", 18); // 2x 0.00001

  return {
    notional : notional,
    expiry : expiry_time,
    margin : marginTotal,
  }
}

async function main() {
  // 1. Read gold price (entry price)
  const [, price] = await oracle.latestRoundData();
  console.log("Gold price:", Number(price) / 1e8, "USD");

  // expiry in days
  const {notional, expiry, margin} = await create_future(1);



  // 5. Call matchAndEscrow
  // TODO implement limit order protocol
  const tx = await escrow.matchAndEscrow(
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",  // taker address
    0,                     // Side.LONG (maker is long)
    notional,
    expiry,
    price,
    { value: margin }
  );
  await tx.wait();
  console.log("Future opened for $1 notional GOLD");
}

main().catch(console.error);
