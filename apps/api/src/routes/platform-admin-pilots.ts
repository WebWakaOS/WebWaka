/**
 * Platform-admin pilot rollout routes — Wave 4 / Milestone 11
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ROUTES (all require super_admin role)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   POST   /platform-admin/pilots/operators
 *     — Enrol a new pilot operator (status = invited).
 *
 *   GET    /platform-admin/pilots/operators
 *     — List all operators; optional ?cohort=cohort_1 or ?status=active filters.
 *
 *   GET    /platform-admin/pilots/operators/summary
 *     — Count of operators by status (invited, onboarding, active, churned, graduated).
 *
 *   PATCH  /platform-admin/pilots/operators/:tenantId/status
 *     — Transition an operator's status (invited → onboarding → active → graduated|churned).
 *
 *   POST   /platform-admin/pilots/flags
 *     — Grant a per-tenant feature flag override.
 *
 *   DELETE /platform-admin/pilots/flags/:tenantId/:flagName
 *     — Revoke a specific feature flag for a tenant.
 *
 *   GET    /platform-admin/pilots/flags/:tenantId
 *     — List all feature flags for a specific tenant.
 *
 *   GET    /platform-admin/pilots/feedback/summary
 *     — NPS + feedback type breakdown; optional ?since=ISO8601 query param.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Security: all routes are behind requireRole('super_admin') applied at mount.
 * T3: PilotOperatorService queries include tenant_id in WHERE; no cross-tenant leaks.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import {
  PilotOperatorService,
  PilotFlagService,
  PilotFeedbackService,
} from '@webwaka/pilot';
import type { PilotOperatorStatus, CreatePilotOperatorInput } from '@webwaka/pilot';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

const VALID_STATUSES: PilotOperatorStatus[] = [
  'invited', 'onboarding', 'active', 'churned', 'graduated',
];

export function pilotAdminRoutes() {
  const app = new Hono<AppEnv>();

  // ── Operators ─────────────────────────────────────────────────────────────

  app.post('/operators', async (c) => {
    const body = await c.req.json<CreatePilotOperatorInput>();

    if (!body.tenant_id || !body.workspace_id || !body.vertical_slug || !body.operator_name) {
      return c.json({
        error: 'tenant_id, workspace_id, vertical_slug, and operator_name are required',
        code: 'INVALID_INPUT',
      }, 422);
    }

    const svc = new PilotOperatorService(c.env.DB);
    try {
      const operator = await svc.enrol(body);
      return c.json({ operator }, 201);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('UNIQUE')) {
        return c.json({ error: 'Tenant is already enrolled as a pilot operator', code: 'CONFLICT' }, 409);
      }
      throw err;
    }
  });

  app.get('/operators', async (c) => {
    const svc = new PilotOperatorService(c.env.DB);
    const cohort = c.req.query('cohort');
    const status = c.req.query('status') as PilotOperatorStatus | undefined;

    if (status && !VALID_STATUSES.includes(status)) {
      return c.json({ error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_INPUT' }, 422);
    }

    const operators = status
      ? await svc.listByStatus(status)
      : cohort
        ? await svc.listByCohort(cohort)
        : await svc.listByStatus('invited')
            .then(async (inv) => [
              ...inv,
              ...(await svc.listByStatus('onboarding')),
              ...(await svc.listByStatus('active')),
            ]);

    return c.json({ operators, count: operators.length });
  });

  app.get('/operators/summary', async (c) => {
    const svc = new PilotOperatorService(c.env.DB);
    const summary = await svc.summary();
    const total = Object.values(summary).reduce((a, b) => a + b, 0);
    return c.json({ summary, total });
  });

  app.patch('/operators/:tenantId/status', async (c) => {
    const tenantId = c.req.param('tenantId');
    const body = await c.req.json<{ status: PilotOperatorStatus }>();

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return c.json({ error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_INPUT' }, 422);
    }

    const svc = new PilotOperatorService(c.env.DB);
    const existing = await svc.get(tenantId);
    if (!existing) {
      return c.json({ error: 'Pilot operator not found', code: 'NOT_FOUND' }, 404);
    }

    await svc.transition(tenantId, body.status);
    return c.json({ ok: true, tenant_id: tenantId, status: body.status });
  });

  // ── Feature Flags ──────────────────────────────────────────────────────────

  app.post('/flags', async (c) => {
    const auth = c.get('auth');
    const body = await c.req.json<{
      tenant_id: string;
      flag_name: string;
      enabled?: boolean;
      expires_at?: string;
      reason?: string;
    }>();

    if (!body.tenant_id || !body.flag_name) {
      return c.json({ error: 'tenant_id and flag_name are required', code: 'INVALID_INPUT' }, 422);
    }

    const svc = new PilotFlagService(c.env.DB);
    await svc.grant({
      tenant_id: body.tenant_id,
      flag_name: body.flag_name,
      enabled: body.enabled,
      expires_at: body.expires_at,
      reason: body.reason,
      granted_by: auth.userId,
    });

    return c.json({ ok: true, tenant_id: body.tenant_id, flag_name: body.flag_name });
  });

  app.delete('/flags/:tenantId/:flagName', async (c) => {
    const tenantId = c.req.param('tenantId');
    const flagName = c.req.param('flagName');

    const svc = new PilotFlagService(c.env.DB);
    await svc.revoke(tenantId, flagName);
    return c.json({ ok: true, tenant_id: tenantId, flag_name: flagName });
  });

  app.get('/flags/:tenantId', async (c) => {
    const tenantId = c.req.param('tenantId');
    const svc = new PilotFlagService(c.env.DB);
    const flags = await svc.listForTenant(tenantId);
    return c.json({ flags, tenant_id: tenantId });
  });

  // ── Feedback ──────────────────────────────────────────────────────────────

  app.get('/feedback/summary', async (c) => {
    const since = c.req.query('since');
    const svc = new PilotFeedbackService(c.env.DB);
    const summary = await svc.summary(since);
    return c.json({ summary, since: since ?? null });
  });

  return app;
}
