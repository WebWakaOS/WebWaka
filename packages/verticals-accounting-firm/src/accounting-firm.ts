/**
 * AccountingFirmRepository — M9
 * T3: all queries scoped to tenantId
 * P9: engagement_fee_kobo / amount_kobo are integers
 * AI: L2 cap — billing analytics aggregate only; P13 no client financial data
 * FSM: seeded → claimed → ican_verified → active → suspended
 */

import type {
  AccountingFirmProfile, AccountingEngagement, AccountingInvoice, AccountingCpdLog,
  AccountingFirmFSMState, EngagementType, EngagementStatus, InvoiceStatus,
  CreateAccountingFirmInput, CreateEngagementInput, CreateInvoiceInput, CreateCpdLogInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; firm_name: string; ican_registration: string | null; anan_registration: string | null; firs_agent_cert: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface EngagementRow { id: string; profile_id: string; tenant_id: string; client_ref_id: string; engagement_type: string; engagement_fee_kobo: number; start_date: number; end_date: number | null; status: string; created_at: number; updated_at: number; }
interface InvoiceRow { id: string; profile_id: string; tenant_id: string; client_ref_id: string; engagement_id: string | null; invoice_number: string; amount_kobo: number; paid_kobo: number; outstanding_kobo: number; issued_date: number; due_date: number | null; status: string; created_at: number; }
interface CpdRow { id: string; profile_id: string; tenant_id: string; member_ref_id: string; cpd_provider: string; cpd_hours: number; completion_date: number; created_at: number; }

function rowToProfile(r: ProfileRow): AccountingFirmProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, firmName: r.firm_name, icanRegistration: r.ican_registration, ananRegistration: r.anan_registration, firsAgentCert: r.firs_agent_cert, cacRc: r.cac_rc, status: r.status as AccountingFirmFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToEngagement(r: EngagementRow): AccountingEngagement { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, clientRefId: r.client_ref_id, engagementType: r.engagement_type as EngagementType, engagementFeeKobo: r.engagement_fee_kobo, startDate: r.start_date, endDate: r.end_date, status: r.status as EngagementStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToInvoice(r: InvoiceRow): AccountingInvoice { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, clientRefId: r.client_ref_id, engagementId: r.engagement_id, invoiceNumber: r.invoice_number, amountKobo: r.amount_kobo, paidKobo: r.paid_kobo, outstandingKobo: r.outstanding_kobo, issuedDate: r.issued_date, dueDate: r.due_date, status: r.status as InvoiceStatus, createdAt: r.created_at }; }
function rowToCpd(r: CpdRow): AccountingCpdLog { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, memberRefId: r.member_ref_id, cpdProvider: r.cpd_provider, cpdHours: r.cpd_hours, completionDate: r.completion_date, createdAt: r.created_at }; }

export class AccountingFirmRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateAccountingFirmInput): Promise<AccountingFirmProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO accounting_firm_profiles (id,workspace_id,tenant_id,firm_name,ican_registration,anan_registration,firs_agent_cert,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.firmName, input.icanRegistration ?? null, input.ananRegistration ?? null, input.firsAgentCert ?? null, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<AccountingFirmProfile | null> {
    const r = await this.db.prepare('SELECT * FROM accounting_firm_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateStatus(id: string, tenantId: string, status: AccountingFirmFSMState): Promise<void> {
    await this.db.prepare('UPDATE accounting_firm_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(status, now(), id, tenantId).run();
  }

  async createEngagement(input: CreateEngagementInput): Promise<AccountingEngagement> {
    if (!Number.isInteger(input.engagementFeeKobo) || input.engagementFeeKobo < 0) throw new Error('P9: engagementFeeKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO accounting_engagements (id,profile_id,tenant_id,client_ref_id,engagement_type,engagement_fee_kobo,start_date,end_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.clientRefId, input.engagementType, input.engagementFeeKobo, input.startDate, input.endDate ?? null, 'active', ts, ts).run();
    return (await this.findEngagementById(id, input.tenantId))!;
  }

  async findEngagementById(id: string, tenantId: string): Promise<AccountingEngagement | null> {
    const r = await this.db.prepare('SELECT * FROM accounting_engagements WHERE id=? AND tenant_id=?').bind(id, tenantId).first<EngagementRow>();
    return r ? rowToEngagement(r) : null;
  }

  async createInvoice(input: CreateInvoiceInput): Promise<AccountingInvoice> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo < 0) throw new Error('P9: amountKobo must be a non-negative integer');
    const paidKobo = input.paidKobo ?? 0;
    const outstandingKobo = input.amountKobo - paidKobo;
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO accounting_invoices (id,profile_id,tenant_id,client_ref_id,engagement_id,invoice_number,amount_kobo,paid_kobo,outstanding_kobo,issued_date,due_date,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.clientRefId, input.engagementId ?? null, input.invoiceNumber, input.amountKobo, paidKobo, outstandingKobo, input.issuedDate, input.dueDate ?? null, 'pending', ts).run();
    return (await this.findInvoiceById(id, input.tenantId))!;
  }

  async findInvoiceById(id: string, tenantId: string): Promise<AccountingInvoice | null> {
    const r = await this.db.prepare('SELECT * FROM accounting_invoices WHERE id=? AND tenant_id=?').bind(id, tenantId).first<InvoiceRow>();
    return r ? rowToInvoice(r) : null;
  }

  async createCpdLog(input: CreateCpdLogInput): Promise<AccountingCpdLog> {
    if (!Number.isInteger(input.cpdHours) || input.cpdHours <= 0) throw new Error('cpdHours must be a positive integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO accounting_cpd_logs (id,profile_id,tenant_id,member_ref_id,cpd_provider,cpd_hours,completion_date,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.memberRefId, input.cpdProvider, input.cpdHours, input.completionDate, ts).run();
    return (await this.findCpdLogById(id, input.tenantId))!;
  }

  async findCpdLogById(id: string, tenantId: string): Promise<AccountingCpdLog | null> {
    const r = await this.db.prepare('SELECT * FROM accounting_cpd_logs WHERE id=? AND tenant_id=?').bind(id, tenantId).first<CpdRow>();
    return r ? rowToCpd(r) : null;
  }
}
