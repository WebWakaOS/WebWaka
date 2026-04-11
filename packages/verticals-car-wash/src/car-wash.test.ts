/**
 * packages/verticals-car-wash — CarWashRepository tests
 * M12 P3 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CarWashRepository } from './car-wash.js';
import {
  guardSeedToClaimed,
  guardClaimedToActive,
  isValidCarWashTransition,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof CarWashRepository>[0];
}

describe('CarWashRepository', () => {
  let repo: CarWashRepository;
  beforeEach(() => { repo = new CarWashRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Lagos Island Car Wash' });
    expect(p.status).toBe('seeded');
    expect(p.businessName).toBe('Lagos Island Car Wash');
  });

  it('T002 — finds profile by id + tenantId (T3 scope)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Clean Ride' });
    const found = await repo.findProfileById(p.id, 'tn1');
    expect(found).not.toBeNull();
  });

  it('T003 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Wash King' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T004 — FSM: seeded → claimed valid (3-state)', () => {
    expect(isValidCarWashTransition('seeded', 'claimed')).toBe(true);
  });

  it('T005 — FSM: claimed → active valid (3-state)', () => {
    expect(isValidCarWashTransition('claimed', 'active')).toBe(true);
  });

  it('T006 — FSM: seeded → active invalid', () => {
    expect(isValidCarWashTransition('seeded', 'active')).toBe(false);
  });

  it('T007 — FSM: active has no further transitions', () => {
    expect(isValidCarWashTransition('active', 'seeded')).toBe(false);
  });

  it('T008 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T009 — guardClaimedToActive always allowed (informal)', () => {
    expect(guardClaimedToActive({} as never).allowed).toBe(true);
  });

  it('T010 — transitions claimed → active', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Bright Wash' });
    await repo.transitionStatus(p.id, 'tn1', 'claimed');
    const updated = await repo.transitionStatus(p.id, 'tn1', 'active');
    expect(updated!.status).toBe('active');
  });

  it('T011 — creates visit with integer priceKobo (P9)', async () => {
    const v = await repo.createVisit({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'LND-123AB', washType: 'full', priceKobo: 200_000 });
    expect(v.priceKobo).toBe(200_000);
    expect(v.washType).toBe('full');
  });

  it('T012 — rejects fractional priceKobo (P9)', async () => {
    await expect(repo.createVisit({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'KJA-456', washType: 'basic', priceKobo: 1.5 })).rejects.toThrow('P9');
  });

  it('T013 — loyalty count persists on visit', async () => {
    const v = await repo.createVisit({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'ABJ-789', washType: 'detailing', priceKobo: 500_000, loyaltyCount: 5 });
    expect(v.loyaltyCount).toBe(5);
  });

  it('T014 — lists visits scoped to tenant (T3)', async () => {
    await repo.createVisit({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'A', washType: 'basic', priceKobo: 100_000 });
    await repo.createVisit({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'B', washType: 'full', priceKobo: 200_000 });
    const visits = await repo.listVisits('ws1', 'tn1');
    expect(visits.length).toBe(2);
  });

  it('T015 — different wash types accepted', async () => {
    const basic = await repo.createVisit({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'C', washType: 'basic', priceKobo: 80_000 });
    const detail = await repo.createVisit({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'D', washType: 'detailing', priceKobo: 600_000 });
    expect(basic.washType).toBe('basic');
    expect(detail.washType).toBe('detailing');
  });
});
