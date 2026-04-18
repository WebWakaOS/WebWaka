/**
 * @webwaka/verticals-orphanage — test suite (M10)
 * Covers: FSM, DSS guard, L3 HITL, child PII guard (P13), T3 isolation
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { OrphanageRepository } from './orphanage.js';
import {
  isValidOrphanageTransition,
  guardClaimedToDssLicensed,
  guardL3HitlMandatoryAll,
  guardNoChildPiiToAi,
  guardAiAggregateCountsOnly,
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

describe('verticals-orphanage', () => {
  let repo: OrphanageRepository;
  beforeEach(() => { repo = new OrphanageRepository(makeDb() as never); });

  it('FSM: seeded → claimed is valid', () => { expect(isValidOrphanageTransition('seeded', 'claimed')).toBe(true); });
  it('FSM: claimed → dss_licensed is valid', () => { expect(isValidOrphanageTransition('claimed', 'dss_licensed')).toBe(true); });
  it('FSM: dss_licensed → active is valid', () => { expect(isValidOrphanageTransition('dss_licensed', 'active')).toBe(true); });
  it('FSM: active → suspended is valid', () => { expect(isValidOrphanageTransition('active', 'suspended')).toBe(true); });
  it('FSM: suspended → active is valid', () => { expect(isValidOrphanageTransition('suspended', 'active')).toBe(true); });
  it('FSM: seeded → active is invalid', () => { expect(isValidOrphanageTransition('seeded', 'active')).toBe(false); });
  it('FSM: active → claimed is invalid', () => { expect(isValidOrphanageTransition('active', 'claimed')).toBe(false); });

  it('guardClaimedToDssLicensed requires DSS licence', () => {
    expect(guardClaimedToDssLicensed({ dssLicense: null }).allowed).toBe(false);
    expect(guardClaimedToDssLicensed({ dssLicense: 'DSS-FCT-001' }).allowed).toBe(true);
  });
  it('guardL3HitlMandatoryAll always blocks AI autonomy (L3)', () => {
    expect(guardL3HitlMandatoryAll({}).allowed).toBe(false);
  });
  it('guardNoChildPiiToAi blocks child PII (P13)', () => {
    expect(guardNoChildPiiToAi({ includesChildPii: true }).allowed).toBe(false);
    expect(guardNoChildPiiToAi({ includesChildPii: false }).allowed).toBe(true);
  });
  it('guardNoChildPiiToAi allows when no flag', () => { expect(guardNoChildPiiToAi({}).allowed).toBe(true); });
  it('guardAiAggregateCountsOnly blocks child ref', () => {
    expect(guardAiAggregateCountsOnly({ includesChildRef: true }).allowed).toBe(false);
    expect(guardAiAggregateCountsOnly({ includesChildRef: false }).allowed).toBe(true);
  });
  it('guardAiAggregateCountsOnly allows aggregate', () => { expect(guardAiAggregateCountsOnly({}).allowed).toBe(true); });

  it('createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', orgName: 'Hope Orphanage Lagos' });
    expect(p.status).toBe('seeded');
    expect(p.tenantId).toBe('tn1');
  });
  it('findProfileById T3 isolation', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', orgName: 'Grace Home Abuja' });
    expect(await repo.findProfileById(p.id, 'tn-wrong')).toBeNull();
  });
  it('findProfileById returns profile for correct tenant', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-orp', orgName: 'New Dawn Foundation' });
    const found = await repo.findProfileById(p.id, 'tn-orp');
    expect(found).not.toBeNull();
    expect(found?.tenantId).toBe('tn-orp');
  });
  it('transitionStatus changes FSM state', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', orgName: 'Mercy Homes' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});
