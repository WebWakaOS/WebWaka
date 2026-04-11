/**
 * packages/verticals-water-vendor — WaterVendorRepository tests
 * M10 P3 acceptance: ≥15 tests. Volume/litres as integers (P9).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WaterVendorRepository } from './water-vendor.js';
import {
  guardSeedToClaimed,
  guardClaimedToNafdacVerified,
  isValidWaterVendorTransition,
} from './types.js';

function makeDb() {
  const store: Record<string, unknown>[] = [];
  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      // eslint-disable-next-line @typescript-eslint/require-await
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
            if (!row['status']) row['status'] = 'seeded';
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim()).filter((s: string) => !s.includes('updated_at'));
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
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        const found = store.find(r =>
          vals.length >= 2 ? r['id'] === vals[0] && r['tenant_id'] === vals[1] : r['id'] === vals[0]
        );
        return (found ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => ({
        results: store.filter(r =>
          vals.length >= 2
            ? (r['workspace_id'] === vals[0] || r['id'] === vals[0]) && r['tenant_id'] === vals[1]
            : true
        ),
      } as { results: T[] }),
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof WaterVendorRepository>[0];
}

describe('WaterVendorRepository', () => {
  let repo: WaterVendorRepository;
  beforeEach(() => { repo = new WaterVendorRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', brandName: 'Pure Life Waters' });
    expect(p.status).toBe('seeded');
    expect(p.brandName).toBe('Pure Life Waters');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', brandName: 'Crystal Clear' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid', () => {
    expect(isValidWaterVendorTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: invalid transition claimed → active (must go through nafdac_verified)', () => {
    expect(isValidWaterVendorTransition('claimed', 'active')).toBe(false);
  });

  it('T005 — FSM: claimed → nafdac_verified valid', () => {
    expect(isValidWaterVendorTransition('claimed', 'nafdac_verified')).toBe(true);
  });

  it('T006 — FSM: nafdac_verified → active valid', () => {
    expect(isValidWaterVendorTransition('nafdac_verified', 'active')).toBe(true);
  });

  it('T007 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T008 — guardClaimedToNafdacVerified requires NAFDAC number + Tier 2', () => {
    expect(guardClaimedToNafdacVerified({ nafdacNumber: null, kycTier: 2 }).allowed).toBe(false);
    expect(guardClaimedToNafdacVerified({ nafdacNumber: 'NAFDAC-001', kycTier: 1 }).allowed).toBe(false);
    expect(guardClaimedToNafdacVerified({ nafdacNumber: 'NAFDAC-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('T009 — transitions to nafdac_verified', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', brandName: 'Aqua Springs', nafdacNumber: 'NAFDAC-AQ-001' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'nafdac_verified');
    expect(updated!.status).toBe('nafdac_verified');
  });

  it('T010 — creates product price with integer volumeLitres and unitPriceKobo (P9)', async () => {
    const price = await repo.createProductPrice({ workspaceId: 'ws1', tenantId: 'tn1', productType: 'dispenser_19l', volumeLitres: 19, unitPriceKobo: 2_000 });
    expect(price.volumeLitres).toBe(19);
    expect(price.unitPriceKobo).toBe(2_000);
    expect(price.productType).toBe('dispenser_19l');
  });

  it('T011 — rejects float volumeLitres (P9)', async () => {
    await expect(repo.createProductPrice({ workspaceId: 'ws1', tenantId: 'tn1', productType: 'bottle_1_5l', volumeLitres: 1.5, unitPriceKobo: 100 })).rejects.toThrow('P9');
  });

  it('T012 — rejects fractional unitPriceKobo (P9)', async () => {
    await expect(repo.createProductPrice({ workspaceId: 'ws1', tenantId: 'tn1', productType: 'sachet', volumeLitres: 1, unitPriceKobo: 10.5 })).rejects.toThrow('P9');
  });

  it('T013 — creates delivery order with integer quantities (P9)', async () => {
    const order = await repo.createDeliveryOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08031234567', deliveryAddress: 'No 5 Broad St, Lagos', productType: 'dispenser_19l', quantityUnits: 3, totalKobo: 6_000 });
    expect(order.quantityUnits).toBe(3);
    expect(order.totalKobo).toBe(6_000);
    expect(order.status).toBe('pending');
  });

  it('T014 — rejects fractional totalKobo (P9)', async () => {
    await expect(repo.createDeliveryOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '080', deliveryAddress: 'Ikeja', productType: 'sachet', quantityUnits: 1, totalKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T015 — updates delivery order to dispatched', async () => {
    const order = await repo.createDeliveryOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '070', deliveryAddress: 'Yaba', productType: 'bottle_75cl', quantityUnits: 24, totalKobo: 3_600 });
    const updated = await repo.updateDeliveryStatus(order.id, 'tn1', 'dispatched');
    expect(updated!.status).toBe('dispatched');
  });

  it('T016 — lists product prices scoped to tenant (T3)', async () => {
    await repo.createProductPrice({ workspaceId: 'ws1', tenantId: 'tn1', productType: 'sachet', volumeLitres: 1, unitPriceKobo: 10 });
    await repo.createProductPrice({ workspaceId: 'ws1', tenantId: 'tn1', productType: 'dispenser_19l', volumeLitres: 19, unitPriceKobo: 2_000 });
    const prices = await repo.listProductPrices('ws1', 'tn1');
    expect(prices.length).toBe(2);
  });
});
