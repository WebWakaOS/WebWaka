/**
 * @webwaka/verticals-training-institute — test suite (M9)
 * Minimum 15 tests
 * Covers: T3, P9, P13, FSM, KYC, NBTE guard
 */

import { describe, it, expect } from 'vitest';
import {
  isValidTrainingInstituteTransition,
  guardClaimedToNbteVerified,
  guardKycForSiwes,
  guardP13StudentData,
  guardFractionalKobo,
  registerTrainingInstituteVertical,
} from './index.js';
import { TrainingInstituteRepository } from './training-institute.js';

function makeDb() {
  const store = new Map<string, unknown>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        // eslint-disable-next-line @typescript-eslint/require-await
        run: async () => {
          if (sql.startsWith('INSERT INTO training_institute_profiles')) store.set(vals[0] as string, { id: vals[0], workspace_id: vals[1], tenant_id: vals[2], institute_name: vals[3], nbte_accreditation: vals[4], itf_registration: vals[5], nabteb_centre_number: vals[6], cac_rc: vals[7], status: 'seeded', created_at: 1, updated_at: 1 });
          if (sql.startsWith('INSERT INTO ti_courses')) { const fee = vals[6]; if (!Number.isInteger(fee) || (fee as number) < 0) throw new Error('P9: courseFeeKobo must be a non-negative integer'); const dur = vals[5]; if (!Number.isInteger(dur) || (dur as number) < 1) throw new Error('durationWeeks must be a positive integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], course_name: vals[3], trade_area: vals[4], duration_weeks: vals[5], course_fee_kobo: vals[6], nbte_approval_number: vals[7], created_at: 1, updated_at: 1 }); }
          if (sql.startsWith('INSERT INTO ti_students')) { const fee = vals[6]; if (!Number.isInteger(fee) || (fee as number) < 0) throw new Error('P9: enrolmentFeeKobo must be a non-negative integer'); store.set(vals[0] as string, { id: vals[0], profile_id: vals[1], tenant_id: vals[2], student_ref_id: vals[3], course_id: vals[4], enrolment_date: vals[5], enrolment_fee_kobo: vals[6], exam_fee_kobo: vals[7], nabteb_reg_number: vals[8], siwes_placement: 0, cert_issued: 0, created_at: 1, updated_at: 1 }); }
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

describe('training-institute vertical', () => {
  it('registerTrainingInstituteVertical returns correct slug', () => {
    expect(registerTrainingInstituteVertical().slug).toBe('training-institute');
  });

  it('registerTrainingInstituteVertical milestone is M9', () => {
    expect(registerTrainingInstituteVertical().milestone).toBe('M9');
  });

  it('registerTrainingInstituteVertical has ops, branding, marketplace pillars', () => {
    const v = registerTrainingInstituteVertical();
    expect(v.primary_pillars).toContain('ops');
    expect(v.primary_pillars).toContain('branding');
    expect(v.primary_pillars).toContain('marketplace');
  });

  it('FSM: seeded → claimed is valid', () => {
    expect(isValidTrainingInstituteTransition('seeded', 'claimed')).toBe(true);
  });

  it('FSM: claimed → nbte_verified is valid', () => {
    expect(isValidTrainingInstituteTransition('claimed', 'nbte_verified')).toBe(true);
  });

  it('FSM: nbte_verified → active is valid', () => {
    expect(isValidTrainingInstituteTransition('nbte_verified', 'active')).toBe(true);
  });

  it('FSM: active → suspended is valid', () => {
    expect(isValidTrainingInstituteTransition('active', 'suspended')).toBe(true);
  });

  it('FSM: seeded → active is invalid (skip gate)', () => {
    expect(isValidTrainingInstituteTransition('seeded', 'active')).toBe(false);
  });

  it('guardClaimedToNbteVerified passes with valid accreditation and KYC 1', () => {
    expect(guardClaimedToNbteVerified({ nbteAccreditation: 'NBTE-2024-001', kycTier: 1 }).allowed).toBe(true);
  });

  it('guardClaimedToNbteVerified fails without accreditation', () => {
    const r = guardClaimedToNbteVerified({ nbteAccreditation: null, kycTier: 1 });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('NBTE');
  });

  it('guardKycForSiwes fails with KYC < 2', () => {
    expect(guardKycForSiwes({ kycTier: 1 }).allowed).toBe(false);
  });

  it('guardKycForSiwes passes with KYC 2', () => {
    expect(guardKycForSiwes({ kycTier: 2 }).allowed).toBe(true);
  });

  it('guardP13StudentData blocks individual_score in payload', () => {
    const r = guardP13StudentData({ payloadKeys: ['student_ref_id', 'individual_score'] });
    expect(r.allowed).toBe(false);
  });

  it('guardP13StudentData passes with aggregate stats', () => {
    expect(guardP13StudentData({ payloadKeys: ['course_id', 'total_enrolled', 'completion_rate'] }).allowed).toBe(true);
  });

  it('guardFractionalKobo passes for zero', () => {
    expect(guardFractionalKobo(0).allowed).toBe(true);
  });

  it('guardFractionalKobo fails for fractional amount', () => {
    expect(guardFractionalKobo(100.5).allowed).toBe(false);
  });

  it('TrainingInstituteRepository.createProfile sets seeded status', async () => {
    const db = makeDb();
    const repo = new TrainingInstituteRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid1', instituteName: 'Tech Skill Centre' });
    expect(p.status).toBe('seeded');
  });

  it('TrainingInstituteRepository T3 tenant isolation', async () => {
    const db = makeDb();
    const repo = new TrainingInstituteRepository(db as never);
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tid-A', instituteName: 'Skill Hub' });
    const other = await repo.findProfileById(p.id, 'tid-B');
    expect(other).toBeNull();
  });

  it('TrainingInstituteRepository.createCourse P9 rejects fractional fee', async () => {
    const db = makeDb();
    const repo = new TrainingInstituteRepository(db as never);
    await expect(repo.createCourse({ profileId: 'p1', tenantId: 'tid1', courseName: 'Welding', durationWeeks: 8, courseFeeKobo: 200.5 })).rejects.toThrow('P9');
  });

  it('registerTrainingInstituteVertical ai_autonomy_level is 2', () => {
    expect(registerTrainingInstituteVertical().ai_autonomy_level).toBe(2);
  });
});
