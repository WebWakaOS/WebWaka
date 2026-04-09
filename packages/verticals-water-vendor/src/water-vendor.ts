import type {
  WaterVendorProfile, CreateWaterVendorInput, UpdateWaterVendorInput,
  WaterVendorFSMState, WaterProductPrice, CreateWaterProductPriceInput,
  WaterDeliveryOrder, CreateWaterDeliveryOrderInput, DeliveryStatus,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, brand_name, nafdac_number, cac_rc, factory_address, state, status, created_at, updated_at';
const PRICE_COLS = 'id, workspace_id, tenant_id, product_type, volume_litres, unit_price_kobo, created_at, updated_at';
const ORDER_COLS = 'id, workspace_id, tenant_id, client_phone, delivery_address, product_type, quantity_units, total_kobo, status, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): WaterVendorProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, brandName: r['brand_name'] as string, nafdacNumber: r['nafdac_number'] as string | null, cacRc: r['cac_rc'] as string | null, factoryAddress: r['factory_address'] as string | null, state: r['state'] as string | null, status: r['status'] as WaterVendorFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToPrice(r: Record<string, unknown>): WaterProductPrice {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, productType: r['product_type'] as WaterProductPrice['productType'], volumeLitres: r['volume_litres'] as number, unitPriceKobo: r['unit_price_kobo'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToOrder(r: Record<string, unknown>): WaterDeliveryOrder {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, clientPhone: r['client_phone'] as string, deliveryAddress: r['delivery_address'] as string, productType: r['product_type'] as WaterDeliveryOrder['productType'], quantityUnits: r['quantity_units'] as number, totalKobo: r['total_kobo'] as number, status: r['status'] as DeliveryStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class WaterVendorRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateWaterVendorInput): Promise<WaterVendorProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO water_vendor_profiles (id, workspace_id, tenant_id, brand_name, nafdac_number, cac_rc, factory_address, state, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.brandName, input.nafdacNumber ?? null, input.cacRc ?? null, input.factoryAddress ?? null, input.state ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[water-vendor] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<WaterVendorProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM water_vendor_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<WaterVendorProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM water_vendor_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateWaterVendorInput): Promise<WaterVendorProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.brandName !== undefined) { sets.push('brand_name = ?'); vals.push(input.brandName); }
    if (input.nafdacNumber !== undefined) { sets.push('nafdac_number = ?'); vals.push(input.nafdacNumber); }
    if (input.cacRc !== undefined) { sets.push('cac_rc = ?'); vals.push(input.cacRc); }
    if (input.factoryAddress !== undefined) { sets.push('factory_address = ?'); vals.push(input.factoryAddress); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE water_vendor_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: WaterVendorFSMState): Promise<WaterVendorProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createProductPrice(input: CreateWaterProductPriceInput): Promise<WaterProductPrice> {
    if (!Number.isInteger(input.volumeLitres) || input.volumeLitres <= 0) throw new Error('[water-vendor] volumeLitres must be positive integer (P9)');
    if (!Number.isInteger(input.unitPriceKobo) || input.unitPriceKobo <= 0) throw new Error('[water-vendor] unitPriceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO water_product_prices (id, workspace_id, tenant_id, product_type, volume_litres, unit_price_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.productType, input.volumeLitres, input.unitPriceKobo).run();
    const p = await this.findProductPriceById(id, input.tenantId);
    if (!p) throw new Error('[water-vendor] price create failed');
    return p;
  }

  async findProductPriceById(id: string, tenantId: string): Promise<WaterProductPrice | null> {
    const row = await this.db.prepare(`SELECT ${PRICE_COLS} FROM water_product_prices WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToPrice(row) : null;
  }

  async listProductPrices(workspaceId: string, tenantId: string): Promise<WaterProductPrice[]> {
    const { results } = await this.db.prepare(`SELECT ${PRICE_COLS} FROM water_product_prices WHERE workspace_id = ? AND tenant_id = ? ORDER BY product_type ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToPrice);
  }

  async createDeliveryOrder(input: CreateWaterDeliveryOrderInput): Promise<WaterDeliveryOrder> {
    if (!Number.isInteger(input.quantityUnits) || input.quantityUnits <= 0) throw new Error('[water-vendor] quantityUnits must be positive integer (P9)');
    if (!Number.isInteger(input.totalKobo) || input.totalKobo <= 0) throw new Error('[water-vendor] totalKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO water_delivery_orders (id, workspace_id, tenant_id, client_phone, delivery_address, product_type, quantity_units, total_kobo, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.clientPhone, input.deliveryAddress, input.productType, input.quantityUnits, input.totalKobo).run();
    const o = await this.findDeliveryOrderById(id, input.tenantId);
    if (!o) throw new Error('[water-vendor] delivery order create failed');
    return o;
  }

  async findDeliveryOrderById(id: string, tenantId: string): Promise<WaterDeliveryOrder | null> {
    const row = await this.db.prepare(`SELECT ${ORDER_COLS} FROM water_delivery_orders WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToOrder(row) : null;
  }

  async listDeliveryOrders(workspaceId: string, tenantId: string): Promise<WaterDeliveryOrder[]> {
    const { results } = await this.db.prepare(`SELECT ${ORDER_COLS} FROM water_delivery_orders WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToOrder);
  }

  async updateDeliveryStatus(id: string, tenantId: string, status: DeliveryStatus): Promise<WaterDeliveryOrder | null> {
    await this.db.prepare(`UPDATE water_delivery_orders SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findDeliveryOrderById(id, tenantId);
  }
}
