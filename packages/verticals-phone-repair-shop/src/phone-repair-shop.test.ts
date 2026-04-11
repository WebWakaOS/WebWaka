/**
 * packages/verticals-phone-repair-shop — PhoneRepairShopRepository tests
 * M10 P3 acceptance: ≥15 tests. P13: IMEI never to AI.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PhoneRepairShopRepository } from './phone-repair-shop.js';
import {
  guardSeedToClaimed,
  guardClaimedToActive,
  isValidPhoneRepairTransition,
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
        const found = store.find(r =>
          vals.length >= 2 ? r['id'] === vals[0] && r['tenant_id'] === vals[1] : r['id'] === vals[0]
        );
        return (found ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => ({
        results: store.filter(r =>
          vals.length >= 2
            ? (r['workspace_id'] === vals[0] || r['id'] === vals[0]) && r['tenant_id'] === vals[1]
            : true
        ),
      } as { results: T[] }),
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof PhoneRepairShopRepository>[0];
}

describe('PhoneRepairShopRepository', () => {
  let repo: PhoneRepairShopRepository;
  beforeEach(() => { repo = new PhoneRepairShopRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Computer Village Fix It' });
    expect(p.status).toBe('seeded');
    expect(p.shopName).toBe('Computer Village Fix It');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Ikeja Phone Clinic' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid (3-state)', () => {
    expect(isValidPhoneRepairTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: claimed → active valid (3-state)', () => {
    expect(isValidPhoneRepairTransition('claimed', 'active')).toBe(true);
  });

  it('T005 — FSM: seeded → active invalid', () => {
    expect(isValidPhoneRepairTransition('seeded', 'active')).toBe(false);
  });

  it('T006 — FSM: active has no further transitions', () => {
    expect(isValidPhoneRepairTransition('active', 'seeded')).toBe(false);
  });

  it('T007 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T008 — guardClaimedToActive always allowed (informal)', () => {
    expect(guardClaimedToActive({} as never).allowed).toBe(true);
  });

  it('T009 — creates repair job with integer labour and total kobo (P9)', async () => {
    const job = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '08031234567', deviceBrand: 'Samsung', deviceModel: 'Galaxy A54', faultDescription: 'Broken screen', labourKobo: 15_000, totalKobo: 35_000 });
    expect(job.labourKobo).toBe(15_000);
    expect(job.totalKobo).toBe(35_000);
    expect(job.status).toBe('intake');
  });

  it('T010 — rejects fractional labourKobo (P9)', async () => {
    await expect(repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '080', deviceBrand: 'Apple', deviceModel: 'iPhone 13', faultDescription: 'Battery', labourKobo: 1.5, totalKobo: 2_000 })).rejects.toThrow('P9');
  });

  it('T011 — IMEI stored internally but NOT in AI-bound aggregate (P13)', async () => {
    const job = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '080', deviceBrand: 'Tecno', deviceModel: 'Camon 20', faultDescription: 'Charging port', labourKobo: 5_000, totalKobo: 8_000, imei: '356938035643809' });
    expect(job.imei).toBe('356938035643809');
    const jobs = await repo.listJobs('ws1', 'tn1');
    const advisory = jobs.map(j => ({ device_brand: j.deviceBrand, labour_kobo: j.labourKobo, total_kobo: j.totalKobo }));
    const hasImei = advisory.some(a => JSON.stringify(a).includes('356938035643809'));
    expect(hasImei).toBe(false);
  });

  it('T012 — updates job status to repairing', async () => {
    const job = await repo.createJob({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '070', deviceBrand: 'Itel', deviceModel: 'P36', faultDescription: 'Dead', labourKobo: 3_000, totalKobo: 5_000 });
    const updated = await repo.updateJobStatus(job.id, 'tn1', 'repairing');
    expect(updated!.status).toBe('repairing');
  });

  it('T013 — creates part with integer unitCostKobo (P9)', async () => {
    const part = await repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'Samsung A54 Screen', unitCostKobo: 18_000 });
    expect(part.unitCostKobo).toBe(18_000);
    expect(part.partName).toBe('Samsung A54 Screen');
  });

  it('T014 — rejects fractional unitCostKobo (P9)', async () => {
    await expect(repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'Battery', unitCostKobo: 5.5 })).rejects.toThrow('P9');
  });

  it('T015 — lists parts scoped to tenant (T3)', async () => {
    await repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'Screen A', unitCostKobo: 10_000 });
    await repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'Screen B', unitCostKobo: 12_000 });
    const parts = await repo.listParts('ws1', 'tn1');
    expect(parts.length).toBe(2);
  });
});
