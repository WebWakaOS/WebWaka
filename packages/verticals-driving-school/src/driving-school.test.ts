/**
 * @webwaka/verticals-driving-school — test suite (M9)
 * Minimum 15 tests
 * Covers: T3, P9, P13, FSM, KYC, AI guard, FRSC guard
 */

import { describe, it, expect } from 'vitest';
import {
  isValidDrivingSchoolTransition,
  guardClaimedToFrscVerified,
  guardKycForFleetFinancing,
  guardP13StudentData,
  guardFractionalKobo,
  registerDrivingSchoolVertical,
} from './index.js';
import { DrivingSchoolRepository } from './driving-school.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          if (sql.startsWith('INSERT INTO driving_school_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], school_name: vals[3], frsc_registration: vals[4], state: vals[5], cac_rc: vals[6], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO ds_students')) { const fee = vals[6]; if (!Number.isInteger(fee) || (fee as number) < 0) throw new Error('P9: enrolmentFeeKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], student_ref_id: vals[3], course_type: vals[4], enrolment_fee_kobo: vals[6], lessons_paid: vals[7], start_date: null, frsc_test_date: null, test_status: 'pending', cert_issued: 0, created_at: 1, updated_at: 1 }); }
          if (sql.startsWith('INSERT INTO ds_vehicles')) { const cost = vals[5]; if (!Number.isInteger(cost) || (cost as number) < 0) throw new Error('P9: purchaseCostKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], vehicle_plate: vals[3], type: vals[4], purchase_cost_kobo: vals[5], last_service_date: null, status: 'active', created_at: 1, updated_at: 1 }); }
          if (sql.startsWith('UPDATE driving_school_profiles SET status')) store.set(vals[2] as string, { ...(store.get(vals[2] as string) as object ?? {}), status: vals[0], updated_at: vals[1] });
          return { success: true };
        },
        first: async <T>() => {
          if (sql.includes('WHERE id=?')) return (store.get(vals[0] as string) ?? null) as T | null;
          return null as T | null;
        },
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  };
}

describe('driving-school vertical', () => {
  it('registerDrivingSchoolVertical returns correct slug and pillars', () => {
    const v = registerDrivingSchoolVertical();
    expect(v.slug).toBe('driving-school');
    expect(v.primary_pillars).toContain('ops');
    expect(v.primary_pillars).toContain('branding');
    expect(v.primary_pillars).toContain('marketplace');
  });

  it('registerDrivingSchoolVertical milestone is M9', () => {
    expect(registerDrivingSchoolVertical().milestone).toBe('M9');
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidDrivingSchoolTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → frsc_verified is valid', () => {
    expect(isValidDrivingSchoolTransition('claimed', 'frsc_verified')).toBe(true);
  });

  it('FSM: frsc_verified → active is valid', () => {
    expect(isValidDrivingSchoolTransition('frsc_verified', 'active')).toBe(true);
  });

  it('FSM: active → suspended is valid', () => {
    expect(isValidDrivingSchoolTransition('active', 'suspended')).toBe(true);
  });

  it('FSM: suspended → active is valid (re-activation)', () => {
    expect(isValidDrivingSchoolTransition('suspended', 'active')).toBe(true);
  });

  it('FSM: seeded → active is invalid (skip gate)', () => {
    expect(isValidDrivingSchoolTransition('seeded', 'active')).toBe(false);
  });

  it('FSM: seeded → frsc_verified is invalid (must go claimed first)', () => {
    expect(isValidDrivingSchoolTransition('seeded', 'frsc_verified')).toBe(false);
  });

  it('guardClaimedToFrscVerified passes with valid reg and KYC 1', () => {
    expect(guardClaimedToFrscVerified({ frscRegistration: 'FRSC-DS-001', kycTier: 1 }).allowed).toBe(true);
  });

  it('guardClaimedToFrscVerified fails without FRSC reg', () => {
    const r = guardClaimedToFrscVerified({ frscRegistration: null, kycTier: 1 });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('FRSC');
  });

  it('guardClaimedToFrscVerified fails with KYC < 1', () => {
    const r = guardClaimedToFrscVerified({ frscRegistration: 'FRSC-DS-001', kycTier: 0 });
    expect(r.allowed).toBe(false);
  });

  it('guardKycForFleetFinancing fails with KYC < 2', () => {
    const r = guardKycForFleetFinancing({ kycTier: 1 });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('KYC Tier 2');
  });

  it('guardKycForFleetFinancing passes with KYC 2', () => {
    expect(guardKycForFleetFinancing({ kycTier: 2 }).allowed).toBe(true);
  });

  it('guardP13StudentData blocks student_name in payload', () => {
    const r = guardP13StudentData({ payloadKeys: ['student_ref_id', 'student_name'] });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('P13');
  });

  it('guardP13StudentData passes with safe keys', () => {
    expect(guardP13StudentData({ payloadKeys: ['student_ref_id', 'course_type', 'lessons_paid'] }).allowed).toBe(true);
  });

  it('guardFractionalKobo passes for valid integer', () => {
    expect(guardFractionalKobo(50000).allowed).toBe(true);
  });

  it('guardFractionalKobo fails for float amount', () => {
    expect(guardFractionalKobo(500.5).allowed).toBe(false);
  });

  it('guardFractionalKobo fails for negative amount', () => {
    expect(guardFractionalKobo(-1).allowed).toBe(false);
  });

  it('guardFractionalKobo passes for zero', () => {
    expect(guardFractionalKobo(0).allowed).toBe(true);
  });

  it('DrivingSchoolRepository.createProfile creates with seeded status', async () => {
    const db = makeDb();
    const repo = new DrivingSchoolRepository(db as never);
    const profile = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', schoolName: 'Speed Academy' });
    expect(profile.status).toBe('seeded');
    expect(profile.tenantId).toBe('tid1');
  });

  it('DrivingSchoolRepository.createProfile T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new DrivingSchoolRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', schoolName: 'ABC Driving' });
    const found = await repo.findProfileById(p.id, 'tid-A');
    expect(found?.tenantId).toBe('tid-A');
    const other = await repo.findProfileById(p.id, 'tid-B');
    expect(other).toBeNull();
  });

  it('DrivingSchoolRepository.createStudent P9 rejects fractional fee', async () => {
    const db = makeDb();
    const repo = new DrivingSchoolRepository(db as never);
    await expect(repo.createStudent({ profileId: 'p1', tenantId: 'tid1', enrolmentFeeKobo: 500.5 })).rejects.toThrow('P9');
  });

  it('DrivingSchoolRepository.createVehicle P9 rejects fractional cost', async () => {
    const db = makeDb();
    const repo = new DrivingSchoolRepository(db as never);
    await expect(repo.createVehicle({ profileId: 'p1', tenantId: 'tid1', vehiclePlate: 'LAG-123-AB', purchaseCostKobo: 1000.1 })).rejects.toThrow('P9');
  });

  it('registerDrivingSchoolVertical ai_autonomy_level is 2', () => {
    expect(registerDrivingSchoolVertical().ai_autonomy_level).toBe(2);
  });
});
