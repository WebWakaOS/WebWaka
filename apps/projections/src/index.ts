/**
 * apps/projections — Cloudflare Workers event processor.
 *
 * Consumes from Cloudflare Queue (M7+) or is triggered via a Scheduled Worker
 * (cron) to rebuild search index projections from the event_log.
 *
 * In M6: exposes an HTTP API for manual rebuild + analytics snapshot.
 *
 * Routes:
 *   GET  /health                      — liveness probe
 *   POST /rebuild/search              — rebuild search index from events (inter-service auth required)
 *   POST /rebuild/analytics           — rebuild analytics snapshot stub (inter-service auth required)
 *   GET  /events/:aggregate/:id       — fetch events for an aggregate
 *
 * Milestone 6 — Event Bus Layer
 * SEC-009: POST /rebuild/* require X-Inter-Service-Secret header (INTER_SERVICE_SECRET env var).
 *   Unauthenticated callers receive 401. This guards against arbitrary D1 rebuild triggers.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { createCorsConfig } from '@webwaka/shared-config';
import {
  rebuildSearchIndexFromEvents,
  getAggregateEvents,
} from '@webwaka/events';

interface Env {
  DB: D1Database;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  ALLOWED_ORIGINS?: string;
  /**
   * SEC-009: Shared secret for inter-service calls to mutation endpoints.
   * Set via `wrangler secret put INTER_SERVICE_SECRET` per deployment.
   * Required for POST /rebuild/* routes.
   */
  INTER_SERVICE_SECRET: string;
}

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', secureHeaders());
// SEC-02 + SEC-08 + ARC-05: Use shared CORS config with environment-aware localhost gating
app.use('*', async (c, next) => {
  const config = createCorsConfig({
    environment: c.env.ENVIRONMENT,
    ...(c.env.ALLOWED_ORIGINS !== undefined ? { allowedOriginsEnv: c.env.ALLOWED_ORIGINS } : {}),
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  });
  return cors(config)(c, next);
});

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

app.get('/health', (c) => c.json({ status: 'ok', app: 'projections' }));

// ---------------------------------------------------------------------------
// Inter-service auth helper (SEC-009)
// POST mutation routes must include X-Inter-Service-Secret matching env var.
// ---------------------------------------------------------------------------

function verifyInterServiceSecret(
  secret: string | undefined,
  expected: string | undefined,
): boolean {
  if (!expected) return false;
  if (!secret) return false;
  return secret === expected;
}

// ---------------------------------------------------------------------------
// Rebuild search index — POST /rebuild/search
// SEC-009: Requires X-Inter-Service-Secret header.
// ---------------------------------------------------------------------------

app.post('/rebuild/search', async (c) => {
  const provided = c.req.header('X-Inter-Service-Secret');
  if (!verifyInterServiceSecret(provided, c.env.INTER_SERVICE_SECRET)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const db = c.env.DB as unknown as D1Like;

  const start = Date.now();
  const result = await rebuildSearchIndexFromEvents(db);
  const durationMs = Date.now() - start;

  if (result.errors.length > 0) {
    console.error('[projections] rebuild/search errors:', result.errors);
  }

  return c.json({ ...result, durationMs }, result.errors.length > 0 ? 207 : 200);
});

// ---------------------------------------------------------------------------
// Rebuild analytics snapshot — POST /rebuild/analytics (stub for M7)
// SEC-009: Requires X-Inter-Service-Secret header.
// ---------------------------------------------------------------------------

app.post('/rebuild/analytics', async (c) => {
  const provided = c.req.header('X-Inter-Service-Secret');
  if (!verifyInterServiceSecret(provided, c.env.INTER_SERVICE_SECRET)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // In M7 this will aggregate event_log into analytics_snapshots.
  // For M6 we acknowledge + return a stub response.
  return c.json({
    status: 'scheduled',
    message: 'Analytics rebuild queued (stub — full implementation in M7)',
  });
});

// ---------------------------------------------------------------------------
// Aggregate event history — GET /events/:aggregate/:id
// SEC-009: Requires X-Inter-Service-Secret header.
// Event payloads may contain financial data (payment amounts) — not public.
// ---------------------------------------------------------------------------

app.get('/events/:aggregate/:id', async (c) => {
  const provided = c.req.header('X-Inter-Service-Secret');
  if (!verifyInterServiceSecret(provided, c.env.INTER_SERVICE_SECRET)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const aggregate = c.req.param('aggregate');
  const aggregateId = c.req.param('id');
  const db = c.env.DB as unknown as D1Like;

  const events = await getAggregateEvents(db, aggregate, aggregateId);

  return c.json({ aggregate, aggregateId, events, total: events.length });
});

export default app;
