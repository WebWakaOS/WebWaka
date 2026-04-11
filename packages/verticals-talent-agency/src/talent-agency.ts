/**
 * TalentAgencyRepository — M12
 * T3: all queries scoped to tenantId
 * P9: all monetary in kobo integers; commission_bps as integer basis points
 * Fee arithmetic: commission_kobo + talent_payout_kobo = brand_fee_kobo enforced
 * AI: L2 cap — booking aggregate only; P13 no talent_ref_id or deal terms
 * FSM: seeded → claimed → nmma_verified → active → suspended
 */

import type {
  TalentAgencyProfile, TalentRosterEntry, TalentBooking,
  TalentAgencyFSMState, TalentCategory, TalentStatus, BookingStatus,
  CreateTalentAgencyInput, CreateTalentRosterInput, CreateBookingInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; agency_name: string; nmma_registration: string | null; state_entertainment_cert: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface RosterRow { id: string; profile_id: string; tenant_id: string; talent_ref_id: string; category: string; commission_bps: number; signed_date: number; status: string; created_at: number; updated_at: number; }
interface BookingRow { id: string; profile_id: string; tenant_id: string; talent_ref_id: string; brand_ref_id: string; booking_date: number; deliverable_type: string; brand_fee_kobo: number; commission_kobo: number; talent_payout_kobo: number; status: string; created_at: number; updated_at: number; }

function rowToProfile(r: ProfileRow): TalentAgencyProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, agencyName: r.agency_name, nmmaRegistration: r.nmma_registration, stateEntertainmentCert: r.state_entertainment_cert, cacRc: r.cac_rc, status: r.status as TalentAgencyFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToRoster(r: RosterRow): TalentRosterEntry { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, talentRefId: r.talent_ref_id, category: r.category as TalentCategory, commissionBps: r.commission_bps, signedDate: r.signed_date, status: r.status as TalentStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToBooking(r: BookingRow): TalentBooking { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, talentRefId: r.talent_ref_id, brandRefId: r.brand_ref_id, bookingDate: r.booking_date, deliverableType: r.deliverable_type, brandFeeKobo: r.brand_fee_kobo, commissionKobo: r.commission_kobo, talentPayoutKobo: r.talent_payout_kobo, status: r.status as BookingStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class TalentAgencyRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateTalentAgencyInput): Promise<TalentAgencyProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO talent_agency_profiles (id,workspace_id,tenant_id,agency_name,nmma_registration,state_entertainment_cert,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.agencyName, input.nmmaRegistration ?? null, input.stateEntertainmentCert ?? null, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<TalentAgencyProfile | null> {
    const r = await this.db.prepare('SELECT * FROM talent_agency_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateStatus(id: string, tenantId: string, status: TalentAgencyFSMState): Promise<void> {
    await this.db.prepare('UPDATE talent_agency_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(status, now(), id, tenantId).run();
  }

  async createRosterEntry(input: CreateTalentRosterInput): Promise<TalentRosterEntry> {
    if (!Number.isInteger(input.commissionBps) || input.commissionBps < 0 || input.commissionBps > 10000) throw new Error('commissionBps must be an integer between 0 and 10000');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO talent_roster (id,profile_id,tenant_id,talent_ref_id,category,commission_bps,signed_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.talentRefId, input.category, input.commissionBps, input.signedDate, 'active', ts, ts).run();
    return (await this.findRosterById(id, input.tenantId))!;
  }

  async findRosterById(id: string, tenantId: string): Promise<TalentRosterEntry | null> {
    const r = await this.db.prepare('SELECT * FROM talent_roster WHERE id=? AND tenant_id=?').bind(id, tenantId).first<RosterRow>();
    return r ? rowToRoster(r) : null;
  }

  async createBooking(input: CreateBookingInput): Promise<TalentBooking> {
    if (!Number.isInteger(input.brandFeeKobo) || input.brandFeeKobo < 0) throw new Error('P9: brandFeeKobo must be a non-negative integer');
    if (!Number.isInteger(input.commissionKobo) || input.commissionKobo < 0) throw new Error('P9: commissionKobo must be a non-negative integer');
    if (!Number.isInteger(input.talentPayoutKobo) || input.talentPayoutKobo < 0) throw new Error('P9: talentPayoutKobo must be a non-negative integer');
    if (input.commissionKobo + input.talentPayoutKobo !== input.brandFeeKobo) throw new Error(`Fee arithmetic: commissionKobo (${input.commissionKobo}) + talentPayoutKobo (${input.talentPayoutKobo}) must equal brandFeeKobo (${input.brandFeeKobo})`);
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO talent_bookings (id,profile_id,tenant_id,talent_ref_id,brand_ref_id,booking_date,deliverable_type,brand_fee_kobo,commission_kobo,talent_payout_kobo,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.talentRefId, input.brandRefId, input.bookingDate, input.deliverableType, input.brandFeeKobo, input.commissionKobo, input.talentPayoutKobo, 'enquiry', ts, ts).run();
    return (await this.findBookingById(id, input.tenantId))!;
  }

  async findBookingById(id: string, tenantId: string): Promise<TalentBooking | null> {
    const r = await this.db.prepare('SELECT * FROM talent_bookings WHERE id=? AND tenant_id=?').bind(id, tenantId).first<BookingRow>();
    return r ? rowToBooking(r) : null;
  }
}
