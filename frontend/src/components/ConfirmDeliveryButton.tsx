'use client';

import { useState } from 'react';

export function ConfirmDeliveryButton({
  orderId,
  onConfirmed,
}: {
  orderId: string;
  onConfirmed: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      // TODO: call escrow.confirmDelivery(orderId) via connected wallet
      await new Promise((r) => setTimeout(r, 1000));
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
        {loading ? 'Confirming...' : 'Confirm Delivery'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400 text-center">
        Confirming releases USDT to the seller instantly.
      </p>
    </div>
  );
}
