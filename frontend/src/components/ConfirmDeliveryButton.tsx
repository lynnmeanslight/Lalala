'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import { activeChain } from '@/lib/chain';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '@/lib/contracts';
import { sendLegacyContractTx } from '@/lib/tx';
import { updateOrder } from '@/lib/store';

export function ConfirmDeliveryButton({
  orderId,
  onConfirmed,
}: {
  orderId: string;
  onConfirmed: () => void;
}) {
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    const wallet = wallets[0];
    if (!wallet) { setError('No wallet connected.'); return; }

    setLoading(true);
    setError('');
    try {
      await wallet.switchChain(activeChain.id);

      const provider = await wallet.getEthereumProvider();
      const publicClient = createPublicClient({
        chain: activeChain,
        transport: http(activeChain.rpcUrls.default.http[0]),
      });

      const tx = await sendLegacyContractTx({
        provider,
        from: wallet.address,
        to: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'confirmDelivery',
        args: [orderId],
        gas: 120_000n,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });

      updateOrder(orderId, { status: 'delivered' });
      onConfirmed();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to confirm.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Confirming on-chain...' : 'Confirm Delivery'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400 text-center">
        Confirming releases payment to the seller instantly.
      </p>
    </div>
  );
}
