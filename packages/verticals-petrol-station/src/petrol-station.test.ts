/**
 * packages/verticals-petrol-station — PetrolStationRepository tests
 * M11 P3 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PetrolStationRepository } from './petrol-station.js';
import {
  guardSeedToClaimed,
  guardClaimedToNuprcVerified,
  isValidPetrolStationTransition,
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
            ? (r['workspace_id'] === vals[0] || r['id'] === vals[0]) && r['tenant_id'] === vals[1]
            : true
        ),
      } as { results: T[] }),
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof PetrolStationRepository>[0];
}

describe('PetrolStationRepository', () => {
  let repo: PetrolStationRepository;
  beforeEach(() => { repo = new PetrolStationRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', stationName: 'Total Energies Victoria Island' });
    expect(p.status).toBe('seeded');
    expect(p.stationName).toBe('Total Energies Victoria Island');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', stationName: 'NNPC Mega Station' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid', () => {
    expect(isValidPetrolStationTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: invalid transition claimed → active (must go through nuprc_verified)', () => {
    expect(isValidPetrolStationTransition('claimed', 'active')).toBe(false);
  });

  it('T005 — FSM: claimed → nuprc_verified valid', () => {
    expect(isValidPetrolStationTransition('claimed', 'nuprc_verified')).toBe(true);
  });

  it('T006 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T007 — guardClaimedToNuprcVerified requires NUPRC licence + Tier 2', () => {
    expect(guardClaimedToNuprcVerified({ nuprcLicence: null, kycTier: 2 }).allowed).toBe(false);
    expect(guardClaimedToNuprcVerified({ nuprcLicence: 'NUPRC-001', kycTier: 1 }).allowed).toBe(false);
    expect(guardClaimedToNuprcVerified({ nuprcLicence: 'NUPRC-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('T008 — transitions to nuprc_verified', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', stationName: 'Ardova Ikoyi', nuprcLicence: 'NUPRC-ARD-001' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'nuprc_verified');
    expect(updated!.status).toBe('nuprc_verified');
  });

  it('T009 — creates nozzle with integer readings and pricePerLitreKobo (P9)', async () => {
    const nozzle = await repo.createNozzle({ workspaceId: 'ws1', tenantId: 'tn1', fuelType: 'pms', pumpId: 'P1-N1', openingReadingLitres: 15000, pricePerLitreKobo: 120_000 });
    expect(nozzle.openingReadingLitres).toBe(15000);
    expect(nozzle.pricePerLitreKobo).toBe(120_000);
    expect(nozzle.fuelType).toBe('pms');
  });

  it('T010 — rejects float openingReadingLitres (P9)', async () => {
    await expect(repo.createNozzle({ workspaceId: 'ws1', tenantId: 'tn1', fuelType: 'ago', pumpId: 'P2-N1', openingReadingLitres: 1.5, pricePerLitreKobo: 150_000 })).rejects.toThrow('P9');
  });

  it('T011 — rejects fractional pricePerLitreKobo (P9)', async () => {
    await expect(repo.createNozzle({ workspaceId: 'ws1', tenantId: 'tn1', fuelType: 'pms', pumpId: 'P1-N2', openingReadingLitres: 0, pricePerLitreKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T012 — updates nozzle closing reading (integer P9)', async () => {
    const nozzle = await repo.createNozzle({ workspaceId: 'ws1', tenantId: 'tn1', fuelType: 'lpg', pumpId: 'G1-N1', openingReadingLitres: 5000, pricePerLitreKobo: 70_000 });
    const updated = await repo.updateNozzleClosingReading(nozzle.id, 'tn1', 5350);
    expect(updated!.closingReadingLitres).toBe(5350);
  });

  it('T013 — rejects float closing reading (P9)', async () => {
    const nozzle = await repo.createNozzle({ workspaceId: 'ws1', tenantId: 'tn1', fuelType: 'pms', pumpId: 'P3-N1', openingReadingLitres: 0, pricePerLitreKobo: 100_000 });
    await expect(repo.updateNozzleClosingReading(nozzle.id, 'tn1', 1.7)).rejects.toThrow('P9');
  });

  it('T014 — creates fleet credit account with integer creditLimitKobo (P9)', async () => {
    const fleet = await repo.createFleetCredit({ workspaceId: 'ws1', tenantId: 'tn1', fleetName: 'Dangote Logistics', fleetPhone: '08031234567', creditLimitKobo: 20_000_000 });
    expect(fleet.creditLimitKobo).toBe(20_000_000);
    expect(fleet.balanceOwingKobo).toBe(0);
  });

  it('T015 — rejects fractional creditLimitKobo (P9)', async () => {
    await expect(repo.createFleetCredit({ workspaceId: 'ws1', tenantId: 'tn1', fleetName: 'X', fleetPhone: '080', creditLimitKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T016 — lists nozzles scoped to tenant (T3)', async () => {
    await repo.createNozzle({ workspaceId: 'ws1', tenantId: 'tn1', fuelType: 'pms', pumpId: 'P1', openingReadingLitres: 0, pricePerLitreKobo: 100_000 });
    await repo.createNozzle({ workspaceId: 'ws1', tenantId: 'tn1', fuelType: 'ago', pumpId: 'P2', openingReadingLitres: 0, pricePerLitreKobo: 140_000 });
    const nozzles = await repo.listNozzles('ws1', 'tn1');
    expect(nozzles.length).toBe(2);
  });
});
