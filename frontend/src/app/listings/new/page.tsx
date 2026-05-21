'use client';

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { saveListing } from '@/lib/store';
import { thbToUsdt } from '@/lib/currency';

const CATEGORIES = ['Home & Kitchen', 'Fashion', 'Food & Drink', 'Electronics', 'Collectibles', 'Other'];
const MAX_PHOTOS = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface PhotoFile {
  file: File;
  preview: string;
}

export default function NewListingPage() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ title: '', description: '', category: '', priceThb: '', stock: '' });
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // ── Photo helpers ────────────────────────────────────────────────────────────
  const addFiles = useCallback((files: FileList | File[]) => {
    const next: PhotoFile[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > 10 * 1024 * 1024) continue; // skip >10 MB
      if (photos.length + next.length >= MAX_PHOTOS) break;
      next.push({ file, preview: URL.createObjectURL(file) });
    }
    setPhotos((prev) => [...prev, ...next].slice(0, MAX_PHOTOS));
    setUploadError('');
  }, [photos]);

  const removePhoto = (idx: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = ''; // reset so same file can be re-added
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');

    const wallet = wallets[0];
    const sellerWallet = wallet?.address ?? '0x0000000000000000000000000000000000000000';

    let imageUrls: string[] = [];

    if (photos.length > 0) {
      try {
        const fd = new FormData();
        photos.forEach((p) => fd.append('file', p.file));
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Upload failed');
        imageUrls = data.urls;
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        setUploading(false);
        return;
      }
    } else {
      // Fallback placeholder so listing always has an image
      imageUrls = ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'];
    }

    await saveListing({
      id: `listing-${Date.now()}`,
      title: form.title,
      description: form.description,
      category: form.category,
      images: imageUrls,
      priceUsdt: thbToUsdt(parseFloat(form.priceThb)),
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

  // ── Guards ───────────────────────────────────────────────────────────────────
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
          <p className="text-gray-500 text-sm mt-1">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a Listing</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">

        {/* ── Photo upload ───────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos <span className="text-gray-400 font-normal">(up to {MAX_PHOTOS})</span>
          </label>

          {/* Previews */}
          {photos.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {photos.map((p, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                  <Image src={p.preview} alt={`photo ${idx + 1}`} fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute inset-0 bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕ Remove
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-[9px] text-center py-0.5 font-medium">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Drop zone */}
          {photos.length < MAX_PHOTOS && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors py-8
                ${dragging ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/40'}`}
            >
              <span className="text-3xl">📷</span>
              <p className="text-sm text-gray-600 font-medium">
                {dragging ? 'Drop to upload' : 'Drag & drop or click to add photos'}
              </p>
              <p className="text-xs text-gray-400">JPEG, PNG, WebP, GIF · Max 10 MB each</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={onFileChange}
            className="hidden"
          />

          {uploadError && (
            <p className="mt-2 text-sm text-red-500">{uploadError}</p>
          )}
        </div>

        {/* ── Title ─────────────────────────────────────────────────────── */}
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

        {/* ── Description ───────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your product…"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
          />
        </div>

        {/* ── Category ──────────────────────────────────────────────────── */}
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

        {/* ── Price + Stock ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (฿ Baht)</label>
            <input
              required
              type="number"
              min="1"
              step="1"
              value={form.priceThb}
              onChange={(e) => setForm({ ...form, priceThb: e.target.value })}
              placeholder="e.g. 500"
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
          disabled={uploading}
          className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Uploading photos…
            </>
          ) : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
}
