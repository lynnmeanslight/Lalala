/**
 * sendLegacyContractTx
 *
 * KUB Chain does NOT support EIP-1559 (type-2) transactions.
 * Privy's embedded wallet always signs as EIP-1559 when using walletClient.writeContract.
 * The workaround: call `eth_sendTransaction` on the raw EIP-1193 provider with ONLY
 * `gasPrice` (no maxFeePerGas / maxPriorityFeePerGas). This signals a legacy (type-0) tx.
 */
import { encodeFunctionData, toHex, createPublicClient, http } from 'viem';
import { activeChain } from './chain';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAbi = readonly any[];

export async function sendLegacyContractTx({
  provider,
  from,
  to,
  abi,
  functionName,
  args = [],
  gas,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  from: string;
  to: `0x${string}`;
  abi: AnyAbi;
  functionName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[];
  gas: bigint;
}): Promise<`0x${string}`> {
  const publicClient = createPublicClient({
    chain: activeChain,
    transport: http(activeChain.rpcUrls.default.http[0]),
  });

  const rawGasPrice = await publicClient.getGasPrice();
  // Floor at 1 gwei — some nodes reject gasPrice=0x0 and it prevents KUB testnet issues
  const gasPrice = rawGasPrice > 0n ? rawGasPrice : 1_000_000_000n;
  const data = encodeFunctionData({ abi, functionName, args });

  const txHash = await provider.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from,
        to,
        data,
        gas: toHex(gas),
        gasPrice: toHex(gasPrice),
        type: '0x0', // Explicitly request legacy (type-0) tx — prevents Privy adding EIP-1559 fields
      },
    ],
  }) as `0x${string}`;

  return txHash;
}

/** Re-export publicClient factory for waitForTransactionReceipt calls */
export function makePublicClient() {
  return createPublicClient({
    chain: activeChain,
    transport: http(activeChain.rpcUrls.default.http[0]),
  });
}
