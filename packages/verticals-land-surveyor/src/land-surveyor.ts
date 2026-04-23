import type { LandSurveyorProfile, CreateLandSurveyorInput, LandSurveyorFSMState, SurveyJob, SurveyPlan } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): LandSurveyorProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, surconReg: r['surcon_reg'] as string|null, cacRc: r['cac_rc'] as string|null, state: r['state'] as string|null, lga: r['lga'] as string|null, status: r['status'] as LandSurveyorFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toJob(r: Record<string, unknown>): SurveyJob { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, clientRefId: r['client_ref_id'] as string, landRefId: r['land_ref_id'] as string, surveyType: r['survey_type'] as SurveyJob['surveyType'], locationState: r['location_state'] as string, locationLga: r['location_lga'] as string|null, feePaidKobo: r['fee_paid_kobo'] as number, jobDate: r['job_date'] as number, completedDate: r['completed_date'] as number|null, status: r['status'] as SurveyJob['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class LandSurveyorRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateLandSurveyorInput): Promise<LandSurveyorProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO land_surveyor_profiles (id,workspace_id,tenant_id,business_name,surcon_reg,cac_rc,state,lga,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.surconReg??null,input.cacRc??null,input.state??null,input.lga??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[land-surveyor] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<LandSurveyorProfile|null> { const r = await this.db.prepare('SELECT * FROM land_surveyor_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<LandSurveyorProfile|null> { const r = await this.db.prepare('SELECT * FROM land_surveyor_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: LandSurveyorFSMState, fields?: { surconReg?: string }): Promise<LandSurveyorProfile> {
    const extraClauses: string[] = []; const extraBinds: unknown[] = [];
    if (fields?.surconReg) { extraClauses.push('surcon_reg = ?'); extraBinds.push(fields.surconReg); }
    await this.db.prepare(`UPDATE land_surveyor_profiles SET status=?${extraClauses.length ? ', ' + extraClauses.join(', ') : ''}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,...extraBinds,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[land-surveyor] not found'); return p;
  }
  async createSurveyJob(profileId: string, tenantId: string, input: { clientRefId: string; landRefId: string; surveyType: string; locationState: string; locationLga?: string; feePaidKobo: number; jobDate: number }): Promise<SurveyJob> {
    if (!Number.isInteger(input.feePaidKobo)) throw new Error('fee_paid_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO survey_jobs (id,profile_id,tenant_id,client_ref_id,land_ref_id,survey_type,location_state,location_lga,fee_paid_kobo,job_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,\'intake\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.clientRefId,input.landRefId,input.surveyType,input.locationState,input.locationLga??null,input.feePaidKobo,input.jobDate).run();
    const r = await this.db.prepare('SELECT * FROM survey_jobs WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[land-surveyor] job create failed'); return toJob(r);
  }
  async listSurveyJobs(profileId: string, tenantId: string): Promise<SurveyJob[]> { const { results } = await this.db.prepare('SELECT * FROM survey_jobs WHERE profile_id=? AND tenant_id=? ORDER BY job_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toJob); }
  async createSurveyPlan(jobId: string, tenantId: string, input: { planNumber: string; beaconCount?: number; areaSqmX100: number; sealDate?: number; bearingNotes?: string }): Promise<SurveyPlan> {
    if (!Number.isInteger(input.areaSqmX100)) throw new Error('area_sqm_x100 must be integer (no floats)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO survey_plans (id,job_id,tenant_id,plan_number,beacon_count,area_sqm_x100,seal_date,bearing_notes,created_at) VALUES (?,?,?,?,?,?,?,?,unixepoch())').bind(id,jobId,tenantId,input.planNumber,input.beaconCount??0,input.areaSqmX100,input.sealDate??null,input.bearingNotes??null).run();
    const r = await this.db.prepare('SELECT * FROM survey_plans WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[land-surveyor] plan create failed');
    return { id: r['id'] as string, jobId: r['job_id'] as string, tenantId: r['tenant_id'] as string, planNumber: r['plan_number'] as string, beaconCount: r['beacon_count'] as number, areaSqmX100: r['area_sqm_x100'] as number, sealDate: r['seal_date'] as number|null, bearingNotes: r['bearing_notes'] as string|null, createdAt: r['created_at'] as number };
  }
}
export function guardSeedToClaimed(_p: LandSurveyorProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
