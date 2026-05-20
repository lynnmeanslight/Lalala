/**
 * Client-side localStorage store for listings, orders, and reviews.
 * Starts empty — all data is created by real users.
 */
import { Listing, Order, Review } from '@/types';

const LISTINGS_KEY = 'lalala_listings';
const ORDERS_KEY   = 'lalala_orders';
const REVIEWS_KEY  = 'lalala_reviews';

// ── Listings ────────────────────────────────────────────────────────────────

export function getListings(): Listing[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(LISTINGS_KEY);
  return raw ? (JSON.parse(raw) as Listing[]) : [];
}

export function getListing(id: string): Listing | undefined {
  return getListings().find((l) => l.id === id);
}

export function saveListing(listing: Listing): void {
  const listings = getListings();
  listings.unshift(listing);
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

// ── Orders ──────────────────────────────────────────────────────────────────

export function getOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ORDERS_KEY);
  return raw ? (JSON.parse(raw) as Order[]) : [];
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function saveOrder(order: Order): void {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function updateOrder(id: string, updates: Partial<Order>): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], ...updates };
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export function getReviews(listingId?: string): Review[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(REVIEWS_KEY);
  const all = raw ? (JSON.parse(raw) as Review[]) : [];
  return listingId ? all.filter((r) => r.listingId === listingId) : all;
}

export function saveReview(review: Review): void {
  const raw = localStorage.getItem(REVIEWS_KEY);
  const reviews = raw ? (JSON.parse(raw) as Review[]) : [];
  reviews.unshift(review);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}
