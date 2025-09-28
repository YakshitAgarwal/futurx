import { ethers, NonceManager } from "ethers";

/*
File used to simulate a possible transaction flow for purchasing a long future worth 0.01 BTC
*/


const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const seller = new NonceManager(new ethers.Wallet(
  "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e", provider));
const buyer  = new NonceManager(new ethers.Wallet(
  "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97", provider));

const ORACLE_ADDR  = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const FUTURES_ADDR = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";

const FUTURES_ABI = [
  "function createPosition(uint8 asset,uint8 side,uint256 expiryTime,uint256 fraction,uint256 margin) payable",
  "function matchPosition(uint256 positionId) payable",
  "function settle(uint256 positionId)",
  "function getPosition(uint256 id) view returns (address,address,uint8,uint8,uint256,uint256,uint8,uint256,uint256)",
  "function positionCount() view returns (uint256)"
];


const ORACLE_ABI = [
  "function updatePrices(string[] assets, uint256[] values, string password) external",
  "function updatePrice(string asset, uint256 value, string password) external",

  "function getPrice(string asset) external view returns (uint256)",
  "function getPriceWithTimestamp(string asset) external view returns (uint256,uint256)",
  "function getHistoryCount(string asset) external view returns (uint8)",
  "function getLatestFromHistory(string asset) external view returns (uint256,uint256)",
  "function getHistoryAt(string asset,uint8 iBack) external view returns (uint256,uint256)",
  "function getHistory(string asset) external view returns (tuple(uint256 price,uint256 timestamp)[] memory)",

  "function WINDOW() external view returns (uint8)"
];

// 1. Prove this address has code
const futCode = await provider.getCode(FUTURES_ADDR);
console.log("futures bytecode length:", futCode.length);
if (futCode === "0x") throw new Error("No contract at FUTURES_ADDR");

// 2. Prove the ABI matches the contract by calling a VIEW you know exists
const future = new ethers.Contract(FUTURES_ADDR, FUTURES_ABI, provider);
try {
  const pc = await future.positionCount();
  console.log("positionCount()", pc.toString());
} catch (e) {
  console.error("positionCount() failed -> ABI/addr mismatch", e);
  throw e;
}


// ---------- EWMA / Margin Helpers ----------

// Convert array of bigint prices with 8 decimals -> JS numbers
function bnPricesToNumbers(pricesBN) {
  // Using Number is acceptable for typical USD prices; avoid for extremely large values.
  return pricesBN.map((p) => parseFloat(ethers.formatUnits(p, 8)));
}

// Compute log returns: r_t = ln(P_t / P_{t-1})
function logReturns(prices) {
  const r = [];
  for (let i = 1; i < prices.length; i++) {
    const pt = prices[i];
    const pt1 = prices[i - 1];
    if (pt > 0 && pt1 > 0) {
      r.push(Math.log(pt / pt1));
    }
  }
  return r;
}

/**
 * EWMA variance per RiskMetrics:
 *   sigma2_t = lambda * sigma2_{t-1} + (1 - lambda) * r_{t-1}^2
 * Returns { vol, var, count }
 * - vol is the square root of the last sigma2 (per-period volatility)
 * - lambda in [0,1), e.g., 0.94 for daily data
 */
function ewmaVolatility(returns, lambda = 0.94) {
  if (returns.length === 0) {
    return { vol: 0, var: 0, count: 0 };
  }
  let sigma2 = 0; // start from 0; you could also seed with sample variance
  for (let i = 0; i < returns.length; i++) {
    const r2 = returns[i] * returns[i];
    sigma2 = lambda * sigma2 + (1 - lambda) * r2;
  }
  return { vol: Math.sqrt(sigma2), var: sigma2, count: returns.length };
}

/**
 * Compute a volatility-based margin:
 *   margin = notional * clamp( k * vol, minBps, maxBps )
 * where vol is per-period EWMA vol (the same period as your history spacing).
 *
 * Arguments:
 * - notional (BigInt): same units as you’re already using (your sim treats USD*1e8 as "wei-like")
 * - vol (Number): per-period volatility (e.g., daily if your history is daily)
 * - opts: { k, minBps, maxBps }
 *
 * Note: We keep BigInt math for the final margin.
 */
function marginFromVol(notional, vol, opts = {}) {
  const {
    k = 3.0, // risk multiplier (~99.7% of normal if vol is per-period)
    minBps = 500n, // 5%
    maxBps = 2000n // 20%
  } = opts;

  // Convert vol to basis points via k*vol -> fraction, then clamp.
  // fraction_bps = round( k * vol * 10_000 )
  const fraction_bps_float = Math.round(k * vol * 10000);
  let fraction_bps = BigInt(fraction_bps_float);
  if (fraction_bps < minBps) fraction_bps = minBps;
  if (fraction_bps > maxBps) fraction_bps = maxBps;

  // margin = notional * bps / 10_000
  const margin = (notional * fraction_bps) / 10000n;
  return { margin, fraction_bps };
}

