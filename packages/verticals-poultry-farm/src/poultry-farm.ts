/**
 * Poultry Farm / Aquaculture D1 repository.
 * M10 Agricultural + Specialist Verticals
 * Platform Invariants: T3 (all queries scoped by tenantId), P9 (integer kobo/eggs/kg)
 * Migration: 0220_poultry_farm_vertical.sql
 */

import type {
  PoultryFarmProfile,
  PoultryFarmFSMState,
  CreatePoultryFarmInput,
  UpdatePoultryFarmInput,
  PoultryFlock,
  FlockType,
  FlockStatus,
  CreateFlockInput,
  EggProductionLog,
  CreateEggProductionInput,
  FeedRecord,
  CreateFeedRecordInput,
  PoultrySale,
  SaleStatus,
  CreatePoultrySaleInput,
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
  farm_name: string; napri_cert: string | null; cac_number: string | null;
  state: string; lga: string; status: string;
  created_at: number; updated_at: number;
}
interface FlockRow {
  id: string; farm_id: string; tenant_id: string;
  flock_type: string; bird_count: number; stocking_date: number;
  expected_depletion_date: number | null; mortality_count: number;
  status: string; created_at: number; updated_at: number;
}
interface EggRow {
  id: string; flock_id: string; tenant_id: string;
  log_date: number; eggs_collected: number; eggs_breakage: number;
  created_at: number;
}
interface FeedRow {
  id: string; farm_id: string; tenant_id: string;
  feed_type: string; quantity_kg: number; cost_kobo: number;
  purchase_date: number; created_at: number;
}
interface SaleRow {
  id: string; flock_id: string; tenant_id: string;
  buyer_phone: string; bird_count: number;
  price_per_bird_kobo: number; total_amount_kobo: number;
  status: string; created_at: number; updated_at: number;
}

