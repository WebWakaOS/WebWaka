/**
 * Catering Service D1 repository.
 * M9 Commerce P2 — Task V-COMM-EXT-A5
 * Platform Invariants: T3, P9
 * Migration: 0061_vertical_catering.sql
 */

import type {
  CateringProfile, CateringFSMState, CateringSpeciality,
  CreateCateringInput, UpdateCateringInput,
  CateringEvent, CateringEventStatus, CreateCateringEventInput,
  CateringMenu, CreateCateringMenuInput,
  CateringStaff, StaffRole, CreateCateringStaffInput,
} from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface ProfileRow {
  id: string; workspace_id: string; tenant_id: string; business_name: string;
  nafdac_cert: string | null; cac_number: string | null; speciality: string;
  status: string; created_at: number; updated_at: number;
}
interface EventRow {
  id: string; workspace_id: string; tenant_id: string; client_phone: string;
  event_type: string; event_date: number; guest_count: number;
  price_per_head_kobo: number; total_kobo: number; deposit_kobo: number;
  balance_kobo: number; status: string; created_at: number; updated_at: number;
}
interface MenuRow {
  id: string; workspace_id: string; tenant_id: string; menu_name: string;
  description: string | null; cost_per_head_kobo: number; created_at: number;
}
interface StaffRow {
  id: string; workspace_id: string; tenant_id: string; staff_name: string;
  role: string; nafdac_card_number: string | null; created_at: number;
}

const r2p = (r: ProfileRow): CateringProfile => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  businessName: r.business_name, nafdacCert: r.nafdac_cert, cacNumber: r.cac_number,
  speciality: r.speciality as CateringSpeciality, status: r.status as CateringFSMState,
  createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2evt = (r: EventRow): CateringEvent => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  clientPhone: r.client_phone, eventType: r.event_type, eventDate: r.event_date,
  guestCount: r.guest_count, pricePerHeadKobo: r.price_per_head_kobo,
  totalKobo: r.total_kobo, depositKobo: r.deposit_kobo, balanceKobo: r.balance_kobo,
  status: r.status as CateringEventStatus, createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2menu = (r: MenuRow): CateringMenu => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  menuName: r.menu_name, description: r.description,
  costPerHeadKobo: r.cost_per_head_kobo, createdAt: r.created_at,
});
const r2staff = (r: StaffRow): CateringStaff => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  staffName: r.staff_name, role: r.role as StaffRole,
  nafdacCardNumber: r.nafdac_card_number, createdAt: r.created_at,
});

