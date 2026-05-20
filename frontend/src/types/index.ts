export type UserRole = 'buyer' | 'seller';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  priceUsdt: number;
  stock: number;
  sellerId: string;
  sellerName: string;
  sellerWallet: string;
  createdAt: string;
  avgRating: number;
  reviewCount: number;
}

export type OrderStatus = 'paid' | 'shipped' | 'delivered' | 'disputed';

export interface Order {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  priceUsdt: number;
  buyerId: string;
  buyerWallet: string;
  sellerId: string;
  sellerWallet: string;
  status: OrderStatus;
  trackingNumber?: string;
  txHash?: string;
  createdAt: string;
  autoReleaseAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  listingId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
