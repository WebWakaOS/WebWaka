/**
 * Warehouse Operator D1 repository.
 * M10 Agricultural + Specialist Verticals
 * Platform Invariants: T3 (all queries scoped by tenantId), P9 (integer kobo + kg)
 * Migration: 0221_warehouse_vertical.sql
 */

import type {
  WarehouseProfile,
  WarehouseFSMState,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  WarehouseSlot,
  SlotStatus,
  CreateSlotInput,
  WarehouseContract,
  ContractStatus,
  CreateContractInput,
  StockMovement,
  MovementType,
  CreateMovementInput,
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
  warehouse_name: string; cac_number: string | null;
  son_cert: string | null; nafdac_cert: string | null;
  total_capacity_kg: number; state: string; lga: string;
  status: string; created_at: number; updated_at: number;
}
interface SlotRow {
  id: string; warehouse_id: string; tenant_id: string;
  slot_code: string; capacity_kg: number;
  current_occupancy_kg: number; status: string;
  created_at: number; updated_at: number;
}
interface ContractRow {
  id: string; warehouse_id: string; slot_id: string; tenant_id: string;
  client_phone: string; commodity_type: string; quantity_kg: number;
  daily_rate_kobo: number; start_date: number; end_date: number | null;
  total_billed_kobo: number; status: string;
  created_at: number; updated_at: number;
}
interface MovementRow {
  id: string; contract_id: string; tenant_id: string;
  movement_type: string; quantity_kg: number;
  movement_date: number; notes: string | null; created_at: number;
}

