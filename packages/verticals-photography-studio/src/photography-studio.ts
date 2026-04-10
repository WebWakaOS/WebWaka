/**
 * PhotographyStudioRepository — M10
 * T3: all queries scoped to tenantId
 * P9: all monetary in kobo integers
 * AI: L2 cap — aggregate only; P13 no client details
 * FSM: seeded → claimed → cac_verified → active → suspended
 */

import type {
  PhotographyStudioProfile, PhotoBooking, PhotoEquipment,
  PhotographyStudioFSMState, ShootType, BookingStatus, EquipmentCategory, EquipmentCondition,
  CreatePhotographyStudioInput, CreateBookingInput, CreateEquipmentInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; studio_name: string; apcon_registered: number; nuj_affiliation: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface BookingRow { id: string; profile_id: string; tenant_id: string; client_ref_id: string; shoot_type: string; shoot_date: number; location: string | null; package_fee_kobo: number; deposit_kobo: number; balance_kobo: number; deliverable_ref: string | null; status: string; created_at: number; updated_at: number; }
interface EquipmentRow { id: string; profile_id: string; tenant_id: string; item_name: string; category: string; purchase_cost_kobo: number; condition: string; created_at: number; }

function rowToProfile(r: ProfileRow): PhotographyStudioProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, studioName: r.studio_name, apconRegistered: Boolean(r.apcon_registered), nujAffiliation: r.nuj_affiliation, cacRc: r.cac_rc, status: r.status as PhotographyStudioFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToBooking(r: BookingRow): PhotoBooking { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, clientRefId: r.client_ref_id, shootType: r.shoot_type as ShootType, shootDate: r.shoot_date, location: r.location, packageFeeKobo: r.package_fee_kobo, depositKobo: r.deposit_kobo, balanceKobo: r.balance_kobo, deliverableRef: r.deliverable_ref, status: r.status as BookingStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToEquipment(r: EquipmentRow): PhotoEquipment { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, itemName: r.item_name, category: r.category as EquipmentCategory, purchaseCostKobo: r.purchase_cost_kobo, condition: r.condition as EquipmentCondition, createdAt: r.created_at }; }

export class PhotographyStudioRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreatePhotographyStudioInput): Promise<PhotographyStudioProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO photography_studio_profiles (id,workspace_id,tenant_id,studio_name,apcon_registered,nuj_affiliation,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.studioName, input.apconRegistered ? 1 : 0, input.nujAffiliation ?? null, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<PhotographyStudioProfile | null> {
    const r = await this.db.prepare('SELECT * FROM photography_studio_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateStatus(id: string, tenantId: string, status: PhotographyStudioFSMState): Promise<void> {
    await this.db.prepare('UPDATE photography_studio_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(status, now(), id, tenantId).run();
  }

  async createBooking(input: CreateBookingInput): Promise<PhotoBooking> {
    if (!Number.isInteger(input.packageFeeKobo) || input.packageFeeKobo < 0) throw new Error('P9: packageFeeKobo must be a non-negative integer');
    const depositKobo = input.depositKobo ?? 0;
    const balanceKobo = input.packageFeeKobo - depositKobo;
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO photo_bookings (id,profile_id,tenant_id,client_ref_id,shoot_type,shoot_date,location,package_fee_kobo,deposit_kobo,balance_kobo,deliverable_ref,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.clientRefId, input.shootType, input.shootDate, input.location ?? null, input.packageFeeKobo, depositKobo, balanceKobo, input.deliverableRef ?? null, 'enquiry', ts, ts).run();
    return (await this.findBookingById(id, input.tenantId))!;
  }

  async findBookingById(id: string, tenantId: string): Promise<PhotoBooking | null> {
    const r = await this.db.prepare('SELECT * FROM photo_bookings WHERE id=? AND tenant_id=?').bind(id, tenantId).first<BookingRow>();
    return r ? rowToBooking(r) : null;
  }

  async createEquipment(input: CreateEquipmentInput): Promise<PhotoEquipment> {
    if (!Number.isInteger(input.purchaseCostKobo) || input.purchaseCostKobo < 0) throw new Error('P9: purchaseCostKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO photo_equipment (id,profile_id,tenant_id,item_name,category,purchase_cost_kobo,condition,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.itemName, input.category, input.purchaseCostKobo, input.condition ?? 'good', ts).run();
    return (await this.findEquipmentById(id, input.tenantId))!;
  }

  async findEquipmentById(id: string, tenantId: string): Promise<PhotoEquipment | null> {
    const r = await this.db.prepare('SELECT * FROM photo_equipment WHERE id=? AND tenant_id=?').bind(id, tenantId).first<EquipmentRow>();
    return r ? rowToEquipment(r) : null;
  }
}
