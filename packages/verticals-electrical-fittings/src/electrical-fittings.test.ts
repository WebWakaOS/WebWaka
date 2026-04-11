/**
 * packages/verticals-electrical-fittings — ElectricalFittingsRepository tests
 * M12 P3 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElectricalFittingsRepository } from './electrical-fittings.js';
import {
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidElectricalFittingsTransition,
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
      first: async <T>() => {
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        const found = store.find(r =>
          vals.length >= 2 ? r['id'] === vals[0] && r['tenant_id'] === vals[1] : r['id'] === vals[0]
        );
        return (found ?? null) as T;
      },
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof ElectricalFittingsRepository>[0];
}

describe('ElectricalFittingsRepository', () => {
  let repo: ElectricalFittingsRepository;
  beforeEach(() => { repo = new ElectricalFittingsRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Alaba Electrical Hub' });
    expect(p.status).toBe('seeded');
    expect(p.companyName).toBe('Alaba Electrical Hub');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Aba Fittings' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid', () => {
    expect(isValidElectricalFittingsTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: invalid transition seeded → active', () => {
    expect(isValidElectricalFittingsTransition('seeded', 'active')).toBe(false);
  });

  it('T005 — FSM: claimed → cac_verified valid', () => {
    expect(isValidElectricalFittingsTransition('claimed', 'cac_verified')).toBe(true);
  });

  it('T006 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T007 — guardClaimedToCacVerified requires CAC RC', () => {
    expect(guardClaimedToCacVerified({ cacRc: null }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacRc: 'RC-001' }).allowed).toBe(true);
  });

  it('T008 — transitions to cac_verified', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Onitsha Electricals', cacRc: 'RC-XYZ' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'cac_verified');
    expect(updated!.status).toBe('cac_verified');
  });

  it('T009 — creates catalogue item with integer unitPriceKobo (P9)', async () => {
    const item = await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', productName: '2.5mm Twin Cable', type: 'cable', unit: 'metre', unitPriceKobo: 45_000 });
    expect(item.unitPriceKobo).toBe(45_000);
    expect(item.type).toBe('cable');
  });

  it('T010 — rejects fractional unitPriceKobo (P9)', async () => {
    await expect(repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', productName: 'Switch', type: 'switch', unit: 'piece', unitPriceKobo: 1.5 })).rejects.toThrow('P9');
  });

  it('T011 — creates order with integer totalKobo (P9)', async () => {
    const order = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '080', totalKobo: 200_000 });
    expect(order.totalKobo).toBe(200_000);
    expect(order.status).toBe('placed');
  });

  it('T012 — rejects fractional totalKobo (P9)', async () => {
    await expect(repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '080', totalKobo: 99.9 })).rejects.toThrow('P9');
  });

  it('T013 — updates order status', async () => {
    const order = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '070', totalKobo: 500_000 });
    const updated = await repo.updateOrderStatus(order.id, 'tn1', 'confirmed');
    expect(updated!.status).toBe('confirmed');
  });

  it('T014 — SON type number stored on catalogue item', async () => {
    const item = await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', productName: 'MCB 63A', type: 'breaker', unit: 'piece', unitPriceKobo: 120_000, sonTypeNumber: 'SON-MCB-63A' });
    expect(item.sonTypeNumber).toBe('SON-MCB-63A');
  });

  it('T015 — lists catalogue items scoped to tenant (T3)', async () => {
    await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', productName: 'Socket A', type: 'socket', unit: 'piece', unitPriceKobo: 30_000 });
    await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', productName: 'Socket B', type: 'socket', unit: 'piece', unitPriceKobo: 40_000 });
    const items = await repo.listCatalogueItems('ws1', 'tn1');
    expect(items.length).toBe(2);
  });
});
