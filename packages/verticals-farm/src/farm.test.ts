/**
 * @webwaka/verticals-farm — FarmRepository tests (M10)
 * ≥30 tests covering: T3, P9, FSM guards, harvest management,
 * buyer marketplace sales (total = qty × price), weather event logs.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FarmRepository } from './farm.js';
import {
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  guardIntegerKg,
  guardIntegerKobo,
  guardL2AiCap,
  isValidFarmTransition,
  registerFarmVertical,
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
              // P9 enforcement on insert
              if (table === 'farm_harvests') {
                const qty = row['quantity_kg'];
                if (!Number.isInteger(qty) || (qty as number) < 0)
                  throw new Error('[P9] quantity_kg must be a non-negative integer');
                const price = row['asking_price_kobo'];
                if (!Number.isInteger(price) || (price as number) < 0)
                  throw new Error('[P9] asking_price_kobo must be a non-negative integer (kobo)');
              }
              if (table === 'farm_sales') {
                const qty = row['quantity_kg'];
                if (!Number.isInteger(qty) || (qty as number) < 0)
                  throw new Error('[P9] quantity_kg must be a non-negative integer');
                const price = row['sale_price_kobo'];
                if (!Number.isInteger(price) || (price as number) < 0)
                  throw new Error('[P9] sale_price_kobo must be a non-negative integer (kobo)');
              }
              store.set(`${table}:${String(row['id'])}`, row);
            }
          } else if (upper.startsWith('UPDATE')) {
            const table = parseTableName(sql);
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const key = `${table}:${id}`;
            const existing = store.get(key);
            if (existing && existing['tenant_id'] === tid) {
              const setM = sql.match(/SET\s+(.+?)\s+WHERE/is);
              if (setM) {
                const clauses = setM[1]!
                  .split(',')
                  .map((s: string) => s.trim())
                  .filter((s: string) => !s.toLowerCase().startsWith('updated_at')
                    && !s.toLowerCase().startsWith('end_date'));
                clauses.forEach((clause: string, i: number) => {
                  const col = clause.split('=')[0]!.trim();
                  existing[col] = vals[i];
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
          const filterKey = vals[0] as string;
          const filterVal2 = vals[1] as string | undefined;
          const results = Array.from(store.values()).filter(r => {
            if (r['_table'] !== table) return false;
            // Match first filter (workspace_id, farm_id, harvest_id, flock_id, contract_id)
            const firstMatch = Object.values(r).includes(filterKey);
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
describe('FarmRepository', () => {
  let repo: FarmRepository;
  beforeEach(() => { repo = new FarmRepository(makeDb() as never); });

  it('T001 — createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', farmName: 'Green Valley Farm', state: 'Ogun', lga: 'Abeokuta' });
    expect(p.status).toBe('seeded');
    expect(p.tenantId).toBe('tn1');
    expect(p.farmName).toBe('Green Valley Farm');
  });

  it('T002 — createProfile defaults farmSizeHectares to 0 if not provided', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', farmName: 'Sunrise Farm', state: 'Kogi', lga: 'Lokoja' });
    expect(p.farmSizeHectares).toBe(0);
  });

  it('T003 — findProfileById returns null for wrong tenant (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', farmName: 'Alpha Farm', state: 'Lagos', lga: 'Badagry' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T004 — guardSeedToClaimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T005 — guardClaimedToCacVerified requires CAC number', () => {
    expect(guardClaimedToCacVerified({ cacNumber: null }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacNumber: 'RC-112233' }).allowed).toBe(true);
  });

  it('T006 — isValidFarmTransition validates correct FSM edges', () => {
    expect(isValidFarmTransition('seeded', 'claimed')).toBe(true);
    expect(isValidFarmTransition('claimed', 'cac_verified')).toBe(true);
    expect(isValidFarmTransition('cac_verified', 'active')).toBe(true);
    expect(isValidFarmTransition('active', 'suspended')).toBe(true);
    expect(isValidFarmTransition('suspended', 'active')).toBe(true);
  });

  it('T007 — isValidFarmTransition rejects invalid FSM jumps', () => {
    expect(isValidFarmTransition('seeded', 'active')).toBe(false);
    expect(isValidFarmTransition('active', 'seeded')).toBe(false);
    expect(isValidFarmTransition('cac_verified', 'seeded')).toBe(false);
  });

  it('T008 — transitionProfile updates FSM status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', farmName: 'Delta Farm', state: 'Delta', lga: 'Asaba' });
    const updated = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(updated?.status).toBe('claimed');
  });

  it('T009 — guardIntegerKg passes for valid integer', () => {
    expect(guardIntegerKg(5000).allowed).toBe(true);
    expect(guardIntegerKg(0).allowed).toBe(true);
  });

  it('T010 — guardIntegerKg fails for fractional kg', () => {
    expect(guardIntegerKg(100.5).allowed).toBe(false);
    expect(guardIntegerKg(-1).allowed).toBe(false);
  });

  it('T011 — guardIntegerKobo fails for fractional kobo (P9)', () => {
    expect(guardIntegerKobo(50.5).allowed).toBe(false);
    expect(guardIntegerKobo(-100).allowed).toBe(false);
  });

  it('T012 — guardIntegerKobo passes for valid integer kobo', () => {
    expect(guardIntegerKobo(0).allowed).toBe(true);
    expect(guardIntegerKobo(200000).allowed).toBe(true);
  });

  it('T013 — guardL2AiCap blocks L3_HITL (ADL-010)', () => {
    const r = guardL2AiCap({ autonomyLevel: 'L3_HITL' });
    expect(r.allowed).toBe(false);
    if (!r.allowed) { expect(r.reason).toContain('ADL-010'); }
  });

  it('T014 — guardL2AiCap blocks numeric level 3', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
  });

  it('T015 — guardL2AiCap passes for L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
    expect(guardL2AiCap({ autonomyLevel: undefined }).allowed).toBe(true);
  });

  it('T016 — createHarvest with valid integer quantityKg and askingPriceKobo', async () => {
    const harvest = await repo.createHarvest({ farmId: 'f1', tenantId: 'tn1', cropType: 'Cassava', quantityKg: 2000, harvestDate: 1700000000, askingPriceKobo: 150 });
    expect(harvest.quantityKg).toBe(2000);
    expect(harvest.askingPriceKobo).toBe(150);
    expect(harvest.status).toBe('available');
    expect(harvest.cropType).toBe('Cassava');
  });

  it('T017 — createHarvest rejects fractional quantityKg (P9)', async () => {
    await expect(repo.createHarvest({ farmId: 'f1', tenantId: 'tn1', cropType: 'Yam', quantityKg: 100.5, harvestDate: 1700000000, askingPriceKobo: 200 })).rejects.toThrow('[P9]');
  });

  it('T018 — createHarvest rejects fractional askingPriceKobo (P9)', async () => {
    await expect(repo.createHarvest({ farmId: 'f1', tenantId: 'tn1', cropType: 'Maize', quantityKg: 500, harvestDate: 1700000000, askingPriceKobo: 99.9 })).rejects.toThrow('[P9]');
  });

  it('T019 — findHarvestById T3 isolation', async () => {
    const h = await repo.createHarvest({ farmId: 'f1', tenantId: 'tn-a', cropType: 'Tomato', quantityKg: 300, harvestDate: 1700000000, askingPriceKobo: 100 });
    expect(await repo.findHarvestById(h.id, 'tn-b')).toBeNull();
  });

  it('T020 — createHarvest defaults grade to B when not provided', async () => {
    const h = await repo.createHarvest({ farmId: 'f1', tenantId: 'tn1', cropType: 'Pepper', quantityKg: 100, harvestDate: 1700000000, askingPriceKobo: 50 });
    expect(h.grade).toBe('B');
  });

  it('T021 — createHarvest sets explicit grade A (export quality)', async () => {
    const h = await repo.createHarvest({ farmId: 'f1', tenantId: 'tn1', cropType: 'Cocoa', quantityKg: 1000, harvestDate: 1700000000, askingPriceKobo: 500, grade: 'A' });
    expect(h.grade).toBe('A');
  });

  it('T022 — createSale calculates totalAmountKobo = quantityKg × salePriceKobo (P9)', async () => {
    const sale = await repo.createSale({ harvestId: 'h1', tenantId: 'tn1', buyerPhone: '08100000001', quantityKg: 100, salePriceKobo: 200 });
    expect(sale.totalAmountKobo).toBe(20000); // 100 × 200
    expect(sale.status).toBe('pending');
  });

  it('T023 — createSale rejects fractional salePriceKobo (P9)', async () => {
    await expect(repo.createSale({ harvestId: 'h1', tenantId: 'tn1', buyerPhone: '08100000002', quantityKg: 50, salePriceKobo: 150.5 })).rejects.toThrow('[P9]');
  });

  it('T024 — createSale rejects fractional quantityKg in sale (P9)', async () => {
    await expect(repo.createSale({ harvestId: 'h1', tenantId: 'tn1', buyerPhone: '08100000003', quantityKg: 25.5, salePriceKobo: 100 })).rejects.toThrow('[P9]');
  });

  it('T025 — updateSaleStatus transitions to confirmed', async () => {
    const sale = await repo.createSale({ harvestId: 'h1', tenantId: 'tn1', buyerPhone: '08100000004', quantityKg: 200, salePriceKobo: 180 });
    const confirmed = await repo.updateSaleStatus(sale.id, 'tn1', 'confirmed');
    expect(confirmed?.status).toBe('confirmed');
  });

  it('T026 — findSaleById T3 isolation', async () => {
    const sale = await repo.createSale({ harvestId: 'h1', tenantId: 'tn-x', buyerPhone: '08100000005', quantityKg: 50, salePriceKobo: 100 });
    expect(await repo.findSaleById(sale.id, 'tn-y')).toBeNull();
  });

  it('T027 — logWeatherEvent creates a record with correct type and severity', async () => {
    const event = await repo.logWeatherEvent({ farmId: 'f1', tenantId: 'tn1', eventType: 'rainfall', description: 'Heavy rains in Ogun', eventDate: 1700000000, severity: 2 });
    expect(event.eventType).toBe('rainfall');
    expect(event.severity).toBe(2);
    expect(event.description).toBe('Heavy rains in Ogun');
  });

  it('T028 — logWeatherEvent defaults severity to 1 if not specified', async () => {
    const event = await repo.logWeatherEvent({ farmId: 'f1', tenantId: 'tn1', eventType: 'drought', description: 'Dry spell', eventDate: 1700000000 });
    expect(event.severity).toBe(1);
  });

  it('T029 — findWeatherEventById T3 isolation', async () => {
    const event = await repo.logWeatherEvent({ farmId: 'f1', tenantId: 'tn-p', eventType: 'flooding', description: 'Flood', eventDate: 1700000000 });
    expect(await repo.findWeatherEventById(event.id, 'tn-q')).toBeNull();
  });

  it('T030 — registerFarmVertical returns correct metadata', () => {
    const meta = registerFarmVertical();
    expect(meta.slug).toBe('farm');
    expect(meta.milestone).toBe('M10');
    expect(meta.ai_autonomy_level).toBe(2);
    expect(meta.primary_pillars).toContain('ops');
  });

  it('T031 — createProfile stores primaryCrop when provided', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', farmName: 'Rice Valley', state: 'Kebbi', lga: 'Argungu', primaryCrop: 'Rice' });
    expect(p.primaryCrop).toBe('Rice');
  });

  it('T032 — suspended farm can return to active (FSM recovery)', () => {
    expect(isValidFarmTransition('suspended', 'active')).toBe(true);
  });

  it('T033 — sale with zero price is valid (P9: 0 is an integer)', async () => {
    const sale = await repo.createSale({ harvestId: 'h-free', tenantId: 'tn1', buyerPhone: '08100000099', quantityKg: 10, salePriceKobo: 0 });
    expect(sale.totalAmountKobo).toBe(0);
  });
});
