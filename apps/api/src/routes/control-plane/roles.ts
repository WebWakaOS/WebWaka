/**
 * Control Plane — Layer 3: Dynamic Roles & Permissions API
 *
 * GET    /platform-admin/cp/permissions         — list permission definitions
 * GET    /platform-admin/cp/roles               — list custom roles
 * POST   /platform-admin/cp/roles               — create custom role
 * GET    /platform-admin/cp/roles/:id           — get role with permissions
 * PATCH  /platform-admin/cp/roles/:id           — update role
 * POST   /platform-admin/cp/roles/:id/permissions — set role permissions
 */

import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { createControlPlane } from '@webwaka/control-plane';
import type { ActorContext } from '@webwaka/control-plane';

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

const roleRoutes = new Hono<{ Bindings: Env }>();

roleRoutes.get('/permissions', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const category = c.req.query('category');
  const scope = c.req.query('scope');
  const result = await cp.permissions.listPermissions({ category, scope });
  return c.json(result);
});

roleRoutes.get('/', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const auth = c.get('auth') as { tenantId?: string } | undefined;
  const roles = await cp.permissions.listRoles({ tenantId: auth?.tenantId, isActive: true });
  return c.json({ results: roles });
});

roleRoutes.post('/', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  const auth = c.get('auth') as { tenantId?: string } | undefined;
  const body = await c.req.json<{ code: string; name: string; description?: string; base_role?: string; max_grantable_role?: string }>();

  if (!body.code || !body.name) return c.json({ error: 'code and name are required' }, 400);

  const role = await cp.permissions.createRole(
    { ...body, tenant_id: auth?.tenantId },
    actor,
  );
  return c.json(role, 201);
});

roleRoutes.get('/:id', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const role = await cp.permissions.getRole(c.req.param('id'));
  if (!role) return c.json({ error: 'Role not found' }, 404);

  const perms = await c.env.DB
    .prepare(`SELECT pd.*, rpb.granted FROM role_permission_bindings rpb JOIN permission_definitions pd ON rpb.permission_id = pd.id WHERE rpb.role_id = ?`)
    .bind(role.id)
    .all<{ code: string; name: string; granted: number }>();

  return c.json({ ...role, permissions: perms.results });
});

roleRoutes.post('/:id/permissions', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  const body = await c.req.json<{ permission_ids: string[]; granted?: boolean }>();
  if (!Array.isArray(body.permission_ids)) return c.json({ error: 'permission_ids array required' }, 400);
  await cp.permissions.setRolePermissions(c.req.param('id'), body.permission_ids, body.granted !== false, actor);
  return c.json({ success: true });
});

export { roleRoutes };
