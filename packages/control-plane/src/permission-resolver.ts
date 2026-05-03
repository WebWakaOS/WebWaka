/**
 * @webwaka/control-plane — PermissionResolver
 *
 * Resolves effective permissions for a user by combining:
 *   1. Base membership role (hardcoded hierarchy — super_admin > admin > ... > member)
 *   2. Custom role assignments (user_role_assignments)
 *   3. Group memberships → group roles → permissions (group_role_bindings)
 *   4. Direct group permission bindings (group_permission_bindings)
 *   5. Per-user permission overrides — grants and denials (user_permission_overrides)
 *
 * Denial always wins over grant at the same level.
 * Per-user denials win over everything.
 */

import type { D1Like, ActorContext, CustomRole, PermissionDefinition, ResolvedPermissions, PaginatedResult } from './types.js';
import type { AuditService } from './audit-service.js';

class ResolvedPermissionsImpl implements ResolvedPermissions {
  constructor(
    public readonly granted: Set<string>,
    public readonly denied: Set<string>,
  ) {}

  hasPermission(code: string): boolean {
    if (this.denied.has(code)) return false;
    return this.granted.has(code);
  }
}

export class PermissionResolver {
  constructor(
    private readonly db: D1Like,
    private readonly audit: AuditService,
  ) {}

  // ─── Permission Definitions ───────────────────────────────────────────────

  async listPermissions(opts: { category?: string; scope?: string; limit?: number; offset?: number } = {}): Promise<PaginatedResult<PermissionDefinition>> {
    const conditions: string[] = ['is_active = 1'];
    const bindings: unknown[] = [];

    if (opts.category) { conditions.push('category = ?'); bindings.push(opts.category); }
    if (opts.scope) { conditions.push('scope = ?'); bindings.push(opts.scope); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = Math.min(opts.limit ?? 100, 200);
    const offset = opts.offset ?? 0;

    const [rows, countRow] = await Promise.all([
      this.db.prepare(`SELECT * FROM permission_definitions ${where} ORDER BY category, code LIMIT ? OFFSET ?`).bind(...bindings, limit, offset).all<PermissionDefinition>(),
      this.db.prepare(`SELECT COUNT(*) as total FROM permission_definitions ${where}`).bind(...bindings).first<{ total: number }>(),
    ]);
    return { results: rows.results, ...(countRow?.total !== undefined ? { total: countRow.total } : {}), limit, offset };
  }

  // ─── Custom Roles ─────────────────────────────────────────────────────────

  async listRoles(opts: { tenantId?: string; partnerId?: string; isActive?: boolean } = {}): Promise<CustomRole[]> {
    const conditions: string[] = [];
    const bindings: unknown[] = [];

    if (opts.tenantId !== undefined) { conditions.push('(tenant_id = ? OR tenant_id IS NULL)'); bindings.push(opts.tenantId); }
    if (opts.partnerId !== undefined) { conditions.push('(partner_id = ? OR partner_id IS NULL)'); bindings.push(opts.partnerId); }
    if (opts.isActive !== undefined) { conditions.push('is_active = ?'); bindings.push(opts.isActive ? 1 : 0); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await this.db.prepare(`SELECT * FROM custom_roles ${where} ORDER BY name ASC`).bind(...bindings).all<CustomRole>();
    return rows.results;
  }

  async getRole(id: string): Promise<CustomRole | null> {
    return this.db.prepare('SELECT * FROM custom_roles WHERE id = ?').bind(id).first<CustomRole>();
  }

  async createRole(input: Partial<CustomRole>, actor: ActorContext): Promise<CustomRole> {
    const id = `role_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO custom_roles (id, tenant_id, partner_id, code, name, description, base_role, max_grantable_role, is_active, is_system, metadata, created_by, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,1,0,?,?,?,?)`,
      )
      .bind(
        id, input.tenant_id ?? null, input.partner_id ?? null,
        input.code, input.name, input.description ?? null,
        input.base_role ?? 'member', input.max_grantable_role ?? 'member',
        JSON.stringify({}), actor.actorId, now, now,
      )
      .run();

    const role = await this.getRole(id);
    if (!role) throw new Error('Failed to create role');

    await this.audit.log(actor, { action: 'role.create', resourceType: 'custom_role', resourceId: id, afterJson: role });
    return role;
  }

  async setRolePermissions(roleId: string, permissionIds: string[], granted: boolean, actor: ActorContext): Promise<void> {
    for (const permId of permissionIds) {
      await this.db
        .prepare(
          `INSERT INTO role_permission_bindings (role_id, permission_id, granted, created_at)
           VALUES (?,?,?,?)
           ON CONFLICT (role_id, permission_id) DO UPDATE SET granted=excluded.granted`,
        )
        .bind(roleId, permId, granted ? 1 : 0, Math.floor(Date.now() / 1000))
        .run();
    }
    await this.audit.log(actor, { action: 'role.permissions.set', resourceType: 'custom_role', resourceId: roleId, afterJson: { permissionIds, granted } });
  }

  // ─── Groups ───────────────────────────────────────────────────────────────

  async createGroup(input: { tenantId: string; workspaceId?: string; name: string; description?: string; groupType?: string; parentId?: string }, actor: ActorContext): Promise<{ id: string }> {
    const id = `grp_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO user_groups (id, tenant_id, workspace_id, name, description, parent_id, group_type, is_active, metadata, created_by, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,1,?,?,?,?)`,
      )
      .bind(id, input.tenantId, input.workspaceId ?? null, input.name, input.description ?? null, input.parentId ?? null, input.groupType ?? 'general', '{}', actor.actorId, now, now)
      .run();

    await this.audit.log(actor, { action: 'group.create', resourceType: 'user_group', resourceId: id, afterJson: input });
    return { id };
  }

