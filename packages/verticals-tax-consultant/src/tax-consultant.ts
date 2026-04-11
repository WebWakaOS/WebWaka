/**
 * TaxConsultantRepository — M12
 * T3: all queries scoped to tenantId
 * P9: all monetary in kobo integers
 * L3 HITL MANDATORY for ALL AI calls (tax advice output)
 * P13: client_ref_id opaque; TIN/liability NEVER to AI
 * FSM: seeded → claimed → firs_verified → active → suspended
 */

import type {
  TaxConsultantProfile, TaxClientFile, TaxRemittance, TaxBilling,
  TaxConsultantFSMState, TaxType, TaxFileStatus,
  CreateTaxConsultantInput, CreateTaxFileInput, CreateRemittanceInput, CreateTaxBillingInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; firm_name: string; firs_tax_agent_cert: string | null; citn_membership: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface FileRow { id: string; profile_id: string; tenant_id: string; client_ref_id: string; tax_type: string; firs_tin: string; filing_period: string; liability_kobo: number; filed_date: number | null; firs_ref: string | null; status: string; created_at: number; updated_at: number; }
interface RemittanceRow { id: string; profile_id: string; tenant_id: string; client_ref_id: string; tax_type: string; period: string; amount_kobo: number; remittance_date: number; bank_ref: string | null; created_at: number; }
interface BillingRow { id: string; profile_id: string; tenant_id: string; client_ref_id: string; period: string; professional_fee_kobo: number; paid_kobo: number; created_at: number; }

function rowToProfile(r: ProfileRow): TaxConsultantProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, firmName: r.firm_name, firsTaxAgentCert: r.firs_tax_agent_cert, citnMembership: r.citn_membership, cacRc: r.cac_rc, status: r.status as TaxConsultantFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToFile(r: FileRow): TaxClientFile { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, clientRefId: r.client_ref_id, taxType: r.tax_type as TaxType, firsTin: r.firs_tin, filingPeriod: r.filing_period, liabilityKobo: r.liability_kobo, filedDate: r.filed_date, firsRef: r.firs_ref, status: r.status as TaxFileStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToRemittance(r: RemittanceRow): TaxRemittance { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, clientRefId: r.client_ref_id, taxType: r.tax_type as TaxType, period: r.period, amountKobo: r.amount_kobo, remittanceDate: r.remittance_date, bankRef: r.bank_ref, createdAt: r.created_at }; }
function rowToBilling(r: BillingRow): TaxBilling { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, clientRefId: r.client_ref_id, period: r.period, professionalFeeKobo: r.professional_fee_kobo, paidKobo: r.paid_kobo, createdAt: r.created_at }; }

export class TaxConsultantRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateTaxConsultantInput): Promise<TaxConsultantProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO tax_consultant_profiles (id,workspace_id,tenant_id,firm_name,firs_tax_agent_cert,citn_membership,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.firmName, input.firsTaxAgentCert ?? null, input.citnMembership ?? null, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<TaxConsultantProfile | null> {
    const r = await this.db.prepare('SELECT * FROM tax_consultant_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateStatus(id: string, tenantId: string, status: TaxConsultantFSMState): Promise<void> {
    await this.db.prepare('UPDATE tax_consultant_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(status, now(), id, tenantId).run();
  }

  async createTaxFile(input: CreateTaxFileInput): Promise<TaxClientFile> {
    if (!Number.isInteger(input.liabilityKobo) || input.liabilityKobo < 0) throw new Error('P9: liabilityKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO tax_client_files (id,profile_id,tenant_id,client_ref_id,tax_type,firs_tin,filing_period,liability_kobo,filed_date,firs_ref,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.clientRefId, input.taxType, input.firsTin, input.filingPeriod, input.liabilityKobo, null, null, 'pending', ts, ts).run();
    return (await this.findTaxFileById(id, input.tenantId))!;
  }

  async findTaxFileById(id: string, tenantId: string): Promise<TaxClientFile | null> {
    const r = await this.db.prepare('SELECT * FROM tax_client_files WHERE id=? AND tenant_id=?').bind(id, tenantId).first<FileRow>();
    return r ? rowToFile(r) : null;
  }

  async createRemittance(input: CreateRemittanceInput): Promise<TaxRemittance> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo < 0) throw new Error('P9: amountKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO tax_remittances (id,profile_id,tenant_id,client_ref_id,tax_type,period,amount_kobo,remittance_date,bank_ref,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.clientRefId, input.taxType, input.period, input.amountKobo, input.remittanceDate, input.bankRef ?? null, ts).run();
    return (await this.findRemittanceById(id, input.tenantId))!;
  }

  async findRemittanceById(id: string, tenantId: string): Promise<TaxRemittance | null> {
    const r = await this.db.prepare('SELECT * FROM tax_remittances WHERE id=? AND tenant_id=?').bind(id, tenantId).first<RemittanceRow>();
    return r ? rowToRemittance(r) : null;
  }

  async createBilling(input: CreateTaxBillingInput): Promise<TaxBilling> {
    if (!Number.isInteger(input.professionalFeeKobo) || input.professionalFeeKobo < 0) throw new Error('P9: professionalFeeKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO tax_billing (id,profile_id,tenant_id,client_ref_id,period,professional_fee_kobo,paid_kobo,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.clientRefId, input.period, input.professionalFeeKobo, input.paidKobo ?? 0, ts).run();
    return (await this.findBillingById(id, input.tenantId))!;
  }

  async findBillingById(id: string, tenantId: string): Promise<TaxBilling | null> {
    const r = await this.db.prepare('SELECT * FROM tax_billing WHERE id=? AND tenant_id=?').bind(id, tenantId).first<BillingRow>();
    return r ? rowToBilling(r) : null;
  }
}
