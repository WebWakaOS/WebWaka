import type { GeneratorRepairProfile, CreateGeneratorRepairInput, GeneratorRepairFSMState, RepairJob, RepairPart } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): GeneratorRepairProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, cacRc: r['cac_rc'] as string|null, sonCert: r['son_cert'] as string|null, corenAwareness: r['coren_awareness'] as string|null, serviceType: r['service_type'] as string, status: r['status'] as GeneratorRepairFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toJob(r: Record<string, unknown>): RepairJob { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, customerRefId: r['customer_ref_id'] as string, equipmentType: r['equipment_type'] as RepairJob['equipmentType'], brand: r['brand'] as string|null, serialNumber: r['serial_number'] as string|null, faultCategory: r['fault_category'] as string|null, partsUsed: r['parts_used'] as string|null, labourCostKobo: r['labour_cost_kobo'] as number, partsCostKobo: r['parts_cost_kobo'] as number, totalCostKobo: r['total_cost_kobo'] as number, jobDate: r['job_date'] as number, completedDate: r['completed_date'] as number|null, warrantyDays: r['warranty_days'] as number, status: r['status'] as RepairJob['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toPart(r: Record<string, unknown>): RepairPart { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, partName: r['part_name'] as string, brandCompatible: r['brand_compatible'] as string|null, quantityInStock: r['quantity_in_stock'] as number, unitCostKobo: r['unit_cost_kobo'] as number, reorderLevel: r['reorder_level'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class GeneratorRepairRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateGeneratorRepairInput): Promise<GeneratorRepairProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO generator_repair_profiles (id,workspace_id,tenant_id,business_name,cac_rc,son_cert,coren_awareness,service_type,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.cacRc??null,input.sonCert??null,input.corenAwareness??null,input.serviceType??'generator').run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[generator-repair] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<GeneratorRepairProfile|null> { const r = await this.db.prepare('SELECT * FROM generator_repair_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<GeneratorRepairProfile|null> { const r = await this.db.prepare('SELECT * FROM generator_repair_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: GeneratorRepairFSMState, fields?: { cacRc?: string }): Promise<GeneratorRepairProfile> {
    const extraClauses: string[] = []; const extraBinds: unknown[] = [];
    if (fields?.cacRc) { extraClauses.push('cac_rc = ?'); extraBinds.push(fields.cacRc); }
    await this.db.prepare(`UPDATE generator_repair_profiles SET status=?${extraClauses.length ? ', ' + extraClauses.join(', ') : ''}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,...extraBinds,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[generator-repair] not found'); return p;
  }
  async createJob(profileId: string, tenantId: string, input: { customerRefId: string; equipmentType: string; brand?: string; serialNumber?: string; faultCategory?: string; labourCostKobo: number; partsCostKobo: number; totalCostKobo: number; jobDate: number; warrantyDays?: number }): Promise<RepairJob> {
    if (!Number.isInteger(input.totalCostKobo)) throw new Error('total_cost_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO repair_jobs (id,profile_id,tenant_id,customer_ref_id,equipment_type,brand,serial_number,fault_category,labour_cost_kobo,parts_cost_kobo,total_cost_kobo,job_date,warranty_days,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,\'logged\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.customerRefId,input.equipmentType,input.brand??null,input.serialNumber??null,input.faultCategory??null,input.labourCostKobo,input.partsCostKobo,input.totalCostKobo,input.jobDate,input.warrantyDays??0).run();
    const r = await this.db.prepare('SELECT * FROM repair_jobs WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[generator-repair] job create failed'); return toJob(r);
  }
  async listJobs(profileId: string, tenantId: string): Promise<RepairJob[]> { const { results } = await this.db.prepare('SELECT * FROM repair_jobs WHERE profile_id=? AND tenant_id=? ORDER BY job_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toJob); }
  async updateJobStatus(id: string, tenantId: string, status: string): Promise<RepairJob> {
    await this.db.prepare('UPDATE repair_jobs SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(status,id,tenantId).run();
    const r = await this.db.prepare('SELECT * FROM repair_jobs WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[generator-repair] job not found'); return toJob(r);
  }
  async addPart(profileId: string, tenantId: string, input: { partName: string; brandCompatible?: string; quantityInStock: number; unitCostKobo: number; reorderLevel?: number }): Promise<RepairPart> {
    if (!Number.isInteger(input.unitCostKobo)) throw new Error('unit_cost_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO repair_parts (id,profile_id,tenant_id,part_name,brand_compatible,quantity_in_stock,unit_cost_kobo,reorder_level,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.partName,input.brandCompatible??null,input.quantityInStock,input.unitCostKobo,input.reorderLevel??3).run();
    const r = await this.db.prepare('SELECT * FROM repair_parts WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[generator-repair] part create failed'); return toPart(r);
  }
  async listParts(profileId: string, tenantId: string): Promise<RepairPart[]> { const { results } = await this.db.prepare('SELECT * FROM repair_parts WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toPart); }
}
export function guardSeedToClaimed(_p: GeneratorRepairProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
