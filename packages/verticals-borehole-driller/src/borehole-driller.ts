import type {
  BoreholeDrillerProfile, CreateBoreholeDrillerInput, UpdateBoreholeDrillerInput,
  BoreholeDrillerFSMState, BoreholeProject, CreateBoreholeProjectInput,
  BoreholeProjectStatus, BoreholeRig, CreateBoreholeRigInput, RigStatus,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, company_name, coren_number, state_water_board_reg, cac_rc, rig_count, status, created_at, updated_at';
const PROJECT_COLS = 'id, workspace_id, tenant_id, client_phone, location_address, state, depth_metres, casing_type, total_cost_kobo, deposit_kobo, balance_kobo, water_board_approval_number, status, created_at, updated_at';
const RIG_COLS = 'id, workspace_id, tenant_id, rig_name, rig_capacity_metres, current_project_id, status, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): BoreholeDrillerProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, companyName: r['company_name'] as string, corenNumber: r['coren_number'] as string | null, stateWaterBoardReg: r['state_water_board_reg'] as string | null, cacRc: r['cac_rc'] as string | null, rigCount: r['rig_count'] as number, status: r['status'] as BoreholeDrillerFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToProject(r: Record<string, unknown>): BoreholeProject {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, clientPhone: r['client_phone'] as string, locationAddress: r['location_address'] as string, state: r['state'] as string | null, depthMetres: r['depth_metres'] as number, casingType: r['casing_type'] as string | null, totalCostKobo: r['total_cost_kobo'] as number, depositKobo: r['deposit_kobo'] as number, balanceKobo: r['balance_kobo'] as number, waterBoardApprovalNumber: r['water_board_approval_number'] as string | null, status: r['status'] as BoreholeProjectStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToRig(r: Record<string, unknown>): BoreholeRig {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, rigName: r['rig_name'] as string, rigCapacityMetres: r['rig_capacity_metres'] as number, currentProjectId: r['current_project_id'] as string | null, status: r['status'] as RigStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class BoreholeDrillerRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateBoreholeDrillerInput): Promise<BoreholeDrillerProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO borehole_driller_profiles (id, workspace_id, tenant_id, company_name, coren_number, state_water_board_reg, cac_rc, rig_count, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.companyName, input.corenNumber ?? null, input.stateWaterBoardReg ?? null, input.cacRc ?? null, input.rigCount ?? 0).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[borehole-driller] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<BoreholeDrillerProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM borehole_driller_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<BoreholeDrillerProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM borehole_driller_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateBoreholeDrillerInput): Promise<BoreholeDrillerProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.companyName !== undefined) { sets.push('company_name = ?'); vals.push(input.companyName); }
    if (input.corenNumber !== undefined) { sets.push('coren_number = ?'); vals.push(input.corenNumber); }
    if (input.stateWaterBoardReg !== undefined) { sets.push('state_water_board_reg = ?'); vals.push(input.stateWaterBoardReg); }
    if (input.cacRc !== undefined) { sets.push('cac_rc = ?'); vals.push(input.cacRc); }
    if (input.rigCount !== undefined) { sets.push('rig_count = ?'); vals.push(input.rigCount); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE borehole_driller_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: BoreholeDrillerFSMState): Promise<BoreholeDrillerProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createProject(input: CreateBoreholeProjectInput): Promise<BoreholeProject> {
    if (!Number.isInteger(input.depthMetres) || input.depthMetres <= 0) throw new Error('[borehole-driller] depthMetres must be positive integer (P9)');
    if (!Number.isInteger(input.totalCostKobo) || input.totalCostKobo <= 0) throw new Error('[borehole-driller] totalCostKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    const deposit = input.depositKobo ?? 0;
    const balance = input.balanceKobo ?? input.totalCostKobo - deposit;
    await this.db.prepare(`INSERT INTO borehole_projects (id, workspace_id, tenant_id, client_phone, location_address, state, depth_metres, casing_type, total_cost_kobo, deposit_kobo, balance_kobo, water_board_approval_number, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'survey', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.clientPhone, input.locationAddress, input.state ?? null, input.depthMetres, input.casingType ?? null, input.totalCostKobo, deposit, balance, input.waterBoardApprovalNumber ?? null).run();
    const p = await this.findProjectById(id, input.tenantId);
    if (!p) throw new Error('[borehole-driller] project create failed');
    return p;
  }

  async findProjectById(id: string, tenantId: string): Promise<BoreholeProject | null> {
    const row = await this.db.prepare(`SELECT ${PROJECT_COLS} FROM borehole_projects WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProject(row) : null;
  }

  async listProjects(workspaceId: string, tenantId: string): Promise<BoreholeProject[]> {
    const { results } = await this.db.prepare(`SELECT ${PROJECT_COLS} FROM borehole_projects WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToProject);
  }

  async updateProjectStatus(id: string, tenantId: string, status: BoreholeProjectStatus): Promise<BoreholeProject | null> {
    await this.db.prepare(`UPDATE borehole_projects SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findProjectById(id, tenantId);
  }

  async createRig(input: CreateBoreholeRigInput): Promise<BoreholeRig> {
    if (!Number.isInteger(input.rigCapacityMetres) || input.rigCapacityMetres <= 0) throw new Error('[borehole-driller] rigCapacityMetres must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO borehole_rigs (id, workspace_id, tenant_id, rig_name, rig_capacity_metres, current_project_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'available', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.rigName, input.rigCapacityMetres, input.currentProjectId ?? null).run();
    const r = await this.findRigById(id, input.tenantId);
    if (!r) throw new Error('[borehole-driller] rig create failed');
    return r;
  }

  async findRigById(id: string, tenantId: string): Promise<BoreholeRig | null> {
    const row = await this.db.prepare(`SELECT ${RIG_COLS} FROM borehole_rigs WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToRig(row) : null;
  }

  async listRigs(workspaceId: string, tenantId: string): Promise<BoreholeRig[]> {
    const { results } = await this.db.prepare(`SELECT ${RIG_COLS} FROM borehole_rigs WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToRig);
  }

  async updateRigStatus(id: string, tenantId: string, status: RigStatus, currentProjectId?: string | null): Promise<BoreholeRig | null> {
    await this.db.prepare(`UPDATE borehole_rigs SET status = ?, current_project_id = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, currentProjectId ?? null, id, tenantId).run();
    return this.findRigById(id, tenantId);
  }
}
