import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';
import { Listing } from '@/types';

export async function GET(_req: NextRequest) {
  try {
    const db = getDb();
    const snap = await db.collection('listings').orderBy('createdAt', 'desc').get();
    const listings = snap.docs.map((d) => d.data() as Listing);
    return NextResponse.json(listings);
  } catch (err) {
    console.error('GET /api/listings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const listing = (await req.json()) as Listing;
    await db.collection('listings').doc(listing.id).set(listing);
    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    console.error('POST /api/listings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
