/**
 * Farm / Agricultural Producer D1 repository.
 * M10 Agricultural + Specialist Verticals
 * Platform Invariants: T3 (all queries scoped by tenantId), P9 (integer kobo + kg)
 * Migration: 0219_farm_vertical.sql
 */

import type {
  FarmProfile,
  FarmFSMState,
  CreateFarmInput,
  UpdateFarmInput,
  FarmHarvest,
  HarvestGrade,
  HarvestStatus,
  CreateHarvestInput,
  FarmSale,
  SaleStatus,
  CreateSaleInput,
  WeatherEvent,
  CreateWeatherEventInput,
} from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface ProfileRow {
  id: string; workspace_id: string; tenant_id: string;
  farm_name: string; cac_number: string | null;
  state: string; lga: string; farm_size_hectares: number;
  primary_crop: string; status: string;
  created_at: number; updated_at: number;
}
interface HarvestRow {
  id: string; farm_id: string; tenant_id: string;
  crop_type: string; quantity_kg: number; harvest_date: number;
  grade: string; asking_price_kobo: number; status: string;
  created_at: number;
}
interface SaleRow {
  id: string; harvest_id: string; tenant_id: string;
  buyer_phone: string; quantity_kg: number;
  sale_price_kobo: number; total_amount_kobo: number;
  status: string; created_at: number; updated_at: number;
}
interface WeatherRow {
  id: string; farm_id: string; tenant_id: string;
  event_type: string; description: string; severity: number;
  event_date: number; created_at: number;
}

