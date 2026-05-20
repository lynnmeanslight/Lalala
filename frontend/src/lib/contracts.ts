// Contract addresses — set via .env.local after deployment
export const ESCROW_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`) ??
  '0x0000000000000000000000000000000000000000';

export const USDT_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}`) ??
  '0x0000000000000000000000000000000000000000';

// USDT uses 6 decimals on KUB Chain
export const USDT_DECIMALS = 6;

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
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// LalalaEscrow contract ABI
export const ESCROW_ABI = [
  // --- Write ---
  {
    name: 'createOrder',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'orderId', type: 'bytes32' },
      { name: 'seller',  type: 'address' },
      { name: 'amount',  type: 'uint256' },
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
  {
    name: 'autoRelease',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'orderId', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'resolveDispute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'orderId',     type: 'bytes32' },
      { name: 'refundBuyer', type: 'bool' },
    ],
    outputs: [],
  },
  // --- Read ---
  {
    name: 'getOrder',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'orderId', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'buyer',     type: 'address' },
          { name: 'seller',    type: 'address' },
          { name: 'amount',    type: 'uint256' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'status',    type: 'uint8'   },
        ],
      },
    ],
  },
  {
    name: 'autoReleaseAt',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'orderId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'FEE_BPS',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // --- Events ---
  {
    name: 'OrderCreated',
    type: 'event',
    inputs: [
      { name: 'orderId', type: 'bytes32', indexed: true },
      { name: 'buyer',   type: 'address', indexed: true },
      { name: 'seller',  type: 'address', indexed: true },
      { name: 'amount',  type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'OrderReleased',
    type: 'event',
    inputs: [
      { name: 'orderId',      type: 'bytes32', indexed: true },
      { name: 'sellerAmount', type: 'uint256', indexed: false },
      { name: 'fee',          type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'OrderDisputed',
    type: 'event',
    inputs: [
      { name: 'orderId', type: 'bytes32', indexed: true },
      { name: 'buyer',   type: 'address', indexed: true },
    ],
  },
  {
    name: 'OrderRefunded',
    type: 'event',
    inputs: [{ name: 'orderId', type: 'bytes32', indexed: true }],
  },
] as const;

// Enum mirror of contract Status
export const OrderStatusEnum = {
  None:     0,
  Pending:  1,
  Disputed: 2,
  Released: 3,
  Refunded: 4,
} as const;
