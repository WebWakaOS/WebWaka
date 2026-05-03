import { describe, it, expect } from 'vitest';
import { EntitlementEngine } from '../entitlement-engine.js';
import { AuditService } from '../audit-service.js';
import { StubD1 } from './stub-db.js';
import type { ActorContext, EntitlementDefinition } from '../types.js';

const ACTOR: ActorContext = {
  actorId: 'user_001',
  actorRole: 'super_admin',
  actorLevel: 'super_admin',
};

const NOW = Math.floor(Date.now() / 1000);

function makeDb() {
  const db = new StubD1();
  const audit = new AuditService(db as never);
  const svc = new EntitlementEngine(db as never, audit);
  return { db, audit, svc };
}

// ─── Seed helpers ─────────────────────────────────────────────────────────────

function seedDef(db: StubD1, overrides: Partial<EntitlementDefinition> = {}): EntitlementDefinition {
  const def: EntitlementDefinition = {
    id: `ent_${Math.random().toString(36).slice(2, 10)}`,
    code: 'max_users',
    name: 'Max Users',
    category: 'limit',
    value_type: 'integer',
    default_value: '5',
    is_active: 1,
    sort_order: 0,
    ...overrides,
  };
  db.t['entitlement_definitions'].push(def as never);
  return def;
}

function seedPackage(db: StubD1, id: string, slug: string): void {
  db.t['subscription_packages'].push({
    id,
    slug,
    name: slug,
    status: 'active',
    is_public: 1,
    sort_order: 0,
    target_audience: 'tenant',
    version: 1,
    is_default: 0,
    metadata: '{}',
    created_by: 'system',
    created_at: NOW,
    updated_at: NOW,
  } as never);
}

describe('EntitlementEngine — createDefinition', () => {
  it('creates an entitlement definition with defaults', async () => {
    const { svc } = makeDb();
    const def = await svc.createDefinition(
      { code: 'max_places', name: 'Max Places' },
      ACTOR,
    );
    expect(def.code).toBe('max_places');
    expect(def.name).toBe('Max Places');
    expect(def.category).toBe('feature');
    expect(def.value_type).toBe('boolean');
    expect(def.default_value).toBe('false');
    expect(def.is_active).toBe(1);
  });

  it('creates a definition with explicit fields', async () => {
    const { svc } = makeDb();
    const def = await svc.createDefinition(
      { code: 'max_users', name: 'Max Users', category: 'limit', value_type: 'integer', default_value: '10' },
      ACTOR,
    );
    expect(def.category).toBe('limit');
    expect(def.value_type).toBe('integer');
    expect(def.default_value).toBe('10');
  });

  it('logs creation to audit log', async () => {
    const { db, svc } = makeDb();
    await svc.createDefinition({ code: 'ai_rights', name: 'AI Rights' }, ACTOR);
    expect(
      db.t['governance_audit_log'].some((r) => r['action'] === 'entitlement.definition.create'),
    ).toBe(true);
  });
});

describe('EntitlementEngine — getDefinition', () => {
  it('retrieves by id', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { code: 'branding_rights', name: 'Branding Rights' });
    const found = await svc.getDefinition(def.id);
    expect(found?.code).toBe('branding_rights');
  });

  it('retrieves by code', async () => {
    const { db, svc } = makeDb();
    seedDef(db, { id: 'ent_abc', code: 'ai_rights', name: 'AI Rights' });
    const found = await svc.getDefinition('ai_rights');
    expect(found?.id).toBe('ent_abc');
  });

  it('returns null for unknown id', async () => {
    const { svc } = makeDb();
    expect(await svc.getDefinition('ent_nope')).toBeNull();
  });
});

describe('EntitlementEngine — updateDefinition', () => {
  it('updates the name of a definition', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { id: 'ent_u1', code: 'max_users', name: 'Max Users' });
    const updated = await svc.updateDefinition(def.id, { name: 'Max Team Members' }, ACTOR);
    expect(updated.name).toBe('Max Team Members');
  });

  it('throws for unknown definition id', async () => {
    const { svc } = makeDb();
    await expect(
      svc.updateDefinition('ent_ghost', { name: 'X' }, ACTOR),
    ).rejects.toThrow('Entitlement definition not found');
  });
});

describe('EntitlementEngine — package entitlement bindings', () => {
  it('setPackageEntitlement creates a binding', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { id: 'ent_mu', code: 'max_users' });
    seedPackage(db, 'pkg_starter', 'starter');
    await svc.setPackageEntitlement('pkg_starter', def.id, '20', ACTOR);
    const bindings = db.t['package_entitlement_bindings'];
    expect(bindings).toHaveLength(1);
    expect(bindings[0]!['value']).toBe('20');
  });

  it('setPackageEntitlement upserts on conflict', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { id: 'ent_mu', code: 'max_users' });
    seedPackage(db, 'pkg_starter', 'starter');
    await svc.setPackageEntitlement('pkg_starter', def.id, '10', ACTOR);
    await svc.setPackageEntitlement('pkg_starter', def.id, '50', ACTOR);
    expect(db.t['package_entitlement_bindings']).toHaveLength(1);
    expect(db.t['package_entitlement_bindings'][0]!['value']).toBe('50');
  });

  it('removePackageEntitlement deletes the binding', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { id: 'ent_mu', code: 'max_users' });
    await svc.setPackageEntitlement('pkg_s', def.id, '10', ACTOR);
    expect(db.t['package_entitlement_bindings']).toHaveLength(1);
    await svc.removePackageEntitlement('pkg_s', def.id, ACTOR);
    expect(db.t['package_entitlement_bindings']).toHaveLength(0);
  });

  it('getPackageEntitlements returns bindings for package', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { id: 'ent_mu', code: 'max_users', name: 'Max Users', value_type: 'integer' });
    await svc.setPackageEntitlement('pkg_g', def.id, '100', ACTOR);
    const bindings = await svc.getPackageEntitlements('pkg_g');
    expect(bindings).toHaveLength(1);
    expect(bindings[0]!.code).toBe('max_users');
    expect(bindings[0]!.binding_value).toBe('100');
  });
});

