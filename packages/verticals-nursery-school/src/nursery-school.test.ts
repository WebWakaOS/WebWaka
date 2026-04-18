/**
 * @webwaka/verticals-nursery-school — test suite (M10)
 * Covers: FSM, child-data AI guard (P13), T3 isolation
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { NurserySchoolRepository } from './nursery-school.js';
import {
  isValidNurserySchoolTransition,
  guardNoChildDataToAi,
  guardAiAggregateBracketsOnly,
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

describe('verticals-nursery-school', () => {
  let repo: NurserySchoolRepository;
  beforeEach(() => { repo = new NurserySchoolRepository(makeDb() as never); });

  it('FSM: seeded → claimed is valid', () => { expect(isValidNurserySchoolTransition('seeded', 'claimed')).toBe(true); });
  it('FSM: claimed → subeb_registered is valid', () => { expect(isValidNurserySchoolTransition('claimed', 'subeb_registered')).toBe(true); });
  it('FSM: subeb_registered → active is valid', () => { expect(isValidNurserySchoolTransition('subeb_registered', 'active')).toBe(true); });
  it('FSM: active → suspended is valid', () => { expect(isValidNurserySchoolTransition('active', 'suspended')).toBe(true); });
  it('FSM: suspended → active is valid', () => { expect(isValidNurserySchoolTransition('suspended', 'active')).toBe(true); });
  it('FSM: seeded → active is invalid', () => { expect(isValidNurserySchoolTransition('seeded', 'active')).toBe(false); });
  it('FSM: subeb_registered → seeded is invalid', () => { expect(isValidNurserySchoolTransition('subeb_registered', 'seeded')).toBe(false); });

  it('guardNoChildDataToAi blocks child data (P13)', () => {
    expect(guardNoChildDataToAi({ includesChildData: true }).allowed).toBe(false);
    expect(guardNoChildDataToAi({ includesChildData: false }).allowed).toBe(true);
  });
  it('guardNoChildDataToAi allows when no flag', () => { expect(guardNoChildDataToAi({}).allowed).toBe(true); });
  it('guardAiAggregateBracketsOnly blocks individual child ref', () => {
    expect(guardAiAggregateBracketsOnly({ includesChildRef: true }).allowed).toBe(false);
    expect(guardAiAggregateBracketsOnly({ includesChildRef: false }).allowed).toBe(true);
  });
  it('guardAiAggregateBracketsOnly blocks individual data', () => {
    expect(guardAiAggregateBracketsOnly({ includesIndividualData: true }).allowed).toBe(false);
  });
  it('guardAiAggregateBracketsOnly allows aggregates only', () => {
    expect(guardAiAggregateBracketsOnly({}).allowed).toBe(true);
  });

  it('createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', schoolName: 'Sunshine Nursery Lagos' });
    expect(p.status).toBe('seeded');
    expect(p.tenantId).toBe('tn1');
  });
  it('findProfileById T3 isolation', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', schoolName: 'Little Stars' });
    expect(await repo.findProfileById(p.id, 'tn-wrong')).toBeNull();
  });
  it('findProfileById returns profile for correct tenant', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-nurs', schoolName: 'Bright Minds' });
    const found = await repo.findProfileById(p.id, 'tn-nurs');
    expect(found).not.toBeNull();
    expect(found?.tenantId).toBe('tn-nurs');
  });
  it('transitionStatus changes FSM state', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', schoolName: 'Hopeful Kids' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});
