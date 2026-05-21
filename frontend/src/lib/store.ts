/**
 * Async Firestore-backed store — all data persisted via Next.js API routes.
 */
import { Listing, Order, Review } from '@/types';

// ── Listings ────────────────────────────────────────────────────────────────

export async function getListings(): Promise<Listing[]> {
  const res = await fetch('/api/listings', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function getListing(id: string): Promise<Listing | null> {
  const res = await fetch(`/api/listings/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function saveListing(listing: Listing): Promise<void> {
  await fetch('/api/listings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listing),
  });
}

// ── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(opts?: {
  buyerWallet?: string;
  sellerWallet?: string;
}): Promise<Order[]> {
  const params = new URLSearchParams();
  if (opts?.buyerWallet) params.set('buyerWallet', opts.buyerWallet);
  if (opts?.sellerWallet) params.set('sellerWallet', opts.sellerWallet);
  const qs = params.toString();
  const res = await fetch(`/api/orders${qs ? `?${qs}` : ''}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function getOrder(id: string): Promise<Order | null> {
  const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function saveOrder(order: Order): Promise<void> {
  await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<void> {
  await fetch(`/api/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export async function getReviews(listingId?: string): Promise<Review[]> {
  const url = listingId
    ? `/api/reviews?listingId=${encodeURIComponent(listingId)}`
    : '/api/reviews';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function saveReview(review: Review): Promise<void> {
  await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
}
