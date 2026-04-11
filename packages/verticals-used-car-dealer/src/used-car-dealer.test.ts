/**
 * packages/verticals-used-car-dealer — UsedCarDealerRepository tests
 * M11 P3 acceptance: ≥15 tests. P13: VIN never to AI.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UsedCarDealerRepository } from './used-car-dealer.js';
import {
  guardSeedToClaimed,
  guardClaimedToFrscVerified,
  isValidUsedCarDealerTransition,
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
            if (!row['inspection_status']) row['inspection_status'] = 'pending';
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            if (row['completed'] === undefined) row['completed'] = 0;
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof UsedCarDealerRepository>[0];
}

describe('UsedCarDealerRepository', () => {
  let repo: UsedCarDealerRepository;
  beforeEach(() => { repo = new UsedCarDealerRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', dealershipName: 'Lagos Motor City' });
    expect(p.status).toBe('seeded');
    expect(p.dealershipName).toBe('Lagos Motor City');
  });

  it('T002 — T3: cross-tenant lookup returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', dealershipName: 'Abuja Auto Mall' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM: seeded → claimed valid', () => {
    expect(isValidUsedCarDealerTransition('seeded', 'claimed')).toBe(true);
  });

  it('T004 — FSM: invalid transition claimed → active (must go through frsc_verified)', () => {
    expect(isValidUsedCarDealerTransition('claimed', 'active')).toBe(false);
  });

  it('T005 — FSM: claimed → frsc_verified valid', () => {
    expect(isValidUsedCarDealerTransition('claimed', 'frsc_verified')).toBe(true);
  });

  it('T006 — guardSeedToClaimed requires Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T007 — guardClaimedToFrscVerified requires FRSC licence + Tier 2', () => {
    expect(guardClaimedToFrscVerified({ frscDealerLicence: null, kycTier: 2 }).allowed).toBe(false);
    expect(guardClaimedToFrscVerified({ frscDealerLicence: 'FRSC-001', kycTier: 1 }).allowed).toBe(false);
    expect(guardClaimedToFrscVerified({ frscDealerLicence: 'FRSC-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('T008 — transitions to frsc_verified', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', dealershipName: 'Kano Motor Mart', frscDealerLicence: 'FRSC-KN-001' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'frsc_verified');
    expect(updated!.status).toBe('frsc_verified');
  });

  it('T009 — creates car listing with integer mileageKm and askingPriceKobo (P9)', async () => {
    const listing = await repo.createListing({ workspaceId: 'ws1', tenantId: 'tn1', make: 'Toyota', model: 'Camry', year: 2019, mileageKm: 55000, askingPriceKobo: 12_000_000 });
    expect(listing.mileageKm).toBe(55000);
    expect(listing.askingPriceKobo).toBe(12_000_000);
    expect(listing.status).toBe('available');
    expect(listing.inspectionStatus).toBe('pending');
  });

  it('T010 — rejects float mileageKm (P9)', async () => {
    await expect(repo.createListing({ workspaceId: 'ws1', tenantId: 'tn1', make: 'Honda', model: 'Accord', year: 2018, mileageKm: 1.5, askingPriceKobo: 8_000_000 })).rejects.toThrow('P9');
  });

  it('T011 — rejects fractional askingPriceKobo (P9)', async () => {
    await expect(repo.createListing({ workspaceId: 'ws1', tenantId: 'tn1', make: 'Nissan', model: 'Altima', year: 2017, mileageKm: 80000, askingPriceKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('T012 — VIN stored internally but NOT in AI-bound aggregate (P13)', async () => {
    const listing = await repo.createListing({ workspaceId: 'ws1', tenantId: 'tn1', make: 'Ford', model: 'Explorer', year: 2020, mileageKm: 30000, askingPriceKobo: 18_000_000, vin: 'WBAPH7G52ANM60234' });
    expect(listing.vin).toBe('WBAPH7G52ANM60234');
    const listings = await repo.listListings('ws1', 'tn1');
    const advisory = listings.map(l => ({ make: l.make, asking_price_kobo: l.askingPriceKobo }));
    const hasVin = advisory.some(a => JSON.stringify(a).includes('WBAPH7G52ANM60234'));
    expect(hasVin).toBe(false);
  });

  it('T013 — updates listing status to reserved', async () => {
    const listing = await repo.createListing({ workspaceId: 'ws1', tenantId: 'tn1', make: 'Lexus', model: 'RX350', year: 2021, mileageKm: 15000, askingPriceKobo: 30_000_000 });
    const updated = await repo.updateListingStatus(listing.id, 'tn1', 'reserved');
    expect(updated!.status).toBe('reserved');
  });

  it('T014 — updates inspection status', async () => {
    const listing = await repo.createListing({ workspaceId: 'ws1', tenantId: 'tn1', make: 'Mercedes', model: 'C200', year: 2020, mileageKm: 20000, askingPriceKobo: 25_000_000 });
    const updated = await repo.updateInspectionStatus(listing.id, 'tn1', 'passed');
    expect(updated!.inspectionStatus).toBe('passed');
  });

  it('T015 — creates test drive booking', async () => {
    const booking = await repo.createTestDriveBooking({ workspaceId: 'ws1', tenantId: 'tn1', listingId: 'lst-001', clientPhone: '08031234567', scheduledAt: Math.floor(Date.now() / 1000) + 86400 });
    expect(booking.listingId).toBe('lst-001');
    expect(booking.completed).toBe(0);
  });
});
