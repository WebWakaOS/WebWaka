/**
 * Structured error logging middleware — P20-E
 *
 * Emits a JSON log line for every 4xx and 5xx response, enabling
 * operational visibility into error patterns without touching business logic.
 *
 * Log shape:
 * {
 *   level:       'warn' | 'error',
 *   event:       'http_error',
 *   status:      number,
 *   method:      string,
 *   route:       string,
 *   duration_ms: number,
 *   tenantId:    string | null,
 *   userId:      string | null,
 *   timestamp:   string (ISO-8601),
 * }
 *
 * 4xx → level 'warn'; 5xx → level 'error'
 *
 * Logs are emitted via console.error so they are captured by the
 * Cloudflare Workers structured logging pipeline.
 */

import { createMiddleware } from 'hono/factory';
import type { Env } from '../env.js';

interface AuthShape {
  userId?: string;
  tenantId?: string;
}

export const errorLogMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const start = Date.now();
  await next();

  const status = c.res.status;
  if (status < 400) return; // Only log errors

  const auth = c.get('auth') as AuthShape | undefined;
  const duration = Date.now() - start;
  const level = status >= 500 ? 'error' : 'warn';

  console.error(JSON.stringify({
    level,
    event: 'http_error',
    status,
    method: c.req.method,
    route: c.req.routePath ?? c.req.path,
    path: c.req.path,
    duration_ms: duration,
    tenantId: auth?.tenantId ?? null,
    userId: auth?.userId ?? null,
    timestamp: new Date().toISOString(),
  }));
});
