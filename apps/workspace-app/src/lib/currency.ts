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
    // BUG-043: '~' prefix signals that compact display is approximate (rounded to 1 decimal)
    const exactM = naira / 1_000_000;
    const formatted = exactM.toFixed(1);
    const prefix = Number(formatted) === exactM ? '' : '~';
    return `${prefix}₦${formatted}M`;
  }
  if (opts?.compact && naira >= 1_000) {
    const exactK = naira / 1_000;
    const formatted = exactK.toFixed(1);
    const prefix = Number(formatted) === exactK ? '' : '~';
    return `${prefix}₦${formatted}K`;
  }
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(naira);
}

export function parseNairaInput(value: string): number {
  // BUG-043: strip leading '~' used in compact approximate display
  const cleaned = value.replace(/[~₦,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num < 0) return 0;
  return nairaToKobo(num);
}
