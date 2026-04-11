/**
 * Bookshop / Stationery Store D1 repository.
 * M9 Commerce P2 — Task V-COMM-EXT-A4
 * Platform Invariants: T3, P9
 * Migration: 0060_vertical_bookshop.sql
 */

import type {
  BookshopProfile, BookshopFSMState, CreateBookshopInput, UpdateBookshopInput,
  BookshopCatalogueItem, BookCategory, CreateCatalogueItemInput,
  BookshopOrder, CreateBookshopOrderInput, DeliveryMethod, PaymentStatus,
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
  cac_number: string | null; state: string; lga: string; status: string;
  created_at: number; updated_at: number;
}
interface CatalogueRow {
  id: string; workspace_id: string; tenant_id: string; isbn: string | null;
  title: string; author: string | null; publisher: string | null; category: string;
  unit_price_kobo: number; quantity_in_stock: number; created_at: number; updated_at: number;
}
interface OrderRow {
  id: string; workspace_id: string; tenant_id: string; customer_phone: string;
  order_items: string; total_kobo: number; payment_status: string;
  delivery_method: string; status: string; created_at: number; updated_at: number;
}

const r2p = (r: ProfileRow): BookshopProfile => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  shopName: r.shop_name, cacNumber: r.cac_number, state: r.state, lga: r.lga,
  status: r.status as BookshopFSMState, createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2cat = (r: CatalogueRow): BookshopCatalogueItem => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, isbn: r.isbn,
  title: r.title, author: r.author, publisher: r.publisher, category: r.category as BookCategory,
  unitPriceKobo: r.unit_price_kobo, quantityInStock: r.quantity_in_stock,
  createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2ord = (r: OrderRow): BookshopOrder => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  customerPhone: r.customer_phone, orderItems: r.order_items, totalKobo: r.total_kobo,
  paymentStatus: r.payment_status as PaymentStatus, deliveryMethod: r.delivery_method as DeliveryMethod,
  status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
});

export class BookshopRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateBookshopInput): Promise<BookshopProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO bookshop_profiles (id, workspace_id, tenant_id, shop_name, cac_number, state, lga, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.shopName,
           input.cacNumber ?? null, input.state, input.lga).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[bookshop] Failed to create profile');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<BookshopProfile | null> {
    const row = await this.db.prepare(`SELECT * FROM bookshop_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? r2p(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateBookshopInput): Promise<BookshopProfile | null> {
    const sets: string[] = []; const vals: unknown[] = [];
    if (input.shopName !== undefined) { sets.push('shop_name = ?'); vals.push(input.shopName); }
    if ('cacNumber' in input) { sets.push('cac_number = ?'); vals.push(input.cacNumber ?? null); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    vals.push(id, tenantId);
    await this.db.prepare(`UPDATE bookshop_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionProfile(id: string, tenantId: string, toStatus: BookshopFSMState): Promise<BookshopProfile | null> {
    return this.updateProfile(id, tenantId, { status: toStatus });
  }

  async createCatalogueItem(input: CreateCatalogueItemInput): Promise<BookshopCatalogueItem> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.unitPriceKobo) || input.unitPriceKobo < 0) throw new Error('[P9] unit_price_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO bookshop_catalogue (id, workspace_id, tenant_id, isbn, title, author, publisher, category, unit_price_kobo, quantity_in_stock, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.isbn ?? null, input.title,
           input.author ?? null, input.publisher ?? null, input.category, input.unitPriceKobo,
           input.quantityInStock ?? 0).run();
    const item = await this.findCatalogueItemById(id, input.tenantId);
    if (!item) throw new Error('[bookshop] Failed to create catalogue item');
    return item;
  }

  async findCatalogueItemById(id: string, tenantId: string): Promise<BookshopCatalogueItem | null> {
    const row = await this.db.prepare(`SELECT * FROM bookshop_catalogue WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<CatalogueRow>();
    return row ? r2cat(row) : null;
  }

  async listCatalogue(workspaceId: string, tenantId: string, category?: BookCategory): Promise<BookshopCatalogueItem[]> {
    let sql = `SELECT * FROM bookshop_catalogue WHERE workspace_id = ? AND tenant_id = ?`;
    const binds: unknown[] = [workspaceId, tenantId];
    if (category) { sql += ` AND category = ?`; binds.push(category); }
    sql += ` ORDER BY title ASC`;
    const { results } = await this.db.prepare(sql).bind(...binds).all<CatalogueRow>();
    return (results ?? []).map(r2cat);
  }

  async createOrder(input: CreateBookshopOrderInput): Promise<BookshopOrder> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.totalKobo) || input.totalKobo < 0) throw new Error('[P9] total_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO bookshop_orders (id, workspace_id, tenant_id, customer_phone, order_items, total_kobo, payment_status, delivery_method, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, 'pending', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.customerPhone, input.orderItems,
           input.totalKobo, input.deliveryMethod ?? 'pickup').run();
    const o = await this.findOrderById(id, input.tenantId);
    if (!o) throw new Error('[bookshop] Failed to create order');
    return o;
  }

  async findOrderById(id: string, tenantId: string): Promise<BookshopOrder | null> {
    const row = await this.db.prepare(`SELECT * FROM bookshop_orders WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<OrderRow>();
    return row ? r2ord(row) : null;
  }

  async listOrders(workspaceId: string, tenantId: string): Promise<BookshopOrder[]> {
    const { results } = await this.db.prepare(`SELECT * FROM bookshop_orders WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<OrderRow>();
    return (results ?? []).map(r2ord);
  }
}
