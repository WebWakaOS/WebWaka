/**
 * @webwaka/verticals-oil-gas-services — test suite (M10)
 * Covers: FSM (NCDMB/DPR multi-step), guards, P9, T3 isolation
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { OilGasServicesRepository } from './oil-gas-services.js';
import {
  isValidOilGasServicesTransition,
  guardClaimedToNcdmbCertified,
  guardNcdmbToDprRegistered,
  guardNoRealColumns,
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

describe('verticals-oil-gas-services', () => {
  let repo: OilGasServicesRepository;
  beforeEach(() => { repo = new OilGasServicesRepository(makeDb() as never); });

  it('FSM: seeded → claimed is valid', () => { expect(isValidOilGasServicesTransition('seeded', 'claimed')).toBe(true); });
  it('FSM: claimed → ncdmb_certified is valid', () => { expect(isValidOilGasServicesTransition('claimed', 'ncdmb_certified')).toBe(true); });
  it('FSM: ncdmb_certified → dpr_registered is valid', () => { expect(isValidOilGasServicesTransition('ncdmb_certified', 'dpr_registered')).toBe(true); });
  it('FSM: dpr_registered → active is valid', () => { expect(isValidOilGasServicesTransition('dpr_registered', 'active')).toBe(true); });
  it('FSM: active → suspended is valid', () => { expect(isValidOilGasServicesTransition('active', 'suspended')).toBe(true); });
  it('FSM: suspended → active is valid', () => { expect(isValidOilGasServicesTransition('suspended', 'active')).toBe(true); });
  it('FSM: seeded → active is invalid', () => { expect(isValidOilGasServicesTransition('seeded', 'active')).toBe(false); });
  it('FSM: ncdmb_certified → seeded is invalid', () => { expect(isValidOilGasServicesTransition('ncdmb_certified', 'seeded')).toBe(false); });

  it('guardClaimedToNcdmbCertified requires NCDMB cert', () => {
    expect(guardClaimedToNcdmbCertified({ ncdmbCert: null }).allowed).toBe(false);
    expect(guardClaimedToNcdmbCertified({ ncdmbCert: 'NCDMB-2024-001' }).allowed).toBe(true);
  });
  it('guardNcdmbToDprRegistered requires DPR registration', () => {
    expect(guardNcdmbToDprRegistered({ dprRegistration: null }).allowed).toBe(false);
    expect(guardNcdmbToDprRegistered({ dprRegistration: 'DPR-NG-001' }).allowed).toBe(true);
  });
  it('guardNoRealColumns blocks float values (P9)', () => {
    expect(guardNoRealColumns({ usesFloatValue: true }).allowed).toBe(false);
    expect(guardNoRealColumns({ usesFloatValue: false }).allowed).toBe(true);
  });
  it('guardNoRealColumns allows when no flag', () => { expect(guardNoRealColumns({}).allowed).toBe(true); });
  it('guardL2AiCap blocks level 3 (ADL-010)', () => { expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false); });
  it('guardL2AiCap passes level 2', () => { expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true); });

  it('createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Delta Subsea Services' });
    expect(p.status).toBe('seeded');
    expect(p.tenantId).toBe('tn1');
  });
  it('findProfileById T3 isolation', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Rivers Drilling Ltd' });
    expect(await repo.findProfileById(p.id, 'tn-wrong')).toBeNull();
  });
  it('findProfileById returns profile for correct tenant', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-og', companyName: 'Bayelsa Oilfield Svcs' });
    const found = await repo.findProfileById(p.id, 'tn-og');
    expect(found).not.toBeNull();
    expect(found?.tenantId).toBe('tn-og');
  });
  it('transitionStatus changes FSM state', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Akwa Energy Partners' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});
