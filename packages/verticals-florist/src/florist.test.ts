/**
 * packages/verticals-florist — FloristRepository tests
 * M9 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FloristRepository } from './florist.js';
import {
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidFloristTransition,
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
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        const found = store.find(r => vals.length >= 2 ? r['id'] === vals[0] && r['tenant_id'] === vals[1] : r['id'] === vals[0]);
        return (found ?? null) as T;
      },
      all: async <T>() => {
        let results = store;
        if (vals.length >= 2) {
          if (sql.toLowerCase().includes('expiry_date <=')) {
            results = store.filter(r => r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1] && r['expiry_date'] !== null && Number(r['expiry_date']) <= Number(vals[2]));
          } else {
            results = store.filter(r => r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1]);
          }
        }
        return { results } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof FloristRepository>[0];
}

describe('FloristRepository', () => {
  let repo: FloristRepository;
  beforeEach(() => { repo = new FloristRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Petalz NG', speciality: 'wedding' });
    expect(p.status).toBe('seeded');
    expect(p.speciality).toBe('wedding');
  });

  it('T002 — cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'F1' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM guard seeded→claimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T004 — FSM guard claimed→cac_verified requires CAC number', () => {
    expect(guardClaimedToCacVerified({ cacNumber: null }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacNumber: 'RC001122' }).allowed).toBe(true);
  });

  it('T005 — valid FSM transitions', () => {
    expect(isValidFloristTransition('seeded', 'claimed')).toBe(true);
    expect(isValidFloristTransition('claimed', 'cac_verified')).toBe(true);
    expect(isValidFloristTransition('cac_verified', 'active')).toBe(true);
    expect(isValidFloristTransition('active', 'suspended')).toBe(true);
    expect(isValidFloristTransition('suspended', 'active')).toBe(true);
  });

  it('T006 — invalid FSM transitions rejected (T4)', () => {
    expect(isValidFloristTransition('seeded', 'active')).toBe(false);
    expect(isValidFloristTransition('active', 'seeded')).toBe(false);
  });

  it('T007 — transitionProfile updates status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'F2' });
    const u = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('T008 — creates arrangement with integer price_kobo (P9)', async () => {
    const a = await repo.createArrangement({ workspaceId: 'ws1', tenantId: 'tn1', name: 'Wedding Arch Bundle', occasion: 'wedding', priceKobo: 1500000 });
    expect(a.priceKobo).toBe(1500000);
    expect(a.occasion).toBe('wedding');
  });

  it('T009 — rejects fractional price_kobo for arrangement (P9)', async () => {
    await expect(repo.createArrangement({ workspaceId: 'ws1', tenantId: 'tn1', name: 'Bouquet', occasion: 'retail', priceKobo: 5000.5 })).rejects.toThrow('[P9]');
  });

  it('T010 — creates order with integer deposit and balance kobo (P9)', async () => {
    const o = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000001', eventDate: Date.now(), depositKobo: 500000, balanceKobo: 1000000 });
    expect(o.depositKobo).toBe(500000);
    expect(o.balanceKobo).toBe(1000000);
    expect(o.status).toBe('enquiry');
  });

  it('T011 — rejects fractional deposit_kobo (P9)', async () => {
    await expect(repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '0800000000', eventDate: Date.now(), depositKobo: 100.5 })).rejects.toThrow('[P9]');
  });

  it('T012 — order status progression enquiry→confirmed', async () => {
    const o = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000002', eventDate: Date.now(), depositKobo: 200000, balanceKobo: 300000 });
    const u = await repo.advanceOrderStatus(o.id, 'tn1', 'confirmed');
    expect(u?.status).toBe('confirmed');
  });

  it('T013 — creates stock with integer unit_cost_kobo and expiry_date (P9)', async () => {
    const expiry = Math.floor(Date.now() / 1000) + 86400 * 2;
    const s = await repo.createStock({ workspaceId: 'ws1', tenantId: 'tn1', flowerName: 'Rose', quantityInStock: 50, unitCostKobo: 2000, expiryDate: expiry });
    expect(s.unitCostKobo).toBe(2000);
    expect(s.expiryDate).toBe(expiry);
  });

  it('T014 — rejects fractional unit_cost_kobo for stock (P9)', async () => {
    await expect(repo.createStock({ workspaceId: 'ws1', tenantId: 'tn1', flowerName: 'Lily', quantityInStock: 10, unitCostKobo: 1500.5 })).rejects.toThrow('[P9]');
  });

  it('T015 — listExpiringStock returns stock expiring within threshold', async () => {
    const soon = Math.floor(Date.now() / 1000) + 86400;
    const later = Math.floor(Date.now() / 1000) + 86400 * 7;
    await repo.createStock({ id: 'stk1', workspaceId: 'ws1', tenantId: 'tn1', flowerName: 'Tulip', quantityInStock: 20, unitCostKobo: 1000, expiryDate: soon });
    await repo.createStock({ id: 'stk2', workspaceId: 'ws1', tenantId: 'tn1', flowerName: 'Orchid', quantityInStock: 10, unitCostKobo: 3000, expiryDate: later });
    const expiring = await repo.listExpiringStock('ws1', 'tn1', soon);
    expect(expiring.some(s => s.flowerName === 'Tulip')).toBe(true);
    expect(expiring.every(s => s.expiryDate !== null && s.expiryDate <= soon)).toBe(true);
  });

  it('T016 — cross-tenant order hidden (T3)', async () => {
    const o = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000003', eventDate: Date.now() });
    expect(await repo.findOrderById(o.id, 'tn-other')).toBeNull();
  });
});
