import type { OilGasServicesProfile, CreateOilGasServicesInput, OilGasServicesFSMState, OilGasContract, OilGasHseLog, OilGasNcdmbReport } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): OilGasServicesProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, companyName: r['company_name'] as string, ncdmbCert: r['ncdmb_cert'] as string|null, dprRegistration: r['dpr_registration'] as string|null, cacRc: r['cac_rc'] as string|null, serviceCategory: r['service_category'] as string, status: r['status'] as OilGasServicesFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toContract(r: Record<string, unknown>): OilGasContract { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, clientRefId: r['client_ref_id'] as string, contractTitle: r['contract_title'] as string, contractValueKobo: r['contract_value_kobo'] as number, localContentPctX100: r['local_content_pct_x100'] as number, startDate: r['start_date'] as number, endDate: r['end_date'] as number|null, mobilisationKobo: r['mobilisation_kobo'] as number, invoicedKobo: r['invoiced_kobo'] as number, status: r['status'] as OilGasContract['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toHseLog(r: Record<string, unknown>): OilGasHseLog { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, logDate: r['log_date'] as number, incidentCount: r['incident_count'] as number, nearMissCount: r['near_miss_count'] as number, manHours: r['man_hours'] as number, ltifrX1000: r['ltifr_x1000'] as number, notes: r['notes'] as string|null, createdAt: r['created_at'] as number }; }
export class OilGasServicesRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateOilGasServicesInput): Promise<OilGasServicesProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO oil_gas_services_profiles (id,workspace_id,tenant_id,company_name,ncdmb_cert,dpr_registration,cac_rc,service_category,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.companyName,input.ncdmbCert??null,input.dprRegistration??null,input.cacRc??null,input.serviceCategory??'general').run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[oil-gas-services] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<OilGasServicesProfile|null> { const r = await this.db.prepare('SELECT * FROM oil_gas_services_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<OilGasServicesProfile|null> { const r = await this.db.prepare('SELECT * FROM oil_gas_services_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: OilGasServicesFSMState, fields?: { ncdmbCert?: string; dprRegistration?: string }): Promise<OilGasServicesProfile> {
    if (to === 'ncdmb_certified' && !fields?.ncdmbCert) throw new Error('NCDMB certificate required to transition to ncdmb_certified');
    if (to === 'dpr_registered' && !fields?.dprRegistration) throw new Error('DPR registration required to transition to dpr_registered');
    const extraClauses: string[] = []; const extraBinds: unknown[] = [];
    if (fields?.ncdmbCert) { extraClauses.push('ncdmb_cert = ?'); extraBinds.push(fields.ncdmbCert); }
    if (fields?.dprRegistration) { extraClauses.push('dpr_registration = ?'); extraBinds.push(fields.dprRegistration); }
    await this.db.prepare(`UPDATE oil_gas_services_profiles SET status=?${extraClauses.length ? ', ' + extraClauses.join(', ') : ''}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,...extraBinds,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[oil-gas-services] not found'); return p;
  }
  async createContract(profileId: string, tenantId: string, input: { clientRefId: string; contractTitle: string; contractValueKobo: number; localContentPctX100?: number; startDate: number; endDate?: number; mobilisationKobo?: number; contractScope?: string; performanceBondKobo?: number }): Promise<OilGasContract> {
    if (!Number.isInteger(input.contractValueKobo)) throw new Error('contract_value_kobo must be integer (no REAL/float — P9 critical)');
    if (!Number.isInteger(input.localContentPctX100)) throw new Error('local_content_pct_x100 must be integer (pct×100)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO oil_gas_contracts (id,profile_id,tenant_id,client_ref_id,contract_title,contract_value_kobo,local_content_pct_x100,start_date,end_date,mobilisation_kobo,invoiced_kobo,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,0,\'bid\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.clientRefId,input.contractTitle,input.contractValueKobo,input.localContentPctX100,input.startDate,input.endDate??null,input.mobilisationKobo??0).run();
    const r = await this.db.prepare('SELECT * FROM oil_gas_contracts WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[oil-gas-services] contract create failed'); return toContract(r);
  }
  async listContracts(profileId: string, tenantId: string): Promise<OilGasContract[]> { const { results } = await this.db.prepare('SELECT * FROM oil_gas_contracts WHERE profile_id=? AND tenant_id=? ORDER BY start_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toContract); }
  async updateContractStatus(id: string, tenantId: string, status: string, invoicedKobo?: number): Promise<OilGasContract> {
    await this.db.prepare('UPDATE oil_gas_contracts SET status=?, invoiced_kobo=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(status,invoicedKobo??0,id,tenantId).run();
    const r = await this.db.prepare('SELECT * FROM oil_gas_contracts WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[oil-gas-services] contract not found'); return toContract(r);
  }
  async addHseLog(profileId: string, tenantId: string, input: { logDate: number; incidentCount?: number; nearMissCount?: number; manHours: number; ltifrX1000?: number; notes?: string }): Promise<OilGasHseLog> {
    if (!Number.isInteger(input.ltifrX1000??0)) throw new Error('ltifr_x1000 must be integer (×1000)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO oil_gas_hse_log (id,profile_id,tenant_id,log_date,incident_count,near_miss_count,man_hours,ltifr_x1000,notes,created_at) VALUES (?,?,?,?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.logDate,input.incidentCount??0,input.nearMissCount??0,input.manHours,input.ltifrX1000??0,input.notes??null).run();
    const r = await this.db.prepare('SELECT * FROM oil_gas_hse_log WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[oil-gas-services] HSE log create failed'); return toHseLog(r);
  }
  async createNcdmbReport(profileId: string, tenantId: string, input: { contractId: string; reportPeriod: string; localContentPctX100: number; nigerianStaffCount?: number; expatriateStaffCount?: number; localSpendKobo?: number }): Promise<OilGasNcdmbReport> {
    if (!Number.isInteger(input.localContentPctX100)) throw new Error('local_content_pct_x100 must be integer');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO oil_gas_ncdmb_reports (id,profile_id,tenant_id,contract_id,report_period,local_content_pct_x100,nigerian_staff_count,expatriate_staff_count,local_spend_kobo,created_at) VALUES (?,?,?,?,?,?,?,?,?,unixepoch())').bind(id,profileId,tenantId,input.contractId,input.reportPeriod,input.localContentPctX100,input.nigerianStaffCount??0,input.expatriateStaffCount??0,input.localSpendKobo??0).run();
    const r = await this.db.prepare('SELECT * FROM oil_gas_ncdmb_reports WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[oil-gas-services] NCDMB report create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, contractId: r['contract_id'] as string, reportPeriod: r['report_period'] as string, localContentPctX100: r['local_content_pct_x100'] as number, nigerianStaffCount: r['nigerian_staff_count'] as number, expatriateStaffCount: r['expatriate_staff_count'] as number, localSpendKobo: r['local_spend_kobo'] as number, createdAt: r['created_at'] as number };
  }

  async addPersonnel(profileId: string, tenantId: string, input: { personnelRefId: string; role: string; ncdmbCategory?: string; expatriate?: boolean; monthlySalaryKobo?: number }): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID(); const ts = Math.floor(Date.now()/1000);
    await this.db.prepare('INSERT INTO oil_gas_personnel (id,profile_id,tenant_id,personnel_ref_id,role,ncdmb_category,expatriate,monthly_salary_kobo,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.personnelRefId,input.role,input.ncdmbCategory??null,input.expatriate?1:0,input.monthlySalaryKobo??0,ts).run();
    return { id, profileId, tenantId, ...input, ncdmbCategory: input.ncdmbCategory??null, expatriate: input.expatriate??false, monthlySalaryKobo: input.monthlySalaryKobo??0, createdAt: ts };
  }
  async listPersonnel(profileId: string, tenantId: string): Promise<Record<string, unknown>[]> {
    const { results } = await this.db.prepare('SELECT * FROM oil_gas_personnel WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results;
  }
  async registerEquipment(profileId: string, tenantId: string, input: { equipmentName: string; serialNumber?: string; assetTag?: string; valuationKobo?: number; lastCertDate?: number; certBody?: string }): Promise<Record<string, unknown>> {
    if (input.valuationKobo !== undefined && !Number.isInteger(input.valuationKobo)) throw new Error('valuation_kobo must be integer (P9)');
    const id = crypto.randomUUID(); const ts = Math.floor(Date.now()/1000);
    await this.db.prepare('INSERT INTO oil_gas_equipment (id,profile_id,tenant_id,equipment_name,serial_number,asset_tag,valuation_kobo,last_cert_date,cert_body,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.equipmentName,input.serialNumber??null,input.assetTag??null,input.valuationKobo??0,input.lastCertDate??null,input.certBody??null,ts).run();
    return { id, profileId, tenantId, ...input, createdAt: ts };
  }
  async listEquipment(profileId: string, tenantId: string): Promise<Record<string, unknown>[]> {
    const { results } = await this.db.prepare('SELECT * FROM oil_gas_equipment WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results;
  }
  async createHseLog(profileId: string, tenantId: string, input: { logDate: number; incidentType?: string; manHoursWorked: number; ltifr?: number; trifr?: number; nearMissCount?: number; notes?: string }): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID(); const ts = Math.floor(Date.now()/1000);
    await this.db.prepare('INSERT INTO oil_gas_hse_log (id,profile_id,tenant_id,log_date,incident_type,man_hours_worked,ltifr,trifr,near_miss_count,notes,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id,profileId,tenantId,input.logDate,input.incidentType??null,input.manHoursWorked,input.ltifr??null,input.trifr??null,input.nearMissCount??0,input.notes??null,ts).run();
    return { id, profileId, tenantId, ...input, createdAt: ts };
  }
  async listHseLogs(profileId: string, tenantId: string): Promise<Record<string, unknown>[]> {
    const { results } = await this.db.prepare('SELECT * FROM oil_gas_hse_log WHERE profile_id=? AND tenant_id=? ORDER BY log_date DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results;
  }

}
export function guardSeedToClaimed(_p: OilGasServicesProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
