/**
 * LawFirmRepository — M9
 * T3: all queries scoped to tenantId
 * P9: all monetary in kobo integers; time_minutes as integer
 * L3 HITL MANDATORY for ALL AI calls
 * P13 ABSOLUTE: matter_ref_id is opaque UUID; no client identity anywhere
 * FSM: seeded → claimed → nba_verified → active → suspended
 */

import type {
  LawFirmProfile, LegalMatter, LegalTimeEntry, LegalCourtCalendar, LegalInvoice,
  LawFirmFSMState, MatterType, BillingType, MatterStatus, CourtType,
  CreateLawFirmInput, CreateMatterInput, CreateTimeEntryInput, CreateCourtCalendarInput, CreateLegalInvoiceInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; firm_name: string; nba_firm_registration: string | null; nba_branch: string | null; njc_affiliated: number; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface MatterRow { id: string; profile_id: string; tenant_id: string; matter_ref_id: string; matter_type: string; billing_type: string; agreed_fee_kobo: number; status: string; created_at: number; updated_at: number; }
interface TimeEntryRow { id: string; profile_id: string; tenant_id: string; matter_ref_id: string; fee_earner_ref_id: string; time_minutes: number; rate_per_hour_kobo: number; amount_kobo: number; entry_date: number; created_at: number; }
interface CourtRow { id: string; profile_id: string; tenant_id: string; matter_ref_id: string; court_date: number; court_name: string; court_type: string; hearing_type: string; created_at: number; }
interface InvoiceRow { id: string; profile_id: string; tenant_id: string; matter_ref_id: string; invoice_number: string; total_kobo: number; paid_kobo: number; outstanding_kobo: number; issued_date: number; created_at: number; }

function rowToProfile(r: ProfileRow): LawFirmProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, firmName: r.firm_name, nbaFirmRegistration: r.nba_firm_registration, nbaBranch: r.nba_branch, njcAffiliated: Boolean(r.njc_affiliated), cacRc: r.cac_rc, status: r.status as LawFirmFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToMatter(r: MatterRow): LegalMatter { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, matterRefId: r.matter_ref_id, matterType: r.matter_type as MatterType, billingType: r.billing_type as BillingType, agreedFeeKobo: r.agreed_fee_kobo, status: r.status as MatterStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToTimeEntry(r: TimeEntryRow): LegalTimeEntry { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, matterRefId: r.matter_ref_id, feeEarnerRefId: r.fee_earner_ref_id, timeMinutes: r.time_minutes, ratePerHourKobo: r.rate_per_hour_kobo, amountKobo: r.amount_kobo, entryDate: r.entry_date, createdAt: r.created_at }; }
function rowToCourtCalendar(r: CourtRow): LegalCourtCalendar { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, matterRefId: r.matter_ref_id, courtDate: r.court_date, courtName: r.court_name, courtType: r.court_type as CourtType, hearingType: r.hearing_type, createdAt: r.created_at }; }
function rowToInvoice(r: InvoiceRow): LegalInvoice { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, matterRefId: r.matter_ref_id, invoiceNumber: r.invoice_number, totalKobo: r.total_kobo, paidKobo: r.paid_kobo, outstandingKobo: r.outstanding_kobo, issuedDate: r.issued_date, createdAt: r.created_at }; }

