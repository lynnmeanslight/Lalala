/**
 * Currency utilities for Lalala.
 *
 * All on-chain values are stored/transacted in USDT.
 * The platform displays everything to users in Thai Baht (฿).
 *
 * Conversion: 1 USDT ≈ THB_PER_USDT Baht
 */

/** Fallback rate: 1 USDT in Thai Baht. Used when live rate is unavailable. */
export const THB_PER_USDT = 33.5;

/** Convert a USDT amount to Thai Baht */
export function usdtToThb(usdt: number, rate = THB_PER_USDT): number {
  return usdt * rate;
}

/** Convert a Thai Baht amount to USDT */
export function thbToUsdt(thb: number, rate = THB_PER_USDT): number {
  return thb / rate;
}

/** Format a Thai Baht value for display, e.g. ฿1,234.50 */
export function formatThb(thb: number): string {
  return (
    '฿' +
    thb.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
