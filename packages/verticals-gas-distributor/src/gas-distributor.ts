import type { GasDistributorProfile, CreateGasDistributorInput, GasDistributorFSMState, GasInventoryItem, GasOrder, GasSafetyLog } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): GasDistributorProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, dprDealerLicence: r['dpr_dealer_licence'] as string|null, nuprcRef: r['nuprc_ref'] as string|null, lpgassocMembership: r['lpgassoc_membership'] as string|null, cacRc: r['cac_rc'] as string|null, status: r['status'] as GasDistributorFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toInventory(r: Record<string, unknown>): GasInventoryItem { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, cylinderSizeGrams: r['cylinder_size_grams'] as number, stockCount: r['stock_count'] as number, refillPriceKobo: r['refill_price_kobo'] as number, bulkPriceKobo: r['bulk_price_kobo'] as number, reorderLevel: r['reorder_level'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toOrder(r: Record<string, unknown>): GasOrder { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, customerRefId: r['customer_ref_id'] as string, cylinderSizeGrams: r['cylinder_size_grams'] as number, quantity: r['quantity'] as number, unitPriceKobo: r['unit_price_kobo'] as number, totalKobo: r['total_kobo'] as number, orderDate: r['order_date'] as number, deliveryDate: r['delivery_date'] as number|null, isBulk: Boolean(r['is_bulk']), status: r['status'] as GasOrder['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class GasDistributorRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateGasDistributorInput): Promise<GasDistributorProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO gas_distributor_profiles (id,workspace_id,tenant_id,business_name,dpr_dealer_licence,nuprc_ref,lpgassoc_membership,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.dprDealerLicence??null,input.nuprcRef??null,input.lpgassocMembership??null,input.cacRc??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[gas-distributor] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<GasDistributorProfile|null> { const r = await this.db.prepare('SELECT * FROM gas_distributor_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<GasDistributorProfile|null> { const r = await this.db.prepare('SELECT * FROM gas_distributor_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: GasDistributorFSMState, fields?: { dprDealerLicence?: string }): Promise<GasDistributorProfile> {
    const extra = fields?.dprDealerLicence ? `, dpr_dealer_licence='${fields.dprDealerLicence}'` : '';
    await this.db.prepare(`UPDATE gas_distributor_profiles SET status=?${extra}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[gas-distributor] not found'); return p;
  }
  async addInventory(profileId: string, tenantId: string, input: { cylinderSizeGrams: number; stockCount: number; refillPriceKobo: number; bulkPriceKobo?: number; reorderLevel?: number }): Promise<GasInventoryItem> {
    if (!Number.isInteger(input.cylinderSizeGrams)) throw new Error('cylinder_size_grams must be integer grams — no float kg (P9)');
    if (!Number.isInteger(input.refillPriceKobo)) throw new Error('refill_price_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO gas_inventory (id,profile_id,tenant_id,cylinder_size_grams,stock_count,refill_price_kobo,bulk_price_kobo,reorder_level,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.cylinderSizeGrams,input.stockCount,input.refillPriceKobo,input.bulkPriceKobo??0,input.reorderLevel??10).run();
    const r = await this.db.prepare('SELECT * FROM gas_inventory WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[gas-distributor] inventory create failed'); return toInventory(r);
  }
  async listInventory(profileId: string, tenantId: string): Promise<GasInventoryItem[]> { const { results } = await this.db.prepare('SELECT * FROM gas_inventory WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toInventory); }
  async createOrder(profileId: string, tenantId: string, input: { customerRefId: string; cylinderSizeGrams: number; quantity: number; unitPriceKobo: number; totalKobo: number; orderDate: number; isBulk?: boolean; deliveryDate?: number }): Promise<GasOrder> {
    if (!Number.isInteger(input.cylinderSizeGrams)) throw new Error('cylinder_size_grams must be integer grams (P9)');
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO gas_orders (id,profile_id,tenant_id,customer_ref_id,cylinder_size_grams,quantity,unit_price_kobo,total_kobo,order_date,delivery_date,is_bulk,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,\'pending\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.customerRefId,input.cylinderSizeGrams,input.quantity,input.unitPriceKobo,input.totalKobo,input.orderDate,input.deliveryDate??null,input.isBulk?1:0).run();
    const r = await this.db.prepare('SELECT * FROM gas_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[gas-distributor] order create failed'); return toOrder(r);
  }
  async listOrders(profileId: string, tenantId: string): Promise<GasOrder[]> { const { results } = await this.db.prepare('SELECT * FROM gas_orders WHERE profile_id=? AND tenant_id=? ORDER BY order_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toOrder); }
  async createSafetyLog(profileId: string, tenantId: string, input: { inspectionDate: number; inspectorRef?: string; cylindersInspected: number; passed: boolean; notes?: string }): Promise<GasSafetyLog> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO gas_safety_log (id,profile_id,tenant_id,inspection_date,inspector_ref,cylinders_inspected,passed,notes,created_at) VALUES (?,?,?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.inspectionDate,input.inspectorRef??null,input.cylindersInspected,input.passed?1:0,input.notes??null).run();
    const r = await this.db.prepare('SELECT * FROM gas_safety_log WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[gas-distributor] safety log create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, inspectionDate: r['inspection_date'] as number, inspectorRef: r['inspector_ref'] as string|null, cylindersInspected: r['cylinders_inspected'] as number, passed: Boolean(r['passed']), notes: r['notes'] as string|null, createdAt: r['created_at'] as number };
  }
}
export function guardSeedToClaimed(_p: GasDistributorProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
