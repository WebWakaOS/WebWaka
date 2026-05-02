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
 *
 * NOTE: The Hono `app` instance lives in ./app.ts.
 *       Tests should import from './app.js' to avoid the Vitest SSR interop issue
 *       (`__vite_ssr_exportName__ is not defined`) caused by this file's
 *       `export default { fetch, scheduled }` object-literal export.
 */

import type { Env } from './env.js';
import app from './app.js';
import { runNegotiationExpiry } from './jobs/negotiation-expiry.js';
import { runOnboardingStalled } from './jobs/onboarding-stalled.js';

// ---------------------------------------------------------------------------
// Cloudflare Workers entry point
// Exports both fetch handler (HTTP) and scheduled handler (CRON).
// ---------------------------------------------------------------------------

export default {
  fetch: app.fetch.bind(app),

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    // Each job is wrapped independently so a failure in one does not prevent
    // the others from running (Cloudflare scheduled handlers must not throw).
    try {
      await runNegotiationExpiry(env);
    } catch (err) {
      console.error('[scheduled] runNegotiationExpiry threw unexpectedly:', err);
    }
    try {
      await runOnboardingStalled(env);
    } catch (err) {
      console.error('[scheduled] runOnboardingStalled threw unexpectedly:', err);
    }
  },
};
