/**
 * AbattoirRepository — M12
 * T3: all queries scoped to tenantId
 * P9: price_per_kg_kobo / total_kobo are integers; weights as integer kg; head_count as integer
 * ADL-010: AI at L2 — yield forecasts advisory only
 */

import type {
  AbattoirProfile, AbattoirSlaughterLog, AbattoirSale,
  AbattoirFSMState, AnimalType,
  CreateAbattoirInput, CreateSlaughterLogInput, CreateSaleInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; abattoir_name: string; nafdac_registration: string | null; nvri_approval: string | null; state_animal_health_cert: string | null; cac_rc: string | null; capacity_head_per_day: number; status: string; created_at: number; updated_at: number; }
interface SlaughterRow { id: string; profile_id: string; tenant_id: string; slaughter_date: number; animal_type: string; head_count: number; vet_inspected: number; meat_yield_kg: number; created_at: number; }
interface SaleRow { id: string; profile_id: string; tenant_id: string; buyer_phone: string; animal_type: string; quantity_kg: number; price_per_kg_kobo: number; total_kobo: number; sale_date: number; created_at: number; }

function rowToProfile(r: ProfileRow): AbattoirProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, abattoirName: r.abattoir_name, nafdacRegistration: r.nafdac_registration, nvriApproval: r.nvri_approval, stateAnimalHealthCert: r.state_animal_health_cert, cacRc: r.cac_rc, capacityHeadPerDay: r.capacity_head_per_day, status: r.status as AbattoirFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToSlaughter(r: SlaughterRow): AbattoirSlaughterLog { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, slaughterDate: r.slaughter_date, animalType: r.animal_type as AnimalType, headCount: r.head_count, vetInspected: r.vet_inspected === 1, meatYieldKg: r.meat_yield_kg, createdAt: r.created_at }; }
function rowToSale(r: SaleRow): AbattoirSale { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, buyerPhone: r.buyer_phone, animalType: r.animal_type as AnimalType, quantityKg: r.quantity_kg, pricePerKgKobo: r.price_per_kg_kobo, totalKobo: r.total_kobo, saleDate: r.sale_date, createdAt: r.created_at }; }

export class AbattoirRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateAbattoirInput): Promise<AbattoirProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO abattoir_profiles (id,workspace_id,tenant_id,abattoir_name,nafdac_registration,nvri_approval,state_animal_health_cert,cac_rc,capacity_head_per_day,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.abattoirName, input.nafdacRegistration ?? null, input.nvriApproval ?? null, input.stateAnimalHealthCert ?? null, input.cacRc ?? null, input.capacityHeadPerDay ?? 0, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<AbattoirProfile | null> {
    const r = await this.db.prepare('SELECT * FROM abattoir_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async transition(id: string, tenantId: string, to: AbattoirFSMState): Promise<AbattoirProfile> {
    await this.db.prepare('UPDATE abattoir_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async updateNafdacReg(id: string, tenantId: string, reg: string): Promise<void> {
    await this.db.prepare('UPDATE abattoir_profiles SET nafdac_registration=?,updated_at=? WHERE id=? AND tenant_id=?').bind(reg, now(), id, tenantId).run();
  }

  async createSlaughterLog(input: CreateSlaughterLogInput): Promise<AbattoirSlaughterLog> {
    if (!Number.isInteger(input.headCount) || input.headCount < 0) throw new Error('headCount must be a non-negative integer');
    if (!Number.isInteger(input.meatYieldKg) || input.meatYieldKg < 0) throw new Error('meatYieldKg must be a non-negative integer kg');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO abattoir_slaughter_log (id,profile_id,tenant_id,slaughter_date,animal_type,head_count,vet_inspected,meat_yield_kg,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.slaughterDate, input.animalType, input.headCount, input.vetInspected ? 1 : 0, input.meatYieldKg, ts).run();
    return (await this.findSlaughterLogById(id, input.tenantId))!;
  }

  async findSlaughterLogById(id: string, tenantId: string): Promise<AbattoirSlaughterLog | null> {
    const r = await this.db.prepare('SELECT * FROM abattoir_slaughter_log WHERE id=? AND tenant_id=?').bind(id, tenantId).first<SlaughterRow>();
    return r ? rowToSlaughter(r) : null;
  }

  async createSale(input: CreateSaleInput): Promise<AbattoirSale> {
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) throw new Error('quantityKg must be a non-negative integer');
    if (!Number.isInteger(input.pricePerKgKobo) || input.pricePerKgKobo < 0) throw new Error('P9: pricePerKgKobo must be a non-negative integer');
    if (!Number.isInteger(input.totalKobo) || input.totalKobo < 0) throw new Error('P9: totalKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO abattoir_sales (id,profile_id,tenant_id,buyer_phone,animal_type,quantity_kg,price_per_kg_kobo,total_kobo,sale_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.buyerPhone, input.animalType, input.quantityKg, input.pricePerKgKobo, input.totalKobo, input.saleDate, ts).run();
    return (await this.findSaleById(id, input.tenantId))!;
  }

  async findSaleById(id: string, tenantId: string): Promise<AbattoirSale | null> {
    const r = await this.db.prepare('SELECT * FROM abattoir_sales WHERE id=? AND tenant_id=?').bind(id, tenantId).first<SaleRow>();
    return r ? rowToSale(r) : null;
  }

  async listSales(profileId: string, tenantId: string): Promise<AbattoirSale[]> {
    const { results } = await this.db.prepare('SELECT * FROM abattoir_sales WHERE profile_id=? AND tenant_id=?').bind(profileId, tenantId).all<SaleRow>();
    return results.map(rowToSale);
  }
}
