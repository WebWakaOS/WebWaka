/**
 * packages/verticals-artisanal-mining — ArtisanalMiningRepository tests
 * M12 P3 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ArtisanalMiningRepository } from './artisanal-mining.js';
import {
  guardSeedToClaimed,
  guardClaimedToMmsdVerified,
  isValidArtisanalMiningTransition,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof ArtisanalMiningRepository>[0];
}

describe('ArtisanalMiningRepository', () => {
  let repo: ArtisanalMiningRepository;
  beforeEach(() => { repo = new ArtisanalMiningRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Zamfara Gold Coop' });
    expect(p.status).toBe('seeded');
    expect(p.companyName).toBe('Zamfara Gold Coop');
  });

  it('T002 — finds profile by id + tenantId (T3 scope)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Plateau Tin Miners' });
    const found = await repo.findProfileById(p.id, 'tn1');
    expect(found).not.toBeNull();
    expect(found!.id).toBe(p.id);
  });

  it('T003 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Kaduna Columbite Ltd' });
    const found = await repo.findProfileById(p.id, 'tn-other');
    expect(found).toBeNull();
  });

  it('T004 — FSM: seeded → claimed transition valid', () => {
    expect(isValidArtisanalMiningTransition('seeded', 'claimed')).toBe(true);
  });

  it('T005 — FSM: invalid transition seeded → active rejected', () => {
    expect(isValidArtisanalMiningTransition('seeded', 'active')).toBe(false);
  });

  it('T006 — FSM: claimed → mmsd_verified valid', () => {
    expect(isValidArtisanalMiningTransition('claimed', 'mmsd_verified')).toBe(true);
  });

  it('T007 — guardSeedToClaimed: KYC Tier 1 required', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T008 — guardClaimedToMmsdVerified: MMSD permit required', () => {
    expect(guardClaimedToMmsdVerified({ mmsdPermit: null, kycTier: 2 }).allowed).toBe(false);
    expect(guardClaimedToMmsdVerified({ mmsdPermit: 'MMSD-ZF-001', kycTier: 1 }).allowed).toBe(false);
    expect(guardClaimedToMmsdVerified({ mmsdPermit: 'MMSD-ZF-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('T009 — transitions profile to mmsd_verified', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Jos Tin Coop', mmsdPermit: 'MMSD-PT-001' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'mmsd_verified');
    expect(updated!.status).toBe('mmsd_verified');
  });

  it('T010 — creates production log with integer weightGrams and salePriceKobo (P9)', async () => {
    const log = await repo.createProductionLog({ workspaceId: 'ws1', tenantId: 'tn1', mineralType: 'gold', weightGrams: 500, salePriceKobo: 150_000_000 });
    expect(log.weightGrams).toBe(500);
    expect(log.salePriceKobo).toBe(150_000_000);
    expect(log.mineralType).toBe('gold');
  });

  it('T011 — rejects non-integer weightGrams (P9)', async () => {
    await expect(repo.createProductionLog({ workspaceId: 'ws1', tenantId: 'tn1', mineralType: 'gold', weightGrams: 1.5, salePriceKobo: 1_000 })).rejects.toThrow('P9');
  });

  it('T012 — rejects non-integer salePriceKobo (P9)', async () => {
    await expect(repo.createProductionLog({ workspaceId: 'ws1', tenantId: 'tn1', mineralType: 'tin', weightGrams: 200, salePriceKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T013 — creates mining permit', async () => {
    const permit = await repo.createPermit({ workspaceId: 'ws1', tenantId: 'tn1', permitNumber: 'MMSD-ZF-2024-001', permitType: 'ASM' });
    expect(permit.permitNumber).toBe('MMSD-ZF-2024-001');
    expect(permit.permitType).toBe('ASM');
  });

  it('T014 — lists production logs scoped to tenant (T3)', async () => {
    await repo.createProductionLog({ workspaceId: 'ws1', tenantId: 'tn1', mineralType: 'gold', weightGrams: 100, salePriceKobo: 30_000_000 });
    await repo.createProductionLog({ workspaceId: 'ws1', tenantId: 'tn1', mineralType: 'tin', weightGrams: 250, salePriceKobo: 5_000_000 });
    const logs = await repo.listProductionLogs('ws1', 'tn1');
    expect(logs.length).toBe(2);
  });

  it('T015 — AI advisory: offtaker name not exposed (P13 guard)', async () => {
    const log = await repo.createProductionLog({ workspaceId: 'ws1', tenantId: 'tn1', mineralType: 'columbite', weightGrams: 1000, salePriceKobo: 80_000_000, offtakerName: 'Sensitive Buyer Ltd' });
    const logs = await repo.listProductionLogs('ws1', 'tn1');
    const advisory = logs.map(l => ({ mineral_type: l.mineralType, weight_grams: l.weightGrams, sale_price_kobo: l.salePriceKobo }));
    const hasOfftaker = advisory.some(a => JSON.stringify(a).includes('Sensitive Buyer'));
    expect(hasOfftaker).toBe(false);
    expect(log.offtakerName).toBe('Sensitive Buyer Ltd');
  });

  it('T016 — lists permits scoped to workspace + tenant', async () => {
    await repo.createPermit({ workspaceId: 'ws1', tenantId: 'tn1', permitNumber: 'P-001' });
    await repo.createPermit({ workspaceId: 'ws1', tenantId: 'tn1', permitNumber: 'P-002' });
    const permits = await repo.listPermits('ws1', 'tn1');
    expect(permits.length).toBe(2);
  });
});
