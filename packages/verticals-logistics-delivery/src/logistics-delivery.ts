import type { LogisticsDeliveryProfile, CreateLogisticsDeliveryInput, LogisticsDeliveryFSMState, DeliveryOrder, DeliveryFleetVehicle } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): LogisticsDeliveryProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, frscCert: r['frsc_cert'] as string|null, cacRc: r['cac_rc'] as string|null, serviceType: r['service_type'] as LogisticsDeliveryProfile['serviceType'], status: r['status'] as LogisticsDeliveryFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toOrder(r: Record<string, unknown>): DeliveryOrder { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, senderRefId: r['sender_ref_id'] as string, recipientRefId: r['recipient_ref_id'] as string, pickupAddress: r['pickup_address'] as string, deliveryAddress: r['delivery_address'] as string, packageType: r['package_type'] as DeliveryOrder['packageType'], weightGrams: r['weight_grams'] as number, declaredValueKobo: r['declared_value_kobo'] as number, deliveryFeeKobo: r['delivery_fee_kobo'] as number, pickupDate: r['pickup_date'] as number|null, deliveryDate: r['delivery_date'] as number|null, status: r['status'] as DeliveryOrder['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class LogisticsDeliveryRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateLogisticsDeliveryInput): Promise<LogisticsDeliveryProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO logistics_delivery_profiles (id,workspace_id,tenant_id,business_name,frsc_cert,cac_rc,service_type,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.frscCert??null,input.cacRc??null,input.serviceType??'same_day').run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[logistics-delivery] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<LogisticsDeliveryProfile|null> { const r = await this.db.prepare('SELECT * FROM logistics_delivery_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<LogisticsDeliveryProfile|null> { const r = await this.db.prepare('SELECT * FROM logistics_delivery_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: LogisticsDeliveryFSMState, fields?: { frscCert?: string }): Promise<LogisticsDeliveryProfile> {
    const extraClauses: string[] = []; const extraBinds: unknown[] = [];
    if (fields?.frscCert) { extraClauses.push('frsc_cert = ?'); extraBinds.push(fields.frscCert); }
    await this.db.prepare(`UPDATE logistics_delivery_profiles SET status=?${extraClauses.length ? ', ' + extraClauses.join(', ') : ''}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,...extraBinds,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[logistics-delivery] not found'); return p;
  }
  async createOrder(profileId: string, tenantId: string, input: { senderRefId: string; recipientRefId: string; pickupAddress: string; deliveryAddress: string; packageType?: string; weightGrams: number; declaredValueKobo: number; deliveryFeeKobo: number; pickupDate?: number }): Promise<DeliveryOrder> {
    if (!Number.isInteger(input.deliveryFeeKobo) || !Number.isInteger(input.declaredValueKobo)) throw new Error('Kobo values must be integers (P9)');
    if (!Number.isInteger(input.weightGrams)) throw new Error('weight_grams must be integer');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO delivery_orders (id,profile_id,tenant_id,sender_ref_id,recipient_ref_id,pickup_address,delivery_address,package_type,weight_grams,declared_value_kobo,delivery_fee_kobo,pickup_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,\'pending\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.senderRefId,input.recipientRefId,input.pickupAddress,input.deliveryAddress,input.packageType??'parcel',input.weightGrams,input.declaredValueKobo,input.deliveryFeeKobo,input.pickupDate??null).run();
    const r = await this.db.prepare('SELECT * FROM delivery_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[logistics-delivery] order create failed'); return toOrder(r);
  }
  async listOrders(profileId: string, tenantId: string): Promise<DeliveryOrder[]> { const { results } = await this.db.prepare('SELECT * FROM delivery_orders WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toOrder); }
  async updateOrderStatus(id: string, tenantId: string, status: string): Promise<DeliveryOrder> {
    await this.db.prepare('UPDATE delivery_orders SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(status,id,tenantId).run();
    const r = await this.db.prepare('SELECT * FROM delivery_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[logistics-delivery] order not found'); return toOrder(r);
  }
  async createFleetVehicle(profileId: string, tenantId: string, input: { vehicleType: string; plateNumber: string; capacityKgX100: number; driverRefId?: string }): Promise<DeliveryFleetVehicle> {
    if (!Number.isInteger(input.capacityKgX100)) throw new Error('capacity_kg_x100 must be integer (no floats)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO delivery_fleet (id,profile_id,tenant_id,vehicle_type,plate_number,capacity_kg_x100,driver_ref_id,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,\'available\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.vehicleType,input.plateNumber,input.capacityKgX100,input.driverRefId??null).run();
    const r = await this.db.prepare('SELECT * FROM delivery_fleet WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[logistics-delivery] fleet create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, vehicleType: r['vehicle_type'] as DeliveryFleetVehicle['vehicleType'], plateNumber: r['plate_number'] as string, capacityKgX100: r['capacity_kg_x100'] as number, driverRefId: r['driver_ref_id'] as string|null, status: r['status'] as string, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
  }
  async listFleet(profileId: string, tenantId: string): Promise<DeliveryFleetVehicle[]> { const { results } = await this.db.prepare('SELECT * FROM delivery_fleet WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(r => ({ id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, vehicleType: r['vehicle_type'] as DeliveryFleetVehicle['vehicleType'], plateNumber: r['plate_number'] as string, capacityKgX100: r['capacity_kg_x100'] as number, driverRefId: r['driver_ref_id'] as string|null, status: r['status'] as string, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number })); }
}
export function guardSeedToClaimed(_p: LogisticsDeliveryProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
