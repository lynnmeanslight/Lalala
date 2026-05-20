'use client';

import { useEffect, useState } from 'react';
import { ListingGrid } from '@/components/ListingGrid';
import { getListings } from '@/lib/store';
import { Listing } from '@/types';

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    setListings(getListings());
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shop Thai. Pay safe.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Every purchase is protected by USDT escrow on KUB Chain. Verified reviews only.
            Fixed 1.5% fee. No surprises.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
              <span>🔒</span>
              <span className="font-medium">USDT Escrow on KUB Chain</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
              <span>✅</span>
              <span className="font-medium">Verified Reviews Only</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
              <span>💸</span>
              <span className="font-medium">1.5% Fee, Fixed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Featured Listings</h2>
        <ListingGrid listings={listings} />
      </section>
    </div>
  );
}
