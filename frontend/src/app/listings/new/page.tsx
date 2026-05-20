'use client';

import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { saveListing } from '@/lib/store';

const CATEGORIES = ['Home & Kitchen', 'Fashion', 'Food & Drink', 'Electronics', 'Collectibles', 'Other'];

export default function NewListingPage() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', category: '', priceUsdt: '', stock: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const wallet = wallets[0];
    const sellerWallet = wallet?.address ?? '0x0000000000000000000000000000000000000000';
    saveListing({
      id: `listing-${Date.now()}`,
      title: form.title,
      description: form.description,
      category: form.category,
      images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'],
      priceUsdt: parseFloat(form.priceUsdt),
      stock: parseInt(form.stock, 10),
      sellerId: sellerWallet,
      sellerName: `${sellerWallet.slice(0, 6)}...${sellerWallet.slice(-4)}`,
      sellerWallet,
      createdAt: new Date().toISOString(),
      avgRating: 0,
      reviewCount: 0,
    });
    setSubmitted(true);
    setTimeout(() => router.push('/dashboard/seller'), 1500);
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">🔒</p>
          <p className="text-gray-600">Please sign in to list a product.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-xl font-semibold">Listing created!</p>
          <p className="text-gray-500 text-sm mt-1">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a Listing</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Handmade Ceramic Mug"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your product..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (USDT)</label>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={form.priceUsdt}
              onChange={(e) => setForm({ ...form, priceUsdt: e.target.value })}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input
              required
              type="number"
              min="1"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="1"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          Publish Listing
        </button>
      </form>
    </div>
  );
}
