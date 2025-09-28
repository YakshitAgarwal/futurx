FuturX – Decentralized Futures Trading Platform for RWAs

FuturX is a decentralized application (dApp) that enables trustless futures trading on the Citrea testnet using smart contracts, custom oracles, and a modern web interface. It demonstrates how futures markets can be built without centralized intermediaries while ensuring transparency, price reliability, and automated settlement.

🚀 Problem Statement

Traditional futures trading suffers from several issues:

- ❌ Centralized risk: Traders rely on intermediaries (brokers/exchanges) who can manipulate prices or halt withdrawals.

- ❌ Opaque settlement: Traders cannot verify price feeds or settlement logic.

- ❌ Limited access: Futures markets are usually restricted to certain regions or accredited participants.

💡 Solution: How FuturX Works

FuturX solves these problems by combining smart contracts, custom oracles, and a decentralized frontend:

1. Smart Contracts (Solidity, Foundry)

- FuturesContract.sol: Manages creation, matching, and settlement of futures positions.

- FuturesFactory.sol: Deploys and tracks futures contracts.

- Oracle.sol: On-chain price oracle updated by a trusted backend server.

2. Custom Oracle (Backend with Node.js + ethers.js)

- Fetches BTC/USD from CoinGecko and Gold (XAU/USD) from MetalPrice API.

- Pushes fresh prices on-chain every 15 seconds.

- Maintains historical price data to compute volatility-aware margins.

3. Trading Flow

- A seller opens a futures position by locking margin.

- A buyer matches the position by locking equivalent margin.

- At expiry, the contract uses the oracle price feed to automatically settle PnL between parties.

4. Frontend (Next.js + Tailwind)

- Interactive UI for traders to create and manage positions.

- Real-time price charts for BTC and Gold.

- Wallet connection and position tracking.

🛠️ Tech Stack

- Smart Contracts: Solidity, Foundry, Anvil, Remix

- Backend Oracle: Node.js, Ethers.js, Axios

- Frontend: Next.js, React, TailwindCSS, Chart.js

- Blockchain: Citrea Testnet

📂 Project Structure

yakshitagarwal-futurx/
├── backend/ # Oracle server + test scripts
│ ├── server.js # Fetches BTC & XAU prices, updates oracle
│ ├── priceCheck.js # Reads oracle prices for verification
│ ├── futureTest.js # Simulates futures trading flow
│ └── package.json
├── contract/ # Solidity contracts (Foundry)
│ ├── src/ # Futures + Oracle contracts
│ ├── script/ # Deployment scripts
│ ├── test/ # Unit tests
│ └── foundry.toml
├── frontend/ # Next.js frontend
│ ├── src/app/ # Pages and APIs
│ ├── components/ # UI components (charts, wallet, positions)
│ └── package.json

⚡ Getting Started

1️⃣ Clone the Repository

git clone https://github.com/yakshitagarwal/futurx.git
cd futurx

2️⃣ Smart Contracts (Foundry)
Make sure you have Foundry installed.

cd contract
forge build # Compile contracts
forge test # Run tests
anvil # Start local blockchain

3️⃣ Backend (Oracle Server)
Set up environment variables in a .env file:

PRIVATE_KEY=your_private_key
PASSWORD=your_oracle_password (password is Future)
GOLD_API_KEY=your_metalpriceapi_key
ORACLE_ADDRESS=deployed_oracle_contract_address

Install dependencies and run server:

cd backend
npm install
npm run start # runs server.js to push prices

Optional: run price checker

node priceCheck.js

4️⃣ Frontend (Next.js UI)

cd frontend
npm install
npm run dev

Now visit: http://localhost:3000

🔑 Key Features

- ✅ Custom on-chain oracle (BTC/USD & XAU/USD)

- ✅ Volatility-based margin calculation (EWMA)

- ✅ Trustless position creation, matching, and settlement

- ✅ Historical price storage for analysis

- ✅ Interactive charts and real-time price display

🔮 Future Improvements

- Multi-asset futures (ETH, commodities, indices)

- Perpetual contracts with funding rate

- Decentralized oracle network (instead of single updater)

- Cross-chain trading with LayerZero or similar bridges

📜 License

This project is licensed under the MIT License.
