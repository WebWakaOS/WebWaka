/**
 * packages/verticals-shoemaker — ShoemakerRepository tests
 * M10 P3 acceptance: ≥15 tests. Shoe size integer invariant (P9).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ShoemakerRepository } from './shoemaker.js';
import {
  guardSeedToClaimed,
  guardClaimedToActive,
  isValidShoemakerTransition,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof ShoemakerRepository>[0];
}

describe('ShoemakerRepository', () => {
  let repo: ShoemakerRepository;
  beforeEach(() => { repo = new ShoemakerRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Balogun Shoemaker' });
    expect(p.status).toBe('seeded');
    expect(p.shopName).toBe('Balogun Shoemaker');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Aba Cobbler' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid (3-state)', () => {
    expect(isValidShoemakerTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: claimed → active valid (3-state)', () => {
    expect(isValidShoemakerTransition('claimed', 'active')).toBe(true);
  });

  it('T005 — FSM: seeded → active invalid', () => {
    expect(isValidShoemakerTransition('seeded', 'active')).toBe(false);
  });

  it('T006 — FSM: active has no further transitions', () => {
    expect(isValidShoemakerTransition('active', 'seeded')).toBe(false);
  });

  it('T007 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T008 — guardClaimedToActive always allowed (informal)', () => {
    expect(guardClaimedToActive({} as never).allowed).toBe(true);
  });

  it('T009 — transitions claimed → active', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Lagos Leather Works' });
    await repo.transitionStatus(p.id, 'tn1', 'claimed');
    const updated = await repo.transitionStatus(p.id, 'tn1', 'active');
    expect(updated!.status).toBe('active');
  });

  it('T010 — creates job with integer shoeSize and priceKobo (P9)', async () => {
    const job = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '080', jobType: 'new_pair', shoeSize: 42, priceKobo: 50_000 });
    expect(job.shoeSize).toBe(42);
    expect(job.priceKobo).toBe(50_000);
    expect(job.status).toBe('intake');
  });

  it('T011 — rejects float shoeSize (P9)', async () => {
    await expect(repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '080', jobType: 'repair', shoeSize: 41.5, priceKobo: 10_000 })).rejects.toThrow('P9');
  });

  it('T012 — rejects fractional priceKobo (P9)', async () => {
    await expect(repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '080', jobType: 'repair', shoeSize: 40, priceKobo: 5.5 })).rejects.toThrow('P9');
  });

  it('T013 — updates job status to ready', async () => {
    const job = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '070', jobType: 'custom', shoeSize: 44, priceKobo: 80_000 });
    const updated = await repo.updateJobStatus(job.id, 'tn1', 'ready');
    expect(updated!.status).toBe('ready');
  });

  it('T014 — creates catalogue item with integer priceKobo and shoeSize (P9)', async () => {
    const item = await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', itemName: 'Leather Loafer', priceKobo: 75_000, shoeSize: 43 });
    expect(item.priceKobo).toBe(75_000);
    expect(item.shoeSize).toBe(43);
  });

  it('T015 — rejects fractional shoeSize in catalogue (P9)', async () => {
    await expect(repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', itemName: 'Boot', priceKobo: 60_000, shoeSize: 42.5 })).rejects.toThrow('P9');
  });

  it('T016 — deposit + balance tracked correctly', async () => {
    const job = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '090', jobType: 'new_pair', shoeSize: 39, priceKobo: 100_000, depositKobo: 30_000 });
    expect(job.depositKobo).toBe(30_000);
    expect(job.balanceKobo).toBe(70_000);
  });
});