async function fetchHistoryUSD(asset, nPoints = 60) {
  const [prices] = await oracle.getHistory(asset);
  return bnPricesToNumbers(prices);
}




const oracle  = new ethers.Contract(ORACLE_ADDR, ORACLE_ABI, seller);
const futures = new ethers.Contract(FUTURES_ADDR, FUTURES_ABI, seller);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function main() {
  const sellerAddr = await seller.getAddress();
  const buyerAddr  = await buyer.getAddress();

  // 1) Params
  const expiry   = Math.floor(Date.now() / 1000) + 60;      // +1 minute
  const fraction = ethers.parseUnits("0.01", 18);           // 0.01 BTC
  const entry    = await oracle.getPrice("BTC");            // uint256, 8 decimals per your oracle
  const notional = (entry * fraction) / 10n**18n;
  // ---------- NEW: Volatility-aware margin ----------
  // Pull history (e.g., last 60 points) and compute EWMA
  let margin;
  let marginBpsUsed = 0n;

  try {
    const history = await fetchHistoryUSD("BTC", 60); // adjust window as you like
    if (history.length < 2) {
      // Fallback if not enough history
      const fallbackBps = 1000n; // 10%
      margin = (notional * fallbackBps) / 10000n;
      marginBpsUsed = fallbackBps;
      console.log(
        `⚠️ Not enough history (${history.length}); using fallback margin = ${fallbackBps} bps`
      );
    } else {
      const rets = logReturns(history);
      const { vol, count } = ewmaVolatility(rets, 0.94); // RiskMetrics lambda
      // If your points are per-minute, this is per-minute vol.
      // For a 1-min expiry demo, per-minute is fine. For longer horizons,
      // scale vol by sqrt(horizon_in_periods).

      const { margin: m, fraction_bps } = marginFromVol(notional, vol, {
        k: 3.0, // multiplier
        minBps: 500n,
        maxBps: 2000n
      });
      margin = m;
      marginBpsUsed = fraction_bps;

      console.log(
        `📈 EWMA vol computed on ${count} returns. vol=${vol.toFixed(
          6
        )}, margin=${fraction_bps.toString()} bps`
      );
    }
  } catch (e) {
    // If oracle history call fails, fallback to fixed margin (10%)
    const fallbackBps = 1000n;
    margin = (notional * 0.1) / 10000n;
    marginBpsUsed = fallbackBps;
    console.log(
      `⚠️ History fetch failed; using fallback margin = ${fallbackBps} bps`,
      e?.message ?? e
    );
  }


console.log("oracle BTC price:", (await oracle.getPrice("BTC")).toString());

console.log("expiry:", expiry, "fraction:", fraction.toString(), "margin:", margin.toString());

    const tx1 = await futures.connect(seller).createPosition(
  1,
  0,
  expiry,
  fraction,
  margin,
  { value: margin, gasLimit: 5_000_000n }
);
await tx1.wait();



  const id = (await futures.positionCount()) - 1n;

  // 3) Verify OPEN
  const p1 = await futures.getPosition(id);
  console.log("After create -> buyer:", p1[1], "status:", p1[6].toString()); // expect 0=OPEN, buyer=0x0

  // 4) Match from buyer
  const tx2 = await futures.connect(buyer).matchPosition(id, { value: margin });
  await tx2.wait();

  const p2 = await futures.getPosition(id);
  console.log("After match  -> buyer:", p2[1], "status:", p2[6].toString()); // expect buyer=buyerAddr, status=1

  
  // 6) Settle
  const balSB = await provider.getBalance(sellerAddr);
  const balBB = await provider.getBalance(buyerAddr);

  const waitMs = (expiry - Math.floor(Date.now() / 1000) + 1) * 1000;
  console.log(`\n⏳ Waiting ${waitMs / 1000}s for expiry...`);
  await sleep(waitMs);

  const tx3 = await futures.connect(seller).settle(id);
  await tx3.wait();
  console.log("✅ Position settled");
  const balSA = await provider.getBalance(sellerAddr);
  const balBA = await provider.getBalance(buyerAddr);

  console.log("Seller balance Δ:", ethers.formatEther(balSA - balSB));
  console.log("Buyer  balance Δ:", ethers.formatEther(balBA - balBB));
}

main().catch(console.error);
