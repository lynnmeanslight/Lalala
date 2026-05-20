'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListing, getReviews } from '@/lib/store';
import { Listing, Review } from '@/types';
import { StarRating } from '@/components/StarRating';
import { BuyButton } from '@/components/BuyButton';
import { formatThb, usdtToThb } from '@/lib/currency';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const l = getListing(id);
    if (!l) { setReady(true); return; }
    setListing(l);
    setReviews(getReviews(id));
    setReady(true);
  }, [id]);

  if (!ready) return null;
  if (!listing) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative h-80 w-full rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {listing.images.slice(1).map((img, i) => (
            <div key={i} className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={img}
                alt={`${listing.title} view ${i + 2}`}
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-orange-500 font-medium">{listing.category}</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{listing.title}</h1>
          </div>

          <StarRating rating={listing.avgRating} count={listing.reviewCount} size="md" />

          <p className="text-3xl font-bold text-gray-900">
            {formatThb(usdtToThb(listing.priceUsdt))}
          </p>

          <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>🏪</span>
            <span>
              Sold by{' '}
              <Link
                href={`/sellers/${listing.sellerWallet}`}
                className="font-medium text-orange-500 hover:underline"
              >
                {listing.sellerName}
              </Link>
            </span>
          </div>

          <div className="text-sm">
            {listing.stock > 0 ? (
              <span className="text-green-600 font-medium">In stock ({listing.stock} left)</span>
            ) : (
              <span className="text-red-500 font-medium">Out of stock</span>
            )}
          </div>

          <div className="pt-2">
            <BuyButton
              listingId={listing.id}
              listingTitle={listing.title}
              listingImage={listing.images[0]}
              priceUsdt={listing.priceUsdt}
              sellerWallet={listing.sellerWallet}
            />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Reviews{' '}
          {reviews.length > 0 && (
            <span className="text-gray-400 font-normal text-sm">({reviews.length})</span>
          )}
        </h2>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet. Be the first to buy and review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
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
                <p className="text-xs text-green-600 mt-2">Verified purchase</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
