/**
 * FuneralHomeRepository — M12
 * T3: all queries scoped to tenantId
 * P9: all monetary in kobo integers
 * L3 HITL MANDATORY for ALL AI calls
 * P13: case_ref_id opaque UUID — deceased identity NEVER in any column
 * FSM: seeded → claimed → mortuary_verified → active → suspended
 */

import type {
  FuneralHomeProfile, FuneralCase, FuneralService,
  FuneralHomeFSMState, BurialType, CaseStatus, ServiceType,
  CreateFuneralHomeInput, CreateCaseInput, CreateServiceInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; business_name: string; state_mortuary_permit: string | null; lg_burial_permit: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface CaseRow { id: string; profile_id: string; tenant_id: string; case_ref_id: string; family_contact_phone: string; burial_type: string; date_of_passing: number; burial_date: number | null; total_kobo: number; deposit_kobo: number; balance_kobo: number; burial_permit_ref: string | null; status: string; created_at: number; updated_at: number; }
interface ServiceRow { id: string; profile_id: string; tenant_id: string; case_ref_id: string; service_type: string; cost_kobo: number; created_at: number; }

function rowToProfile(r: ProfileRow): FuneralHomeProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, businessName: r.business_name, stateMortuaryPermit: r.state_mortuary_permit, lgBurialPermit: r.lg_burial_permit, cacRc: r.cac_rc, status: r.status as FuneralHomeFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToCase(r: CaseRow): FuneralCase { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, caseRefId: r.case_ref_id, familyContactPhone: r.family_contact_phone, burialType: r.burial_type as BurialType, dateOfPassing: r.date_of_passing, burialDate: r.burial_date, totalKobo: r.total_kobo, depositKobo: r.deposit_kobo, balanceKobo: r.balance_kobo, burialPermitRef: r.burial_permit_ref, status: r.status as CaseStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToService(r: ServiceRow): FuneralService { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, caseRefId: r.case_ref_id, serviceType: r.service_type as ServiceType, costKobo: r.cost_kobo, createdAt: r.created_at }; }

export class FuneralHomeRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateFuneralHomeInput): Promise<FuneralHomeProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO funeral_home_profiles (id,workspace_id,tenant_id,business_name,state_mortuary_permit,lg_burial_permit,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.businessName, input.stateMortuaryPermit ?? null, input.lgBurialPermit ?? null, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<FuneralHomeProfile | null> {
    const r = await this.db.prepare('SELECT * FROM funeral_home_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateStatus(id: string, tenantId: string, status: FuneralHomeFSMState): Promise<void> {
    await this.db.prepare('UPDATE funeral_home_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(status, now(), id, tenantId).run();
  }

  async createCase(input: CreateCaseInput): Promise<FuneralCase> {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(input.caseRefId)) throw new Error('case_ref_id must be an opaque UUID — no deceased identity allowed');
    if (!Number.isInteger(input.totalKobo) || input.totalKobo < 0) throw new Error('P9: totalKobo must be a non-negative integer');
    const depositKobo = input.depositKobo ?? 0;
    const balanceKobo = input.totalKobo - depositKobo;
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO funeral_cases (id,profile_id,tenant_id,case_ref_id,family_contact_phone,burial_type,date_of_passing,burial_date,total_kobo,deposit_kobo,balance_kobo,burial_permit_ref,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.caseRefId, input.familyContactPhone, input.burialType, input.dateOfPassing, input.burialDate ?? null, input.totalKobo, depositKobo, balanceKobo, input.burialPermitRef ?? null, 'active', ts, ts).run();
    return (await this.findCaseById(id, input.tenantId))!;
  }

  async findCaseById(id: string, tenantId: string): Promise<FuneralCase | null> {
    const r = await this.db.prepare('SELECT * FROM funeral_cases WHERE id=? AND tenant_id=?').bind(id, tenantId).first<CaseRow>();
    return r ? rowToCase(r) : null;
  }

  async createService(input: CreateServiceInput): Promise<FuneralService> {
    if (!Number.isInteger(input.costKobo) || input.costKobo < 0) throw new Error('P9: costKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO funeral_services (id,profile_id,tenant_id,case_ref_id,service_type,cost_kobo,created_at) VALUES (?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.caseRefId, input.serviceType, input.costKobo, ts).run();
    return (await this.findServiceById(id, input.tenantId))!;
  }

  async findServiceById(id: string, tenantId: string): Promise<FuneralService | null> {
    const r = await this.db.prepare('SELECT * FROM funeral_services WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ServiceRow>();
    return r ? rowToService(r) : null;
  }
}
