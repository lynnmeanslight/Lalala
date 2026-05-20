import { defineChain } from 'viem';

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
});

export const activeChain =
  process.env.NEXT_PUBLIC_CHAIN === 'mainnet' ? kubChainMainnet : kubChainTestnet;
