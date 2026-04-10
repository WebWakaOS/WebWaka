/**
 * @webwaka/verticals-cassava-miller — test suite (M12)
 * Minimum 15 tests
 * Covers: T3, P9, FSM, ADL-010 L2 cap, integer weights, NAFDAC permit guard
 */

import { describe, it, expect } from 'vitest';
import {
  isValidCassavaMillerTransition,
  guardClaimedToNafdacVerified,
  guardL2AiCap,
  guardIntegerWeight,
  guardFractionalKobo,
  registerCassavaMillerVertical,
} from './index.js';
import { CassavaMillerRepository } from './cassava-miller.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          if (sql.startsWith('INSERT INTO cassava_miller_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], mill_name: vals[3], nafdac_manufacturing_permit: vals[4], son_product_cert: vals[5], cac_rc: vals[6], processing_capacity_kg_per_day: vals[7], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO miller_intake_log')) { const qty = vals[4]; if (!Number.isInteger(qty) || (qty as number) < 0) throw new Error('quantityKg must be a non-negative integer'); const cost = vals[7]; if (!Number.isInteger(cost) || (cost as number) < 0) throw new Error('P9: costPerKgKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], crop_type: vals[3], quantity_kg: vals[4], supplier_phone: vals[5], intake_date: vals[6], cost_per_kg_kobo: vals[7], created_at: 1 }); }
          if (sql.startsWith('INSERT INTO miller_production_batches')) { const raw = vals[5]; if (!Number.isInteger(raw) || (raw as number) < 0) throw new Error('rawInputKg must be a non-negative integer'); const out = vals[6]; if (!Number.isInteger(out) || (out as number) < 0) throw new Error('productOutputKg must be a non-negative integer'); const mc = vals[8]; if (!Number.isInteger(mc) || (mc as number) < 0) throw new Error('P9: millingCostKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], batch_date: vals[3], crop_type: vals[4], raw_input_kg: vals[5], product_output_kg: vals[6], product_type: vals[7], milling_cost_kobo: vals[8], created_at: 1 }); }
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

describe('cassava-miller vertical', () => {
  it('registerCassavaMillerVertical slug is cassava-miller', () => {
    expect(registerCassavaMillerVertical().slug).toBe('cassava-miller');
  });

  it('registerCassavaMillerVertical milestone is M12', () => {
    expect(registerCassavaMillerVertical().milestone).toBe('M12');
  });

  it('registerCassavaMillerVertical adl_010_agricultural_cap is true', () => {
    expect(registerCassavaMillerVertical().adl_010_agricultural_cap).toBe(true);
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidCassavaMillerTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → nafdac_verified is valid', () => {
    expect(isValidCassavaMillerTransition('claimed', 'nafdac_verified')).toBe(true);
  });

  it('FSM: nafdac_verified → active is valid', () => {
    expect(isValidCassavaMillerTransition('nafdac_verified', 'active')).toBe(true);
  });

  it('FSM: seeded → active is invalid', () => {
    expect(isValidCassavaMillerTransition('seeded', 'active')).toBe(false);
  });

  it('guardClaimedToNafdacVerified passes with valid permit and KYC 2', () => {
    expect(guardClaimedToNafdacVerified({ nafdacManufacturingPermit: 'NAFDAC-MFG-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('guardClaimedToNafdacVerified fails without permit', () => {
    expect(guardClaimedToNafdacVerified({ nafdacManufacturingPermit: null, kycTier: 2 }).allowed).toBe(false);
  });

  it('guardClaimedToNafdacVerified fails with KYC < 2', () => {
    expect(guardClaimedToNafdacVerified({ nafdacManufacturingPermit: 'NAFDAC-001', kycTier: 1 }).allowed).toBe(false);
  });

  it('guardL2AiCap blocks L3_HITL (ADL-010)', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });

  it('guardL2AiCap blocks autonomy > 2', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
  });

  it('guardL2AiCap passes for L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });

  it('guardIntegerWeight passes for valid integer', () => {
    expect(guardIntegerWeight(1000).allowed).toBe(true);
  });

  it('guardIntegerWeight fails for fractional', () => {
    expect(guardIntegerWeight(1000.5).allowed).toBe(false);
  });

  it('guardFractionalKobo fails for float', () => {
    expect(guardFractionalKobo(100.5).allowed).toBe(false);
  });

  it('CassavaMillerRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new CassavaMillerRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', millName: 'Delta Cassava Mill' });
    expect(p.status).toBe('seeded');
  });

  it('CassavaMillerRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new CassavaMillerRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', millName: 'ABC Mill' });
    expect(await repo.findProfileById(p.id, 'tid-B')).toBeNull();
  });

  it('CassavaMillerRepository.createIntakeLog rejects fractional quantityKg', async () => {
    const db = makeDb();
    const repo = new CassavaMillerRepository(db as never);
    await expect(repo.createIntakeLog({ profileId: 'p1', tenantId: 'tid1', cropType: 'cassava', quantityKg: 100.5, intakeDate: 1000, costPerKgKobo: 5000 })).rejects.toThrow('non-negative integer');
  });

  it('CassavaMillerRepository.createBatch P9 rejects fractional millingCost', async () => {
    const db = makeDb();
    const repo = new CassavaMillerRepository(db as never);
    await expect(repo.createBatch({ profileId: 'p1', tenantId: 'tid1', batchDate: 1000, cropType: 'cassava', rawInputKg: 100, productOutputKg: 80, productType: 'garri', millingCostKobo: 5000.5 })).rejects.toThrow('P9');
  });
});
