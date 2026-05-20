'use client';

import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';

export function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const role = typeof window !== 'undefined' ? localStorage.getItem('lalala_role') : null;

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
              <span className="hidden md:block text-sm text-gray-500 truncate max-w-[140px]">
                {user?.email?.address ?? 'Connected'}
              </span>
              <button
                onClick={() => logout()}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => login()}
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
