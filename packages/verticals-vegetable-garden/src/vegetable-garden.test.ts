/**
 * @webwaka/verticals-vegetable-garden — test suite (M12)
 * Minimum 15 tests
 * Covers: T3, P9, FSM (3-state), ADL-010 L2 cap, integer grams, integer sqm
 */

import { describe, it, expect } from 'vitest';
import {
  isValidVegetableGardenTransition,
  guardClaimedToActive,
  guardKycForBulkContract,
  guardL2AiCap,
  guardIntegerGrams,
  guardIntegerSqm,
  guardFractionalKobo,
  registerVegetableGardenVertical,
} from './index.js';
import { VegetableGardenRepository } from './vegetable-garden.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        // eslint-disable-next-line @typescript-eslint/require-await
        run: async () => {
          if (sql.startsWith('INSERT INTO vegetable_garden_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], farm_name: vals[3], state_agric_reg: vals[4], fmard_extension_code: vals[5], plot_count: vals[6], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO farm_plots')) { const sqm = vals[4]; if (!Number.isInteger(sqm) || (sqm as number) <= 0) throw new Error('areaSqm must be a positive integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], plot_name: vals[3], area_sqm: vals[4], crop_type: vals[5], planting_date: vals[6], expected_harvest_date: vals[7], status: 'growing', created_at: 1, updated_at: 1 }); }
          if (sql.startsWith('INSERT INTO farm_inputs')) { const grams = vals[5]; if (!Number.isInteger(grams) || (grams as number) < 0) throw new Error('quantityGrams must be a non-negative integer'); const cost = vals[6]; if (!Number.isInteger(cost) || (cost as number) < 0) throw new Error('P9: costKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], plot_id: vals[3], input_type: vals[4], quantity_grams: vals[5], cost_kobo: vals[6], input_date: vals[7], created_at: 1 }); }
          if (sql.startsWith('INSERT INTO farm_harvests')) { const wg = vals[5]; if (!Number.isInteger(wg) || (wg as number) < 0) throw new Error('weightGrams must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], plot_id: vals[3], harvest_date: vals[4], weight_grams: vals[5], crop_type: vals[6], created_at: 1 }); }
          if (sql.startsWith('INSERT INTO farm_sales')) { const wg = vals[5]; if (!Number.isInteger(wg) || (wg as number) < 0) throw new Error('weightGrams must be a non-negative integer'); const price = vals[6]; if (!Number.isInteger(price) || (price as number) < 0) throw new Error('P9: pricePerKgKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], buyer_phone: vals[3], crop_type: vals[4], weight_grams: vals[5], price_per_kg_kobo: vals[6], total_kobo: vals[7], sale_date: vals[8], created_at: 1 }); }
          return { success: true };
        },
        // eslint-disable-next-line @typescript-eslint/require-await
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
        // eslint-disable-next-line @typescript-eslint/require-await
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  };
}

describe('vegetable-garden vertical', () => {
  it('registerVegetableGardenVertical slug is vegetable-garden', () => {
    expect(registerVegetableGardenVertical().slug).toBe('vegetable-garden');
  });

  it('registerVegetableGardenVertical milestone is M12', () => {
    expect(registerVegetableGardenVertical().milestone).toBe('M12');
  });

  it('registerVegetableGardenVertical fsm_informal_3state is true', () => {
    expect(registerVegetableGardenVertical().fsm_informal_3state).toBe(true);
  });

  it('registerVegetableGardenVertical regulatory_gate is null (informal, FMARD optional)', () => {
    expect(registerVegetableGardenVertical().regulatory_gate).toBeNull();
  });

  it('registerVegetableGardenVertical weight_unit is integer_grams', () => {
    expect(registerVegetableGardenVertical().weight_unit).toBe('integer_grams');
  });

  it('FSM: seeded → claimed is valid (3-state)', () => {
    expect(isValidVegetableGardenTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → active is valid (3-state)', () => {
    expect(isValidVegetableGardenTransition('claimed', 'active')).toBe(true);
  });

  it('FSM: active → anything is invalid (terminal state)', () => {
    expect(isValidVegetableGardenTransition('active', 'seeded')).toBe(false);
    expect(isValidVegetableGardenTransition('active', 'claimed')).toBe(false);
  });

  it('FSM: seeded → active is invalid (no skip)', () => {
    expect(isValidVegetableGardenTransition('seeded', 'active')).toBe(false);
  });

  it('guardClaimedToActive passes with KYC 1', () => {
    expect(guardClaimedToActive({ kycTier: 1 }).allowed).toBe(true);
  });

  it('guardClaimedToActive fails with KYC < 1', () => {
    expect(guardClaimedToActive({ kycTier: 0 }).allowed).toBe(false);
  });

  it('guardKycForBulkContract fails with KYC < 2', () => {
    expect(guardKycForBulkContract({ kycTier: 1 }).allowed).toBe(false);
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

  it('guardIntegerGrams passes for valid integer grams', () => {
    expect(guardIntegerGrams(5000).allowed).toBe(true);
  });

  it('guardIntegerGrams fails for fractional grams', () => {
    expect(guardIntegerGrams(5000.5).allowed).toBe(false);
  });

  it('guardIntegerSqm passes for valid positive integer sqm', () => {
    expect(guardIntegerSqm(100).allowed).toBe(true);
  });

  it('guardIntegerSqm fails for zero area', () => {
    expect(guardIntegerSqm(0).allowed).toBe(false);
  });

  it('guardIntegerSqm fails for fractional sqm', () => {
    expect(guardIntegerSqm(100.5).allowed).toBe(false);
  });

  it('guardFractionalKobo fails for float', () => {
    expect(guardFractionalKobo(100.5).allowed).toBe(false);
  });

  it('VegetableGardenRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new VegetableGardenRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', farmName: 'Sunset Farm' });
    expect(p.status).toBe('seeded');
  });

  it('VegetableGardenRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new VegetableGardenRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', farmName: 'GreenHarvest' });
    expect(await repo.findProfileById(p.id, 'tid-B')).toBeNull();
  });

  it('VegetableGardenRepository.createPlot rejects fractional areaSqm', async () => {
    const db = makeDb();
    const repo = new VegetableGardenRepository(db as never);
    await expect(repo.createPlot({ profileId: 'p1', tenantId: 'tid1', plotName: 'Plot A', areaSqm: 100.5, cropType: 'tomato' })).rejects.toThrow('positive integer');
  });

  it('VegetableGardenRepository.createHarvest rejects fractional weightGrams', async () => {
    const db = makeDb();
    const repo = new VegetableGardenRepository(db as never);
    await expect(repo.createHarvest({ profileId: 'p1', tenantId: 'tid1', plotId: 'pl1', harvestDate: 1000, weightGrams: 5000.5, cropType: 'tomato' })).rejects.toThrow('integer');
  });

  it('VegetableGardenRepository.createSale P9 rejects fractional pricePerKgKobo', async () => {
    const db = makeDb();
    const repo = new VegetableGardenRepository(db as never);
    await expect(repo.createSale({ profileId: 'p1', tenantId: 'tid1', buyerPhone: '08012345678', cropType: 'tomato', weightGrams: 5000, pricePerKgKobo: 1500.5, totalKobo: 7500, saleDate: 1000 })).rejects.toThrow('P9');
  });
});
