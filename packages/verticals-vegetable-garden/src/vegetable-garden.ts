/**
 * VegetableGardenRepository — M12
 * T3: all queries scoped to tenantId
 * P9: cost_kobo / price_per_kg_kobo / total_kobo are integers; weights as integer grams; area as integer sqm
 * ADL-010: AI at L2 — harvest forecasts and price alerts advisory only
 * 3-state FSM: seeded → claimed → active
 */

import type {
  VegetableGardenProfile, FarmPlot, FarmInput, FarmHarvest, FarmSale,
  VegetableGardenFSMState, PlotStatus, InputType,
  CreateVegetableGardenInput, CreatePlotInput, CreateInputInput,
  CreateHarvestInput, CreateSaleInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; farm_name: string; state_agric_reg: string | null; fmard_extension_code: string | null; plot_count: number; status: string; created_at: number; updated_at: number; }
interface PlotRow { id: string; profile_id: string; tenant_id: string; plot_name: string; area_sqm: number; crop_type: string; planting_date: number | null; expected_harvest_date: number | null; status: string; created_at: number; updated_at: number; }
interface InputRow { id: string; profile_id: string; tenant_id: string; plot_id: string; input_type: string; quantity_grams: number; cost_kobo: number; input_date: number; created_at: number; }
interface HarvestRow { id: string; profile_id: string; tenant_id: string; plot_id: string; harvest_date: number; weight_grams: number; crop_type: string; created_at: number; }
interface SaleRow { id: string; profile_id: string; tenant_id: string; buyer_phone: string; crop_type: string; weight_grams: number; price_per_kg_kobo: number; total_kobo: number; sale_date: number; created_at: number; }

function rowToProfile(r: ProfileRow): VegetableGardenProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, farmName: r.farm_name, stateAgricReg: r.state_agric_reg, fmardExtensionCode: r.fmard_extension_code, plotCount: r.plot_count, status: r.status as VegetableGardenFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToPlot(r: PlotRow): FarmPlot { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, plotName: r.plot_name, areaSqm: r.area_sqm, cropType: r.crop_type, plantingDate: r.planting_date, expectedHarvestDate: r.expected_harvest_date, status: r.status as PlotStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToInput(r: InputRow): FarmInput { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, plotId: r.plot_id, inputType: r.input_type as InputType, quantityGrams: r.quantity_grams, costKobo: r.cost_kobo, inputDate: r.input_date, createdAt: r.created_at }; }
function rowToHarvest(r: HarvestRow): FarmHarvest { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, plotId: r.plot_id, harvestDate: r.harvest_date, weightGrams: r.weight_grams, cropType: r.crop_type, createdAt: r.created_at }; }
function rowToSale(r: SaleRow): FarmSale { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, buyerPhone: r.buyer_phone, cropType: r.crop_type, weightGrams: r.weight_grams, pricePerKgKobo: r.price_per_kg_kobo, totalKobo: r.total_kobo, saleDate: r.sale_date, createdAt: r.created_at }; }

export class VegetableGardenRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateVegetableGardenInput): Promise<VegetableGardenProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO vegetable_garden_profiles (id,workspace_id,tenant_id,farm_name,state_agric_reg,fmard_extension_code,plot_count,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.farmName, input.stateAgricReg ?? null, input.fmardExtensionCode ?? null, input.plotCount ?? 0, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<VegetableGardenProfile | null> {
    const r = await this.db.prepare('SELECT * FROM vegetable_garden_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async transition(id: string, tenantId: string, to: VegetableGardenFSMState): Promise<VegetableGardenProfile> {
    await this.db.prepare('UPDATE vegetable_garden_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(to, now(), id, tenantId).run();
    return (await this.findProfileById(id, tenantId))!;
  }

  async createPlot(input: CreatePlotInput): Promise<FarmPlot> {
    if (!Number.isInteger(input.areaSqm) || input.areaSqm <= 0) throw new Error('areaSqm must be a positive integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO farm_plots (id,profile_id,tenant_id,plot_name,area_sqm,crop_type,planting_date,expected_harvest_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.plotName, input.areaSqm, input.cropType, input.plantingDate ?? null, input.expectedHarvestDate ?? null, 'growing', ts, ts).run();
    return (await this.findPlotById(id, input.tenantId))!;
  }

  async findPlotById(id: string, tenantId: string): Promise<FarmPlot | null> {
    const r = await this.db.prepare('SELECT * FROM farm_plots WHERE id=? AND tenant_id=?').bind(id, tenantId).first<PlotRow>();
    return r ? rowToPlot(r) : null;
  }

  async createInput(input: CreateInputInput): Promise<FarmInput> {
    if (!Number.isInteger(input.quantityGrams) || input.quantityGrams < 0) throw new Error('quantityGrams must be a non-negative integer');
    if (!Number.isInteger(input.costKobo) || input.costKobo < 0) throw new Error('P9: costKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO farm_inputs (id,profile_id,tenant_id,plot_id,input_type,quantity_grams,cost_kobo,input_date,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.plotId, input.inputType, input.quantityGrams, input.costKobo, input.inputDate, ts).run();
    return (await this.findInputById(id, input.tenantId))!;
  }

  async findInputById(id: string, tenantId: string): Promise<FarmInput | null> {
    const r = await this.db.prepare('SELECT * FROM farm_inputs WHERE id=? AND tenant_id=?').bind(id, tenantId).first<InputRow>();
    return r ? rowToInput(r) : null;
  }

  async createHarvest(input: CreateHarvestInput): Promise<FarmHarvest> {
    if (!Number.isInteger(input.weightGrams) || input.weightGrams < 0) throw new Error('weightGrams must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO farm_harvests (id,profile_id,tenant_id,plot_id,harvest_date,weight_grams,crop_type,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.plotId, input.harvestDate, input.weightGrams, input.cropType, ts).run();
    return (await this.findHarvestById(id, input.tenantId))!;
  }

  async findHarvestById(id: string, tenantId: string): Promise<FarmHarvest | null> {
    const r = await this.db.prepare('SELECT * FROM farm_harvests WHERE id=? AND tenant_id=?').bind(id, tenantId).first<HarvestRow>();
    return r ? rowToHarvest(r) : null;
  }

  async createSale(input: CreateSaleInput): Promise<FarmSale> {
    if (!Number.isInteger(input.weightGrams) || input.weightGrams < 0) throw new Error('weightGrams must be a non-negative integer');
    if (!Number.isInteger(input.pricePerKgKobo) || input.pricePerKgKobo < 0) throw new Error('P9: pricePerKgKobo must be a non-negative integer');
    if (!Number.isInteger(input.totalKobo) || input.totalKobo < 0) throw new Error('P9: totalKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO farm_sales (id,profile_id,tenant_id,buyer_phone,crop_type,weight_grams,price_per_kg_kobo,total_kobo,sale_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.buyerPhone, input.cropType, input.weightGrams, input.pricePerKgKobo, input.totalKobo, input.saleDate, ts).run();
    return (await this.findSaleById(id, input.tenantId))!;
  }

  async findSaleById(id: string, tenantId: string): Promise<FarmSale | null> {
    const r = await this.db.prepare('SELECT * FROM farm_sales WHERE id=? AND tenant_id=?').bind(id, tenantId).first<SaleRow>();
    return r ? rowToSale(r) : null;
  }
}
