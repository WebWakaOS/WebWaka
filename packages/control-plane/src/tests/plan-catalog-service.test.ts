import { describe, it, expect, beforeEach } from 'vitest';
import { PlanCatalogService } from '../plan-catalog-service.js';
import { AuditService } from '../audit-service.js';
import { StubD1 } from './stub-db.js';
import type { ActorContext, BillingInterval } from '../types.js';

const ACTOR: ActorContext = {
  actorId: 'user_001',
  actorRole: 'super_admin',
  actorLevel: 'super_admin',
  tenantId: 'tenant_a',
};

function makeDb() {
  const db = new StubD1();
  const audit = new AuditService(db as never);
  const svc = new PlanCatalogService(db as never, audit);
  return { db, audit, svc };
}

describe('PlanCatalogService — createPackage', () => {
  it('creates a package with required fields and defaults', async () => {
    const { svc } = makeDb();
    const pkg = await svc.createPackage({ slug: 'starter', name: 'Starter Plan' }, ACTOR);
    expect(pkg.slug).toBe('starter');
    expect(pkg.name).toBe('Starter Plan');
    expect(pkg.status).toBe('draft');
    expect(pkg.is_public).toBe(1);
    expect(pkg.sort_order).toBe(0);
    expect(pkg.version).toBe(1);
    expect(typeof pkg.id).toBe('string');
    expect(pkg.id.startsWith('pkg_')).toBe(true);
  });

  it('creates a package with explicit status and sort_order', async () => {
    const { svc } = makeDb();
    const pkg = await svc.createPackage(
      { slug: 'growth', name: 'Growth', status: 'active', sort_order: 2 },
      ACTOR,
    );
    expect(pkg.status).toBe('active');
    expect(pkg.sort_order).toBe(2);
  });

  it('logs the create action to the audit log', async () => {
    const { db, svc } = makeDb();
    await svc.createPackage({ slug: 'pro', name: 'Pro' }, ACTOR);
    const log = db.t['governance_audit_log'];
    expect(log.some((r) => r['action'] === 'package.create')).toBe(true);
  });
});

describe('PlanCatalogService — getPackage', () => {
  it('retrieves a package by id', async () => {
    const { svc } = makeDb();
    const created = await svc.createPackage({ slug: 'free', name: 'Free' }, ACTOR);
    const found = await svc.getPackage(created.id);
    expect(found?.slug).toBe('free');
  });

  it('retrieves a package by slug', async () => {
    const { svc } = makeDb();
    await svc.createPackage({ slug: 'enterprise', name: 'Enterprise' }, ACTOR);
    const found = await svc.getPackage('enterprise');
    expect(found?.name).toBe('Enterprise');
  });

  it('returns null for unknown id or slug', async () => {
    const { svc } = makeDb();
    expect(await svc.getPackage('nonexistent')).toBeNull();
  });
});

describe('PlanCatalogService — listPackages', () => {
  it('returns all packages with pagination metadata', async () => {
    const { svc } = makeDb();
    await svc.createPackage({ slug: 'a', name: 'A' }, ACTOR);
    await svc.createPackage({ slug: 'b', name: 'B' }, ACTOR);
    const result = await svc.listPackages({ limit: 50, offset: 0 });
    expect(result.results).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
  });

  it('filters by status', async () => {
    const { svc } = makeDb();
    await svc.createPackage({ slug: 'draft', name: 'D', status: 'draft' }, ACTOR);
    await svc.createPackage({ slug: 'active', name: 'A', status: 'active' }, ACTOR);
    const result = await svc.listPackages({ status: 'active' });
    expect(result.results).toHaveLength(1);
    expect(result.results[0]!.slug).toBe('active');
  });

  it('returns paginated subset with limit and offset', async () => {
    const { svc } = makeDb();
    for (let i = 0; i < 5; i++) {
      await svc.createPackage({ slug: `plan_${i}`, name: `Plan ${i}` }, ACTOR);
    }
    const result = await svc.listPackages({ limit: 2, offset: 2 });
    expect(result.results).toHaveLength(2);
    expect(result.total).toBe(5);
  });
});

