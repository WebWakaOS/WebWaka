/**
 * @webwaka/verticals-handyman — test suite (M10)
 * Covers: FSM, P9 kobo guards, T3 isolation, job management
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { HandymanRepository } from './handyman.js';
import { isValidHandymanTransition, guardL2AiCap } from './types.js';

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

describe('verticals-handyman', () => {
  let repo: HandymanRepository;
  beforeEach(() => { repo = new HandymanRepository(makeDb() as never); });

  it('FSM: seeded → claimed is valid', () => { expect(isValidHandymanTransition('seeded', 'claimed')).toBe(true); });
  it('FSM: claimed → cac_verified is valid', () => { expect(isValidHandymanTransition('claimed', 'cac_verified')).toBe(true); });
  it('FSM: cac_verified → active is valid', () => { expect(isValidHandymanTransition('cac_verified', 'active')).toBe(true); });
  it('FSM: active → suspended is valid', () => { expect(isValidHandymanTransition('active', 'suspended')).toBe(true); });
  it('FSM: suspended → active is valid', () => { expect(isValidHandymanTransition('suspended', 'active')).toBe(true); });
  it('FSM: seeded → active is invalid', () => { expect(isValidHandymanTransition('seeded', 'active')).toBe(false); });
  it('FSM: claimed → suspended is invalid jump', () => { expect(isValidHandymanTransition('claimed', 'suspended')).toBe(false); });

  it('guardL2AiCap blocks level 3', () => { expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false); });
  it('guardL2AiCap passes level 2', () => { expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true); });
  it('guardL2AiCap passes undefined', () => { expect(guardL2AiCap({}).allowed).toBe(true); });

  it('createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Kola Fix-It' });
    expect(p.status).toBe('seeded');
    expect(p.businessName).toBe('Kola Fix-It');
  });

  it('findProfileById T3 isolation', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'TechHands' });
    expect(await repo.findProfileById(p.id, 'tn-wrong')).toBeNull();
  });

  it('createProfile stores tenantId', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-hm', businessName: 'AllFix Services' });
    expect(p.tenantId).toBe('tn-hm');
  });

  it('transitionStatus changes status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Handyman Plus' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });

  it('createJob rejects non-integer totalKobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'FastFix' });
    await expect(
      repo.createJob(p.id, 'tn1', { clientRefId: 'CL-01', jobType: 'plumbing', description: 'Fix leak', materialCostKobo: 2000, labourCostKobo: 3000, totalKobo: 5000.5, jobDate: 1700000000 }),
    ).rejects.toThrow(/P9|integer/i);
  });
});
