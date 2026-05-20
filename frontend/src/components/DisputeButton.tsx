'use client';

import { useState } from 'react';

export function DisputeButton({
  orderId,
  onDisputed,
}: {
  orderId: string;
  onDisputed: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const handleDispute = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // TODO: call escrow.raiseDispute(orderId) via connected wallet
      await new Promise((r) => setTimeout(r, 800));
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
          ? 'Raising dispute...'
          : confirming
          ? 'Tap again to confirm'
          : 'Raise a Dispute'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
