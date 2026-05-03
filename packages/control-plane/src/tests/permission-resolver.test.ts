import { describe, it, expect } from 'vitest';
import { PermissionResolver } from '../permission-resolver.js';
import { AuditService } from '../audit-service.js';
import { StubD1 } from './stub-db.js';
import type { ActorContext } from '../types.js';

const ACTOR: ActorContext = {
  actorId: 'admin_001',
  actorRole: 'super_admin',
  actorLevel: 'super_admin',
  tenantId: 'tenant_a',
};

const _NOW = Math.floor(Date.now() / 1000);

function makeDb() {
  const db = new StubD1();
  const audit = new AuditService(db as never);
  const svc = new PermissionResolver(db as never, audit);
  return { db, audit, svc };
}

function seedPermission(db: StubD1, id: string, code: string): void {
  db.t['permission_definitions'].push({
    id,
    code,
    name: code,
    category: 'billing',
    scope: 'platform',
    is_sensitive: 0,
    is_active: 1,
  } as never);
}

describe('PermissionResolver — createRole', () => {
  it('creates a custom role with defaults', async () => {
    const { svc } = makeDb();
    const role = await svc.createRole(
      { code: 'billing_admin', name: 'Billing Admin' },
      ACTOR,
    );
    expect(role.code).toBe('billing_admin');
    expect(role.name).toBe('Billing Admin');
    expect(role.base_role).toBe('member');
    expect(role.max_grantable_role).toBe('member');
    expect(role.is_active).toBe(1);
    expect(role.is_system).toBe(0);
    expect(role.id.startsWith('role_')).toBe(true);
  });

  it('creates a role with explicit base_role', async () => {
    const { svc } = makeDb();
    const role = await svc.createRole(
      { code: 'team_lead', name: 'Team Lead', base_role: 'admin', max_grantable_role: 'member' },
      ACTOR,
    );
    expect(role.base_role).toBe('admin');
    expect(role.max_grantable_role).toBe('member');
  });

  it('logs role creation to audit log', async () => {
    const { db, svc } = makeDb();
    await svc.createRole({ code: 'r', name: 'R' }, ACTOR);
    expect(db.t['governance_audit_log'].some((r) => r['action'] === 'role.create')).toBe(true);
  });

  it('scopes role to tenant when tenant_id provided', async () => {
    const { db, svc } = makeDb();
    const role = await svc.createRole(
      { code: 'tenant_billing', name: 'Tenant Billing', tenant_id: 'tenant_x' },
      ACTOR,
    );
    const row = db.t['custom_roles'].find((r) => r['id'] === role.id);
    expect(row?.['tenant_id']).toBe('tenant_x');
  });
});

describe('PermissionResolver — getRole / listRoles', () => {
  it('retrieves a role by id', async () => {
    const { svc } = makeDb();
    const created = await svc.createRole({ code: 'ops', name: 'Ops' }, ACTOR);
    const found = await svc.getRole(created.id);
    expect(found?.code).toBe('ops');
  });

  it('returns null for unknown role id', async () => {
    const { svc } = makeDb();
    expect(await svc.getRole('role_nope')).toBeNull();
  });

  it('listRoles filters by tenantId', async () => {
    const { svc } = makeDb();
    await svc.createRole({ code: 'global', name: 'Global' }, ACTOR);
    await svc.createRole({ code: 'local', name: 'Local', tenant_id: 'tenant_b' }, ACTOR);
    const result = await svc.listRoles({ tenantId: 'tenant_b' });
    // roles with tenant_id = 'tenant_b' OR tenant_id = NULL
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((r) => r.code === 'local')).toBe(true);
  });
});

