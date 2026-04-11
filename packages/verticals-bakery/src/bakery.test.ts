/**
 * packages/verticals-bakery — BakeryRepository tests
 * M9 acceptance: ≥15 tests covering FSM, CRUD, P9, T3.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BakeryRepository } from './bakery.js';
import {
  guardSeedToClaimed,
  guardClaimedToNafdacVerified,
  guardNafdacVerifiedToActive,
  isValidBakeryTransition,
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
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        const found = store.find(r => {
          if (vals.length >= 2) return r['id'] === vals[0] && r['tenant_id'] === vals[1];
          return r['id'] === vals[0];
        });
        return (found ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        const cond = (r: Record<string, unknown>) => {
          if (sql.toLowerCase().includes('quantity_in_stock <= reorder_level')) {
            return r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1] && Number(r['quantity_in_stock']) <= Number(r['reorder_level']);
          }
          if (vals.length >= 2) return r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1];
          return true;
        };
        return { results: store.filter(cond) as unknown[] } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof BakeryRepository>[0];
}

describe('BakeryRepository', () => {
  let repo: BakeryRepository;
  beforeEach(() => { repo = new BakeryRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', bakeryName: "Mama Ngozi's Cakes" });
    expect(p.status).toBe('seeded');
    expect(p.bakeryName).toBe("Mama Ngozi's Cakes");
  });

  it('T002 — findProfileById returns null for wrong tenant (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', bakeryName: 'B1' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM guard seeded→claimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T004 — FSM guard claimed→nafdac_verified requires NAFDAC number', () => {
    expect(guardClaimedToNafdacVerified({ nafdacNumber: null }).allowed).toBe(false);
    expect(guardClaimedToNafdacVerified({ nafdacNumber: 'NAFDAC/B/001' }).allowed).toBe(true);
  });

  it('T005 — FSM guard nafdac_verified→active requires future expiry', () => {
    const past = Math.floor(Date.now() / 1000) - 86400;
    const future = Math.floor(Date.now() / 1000) + 86400;
    expect(guardNafdacVerifiedToActive({ productionLicenseExpiry: null }).allowed).toBe(false);
    expect(guardNafdacVerifiedToActive({ productionLicenseExpiry: past }).allowed).toBe(false);
    expect(guardNafdacVerifiedToActive({ productionLicenseExpiry: future }).allowed).toBe(true);
  });

  it('T006 — isValidBakeryTransition validates FSM edges', () => {
    expect(isValidBakeryTransition('seeded', 'claimed')).toBe(true);
    expect(isValidBakeryTransition('claimed', 'nafdac_verified')).toBe(true);
    expect(isValidBakeryTransition('nafdac_verified', 'active')).toBe(true);
    expect(isValidBakeryTransition('seeded', 'active')).toBe(false);
  });

  it('T007 — invalid FSM transition rejected (T4)', () => {
    expect(isValidBakeryTransition('seeded', 'suspended')).toBe(false);
    expect(isValidBakeryTransition('active', 'claimed')).toBe(false);
  });

  it('T008 — transitionProfile updates status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', bakeryName: 'B2' });
    const u = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('T009 — creates product with integer unit_price_kobo (P9)', async () => {
    const prod = await repo.createProduct({ workspaceId: 'ws1', tenantId: 'tn1', productName: 'Chin Chin', category: 'snack', unitPriceKobo: 50000 });
    expect(prod.unitPriceKobo).toBe(50000);
  });

  it('T010 — rejects fractional unit_price_kobo (P9)', async () => {
    await expect(repo.createProduct({ workspaceId: 'ws1', tenantId: 'tn1', productName: 'Cake', category: 'cake', unitPriceKobo: 5000.5 })).rejects.toThrow('[P9]');
  });

  it('T011 — creates order with integer deposit_kobo and balance_kobo (P9)', async () => {
    const o = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '08000000001', quantity: 2, depositKobo: 100000, balanceKobo: 150000 });
    expect(o.depositKobo).toBe(100000);
    expect(o.balanceKobo).toBe(150000);
    expect(o.status).toBe('pending');
  });

  it('T012 — rejects fractional deposit_kobo (P9)', async () => {
    await expect(repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '0800000000', quantity: 1, depositKobo: 500.5, balanceKobo: 0 })).rejects.toThrow('[P9]');
  });

  it('T013 — order status progression pending→baking', async () => {
    const o = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '08000000002', quantity: 1, depositKobo: 50000, balanceKobo: 50000 });
    const u = await repo.updateOrderStatus(o.id, 'tn1', 'baking');
    expect(u?.status).toBe('baking');
  });

  it('T014 — creates ingredient with integer unit_cost_kobo (P9)', async () => {
    const i = await repo.createIngredient({ workspaceId: 'ws1', tenantId: 'tn1', ingredientName: 'Flour', unit: 'kg', quantityInStockX1000: 50000, unitCostKobo: 120000 });
    expect(i.unitCostKobo).toBe(120000);
  });

  it('T015 — rejects fractional ingredient unit_cost_kobo (P9)', async () => {
    await expect(repo.createIngredient({ workspaceId: 'ws1', tenantId: 'tn1', ingredientName: 'Sugar', unit: 'kg', quantityInStockX1000: 10000, unitCostKobo: 45000.99 })).rejects.toThrow('[P9]');
  });

  it('T016 — cross-tenant ingredient is not visible (T3)', async () => {
    const i = await repo.createIngredient({ workspaceId: 'ws1', tenantId: 'tn1', ingredientName: 'Butter', unit: 'kg', quantityInStockX1000: 5000, unitCostKobo: 90000 });
    expect(await repo.findIngredientById(i.id, 'tn-other')).toBeNull();
  });
});
