'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export function BuyButton({
  listingId,
  priceUsdt,
  sellerWallet,
}: {
  listingId: string;
  priceUsdt: number;
  sellerWallet: string;
}) {
  const { authenticated, login } = usePrivy();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBuy = async () => {
    if (!authenticated) {
      login();
      return;
    }
    setLoading(true);
    setError('');
    try {
      // TODO: replace with real KUB Chain calls:
      // 1. wallet.switchChain(activeChain.id)
      // 2. ERC-20 approve USDT to ESCROW_CONTRACT_ADDRESS
      // 3. escrow.createOrder(orderId, sellerWallet, amount)
      await new Promise((r) => setTimeout(r, 1200));
      const orderId = `order-${Date.now()}`;
      router.push(`/orders/${orderId}?listing=${listingId}&price=${priceUsdt}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading
          ? 'Processing...'
          : authenticated
          ? `Buy · ${priceUsdt.toFixed(2)} USDT`
          : 'Sign in to Buy'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400 text-center">
        🔒 USDT locked in KUB Chain escrow until delivery confirmed
      </p>
    </div>
  );
}
