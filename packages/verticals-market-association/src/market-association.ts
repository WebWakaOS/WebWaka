import type { MarketAssociationProfile, CreateMarketAssociationInput, MarketAssociationFSMState, MarketMember, MarketLevy, MarketMeeting } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): MarketAssociationProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, associationName: r['association_name'] as string, cacItCert: r['cac_it_cert'] as string|null, marketName: r['market_name'] as string|null, state: r['state'] as string|null, lga: r['lga'] as string|null, status: r['status'] as MarketAssociationFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toMember(r: Record<string, unknown>): MarketMember { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, memberRefId: r['member_ref_id'] as string, stallNumber: r['stall_number'] as string|null, tradeType: r['trade_type'] as string|null, duesMonthlyKobo: r['dues_monthly_kobo'] as number, registrationDate: r['registration_date'] as number, status: r['status'] as MarketMember['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toLevy(r: Record<string, unknown>): MarketLevy { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, memberRefId: r['member_ref_id'] as string, levyType: r['levy_type'] as MarketLevy['levyType'], amountKobo: r['amount_kobo'] as number, paymentDate: r['payment_date'] as number, createdAt: r['created_at'] as number }; }
export class MarketAssociationRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateMarketAssociationInput): Promise<MarketAssociationProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO market_association_profiles (id,workspace_id,tenant_id,association_name,cac_it_cert,market_name,state,lga,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.associationName,input.cacItCert??null,input.marketName??null,input.state??null,input.lga??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[market-association] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<MarketAssociationProfile|null> { const r = await this.db.prepare('SELECT * FROM market_association_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<MarketAssociationProfile|null> { const r = await this.db.prepare('SELECT * FROM market_association_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: MarketAssociationFSMState, _fields?: { cacScn?: string }): Promise<MarketAssociationProfile> {
    await this.db.prepare('UPDATE market_association_profiles SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[market-association] not found'); return p;
  }
  async addMember(profileId: string, tenantId: string, input: { memberRefId: string; stallNumber?: string; tradeType?: string; duesMonthlyKobo?: number; registrationDate: number }): Promise<MarketMember> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO market_members (id,profile_id,tenant_id,member_ref_id,stall_number,trade_type,dues_monthly_kobo,registration_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,\'active\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.memberRefId,input.stallNumber??null,input.tradeType??null,input.duesMonthlyKobo??0,input.registrationDate).run();
    const r = await this.db.prepare('SELECT * FROM market_members WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[market-association] member create failed'); return toMember(r);
  }
  async listMembers(profileId: string, tenantId: string): Promise<MarketMember[]> { const { results } = await this.db.prepare('SELECT * FROM market_members WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toMember); }
  async recordLevy(profileId: string, tenantId: string, input: { memberRefId?: string; traderId?: string; levyType?: string; amountKobo: number; paymentDate?: number; periodMonth?: number; collectedDate?: number }): Promise<MarketLevy> {
    if (!Number.isInteger(input.amountKobo)) throw new Error('amount_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO market_levies (id,profile_id,tenant_id,member_ref_id,levy_type,amount_kobo,payment_date,created_at) VALUES (?,?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.memberRefId,input.levyType,input.amountKobo,input.paymentDate).run();
    const r = await this.db.prepare('SELECT * FROM market_levies WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[market-association] levy create failed'); return toLevy(r);
  }
  async recordMeeting(profileId: string, tenantId: string, input: { meetingDate: number; attendanceCount?: number; resolutions?: string }): Promise<MarketMeeting> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO market_meetings (id,profile_id,tenant_id,meeting_date,attendance_count,resolutions,created_at) VALUES (?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.meetingDate,input.attendanceCount??0,input.resolutions??null).run();
    const r = await this.db.prepare('SELECT * FROM market_meetings WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[market-association] meeting create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, meetingDate: r['meeting_date'] as number, attendanceCount: r['attendance_count'] as number, resolutions: r['resolutions'] as string|null, createdAt: r['created_at'] as number };
  }

  async addTrader(profileId: string, tenantId: string, input: { traderRefId: string; stallNumber?: string; tradeType?: string; monthlyLevyKobo?: number; joinDate?: number }): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID(); const ts = Date.now();
    await this.db.prepare('INSERT INTO market_traders (id,profile_id,tenant_id,trader_ref_id,stall_number,trade_type,monthly_levy_kobo,join_date,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.traderRefId,input.stallNumber??null,input.tradeType??null,input.monthlyLevyKobo??0,input.joinDate??ts,ts).run();
    return { id, profileId, tenantId, traderRefId: input.traderRefId, stallNumber: input.stallNumber??null, tradeType: input.tradeType??null, monthlyLevyKobo: input.monthlyLevyKobo??0, joinDate: input.joinDate??ts, createdAt: ts };
  }
  async listTraders(profileId: string, tenantId: string): Promise<Record<string, unknown>[]> {
    const { results } = await this.db.prepare('SELECT * FROM market_traders WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results;
  }
  async listLevies(profileId: string, tenantId: string): Promise<Record<string, unknown>[]> {
    const { results } = await this.db.prepare('SELECT * FROM market_levies WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results;
  }
  async reportIncident(profileId: string, tenantId: string, input: { incidentType: string; description: string; incidentDate: number; reportedBy?: string }): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID(); const ts = Date.now();
    await this.db.prepare('INSERT INTO market_incidents (id,profile_id,tenant_id,incident_type,description,incident_date,reported_by,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.incidentType,input.description,input.incidentDate,input.reportedBy??null,ts).run();
    return { id, profileId, tenantId, ...input, reportedBy: input.reportedBy??null, createdAt: ts };
  }

}
export function guardSeedToClaimed(_p: MarketAssociationProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
