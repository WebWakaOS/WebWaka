/**
 * @webwaka/verticals-laundry-service — test suite (M10)
 * Covers: FSM, P9 guards, T3 isolation, machine sessions
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { LaundryServiceRepository } from './laundry-service.js';
import { isValidLaundryServiceTransition, guardL2AiCap } from './types.js';

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

describe('verticals-laundry-service', () => {
  let repo: LaundryServiceRepository;
  beforeEach(() => { repo = new LaundryServiceRepository(makeDb() as never); });

  it('FSM: seeded → claimed is valid', () => { expect(isValidLaundryServiceTransition('seeded', 'claimed')).toBe(true); });
  it('FSM: claimed → cac_verified is valid', () => { expect(isValidLaundryServiceTransition('claimed', 'cac_verified')).toBe(true); });
  it('FSM: cac_verified → active is valid', () => { expect(isValidLaundryServiceTransition('cac_verified', 'active')).toBe(true); });
  it('FSM: active → suspended is valid', () => { expect(isValidLaundryServiceTransition('active', 'suspended')).toBe(true); });
  it('FSM: suspended → active is valid', () => { expect(isValidLaundryServiceTransition('suspended', 'active')).toBe(true); });
  it('FSM: seeded → active is invalid', () => { expect(isValidLaundryServiceTransition('seeded', 'active')).toBe(false); });
  it('FSM: active → claimed is invalid', () => { expect(isValidLaundryServiceTransition('active', 'claimed')).toBe(false); });

  it('guardL2AiCap blocks level 3 (ADL-010)', () => { expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false); });
  it('guardL2AiCap passes level 2', () => { expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true); });
  it('guardL2AiCap passes undefined autonomyLevel', () => { expect(guardL2AiCap({}).allowed).toBe(true); });

  it('createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'SpinCycle Hub' });
    expect(p.status).toBe('seeded');
    expect(p.businessName).toBe('SpinCycle Hub');
  });

  it('findProfileById T3 isolation', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'WashPlus' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('createProfile stores workspaceId', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws-ls', tenantId: 'tn1', businessName: 'CleanSpin' });
    expect(p.workspaceId).toBe('ws-ls');
  });

  it('transitionStatus changes FSM state', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'SelfWash Lagos' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });

  it('addRoute stores pickup route for profile', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'WashMatic' });
    const r = await repo.addRoute(p.id, 'tn1', { routeName: 'Ikeja Zone', coverageAreas: 'Ikeja, Agege, Maryland' });
    expect(r['routeName']).toBe('Ikeja Zone');
    expect(r['tenantId']).toBe('tn1');
  });
});
