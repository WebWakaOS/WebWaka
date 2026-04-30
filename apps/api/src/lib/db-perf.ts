/**
 * Database Query Performance Wrapper (L-8)
 *
 * Wraps D1 queries with timing instrumentation.
 * Logs slow queries (>100ms) with execution details for optimization.
 *
 * Usage:
 *   import { instrumentedQuery } from './db-perf.js';
 *   const results = await instrumentedQuery(env.DB, 'SELECT * FROM tenants', []);
 */

export interface QueryMetrics {
  query: string;
  durationMs: number;
  rowCount: number;
  timestamp: string;
  slow: boolean;
}

const SLOW_QUERY_THRESHOLD_MS = 100;

/**
 * Execute a D1 query with timing instrumentation.
 * Logs slow queries for monitoring/alerting.
 */
export async function instrumentedQuery<T>(
  db: D1Database,
  query: string,
  params: unknown[] = [],
  context?: { requestId?: string; tenantId?: string },
): Promise<{ results: T[]; metrics: QueryMetrics }> {
  const start = performance.now();

  const stmt = db.prepare(query);
  const bound = params.length > 0 ? stmt.bind(...params) : stmt;
  const response = await bound.all<T>();

  const durationMs = performance.now() - start;
  const rowCount = response.results?.length || 0;
  const slow = durationMs > SLOW_QUERY_THRESHOLD_MS;

  const metrics: QueryMetrics = {
    query: truncateQuery(query),
    durationMs: Math.round(durationMs * 100) / 100,
    rowCount,
    timestamp: new Date().toISOString(),
    slow,
  };

  if (slow) {
    console.warn(JSON.stringify({
      event: 'slow_query',
      ...metrics,
      request_id: context?.requestId,
      tenant_id: context?.tenantId,
      // Include params count (not values) for debugging without PII
      param_count: params.length,
    }));
  }

  return { results: response.results || [], metrics };
}

/**
 * Execute a batch of queries with timing instrumentation.
 */
export async function instrumentedBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
  context?: { requestId?: string; tenantId?: string },
): Promise<{ durationMs: number }> {
  const start = performance.now();
  await db.batch(statements);
  const durationMs = performance.now() - start;

  if (durationMs > SLOW_QUERY_THRESHOLD_MS * 2) {
    console.warn(JSON.stringify({
      event: 'slow_batch',
      durationMs: Math.round(durationMs * 100) / 100,
      statementCount: statements.length,
      request_id: context?.requestId,
      tenant_id: context?.tenantId,
      timestamp: new Date().toISOString(),
    }));
  }

  return { durationMs };
}

/** Truncate long queries for safe logging (no PII in logged output) */
function truncateQuery(query: string): string {
  const cleaned = query.replace(/\s+/g, ' ').trim();
  return cleaned.length > 200 ? cleaned.slice(0, 197) + '...' : cleaned;
}
