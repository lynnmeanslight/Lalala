'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { saveReview } from '@/lib/store';

export function ReviewForm({
  orderId,
  listingId,
  onSubmitted,
}: {
  orderId: string;
  listingId: string;
  onSubmitted: () => void;
}) {
  const { wallets } = useWallets();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setLoading(true);
    const address = wallets[0]?.address ?? 'anonymous';
    await saveReview({
      id: `review-${Date.now()}`,
      orderId,
      listingId,
      reviewerId: address,
      reviewerName: `${address.slice(0, 6)}...${address.slice(-4)}`,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    });
    setLoading(false);
    onSubmitted();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-5 space-y-4">
      <h3 className="font-semibold text-gray-800">Leave a Review</h3>
      <div>
        <p className="text-sm text-gray-600 mb-2">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              className="text-3xl transition-colors"
            >
              <span className={(hovered || rating) >= s ? 'text-yellow-400' : 'text-gray-200'}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
        <textarea
          required
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
