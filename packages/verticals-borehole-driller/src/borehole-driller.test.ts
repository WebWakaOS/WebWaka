/**
 * packages/verticals-borehole-driller — BoreholeDrillerRepository tests
 * M12 P3 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BoreholeDrillerRepository } from './borehole-driller.js';
import {
  guardSeedToClaimed,
  guardClaimedToCorenVerified,
  isValidBoreholeDrillerTransition,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof BoreholeDrillerRepository>[0];
}

describe('BoreholeDrillerRepository', () => {
  let repo: BoreholeDrillerRepository;
  beforeEach(() => { repo = new BoreholeDrillerRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'AquaDrill Nigeria Ltd' });
    expect(p.status).toBe('seeded');
    expect(p.companyName).toBe('AquaDrill Nigeria Ltd');
  });

  it('T002 — finds profile by id + tenantId (T3 scope)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'WaterWell Services' });
    const found = await repo.findProfileById(p.id, 'tn1');
    expect(found).not.toBeNull();
    expect(found!.id).toBe(p.id);
  });

  it('T003 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Borehole Co' });
    const found = await repo.findProfileById(p.id, 'tn-other');
    expect(found).toBeNull();
  });

  it('T004 — FSM: seeded → claimed valid', () => {
    expect(isValidBoreholeDrillerTransition('seeded', 'claimed')).toBe(true);
  });

  it('T005 — FSM: invalid transition seeded → active', () => {
    expect(isValidBoreholeDrillerTransition('seeded', 'active')).toBe(false);
  });

  it('T006 — FSM: claimed → coren_verified valid', () => {
    expect(isValidBoreholeDrillerTransition('claimed', 'coren_verified')).toBe(true);
  });

  it('T007 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T008 — guardClaimedToCorenVerified requires COREN + water board + Tier 2', () => {
    expect(guardClaimedToCorenVerified({ corenNumber: null, stateWaterBoardReg: 'WB-001', kycTier: 2 }).allowed).toBe(false);
    expect(guardClaimedToCorenVerified({ corenNumber: 'COREN-001', stateWaterBoardReg: null, kycTier: 2 }).allowed).toBe(false);
    expect(guardClaimedToCorenVerified({ corenNumber: 'COREN-001', stateWaterBoardReg: 'WB-001', kycTier: 1 }).allowed).toBe(false);
    expect(guardClaimedToCorenVerified({ corenNumber: 'COREN-001', stateWaterBoardReg: 'WB-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('T009 — transitions to coren_verified', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Deep Drill Ltd', corenNumber: 'COREN-01', stateWaterBoardReg: 'WB-LAG-001' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'coren_verified');
    expect(updated!.status).toBe('coren_verified');
  });

  it('T010 — creates project with integer depth_metres and total_cost_kobo (P9)', async () => {
    const proj = await repo.createProject({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08031234567', locationAddress: 'Ikorodu, Lagos', depthMetres: 120, totalCostKobo: 45_000_000 });
    expect(proj.depthMetres).toBe(120);
    expect(proj.totalCostKobo).toBe(45_000_000);
    expect(proj.status).toBe('survey');
  });

  it('T011 — rejects float depthMetres (P9)', async () => {
    await expect(repo.createProject({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '080', locationAddress: 'X', depthMetres: 1.5, totalCostKobo: 1_000 })).rejects.toThrow('P9');
  });

  it('T012 — rejects fractional totalCostKobo (P9)', async () => {
    await expect(repo.createProject({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '080', locationAddress: 'X', depthMetres: 100, totalCostKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T013 — updates project status', async () => {
    const proj = await repo.createProject({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '080', locationAddress: 'Abuja', depthMetres: 80, totalCostKobo: 20_000_000 });
    const updated = await repo.updateProjectStatus(proj.id, 'tn1', 'drilling');
    expect(updated!.status).toBe('drilling');
  });

  it('T014 — creates rig with integer capacity (P9)', async () => {
    const rig = await repo.createRig({ workspaceId: 'ws1', tenantId: 'tn1', rigName: 'Rig-Alpha', rigCapacityMetres: 300 });
    expect(rig.rigName).toBe('Rig-Alpha');
    expect(rig.rigCapacityMetres).toBe(300);
    expect(rig.status).toBe('available');
  });

  it('T015 — rejects float rigCapacityMetres (P9)', async () => {
    await expect(repo.createRig({ workspaceId: 'ws1', tenantId: 'tn1', rigName: 'Rig-Beta', rigCapacityMetres: 200.5 })).rejects.toThrow('P9');
  });

  it('T016 — updates rig status to deployed', async () => {
    const rig = await repo.createRig({ workspaceId: 'ws1', tenantId: 'tn1', rigName: 'Rig-Gamma', rigCapacityMetres: 250 });
    const updated = await repo.updateRigStatus(rig.id, 'tn1', 'deployed', 'proj-001');
    expect(updated!.status).toBe('deployed');
  });
});
