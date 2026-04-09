/**
 * packages/verticals-food-vendor — FoodVendorRepository tests
 * M9 acceptance: ≥15 tests.
 * 3-state informal FSM: seeded → claimed → active
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FoodVendorRepository } from './food-vendor.js';
import {
  guardSeedToClaimed,
  isValidFoodVendorTransition,
} from './types.js';

function makeDb() {
  const store: Record<string, unknown>[] = [];
  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      run: async () => {
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
          const colM = sql.match(/\(([^)]+)\)\s+VALUES/i);
          const valM = sql.match(/VALUES\s*\(([^)]+)\)/i);
          if (colM && valM) {
            const cols = colM[1]!.split(',').map((c: string) => c.trim());
            const tokens = valM[1]!.split(',').map((v: string) => v.trim());
            const row: Record<string, unknown> = {};
            let bi = 0;
            cols.forEach((col: string, i: number) => {
              const tok = tokens[i] ?? '?';
              if (tok === '?') { row[col] = vals[bi++]; }
              else if (tok.toUpperCase() === 'NULL') { row[col] = null; }
              else if (tok.toLowerCase() === 'unixepoch()') { row[col] = Math.floor(Date.now() / 1000); }
              else if (tok.startsWith("'") && tok.endsWith("'")) { row[col] = tok.slice(1, -1); }
              else if (!Number.isNaN(Number(tok))) { row[col] = Number(tok); }
              else { row[col] = vals[bi++]; }
            });
            if (row['status'] === undefined) row['status'] = 'seeded';
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim()).filter((s: string) => !s.startsWith('updated_at'));
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              clauses.forEach((clause: string, i: number) => {
                const col = clause.split('=')[0]!.trim();
                (store[idx] as Record<string, unknown>)[col] = vals[i];
              });
            }
          }
        }
        return { success: true };
      },
      first: async <T>() => {
        if (sql.toLowerCase().includes('sum(') || sql.toLowerCase().includes('count(')) {
          const total = store.filter(r => r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1]).reduce((s, r) => s + Number(r['total_kobo'] ?? 0), 0);
          const cnt = store.filter(r => r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1]).length;
          return { total, cnt } as unknown as T;
        }
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        const found = store.find(r => vals.length >= 2 ? r['id'] === vals[0] && r['tenant_id'] === vals[1] : r['id'] === vals[0]);
        return (found ?? null) as T;
      },
      all: async <T>() => {
        return { results: store.filter(r => vals.length >= 2 ? r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1] : true) } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof FoodVendorRepository>[0];
}

describe('FoodVendorRepository', () => {
  let repo: FoodVendorRepository;
  beforeEach(() => { repo = new FoodVendorRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded (3-state informal FSM)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', vendorName: 'Mama Ngozi Buka', foodType: 'buka', lga: 'Ikeja', state: 'Lagos' });
    expect(p.status).toBe('seeded');
    expect(p.foodType).toBe('buka');
  });

  it('T002 — cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', vendorName: 'V1', foodType: 'suya', lga: 'Garki', state: 'Abuja' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM guard seeded→claimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T004 — 3-state FSM: only seeded→claimed and claimed→active are valid', () => {
    expect(isValidFoodVendorTransition('seeded', 'claimed')).toBe(true);
    expect(isValidFoodVendorTransition('claimed', 'active')).toBe(true);
    expect(isValidFoodVendorTransition('seeded', 'active')).toBe(false);
  });

  it('T005 — no suspended state in 3-state informal FSM (T4)', () => {
    expect(isValidFoodVendorTransition('active', 'suspended' as never)).toBe(false);
    expect(isValidFoodVendorTransition('seeded', 'suspended' as never)).toBe(false);
  });

  it('T006 — transitionProfile seeded→claimed', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', vendorName: 'V2', foodType: 'mama_put', lga: 'Mushin', state: 'Lagos' });
    const u = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('T007 — transitionProfile claimed→active (no regulatory gate)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', vendorName: 'V3', foodType: 'shawarma', lga: 'VI', state: 'Lagos' });
    await repo.transitionProfile(p.id, 'tn1', 'claimed');
    const u = await repo.transitionProfile(p.id, 'tn1', 'active');
    expect(u?.status).toBe('active');
  });

  it('T008 — creates menu item with integer price_kobo (P9)', async () => {
    const m = await repo.createMenuItem({ workspaceId: 'ws1', tenantId: 'tn1', itemName: 'Jollof Rice (large)', priceKobo: 150000 });
    expect(m.priceKobo).toBe(150000);
    expect(m.available).toBe(true);
  });

  it('T009 — rejects fractional price_kobo for menu item (P9)', async () => {
    await expect(repo.createMenuItem({ workspaceId: 'ws1', tenantId: 'tn1', itemName: 'Suya per stick', priceKobo: 500.5 })).rejects.toThrow('[P9]');
  });

  it('T010 — toggleMenuItem sets available to false', async () => {
    const m = await repo.createMenuItem({ workspaceId: 'ws1', tenantId: 'tn1', itemName: 'Bole with fish', priceKobo: 100000 });
    const u = await repo.toggleMenuItem(m.id, 'tn1', false);
    expect(u?.available).toBe(false);
  });

  it('T011 — records daily sale with integer total_kobo (P9)', async () => {
    const today = Math.floor(Date.now() / 1000);
    const s = await repo.recordSale({ workspaceId: 'ws1', tenantId: 'tn1', saleDate: today, totalKobo: 5000000, itemsSoldCount: 30 });
    expect(s.totalKobo).toBe(5000000);
    expect(s.itemsSoldCount).toBe(30);
  });

  it('T012 — rejects fractional total_kobo for sale (P9)', async () => {
    const today = Math.floor(Date.now() / 1000);
    await expect(repo.recordSale({ workspaceId: 'ws1', tenantId: 'tn1', saleDate: today, totalKobo: 4999.5 })).rejects.toThrow('[P9]');
  });

  it('T013 — cross-tenant menu item hidden (T3)', async () => {
    const m = await repo.createMenuItem({ workspaceId: 'ws1', tenantId: 'tn1', itemName: 'Eba + Egusi', priceKobo: 80000 });
    expect(await repo.findMenuItemById(m.id, 'tn-other')).toBeNull();
  });

  it('T014 — cross-tenant sale record hidden (T3)', async () => {
    const s = await repo.recordSale({ workspaceId: 'ws1', tenantId: 'tn1', saleDate: Math.floor(Date.now() / 1000), totalKobo: 200000 });
    expect(await repo.findSaleById(s.id, 'tn-other')).toBeNull();
  });

  it('T015 — getSalesAggregate returns zero for new tenant', async () => {
    const agg = await repo.getSalesAggregate('ws1', 'tn1');
    expect(agg.totalKobo).toBe(0);
    expect(agg.salesCount).toBe(0);
  });

  it('T016 — lg_permit_number is optional (informal sector — no FSM gate)', async () => {
    const noPermit = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', vendorName: 'Street Suya', foodType: 'suya', lga: 'Yaba', state: 'Lagos' });
    expect(noPermit.lgPermitNumber).toBeNull();
    const withPermit = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', vendorName: 'Registered Vendor', foodType: 'buka', lga: 'Surulere', state: 'Lagos', lgPermitNumber: 'LG/2024/001' });
    expect(withPermit.lgPermitNumber).toBe('LG/2024/001');
  });
});
