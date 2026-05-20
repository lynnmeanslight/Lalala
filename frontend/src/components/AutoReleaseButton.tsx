'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { activeChain } from '@/lib/chain';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '@/lib/contracts';
import { updateOrder } from '@/lib/store';

export function AutoReleaseButton({
  orderId,
  onReleased,
}: {
  orderId: string;
  onReleased: () => void;
}) {
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAutoRelease = async () => {
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
        functionName: 'autoRelease',
        args: [orderId as `0x${string}`],
        gasPrice,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });

      updateOrder(orderId, { status: 'delivered' });
      onReleased();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Auto-release failed.';
      // Surface the revert reason clearly
      setError(msg.includes('TooEarlyForAutoRelease') ? 'Release period not yet elapsed.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleAutoRelease}
        disabled={loading}
        className="w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing on-chain…
          </>
        ) : (
          <>⏰ Claim Auto-Release</>
        )}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <p className="text-xs text-gray-400 text-center">
        The seller&apos;s funds are automatically released since no dispute was raised.
      </p>
    </div>
  );
}
