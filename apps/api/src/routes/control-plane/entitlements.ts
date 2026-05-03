/**
 * Control Plane — Layer 2: Dynamic Entitlements API
 *
 * GET    /platform-admin/cp/entitlements                        — list definitions
 * POST   /platform-admin/cp/entitlements                        — create definition
 * PATCH  /platform-admin/cp/entitlements/:id                    — update definition
 * GET    /platform-admin/cp/plans/:pkgId/entitlements           — get package bindings
 * PUT    /platform-admin/cp/plans/:pkgId/entitlements/:entId    — set binding
 * DELETE /platform-admin/cp/plans/:pkgId/entitlements/:entId    — remove binding
 * GET    /platform-admin/cp/workspaces/:wId/entitlements        — resolve for workspace
 * PUT    /platform-admin/cp/workspaces/:wId/entitlements/:entId — set workspace override
 */

import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { createControlPlane } from '@webwaka/control-plane';
import { resolveActor } from './resolve-actor.js';

const entitlementRoutes = new Hono<{ Bindings: Env }>();

entitlementRoutes.get('/', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const category = c.req.query('category');
  const limit = parseInt(c.req.query('limit') ?? '100', 10);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);
  const result = await cp.entitlements.listDefinitions({ category, limit, offset });
  return c.json(result);
});

entitlementRoutes.post('/', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  const body = await c.req.json<{ code: string; name: string; description?: string; category?: string; value_type?: string; default_value?: string; unit?: string }>();
  if (!body.code || !body.name) return c.json({ error: 'code and name are required' }, 400);
  const def = await cp.entitlements.createDefinition(body as Parameters<typeof cp.entitlements.createDefinition>[0], actor);
  return c.json(def, 201);
});

entitlementRoutes.patch('/:id', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  const body = await c.req.json<{ name?: string; description?: string; default_value?: string; is_active?: number; sort_order?: number }>();
  const updated = await cp.entitlements.updateDefinition(c.req.param('id'), body, actor);
  return c.json(updated);
});

entitlementRoutes.get('/packages/:pkgId', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const bindings = await cp.entitlements.getPackageEntitlements(c.req.param('pkgId'));
  return c.json({ results: bindings });
});

entitlementRoutes.put('/packages/:pkgId/:entId', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  const body = await c.req.json<{ value: string }>();
  if (body.value === undefined) return c.json({ error: 'value is required' }, 400);
  await cp.entitlements.setPackageEntitlement(c.req.param('pkgId'), c.req.param('entId'), body.value, actor);
  return c.json({ success: true });
});

entitlementRoutes.delete('/packages/:pkgId/:entId', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  await cp.entitlements.removePackageEntitlement(c.req.param('pkgId'), c.req.param('entId'), actor);
  return c.json({ success: true });
});

entitlementRoutes.get('/workspaces/:workspaceId', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const planSlug = c.req.query('plan') ?? 'free';
  const resolved = await cp.entitlements.resolveForWorkspace(c.req.param('workspaceId'), planSlug);
  return c.json({ workspace_id: c.req.param('workspaceId'), plan: planSlug, entitlements: resolved });
});

entitlementRoutes.put('/workspaces/:workspaceId/:entId', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  const auth = c.get('auth') as { userId: string; tenantId?: string } | undefined;
  const body = await c.req.json<{ value: string; reason?: string; expires_at?: number }>();
  if (body.value === undefined) return c.json({ error: 'value is required' }, 400);

  await cp.entitlements.setWorkspaceOverride(
    c.req.param('workspaceId'),
    auth?.tenantId ?? '',
    c.req.param('entId'),
    body.value,
    actor.actorId,
    { reason: body.reason, expiresAt: body.expires_at },
    actor,
  );
  return c.json({ success: true });
});

export { entitlementRoutes };
