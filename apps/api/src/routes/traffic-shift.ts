/**
 * Traffic Shift Admin Routes
 * 
 * Provides admin endpoints for monitoring and controlling
 * the gradual traffic shift from legacy to engine routes.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/require-role.js';
import {
  getTrafficShiftMetrics,
  getCanaryHealthMetrics,
  resetTrafficShiftMetrics,
  TRAFFIC_SHIFT_CONFIGS,
} from '../middleware/traffic-shift.js';

const app = new Hono<{ Bindings: Env }>();

/**
 * Get current traffic shift configuration and metrics
 * GET /admin/traffic-shift
 */
app.get('/', authMiddleware, requireRole('admin'), async (c) => {
  const metrics = getTrafficShiftMetrics();
  
  return c.json({
    current: metrics,
    environments: TRAFFIC_SHIFT_CONFIGS,
    activeEnvironment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Get traffic shift metrics only
 * GET /admin/traffic-shift/metrics
 */
app.get('/metrics', authMiddleware, requireRole('admin'), async (c) => {
  const metrics = getTrafficShiftMetrics();
  return c.json(metrics);
});

/**
 * Reset traffic shift metrics
 * POST /admin/traffic-shift/metrics/reset
 */
app.post('/metrics/reset', authMiddleware, requireRole('admin'), async (c) => {
  resetTrafficShiftMetrics();
  return c.json({
    success: true,
    message: 'Traffic shift metrics reset',
  });
});

/**
 * Update traffic shift percentage (runtime configuration)
 * POST /admin/traffic-shift/percentage
 * Body: { percentage: number }
 * 
 * Note: This updates in-memory config only.
 * For persistent changes, update TRAFFIC_SHIFT_CONFIGS in code.
 */
app.post('/percentage', authMiddleware, requireRole('super_admin'), async (c) => {
  const body = await c.req.json();
  const { percentage } = body;

  if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
    return c.json({
      error: 'Invalid percentage',
      message: 'Percentage must be a number between 0 and 100',
    }, 400);
  }

  const env = process.env.NODE_ENV || 'development';
  const config = TRAFFIC_SHIFT_CONFIGS[env];

  if (!config) {
    return c.json({
      error: 'Environment not found',
      message: `No configuration for environment: ${env}`,
    }, 404);
  }

  // Update in-memory config
  config.percentage = percentage;

  return c.json({
    success: true,
    message: `Traffic shift percentage updated to ${percentage}%`,
    config,
    warning: 'This is a runtime change only. Update code for persistent changes.',
  });
});

/**
 * Enable/disable traffic shift
 * POST /admin/traffic-shift/toggle
 * Body: { enabled: boolean }
 */
app.post('/toggle', authMiddleware, requireRole('super_admin'), async (c) => {
  const body = await c.req.json();
  const { enabled } = body;

  if (typeof enabled !== 'boolean') {
    return c.json({
      error: 'Invalid enabled value',
      message: 'enabled must be a boolean',
    }, 400);
  }

  const env = process.env.NODE_ENV || 'development';
  const config = TRAFFIC_SHIFT_CONFIGS[env];

  if (!config) {
    return c.json({
      error: 'Environment not found',
      message: `No configuration for environment: ${env}`,
    }, 404);
  }

  config.enabled = enabled;

  return c.json({
    success: true,
    message: `Traffic shift ${enabled ? 'enabled' : 'disabled'}`,
    config,
    warning: 'This is a runtime change only. Update code for persistent changes.',
  });
});

/**
 * Update allowed verticals for traffic shift
 * POST /admin/traffic-shift/verticals
 * Body: { verticals: string[] }
 */
app.post('/verticals', authMiddleware, requireRole('super_admin'), async (c) => {
  const body = await c.req.json();
  const { verticals } = body;

  if (!Array.isArray(verticals) || !verticals.every(v => typeof v === 'string')) {
    return c.json({
      error: 'Invalid verticals',
      message: 'verticals must be an array of strings',
    }, 400);
  }

  const env = process.env.NODE_ENV || 'development';
  const config = TRAFFIC_SHIFT_CONFIGS[env];

  if (!config) {
    return c.json({
      error: 'Environment not found',
      message: `No configuration for environment: ${env}`,
    }, 404);
  }

  config.verticals = verticals;

  return c.json({
    success: true,
    message: `Traffic shift verticals updated`,
    config,
    warning: 'This is a runtime change only. Update code for persistent changes.',
  });
});



/**
 * M-2: Canary health status — structured latency + error-rate signals
 * GET /admin/canary-status
 *
 * Returns P50/P95 latency and error rates for both engine and legacy cohorts,
 * plus an overall health classification (healthy | degraded | critical).
 */
app.get('/canary-status', authMiddleware, requireRole('admin'), async (c) => {
  const metrics = getCanaryHealthMetrics();
  return c.json(metrics, metrics.health === 'critical' ? 503 : 200);
});

export default app;
