import type { LaundryProfile, CreateLaundryInput, LaundryFSMState, LaundryOrder, LaundrySubscription } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): LaundryProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, cacRc: r['cac_rc'] as string|null, serviceType: r['service_type'] as LaundryProfile['serviceType'], status: r['status'] as LaundryFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toOrder(r: Record<string, unknown>): LaundryOrder { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, customerRefId: r['customer_ref_id'] as string, itemCount: r['item_count'] as number, itemTypes: r['item_types'] as string|null, weightGrams: r['weight_grams'] as number|null, totalKobo: r['total_kobo'] as number, pickupDate: r['pickup_date'] as number|null, returnDate: r['return_date'] as number|null, expressService: Boolean(r['express_service']), status: r['status'] as LaundryOrder['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class LaundryRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateLaundryInput): Promise<LaundryProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO laundry_profiles (id,workspace_id,tenant_id,business_name,cac_rc,service_type,status,created_at,updated_at) VALUES (?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.cacRc??null,input.serviceType??'both').run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[laundry] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<LaundryProfile|null> { const r = await this.db.prepare('SELECT * FROM laundry_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<LaundryProfile|null> { const r = await this.db.prepare('SELECT * FROM laundry_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: LaundryFSMState): Promise<LaundryProfile> {
    await this.db.prepare('UPDATE laundry_profiles SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[laundry] not found'); return p;
  }
  async createOrder(profileId: string, tenantId: string, input: { customerRefId: string; itemCount: number; itemTypes?: string; weightGrams?: number; totalKobo: number; pickupDate?: number; expressService?: boolean }): Promise<LaundryOrder> {
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO laundry_orders (id,profile_id,tenant_id,customer_ref_id,item_count,item_types,weight_grams,total_kobo,pickup_date,express_service,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,\'received\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.customerRefId,input.itemCount,input.itemTypes??null,input.weightGrams??null,input.totalKobo,input.pickupDate??null,input.expressService?1:0).run();
    const r = await this.db.prepare('SELECT * FROM laundry_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[laundry] order create failed'); return toOrder(r);
  }
  async listOrders(profileId: string, tenantId: string): Promise<LaundryOrder[]> { const { results } = await this.db.prepare('SELECT * FROM laundry_orders WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toOrder); }
  async updateOrderStatus(id: string, tenantId: string, status: string, returnDate?: number): Promise<LaundryOrder> {
    await this.db.prepare('UPDATE laundry_orders SET status=?, return_date=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(status,returnDate??null,id,tenantId).run();
    const r = await this.db.prepare('SELECT * FROM laundry_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[laundry] order not found'); return toOrder(r);
  }
  async createSubscription(profileId: string, tenantId: string, input: { customerRefId: string; plan: string; monthlyKobo: number; startDate: number; endDate?: number }): Promise<LaundrySubscription> {
    if (!Number.isInteger(input.monthlyKobo)) throw new Error('monthly_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO laundry_subscriptions (id,profile_id,tenant_id,customer_ref_id,plan,monthly_kobo,start_date,end_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,\'active\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.customerRefId,input.plan,input.monthlyKobo,input.startDate,input.endDate??null).run();
    const r = await this.db.prepare('SELECT * FROM laundry_subscriptions WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[laundry] subscription create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, customerRefId: r['customer_ref_id'] as string, plan: r['plan'] as string, monthlyKobo: r['monthly_kobo'] as number, startDate: r['start_date'] as number, endDate: r['end_date'] as number|null, status: r['status'] as string, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
  }
}
export function guardSeedToClaimed(_p: LaundryProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
