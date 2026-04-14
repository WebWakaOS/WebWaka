/**
 * Global middleware registration (ARC-07 index.ts split)
 *
 * Call registerMiddleware(app) once during app initialisation.
 * These are the `app.use('*', ...)` handlers that apply to every request.
 * Route-specific middleware (auth, audit-log, billing-enforcement) is
 * registered per-route in apps/api/src/router.ts.
 */

import type { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { bodyLimit } from 'hono/body-limit';
import { compress } from 'hono/compress';
import { createCorsConfig } from '@webwaka/shared-config';
import type { Env } from '../env.js';
import { contentTypeValidationMiddleware } from './content-type-validation.js';
import { csrfMiddleware } from './csrf.js';
import { rateLimitMiddleware } from './rate-limit.js';
import { monitoringMiddleware } from './monitoring.js';
import { lowDataMiddleware } from './low-data.js';
import { errorLogMiddleware } from './error-log.js';

export function registerMiddleware(app: Hono<{ Bindings: Env }>): void {
  app.use('*', secureHeaders());

  // ARC-19: Request correlation IDs for structured log tracing (must run before monitoring)
  app.use('*', async (c, next) => {
    const requestId = c.req.header('X-Request-ID') ?? crypto.randomUUID();
    c.set('requestId', requestId);
    c.header('X-Request-ID', requestId);
    await next();
  });

  // DEV-04: Monitoring middleware — tracks latency, error rates, alerting webhook
  app.use('*', monitoringMiddleware);

  // P20-E: Structured error logging — emits JSON for every 4xx/5xx response
  app.use('*', errorLogMiddleware);

  // PERF-06: Response compression for JSON-heavy endpoints (gzip, threshold 1KB)
  // Only compress when client explicitly requests it (Accept-Encoding check)
  const gzipMiddleware = compress({ encoding: 'gzip' });
  app.use('*', async (c, next) => {
    const acceptEncoding = c.req.header('Accept-Encoding') ?? '';
    if (acceptEncoding.includes('gzip')) {
      return gzipMiddleware(c, next);
    }
    await next();
  });

  // SEC-13: Enforce request body size limit (256KB) to prevent oversized payloads
  app.use('*', bodyLimit({ maxSize: 256 * 1024 }));

  // ARC-05 + SEC-08: Use shared CORS config with environment-aware localhost gating
  app.use('*', async (c, next) => {
    const config = createCorsConfig({
      environment: c.env?.ENVIRONMENT,
      allowedOriginsEnv: c.env?.ALLOWED_ORIGINS,
    });
    return cors({
      ...config,
      exposeHeaders: ['X-Request-Id'],
    })(c, next);
  });

  app.use('*', logger());

  // M7e: Low-data mode — strips media_urls from JSON responses when X-Low-Data: 1 (P4/P6)
  app.use('*', lowDataMiddleware);

  // T006: Global rate limiting — 100 req/60s per IP before auth (R5)
  app.use('*', rateLimitMiddleware({ keyPrefix: 'global', maxRequests: 100, windowSeconds: 60 }));

  // SEC-18: Content-Type validation — reject mutating requests without proper Content-Type
  app.use('*', contentTypeValidationMiddleware);

  // SEC-12: CSRF protection — verify Origin/Referer on mutating requests
  app.use('*', csrfMiddleware);
}