export class LawFirmRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateLawFirmInput): Promise<LawFirmProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO law_firm_profiles (id,workspace_id,tenant_id,firm_name,nba_firm_registration,nba_branch,njc_affiliated,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.firmName, input.nbaFirmRegistration ?? null, input.nbaBranch ?? null, input.njcAffiliated ? 1 : 0, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<LawFirmProfile | null> {
    const r = await this.db.prepare('SELECT * FROM law_firm_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateStatus(id: string, tenantId: string, status: LawFirmFSMState): Promise<void> {
    await this.db.prepare('UPDATE law_firm_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(status, now(), id, tenantId).run();
  }

  async createMatter(input: CreateMatterInput): Promise<LegalMatter> {
    if (!Number.isInteger(input.agreedFeeKobo) || input.agreedFeeKobo < 0) throw new Error('P9: agreedFeeKobo must be a non-negative integer');
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(input.matterRefId)) throw new Error('matter_ref_id must be an opaque UUID — no client identifiers allowed');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO legal_matters (id,profile_id,tenant_id,matter_ref_id,matter_type,billing_type,agreed_fee_kobo,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.matterRefId, input.matterType, input.billingType, input.agreedFeeKobo, 'active', ts, ts).run();
    return (await this.findMatterById(id, input.tenantId))!;
  }

  async findMatterById(id: string, tenantId: string): Promise<LegalMatter | null> {
    const r = await this.db.prepare('SELECT * FROM legal_matters WHERE id=? AND tenant_id=?').bind(id, tenantId).first<MatterRow>();
    return r ? rowToMatter(r) : null;
  }

  async createTimeEntry(input: CreateTimeEntryInput): Promise<LegalTimeEntry> {
    if (!Number.isInteger(input.timeMinutes) || input.timeMinutes <= 0) throw new Error('timeMinutes must be a positive integer');
    if (!Number.isInteger(input.ratePerHourKobo) || input.ratePerHourKobo < 0) throw new Error('P9: ratePerHourKobo must be a non-negative integer');
    if (!Number.isInteger(input.amountKobo) || input.amountKobo < 0) throw new Error('P9: amountKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO legal_time_entries (id,profile_id,tenant_id,matter_ref_id,fee_earner_ref_id,time_minutes,rate_per_hour_kobo,amount_kobo,entry_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.matterRefId, input.feeEarnerRefId, input.timeMinutes, input.ratePerHourKobo, input.amountKobo, input.entryDate, ts).run();
    return (await this.findTimeEntryById(id, input.tenantId))!;
  }

  async findTimeEntryById(id: string, tenantId: string): Promise<LegalTimeEntry | null> {
    const r = await this.db.prepare('SELECT * FROM legal_time_entries WHERE id=? AND tenant_id=?').bind(id, tenantId).first<TimeEntryRow>();
    return r ? rowToTimeEntry(r) : null;
  }

  async createCourtCalendar(input: CreateCourtCalendarInput): Promise<LegalCourtCalendar> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO legal_court_calendar (id,profile_id,tenant_id,matter_ref_id,court_date,court_name,court_type,hearing_type,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.matterRefId, input.courtDate, input.courtName, input.courtType, input.hearingType, ts).run();
    return (await this.findCourtCalendarById(id, input.tenantId))!;
  }

  async findCourtCalendarById(id: string, tenantId: string): Promise<LegalCourtCalendar | null> {
    const r = await this.db.prepare('SELECT * FROM legal_court_calendar WHERE id=? AND tenant_id=?').bind(id, tenantId).first<CourtRow>();
    return r ? rowToCourtCalendar(r) : null;
  }

  async createInvoice(input: CreateLegalInvoiceInput): Promise<LegalInvoice> {
    if (!Number.isInteger(input.totalKobo) || input.totalKobo < 0) throw new Error('P9: totalKobo must be a non-negative integer');
    const paidKobo = input.paidKobo ?? 0;
    const outstandingKobo = input.totalKobo - paidKobo;
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO legal_invoices (id,profile_id,tenant_id,matter_ref_id,invoice_number,total_kobo,paid_kobo,outstanding_kobo,issued_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.matterRefId, input.invoiceNumber, input.totalKobo, paidKobo, outstandingKobo, input.issuedDate, ts).run();
    return (await this.findInvoiceById(id, input.tenantId))!;
  }

  async findInvoiceById(id: string, tenantId: string): Promise<LegalInvoice | null> {
    const r = await this.db.prepare('SELECT * FROM legal_invoices WHERE id=? AND tenant_id=?').bind(id, tenantId).first<InvoiceRow>();
    return r ? rowToInvoice(r) : null;
  }
}
