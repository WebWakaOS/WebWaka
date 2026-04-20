/**
 * WebWaka API — Cloudflare Workers entry point (ARC-07)
 *
 * Route registration: apps/api/src/router.ts
 * Global middleware:  apps/api/src/middleware/index.ts
 *
 * Platform invariants enforced:
 *   T3  — tenant_id on all DB queries (via auth middleware context)
 *   T4  — integer kobo enforced by repository layer
 *   T5  — entitlement checks in entity create routes
 *   T6  — geography-driven discovery via /geography routes
 *   P6  — offline queue replay via /sync/apply (M7b)
 *   P9  — all float amounts validated as integer kobo (M7b)
 *   P10 — NDPR consent required before identity lookups (M7a)
 *   P11 — server-wins conflict on /sync/apply (M7b)
 *   R5  — 2/hour BVN/NIN rate limit (M7a)
 *   R8  — SMS mandatory for transaction OTPs (M7a)
 *   R9  — channel-level OTP rate limits (M7a)
 */

import { Hono } from 'hono';
import type { Env } from './env.js';
import { registerMiddleware } from './middleware/index.js';
import { registerRoutes } from './router.js';
import { runNegotiationExpiry } from './jobs/negotiation-expiry.js';
import { runOnboardingStalled } from './jobs/onboarding-stalled.js';

const app = new Hono<{ Bindings: Env }>();

registerMiddleware(app);
registerRoutes(app);

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------

app.onError((err, c) => {
  const authCtx = c.get('auth') as { userId?: string; tenantId?: string } | undefined;
  const structured = {
    level: 'error',
    service: 'webwaka-api',
    timestamp: new Date().toISOString(),
    error: {
      name: err instanceof Error ? err.name : 'UnknownError',
      message: err instanceof Error ? err.message : String(err),
      stack: c.env?.ENVIRONMENT === 'development' && err instanceof Error ? err.stack : undefined,
    },
    context: {
      route: c.req.path,
      method: c.req.method,
      tenantId: authCtx?.tenantId,
      environment: c.env?.ENVIRONMENT,
    },
  };
  console.error(JSON.stringify(structured));
  return c.json(
    {
      error: 'Internal server error',
      message: c.env?.ENVIRONMENT === 'development' && err instanceof Error ? err.message : undefined,
    },
    500,
  );
});

// ---------------------------------------------------------------------------
// 404 fallback
// ---------------------------------------------------------------------------

app.notFound((c) => {
  return c.json({ error: `Route not found: ${c.req.method} ${c.req.path}` }, 404);
});

// ---------------------------------------------------------------------------
// Cloudflare Workers entry point
// Exports both fetch handler (HTTP) and scheduled handler (CRON).
// ---------------------------------------------------------------------------

export default {
  fetch: app.fetch.bind(app),

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await runNegotiationExpiry(env);
    await runOnboardingStalled(env);
  },
};
