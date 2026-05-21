import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '@/lib/firebaseAdmin';
import { Order } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = getDb();
    const doc = await db.collection('orders').doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(doc.data() as Order);
  } catch (err) {
    console.error('GET /api/orders/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = getDb();
    const updates = await req.json();
    const ref = db.collection('orders').doc(id);

    // If transitioning to 'delivered', atomically decrement the listing stock
    if (updates.status === 'delivered') {
      const orderDoc = await ref.get();
      const order = orderDoc.data() as Order | undefined;
      if (order && order.status !== 'delivered' && order.listingId) {
        const listingRef = db.collection('listings').doc(order.listingId);
        await listingRef.update({ stock: FieldValue.increment(-1) });
      }
    }

    await ref.update(updates);
    const doc = await ref.get();
    return NextResponse.json(doc.data() as Order);
  } catch (err) {
    console.error('PATCH /api/orders/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
