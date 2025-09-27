import { ethers } from "ethers";
import { abi as escrowAbi } from "./out/FuturesEscrow.sol/FuturesEscrow.json";

const provider = new ethers.JsonRpcProvider("https://rpc.testnet.citrea.xyz");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowAbi, wallet);

async function run() {
  const total = await escrow.nextId();
  for (let id = 1; id <= total; id++) {
    const pos = await escrow.positions(id);
    if (pos.status === 1 && pos.expiry <= Date.now() / 1000) {
      const tx = await escrow.settle(id);
      console.log(`Settled ${id}: ${tx.hash}`);
      await tx.wait();
    }
  }
}

setInterval(run, 60_000); // every minute