  async addGroupMember(groupId: string, userId: string, tenantId: string, addedBy: string): Promise<void> {
    const id = `gm_${crypto.randomUUID()}`;
    await this.db
      .prepare(
        `INSERT OR IGNORE INTO group_memberships (id, group_id, user_id, tenant_id, is_group_admin, added_by, added_at)
         VALUES (?,?,?,?,0,?,?)`,
      )
      .bind(id, groupId, userId, tenantId, addedBy, Math.floor(Date.now() / 1000))
      .run();
  }

  async removeGroupMember(groupId: string, userId: string): Promise<void> {
    await this.db.prepare('DELETE FROM group_memberships WHERE group_id = ? AND user_id = ?').bind(groupId, userId).run();
  }

  async assignRoleToGroup(groupId: string, roleId: string, grantedBy: string): Promise<void> {
    await this.db
      .prepare('INSERT OR IGNORE INTO group_role_bindings (group_id, role_id, granted_by, created_at) VALUES (?,?,?,?)')
      .bind(groupId, roleId, grantedBy, Math.floor(Date.now() / 1000))
      .run();
  }

  // ─── Per-User Overrides ───────────────────────────────────────────────────

  async setUserPermissionOverride(
    userId: string,
    tenantId: string,
    workspaceId: string | null,
    permissionId: string,
    granted: boolean,
    grantedBy: string,
    opts: { reason?: string; expiresAt?: number } = {},
    actor: ActorContext,
  ): Promise<void> {
    const id = `upo_${crypto.randomUUID()}`;
    const now = Math.floor(Date.now() / 1000);

    await this.db
      .prepare(
        `INSERT INTO user_permission_overrides (id, user_id, tenant_id, workspace_id, permission_id, granted, reason, granted_by, expires_at, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT (user_id, workspace_id, permission_id)
         DO UPDATE SET granted=excluded.granted, reason=excluded.reason, granted_by=excluded.granted_by, expires_at=excluded.expires_at, updated_at=excluded.updated_at`,
      )
      .bind(id, userId, tenantId, workspaceId, permissionId, granted ? 1 : 0, opts.reason ?? null, grantedBy, opts.expiresAt ?? null, now, now)
      .run();

    await this.audit.log(actor, {
      action: granted ? 'permission.override.grant' : 'permission.override.deny',
      resourceType: 'user_permission_override',
      resourceId: userId,
      afterJson: { userId, workspaceId, permissionId, granted },
    });
  }

