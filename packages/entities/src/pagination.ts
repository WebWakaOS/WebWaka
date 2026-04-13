/**
 * Shared pagination primitives.
 * Used by all entity repositories.
 *
 * T004: Edge runtime compatible — uses TextEncoder/atob/btoa instead of Node.js Buffer.
 */

export interface PaginationOptions {
  /** Maximum number of results to return */
  limit: number;
  /** Opaque cursor for the next page (base64-encoded last ID + sort key) */
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  /** Cursor for the next page. null if no more results. */
  nextCursor: string | null;
  /** Total row count (optional — only when COUNT(*) was feasible) */
  total?: number;
}

// ---------------------------------------------------------------------------
// Cursor helpers (ID-based cursor pagination — safe for distributed IDs)
// T004: Uses btoa/atob (Web Crypto) — NOT Node.js Buffer (unavailable in CF Workers)
// ---------------------------------------------------------------------------

export function encodeCursor(id: string): string {
  const b64 = btoa(encodeURIComponent(id));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function decodeCursor(cursor: string): string {
  const padded = cursor.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const padded2 = pad ? padded + '='.repeat(4 - pad) : padded;
  return decodeURIComponent(atob(padded2));
}