describe('PermissionResolver — setRolePermissions', () => {
  it('creates role-permission bindings', async () => {
    const { db, svc } = makeDb();
    seedPermission(db, 'perm_001', 'billing.view');
    seedPermission(db, 'perm_002', 'billing.edit');
    const role = await svc.createRole({ code: 'billing', name: 'Billing' }, ACTOR);
    await svc.setRolePermissions(role.id, ['perm_001', 'perm_002'], true, ACTOR);
    const bindings = db.t['role_permission_bindings'];
    expect(bindings).toHaveLength(2);
    expect(bindings.every((b) => b['granted'] === 1)).toBe(true);
  });

  it('can create denial bindings', async () => {
    const { db, svc } = makeDb();
    seedPermission(db, 'perm_001', 'billing.view');
    const role = await svc.createRole({ code: 'restricted', name: 'Restricted' }, ACTOR);
    await svc.setRolePermissions(role.id, ['perm_001'], false, ACTOR);
    expect(db.t['role_permission_bindings'][0]!['granted']).toBe(0);
  });

  it('logs the permission assignment', async () => {
    const { db, svc } = makeDb();
    seedPermission(db, 'perm_x', 'x.view');
    const role = await svc.createRole({ code: 'r', name: 'R' }, ACTOR);
    await svc.setRolePermissions(role.id, ['perm_x'], true, ACTOR);
    expect(
      db.t['governance_audit_log'].some((r) => r['action'] === 'role.permissions.set'),
    ).toBe(true);
  });
});

describe('PermissionResolver — groups', () => {
  it('createGroup creates a user group', async () => {
    const { db, svc } = makeDb();
    const group = await svc.createGroup(
      { tenantId: 'tenant_a', name: 'Finance Team' },
      ACTOR,
    );
    expect(typeof group.id).toBe('string');
    expect(group.id.startsWith('grp_')).toBe(true);
    const row = db.t['user_groups'].find((r) => r['id'] === group.id);
    expect(row?.['name']).toBe('Finance Team');
    expect(row?.['tenant_id']).toBe('tenant_a');
  });

  it('addGroupMember inserts a membership row', async () => {
    const { db, svc } = makeDb();
    await svc.addGroupMember('grp_001', 'user_x', 'tenant_a', 'admin_001');
    expect(db.t['group_memberships']).toHaveLength(1);
    expect(db.t['group_memberships'][0]!['user_id']).toBe('user_x');
  });

  it('removeGroupMember removes the membership row', async () => {
    const { db, svc } = makeDb();
    await svc.addGroupMember('grp_001', 'user_x', 'tenant_a', 'admin');
    await svc.removeGroupMember('grp_001', 'user_x');
    expect(db.t['group_memberships']).toHaveLength(0);
  });

  it('assignRoleToGroup creates a group-role binding', async () => {
    const { db, svc } = makeDb();
    await svc.assignRoleToGroup('grp_001', 'role_001', 'admin');
    expect(db.t['group_role_bindings']).toHaveLength(1);
    expect(db.t['group_role_bindings'][0]!['role_id']).toBe('role_001');
  });
});

