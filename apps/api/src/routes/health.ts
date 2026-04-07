/**
 * GET /health — liveness probe.
 * No authentication required.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';

const healthRoutes = new Hono<{ Bindings: Env }>();

healthRoutes.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'webwaka-api',
    environment: c.env.ENVIRONMENT ?? 'development',
    timestamp: new Date().toISOString(),
  });
});

export { healthRoutes };
