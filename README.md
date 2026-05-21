# Lalala

> Demo note: I did not upload the demo link in the submission form because the GCP deployment was still taking too long to finish. The live demo is available here: [Lalala demo](https://lalala-400859143635.asia-southeast1.run.app).

Lalala is a Thai marketplace prototype that uses a USDT escrow smart contract on KUB Chain to make checkout, seller payout, platform fees, and review eligibility more transparent. Buyers pay into escrow, sellers receive funds after delivery confirmation or auto-release, and the marketplace records listings, orders, and reviews through a Next.js application.

## KUB Chain Testnet Deployment

| Item | Value |
| --- | --- |
| Network | Bitkub Chain Testnet |
| Chain ID | `25925` |
| Native token | `KUB` |
| RPC URL | `https://rpc-testnet.bitkubchain.io` |
| Explorer | [BKCScan Testnet](https://testnet.bkcscan.com) |
| Lalala escrow contract | [`0x566f1DD43A88AeeeC342878827B293d2C9697801`](https://testnet.bkcscan.com/address/0x566f1DD43A88AeeeC342878827B293d2C9697801) |
| Demo USDT contract | [`0xb46aeBA6AacC9cFe5f4b01100Db4Ba261D57e05c`](https://testnet.bkcscan.com/address/0xb46aeBA6AacC9cFe5f4b01100Db4Ba261D57e05c) |

The frontend is configured for the KUB Chain testnet by default. Transaction links in the order view point to the testnet explorer unless `NEXT_PUBLIC_CHAIN=mainnet` is set.

## What It Does

- Lets sellers create product listings with images, stock, category, and THB-facing pricing backed by USDT values.
- Lets buyers connect a KUB Chain-compatible wallet through Privy and pay with USDT.
- Locks order funds in `LalalaEscrow` until the buyer confirms delivery or the auto-release period elapses.
- Deducts a fixed `1.5%` platform fee from released escrow funds.
- Supports buyer dispute flags and owner-managed dispute resolution in the smart contract.
- Stores listings, orders, and reviews in Firestore through Next.js API routes.
- Uses Google Cloud Storage for uploaded listing images.

## Demo Flow

1. A seller signs in, connects a wallet, and creates a listing.
2. A buyer opens the listing and pays with the demo USDT token on KUB Chain Testnet.
3. The frontend approves USDT and creates an escrow order on-chain.
4. The seller marks the order as shipped from the seller dashboard.
5. The buyer confirms delivery from the buyer dashboard.
6. The escrow contract releases funds to the seller minus the platform fee.
7. The completed order unlocks the review experience in the marketplace UI.

For hackathon/demo convenience, the deployed contract currently uses a `5 minutes` auto-release period. The product documents describe a `7 days` production target.

## Smart Contract

The Solidity contract lives in [`contracts/contracts/LalalaEscrow.sol`](contracts/contracts/LalalaEscrow.sol).

### Escrow behavior

- `createOrder` transfers approved USDT from the buyer into escrow.
- `confirmDelivery` can be called by the buyer for a pending order.
- `autoRelease` can be called by anyone after the timeout for a pending order.
- `raiseDispute` freezes a pending order in the disputed state.
- `resolveDispute` lets the contract owner refund the buyer or release funds to the seller.
- `FEE_BPS` is `150`, which represents a `1.5%` fee.

## Tech Stack

- Frontend and API: Next.js 16, React 19, TypeScript
- Wallet and chain integration: Privy, viem
- Smart contracts: Solidity, Hardhat, OpenZeppelin
- Data storage: Firebase Admin SDK and Firestore
- Image storage: Google Cloud Storage
- Chain: KUB Chain / Bitkub Chain testnet

## Repository Layout

```text
.
|-- contracts/                 # Hardhat project and Solidity tests
|   |-- contracts/             # LalalaEscrow and MockUSDT contracts
|   |-- scripts/deploy.ts      # Network deployment script
|   `-- test/                  # Escrow contract tests
|-- frontend/                  # Next.js marketplace application
|   |-- src/app/               # Pages and API routes
|   |-- src/components/        # Marketplace and escrow UI components
|   `-- src/lib/               # Chain, contract, store, and Firebase helpers
|-- FEATURES.md                # MVP feature scope
|-- PROJECT_OVERVIEW.md        # Product and market overview
|-- SCENARIO.md                # Hackathon scenario and pitch notes
`-- LICENSE
```

## Prerequisites

- Node.js and npm
- A KUB Chain-compatible wallet
- KUB testnet gas for contract transactions
- A Privy app ID for wallet/email login
- Firebase/Firestore credentials for marketplace data
- Google Cloud Storage access for image uploads

## Frontend Setup

1. Install dependencies.

   ```bash
   cd frontend
   npm install
   ```

2. Create `frontend/.env.local`.

   ```bash
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   NEXT_PUBLIC_CHAIN=testnet
   NEXT_PUBLIC_ESCROW_ADDRESS=0x566f1DD43A88AeeeC342878827B293d2C9697801
   NEXT_PUBLIC_USDT_ADDRESS=0xb46aeBA6AacC9cFe5f4b01100Db4Ba261D57e05c
   GCS_BUCKET=your_gcs_bucket_name
   GCS_SA_KEY_B64=base64_encoded_service_account_json
   ```

   `GCS_SA_KEY_B64` is used by the Firebase Admin initialization and can also authorize Google Cloud Storage uploads. The upload route can fall back to Google Application Default Credentials when available, but Firestore access in this code path expects the base64 service-account value.

3. Start the app.

   ```bash
   npm run dev
   ```

4. Open the local Next.js URL printed by the dev server.

## Contract Setup

1. Install contract dependencies.

   ```bash
   cd contracts
   npm install
   ```

2. Create `contracts/.env`.

   ```bash
   DEPLOYER_PRIVATE_KEY=your_private_key_without_0x_prefix
   FEE_RECIPIENT=0xYourFeeWalletAddress
   USDT_ADDRESS=0xUsdtTokenAddress
   ```

   When `USDT_ADDRESS` is omitted on local or testnet deployment, the deployment script creates `MockUSDT`. Mainnet deployment requires a USDT token address.

3. Compile and test.

   ```bash
   npm run compile
   npm test
   ```

4. Deploy to KUB Chain Testnet when needed.

   ```bash
   npm run deploy:testnet
   ```

The deploy script prints the `NEXT_PUBLIC_ESCROW_ADDRESS` and `NEXT_PUBLIC_USDT_ADDRESS` values to copy into the frontend environment after deployment.

## Available Scripts

### Frontend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the Next.js development server |
| `npm run build` | Build the production frontend |
| `npm run start` | Serve the production build |

### Contracts

| Command | Purpose |
| --- | --- |
| `npm run compile` | Compile Solidity contracts |
| `npm test` | Run the Hardhat escrow tests |
| `npm run node` | Start a local Hardhat node |
| `npm run deploy:local` | Deploy to the local Hardhat node |
| `npm run deploy:testnet` | Deploy to KUB Chain Testnet |
| `npm run deploy:mainnet` | Deploy to KUB Chain mainnet |

## Notes and Limitations

- This repository is a hackathon MVP, not a production marketplace.
- Testnet deployments use demo assets and should not be treated as mainnet payment infrastructure.
- The frontend and escrow contract cover the core escrow flow; broader ideas such as loyalty tokens, subscription tiers, community arbitration, courier integrations, and full admin tooling remain roadmap items.
- Never commit deployer private keys, service-account credentials, or production secrets.

## License

This project is licensed under the terms in [`LICENSE`](LICENSE).