function rowToProfile(r: ProfileRow): WarehouseProfile {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    warehouseName: r.warehouse_name, cacNumber: r.cac_number,
    sonCert: r.son_cert, nafdacCert: r.nafdac_cert,
    totalCapacityKg: r.total_capacity_kg,
    state: r.state, lga: r.lga,
    status: r.status as WarehouseFSMState,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function rowToSlot(r: SlotRow): WarehouseSlot {
  return {
    id: r.id, warehouseId: r.warehouse_id, tenantId: r.tenant_id,
    slotCode: r.slot_code, capacityKg: r.capacity_kg,
    currentOccupancyKg: r.current_occupancy_kg,
    status: r.status as SlotStatus,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function rowToContract(r: ContractRow): WarehouseContract {
  return {
    id: r.id, warehouseId: r.warehouse_id, slotId: r.slot_id,
    tenantId: r.tenant_id, clientPhone: r.client_phone,
    commodityType: r.commodity_type, quantityKg: r.quantity_kg,
    dailyRateKobo: r.daily_rate_kobo, startDate: r.start_date,
    endDate: r.end_date, totalBilledKobo: r.total_billed_kobo,
    status: r.status as ContractStatus,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function rowToMovement(r: MovementRow): StockMovement {
  return {
    id: r.id, contractId: r.contract_id, tenantId: r.tenant_id,
    movementType: r.movement_type as MovementType,
    quantityKg: r.quantity_kg, movementDate: r.movement_date,
    notes: r.notes, createdAt: r.created_at,
  };
}

export class WarehouseRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateWarehouseInput): Promise<WarehouseProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO warehouse_profiles
         (id, workspace_id, tenant_id, warehouse_name, cac_number, son_cert,
          nafdac_cert, total_capacity_kg, state, lga, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`,
    ).bind(
      id, input.workspaceId, input.tenantId, input.warehouseName,
      input.cacNumber ?? null, input.sonCert ?? null,
      input.nafdacCert ?? null, input.totalCapacityKg ?? 0,
      input.state, input.lga,
    ).run();
    const profile = await this.findProfileById(id, input.tenantId);
    if (!profile) throw new Error('[warehouse] Failed to create profile');
    return profile;
  }

  async findProfileById(id: string, tenantId: string): Promise<WarehouseProfile | null> {
    const row = await this.db.prepare(
      `SELECT * FROM warehouse_profiles WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<ProfileRow>();
    return row ? rowToProfile(row) : null;
  }

  async findProfilesByWorkspace(workspaceId: string, tenantId: string): Promise<WarehouseProfile[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM warehouse_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(workspaceId, tenantId).all<ProfileRow>();
    return (results ?? []).map(rowToProfile);
  }

  async updateProfile(id: string, tenantId: string, input: UpdateWarehouseInput): Promise<WarehouseProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.warehouseName !== undefined) { sets.push('warehouse_name = ?'); vals.push(input.warehouseName); }
    if ('cacNumber' in input) { sets.push('cac_number = ?'); vals.push(input.cacNumber ?? null); }
    if ('sonCert' in input) { sets.push('son_cert = ?'); vals.push(input.sonCert ?? null); }
    if ('nafdacCert' in input) { sets.push('nafdac_cert = ?'); vals.push(input.nafdacCert ?? null); }
    if (input.totalCapacityKg !== undefined) { sets.push('total_capacity_kg = ?'); vals.push(input.totalCapacityKg); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    vals.push(id, tenantId);
    await this.db.prepare(
      `UPDATE warehouse_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
    ).bind(...vals).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionProfile(id: string, tenantId: string, toStatus: WarehouseFSMState): Promise<WarehouseProfile | null> {
    return this.updateProfile(id, tenantId, { status: toStatus });
  }

  // ---------------------------------------------------------------------------
  // Slots
  // ---------------------------------------------------------------------------

  async createSlot(input: CreateSlotInput): Promise<WarehouseSlot> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.capacityKg) || input.capacityKg < 0) {
      throw new Error('[P9] capacity_kg must be a non-negative integer');
    }
    await this.db.prepare(
      `INSERT INTO warehouse_slots
         (id, warehouse_id, tenant_id, slot_code, capacity_kg,
          current_occupancy_kg, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, 'available', unixepoch(), unixepoch())`,
    ).bind(id, input.warehouseId, input.tenantId, input.slotCode, input.capacityKg).run();
    const slot = await this.findSlotById(id, input.tenantId);
    if (!slot) throw new Error('[warehouse] Failed to create slot');
    return slot;
  }

  async findSlotById(id: string, tenantId: string): Promise<WarehouseSlot | null> {
    const row = await this.db.prepare(
      `SELECT * FROM warehouse_slots WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<SlotRow>();
    return row ? rowToSlot(row) : null;
  }

  async listSlotsByWarehouse(warehouseId: string, tenantId: string): Promise<WarehouseSlot[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM warehouse_slots WHERE warehouse_id = ? AND tenant_id = ? ORDER BY slot_code ASC`,
    ).bind(warehouseId, tenantId).all<SlotRow>();
    return (results ?? []).map(rowToSlot);
  }

  async updateSlotStatus(id: string, tenantId: string, status: SlotStatus): Promise<WarehouseSlot | null> {
    await this.db.prepare(
      `UPDATE warehouse_slots SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`,
    ).bind(status, id, tenantId).run();
    return this.findSlotById(id, tenantId);
  }

  // ---------------------------------------------------------------------------
  // Contracts
  // ---------------------------------------------------------------------------

  async createContract(input: CreateContractInput): Promise<WarehouseContract> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) {
      throw new Error('[P9] quantity_kg must be a non-negative integer');
    }
    if (!Number.isInteger(input.dailyRateKobo) || input.dailyRateKobo < 0) {
      throw new Error('[P9] daily_rate_kobo must be a non-negative integer (kobo)');
    }
    await this.db.prepare(
      `INSERT INTO warehouse_contracts
         (id, warehouse_id, slot_id, tenant_id, client_phone, commodity_type,
          quantity_kg, daily_rate_kobo, start_date, end_date,
          total_billed_kobo, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, 'active', unixepoch(), unixepoch())`,
    ).bind(
      id, input.warehouseId, input.slotId, input.tenantId,
      input.clientPhone, input.commodityType, input.quantityKg,
      input.dailyRateKobo, input.startDate,
    ).run();
    const contract = await this.findContractById(id, input.tenantId);
    if (!contract) throw new Error('[warehouse] Failed to create contract');
    return contract;
  }

  async findContractById(id: string, tenantId: string): Promise<WarehouseContract | null> {
    const row = await this.db.prepare(
      `SELECT * FROM warehouse_contracts WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<ContractRow>();
    return row ? rowToContract(row) : null;
  }

  async listContractsByWarehouse(warehouseId: string, tenantId: string): Promise<WarehouseContract[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM warehouse_contracts WHERE warehouse_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(warehouseId, tenantId).all<ContractRow>();
    return (results ?? []).map(rowToContract);
  }

  async terminateContract(id: string, tenantId: string): Promise<WarehouseContract | null> {
    await this.db.prepare(
      `UPDATE warehouse_contracts SET status = ?, end_date = unixepoch(), updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`,
    ).bind('terminated', id, tenantId).run();
    return this.findContractById(id, tenantId);
  }

  // ---------------------------------------------------------------------------
  // Stock Movements
  // ---------------------------------------------------------------------------

  async createMovement(input: CreateMovementInput): Promise<StockMovement> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) {
      throw new Error('[P9] quantity_kg must be a non-negative integer');
    }
    await this.db.prepare(
      `INSERT INTO warehouse_stock_movements
         (id, contract_id, tenant_id, movement_type, quantity_kg, movement_date, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(
      id, input.contractId, input.tenantId, input.movementType,
      input.quantityKg, input.movementDate, input.notes ?? null,
    ).run();
    const movement = await this.findMovementById(id, input.tenantId);
    if (!movement) throw new Error('[warehouse] Failed to create movement');
    return movement;
  }

  async findMovementById(id: string, tenantId: string): Promise<StockMovement | null> {
    const row = await this.db.prepare(
      `SELECT * FROM warehouse_stock_movements WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<MovementRow>();
    return row ? rowToMovement(row) : null;
  }

  async listMovementsByContract(contractId: string, tenantId: string): Promise<StockMovement[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM warehouse_stock_movements WHERE contract_id = ? AND tenant_id = ? ORDER BY movement_date ASC`,
    ).bind(contractId, tenantId).all<MovementRow>();
    return (results ?? []).map(rowToMovement);
  }
}
