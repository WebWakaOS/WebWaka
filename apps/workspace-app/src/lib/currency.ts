export const KOBO_PER_NAIRA = 100;

export function koboToNaira(kobo: number): number {
  return kobo / KOBO_PER_NAIRA;
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * KOBO_PER_NAIRA);
}

export function formatNaira(kobo: number, opts?: { compact?: boolean }): string {
  const naira = koboToNaira(kobo);
  if (opts?.compact && naira >= 1_000_000) {
    return `₦${(naira / 1_000_000).toFixed(1)}M`;
  }
  if (opts?.compact && naira >= 1_000) {
    return `₦${(naira / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(naira);
}

export function parseNairaInput(value: string): number {
  const cleaned = value.replace(/[₦,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) return 0;
  return nairaToKobo(num);
}
