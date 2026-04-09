import type {
  CarWashProfile, CreateCarWashInput, UpdateCarWashInput,
  CarWashFSMState, CarWashVisit, CreateCarWashVisitInput, WashType,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, business_name, lg_permit_number, state, lga, status, created_at, updated_at';
const VISIT_COLS = 'id, workspace_id, tenant_id, vehicle_plate, wash_type, price_kobo, visit_date, loyalty_count, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): CarWashProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, lgPermitNumber: r['lg_permit_number'] as string | null, state: r['state'] as string | null, lga: r['lga'] as string | null, status: r['status'] as CarWashFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToVisit(r: Record<string, unknown>): CarWashVisit {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, vehiclePlate: r['vehicle_plate'] as string, washType: r['wash_type'] as WashType, priceKobo: r['price_kobo'] as number, visitDate: r['visit_date'] as number, loyaltyCount: r['loyalty_count'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class CarWashRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateCarWashInput): Promise<CarWashProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO car_wash_profiles (id, workspace_id, tenant_id, business_name, lg_permit_number, state, lga, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.businessName, input.lgPermitNumber ?? null, input.state ?? null, input.lga ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[car-wash] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<CarWashProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM car_wash_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<CarWashProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM car_wash_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateCarWashInput): Promise<CarWashProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.businessName !== undefined) { sets.push('business_name = ?'); vals.push(input.businessName); }
    if (input.lgPermitNumber !== undefined) { sets.push('lg_permit_number = ?'); vals.push(input.lgPermitNumber); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE car_wash_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: CarWashFSMState): Promise<CarWashProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createVisit(input: CreateCarWashVisitInput): Promise<CarWashVisit> {
    if (!Number.isInteger(input.priceKobo) || input.priceKobo <= 0) throw new Error('[car-wash] priceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO car_wash_visits (id, workspace_id, tenant_id, vehicle_plate, wash_type, price_kobo, visit_date, loyalty_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.vehiclePlate, input.washType, input.priceKobo, input.visitDate ?? Math.floor(Date.now() / 1000), input.loyaltyCount ?? 0).run();
    const v = await this.findVisitById(id, input.tenantId);
    if (!v) throw new Error('[car-wash] visit create failed');
    return v;
  }

  async findVisitById(id: string, tenantId: string): Promise<CarWashVisit | null> {
    const row = await this.db.prepare(`SELECT ${VISIT_COLS} FROM car_wash_visits WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToVisit(row) : null;
  }

  async listVisits(workspaceId: string, tenantId: string): Promise<CarWashVisit[]> {
    const { results } = await this.db.prepare(`SELECT ${VISIT_COLS} FROM car_wash_visits WHERE workspace_id = ? AND tenant_id = ? ORDER BY visit_date DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToVisit);
  }

  async getLoyaltyCount(vehiclePlate: string, tenantId: string): Promise<number> {
    const { results } = await this.db.prepare(`SELECT ${VISIT_COLS} FROM car_wash_visits WHERE workspace_id = ? AND tenant_id = ?`).bind(vehiclePlate, tenantId).all<Record<string, unknown>>();
    return (results ?? []).filter(r => r['vehicle_plate'] === vehiclePlate).length;
  }
}
