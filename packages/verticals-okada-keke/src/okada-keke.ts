import type { OkadaKekeProfile, CreateOkadaKekeInput, OkadaKekeFSMState, OkadaKekeVehicle, OkadaKekePilot, OkadaKekeTrip, VehicleType } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): OkadaKekeProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, nurtwMembership: r['nurtw_membership'] as string|null, lvaaReg: r['lvaa_reg'] as string|null, cacRc: r['cac_rc'] as string|null, operatingState: r['operating_state'] as string, vehicleCategory: r['vehicle_category'] as OkadaKekeProfile['vehicleCategory'], status: r['status'] as OkadaKekeFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toVehicle(r: Record<string, unknown>): OkadaKekeVehicle { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, category: r['category'] as OkadaKekeVehicle['category'], makeModel: r['make_model'] as string|null, plateNumber: r['plate_number'] as string, vehicleYear: r['vehicle_year'] as number|null, motorVehicleLicence: r['motor_vehicle_licence'] as string|null, insurancePolicyRef: r['insurance_policy_ref'] as string|null, status: r['status'] as string, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toPilot(r: Record<string, unknown>): OkadaKekePilot { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, pilotRefId: r['pilot_ref_id'] as string, licenceNumber: r['licence_number'] as string|null, vehicleId: r['vehicle_id'] as string|null, lasgRiderBadge: r['lasg_rider_badge'] as string|null, status: r['status'] as string, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toTrip(r: Record<string, unknown>): OkadaKekeTrip { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, pilotId: r['pilot_id'] as string, passengerRefId: r['passenger_ref_id'] as string, tripDate: r['trip_date'] as number, fareKobo: r['fare_kobo'] as number, paymentMethod: r['payment_method'] as string, status: r['status'] as string, createdAt: r['created_at'] as number }; }
const LAGOS_BAN_STATES = ['lagos'];
export class OkadaKekeRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateOkadaKekeInput): Promise<OkadaKekeProfile> {
    if (LAGOS_BAN_STATES.includes((input.operatingState ?? '').toLowerCase()) && input.vehicleCategory === 'okada') throw new Error('Okada (motorcycle taxi) banned in Lagos since 2022 — cannot register in this state (P2 ban check)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO okada_keke_profiles (id,workspace_id,tenant_id,business_name,nurtw_membership,lvaa_reg,cac_rc,operating_state,vehicle_category,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.nurtwMembership??null,input.lvaaReg??null,input.cacRc??null,input.operatingState??'',input.vehicleCategory??'keke').run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[okada-keke] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<OkadaKekeProfile|null> { const r = await this.db.prepare('SELECT * FROM okada_keke_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<OkadaKekeProfile|null> { const r = await this.db.prepare('SELECT * FROM okada_keke_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: OkadaKekeFSMState, fields?: { nurtwMembership?: string }): Promise<OkadaKekeProfile> {
    const extraClauses: string[] = []; const extraBinds: unknown[] = [];
    if (fields?.nurtwMembership) { extraClauses.push('nurtw_membership = ?'); extraBinds.push(fields.nurtwMembership); }
    await this.db.prepare(`UPDATE okada_keke_profiles SET status=?${extraClauses.length ? ', ' + extraClauses.join(', ') : ''}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,...extraBinds,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[okada-keke] not found'); return p;
  }
  async addVehicle(profileId: string, tenantId: string, input: { category: string; makeModel?: string; plateNumber: string; vehicleYear?: number; motorVehicleLicence?: string; insurancePolicyRef?: string }): Promise<OkadaKekeVehicle> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO okada_keke_vehicles (id,profile_id,tenant_id,category,make_model,plate_number,vehicle_year,motor_vehicle_licence,insurance_policy_ref,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,\'active\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.category,input.makeModel??null,input.plateNumber,input.vehicleYear??null,input.motorVehicleLicence??null,input.insurancePolicyRef??null).run();
    const r = await this.db.prepare('SELECT * FROM okada_keke_vehicles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[okada-keke] vehicle create failed'); return toVehicle(r);
  }
  async listVehicles(profileId: string, tenantId: string): Promise<OkadaKekeVehicle[]> { const { results } = await this.db.prepare('SELECT * FROM okada_keke_vehicles WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toVehicle); }
  async addPilot(profileId: string, tenantId: string, input: { pilotRefId: string; licenceNumber?: string; vehicleId?: string; lasgRiderBadge?: string }): Promise<OkadaKekePilot> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO okada_keke_pilots (id,profile_id,tenant_id,pilot_ref_id,licence_number,vehicle_id,lasg_rider_badge,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,\'active\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.pilotRefId,input.licenceNumber??null,input.vehicleId??null,input.lasgRiderBadge??null).run();
    const r = await this.db.prepare('SELECT * FROM okada_keke_pilots WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[okada-keke] pilot create failed'); return toPilot(r);
  }
  async listPilots(profileId: string, tenantId: string): Promise<OkadaKekePilot[]> { const { results } = await this.db.prepare('SELECT * FROM okada_keke_pilots WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toPilot); }
  async recordTrip(profileId: string, tenantId: string, input: { pilotId: string; passengerRefId: string; tripDate: number; fareKobo: number; paymentMethod?: string }): Promise<OkadaKekeTrip> {
    if (!Number.isInteger(input.fareKobo)) throw new Error('fare_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO okada_keke_trips (id,profile_id,tenant_id,pilot_id,passenger_ref_id,trip_date,fare_kobo,payment_method,status,created_at) VALUES (?,?,?,?,?,?,?,?,\'completed\',unixepoch())').bind(id,profileId,tenantId,input.pilotId,input.passengerRefId,input.tripDate,input.fareKobo,input.paymentMethod??'cash').run();
    const r = await this.db.prepare('SELECT * FROM okada_keke_trips WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[okada-keke] trip create failed'); return toTrip(r);
  }
  async listTrips(profileId: string, tenantId: string): Promise<OkadaKekeTrip[]> { const { results } = await this.db.prepare('SELECT * FROM okada_keke_trips WHERE profile_id=? AND tenant_id=? ORDER BY trip_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toTrip); }
  async create(input: { workspaceId: string; tenantId: string; operatorType: VehicleType; name?: string }): Promise<OkadaKekeProfile> {
    return this.createProfile({ workspaceId: input.workspaceId, tenantId: input.tenantId, businessName: input.name ?? 'Okada/Keke Cooperative', vehicleCategory: input.operatorType });
  }
}
export function guardSeedToClaimed(_p: OkadaKekeProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
export function guardLagosOkadaBan(operatingState: string, vehicleCategory: string): { allowed: boolean; reason?: string } {
  if (LAGOS_BAN_STATES.includes(operatingState.toLowerCase()) && vehicleCategory === 'okada') return { allowed: false, reason: 'Okada banned in Lagos since 2022 — registration blocked' };
  return { allowed: true };
}
