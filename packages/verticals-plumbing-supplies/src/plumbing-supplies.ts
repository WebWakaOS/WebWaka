import type { PlumbingSuppliesProfile, CreatePlumbingSuppliesInput, PlumbingSuppliesFSMState, PlumbingInventoryItem, PlumbingOrder } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): PlumbingSuppliesProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, companyName: r['company_name'] as string, sonCert: r['son_cert'] as string|null, cacRc: r['cac_rc'] as string|null, status: r['status'] as PlumbingSuppliesFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toItem(r: Record<string, unknown>): PlumbingInventoryItem { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, productName: r['product_name'] as string, productCode: r['product_code'] as string|null, materialType: r['material_type'] as PlumbingInventoryItem['materialType'], sizeMm: r['size_mm'] as number, qtyInStock: r['qty_in_stock'] as number, costPriceKobo: r['cost_price_kobo'] as number, retailPriceKobo: r['retail_price_kobo'] as number, reorderLevel: r['reorder_level'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toOrder(r: Record<string, unknown>): PlumbingOrder { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, clientRefId: r['client_ref_id'] as string, items: r['items'] as string, totalKobo: r['total_kobo'] as number, orderDate: r['order_date'] as number, deliveryDate: r['delivery_date'] as number|null, isBulk: Boolean(r['is_bulk']), status: r['status'] as PlumbingOrder['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class PlumbingSuppliesRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreatePlumbingSuppliesInput): Promise<PlumbingSuppliesProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO plumbing_supplies_profiles (id,workspace_id,tenant_id,company_name,son_cert,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.companyName,input.sonCert??null,input.cacRc??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[plumbing-supplies] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<PlumbingSuppliesProfile|null> { const r = await this.db.prepare('SELECT * FROM plumbing_supplies_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<PlumbingSuppliesProfile|null> { const r = await this.db.prepare('SELECT * FROM plumbing_supplies_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: PlumbingSuppliesFSMState): Promise<PlumbingSuppliesProfile> {
    await this.db.prepare('UPDATE plumbing_supplies_profiles SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[plumbing-supplies] not found'); return p;
  }
  async addInventory(profileId: string, tenantId: string, input: { productName: string; productCode?: string; materialType?: string; sizeMm: number; qtyInStock: number; costPriceKobo: number; retailPriceKobo: number; reorderLevel?: number }): Promise<PlumbingInventoryItem> {
    if (!Number.isInteger(input.sizeMm)) throw new Error('size_mm must be integer (no floats)');
    if (!Number.isInteger(input.retailPriceKobo)) throw new Error('retail_price_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO plumbing_supplies_inventory (id,profile_id,tenant_id,product_name,product_code,material_type,size_mm,qty_in_stock,cost_price_kobo,retail_price_kobo,reorder_level,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.productName,input.productCode??null,input.materialType??'PVC',input.sizeMm,input.qtyInStock,input.costPriceKobo,input.retailPriceKobo,input.reorderLevel??5).run();
    const r = await this.db.prepare('SELECT * FROM plumbing_supplies_inventory WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[plumbing-supplies] item create failed'); return toItem(r);
  }
  async listInventory(profileId: string, tenantId: string): Promise<PlumbingInventoryItem[]> { const { results } = await this.db.prepare('SELECT * FROM plumbing_supplies_inventory WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toItem); }
  async createOrder(profileId: string, tenantId: string, input: { clientRefId: string; items: string; totalKobo: number; orderDate: number; isBulk?: boolean; deliveryDate?: number }): Promise<PlumbingOrder> {
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO plumbing_supplies_orders (id,profile_id,tenant_id,client_ref_id,items,total_kobo,order_date,delivery_date,is_bulk,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,\'pending\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.clientRefId,input.items,input.totalKobo,input.orderDate,input.deliveryDate??null,input.isBulk?1:0).run();
    const r = await this.db.prepare('SELECT * FROM plumbing_supplies_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[plumbing-supplies] order create failed'); return toOrder(r);
  }
  async listOrders(profileId: string, tenantId: string): Promise<PlumbingOrder[]> { const { results } = await this.db.prepare('SELECT * FROM plumbing_supplies_orders WHERE profile_id=? AND tenant_id=? ORDER BY order_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toOrder); }
}
export function guardSeedToClaimed(_p: PlumbingSuppliesProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
