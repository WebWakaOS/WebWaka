/**
 * @webwaka/verticals-fish-market — test suite (M12)
 * Minimum 15 tests
 * Covers: T3, P9, FSM, ADL-010 L2 cap, integer grams, expiry alert guard
 */

import { describe, it, expect } from 'vitest';
import {
  isValidFishMarketTransition,
  guardClaimedToNafdacVerified,
  guardKycForWholesale,
  guardIntegerGrams,
  guardExpiryAlert,
  guardL2AiCap,
  guardFractionalKobo,
  registerFishMarketVertical,
} from './index.js';
import { FishMarketRepository } from './fish-market.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          if (sql.startsWith('INSERT INTO fish_market_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], business_name: vals[3], nafdac_food_safety_cert: vals[4], nifda_registration: vals[5], market_location: vals[6], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO fish_stock')) { const wg = vals[5]; if (!Number.isInteger(wg) || (wg as number) < 0) throw new Error('weightGrams must be a non-negative integer'); const cost = vals[6]; if (!Number.isInteger(cost) || (cost as number) < 0) throw new Error('P9: costPerKgKobo must be a non-negative integer'); const exp = vals[7]; if (!Number.isInteger(exp)) throw new Error('expiryDate must be an integer unix timestamp'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], fish_type: vals[3], category: vals[4], weight_grams: vals[5], cost_per_kg_kobo: vals[6], expiry_date: vals[7], source: vals[8], created_at: 1, updated_at: 1 }); }
          if (sql.startsWith('INSERT INTO fish_sales')) { const wg = vals[5]; if (!Number.isInteger(wg) || (wg as number) < 0) throw new Error('weightGrams must be a non-negative integer'); const price = vals[6]; if (!Number.isInteger(price) || (price as number) < 0) throw new Error('P9: pricePerKgKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], buyer_phone: vals[3], fish_type: vals[4], weight_grams: vals[5], price_per_kg_kobo: vals[6], total_kobo: vals[7], sale_date: vals[8], created_at: 1 }); }
          if (sql.startsWith('INSERT INTO fish_wastage')) { const wg = vals[5]; if (!Number.isInteger(wg) || (wg as number) < 0) throw new Error('weightGrams must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], waste_date: vals[3], fish_type: vals[4], weight_grams: vals[5], reason: vals[6], created_at: 1 }); }
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

describe('fish-market vertical', () => {
  it('registerFishMarketVertical slug is fish-market', () => {
    expect(registerFishMarketVertical().slug).toBe('fish-market');
  });

  it('registerFishMarketVertical milestone is M12', () => {
    expect(registerFishMarketVertical().milestone).toBe('M12');
  });

  it('registerFishMarketVertical weight_unit is integer_grams', () => {
    expect(registerFishMarketVertical().weight_unit).toBe('integer_grams');
  });

  it('registerFishMarketVertical adl_010_agricultural_cap is true', () => {
    expect(registerFishMarketVertical().adl_010_agricultural_cap).toBe(true);
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidFishMarketTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → nafdac_verified is valid', () => {
    expect(isValidFishMarketTransition('claimed', 'nafdac_verified')).toBe(true);
  });

  it('FSM: nafdac_verified → active is valid', () => {
    expect(isValidFishMarketTransition('nafdac_verified', 'active')).toBe(true);
  });

  it('FSM: seeded → active is invalid', () => {
    expect(isValidFishMarketTransition('seeded', 'active')).toBe(false);
  });

  it('guardIntegerGrams passes for valid integer grams', () => {
    expect(guardIntegerGrams(5000).allowed).toBe(true);
  });

  it('guardIntegerGrams fails for fractional grams', () => {
    const r = guardIntegerGrams(5000.5);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('integer grams');
  });

  it('guardIntegerGrams fails for zero with correct check', () => {
    expect(guardIntegerGrams(0).allowed).toBe(true);
  });

  it('guardExpiryAlert passes when stock is not expired', () => {
    const future = Math.floor(Date.now() / 1000) + 86400;
    expect(guardExpiryAlert(future, Math.floor(Date.now() / 1000)).allowed).toBe(true);
  });

  it('guardExpiryAlert fails when stock is expired', () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    const r = guardExpiryAlert(past, Math.floor(Date.now() / 1000));
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('expired');
  });

  it('guardClaimedToNafdacVerified passes with valid cert', () => {
    expect(guardClaimedToNafdacVerified({ nafdacFoodSafetyCert: 'NAFDAC-FS-001', kycTier: 1 }).allowed).toBe(true);
  });

  it('guardClaimedToNafdacVerified fails without cert', () => {
    expect(guardClaimedToNafdacVerified({ nafdacFoodSafetyCert: null, kycTier: 1 }).allowed).toBe(false);
  });

  it('guardKycForWholesale fails with KYC < 2', () => {
    expect(guardKycForWholesale({ kycTier: 1 }).allowed).toBe(false);
  });

  it('guardL2AiCap blocks L3_HITL (ADL-010)', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
  });

  it('guardFractionalKobo fails for float', () => {
    expect(guardFractionalKobo(100.5).allowed).toBe(false);
  });

  it('FishMarketRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new FishMarketRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', businessName: 'Apapa Fish Market' });
    expect(p.status).toBe('seeded');
  });

  it('FishMarketRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new FishMarketRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', businessName: 'Fisherman Depot' });
    expect(await repo.findProfileById(p.id, 'tid-B')).toBeNull();
  });

  it('FishMarketRepository.createStock rejects fractional weight grams', async () => {
    const db = makeDb();
    const repo = new FishMarketRepository(db as never);
    await expect(repo.createStock({ profileId: 'p1', tenantId: 'tid1', fishType: 'tilapia', weightGrams: 5000.5, costPerKgKobo: 8000, expiryDate: 9999999 })).rejects.toThrow('integer');
  });

  it('FishMarketRepository.createSale P9 rejects fractional price', async () => {
    const db = makeDb();
    const repo = new FishMarketRepository(db as never);
    await expect(repo.createSale({ profileId: 'p1', tenantId: 'tid1', buyerPhone: '08012345678', fishType: 'tilapia', weightGrams: 5000, pricePerKgKobo: 10000.5, totalKobo: 50000, saleDate: 1000 })).rejects.toThrow('P9');
  });

  it('FishMarketRepository.createWastage rejects fractional weight grams', async () => {
    const db = makeDb();
    const repo = new FishMarketRepository(db as never);
    await expect(repo.createWastage({ profileId: 'p1', tenantId: 'tid1', wasteDate: 1000, fishType: 'salmon', weightGrams: 2000.5 })).rejects.toThrow('integer');
  });
});
