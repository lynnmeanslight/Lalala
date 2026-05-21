'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, formatUnits } from 'viem';
import { activeChain } from '@/lib/chain';
import { USDT_CONTRACT_ADDRESS, ERC20_ABI, USDT_DECIMALS } from '@/lib/contracts';
import { usdtToThb } from '@/lib/currency';

export function Navbar() {
  const { ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const role = typeof window !== 'undefined' ? localStorage.getItem('lalala_role') : null;

  const [thbBalance, setThbBalance] = useState<number | null>(null);

  useEffect(() => {
    const wallet = wallets[0];
    if (!wallet || !authenticated) { setThbBalance(null); return; }

    let cancelled = false;
    const publicClient = createPublicClient({
      chain: activeChain,
      transport: http(activeChain.rpcUrls.default.http[0]),
    });

    async function fetchBalance() {
      try {
        const raw = await publicClient.readContract({
          address: USDT_CONTRACT_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [wallet.address as `0x${string}`],
        }) as bigint;
        if (cancelled) return;
        const usdt = parseFloat(formatUnits(raw, USDT_DECIMALS));
        setThbBalance(usdtToThb(usdt));
      } catch {
        // silently ignore — balance stays null
      }
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [wallets, authenticated]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-orange-500 tracking-tight">
          Lalala 🛍️
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-orange-500 transition-colors">
            Browse
          </Link>
          {authenticated && role === 'seller' && (
            <>
              <Link href="/listings/new" className="hover:text-orange-500 transition-colors">
                Sell
              </Link>
              <Link href="/dashboard/seller" className="hover:text-orange-500 transition-colors">
                Dashboard
              </Link>
            </>
          )}
          {authenticated && role === 'buyer' && (
            <Link href="/dashboard/buyer" className="hover:text-orange-500 transition-colors">
              My Orders
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!ready ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100" />
          ) : authenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm text-gray-500 truncate max-w-35">
                {user?.email?.address ?? 'Connected'}
              </span>
              {thbBalance !== null && (
                <span className="hidden md:flex items-center gap-1 rounded-lg bg-orange-50 border border-orange-200 px-2.5 py-1 text-sm font-semibold text-orange-700">
                  ฿{thbBalance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
              <button
                onClick={() => logout()}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth')}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
