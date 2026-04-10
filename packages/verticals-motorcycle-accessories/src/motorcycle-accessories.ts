import type { MotorcycleAccessoriesProfile, CreateMotorcycleAccessoriesInput, MotorcycleAccessoriesFSMState, MotorcycleAccessoriesInventoryItem, MotorcycleAccessoriesSale } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): MotorcycleAccessoriesProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, sonCert: r['son_cert'] as string|null, cacRc: r['cac_rc'] as string|null, status: r['status'] as MotorcycleAccessoriesFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toItem(r: Record<string, unknown>): MotorcycleAccessoriesInventoryItem { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, partName: r['part_name'] as string, partNumber: r['part_number'] as string|null, brand: r['brand'] as string|null, category: r['category'] as MotorcycleAccessoriesInventoryItem['category'], qtyInStock: r['qty_in_stock'] as number, costPriceKobo: r['cost_price_kobo'] as number, retailPriceKobo: r['retail_price_kobo'] as number, wholesalePriceKobo: r['wholesale_price_kobo'] as number, reorderLevel: r['reorder_level'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toSale(r: Record<string, unknown>): MotorcycleAccessoriesSale { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, customerRefId: r['customer_ref_id'] as string|null, items: r['items'] as string, totalKobo: r['total_kobo'] as number, saleDate: r['sale_date'] as number, isWholesale: Boolean(r['is_wholesale']), createdAt: r['created_at'] as number }; }
export class MotorcycleAccessoriesRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateMotorcycleAccessoriesInput): Promise<MotorcycleAccessoriesProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO motorcycle_accessories_profiles (id,workspace_id,tenant_id,business_name,son_cert,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.sonCert??null,input.cacRc??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[motorcycle-accessories] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<MotorcycleAccessoriesProfile|null> { const r = await this.db.prepare('SELECT * FROM motorcycle_accessories_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<MotorcycleAccessoriesProfile|null> { const r = await this.db.prepare('SELECT * FROM motorcycle_accessories_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: MotorcycleAccessoriesFSMState): Promise<MotorcycleAccessoriesProfile> {
    await this.db.prepare('UPDATE motorcycle_accessories_profiles SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[motorcycle-accessories] not found'); return p;
  }
  async addInventoryItem(profileId: string, tenantId: string, input: { partName: string; partNumber?: string; brand?: string; category?: string; qtyInStock: number; costPriceKobo: number; retailPriceKobo: number; wholesalePriceKobo?: number; reorderLevel?: number }): Promise<MotorcycleAccessoriesInventoryItem> {
    if (!Number.isInteger(input.retailPriceKobo)) throw new Error('retail_price_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO motorcycle_accessories_inventory (id,profile_id,tenant_id,part_name,part_number,brand,category,qty_in_stock,cost_price_kobo,retail_price_kobo,wholesale_price_kobo,reorder_level,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.partName,input.partNumber??null,input.brand??null,input.category??'general',input.qtyInStock,input.costPriceKobo,input.retailPriceKobo,input.wholesalePriceKobo??0,input.reorderLevel??5).run();
    const r = await this.db.prepare('SELECT * FROM motorcycle_accessories_inventory WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[motorcycle-accessories] item create failed'); return toItem(r);
  }
  async listInventory(profileId: string, tenantId: string): Promise<MotorcycleAccessoriesInventoryItem[]> { const { results } = await this.db.prepare('SELECT * FROM motorcycle_accessories_inventory WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toItem); }
  async recordSale(profileId: string, tenantId: string, input: { customerRefId?: string; items: string; totalKobo: number; saleDate: number; isWholesale?: boolean }): Promise<MotorcycleAccessoriesSale> {
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO motorcycle_accessories_sales (id,profile_id,tenant_id,customer_ref_id,items,total_kobo,sale_date,is_wholesale,created_at) VALUES (?,?,?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.customerRefId??null,input.items,input.totalKobo,input.saleDate,input.isWholesale?1:0).run();
    const r = await this.db.prepare('SELECT * FROM motorcycle_accessories_sales WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[motorcycle-accessories] sale create failed'); return toSale(r);
  }
  async listSales(profileId: string, tenantId: string): Promise<MotorcycleAccessoriesSale[]> { const { results } = await this.db.prepare('SELECT * FROM motorcycle_accessories_sales WHERE profile_id=? AND tenant_id=? ORDER BY sale_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toSale); }
}
export function guardSeedToClaimed(_p: MotorcycleAccessoriesProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
