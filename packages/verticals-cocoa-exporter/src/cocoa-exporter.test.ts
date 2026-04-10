/**
 * @webwaka/verticals-cocoa-exporter — test suite (M12)
 * Minimum 15 tests
 * KYC Tier 3 MANDATORY tests are critical
 * Covers: T3, P9, FSM, ADL-010 L2 cap, KYC T3 mandatory, NEPC guard
 */

import { describe, it, expect } from 'vitest';
import {
  isValidCocoaExporterTransition,
  guardClaimedToNepcVerified,
  guardKycTier3Mandatory,
  guardL2AiCap,
  guardP13FarmerData,
  guardIntegerWeight,
  guardFractionalKobo,
  registerCocoaExporterVertical,
} from './index.js';
import { CocoaExporterRepository } from './cocoa-exporter.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          if (sql.startsWith('INSERT INTO cocoa_exporter_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], company_name: vals[3], nepc_exporter_licence: vals[4], nxp_number: vals[5], crin_registered: vals[6], cbn_forex_dealer: vals[7], cac_rc: vals[8], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO cocoa_procurement')) { const qty = vals[4]; if (!Number.isInteger(qty) || (qty as number) < 0) throw new Error('quantityKg must be a non-negative integer'); const price = vals[6]; if (!Number.isInteger(price) || (price as number) < 0) throw new Error('P9: pricePerKgKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], farmer_phone: vals[3], quantity_kg: vals[4], grade: vals[5], price_per_kg_kobo: vals[6], intake_date: vals[7], created_at: 1 }); }
          if (sql.startsWith('INSERT INTO cocoa_exports')) { const qty = vals[4]; if (!Number.isInteger(qty) || (qty as number) < 0) throw new Error('quantityKg must be a non-negative integer'); const fob = vals[8]; if (!Number.isInteger(fob) || (fob as number) < 0) throw new Error('P9: fobValueKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], buyer_country: vals[3], quantity_kg: vals[4], quality_cert_ref: vals[5], nepc_licence_ref: vals[6], cbn_fx_form: vals[7], fob_value_kobo: vals[8], shipping_date: vals[9], fx_repatriated_kobo: 0, repatriation_date: null, status: 'prepared', created_at: 1, updated_at: 1 }); }
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

describe('cocoa-exporter vertical', () => {
  it('registerCocoaExporterVertical slug is cocoa-exporter', () => {
    expect(registerCocoaExporterVertical().slug).toBe('cocoa-exporter');
  });

  it('registerCocoaExporterVertical milestone is M12', () => {
    expect(registerCocoaExporterVertical().milestone).toBe('M12');
  });

  it('registerCocoaExporterVertical kyc_tier_default is 3 (mandatory)', () => {
    expect(registerCocoaExporterVertical().kyc_tier_default).toBe(3);
  });

  it('registerCocoaExporterVertical kyc_tier_mandatory is true', () => {
    expect(registerCocoaExporterVertical().kyc_tier_mandatory).toBe(true);
  });

  it('registerCocoaExporterVertical adl_010_agricultural_cap is true', () => {
    expect(registerCocoaExporterVertical().adl_010_agricultural_cap).toBe(true);
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidCocoaExporterTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → nepc_verified is valid', () => {
    expect(isValidCocoaExporterTransition('claimed', 'nepc_verified')).toBe(true);
  });

  it('FSM: nepc_verified → active is valid', () => {
    expect(isValidCocoaExporterTransition('nepc_verified', 'active')).toBe(true);
  });

  it('FSM: seeded → active is invalid', () => {
    expect(isValidCocoaExporterTransition('seeded', 'active')).toBe(false);
  });

  it('guardClaimedToNepcVerified REQUIRES KYC Tier 3 (not Tier 2)', () => {
    const r = guardClaimedToNepcVerified({ nepcExporterLicence: 'NEPC-001', kycTier: 2 });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('KYC Tier 3 mandatory');
  });

  it('guardClaimedToNepcVerified passes with KYC Tier 3 and valid licence', () => {
    expect(guardClaimedToNepcVerified({ nepcExporterLicence: 'NEPC-001', kycTier: 3 }).allowed).toBe(true);
  });

  it('guardClaimedToNepcVerified fails without NEPC licence', () => {
    const r = guardClaimedToNepcVerified({ nepcExporterLicence: null, kycTier: 3 });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('NEPC');
  });

  it('guardKycTier3Mandatory blocks KYC Tier 1', () => {
    expect(guardKycTier3Mandatory({ kycTier: 1 }).allowed).toBe(false);
  });

  it('guardKycTier3Mandatory blocks KYC Tier 2', () => {
    expect(guardKycTier3Mandatory({ kycTier: 2 }).allowed).toBe(false);
  });

  it('guardKycTier3Mandatory passes with KYC Tier 3', () => {
    expect(guardKycTier3Mandatory({ kycTier: 3 }).allowed).toBe(true);
  });

  it('guardL2AiCap blocks L3_HITL (ADL-010)', () => {
    expect(guardL2AiCap({ autonomyLevel: 'L3_HITL' }).allowed).toBe(false);
  });

  it('guardP13FarmerData blocks farmer_phone in payload', () => {
    expect(guardP13FarmerData({ payloadKeys: ['farmer_phone', 'grade'] }).allowed).toBe(false);
  });

  it('guardP13FarmerData passes with aggregate keys', () => {
    expect(guardP13FarmerData({ payloadKeys: ['grade', 'total_kg', 'average_price'] }).allowed).toBe(true);
  });

  it('guardIntegerWeight passes for valid kg', () => {
    expect(guardIntegerWeight(1000).allowed).toBe(true);
  });

  it('guardFractionalKobo fails for float', () => {
    expect(guardFractionalKobo(100.5).allowed).toBe(false);
  });

  it('CocoaExporterRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new CocoaExporterRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', companyName: 'NigeriaCocoaXport Ltd' });
    expect(p.status).toBe('seeded');
  });

  it('CocoaExporterRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new CocoaExporterRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', companyName: 'Cocoa Global' });
    expect(await repo.findProfileById(p.id, 'tid-B')).toBeNull();
  });

  it('CocoaExporterRepository.createExport P9 rejects fractional fobValueKobo', async () => {
    const db = makeDb();
    const repo = new CocoaExporterRepository(db as never);
    await expect(repo.createExport({ profileId: 'p1', tenantId: 'tid1', buyerCountry: 'Netherlands', quantityKg: 10000, fobValueKobo: 5000000.5 })).rejects.toThrow('P9');
  });
});
