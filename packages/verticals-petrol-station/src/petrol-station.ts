import type {
  PetrolStationProfile, CreatePetrolStationInput, UpdatePetrolStationInput,
  PetrolStationFSMState, FuelNozzle, CreateFuelNozzleInput, FuelType,
  FleetCreditAccount, CreateFleetCreditInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, station_name, nuprc_licence, dpms_id, address, state, status, created_at, updated_at';
const NOZZLE_COLS = 'id, workspace_id, tenant_id, fuel_type, pump_id, opening_reading_litres, closing_reading_litres, price_per_litre_kobo, created_at, updated_at';
const FLEET_COLS = 'id, workspace_id, tenant_id, fleet_name, fleet_phone, credit_limit_kobo, balance_owing_kobo, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): PetrolStationProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, stationName: r['station_name'] as string, nuprcLicence: r['nuprc_licence'] as string | null, dpmsId: r['dpms_id'] as string | null, address: r['address'] as string | null, state: r['state'] as string | null, status: r['status'] as PetrolStationFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToNozzle(r: Record<string, unknown>): FuelNozzle {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, fuelType: r['fuel_type'] as FuelType, pumpId: r['pump_id'] as string, openingReadingLitres: r['opening_reading_litres'] as number, closingReadingLitres: r['closing_reading_litres'] as number, pricePerLitreKobo: r['price_per_litre_kobo'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToFleet(r: Record<string, unknown>): FleetCreditAccount {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, fleetName: r['fleet_name'] as string, fleetPhone: r['fleet_phone'] as string, creditLimitKobo: r['credit_limit_kobo'] as number, balanceOwingKobo: r['balance_owing_kobo'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class PetrolStationRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreatePetrolStationInput): Promise<PetrolStationProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO petrol_station_profiles (id, workspace_id, tenant_id, station_name, nuprc_licence, dpms_id, address, state, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.stationName, input.nuprcLicence ?? null, input.dpmsId ?? null, input.address ?? null, input.state ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[petrol-station] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<PetrolStationProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM petrol_station_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<PetrolStationProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM petrol_station_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdatePetrolStationInput): Promise<PetrolStationProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.stationName !== undefined) { sets.push('station_name = ?'); vals.push(input.stationName); }
    if (input.nuprcLicence !== undefined) { sets.push('nuprc_licence = ?'); vals.push(input.nuprcLicence); }
    if (input.dpmsId !== undefined) { sets.push('dpms_id = ?'); vals.push(input.dpmsId); }
    if (input.address !== undefined) { sets.push('address = ?'); vals.push(input.address); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE petrol_station_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: PetrolStationFSMState): Promise<PetrolStationProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createNozzle(input: CreateFuelNozzleInput): Promise<FuelNozzle> {
    if (!Number.isInteger(input.openingReadingLitres) || input.openingReadingLitres < 0) throw new Error('[petrol-station] openingReadingLitres must be non-negative integer (P9)');
    if (!Number.isInteger(input.pricePerLitreKobo) || input.pricePerLitreKobo <= 0) throw new Error('[petrol-station] pricePerLitreKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO fuel_nozzles (id, workspace_id, tenant_id, fuel_type, pump_id, opening_reading_litres, closing_reading_litres, price_per_litre_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.fuelType, input.pumpId, input.openingReadingLitres, input.closingReadingLitres ?? 0, input.pricePerLitreKobo).run();
    const n = await this.findNozzleById(id, input.tenantId);
    if (!n) throw new Error('[petrol-station] nozzle create failed');
    return n;
  }

  async findNozzleById(id: string, tenantId: string): Promise<FuelNozzle | null> {
    const row = await this.db.prepare(`SELECT ${NOZZLE_COLS} FROM fuel_nozzles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToNozzle(row) : null;
  }

  async listNozzles(workspaceId: string, tenantId: string): Promise<FuelNozzle[]> {
    const { results } = await this.db.prepare(`SELECT ${NOZZLE_COLS} FROM fuel_nozzles WHERE workspace_id = ? AND tenant_id = ? ORDER BY pump_id ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToNozzle);
  }

  async updateNozzleClosingReading(id: string, tenantId: string, closingReadingLitres: number): Promise<FuelNozzle | null> {
    if (!Number.isInteger(closingReadingLitres) || closingReadingLitres < 0) throw new Error('[petrol-station] closingReadingLitres must be non-negative integer (P9)');
    await this.db.prepare(`UPDATE fuel_nozzles SET closing_reading_litres = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(closingReadingLitres, id, tenantId).run();
    return this.findNozzleById(id, tenantId);
  }

  async createFleetCredit(input: CreateFleetCreditInput): Promise<FleetCreditAccount> {
    if (!Number.isInteger(input.creditLimitKobo) || input.creditLimitKobo <= 0) throw new Error('[petrol-station] creditLimitKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO fleet_credit_accounts (id, workspace_id, tenant_id, fleet_name, fleet_phone, credit_limit_kobo, balance_owing_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.fleetName, input.fleetPhone, input.creditLimitKobo, input.balanceOwingKobo ?? 0).run();
    const f = await this.findFleetCreditById(id, input.tenantId);
    if (!f) throw new Error('[petrol-station] fleet credit create failed');
    return f;
  }

  async findFleetCreditById(id: string, tenantId: string): Promise<FleetCreditAccount | null> {
    const row = await this.db.prepare(`SELECT ${FLEET_COLS} FROM fleet_credit_accounts WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToFleet(row) : null;
  }

  async listFleetCredits(workspaceId: string, tenantId: string): Promise<FleetCreditAccount[]> {
    const { results } = await this.db.prepare(`SELECT ${FLEET_COLS} FROM fleet_credit_accounts WHERE workspace_id = ? AND tenant_id = ? ORDER BY fleet_name ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToFleet);
  }
}
