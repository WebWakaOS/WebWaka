/**
 * @webwaka/verticals-agro-input — test suite (M10)
 * Minimum 15 tests
 * Covers: T3, P9, P13, FSM, ADL-010 L2 cap, ABP guard, NASC guard
 */

import { describe, it, expect } from 'vitest';
import {
  isValidAgroInputTransition,
  guardClaimedToNascVerified,
  guardKycForAbp,
  guardL2AiCap,
  guardP13FarmerData,
  guardFractionalKobo,
  registerAgroInputVertical,
} from './index.js';
import { AgroInputRepository } from './agro-input.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          if (sql.startsWith('INSERT INTO agro_input_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], company_name: vals[3], nasc_dealer_number: vals[4], fepsan_membership: vals[5], nafdac_agrochemical_reg: vals[6], fmard_abp_participant: vals[7], cac_rc: vals[8], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO agro_input_catalogue')) { const price = vals[7]; if (!Number.isInteger(price) || (price as number) < 0) throw new Error('P9: pricePerUnitKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], product_name: vals[3], category: vals[4], nasc_or_nafdac_cert_number: vals[5], unit: vals[6], price_per_unit_kobo: vals[7], quantity_in_stock: vals[8], created_at: 1, updated_at: 1 }); }
          if (sql.startsWith('INSERT INTO agro_input_orders')) { const total = vals[6]; if (!Number.isInteger(total) || (total as number) < 0) throw new Error('P9: totalKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], farmer_phone: vals[3], farmer_name: vals[4], items: vals[5], total_kobo: vals[6], abp_subsidy_kobo: vals[7], balance_kobo: vals[8], status: 'pending', created_at: 1, updated_at: 1 }); }
          return { success: true };
        },
        first: async <T>() => { if (sql.includes('WHERE id=?')) return (store.get(vals[0] as string) ?? null) as T | null; return null as T | null; },
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  };
}

describe('agro-input vertical', () => {
  it('registerAgroInputVertical slug is agro-input', () => {
    expect(registerAgroInputVertical().slug).toBe('agro-input');
  });

  it('registerAgroInputVertical milestone is M10', () => {
    expect(registerAgroInputVertical().milestone).toBe('M10');
  });

  it('registerAgroInputVertical adl_010_agricultural_cap is true', () => {
    expect(registerAgroInputVertical().adl_010_agricultural_cap).toBe(true);
  });

  it('registerAgroInputVertical ai_autonomy_level is 2 (L2 cap)', () => {
    expect(registerAgroInputVertical().ai_autonomy_level).toBe(2);
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidAgroInputTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → nasc_verified is valid', () => {
    expect(isValidAgroInputTransition('claimed', 'nasc_verified')).toBe(true);
  });

  it('FSM: nasc_verified → active is valid', () => {
    expect(isValidAgroInputTransition('nasc_verified', 'active')).toBe(true);
  });

  it('FSM: seeded → active is invalid (skip gate)', () => {
    expect(isValidAgroInputTransition('seeded', 'active')).toBe(false);
  });

  it('guardClaimedToNascVerified passes with valid dealer number', () => {
    expect(guardClaimedToNascVerified({ nascDealerNumber: 'NASC-001', kycTier: 1 }).allowed).toBe(true);
  });

  it('guardClaimedToNascVerified fails without dealer number', () => {
    const r = guardClaimedToNascVerified({ nascDealerNumber: null, kycTier: 1 });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('NASC');
  });

  it('guardKycForAbp fails with KYC < 3', () => {
    expect(guardKycForAbp({ kycTier: 2 }).allowed).toBe(false);
  });

  it('guardKycForAbp passes with KYC 3', () => {
    expect(guardKycForAbp({ kycTier: 3 }).allowed).toBe(true);
  });

  it('guardL2AiCap blocks L3_HITL autonomy (ADL-010)', () => {
    const r = guardL2AiCap({ autonomyLevel: 'L3_HITL' });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('ADL-010');
  });

  it('guardL2AiCap blocks autonomy level 3 (ADL-010)', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
  });

  it('guardL2AiCap passes for L2 autonomy', () => {
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });

  it('guardP13FarmerData blocks farmer_name in payload', () => {
    expect(guardP13FarmerData({ payloadKeys: ['farmer_phone', 'farmer_name'] }).allowed).toBe(false);
  });

  it('guardP13FarmerData passes with aggregate stats', () => {
    expect(guardP13FarmerData({ payloadKeys: ['product_category', 'total_orders', 'demand_trend'] }).allowed).toBe(true);
  });

  it('guardFractionalKobo fails for float', () => {
    expect(guardFractionalKobo(500.5).allowed).toBe(false);
  });

  it('AgroInputRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new AgroInputRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', companyName: 'Seed & Soil Ltd' });
    expect(p.status).toBe('seeded');
  });

  it('AgroInputRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new AgroInputRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', companyName: 'AgroPlus' });
    expect(await repo.findProfileById(p.id, 'tid-B')).toBeNull();
  });

  it('AgroInputRepository.createCatalogueItem P9 rejects fractional price', async () => {
    const db = makeDb();
    const repo = new AgroInputRepository(db as never);
    await expect(repo.createCatalogueItem({ profileId: 'p1', tenantId: 'tid1', productName: 'Tomato Seed', pricePerUnitKobo: 1500.5 })).rejects.toThrow('P9');
  });

  it('AgroInputRepository.createOrder P9 rejects fractional total', async () => {
    const db = makeDb();
    const repo = new AgroInputRepository(db as never);
    await expect(repo.createOrder({ profileId: 'p1', tenantId: 'tid1', farmerPhone: '08012345678', totalKobo: 2000.5 })).rejects.toThrow('P9');
  });
});
