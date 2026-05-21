'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, parseUnits } from 'viem';
import { getOrders, updateOrder } from '@/lib/store';
import { activeChain } from '@/lib/chain';
import { USDT_CONTRACT_ADDRESS, ERC20_ABI, USDT_DECIMALS } from '@/lib/contracts';
import { sendLegacyContractTx } from '@/lib/tx';
import { Order } from '@/types';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { formatThb, usdtToThb } from '@/lib/currency';

export default function BuyerDashboardPage() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [orders, setOrders] = useState<Order[]>([]);
  const [minting, setMinting] = useState(false);
  const [mintMsg, setMintMsg] = useState('');

  useEffect(() => {
    async function load() {
      const wallet = wallets[0];
      if (!wallet) return;
      const all = await getOrders({ buyerWallet: wallet.address });
      setOrders(all);
    }
    load();
  }, [wallets]);

  const handleMint = async () => {
    const wallet = wallets[0];
    if (!wallet) return;
    setMinting(true);
    setMintMsg('');
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
        to: USDT_CONTRACT_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'mint',
        args: [wallet.address, parseUnits('1000', USDT_DECIMALS)],
        gas: 100_000n,
      });
      await publicClient.waitForTransactionReceipt({ hash: tx });
      setMintMsg('✅ Test funds added to your wallet!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMintMsg(`Mint failed: ${msg}`);
    } finally {
      setMinting(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Please sign in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <button
          onClick={handleMint}
          disabled={minting}
          className="rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-60 transition-colors"
        >
          {minting ? 'Adding funds...' : 'Get Test Funds'}
        </button>
      </div>
      {mintMsg && <p className="text-sm text-green-600">{mintMsg}</p>}

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
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
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
                    {formatThb(usdtToThb(order.priceUsdt))}
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