describe('PlanCatalogService — updatePackage', () => {
  it('updates the name of a package', async () => {
    const { svc } = makeDb();
    const created = await svc.createPackage({ slug: 'old', name: 'Old Name' }, ACTOR);
    const updated = await svc.updatePackage(created.id, { name: 'New Name' }, ACTOR);
    expect(updated.name).toBe('New Name');
  });

  it('throws for an unknown package id', async () => {
    const { svc } = makeDb();
    await expect(svc.updatePackage('pkg_nope', { name: 'X' }, ACTOR)).rejects.toThrow(
      'Package not found',
    );
  });

  it('activatePackage sets status to active', async () => {
    const { svc } = makeDb();
    const pkg = await svc.createPackage({ slug: 'x', name: 'X' }, ACTOR);
    await svc.activatePackage(pkg.id, ACTOR);
    const found = await svc.getPackage(pkg.id);
    expect(found?.status).toBe('active');
  });

  it('deactivatePackage sets status to inactive', async () => {
    const { svc } = makeDb();
    const pkg = await svc.createPackage({ slug: 'y', name: 'Y', status: 'active' }, ACTOR);
    await svc.deactivatePackage(pkg.id, ACTOR);
    const found = await svc.getPackage(pkg.id);
    expect(found?.status).toBe('inactive');
  });
});

describe('PlanCatalogService — archivePackage', () => {
  it('archives a package and records superseded_by', async () => {
    const { db, svc } = makeDb();
    const pkg = await svc.createPackage({ slug: 'old', name: 'Old' }, ACTOR);
    await svc.archivePackage(pkg.id, 'pkg_new', ACTOR);
    const row = db.t['subscription_packages'].find((r) => r['id'] === pkg.id);
    expect(row?.['status']).toBe('archived');
    expect(row?.['superseded_by']).toBe('pkg_new');
  });

  it('throws for unknown package', async () => {
    const { svc } = makeDb();
    await expect(svc.archivePackage('pkg_ghost', null, ACTOR)).rejects.toThrow(
      'Package not found',
    );
  });

  it('logs the archive action', async () => {
    const { db, svc } = makeDb();
    const pkg = await svc.createPackage({ slug: 'z', name: 'Z' }, ACTOR);
    await svc.archivePackage(pkg.id, null, ACTOR);
    expect(
      db.t['governance_audit_log'].some((r) => r['action'] === 'package.archive'),
    ).toBe(true);
  });
});

describe('PlanCatalogService — billing intervals and pricing', () => {
  it('listBillingIntervals returns seeded rows', async () => {
    const db = new StubD1();
    const intervals: BillingInterval[] = [
      { id: 'bi_monthly', code: 'monthly', label: 'Monthly', sort_order: 1, is_recurring: 1, is_trial: 0 },
      { id: 'bi_annual', code: 'annual', label: 'Annual', sort_order: 2, is_recurring: 1, is_trial: 0 },
    ];
    db.seed('billing_intervals', intervals as never);
    const audit = new AuditService(db as never);
    const svc = new PlanCatalogService(db as never, audit);

    const result = await svc.listBillingIntervals();
    expect(result).toHaveLength(2);
    expect(result[0]!.code).toBe('monthly');
  });

  it('setPricing creates a pricing record', async () => {
    const db = new StubD1();
    db.seed('billing_intervals', [
      { id: 'bi_monthly', code: 'monthly', label: 'Monthly', sort_order: 1, is_recurring: 1, is_trial: 0 },
    ] as never);
    const audit = new AuditService(db as never);
    const svc = new PlanCatalogService(db as never, audit);

    const pkg = await svc.createPackage({ slug: 'starter', name: 'Starter' }, ACTOR);
    const pricing = await svc.setPricing(
      pkg.id,
      { billing_interval_id: 'bi_monthly', price_kobo: 500000 },
      ACTOR,
    );
    expect(pricing.price_kobo).toBe(500000);
    expect(pricing.package_id).toBe(pkg.id);
    expect(pricing.currency).toBe('NGN');
  });

  it('getPackagePricing returns pricing joined with billing interval', async () => {
    const db = new StubD1();
    db.seed('billing_intervals', [
      { id: 'bi_monthly', code: 'monthly', label: 'Monthly', sort_order: 1, is_recurring: 1, is_trial: 0 },
    ] as never);
    const audit = new AuditService(db as never);
    const svc = new PlanCatalogService(db as never, audit);

    const pkg = await svc.createPackage({ slug: 'growth', name: 'Growth' }, ACTOR);
    await svc.setPricing(pkg.id, { billing_interval_id: 'bi_monthly', price_kobo: 300000 }, ACTOR);

    const rows = await svc.getPackagePricing(pkg.id);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.price_kobo).toBe(300000);
    expect((rows[0]! as never as Record<string, unknown>)['interval_code']).toBe('monthly');
  });

  it('setPricing throws for unknown package', async () => {
    const { svc } = makeDb();
    await expect(
      svc.setPricing('pkg_ghost', { billing_interval_id: 'bi_x', price_kobo: 0 }, ACTOR),
    ).rejects.toThrow('Package not found');
  });
});
