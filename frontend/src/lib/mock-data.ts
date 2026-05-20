import { Listing, Order, Review } from '@/types';

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'listing-1',
    title: 'Handmade Ceramic Mug Set (4 pcs)',
    description:
      'Beautiful handcrafted ceramic mugs made by a local Thai artisan in Chiang Mai. Each mug holds 350ml, microwave and dishwasher safe. Sold as a set of 4 with a gift box.',
    category: 'Home & Kitchen',
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
      'https://images.unsplash.com/photo-1571122082990-b5a2f5d6a0ab?w=600&q=80',
    ],
    priceUsdt: 18.5,
    stock: 12,
    sellerId: 'seller-1',
    sellerName: 'Chiangmai Crafts',
    sellerWallet: '0xSellerWallet0001',
    createdAt: '2026-05-15T08:00:00Z',
    avgRating: 4.8,
    reviewCount: 23,
  },
  {
    id: 'listing-2',
    title: 'Thai Silk Scarf — Hand-woven',
    description:
      'Authentic Thai silk scarf, hand-woven using traditional techniques passed down for generations. 180cm x 45cm. Available in this listing in royal blue with gold pattern.',
    category: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80',
    ],
    priceUsdt: 32.0,
    stock: 5,
    sellerId: 'seller-2',
    sellerName: 'Silk Road BKK',
    sellerWallet: '0xSellerWallet0002',
    createdAt: '2026-05-16T10:30:00Z',
    avgRating: 4.6,
    reviewCount: 11,
  },
  {
    id: 'listing-3',
    title: 'Organic Thai Green Tea 100g',
    description:
      'Single-origin organic green tea from a hill tribe farm in Mae Hong Son. No pesticides, no additives. Bright, grassy flavour with a clean finish. Resealable foil pouch.',
    category: 'Food & Drink',
    images: [
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
    ],
    priceUsdt: 8.0,
    stock: 50,
    sellerId: 'seller-3',
    sellerName: 'Mae Hong Son Tea',
    sellerWallet: '0xSellerWallet0003',
    createdAt: '2026-05-17T06:00:00Z',
    avgRating: 4.9,
    reviewCount: 47,
  },
  {
    id: 'listing-4',
    title: 'Vintage Brass Buddha Figurine',
    description:
      'Antique brass Buddha statue sourced from a Chiang Rai estate. Approximately 80 years old, 15cm tall. Minor surface patina consistent with age. Certificate of authenticity included.',
    category: 'Collectibles',
    images: [
      'https://images.unsplash.com/photo-1545987796-200677ee1011?w=600&q=80',
    ],
    priceUsdt: 75.0,
    stock: 1,
    sellerId: 'seller-1',
    sellerName: 'Chiangmai Crafts',
    sellerWallet: '0xSellerWallet0001',
    createdAt: '2026-05-17T14:00:00Z',
    avgRating: 5.0,
    reviewCount: 3,
  },
  {
    id: 'listing-5',
    title: 'Mechanical Keyboard — TKL Brown Switch',
    description:
      'Compact tenkeyless mechanical keyboard with Gateron Brown switches. PBT keycaps, USB-C detachable cable, aluminium top plate. Programmed and tested. Ships from Bangkok.',
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1561112078-7d24e04c3407?w=600&q=80',
    ],
    priceUsdt: 62.0,
    stock: 3,
    sellerId: 'seller-4',
    sellerName: 'TechBKK Store',
    sellerWallet: '0xSellerWallet0004',
    createdAt: '2026-05-18T09:00:00Z',
    avgRating: 4.7,
    reviewCount: 8,
  },
  {
    id: 'listing-6',
    title: 'Coconut Shell Bowl Set (3 sizes)',
    description:
      'Eco-friendly bowls hand-carved from coconut shells. Set of 3 — small, medium, large. Food safe lacquer finish. Perfect for serving snacks, dips, or as decor.',
    category: 'Home & Kitchen',
    images: [
      'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=600&q=80',
    ],
    priceUsdt: 14.0,
    stock: 20,
    sellerId: 'seller-3',
    sellerName: 'Mae Hong Son Tea',
    sellerWallet: '0xSellerWallet0003',
    createdAt: '2026-05-18T11:00:00Z',
    avgRating: 4.5,
    reviewCount: 15,
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    listingId: 'listing-3',
    listingTitle: 'Organic Thai Green Tea 100g',
    listingImage:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
    priceUsdt: 8.0,
    buyerId: 'buyer-demo',
    buyerWallet: '0xBuyerWalletDemo',
    sellerId: 'seller-3',
    sellerWallet: '0xSellerWallet0003',
    status: 'shipped',
    trackingNumber: 'TH123456789',
    txHash: '0xmocktxhash0001',
    createdAt: '2026-05-19T09:00:00Z',
    autoReleaseAt: '2026-05-26T09:00:00Z',
  },
  {
    id: 'order-2',
    listingId: 'listing-1',
    listingTitle: 'Handmade Ceramic Mug Set (4 pcs)',
    listingImage:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
    priceUsdt: 18.5,
    buyerId: 'buyer-demo',
    buyerWallet: '0xBuyerWalletDemo',
    sellerId: 'seller-1',
    sellerWallet: '0xSellerWallet0001',
    status: 'delivered',
    trackingNumber: 'TH987654321',
    txHash: '0xmocktxhash0002',
    createdAt: '2026-05-14T10:00:00Z',
    autoReleaseAt: '2026-05-21T10:00:00Z',
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-1',
    orderId: 'order-2',
    listingId: 'listing-1',
    reviewerId: 'buyer-demo',
    reviewerName: 'K. Ploy',
    rating: 5,
    comment:
      'Beautiful mugs, exactly as described. Packed very well and arrived quickly. Will order again!',
    createdAt: '2026-05-16T08:00:00Z',
  },
  {
    id: 'review-2',
    orderId: 'order-demo-2',
    listingId: 'listing-1',
    reviewerId: 'buyer-2',
    reviewerName: 'K. Nat',
    rating: 5,
    comment: 'Great quality, the glaze is stunning in person.',
    createdAt: '2026-05-10T14:00:00Z',
  },
  {
    id: 'review-3',
    orderId: 'order-demo-3',
    listingId: 'listing-3',
    reviewerId: 'buyer-3',
    reviewerName: 'K. Win',
    rating: 5,
    comment: 'Freshest green tea I have ever had. The aroma when you open the bag is incredible.',
    createdAt: '2026-05-12T09:00:00Z',
  },
];

