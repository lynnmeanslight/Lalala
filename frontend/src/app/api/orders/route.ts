import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';
import { Order } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const snap = await db.collection('orders').get();
    let orders = snap.docs.map((d) => d.data() as Order);

    const buyerWallet = req.nextUrl.searchParams.get('buyerWallet');
    const sellerWallet = req.nextUrl.searchParams.get('sellerWallet');

    if (buyerWallet) {
      orders = orders.filter(
        (o) => o.buyerWallet.toLowerCase() === buyerWallet.toLowerCase(),
      );
    } else if (sellerWallet) {
      orders = orders.filter(
        (o) => o.sellerWallet.toLowerCase() === sellerWallet.toLowerCase(),
      );
    }

    orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json(orders);
  } catch (err) {
    console.error('GET /api/orders error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const order = (await req.json()) as Order;
    await db.collection('orders').doc(order.id).set(order);
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error('POST /api/orders error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
