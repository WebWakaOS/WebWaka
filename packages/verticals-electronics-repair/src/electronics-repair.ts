/**
 * Electronics Repair Shop D1 repository.
 * M9 Commerce P2 — Task V-COMM-EXT-A7
 * Platform Invariants: T3, P9, P13 (no IMEI/phone to AI)
 * Migration: 0063_vertical_electronics_repair.sql
 */

import type {
  ElectronicsRepairProfile, ElectronicsRepairFSMState, LocationCluster,
  CreateElectronicsRepairInput, UpdateElectronicsRepairInput,
  RepairJob, RepairJobStatus, CreateRepairJobInput,
  RepairPart, CreateRepairPartInput,
} from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface ProfileRow {
  id: string; workspace_id: string; tenant_id: string; shop_name: string;
  cac_number: string | null; son_registration: string | null;
  location_cluster: string; state: string; status: string;
  created_at: number; updated_at: number;
}
interface JobRow {
  id: string; workspace_id: string; tenant_id: string; device_type: string;
  brand: string; model: string | null; imei: string | null; fault_description: string;
  customer_phone: string; diagnosis: string | null;
  labour_cost_kobo: number; parts_cost_kobo: number; warranty_days: number;
  status: string; created_at: number; updated_at: number;
}
interface PartRow {
  id: string; workspace_id: string; tenant_id: string; part_name: string;
  compatible_models: string; quantity: number; unit_cost_kobo: number;
  supplier: string | null; created_at: number;
}

const r2p = (r: ProfileRow): ElectronicsRepairProfile => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  shopName: r.shop_name, cacNumber: r.cac_number, sonRegistration: r.son_registration,
  locationCluster: r.location_cluster as LocationCluster, state: r.state,
  status: r.status as ElectronicsRepairFSMState, createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2job = (r: JobRow): RepairJob => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  deviceType: r.device_type, brand: r.brand, model: r.model, imei: r.imei,
  faultDescription: r.fault_description, customerPhone: r.customer_phone,
  diagnosis: r.diagnosis, labourCostKobo: r.labour_cost_kobo,
  partsCostKobo: r.parts_cost_kobo, warrantyDays: r.warranty_days,
  status: r.status as RepairJobStatus, createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2part = (r: PartRow): RepairPart => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  partName: r.part_name, compatibleModels: r.compatible_models, quantity: r.quantity,
  unitCostKobo: r.unit_cost_kobo, supplier: r.supplier, createdAt: r.created_at,
});

export class ElectronicsRepairRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateElectronicsRepairInput): Promise<ElectronicsRepairProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO electronics_repair_profiles (id, workspace_id, tenant_id, shop_name, cac_number, son_registration, location_cluster, state, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.shopName,
           input.cacNumber ?? null, input.sonRegistration ?? null,
           input.locationCluster ?? 'other', input.state).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[electronics-repair] Failed to create profile');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<ElectronicsRepairProfile | null> {
    const row = await this.db.prepare(`SELECT * FROM electronics_repair_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? r2p(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateElectronicsRepairInput): Promise<ElectronicsRepairProfile | null> {
    const sets: string[] = []; const vals: unknown[] = [];
    if (input.shopName !== undefined) { sets.push('shop_name = ?'); vals.push(input.shopName); }
    if ('cacNumber' in input) { sets.push('cac_number = ?'); vals.push(input.cacNumber ?? null); }
    if ('sonRegistration' in input) { sets.push('son_registration = ?'); vals.push(input.sonRegistration ?? null); }
    if (input.locationCluster !== undefined) { sets.push('location_cluster = ?'); vals.push(input.locationCluster); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    vals.push(id, tenantId);
    await this.db.prepare(`UPDATE electronics_repair_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionProfile(id: string, tenantId: string, toStatus: ElectronicsRepairFSMState): Promise<ElectronicsRepairProfile | null> {
    return this.updateProfile(id, tenantId, { status: toStatus });
  }

  async createRepairJob(input: CreateRepairJobInput): Promise<RepairJob> {
    const id = input.id ?? crypto.randomUUID();
    const labour = input.labourCostKobo ?? 0;
    const parts = input.partsCostKobo ?? 0;
    if (!Number.isInteger(labour) || labour < 0) throw new Error('[P9] labour_cost_kobo must be non-negative integer');
    if (!Number.isInteger(parts) || parts < 0) throw new Error('[P9] parts_cost_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO repair_jobs (id, workspace_id, tenant_id, device_type, brand, model, imei, fault_description, customer_phone, labour_cost_kobo, parts_cost_kobo, warranty_days, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'intake', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.deviceType, input.brand,
           input.model ?? null, input.imei ?? null, input.faultDescription,
           input.customerPhone, labour, parts, input.warrantyDays ?? 0).run();
    const j = await this.findRepairJobById(id, input.tenantId);
    if (!j) throw new Error('[electronics-repair] Failed to create repair job');
    return j;
  }

  async findRepairJobById(id: string, tenantId: string): Promise<RepairJob | null> {
    const row = await this.db.prepare(`SELECT * FROM repair_jobs WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<JobRow>();
    return row ? r2job(row) : null;
  }

  async listRepairJobs(workspaceId: string, tenantId: string, status?: RepairJobStatus): Promise<RepairJob[]> {
    let sql = `SELECT * FROM repair_jobs WHERE workspace_id = ? AND tenant_id = ?`;
    const binds: unknown[] = [workspaceId, tenantId];
    if (status) { sql += ` AND status = ?`; binds.push(status); }
    sql += ` ORDER BY created_at DESC`;
    const { results } = await this.db.prepare(sql).bind(...binds).all<JobRow>();
    return (results ?? []).map(r2job);
  }

  async advanceRepairJobStatus(id: string, tenantId: string, status: RepairJobStatus): Promise<RepairJob | null> {
    await this.db.prepare(`UPDATE repair_jobs SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findRepairJobById(id, tenantId);
  }

  async createPart(input: CreateRepairPartInput): Promise<RepairPart> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.unitCostKobo) || input.unitCostKobo < 0) throw new Error('[P9] unit_cost_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO repair_parts_inventory (id, workspace_id, tenant_id, part_name, compatible_models, quantity, unit_cost_kobo, supplier, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.partName,
           input.compatibleModels ?? '[]', input.quantity, input.unitCostKobo,
           input.supplier ?? null).run();
    const p = await this.findPartById(id, input.tenantId);
    if (!p) throw new Error('[electronics-repair] Failed to create part');
    return p;
  }

  async findPartById(id: string, tenantId: string): Promise<RepairPart | null> {
    const row = await this.db.prepare(`SELECT * FROM repair_parts_inventory WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<PartRow>();
    return row ? r2part(row) : null;
  }

  async listParts(workspaceId: string, tenantId: string): Promise<RepairPart[]> {
    const { results } = await this.db.prepare(`SELECT * FROM repair_parts_inventory WHERE workspace_id = ? AND tenant_id = ? ORDER BY part_name ASC`).bind(workspaceId, tenantId).all<PartRow>();
    return (results ?? []).map(r2part);
  }
}
