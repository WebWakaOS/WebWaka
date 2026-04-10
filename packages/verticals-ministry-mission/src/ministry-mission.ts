import type { MinistryMissionProfile, CreateMinistryMissionInput, MinistryMissionFSMState, MinistryService, MinistryDonation, MinistryOutreach } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): MinistryMissionProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, ministryName: r['ministry_name'] as string, itNumber: r['it_number'] as string|null, cacItCert: r['cac_it_cert'] as string|null, denomination: r['denomination'] as string|null, foundingPastorRef: r['founding_pastor_ref'] as string|null, orgType: r['org_type'] as MinistryMissionProfile['orgType'], status: r['status'] as MinistryMissionFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toService(r: Record<string, unknown>): MinistryService { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, serviceType: r['service_type'] as MinistryService['serviceType'], scheduledDate: r['scheduled_date'] as number, attendanceCount: r['attendance_count'] as number, offeringKobo: r['offering_kobo'] as number, tithKobo: r['tith_kobo'] as number, notes: r['notes'] as string|null, createdAt: r['created_at'] as number }; }
function toDonation(r: Record<string, unknown>): MinistryDonation { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, donorRef: r['donor_ref'] as string, amountKobo: r['amount_kobo'] as number, donationDate: r['donation_date'] as number, category: r['category'] as MinistryDonation['category'], createdAt: r['created_at'] as number }; }
export class MinistryMissionRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateMinistryMissionInput): Promise<MinistryMissionProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO ministry_mission_profiles (id,workspace_id,tenant_id,ministry_name,org_type,it_number,cac_it_cert,denomination,founding_pastor_ref,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.ministryName,input.orgType??'church',input.itNumber??null,input.cacItCert??null,input.denomination??null,input.foundingPastorRef??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[ministry-mission] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<MinistryMissionProfile|null> { const r = await this.db.prepare('SELECT * FROM ministry_mission_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<MinistryMissionProfile|null> { const r = await this.db.prepare('SELECT * FROM ministry_mission_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: MinistryMissionFSMState, fields?: { itNumber?: string; cacItCert?: string; cacScn?: string }): Promise<MinistryMissionProfile> {
    if (to === 'it_registered' && !fields?.itNumber) throw new Error('IT number required to transition to it_registered');
    let extra = ''; if (fields?.itNumber) extra += `, it_number='${fields.itNumber}'`; if (fields?.cacItCert) extra += `, cac_it_cert='${fields.cacItCert}'`;
    await this.db.prepare(`UPDATE ministry_mission_profiles SET status=?${extra}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[ministry-mission] not found'); return p;
  }
  async recordService(profileId: string, tenantId: string, input: { serviceType: string; scheduledDate: number; attendanceCount?: number; offeringKobo?: number; tithKobo?: number; notes?: string }): Promise<MinistryService> {
    if (input.offeringKobo !== undefined && !Number.isInteger(input.offeringKobo)) throw new Error('offering_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO ministry_services (id,profile_id,tenant_id,service_type,scheduled_date,attendance_count,offering_kobo,tith_kobo,notes,created_at) VALUES (?,?,?,?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.serviceType,input.scheduledDate,input.attendanceCount??0,input.offeringKobo??0,input.tithKobo??0,input.notes??null).run();
    const r = await this.db.prepare('SELECT * FROM ministry_services WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[ministry-mission] service create failed'); return toService(r);
  }
  async listServices(profileId: string, tenantId: string): Promise<MinistryService[]> { const { results } = await this.db.prepare('SELECT * FROM ministry_services WHERE profile_id=? AND tenant_id=? ORDER BY scheduled_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toService); }
  async recordOutreach(profileId: string, tenantId: string, input: { outreachType: string; outreachDate: number; beneficiaryCount?: number; costKobo?: number; location?: string }): Promise<MinistryOutreach> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO ministry_outreach (id,profile_id,tenant_id,outreach_type,outreach_date,beneficiary_count,cost_kobo,location,created_at) VALUES (?,?,?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.outreachType,input.outreachDate,input.beneficiaryCount??0,input.costKobo??0,input.location??null).run();
    const r = await this.db.prepare('SELECT * FROM ministry_outreach WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[ministry-mission] outreach create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, outreachType: r['outreach_type'] as string, outreachDate: r['outreach_date'] as number, beneficiaryCount: r['beneficiary_count'] as number, costKobo: r['cost_kobo'] as number, location: r['location'] as string|null, createdAt: r['created_at'] as number };
  }
  async createEvent(profileId: string, tenantId: string, input: { eventName: string; eventDate: number; venue?: string; expectedAttendance?: number; budgetKobo?: number; offeringCollectedKobo?: number }): Promise<MinistryService> {
    return this.recordService(profileId, tenantId, { serviceType: 'special', scheduledDate: input.eventDate, attendanceCount: input.expectedAttendance, offeringKobo: input.offeringCollectedKobo, tithKobo: 0, notes: [input.eventName, input.venue].filter(Boolean).join(' — ') });
  }
  async listEvents(profileId: string, tenantId: string): Promise<MinistryService[]> {
    return this.listServices(profileId, tenantId);
  }
  async addMember(profileId: string, tenantId: string, input: { memberRefId: string; role?: string; joinDate?: number }): Promise<{ id: string; profileId: string; tenantId: string; memberRefId: string; role: string; joinDate: number; createdAt: number }> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO ministry_members (id,profile_id,tenant_id,member_ref_id,role,join_date,created_at) VALUES (?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.memberRefId,input.role??'member',input.joinDate??Math.floor(Date.now()/1000)).run();
    const r = await this.db.prepare('SELECT * FROM ministry_members WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[ministry-mission] member add failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, memberRefId: r['member_ref_id'] as string, role: r['role'] as string, joinDate: r['join_date'] as number, createdAt: r['created_at'] as number };
  }
  async listMembers(profileId: string, tenantId: string): Promise<{ id: string; profileId: string; tenantId: string; memberRefId: string; role: string; joinDate: number; createdAt: number }[]> {
    const { results } = await this.db.prepare('SELECT * FROM ministry_members WHERE profile_id=? AND tenant_id=? ORDER BY join_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>();
    return results.map(r => ({ id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, memberRefId: r['member_ref_id'] as string, role: r['role'] as string, joinDate: r['join_date'] as number, createdAt: r['created_at'] as number }));
  }
  async listDonations(profileId: string, tenantId: string): Promise<MinistryDonation[]> {
    const { results } = await this.db.prepare('SELECT * FROM ministry_donations WHERE profile_id=? AND tenant_id=? ORDER BY donation_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>();
    return results.map(toDonation);
  }
  async recordDonation(profileId: string, tenantId: string, input: { donorRef?: string; donorRefId?: string; amountKobo: number; donationDate: number; category?: string; donationType?: string; notes?: string }): Promise<MinistryDonation> {
    if (!Number.isInteger(input.amountKobo)) throw new Error('amount_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    const donorRef = input.donorRef ?? input.donorRefId ?? 'anonymous';
    const category = input.category ?? input.donationType ?? 'offering';
    await this.db.prepare('INSERT INTO ministry_donations (id,profile_id,tenant_id,donor_ref,amount_kobo,donation_date,category,created_at) VALUES (?,?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,donorRef,input.amountKobo,input.donationDate,category).run();
    const r = await this.db.prepare('SELECT * FROM ministry_donations WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[ministry-mission] donation create failed'); return toDonation(r);
  }
}
export function guardSeedToClaimed(_p: MinistryMissionProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
