'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { OrderStatus } from '@/types';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { ConfirmDeliveryButton } from '@/components/ConfirmDeliveryButton';
import { DisputeButton } from '@/components/DisputeButton';
import { ReviewForm } from '@/components/ReviewForm';
import { MOCK_ORDERS } from '@/lib/mock-data';

function OrderPageContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const mockOrder = MOCK_ORDERS.find((o) => o.id === id);
  const [status, setStatus] = useState<OrderStatus>(mockOrder?.status ?? 'paid');
  const [reviewDone, setReviewDone] = useState(false);

  const priceUsdt = mockOrder?.priceUsdt ?? parseFloat(searchParams.get('price') ?? '0');
  const listingId = mockOrder?.listingId ?? searchParams.get('listing') ?? '';
  const listingTitle = mockOrder?.listingTitle ?? 'Your Order';
  const txHash = mockOrder?.txHash ?? '0xmocktxhash_new';
  const trackingNumber = mockOrder?.trackingNumber;
  const createdAt = mockOrder?.createdAt ?? new Date().toISOString();
  const autoReleaseAt = mockOrder?.autoReleaseAt ?? new Date(Date.now() + 7 * 86400000).toISOString();

  const daysLeft = Math.ceil((new Date(autoReleaseAt).getTime() - Date.now()) / 86400000);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      {/* Order card */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order</h1>
            <p className="text-xs text-gray-400 mt-0.5 font-mono break-all">{id}</p>
          </div>
          <OrderStatusBadge status={status} />
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Product</span>
            <span className="font-medium text-right max-w-[60%]">{listingTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold">{priceUsdt.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span>{new Date(createdAt).toLocaleDateString('en-GB')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tx Hash</span>
            <span className="font-mono text-xs text-orange-500 truncate max-w-[55%]">{txHash}</span>
          </div>
          {trackingNumber && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tracking</span>
              <span className="font-mono">{trackingNumber}</span>
            </div>
          )}
        </div>

        {status === 'shipped' && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            Auto-release in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> if not confirmed.
          </div>
        )}
      </div>

      {/* Actions */}
      {status === 'shipped' && (
        <div className="space-y-3">
          <ConfirmDeliveryButton orderId={id} onConfirmed={() => setStatus('delivered')} />
          <DisputeButton orderId={id} onDisputed={() => setStatus('disputed')} />
        </div>
      )}

      {status === 'paid' && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-sm text-blue-800">
          🔒 Your USDT is locked in escrow. Waiting for the seller to ship.
        </div>
      )}

      {status === 'disputed' && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-sm text-red-800">
          ⚠️ This order is under dispute. Funds remain locked. The team will review and resolve it.
        </div>
      )}

      {/* Review */}
      {status === 'delivered' && !reviewDone && (
        <ReviewForm
          orderId={id}
          listingId={listingId}
          onSubmitted={() => setReviewDone(true)}
        />
      )}
      {status === 'delivered' && reviewDone && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-sm text-green-800 text-center">
          ✅ Review submitted. Thank you!
        </div>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense>
      <OrderPageContent />
    </Suspense>
  );
}
