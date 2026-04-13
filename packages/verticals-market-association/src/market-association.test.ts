/**
 * @webwaka/verticals-market-association — test suite (M10)
 * Covers: FSM, L1 AI cap, member-ref guard, T3 isolation
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { MarketAssociationRepository } from './market-association.js';
import {
  isValidMarketAssociationTransition,
  guardL1AiCap,
  guardNoMemberRefToAi,
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

describe('verticals-market-association', () => {
  let repo: MarketAssociationRepository;
  beforeEach(() => { repo = new MarketAssociationRepository(makeDb() as never); });

  it('FSM: seeded → claimed is valid', () => { expect(isValidMarketAssociationTransition('seeded', 'claimed')).toBe(true); });
  it('FSM: claimed → cac_registered is valid', () => { expect(isValidMarketAssociationTransition('claimed', 'cac_registered')).toBe(true); });
  it('FSM: cac_registered → active is valid', () => { expect(isValidMarketAssociationTransition('cac_registered', 'active')).toBe(true); });
  it('FSM: active → suspended is valid', () => { expect(isValidMarketAssociationTransition('active', 'suspended')).toBe(true); });
  it('FSM: suspended → active is valid', () => { expect(isValidMarketAssociationTransition('suspended', 'active')).toBe(true); });
  it('FSM: seeded → active is invalid', () => { expect(isValidMarketAssociationTransition('seeded', 'active')).toBe(false); });
  it('FSM: active → claimed is invalid', () => { expect(isValidMarketAssociationTransition('active', 'claimed')).toBe(false); });

  it('guardL1AiCap blocks level 2+ (ADL-010 L1 variant)', () => {
    expect(guardL1AiCap({ autonomyLevel: 2 }).allowed).toBe(false);
    expect(guardL1AiCap({ autonomyLevel: 1 }).allowed).toBe(true);
  });
  it('guardL1AiCap passes when no autonomyLevel', () => { expect(guardL1AiCap({}).allowed).toBe(true); });
  it('guardNoMemberRefToAi blocks member refs (P13)', () => {
    expect(guardNoMemberRefToAi({ includesMemberRef: true }).allowed).toBe(false);
    expect(guardNoMemberRefToAi({ includesMemberRef: false }).allowed).toBe(true);
  });
  it('guardNoMemberRefToAi allows when no flag', () => { expect(guardNoMemberRefToAi({}).allowed).toBe(true); });
  it('guardL1AiCap blocks level 3', () => { expect(guardL1AiCap({ autonomyLevel: 3 }).allowed).toBe(false); });

  it('createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', associationName: 'Alaba Int\'l Market Assoc' });
    expect(p.status).toBe('seeded');
    expect(p.tenantId).toBe('tn1');
  });
  it('findProfileById T3 isolation', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', associationName: 'Onitsha Main Market' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });
  it('findProfileById returns profile for correct tenant', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-mkt', associationName: 'Kano Traders Assoc' });
    const found = await repo.findProfileById(p.id, 'tn-mkt');
    expect(found).not.toBeNull();
    expect(found?.tenantId).toBe('tn-mkt');
  });
  it('transitionStatus changes FSM state', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', associationName: 'Aba Trading Center' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});
