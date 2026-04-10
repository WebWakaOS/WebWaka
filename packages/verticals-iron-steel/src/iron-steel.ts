import type { IronSteelProfile, CreateIronSteelInput, IronSteelFSMState, SteelInventoryItem, SteelOrder } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): IronSteelProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, cisa_membership: r['cisa_membership'] as string|null, manilaMembership: r['manila_membership'] as string|null, cacRc: r['cac_rc'] as string|null, status: r['status'] as IronSteelFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toInventory(r: Record<string, unknown>): SteelInventoryItem { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, productName: r['product_name'] as string, productCode: r['product_code'] as string|null, grade: r['grade'] as string|null, thicknessMmX10: r['thickness_mm_x10'] as number, widthMm: r['width_mm'] as number, lengthMm: r['length_mm'] as number, weightGramsPerMeter: r['weight_grams_per_meter'] as number, qtyInStock: r['qty_in_stock'] as number, unitCostKobo: r['unit_cost_kobo'] as number, retailPriceKobo: r['retail_price_kobo'] as number, reorderLevel: r['reorder_level'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toOrder(r: Record<string, unknown>): SteelOrder { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, clientRefId: r['client_ref_id'] as string, items: r['items'] as string, totalKobo: r['total_kobo'] as number, orderDate: r['order_date'] as number, deliveryDate: r['delivery_date'] as number|null, isBulk: Boolean(r['is_bulk']), status: r['status'] as SteelOrder['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class IronSteelRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateIronSteelInput): Promise<IronSteelProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO iron_steel_profiles (id,workspace_id,tenant_id,business_name,cisa_membership,manila_membership,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.cisaMembership??null,input.manilaMembership??null,input.cacRc??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[iron-steel] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<IronSteelProfile|null> { const r = await this.db.prepare('SELECT * FROM iron_steel_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<IronSteelProfile|null> { const r = await this.db.prepare('SELECT * FROM iron_steel_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: IronSteelFSMState): Promise<IronSteelProfile> {
    await this.db.prepare('UPDATE iron_steel_profiles SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[iron-steel] not found'); return p;
  }
  async addInventory(profileId: string, tenantId: string, input: { productName: string; productCode?: string; grade?: string; thicknessMmX10: number; widthMm: number; lengthMm: number; weightGramsPerMeter: number; qtyInStock: number; unitCostKobo: number; retailPriceKobo: number; reorderLevel?: number }): Promise<SteelInventoryItem> {
    if (!Number.isInteger(input.thicknessMmX10)) throw new Error('thickness_mm_x10 must be integer (mm×10, no floats)');
    if (!Number.isInteger(input.unitCostKobo)) throw new Error('unit_cost_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO steel_inventory (id,profile_id,tenant_id,product_name,product_code,grade,thickness_mm_x10,width_mm,length_mm,weight_grams_per_meter,qty_in_stock,unit_cost_kobo,retail_price_kobo,reorder_level,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.productName,input.productCode??null,input.grade??null,input.thicknessMmX10,input.widthMm,input.lengthMm,input.weightGramsPerMeter,input.qtyInStock,input.unitCostKobo,input.retailPriceKobo,input.reorderLevel??5).run();
    const r = await this.db.prepare('SELECT * FROM steel_inventory WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[iron-steel] inventory create failed'); return toInventory(r);
  }
  async listInventory(profileId: string, tenantId: string): Promise<SteelInventoryItem[]> { const { results } = await this.db.prepare('SELECT * FROM steel_inventory WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toInventory); }
  async createOrder(profileId: string, tenantId: string, input: { clientRefId: string; items: string; totalKobo: number; orderDate: number; isBulk?: boolean; deliveryDate?: number }): Promise<SteelOrder> {
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO steel_orders (id,profile_id,tenant_id,client_ref_id,items,total_kobo,order_date,delivery_date,is_bulk,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,\'pending\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.clientRefId,input.items,input.totalKobo,input.orderDate,input.deliveryDate??null,input.isBulk?1:0).run();
    const r = await this.db.prepare('SELECT * FROM steel_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[iron-steel] order create failed'); return toOrder(r);
  }
  async listOrders(profileId: string, tenantId: string): Promise<SteelOrder[]> { const { results } = await this.db.prepare('SELECT * FROM steel_orders WHERE profile_id=? AND tenant_id=? ORDER BY order_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toOrder); }
}
export function guardSeedToClaimed(_p: IronSteelProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
