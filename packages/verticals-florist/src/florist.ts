/**
 * Florist / Garden Centre D1 repository.
 * M9 Commerce P2 — Task V-COMM-EXT-A8
 * Platform Invariants: T3, P9, P13 (no client phone/address to AI)
 * Migration: 0064_vertical_florist.sql
 */

import type {
  FloristProfile, FloristFSMState, FloristSpeciality,
  CreateFloristInput, UpdateFloristInput,
  FloristArrangement, FlowerOccasion, CreateFloristArrangementInput,
  FloristOrder, FloristOrderStatus, CreateFloristOrderInput,
  FloristStock, CreateFloristStockInput,
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
  id: string; workspace_id: string; tenant_id: string; business_name: string;
  cac_number: string | null; speciality: string; status: string;
  created_at: number; updated_at: number;
}
interface ArrangementRow {
  id: string; workspace_id: string; tenant_id: string; name: string;
  description: string | null; occasion: string; price_kobo: number;
  image_url: string | null; created_at: number; updated_at: number;
}
interface OrderRow {
  id: string; workspace_id: string; tenant_id: string; client_phone: string;
  arrangement_id: string | null; event_date: number; delivery_address: string | null;
  deposit_kobo: number; balance_kobo: number; status: string;
  created_at: number; updated_at: number;
}
interface StockRow {
  id: string; workspace_id: string; tenant_id: string; flower_name: string;
  quantity_in_stock: number; unit_cost_kobo: number; expiry_date: number | null;
  supplier_name: string | null; created_at: number; updated_at: number;
}

const r2p = (r: ProfileRow): FloristProfile => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  businessName: r.business_name, cacNumber: r.cac_number,
  speciality: r.speciality as FloristSpeciality, status: r.status as FloristFSMState,
  createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2arr = (r: ArrangementRow): FloristArrangement => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  name: r.name, description: r.description, occasion: r.occasion as FlowerOccasion,
  priceKobo: r.price_kobo, imageUrl: r.image_url,
  createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2ord = (r: OrderRow): FloristOrder => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  clientPhone: r.client_phone, arrangementId: r.arrangement_id, eventDate: r.event_date,
  deliveryAddress: r.delivery_address, depositKobo: r.deposit_kobo, balanceKobo: r.balance_kobo,
  status: r.status as FloristOrderStatus, createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2stk = (r: StockRow): FloristStock => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  flowerName: r.flower_name, quantityInStock: r.quantity_in_stock,
  unitCostKobo: r.unit_cost_kobo, expiryDate: r.expiry_date, supplierName: r.supplier_name,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