  // ─── Full Resolution ──────────────────────────────────────────────────────

  async resolve(userId: string, workspaceId: string, tenantId: string): Promise<ResolvedPermissions> {
    const granted = new Set<string>();
    const denied = new Set<string>();
    const now = Math.floor(Date.now() / 1000);

    // 1. Collect all custom role assignments for this user+workspace
    const userRoles = await this.db
      .prepare(
        `SELECT role_id FROM user_role_assignments
         WHERE user_id = ? AND workspace_id = ?
           AND (expires_at IS NULL OR expires_at > ?)`,
      )
      .bind(userId, workspaceId, now)
      .all<{ role_id: string }>();

    // 2. Collect roles from groups user belongs to
    const groupRoles = await this.db
      .prepare(
        `SELECT grb.role_id FROM group_memberships gm
         JOIN group_role_bindings grb ON gm.group_id = grb.group_id
         WHERE gm.user_id = ? AND gm.tenant_id = ?
           AND (gm.expires_at IS NULL OR gm.expires_at > ?)`,
      )
      .bind(userId, tenantId, now)
      .all<{ role_id: string }>();

    const allRoleIds = [...new Set([...userRoles.results.map(r => r.role_id), ...groupRoles.results.map(r => r.role_id)])];

    // 3. Resolve permissions from all roles
    if (allRoleIds.length > 0) {
      const placeholders = allRoleIds.map(() => '?').join(',');
      const rolePerms = await this.db
        .prepare(`SELECT pd.code, rpb.granted FROM role_permission_bindings rpb JOIN permission_definitions pd ON rpb.permission_id = pd.id WHERE rpb.role_id IN (${placeholders})`)
        .bind(...allRoleIds)
        .all<{ code: string; granted: number }>();

      for (const rp of rolePerms.results) {
        if (rp.granted === 1) granted.add(rp.code); else denied.add(rp.code);
      }
    }

    // 4. Direct group permission bindings
    const groupPerms = await this.db
      .prepare(
        `SELECT pd.code, gpb.granted FROM group_memberships gm
         JOIN group_permission_bindings gpb ON gm.group_id = gpb.group_id
         JOIN permission_definitions pd ON gpb.permission_id = pd.id
         WHERE gm.user_id = ? AND gm.tenant_id = ?
           AND (gm.expires_at IS NULL OR gm.expires_at > ?)`,
      )
      .bind(userId, tenantId, now)
      .all<{ code: string; granted: number }>();

    for (const gp of groupPerms.results) {
      if (gp.granted === 1) granted.add(gp.code); else denied.add(gp.code);
    }

    // 5. Per-user overrides (highest priority — overwrite everything)
    const userOverrides = await this.db
      .prepare(
        `SELECT pd.code, upo.granted FROM user_permission_overrides upo
         JOIN permission_definitions pd ON upo.permission_id = pd.id
         WHERE upo.user_id = ? AND (upo.workspace_id = ? OR upo.workspace_id IS NULL)
           AND (upo.expires_at IS NULL OR upo.expires_at > ?)`,
      )
      .bind(userId, workspaceId, now)
      .all<{ code: string; granted: number }>();

    for (const uo of userOverrides.results) {
      if (uo.granted === 1) { denied.delete(uo.code); granted.add(uo.code); }
      else { granted.delete(uo.code); denied.add(uo.code); }
    }

    return new ResolvedPermissionsImpl(granted, denied);
  }
}