describe('PermissionResolver — resolve', () => {
  it('returns empty sets for user with no roles or overrides', async () => {
    const { svc } = makeDb();
    const result = await svc.resolve('user_nobody', 'ws_001', 'tenant_a');
    expect(result.granted.size).toBe(0);
    expect(result.denied.size).toBe(0);
    expect(result.hasPermission('billing.view')).toBe(false);
  });

  it('grants permissions from a user role assignment', async () => {
    const { db, svc } = makeDb();
    seedPermission(db, 'perm_bv', 'billing.view');
    const role = await svc.createRole({ code: 'biller', name: 'Biller' }, ACTOR);
    await svc.setRolePermissions(role.id, ['perm_bv'], true, ACTOR);

    // Assign role to user
    db.t['user_role_assignments'].push({
      id: 'ura_001',
      user_id: 'user_001',
      workspace_id: 'ws_001',
      role_id: role.id,
      expires_at: null,
    } as never);

    const result = await svc.resolve('user_001', 'ws_001', 'tenant_a');
    expect(result.granted.has('billing.view')).toBe(true);
    expect(result.hasPermission('billing.view')).toBe(true);
  });

  it('applies per-user denial override — denial wins', async () => {
    const { db, svc } = makeDb();
    seedPermission(db, 'perm_bv', 'billing.view');
    const role = await svc.createRole({ code: 'biller', name: 'Biller' }, ACTOR);
    await svc.setRolePermissions(role.id, ['perm_bv'], true, ACTOR);

    db.t['user_role_assignments'].push({
      id: 'ura_001',
      user_id: 'user_001',
      workspace_id: 'ws_001',
      role_id: role.id,
      expires_at: null,
    } as never);

    // Per-user denial
    await svc.setUserPermissionOverride(
      'user_001', 'tenant_a', 'ws_001', 'perm_bv', false,
      'admin', {}, ACTOR,
    );

    const result = await svc.resolve('user_001', 'ws_001', 'tenant_a');
    expect(result.hasPermission('billing.view')).toBe(false);
    expect(result.denied.has('billing.view')).toBe(true);
  });

  it('applies per-user grant override — removes denial', async () => {
    const { db, svc } = makeDb();
    seedPermission(db, 'perm_bv', 'billing.view');
    const role = await svc.createRole({ code: 'restricted', name: 'R' }, ACTOR);
    await svc.setRolePermissions(role.id, ['perm_bv'], false, ACTOR);

    db.t['user_role_assignments'].push({
      id: 'ura_001',
      user_id: 'user_001',
      workspace_id: 'ws_001',
      role_id: role.id,
      expires_at: null,
    } as never);

    // Per-user grant overrides the role denial
    await svc.setUserPermissionOverride(
      'user_001', 'tenant_a', 'ws_001', 'perm_bv', true,
      'admin', {}, ACTOR,
    );

    const result = await svc.resolve('user_001', 'ws_001', 'tenant_a');
    expect(result.hasPermission('billing.view')).toBe(true);
  });

  it('grants permissions from group role membership', async () => {
    const { db, svc } = makeDb();
    seedPermission(db, 'perm_rep', 'reports.view');
    const role = await svc.createRole({ code: 'reporter', name: 'Reporter' }, ACTOR);
    await svc.setRolePermissions(role.id, ['perm_rep'], true, ACTOR);

    // User in group, group has role
    await svc.addGroupMember('grp_001', 'user_001', 'tenant_a', 'admin');
    await svc.assignRoleToGroup('grp_001', role.id, 'admin');

    const result = await svc.resolve('user_001', 'ws_001', 'tenant_a');
    expect(result.hasPermission('reports.view')).toBe(true);
  });
});

describe('PermissionResolver — listPermissions', () => {
  it('returns all active permissions', async () => {
    const { db, svc } = makeDb();
    seedPermission(db, 'p1', 'billing.view');
    seedPermission(db, 'p2', 'billing.edit');
    const result = await svc.listPermissions({ limit: 50, offset: 0 });
    expect(result.results).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('filters by category', async () => {
    const { db, svc } = makeDb();
    db.t['permission_definitions'].push(
      { id: 'p1', code: 'billing.view', name: 'b', category: 'billing', scope: 'platform', is_sensitive: 0, is_active: 1 } as never,
      { id: 'p2', code: 'reports.view', name: 'r', category: 'reports', scope: 'platform', is_sensitive: 0, is_active: 1 } as never,
    );
    const result = await svc.listPermissions({ category: 'reports' });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]!.code).toBe('reports.view');
  });
});

describe('PermissionResolver — setUserPermissionOverride', () => {
  it('stores the override', async () => {
    const { db, svc } = makeDb();
    await svc.setUserPermissionOverride(
      'user_001', 'tenant_a', 'ws_001', 'perm_001', true, 'admin', {}, ACTOR,
    );
    const overrides = db.t['user_permission_overrides'];
    expect(overrides).toHaveLength(1);
    expect(overrides[0]!['user_id']).toBe('user_001');
    expect(overrides[0]!['granted']).toBe(1);
  });

  it('logs the override action', async () => {
    const { db, svc } = makeDb();
    await svc.setUserPermissionOverride(
      'user_001', 'tenant_a', null, 'perm_001', false, 'admin', {}, ACTOR,
    );
    const actions = db.t['governance_audit_log'].map((r) => r['action']);
    expect(actions).toContain('permission.override.deny');
  });
});
