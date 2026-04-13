/**
 * @webwaka/verticals-it-support — test suite (M10)
 * Covers: FSM, SLA breach guard, L2 AI cap, T3 isolation
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ItSupportRepository as ITSupportRepository } from './it-support.js';
import {
  isValidITSupportTransition,
  guardSlaBreachCheck,
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

describe('verticals-it-support', () => {
  let repo: ITSupportRepository;
  beforeEach(() => { repo = new ITSupportRepository(makeDb() as never); });

  it('FSM: seeded → claimed is valid', () => { expect(isValidITSupportTransition('seeded', 'claimed')).toBe(true); });
  it('FSM: claimed → cac_verified is valid', () => { expect(isValidITSupportTransition('claimed', 'cac_verified')).toBe(true); });
  it('FSM: cac_verified → active is valid', () => { expect(isValidITSupportTransition('cac_verified', 'active')).toBe(true); });
  it('FSM: active → suspended is valid', () => { expect(isValidITSupportTransition('active', 'suspended')).toBe(true); });
  it('FSM: suspended → active is valid', () => { expect(isValidITSupportTransition('suspended', 'active')).toBe(true); });
  it('FSM: seeded → active is invalid', () => { expect(isValidITSupportTransition('seeded', 'active')).toBe(false); });
  it('FSM: active → claimed is invalid', () => { expect(isValidITSupportTransition('active', 'claimed')).toBe(false); });

  it('guardSlaBreachCheck detects breach when ticket is overdue', () => {
    const openedDate = 1700000000;
    const closedDate = openedDate + 50 * 3600;
    expect(guardSlaBreachCheck({ openedDate, closedDate, slaHours: 24 })).toBe(true);
  });
  it('guardSlaBreachCheck returns false when ticket closed within SLA', () => {
    const openedDate = 1700000000;
    const closedDate = openedDate + 12 * 3600;
    expect(guardSlaBreachCheck({ openedDate, closedDate, slaHours: 24 })).toBe(false);
  });
  it('guardSlaBreachCheck returns false when ticket not yet closed', () => {
    expect(guardSlaBreachCheck({ openedDate: 1700000000, closedDate: null, slaHours: 24 })).toBe(false);
  });
  it('guardL2AiCap blocks level 3 (ADL-010)', () => { expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false); });
  it('guardL2AiCap passes level 2', () => { expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true); });

  it('createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'TechFix Lagos' });
    expect(p.status).toBe('seeded');
    expect(p.tenantId).toBe('tn1');
  });
  it('findProfileById T3 isolation', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'NetPro Solutions' });
    expect(await repo.findProfileById(p.id, 'tn-wrong')).toBeNull();
  });
  it('findProfileById returns profile for correct tenant', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-it', businessName: 'DigiSupport NG' });
    const found = await repo.findProfileById(p.id, 'tn-it');
    expect(found).not.toBeNull();
    expect(found?.tenantId).toBe('tn-it');
  });
  it('transitionStatus changes FSM state', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'CompuCare Abuja' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});
