/**
 * Shared pagination primitives.
 * Used by all entity repositories.
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
// ---------------------------------------------------------------------------

export function encodeCursor(id: string): string {
  return Buffer.from(id).toString('base64url');
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64url').toString('utf-8');
}