export class CateringRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateCateringInput): Promise<CateringProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO catering_profiles (id, workspace_id, tenant_id, business_name, nafdac_cert, cac_number, speciality, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.businessName,
           input.nafdacCert ?? null, input.cacNumber ?? null,
           input.speciality ?? 'all').run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[catering] Failed to create profile');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<CateringProfile | null> {
    const row = await this.db.prepare(`SELECT * FROM catering_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? r2p(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateCateringInput): Promise<CateringProfile | null> {
    const sets: string[] = []; const vals: unknown[] = [];
    if (input.businessName !== undefined) { sets.push('business_name = ?'); vals.push(input.businessName); }
    if ('nafdacCert' in input) { sets.push('nafdac_cert = ?'); vals.push(input.nafdacCert ?? null); }
    if ('cacNumber' in input) { sets.push('cac_number = ?'); vals.push(input.cacNumber ?? null); }
    if (input.speciality !== undefined) { sets.push('speciality = ?'); vals.push(input.speciality); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    vals.push(id, tenantId);
    await this.db.prepare(`UPDATE catering_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionProfile(id: string, tenantId: string, toStatus: CateringFSMState): Promise<CateringProfile | null> {
    return this.updateProfile(id, tenantId, { status: toStatus });
  }

  async createEvent(input: CreateCateringEventInput): Promise<CateringEvent> {
    const id = input.id ?? crypto.randomUUID();
    for (const [k, v] of [['pricePerHeadKobo', input.pricePerHeadKobo], ['depositKobo', input.depositKobo ?? 0]] as [string, number][]) {
      if (!Number.isInteger(v) || v < 0) throw new Error(`[P9] ${k} must be a non-negative integer (kobo)`);
    }
    const total = input.pricePerHeadKobo * input.guestCount;
    const deposit = input.depositKobo ?? 0;
    const balance = total - deposit;
    await this.db.prepare(
      `INSERT INTO catering_events (id, workspace_id, tenant_id, client_phone, event_type, event_date, guest_count, price_per_head_kobo, total_kobo, deposit_kobo, balance_kobo, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'quoted', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.clientPhone, input.eventType,
           input.eventDate, input.guestCount, input.pricePerHeadKobo, total, deposit, balance).run();
    const e = await this.findEventById(id, input.tenantId);
    if (!e) throw new Error('[catering] Failed to create event');
    return e;
  }

  async findEventById(id: string, tenantId: string): Promise<CateringEvent | null> {
    const row = await this.db.prepare(`SELECT * FROM catering_events WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<EventRow>();
    return row ? r2evt(row) : null;
  }

  async listEvents(workspaceId: string, tenantId: string, status?: CateringEventStatus): Promise<CateringEvent[]> {
    let sql = `SELECT * FROM catering_events WHERE workspace_id = ? AND tenant_id = ?`;
    const binds: unknown[] = [workspaceId, tenantId];
    if (status) { sql += ` AND status = ?`; binds.push(status); }
    sql += ` ORDER BY event_date ASC`;
    const { results } = await this.db.prepare(sql).bind(...binds).all<EventRow>();
    return (results ?? []).map(r2evt);
  }

  async advanceEventStatus(id: string, tenantId: string, status: CateringEventStatus): Promise<CateringEvent | null> {
    await this.db.prepare(`UPDATE catering_events SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findEventById(id, tenantId);
  }

  async createMenu(input: CreateCateringMenuInput): Promise<CateringMenu> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.costPerHeadKobo) || input.costPerHeadKobo < 0) throw new Error('[P9] cost_per_head_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO catering_menus (id, workspace_id, tenant_id, menu_name, description, cost_per_head_kobo, created_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.menuName,
           input.description ?? null, input.costPerHeadKobo).run();
    const m = await this.findMenuById(id, input.tenantId);
    if (!m) throw new Error('[catering] Failed to create menu');
    return m;
  }

  async findMenuById(id: string, tenantId: string): Promise<CateringMenu | null> {
    const row = await this.db.prepare(`SELECT * FROM catering_menus WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<MenuRow>();
    return row ? r2menu(row) : null;
  }

  async listMenus(workspaceId: string, tenantId: string): Promise<CateringMenu[]> {
    const { results } = await this.db.prepare(`SELECT * FROM catering_menus WHERE workspace_id = ? AND tenant_id = ? ORDER BY menu_name ASC`).bind(workspaceId, tenantId).all<MenuRow>();
    return (results ?? []).map(r2menu);
  }

  async createStaff(input: CreateCateringStaffInput): Promise<CateringStaff> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO catering_staff (id, workspace_id, tenant_id, staff_name, role, nafdac_card_number, created_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.staffName, input.role,
           input.nafdacCardNumber ?? null).run();
    const s = await this.findStaffById(id, input.tenantId);
    if (!s) throw new Error('[catering] Failed to create staff');
    return s;
  }

  async findStaffById(id: string, tenantId: string): Promise<CateringStaff | null> {
    const row = await this.db.prepare(`SELECT * FROM catering_staff WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<StaffRow>();
    return row ? r2staff(row) : null;
  }

  async listStaff(workspaceId: string, tenantId: string): Promise<CateringStaff[]> {
    const { results } = await this.db.prepare(`SELECT * FROM catering_staff WHERE workspace_id = ? AND tenant_id = ? ORDER BY staff_name ASC`).bind(workspaceId, tenantId).all<StaffRow>();
    return (results ?? []).map(r2staff);
  }
}
