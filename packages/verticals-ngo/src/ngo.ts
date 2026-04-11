/**
 * NGO / Non-Profit D1 repository.
 * (M8d — Platform Invariants T3, P9)
 * Migration: 0052_civic_church_ngo.sql → ngo_profiles + ngo_funding_records
 */

import type { NgoProfile, NgoFundingRecord, CreateNgoInput, UpdateNgoInput, CreateFundingInput, NgoFSMState } from './types.js';

interface D1Like {
  prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; };
}

interface NgoRow {
  id: string; organization_id: string; workspace_id: string; tenant_id: string;
  community_id: string | null; it_number: string | null; sector: string;
  cac_reg_number: string | null; country_partner: string | null;
  beneficiary_count: number; status: string; created_at: number;
}

interface FundingRow {
  id: string; workspace_id: string; tenant_id: string;
  donor_name: string; amount_kobo: number; currency: string;
  purpose: string | null; paystack_ref: string | null; status: string; received_at: number;
}

function rowToNgo(r: NgoRow): NgoProfile {
  return {
    id: r.id, organizationId: r.organization_id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    communityId: r.community_id, itNumber: r.it_number, sector: r.sector as NgoProfile['sector'],
    cacRegNumber: r.cac_reg_number, countryPartner: r.country_partner,
    beneficiaryCount: r.beneficiary_count, status: r.status as NgoFSMState, createdAt: r.created_at,
  };
}

function rowToFunding(r: FundingRow): NgoFundingRecord {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    donorName: r.donor_name, amountKobo: r.amount_kobo, currency: r.currency,
    purpose: r.purpose, paystackRef: r.paystack_ref,
    status: r.status as NgoFundingRecord['status'], receivedAt: r.received_at,
  };
}

const NGO_COLS = 'id, organization_id, workspace_id, tenant_id, community_id, it_number, sector, cac_reg_number, country_partner, beneficiary_count, status, created_at';
const FUND_COLS = 'id, workspace_id, tenant_id, donor_name, amount_kobo, currency, purpose, paystack_ref, status, received_at';

export class NgoRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateNgoInput): Promise<NgoProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO ngo_profiles
         (id, organization_id, workspace_id, tenant_id, community_id, it_number,
          sector, cac_reg_number, country_partner, beneficiary_count, status, created_at)
       VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?, 0, 'seeded', unixepoch())`,
    ).bind(id, input.organizationId, input.workspaceId, input.tenantId,
      input.sector, input.cacRegNumber ?? null, input.countryPartner ?? null).run();
    const ngo = await this.findById(id, input.tenantId);
    if (!ngo) throw new Error('[ngo] create failed');
    return ngo;
  }

  async findById(id: string, tenantId: string): Promise<NgoProfile | null> {
    const row = await this.db.prepare(
      `SELECT ${NGO_COLS} FROM ngo_profiles WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<NgoRow>();
    return row ? rowToNgo(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<NgoProfile[]> {
    const { results } = await this.db.prepare(
      `SELECT ${NGO_COLS} FROM ngo_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(workspaceId, tenantId).all<NgoRow>();
    return (results ?? []).map(rowToNgo);
  }

  async update(id: string, tenantId: string, input: UpdateNgoInput): Promise<NgoProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if ('communityId' in input)     { sets.push('community_id = ?');      b.push(input.communityId ?? null); }
    if ('itNumber' in input)        { sets.push('it_number = ?');         b.push(input.itNumber ?? null); }
    if (input.sector !== undefined) { sets.push('sector = ?');            b.push(input.sector); }
    if ('cacRegNumber' in input)    { sets.push('cac_reg_number = ?');    b.push(input.cacRegNumber ?? null); }
    if ('countryPartner' in input)  { sets.push('country_partner = ?');   b.push(input.countryPartner ?? null); }
    if (input.beneficiaryCount !== undefined) { sets.push('beneficiary_count = ?'); b.push(input.beneficiaryCount); }
    if (input.status !== undefined) { sets.push('status = ?');            b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId);
    await this.db.prepare(
      `UPDATE ngo_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
    ).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, toStatus: NgoFSMState): Promise<NgoProfile | null> {
    return this.update(id, tenantId, { status: toStatus });
  }

  // ---- Funding records ----

  async createFunding(input: CreateFundingInput): Promise<NgoFundingRecord> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo <= 0) {
      throw new Error('[ngo] amountKobo must be a positive integer (P9)');
    }
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO ngo_funding_records
         (id, workspace_id, tenant_id, donor_name, amount_kobo, currency, purpose, paystack_ref, status, received_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.donorName,
      input.amountKobo, input.currency ?? 'NGN', input.purpose ?? null,
      input.paystackRef ?? null).run();
    const record = await this.findFundingById(id, input.tenantId);
    if (!record) throw new Error('[ngo] funding create failed');
    return record;
  }

  async findFundingById(id: string, tenantId: string): Promise<NgoFundingRecord | null> {
    const row = await this.db.prepare(
      `SELECT ${FUND_COLS} FROM ngo_funding_records WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<FundingRow>();
    return row ? rowToFunding(row) : null;
  }

  async listFundingByWorkspace(workspaceId: string, tenantId: string, limit = 50): Promise<NgoFundingRecord[]> {
    const { results } = await this.db.prepare(
      `SELECT ${FUND_COLS} FROM ngo_funding_records WHERE workspace_id = ? AND tenant_id = ? ORDER BY received_at DESC LIMIT ?`,
    ).bind(workspaceId, tenantId, limit).all<FundingRow>();
    return (results ?? []).map(rowToFunding);
  }

  async totalFundingKobo(workspaceId: string, tenantId: string): Promise<number> {
    const row = await this.db.prepare(
      `SELECT COALESCE(SUM(amount_kobo), 0) AS total FROM ngo_funding_records WHERE workspace_id = ? AND tenant_id = ? AND status = 'received'`,
    ).bind(workspaceId, tenantId).first<{ total: number }>();
    return row?.total ?? 0;
  }
}
