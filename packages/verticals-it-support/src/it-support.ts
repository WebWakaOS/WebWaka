import type { ItSupportProfile, CreateItSupportInput, ItSupportFSMState, ItTicket, ItServiceContract } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): ItSupportProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, cacRc: r['cac_rc'] as string|null, nitnCert: r['nitn_cert'] as string|null, ndprConformance: Boolean(r['ndpr_conformance']), serviceScope: r['service_scope'] as string, status: r['status'] as ItSupportFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toTicket(r: Record<string, unknown>): ItTicket { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, clientRefId: r['client_ref_id'] as string, issueType: r['issue_type'] as ItTicket['issueType'], priority: r['priority'] as ItTicket['priority'], description: r['description'] as string|null, assignedToRef: r['assigned_to_ref'] as string|null, resolutionNotes: r['resolution_notes'] as string|null, slaHours: r['sla_hours'] as number, labourCostKobo: r['labour_cost_kobo'] as number, openedAt: r['opened_at'] as number, closedAt: r['closed_at'] as number|null, status: r['status'] as ItTicket['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class ItSupportRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateItSupportInput): Promise<ItSupportProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO it_support_profiles (id,workspace_id,tenant_id,business_name,cac_rc,nitn_cert,ndpr_conformance,service_scope,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.cacRc??null,input.nitnCert??null,input.ndprConformance?1:0,input.serviceScope??'all').run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[it-support] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<ItSupportProfile|null> { const r = await this.db.prepare('SELECT * FROM it_support_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<ItSupportProfile|null> { const r = await this.db.prepare('SELECT * FROM it_support_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: ItSupportFSMState, fields?: { cacRc?: string }): Promise<ItSupportProfile> {
    const extraClauses: string[] = []; const extraBinds: unknown[] = [];
    if (fields?.cacRc) { extraClauses.push('cac_rc = ?'); extraBinds.push(fields.cacRc); }
    await this.db.prepare(`UPDATE it_support_profiles SET status=?${extraClauses.length ? ', ' + extraClauses.join(', ') : ''}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,...extraBinds,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[it-support] not found'); return p;
  }
  async createTicket(profileId: string, tenantId: string, input: { clientRefId: string; issueType: string; priority?: string; description?: string; slaHours?: number; labourCostKobo?: number }): Promise<ItTicket> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO it_tickets (id,profile_id,tenant_id,client_ref_id,issue_type,priority,description,sla_hours,labour_cost_kobo,opened_at,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,unixepoch(),\'open\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.clientRefId,input.issueType,input.priority??'medium',input.description??null,input.slaHours??8,input.labourCostKobo??0).run();
    const r = await this.db.prepare('SELECT * FROM it_tickets WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[it-support] ticket create failed'); return toTicket(r);
  }
  async listTickets(profileId: string, tenantId: string): Promise<ItTicket[]> { const { results } = await this.db.prepare('SELECT * FROM it_tickets WHERE profile_id=? AND tenant_id=? ORDER BY opened_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toTicket); }
  async closeTicket(id: string, tenantId: string, input: { resolutionNotes?: string; labourCostKobo?: number }): Promise<ItTicket> {
    await this.db.prepare('UPDATE it_tickets SET status=\'resolved\', resolution_notes=?, labour_cost_kobo=?, closed_at=unixepoch(), updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(input.resolutionNotes??null,input.labourCostKobo??0,id,tenantId).run();
    const r = await this.db.prepare('SELECT * FROM it_tickets WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[it-support] ticket not found'); return toTicket(r);
  }
  async createServiceContract(profileId: string, tenantId: string, input: { clientRefId: string; annualFeeKobo: number; startDate: number; endDate: number; slaDescription?: string }): Promise<ItServiceContract> {
    if (!Number.isInteger(input.annualFeeKobo)) throw new Error('annual_fee_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO it_service_contracts (id,profile_id,tenant_id,client_ref_id,annual_fee_kobo,start_date,end_date,sla_description,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,\'active\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.clientRefId,input.annualFeeKobo,input.startDate,input.endDate,input.slaDescription??null).run();
    const r = await this.db.prepare('SELECT * FROM it_service_contracts WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[it-support] contract create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, clientRefId: r['client_ref_id'] as string, annualFeeKobo: r['annual_fee_kobo'] as number, startDate: r['start_date'] as number, endDate: r['end_date'] as number, slaDescription: r['sla_description'] as string|null, status: r['status'] as string, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
  }
}
export function guardSeedToClaimed(_p: ItSupportProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
