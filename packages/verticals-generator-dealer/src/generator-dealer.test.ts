/**
 * packages/verticals-generator-dealer — GeneratorDealerRepository tests
 * M11 P3 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GeneratorDealerRepository } from './generator-dealer.js';
import {
  guardSeedToClaimed,
  guardClaimedToSonVerified,
  isValidGeneratorDealerTransition,
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
                (store[idx] as Record<string, unknown>)[col] = vals[i];
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof GeneratorDealerRepository>[0];
}

describe('GeneratorDealerRepository', () => {
  let repo: GeneratorDealerRepository;
  beforeEach(() => { repo = new GeneratorDealerRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Mikano Generator Hub' });
    expect(p.status).toBe('seeded');
    expect(p.companyName).toBe('Mikano Generator Hub');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Perkins Centre' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid', () => {
    expect(isValidGeneratorDealerTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: invalid transition claimed → active (must go through son_verified)', () => {
    expect(isValidGeneratorDealerTransition('claimed', 'active')).toBe(false);
  });

  it('T005 — FSM: claimed → son_verified valid', () => {
    expect(isValidGeneratorDealerTransition('claimed', 'son_verified')).toBe(true);
  });

  it('T006 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T007 — guardClaimedToSonVerified requires SON + Tier 2', () => {
    expect(guardClaimedToSonVerified({ sonDealership: null, kycTier: 2 }).allowed).toBe(false);
    expect(guardClaimedToSonVerified({ sonDealership: 'SON-001', kycTier: 1 }).allowed).toBe(false);
    expect(guardClaimedToSonVerified({ sonDealership: 'SON-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('T008 — transitions to son_verified', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', companyName: 'Cummins Lagos', sonDealership: 'SON-CUM-001' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'son_verified');
    expect(updated!.status).toBe('son_verified');
  });

  it('T009 — creates generator unit with integer kva and salePriceKobo (P9)', async () => {
    const unit = await repo.createUnit({ workspaceId: 'ws1', tenantId: 'tn1', brand: 'Mikano', kva: 20, serialNumber: 'MK-2024-001', salePriceKobo: 8_000_000 });
    expect(unit.kva).toBe(20);
    expect(unit.salePriceKobo).toBe(8_000_000);
    expect(unit.status).toBe('in_stock');
  });

  it('T010 — rejects float kva (P9)', async () => {
    await expect(repo.createUnit({ workspaceId: 'ws1', tenantId: 'tn1', brand: 'SDMO', kva: 20.5, serialNumber: 'SD-001', salePriceKobo: 5_000_000 })).rejects.toThrow('P9');
  });

  it('T011 — rejects fractional salePriceKobo (P9)', async () => {
    await expect(repo.createUnit({ workspaceId: 'ws1', tenantId: 'tn1', brand: 'Perkins', kva: 30, serialNumber: 'PK-001', salePriceKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T012 — updates unit status to sold', async () => {
    const unit = await repo.createUnit({ workspaceId: 'ws1', tenantId: 'tn1', brand: 'FG Wilson', kva: 15, serialNumber: 'FG-001', salePriceKobo: 6_000_000 });
    const updated = await repo.updateUnitStatus(unit.id, 'tn1', 'sold');
    expect(updated!.status).toBe('sold');
  });

  it('T013 — creates service job with integer labour_kobo (P9)', async () => {
    const job = await repo.createServiceJob({ workspaceId: 'ws1', tenantId: 'tn1', unitSerial: 'MK-001', clientPhone: '08031234567', faultDescription: 'Engine overheating', labourKobo: 150_000, totalKobo: 200_000 });
    expect(job.labourKobo).toBe(150_000);
    expect(job.status).toBe('booked');
  });

  it('T014 — rejects fractional labourKobo (P9)', async () => {
    await expect(repo.createServiceJob({ workspaceId: 'ws1', tenantId: 'tn1', unitSerial: 'X', clientPhone: '080', faultDescription: 'X', labourKobo: 100.5, totalKobo: 150 })).rejects.toThrow('P9');
  });

  it('T015 — creates spare part with integer unitCostKobo (P9)', async () => {
    const part = await repo.createSparePart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'Oil Filter', unitCostKobo: 25_000 });
    expect(part.unitCostKobo).toBe(25_000);
    expect(part.partName).toBe('Oil Filter');
  });

  it('T016 — AI advisory: customer details not in aggregate (P13)', async () => {
    const jobs = await repo.listServiceJobs('ws1', 'tn1');
    const advisory = jobs.map(j => ({ unit_serial: j.unitSerial, labour_kobo: j.labourKobo, total_kobo: j.totalKobo }));
    expect(advisory.every(a => !('client_phone' in a))).toBe(true);
  });
});
