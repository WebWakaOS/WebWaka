import type { NurserySchoolProfile, CreateNurserySchoolInput, NurserySchoolFSMState, NurseryEnrollmentSummary, NurseryFee, NurseryActivity } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): NurserySchoolProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, schoolName: r['school_name'] as string, subebReg: r['subeb_reg'] as string|null, lgaEduCert: r['lga_edu_cert'] as string|null, proprietorRef: r['proprietor_ref'] as string|null, capacity: r['capacity'] as number, status: r['status'] as NurserySchoolFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toSummary(r: Record<string, unknown>): NurseryEnrollmentSummary { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, term: r['term'] as string, ageBracket02: r['age_bracket_0_2'] as number, ageBracket24: r['age_bracket_2_4'] as number, ageBracket46: r['age_bracket_4_6'] as number, totalEnrolled: r['total_enrolled'] as number, totalGraduated: r['total_graduated'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class NurserySchoolRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateNurserySchoolInput): Promise<NurserySchoolProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO nursery_school_profiles (id,workspace_id,tenant_id,school_name,subeb_reg,lga_edu_cert,proprietor_ref,capacity,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.schoolName,input.subebReg??null,input.lgaEduCert??null,input.proprietorRef??null,input.capacity??30).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[nursery-school] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<NurserySchoolProfile|null> { const r = await this.db.prepare('SELECT * FROM nursery_school_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<NurserySchoolProfile|null> { const r = await this.db.prepare('SELECT * FROM nursery_school_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: NurserySchoolFSMState, _fields?: { nesCert?: string }): Promise<NurserySchoolProfile> {
    await this.db.prepare('UPDATE nursery_school_profiles SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[nursery-school] not found'); return p;
  }
  /** P13 ABSOLUTE: Only age bracket aggregate counts — NO individual child data anywhere in this method */
  async recordEnrollmentSummary(profileId: string, tenantId: string, input: { term: string; ageBracket02: number; ageBracket24: number; ageBracket46: number; totalGraduated?: number }): Promise<NurseryEnrollmentSummary> {
    const totalEnrolled = input.ageBracket02 + input.ageBracket24 + input.ageBracket46;
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO nursery_enrollment_summary (id,profile_id,tenant_id,term,age_bracket_0_2,age_bracket_2_4,age_bracket_4_6,total_enrolled,total_graduated,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.term,input.ageBracket02,input.ageBracket24,input.ageBracket46,totalEnrolled,input.totalGraduated??0).run();
    const r = await this.db.prepare('SELECT * FROM nursery_enrollment_summary WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[nursery-school] summary create failed'); return toSummary(r);
  }
  async listEnrollmentSummaries(profileId: string, tenantId: string): Promise<NurseryEnrollmentSummary[]> { const { results } = await this.db.prepare('SELECT * FROM nursery_enrollment_summary WHERE profile_id=? AND tenant_id=? ORDER BY term DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toSummary); }
  async setFee(profileId: string, tenantId: string, input: { feeType: string; amountKobo: number; academicYear: string }): Promise<NurseryFee> {
    if (!Number.isInteger(input.amountKobo)) throw new Error('amount_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO nursery_fees (id,profile_id,tenant_id,fee_type,amount_kobo,academic_year,created_at,updated_at) VALUES (?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.feeType,input.amountKobo,input.academicYear).run();
    const r = await this.db.prepare('SELECT * FROM nursery_fees WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[nursery-school] fee create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, feeType: r['fee_type'] as NurseryFee['feeType'], amountKobo: r['amount_kobo'] as number, academicYear: r['academic_year'] as string, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
  }
  async logActivity(profileId: string, tenantId: string, input: { activityDate: number; activityType: string; participantCount?: number }): Promise<NurseryActivity> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO nursery_activities (id,profile_id,tenant_id,activity_date,activity_type,participant_count,created_at) VALUES (?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.activityDate,input.activityType,input.participantCount??0).run();
    const r = await this.db.prepare('SELECT * FROM nursery_activities WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[nursery-school] activity create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, activityDate: r['activity_date'] as number, activityType: r['activity_type'] as string, participantCount: r['participant_count'] as number, createdAt: r['created_at'] as number };
  }

  async createEnrollment(profileId: string, tenantId: string, input: { term: string; ageBracket02: number; ageBracket24: number; ageBracket46: number; enrollmentDate?: number }): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID(); const ts = Date.now();
    await this.db.prepare('INSERT INTO nursery_enrollments (id,profile_id,tenant_id,term,age_bracket_02,age_bracket_24,age_bracket_46,enrollment_date,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.term,input.ageBracket02,input.ageBracket24,input.ageBracket46,input.enrollmentDate??ts,ts).run();
    return { id, profileId, tenantId, ...input, enrollmentDate: input.enrollmentDate??ts, createdAt: ts };
  }
  async addTeacher(profileId: string, tenantId: string, input: { teacherRefId: string; qualification?: string; subjectArea?: string; employmentDate?: number }): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID(); const ts = Date.now();
    await this.db.prepare('INSERT INTO nursery_teachers (id,profile_id,tenant_id,teacher_ref_id,qualification,subject_area,employment_date,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.teacherRefId,input.qualification??null,input.subjectArea??null,input.employmentDate??null,ts).run();
    return { id, profileId, tenantId, ...input, qualification: input.qualification??null, subjectArea: input.subjectArea??null, employmentDate: input.employmentDate??null, createdAt: ts };
  }
  async listTeachers(profileId: string, tenantId: string): Promise<Record<string, unknown>[]> {
    const { results } = await this.db.prepare('SELECT * FROM nursery_teachers WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results;
  }
  async recordFeePayment(profileId: string, tenantId: string, input: { term: string; feeType: string; amountKobo: number; paymentDate: number }): Promise<Record<string, unknown>> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo < 0) throw new Error('P9: amountKobo must be non-negative integer');
    const id = crypto.randomUUID(); const ts = Date.now();
    await this.db.prepare('INSERT INTO nursery_fee_payments (id,profile_id,tenant_id,term,fee_type,amount_kobo,payment_date,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.term,input.feeType,input.amountKobo,input.paymentDate,ts).run();
    return { id, profileId, tenantId, ...input, createdAt: ts };
  }
  async listFeePayments(profileId: string, tenantId: string): Promise<Record<string, unknown>[]> {
    const { results } = await this.db.prepare('SELECT * FROM nursery_fee_payments WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results;
  }

}
export function guardSeedToClaimed(_p: NurserySchoolProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
