/**
 * MusicStudioRepository — M10
 * T3: all queries scoped to tenantId
 * P9: all monetary in kobo integers; hours/bpm as integers
 * AI: L2 cap — utilisation aggregate only; P13 no royalty/deal data
 * FSM: seeded → claimed → coson_registered → active → suspended
 */

import type {
  MusicStudioProfile, StudioSession, StudioBeat, StudioEquipment,
  MusicStudioFSMState, StudioType, LicenseType, SessionStatus, EquipmentCondition,
  CreateMusicStudioInput, CreateSessionInput, CreateBeatInput, CreateEquipmentInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; studio_name: string; coson_membership: string | null; mcsn_registration: string | null; cac_rc: string | null; studio_type: string; status: string; created_at: number; updated_at: number; }
interface SessionRow { id: string; profile_id: string; tenant_id: string; artiste_ref_id: string; engineer_ref_id: string | null; booking_date: number; hours: number; session_rate_kobo: number; total_kobo: number; status: string; created_at: number; updated_at: number; }
interface BeatRow { id: string; profile_id: string; tenant_id: string; beat_name: string; producer_ref_id: string; genre: string; bpm: number; license_type: string; license_fee_kobo: number; streams_reference: string | null; created_at: number; }
interface EquipmentRow { id: string; profile_id: string; tenant_id: string; equipment_name: string; brand: string | null; purchase_cost_kobo: number; condition: string; created_at: number; }

function rowToProfile(r: ProfileRow): MusicStudioProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, studioName: r.studio_name, cosonMembership: r.coson_membership, mcsnRegistration: r.mcsn_registration, cacRc: r.cac_rc, studioType: r.studio_type as StudioType, status: r.status as MusicStudioFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToSession(r: SessionRow): StudioSession { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, artisteRefId: r.artiste_ref_id, engineerRefId: r.engineer_ref_id, bookingDate: r.booking_date, hours: r.hours, sessionRateKobo: r.session_rate_kobo, totalKobo: r.total_kobo, status: r.status as SessionStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToBeat(r: BeatRow): StudioBeat { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, beatName: r.beat_name, producerRefId: r.producer_ref_id, genre: r.genre, bpm: r.bpm, licenseType: r.license_type as LicenseType, licenseFeeKobo: r.license_fee_kobo, streamsReference: r.streams_reference, createdAt: r.created_at }; }
function rowToEquipment(r: EquipmentRow): StudioEquipment { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, equipmentName: r.equipment_name, brand: r.brand, purchaseCostKobo: r.purchase_cost_kobo, condition: r.condition as EquipmentCondition, createdAt: r.created_at }; }

export class MusicStudioRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateMusicStudioInput): Promise<MusicStudioProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO music_studio_profiles (id,workspace_id,tenant_id,studio_name,coson_membership,mcsn_registration,cac_rc,studio_type,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.studioName, input.cosonMembership ?? null, input.mcsnRegistration ?? null, input.cacRc ?? null, input.studioType ?? 'all', 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<MusicStudioProfile | null> {
    const r = await this.db.prepare('SELECT * FROM music_studio_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateStatus(id: string, tenantId: string, status: MusicStudioFSMState): Promise<void> {
    await this.db.prepare('UPDATE music_studio_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(status, now(), id, tenantId).run();
  }

  async createSession(input: CreateSessionInput): Promise<StudioSession> {
    if (!Number.isInteger(input.hours) || input.hours <= 0) throw new Error('hours must be a positive integer');
    if (!Number.isInteger(input.sessionRateKobo) || input.sessionRateKobo < 0) throw new Error('P9: sessionRateKobo must be a non-negative integer');
    if (!Number.isInteger(input.totalKobo) || input.totalKobo < 0) throw new Error('P9: totalKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO studio_sessions (id,profile_id,tenant_id,artiste_ref_id,engineer_ref_id,booking_date,hours,session_rate_kobo,total_kobo,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.artisteRefId, input.engineerRefId ?? null, input.bookingDate, input.hours, input.sessionRateKobo, input.totalKobo, 'booked', ts, ts).run();
    return (await this.findSessionById(id, input.tenantId))!;
  }

  async findSessionById(id: string, tenantId: string): Promise<StudioSession | null> {
    const r = await this.db.prepare('SELECT * FROM studio_sessions WHERE id=? AND tenant_id=?').bind(id, tenantId).first<SessionRow>();
    return r ? rowToSession(r) : null;
  }

  async createBeat(input: CreateBeatInput): Promise<StudioBeat> {
    if (!Number.isInteger(input.bpm) || input.bpm <= 0) throw new Error('bpm must be a positive integer');
    if (!Number.isInteger(input.licenseFeeKobo) || input.licenseFeeKobo < 0) throw new Error('P9: licenseFeeKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO studio_beats (id,profile_id,tenant_id,beat_name,producer_ref_id,genre,bpm,license_type,license_fee_kobo,streams_reference,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.beatName, input.producerRefId, input.genre, input.bpm, input.licenseType, input.licenseFeeKobo, input.streamsReference ?? null, ts).run();
    return (await this.findBeatById(id, input.tenantId))!;
  }

  async findBeatById(id: string, tenantId: string): Promise<StudioBeat | null> {
    const r = await this.db.prepare('SELECT * FROM studio_beats WHERE id=? AND tenant_id=?').bind(id, tenantId).first<BeatRow>();
    return r ? rowToBeat(r) : null;
  }

  async createEquipment(input: CreateEquipmentInput): Promise<StudioEquipment> {
    if (!Number.isInteger(input.purchaseCostKobo) || input.purchaseCostKobo < 0) throw new Error('P9: purchaseCostKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO studio_equipment (id,profile_id,tenant_id,equipment_name,brand,purchase_cost_kobo,condition,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.equipmentName, input.brand ?? null, input.purchaseCostKobo, input.condition ?? 'good', ts).run();
    return (await this.findEquipmentById(id, input.tenantId))!;
  }

  async findEquipmentById(id: string, tenantId: string): Promise<StudioEquipment | null> {
    const r = await this.db.prepare('SELECT * FROM studio_equipment WHERE id=? AND tenant_id=?').bind(id, tenantId).first<EquipmentRow>();
    return r ? rowToEquipment(r) : null;
  }
}
