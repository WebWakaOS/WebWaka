/**
 * TrainingInstituteRepository — M9
 * T3: all queries scoped to tenantId
 * P9: course_fee_kobo / enrolment_fee_kobo / exam_fee_kobo are integers
 * P13: student_ref_id is opaque UUID
 */

import type {
  TrainingInstituteProfile, TiCourse, TiStudent, TiTrainer,
  TrainingInstituteFSMState,
  CreateTrainingInstituteInput, UpdateTrainingInstituteInput,
  CreateCourseInput, CreateStudentInput, CreateTrainerInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; institute_name: string; nbte_accreditation: string | null; itf_registration: string | null; nabteb_centre_number: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface CourseRow { id: string; profile_id: string; tenant_id: string; course_name: string; trade_area: string | null; duration_weeks: number; course_fee_kobo: number; nbte_approval_number: string | null; created_at: number; updated_at: number; }
interface StudentRow { id: string; profile_id: string; tenant_id: string; student_ref_id: string; course_id: string; enrolment_date: number | null; enrolment_fee_kobo: number; exam_fee_kobo: number; nabteb_reg_number: string | null; siwes_placement: number; cert_issued: number; created_at: number; updated_at: number; }
interface TrainerRow { id: string; profile_id: string; tenant_id: string; trainer_name: string; qualification: string | null; assigned_courses: string | null; created_at: number; updated_at: number; }

function rowToProfile(r: ProfileRow): TrainingInstituteProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, instituteName: r.institute_name, nbteAccreditation: r.nbte_accreditation, itfRegistration: r.itf_registration, nabtebCentreNumber: r.nabteb_centre_number, cacRc: r.cac_rc, status: r.status as TrainingInstituteFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToCourse(r: CourseRow): TiCourse { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, courseName: r.course_name, tradeArea: r.trade_area, durationWeeks: r.duration_weeks, courseFeeKobo: r.course_fee_kobo, nbteApprovalNumber: r.nbte_approval_number, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToStudent(r: StudentRow): TiStudent { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, studentRefId: r.student_ref_id, courseId: r.course_id, enrolmentDate: r.enrolment_date, enrolmentFeeKobo: r.enrolment_fee_kobo, examFeeKobo: r.exam_fee_kobo, nabtebRegNumber: r.nabteb_reg_number, siwesPlacement: r.siwes_placement === 1, certIssued: r.cert_issued === 1, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToTrainer(r: TrainerRow): TiTrainer { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, trainerName: r.trainer_name, qualification: r.qualification, assignedCourses: r.assigned_courses, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class TrainingInstituteRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateTrainingInstituteInput): Promise<TrainingInstituteProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO training_institute_profiles (id,workspace_id,tenant_id,institute_name,nbte_accreditation,itf_registration,nabteb_centre_number,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.instituteName, input.nbteAccreditation ?? null, input.itfRegistration ?? null, input.nabtebCentreNumber ?? null, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<TrainingInstituteProfile | null> {
    const r = await this.db.prepare('SELECT * FROM training_institute_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateProfile(id: string, tenantId: string, patch: UpdateTrainingInstituteInput): Promise<void> {
    const ts = now();
    if (patch.nbteAccreditation !== undefined) await this.db.prepare('UPDATE training_institute_profiles SET nbte_accreditation=?,updated_at=? WHERE id=? AND tenant_id=?').bind(patch.nbteAccreditation, ts, id, tenantId).run();
    if (patch.instituteName !== undefined) await this.db.prepare('UPDATE training_institute_profiles SET institute_name=?,updated_at=? WHERE id=? AND tenant_id=?').bind(patch.instituteName, ts, id, tenantId).run();
  }

  async transition(id: string, tenantId: string, to: TrainingInstituteFSMState): Promise<TrainingInstituteProfile> {
    await this.db.prepare('UPDATE training_institute_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async createCourse(input: CreateCourseInput): Promise<TiCourse> {
    if (!Number.isInteger(input.courseFeeKobo) || input.courseFeeKobo < 0) throw new Error('P9: courseFeeKobo must be a non-negative integer');
    if (!Number.isInteger(input.durationWeeks) || input.durationWeeks < 1) throw new Error('durationWeeks must be a positive integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO ti_courses (id,profile_id,tenant_id,course_name,trade_area,duration_weeks,course_fee_kobo,nbte_approval_number,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.courseName, input.tradeArea ?? null, input.durationWeeks, input.courseFeeKobo, input.nbteApprovalNumber ?? null, ts, ts).run();
    return (await this.findCourseById(id, input.tenantId))!;
  }

  async findCourseById(id: string, tenantId: string): Promise<TiCourse | null> {
    const r = await this.db.prepare('SELECT * FROM ti_courses WHERE id=? AND tenant_id=?').bind(id, tenantId).first<CourseRow>();
    return r ? rowToCourse(r) : null;
  }

  async listCourses(profileId: string, tenantId: string): Promise<TiCourse[]> {
    const { results } = await this.db.prepare('SELECT * FROM ti_courses WHERE profile_id=? AND tenant_id=?').bind(profileId, tenantId).all<CourseRow>();
    return results.map(rowToCourse);
  }

  async createStudent(input: CreateStudentInput): Promise<TiStudent> {
    if (!Number.isInteger(input.enrolmentFeeKobo) || input.enrolmentFeeKobo < 0) throw new Error('P9: enrolmentFeeKobo must be a non-negative integer');
    const examFee = input.examFeeKobo ?? 0;
    if (!Number.isInteger(examFee) || examFee < 0) throw new Error('P9: examFeeKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    const refId = input.studentRefId ?? uuid();
    await this.db.prepare('INSERT INTO ti_students (id,profile_id,tenant_id,student_ref_id,course_id,enrolment_date,enrolment_fee_kobo,exam_fee_kobo,nabteb_reg_number,siwes_placement,cert_issued,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, refId, input.courseId, ts, input.enrolmentFeeKobo, examFee, input.nabtebRegNumber ?? null, 0, 0, ts, ts).run();
    return (await this.findStudentById(id, input.tenantId))!;
  }

  async findStudentById(id: string, tenantId: string): Promise<TiStudent | null> {
    const r = await this.db.prepare('SELECT * FROM ti_students WHERE id=? AND tenant_id=?').bind(id, tenantId).first<StudentRow>();
    return r ? rowToStudent(r) : null;
  }

  async setSiwesPlacement(id: string, tenantId: string): Promise<void> {
    await this.db.prepare('UPDATE ti_students SET siwes_placement=1,updated_at=? WHERE id=? AND tenant_id=?').bind(now(), id, tenantId).run();
  }

  async issueCertificate(id: string, tenantId: string): Promise<void> {
    await this.db.prepare('UPDATE ti_students SET cert_issued=1,updated_at=? WHERE id=? AND tenant_id=?').bind(now(), id, tenantId).run();
  }

  async createTrainer(input: CreateTrainerInput): Promise<TiTrainer> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO ti_trainers (id,profile_id,tenant_id,trainer_name,qualification,assigned_courses,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.trainerName, input.qualification ?? null, input.assignedCourses ?? null, ts, ts).run();
    return (await this.findTrainerById(id, input.tenantId))!;
  }

  async findTrainerById(id: string, tenantId: string): Promise<TiTrainer | null> {
    const r = await this.db.prepare('SELECT * FROM ti_trainers WHERE id=? AND tenant_id=?').bind(id, tenantId).first<TrainerRow>();
    return r ? rowToTrainer(r) : null;
  }
}
