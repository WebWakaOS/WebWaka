import { describe, it, expect, beforeEach } from 'vitest';
import { FlagService } from '../flag-service.js';
import { AuditService } from '../audit-service.js';
import { StubD1, StubKV } from './stub-db.js';
import type { ActorContext, ConfigurationFlag } from '../types.js';

const ACTOR: ActorContext = {
  actorId: 'user_001',
  actorRole: 'super_admin',
  actorLevel: 'super_admin',
};

const NOW = Math.floor(Date.now() / 1000);

function makeDb(kv?: StubKV) {
  const db = new StubD1();
  const audit = new AuditService(db as never);
  const svc = new FlagService(db as never, audit, kv as never);
  return { db, audit, svc };
}

function seedFlag(db: StubD1, overrides: Partial<ConfigurationFlag> = {}): ConfigurationFlag {
  const flag: ConfigurationFlag = {
    id: `flag_${Math.random().toString(36).slice(2, 12)}`,
    code: 'my_feature',
    name: 'My Feature',
    category: 'feature',
    value_type: 'boolean',
    default_value: 'false',
    min_scope: 'platform',
    inheritable: 1,
    is_kill_switch: 0,
    rollout_pct: 100,
    is_active: 1,
    ...overrides,
  };
  db.t['configuration_flags'].push(flag as never);
  return flag;
}

describe('FlagService — createFlag', () => {
  it('creates a flag with defaults', async () => {
    const { svc } = makeDb();
    const flag = await svc.createFlag({ code: 'new_feature', name: 'New Feature' }, ACTOR);
    expect(flag.code).toBe('new_feature');
    expect(flag.name).toBe('New Feature');
    expect(flag.category).toBe('feature');
    expect(flag.value_type).toBe('boolean');
    expect(flag.default_value).toBe('false');
    expect(flag.is_active).toBe(1);
    expect(flag.rollout_pct).toBe(100);
    expect(flag.is_kill_switch).toBe(0);
    expect(flag.id.startsWith('flag_')).toBe(true);
  });

  it('creates a kill-switch flag', async () => {
    const { svc } = makeDb();
    const flag = await svc.createFlag(
      { code: 'emergency_halt', name: 'Emergency Halt', is_kill_switch: true as never },
      ACTOR,
    );
    expect(flag.is_kill_switch).toBe(1);
  });

  it('logs creation to audit log', async () => {
    const { db, svc } = makeDb();
    await svc.createFlag({ code: 'beta_ui', name: 'Beta UI' }, ACTOR);
    expect(
      db.t['governance_audit_log'].some((r) => r['action'] === 'flag.create'),
    ).toBe(true);
  });
});

describe('FlagService — getFlag', () => {
  it('retrieves flag by id', async () => {
    const { db, svc } = makeDb();
    const flag = seedFlag(db, { id: 'flag_abc', code: 'test_flag' });
    const found = await svc.getFlag(flag.id);
    expect(found?.code).toBe('test_flag');
  });

  it('retrieves flag by code', async () => {
    const { db, svc } = makeDb();
    seedFlag(db, { id: 'flag_xyz', code: 'my_flag' });
    const found = await svc.getFlag('my_flag');
    expect(found?.id).toBe('flag_xyz');
  });

  it('returns null for unknown flag', async () => {
    const { svc } = makeDb();
    expect(await svc.getFlag('nonexistent')).toBeNull();
  });

  it('reads from KV cache if available', async () => {
    const kv = new StubKV();
    const { db, svc } = makeDb(kv);
    const flag = seedFlag(db, { id: 'flag_kv', code: 'cached_flag' });
    // Warm cache
    await svc.getFlag(flag.id);
    // Remove from DB
    db.t['configuration_flags'] = [];
    // Should still find it from KV
    const found = await svc.getFlag(flag.id);
    expect(found?.code).toBe('cached_flag');
  });
});

describe('FlagService — updateFlag', () => {
  it('updates flag fields', async () => {
    const { db, svc } = makeDb();
    const flag = seedFlag(db, { id: 'flag_u', code: 'upd_flag', name: 'Old Name' });
    const updated = await svc.updateFlag(flag.id, { name: 'New Name', rollout_pct: 50 }, ACTOR);
    expect(updated.name).toBe('New Name');
    expect(updated.rollout_pct).toBe(50);
  });

  it('throws for unknown flag id', async () => {
    const { svc } = makeDb();
    await expect(svc.updateFlag('flag_ghost', { name: 'X' }, ACTOR)).rejects.toThrow(
      'Flag not found',
    );
  });

  it('logs update to audit log', async () => {
    const { db, svc } = makeDb();
    const flag = seedFlag(db, { id: 'flag_upd' });
    await svc.updateFlag(flag.id, { notes: 'test update' }, ACTOR);
    expect(db.t['governance_audit_log'].some((r) => r['action'] === 'flag.update')).toBe(true);
  });
});

