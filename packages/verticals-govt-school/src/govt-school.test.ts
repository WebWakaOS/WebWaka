/**
 * @webwaka/verticals-govt-school — test suite (M10)
 * Covers: FSM, SUBEB guard, AI student-data guard (P13), T3 isolation
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { GovtSchoolRepository } from './govt-school.js';
import {
  isValidGovtSchoolTransition,
  guardClaimedToSubebVerified,
  guardNoStudentDataToAi,
  guardL2AiCap,
} from './types.js';

function makeDb() {
  const store = new Map<string, Record<string, unknown>>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        // eslint-disable-next-line @typescript-eslint/require-await
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
        // eslint-disable-next-line @typescript-eslint/require-await
        first: async <T>() => {
          const tM = sql.match(/FROM\s+(\w+)/i); if (!tM) return null as T;
          const table = tM[1]!; const id = vals[0] as string; const tenantId = vals[1] as string | undefined; const key = `${table}:${id}`; const row = store.get(key);
          if (!row) return null as T; if (tenantId !== undefined && row['tenant_id'] !== tenantId) return null as T; return row as T;
        },
        // eslint-disable-next-line @typescript-eslint/require-await
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  };
}

describe('verticals-govt-school', () => {
  let repo: GovtSchoolRepository;
  beforeEach(() => { repo = new GovtSchoolRepository(makeDb() as never); });

  it('FSM: seeded → claimed is valid', () => { expect(isValidGovtSchoolTransition('seeded', 'claimed')).toBe(true); });
  it('FSM: claimed → subeb_verified is valid', () => { expect(isValidGovtSchoolTransition('claimed', 'subeb_verified')).toBe(true); });
  it('FSM: subeb_verified → active is valid', () => { expect(isValidGovtSchoolTransition('subeb_verified', 'active')).toBe(true); });
  it('FSM: active → suspended is valid', () => { expect(isValidGovtSchoolTransition('active', 'suspended')).toBe(true); });
  it('FSM: suspended → active is valid', () => { expect(isValidGovtSchoolTransition('suspended', 'active')).toBe(true); });
  it('FSM: seeded → active is invalid', () => { expect(isValidGovtSchoolTransition('seeded', 'active')).toBe(false); });
  it('FSM: subeb_verified → seeded is invalid', () => { expect(isValidGovtSchoolTransition('subeb_verified', 'seeded')).toBe(false); });

  it('guardClaimedToSubebVerified requires SUBEB ref', () => {
    expect(guardClaimedToSubebVerified({ subebRef: null }).allowed).toBe(false);
    expect(guardClaimedToSubebVerified({ subebRef: 'SUBEB-NG-001' }).allowed).toBe(true);
  });
  it('guardNoStudentDataToAi blocks student refs (P13)', () => {
    expect(guardNoStudentDataToAi({ includesStudentRef: true }).allowed).toBe(false);
    expect(guardNoStudentDataToAi({ includesStudentRef: false }).allowed).toBe(true);
  });
  it('guardNoStudentDataToAi allows when no flag', () => { expect(guardNoStudentDataToAi({}).allowed).toBe(true); });
  it('guardL2AiCap blocks level 3 (ADL-010)', () => { expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false); });
  it('guardL2AiCap passes level 2', () => { expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true); });

  it('createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', schoolName: 'FCT Government Primary School' });
    expect(p.status).toBe('seeded');
    expect(p.tenantId).toBe('tn1');
  });
  it('findProfileById T3 isolation', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', schoolName: 'Kaduna Govt Secondary' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });
  it('findProfileById returns profile for correct tenant', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-school', schoolName: 'Enugu Model Primary' });
    const found = await repo.findProfileById(p.id, 'tn-school');
    expect(found).not.toBeNull();
    expect(found?.tenantId).toBe('tn-school');
  });
  it('transitionStatus changes FSM state', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', schoolName: 'Lagos Govt Primary' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});
