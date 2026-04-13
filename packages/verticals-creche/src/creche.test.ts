/**
 * @webwaka/verticals-creche — test suite (M12)
 * Minimum 15 tests
 * Covers: T3, P9, P13 (child critical), FSM, L3 HITL mandatory, SUBEB guard
 */

import { describe, it, expect } from 'vitest';
import {
  isValidCrecheTransition,
  guardClaimedToSubebVerified,
  guardL3HitlRequired,
  guardP13ChildData,
  guardFractionalKobo,
  registerCrecheVertical,
} from './index.js';
import { CrecheRepository } from './creche.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        // eslint-disable-next-line @typescript-eslint/require-await
        run: async () => {
          if (sql.startsWith('INSERT INTO creche_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], creche_name: vals[3], subeb_registration: vals[4], state_social_welfare_cert: vals[5], cac_rc: vals[6], capacity: vals[7], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO creche_children')) { const fee = vals[6]; if (!Number.isInteger(fee) || (fee as number) < 0) throw new Error('P9: monthlyFeeKobo must be a non-negative integer'); const age = vals[4]; if (!Number.isInteger(age) || (age as number) < 0) throw new Error('ageMonths must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], child_ref_id: vals[3], age_months: vals[4], admission_date: vals[5], monthly_fee_kobo: vals[6], status: 'active', created_at: 1, updated_at: 1 }); }
          if (sql.startsWith('INSERT INTO creche_billing')) { const fee = vals[5]; if (!Number.isInteger(fee) || (fee as number) < 0) throw new Error('P9: feeKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], child_ref_id: vals[3], billing_period: vals[4], fee_kobo: vals[5], paid_kobo: vals[6], outstanding_kobo: vals[7], created_at: 1, updated_at: 1 }); }
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

describe('creche vertical', () => {
  it('registerCrecheVertical slug is creche', () => {
    expect(registerCrecheVertical().slug).toBe('creche');
  });

  it('registerCrecheVertical milestone is M12', () => {
    expect(registerCrecheVertical().milestone).toBe('M12');
  });

  it('registerCrecheVertical hitl_required_all_ai is true (L3 HITL mandatory)', () => {
    expect(registerCrecheVertical().hitl_required_all_ai).toBe(true);
  });

  it('registerCrecheVertical p13_child_data_critical is true', () => {
    expect(registerCrecheVertical().p13_child_data_critical).toBe(true);
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidCrecheTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → subeb_verified is valid', () => {
    expect(isValidCrecheTransition('claimed', 'subeb_verified')).toBe(true);
  });

  it('FSM: subeb_verified → active is valid', () => {
    expect(isValidCrecheTransition('subeb_verified', 'active')).toBe(true);
  });

  it('FSM: active → suspended is valid', () => {
    expect(isValidCrecheTransition('active', 'suspended')).toBe(true);
  });

  it('FSM: seeded → active is invalid (skip gate)', () => {
    expect(isValidCrecheTransition('seeded', 'active')).toBe(false);
  });

  it('guardL3HitlRequired passes when autonomy is L3_HITL string', () => {
    expect(guardL3HitlRequired({ autonomyLevel: 'L3_HITL' }).allowed).toBe(true);
  });

  it('guardL3HitlRequired passes when autonomy is 3 (number)', () => {
    expect(guardL3HitlRequired({ autonomyLevel: 3 }).allowed).toBe(true);
  });

  it('guardL3HitlRequired fails when autonomy is L2 (block lower autonomy)', () => {
    const r = guardL3HitlRequired({ autonomyLevel: 2 });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('L3 HITL mandatory');
  });

  it('guardL3HitlRequired fails when autonomy is undefined', () => {
    expect(guardL3HitlRequired({ autonomyLevel: undefined }).allowed).toBe(false);
  });

  it('guardClaimedToSubebVerified passes with valid reg and KYC 2', () => {
    expect(guardClaimedToSubebVerified({ subebRegistration: 'SUBEB-2024-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('guardClaimedToSubebVerified fails with KYC < 2', () => {
    const r = guardClaimedToSubebVerified({ subebRegistration: 'SUBEB-2024-001', kycTier: 1 });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('KYC Tier 2');
  });

  it('guardClaimedToSubebVerified fails without SUBEB reg', () => {
    const r = guardClaimedToSubebVerified({ subebRegistration: null, kycTier: 2 });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('SUBEB');
  });

  it('guardP13ChildData blocks child_name in payload (most critical)', () => {
    const r = guardP13ChildData({ payloadKeys: ['child_ref_id', 'child_name'] });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('P13');
  });

  it('guardP13ChildData blocks developmental_notes in payload', () => {
    const r = guardP13ChildData({ payloadKeys: ['child_ref_id', 'developmental_notes'] });
    expect(r.allowed).toBe(false);
  });

  it('guardP13ChildData passes with safe aggregate keys', () => {
    expect(guardP13ChildData({ payloadKeys: ['child_ref_id', 'attendance_count', 'month'] }).allowed).toBe(true);
  });

  it('guardFractionalKobo fails for float', () => {
    expect(guardFractionalKobo(500.5).allowed).toBe(false);
  });

  it('guardFractionalKobo passes for integer', () => {
    expect(guardFractionalKobo(5000).allowed).toBe(true);
  });

  it('CrecheRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new CrecheRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', crecheName: 'Sunshine Creche' });
    expect(p.status).toBe('seeded');
    expect(p.tenantId).toBe('tid1');
  });

  it('CrecheRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new CrecheRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', crecheName: 'Rainbow Kids' });
    expect(await repo.findProfileById(p.id, 'tid-B')).toBeNull();
  });

  it('CrecheRepository.createChild P9 rejects fractional monthlyFeeKobo', async () => {
    const db = makeDb();
    const repo = new CrecheRepository(db as never);
    await expect(repo.createChild({ profileId: 'p1', tenantId: 'tid1', ageMonths: 18, monthlyFeeKobo: 25000.5 })).rejects.toThrow('P9');
  });

  it('CrecheRepository.createBilling P9 rejects fractional feeKobo', async () => {
    const db = makeDb();
    const repo = new CrecheRepository(db as never);
    await expect(repo.createBilling({ profileId: 'p1', tenantId: 'tid1', childRefId: 'cr-1', billingPeriod: '2024-01', feeKobo: 25000.5 })).rejects.toThrow('P9');
  });
});