// Seller-view: orders assigned to the demo seller
export const MOCK_SELLER_ORDERS: Order[] = [
  {
    id: 'sorder-1',
    listingId: 'listing-1',
    listingTitle: 'Handmade Ceramic Mug Set (4 pcs)',
    listingImage:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
    priceUsdt: 18.5,
    buyerId: 'buyer-demo',
    buyerWallet: '0xBuyerWalletDemo',
    sellerId: 'seller-demo',
    sellerWallet: '0xSellerWalletDemo',
    status: 'paid',
    txHash: '0xmocktxhash0003',
    createdAt: '2026-05-20T07:00:00Z',
    autoReleaseAt: '2026-05-27T07:00:00Z',
  },
  {
    id: 'sorder-2',
    listingId: 'listing-4',
    listingTitle: 'Vintage Brass Buddha Figurine',
    listingImage:
      'https://images.unsplash.com/photo-1545987796-200677ee1011?w=600&q=80',
    priceUsdt: 75.0,
    buyerId: 'buyer-5',
    buyerWallet: '0xBuyerWallet0005',
    sellerId: 'seller-demo',
    sellerWallet: '0xSellerWalletDemo',
    status: 'shipped',
    trackingNumber: 'TH555111222',
    txHash: '0xmocktxhash0004',
    createdAt: '2026-05-18T12:00:00Z',
    autoReleaseAt: '2026-05-25T12:00:00Z',
  },
];
