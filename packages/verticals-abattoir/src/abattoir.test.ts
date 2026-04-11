/**
 * @webwaka/verticals-abattoir — test suite (M12)
 * Minimum 15 tests
 * Covers: T3, P9, FSM, ADL-010 L2 cap, integer weights, integer head counts
 */

import { describe, it, expect } from 'vitest';
import {
  isValidAbattoirTransition,
  guardClaimedToNafdacVerified,
  guardKycForExport,
  guardIntegerWeight,
  guardIntegerHeadCount,
  guardL2AiCap,
  guardFractionalKobo,
  registerAbattoirVertical,
} from './index.js';
import { AbattoirRepository } from './abattoir.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          if (sql.startsWith('INSERT INTO abattoir_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], abattoir_name: vals[3], nafdac_registration: vals[4], nvri_approval: vals[5], state_animal_health_cert: vals[6], cac_rc: vals[7], capacity_head_per_day: vals[8], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO abattoir_slaughter_log')) { const hc = vals[5]; if (!Number.isInteger(hc) || (hc as number) < 0) throw new Error('headCount must be a non-negative integer'); const myk = vals[7]; if (!Number.isInteger(myk) || (myk as number) < 0) throw new Error('meatYieldKg must be a non-negative integer kg'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], slaughter_date: vals[3], animal_type: vals[4], head_count: vals[5], vet_inspected: vals[6], meat_yield_kg: vals[7], created_at: 1 }); }
          if (sql.startsWith('INSERT INTO abattoir_sales')) { const qkg = vals[5]; if (!Number.isInteger(qkg) || (qkg as number) < 0) throw new Error('quantityKg must be a non-negative integer'); const pric = vals[6]; if (!Number.isInteger(pric) || (pric as number) < 0) throw new Error('P9: pricePerKgKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], buyer_phone: vals[3], animal_type: vals[4], quantity_kg: vals[5], price_per_kg_kobo: vals[6], total_kobo: vals[7], sale_date: vals[8], created_at: 1 }); }
          return { success: true };
        },
        first: async <T>() => { if (sql.includes('WHERE id=?')) return (store.get(vals[0] as string) ?? null) as T | null; return null as T | null; },
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  };
}

describe('abattoir vertical', () => {
  it('registerAbattoirVertical slug is abattoir', () => {
    expect(registerAbattoirVertical().slug).toBe('abattoir');
  });

  it('registerAbattoirVertical milestone is M12', () => {
    expect(registerAbattoirVertical().milestone).toBe('M12');
  });

  it('registerAbattoirVertical adl_010_agricultural_cap is true', () => {
    expect(registerAbattoirVertical().adl_010_agricultural_cap).toBe(true);
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidAbattoirTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → nafdac_verified is valid', () => {
    expect(isValidAbattoirTransition('claimed', 'nafdac_verified')).toBe(true);
  });

  it('FSM: nafdac_verified → active is valid', () => {
    expect(isValidAbattoirTransition('nafdac_verified', 'active')).toBe(true);
  });

  it('FSM: active → suspended is valid', () => {
    expect(isValidAbattoirTransition('active', 'suspended')).toBe(true);
  });

  it('FSM: seeded → active is invalid', () => {
    expect(isValidAbattoirTransition('seeded', 'active')).toBe(false);
  });

  it('guardClaimedToNafdacVerified passes with valid reg and KYC 2', () => {
    expect(guardClaimedToNafdacVerified({ nafdacRegistration: 'NAFDAC-AB-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('guardClaimedToNafdacVerified fails without NAFDAC reg', () => {
    expect(guardClaimedToNafdacVerified({ nafdacRegistration: null, kycTier: 2 }).allowed).toBe(false);
  });

  it('guardKycForExport fails with KYC < 3', () => {
    expect(guardKycForExport({ kycTier: 2 }).allowed).toBe(false);
  });

  it('guardKycForExport passes with KYC 3', () => {
    expect(guardKycForExport({ kycTier: 3 }).allowed).toBe(true);
  });

  it('guardIntegerWeight passes for valid integer kg', () => {
    expect(guardIntegerWeight(500).allowed).toBe(true);
  });

  it('guardIntegerWeight fails for fractional kg', () => {
    expect(guardIntegerWeight(500.5).allowed).toBe(false);
  });

  it('guardIntegerHeadCount passes for valid integer', () => {
    expect(guardIntegerHeadCount(10).allowed).toBe(true);
  });

  it('guardIntegerHeadCount fails for fractional count', () => {
    expect(guardIntegerHeadCount(10.5).allowed).toBe(false);
  });

  it('guardL2AiCap blocks L3_HITL (ADL-010)', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });

  it('guardL2AiCap passes for L2', () => {
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });

  it('guardFractionalKobo fails for float', () => {
    expect(guardFractionalKobo(100.5).allowed).toBe(false);
  });

  it('AbattoirRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new AbattoirRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', abattoirName: 'Premier Abattoir' });
    expect(p.status).toBe('seeded');
  });

  it('AbattoirRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new AbattoirRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', abattoirName: 'Fresh Meat Ltd' });
    expect(await repo.findProfileById(p.id, 'tid-B')).toBeNull();
  });

  it('AbattoirRepository.createSlaughterLog rejects fractional head count', async () => {
    const db = makeDb();
    const repo = new AbattoirRepository(db as never);
    await expect(repo.createSlaughterLog({ profileId: 'p1', tenantId: 'tid1', slaughterDate: 1000, animalType: 'cattle', headCount: 5.5, meatYieldKg: 200 })).rejects.toThrow('integer');
  });

  it('AbattoirRepository.createSale P9 rejects fractional price', async () => {
    const db = makeDb();
    const repo = new AbattoirRepository(db as never);
    await expect(repo.createSale({ profileId: 'p1', tenantId: 'tid1', buyerPhone: '08012345678', animalType: 'cattle', quantityKg: 100, pricePerKgKobo: 5000.5, totalKobo: 500000, saleDate: 1000 })).rejects.toThrow('P9');
  });
});
