/**
 * @webwaka/verticals-ward-rep — Repository
 * M12 — T3, P9, P13 compliant
 * 3-state FSM; L3 HITL mandatory; registered_voters as INTEGER
 */
import type {
  WardRepProfile, CreateWardRepInput, UpdateWardRepInput, WardRepFSMState,
  WardPollingUnit, CreatePollingUnitInput,
  WardProject, CreateWardProjectInput,
  WardServiceRequest, CreateServiceRequestInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; councillor_name: string; ward_name: string; lga: string | null; state: string | null; inec_ward_code: string | null; status: string; created_at: number; updated_at: number; }
interface PuRow { id: string; profile_id: string; tenant_id: string; unit_number: string; address: string | null; registered_voters: number; created_at: number; updated_at: number; }
interface ProjRow { id: string; profile_id: string; tenant_id: string; project_name: string; category: string | null; amount_kobo: number; status: string; created_at: number; updated_at: number; }
interface SrRow { id: string; profile_id: string; tenant_id: string; request_type: string; description: string | null; ward: string | null; status: string; created_at: number; updated_at: number; }

const PC = 'id, workspace_id, tenant_id, councillor_name, ward_name, lga, state, inec_ward_code, status, created_at, updated_at';
const PUC = 'id, profile_id, tenant_id, unit_number, address, registered_voters, created_at, updated_at';
const PRC = 'id, profile_id, tenant_id, project_name, category, amount_kobo, status, created_at, updated_at';
const SRC = 'id, profile_id, tenant_id, request_type, description, ward, status, created_at, updated_at';

function rP(r: ProfileRow): WardRepProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, councillorName: r.councillor_name, wardName: r.ward_name, lga: r.lga, state: r.state, inecWardCode: r.inec_ward_code, status: r.status as WardRepFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rPu(r: PuRow): WardPollingUnit { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, unitNumber: r.unit_number, address: r.address, registeredVoters: r.registered_voters, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rPr(r: ProjRow): WardProject { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, projectName: r.project_name, category: r.category, amountKobo: r.amount_kobo, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rSr(r: SrRow): WardServiceRequest { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, requestType: r.request_type, description: r.description, ward: r.ward, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class WardRepRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateWardRepInput): Promise<WardRepProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO ward_rep_profiles (id, workspace_id, tenant_id, councillor_name, ward_name, lga, state, inec_ward_code, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`)
      .bind(id, input.workspaceId, input.tenantId, input.councillorName, input.wardName, input.lga ?? null, input.state ?? null, input.inecWardCode ?? null).run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[ward-rep] create failed');
    return p;
  }

  async findById(id: string, tenantId: string): Promise<WardRepProfile | null> {
    const row = await this.db.prepare(`SELECT ${PC} FROM ward_rep_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? rP(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<WardRepProfile[]> {
    const { results } = await this.db.prepare(`SELECT ${PC} FROM ward_rep_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<ProfileRow>();
    return (results ?? []).map(rP);
  }

  async update(id: string, tenantId: string, input: UpdateWardRepInput): Promise<WardRepProfile | null> {
    const sets: string[] = ['updated_at = unixepoch()']; const b: unknown[] = [];
    if (input.councillorName !== undefined) { sets.push('councillor_name = ?'); b.push(input.councillorName); }
    if (input.wardName !== undefined) { sets.push('ward_name = ?'); b.push(input.wardName); }
    if ('lga' in input) { sets.push('lga = ?'); b.push(input.lga ?? null); }
    if ('state' in input) { sets.push('state = ?'); b.push(input.state ?? null); }
    if ('inecWardCode' in input) { sets.push('inec_ward_code = ?'); b.push(input.inecWardCode ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE ward_rep_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, to: WardRepFSMState): Promise<WardRepProfile | null> {
    return this.update(id, tenantId, { status: to });
  }

  async createPollingUnit(input: CreatePollingUnitInput): Promise<WardPollingUnit> {
    if (!Number.isInteger(input.registeredVoters ?? 0) || (input.registeredVoters ?? 0) < 0) throw new Error('[ward-rep] registeredVoters must be a non-negative integer');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO ward_polling_units (id, profile_id, tenant_id, unit_number, address, registered_voters, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.unitNumber, input.address ?? null, input.registeredVoters ?? 0).run();
    const row = await this.db.prepare(`SELECT ${PUC} FROM ward_polling_units WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<PuRow>();
    if (!row) throw new Error('[ward-rep] createPollingUnit failed');
    return rPu(row);
  }

  async createProject(input: CreateWardProjectInput): Promise<WardProject> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo < 0) throw new Error('[ward-rep] amountKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO ward_projects (id, profile_id, tenant_id, project_name, category, amount_kobo, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.projectName, input.category ?? null, input.amountKobo, input.status ?? 'planned').run();
    const row = await this.db.prepare(`SELECT ${PRC} FROM ward_projects WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<ProjRow>();
    if (!row) throw new Error('[ward-rep] createProject failed');
    return rPr(row);
  }

  async createServiceRequest(input: CreateServiceRequestInput): Promise<WardServiceRequest> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO ward_service_requests (id, profile_id, tenant_id, request_type, description, ward, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'received', unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.requestType, input.description ?? null, input.ward ?? null).run();
    const row = await this.db.prepare(`SELECT ${SRC} FROM ward_service_requests WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<SrRow>();
    if (!row) throw new Error('[ward-rep] createServiceRequest failed');
    return rSr(row);
  }
}
