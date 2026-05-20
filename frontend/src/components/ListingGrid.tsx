import { Listing } from '@/types';
import { ListingCard } from './ListingCard';

export function ListingGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-4xl mb-3">🛒</p>
        <p>No listings yet.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