function rowToProfile(r: ProfileRow): PoultryFarmProfile {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    farmName: r.farm_name, napriCert: r.napri_cert, cacNumber: r.cac_number,
    state: r.state, lga: r.lga,
    status: r.status as PoultryFarmFSMState,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function rowToFlock(r: FlockRow): PoultryFlock {
  return {
    id: r.id, farmId: r.farm_id, tenantId: r.tenant_id,
    flockType: r.flock_type as FlockType, birdCount: r.bird_count,
    stockingDate: r.stocking_date,
    expectedDepletionDate: r.expected_depletion_date,
    mortalityCount: r.mortality_count,
    status: r.status as FlockStatus,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function rowToEgg(r: EggRow): EggProductionLog {
  return {
    id: r.id, flockId: r.flock_id, tenantId: r.tenant_id,
    logDate: r.log_date, eggsCollected: r.eggs_collected,
    eggsBreakage: r.eggs_breakage, createdAt: r.created_at,
  };
}
function rowToFeed(r: FeedRow): FeedRecord {
  return {
    id: r.id, farmId: r.farm_id, tenantId: r.tenant_id,
    feedType: r.feed_type, quantityKg: r.quantity_kg,
    costKobo: r.cost_kobo, purchaseDate: r.purchase_date,
    createdAt: r.created_at,
  };
}
function rowToSale(r: SaleRow): PoultrySale {
  return {
    id: r.id, flockId: r.flock_id, tenantId: r.tenant_id,
    buyerPhone: r.buyer_phone, birdCount: r.bird_count,
    pricePerBirdKobo: r.price_per_bird_kobo,
    totalAmountKobo: r.total_amount_kobo,
    status: r.status as SaleStatus,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export class PoultryFarmRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreatePoultryFarmInput): Promise<PoultryFarmProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO poultry_farm_profiles
         (id, workspace_id, tenant_id, farm_name, napri_cert, cac_number,
          state, lga, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`,
    ).bind(
      id, input.workspaceId, input.tenantId, input.farmName,
      input.napriCert ?? null, input.cacNumber ?? null,
      input.state, input.lga,
    ).run();
    const profile = await this.findProfileById(id, input.tenantId);
    if (!profile) throw new Error('[poultry-farm] Failed to create profile');
    return profile;
  }

  async findProfileById(id: string, tenantId: string): Promise<PoultryFarmProfile | null> {
    const row = await this.db.prepare(
      `SELECT * FROM poultry_farm_profiles WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<ProfileRow>();
    return row ? rowToProfile(row) : null;
  }

  async findProfilesByWorkspace(workspaceId: string, tenantId: string): Promise<PoultryFarmProfile[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM poultry_farm_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(workspaceId, tenantId).all<ProfileRow>();
    return (results ?? []).map(rowToProfile);
  }

  async updateProfile(id: string, tenantId: string, input: UpdatePoultryFarmInput): Promise<PoultryFarmProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.farmName !== undefined) { sets.push('farm_name = ?'); vals.push(input.farmName); }
    if ('napriCert' in input) { sets.push('napri_cert = ?'); vals.push(input.napriCert ?? null); }
    if ('cacNumber' in input) { sets.push('cac_number = ?'); vals.push(input.cacNumber ?? null); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    vals.push(id, tenantId);
    await this.db.prepare(
      `UPDATE poultry_farm_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
    ).bind(...vals).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionProfile(id: string, tenantId: string, toStatus: PoultryFarmFSMState): Promise<PoultryFarmProfile | null> {
    return this.updateProfile(id, tenantId, { status: toStatus });
  }

  // ---------------------------------------------------------------------------
  // Flocks
  // ---------------------------------------------------------------------------

  async createFlock(input: CreateFlockInput): Promise<PoultryFlock> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.birdCount) || input.birdCount < 0) {
      throw new Error('[P9] bird_count must be a non-negative integer');
    }
    await this.db.prepare(
      `INSERT INTO poultry_flocks
         (id, farm_id, tenant_id, flock_type, bird_count, stocking_date,
          expected_depletion_date, mortality_count, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'active', unixepoch(), unixepoch())`,
    ).bind(
      id, input.farmId, input.tenantId, input.flockType,
      input.birdCount, input.stockingDate,
      input.expectedDepletionDate ?? null,
    ).run();
    const flock = await this.findFlockById(id, input.tenantId);
    if (!flock) throw new Error('[poultry-farm] Failed to create flock');
    return flock;
  }

  async findFlockById(id: string, tenantId: string): Promise<PoultryFlock | null> {
    const row = await this.db.prepare(
      `SELECT * FROM poultry_flocks WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<FlockRow>();
    return row ? rowToFlock(row) : null;
  }

  async listFlocksByFarm(farmId: string, tenantId: string): Promise<PoultryFlock[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM poultry_flocks WHERE farm_id = ? AND tenant_id = ? ORDER BY stocking_date DESC`,
    ).bind(farmId, tenantId).all<FlockRow>();
    return (results ?? []).map(rowToFlock);
  }

  async recordMortality(flockId: string, tenantId: string, deadCount: number): Promise<PoultryFlock | null> {
    if (!Number.isInteger(deadCount) || deadCount < 0) {
      throw new Error('[P9] dead_count must be a non-negative integer');
    }
    await this.db.prepare(
      `UPDATE poultry_flocks SET mortality_count = mortality_count + ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`,
    ).bind(deadCount, flockId, tenantId).run();
    return this.findFlockById(flockId, tenantId);
  }

  // ---------------------------------------------------------------------------
  // Egg Production
  // ---------------------------------------------------------------------------

  async logEggProduction(input: CreateEggProductionInput): Promise<EggProductionLog> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.eggsCollected) || input.eggsCollected < 0) {
      throw new Error('[P9] eggs_collected must be a non-negative integer');
    }
    const breakage = input.eggsBreakage ?? 0;
    if (!Number.isInteger(breakage) || breakage < 0) {
      throw new Error('[P9] eggs_breakage must be a non-negative integer');
    }
    await this.db.prepare(
      `INSERT INTO poultry_egg_production_logs
         (id, flock_id, tenant_id, log_date, eggs_collected, eggs_breakage, created_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(id, input.flockId, input.tenantId, input.logDate, input.eggsCollected, breakage).run();
    const log = await this.findEggLogById(id, input.tenantId);
    if (!log) throw new Error('[poultry-farm] Failed to log egg production');
    return log;
  }

  async findEggLogById(id: string, tenantId: string): Promise<EggProductionLog | null> {
    const row = await this.db.prepare(
      `SELECT * FROM poultry_egg_production_logs WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<EggRow>();
    return row ? rowToEgg(row) : null;
  }

  async listEggLogsByFlock(flockId: string, tenantId: string): Promise<EggProductionLog[]> {
    const { results } = await this.db.prepare(
      `SELECT * FROM poultry_egg_production_logs WHERE flock_id = ? AND tenant_id = ? ORDER BY log_date DESC`,
    ).bind(flockId, tenantId).all<EggRow>();
    return (results ?? []).map(rowToEgg);
  }

  // ---------------------------------------------------------------------------
  // Feed Records
  // ---------------------------------------------------------------------------

  async createFeedRecord(input: CreateFeedRecordInput): Promise<FeedRecord> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.quantityKg) || input.quantityKg < 0) {
      throw new Error('[P9] quantity_kg must be a non-negative integer');
    }
    if (!Number.isInteger(input.costKobo) || input.costKobo < 0) {
      throw new Error('[P9] cost_kobo must be a non-negative integer (kobo)');
    }
    await this.db.prepare(
      `INSERT INTO poultry_feed_records
         (id, farm_id, tenant_id, feed_type, quantity_kg, cost_kobo, purchase_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(id, input.farmId, input.tenantId, input.feedType, input.quantityKg, input.costKobo, input.purchaseDate).run();
    const record = await this.findFeedRecordById(id, input.tenantId);
    if (!record) throw new Error('[poultry-farm] Failed to create feed record');
    return record;
  }

  async findFeedRecordById(id: string, tenantId: string): Promise<FeedRecord | null> {
    const row = await this.db.prepare(
      `SELECT * FROM poultry_feed_records WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<FeedRow>();
    return row ? rowToFeed(row) : null;
  }

  // ---------------------------------------------------------------------------
  // Sales
  // ---------------------------------------------------------------------------

  async createSale(input: CreatePoultrySaleInput): Promise<PoultrySale> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.birdCount) || input.birdCount < 0) {
      throw new Error('[P9] bird_count must be a non-negative integer');
    }
    if (!Number.isInteger(input.pricePerBirdKobo) || input.pricePerBirdKobo < 0) {
      throw new Error('[P9] price_per_bird_kobo must be a non-negative integer (kobo)');
    }
    const totalAmountKobo = input.birdCount * input.pricePerBirdKobo;
    await this.db.prepare(
      `INSERT INTO poultry_sales
         (id, flock_id, tenant_id, buyer_phone, bird_count,
          price_per_bird_kobo, total_amount_kobo, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', unixepoch(), unixepoch())`,
    ).bind(id, input.flockId, input.tenantId, input.buyerPhone, input.birdCount, input.pricePerBirdKobo, totalAmountKobo).run();
    const sale = await this.findSaleById(id, input.tenantId);
    if (!sale) throw new Error('[poultry-farm] Failed to create sale');
    return sale;
  }

  async findSaleById(id: string, tenantId: string): Promise<PoultrySale | null> {
    const row = await this.db.prepare(
      `SELECT * FROM poultry_sales WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<SaleRow>();
    return row ? rowToSale(row) : null;
  }

  async updateSaleStatus(id: string, tenantId: string, status: SaleStatus): Promise<PoultrySale | null> {
    await this.db.prepare(
      `UPDATE poultry_sales SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`,
    ).bind(status, id, tenantId).run();
    return this.findSaleById(id, tenantId);
  }
}
