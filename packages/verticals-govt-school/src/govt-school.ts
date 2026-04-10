import type { GovtSchoolProfile, CreateGovtSchoolInput, GovtSchoolFSMState, SchoolClass, SchoolEnrollmentSummary, SchoolCapitationGrant } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): GovtSchoolProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, schoolName: r['school_name'] as string, subebRef: r['subeb_ref'] as string|null, ubecRef: r['ubec_ref'] as string|null, nemisId: r['nemis_id'] as string|null, schoolType: r['school_type'] as GovtSchoolProfile['schoolType'], lga: r['lga'] as string|null, state: r['state'] as string|null, status: r['status'] as GovtSchoolFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toClass(r: Record<string, unknown>): SchoolClass { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, className: r['class_name'] as string, teacherRefId: r['teacher_ref_id'] as string|null, studentCount: r['student_count'] as number, genderMale: r['gender_male'] as number, genderFemale: r['gender_female'] as number, academicYear: r['academic_year'] as string, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toEnrollSummary(r: Record<string, unknown>): SchoolEnrollmentSummary { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, academicYear: r['academic_year'] as string, totalEnrolled: r['total_enrolled'] as number, totalGraduated: r['total_graduated'] as number, totalDropout: r['total_dropout'] as number, averageAttendancePct: r['average_attendance_pct'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class GovtSchoolRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateGovtSchoolInput): Promise<GovtSchoolProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO govt_school_profiles (id,workspace_id,tenant_id,school_name,subeb_ref,ubec_ref,nemis_id,school_type,lga,state,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.schoolName,input.subebRef??null,input.ubecRef??null,input.nemisId??null,input.schoolType??'primary',input.lga??null,input.state??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[govt-school] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<GovtSchoolProfile|null> { const r = await this.db.prepare('SELECT * FROM govt_school_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<GovtSchoolProfile|null> { const r = await this.db.prepare('SELECT * FROM govt_school_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: GovtSchoolFSMState, fields?: { subebRef?: string }): Promise<GovtSchoolProfile> {
    if (to === 'subeb_verified' && !fields?.subebRef) throw new Error('SUBEB reference required to transition to subeb_verified');
    const extra = fields?.subebRef ? `, subeb_ref='${fields.subebRef}'` : '';
    await this.db.prepare(`UPDATE govt_school_profiles SET status=?${extra}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[govt-school] not found'); return p;
  }
  async addClassRecord(profileId: string, tenantId: string, input: { className: string; teacherRefId?: string; studentCount?: number; genderMale?: number; genderFemale?: number; academicYear: string }): Promise<SchoolClass> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO school_classes (id,profile_id,tenant_id,class_name,teacher_ref_id,student_count,gender_male,gender_female,academic_year,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.className,input.teacherRefId??null,input.studentCount??0,input.genderMale??0,input.genderFemale??0,input.academicYear).run();
    const r = await this.db.prepare('SELECT * FROM school_classes WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[govt-school] class create failed'); return toClass(r);
  }
  async listClasses(profileId: string, tenantId: string): Promise<SchoolClass[]> { const { results } = await this.db.prepare('SELECT * FROM school_classes WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toClass); }
  async createEnrollmentSummary(profileId: string, tenantId: string, input: { academicYear: string; totalEnrolled?: number; totalGraduated?: number; totalDropout?: number; averageAttendancePct?: number }): Promise<SchoolEnrollmentSummary> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO school_enrollment_summary (id,profile_id,tenant_id,academic_year,total_enrolled,total_graduated,total_dropout,average_attendance_pct,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.academicYear,input.totalEnrolled??0,input.totalGraduated??0,input.totalDropout??0,input.averageAttendancePct??0).run();
    const r = await this.db.prepare('SELECT * FROM school_enrollment_summary WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[govt-school] enrollment summary create failed'); return toEnrollSummary(r);
  }
  async listEnrollmentSummaries(profileId: string, tenantId: string): Promise<SchoolEnrollmentSummary[]> { const { results } = await this.db.prepare('SELECT * FROM school_enrollment_summary WHERE profile_id=? AND tenant_id=? ORDER BY academic_year DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toEnrollSummary); }
  async createCapitationGrant(profileId: string, tenantId: string, input: { grantYear: string; grantAmountKobo: number; grantSource: string; disbursementDate?: number; utilisedKobo?: number }): Promise<SchoolCapitationGrant> {
    if (!Number.isInteger(input.grantAmountKobo)) throw new Error('grant_amount_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO school_capitation_grants (id,profile_id,tenant_id,grant_year,grant_amount_kobo,disbursement_date,utilised_kobo,grant_source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.grantYear,input.grantAmountKobo,input.disbursementDate??null,input.utilisedKobo??0,input.grantSource).run();
    const r = await this.db.prepare('SELECT * FROM school_capitation_grants WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[govt-school] grant create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, grantYear: r['grant_year'] as string, grantAmountKobo: r['grant_amount_kobo'] as number, disbursementDate: r['disbursement_date'] as number|null, utilisedKobo: r['utilised_kobo'] as number, grantSource: r['grant_source'] as SchoolCapitationGrant['grantSource'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
  }

  async enrollStudent(profileId: string, tenantId: string, input: { studentId: string; className: string; admissionDate: number; subsidy?: boolean }): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID(); const ts = Date.now();
    await this.db.prepare('INSERT INTO school_students (id,profile_id,tenant_id,student_id,class_name,admission_date,subsidy,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.studentId,input.className,input.admissionDate,input.subsidy?1:0,ts).run();
    return { id, profileId, tenantId, studentId: input.studentId, className: input.className, admissionDate: input.admissionDate, subsidy: input.subsidy??false, createdAt: ts };
  }
  async listStudents(profileId: string, tenantId: string): Promise<Record<string, unknown>[]> {
    const { results } = await this.db.prepare('SELECT * FROM school_students WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results;
  }
  async addTeacher(profileId: string, tenantId: string, input: { teacherRefId: string; subjectArea?: string; qualifications?: string; employmentDate?: number }): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID(); const ts = Date.now();
    await this.db.prepare('INSERT INTO school_teachers (id,profile_id,tenant_id,teacher_ref_id,subject_area,qualifications,employment_date,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.teacherRefId,input.subjectArea??null,input.qualifications??null,input.employmentDate??null,ts).run();
    return { id, profileId, tenantId, teacherRefId: input.teacherRefId, subjectArea: input.subjectArea??null, qualifications: input.qualifications??null, employmentDate: input.employmentDate??null, createdAt: ts };
  }
  async listTeachers(profileId: string, tenantId: string): Promise<Record<string, unknown>[]> {
    const { results } = await this.db.prepare('SELECT * FROM school_teachers WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results;
  }
  async recordResult(profileId: string, tenantId: string, input: { studentId: string; term: string; subject: string; score: number; maxScore: number }): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID(); const ts = Date.now();
    await this.db.prepare('INSERT INTO school_results (id,profile_id,tenant_id,student_id,term,subject,score,max_score,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.studentId,input.term,input.subject,input.score,input.maxScore,ts).run();
    return { id, profileId, tenantId, ...input, createdAt: ts };
  }
  async listResults(profileId: string, tenantId: string): Promise<Record<string, unknown>[]> {
    const { results } = await this.db.prepare('SELECT * FROM school_results WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results;
  }

}
export function guardSeedToClaimed(_p: GovtSchoolProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