export class FloristRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateFloristInput): Promise<FloristProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO florist_profiles (id, workspace_id, tenant_id, business_name, cac_number, speciality, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.businessName,
           input.cacNumber ?? null, input.speciality ?? 'retail').run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[florist] Failed to create profile');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<FloristProfile | null> {
    const row = await this.db.prepare(`SELECT * FROM florist_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? r2p(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateFloristInput): Promise<FloristProfile | null> {
    const sets: string[] = []; const vals: unknown[] = [];
    if (input.businessName !== undefined) { sets.push('business_name = ?'); vals.push(input.businessName); }
    if ('cacNumber' in input) { sets.push('cac_number = ?'); vals.push(input.cacNumber ?? null); }
    if (input.speciality !== undefined) { sets.push('speciality = ?'); vals.push(input.speciality); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    vals.push(id, tenantId);
    await this.db.prepare(`UPDATE florist_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionProfile(id: string, tenantId: string, toStatus: FloristFSMState): Promise<FloristProfile | null> {
    return this.updateProfile(id, tenantId, { status: toStatus });
  }

  async createArrangement(input: CreateFloristArrangementInput): Promise<FloristArrangement> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.priceKobo) || input.priceKobo < 0) throw new Error('[P9] price_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO florist_arrangements (id, workspace_id, tenant_id, name, description, occasion, price_kobo, image_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.name, input.description ?? null,
           input.occasion, input.priceKobo, input.imageUrl ?? null).run();
    const a = await this.findArrangementById(id, input.tenantId);
    if (!a) throw new Error('[florist] Failed to create arrangement');
    return a;
  }

  async findArrangementById(id: string, tenantId: string): Promise<FloristArrangement | null> {
    const row = await this.db.prepare(`SELECT * FROM florist_arrangements WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ArrangementRow>();
    return row ? r2arr(row) : null;
  }

  async listArrangements(workspaceId: string, tenantId: string, occasion?: FlowerOccasion): Promise<FloristArrangement[]> {
    let sql = `SELECT * FROM florist_arrangements WHERE workspace_id = ? AND tenant_id = ?`;
    const binds: unknown[] = [workspaceId, tenantId];
    if (occasion) { sql += ` AND occasion = ?`; binds.push(occasion); }
    sql += ` ORDER BY name ASC`;
    const { results } = await this.db.prepare(sql).bind(...binds).all<ArrangementRow>();
    return (results ?? []).map(r2arr);
  }

  async createOrder(input: CreateFloristOrderInput): Promise<FloristOrder> {
    const id = input.id ?? crypto.randomUUID();
    const deposit = input.depositKobo ?? 0;
    const balance = input.balanceKobo ?? 0;
    if (!Number.isInteger(deposit) || deposit < 0) throw new Error('[P9] deposit_kobo must be non-negative integer');
    if (!Number.isInteger(balance) || balance < 0) throw new Error('[P9] balance_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO florist_orders (id, workspace_id, tenant_id, client_phone, arrangement_id, event_date, delivery_address, deposit_kobo, balance_kobo, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'enquiry', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.clientPhone,
           input.arrangementId ?? null, input.eventDate, input.deliveryAddress ?? null,
           deposit, balance).run();
    const o = await this.findOrderById(id, input.tenantId);
    if (!o) throw new Error('[florist] Failed to create order');
    return o;
  }

  async findOrderById(id: string, tenantId: string): Promise<FloristOrder | null> {
    const row = await this.db.prepare(`SELECT * FROM florist_orders WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<OrderRow>();
    return row ? r2ord(row) : null;
  }

  async listOrders(workspaceId: string, tenantId: string, status?: FloristOrderStatus): Promise<FloristOrder[]> {
    let sql = `SELECT * FROM florist_orders WHERE workspace_id = ? AND tenant_id = ?`;
    const binds: unknown[] = [workspaceId, tenantId];
    if (status) { sql += ` AND status = ?`; binds.push(status); }
    sql += ` ORDER BY event_date ASC`;
    const { results } = await this.db.prepare(sql).bind(...binds).all<OrderRow>();
    return (results ?? []).map(r2ord);
  }

  async advanceOrderStatus(id: string, tenantId: string, status: FloristOrderStatus): Promise<FloristOrder | null> {
    await this.db.prepare(`UPDATE florist_orders SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findOrderById(id, tenantId);
  }

  async createStock(input: CreateFloristStockInput): Promise<FloristStock> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.unitCostKobo) || input.unitCostKobo < 0) throw new Error('[P9] unit_cost_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO florist_stock (id, workspace_id, tenant_id, flower_name, quantity_in_stock, unit_cost_kobo, expiry_date, supplier_name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.flowerName, input.quantityInStock,
           input.unitCostKobo, input.expiryDate ?? null, input.supplierName ?? null).run();
    const s = await this.findStockById(id, input.tenantId);
    if (!s) throw new Error('[florist] Failed to create stock');
    return s;
  }

  async findStockById(id: string, tenantId: string): Promise<FloristStock | null> {
    const row = await this.db.prepare(`SELECT * FROM florist_stock WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<StockRow>();
    return row ? r2stk(row) : null;
  }

  async listExpiringStock(workspaceId: string, tenantId: string, thresholdUnix: number): Promise<FloristStock[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM florist_stock WHERE workspace_id = ? AND tenant_id = ? AND expiry_date IS NOT NULL AND expiry_date <= ? ORDER BY expiry_date ASC`,
    ).bind(workspaceId, tenantId, thresholdUnix).all<StockRow>();
    return (results ?? []).map(r2stk);
  }
}
