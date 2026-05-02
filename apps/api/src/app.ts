/**
 * WebWaka API — Hono application factory (ARC-07)
 *
 * Separated from the Cloudflare Workers entry point (index.ts) so that
 * test files can import the Hono `app` instance directly without triggering
 * the `__vite_ssr_exportName__ is not defined` error caused by Vitest's SSR
 * interop wrapping `export default { fetch, scheduled }` object literals.
 *
 * Import in tests: `import app from './app.js'`
 * Import in worker entry: `import app from './app.js'`
 */

import { Hono } from 'hono';
import type { Env } from './env.js';
import { registerMiddleware } from './middleware/index.js';
import { registerRoutes } from './router.js';

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

export default app;
