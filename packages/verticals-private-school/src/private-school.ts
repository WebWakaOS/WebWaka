/**
 * PrivateSchoolRepository — M12
 * T3: all queries scoped to tenantId
 * P9: term_fee_kobo / monthly_salary_kobo are integers
 * P13: student_ref_id opaque UUID; no individual grades to AI
 */

import type {
  PrivateSchoolProfile, SchoolStudent, SchoolFeesLog, SchoolTeacher,
  PrivateSchoolFSMState, SchoolType, StudentStatus,
  CreatePrivateSchoolInput, UpdatePrivateSchoolInput,
  CreateStudentInput, CreateFeesLogInput, CreateTeacherInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; school_name: string; subeb_approval: string | null; waec_centre_number: string | null; neco_centre_number: string | null; cac_rc: string | null; school_type: string; status: string; created_at: number; updated_at: number; }
interface StudentRow { id: string; profile_id: string; tenant_id: string; student_ref_id: string; class_level: string; admission_date: number | null; term_fee_kobo: number; waec_neco_reg_number: string | null; status: string; created_at: number; updated_at: number; }
interface FeesRow { id: string; profile_id: string; tenant_id: string; student_ref_id: string; term: string; fee_kobo: number; paid_kobo: number; outstanding_kobo: number; payment_date: number | null; created_at: number; }
interface TeacherRow { id: string; profile_id: string; tenant_id: string; teacher_name: string; qualification: string | null; assigned_class: string | null; monthly_salary_kobo: number; created_at: number; updated_at: number; }

function rowToProfile(r: ProfileRow): PrivateSchoolProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, schoolName: r.school_name, subebApproval: r.subeb_approval, waecCentreNumber: r.waec_centre_number, necoCentreNumber: r.neco_centre_number, cacRc: r.cac_rc, schoolType: r.school_type as SchoolType, status: r.status as PrivateSchoolFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToStudent(r: StudentRow): SchoolStudent { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, studentRefId: r.student_ref_id, classLevel: r.class_level, admissionDate: r.admission_date, termFeeKobo: r.term_fee_kobo, waecNecoRegNumber: r.waec_neco_reg_number, status: r.status as StudentStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToFees(r: FeesRow): SchoolFeesLog { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, studentRefId: r.student_ref_id, term: r.term, feeKobo: r.fee_kobo, paidKobo: r.paid_kobo, outstandingKobo: r.outstanding_kobo, paymentDate: r.payment_date, createdAt: r.created_at }; }
function rowToTeacher(r: TeacherRow): SchoolTeacher { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, teacherName: r.teacher_name, qualification: r.qualification, assignedClass: r.assigned_class, monthlySalaryKobo: r.monthly_salary_kobo, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class PrivateSchoolRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreatePrivateSchoolInput): Promise<PrivateSchoolProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO private_school_profiles (id,workspace_id,tenant_id,school_name,subeb_approval,waec_centre_number,neco_centre_number,cac_rc,school_type,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.schoolName, input.subebApproval ?? null, input.waecCentreNumber ?? null, input.necoCentreNumber ?? null, input.cacRc ?? null, input.schoolType ?? 'primary', 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<PrivateSchoolProfile | null> {
    const r = await this.db.prepare('SELECT * FROM private_school_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateProfile(id: string, tenantId: string, patch: UpdatePrivateSchoolInput): Promise<void> {
    const ts = now();
    if (patch.subebApproval !== undefined) await this.db.prepare('UPDATE private_school_profiles SET subeb_approval=?,updated_at=? WHERE id=? AND tenant_id=?').bind(patch.subebApproval, ts, id, tenantId).run();
    if (patch.schoolName !== undefined) await this.db.prepare('UPDATE private_school_profiles SET school_name=?,updated_at=? WHERE id=? AND tenant_id=?').bind(patch.schoolName, ts, id, tenantId).run();
  }

  async transition(id: string, tenantId: string, to: PrivateSchoolFSMState): Promise<PrivateSchoolProfile> {
    await this.db.prepare('UPDATE private_school_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async createStudent(input: CreateStudentInput): Promise<SchoolStudent> {
    if (!Number.isInteger(input.termFeeKobo) || input.termFeeKobo < 0) throw new Error('P9: termFeeKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    const refId = input.studentRefId ?? uuid();
    await this.db.prepare('INSERT INTO school_students (id,profile_id,tenant_id,student_ref_id,class_level,admission_date,term_fee_kobo,waec_neco_reg_number,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, refId, input.classLevel, input.admissionDate ?? ts, input.termFeeKobo, null, 'active', ts, ts).run();
    return (await this.findStudentById(id, input.tenantId))!;
  }

  async findStudentById(id: string, tenantId: string): Promise<SchoolStudent | null> {
    const r = await this.db.prepare('SELECT * FROM school_students WHERE id=? AND tenant_id=?').bind(id, tenantId).first<StudentRow>();
    return r ? rowToStudent(r) : null;
  }

  async createFeesLog(input: CreateFeesLogInput): Promise<SchoolFeesLog> {
    if (!Number.isInteger(input.feeKobo) || input.feeKobo < 0) throw new Error('P9: feeKobo must be a non-negative integer');
    const paid = input.paidKobo ?? 0;
    if (!Number.isInteger(paid) || paid < 0) throw new Error('P9: paidKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    const outstanding = input.feeKobo - paid;
    await this.db.prepare('INSERT INTO school_fees_log (id,profile_id,tenant_id,student_ref_id,term,fee_kobo,paid_kobo,outstanding_kobo,payment_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.studentRefId, input.term, input.feeKobo, paid, outstanding, input.paymentDate ?? null, ts).run();
    return (await this.findFeesLogById(id, input.tenantId))!;
  }

  async findFeesLogById(id: string, tenantId: string): Promise<SchoolFeesLog | null> {
    const r = await this.db.prepare('SELECT * FROM school_fees_log WHERE id=? AND tenant_id=?').bind(id, tenantId).first<FeesRow>();
    return r ? rowToFees(r) : null;
  }

  async createTeacher(input: CreateTeacherInput): Promise<SchoolTeacher> {
    if (!Number.isInteger(input.monthlySalaryKobo) || input.monthlySalaryKobo < 0) throw new Error('P9: monthlySalaryKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO school_teachers (id,profile_id,tenant_id,teacher_name,qualification,assigned_class,monthly_salary_kobo,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.teacherName, input.qualification ?? null, input.assignedClass ?? null, input.monthlySalaryKobo, ts, ts).run();
    return (await this.findTeacherById(id, input.tenantId))!;
  }

  async findTeacherById(id: string, tenantId: string): Promise<SchoolTeacher | null> {
    const r = await this.db.prepare('SELECT * FROM school_teachers WHERE id=? AND tenant_id=?').bind(id, tenantId).first<TeacherRow>();
    return r ? rowToTeacher(r) : null;
  }
}