function rowToProfile(r: ProfileRow): FarmProfile {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    farmName: r.farm_name, cacNumber: r.cac_number,
    state: r.state, lga: r.lga,
    farmSizeHectares: r.farm_size_hectares,
    primaryCrop: r.primary_crop,
    status: r.status as FarmFSMState,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function rowToHarvest(r: HarvestRow): FarmHarvest {
  return {
    id: r.id, farmId: r.farm_id, tenantId: r.tenant_id,
    cropType: r.crop_type, quantityKg: r.quantity_kg,
    harvestDate: r.harvest_date,
    grade: r.grade as HarvestGrade,
    askingPriceKobo: r.asking_price_kobo,
    status: r.status as HarvestStatus,
    createdAt: r.created_at,
  };
}
function rowToSale(r: SaleRow): FarmSale {
  return {
    id: r.id, harvestId: r.harvest_id, tenantId: r.tenant_id,
    buyerPhone: r.buyer_phone, quantityKg: r.quantity_kg,
    salePriceKobo: r.sale_price_kobo, totalAmountKobo: r.total_amount_kobo,
    status: r.status as SaleStatus,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function rowToWeather(r: WeatherRow): WeatherEvent {
  return {
    id: r.id, farmId: r.farm_id, tenantId: r.tenant_id,
    eventType: r.event_type as WeatherEvent['eventType'],
    description: r.description,
    severity: r.severity as 1 | 2 | 3,
    eventDate: r.event_date, createdAt: r.created_at,
  };
}

export class FarmRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateFarmInput): Promise<FarmProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO farm_profiles
         (id, workspace_id, tenant_id, farm_name, cac_number, state, lga,
          farm_size_hectares, primary_crop, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`,
    ).bind(
      id, input.workspaceId, input.tenantId, input.farmName,
      input.cacNumber ?? null, input.state, input.lga,
      input.farmSizeHectares ?? 0, input.primaryCrop ?? 'mixed',
    ).run();
    const profile = await this.findProfileById(id, input.tenantId);
    if (!profile) throw new Error('[farm] Failed to create profile');
    return profile;
  }

  async findProfileById(id: string, tenantId: string): Promise<FarmProfile | null> {
    const row = await this.db.prepare(
      `SELECT * FROM farm_profiles WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<ProfileRow>();
    return row ? rowToProfile(row) : null;
  }

  async findProfilesByWorkspace(workspaceId: string, tenantId: string): Promise<FarmProfile[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM farm_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(workspaceId, tenantId).all<ProfileRow>();
    return (results ?? []).map(rowToProfile);
  }

  async updateProfile(id: string, tenantId: string, input: UpdateFarmInput): Promise<FarmProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.farmName !== undefined) { sets.push('farm_name = ?'); vals.push(input.farmName); }
    if ('cacNumber' in input) { sets.push('cac_number = ?'); vals.push(input.cacNumber ?? null); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.farmSizeHectares !== undefined) { sets.push('farm_size_hectares = ?'); vals.push(input.farmSizeHectares); }
    if (input.primaryCrop !== undefined) { sets.push('primary_crop = ?'); vals.push(input.primaryCrop); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    vals.push(id, tenantId);
    await this.db.prepare(
      `UPDATE farm_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
    ).bind(...vals).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionProfile(id: string, tenantId: string, toStatus: FarmFSMState): Promise<FarmProfile | null> {
    return this.updateProfile(id, tenantId, { status: toStatus });
  }

  // ---------------------------------------------------------------------------
  // Harvests
  // ---------------------------------------------------------------------------

  async createHarvest(input: CreateHarvestInput): Promise<FarmHarvest> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) {
      throw new Error('[P9] quantity_kg must be a non-negative integer');
    }
    if (!Number.isInteger(input.askingPriceKobo) || input.askingPriceKobo < 0) {
      throw new Error('[P9] asking_price_kobo must be a non-negative integer (kobo)');
    }
    await this.db.prepare(
      `INSERT INTO farm_harvests
         (id, farm_id, tenant_id, crop_type, quantity_kg, harvest_date,
          grade, asking_price_kobo, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available', unixepoch())`,
    ).bind(
      id, input.farmId, input.tenantId, input.cropType,
      input.quantityKg, input.harvestDate,
      input.grade ?? 'B', input.askingPriceKobo,
    ).run();
    const harvest = await this.findHarvestById(id, input.tenantId);
    if (!harvest) throw new Error('[farm] Failed to create harvest');
    return harvest;
  }

  async findHarvestById(id: string, tenantId: string): Promise<FarmHarvest | null> {
    const row = await this.db.prepare(
      `SELECT * FROM farm_harvests WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<HarvestRow>();
    return row ? rowToHarvest(row) : null;
  }

  async listHarvestsByFarm(farmId: string, tenantId: string): Promise<FarmHarvest[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM farm_harvests WHERE farm_id = ? AND tenant_id = ? ORDER BY harvest_date DESC`,
    ).bind(farmId, tenantId).all<HarvestRow>();
    return (results ?? []).map(rowToHarvest);
  }

  // ---------------------------------------------------------------------------
  // Sales (Buyer Marketplace)
  // ---------------------------------------------------------------------------

  async createSale(input: CreateSaleInput): Promise<FarmSale> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) {
      throw new Error('[P9] quantity_kg must be a non-negative integer');
    }
    if (!Number.isInteger(input.salePriceKobo) || input.salePriceKobo < 0) {
      throw new Error('[P9] sale_price_kobo must be a non-negative integer (kobo)');
    }
    const totalAmountKobo = input.quantityKg * input.salePriceKobo;
    await this.db.prepare(
      `INSERT INTO farm_sales
         (id, harvest_id, tenant_id, buyer_phone, quantity_kg,
          sale_price_kobo, total_amount_kobo, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', unixepoch(), unixepoch())`,
    ).bind(
      id, input.harvestId, input.tenantId, input.buyerPhone,
      input.quantityKg, input.salePriceKobo, totalAmountKobo,
    ).run();
    const sale = await this.findSaleById(id, input.tenantId);
    if (!sale) throw new Error('[farm] Failed to create sale');
    return sale;
  }

  async findSaleById(id: string, tenantId: string): Promise<FarmSale | null> {
    const row = await this.db.prepare(
      `SELECT * FROM farm_sales WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<SaleRow>();
    return row ? rowToSale(row) : null;
  }

  async listSalesByHarvest(harvestId: string, tenantId: string): Promise<FarmSale[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM farm_sales WHERE harvest_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(harvestId, tenantId).all<SaleRow>();
    return (results ?? []).map(rowToSale);
  }

  async updateSaleStatus(id: string, tenantId: string, status: SaleStatus): Promise<FarmSale | null> {
    await this.db.prepare(
      `UPDATE farm_sales SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`,
    ).bind(status, id, tenantId).run();
    return this.findSaleById(id, tenantId);
  }

  // ---------------------------------------------------------------------------
  // Weather Events
  // ---------------------------------------------------------------------------

  async logWeatherEvent(input: CreateWeatherEventInput): Promise<WeatherEvent> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO farm_weather_events
         (id, farm_id, tenant_id, event_type, description, severity, event_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(
      id, input.farmId, input.tenantId, input.eventType,
      input.description, input.severity ?? 1, input.eventDate,
    ).run();
    const event = await this.findWeatherEventById(id, input.tenantId);
    if (!event) throw new Error('[farm] Failed to log weather event');
    return event;
  }

  async findWeatherEventById(id: string, tenantId: string): Promise<WeatherEvent | null> {
    const row = await this.db.prepare(
      `SELECT * FROM farm_weather_events WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<WeatherRow>();
    return row ? rowToWeather(row) : null;
  }

  async listWeatherEventsByFarm(farmId: string, tenantId: string): Promise<WeatherEvent[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM farm_weather_events WHERE farm_id = ? AND tenant_id = ? ORDER BY event_date DESC`,
    ).bind(farmId, tenantId).all<WeatherRow>();
    return (results ?? []).map(rowToWeather);
  }
}
