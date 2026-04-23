import type { HandymanProfile, CreateHandymanInput, HandymanFSMState, HandymanJob, HandymanMaterial } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): HandymanProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, tradeType: r['trade_type'] as HandymanProfile['tradeType'], corenAwareness: r['coren_awareness'] as string|null, nabtebCert: r['nabteb_cert'] as string|null, cacRc: r['cac_rc'] as string|null, state: r['state'] as string|null, lga: r['lga'] as string|null, status: r['status'] as HandymanFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toJob(r: Record<string, unknown>): HandymanJob { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, clientRefId: r['client_ref_id'] as string, jobType: r['job_type'] as string, description: r['description'] as string|null, materialCostKobo: r['material_cost_kobo'] as number, labourCostKobo: r['labour_cost_kobo'] as number, totalKobo: r['total_kobo'] as number, jobDate: r['job_date'] as number, completedDate: r['completed_date'] as number|null, warrantyDays: r['warranty_days'] as number, status: r['status'] as HandymanJob['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toMaterial(r: Record<string, unknown>): HandymanMaterial { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, materialName: r['material_name'] as string, unit: r['unit'] as string, quantity: r['quantity'] as number, unitCostKobo: r['unit_cost_kobo'] as number, reorderLevel: r['reorder_level'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class HandymanRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateHandymanInput): Promise<HandymanProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO handyman_profiles (id,workspace_id,tenant_id,business_name,trade_type,coren_awareness,nabteb_cert,cac_rc,state,lga,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.tradeType??'all',input.corenAwareness??null,input.nabtebCert??null,input.cacRc??null,input.state??null,input.lga??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[handyman] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<HandymanProfile|null> { const r = await this.db.prepare('SELECT * FROM handyman_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<HandymanProfile|null> { const r = await this.db.prepare('SELECT * FROM handyman_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: HandymanFSMState, fields?: { cacRc?: string }): Promise<HandymanProfile> {
    const extraClauses: string[] = []; const extraBinds: unknown[] = [];
    if (fields?.cacRc) { extraClauses.push('cac_rc = ?'); extraBinds.push(fields.cacRc); }
    await this.db.prepare(`UPDATE handyman_profiles SET status=?${extraClauses.length ? ', ' + extraClauses.join(', ') : ''}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,...extraBinds,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[handyman] not found'); return p;
  }
  async createJob(profileId: string, tenantId: string, input: { clientRefId: string; jobType: string; description?: string; materialCostKobo: number; labourCostKobo: number; totalKobo: number; jobDate: number; warrantyDays?: number }): Promise<HandymanJob> {
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    if (!Number.isInteger(input.materialCostKobo) || !Number.isInteger(input.labourCostKobo)) throw new Error('cost values must be integer kobo (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO handyman_jobs (id,profile_id,tenant_id,client_ref_id,job_type,description,material_cost_kobo,labour_cost_kobo,total_kobo,job_date,warranty_days,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,\'logged\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.clientRefId,input.jobType,input.description??null,input.materialCostKobo,input.labourCostKobo,input.totalKobo,input.jobDate,input.warrantyDays??0).run();
    const r = await this.db.prepare('SELECT * FROM handyman_jobs WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[handyman] job create failed'); return toJob(r);
  }
  async listJobs(profileId: string, tenantId: string): Promise<HandymanJob[]> { const { results } = await this.db.prepare('SELECT * FROM handyman_jobs WHERE profile_id=? AND tenant_id=? ORDER BY job_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toJob); }
  async updateJobStatus(id: string, tenantId: string, status: string, completedDate?: number): Promise<HandymanJob> {
    await this.db.prepare('UPDATE handyman_jobs SET status=?, completed_date=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(status,completedDate??null,id,tenantId).run();
    const r = await this.db.prepare('SELECT * FROM handyman_jobs WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[handyman] job not found'); return toJob(r);
  }
  async createMaterial(profileId: string, tenantId: string, input: { materialName: string; unit?: string; quantity: number; unitCostKobo: number; reorderLevel?: number }): Promise<HandymanMaterial> {
    if (!Number.isInteger(input.unitCostKobo)) throw new Error('unit_cost_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO handyman_materials (id,profile_id,tenant_id,material_name,unit,quantity,unit_cost_kobo,reorder_level,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.materialName,input.unit??'piece',input.quantity,input.unitCostKobo,input.reorderLevel??5).run();
    const r = await this.db.prepare('SELECT * FROM handyman_materials WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[handyman] material create failed'); return toMaterial(r);
  }
  async listMaterials(profileId: string, tenantId: string): Promise<HandymanMaterial[]> { const { results } = await this.db.prepare('SELECT * FROM handyman_materials WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toMaterial); }
}
export function guardSeedToClaimed(_p: HandymanProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
