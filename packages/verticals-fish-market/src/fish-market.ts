/**
 * FishMarketRepository — M12
 * T3: all queries scoped to tenantId
 * P9: price_per_kg_kobo / total_kobo are integers; weight as integer grams; expiry as integer unix
 * ADL-010: AI at L2 — demand planning advisory only
 */

import type {
  FishMarketProfile, FishStock, FishSale, FishWastage,
  FishMarketFSMState, FishCategory,
  CreateFishMarketInput, CreateStockInput, CreateSaleInput, CreateWastageInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; business_name: string; nafdac_food_safety_cert: string | null; nifda_registration: string | null; market_location: string | null; status: string; created_at: number; updated_at: number; }
interface StockRow { id: string; profile_id: string; tenant_id: string; fish_type: string; category: string; weight_grams: number; cost_per_kg_kobo: number; expiry_date: number; source: string | null; created_at: number; updated_at: number; }
interface SaleRow { id: string; profile_id: string; tenant_id: string; buyer_phone: string; fish_type: string; weight_grams: number; price_per_kg_kobo: number; total_kobo: number; sale_date: number; created_at: number; }
interface WastageRow { id: string; profile_id: string; tenant_id: string; waste_date: number; fish_type: string; weight_grams: number; reason: string | null; created_at: number; }

function rowToProfile(r: ProfileRow): FishMarketProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, businessName: r.business_name, nafdacFoodSafetyCert: r.nafdac_food_safety_cert, nifidaRegistration: r.nifda_registration, marketLocation: r.market_location, status: r.status as FishMarketFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToStock(r: StockRow): FishStock { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, fishType: r.fish_type, category: r.category as FishCategory, weightGrams: r.weight_grams, costPerKgKobo: r.cost_per_kg_kobo, expiryDate: r.expiry_date, source: r.source, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToSale(r: SaleRow): FishSale { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, buyerPhone: r.buyer_phone, fishType: r.fish_type, weightGrams: r.weight_grams, pricePerKgKobo: r.price_per_kg_kobo, totalKobo: r.total_kobo, saleDate: r.sale_date, createdAt: r.created_at }; }
function rowToWastage(r: WastageRow): FishWastage { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, wasteDate: r.waste_date, fishType: r.fish_type, weightGrams: r.weight_grams, reason: r.reason, createdAt: r.created_at }; }

export class FishMarketRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateFishMarketInput): Promise<FishMarketProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO fish_market_profiles (id,workspace_id,tenant_id,business_name,nafdac_food_safety_cert,nifda_registration,market_location,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.businessName, input.nafdacFoodSafetyCert ?? null, input.nifidaRegistration ?? null, input.marketLocation ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<FishMarketProfile | null> {
    const r = await this.db.prepare('SELECT * FROM fish_market_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async transition(id: string, tenantId: string, to: FishMarketFSMState): Promise<FishMarketProfile> {
    await this.db.prepare('UPDATE fish_market_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async updateNafdacCert(id: string, tenantId: string, cert: string): Promise<void> {
    await this.db.prepare('UPDATE fish_market_profiles SET nafdac_food_safety_cert=?,updated_at=? WHERE id=? AND tenant_id=?').bind(cert, now(), id, tenantId).run();
  }

  async createStock(input: CreateStockInput): Promise<FishStock> {
    if (!Number.isInteger(input.weightGrams) || input.weightGrams < 0) throw new Error('weightGrams must be a non-negative integer');
    if (!Number.isInteger(input.costPerKgKobo) || input.costPerKgKobo < 0) throw new Error('P9: costPerKgKobo must be a non-negative integer');
    if (!Number.isInteger(input.expiryDate)) throw new Error('expiryDate must be an integer unix timestamp');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO fish_stock (id,profile_id,tenant_id,fish_type,category,weight_grams,cost_per_kg_kobo,expiry_date,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.fishType, input.category ?? 'fresh', input.weightGrams, input.costPerKgKobo, input.expiryDate, input.source ?? null, ts, ts).run();
    return (await this.findStockById(id, input.tenantId))!;
  }

  async findStockById(id: string, tenantId: string): Promise<FishStock | null> {
    const r = await this.db.prepare('SELECT * FROM fish_stock WHERE id=? AND tenant_id=?').bind(id, tenantId).first<StockRow>();
    return r ? rowToStock(r) : null;
  }

  async createSale(input: CreateSaleInput): Promise<FishSale> {
    if (!Number.isInteger(input.weightGrams) || input.weightGrams < 0) throw new Error('weightGrams must be a non-negative integer');
    if (!Number.isInteger(input.pricePerKgKobo) || input.pricePerKgKobo < 0) throw new Error('P9: pricePerKgKobo must be a non-negative integer');
    if (!Number.isInteger(input.totalKobo) || input.totalKobo < 0) throw new Error('P9: totalKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO fish_sales (id,profile_id,tenant_id,buyer_phone,fish_type,weight_grams,price_per_kg_kobo,total_kobo,sale_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.buyerPhone, input.fishType, input.weightGrams, input.pricePerKgKobo, input.totalKobo, input.saleDate, ts).run();
    return (await this.findSaleById(id, input.tenantId))!;
  }

  async findSaleById(id: string, tenantId: string): Promise<FishSale | null> {
    const r = await this.db.prepare('SELECT * FROM fish_sales WHERE id=? AND tenant_id=?').bind(id, tenantId).first<SaleRow>();
    return r ? rowToSale(r) : null;
  }

  async createWastage(input: CreateWastageInput): Promise<FishWastage> {
    if (!Number.isInteger(input.weightGrams) || input.weightGrams < 0) throw new Error('weightGrams must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO fish_wastage (id,profile_id,tenant_id,waste_date,fish_type,weight_grams,reason,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.wasteDate, input.fishType, input.weightGrams, input.reason ?? null, ts).run();
    return (await this.findWastageById(id, input.tenantId))!;
  }

  async findWastageById(id: string, tenantId: string): Promise<FishWastage | null> {
    const r = await this.db.prepare('SELECT * FROM fish_wastage WHERE id=? AND tenant_id=?').bind(id, tenantId).first<WastageRow>();
    return r ? rowToWastage(r) : null;
  }
}
