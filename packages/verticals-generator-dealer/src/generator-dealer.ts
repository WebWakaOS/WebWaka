import type {
  GeneratorDealerProfile, CreateGeneratorDealerInput, UpdateGeneratorDealerInput,
  GeneratorDealerFSMState, GeneratorUnit, CreateGeneratorUnitInput, GeneratorUnitStatus,
  GeneratorServiceJob, CreateGeneratorServiceJobInput, ServiceJobStatus,
  GeneratorSparePart, CreateGeneratorSparePartInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, company_name, cac_rc, son_dealership, dpr_fuel_licence, status, created_at, updated_at';
const UNIT_COLS = 'id, workspace_id, tenant_id, brand, kva, serial_number, sale_price_kobo, warranty_months, status, created_at, updated_at';
const JOB_COLS = 'id, workspace_id, tenant_id, unit_serial, client_phone, fault_description, labour_kobo, parts_kobo, total_kobo, status, created_at, updated_at';
const PART_COLS = 'id, workspace_id, tenant_id, part_name, compatible_brands, quantity, unit_cost_kobo, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): GeneratorDealerProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, companyName: r['company_name'] as string, cacRc: r['cac_rc'] as string | null, sonDealership: r['son_dealership'] as string | null, dprFuelLicence: r['dpr_fuel_licence'] as string | null, status: r['status'] as GeneratorDealerFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToUnit(r: Record<string, unknown>): GeneratorUnit {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, brand: r['brand'] as string, kva: r['kva'] as number, serialNumber: r['serial_number'] as string, salePriceKobo: r['sale_price_kobo'] as number, warrantyMonths: r['warranty_months'] as number, status: r['status'] as GeneratorUnitStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToJob(r: Record<string, unknown>): GeneratorServiceJob {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, unitSerial: r['unit_serial'] as string, clientPhone: r['client_phone'] as string, faultDescription: r['fault_description'] as string, labourKobo: r['labour_kobo'] as number, partsKobo: r['parts_kobo'] as number, totalKobo: r['total_kobo'] as number, status: r['status'] as ServiceJobStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToPart(r: Record<string, unknown>): GeneratorSparePart {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, partName: r['part_name'] as string, compatibleBrands: r['compatible_brands'] as string, quantity: r['quantity'] as number, unitCostKobo: r['unit_cost_kobo'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class GeneratorDealerRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateGeneratorDealerInput): Promise<GeneratorDealerProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO generator_dealer_profiles (id, workspace_id, tenant_id, company_name, cac_rc, son_dealership, dpr_fuel_licence, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.companyName, input.cacRc ?? null, input.sonDealership ?? null, input.dprFuelLicence ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[generator-dealer] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<GeneratorDealerProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM generator_dealer_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<GeneratorDealerProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM generator_dealer_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateGeneratorDealerInput): Promise<GeneratorDealerProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.companyName !== undefined) { sets.push('company_name = ?'); vals.push(input.companyName); }
    if (input.cacRc !== undefined) { sets.push('cac_rc = ?'); vals.push(input.cacRc); }
    if (input.sonDealership !== undefined) { sets.push('son_dealership = ?'); vals.push(input.sonDealership); }
    if (input.dprFuelLicence !== undefined) { sets.push('dpr_fuel_licence = ?'); vals.push(input.dprFuelLicence); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE generator_dealer_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: GeneratorDealerFSMState): Promise<GeneratorDealerProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createUnit(input: CreateGeneratorUnitInput): Promise<GeneratorUnit> {
    if (!Number.isInteger(input.kva) || input.kva <= 0) throw new Error('[generator-dealer] kva must be positive integer (P9)');
    if (!Number.isInteger(input.salePriceKobo) || input.salePriceKobo <= 0) throw new Error('[generator-dealer] salePriceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO generator_units (id, workspace_id, tenant_id, brand, kva, serial_number, sale_price_kobo, warranty_months, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'in_stock', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.brand, input.kva, input.serialNumber, input.salePriceKobo, input.warrantyMonths ?? 12).run();
    const u = await this.findUnitById(id, input.tenantId);
    if (!u) throw new Error('[generator-dealer] unit create failed');
    return u;
  }

  async findUnitById(id: string, tenantId: string): Promise<GeneratorUnit | null> {
    const row = await this.db.prepare(`SELECT ${UNIT_COLS} FROM generator_units WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToUnit(row) : null;
  }

  async listUnits(workspaceId: string, tenantId: string): Promise<GeneratorUnit[]> {
    const { results } = await this.db.prepare(`SELECT ${UNIT_COLS} FROM generator_units WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToUnit);
  }

  async updateUnitStatus(id: string, tenantId: string, status: GeneratorUnitStatus): Promise<GeneratorUnit | null> {
    await this.db.prepare(`UPDATE generator_units SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findUnitById(id, tenantId);
  }

  async createServiceJob(input: CreateGeneratorServiceJobInput): Promise<GeneratorServiceJob> {
    if (!Number.isInteger(input.labourKobo) || input.labourKobo <= 0) throw new Error('[generator-dealer] labourKobo must be positive integer (P9)');
    if (!Number.isInteger(input.totalKobo) || input.totalKobo <= 0) throw new Error('[generator-dealer] totalKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO generator_service_jobs (id, workspace_id, tenant_id, unit_serial, client_phone, fault_description, labour_kobo, parts_kobo, total_kobo, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'booked', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.unitSerial, input.clientPhone, input.faultDescription, input.labourKobo, input.partsKobo ?? 0, input.totalKobo).run();
    const j = await this.findServiceJobById(id, input.tenantId);
    if (!j) throw new Error('[generator-dealer] service job create failed');
    return j;
  }

  async findServiceJobById(id: string, tenantId: string): Promise<GeneratorServiceJob | null> {
    const row = await this.db.prepare(`SELECT ${JOB_COLS} FROM generator_service_jobs WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToJob(row) : null;
  }

  async listServiceJobs(workspaceId: string, tenantId: string): Promise<GeneratorServiceJob[]> {
    const { results } = await this.db.prepare(`SELECT ${JOB_COLS} FROM generator_service_jobs WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToJob);
  }

  async updateServiceJobStatus(id: string, tenantId: string, status: ServiceJobStatus): Promise<GeneratorServiceJob | null> {
    await this.db.prepare(`UPDATE generator_service_jobs SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findServiceJobById(id, tenantId);
  }

  async createSparePart(input: CreateGeneratorSparePartInput): Promise<GeneratorSparePart> {
    if (!Number.isInteger(input.unitCostKobo) || input.unitCostKobo <= 0) throw new Error('[generator-dealer] unitCostKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO generator_spare_parts (id, workspace_id, tenant_id, part_name, compatible_brands, quantity, unit_cost_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.partName, input.compatibleBrands ?? '[]', input.quantity ?? 0, input.unitCostKobo).run();
    const p = await this.findSparePartById(id, input.tenantId);
    if (!p) throw new Error('[generator-dealer] spare part create failed');
    return p;
  }

  async findSparePartById(id: string, tenantId: string): Promise<GeneratorSparePart | null> {
    const row = await this.db.prepare(`SELECT ${PART_COLS} FROM generator_spare_parts WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToPart(row) : null;
  }

  async listSpareParts(workspaceId: string, tenantId: string): Promise<GeneratorSparePart[]> {
    const { results } = await this.db.prepare(`SELECT ${PART_COLS} FROM generator_spare_parts WHERE workspace_id = ? AND tenant_id = ? ORDER BY part_name ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToPart);
  }
}
