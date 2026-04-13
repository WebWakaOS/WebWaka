/**
 * @webwaka/verticals-land-surveyor — test suite (M10)
 * Covers: FSM, SURCON guard, land identity AI guard (P13), T3 isolation
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { LandSurveyorRepository } from './land-surveyor.js';
import {
  isValidLandSurveyorTransition,
  guardClaimedToSurconVerified,
  guardNoLandIdentityToAi,
  guardL2AiCap,
} from './types.js';

function makeDb() {
  const store = new Map<string, Record<string, unknown>>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          const upper = sql.trim().toUpperCase();
          if (upper.startsWith('INSERT')) {
            const tM = sql.match(/INTO\s+(\w+)/i); const cM = sql.match(/\(([^)]+)\)\s+VALUES/i); const vM = sql.match(/VALUES\s*\(([^)]+)\)/i);
            if (tM && cM && vM) {
              const table = tM[1]!; const cols = cM[1]!.split(',').map((c: string) => c.trim()); const tokens = vM[1]!.split(',').map((v: string) => v.trim());
              const row: Record<string, unknown> = { _table: table }; let bi = 0;
              cols.forEach((col: string, i: number) => { const tok = tokens[i] ?? '?'; if (tok === '?') row[col] = vals[bi++]; else if (tok.toLowerCase() === 'unixepoch()') row[col] = 1000; else if (tok.startsWith("'") && tok.endsWith("'")) row[col] = tok.slice(1, -1); else row[col] = vals[bi++]; });
              store.set(`${table}:${String(row['id'])}`, row);
            }
          } else if (upper.startsWith('UPDATE')) {
            const tM = sql.match(/UPDATE\s+(\w+)/i); if (tM) { const table = tM[1]!; const id = vals[vals.length - 2] as string; const tid = vals[vals.length - 1] as string; const key = `${table}:${id}`; const row = store.get(key); if (row && row['tenant_id'] === tid) { row['status'] = vals[0]; store.set(key, row); } }
          }
          return { success: true };
        },
        first: async <T>() => {
          const tM = sql.match(/FROM\s+(\w+)/i); if (!tM) return null as T;
          const table = tM[1]!; const id = vals[0] as string; const tenantId = vals[1] as string | undefined; const key = `${table}:${id}`; const row = store.get(key);
          if (!row) return null as T; if (tenantId !== undefined && row['tenant_id'] !== tenantId) return null as T; return row as T;
        },
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  };
}

describe('verticals-land-surveyor', () => {
  let repo: LandSurveyorRepository;
  beforeEach(() => { repo = new LandSurveyorRepository(makeDb() as never); });

  it('FSM: seeded → claimed is valid', () => { expect(isValidLandSurveyorTransition('seeded', 'claimed')).toBe(true); });
  it('FSM: claimed → surcon_verified is valid', () => { expect(isValidLandSurveyorTransition('claimed', 'surcon_verified')).toBe(true); });
  it('FSM: surcon_verified → active is valid', () => { expect(isValidLandSurveyorTransition('surcon_verified', 'active')).toBe(true); });
  it('FSM: active → suspended is valid', () => { expect(isValidLandSurveyorTransition('active', 'suspended')).toBe(true); });
  it('FSM: suspended → active is valid', () => { expect(isValidLandSurveyorTransition('suspended', 'active')).toBe(true); });
  it('FSM: seeded → active is invalid', () => { expect(isValidLandSurveyorTransition('seeded', 'active')).toBe(false); });
  it('FSM: surcon_verified → seeded is invalid', () => { expect(isValidLandSurveyorTransition('surcon_verified', 'seeded')).toBe(false); });

  it('guardClaimedToSurconVerified requires SURCON licence', () => {
    expect(guardClaimedToSurconVerified({ surconLicence: null }).allowed).toBe(false);
    expect(guardClaimedToSurconVerified({ surconLicence: 'SURCON-2024-001' }).allowed).toBe(true);
  });
  it('guardNoLandIdentityToAi blocks title ref (P13)', () => {
    expect(guardNoLandIdentityToAi({ includesTitleRef: true }).allowed).toBe(false);
    expect(guardNoLandIdentityToAi({ includesTitleRef: false }).allowed).toBe(true);
  });
  it('guardNoLandIdentityToAi blocks client ref (P13)', () => {
    expect(guardNoLandIdentityToAi({ includesClientRef: true }).allowed).toBe(false);
  });
  it('guardNoLandIdentityToAi allows when no flags', () => { expect(guardNoLandIdentityToAi({}).allowed).toBe(true); });
  it('guardL2AiCap blocks level 3 (ADL-010)', () => { expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false); });
  it('guardL2AiCap passes level 2', () => { expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true); });

  it('createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Lagos Survey Associates' });
    expect(p.status).toBe('seeded');
    expect(p.tenantId).toBe('tn1');
  });
  it('findProfileById T3 isolation', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Abuja Land Surveyors' });
    expect(await repo.findProfileById(p.id, 'tn-wrong')).toBeNull();
  });
  it('findProfileById returns profile for correct tenant', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-ls', businessName: 'Kano Survey Ltd' });
    const found = await repo.findProfileById(p.id, 'tn-ls');
    expect(found).not.toBeNull();
    expect(found?.tenantId).toBe('tn-ls');
  });
  it('transitionStatus changes FSM state', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Enugu Geospatial' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});
