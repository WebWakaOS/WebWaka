import type { PaintsDistributorProfile, CreatePaintsDistributorInput, PaintsDistributorFSMState, PaintsInventoryItem, PaintsOrder } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): PaintsDistributorProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, companyName: r['company_name'] as string, sonCert: r['son_cert'] as string|null, nafdacRef: r['nafdac_ref'] as string|null, cacRc: r['cac_rc'] as string|null, status: r['status'] as PaintsDistributorFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toItem(r: Record<string, unknown>): PaintsInventoryItem { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, brandName: r['brand_name'] as string, colourCode: r['colour_code'] as string|null, finishType: r['finish_type'] as PaintsInventoryItem['finishType'], containerLitresX100: r['container_litres_x100'] as number, qtyInStock: r['qty_in_stock'] as number, costPriceKobo: r['cost_price_kobo'] as number, retailPriceKobo: r['retail_price_kobo'] as number, reorderLevel: r['reorder_level'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toOrder(r: Record<string, unknown>): PaintsOrder { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, clientRefId: r['client_ref_id'] as string, items: r['items'] as string, totalKobo: r['total_kobo'] as number, orderDate: r['order_date'] as number, deliveryDate: r['delivery_date'] as number|null, isBulk: Boolean(r['is_bulk']), status: r['status'] as PaintsOrder['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class PaintsDistributorRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreatePaintsDistributorInput): Promise<PaintsDistributorProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO paints_distributor_profiles (id,workspace_id,tenant_id,company_name,son_cert,nafdac_ref,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.companyName,input.sonCert??null,input.nafdacRef??null,input.cacRc??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[paints-distributor] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<PaintsDistributorProfile|null> { const r = await this.db.prepare('SELECT * FROM paints_distributor_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<PaintsDistributorProfile|null> { const r = await this.db.prepare('SELECT * FROM paints_distributor_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: PaintsDistributorFSMState): Promise<PaintsDistributorProfile> {
    await this.db.prepare('UPDATE paints_distributor_profiles SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[paints-distributor] not found'); return p;
  }
  async addInventory(profileId: string, tenantId: string, input: { brandName: string; colourCode?: string; finishType?: string; containerLitresX100: number; qtyInStock: number; costPriceKobo: number; retailPriceKobo: number; reorderLevel?: number }): Promise<PaintsInventoryItem> {
    if (!Number.isInteger(input.containerLitresX100)) throw new Error('container_litres_x100 must be integer (litres×100)');
    if (!Number.isInteger(input.retailPriceKobo)) throw new Error('retail_price_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO paints_inventory (id,profile_id,tenant_id,brand_name,colour_code,finish_type,container_litres_x100,qty_in_stock,cost_price_kobo,retail_price_kobo,reorder_level,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.brandName,input.colourCode??null,input.finishType??'matt',input.containerLitresX100,input.qtyInStock,input.costPriceKobo,input.retailPriceKobo,input.reorderLevel??5).run();
    const r = await this.db.prepare('SELECT * FROM paints_inventory WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[paints-distributor] item create failed'); return toItem(r);
  }
  async listInventory(profileId: string, tenantId: string): Promise<PaintsInventoryItem[]> { const { results } = await this.db.prepare('SELECT * FROM paints_inventory WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toItem); }
  async createOrder(profileId: string, tenantId: string, input: { clientRefId: string; items: string; totalKobo: number; orderDate: number; isBulk?: boolean; deliveryDate?: number }): Promise<PaintsOrder> {
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO paints_orders (id,profile_id,tenant_id,client_ref_id,items,total_kobo,order_date,delivery_date,is_bulk,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,\'pending\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.clientRefId,input.items,input.totalKobo,input.orderDate,input.deliveryDate??null,input.isBulk?1:0).run();
    const r = await this.db.prepare('SELECT * FROM paints_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[paints-distributor] order create failed'); return toOrder(r);
  }
  async listOrders(profileId: string, tenantId: string): Promise<PaintsOrder[]> { const { results } = await this.db.prepare('SELECT * FROM paints_orders WHERE profile_id=? AND tenant_id=? ORDER BY order_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toOrder); }
}
export function guardSeedToClaimed(_p: PaintsDistributorProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
