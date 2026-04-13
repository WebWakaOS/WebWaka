/**
 * @webwaka/verticals-poultry-farm — PoultryFarmRepository tests (M10)
 * ≥30 tests covering: T3, P9, FSM guards (NAPRI cert),
 * flock management, egg production logging, feed records, poultry sales.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PoultryFarmRepository } from './poultry-farm.js';
import {
  guardSeedToClaimed,
  guardClaimedToNapriRegistered,
  guardIntegerBirds,
  guardIntegerEggs,
  guardIntegerKobo,
  guardL2AiCap,
  isValidPoultryFarmTransition,
  registerPoultryFarmVertical,
} from './index.js';

// ---------------------------------------------------------------------------
// In-memory D1 mock
// ---------------------------------------------------------------------------
function makeDb() {
  const store = new Map<string, Record<string, unknown>>();

  function parseTableName(sql: string): string {
    const m = sql.match(/(?:INTO|FROM|UPDATE)\s+(\w+)/i);
    return m?.[1] ?? 'unknown';
  }

  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        // eslint-disable-next-line @typescript-eslint/require-await
        run: async () => {
          const upper = sql.trim().toUpperCase();
          if (upper.startsWith('INSERT')) {
            const table = parseTableName(sql);
            const colM = sql.match(/\(([^)]+)\)\s+VALUES/i);
            const valM = sql.match(/VALUES\s*\(([^)]+)\)/i);
            if (colM && valM) {
              const cols = colM[1]!.split(',').map((c: string) => c.trim());
              const tokens = valM[1]!.split(',').map((v: string) => v.trim());
              const row: Record<string, unknown> = { _table: table };
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
              // P9 enforcement
              if (table === 'poultry_flocks') {
                const bc = row['bird_count'];
                if (!Number.isInteger(bc) || (bc as number) < 0)
                  throw new Error('[P9] bird_count must be a non-negative integer');
              }
              if (table === 'poultry_egg_production_logs') {
                const ec = row['eggs_collected'];
                if (!Number.isInteger(ec) || (ec as number) < 0)
                  throw new Error('[P9] eggs_collected must be a non-negative integer');
                const eb = row['eggs_breakage'];
                if (!Number.isInteger(eb) || (eb as number) < 0)
                  throw new Error('[P9] eggs_breakage must be a non-negative integer');
              }
              if (table === 'poultry_feed_records') {
                const qk = row['quantity_kg'];
                if (!Number.isInteger(qk) || (qk as number) < 0)
                  throw new Error('[P9] quantity_kg must be a non-negative integer');
                const ck = row['cost_kobo'];
                if (!Number.isInteger(ck) || (ck as number) < 0)
                  throw new Error('[P9] cost_kobo must be a non-negative integer (kobo)');
              }
              if (table === 'poultry_sales') {
                const bc = row['bird_count'];
                if (!Number.isInteger(bc) || (bc as number) < 0)
                  throw new Error('[P9] bird_count must be a non-negative integer');
                const pp = row['price_per_bird_kobo'];
                if (!Number.isInteger(pp) || (pp as number) < 0)
                  throw new Error('[P9] price_per_bird_kobo must be a non-negative integer (kobo)');
              }
              store.set(`${table}:${String(row['id'])}`, row);
            }
          } else if (upper.startsWith('UPDATE')) {
            const table = parseTableName(sql);
            const lastId = vals[vals.length - 2] as string;
            const lastTid = vals[vals.length - 1] as string;
            const key = `${table}:${lastId}`;
            const existing = store.get(key);
            if (existing && existing['tenant_id'] === lastTid) {
              const setM = sql.match(/SET\s+(.+?)\s+WHERE/is);
              if (setM) {
                const clauses = setM[1]!
                  .split(',')
                  .map((s: string) => s.trim())
                  .filter((s: string) => !s.toLowerCase().startsWith('updated_at'));
                clauses.forEach((clause: string, i: number) => {
                  // Handle mortality_count = mortality_count + ? pattern
                  if (clause.includes('mortality_count + ?')) {
                    existing['mortality_count'] = ((existing['mortality_count'] as number) ?? 0) + (vals[i] as number);
                  } else {
                    const col = clause.split('=')[0]!.trim();
                    existing[col] = vals[i];
                  }
                });
                existing['updated_at'] = Math.floor(Date.now() / 1000);
                store.set(key, existing);
              }
            }
          }
          return { success: true };
        },
        // eslint-disable-next-line @typescript-eslint/require-await
        first: async <T>() => {
          const table = parseTableName(sql);
          const id = vals[0] as string;
          const tenantId = vals[1] as string | undefined;
          const key = `${table}:${id}`;
          const row = store.get(key);
          if (!row) return null as T;
          if (tenantId !== undefined && row['tenant_id'] !== tenantId) return null as T;
          return row as T;
        },
        // eslint-disable-next-line @typescript-eslint/require-await
        all: async <T>() => {
          const table = parseTableName(sql);
          const filterVal1 = vals[0] as string;
          const filterVal2 = vals[1] as string | undefined;
          const results = Array.from(store.values()).filter(r => {
            if (r['_table'] !== table) return false;
            const firstMatch = Object.values(r).includes(filterVal1);
            if (!firstMatch) return false;
            if (filterVal2 !== undefined) return r['tenant_id'] === filterVal2;
            return true;
          });
          return { results: results as unknown as T[] };
        },
      }),
    }),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('PoultryFarmRepository', () => {
  let repo: PoultryFarmRepository;
  beforeEach(() => { repo = new PoultryFarmRepository(makeDb() as never); });

  it('T001 — createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', farmName: 'Sunrise Poultry', state: 'Ogun', lga: 'Abeokuta' });
    expect(p.status).toBe('seeded');
    expect(p.farmName).toBe('Sunrise Poultry');
  });

  it('T002 — createProfile T3: null for wrong tenant', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', farmName: 'Birds Farm', state: 'Lagos', lga: 'Ikeja' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — guardSeedToClaimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T004 — guardClaimedToNapriRegistered requires NAPRI cert', () => {
    expect(guardClaimedToNapriRegistered({ napriCert: null }).allowed).toBe(false);
    expect(guardClaimedToNapriRegistered({ napriCert: 'NAPRI-2024-001' }).allowed).toBe(true);
  });

  it('T005 — isValidPoultryFarmTransition validates FSM', () => {
    expect(isValidPoultryFarmTransition('seeded', 'claimed')).toBe(true);
    expect(isValidPoultryFarmTransition('claimed', 'napri_registered')).toBe(true);
    expect(isValidPoultryFarmTransition('napri_registered', 'active')).toBe(true);
    expect(isValidPoultryFarmTransition('active', 'suspended')).toBe(true);
    expect(isValidPoultryFarmTransition('suspended', 'active')).toBe(true);
  });

  it('T006 — isValidPoultryFarmTransition rejects invalid jumps', () => {
    expect(isValidPoultryFarmTransition('seeded', 'active')).toBe(false);
    expect(isValidPoultryFarmTransition('active', 'seeded')).toBe(false);
  });

  it('T007 — transitionProfile updates status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', farmName: 'Eagle Farm', state: 'Kano', lga: 'Nassarawa' });
    const updated = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(updated?.status).toBe('claimed');
  });

  it('T008 — guardIntegerBirds fails for fractional count', () => {
    expect(guardIntegerBirds(500.5).allowed).toBe(false);
    expect(guardIntegerBirds(-1).allowed).toBe(false);
  });

  it('T009 — guardIntegerBirds passes for valid integers', () => {
    expect(guardIntegerBirds(0).allowed).toBe(true);
    expect(guardIntegerBirds(5000).allowed).toBe(true);
  });

  it('T010 — guardIntegerEggs fails for fractional count', () => {
    expect(guardIntegerEggs(100.5).allowed).toBe(false);
  });

  it('T011 — guardIntegerKobo fails for fractional amount (P9)', () => {
    expect(guardIntegerKobo(50.5).allowed).toBe(false);
    expect(guardIntegerKobo(-1).allowed).toBe(false);
  });

  it('T012 — guardL2AiCap blocks L3_HITL (ADL-010)', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
  });

  it('T013 — guardL2AiCap passes for L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });

  it('T014 — createFlock with valid integer birdCount', async () => {
    const flock = await repo.createFlock({ farmId: 'f1', tenantId: 'tn1', flockType: 'layer', birdCount: 5000, stockingDate: 1700000000 });
    expect(flock.birdCount).toBe(5000);
    expect(flock.flockType).toBe('layer');
    expect(flock.mortalityCount).toBe(0);
    expect(flock.status).toBe('active');
  });

  it('T015 — createFlock rejects fractional birdCount (P9)', async () => {
    await expect(repo.createFlock({ farmId: 'f1', tenantId: 'tn1', flockType: 'broiler', birdCount: 200.5, stockingDate: 1700000000 })).rejects.toThrow('[P9]');
  });

  it('T016 — createFlock T3 isolation', async () => {
    const flock = await repo.createFlock({ farmId: 'f1', tenantId: 'tn-a', flockType: 'broiler', birdCount: 1000, stockingDate: 1700000000 });
    expect(await repo.findFlockById(flock.id, 'tn-b')).toBeNull();
  });

  it('T017 — recordMortality increments mortalityCount', async () => {
    const flock = await repo.createFlock({ farmId: 'f1', tenantId: 'tn1', flockType: 'layer', birdCount: 2000, stockingDate: 1700000000 });
    const updated = await repo.recordMortality(flock.id, 'tn1', 50);
    expect(updated?.mortalityCount).toBe(50);
  });

  it('T018 — recordMortality rejects fractional deadCount (P9)', async () => {
    const flock = await repo.createFlock({ farmId: 'f1', tenantId: 'tn1', flockType: 'layer', birdCount: 1000, stockingDate: 1700000000 });
    await expect(repo.recordMortality(flock.id, 'tn1', 10.5)).rejects.toThrow('[P9]');
  });

  it('T019 — logEggProduction with valid integer counts', async () => {
    const log = await repo.logEggProduction({ flockId: 'fl1', tenantId: 'tn1', logDate: 1700000000, eggsCollected: 1800, eggsBreakage: 12 });
    expect(log.eggsCollected).toBe(1800);
    expect(log.eggsBreakage).toBe(12);
  });

  it('T020 — logEggProduction defaults eggsBreakage to 0', async () => {
    const log = await repo.logEggProduction({ flockId: 'fl1', tenantId: 'tn1', logDate: 1700000000, eggsCollected: 1500 });
    expect(log.eggsBreakage).toBe(0);
  });

  it('T021 — logEggProduction rejects fractional eggsCollected (P9)', async () => {
    await expect(repo.logEggProduction({ flockId: 'fl1', tenantId: 'tn1', logDate: 1700000000, eggsCollected: 1200.5 })).rejects.toThrow('[P9]');
  });

  it('T022 — logEggProduction T3 isolation', async () => {
    const log = await repo.logEggProduction({ flockId: 'fl1', tenantId: 'tn-p', logDate: 1700000000, eggsCollected: 900 });
    expect(await repo.findEggLogById(log.id, 'tn-q')).toBeNull();
  });

  it('T023 — createFeedRecord with valid integer quantityKg and costKobo', async () => {
    const feed = await repo.createFeedRecord({ farmId: 'f1', tenantId: 'tn1', feedType: 'Broiler Starter', quantityKg: 100, costKobo: 75000, purchaseDate: 1700000000 });
    expect(feed.quantityKg).toBe(100);
    expect(feed.costKobo).toBe(75000);
  });

  it('T024 — createFeedRecord rejects fractional costKobo (P9)', async () => {
    await expect(repo.createFeedRecord({ farmId: 'f1', tenantId: 'tn1', feedType: 'Layer Mash', quantityKg: 50, costKobo: 37500.5, purchaseDate: 1700000000 })).rejects.toThrow('[P9]');
  });

  it('T025 — createSale calculates total = birdCount × pricePerBirdKobo (P9)', async () => {
    const sale = await repo.createSale({ flockId: 'fl1', tenantId: 'tn1', buyerPhone: '08100000001', birdCount: 100, pricePerBirdKobo: 3500 });
    expect(sale.totalAmountKobo).toBe(350000); // 100 × 3500
    expect(sale.status).toBe('pending');
  });

  it('T026 — createSale rejects fractional birdCount (P9)', async () => {
    await expect(repo.createSale({ flockId: 'fl1', tenantId: 'tn1', buyerPhone: '08100000002', birdCount: 50.5, pricePerBirdKobo: 3000 })).rejects.toThrow('[P9]');
  });

  it('T027 — createSale rejects fractional pricePerBirdKobo (P9)', async () => {
    await expect(repo.createSale({ flockId: 'fl1', tenantId: 'tn1', buyerPhone: '08100000003', birdCount: 50, pricePerBirdKobo: 3000.5 })).rejects.toThrow('[P9]');
  });

  it('T028 — updateSaleStatus transitions to confirmed', async () => {
    const sale = await repo.createSale({ flockId: 'fl1', tenantId: 'tn1', buyerPhone: '08100000004', birdCount: 200, pricePerBirdKobo: 4000 });
    const confirmed = await repo.updateSaleStatus(sale.id, 'tn1', 'confirmed');
    expect(confirmed?.status).toBe('confirmed');
  });

  it('T029 — findSaleById T3 isolation', async () => {
    const sale = await repo.createSale({ flockId: 'fl1', tenantId: 'tn-x', buyerPhone: '08100000005', birdCount: 100, pricePerBirdKobo: 3500 });
    expect(await repo.findSaleById(sale.id, 'tn-y')).toBeNull();
  });

  it('T030 — createProfile stores NAPRI cert when provided', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', farmName: 'Certified Farm', state: 'Oyo', lga: 'Ibadan', napriCert: 'NAPRI-2024-999' });
    expect(p.napriCert).toBe('NAPRI-2024-999');
  });

  it('T031 — registerPoultryFarmVertical returns correct metadata', () => {
    const meta = registerPoultryFarmVertical();
    expect(meta.slug).toBe('poultry-farm');
    expect(meta.milestone).toBe('M10');
    expect(meta.ai_autonomy_level).toBe(2);
  });

  it('T032 — createFeedRecord rejects fractional quantityKg (P9)', async () => {
    await expect(repo.createFeedRecord({ farmId: 'f1', tenantId: 'tn1', feedType: 'Grower Mash', quantityKg: 50.5, costKobo: 35000, purchaseDate: 1700000000 })).rejects.toThrow('[P9]');
  });
});
