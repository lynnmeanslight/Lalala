'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import { MOCK_ORDERS } from '@/lib/mock-data';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';

export default function BuyerDashboardPage() {
  const { authenticated } = usePrivy();
  const orders = MOCK_ORDERS;

  if (!authenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Please sign in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p>No orders yet.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-orange-500 hover:underline">
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border shadow-sm p-5">
              <div className="flex gap-4">
                {order.listingImage && (
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={order.listingImage}
                      alt={order.listingTitle}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">
                      {order.listingTitle}
                    </p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {order.priceUsdt.toFixed(2)} USDT
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-GB')}
                  </p>
                  {order.trackingNumber && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tracking:{' '}
                      <span className="font-mono">{order.trackingNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/orders/${order.id}`}
                  className="flex-1 text-center rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  View Order
                </Link>
                {order.status === 'shipped' && (
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex-1 text-center rounded-xl bg-green-500 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                  >
                    Confirm Delivery
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
