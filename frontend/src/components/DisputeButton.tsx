'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { activeChain } from '@/lib/chain';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '@/lib/contracts';
import { updateOrder } from '@/lib/store';

export function DisputeButton({
  orderId,
  onDisputed,
}: {
  orderId: string;
  onDisputed: () => void;
}) {
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const handleDispute = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    const wallet = wallets[0];
    if (!wallet) { setError('No wallet connected.'); return; }

    setLoading(true);
    setError('');
    try {
      await wallet.switchChain(activeChain.id);

      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        chain: activeChain,
        transport: custom(provider),
        account: wallet.address as `0x${string}`,
      });
      const publicClient = createPublicClient({
        chain: activeChain,
        transport: http(activeChain.rpcUrls.default.http[0]),
      });

      const gasPrice = await publicClient.getGasPrice();

      const tx = await walletClient.writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'raiseDispute',
        args: [orderId as `0x${string}`],
        gasPrice,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });

      updateOrder(orderId, { status: 'disputed' });
      onDisputed();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to raise dispute.');
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleDispute}
        disabled={loading}
        className="w-full rounded-xl border border-red-300 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading
          ? 'Raising dispute on-chain...'
          : confirming
          ? 'Tap again to confirm'
          : 'Raise a Dispute'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
