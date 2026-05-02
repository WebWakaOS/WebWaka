import { describe, it, expect, beforeEach } from 'vitest';
import { DelegationGuard, DelegationError } from '../delegation-guard.js';
import { AuditService } from '../audit-service.js';
import { StubD1 } from './stub-db.js';
import type { ActorContext } from '../types.js';

function makeDb() {
  const db = new StubD1();
  const audit = new AuditService(db as never);
  const guard = new DelegationGuard(db as never, audit);
  return { db, audit, guard };
}

const SUPER_ADMIN: ActorContext = {
  actorId: 'root_001',
  actorRole: 'super_admin',
  actorLevel: 'super_admin',
};

const TENANT_ADMIN: ActorContext = {
  actorId: 'ta_001',
  actorRole: 'tenant_admin',
  actorLevel: 'tenant_admin',
  tenantId: 'tenant_a',
};

const PARTNER_ADMIN: ActorContext = {
  actorId: 'pa_001',
  actorRole: 'partner_admin',
  actorLevel: 'partner_admin',
  tenantId: 'tenant_a',
};

describe('DelegationGuard — outranks', () => {
  it('super_admin (rank 0) outranks tenant_admin (rank 3)', () => {
    const { guard } = makeDb();
    expect(guard.outranks('super_admin', 'tenant_admin')).toBe(true);
  });

  it('tenant_admin does NOT outrank partner_admin', () => {
    const { guard } = makeDb();
    expect(guard.outranks('tenant_admin', 'partner_admin')).toBe(false);
  });

  it('partner_admin outranks tenant_admin', () => {
    const { guard } = makeDb();
    expect(guard.outranks('partner_admin', 'tenant_admin')).toBe(true);
  });

  it('super_admin outranks itself (equal rank counts)', () => {
    const { guard } = makeDb();
    expect(guard.outranks('super_admin', 'super_admin')).toBe(true);
  });

  it('unknown level gets rank 99 (does not outrank any known level)', () => {
    const { guard } = makeDb();
    expect(guard.outranks('unknown_role', 'super_admin')).toBe(false);
  });
});

describe('DelegationGuard — assertCanPerform', () => {
  it('super_admin can perform any capability without DB lookup', async () => {
    const { guard } = makeDb();
    // No capability seeded — super_admin bypasses check
    await expect(guard.assertCanPerform(SUPER_ADMIN, 'any.capability')).resolves.toBeUndefined();
  });

  it('system level can perform any capability', async () => {
    const { guard } = makeDb();
    const system: ActorContext = { ...SUPER_ADMIN, actorLevel: 'system', actorRole: 'system' };
    await expect(guard.assertCanPerform(system, 'any.capability')).resolves.toBeUndefined();
  });

  it('throws DelegationError for unknown capability', async () => {
    const { guard } = makeDb();
    await expect(
      guard.assertCanPerform(TENANT_ADMIN, 'unknown.capability'),
    ).rejects.toThrow(DelegationError);
  });

  it('allows actor that outranks capability min_grantor_level', async () => {
    const { db, guard } = makeDb();
    db.t['delegation_capabilities'].push({
      id: 'cap_001',
      code: 'plans.create',
      min_grantor_level: 'partner_admin',
      category: 'plans',
    } as never);
    // partner_admin outranks partner_admin (equal → allowed)
    await expect(
      guard.assertCanPerform(PARTNER_ADMIN, 'plans.create'),
    ).resolves.toBeUndefined();
  });

  it('throws when actor is below capability min_grantor_level', async () => {
    const { db, guard } = makeDb();
    db.t['delegation_capabilities'].push({
      id: 'cap_002',
      code: 'plans.delete',
      min_grantor_level: 'super_admin',
      category: 'plans',
    } as never);
    await expect(
      guard.assertCanPerform(TENANT_ADMIN, 'plans.delete'),
    ).rejects.toThrow(DelegationError);
  });

  it('throws when an explicit deny policy exists for the actor', async () => {
    const { db, guard } = makeDb();
    db.t['delegation_capabilities'].push({
      id: 'cap_003',
      code: 'flags.update',
      min_grantor_level: 'partner_admin',
      category: 'flags',
    } as never);
    // Explicit deny policy for partner_admin
    db.t['admin_delegation_policies'].push({
      id: 'dp_deny',
      grantor_level: 'super_admin',
      grantee_level: 'partner_admin',
      grantee_id: null,
      capability: 'flags.update',
      effect: 'deny',
      is_active: 1,
      ceiling_json: '{}',
      requires_approval: 0,
    } as never);
    await expect(
      guard.assertCanPerform(PARTNER_ADMIN, 'flags.update'),
    ).rejects.toThrow(DelegationError);
  });

  it('allow policy does not block the actor', async () => {
    const { db, guard } = makeDb();
    db.t['delegation_capabilities'].push({
      id: 'cap_004',
      code: 'plans.view',
      min_grantor_level: 'partner_admin',
      category: 'plans',
    } as never);
    db.t['admin_delegation_policies'].push({
      id: 'dp_allow',
      grantor_level: 'super_admin',
      grantee_level: 'partner_admin',
      grantee_id: null,
      capability: 'plans.view',
      effect: 'allow',
      is_active: 1,
      ceiling_json: '{}',
      requires_approval: 0,
    } as never);
    await expect(
      guard.assertCanPerform(PARTNER_ADMIN, 'plans.view'),
    ).resolves.toBeUndefined();
  });
});

