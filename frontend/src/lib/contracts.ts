// Contract addresses — set via .env.local after deployment
export const ESCROW_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`) ??
  '0x0000000000000000000000000000000000000000';

export const USDT_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}`) ??
  '0x0000000000000000000000000000000000000000';

// Minimal ERC-20 ABI (approve + balanceOf)
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// Escrow contract ABI — update after smart contract is deployed
export const ESCROW_ABI = [
  {
    name: 'createOrder',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'orderId', type: 'bytes32' },
      { name: 'seller', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'confirmDelivery',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'orderId', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'raiseDispute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'orderId', type: 'bytes32' }],
    outputs: [],
  },
] as const;
