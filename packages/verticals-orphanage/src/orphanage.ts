import type { OrphanageProfile, CreateOrphanageInput, OrphanageFSMState, OrphanagePopulationSummary, OrphanageDonation, OrphanageExpenditure } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): OrphanageProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, orgName: r['org_name'] as string, dssLicense: r['dss_license'] as string|null, cacItCert: r['cac_it_cert'] as string|null, fmwsdReg: r['fmwsd_reg'] as string|null, capacity: r['capacity'] as number, status: r['status'] as OrphanageFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toPopSummary(r: Record<string, unknown>): OrphanagePopulationSummary { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, reportDate: r['report_date'] as number, totalChildren: r['total_children'] as number, age05: r['age_0_5'] as number, age612: r['age_6_12'] as number, age1318: r['age_13_18'] as number, genderMale: r['gender_male'] as number, genderFemale: r['gender_female'] as number, createdAt: r['created_at'] as number }; }
export class OrphanageRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateOrphanageInput): Promise<OrphanageProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO orphanage_profiles (id,workspace_id,tenant_id,org_name,dss_license,cac_it_cert,fmwsd_reg,capacity,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.orgName,input.dssLicense??null,input.cacItCert??null,input.fmwsdReg??null,input.capacity??0).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[orphanage] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<OrphanageProfile|null> { const r = await this.db.prepare('SELECT * FROM orphanage_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<OrphanageProfile|null> { const r = await this.db.prepare('SELECT * FROM orphanage_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: OrphanageFSMState, fields?: { dssLicense?: string }): Promise<OrphanageProfile> {
    if (to === 'dss_licensed' && !fields?.dssLicense) throw new Error('DSS licence required to transition to dss_licensed');
    const extra = fields?.dssLicense ? `, dss_license='${fields.dssLicense}'` : '';
    await this.db.prepare(`UPDATE orphanage_profiles SET status=?${extra}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[orphanage] not found'); return p;
  }
  /** P13 ABSOLUTE: Only aggregate population counts — NO child_ref_id, NO individual child data */
  async recordPopulationSummary(profileId: string, tenantId: string, input: { reportDate: number; totalChildren: number; age05?: number; age612?: number; age1318?: number; genderMale?: number; genderFemale?: number }): Promise<OrphanagePopulationSummary> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO orphanage_population_summary (id,profile_id,tenant_id,report_date,total_children,age_0_5,age_6_12,age_13_18,gender_male,gender_female,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.reportDate,input.totalChildren,input.age05??0,input.age612??0,input.age1318??0,input.genderMale??0,input.genderFemale??0).run();
    const r = await this.db.prepare('SELECT * FROM orphanage_population_summary WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[orphanage] population summary create failed'); return toPopSummary(r);
  }
  async listPopulationSummaries(profileId: string, tenantId: string): Promise<OrphanagePopulationSummary[]> { const { results } = await this.db.prepare('SELECT * FROM orphanage_population_summary WHERE profile_id=? AND tenant_id=? ORDER BY report_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toPopSummary); }
  async recordDonation(profileId: string, tenantId: string, input: { donorRef: string; amountKobo: number; donationDate: number; donationType?: string }): Promise<OrphanageDonation> {
    if (!Number.isInteger(input.amountKobo)) throw new Error('amount_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO orphanage_donations (id,profile_id,tenant_id,donor_ref,amount_kobo,donation_date,donation_type,created_at) VALUES (?,?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.donorRef,input.amountKobo,input.donationDate,input.donationType??'cash').run();
    const r = await this.db.prepare('SELECT * FROM orphanage_donations WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[orphanage] donation create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, donorRef: r['donor_ref'] as string, amountKobo: r['amount_kobo'] as number, donationDate: r['donation_date'] as number, donationType: r['donation_type'] as OrphanageDonation['donationType'], createdAt: r['created_at'] as number };
  }
  async recordExpenditure(profileId: string, tenantId: string, input: { expenseType: string; amountKobo: number; expenseDate: number; notes?: string }): Promise<OrphanageExpenditure> {
    if (!Number.isInteger(input.amountKobo)) throw new Error('amount_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO orphanage_expenditures (id,profile_id,tenant_id,expense_type,amount_kobo,expense_date,notes,created_at) VALUES (?,?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.expenseType,input.amountKobo,input.expenseDate,input.notes??null).run();
    const r = await this.db.prepare('SELECT * FROM orphanage_expenditures WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[orphanage] expenditure create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, expenseType: r['expense_type'] as OrphanageExpenditure['expenseType'], amountKobo: r['amount_kobo'] as number, expenseDate: r['expense_date'] as number, notes: r['notes'] as string|null, createdAt: r['created_at'] as number };
  }
}
export function guardSeedToClaimed(_p: OrphanageProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
