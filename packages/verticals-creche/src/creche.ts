/**
 * CrecheRepository — M12
 * T3: all queries scoped to tenantId
 * P9: monthly_fee_kobo / fee_kobo are integers
 * P13: child_ref_id is opaque UUID — MOST SENSITIVE; no child PII in D1 linked fields
 * L3 HITL mandatory for ALL AI
 */

import type {
  CrecheProfile, CrecheChild, CrecheAttendance, CrecheBilling,
  CrecheFSMState,
  CreateCrecheInput, UpdateCrecheInput,
  CreateChildInput, CreateAttendanceInput, CreateBillingInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; creche_name: string; subeb_registration: string | null; state_social_welfare_cert: string | null; cac_rc: string | null; capacity: number; status: string; created_at: number; updated_at: number; }
interface ChildRow { id: string; profile_id: string; tenant_id: string; child_ref_id: string; age_months: number; admission_date: number | null; monthly_fee_kobo: number; status: string; created_at: number; updated_at: number; }
interface AttendanceRow { id: string; profile_id: string; tenant_id: string; child_ref_id: string; attendance_date: number; present: number; created_at: number; }
interface BillingRow { id: string; profile_id: string; tenant_id: string; child_ref_id: string; billing_period: string; fee_kobo: number; paid_kobo: number; outstanding_kobo: number; created_at: number; updated_at: number; }

function rowToProfile(r: ProfileRow): CrecheProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, crecheName: r.creche_name, subebRegistration: r.subeb_registration, stateSocialWelfareCert: r.state_social_welfare_cert, cacRc: r.cac_rc, capacity: r.capacity, status: r.status as CrecheFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToChild(r: ChildRow): CrecheChild { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, childRefId: r.child_ref_id, ageMonths: r.age_months, admissionDate: r.admission_date, monthlyFeeKobo: r.monthly_fee_kobo, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToAttendance(r: AttendanceRow): CrecheAttendance { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, childRefId: r.child_ref_id, attendanceDate: r.attendance_date, present: r.present === 1, createdAt: r.created_at }; }
function rowToBilling(r: BillingRow): CrecheBilling { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, childRefId: r.child_ref_id, billingPeriod: r.billing_period, feeKobo: r.fee_kobo, paidKobo: r.paid_kobo, outstandingKobo: r.outstanding_kobo, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class CrecheRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateCrecheInput): Promise<CrecheProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO creche_profiles (id,workspace_id,tenant_id,creche_name,subeb_registration,state_social_welfare_cert,cac_rc,capacity,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.crecheName, input.subebRegistration ?? null, input.stateSocialWelfareCert ?? null, input.cacRc ?? null, input.capacity ?? 0, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<CrecheProfile | null> {
    const r = await this.db.prepare('SELECT * FROM creche_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateProfile(id: string, tenantId: string, patch: UpdateCrecheInput): Promise<void> {
    const ts = now();
    if (patch.subebRegistration !== undefined) await this.db.prepare('UPDATE creche_profiles SET subeb_registration=?,updated_at=? WHERE id=? AND tenant_id=?').bind(patch.subebRegistration, ts, id, tenantId).run();
    if (patch.crecheName !== undefined) await this.db.prepare('UPDATE creche_profiles SET creche_name=?,updated_at=? WHERE id=? AND tenant_id=?').bind(patch.crecheName, ts, id, tenantId).run();
  }

  async transition(id: string, tenantId: string, to: CrecheFSMState): Promise<CrecheProfile> {
    await this.db.prepare('UPDATE creche_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async createChild(input: CreateChildInput): Promise<CrecheChild> {
    if (!Number.isInteger(input.monthlyFeeKobo) || input.monthlyFeeKobo < 0) throw new Error('P9: monthlyFeeKobo must be a non-negative integer');
    if (!Number.isInteger(input.ageMonths) || input.ageMonths < 0) throw new Error('ageMonths must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    const refId = input.childRefId ?? uuid();
    await this.db.prepare('INSERT INTO creche_children (id,profile_id,tenant_id,child_ref_id,age_months,admission_date,monthly_fee_kobo,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, refId, input.ageMonths, input.admissionDate ?? ts, input.monthlyFeeKobo, 'active', ts, ts).run();
    return (await this.findChildById(id, input.tenantId))!;
  }

  async findChildById(id: string, tenantId: string): Promise<CrecheChild | null> {
    const r = await this.db.prepare('SELECT * FROM creche_children WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ChildRow>();
    return r ? rowToChild(r) : null;
  }

  async listChildren(profileId: string, tenantId: string): Promise<CrecheChild[]> {
    const { results } = await this.db.prepare('SELECT * FROM creche_children WHERE profile_id=? AND tenant_id=?').bind(profileId, tenantId).all<ChildRow>();
    return results.map(rowToChild);
  }

  async recordAttendance(input: CreateAttendanceInput): Promise<CrecheAttendance> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO creche_attendance (id,profile_id,tenant_id,child_ref_id,attendance_date,present,created_at) VALUES (?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.childRefId, input.attendanceDate, input.present ? 1 : 0, ts).run();
    return (await this.findAttendanceById(id, input.tenantId))!;
  }

  async findAttendanceById(id: string, tenantId: string): Promise<CrecheAttendance | null> {
    const r = await this.db.prepare('SELECT * FROM creche_attendance WHERE id=? AND tenant_id=?').bind(id, tenantId).first<AttendanceRow>();
    return r ? rowToAttendance(r) : null;
  }

  async createBilling(input: CreateBillingInput): Promise<CrecheBilling> {
    if (!Number.isInteger(input.feeKobo) || input.feeKobo < 0) throw new Error('P9: feeKobo must be a non-negative integer');
    const paidKobo = input.paidKobo ?? 0;
    if (!Number.isInteger(paidKobo) || paidKobo < 0) throw new Error('P9: paidKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    const outstanding = input.feeKobo - paidKobo;
    await this.db.prepare('INSERT INTO creche_billing (id,profile_id,tenant_id,child_ref_id,billing_period,fee_kobo,paid_kobo,outstanding_kobo,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.childRefId, input.billingPeriod, input.feeKobo, paidKobo, outstanding, ts, ts).run();
    return (await this.findBillingById(id, input.tenantId))!;
  }

  async findBillingById(id: string, tenantId: string): Promise<CrecheBilling | null> {
    const r = await this.db.prepare('SELECT * FROM creche_billing WHERE id=? AND tenant_id=?').bind(id, tenantId).first<BillingRow>();
    return r ? rowToBilling(r) : null;
  }
}
