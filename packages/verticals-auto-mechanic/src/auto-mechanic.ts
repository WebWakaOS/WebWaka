/**
 * Auto Mechanic / Garage D1 repository.
 * M9 Commerce P2 — Task V-COMM-EXT-A1
 * Platform Invariants: T3 (all queries scoped by tenantId), P9 (kobo integers)
 * Migration: 0057_vertical_auto_mechanic.sql
 */

import type {
  AutoMechanicProfile,
  AutoMechanicFSMState,
  CreateAutoMechanicInput,
  UpdateAutoMechanicInput,
  JobCard,
  JobCardStatus,
  CreateJobCardInput,
  MechanicPart,
  CreateMechanicPartInput,
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
  id: string; workspace_id: string; tenant_id: string;
  workshop_name: string; cac_number: string | null;
  vio_registration: string | null; state: string; lga: string;
  status: string; created_at: number; updated_at: number;
}
interface JobCardRow {
  id: string; workspace_id: string; tenant_id: string;
  vehicle_plate: string; customer_phone: string; complaint: string;
  diagnosis: string | null; mechanic_id: string | null;
  labour_cost_kobo: number; parts_cost_kobo: number;
  status: string; created_at: number; updated_at: number;
}
interface PartRow {
  id: string; workspace_id: string; tenant_id: string;
  part_name: string; part_number: string | null;
  quantity_in_stock: number; unit_cost_kobo: number;
  reorder_level: number; supplier: string | null; created_at: number;
}

