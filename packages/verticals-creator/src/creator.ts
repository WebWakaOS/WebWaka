/**
 * Creator / Influencer D1 repository.
 * (M8e — Platform Invariants T3, P9)
 * Migration: 0054_creator.sql → creator_profiles + brand_deals
 */

import type {
  CreatorProfile, BrandDeal, CreateCreatorInput, UpdateCreatorInput,
  CreateDealInput, UpdateDealInput, CreatorFSMState,
} from './types.js';

interface D1Like {
  prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; };
}

interface CreatorRow { id: string; individual_id: string; workspace_id: string; tenant_id: string; social_profile_id: string | null; community_id: string | null; niche: string; follower_count: number; verified_brand: number; monthly_rate_kobo: number | null; status: string; created_at: number; }
interface DealRow { id: string; workspace_id: string; tenant_id: string; creator_id: string; brand_name: string; deal_value_kobo: number | null; deliverables: string | null; status: string; created_at: number; }

function rowToCreator(r: CreatorRow): CreatorProfile { return { id: r.id, individualId: r.individual_id, workspaceId: r.workspace_id, tenantId: r.tenant_id, socialProfileId: r.social_profile_id, communityId: r.community_id, niche: r.niche as CreatorProfile['niche'], followerCount: r.follower_count, verifiedBrand: r.verified_brand === 1, monthlyRateKobo: r.monthly_rate_kobo, status: r.status as CreatorFSMState, createdAt: r.created_at }; }
function rowToDeal(r: DealRow): BrandDeal { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, creatorId: r.creator_id, brandName: r.brand_name, dealValueKobo: r.deal_value_kobo, deliverables: r.deliverables, status: r.status as BrandDeal['status'], createdAt: r.created_at }; }

const C_COLS = 'id, individual_id, workspace_id, tenant_id, social_profile_id, community_id, niche, follower_count, verified_brand, monthly_rate_kobo, status, created_at';
const D_COLS = 'id, workspace_id, tenant_id, creator_id, brand_name, deal_value_kobo, deliverables, status, created_at';

export class CreatorRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateCreatorInput): Promise<CreatorProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO creator_profiles (id, individual_id, workspace_id, tenant_id, social_profile_id, community_id, niche, follower_count, verified_brand, monthly_rate_kobo, status, created_at) VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, 0, ?, 'seeded', unixepoch())`,
    ).bind(id, input.individualId, input.workspaceId, input.tenantId, input.niche, input.followerCount ?? 0, input.monthlyRateKobo ?? null).run();
    const creator = await this.findById(id, input.tenantId);
    if (!creator) throw new Error('[creator] create failed');
    return creator;
  }

  async findById(id: string, tenantId: string): Promise<CreatorProfile | null> {
    const row = await this.db.prepare(`SELECT ${C_COLS} FROM creator_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<CreatorRow>();
    return row ? rowToCreator(row) : null;
  }

  async findByIndividual(individualId: string, tenantId: string): Promise<CreatorProfile | null> {
    const row = await this.db.prepare(`SELECT ${C_COLS} FROM creator_profiles WHERE individual_id = ? AND tenant_id = ?`).bind(individualId, tenantId).first<CreatorRow>();
    return row ? rowToCreator(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<CreatorProfile[]> {
    const { results } = await this.db.prepare(`SELECT ${C_COLS} FROM creator_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY follower_count DESC`).bind(workspaceId, tenantId).all<CreatorRow>();
    return (results ?? []).map(rowToCreator);
  }

  async findByNiche(niche: string, tenantId: string, limit = 50): Promise<CreatorProfile[]> {
    const { results } = await this.db.prepare(`SELECT ${C_COLS} FROM creator_profiles WHERE niche = ? AND tenant_id = ? ORDER BY follower_count DESC LIMIT ?`).bind(niche, tenantId, limit).all<CreatorRow>();
    return (results ?? []).map(rowToCreator);
  }

  async update(id: string, tenantId: string, input: UpdateCreatorInput): Promise<CreatorProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if ('socialProfileId' in input)   { sets.push('social_profile_id = ?');  b.push(input.socialProfileId ?? null); }
    if ('communityId' in input)       { sets.push('community_id = ?');        b.push(input.communityId ?? null); }
    if (input.niche !== undefined)    { sets.push('niche = ?');               b.push(input.niche); }
    if (input.followerCount !== undefined) { sets.push('follower_count = ?'); b.push(input.followerCount); }
    if (input.verifiedBrand !== undefined) { sets.push('verified_brand = ?'); b.push(input.verifiedBrand ? 1 : 0); }
    if ('monthlyRateKobo' in input)   { sets.push('monthly_rate_kobo = ?');  b.push(input.monthlyRateKobo ?? null); }
    if (input.status !== undefined)   { sets.push('status = ?');             b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE creator_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, toStatus: CreatorFSMState): Promise<CreatorProfile | null> {
    return this.update(id, tenantId, { status: toStatus });
  }

  // ---- Brand Deals ----

  async createDeal(input: CreateDealInput): Promise<BrandDeal> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO brand_deals (id, workspace_id, tenant_id, creator_id, brand_name, deal_value_kobo, deliverables, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'enquiry', unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.creatorId, input.brandName, input.dealValueKobo ?? null, input.deliverables ?? null).run();
    const deal = await this.findDealById(id, input.tenantId);
    if (!deal) throw new Error('[creator] deal create failed');
    return deal;
  }

  async findDealById(id: string, tenantId: string): Promise<BrandDeal | null> {
    const row = await this.db.prepare(`SELECT ${D_COLS} FROM brand_deals WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<DealRow>();
    return row ? rowToDeal(row) : null;
  }

  async listDealsByCreator(creatorId: string, tenantId: string): Promise<BrandDeal[]> {
    const { results } = await this.db.prepare(`SELECT ${D_COLS} FROM brand_deals WHERE creator_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(creatorId, tenantId).all<DealRow>();
    return (results ?? []).map(rowToDeal);
  }

  async updateDeal(id: string, tenantId: string, input: UpdateDealInput): Promise<BrandDeal | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.brandName !== undefined)    { sets.push('brand_name = ?');      b.push(input.brandName); }
    if ('dealValueKobo' in input)         { sets.push('deal_value_kobo = ?'); b.push(input.dealValueKobo ?? null); }
    if ('deliverables' in input)          { sets.push('deliverables = ?');    b.push(input.deliverables ?? null); }
    if (input.status !== undefined)       { sets.push('status = ?');          b.push(input.status); }
    if (sets.length === 0) return this.findDealById(id, tenantId);
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE brand_deals SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findDealById(id, tenantId);
  }
}
