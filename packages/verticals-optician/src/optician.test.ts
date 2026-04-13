/**
 * @webwaka/verticals-optician — test suite (M10)
 * Covers: FSM (OSPHON-specific), prescription AI guard (P13), T3 isolation, vision tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { OpticianRepository } from './optician.js';
import {
  isValidOpticianTransition,
  guardClaimedToOsphonVerified,
  guardNoPrescriptionDataToAi,
  guardL3HitlClinical,
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

describe('verticals-optician', () => {
  let repo: OpticianRepository;
  beforeEach(() => { repo = new OpticianRepository(makeDb() as never); });

  it('FSM: seeded → claimed is valid', () => { expect(isValidOpticianTransition('seeded', 'claimed')).toBe(true); });
  it('FSM: claimed → osphon_verified is valid', () => { expect(isValidOpticianTransition('claimed', 'osphon_verified')).toBe(true); });
  it('FSM: osphon_verified → active is valid', () => { expect(isValidOpticianTransition('osphon_verified', 'active')).toBe(true); });
  it('FSM: active → suspended is valid', () => { expect(isValidOpticianTransition('active', 'suspended')).toBe(true); });
  it('FSM: suspended → active is valid', () => { expect(isValidOpticianTransition('suspended', 'active')).toBe(true); });
  it('FSM: seeded → active is invalid', () => { expect(isValidOpticianTransition('seeded', 'active')).toBe(false); });
  it('FSM: claimed → active is invalid (must go via osphon_verified)', () => { expect(isValidOpticianTransition('claimed', 'active')).toBe(false); });

  it('guardClaimedToOsphonVerified requires OSPHON registration', () => {
    expect(guardClaimedToOsphonVerified({ osphonReg: null }).allowed).toBe(false);
    expect(guardClaimedToOsphonVerified({ osphonReg: 'OSPHON-2024-001' }).allowed).toBe(true);
  });

  it('guardNoPrescriptionDataToAi blocks prescription data (P13)', () => {
    expect(guardNoPrescriptionDataToAi({ includesPrescriptionData: true }).allowed).toBe(false);
    expect(guardNoPrescriptionDataToAi({ includesPrescriptionData: false }).allowed).toBe(true);
  });

  it('guardL3HitlClinical blocks clinical output without HITL', () => {
    expect(guardL3HitlClinical({ isClinicalOutput: true }).allowed).toBe(false);
    expect(guardL3HitlClinical({ isClinicalOutput: false }).allowed).toBe(true);
  });

  it('guardL3HitlClinical allows non-clinical outputs', () => { expect(guardL3HitlClinical({}).allowed).toBe(true); });
  it('guardNoPrescriptionDataToAi allows when no flag set', () => { expect(guardNoPrescriptionDataToAi({}).allowed).toBe(true); });

  it('createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'VisionCare Lagos' });
    expect(p.status).toBe('seeded');
    expect(p.tenantId).toBe('tn1');
  });

  it('findProfileById T3 isolation', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'EyePerfect' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('findProfileById returns profile for correct tenant', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-opt', businessName: 'ClearVision' });
    const found = await repo.findProfileById(p.id, 'tn-opt');
    expect(found).not.toBeNull();
    expect(found?.tenantId).toBe('tn-opt');
  });

  it('transitionStatus changes FSM state', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'OptiWorld' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});
