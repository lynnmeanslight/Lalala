'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  useEffect(() => {
    if (ready && authenticated) {
      router.push(role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer');
    }
  }, [ready, authenticated, role, router]);

  const handleContinue = () => {
    localStorage.setItem('lalala_role', role);
    login();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <div className="text-center mb-8">
            <p className="text-4xl mb-2">🛍️</p>
            <h1 className="text-2xl font-bold text-gray-900">Join Lalala</h1>
            <p className="text-gray-500 text-sm mt-1">Safe shopping on KUB Chain</p>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">I want to...</p>
            <div className="grid grid-cols-2 gap-3">
              {(['buyer', 'seller'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${
                    role === r
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{r === 'buyer' ? '🛒' : '🏪'}</div>
                  <div className="font-semibold text-sm">{r === 'buyer' ? 'Buy' : 'Sell'}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {r === 'buyer' ? 'Shop safely' : 'List products'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            Continue with Email
          </button>
          <p className="mt-4 text-center text-xs text-gray-400">
            A one-time code is sent to your email. No password needed.
          </p>
        </div>
      </div>
    </div>
  );
}
