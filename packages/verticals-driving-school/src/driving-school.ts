/**
 * DrivingSchoolRepository — M9
 * T3: all queries scoped to tenantId
 * P9: enrolment_fee_kobo / purchase_cost_kobo are integers
 * P13: student_ref_id is opaque UUID — no student names in D1
 */

import type {
  DrivingSchoolProfile, DsStudent, DsLesson, DsVehicle,
  DrivingSchoolFSMState, CourseType, LessonType,
  CreateDrivingSchoolInput, UpdateDrivingSchoolInput,
  CreateStudentInput, CreateLessonInput, CreateVehicleInput,
} from './types.js';

interface D1Like {
  prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; };
}

function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; school_name: string; frsc_registration: string | null; state: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface StudentRow { id: string; profile_id: string; tenant_id: string; student_ref_id: string; course_type: string; enrolment_fee_kobo: number; lessons_paid: number; start_date: number | null; frsc_test_date: number | null; test_status: string; cert_issued: number; created_at: number; updated_at: number; }
interface LessonRow { id: string; profile_id: string; tenant_id: string; student_ref_id: string; instructor_id: string; vehicle_id: string; lesson_date: number; lesson_type: string; attended: number; created_at: number; }
interface VehicleRow { id: string; profile_id: string; tenant_id: string; vehicle_plate: string; type: string; purchase_cost_kobo: number; last_service_date: number | null; status: string; created_at: number; updated_at: number; }

function rowToProfile(r: ProfileRow): DrivingSchoolProfile {
  return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, schoolName: r.school_name, frscRegistration: r.frsc_registration, state: r.state, cacRc: r.cac_rc, status: r.status as DrivingSchoolFSMState, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToStudent(r: StudentRow): DsStudent {
  return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, studentRefId: r.student_ref_id, courseType: r.course_type as CourseType, enrolmentFeeKobo: r.enrolment_fee_kobo, lessonsPaid: r.lessons_paid, startDate: r.start_date, frscTestDate: r.frsc_test_date, testStatus: r.test_status as DsStudent['testStatus'], certIssued: r.cert_issued === 1, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToLesson(r: LessonRow): DsLesson {
  return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, studentRefId: r.student_ref_id, instructorId: r.instructor_id, vehicleId: r.vehicle_id, lessonDate: r.lesson_date, lessonType: r.lesson_type as LessonType, attended: r.attended === 1, createdAt: r.created_at };
}
function rowToVehicle(r: VehicleRow): DsVehicle {
  return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, vehiclePlate: r.vehicle_plate, type: r.type as CourseType, purchaseCostKobo: r.purchase_cost_kobo, lastServiceDate: r.last_service_date, status: r.status as DsVehicle['status'], createdAt: r.created_at, updatedAt: r.updated_at };
}

export class DrivingSchoolRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateDrivingSchoolInput): Promise<DrivingSchoolProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO driving_school_profiles (id,workspace_id,tenant_id,school_name,frsc_registration,state,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.schoolName, input.frscRegistration ?? null, input.state ?? null, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<DrivingSchoolProfile | null> {
    const r = await this.db.prepare('SELECT * FROM driving_school_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateProfile(id: string, tenantId: string, patch: UpdateDrivingSchoolInput): Promise<void> {
    const ts = now();
    if (patch.frscRegistration !== undefined) await this.db.prepare('UPDATE driving_school_profiles SET frsc_registration=?,updated_at=? WHERE id=? AND tenant_id=?').bind(patch.frscRegistration, ts, id, tenantId).run();
    if (patch.schoolName !== undefined) await this.db.prepare('UPDATE driving_school_profiles SET school_name=?,updated_at=? WHERE id=? AND tenant_id=?').bind(patch.schoolName, ts, id, tenantId).run();
  }

  async transition(id: string, tenantId: string, to: DrivingSchoolFSMState): Promise<DrivingSchoolProfile> {
    const ts = now();
    await this.db.prepare('UPDATE driving_school_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, ts, id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async createStudent(input: CreateStudentInput): Promise<DsStudent> {
    if (!Number.isInteger(input.enrolmentFeeKobo) || input.enrolmentFeeKobo < 0) throw new Error('P9: enrolmentFeeKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    const refId = input.studentRefId ?? uuid();
    await this.db.prepare('INSERT INTO ds_students (id,profile_id,tenant_id,student_ref_id,course_type,enrolment_fee_kobo,lessons_paid,start_date,frsc_test_date,test_status,cert_issued,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, refId, input.courseType ?? 'car', input.enrolmentFeeKobo, input.lessonsPaid ?? 0, null, null, 'pending', 0, ts, ts).run();
    return (await this.findStudentById(id, input.tenantId))!;
  }

  async findStudentById(id: string, tenantId: string): Promise<DsStudent | null> {
    const r = await this.db.prepare('SELECT * FROM ds_students WHERE id=? AND tenant_id=?').bind(id, tenantId).first<StudentRow>();
    return r ? rowToStudent(r) : null;
  }

  async listStudents(profileId: string, tenantId: string): Promise<DsStudent[]> {
    const { results } = await this.db.prepare('SELECT * FROM ds_students WHERE profile_id=? AND tenant_id=?').bind(profileId, tenantId).all<StudentRow>();
    return results.map(rowToStudent);
  }

  async setTestDate(id: string, tenantId: string, frscTestDate: number): Promise<void> {
    await this.db.prepare('UPDATE ds_students SET frsc_test_date=?,test_status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(frscTestDate, 'booked', now(), id, tenantId).run();
  }

  async issueCertificate(id: string, tenantId: string): Promise<void> {
    await this.db.prepare('UPDATE ds_students SET cert_issued=1,test_status=?,updated_at=? WHERE id=? AND tenant_id=?').bind('passed', now(), id, tenantId).run();
  }

  async createLesson(input: CreateLessonInput): Promise<DsLesson> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO ds_lessons (id,profile_id,tenant_id,student_ref_id,instructor_id,vehicle_id,lesson_date,lesson_type,attended,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.studentRefId, input.instructorId, input.vehicleId, input.lessonDate, input.lessonType ?? 'practical', 0, ts).run();
    return (await this.findLessonById(id, input.tenantId))!;
  }

  async findLessonById(id: string, tenantId: string): Promise<DsLesson | null> {
    const r = await this.db.prepare('SELECT * FROM ds_lessons WHERE id=? AND tenant_id=?').bind(id, tenantId).first<LessonRow>();
    return r ? rowToLesson(r) : null;
  }

  async createVehicle(input: CreateVehicleInput): Promise<DsVehicle> {
    if (!Number.isInteger(input.purchaseCostKobo) || input.purchaseCostKobo < 0) throw new Error('P9: purchaseCostKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO ds_vehicles (id,profile_id,tenant_id,vehicle_plate,type,purchase_cost_kobo,last_service_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.vehiclePlate, input.type ?? 'car', input.purchaseCostKobo, null, 'active', ts, ts).run();
    return (await this.findVehicleById(id, input.tenantId))!;
  }

  async findVehicleById(id: string, tenantId: string): Promise<DsVehicle | null> {
    const r = await this.db.prepare('SELECT * FROM ds_vehicles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<VehicleRow>();
    return r ? rowToVehicle(r) : null;
  }

  async listVehicles(profileId: string, tenantId: string): Promise<DsVehicle[]> {
    const { results } = await this.db.prepare('SELECT * FROM ds_vehicles WHERE profile_id=? AND tenant_id=?').bind(profileId, tenantId).all<VehicleRow>();
    return results.map(rowToVehicle);
  }
}
