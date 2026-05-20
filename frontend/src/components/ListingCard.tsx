import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/types';
import { StarRating } from './StarRating';
import { formatThb, usdtToThb } from '@/lib/currency';

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative h-48 w-full bg-gray-100">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-orange-500 font-medium mb-1">{listing.category}</p>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{listing.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatThb(usdtToThb(listing.priceUsdt))}
          </span>
          <StarRating rating={listing.avgRating} count={listing.reviewCount} size="sm" />
        </div>
        <p className="text-xs text-gray-400 mt-2">by {listing.sellerName}</p>
      </div>
    </Link>
  );
}
