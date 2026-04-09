import type {
  CleaningCompanyProfile, CreateCleaningCompanyInput, UpdateCleaningCompanyInput,
  CleaningCompanyFSMState, FmContract, CreateFmContractInput, ContractStatus,
  FmStaffDeployment, CreateFmStaffDeploymentInput, FmSupply, CreateFmSupplyInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, company_name, cac_rc, bpp_registration, fmenv_cert, status, created_at, updated_at';
const CONTRACT_COLS = 'id, workspace_id, tenant_id, client_name, client_phone, sites_count, monthly_fee_kobo, contract_start, contract_end, status, created_at, updated_at';
const STAFF_COLS = 'id, workspace_id, tenant_id, contract_id, staff_name, site_name, shift_type, monthly_salary_kobo, created_at, updated_at';
const SUPPLY_COLS = 'id, workspace_id, tenant_id, supply_name, quantity, unit_cost_kobo, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): CleaningCompanyProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, companyName: r['company_name'] as string, cacRc: r['cac_rc'] as string | null, bppRegistration: r['bpp_registration'] as string | null, fmenvCert: r['fmenv_cert'] as string | null, status: r['status'] as CleaningCompanyFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToContract(r: Record<string, unknown>): FmContract {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, clientName: r['client_name'] as string, clientPhone: r['client_phone'] as string, sitesCount: r['sites_count'] as number, monthlyFeeKobo: r['monthly_fee_kobo'] as number, contractStart: r['contract_start'] as number | null, contractEnd: r['contract_end'] as number | null, status: r['status'] as ContractStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToStaff(r: Record<string, unknown>): FmStaffDeployment {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, contractId: r['contract_id'] as string, staffName: r['staff_name'] as string, siteName: r['site_name'] as string, shiftType: r['shift_type'] as string | null, monthlySalaryKobo: r['monthly_salary_kobo'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToSupply(r: Record<string, unknown>): FmSupply {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, supplyName: r['supply_name'] as string, quantity: r['quantity'] as number, unitCostKobo: r['unit_cost_kobo'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class CleaningCompanyRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateCleaningCompanyInput): Promise<CleaningCompanyProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO cleaning_company_profiles (id, workspace_id, tenant_id, company_name, cac_rc, bpp_registration, fmenv_cert, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.companyName, input.cacRc ?? null, input.bppRegistration ?? null, input.fmenvCert ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[cleaning-company] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<CleaningCompanyProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM cleaning_company_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<CleaningCompanyProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM cleaning_company_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateCleaningCompanyInput): Promise<CleaningCompanyProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.companyName !== undefined) { sets.push('company_name = ?'); vals.push(input.companyName); }
    if (input.cacRc !== undefined) { sets.push('cac_rc = ?'); vals.push(input.cacRc); }
    if (input.bppRegistration !== undefined) { sets.push('bpp_registration = ?'); vals.push(input.bppRegistration); }
    if (input.fmenvCert !== undefined) { sets.push('fmenv_cert = ?'); vals.push(input.fmenvCert); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE cleaning_company_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: CleaningCompanyFSMState): Promise<CleaningCompanyProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createContract(input: CreateFmContractInput): Promise<FmContract> {
    if (!Number.isInteger(input.monthlyFeeKobo) || input.monthlyFeeKobo <= 0) throw new Error('[cleaning-company] monthlyFeeKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO fm_contracts (id, workspace_id, tenant_id, client_name, client_phone, sites_count, monthly_fee_kobo, contract_start, contract_end, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.clientName, input.clientPhone, input.sitesCount ?? 1, input.monthlyFeeKobo, input.contractStart ?? null, input.contractEnd ?? null).run();
    const c = await this.findContractById(id, input.tenantId);
    if (!c) throw new Error('[cleaning-company] contract create failed');
    return c;
  }

  async findContractById(id: string, tenantId: string): Promise<FmContract | null> {
    const row = await this.db.prepare(`SELECT ${CONTRACT_COLS} FROM fm_contracts WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToContract(row) : null;
  }

  async listContracts(workspaceId: string, tenantId: string): Promise<FmContract[]> {
    const { results } = await this.db.prepare(`SELECT ${CONTRACT_COLS} FROM fm_contracts WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToContract);
  }

  async updateContractStatus(id: string, tenantId: string, status: ContractStatus): Promise<FmContract | null> {
    await this.db.prepare(`UPDATE fm_contracts SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findContractById(id, tenantId);
  }

  async createStaffDeployment(input: CreateFmStaffDeploymentInput): Promise<FmStaffDeployment> {
    if (!Number.isInteger(input.monthlySalaryKobo) || input.monthlySalaryKobo <= 0) throw new Error('[cleaning-company] monthlySalaryKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO fm_staff_deployments (id, workspace_id, tenant_id, contract_id, staff_name, site_name, shift_type, monthly_salary_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.contractId, input.staffName, input.siteName, input.shiftType ?? null, input.monthlySalaryKobo).run();
    const s = await this.findStaffDeploymentById(id, input.tenantId);
    if (!s) throw new Error('[cleaning-company] staff deployment create failed');
    return s;
  }

  async findStaffDeploymentById(id: string, tenantId: string): Promise<FmStaffDeployment | null> {
    const row = await this.db.prepare(`SELECT ${STAFF_COLS} FROM fm_staff_deployments WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToStaff(row) : null;
  }

  async listStaffDeployments(contractId: string, tenantId: string): Promise<FmStaffDeployment[]> {
    const { results } = await this.db.prepare(`SELECT ${STAFF_COLS} FROM fm_staff_deployments WHERE contract_id = ? AND tenant_id = ? ORDER BY created_at ASC`).bind(contractId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToStaff);
  }

  async createSupply(input: CreateFmSupplyInput): Promise<FmSupply> {
    if (!Number.isInteger(input.unitCostKobo) || input.unitCostKobo <= 0) throw new Error('[cleaning-company] unitCostKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO fm_supplies (id, workspace_id, tenant_id, supply_name, quantity, unit_cost_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.supplyName, input.quantity ?? 0, input.unitCostKobo).run();
    const s = await this.findSupplyById(id, input.tenantId);
    if (!s) throw new Error('[cleaning-company] supply create failed');
    return s;
  }

  async findSupplyById(id: string, tenantId: string): Promise<FmSupply | null> {
    const row = await this.db.prepare(`SELECT ${SUPPLY_COLS} FROM fm_supplies WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToSupply(row) : null;
  }

  async listSupplies(workspaceId: string, tenantId: string): Promise<FmSupply[]> {
    const { results } = await this.db.prepare(`SELECT ${SUPPLY_COLS} FROM fm_supplies WHERE workspace_id = ? AND tenant_id = ? ORDER BY supply_name ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToSupply);
  }
}
