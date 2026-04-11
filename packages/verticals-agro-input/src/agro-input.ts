/**
 * AgroInputRepository — M10
 * T3: all queries scoped to tenantId
 * P9: price_per_unit_kobo / total_kobo / credit_limit_kobo are integers
 * ADL-010: AI at L2 maximum — advisory only
 */

import type {
  AgroInputProfile, AgroInputCatalogueItem, AgroInputOrder, AgroFarmerCredit,
  AgroInputFSMState, ProductCategory, OrderStatus,
  CreateAgroInputInput, CreateCatalogueItemInput, CreateOrderInput, CreateFarmerCreditInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; company_name: string; nasc_dealer_number: string | null; fepsan_membership: string | null; nafdac_agrochemical_reg: string | null; fmard_abp_participant: number; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface CatalogueRow { id: string; profile_id: string; tenant_id: string; product_name: string; category: string; nasc_or_nafdac_cert_number: string | null; unit: string; price_per_unit_kobo: number; quantity_in_stock: number; created_at: number; updated_at: number; }
interface OrderRow { id: string; profile_id: string; tenant_id: string; farmer_phone: string; farmer_name: string | null; items: string; total_kobo: number; abp_subsidy_kobo: number; balance_kobo: number; status: string; created_at: number; updated_at: number; }
interface CreditRow { id: string; profile_id: string; tenant_id: string; farmer_phone: string; credit_limit_kobo: number; balance_owing_kobo: number; abp_wallet_balance_kobo: number; created_at: number; updated_at: number; }

function rowToProfile(r: ProfileRow): AgroInputProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, companyName: r.company_name, nascDealerNumber: r.nasc_dealer_number, fepsanMembership: r.fepsan_membership, nafdacAgrochemicalReg: r.nafdac_agrochemical_reg, fmardAbpParticipant: r.fmard_abp_participant === 1, cacRc: r.cac_rc, status: r.status as AgroInputFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToCatalogue(r: CatalogueRow): AgroInputCatalogueItem { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, productName: r.product_name, category: r.category as ProductCategory, nascOrNafdacCertNumber: r.nasc_or_nafdac_cert_number, unit: r.unit, pricePerUnitKobo: r.price_per_unit_kobo, quantityInStock: r.quantity_in_stock, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToOrder(r: OrderRow): AgroInputOrder { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, farmerPhone: r.farmer_phone, farmerName: r.farmer_name, items: r.items, totalKobo: r.total_kobo, abpSubsidyKobo: r.abp_subsidy_kobo, balanceKobo: r.balance_kobo, status: r.status as OrderStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToCredit(r: CreditRow): AgroFarmerCredit { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, farmerPhone: r.farmer_phone, creditLimitKobo: r.credit_limit_kobo, balanceOwingKobo: r.balance_owing_kobo, abpWalletBalanceKobo: r.abp_wallet_balance_kobo, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class AgroInputRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateAgroInputInput): Promise<AgroInputProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO agro_input_profiles (id,workspace_id,tenant_id,company_name,nasc_dealer_number,fepsan_membership,nafdac_agrochemical_reg,fmard_abp_participant,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.companyName, input.nascDealerNumber ?? null, input.fepsanMembership ?? null, input.nafdacAgrochemicalReg ?? null, input.fmardAbpParticipant ? 1 : 0, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<AgroInputProfile | null> {
    const r = await this.db.prepare('SELECT * FROM agro_input_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async transition(id: string, tenantId: string, to: AgroInputFSMState): Promise<AgroInputProfile> {
    await this.db.prepare('UPDATE agro_input_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async updateNascDealerNumber(id: string, tenantId: string, nascDealerNumber: string): Promise<void> {
    await this.db.prepare('UPDATE agro_input_profiles SET nasc_dealer_number=?,updated_at=? WHERE id=? AND tenant_id=?').bind(nascDealerNumber, now(), id, tenantId).run();
  }

  async createCatalogueItem(input: CreateCatalogueItemInput): Promise<AgroInputCatalogueItem> {
    if (!Number.isInteger(input.pricePerUnitKobo) || input.pricePerUnitKobo < 0) throw new Error('P9: pricePerUnitKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO agro_input_catalogue (id,profile_id,tenant_id,product_name,category,nasc_or_nafdac_cert_number,unit,price_per_unit_kobo,quantity_in_stock,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.productName, input.category ?? 'seed', input.nascOrNafdacCertNumber ?? null, input.unit ?? 'kg', input.pricePerUnitKobo, input.quantityInStock ?? 0, ts, ts).run();
    return (await this.findCatalogueItemById(id, input.tenantId))!;
  }

  async findCatalogueItemById(id: string, tenantId: string): Promise<AgroInputCatalogueItem | null> {
    const r = await this.db.prepare('SELECT * FROM agro_input_catalogue WHERE id=? AND tenant_id=?').bind(id, tenantId).first<CatalogueRow>();
    return r ? rowToCatalogue(r) : null;
  }

  async createOrder(input: CreateOrderInput): Promise<AgroInputOrder> {
    if (!Number.isInteger(input.totalKobo) || input.totalKobo < 0) throw new Error('P9: totalKobo must be a non-negative integer');
    const abp = input.abpSubsidyKobo ?? 0;
    if (!Number.isInteger(abp) || abp < 0) throw new Error('P9: abpSubsidyKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    const balance = input.totalKobo - abp;
    await this.db.prepare('INSERT INTO agro_input_orders (id,profile_id,tenant_id,farmer_phone,farmer_name,items,total_kobo,abp_subsidy_kobo,balance_kobo,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.farmerPhone, input.farmerName ?? null, input.items ?? '[]', input.totalKobo, abp, balance, 'pending', ts, ts).run();
    return (await this.findOrderById(id, input.tenantId))!;
  }

  async findOrderById(id: string, tenantId: string): Promise<AgroInputOrder | null> {
    const r = await this.db.prepare('SELECT * FROM agro_input_orders WHERE id=? AND tenant_id=?').bind(id, tenantId).first<OrderRow>();
    return r ? rowToOrder(r) : null;
  }

  async createFarmerCredit(input: CreateFarmerCreditInput): Promise<AgroFarmerCredit> {
    if (!Number.isInteger(input.creditLimitKobo) || input.creditLimitKobo < 0) throw new Error('P9: creditLimitKobo must be a non-negative integer');
    const abpWallet = input.abpWalletBalanceKobo ?? 0;
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO agro_input_farmer_credit (id,profile_id,tenant_id,farmer_phone,credit_limit_kobo,balance_owing_kobo,abp_wallet_balance_kobo,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.farmerPhone, input.creditLimitKobo, 0, abpWallet, ts, ts).run();
    return (await this.findFarmerCreditById(id, input.tenantId))!;
  }

  async findFarmerCreditById(id: string, tenantId: string): Promise<AgroFarmerCredit | null> {
    const r = await this.db.prepare('SELECT * FROM agro_input_farmer_credit WHERE id=? AND tenant_id=?').bind(id, tenantId).first<CreditRow>();
    return r ? rowToCredit(r) : null;
  }
}
