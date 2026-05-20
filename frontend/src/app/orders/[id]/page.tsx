'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { OrderStatus } from '@/types';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { ConfirmDeliveryButton } from '@/components/ConfirmDeliveryButton';
import { DisputeButton } from '@/components/DisputeButton';
import { ReviewForm } from '@/components/ReviewForm';
import { getOrder } from '@/lib/store';
import { formatThb, usdtToThb } from '@/lib/currency';
import { AutoReleaseButton } from '@/components/AutoReleaseButton';

function OrderPageContent() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<OrderStatus>('paid');
  const [reviewDone, setReviewDone] = useState(false);
  const [meta, setMeta] = useState({
    priceUsdt: 0,
    listingId: '',
    listingTitle: 'Your Order',
    txHash: '',
    trackingNumber: undefined as string | undefined,
    createdAt: new Date().toISOString(),
    autoReleaseAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });

  useEffect(() => {
    const order = getOrder(id);
    if (order) {
      setStatus(order.status);
      setMeta({
        priceUsdt: order.priceUsdt,
        listingId: order.listingId,
        listingTitle: order.listingTitle,
        txHash: order.txHash ?? '',
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        autoReleaseAt: order.autoReleaseAt,
      });
    }
  }, [id]);

  const msLeft = new Date(meta.autoReleaseAt).getTime() - Date.now();
  const daysLeft = Math.ceil(msLeft / 86_400_000);
  const minutesLeft = Math.ceil(msLeft / 60_000);
  const autoReleaseEligible = msLeft <= 0;

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
            <span className="font-medium text-right max-w-[60%]">{meta.listingTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold">{formatThb(usdtToThb(meta.priceUsdt))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span>{new Date(meta.createdAt).toLocaleDateString('en-GB')}</span>
          </div>
          {meta.txHash && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tx Hash</span>
              <a
                href={`${process.env.NEXT_PUBLIC_CHAIN === 'mainnet' ? 'https://www.bkcscan.com' : 'https://testnet.bkcscan.com'}/tx/${meta.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-orange-500 truncate max-w-[55%] hover:underline"
              >
                {meta.txHash.slice(0, 20)}...
              </a>
            </div>
          )}
          {meta.trackingNumber && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tracking</span>
              <span className="font-mono">{meta.trackingNumber}</span>
            </div>
          )}
        </div>

        {status === 'shipped' && !autoReleaseEligible && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            Auto-release in{' '}
            <strong>
              {minutesLeft > 0
                ? `${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}`
                : `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
            </strong>{' '}
            if not confirmed.
          </div>
        )}
        {status === 'shipped' && autoReleaseEligible && (
          <div className="mt-4 rounded-xl bg-purple-50 border border-purple-200 p-3 text-sm text-purple-800">
            ⏰ Auto-release period has elapsed. You can now claim the funds.
          </div>
        )}
      </div>

      {/* Actions */}
      {status === 'shipped' && !autoReleaseEligible && (
        <div className="space-y-3">
          <ConfirmDeliveryButton orderId={id} onConfirmed={() => setStatus('delivered')} />
          <DisputeButton orderId={id} onDisputed={() => setStatus('disputed')} />
        </div>
      )}
      {status === 'shipped' && autoReleaseEligible && (
        <div className="space-y-3">
          <AutoReleaseButton orderId={id} onReleased={() => setStatus('delivered')} />
          <DisputeButton orderId={id} onDisputed={() => setStatus('disputed')} />
        </div>
      )}

      {status === 'paid' && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-sm text-blue-800">
          🔒 Your payment is locked in escrow. Waiting for the seller to ship.
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
          listingId={meta.listingId}
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
