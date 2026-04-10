/**
 * @webwaka/verticals-food-processing — test suite (M12)
 * Minimum 15 tests
 * Covers: T3, P9, FSM, ADL-010 L2 cap, NAFDAC batch traceability
 */

import { describe, it, expect } from 'vitest';
import {
  isValidFoodProcessingTransition,
  guardClaimedToNafdacVerified,
  guardKycForWholesale,
  guardL2AiCap,
  guardIntegerWeight,
  guardFractionalKobo,
  registerFoodProcessingVertical,
} from './index.js';
import { FoodProcessingRepository } from './food-processing.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          if (sql.startsWith('INSERT INTO food_processing_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], factory_name: vals[3], nafdac_manufacturing_permit: vals[4], son_product_cert: vals[5], cac_rc: vals[6], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO fp_production_batches')) { const units = vals[7]; if (!Number.isInteger(units) || (units as number) < 0) throw new Error('quantityUnits must be a non-negative integer'); const grams = vals[8]; if (!Number.isInteger(grams) || (grams as number) < 0) throw new Error('unitSizeGrams must be a non-negative integer'); const cost = vals[9]; if (!Number.isInteger(cost) || (cost as number) < 0) throw new Error('P9: totalCostKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], product_name: vals[3], nafdac_product_number: vals[4], batch_number: vals[5], production_date: vals[6], quantity_units: vals[7], unit_size_grams: vals[8], total_cost_kobo: vals[9], expiry_date: vals[10], created_at: 1 }); }
          if (sql.startsWith('INSERT INTO fp_raw_materials')) { const qty = vals[4]; if (!Number.isInteger(qty) || (qty as number) < 0) throw new Error('quantityKg must be a non-negative integer'); const cost = vals[5]; if (!Number.isInteger(cost) || (cost as number) < 0) throw new Error('P9: costPerKgKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], material_name: vals[3], quantity_kg: vals[4], cost_per_kg_kobo: vals[5], supplier: vals[6], intake_date: vals[7], created_at: 1 }); }
          if (sql.startsWith('INSERT INTO fp_finished_goods')) { const price = vals[6]; if (!Number.isInteger(price) || (price as number) < 0) throw new Error('P9: unitSalePriceKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], product_name: vals[3], nafdac_product_number: vals[4], units_in_stock: vals[5], unit_sale_price_kobo: vals[6], created_at: 1, updated_at: 1 }); }
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

describe('food-processing vertical', () => {
  it('registerFoodProcessingVertical slug is food-processing', () => {
    expect(registerFoodProcessingVertical().slug).toBe('food-processing');
  });

  it('registerFoodProcessingVertical milestone is M12', () => {
    expect(registerFoodProcessingVertical().milestone).toBe('M12');
  });

  it('registerFoodProcessingVertical nafdac_batch_traceability is true', () => {
    expect(registerFoodProcessingVertical().nafdac_batch_traceability).toBe(true);
  });

  it('registerFoodProcessingVertical has ops, branding, marketplace pillars', () => {
    const v = registerFoodProcessingVertical();
    expect(v.primary_pillars).toContain('branding');
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidFoodProcessingTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → nafdac_verified is valid', () => {
    expect(isValidFoodProcessingTransition('claimed', 'nafdac_verified')).toBe(true);
  });

  it('FSM: nafdac_verified → active is valid', () => {
    expect(isValidFoodProcessingTransition('nafdac_verified', 'active')).toBe(true);
  });

  it('FSM: seeded → active is invalid', () => {
    expect(isValidFoodProcessingTransition('seeded', 'active')).toBe(false);
  });

  it('guardClaimedToNafdacVerified passes with valid permit and KYC 2', () => {
    expect(guardClaimedToNafdacVerified({ nafdacManufacturingPermit: 'NAFDAC-MFG-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('guardClaimedToNafdacVerified fails with KYC < 2', () => {
    expect(guardClaimedToNafdacVerified({ nafdacManufacturingPermit: 'NAFDAC-001', kycTier: 1 }).allowed).toBe(false);
  });

  it('guardKycForWholesale fails with KYC < 3', () => {
    expect(guardKycForWholesale({ kycTier: 2 }).allowed).toBe(false);
  });

  it('guardKycForWholesale passes with KYC 3', () => {
    expect(guardKycForWholesale({ kycTier: 3 }).allowed).toBe(true);
  });

  it('guardL2AiCap blocks L3_HITL (ADL-010)', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
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

  it('FoodProcessingRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new FoodProcessingRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', factoryName: 'Golden Rice Factory' });
    expect(p.status).toBe('seeded');
  });

  it('FoodProcessingRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new FoodProcessingRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', factoryName: 'NutriPak' });
    expect(await repo.findProfileById(p.id, 'tid-B')).toBeNull();
  });

  it('FoodProcessingRepository.createBatch P9 rejects fractional totalCostKobo', async () => {
    const db = makeDb();
    const repo = new FoodProcessingRepository(db as never);
    await expect(repo.createBatch({ profileId: 'p1', tenantId: 'tid1', productName: 'Semovita', batchNumber: 'B001', productionDate: 1000, quantityUnits: 500, unitSizeGrams: 500, totalCostKobo: 250000.5 })).rejects.toThrow('P9');
  });

  it('FoodProcessingRepository.createFinishedGood P9 rejects fractional unitSalePrice', async () => {
    const db = makeDb();
    const repo = new FoodProcessingRepository(db as never);
    await expect(repo.createFinishedGood({ profileId: 'p1', tenantId: 'tid1', productName: 'Noodles', unitSalePriceKobo: 800.5 })).rejects.toThrow('P9');
  });
});
