/**
 * packages/verticals-cleaning-service — CleaningServiceRepository tests
 * M9 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CleaningServiceRepository } from './cleaning-service.js';
import {
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidCleaningTransition,
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
        return { results: store.filter(r => vals.length >= 2 ? r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1] : true) } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof CleaningServiceRepository>[0];
}

describe('CleaningServiceRepository', () => {
  let repo: CleaningServiceRepository;
  beforeEach(() => { repo = new CleaningServiceRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Sparkling Clean Ltd' });
    expect(p.status).toBe('seeded');
    expect(p.companyName).toBe('Sparkling Clean Ltd');
  });

  it('T002 — cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'C1' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM guard seeded→claimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T004 — FSM guard claimed→cac_verified requires CAC number', () => {
    expect(guardClaimedToCacVerified({ cacNumber: null }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacNumber: 'RC112233' }).allowed).toBe(true);
  });

  it('T005 — valid FSM transitions', () => {
    expect(isValidCleaningTransition('seeded', 'claimed')).toBe(true);
    expect(isValidCleaningTransition('claimed', 'cac_verified')).toBe(true);
    expect(isValidCleaningTransition('cac_verified', 'active')).toBe(true);
    expect(isValidCleaningTransition('active', 'suspended')).toBe(true);
    expect(isValidCleaningTransition('suspended', 'active')).toBe(true);
  });

  it('T006 — invalid FSM transitions rejected (T4)', () => {
    expect(isValidCleaningTransition('seeded', 'active')).toBe(false);
    expect(isValidCleaningTransition('active', 'seeded')).toBe(false);
  });

  it('T007 — transitionProfile updates status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'C2' });
    const u = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('T008 — creates job with integer price_kobo (P9)', async () => {
    const j = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000001', address: '5 Broad Street, Lagos', jobType: 'one_off', priceKobo: 500000 });
    expect(j.priceKobo).toBe(500000);
    expect(j.status).toBe('scheduled');
    expect(j.jobType).toBe('one_off');
  });

  it('T009 — rejects fractional price_kobo for job (P9)', async () => {
    await expect(repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '0800000000', address: 'Test', jobType: 'one_off', priceKobo: 1500.5 })).rejects.toThrow('[P9]');
  });

  it('T010 — job status progression scheduled→in_progress', async () => {
    const j = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000002', address: '10 Park Avenue', jobType: 'recurring', priceKobo: 800000 });
    const u = await repo.updateJobStatus(j.id, 'tn1', 'in_progress');
    expect(u?.status).toBe('in_progress');
  });

  it('T011 — creates supply with integer unit_cost_kobo (P9)', async () => {
    const s = await repo.createSupply({ workspaceId: 'ws1', tenantId: 'tn1', supplyName: 'Dettol', unit: 'litre', quantityInStockX1000: 10, unitCostKobo: 120000 });
    expect(s.unitCostKobo).toBe(120000);
  });

  it('T012 — rejects fractional unit_cost_kobo for supply (P9)', async () => {
    await expect(repo.createSupply({ workspaceId: 'ws1', tenantId: 'tn1', supplyName: 'Bleach', unit: 'litre', quantityInStockX1000: 5, unitCostKobo: 80000.5 })).rejects.toThrow('[P9]');
  });

  it('T013 — cross-tenant job hidden (T3)', async () => {
    const j = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000003', address: 'Test 2', jobType: 'one_off', priceKobo: 300000 });
    expect(await repo.findJobById(j.id, 'tn-other')).toBeNull();
  });

  it('T014 — cross-tenant supply hidden (T3)', async () => {
    const s = await repo.createSupply({ workspaceId: 'ws1', tenantId: 'tn1', supplyName: 'Mop', unit: 'piece', quantityInStockX1000: 2, unitCostKobo: 50000 });
    expect(await repo.findSupplyById(s.id, 'tn-other')).toBeNull();
  });

  it('T015 — recurring job stores frequency', async () => {
    const j = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000004', address: 'HQ', jobType: 'recurring', priceKobo: 600000, frequency: 'weekly' });
    expect(j.frequency).toBe('weekly');
  });
});

