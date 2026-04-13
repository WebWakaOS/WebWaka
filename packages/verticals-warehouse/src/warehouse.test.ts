/**
 * @webwaka/verticals-warehouse — WarehouseRepository tests (M10)
 * ≥30 tests covering: T3, P9, FSM guards (SON/CAC/NAFDAC certs),
 * slot management, client contracts (daily billing in kobo),
 * inbound/outbound stock movements, capacity enforcement.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WarehouseRepository } from './warehouse.js';
import {
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  guardCacVerifiedToSonCertified,
  guardIntegerKg,
  guardIntegerKobo,
  guardSlotCapacity,
  guardL2AiCap,
  isValidWarehouseTransition,
  registerWarehouseVertical,
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
              if (table === 'warehouse_slots') {
                const cap = row['capacity_kg'];
                if (!Number.isInteger(cap) || (cap as number) < 0)
                  throw new Error('[P9] capacity_kg must be a non-negative integer');
              }
              if (table === 'warehouse_contracts') {
                const qty = row['quantity_kg'];
                if (!Number.isInteger(qty) || (qty as number) < 0)
                  throw new Error('[P9] quantity_kg must be a non-negative integer');
                const rate = row['daily_rate_kobo'];
                if (!Number.isInteger(rate) || (rate as number) < 0)
                  throw new Error('[P9] daily_rate_kobo must be a non-negative integer (kobo)');
              }
              if (table === 'warehouse_stock_movements') {
                const qty = row['quantity_kg'];
                if (!Number.isInteger(qty) || (qty as number) < 0)
                  throw new Error('[P9] quantity_kg must be a non-negative integer');
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
describe('WarehouseRepository', () => {
  let repo: WarehouseRepository;
  beforeEach(() => { repo = new WarehouseRepository(makeDb() as never); });

  it('T001 — createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', warehouseName: 'Apapa Logistics Hub', state: 'Lagos', lga: 'Apapa' });
    expect(p.status).toBe('seeded');
    expect(p.warehouseName).toBe('Apapa Logistics Hub');
  });

  it('T002 — createProfile T3: null for wrong tenant', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', warehouseName: 'Hub A', state: 'Kano', lga: 'Kano Municipal' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — guardSeedToClaimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T004 — guardClaimedToCacVerified requires CAC number', () => {
    expect(guardClaimedToCacVerified({ cacNumber: null }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacNumber: 'RC-445566' }).allowed).toBe(true);
  });

  it('T005 — guardCacVerifiedToSonCertified requires SON or NAFDAC cert', () => {
    expect(guardCacVerifiedToSonCertified({ sonCert: null, nafdacCert: null }).allowed).toBe(false);
    expect(guardCacVerifiedToSonCertified({ sonCert: 'SON-WH-001', nafdacCert: null }).allowed).toBe(true);
    expect(guardCacVerifiedToSonCertified({ sonCert: null, nafdacCert: 'NAFDAC-WH-002' }).allowed).toBe(true);
  });

  it('T006 — isValidWarehouseTransition validates FSM', () => {
    expect(isValidWarehouseTransition('seeded', 'claimed')).toBe(true);
    expect(isValidWarehouseTransition('claimed', 'cac_verified')).toBe(true);
    expect(isValidWarehouseTransition('cac_verified', 'son_certified')).toBe(true);
    expect(isValidWarehouseTransition('son_certified', 'active')).toBe(true);
    expect(isValidWarehouseTransition('active', 'suspended')).toBe(true);
    expect(isValidWarehouseTransition('suspended', 'active')).toBe(true);
  });

  it('T007 — isValidWarehouseTransition rejects invalid jumps', () => {
    expect(isValidWarehouseTransition('seeded', 'active')).toBe(false);
    expect(isValidWarehouseTransition('active', 'seeded')).toBe(false);
    expect(isValidWarehouseTransition('cac_verified', 'active')).toBe(false); // must go through son_certified
  });

  it('T008 — transitionProfile updates FSM status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', warehouseName: 'Delta Store', state: 'Delta', lga: 'Warri' });
    const updated = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(updated?.status).toBe('claimed');
  });

  it('T009 — guardIntegerKg fails for fractional and negative values', () => {
    expect(guardIntegerKg(100.5).allowed).toBe(false);
    expect(guardIntegerKg(-50).allowed).toBe(false);
  });

  it('T010 — guardIntegerKg passes for valid integers', () => {
    expect(guardIntegerKg(0).allowed).toBe(true);
    expect(guardIntegerKg(10000).allowed).toBe(true);
  });

  it('T011 — guardIntegerKobo fails for fractional kobo (P9)', () => {
    expect(guardIntegerKobo(500.5).allowed).toBe(false);
    expect(guardIntegerKobo(-1).allowed).toBe(false);
  });

  it('T012 — guardSlotCapacity allows quantity ≤ slot capacity', () => {
    expect(guardSlotCapacity({ slotCapacityKg: 1000, requestedKg: 800 }).allowed).toBe(true);
    expect(guardSlotCapacity({ slotCapacityKg: 1000, requestedKg: 1000 }).allowed).toBe(true);
  });

  it('T013 — guardSlotCapacity rejects quantity exceeding slot capacity', () => {
    const r = guardSlotCapacity({ slotCapacityKg: 500, requestedKg: 600 });
    expect(r.allowed).toBe(false);
    if (!r.allowed) { expect(r.reason).toContain('500kg'); }
  });

  it('T014 — guardL2AiCap blocks L3_HITL (ADL-010)', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
  });

  it('T015 — guardL2AiCap passes for L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });

  it('T016 — createSlot with valid integer capacityKg', async () => {
    const slot = await repo.createSlot({ warehouseId: 'wh1', tenantId: 'tn1', slotCode: 'A-01', capacityKg: 5000 });
    expect(slot.capacityKg).toBe(5000);
    expect(slot.currentOccupancyKg).toBe(0);
    expect(slot.status).toBe('available');
    expect(slot.slotCode).toBe('A-01');
  });

  it('T017 — createSlot rejects fractional capacityKg (P9)', async () => {
    await expect(repo.createSlot({ warehouseId: 'wh1', tenantId: 'tn1', slotCode: 'B-01', capacityKg: 500.5 })).rejects.toThrow('[P9]');
  });

  it('T018 — createSlot T3 isolation', async () => {
    const slot = await repo.createSlot({ warehouseId: 'wh1', tenantId: 'tn-a', slotCode: 'C-01', capacityKg: 2000 });
    expect(await repo.findSlotById(slot.id, 'tn-b')).toBeNull();
  });

  it('T019 — updateSlotStatus sets to occupied', async () => {
    const slot = await repo.createSlot({ warehouseId: 'wh1', tenantId: 'tn1', slotCode: 'D-01', capacityKg: 3000 });
    const updated = await repo.updateSlotStatus(slot.id, 'tn1', 'occupied');
    expect(updated?.status).toBe('occupied');
  });

  it('T020 — createContract with valid integer quantityKg and dailyRateKobo', async () => {
    const contract = await repo.createContract({ warehouseId: 'wh1', slotId: 's1', tenantId: 'tn1', clientPhone: '08100000001', commodityType: 'Rice', quantityKg: 1000, dailyRateKobo: 5000, startDate: 1700000000 });
    expect(contract.quantityKg).toBe(1000);
    expect(contract.dailyRateKobo).toBe(5000);
    expect(contract.status).toBe('active');
    expect(contract.totalBilledKobo).toBe(0);
  });

  it('T021 — createContract rejects fractional quantityKg (P9)', async () => {
    await expect(repo.createContract({ warehouseId: 'wh1', slotId: 's1', tenantId: 'tn1', clientPhone: '08100000002', commodityType: 'Beans', quantityKg: 500.5, dailyRateKobo: 3000, startDate: 1700000000 })).rejects.toThrow('[P9]');
  });

  it('T022 — createContract rejects fractional dailyRateKobo (P9)', async () => {
    await expect(repo.createContract({ warehouseId: 'wh1', slotId: 's1', tenantId: 'tn1', clientPhone: '08100000003', commodityType: 'Maize', quantityKg: 800, dailyRateKobo: 4500.5, startDate: 1700000000 })).rejects.toThrow('[P9]');
  });

  it('T023 — findContractById T3 isolation', async () => {
    const c = await repo.createContract({ warehouseId: 'wh1', slotId: 's1', tenantId: 'tn-p', clientPhone: '08100000004', commodityType: 'Sorghum', quantityKg: 500, dailyRateKobo: 2000, startDate: 1700000000 });
    expect(await repo.findContractById(c.id, 'tn-q')).toBeNull();
  });

  it('T024 — terminateContract sets status to terminated', async () => {
    const c = await repo.createContract({ warehouseId: 'wh1', slotId: 's1', tenantId: 'tn1', clientPhone: '08100000005', commodityType: 'Cassava', quantityKg: 300, dailyRateKobo: 1500, startDate: 1700000000 });
    const terminated = await repo.terminateContract(c.id, 'tn1');
    expect(terminated?.status).toBe('terminated');
  });

  it('T025 — createMovement inbound with valid integer quantityKg', async () => {
    const movement = await repo.createMovement({ contractId: 'c1', tenantId: 'tn1', movementType: 'inbound', quantityKg: 500, movementDate: 1700000000 });
    expect(movement.movementType).toBe('inbound');
    expect(movement.quantityKg).toBe(500);
  });

  it('T026 — createMovement outbound with notes', async () => {
    const movement = await repo.createMovement({ contractId: 'c1', tenantId: 'tn1', movementType: 'outbound', quantityKg: 200, movementDate: 1700001000, notes: 'Partial dispatch to buyer' });
    expect(movement.movementType).toBe('outbound');
    expect(movement.notes).toBe('Partial dispatch to buyer');
  });

  it('T027 — createMovement rejects fractional quantityKg (P9)', async () => {
    await expect(repo.createMovement({ contractId: 'c1', tenantId: 'tn1', movementType: 'inbound', quantityKg: 100.5, movementDate: 1700000000 })).rejects.toThrow('[P9]');
  });

  it('T028 — findMovementById T3 isolation', async () => {
    const m = await repo.createMovement({ contractId: 'c1', tenantId: 'tn-x', movementType: 'inbound', quantityKg: 200, movementDate: 1700000000 });
    expect(await repo.findMovementById(m.id, 'tn-y')).toBeNull();
  });

  it('T029 — updateProfile changes warehouseName', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', warehouseName: 'Old Hub', state: 'Lagos', lga: 'Ojo' });
    const updated = await repo.updateProfile(p.id, 'tn1', { warehouseName: 'New Hub' });
    expect(updated?.warehouseName).toBe('New Hub');
  });

  it('T030 — createProfile stores sonCert when provided', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', warehouseName: 'Certified Store', state: 'Oyo', lga: 'Ibadan', sonCert: 'SON-2024-WH-001' });
    expect(p.sonCert).toBe('SON-2024-WH-001');
  });

  it('T031 — registerWarehouseVertical returns correct metadata', () => {
    const meta = registerWarehouseVertical();
    expect(meta.slug).toBe('warehouse');
    expect(meta.milestone).toBe('M10');
    expect(meta.ai_autonomy_level).toBe(2);
    expect(meta.primary_pillars).toContain('ops');
  });

  it('T032 — findProfilesByWorkspace T3 isolation', async () => {
    await repo.createProfile({ workspaceId: 'ws-iso', tenantId: 'tn-iso', warehouseName: 'Isolated Hub', state: 'Abuja', lga: 'Gwagwalada' });
    const list = await repo.findProfilesByWorkspace('ws-iso', 'tn-other');
    expect(list.length).toBe(0);
  });
});
