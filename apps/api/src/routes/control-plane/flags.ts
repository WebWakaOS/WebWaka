/**
 * Control Plane — Layer 5: Feature Flags & Runtime Config API
 *
 * GET    /platform-admin/cp/flags                    — list all flags
 * POST   /platform-admin/cp/flags                    — create flag
 * GET    /platform-admin/cp/flags/:id                — get flag
 * PATCH  /platform-admin/cp/flags/:id                — update flag
 * PUT    /platform-admin/cp/flags/:id/override       — set scoped override
 * DELETE /platform-admin/cp/flags/:id/override       — remove scoped override
 * GET    /platform-admin/cp/flags/resolve            — resolve all flags for context
 * GET    /platform-admin/cp/delegation/capabilities  — list delegation capabilities
 * GET    /platform-admin/cp/delegation/policies      — list delegation policies
 * POST   /platform-admin/cp/delegation/policies      — create delegation policy
 */

import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { createControlPlane } from '@webwaka/control-plane';
import type { ActorContext, FlagResolutionContext } from '@webwaka/control-plane';

function resolveActor(c: { get: (k: string) => unknown }): ActorContext {
  const auth = c.get('auth') as { userId: string; tenantId?: string; role?: string } | undefined;
  return {
    actorId: auth?.userId ?? 'system',
    actorRole: auth?.role ?? 'super_admin',
    actorLevel: 'super_admin',
    tenantId: auth?.tenantId,
    requestId: crypto.randomUUID(),
  };
}

const flagRoutes = new Hono<{ Bindings: Env }>();

flagRoutes.get('/', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const category = c.req.query('category');
  const isActive = c.req.query('is_active') !== 'false';
  const limit = parseInt(c.req.query('limit') ?? '100', 10);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);
  const result = await cp.flags.listFlags({ category, isActive, limit, offset });
  return c.json(result);
});

flagRoutes.get('/resolve', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const auth = c.get('auth') as { tenantId?: string; workspaceId?: string } | undefined;
  const ctx: FlagResolutionContext = {
    tenantId: c.req.query('tenant_id') ?? auth?.tenantId,
    workspaceId: c.req.query('workspace_id') ?? auth?.workspaceId,
    partnerId: c.req.query('partner_id'),
    planSlug: c.req.query('plan'),
    environment: c.env.ENVIRONMENT,
  };
  const resolved = await cp.flags.resolveAll(ctx);
  return c.json({ context: ctx, flags: resolved });
});

flagRoutes.post('/', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const actor = resolveActor(c);
  const body = await c.req.json<{ code: string; name: string; description?: string; category?: string; value_type?: string; default_value?: string; min_scope?: string; is_kill_switch?: boolean; rollout_pct?: number }>();
  if (!body.code || !body.name) return c.json({ error: 'code and name are required' }, 400);
  const flag = await cp.flags.createFlag(body, actor);
  return c.json(flag, 201);
});

flagRoutes.get('/:id', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const flag = await cp.flags.getFlag(c.req.param('id'));
  if (!flag) return c.json({ error: 'Flag not found' }, 404);

  const overrides = await c.env.DB
    .prepare('SELECT * FROM configuration_overrides WHERE flag_id = ? AND is_active = 1 ORDER BY scope, scope_id')
    .bind(flag.id)
    .all<unknown>();

  return c.json({ ...flag, overrides: overrides.results });
});

flagRoutes.patch('/:id', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const actor = resolveActor(c);
  const body = await c.req.json<{ name?: string; description?: string; default_value?: string; is_active?: number; rollout_pct?: number; notes?: string }>();
  const updated = await cp.flags.updateFlag(c.req.param('id'), body, actor);
  return c.json(updated);
});

flagRoutes.put('/:id/override', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const actor = resolveActor(c);
  const body = await c.req.json<{ scope: string; scope_id: string; value: string; reason?: string; expires_at?: number }>();
  if (!body.scope || !body.scope_id || body.value === undefined) {
    return c.json({ error: 'scope, scope_id, and value are required' }, 400);
  }
  await cp.flags.setOverride(c.req.param('id'), body.scope, body.scope_id, body.value, actor, { reason: body.reason, expiresAt: body.expires_at });
  return c.json({ success: true });
});

flagRoutes.delete('/:id/override', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const actor = resolveActor(c);
  const body = await c.req.json<{ scope: string; scope_id: string }>().catch(() => ({ scope: '', scope_id: '' }));
  await cp.flags.removeOverride(c.req.param('id'), body.scope, body.scope_id, actor);
  return c.json({ success: true });
});

flagRoutes.get('/delegation/capabilities', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const caps = await cp.delegation.listCapabilities();
  return c.json({ results: caps });
});

flagRoutes.get('/delegation/policies', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const policies = await cp.delegation.listPolicies({
    grantorLevel: c.req.query('grantor_level'),
    granteeLevel: c.req.query('grantee_level'),
    capability: c.req.query('capability'),
  });
  return c.json({ results: policies });
});

flagRoutes.post('/delegation/policies', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const actor = resolveActor(c);
  const body = await c.req.json<{ grantor_level: string; grantee_level: string; capability: string; effect?: 'allow' | 'deny'; grantee_id?: string; ceiling_json?: string; requires_approval?: boolean }>();
  if (!body.grantor_level || !body.grantee_level || !body.capability) {
    return c.json({ error: 'grantor_level, grantee_level, and capability are required' }, 400);
  }
  const policy = await cp.delegation.createPolicy(body, actor);
  return c.json(policy, 201);
});

export { flagRoutes };
