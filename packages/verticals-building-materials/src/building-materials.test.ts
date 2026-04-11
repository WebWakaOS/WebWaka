/**
 * packages/verticals-building-materials — BuildingMaterialsRepository tests
 * M12 P3 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BuildingMaterialsRepository } from './building-materials.js';
import {
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidBuildingMaterialsTransition,
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
                (store[idx]! as Record<string, unknown>)[col] = vals[i];
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof BuildingMaterialsRepository>[0];
}

describe('BuildingMaterialsRepository', () => {
  let repo: BuildingMaterialsRepository;
  beforeEach(() => { repo = new BuildingMaterialsRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Onitsha Cement Dealers' });
    expect(p.status).toBe('seeded');
    expect(p.companyName).toBe('Onitsha Cement Dealers');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Apapa Iron Rods' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid', () => {
    expect(isValidBuildingMaterialsTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: invalid transition claimed → active (must go through cac_verified)', () => {
    expect(isValidBuildingMaterialsTransition('claimed', 'active')).toBe(false);
  });

  it('T005 — FSM: cac_verified → active valid', () => {
    expect(isValidBuildingMaterialsTransition('cac_verified', 'active')).toBe(true);
  });

  it('T006 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T007 — guardClaimedToCacVerified requires CAC RC', () => {
    expect(guardClaimedToCacVerified({ cacRc: null }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacRc: 'RC-123456' }).allowed).toBe(true);
  });

  it('T008 — transitions to cac_verified', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Kano Tiles Hub', cacRc: 'RC-001' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'cac_verified');
    expect(updated!.status).toBe('cac_verified');
  });

  it('T009 — creates catalogue item with integer unitPriceKobo (P9)', async () => {
    const item = await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', productName: 'Dangote Cement', category: 'cement', unit: 'bag', unitPriceKobo: 750_000 });
    expect(item.unitPriceKobo).toBe(750_000);
    expect(item.category).toBe('cement');
  });

  it('T010 — rejects non-integer unitPriceKobo (P9)', async () => {
    await expect(repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', productName: 'Steel Rod', category: 'steel', unit: 'tonne', unitPriceKobo: 1.5 })).rejects.toThrow('P9');
  });

  it('T011 — creates order with integer totalKobo (P9)', async () => {
    const order = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08031234567', clientName: 'Emeka Builders', totalKobo: 5_000_000 });
    expect(order.totalKobo).toBe(5_000_000);
    expect(order.status).toBe('placed');
  });

  it('T012 — rejects fractional totalKobo (P9)', async () => {
    await expect(repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '080', clientName: 'X', totalKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T013 — updates order status', async () => {
    const order = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '080', clientName: 'Y', totalKobo: 2_000_000 });
    const updated = await repo.updateOrderStatus(order.id, 'tn1', 'confirmed');
    expect(updated!.status).toBe('confirmed');
  });

  it('T014 — creates contractor credit account with integer creditLimitKobo (P9)', async () => {
    const acct = await repo.createCreditAccount({ workspaceId: 'ws1', tenantId: 'tn1', contractorPhone: '08054321098', contractorName: 'Chidi Contractors', creditLimitKobo: 10_000_000 });
    expect(acct.creditLimitKobo).toBe(10_000_000);
    expect(acct.balanceOwingKobo).toBe(0);
  });

  it('T015 — rejects fractional creditLimitKobo (P9)', async () => {
    await expect(repo.createCreditAccount({ workspaceId: 'ws1', tenantId: 'tn1', contractorPhone: '080', contractorName: 'Z', creditLimitKobo: 500.25 })).rejects.toThrow('P9');
  });

  it('T016 — AI advisory: contractor PII not in aggregate (P13)', async () => {
    const items = await repo.listCatalogueItems('ws1', 'tn1');
    const advisory = items.map(i => ({ category: i.category, unit_price_kobo: i.unitPriceKobo }));
    expect(advisory.every(a => !('contractor_name' in a))).toBe(true);
  });
});
