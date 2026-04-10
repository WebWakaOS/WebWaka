/**
 * RecordingLabelRepository — M12
 * T3: all queries scoped to tenantId
 * P9: all monetary in kobo integers; royalty_split_bps as integer basis points (no floats)
 * Kobo arithmetic: artiste_share_kobo + label_share_kobo = gross_kobo enforced
 * AI: L2 cap — catalogue aggregate only; P13 no artiste_ref_id or royalty splits
 * FSM: seeded → claimed → coson_registered → active → suspended
 */

import type {
  RecordingLabelProfile, LabelArtiste, LabelRelease, LabelRoyaltyDistribution,
  RecordingLabelFSMState, ArtisteStatus,
  CreateRecordingLabelInput, CreateArtisteInput, CreateReleaseInput, CreateRoyaltyDistributionInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; label_name: string; coson_membership: string | null; mcsn_registration: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface ArtisteRow { id: string; profile_id: string; tenant_id: string; artiste_ref_id: string; royalty_split_bps: number; contract_start: number; contract_end: number | null; status: string; created_at: number; updated_at: number; }
interface ReleaseRow { id: string; profile_id: string; tenant_id: string; artiste_ref_id: string; release_name: string; genre: string; release_date: number; streaming_revenue_kobo: number; created_at: number; }
interface DistributionRow { id: string; profile_id: string; tenant_id: string; artiste_ref_id: string; period: string; gross_kobo: number; artiste_share_kobo: number; label_share_kobo: number; distributed_date: number; created_at: number; }

function rowToProfile(r: ProfileRow): RecordingLabelProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, labelName: r.label_name, cosonMembership: r.coson_membership, mcsnRegistration: r.mcsn_registration, cacRc: r.cac_rc, status: r.status as RecordingLabelFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToArtiste(r: ArtisteRow): LabelArtiste { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, artisteRefId: r.artiste_ref_id, royaltySplitBps: r.royalty_split_bps, contractStart: r.contract_start, contractEnd: r.contract_end, status: r.status as ArtisteStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToRelease(r: ReleaseRow): LabelRelease { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, artisteRefId: r.artiste_ref_id, releaseName: r.release_name, genre: r.genre, releaseDate: r.release_date, streamingRevenueKobo: r.streaming_revenue_kobo, createdAt: r.created_at }; }
function rowToDistribution(r: DistributionRow): LabelRoyaltyDistribution { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, artisteRefId: r.artiste_ref_id, period: r.period, grossKobo: r.gross_kobo, artisteShareKobo: r.artiste_share_kobo, labelShareKobo: r.label_share_kobo, distributedDate: r.distributed_date, createdAt: r.created_at }; }

export class RecordingLabelRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateRecordingLabelInput): Promise<RecordingLabelProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO recording_label_profiles (id,workspace_id,tenant_id,label_name,coson_membership,mcsn_registration,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.labelName, input.cosonMembership ?? null, input.mcsnRegistration ?? null, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<RecordingLabelProfile | null> {
    const r = await this.db.prepare('SELECT * FROM recording_label_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateStatus(id: string, tenantId: string, status: RecordingLabelFSMState): Promise<void> {
    await this.db.prepare('UPDATE recording_label_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(status, now(), id, tenantId).run();
  }

  async createArtiste(input: CreateArtisteInput): Promise<LabelArtiste> {
    if (!Number.isInteger(input.royaltySplitBps) || input.royaltySplitBps < 0 || input.royaltySplitBps > 10000) throw new Error('royaltySplitBps must be an integer between 0 and 10000');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO label_artistes (id,profile_id,tenant_id,artiste_ref_id,royalty_split_bps,contract_start,contract_end,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.artisteRefId, input.royaltySplitBps, input.contractStart, input.contractEnd ?? null, 'signed', ts, ts).run();
    return (await this.findArtisteById(id, input.tenantId))!;
  }

  async findArtisteById(id: string, tenantId: string): Promise<LabelArtiste | null> {
    const r = await this.db.prepare('SELECT * FROM label_artistes WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ArtisteRow>();
    return r ? rowToArtiste(r) : null;
  }

  async createRelease(input: CreateReleaseInput): Promise<LabelRelease> {
    if (!Number.isInteger(input.streamingRevenueKobo ?? 0) || (input.streamingRevenueKobo ?? 0) < 0) throw new Error('P9: streamingRevenueKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO label_releases (id,profile_id,tenant_id,artiste_ref_id,release_name,genre,release_date,streaming_revenue_kobo,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.artisteRefId, input.releaseName, input.genre, input.releaseDate, input.streamingRevenueKobo ?? 0, ts).run();
    return (await this.findReleaseById(id, input.tenantId))!;
  }

  async findReleaseById(id: string, tenantId: string): Promise<LabelRelease | null> {
    const r = await this.db.prepare('SELECT * FROM label_releases WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ReleaseRow>();
    return r ? rowToRelease(r) : null;
  }

  async createRoyaltyDistribution(input: CreateRoyaltyDistributionInput): Promise<LabelRoyaltyDistribution> {
    if (!Number.isInteger(input.grossKobo) || input.grossKobo < 0) throw new Error('P9: grossKobo must be a non-negative integer');
    if (!Number.isInteger(input.artisteShareKobo) || input.artisteShareKobo < 0) throw new Error('P9: artisteShareKobo must be a non-negative integer');
    if (!Number.isInteger(input.labelShareKobo) || input.labelShareKobo < 0) throw new Error('P9: labelShareKobo must be a non-negative integer');
    if (input.artisteShareKobo + input.labelShareKobo !== input.grossKobo) throw new Error(`Royalty arithmetic: artisteShareKobo (${input.artisteShareKobo}) + labelShareKobo (${input.labelShareKobo}) must equal grossKobo (${input.grossKobo})`);
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO label_royalty_distributions (id,profile_id,tenant_id,artiste_ref_id,period,gross_kobo,artiste_share_kobo,label_share_kobo,distributed_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.artisteRefId, input.period, input.grossKobo, input.artisteShareKobo, input.labelShareKobo, input.distributedDate, ts).run();
    return (await this.findDistributionById(id, input.tenantId))!;
  }

  async findDistributionById(id: string, tenantId: string): Promise<LabelRoyaltyDistribution | null> {
    const r = await this.db.prepare('SELECT * FROM label_royalty_distributions WHERE id=? AND tenant_id=?').bind(id, tenantId).first<DistributionRow>();
    return r ? rowToDistribution(r) : null;
  }
}
