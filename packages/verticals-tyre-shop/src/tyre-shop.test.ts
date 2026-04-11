/**
 * packages/verticals-tyre-shop — TyreShopRepository tests
 * M10 P3 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TyreShopRepository } from './tyre-shop.js';
import {
  guardSeedToClaimed,
  guardClaimedToActive,
  isValidTyreShopTransition,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof TyreShopRepository>[0];
}

describe('TyreShopRepository', () => {
  let repo: TyreShopRepository;
  beforeEach(() => { repo = new TyreShopRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Berger Tyre Centre' });
    expect(p.status).toBe('seeded');
    expect(p.shopName).toBe('Berger Tyre Centre');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Lagos Tyres' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid (3-state)', () => {
    expect(isValidTyreShopTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: claimed → active valid (3-state)', () => {
    expect(isValidTyreShopTransition('claimed', 'active')).toBe(true);
  });

  it('T005 — FSM: seeded → active invalid', () => {
    expect(isValidTyreShopTransition('seeded', 'active')).toBe(false);
  });

  it('T006 — FSM: active has no further transitions', () => {
    expect(isValidTyreShopTransition('active', 'seeded')).toBe(false);
  });

  it('T007 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T008 — guardClaimedToActive always allowed (informal)', () => {
    expect(guardClaimedToActive({} as never).allowed).toBe(true);
  });

  it('T009 — transitions claimed → active', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Abuja Tyres' });
    await repo.transitionStatus(p.id, 'tn1', 'claimed');
    const updated = await repo.transitionStatus(p.id, 'tn1', 'active');
    expect(updated!.status).toBe('active');
  });

  it('T010 — creates catalogue item with integer unitPriceKobo (P9)', async () => {
    const item = await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', brand: 'Michelin', size: '185/65R15', unitPriceKobo: 75_000 });
    expect(item.unitPriceKobo).toBe(75_000);
    expect(item.brand).toBe('Michelin');
  });

  it('T011 — rejects fractional unitPriceKobo (P9)', async () => {
    await expect(repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', brand: 'Bridgestone', size: '195/55R16', unitPriceKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T012 — creates tyre job (sale) with integer priceKobo (P9)', async () => {
    const job = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'LND-123AB', jobType: 'sale', priceKobo: 150_000, tyreSize: '195/55R16' });
    expect(job.priceKobo).toBe(150_000);
    expect(job.jobType).toBe('sale');
    expect(job.status).toBe('intake');
  });

  it('T013 — rejects fractional priceKobo (P9)', async () => {
    await expect(repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'KJA-456CD', jobType: 'repair', priceKobo: 5.5 })).rejects.toThrow('P9');
  });

  it('T014 — creates balancing job', async () => {
    const job = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'ABJ-789EF', jobType: 'balancing', priceKobo: 10_000 });
    expect(job.jobType).toBe('balancing');
  });

  it('T015 — updates job status to completed', async () => {
    const job = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'RIV-001GH', jobType: 'alignment', priceKobo: 15_000 });
    const updated = await repo.updateJobStatus(job.id, 'tn1', 'completed');
    expect(updated!.status).toBe('completed');
  });

  it('T016 — lists catalogue items scoped to tenant (T3)', async () => {
    await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', brand: 'Dunlop', size: '175/70R14', unitPriceKobo: 60_000 });
    await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', brand: 'Roadstone', size: '205/55R16', unitPriceKobo: 90_000 });
    const items = await repo.listCatalogueItems('ws1', 'tn1');
    expect(items.length).toBe(2);
  });
});
