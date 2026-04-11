/**
 * PalmOilRepository — M12
 * T3: all queries scoped to tenantId
 * P9: cost_per_kg_kobo / production_cost_kobo / price_per_litre_kobo / total_kobo are integers
 * FFB weight as integer kg; oil output as integer ml (avoids float litres)
 * ADL-010: AI at L2 — yield forecasts and price alerts advisory only
 */

import type {
  PalmOilProfile, PalmFfbIntake, PalmProductionBatch, PalmOilSale,
  PalmOilFSMState, FfbSource,
  CreatePalmOilInput, CreateFfbIntakeInput, CreateBatchInput, CreateSaleInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; mill_name: string; nafdac_product_number: string | null; nifor_affiliation: string | null; state_agric_extension_reg: string | null; status: string; created_at: number; updated_at: number; }
interface FfbRow { id: string; profile_id: string; tenant_id: string; ffb_source: string; quantity_kg: number; cost_per_kg_kobo: number; intake_date: number; supplier_phone: string | null; created_at: number; }
interface BatchRow { id: string; profile_id: string; tenant_id: string; processing_date: number; ffb_input_kg: number; oil_output_ml: number; kernel_output_kg: number; production_cost_kobo: number; created_at: number; }
interface SaleRow { id: string; profile_id: string; tenant_id: string; buyer_phone: string; quantity_ml: number; price_per_litre_kobo: number; total_kobo: number; sale_date: number; created_at: number; }

function rowToProfile(r: ProfileRow): PalmOilProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, millName: r.mill_name, nafdacProductNumber: r.nafdac_product_number, niforAffiliation: r.nifor_affiliation, stateAgricExtensionReg: r.state_agric_extension_reg, status: r.status as PalmOilFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToFfb(r: FfbRow): PalmFfbIntake { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, ffbSource: r.ffb_source as FfbSource, quantityKg: r.quantity_kg, costPerKgKobo: r.cost_per_kg_kobo, intakeDate: r.intake_date, supplierPhone: r.supplier_phone, createdAt: r.created_at }; }
function rowToBatch(r: BatchRow): PalmProductionBatch { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, processingDate: r.processing_date, ffbInputKg: r.ffb_input_kg, oilOutputMl: r.oil_output_ml, kernelOutputKg: r.kernel_output_kg, productionCostKobo: r.production_cost_kobo, createdAt: r.created_at }; }
function rowToSale(r: SaleRow): PalmOilSale { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, buyerPhone: r.buyer_phone, quantityMl: r.quantity_ml, pricePerLitreKobo: r.price_per_litre_kobo, totalKobo: r.total_kobo, saleDate: r.sale_date, createdAt: r.created_at }; }

export class PalmOilRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreatePalmOilInput): Promise<PalmOilProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO palm_oil_profiles (id,workspace_id,tenant_id,mill_name,nafdac_product_number,nifor_affiliation,state_agric_extension_reg,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.millName, input.nafdacProductNumber ?? null, input.niforAffiliation ?? null, input.stateAgricExtensionReg ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<PalmOilProfile | null> {
    const r = await this.db.prepare('SELECT * FROM palm_oil_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async transition(id: string, tenantId: string, to: PalmOilFSMState): Promise<PalmOilProfile> {
    await this.db.prepare('UPDATE palm_oil_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async updateNafdacNumber(id: string, tenantId: string, num: string): Promise<void> {
    await this.db.prepare('UPDATE palm_oil_profiles SET nafdac_product_number=?,updated_at=? WHERE id=? AND tenant_id=?').bind(num, now(), id, tenantId).run();
  }

  async createFfbIntake(input: CreateFfbIntakeInput): Promise<PalmFfbIntake> {
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) throw new Error('quantityKg must be a non-negative integer kg');
    if (!Number.isInteger(input.costPerKgKobo) || input.costPerKgKobo < 0) throw new Error('P9: costPerKgKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO palm_ffb_intake (id,profile_id,tenant_id,ffb_source,quantity_kg,cost_per_kg_kobo,intake_date,supplier_phone,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.ffbSource ?? 'own_farm', input.quantityKg, input.costPerKgKobo, input.intakeDate, input.supplierPhone ?? null, ts).run();
    return (await this.findFfbIntakeById(id, input.tenantId))!;
  }

  async findFfbIntakeById(id: string, tenantId: string): Promise<PalmFfbIntake | null> {
    const r = await this.db.prepare('SELECT * FROM palm_ffb_intake WHERE id=? AND tenant_id=?').bind(id, tenantId).first<FfbRow>();
    return r ? rowToFfb(r) : null;
  }

  async createBatch(input: CreateBatchInput): Promise<PalmProductionBatch> {
    if (!Number.isInteger(input.ffbInputKg) || input.ffbInputKg < 0) throw new Error('ffbInputKg must be a non-negative integer kg');
    if (!Number.isInteger(input.oilOutputMl) || input.oilOutputMl < 0) throw new Error('oilOutputMl must be a non-negative integer ml (no float litres)');
    if (!Number.isInteger(input.productionCostKobo) || input.productionCostKobo < 0) throw new Error('P9: productionCostKobo must be a non-negative integer');
    const kernelKg = input.kernelOutputKg ?? 0;
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO palm_production_batches (id,profile_id,tenant_id,processing_date,ffb_input_kg,oil_output_ml,kernel_output_kg,production_cost_kobo,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.processingDate, input.ffbInputKg, input.oilOutputMl, kernelKg, input.productionCostKobo, ts).run();
    return (await this.findBatchById(id, input.tenantId))!;
  }

  async findBatchById(id: string, tenantId: string): Promise<PalmProductionBatch | null> {
    const r = await this.db.prepare('SELECT * FROM palm_production_batches WHERE id=? AND tenant_id=?').bind(id, tenantId).first<BatchRow>();
    return r ? rowToBatch(r) : null;
  }

  async createSale(input: CreateSaleInput): Promise<PalmOilSale> {
    if (!Number.isInteger(input.quantityMl) || input.quantityMl < 0) throw new Error('quantityMl must be a non-negative integer ml');
    if (!Number.isInteger(input.pricePerLitreKobo) || input.pricePerLitreKobo < 0) throw new Error('P9: pricePerLitreKobo must be a non-negative integer');
    if (!Number.isInteger(input.totalKobo) || input.totalKobo < 0) throw new Error('P9: totalKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO palm_oil_sales (id,profile_id,tenant_id,buyer_phone,quantity_ml,price_per_litre_kobo,total_kobo,sale_date,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.buyerPhone, input.quantityMl, input.pricePerLitreKobo, input.totalKobo, input.saleDate, ts).run();
    return (await this.findSaleById(id, input.tenantId))!;
  }

  async findSaleById(id: string, tenantId: string): Promise<PalmOilSale | null> {
    const r = await this.db.prepare('SELECT * FROM palm_oil_sales WHERE id=? AND tenant_id=?').bind(id, tenantId).first<SaleRow>();
    return r ? rowToSale(r) : null;
  }
}
