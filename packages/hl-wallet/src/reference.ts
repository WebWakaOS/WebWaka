/**
 * @webwaka/hl-wallet — Reference generator
 *
 * Generates human-readable wallet references for ledger entries and funding requests.
 * Format: WLT-YYYYMMDD-XXXXX (5 alphanumeric chars suffix)
 *
 * P9: references are not monetary values — no kobo validation needed here.
 * T3: references are wallet-scoped, not tenant-scoped at this layer.
 */

export function generateWalletRef(prefix: string = 'WLT'): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).toUpperCase().slice(2, 7);
  return `${prefix}-${date}-${random}`;
}

export function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
}
