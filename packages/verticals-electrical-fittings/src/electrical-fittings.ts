import type {
  ElectricalFittingsProfile, CreateElectricalFittingsInput, UpdateElectricalFittingsInput,
  ElectricalFittingsFSMState, ElectricalCatalogueItem, CreateElectricalCatalogueItemInput,
  ElectricalOrder, CreateElectricalOrderInput, OrderStatus,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, company_name, cac_rc, son_dealer_reg, market_location, status, created_at, updated_at';
const CAT_COLS = 'id, workspace_id, tenant_id, product_name, type, son_type_number, unit, unit_price_kobo, quantity_in_stock, created_at, updated_at';
const ORDER_COLS = 'id, workspace_id, tenant_id, client_phone, items, total_kobo, credit_account_id, status, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): ElectricalFittingsProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, companyName: r['company_name'] as string, cacRc: r['cac_rc'] as string | null, sonDealerReg: r['son_dealer_reg'] as string | null, marketLocation: r['market_location'] as string | null, status: r['status'] as ElectricalFittingsFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToItem(r: Record<string, unknown>): ElectricalCatalogueItem {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, productName: r['product_name'] as string, type: r['type'] as ElectricalCatalogueItem['type'], sonTypeNumber: r['son_type_number'] as string | null, unit: r['unit'] as string, unitPriceKobo: r['unit_price_kobo'] as number, quantityInStock: r['quantity_in_stock'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToOrder(r: Record<string, unknown>): ElectricalOrder {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, clientPhone: r['client_phone'] as string, items: r['items'] as string, totalKobo: r['total_kobo'] as number, creditAccountId: r['credit_account_id'] as string | null, status: r['status'] as OrderStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class ElectricalFittingsRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateElectricalFittingsInput): Promise<ElectricalFittingsProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO electrical_fittings_profiles (id, workspace_id, tenant_id, company_name, cac_rc, son_dealer_reg, market_location, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.companyName, input.cacRc ?? null, input.sonDealerReg ?? null, input.marketLocation ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[electrical-fittings] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<ElectricalFittingsProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM electrical_fittings_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<ElectricalFittingsProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM electrical_fittings_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateElectricalFittingsInput): Promise<ElectricalFittingsProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.companyName !== undefined) { sets.push('company_name = ?'); vals.push(input.companyName); }
    if (input.cacRc !== undefined) { sets.push('cac_rc = ?'); vals.push(input.cacRc); }
    if (input.sonDealerReg !== undefined) { sets.push('son_dealer_reg = ?'); vals.push(input.sonDealerReg); }
    if (input.marketLocation !== undefined) { sets.push('market_location = ?'); vals.push(input.marketLocation); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE electrical_fittings_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: ElectricalFittingsFSMState): Promise<ElectricalFittingsProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createCatalogueItem(input: CreateElectricalCatalogueItemInput): Promise<ElectricalCatalogueItem> {
    if (!Number.isInteger(input.unitPriceKobo) || input.unitPriceKobo <= 0) throw new Error('[electrical-fittings] unitPriceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO electrical_catalogue (id, workspace_id, tenant_id, product_name, type, son_type_number, unit, unit_price_kobo, quantity_in_stock, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.productName, input.type, input.sonTypeNumber ?? null, input.unit, input.unitPriceKobo, input.quantityInStock ?? 0).run();
    const item = await this.findCatalogueItemById(id, input.tenantId);
    if (!item) throw new Error('[electrical-fittings] catalogue item create failed');
    return item;
  }

  async findCatalogueItemById(id: string, tenantId: string): Promise<ElectricalCatalogueItem | null> {
    const row = await this.db.prepare(`SELECT ${CAT_COLS} FROM electrical_catalogue WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToItem(row) : null;
  }

  async listCatalogueItems(workspaceId: string, tenantId: string): Promise<ElectricalCatalogueItem[]> {
    const { results } = await this.db.prepare(`SELECT ${CAT_COLS} FROM electrical_catalogue WHERE workspace_id = ? AND tenant_id = ? ORDER BY product_name ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToItem);
  }

  async createOrder(input: CreateElectricalOrderInput): Promise<ElectricalOrder> {
    if (!Number.isInteger(input.totalKobo) || input.totalKobo <= 0) throw new Error('[electrical-fittings] totalKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO electrical_orders (id, workspace_id, tenant_id, client_phone, items, total_kobo, credit_account_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'placed', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.clientPhone, input.items ?? '[]', input.totalKobo, input.creditAccountId ?? null).run();
    const o = await this.findOrderById(id, input.tenantId);
    if (!o) throw new Error('[electrical-fittings] order create failed');
    return o;
  }

  async findOrderById(id: string, tenantId: string): Promise<ElectricalOrder | null> {
    const row = await this.db.prepare(`SELECT ${ORDER_COLS} FROM electrical_orders WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToOrder(row) : null;
  }

  async listOrders(workspaceId: string, tenantId: string): Promise<ElectricalOrder[]> {
    const { results } = await this.db.prepare(`SELECT ${ORDER_COLS} FROM electrical_orders WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToOrder);
  }

  async updateOrderStatus(id: string, tenantId: string, status: OrderStatus): Promise<ElectricalOrder | null> {
    await this.db.prepare(`UPDATE electrical_orders SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findOrderById(id, tenantId);
  }
}
