import type { InternetCafeProfile, CreateInternetCafeInput, InternetCafeFSMState, CafeStation, CafeSession, CafeServiceOrder } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): InternetCafeProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, nccReg: r['ncc_reg'] as string|null, cacRc: r['cac_rc'] as string|null, workstationCount: r['workstation_count'] as number, status: r['status'] as InternetCafeFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toStation(r: Record<string, unknown>): CafeStation { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, stationNumber: r['station_number'] as string, stationType: r['station_type'] as CafeStation['stationType'], status: r['status'] as CafeStation['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toSession(r: Record<string, unknown>): CafeSession { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, stationId: r['station_id'] as string, customerRefId: r['customer_ref_id'] as string, startTime: r['start_time'] as number, durationMinutes: r['duration_minutes'] as number, perMinuteKobo: r['per_minute_kobo'] as number, sessionTotalKobo: r['session_total_kobo'] as number, status: r['status'] as CafeSession['status'], createdAt: r['created_at'] as number }; }
export class InternetCafeRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateInternetCafeInput): Promise<InternetCafeProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO internet_cafe_profiles (id,workspace_id,tenant_id,business_name,ncc_reg,cac_rc,workstation_count,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.nccReg??null,input.cacRc??null,input.workstationCount??0).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[internet-cafe] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<InternetCafeProfile|null> { const r = await this.db.prepare('SELECT * FROM internet_cafe_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<InternetCafeProfile|null> { const r = await this.db.prepare('SELECT * FROM internet_cafe_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: InternetCafeFSMState, fields?: { nccReg?: string }): Promise<InternetCafeProfile> {
    const extraClauses: string[] = []; const extraBinds: unknown[] = [];
    if (fields?.nccReg) { extraClauses.push('ncc_reg = ?'); extraBinds.push(fields.nccReg); }
    await this.db.prepare(`UPDATE internet_cafe_profiles SET status=?${extraClauses.length ? ', ' + extraClauses.join(', ') : ''}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,...extraBinds,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[internet-cafe] not found'); return p;
  }
  async addStation(profileId: string, tenantId: string, input: { stationNumber: string; stationType?: string }): Promise<CafeStation> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO cafe_stations (id,profile_id,tenant_id,station_number,station_type,status,created_at,updated_at) VALUES (?,?,?,?,?,\'available\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.stationNumber,input.stationType??'computer').run();
    const r = await this.db.prepare('SELECT * FROM cafe_stations WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[internet-cafe] station create failed'); return toStation(r);
  }
  async listStations(profileId: string, tenantId: string): Promise<CafeStation[]> { const { results } = await this.db.prepare('SELECT * FROM cafe_stations WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toStation); }
  async startSession(profileId: string, tenantId: string, input: { stationId: string; customerRefId: string; durationMinutes: number; perMinuteKobo: number; sessionTotalKobo: number }): Promise<CafeSession> {
    if (!Number.isInteger(input.durationMinutes)) throw new Error('duration_minutes must be integer');
    if (!Number.isInteger(input.perMinuteKobo) || !Number.isInteger(input.sessionTotalKobo)) throw new Error('Kobo values must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO cafe_sessions (id,profile_id,tenant_id,station_id,customer_ref_id,start_time,duration_minutes,per_minute_kobo,session_total_kobo,status,created_at) VALUES (?,?,?,?,?,unixepoch(),?,?,?,\'active\',unixepoch())').bind(id,profileId,tenantId,input.stationId,input.customerRefId,input.durationMinutes,input.perMinuteKobo,input.sessionTotalKobo).run();
    const r = await this.db.prepare('SELECT * FROM cafe_sessions WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[internet-cafe] session create failed'); return toSession(r);
  }
  async listSessions(profileId: string, tenantId: string): Promise<CafeSession[]> { const { results } = await this.db.prepare('SELECT * FROM cafe_sessions WHERE profile_id=? AND tenant_id=? ORDER BY start_time DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toSession); }
  async recordServiceOrder(profileId: string, tenantId: string, input: { customerRefId: string; serviceType: string; quantity: number; unitPriceKobo: number; totalKobo: number }): Promise<CafeServiceOrder> {
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO cafe_service_orders (id,profile_id,tenant_id,customer_ref_id,service_type,quantity,unit_price_kobo,total_kobo,order_date,created_at) VALUES (?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.customerRefId,input.serviceType,input.quantity,input.unitPriceKobo,input.totalKobo).run();
    const r = await this.db.prepare('SELECT * FROM cafe_service_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[internet-cafe] service order create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, customerRefId: r['customer_ref_id'] as string, serviceType: r['service_type'] as string, quantity: r['quantity'] as number, unitPriceKobo: r['unit_price_kobo'] as number, totalKobo: r['total_kobo'] as number, orderDate: r['order_date'] as number, createdAt: r['created_at'] as number };
  }
}
export function guardSeedToClaimed(_p: InternetCafeProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
