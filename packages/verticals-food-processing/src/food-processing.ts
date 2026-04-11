/**
 * FoodProcessingRepository — M12
 * T3: all queries scoped to tenantId
 * P9: total_cost_kobo / cost_per_kg_kobo / unit_sale_price_kobo are integers
 * ADL-010: AI at L2 — demand planning advisory only
 * NAFDAC batch traceability via nafdac_product_number + batch_number
 */

import type {
  FoodProcessingProfile, FpProductionBatch, FpRawMaterial, FpFinishedGood,
  FoodProcessingFSMState,
  CreateFoodProcessingInput, CreateBatchInput, CreateRawMaterialInput, CreateFinishedGoodInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; factory_name: string; nafdac_manufacturing_permit: string | null; son_product_cert: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface BatchRow { id: string; profile_id: string; tenant_id: string; product_name: string; nafdac_product_number: string | null; batch_number: string; production_date: number; quantity_units: number; unit_size_grams: number; total_cost_kobo: number; expiry_date: number | null; created_at: number; }
interface RawRow { id: string; profile_id: string; tenant_id: string; material_name: string; quantity_kg: number; cost_per_kg_kobo: number; supplier: string | null; intake_date: number; created_at: number; }
interface GoodRow { id: string; profile_id: string; tenant_id: string; product_name: string; nafdac_product_number: string | null; units_in_stock: number; unit_sale_price_kobo: number; created_at: number; updated_at: number; }

function rowToProfile(r: ProfileRow): FoodProcessingProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, factoryName: r.factory_name, nafdacManufacturingPermit: r.nafdac_manufacturing_permit, sonProductCert: r.son_product_cert, cacRc: r.cac_rc, status: r.status as FoodProcessingFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToBatch(r: BatchRow): FpProductionBatch { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, productName: r.product_name, nafdacProductNumber: r.nafdac_product_number, batchNumber: r.batch_number, productionDate: r.production_date, quantityUnits: r.quantity_units, unitSizeGrams: r.unit_size_grams, totalCostKobo: r.total_cost_kobo, expiryDate: r.expiry_date, createdAt: r.created_at }; }
function rowToRaw(r: RawRow): FpRawMaterial { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, materialName: r.material_name, quantityKg: r.quantity_kg, costPerKgKobo: r.cost_per_kg_kobo, supplier: r.supplier, intakeDate: r.intake_date, createdAt: r.created_at }; }
function rowToGood(r: GoodRow): FpFinishedGood { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, productName: r.product_name, nafdacProductNumber: r.nafdac_product_number, unitsInStock: r.units_in_stock, unitSalePriceKobo: r.unit_sale_price_kobo, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class FoodProcessingRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateFoodProcessingInput): Promise<FoodProcessingProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO food_processing_profiles (id,workspace_id,tenant_id,factory_name,nafdac_manufacturing_permit,son_product_cert,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.factoryName, input.nafdacManufacturingPermit ?? null, input.sonProductCert ?? null, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<FoodProcessingProfile | null> {
    const r = await this.db.prepare('SELECT * FROM food_processing_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async transition(id: string, tenantId: string, to: FoodProcessingFSMState): Promise<FoodProcessingProfile> {
    await this.db.prepare('UPDATE food_processing_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async updatePermit(id: string, tenantId: string, permit: string): Promise<void> {
    await this.db.prepare('UPDATE food_processing_profiles SET nafdac_manufacturing_permit=?,updated_at=? WHERE id=? AND tenant_id=?').bind(permit, now(), id, tenantId).run();
  }

  async createBatch(input: CreateBatchInput): Promise<FpProductionBatch> {
    if (!Number.isInteger(input.quantityUnits) || input.quantityUnits < 0) throw new Error('quantityUnits must be a non-negative integer');
    if (!Number.isInteger(input.unitSizeGrams) || input.unitSizeGrams < 0) throw new Error('unitSizeGrams must be a non-negative integer');
    if (!Number.isInteger(input.totalCostKobo) || input.totalCostKobo < 0) throw new Error('P9: totalCostKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO fp_production_batches (id,profile_id,tenant_id,product_name,nafdac_product_number,batch_number,production_date,quantity_units,unit_size_grams,total_cost_kobo,expiry_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.productName, input.nafdacProductNumber ?? null, input.batchNumber, input.productionDate, input.quantityUnits, input.unitSizeGrams, input.totalCostKobo, input.expiryDate ?? null, ts).run();
    return (await this.findBatchById(id, input.tenantId))!;
  }

  async findBatchById(id: string, tenantId: string): Promise<FpProductionBatch | null> {
    const r = await this.db.prepare('SELECT * FROM fp_production_batches WHERE id=? AND tenant_id=?').bind(id, tenantId).first<BatchRow>();
    return r ? rowToBatch(r) : null;
  }

  async createRawMaterial(input: CreateRawMaterialInput): Promise<FpRawMaterial> {
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) throw new Error('quantityKg must be a non-negative integer');
    if (!Number.isInteger(input.costPerKgKobo) || input.costPerKgKobo < 0) throw new Error('P9: costPerKgKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO fp_raw_materials (id,profile_id,tenant_id,material_name,quantity_kg,cost_per_kg_kobo,supplier,intake_date,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.materialName, input.quantityKg, input.costPerKgKobo, input.supplier ?? null, input.intakeDate, ts).run();
    return (await this.findRawMaterialById(id, input.tenantId))!;
  }

  async findRawMaterialById(id: string, tenantId: string): Promise<FpRawMaterial | null> {
    const r = await this.db.prepare('SELECT * FROM fp_raw_materials WHERE id=? AND tenant_id=?').bind(id, tenantId).first<RawRow>();
    return r ? rowToRaw(r) : null;
  }

  async createFinishedGood(input: CreateFinishedGoodInput): Promise<FpFinishedGood> {
    if (!Number.isInteger(input.unitSalePriceKobo) || input.unitSalePriceKobo < 0) throw new Error('P9: unitSalePriceKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO fp_finished_goods (id,profile_id,tenant_id,product_name,nafdac_product_number,units_in_stock,unit_sale_price_kobo,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.productName, input.nafdacProductNumber ?? null, input.unitsInStock ?? 0, input.unitSalePriceKobo, ts, ts).run();
    return (await this.findFinishedGoodById(id, input.tenantId))!;
  }

  async findFinishedGoodById(id: string, tenantId: string): Promise<FpFinishedGood | null> {
    const r = await this.db.prepare('SELECT * FROM fp_finished_goods WHERE id=? AND tenant_id=?').bind(id, tenantId).first<GoodRow>();
    return r ? rowToGood(r) : null;
  }
}
