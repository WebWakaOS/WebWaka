/**
 * @webwaka/verticals-waste-management — Repository
 * M11 — T3, P9, P13 compliant
 * Weight in integer kg; price in kobo (no floats)
 */
import type {
  WasteMgmtProfile, CreateWasteMgmtInput, UpdateWasteMgmtInput, WasteMgmtFSMState,
  WasteCollectionRoute, CreateRouteInput,
  WasteSubscription, CreateSubscriptionInput,
  WasteTonnageLog, CreateTonnageInput,
  RecyclingPurchase, CreateRecyclingInput, MaterialType,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; company_name: string; lawma_or_state_permit: string | null; fmenv_cert: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface RouteRow { id: string; profile_id: string; tenant_id: string; route_name: string; zone: string | null; client_count: number; truck_id: string | null; collection_day: string | null; created_at: number; updated_at: number; }
interface SubRow { id: string; profile_id: string; route_id: string | null; tenant_id: string; client_phone: string | null; client_address: string | null; monthly_fee_kobo: number; payment_status: string; created_at: number; updated_at: number; }
interface TonnRow { id: string; profile_id: string; route_id: string | null; tenant_id: string; collection_date: number | null; weight_kg: number; waste_type: string; created_at: number; updated_at: number; }
interface RecycRow { id: string; profile_id: string; tenant_id: string; material_type: string; weight_kg: number; price_per_kg_kobo: number; supplier_phone: string | null; total_kobo: number; collection_date: number | null; created_at: number; updated_at: number; }

const PC = 'id, workspace_id, tenant_id, company_name, lawma_or_state_permit, fmenv_cert, cac_rc, status, created_at, updated_at';
const RC = 'id, profile_id, tenant_id, route_name, zone, client_count, truck_id, collection_day, created_at, updated_at';
const SC = 'id, profile_id, route_id, tenant_id, client_phone, client_address, monthly_fee_kobo, payment_status, created_at, updated_at';
const TC = 'id, profile_id, route_id, tenant_id, collection_date, weight_kg, waste_type, created_at, updated_at';
const RCC = 'id, profile_id, tenant_id, material_type, weight_kg, price_per_kg_kobo, supplier_phone, total_kobo, collection_date, created_at, updated_at';

function rP(r: ProfileRow): WasteMgmtProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, companyName: r.company_name, lawmaOrStatePermit: r.lawma_or_state_permit, fmenvCert: r.fmenv_cert, cacRc: r.cac_rc, status: r.status as WasteMgmtFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rR(r: RouteRow): WasteCollectionRoute { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, routeName: r.route_name, zone: r.zone, clientCount: r.client_count, truckId: r.truck_id, collectionDay: r.collection_day, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rS(r: SubRow): WasteSubscription { return { id: r.id, profileId: r.profile_id, routeId: r.route_id, tenantId: r.tenant_id, clientPhone: r.client_phone, clientAddress: r.client_address, monthlyFeeKobo: r.monthly_fee_kobo, paymentStatus: r.payment_status, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rT(r: TonnRow): WasteTonnageLog { return { id: r.id, profileId: r.profile_id, routeId: r.route_id, tenantId: r.tenant_id, collectionDate: r.collection_date, weightKg: r.weight_kg, wasteType: r.waste_type, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rRec(r: RecycRow): RecyclingPurchase { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, materialType: r.material_type as MaterialType, weightKg: r.weight_kg, pricePerKgKobo: r.price_per_kg_kobo, supplierPhone: r.supplier_phone, totalKobo: r.total_kobo, collectionDate: r.collection_date, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class WasteManagementRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateWasteMgmtInput): Promise<WasteMgmtProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO waste_mgmt_profiles (id, workspace_id, tenant_id, company_name, lawma_or_state_permit, fmenv_cert, cac_rc, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NULL, ?, 'seeded', unixepoch(), unixepoch())`)
      .bind(id, input.workspaceId, input.tenantId, input.companyName, input.lawmaOrStatePermit ?? null, input.cacRc ?? null).run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[waste-management] create failed');
    return p;
  }

  async findById(id: string, tenantId: string): Promise<WasteMgmtProfile | null> {
    const row = await this.db.prepare(`SELECT ${PC} FROM waste_mgmt_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? rP(row) : null;
  }

  async update(id: string, tenantId: string, input: UpdateWasteMgmtInput): Promise<WasteMgmtProfile | null> {
    const sets: string[] = ['updated_at = unixepoch()']; const b: unknown[] = [];
    if (input.companyName !== undefined) { sets.push('company_name = ?'); b.push(input.companyName); }
    if ('lawmaOrStatePermit' in input) { sets.push('lawma_or_state_permit = ?'); b.push(input.lawmaOrStatePermit ?? null); }
    if ('fmenvCert' in input) { sets.push('fmenv_cert = ?'); b.push(input.fmenvCert ?? null); }
    if ('cacRc' in input) { sets.push('cac_rc = ?'); b.push(input.cacRc ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE waste_mgmt_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, to: WasteMgmtFSMState): Promise<WasteMgmtProfile | null> {
    return this.update(id, tenantId, { status: to });
  }

  async createRoute(input: CreateRouteInput): Promise<WasteCollectionRoute> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO waste_collection_routes (id, profile_id, tenant_id, route_name, zone, client_count, truck_id, collection_day, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.routeName, input.zone ?? null, input.truckId ?? null, input.collectionDay ?? null).run();
    const row = await this.db.prepare(`SELECT ${RC} FROM waste_collection_routes WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<RouteRow>();
    if (!row) throw new Error('[waste-management] createRoute failed');
    return rR(row);
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<WasteSubscription> {
    if (!Number.isInteger(input.monthlyFeeKobo) || input.monthlyFeeKobo < 0) throw new Error('[waste-management] monthlyFeeKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO waste_subscriptions (id, profile_id, route_id, tenant_id, client_phone, client_address, monthly_fee_kobo, payment_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.routeId ?? null, input.tenantId, input.clientPhone ?? null, input.clientAddress ?? null, input.monthlyFeeKobo, input.paymentStatus ?? 'pending').run();
    const row = await this.db.prepare(`SELECT ${SC} FROM waste_subscriptions WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<SubRow>();
    if (!row) throw new Error('[waste-management] createSubscription failed');
    return rS(row);
  }

  async createTonnageLog(input: CreateTonnageInput): Promise<WasteTonnageLog> {
    if (!Number.isInteger(input.weightKg) || input.weightKg < 0) throw new Error('[waste-management] weightKg must be a non-negative integer');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO waste_tonnage_log (id, profile_id, route_id, tenant_id, collection_date, weight_kg, waste_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.routeId ?? null, input.tenantId, input.collectionDate ?? null, input.weightKg, input.wasteType ?? 'general').run();
    const row = await this.db.prepare(`SELECT ${TC} FROM waste_tonnage_log WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<TonnRow>();
    if (!row) throw new Error('[waste-management] createTonnageLog failed');
    return rT(row);
  }

  async createRecyclingPurchase(input: CreateRecyclingInput): Promise<RecyclingPurchase> {
    if (!Number.isInteger(input.weightKg) || input.weightKg <= 0) throw new Error('[waste-management] weightKg must be a positive integer');
    if (!Number.isInteger(input.pricePerKgKobo) || input.pricePerKgKobo < 0) throw new Error('[waste-management] pricePerKgKobo must be a non-negative integer (P9)');
    const totalKobo = input.weightKg * input.pricePerKgKobo;
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO recycling_purchases (id, profile_id, tenant_id, material_type, weight_kg, price_per_kg_kobo, supplier_phone, total_kobo, collection_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.materialType ?? 'plastic', input.weightKg, input.pricePerKgKobo, input.supplierPhone ?? null, totalKobo, input.collectionDate ?? null).run();
    const row = await this.db.prepare(`SELECT ${RCC} FROM recycling_purchases WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<RecycRow>();
    if (!row) throw new Error('[waste-management] createRecyclingPurchase failed');
    return rRec(row);
  }
}
