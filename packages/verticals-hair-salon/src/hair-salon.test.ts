/**
 * packages/verticals-hair-salon — HairSalonRepository tests
 * M10 P3 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HairSalonRepository } from './hair-salon.js';
import {
  guardSeedToClaimed,
  guardClaimedToActive,
  isValidHairSalonTransition,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof HairSalonRepository>[0];
}

describe('HairSalonRepository', () => {
  let repo: HairSalonRepository;
  beforeEach(() => { repo = new HairSalonRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', salonName: 'Emeka Barbing Salon', type: 'barbing' });
    expect(p.status).toBe('seeded');
    expect(p.salonName).toBe('Emeka Barbing Salon');
    expect(p.type).toBe('barbing');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', salonName: 'Amaka Hair Braiding', type: 'braiding' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid (3-state)', () => {
    expect(isValidHairSalonTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: claimed → active valid (3-state)', () => {
    expect(isValidHairSalonTransition('claimed', 'active')).toBe(true);
  });

  it('T005 — FSM: seeded → active invalid', () => {
    expect(isValidHairSalonTransition('seeded', 'active')).toBe(false);
  });

  it('T006 — FSM: active has no further transitions', () => {
    expect(isValidHairSalonTransition('active', 'seeded')).toBe(false);
  });

  it('T007 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T008 — guardClaimedToActive always allowed (informal)', () => {
    expect(guardClaimedToActive({} as never).allowed).toBe(true);
  });

  it('T009 — transitions claimed → active', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', salonName: 'Kano Mixed Salon', type: 'mixed' });
    await repo.transitionStatus(p.id, 'tn1', 'claimed');
    const updated = await repo.transitionStatus(p.id, 'tn1', 'active');
    expect(updated!.status).toBe('active');
  });

  it('T010 — creates service with integer priceKobo (P9)', async () => {
    const s = await repo.createService({ workspaceId: 'ws1', tenantId: 'tn1', serviceName: 'Haircut', priceKobo: 100_000 });
    expect(s.priceKobo).toBe(100_000);
    expect(s.serviceName).toBe('Haircut');
  });

  it('T011 — rejects fractional priceKobo (P9)', async () => {
    await expect(repo.createService({ workspaceId: 'ws1', tenantId: 'tn1', serviceName: 'Braids', priceKobo: 1.5 })).rejects.toThrow('P9');
  });

  it('T012 — creates daily log with integer revenueKobo (P9)', async () => {
    const log = await repo.createDailyLog({ workspaceId: 'ws1', tenantId: 'tn1', logDate: Math.floor(Date.now() / 1000), customersServed: 15, revenueKobo: 750_000 });
    expect(log.revenueKobo).toBe(750_000);
    expect(log.customersServed).toBe(15);
  });

  it('T013 — rejects fractional revenueKobo (P9)', async () => {
    await expect(repo.createDailyLog({ workspaceId: 'ws1', tenantId: 'tn1', logDate: 0, revenueKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T014 — lists services scoped to tenant (T3)', async () => {
    await repo.createService({ workspaceId: 'ws1', tenantId: 'tn1', serviceName: 'Barbing', priceKobo: 150_000 });
    await repo.createService({ workspaceId: 'ws1', tenantId: 'tn1', serviceName: 'Shave', priceKobo: 80_000 });
    const services = await repo.listServices('ws1', 'tn1');
    expect(services.length).toBe(2);
  });

  it('T015 — lists daily logs scoped to tenant (T3)', async () => {
    await repo.createDailyLog({ workspaceId: 'ws1', tenantId: 'tn1', logDate: 1, revenueKobo: 500_000 });
    await repo.createDailyLog({ workspaceId: 'ws1', tenantId: 'tn1', logDate: 2, revenueKobo: 600_000 });
    const logs = await repo.listDailyLogs('ws1', 'tn1');
    expect(logs.length).toBe(2);
  });
});
