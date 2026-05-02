/**
 * Request Timing Middleware — Wave 3 C2-4
 * (ADR-0045: structured log drain to Cloudflare Logpush)
 *
 * Injects structured JSON timing logs on every request:
 *
 *   {
 *     "ts":          "<ISO-8601>",
 *     "level":       "info",
 *     "event":       "request_completed",
 *     "method":      "POST",
 *     "path":        "/v1/superagent/chat",
 *     "status":      200,
 *     "duration_ms": 147,
 *     "tenant_id":   "tenant_abc" | null,
 *     "cf_ray":      "<CF-Ray header>" | null,
 *     "worker":      "webwaka-api"
 *   }
 *
 * Usage (Hono):
 *   import { timingMiddleware } from '@/middleware/timing.js';
 *   app.use('*', timingMiddleware);
 *
 * P8: Never log Authorization headers or API keys.
 * P13: Never log request/response bodies (PII risk).
 */

import type { MiddlewareHandler } from 'hono';

const WORKER_NAME = 'webwaka-api';

export const timingMiddleware: MiddlewareHandler = async (ctx, next) => {
  const startMs = Date.now();
  const method = ctx.req.method;
  const path = new URL(ctx.req.url).pathname;

  await next();

  const durationMs = Date.now() - startMs;
  const status = ctx.res.status;
  // Tenant ID comes from JWT claims injected by auth middleware
  const tenantId = (ctx.get('tenantId') as string | undefined) ?? null;
  const cfRay = ctx.req.header('CF-Ray') ?? null;

  // Structured log — consumed by Cloudflare Logpush → external sink
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
    event: 'request_completed',
    method,
    path,
    status,
    duration_ms: durationMs,
    tenant_id: tenantId,
    cf_ray: cfRay,
    worker: WORKER_NAME,
  }));
};

export default timingMiddleware;