describe('DelegationGuard — assertCanAssignRole', () => {
  it('super_admin can assign any role', async () => {
    const { guard } = makeDb();
    await expect(
      guard.assertCanAssignRole(SUPER_ADMIN, 'super_admin'),
    ).resolves.toBeUndefined();
  });

  it('tenant_admin cannot assign partner_admin (higher privilege)', async () => {
    const { guard } = makeDb();
    await expect(
      guard.assertCanAssignRole(TENANT_ADMIN, 'partner_admin'),
    ).rejects.toThrow(DelegationError);
  });

  it('partner_admin can assign tenant_admin (lower privilege)', async () => {
    const { guard } = makeDb();
    await expect(
      guard.assertCanAssignRole(PARTNER_ADMIN, 'tenant_admin'),
    ).resolves.toBeUndefined();
  });
});

describe('DelegationGuard — createPolicy', () => {
  it('super_admin can create a delegation policy', async () => {
    const { db, guard } = makeDb();
    const policy = await guard.createPolicy(
      {
        grantor_level: 'super_admin',
        grantee_level: 'partner_admin',
        capability: 'plans.view',
        effect: 'allow',
        ceiling_json: '{}',
        requires_approval: 0,
      },
      SUPER_ADMIN,
    );
    expect(policy.id.startsWith('dp_')).toBe(true);
    expect(policy.capability).toBe('plans.view');
    expect(policy.effect).toBe('allow');
    expect(db.t['governance_audit_log'].some((r) => r['action'] === 'delegation.policy.create')).toBe(true);
  });

  it('non-super_admin cannot create a delegation policy', async () => {
    const { guard } = makeDb();
    await expect(
      guard.createPolicy({ grantor_level: 'partner_admin', grantee_level: 'tenant_admin', capability: 'plans.view', effect: 'allow' }, TENANT_ADMIN),
    ).rejects.toThrow(DelegationError);
  });
});

describe('DelegationGuard — listPolicies', () => {
  it('returns all active policies', async () => {
    const { db, guard } = makeDb();
    await guard.createPolicy(
      { grantor_level: 'super_admin', grantee_level: 'partner_admin', capability: 'plans.view', effect: 'allow' },
      SUPER_ADMIN,
    );
    await guard.createPolicy(
      { grantor_level: 'super_admin', grantee_level: 'tenant_admin', capability: 'flags.view', effect: 'allow' },
      SUPER_ADMIN,
    );
    const policies = await guard.listPolicies();
    expect(policies).toHaveLength(2);
  });

  it('filters by grantee_level', async () => {
    const { db, guard } = makeDb();
    await guard.createPolicy(
      { grantor_level: 'super_admin', grantee_level: 'partner_admin', capability: 'plans.view', effect: 'allow' },
      SUPER_ADMIN,
    );
    await guard.createPolicy(
      { grantor_level: 'super_admin', grantee_level: 'tenant_admin', capability: 'flags.view', effect: 'allow' },
      SUPER_ADMIN,
    );
    const policies = await guard.listPolicies({ granteeLevel: 'partner_admin' });
    expect(policies).toHaveLength(1);
    expect(policies[0]!.grantee_level).toBe('partner_admin');
  });

  it('filters by capability', async () => {
    const { db, guard } = makeDb();
    await guard.createPolicy(
      { grantor_level: 'super_admin', grantee_level: 'partner_admin', capability: 'plans.view', effect: 'allow' },
      SUPER_ADMIN,
    );
    await guard.createPolicy(
      { grantor_level: 'super_admin', grantee_level: 'partner_admin', capability: 'flags.edit', effect: 'deny' },
      SUPER_ADMIN,
    );
    const policies = await guard.listPolicies({ capability: 'flags.edit' });
    expect(policies).toHaveLength(1);
    expect(policies[0]!.effect).toBe('deny');
  });
});

describe('DelegationGuard — listCapabilities', () => {
  it('returns seeded delegation capabilities', async () => {
    const { db, guard } = makeDb();
    db.t['delegation_capabilities'].push(
      { id: 'c1', code: 'plans.create', category: 'plans', min_grantor_level: 'super_admin' } as never,
      { id: 'c2', code: 'flags.edit', category: 'flags', min_grantor_level: 'partner_admin' } as never,
    );
    const caps = await guard.listCapabilities();
    expect(caps).toHaveLength(2);
  });
});
