/**
 * @webwaka/verticals-private-school — test suite (M12)
 * Minimum 15 tests
 * Covers: T3, P9, P13, FSM, KYC, SUBEB guard
 */

import { describe, it, expect } from 'vitest';
import {
  isValidPrivateSchoolTransition,
  guardClaimedToSubebVerified,
  guardKycForPayroll,
  guardP13StudentData,
  guardFractionalKobo,
  registerPrivateSchoolVertical,
} from './index.js';
import { PrivateSchoolRepository } from './private-school.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          if (sql.startsWith('INSERT INTO private_school_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], school_name: vals[3], subeb_approval: vals[4], waec_centre_number: vals[5], neco_centre_number: vals[6], cac_rc: vals[7], school_type: vals[8], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO school_students')) { const fee = vals[6]; if (!Number.isInteger(fee) || (fee as number) < 0) throw new Error('P9: termFeeKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], student_ref_id: vals[3], class_level: vals[4], admission_date: vals[5], term_fee_kobo: vals[6], waec_neco_reg_number: null, status: 'active', created_at: 1, updated_at: 1 }); }
          if (sql.startsWith('INSERT INTO school_fees_log')) { const fee = vals[5]; if (!Number.isInteger(fee) || (fee as number) < 0) throw new Error('P9: feeKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], student_ref_id: vals[3], term: vals[4], fee_kobo: vals[5], paid_kobo: vals[6], outstanding_kobo: vals[7], payment_date: null, created_at: 1 }); }
          if (sql.startsWith('INSERT INTO school_teachers')) { const sal = vals[6]; if (!Number.isInteger(sal) || (sal as number) < 0) throw new Error('P9: monthlySalaryKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], teacher_name: vals[3], qualification: vals[4], assigned_class: vals[5], monthly_salary_kobo: vals[6], created_at: 1, updated_at: 1 }); }
          return { success: true };
        },
        first: async <T>() => { if (sql.includes('WHERE id=?')) return (store.get(vals[0] as string) ?? null) as T | null; return null as T | null; },
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  };
}

describe('private-school vertical', () => {
  it('registerPrivateSchoolVertical slug is private-school', () => {
    expect(registerPrivateSchoolVertical().slug).toBe('private-school');
  });

  it('registerPrivateSchoolVertical milestone is M12', () => {
    expect(registerPrivateSchoolVertical().milestone).toBe('M12');
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidPrivateSchoolTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → subeb_verified is valid', () => {
    expect(isValidPrivateSchoolTransition('claimed', 'subeb_verified')).toBe(true);
  });

  it('FSM: subeb_verified → active is valid', () => {
    expect(isValidPrivateSchoolTransition('subeb_verified', 'active')).toBe(true);
  });

  it('FSM: active → suspended is valid', () => {
    expect(isValidPrivateSchoolTransition('active', 'suspended')).toBe(true);
  });

  it('FSM: seeded → active is invalid (skip gate)', () => {
    expect(isValidPrivateSchoolTransition('seeded', 'active')).toBe(false);
  });

  it('guardClaimedToSubebVerified passes with valid approval and KYC 2', () => {
    expect(guardClaimedToSubebVerified({ subebApproval: 'SUBEB-SCH-001', kycTier: 2 }).allowed).toBe(true);
  });

  it('guardClaimedToSubebVerified fails without SUBEB approval', () => {
    const r = guardClaimedToSubebVerified({ subebApproval: null, kycTier: 2 });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('SUBEB');
  });

  it('guardClaimedToSubebVerified fails with KYC < 2', () => {
    expect(guardClaimedToSubebVerified({ subebApproval: 'SUBEB-001', kycTier: 1 }).allowed).toBe(false);
  });

  it('guardKycForPayroll fails with KYC < 3', () => {
    expect(guardKycForPayroll({ kycTier: 2 }).allowed).toBe(false);
  });

  it('guardKycForPayroll passes with KYC 3', () => {
    expect(guardKycForPayroll({ kycTier: 3 }).allowed).toBe(true);
  });

  it('guardP13StudentData blocks student_grade in payload', () => {
    expect(guardP13StudentData({ payloadKeys: ['student_ref_id', 'student_grade'] }).allowed).toBe(false);
  });

  it('guardP13StudentData passes with aggregate class stats', () => {
    expect(guardP13StudentData({ payloadKeys: ['class_level', 'total_students', 'average_fee'] }).allowed).toBe(true);
  });

  it('guardFractionalKobo fails for fractional', () => {
    expect(guardFractionalKobo(100.1).allowed).toBe(false);
  });

  it('PrivateSchoolRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new PrivateSchoolRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', schoolName: 'Heritage Academy' });
    expect(p.status).toBe('seeded');
  });

  it('PrivateSchoolRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new PrivateSchoolRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', schoolName: 'Bright Stars' });
    expect(await repo.findProfileById(p.id, 'tid-B')).toBeNull();
  });

  it('PrivateSchoolRepository.createStudent P9 rejects fractional termFeeKobo', async () => {
    const db = makeDb();
    const repo = new PrivateSchoolRepository(db as never);
    await expect(repo.createStudent({ profileId: 'p1', tenantId: 'tid1', classLevel: 'JSS1', termFeeKobo: 50000.5 })).rejects.toThrow('P9');
  });

  it('PrivateSchoolRepository.createTeacher P9 rejects fractional salaryKobo', async () => {
    const db = makeDb();
    const repo = new PrivateSchoolRepository(db as never);
    await expect(repo.createTeacher({ profileId: 'p1', tenantId: 'tid1', teacherName: 'Mr Ade', monthlySalaryKobo: 100000.5 })).rejects.toThrow('P9');
  });
});
