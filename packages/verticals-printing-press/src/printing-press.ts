import type { PrintingPressProfile, CreatePrintingPressInput, PrintingPressFSMState, PrintingJob, PrintingInventory } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): PrintingPressProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, cacRc: r['cac_rc'] as string|null, ncpnMembership: r['ncpn_membership'] as string|null, printType: r['print_type'] as PrintingPressProfile['printType'], status: r['status'] as PrintingPressFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toJob(r: Record<string, unknown>): PrintingJob { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, clientRefId: r['client_ref_id'] as string, jobType: r['job_type'] as PrintingJob['jobType'], quantity: r['quantity'] as number, descriptionSpec: r['description_spec'] as string|null, setupCostKobo: r['setup_cost_kobo'] as number, printCostKobo: r['print_cost_kobo'] as number, totalKobo: r['total_kobo'] as number, depositKobo: r['deposit_kobo'] as number, jobDate: r['job_date'] as number, deliveryDate: r['delivery_date'] as number|null, status: r['status'] as PrintingJob['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class PrintingPressRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreatePrintingPressInput): Promise<PrintingPressProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO printing_press_profiles (id,workspace_id,tenant_id,business_name,cac_rc,ncpn_membership,print_type,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.cacRc??null,input.ncpnMembership??null,input.printType??'offset').run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[printing-press] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<PrintingPressProfile|null> { const r = await this.db.prepare('SELECT * FROM printing_press_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<PrintingPressProfile|null> { const r = await this.db.prepare('SELECT * FROM printing_press_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: PrintingPressFSMState): Promise<PrintingPressProfile> {
    await this.db.prepare('UPDATE printing_press_profiles SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[printing-press] not found'); return p;
  }
  async createJob(profileId: string, tenantId: string, input: { clientRefId: string; jobType: string; quantity: number; descriptionSpec?: string; setupCostKobo: number; printCostKobo: number; totalKobo: number; depositKobo?: number; jobDate: number; deliveryDate?: number }): Promise<PrintingJob> {
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO printing_jobs (id,profile_id,tenant_id,client_ref_id,job_type,quantity,description_spec,setup_cost_kobo,print_cost_kobo,total_kobo,deposit_kobo,job_date,delivery_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,\'intake\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.clientRefId,input.jobType,input.quantity,input.descriptionSpec??null,input.setupCostKobo,input.printCostKobo,input.totalKobo,input.depositKobo??0,input.jobDate,input.deliveryDate??null).run();
    const r = await this.db.prepare('SELECT * FROM printing_jobs WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[printing-press] job create failed'); return toJob(r);
  }
  async listJobs(profileId: string, tenantId: string): Promise<PrintingJob[]> { const { results } = await this.db.prepare('SELECT * FROM printing_jobs WHERE profile_id=? AND tenant_id=? ORDER BY job_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toJob); }
  async updateJobStatus(id: string, tenantId: string, status: string): Promise<PrintingJob> {
    await this.db.prepare('UPDATE printing_jobs SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(status,id,tenantId).run();
    const r = await this.db.prepare('SELECT * FROM printing_jobs WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[printing-press] job not found'); return toJob(r);
  }
  async addInventory(profileId: string, tenantId: string, input: { materialName: string; unit?: string; quantityInStock: number; unitCostKobo: number; reorderLevel?: number }): Promise<PrintingInventory> {
    if (!Number.isInteger(input.unitCostKobo)) throw new Error('unit_cost_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO printing_inventory (id,profile_id,tenant_id,material_name,unit,quantity_in_stock,unit_cost_kobo,reorder_level,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.materialName,input.unit??'ream',input.quantityInStock,input.unitCostKobo,input.reorderLevel??5).run();
    const r = await this.db.prepare('SELECT * FROM printing_inventory WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[printing-press] inventory create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, materialName: r['material_name'] as string, unit: r['unit'] as string, quantityInStock: r['quantity_in_stock'] as number, unitCostKobo: r['unit_cost_kobo'] as number, reorderLevel: r['reorder_level'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
  }
}
export function guardSeedToClaimed(_p: PrintingPressProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
