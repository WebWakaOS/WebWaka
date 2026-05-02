/**
 * Control Plane — Layer 3 cont: User Groups & Per-User Overrides API
 *
 * GET    /platform-admin/cp/groups                  — list groups for tenant
 * POST   /platform-admin/cp/groups                  — create group
 * POST   /platform-admin/cp/groups/:id/members      — add member
 * DELETE /platform-admin/cp/groups/:id/members/:uid — remove member
 * POST   /platform-admin/cp/groups/:id/roles        — assign role to group
 * GET    /platform-admin/cp/users/:uid/permissions  — resolve permissions for user
 * POST   /platform-admin/cp/users/:uid/overrides    — set permission override
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

const groupRoutes = new Hono<{ Bindings: Env }>();

groupRoutes.get('/', async (c) => {
  const auth = c.get('auth') as { tenantId?: string } | undefined;
  const tenantId = auth?.tenantId ?? c.req.query('tenant_id') ?? '';
  const rows = await c.env.DB
    .prepare(`SELECT ug.*, (SELECT COUNT(*) FROM group_memberships gm WHERE gm.group_id = ug.id) as member_count FROM user_groups ug WHERE ug.tenant_id = ? AND ug.is_active = 1 ORDER BY ug.name ASC`)
    .bind(tenantId)
    .all<{ id: string; name: string; group_type: string; member_count: number }>();
  return c.json({ results: rows.results });
});

groupRoutes.post('/', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const actor = resolveActor(c);
  const auth = c.get('auth') as { tenantId?: string; workspaceId?: string } | undefined;
  const body = await c.req.json<{ name: string; description?: string; group_type?: string; parent_id?: string }>();

  if (!body.name) return c.json({ error: 'name is required' }, 400);

  const group = await cp.permissions.createGroup(
    { tenantId: auth?.tenantId ?? '', workspaceId: auth?.workspaceId, name: body.name, description: body.description, groupType: body.group_type, parentId: body.parent_id },
    actor,
  );
  return c.json(group, 201);
});

groupRoutes.post('/:id/members', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const auth = c.get('auth') as { userId: string; tenantId?: string } | undefined;
  const body = await c.req.json<{ user_id: string }>();
  if (!body.user_id) return c.json({ error: 'user_id required' }, 400);
  await cp.permissions.addGroupMember(c.req.param('id'), body.user_id, auth?.tenantId ?? '', auth?.userId ?? 'system');
  return c.json({ success: true });
});

groupRoutes.delete('/:id/members/:uid', async (c) => {
  const cp = createControlPlane(c.env.DB);
  await cp.permissions.removeGroupMember(c.req.param('id'), c.req.param('uid'));
  return c.json({ success: true });
});

groupRoutes.post('/:id/roles', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const auth = c.get('auth') as { userId: string } | undefined;
  const body = await c.req.json<{ role_id: string }>();
  if (!body.role_id) return c.json({ error: 'role_id required' }, 400);
  await cp.permissions.assignRoleToGroup(c.req.param('id'), body.role_id, auth?.userId ?? 'system');
  return c.json({ success: true });
});

groupRoutes.get('/users/:uid/permissions', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const auth = c.get('auth') as { tenantId?: string; workspaceId?: string } | undefined;
  const workspaceId = c.req.query('workspace_id') ?? auth?.workspaceId ?? '';
  const tenantId = auth?.tenantId ?? '';

  const resolved = await cp.permissions.resolve(c.req.param('uid'), workspaceId, tenantId);
  return c.json({
    user_id: c.req.param('uid'),
    workspace_id: workspaceId,
    granted: Array.from(resolved.granted),
    denied: Array.from(resolved.denied),
  });
});

groupRoutes.post('/users/:uid/overrides', async (c) => {
  const cp = createControlPlane(c.env.DB);
  const actor = resolveActor(c);
  const auth = c.get('auth') as { tenantId?: string } | undefined;
  const body = await c.req.json<{ permission_id: string; granted: boolean; workspace_id?: string; reason?: string; expires_at?: number }>();

  if (!body.permission_id || body.granted === undefined) {
    return c.json({ error: 'permission_id and granted are required' }, 400);
  }

  await cp.permissions.setUserPermissionOverride(
    c.req.param('uid'),
    auth?.tenantId ?? '',
    body.workspace_id ?? null,
    body.permission_id,
    body.granted,
    actor.actorId,
    { reason: body.reason, expiresAt: body.expires_at },
    actor,
  );
  return c.json({ success: true });
});

export { groupRoutes };
