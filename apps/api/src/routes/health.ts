/**
 * GET /health           — liveness probe.
 * GET /health/version   — version endpoint (also mirrored at root GET /version via index.ts).
 * GET /health/ready     — readiness probe with dependency checks (DEV-04).
 * No authentication required.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { getErrorRateMetrics } from '../middleware/monitoring.js';

export const API_VERSION = '1.0.1';

const healthRoutes = new Hono<{ Bindings: Env }>();

healthRoutes.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'webwaka-api',
    environment: c.env.ENVIRONMENT ?? 'development',
    timestamp: new Date().toISOString(),
  });
});

healthRoutes.get('/version', (c) => c.json({ version: API_VERSION }));

healthRoutes.get('/ready', async (c) => {
  const checks: Record<string, { status: string; latency_ms?: number; error?: string }> = {};

  const dbStart = Date.now();
  try {
    const result = await c.env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>();
    checks.d1 = {
      status: result?.ok === 1 ? 'healthy' : 'degraded',
      latency_ms: Date.now() - dbStart,
    };
  } catch (err) {
    checks.d1 = {
      status: 'unhealthy',
      latency_ms: Date.now() - dbStart,
      error: err instanceof Error ? err.message : 'D1 query failed',
    };
  }

  const kvStart = Date.now();
  try {
    await c.env.GEOGRAPHY_CACHE.get('__health_check__');
    checks.kv = { status: 'healthy', latency_ms: Date.now() - kvStart };
  } catch (err) {
    checks.kv = {
      status: 'unhealthy',
      latency_ms: Date.now() - kvStart,
      error: err instanceof Error ? err.message : 'KV read failed',
    };
  }

  const errorMetrics = getErrorRateMetrics();
  checks.error_rate = {
    status: errorMetrics.count < 50 ? 'healthy' : 'degraded',
  };

  const allHealthy = Object.values(checks).every((ch) => ch.status === 'healthy');
  const anyUnhealthy = Object.values(checks).some((ch) => ch.status === 'unhealthy');

  const overallStatus = anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded';

  c.status(overallStatus === 'unhealthy' ? 503 : 200);
  return c.json({
    status: overallStatus,
    service: 'webwaka-api',
    version: API_VERSION,
    environment: c.env.ENVIRONMENT ?? 'development',
    timestamp: new Date().toISOString(),
    checks,
  });
});

export { healthRoutes };
