import { defineChain } from 'viem';

// KUB Chain does not support EIP-1559; override fees to force legacy (type-0) transactions.
// When estimateFeesPerGas returns { gasPrice } (no maxFeePerGas), viem sends a type-0 tx.
const legacyFees = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async estimateFeesPerGas({ client }: any) {
    const gasPrice = await client.getGasPrice();
    return { gasPrice };
  },
};

export const kubChainTestnet = defineChain({
  id: 25925,
  name: 'Bitkub Chain Testnet',
  nativeCurrency: { decimals: 18, name: 'KUB', symbol: 'KUB' },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.bitkubchain.io'] },
  },
  blockExplorers: {
    default: { name: 'BKCScan Testnet', url: 'https://testnet.bkcscan.com' },
  },
  testnet: true,
  fees: legacyFees,
});

export const kubChainMainnet = defineChain({
  id: 96,
  name: 'Bitkub Chain',
  nativeCurrency: { decimals: 18, name: 'KUB', symbol: 'KUB' },
  rpcUrls: {
    default: { http: ['https://rpc.bitkubchain.io'] },
  },
  blockExplorers: {
    default: { name: 'BKCScan', url: 'https://www.bkcscan.com' },
  },
  fees: legacyFees,
});

export const activeChain =
  process.env.NEXT_PUBLIC_CHAIN === 'mainnet' ? kubChainMainnet : kubChainTestnet;
