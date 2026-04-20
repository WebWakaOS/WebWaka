/**
 * @webwaka/notifications — D1LikeFull duck-typed interface.
 *
 * Extended from the minimal D1Like in consumer.ts to support D1 reads
 * (first<T> and all<T>) needed by Phase 2 service layer.
 *
 * Structurally compatible with Cloudflare D1Database. No CF SDK imports —
 * all implementations must satisfy this shape (including test fakes).
 *
 * Guardrails:
 *   G1 — all callers must include tenant_id in WHERE clauses
 */

export interface D1BoundStatement {
  run(): Promise<{ success: boolean }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}

export interface D1Statement {
  bind(...args: unknown[]): D1BoundStatement;
}

export interface D1LikeFull {
  prepare(query: string): D1Statement;
}
