'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getListings, getReviews } from '@/lib/store';
import { Listing, Review } from '@/types';
import { StarRating } from '@/components/StarRating';
import { ListingCard } from '@/components/ListingCard';
import { formatThb, usdtToThb } from '@/lib/currency';

export default function SellerProfilePage() {
  const { address } = useParams<{ address: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const all = await getListings();
      const sellerListings = all.filter(
        (l) => l.sellerWallet.toLowerCase() === address.toLowerCase(),
      );
      setListings(sellerListings);

      const allReviews: Review[] = [];
      await Promise.all(
        sellerListings.map(async (l) => {
          const r = await getReviews(l.id);
          allReviews.push(...r);
        }),
      );
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(allReviews);

      setReady(true);
    }
    load();
  }, [address]);

  if (!ready) return null;

  // Aggregate stats
  const totalSales = listings.reduce((sum, l) => sum + l.reviewCount, 0);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
  const totalRevenue = listings.reduce((sum, l) => sum + l.priceUsdt * l.reviewCount, 0);

  // Shorten address for display
  const shortAddr = `${address.slice(0, 6)}…${address.slice(-4)}`;

  // Deterministic avatar color from address
  const hue = parseInt(address.slice(2, 6), 16) % 360;
  const avatarStyle = { background: `hsl(${hue},65%,55%)` };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">

      {/* ── Seller header ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
            style={avatarStyle}
          >
            {address.slice(2, 4).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{shortAddr}</h1>
            <p className="text-sm font-mono text-gray-400 break-all mt-0.5">{address}</p>

            {reviews.length > 0 && (
              <div className="mt-2">
                <StarRating rating={avgRating} count={reviews.length} size="md" />
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="text-orange-500">📦</span>
                <span><strong>{listings.length}</strong> listing{listings.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-orange-500">⭐</span>
                <span><strong>{totalSales}</strong> sale{totalSales !== 1 ? 's' : ''}</span>
              </div>
              {totalRevenue > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-orange-500">💰</span>
                  <span><strong>{formatThb(usdtToThb(totalRevenue))}</strong> earned</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Listings grid ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Listings{' '}
          {listings.length > 0 && (
            <span className="text-gray-400 font-normal text-sm">({listings.length})</span>
          )}
        </h2>
        {listings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏪</p>
            <p className="text-sm">This seller has no active listings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Customer Reviews{' '}
          {reviews.length > 0 && (
            <span className="text-gray-400 font-normal text-sm">({reviews.length})</span>
          )}
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => {
              const listing = listings.find((l) => l.id === r.listingId);
              return (
                <div key={r.id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.reviewerName}</p>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{r.comment}</p>
                  {listing && (
                    <Link
                      href={`/listings/${listing.id}`}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-orange-500 hover:underline"
                    >
                      {listing.images[0] && (
                        <div className="relative w-5 h-5 rounded overflow-hidden shrink-0">
                          <Image src={listing.images[0]} alt="" fill className="object-cover" unoptimized />
                        </div>
                      )}
                      {listing.title}
                    </Link>
                  )}
                  <p className="text-xs text-green-600 mt-1">Verified purchase</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
