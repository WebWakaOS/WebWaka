/**
 * Food Vendor / Street Food D1 repository.
 * M9 Commerce P2 — Task V-COMM-EXT-A9
 * 3-state informal FSM: seeded → claimed → active
 * Platform Invariants: T3, P9
 * Migration: 0065_vertical_food_vendor.sql
 */

import type {
  FoodVendorProfile, FoodVendorFSMState, FoodType,
  CreateFoodVendorInput, UpdateFoodVendorInput,
  FoodVendorMenuItem, CreateMenuItemInput,
  FoodVendorSale, CreateFoodVendorSaleInput,
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
  id: string; workspace_id: string; tenant_id: string; vendor_name: string;
  food_type: string; location_description: string | null; lga: string; state: string;
  lg_permit_number: string | null; status: string; created_at: number; updated_at: number;
}
interface MenuRow {
  id: string; workspace_id: string; tenant_id: string; item_name: string;
  price_kobo: number; available: number; created_at: number; updated_at: number;
}
interface SaleRow {
  id: string; workspace_id: string; tenant_id: string; sale_date: number;
  total_kobo: number; items_sold_count: number; created_at: number;
}

const r2p = (r: ProfileRow): FoodVendorProfile => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  vendorName: r.vendor_name, foodType: r.food_type as FoodType,
  locationDescription: r.location_description, lga: r.lga, state: r.state,
  lgPermitNumber: r.lg_permit_number, status: r.status as FoodVendorFSMState,
  createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2menu = (r: MenuRow): FoodVendorMenuItem => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  itemName: r.item_name, priceKobo: r.price_kobo, available: r.available === 1,
  createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2sale = (r: SaleRow): FoodVendorSale => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  saleDate: r.sale_date, totalKobo: r.total_kobo, itemsSoldCount: r.items_sold_count,
  createdAt: r.created_at,
});

export class FoodVendorRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateFoodVendorInput): Promise<FoodVendorProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO food_vendor_profiles (id, workspace_id, tenant_id, vendor_name, food_type, location_description, lga, state, lg_permit_number, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.vendorName, input.foodType,
           input.locationDescription ?? null, input.lga, input.state,
           input.lgPermitNumber ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[food-vendor] Failed to create profile');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<FoodVendorProfile | null> {
    const row = await this.db.prepare(`SELECT * FROM food_vendor_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? r2p(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateFoodVendorInput): Promise<FoodVendorProfile | null> {
    const sets: string[] = []; const vals: unknown[] = [];
    if (input.vendorName !== undefined) { sets.push('vendor_name = ?'); vals.push(input.vendorName); }
    if (input.foodType !== undefined) { sets.push('food_type = ?'); vals.push(input.foodType); }
    if ('locationDescription' in input) { sets.push('location_description = ?'); vals.push(input.locationDescription ?? null); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if ('lgPermitNumber' in input) { sets.push('lg_permit_number = ?'); vals.push(input.lgPermitNumber ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    vals.push(id, tenantId);
    await this.db.prepare(`UPDATE food_vendor_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionProfile(id: string, tenantId: string, toStatus: FoodVendorFSMState): Promise<FoodVendorProfile | null> {
    return this.updateProfile(id, tenantId, { status: toStatus });
  }

  async createMenuItem(input: CreateMenuItemInput): Promise<FoodVendorMenuItem> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.priceKobo) || input.priceKobo < 0) throw new Error('[P9] price_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO food_vendor_menu (id, workspace_id, tenant_id, item_name, price_kobo, available, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.itemName, input.priceKobo,
           input.available !== false ? 1 : 0).run();
    const m = await this.findMenuItemById(id, input.tenantId);
    if (!m) throw new Error('[food-vendor] Failed to create menu item');
    return m;
  }

  async findMenuItemById(id: string, tenantId: string): Promise<FoodVendorMenuItem | null> {
    const row = await this.db.prepare(`SELECT * FROM food_vendor_menu WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<MenuRow>();
    return row ? r2menu(row) : null;
  }

  async listMenu(workspaceId: string, tenantId: string, availableOnly = false): Promise<FoodVendorMenuItem[]> {
    let sql = `SELECT * FROM food_vendor_menu WHERE workspace_id = ? AND tenant_id = ?`;
    const binds: unknown[] = [workspaceId, tenantId];
    if (availableOnly) { sql += ` AND available = 1`; }
    sql += ` ORDER BY item_name ASC`;
    const { results } = await this.db.prepare(sql).bind(...binds).all<MenuRow>();
    return (results ?? []).map(r2menu);
  }

  async toggleMenuItem(id: string, tenantId: string, available: boolean): Promise<FoodVendorMenuItem | null> {
    await this.db.prepare(`UPDATE food_vendor_menu SET available = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(available ? 1 : 0, id, tenantId).run();
    return this.findMenuItemById(id, tenantId);
  }

  async recordSale(input: CreateFoodVendorSaleInput): Promise<FoodVendorSale> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.totalKobo) || input.totalKobo < 0) throw new Error('[P9] total_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO food_vendor_sales (id, workspace_id, tenant_id, sale_date, total_kobo, items_sold_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.saleDate, input.totalKobo,
           input.itemsSoldCount ?? 0).run();
    const s = await this.findSaleById(id, input.tenantId);
    if (!s) throw new Error('[food-vendor] Failed to record sale');
    return s;
  }

  async findSaleById(id: string, tenantId: string): Promise<FoodVendorSale | null> {
    const row = await this.db.prepare(`SELECT * FROM food_vendor_sales WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<SaleRow>();
    return row ? r2sale(row) : null;
  }

  async listSales(workspaceId: string, tenantId: string): Promise<FoodVendorSale[]> {
    const { results } = await this.db.prepare(`SELECT * FROM food_vendor_sales WHERE workspace_id = ? AND tenant_id = ? ORDER BY sale_date DESC`).bind(workspaceId, tenantId).all<SaleRow>();
    return (results ?? []).map(r2sale);
  }

  async getSalesAggregate(workspaceId: string, tenantId: string): Promise<{ totalKobo: number; salesCount: number }> {
    const row = await this.db.prepare(
      `SELECT SUM(total_kobo) as total, COUNT(*) as cnt FROM food_vendor_sales WHERE workspace_id = ? AND tenant_id = ?`,
    ).bind(workspaceId, tenantId).first<{ total: number | null; cnt: number }>();
    return { totalKobo: row?.total ?? 0, salesCount: row?.cnt ?? 0 };
  }
}