describe('FlagService — listFlags', () => {
  it('returns all active flags by default', async () => {
    const { db, svc } = makeDb();
    seedFlag(db, { id: 'flag_a', code: 'a', is_active: 1 });
    seedFlag(db, { id: 'flag_b', code: 'b', is_active: 1 });
    const result = await svc.listFlags({ isActive: true });
    expect(result.results).toHaveLength(2);
  });

  it('filters by category', async () => {
    const { db, svc } = makeDb();
    seedFlag(db, { id: 'flag_f', code: 'feat', category: 'feature' });
    seedFlag(db, { id: 'flag_b', code: 'beta', category: 'beta' });
    const result = await svc.listFlags({ category: 'beta' });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]!.code).toBe('beta');
  });

  it('returns inactive flags when filtered', async () => {
    const { db, svc } = makeDb();
    seedFlag(db, { id: 'flag_off', code: 'disabled', is_active: 0 });
    seedFlag(db, { id: 'flag_on', code: 'enabled', is_active: 1 });
    const result = await svc.listFlags({ isActive: false });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]!.code).toBe('disabled');
  });
});

describe('FlagService — resolve', () => {
  it('returns false for an inactive flag', async () => {
    const { db, svc } = makeDb();
    seedFlag(db, { id: 'flag_off', code: 'inactive_feat', is_active: 0, default_value: 'true' });
    const result = await svc.resolve('inactive_feat', {});
    expect(result).toBe(false);
  });

  it('returns default boolean value for active flag', async () => {
    const { db, svc } = makeDb();
    seedFlag(db, { id: 'flag_on', code: 'on_feat', is_active: 1, default_value: 'true' });
    const result = await svc.resolve('on_feat', {});
    expect(result).toBe(true);
  });

  it('returns false for unknown flag code', async () => {
    const { svc } = makeDb();
    const result = await svc.resolve('totally_unknown', {});
    expect(result).toBe(false);
  });

  it('workspace override takes highest priority', async () => {
    const { db, svc } = makeDb();
    const flag = seedFlag(db, { id: 'flag_ov', code: 'overridden', default_value: 'false' });
    db.t['configuration_overrides'].push({
      id: 'cfo_001',
      flag_id: flag.id,
      scope: 'workspace',
      scope_id: 'ws_001',
      value: 'true',
      is_active: 1,
      expires_at: null,
    } as never);
    const result = await svc.resolve('overridden', { workspaceId: 'ws_001' });
    expect(result).toBe(true);
  });

  it('tenant override is used when no workspace override exists', async () => {
    const { db, svc } = makeDb();
    const flag = seedFlag(db, { id: 'flag_t', code: 'tenant_feat', default_value: 'false' });
    db.t['configuration_overrides'].push({
      id: 'cfo_002',
      flag_id: flag.id,
      scope: 'tenant',
      scope_id: 'tenant_a',
      value: 'true',
      is_active: 1,
      expires_at: null,
    } as never);
    const result = await svc.resolve('tenant_feat', { tenantId: 'tenant_a' });
    expect(result).toBe(true);
  });

  it('returns string value for non-boolean flags', async () => {
    const { db, svc } = makeDb();
    seedFlag(db, {
      id: 'flag_str',
      code: 'api_version',
      value_type: 'string',
      default_value: 'v2',
    });
    const result = await svc.resolve('api_version', {});
    expect(result).toBe('v2');
  });

  it('kill-switch blocks resolution of non-kill-switch flags', async () => {
    const { db, svc } = makeDb();
    // Active kill-switch flag
    seedFlag(db, {
      id: 'flag_ks',
      code: 'emergency_halt',
      is_kill_switch: 1,
      default_value: 'true',
      is_active: 1,
    });
    // Normal flag
    seedFlag(db, { id: 'flag_norm', code: 'normal_feat', default_value: 'true' });
    const result = await svc.resolve('normal_feat', {});
    expect(result).toBe(false);
  });

  it('kill-switch flag itself is not blocked', async () => {
    const { db, svc } = makeDb();
    seedFlag(db, {
      id: 'flag_ks',
      code: 'emergency_halt',
      is_kill_switch: 1,
      default_value: 'true',
      is_active: 1,
    });
    const result = await svc.resolve('emergency_halt', {});
    expect(result).toBe(true);
  });

  it('uses KV cache for resolved value', async () => {
    const kv = new StubKV();
    const { db, svc } = makeDb(kv);
    const flag = seedFlag(db, { id: 'flag_kv', code: 'cached_feat', default_value: 'true' });
    // First resolve warms cache
    const first = await svc.resolve('cached_feat', { tenantId: 'tenant_a' });
    expect(first).toBe(true);
    // Verify cache was written
    const cacheSnapshot = kv.snapshot();
    const hasCachedKey = Object.keys(cacheSnapshot).some((k) =>
      k.startsWith('cp:flag:res:v1:cached_feat'),
    );
    expect(hasCachedKey).toBe(true);
  });

  it('rollout_pct 0 returns false for any tenant', async () => {
    const { db, svc } = makeDb();
    seedFlag(db, { id: 'flag_0', code: 'rolling_feat', default_value: 'true', rollout_pct: 0 });
    const result = await svc.resolve('rolling_feat', { tenantId: 'any_tenant_id' });
    expect(result).toBe(false);
  });

  it('expired override is not used', async () => {
    const { db, svc } = makeDb();
    const flag = seedFlag(db, { id: 'flag_exp', code: 'exp_feat', default_value: 'false' });
    db.t['configuration_overrides'].push({
      id: 'cfo_exp',
      flag_id: flag.id,
      scope: 'workspace',
      scope_id: 'ws_001',
      value: 'true',
      is_active: 1,
      expires_at: NOW - 3600,
    } as never);
    const result = await svc.resolve('exp_feat', { workspaceId: 'ws_001' });
    expect(result).toBe(false);
  });
});

