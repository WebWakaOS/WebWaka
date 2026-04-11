/**
 * PrFirmRepository — M12
 * T3: all queries scoped to tenantId
 * P9: budget_kobo / retainer_kobo / total_kobo are integers
 * AI: L2 cap — campaign aggregate only; P13 no client strategy
 * FSM: seeded → claimed → nipr_verified → active → suspended
 */

import type {
  PrFirmProfile, PrCampaign, PrMediaCoverage, PrBilling,
  PrFirmFSMState, CampaignType, CampaignStatus, Sentiment,
  CreatePrFirmInput, CreateCampaignInput, CreateMediaCoverageInput, CreateBillingInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; firm_name: string; nipr_accreditation: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface CampaignRow { id: string; profile_id: string; tenant_id: string; client_ref_id: string; campaign_name: string; campaign_type: string; budget_kobo: number; start_date: number; end_date: number | null; status: string; created_at: number; updated_at: number; }
interface CoverageRow { id: string; profile_id: string; tenant_id: string; campaign_id: string; media_name: string; coverage_date: number; clip_ref: string | null; sentiment: string; created_at: number; }
interface BillingRow { id: string; profile_id: string; tenant_id: string; client_ref_id: string; billing_month: string; retainer_kobo: number; ad_hoc_kobo: number; total_kobo: number; paid_kobo: number; created_at: number; }

function rowToProfile(r: ProfileRow): PrFirmProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, firmName: r.firm_name, niprAccreditation: r.nipr_accreditation, cacRc: r.cac_rc, status: r.status as PrFirmFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToCampaign(r: CampaignRow): PrCampaign { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, clientRefId: r.client_ref_id, campaignName: r.campaign_name, campaignType: r.campaign_type as CampaignType, budgetKobo: r.budget_kobo, startDate: r.start_date, endDate: r.end_date, status: r.status as CampaignStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToCoverage(r: CoverageRow): PrMediaCoverage { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, campaignId: r.campaign_id, mediaName: r.media_name, coverageDate: r.coverage_date, clipRef: r.clip_ref, sentiment: r.sentiment as Sentiment, createdAt: r.created_at }; }
function rowToBilling(r: BillingRow): PrBilling { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, clientRefId: r.client_ref_id, billingMonth: r.billing_month, retainerKobo: r.retainer_kobo, adHocKobo: r.ad_hoc_kobo, totalKobo: r.total_kobo, paidKobo: r.paid_kobo, createdAt: r.created_at }; }

export class PrFirmRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreatePrFirmInput): Promise<PrFirmProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO pr_firm_profiles (id,workspace_id,tenant_id,firm_name,nipr_accreditation,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.firmName, input.niprAccreditation ?? null, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<PrFirmProfile | null> {
    const r = await this.db.prepare('SELECT * FROM pr_firm_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateStatus(id: string, tenantId: string, status: PrFirmFSMState): Promise<void> {
    await this.db.prepare('UPDATE pr_firm_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(status, now(), id, tenantId).run();
  }

  async createCampaign(input: CreateCampaignInput): Promise<PrCampaign> {
    if (!Number.isInteger(input.budgetKobo) || input.budgetKobo < 0) throw new Error('P9: budgetKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO pr_campaigns (id,profile_id,tenant_id,client_ref_id,campaign_name,campaign_type,budget_kobo,start_date,end_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.clientRefId, input.campaignName, input.campaignType, input.budgetKobo, input.startDate, input.endDate ?? null, 'planning', ts, ts).run();
    return (await this.findCampaignById(id, input.tenantId))!;
  }

  async findCampaignById(id: string, tenantId: string): Promise<PrCampaign | null> {
    const r = await this.db.prepare('SELECT * FROM pr_campaigns WHERE id=? AND tenant_id=?').bind(id, tenantId).first<CampaignRow>();
    return r ? rowToCampaign(r) : null;
  }

  async createMediaCoverage(input: CreateMediaCoverageInput): Promise<PrMediaCoverage> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO pr_media_coverage (id,profile_id,tenant_id,campaign_id,media_name,coverage_date,clip_ref,sentiment,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.campaignId, input.mediaName, input.coverageDate, input.clipRef ?? null, input.sentiment ?? 'neutral', ts).run();
    return (await this.findCoverageById(id, input.tenantId))!;
  }

  async findCoverageById(id: string, tenantId: string): Promise<PrMediaCoverage | null> {
    const r = await this.db.prepare('SELECT * FROM pr_media_coverage WHERE id=? AND tenant_id=?').bind(id, tenantId).first<CoverageRow>();
    return r ? rowToCoverage(r) : null;
  }

  async createBilling(input: CreateBillingInput): Promise<PrBilling> {
    if (!Number.isInteger(input.retainerKobo) || input.retainerKobo < 0) throw new Error('P9: retainerKobo must be a non-negative integer');
    const adHocKobo = input.adHocKobo ?? 0;
    const totalKobo = input.retainerKobo + adHocKobo;
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO pr_billing (id,profile_id,tenant_id,client_ref_id,billing_month,retainer_kobo,ad_hoc_kobo,total_kobo,paid_kobo,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.clientRefId, input.billingMonth, input.retainerKobo, adHocKobo, totalKobo, input.paidKobo ?? 0, ts).run();
    return (await this.findBillingById(id, input.tenantId))!;
  }

  async findBillingById(id: string, tenantId: string): Promise<PrBilling | null> {
    const r = await this.db.prepare('SELECT * FROM pr_billing WHERE id=? AND tenant_id=?').bind(id, tenantId).first<BillingRow>();
    return r ? rowToBilling(r) : null;
  }
}
