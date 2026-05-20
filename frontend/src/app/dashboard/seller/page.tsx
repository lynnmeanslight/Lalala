'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { getOrders, updateOrder } from '@/lib/store';
import { Order, OrderStatus } from '@/types';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { formatThb, usdtToThb } from '@/lib/currency';

export default function SellerDashboardPage() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const wallet = wallets[0];
    if (!wallet) return;
    const all = getOrders();
    setOrders(all.filter((o) => o.sellerWallet.toLowerCase() === wallet.address.toLowerCase()));
  }, [wallets]);

  const handleMarkShipped = (orderId: string) => {
    const tracking = trackingInputs[orderId]?.trim();
    if (!tracking) return;
    updateOrder(orderId, { status: 'shipped', trackingNumber: tracking });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'shipped' as OrderStatus, trackingNumber: tracking } : o
      )
    );
  };

  const totalEarned = orders
    .filter((o) => o.status === 'delivered')
    .reduce((s, o) => s + o.priceUsdt * 0.985, 0);

  const inEscrow = orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped')
    .reduce((s, o) => s + o.priceUsdt, 0);

  if (!authenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <Link
          href="/listings/new"
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          + New Listing
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Earned', value: formatThb(usdtToThb(totalEarned)), sub: 'after 1.5% fee' },
          { label: 'In Escrow', value: formatThb(usdtToThb(inEscrow)), sub: 'pending delivery' },
          {
            label: 'Active Orders',
            value: String(orders.filter((o) => o.status !== 'delivered').length),
            sub: 'open orders',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border shadow-sm p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Orders */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{order.listingTitle}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{order.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{formatThb(usdtToThb(order.priceUsdt))}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                {order.status === 'paid' && (
                  <div className="flex gap-2 mt-3">
                    <input
                      value={trackingInputs[order.id] ?? ''}
                      onChange={(e) =>
                        setTrackingInputs((p) => ({ ...p, [order.id]: e.target.value }))
                      }
                      placeholder="Enter tracking number"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-orange-400"
                    />
                    <button
                      onClick={() => handleMarkShipped(order.id)}
                      className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
                    >
                      Mark Shipped
                    </button>
                  </div>
                )}

                {order.status === 'shipped' && order.trackingNumber && (
                  <p className="text-xs text-gray-500 mt-2">
                    Tracking: <span className="font-mono font-medium">{order.trackingNumber}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
