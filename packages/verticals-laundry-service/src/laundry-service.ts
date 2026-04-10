import type { LaundryServiceProfile, CreateLaundryServiceInput, LaundryServiceFSMState, LaundryServiceOrder, LaundryServiceRoute } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): LaundryServiceProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, cacRc: r['cac_rc'] as string|null, serviceArea: r['service_area'] as string|null, status: r['status'] as LaundryServiceFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toOrder(r: Record<string, unknown>): LaundryServiceOrder { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, customerRefId: r['customer_ref_id'] as string, itemCount: r['item_count'] as number, itemTypes: r['item_types'] as string|null, totalKobo: r['total_kobo'] as number, pickupDate: r['pickup_date'] as number|null, returnDate: r['return_date'] as number|null, expressService: Boolean(r['express_service']), status: r['status'] as LaundryServiceOrder['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class LaundryServiceRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateLaundryServiceInput): Promise<LaundryServiceProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO laundry_service_profiles (id,workspace_id,tenant_id,business_name,cac_rc,service_area,status,created_at,updated_at) VALUES (?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.cacRc??null,input.serviceArea??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[laundry-service] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<LaundryServiceProfile|null> { const r = await this.db.prepare('SELECT * FROM laundry_service_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<LaundryServiceProfile|null> { const r = await this.db.prepare('SELECT * FROM laundry_service_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: LaundryServiceFSMState): Promise<LaundryServiceProfile> {
    await this.db.prepare('UPDATE laundry_service_profiles SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[laundry-service] not found'); return p;
  }
  async createOrder(profileId: string, tenantId: string, input: { customerRefId: string; itemCount: number; itemTypes?: string; totalKobo: number; pickupDate?: number; expressService?: boolean }): Promise<LaundryServiceOrder> {
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO laundry_service_orders (id,profile_id,tenant_id,customer_ref_id,item_count,item_types,total_kobo,pickup_date,express_service,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,\'received\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.customerRefId,input.itemCount,input.itemTypes??null,input.totalKobo,input.pickupDate??null,input.expressService?1:0).run();
    const r = await this.db.prepare('SELECT * FROM laundry_service_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[laundry-service] order create failed'); return toOrder(r);
  }
  async listOrders(profileId: string, tenantId: string): Promise<LaundryServiceOrder[]> { const { results } = await this.db.prepare('SELECT * FROM laundry_service_orders WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toOrder); }
  async updateOrderStatus(id: string, tenantId: string, status: string, returnDate?: number): Promise<LaundryServiceOrder> {
    await this.db.prepare('UPDATE laundry_service_orders SET status=?, return_date=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(status,returnDate??null,id,tenantId).run();
    const r = await this.db.prepare('SELECT * FROM laundry_service_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[laundry-service] order not found'); return toOrder(r);
  }
  async addRoute(profileId: string, tenantId: string, input: { routeName: string; coverageAreas: string; pickupDays?: string }): Promise<LaundryServiceRoute> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO laundry_service_routes (id,profile_id,tenant_id,route_name,coverage_areas,pickup_days,created_at) VALUES (?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.routeName,input.coverageAreas,input.pickupDays??null).run();
    const r = await this.db.prepare('SELECT * FROM laundry_service_routes WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[laundry-service] route create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, routeName: r['route_name'] as string, coverageAreas: r['coverage_areas'] as string, pickupDays: r['pickup_days'] as string|null, createdAt: r['created_at'] as number };
  }
}
export function guardSeedToClaimed(_p: LaundryServiceProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
