import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';
import { Review } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const listingId = req.nextUrl.searchParams.get('listingId');

    let snap;
    if (listingId) {
      snap = await db.collection('reviews').where('listingId', '==', listingId).get();
    } else {
      snap = await db.collection('reviews').get();
    }

    const reviews = snap.docs.map((d) => d.data() as Review);
    reviews.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json(reviews);
  } catch (err) {
    console.error('GET /api/reviews error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const review = (await req.json()) as Review;

    const batch = db.batch();
    batch.set(db.collection('reviews').doc(review.id), review);

    // Update listing's avgRating and reviewCount
    const listingRef = db.collection('listings').doc(review.listingId);
    const listingDoc = await listingRef.get();
    if (listingDoc.exists) {
      const listing = listingDoc.data()!;
      const currentCount: number = listing.reviewCount ?? 0;
      const currentAvg: number = listing.avgRating ?? 0;
      const newCount = currentCount + 1;
      const newAvg = parseFloat(
        ((currentAvg * currentCount + review.rating) / newCount).toFixed(2),
      );
      batch.update(listingRef, { reviewCount: newCount, avgRating: newAvg });
    }

    await batch.commit();
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error('POST /api/reviews error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
