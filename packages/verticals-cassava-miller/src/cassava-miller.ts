/**
 * CassavaMillerRepository — M12
 * T3: all queries scoped to tenantId
 * P9: price_per_kg_kobo / milling_cost_kobo / total_kobo are integers; weights as integer kg
 * ADL-010: AI at L2 — yield forecasts and price alerts advisory only
 */

import type {
  CassavaMillerProfile, MillerIntakeLog, MillerProductionBatch, MillerSale,
  CassavaMillerFSMState, CropType, ProductType,
  CreateCassavaMillerInput, CreateIntakeLogInput, CreateBatchInput, CreateMillerSaleInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; mill_name: string; nafdac_manufacturing_permit: string | null; son_product_cert: string | null; cac_rc: string | null; processing_capacity_kg_per_day: number; status: string; created_at: number; updated_at: number; }
interface IntakeRow { id: string; profile_id: string; tenant_id: string; crop_type: string; quantity_kg: number; supplier_phone: string | null; intake_date: number; cost_per_kg_kobo: number; created_at: number; }
interface BatchRow { id: string; profile_id: string; tenant_id: string; batch_date: number; crop_type: string; raw_input_kg: number; product_output_kg: number; product_type: string; milling_cost_kobo: number; created_at: number; }
interface SaleRow { id: string; profile_id: string; tenant_id: string; buyer_phone: string; product_type: string; quantity_kg: number; price_per_kg_kobo: number; total_kobo: number; sale_date: number; created_at: number; }

function rowToProfile(r: ProfileRow): CassavaMillerProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, millName: r.mill_name, nafdacManufacturingPermit: r.nafdac_manufacturing_permit, sonProductCert: r.son_product_cert, cacRc: r.cac_rc, processingCapacityKgPerDay: r.processing_capacity_kg_per_day, status: r.status as CassavaMillerFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToIntake(r: IntakeRow): MillerIntakeLog { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, cropType: r.crop_type as CropType, quantityKg: r.quantity_kg, supplierPhone: r.supplier_phone, intakeDate: r.intake_date, costPerKgKobo: r.cost_per_kg_kobo, createdAt: r.created_at }; }
function rowToBatch(r: BatchRow): MillerProductionBatch { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, batchDate: r.batch_date, cropType: r.crop_type as CropType, rawInputKg: r.raw_input_kg, productOutputKg: r.product_output_kg, productType: r.product_type as ProductType, millingCostKobo: r.milling_cost_kobo, createdAt: r.created_at }; }
function rowToSale(r: SaleRow): MillerSale { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, buyerPhone: r.buyer_phone, productType: r.product_type as ProductType, quantityKg: r.quantity_kg, pricePerKgKobo: r.price_per_kg_kobo, totalKobo: r.total_kobo, saleDate: r.sale_date, createdAt: r.created_at }; }

export class CassavaMillerRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateCassavaMillerInput): Promise<CassavaMillerProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO cassava_miller_profiles (id,workspace_id,tenant_id,mill_name,nafdac_manufacturing_permit,son_product_cert,cac_rc,processing_capacity_kg_per_day,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.millName, input.nafdacManufacturingPermit ?? null, input.sonProductCert ?? null, input.cacRc ?? null, input.processingCapacityKgPerDay ?? 0, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<CassavaMillerProfile | null> {
    const r = await this.db.prepare('SELECT * FROM cassava_miller_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async transition(id: string, tenantId: string, to: CassavaMillerFSMState): Promise<CassavaMillerProfile> {
    await this.db.prepare('UPDATE cassava_miller_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async updatePermit(id: string, tenantId: string, permit: string): Promise<void> {
    await this.db.prepare('UPDATE cassava_miller_profiles SET nafdac_manufacturing_permit=?,updated_at=? WHERE id=? AND tenant_id=?').bind(permit, now(), id, tenantId).run();
  }

  async createIntakeLog(input: CreateIntakeLogInput): Promise<MillerIntakeLog> {
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) throw new Error('quantityKg must be a non-negative integer');
    if (!Number.isInteger(input.costPerKgKobo) || input.costPerKgKobo < 0) throw new Error('P9: costPerKgKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO miller_intake_log (id,profile_id,tenant_id,crop_type,quantity_kg,supplier_phone,intake_date,cost_per_kg_kobo,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.cropType, input.quantityKg, input.supplierPhone ?? null, input.intakeDate, input.costPerKgKobo, ts).run();
    return (await this.findIntakeLogById(id, input.tenantId))!;
  }

  async findIntakeLogById(id: string, tenantId: string): Promise<MillerIntakeLog | null> {
    const r = await this.db.prepare('SELECT * FROM miller_intake_log WHERE id=? AND tenant_id=?').bind(id, tenantId).first<IntakeRow>();
    return r ? rowToIntake(r) : null;
  }

  async createBatch(input: CreateBatchInput): Promise<MillerProductionBatch> {
    if (!Number.isInteger(input.rawInputKg) || input.rawInputKg < 0) throw new Error('rawInputKg must be a non-negative integer');
    if (!Number.isInteger(input.productOutputKg) || input.productOutputKg < 0) throw new Error('productOutputKg must be a non-negative integer');
    if (!Number.isInteger(input.millingCostKobo) || input.millingCostKobo < 0) throw new Error('P9: millingCostKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO miller_production_batches (id,profile_id,tenant_id,batch_date,crop_type,raw_input_kg,product_output_kg,product_type,milling_cost_kobo,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.batchDate, input.cropType, input.rawInputKg, input.productOutputKg, input.productType, input.millingCostKobo, ts).run();
    return (await this.findBatchById(id, input.tenantId))!;
  }

  async findBatchById(id: string, tenantId: string): Promise<MillerProductionBatch | null> {
    const r = await this.db.prepare('SELECT * FROM miller_production_batches WHERE id=? AND tenant_id=?').bind(id, tenantId).first<BatchRow>();
    return r ? rowToBatch(r) : null;
  }

  async createSale(input: CreateMillerSaleInput): Promise<MillerSale> {
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) throw new Error('quantityKg must be a non-negative integer');
    if (!Number.isInteger(input.pricePerKgKobo) || input.pricePerKgKobo < 0) throw new Error('P9: pricePerKgKobo must be a non-negative integer');
    if (!Number.isInteger(input.totalKobo) || input.totalKobo < 0) throw new Error('P9: totalKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO miller_sales (id,profile_id,tenant_id,buyer_phone,product_type,quantity_kg,price_per_kg_kobo,total_kobo,sale_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.buyerPhone, input.productType, input.quantityKg, input.pricePerKgKobo, input.totalKobo, input.saleDate, ts).run();
    return (await this.findSaleById(id, input.tenantId))!;
  }

  async findSaleById(id: string, tenantId: string): Promise<MillerSale | null> {
    const r = await this.db.prepare('SELECT * FROM miller_sales WHERE id=? AND tenant_id=?').bind(id, tenantId).first<SaleRow>();
    return r ? rowToSale(r) : null;
  }
}
