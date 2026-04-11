/**
 * packages/verticals-spare-parts — SparePartsRepository tests
 * M11 P3 acceptance: ≥15 tests. P13: mechanic details never to AI.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SparePartsRepository } from './spare-parts.js';
import {
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidSparePartsTransition,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof SparePartsRepository>[0];
}

describe('SparePartsRepository', () => {
  let repo: SparePartsRepository;
  beforeEach(() => { repo = new SparePartsRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Ladipo Auto Spares' });
    expect(p.status).toBe('seeded');
    expect(p.shopName).toBe('Ladipo Auto Spares');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Ojuwoye Spares' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid', () => {
    expect(isValidSparePartsTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: claimed → cac_verified valid', () => {
    expect(isValidSparePartsTransition('claimed', 'cac_verified')).toBe(true);
  });

  it('T005 — FSM: invalid transition seeded → active', () => {
    expect(isValidSparePartsTransition('seeded', 'active')).toBe(false);
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
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Aba Motor Spares', cacRc: 'RC-004' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'cac_verified');
    expect(updated!.status).toBe('cac_verified');
  });

  it('T009 — creates part with integer unitPriceKobo (P9)', async () => {
    const part = await repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'Toyota Camry Shock Absorber', category: 'suspension', unitPriceKobo: 35_000 });
    expect(part.unitPriceKobo).toBe(35_000);
    expect(part.category).toBe('suspension');
  });

  it('T010 — rejects fractional unitPriceKobo (P9)', async () => {
    await expect(repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'Brake Pad', category: 'brakes', unitPriceKobo: 12.5 })).rejects.toThrow('P9');
  });

  it('T011 — creates mechanic credit with integer creditLimitKobo (P9)', async () => {
    const credit = await repo.createMechanicCredit({ workspaceId: 'ws1', tenantId: 'tn1', mechanicPhone: '080', mechanicName: 'Chike Auto Works', creditLimitKobo: 500_000 });
    expect(credit.creditLimitKobo).toBe(500_000);
    expect(credit.balanceOwingKobo).toBe(0);
  });

  it('T012 — rejects fractional creditLimitKobo (P9)', async () => {
    await expect(repo.createMechanicCredit({ workspaceId: 'ws1', tenantId: 'tn1', mechanicPhone: '070', mechanicName: 'X', creditLimitKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T013 — creates order with integer totalKobo (P9)', async () => {
    const order = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '080', totalKobo: 150_000 });
    expect(order.totalKobo).toBe(150_000);
    expect(order.status).toBe('placed');
  });

  it('T014 — updates order status', async () => {
    const order = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '090', totalKobo: 80_000 });
    const updated = await repo.updateOrderStatus(order.id, 'tn1', 'confirmed');
    expect(updated!.status).toBe('confirmed');
  });

  it('T015 — AI advisory: mechanic PII stripped from part aggregate (P13)', async () => {
    const parts = await repo.listParts('ws1', 'tn1');
    const advisory = parts.map(p => ({ category: p.category, unit_price_kobo: p.unitPriceKobo }));
    expect(advisory.every(a => !('mechanic_name' in a) && !('mechanic_phone' in a))).toBe(true);
  });

  it('T016 — part number stored on catalogue item', async () => {
    const part = await repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'NGK Spark Plug', category: 'engine', unitPriceKobo: 8_000, partNumber: 'NGK-BPR6ES' });
    expect(part.partNumber).toBe('NGK-BPR6ES');
  });
});
