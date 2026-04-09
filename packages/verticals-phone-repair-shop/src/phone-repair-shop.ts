import type {
  PhoneRepairProfile, CreatePhoneRepairInput, UpdatePhoneRepairInput,
  PhoneRepairFSMState, PhoneRepairJob, CreatePhoneRepairJobInput,
  RepairJobStatus, PhoneRepairPart, CreatePhoneRepairPartInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, shop_name, lg_permit_number, state, lga, status, created_at, updated_at';
const JOB_COLS = 'id, workspace_id, tenant_id, customer_phone, device_brand, device_model, imei, fault_description, labour_kobo, parts_kobo, total_kobo, status, created_at, updated_at';
const PART_COLS = 'id, workspace_id, tenant_id, part_name, compatible_models, quantity, unit_cost_kobo, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): PhoneRepairProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, shopName: r['shop_name'] as string, lgPermitNumber: r['lg_permit_number'] as string | null, state: r['state'] as string | null, lga: r['lga'] as string | null, status: r['status'] as PhoneRepairFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToJob(r: Record<string, unknown>): PhoneRepairJob {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, customerPhone: r['customer_phone'] as string, deviceBrand: r['device_brand'] as string, deviceModel: r['device_model'] as string, imei: r['imei'] as string | null, faultDescription: r['fault_description'] as string, labourKobo: r['labour_kobo'] as number, partsKobo: r['parts_kobo'] as number, totalKobo: r['total_kobo'] as number, status: r['status'] as RepairJobStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToPart(r: Record<string, unknown>): PhoneRepairPart {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, partName: r['part_name'] as string, compatibleModels: r['compatible_models'] as string, quantity: r['quantity'] as number, unitCostKobo: r['unit_cost_kobo'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class PhoneRepairShopRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreatePhoneRepairInput): Promise<PhoneRepairProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO phone_repair_profiles (id, workspace_id, tenant_id, shop_name, lg_permit_number, state, lga, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.shopName, input.lgPermitNumber ?? null, input.state ?? null, input.lga ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[phone-repair-shop] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<PhoneRepairProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM phone_repair_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<PhoneRepairProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM phone_repair_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdatePhoneRepairInput): Promise<PhoneRepairProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.shopName !== undefined) { sets.push('shop_name = ?'); vals.push(input.shopName); }
    if (input.lgPermitNumber !== undefined) { sets.push('lg_permit_number = ?'); vals.push(input.lgPermitNumber); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE phone_repair_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: PhoneRepairFSMState): Promise<PhoneRepairProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createJob(input: CreatePhoneRepairJobInput): Promise<PhoneRepairJob> {
    if (!Number.isInteger(input.labourKobo) || input.labourKobo <= 0) throw new Error('[phone-repair-shop] labourKobo must be positive integer (P9)');
    if (!Number.isInteger(input.totalKobo) || input.totalKobo <= 0) throw new Error('[phone-repair-shop] totalKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO phone_repair_jobs (id, workspace_id, tenant_id, customer_phone, device_brand, device_model, imei, fault_description, labour_kobo, parts_kobo, total_kobo, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'intake', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.customerPhone, input.deviceBrand, input.deviceModel, input.imei ?? null, input.faultDescription, input.labourKobo, input.partsKobo ?? 0, input.totalKobo).run();
    const j = await this.findJobById(id, input.tenantId);
    if (!j) throw new Error('[phone-repair-shop] job create failed');
    return j;
  }

  async findJobById(id: string, tenantId: string): Promise<PhoneRepairJob | null> {
    const row = await this.db.prepare(`SELECT ${JOB_COLS} FROM phone_repair_jobs WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToJob(row) : null;
  }

  async listJobs(workspaceId: string, tenantId: string): Promise<PhoneRepairJob[]> {
    const { results } = await this.db.prepare(`SELECT ${JOB_COLS} FROM phone_repair_jobs WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToJob);
  }

  async updateJobStatus(id: string, tenantId: string, status: RepairJobStatus): Promise<PhoneRepairJob | null> {
    await this.db.prepare(`UPDATE phone_repair_jobs SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findJobById(id, tenantId);
  }

  async createPart(input: CreatePhoneRepairPartInput): Promise<PhoneRepairPart> {
    if (!Number.isInteger(input.unitCostKobo) || input.unitCostKobo <= 0) throw new Error('[phone-repair-shop] unitCostKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO phone_repair_parts (id, workspace_id, tenant_id, part_name, compatible_models, quantity, unit_cost_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.partName, input.compatibleModels ?? '[]', input.quantity ?? 0, input.unitCostKobo).run();
    const p = await this.findPartById(id, input.tenantId);
    if (!p) throw new Error('[phone-repair-shop] part create failed');
    return p;
  }

  async findPartById(id: string, tenantId: string): Promise<PhoneRepairPart | null> {
    const row = await this.db.prepare(`SELECT ${PART_COLS} FROM phone_repair_parts WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToPart(row) : null;
  }

  async listParts(workspaceId: string, tenantId: string): Promise<PhoneRepairPart[]> {
    const { results } = await this.db.prepare(`SELECT ${PART_COLS} FROM phone_repair_parts WHERE workspace_id = ? AND tenant_id = ? ORDER BY part_name ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToPart);
  }
}
