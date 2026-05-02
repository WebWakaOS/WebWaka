/**
 * Correlation ID Middleware — Wave 3 (C6-1)
 * WebWaka OS — Propagates or generates X-Correlation-ID for every request.
 *
 * Behaviour:
 *   1. Read X-Correlation-ID from inbound request headers.
 *   2. If absent, generate a new UUID v4.
 *   3. Set it on Hono context as 'correlationId' so all handlers/services can read it.
 *   4. Echo it back in the response headers.
 *
 * Usage in route handler:
 *   const correlationId = c.get('correlationId') as string;
 *
 * Structured logs should include correlationId for distributed tracing.
 */

import type { Context, Next } from 'hono';

export async function correlationIdMiddleware(c: Context, next: Next): Promise<void> {
  const incoming = c.req.header('x-correlation-id');
  const correlationId = (incoming && incoming.length <= 64)
    ? incoming
    : crypto.randomUUID();

  c.set('correlationId', correlationId);

  await next();

  // Echo in response (safe to set after next())
  c.res.headers.set('X-Correlation-ID', correlationId);
}
