import { NextResponse } from 'next/server';

export const revalidate = 60; // cache for 60 seconds

export async function GET() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitkub-coin&vs_currencies=thb,usd',
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error('CoinGecko fetch failed');
    const data = await res.json();
    const { thb, usd } = data['bitkub-coin'];
    return NextResponse.json({ thb, usd }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=120' },
    });
  } catch {
    // Fallback to approximate values if CoinGecko is unavailable
    return NextResponse.json({ thb: 27, usd: 0.83 }, {
      headers: { 'Cache-Control': 's-maxage=30' },
    });
  }
}