describe('FlagService — setOverride / removeOverride', () => {
  it('setOverride creates an override record', async () => {
    const { db, svc } = makeDb();
    const flag = seedFlag(db, { id: 'flag_ov', code: 'ov_feat' });
    await svc.setOverride(flag.id, 'workspace', 'ws_001', 'true', ACTOR);
    expect(db.t['configuration_overrides']).toHaveLength(1);
    expect(db.t['configuration_overrides'][0]!['value']).toBe('true');
  });

  it('setOverride throws for unknown flag', async () => {
    const { svc } = makeDb();
    await expect(
      svc.setOverride('flag_ghost', 'workspace', 'ws_x', 'true', ACTOR),
    ).rejects.toThrow('Flag not found');
  });

  it('removeOverride deactivates the override', async () => {
    const { db, svc } = makeDb();
    const flag = seedFlag(db, { id: 'flag_rm', code: 'rm_feat' });
    db.t['configuration_overrides'].push({
      id: 'cfo_rm',
      flag_id: flag.id,
      scope: 'workspace',
      scope_id: 'ws_001',
      value: 'true',
      is_active: 1,
      expires_at: null,
    } as never);
    await svc.removeOverride(flag.id, 'workspace', 'ws_001', ACTOR);
    expect(db.t['configuration_overrides'][0]!['is_active']).toBe(0);
  });

  it('setOverride logs to audit', async () => {
    const { db, svc } = makeDb();
    const flag = seedFlag(db, { id: 'flag_log', code: 'log_feat' });
    await svc.setOverride(flag.id, 'tenant', 'tenant_a', 'true', ACTOR, { reason: 'test' });
    expect(
      db.t['governance_audit_log'].some((r) => r['action'] === 'flag.override.set'),
    ).toBe(true);
  });
});

describe('FlagService — resolveAll', () => {
  it('resolves all active flags', async () => {
    const { db, svc } = makeDb();
    seedFlag(db, { id: 'flag_a', code: 'alpha', default_value: 'true', is_active: 1 });
    seedFlag(db, { id: 'flag_b', code: 'beta', default_value: 'false', is_active: 1 });
    seedFlag(db, { id: 'flag_c', code: 'gamma', is_active: 0, default_value: 'true' });
    const result = await svc.resolveAll({});
    // inactive gamma is included in resolveAll (fetches all is_active=1) but resolve returns false for inactive
    expect('alpha' in result).toBe(true);
    expect('beta' in result).toBe(true);
    expect(result['alpha']).toBe(true);
    expect(result['beta']).toBe(false);
  });
});