function rowToProfile(r: ProfileRow): AutoMechanicProfile {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    workshopName: r.workshop_name, cacNumber: r.cac_number,
    vioRegistration: r.vio_registration, state: r.state, lga: r.lga,
    status: r.status as AutoMechanicFSMState,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function rowToJobCard(r: JobCardRow): JobCard {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    vehiclePlate: r.vehicle_plate, customerPhone: r.customer_phone,
    complaint: r.complaint, diagnosis: r.diagnosis, mechanicId: r.mechanic_id,
    labourCostKobo: r.labour_cost_kobo, partsCostKobo: r.parts_cost_kobo,
    status: r.status as JobCardStatus,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function rowToPart(r: PartRow): MechanicPart {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    partName: r.part_name, partNumber: r.part_number,
    quantityInStock: r.quantity_in_stock, unitCostKobo: r.unit_cost_kobo,
    reorderLevel: r.reorder_level, supplier: r.supplier, createdAt: r.created_at,
  };
}

export class AutoMechanicRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateAutoMechanicInput): Promise<AutoMechanicProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO auto_mechanic_profiles
         (id, workspace_id, tenant_id, workshop_name, cac_number, vio_registration,
          state, lga, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.workshopName,
           input.cacNumber ?? null, input.vioRegistration ?? null,
           input.state, input.lga).run();
    const profile = await this.findProfileById(id, input.tenantId);
    if (!profile) throw new Error('[auto-mechanic] Failed to create profile');
    return profile;
  }

  async findProfileById(id: string, tenantId: string): Promise<AutoMechanicProfile | null> {
    const row = await this.db.prepare(
      `SELECT * FROM auto_mechanic_profiles WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<ProfileRow>();
    return row ? rowToProfile(row) : null;
  }

  async findProfilesByWorkspace(workspaceId: string, tenantId: string): Promise<AutoMechanicProfile[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM auto_mechanic_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(workspaceId, tenantId).all<ProfileRow>();
    return (results ?? []).map(rowToProfile);
  }

  async updateProfile(id: string, tenantId: string, input: UpdateAutoMechanicInput): Promise<AutoMechanicProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.workshopName !== undefined) { sets.push('workshop_name = ?'); vals.push(input.workshopName); }
    if ('cacNumber' in input) { sets.push('cac_number = ?'); vals.push(input.cacNumber ?? null); }
    if ('vioRegistration' in input) { sets.push('vio_registration = ?'); vals.push(input.vioRegistration ?? null); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    vals.push(id, tenantId);
    await this.db.prepare(
      `UPDATE auto_mechanic_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
    ).bind(...vals).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionProfile(id: string, tenantId: string, toStatus: AutoMechanicFSMState): Promise<AutoMechanicProfile | null> {
    return this.updateProfile(id, tenantId, { status: toStatus });
  }

  // ---------------------------------------------------------------------------
  // Job Cards
  // ---------------------------------------------------------------------------

  async createJobCard(input: CreateJobCardInput): Promise<JobCard> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.labourCostKobo) || input.labourCostKobo < 0) {
      throw new Error('[P9] labour_cost_kobo must be a non-negative integer (kobo)');
    }
    const partsKobo = input.partsCostKobo ?? 0;
    if (!Number.isInteger(partsKobo) || partsKobo < 0) {
      throw new Error('[P9] parts_cost_kobo must be a non-negative integer (kobo)');
    }
    await this.db.prepare(
      `INSERT INTO job_cards
         (id, workspace_id, tenant_id, vehicle_plate, customer_phone, complaint,
          labour_cost_kobo, parts_cost_kobo, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.vehiclePlate,
           input.customerPhone, input.complaint, input.labourCostKobo, partsKobo).run();
    const card = await this.findJobCardById(id, input.tenantId);
    if (!card) throw new Error('[auto-mechanic] Failed to create job card');
    return card;
  }

  async findJobCardById(id: string, tenantId: string): Promise<JobCard | null> {
    const row = await this.db.prepare(
      `SELECT * FROM job_cards WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<JobCardRow>();
    return row ? rowToJobCard(row) : null;
  }

  async listJobCards(workspaceId: string, tenantId: string, status?: JobCardStatus): Promise<JobCard[]> {
    let sql = `SELECT * FROM job_cards WHERE workspace_id = ? AND tenant_id = ?`;
    const binds: unknown[] = [workspaceId, tenantId];
    if (status) { sql += ` AND status = ?`; binds.push(status); }
    sql += ` ORDER BY created_at DESC`;
    const { results } = await this.db.prepare(sql).bind(...binds).all<JobCardRow>();
    return (results ?? []).map(rowToJobCard);
  }

  async updateJobCardStatus(id: string, tenantId: string, status: JobCardStatus): Promise<JobCard | null> {
    await this.db.prepare(
      `UPDATE job_cards SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`,
    ).bind(status, id, tenantId).run();
    return this.findJobCardById(id, tenantId);
  }

  // ---------------------------------------------------------------------------
  // Parts Inventory
  // ---------------------------------------------------------------------------

  async createPart(input: CreateMechanicPartInput): Promise<MechanicPart> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.unitCostKobo) || input.unitCostKobo < 0) {
      throw new Error('[P9] unit_cost_kobo must be a non-negative integer (kobo)');
    }
    await this.db.prepare(
      `INSERT INTO mechanic_parts_inventory
         (id, workspace_id, tenant_id, part_name, part_number,
          quantity_in_stock, unit_cost_kobo, reorder_level, supplier, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.partName,
           input.partNumber ?? null, input.quantityInStock, input.unitCostKobo,
           input.reorderLevel ?? 5, input.supplier ?? null).run();
    const part = await this.findPartById(id, input.tenantId);
    if (!part) throw new Error('[auto-mechanic] Failed to create part');
    return part;
  }

  async findPartById(id: string, tenantId: string): Promise<MechanicPart | null> {
    const row = await this.db.prepare(
      `SELECT * FROM mechanic_parts_inventory WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<PartRow>();
    return row ? rowToPart(row) : null;
  }

  async listParts(workspaceId: string, tenantId: string): Promise<MechanicPart[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM mechanic_parts_inventory WHERE workspace_id = ? AND tenant_id = ? ORDER BY part_name ASC`,
    ).bind(workspaceId, tenantId).all<PartRow>();
    return (results ?? []).map(rowToPart);
  }

  async listLowStockParts(workspaceId: string, tenantId: string): Promise<MechanicPart[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM mechanic_parts_inventory
       WHERE workspace_id = ? AND tenant_id = ? AND quantity_in_stock <= reorder_level
       ORDER BY quantity_in_stock ASC`,
    ).bind(workspaceId, tenantId).all<PartRow>();
    return (results ?? []).map(rowToPart);
  }
}
