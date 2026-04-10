/**
 * @webwaka/verticals-cold-room — test suite (M10)
 * Minimum 15 tests
 * Covers: T3, P9, FSM, ADL-010 L2 cap, integer temperature (millidegrees), integer capacity (kg)
 */

import { describe, it, expect } from 'vitest';
import {
  isValidColdRoomTransition,
  guardClaimedToNafdacVerified,
  guardKycForBulkCollateral,
  guardIntegerTemperature,
  guardIntegerCapacity,
  guardL2AiCap,
  guardFractionalKobo,
  registerColdRoomVertical,
} from './index.js';
import { ColdRoomRepository } from './cold-room.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          if (sql.startsWith('INSERT INTO cold_room_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], facility_name: vals[3], nafdac_cold_chain_cert: vals[4], son_cert: vals[5], capacity_kg: vals[6], cac_rc: vals[7], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO cold_room_units')) { const cap = vals[4]; if (!Number.isInteger(cap) || (cap as number) < 0) throw new Error('Capacity must be a non-negative integer kg'); const temp = vals[5]; if (!Number.isInteger(temp)) throw new Error('Temperature must be an integer millidegrees Celsius'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], unit_number: vals[3], capacity_kg: vals[4], current_temp_mc: vals[5], status: 'active', created_at: 1, updated_at: 1 }); }
          if (sql.startsWith('INSERT INTO cold_storage_agreements')) { const rate = vals[6]; if (!Number.isInteger(rate) || (rate as number) < 0) throw new Error('P9: dailyRateKobo must be a non-negative integer'); const qty = vals[5]; if (!Number.isInteger(qty) || (qty as number) < 0) throw new Error('quantityKg must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], client_phone: vals[3], commodity_type: vals[4], quantity_kg: vals[5], daily_rate_kobo: vals[6], entry_date: vals[7], exit_date: null, total_charged_kobo: 0, status: 'active', created_at: 1, updated_at: 1 }); }
          if (sql.startsWith('INSERT INTO cold_temp_log')) { const temp = vals[5]; if (!Number.isInteger(temp)) throw new Error('Temperature must be an integer millidegrees Celsius (no floats)'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], unit_id: vals[3], log_time: vals[4], temperature_mc: vals[5], alert_flag: vals[6], created_at: 1 }); }
          return { success: true };
        },
        first: async <T>() => {
          if (sql.includes('WHERE id=?')) {
            const record = store.get(vals[0] as string) ?? null;
            if (record === null) return null as T | null;
            if (sql.includes('tenant_id=?') || sql.includes('AND tenant_id')) {
              const row = record as Record<string, unknown>;
              if (row['tenant_id'] !== vals[1]) return null as T | null;
            }
            return record as T | null;
          }
          return null as T | null;
        },
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  };
}

describe('cold-room vertical', () => {
  it('registerColdRoomVertical slug is cold-room', () => {
    expect(registerColdRoomVertical().slug).toBe('cold-room');
  });

  it('registerColdRoomVertical milestone is M10', () => {
    expect(registerColdRoomVertical().milestone).toBe('M10');
  });

  it('registerColdRoomVertical temperature_unit is millidegrees_celsius', () => {
    expect(registerColdRoomVertical().temperature_unit).toBe('millidegrees_celsius');
  });

  it('registerColdRoomVertical adl_010_agricultural_cap is true', () => {
    expect(registerColdRoomVertical().adl_010_agricultural_cap).toBe(true);
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidColdRoomTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → nafdac_verified is valid', () => {
    expect(isValidColdRoomTransition('claimed', 'nafdac_verified')).toBe(true);
  });

  it('FSM: nafdac_verified → active is valid', () => {
    expect(isValidColdRoomTransition('nafdac_verified', 'active')).toBe(true);
  });

  it('FSM: seeded → active is invalid', () => {
    expect(isValidColdRoomTransition('seeded', 'active')).toBe(false);
  });

  it('guardIntegerTemperature passes for integer millidegrees (0°C = 0)', () => {
    expect(guardIntegerTemperature(0).allowed).toBe(true);
  });

  it('guardIntegerTemperature passes for negative integer (-2°C = -2000)', () => {
    expect(guardIntegerTemperature(-2000).allowed).toBe(true);
  });

  it('guardIntegerTemperature fails for float temperature (no floats allowed)', () => {
    const r = guardIntegerTemperature(2500.5);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('integer millidegrees');
  });

  it('guardIntegerCapacity passes for valid integer kg', () => {
    expect(guardIntegerCapacity(5000).allowed).toBe(true);
  });

  it('guardIntegerCapacity fails for fractional kg', () => {
    expect(guardIntegerCapacity(500.5).allowed).toBe(false);
  });

  it('guardL2AiCap blocks L3_HITL (ADL-010)', () => {
    const r = guardL2AiCap({ autonomyLevel: 'L3_HITL' });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('ADL-010');
  });

  it('guardL2AiCap passes for L2 autonomy', () => {
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });

  it('guardClaimedToNafdacVerified passes with valid cert and KYC 2', () => {
    expect(guardClaimedToNafdacVerified({ nafdacColdChainCert: 'NAFDAC-CC-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('guardClaimedToNafdacVerified fails without cert', () => {
    expect(guardClaimedToNafdacVerified({ nafdacColdChainCert: null, kycTier: 2 }).allowed).toBe(false);
  });

  it('guardKycForBulkCollateral fails with KYC < 3', () => {
    expect(guardKycForBulkCollateral({ kycTier: 2 }).allowed).toBe(false);
  });

  it('guardFractionalKobo fails for float', () => {
    expect(guardFractionalKobo(100.5).allowed).toBe(false);
  });

  it('ColdRoomRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new ColdRoomRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', facilityName: 'IcePak Cold Room' });
    expect(p.status).toBe('seeded');
  });

  it('ColdRoomRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new ColdRoomRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', facilityName: 'FreshStore' });
    expect(await repo.findProfileById(p.id, 'tid-B')).toBeNull();
  });

  it('ColdRoomRepository.logTemperature rejects float temperature', async () => {
    const db = makeDb();
    const repo = new ColdRoomRepository(db as never);
    await expect(repo.logTemperature({ profileId: 'p1', tenantId: 'tid1', unitId: 'u1', logTime: 1000, temperatureMc: -2000.5 })).rejects.toThrow('integer millidegrees');
  });

  it('ColdRoomRepository.logTemperature accepts integer millidegrees', async () => {
    const db = makeDb();
    const repo = new ColdRoomRepository(db as never);
    const log = await repo.logTemperature({ profileId: 'p1', tenantId: 'tid1', unitId: 'u1', logTime: 1000, temperatureMc: -2000 });
    expect(log.temperatureMc).toBe(-2000);
  });

  it('ColdRoomRepository.createUnit rejects fractional capacity', async () => {
    const db = makeDb();
    const repo = new ColdRoomRepository(db as never);
    await expect(repo.createUnit({ profileId: 'p1', tenantId: 'tid1', unitNumber: 'CR-01', capacityKg: 500.5 })).rejects.toThrow('non-negative integer kg');
  });
});