describe('EntitlementEngine — resolveForWorkspace', () => {
  it('returns default values when no package exists', async () => {
    const { db, svc } = makeDb();
    seedDef(db, { id: 'ent_mu', code: 'max_users', value_type: 'integer', default_value: '3' });
    const resolved = await svc.resolveForWorkspace('ws_001', 'free');
    expect(resolved['max_users']).toBe(3);
  });

  it('applies package bindings over defaults', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { id: 'ent_mu', code: 'max_users', value_type: 'integer', default_value: '3' });
    seedPackage(db, 'pkg_starter', 'starter');
    await svc.setPackageEntitlement('pkg_starter', def.id, '50', ACTOR);
    const resolved = await svc.resolveForWorkspace('ws_001', 'starter');
    expect(resolved['max_users']).toBe(50);
  });

  it('workspace overrides take highest priority over package bindings', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { id: 'ent_mu', code: 'max_users', value_type: 'integer', default_value: '3' });
    seedPackage(db, 'pkg_starter', 'starter');
    await svc.setPackageEntitlement('pkg_starter', def.id, '50', ACTOR);
    await svc.setWorkspaceOverride('ws_vip', 'tenant_a', def.id, '999', 'admin_001', {}, ACTOR);
    const resolved = await svc.resolveForWorkspace('ws_vip', 'starter');
    expect(resolved['max_users']).toBe(999);
  });

  it('resolves boolean entitlements correctly', async () => {
    const { db, svc } = makeDb();
    seedDef(db, { id: 'ent_ai', code: 'ai_rights', value_type: 'boolean', default_value: 'false' });
    seedPackage(db, 'pkg_pro', 'pro');
    db.t['package_entitlement_bindings'].push({
      id: 'peb_001',
      package_id: 'pkg_pro',
      entitlement_id: 'ent_ai',
      value: 'true',
      billing_interval_id: null,
    } as never);
    const resolved = await svc.resolveForWorkspace('ws_001', 'pro');
    expect(resolved['ai_rights']).toBe(true);
  });

  it('excludes expired workspace overrides', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { id: 'ent_mu', code: 'max_users', value_type: 'integer', default_value: '5' });
    // Expired override
    const pastTs = NOW - 3600;
    db.t['workspace_entitlement_overrides'].push({
      id: 'weo_001',
      workspace_id: 'ws_001',
      tenant_id: 'tenant_a',
      entitlement_id: def.id,
      value: '999',
      expires_at: pastTs,
    } as never);
    const resolved = await svc.resolveForWorkspace('ws_001', 'free');
    expect(resolved['max_users']).toBe(5);
  });
});

describe('EntitlementEngine — setWorkspaceOverride', () => {
  it('stores a workspace override', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { id: 'ent_ai', code: 'ai_rights' });
    await svc.setWorkspaceOverride('ws_001', 'tenant_a', def.id, 'true', 'admin', {}, ACTOR);
    const overrides = db.t['workspace_entitlement_overrides'];
    expect(overrides).toHaveLength(1);
    expect(overrides[0]!['value']).toBe('true');
    expect(overrides[0]!['workspace_id']).toBe('ws_001');
  });

  it('upserts on conflict (same workspace + entitlement)', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { id: 'ent_ai', code: 'ai_rights' });
    await svc.setWorkspaceOverride('ws_001', 'tenant_a', def.id, 'true', 'admin', {}, ACTOR);
    await svc.setWorkspaceOverride('ws_001', 'tenant_a', def.id, 'false', 'admin', {}, ACTOR);
    expect(db.t['workspace_entitlement_overrides']).toHaveLength(1);
    expect(db.t['workspace_entitlement_overrides'][0]!['value']).toBe('false');
  });

  it('logs the override action', async () => {
    const { db, svc } = makeDb();
    const def = seedDef(db, { id: 'ent_ai', code: 'ai_rights' });
    await svc.setWorkspaceOverride('ws_001', 'tenant_a', def.id, 'true', 'admin', {}, ACTOR);
    expect(
      db.t['governance_audit_log'].some(
        (r) => r['action'] === 'entitlement.workspace_override.set',
      ),
    ).toBe(true);
  });
});

describe('EntitlementEngine — listDefinitions', () => {
  it('returns all active definitions with pagination', async () => {
    const { db, svc } = makeDb();
    seedDef(db, { id: 'ent_a', code: 'alpha' });
    seedDef(db, { id: 'ent_b', code: 'beta' });
    const result = await svc.listDefinitions({ limit: 50, offset: 0 });
    expect(result.results).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('filters by category', async () => {
    const { db, svc } = makeDb();
    seedDef(db, { id: 'ent_f', code: 'feat', category: 'feature' });
    seedDef(db, { id: 'ent_l', code: 'lim', category: 'limit' });
    const result = await svc.listDefinitions({ category: 'limit' });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]!.code).toBe('lim');
  });
});
