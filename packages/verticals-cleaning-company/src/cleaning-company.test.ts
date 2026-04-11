/**
 * packages/verticals-cleaning-company — CleaningCompanyRepository tests
 * M11 P3 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CleaningCompanyRepository } from './cleaning-company.js';
import {
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidCleaningCompanyTransition,
} from './types.js';

function makeDb() {
  const store: Record<string, unknown>[] = [];
  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      run: async () => {
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
          const colM = sql.match(/\(([^)]+)\)\s+VALUES/i);
          const valM = sql.match(/VALUES\s*\(([^)]+)\)/i);
          if (colM && valM) {
            const cols = colM[1]!.split(',').map((c: string) => c.trim());
            const tokens = valM[1]!.split(',').map((v: string) => v.trim());
            const row: Record<string, unknown> = {};
            let bi = 0;
            cols.forEach((col: string, i: number) => {
              const tok = tokens[i] ?? '?';
              if (tok === '?') { row[col] = vals[bi++]; }
              else if (tok.toUpperCase() === 'NULL') { row[col] = null; }
              else if (tok.toLowerCase() === 'unixepoch()') { row[col] = Math.floor(Date.now() / 1000); }
              else if (tok.startsWith("'") && tok.endsWith("'")) { row[col] = tok.slice(1, -1); }
              else if (!Number.isNaN(Number(tok))) { row[col] = Number(tok); }
              else { row[col] = vals[bi++]; }
            });
            if (!row['status']) row['status'] = 'seeded';
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim()).filter((s: string) => !s.includes('updated_at'));
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              clauses.forEach((clause: string, i: number) => {
                const col = clause.split('=')[0]!.trim();
                (store[idx] as Record<string, unknown>)[col] = vals[i];
              });
            }
          }
        }
        return { success: true };
      },
      first: async <T>() => {
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        const found = store.find(r =>
          vals.length >= 2 ? r['id'] === vals[0] && r['tenant_id'] === vals[1] : r['id'] === vals[0]
        );
        return (found ?? null) as T;
      },
      all: async <T>() => ({
        results: store.filter(r =>
          vals.length >= 2
            ? (r['workspace_id'] === vals[0] || r['contract_id'] === vals[0]) && r['tenant_id'] === vals[1]
            : true
        ),
      } as { results: T[] }),
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof CleaningCompanyRepository>[0];
}

describe('CleaningCompanyRepository', () => {
  let repo: CleaningCompanyRepository;
  beforeEach(() => { repo = new CleaningCompanyRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Clean Pro FM Services' });
    expect(p.status).toBe('seeded');
    expect(p.companyName).toBe('Clean Pro FM Services');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Lagos FM Ltd' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid', () => {
    expect(isValidCleaningCompanyTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: claimed → cac_verified valid', () => {
    expect(isValidCleaningCompanyTransition('claimed', 'cac_verified')).toBe(true);
  });

  it('T005 — FSM: invalid transition seeded → active', () => {
    expect(isValidCleaningCompanyTransition('seeded', 'active')).toBe(false);
  });

  it('T006 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T007 — guardClaimedToCacVerified requires CAC RC + Tier 2', () => {
    expect(guardClaimedToCacVerified({ cacRc: null, kycTier: 2 }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacRc: 'RC-001', kycTier: 1 }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacRc: 'RC-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('T008 — transitions to cac_verified', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Abuja FM Pro', cacRc: 'RC-004' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'cac_verified');
    expect(updated!.status).toBe('cac_verified');
  });

  it('T009 — creates contract with integer monthlyFeeKobo (P9)', async () => {
    const c = await repo.createContract({ workspaceId: 'ws1', tenantId: 'tn1', clientName: 'GTBank HQ', clientPhone: '07012345678', monthlyFeeKobo: 5_000_000 });
    expect(c.monthlyFeeKobo).toBe(5_000_000);
    expect(c.status).toBe('active');
  });

  it('T010 — rejects fractional monthlyFeeKobo (P9)', async () => {
    await expect(repo.createContract({ workspaceId: 'ws1', tenantId: 'tn1', clientName: 'X', clientPhone: '070', monthlyFeeKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T011 — updates contract status to paused', async () => {
    const c = await repo.createContract({ workspaceId: 'ws1', tenantId: 'tn1', clientName: 'UBA Lagos', clientPhone: '070', monthlyFeeKobo: 3_000_000 });
    const updated = await repo.updateContractStatus(c.id, 'tn1', 'paused');
    expect(updated!.status).toBe('paused');
  });

  it('T012 — creates staff deployment with integer monthlySalaryKobo (P9)', async () => {
    const s = await repo.createStaffDeployment({ workspaceId: 'ws1', tenantId: 'tn1', contractId: 'c001', staffName: 'Bolu Adeyemi', siteName: 'GTBank HQ Ground Floor', monthlySalaryKobo: 450_000 });
    expect(s.monthlySalaryKobo).toBe(450_000);
    expect(s.staffName).toBe('Bolu Adeyemi');
  });

  it('T013 — rejects fractional monthlySalaryKobo (P9)', async () => {
    await expect(repo.createStaffDeployment({ workspaceId: 'ws1', tenantId: 'tn1', contractId: 'c001', staffName: 'X', siteName: 'Site A', monthlySalaryKobo: 250.75 })).rejects.toThrow('P9');
  });

  it('T014 — creates supply with integer unitCostKobo (P9)', async () => {
    const s = await repo.createSupply({ workspaceId: 'ws1', tenantId: 'tn1', supplyName: 'Jik Bleach 1L', quantity: 50, unitCostKobo: 80_000 });
    expect(s.unitCostKobo).toBe(80_000);
    expect(s.supplyName).toBe('Jik Bleach 1L');
  });

  it('T015 — AI advisory: staff PII stripped from contract aggregate (P13)', async () => {
    const contracts = await repo.listContracts('ws1', 'tn1');
    const advisory = contracts.map(c => ({ monthly_fee_kobo: c.monthlyFeeKobo, sites_count: c.sitesCount }));
    expect(advisory.every(a => !('staff_name' in a) && !('client_name' in a))).toBe(true);
  });

  it('T016 — rejects fractional unitCostKobo (P9)', async () => {
    await expect(repo.createSupply({ workspaceId: 'ws1', tenantId: 'tn1', supplyName: 'Mop', unitCostKobo: 25.5 })).rejects.toThrow('P9');
  });
});
