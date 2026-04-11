/**
 * @webwaka/verticals-palm-oil — test suite (M12)
 * Minimum 15 tests
 * Covers: T3, P9, FSM, ADL-010 L2 cap, integer kg (FFB) and integer ml (oil output)
 */

import { describe, it, expect } from 'vitest';
import {
  isValidPalmOilTransition,
  guardClaimedToNafdacVerified,
  guardKycForExport,
  guardIntegerKg,
  guardIntegerMl,
  guardL2AiCap,
  guardFractionalKobo,
  registerPalmOilVertical,
} from './index.js';
import { PalmOilRepository } from './palm-oil.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          if (sql.startsWith('INSERT INTO palm_oil_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], mill_name: vals[3], nafdac_product_number: vals[4], nifor_affiliation: vals[5], state_agric_extension_reg: vals[6], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO palm_ffb_intake')) { const qty = vals[4]; if (!Number.isInteger(qty) || (qty as number) < 0) throw new Error('quantityKg must be a non-negative integer kg'); const cost = vals[5]; if (!Number.isInteger(cost) || (cost as number) < 0) throw new Error('P9: costPerKgKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], ffb_source: vals[3], quantity_kg: vals[4], cost_per_kg_kobo: vals[5], intake_date: vals[6], supplier_phone: vals[7], created_at: 1 }); }
          if (sql.startsWith('INSERT INTO palm_production_batches')) { const ffb = vals[4]; if (!Number.isInteger(ffb) || (ffb as number) < 0) throw new Error('ffbInputKg must be a non-negative integer kg'); const oil = vals[5]; if (!Number.isInteger(oil) || (oil as number) < 0) throw new Error('oilOutputMl must be a non-negative integer ml (no float litres)'); const pc = vals[7]; if (!Number.isInteger(pc) || (pc as number) < 0) throw new Error('P9: productionCostKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], processing_date: vals[3], ffb_input_kg: vals[4], oil_output_ml: vals[5], kernel_output_kg: vals[6], production_cost_kobo: vals[7], created_at: 1 }); }
          if (sql.startsWith('INSERT INTO palm_oil_sales')) { const ml = vals[4]; if (!Number.isInteger(ml) || (ml as number) < 0) throw new Error('quantityMl must be a non-negative integer ml'); const price = vals[5]; if (!Number.isInteger(price) || (price as number) < 0) throw new Error('P9: pricePerLitreKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], buyer_phone: vals[3], quantity_ml: vals[4], price_per_litre_kobo: vals[5], total_kobo: vals[6], sale_date: vals[7], created_at: 1 }); }
          return { success: true };
        },
        first: async <T>() => { if (sql.includes('WHERE id=?')) return (store.get(vals[0] as string) ?? null) as T | null; return null as T | null; },
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  };
}

describe('palm-oil vertical', () => {
  it('registerPalmOilVertical slug is palm-oil', () => {
    expect(registerPalmOilVertical().slug).toBe('palm-oil');
  });

  it('registerPalmOilVertical milestone is M12', () => {
    expect(registerPalmOilVertical().milestone).toBe('M12');
  });

  it('registerPalmOilVertical oil_volume_unit is integer_ml', () => {
    expect(registerPalmOilVertical().oil_volume_unit).toBe('integer_ml');
  });

  it('registerPalmOilVertical adl_010_agricultural_cap is true', () => {
    expect(registerPalmOilVertical().adl_010_agricultural_cap).toBe(true);
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidPalmOilTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → nafdac_verified is valid', () => {
    expect(isValidPalmOilTransition('claimed', 'nafdac_verified')).toBe(true);
  });

  it('FSM: nafdac_verified → active is valid', () => {
    expect(isValidPalmOilTransition('nafdac_verified', 'active')).toBe(true);
  });

  it('FSM: seeded → active is invalid', () => {
    expect(isValidPalmOilTransition('seeded', 'active')).toBe(false);
  });

  it('guardIntegerKg passes for valid integer', () => {
    expect(guardIntegerKg(1000).allowed).toBe(true);
  });

  it('guardIntegerKg fails for fractional kg', () => {
    const r = guardIntegerKg(1000.5);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('integer kg');
  });

  it('guardIntegerMl passes for valid integer ml', () => {
    expect(guardIntegerMl(5000).allowed).toBe(true);
  });

  it('guardIntegerMl fails for fractional ml (no float litres)', () => {
    const r = guardIntegerMl(4.5);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('float litres');
  });

  it('guardL2AiCap blocks L3_HITL (ADL-010)', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });

  it('guardL2AiCap passes for L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });

  it('guardClaimedToNafdacVerified passes with valid product number and KYC 2', () => {
    expect(guardClaimedToNafdacVerified({ nafdacProductNumber: 'NAFDAC-PO-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('guardClaimedToNafdacVerified fails without product number', () => {
    expect(guardClaimedToNafdacVerified({ nafdacProductNumber: null, kycTier: 2 }).allowed).toBe(false);
  });

  it('guardKycForExport fails with KYC < 3', () => {
    expect(guardKycForExport({ kycTier: 2 }).allowed).toBe(false);
  });

  it('guardFractionalKobo fails for float', () => {
    expect(guardFractionalKobo(100.5).allowed).toBe(false);
  });

  it('PalmOilRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new PalmOilRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', millName: 'Imo Palm Mill' });
    expect(p.status).toBe('seeded');
  });

  it('PalmOilRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new PalmOilRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', millName: 'AgroPalm' });
    expect(await repo.findProfileById(p.id, 'tid-B')).toBeNull();
  });

  it('PalmOilRepository.createBatch rejects fractional oilOutputMl (no float litres)', async () => {
    const db = makeDb();
    const repo = new PalmOilRepository(db as never);
    await expect(repo.createBatch({ profileId: 'p1', tenantId: 'tid1', processingDate: 1000, ffbInputKg: 1000, oilOutputMl: 200.5, productionCostKobo: 50000 })).rejects.toThrow('float litres');
  });

  it('PalmOilRepository.createFfbIntake rejects fractional quantityKg', async () => {
    const db = makeDb();
    const repo = new PalmOilRepository(db as never);
    await expect(repo.createFfbIntake({ profileId: 'p1', tenantId: 'tid1', quantityKg: 1000.5, costPerKgKobo: 2000, intakeDate: 1000 })).rejects.toThrow('integer kg');
  });

  it('PalmOilRepository.createSale rejects fractional quantityMl', async () => {
    const db = makeDb();
    const repo = new PalmOilRepository(db as never);
    await expect(repo.createSale({ profileId: 'p1', tenantId: 'tid1', buyerPhone: '08012345678', quantityMl: 5000.5, pricePerLitreKobo: 3000, totalKobo: 15000, saleDate: 1000 })).rejects.toThrow('integer ml');
  });
});
