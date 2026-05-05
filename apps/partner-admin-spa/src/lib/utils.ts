/**
 * Shared utility helpers — Partner Admin SPA.
 */

/** Format kobo integer → "₦1,234.56" */
export function fmtKobo(kobo: number): string {
  return '₦' + (kobo / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format a WakaCreditUnit integer → "12,345 WC" */
export function fmtWC(wc: number): string {
  return wc.toLocaleString('en-NG') + ' WC';
}

/** ISO date string → readable "2 May 2026" */
export function fmtDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return iso; }
}

/** ISO date → "2 May 2026, 14:30" */
export function fmtDateTime(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-NG', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

/** "2024-01" → "Jan 2024" */
export function fmtPeriod(iso: string): string {
  if (!iso) return '—';
  try {
    // Handles "2024-01-01" or "2024-01"
    const d = new Date(iso + (iso.length === 7 ? '-01' : ''));
    return d.toLocaleDateString('en-NG', { month: 'short', year: 'numeric' });
  } catch { return iso; }
}

/** Returns initials from a name string (up to 2 chars) */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Pluralise: pluralise(1, "item") → "1 item"; pluralise(2, "item") → "2 items" */
export function pluralise(n: number, word: string, plural?: string): string {
  return `${n.toLocaleString()} ${n === 1 ? word : (plural ?? word + 's')}`;
}

/** Clamp number between min and max */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Truncate string to maxLen with ellipsis */
export function truncate(s: string, maxLen: number): string {
  return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s;
}
