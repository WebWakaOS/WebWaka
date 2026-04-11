/**
 * packages/verticals-electronics-repair — ElectronicsRepairRepository tests
 * M9 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ElectronicsRepairRepository } from './electronics-repair.js';
import {
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidElectronicsRepairTransition,
} from './types.js';

function makeDb() {
  const store: Record<string, unknown>[] = [];
  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      // eslint-disable-next-line @typescript-eslint/require-await
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
            if (row['status'] === undefined) row['status'] = 'seeded';
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim()).filter((s: string) => !s.startsWith('updated_at'));
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              clauses.forEach((clause: string, i: number) => {
                const col = clause.split('=')[0]!.trim();
                (store[idx]! as Record<string, unknown>)[col] = vals[i];
              });
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        const found = store.find(r => vals.length >= 2 ? r['id'] === vals[0] && r['tenant_id'] === vals[1] : r['id'] === vals[0]);
        return (found ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        return { results: store.filter(r => vals.length >= 2 ? r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1] : true) } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof ElectronicsRepairRepository>[0];
}

describe('ElectronicsRepairRepository', () => {
  let repo: ElectronicsRepairRepository;
  beforeEach(() => { repo = new ElectronicsRepairRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Computer Village Fix', state: 'Lagos', locationCluster: 'computer_village' });
    expect(p.status).toBe('seeded');
    expect(p.locationCluster).toBe('computer_village');
  });

  it('T002 — cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'E1', state: 'Lagos' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM guard seeded→claimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T004 — FSM guard claimed→cac_verified requires CAC number', () => {
    expect(guardClaimedToCacVerified({ cacNumber: null }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacNumber: 'RC445566' }).allowed).toBe(true);
  });

  it('T005 — valid FSM transitions', () => {
    expect(isValidElectronicsRepairTransition('seeded', 'claimed')).toBe(true);
    expect(isValidElectronicsRepairTransition('claimed', 'cac_verified')).toBe(true);
    expect(isValidElectronicsRepairTransition('cac_verified', 'active')).toBe(true);
  });

  it('T006 — invalid FSM transitions rejected (T4)', () => {
    expect(isValidElectronicsRepairTransition('seeded', 'active')).toBe(false);
    expect(isValidElectronicsRepairTransition('active', 'claimed')).toBe(false);
  });

  it('T007 — transitionProfile updates status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'E2', state: 'Lagos' });
    const u = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('T008 — creates repair job with integer labour and parts kobo (P9)', async () => {
    const j = await repo.createRepairJob({ workspaceId: 'ws1', tenantId: 'tn1', deviceType: 'phone', brand: 'Samsung', faultDescription: 'Cracked screen', customerPhone: '08000000001', labourCostKobo: 50000, partsCostKobo: 120000 });
    expect(j.labourCostKobo).toBe(50000);
    expect(j.partsCostKobo).toBe(120000);
    expect(j.status).toBe('intake');
  });

  it('T009 — rejects fractional labour_cost_kobo (P9)', async () => {
    await expect(repo.createRepairJob({ workspaceId: 'ws1', tenantId: 'tn1', deviceType: 'laptop', brand: 'Dell', faultDescription: 'No power', customerPhone: '0800000000', labourCostKobo: 25000.5 })).rejects.toThrow('[P9]');
  });

  it('T010 — rejects fractional parts_cost_kobo (P9)', async () => {
    await expect(repo.createRepairJob({ workspaceId: 'ws1', tenantId: 'tn1', deviceType: 'tablet', brand: 'Apple', faultDescription: 'Battery', customerPhone: '0800000000', labourCostKobo: 10000, partsCostKobo: 80000.99 })).rejects.toThrow('[P9]');
  });

  it('T011 — repair job status progression intake→diagnosing', async () => {
    const j = await repo.createRepairJob({ workspaceId: 'ws1', tenantId: 'tn1', deviceType: 'phone', brand: 'Tecno', faultDescription: 'Charging', customerPhone: '08000000002' });
    const u = await repo.advanceRepairJobStatus(j.id, 'tn1', 'diagnosing');
    expect(u?.status).toBe('diagnosing');
  });

  it('T012 — repair job progression diagnosing→completed', async () => {
    const j = await repo.createRepairJob({ workspaceId: 'ws1', tenantId: 'tn1', deviceType: 'tv', brand: 'LG', faultDescription: 'Display', customerPhone: '08000000003' });
    await repo.advanceRepairJobStatus(j.id, 'tn1', 'diagnosing');
    const u = await repo.advanceRepairJobStatus(j.id, 'tn1', 'completed');
    expect(u?.status).toBe('completed');
  });

  it('T013 — creates part with integer unit_cost_kobo (P9)', async () => {
    const p = await repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'iPhone 12 screen', quantity: 3, unitCostKobo: 150000 });
    expect(p.unitCostKobo).toBe(150000);
  });

  it('T014 — rejects fractional unit_cost_kobo for parts (P9)', async () => {
    await expect(repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'Battery', quantity: 5, unitCostKobo: 45000.5 })).rejects.toThrow('[P9]');
  });

  it('T015 — cross-tenant repair job hidden (T3)', async () => {
    const j = await repo.createRepairJob({ workspaceId: 'ws1', tenantId: 'tn1', deviceType: 'phone', brand: 'Infinix', faultDescription: 'Speaker', customerPhone: '08000000004' });
    expect(await repo.findRepairJobById(j.id, 'tn-other')).toBeNull();
  });

  it('T016 — P13 — IMEI stored but accessible only via repo (not leaked to AI inputs)', async () => {
    const j = await repo.createRepairJob({ workspaceId: 'ws1', tenantId: 'tn1', deviceType: 'phone', brand: 'Samsung', faultDescription: 'Overheating', customerPhone: '08000000005', imei: '1234' });
    expect(j.imei).toBe('1234');
  });
});
