/**
 * Beauty Salon / Barber Shop D1 repository.
 * M9 Commerce P2 — Task V-COMM-EXT-A3
 * Platform Invariants: T3, P9
 * Migration: 0059_vertical_beauty_salon.sql
 */

import type {
  BeautySalonProfile, BeautySalonFSMState, SalonType,
  CreateBeautySalonInput, UpdateBeautySalonInput,
  SalonService, CreateSalonServiceInput,
  SalonAppointment, AppointmentStatus, CreateSalonAppointmentInput,
  SalonProduct, CreateSalonProductInput,
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
  id: string; workspace_id: string; tenant_id: string; salon_name: string;
  salon_type: string; nasc_number: string | null; state_permit_number: string | null;
  state: string; status: string; created_at: number; updated_at: number;
}
interface ServiceRow {
  id: string; workspace_id: string; tenant_id: string; service_name: string;
  duration_minutes: number; price_kobo: number; staff_id: string | null; created_at: number;
}
interface AppointmentRow {
  id: string; workspace_id: string; tenant_id: string; client_phone: string;
  service_id: string | null; staff_id: string | null; appointment_time: number;
  deposit_kobo: number; status: string; created_at: number; updated_at: number;
}
interface ProductRow {
  id: string; workspace_id: string; tenant_id: string; product_name: string;
  brand: string | null; unit_price_kobo: number; quantity_in_stock: number; created_at: number;
}

const r2p = (r: ProfileRow): BeautySalonProfile => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  salonName: r.salon_name, salonType: r.salon_type as SalonType,
  nascNumber: r.nasc_number, statePermitNumber: r.state_permit_number, state: r.state,
  status: r.status as BeautySalonFSMState, createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2svc = (r: ServiceRow): SalonService => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  serviceName: r.service_name, durationMinutes: r.duration_minutes,
  priceKobo: r.price_kobo, staffId: r.staff_id, createdAt: r.created_at,
});
const r2apt = (r: AppointmentRow): SalonAppointment => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  clientPhone: r.client_phone, serviceId: r.service_id, staffId: r.staff_id,
  appointmentTime: r.appointment_time, depositKobo: r.deposit_kobo,
  status: r.status as AppointmentStatus, createdAt: r.created_at, updatedAt: r.updated_at,
});
const r2prod = (r: ProductRow): SalonProduct => ({
  id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
  productName: r.product_name, brand: r.brand, unitPriceKobo: r.unit_price_kobo,
  quantityInStock: r.quantity_in_stock, createdAt: r.created_at,
});

export class BeautySalonRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateBeautySalonInput): Promise<BeautySalonProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO beauty_salon_profiles
         (id, workspace_id, tenant_id, salon_name, salon_type, nasc_number,
          state_permit_number, state, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.salonName, input.salonType,
           input.nascNumber ?? null, input.statePermitNumber ?? null, input.state).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[beauty-salon] Failed to create profile');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<BeautySalonProfile | null> {
    const row = await this.db.prepare(`SELECT * FROM beauty_salon_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? r2p(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateBeautySalonInput): Promise<BeautySalonProfile | null> {
    const sets: string[] = []; const vals: unknown[] = [];
    if (input.salonName !== undefined) { sets.push('salon_name = ?'); vals.push(input.salonName); }
    if (input.salonType !== undefined) { sets.push('salon_type = ?'); vals.push(input.salonType); }
    if ('nascNumber' in input) { sets.push('nasc_number = ?'); vals.push(input.nascNumber ?? null); }
    if ('statePermitNumber' in input) { sets.push('state_permit_number = ?'); vals.push(input.statePermitNumber ?? null); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    vals.push(id, tenantId);
    await this.db.prepare(`UPDATE beauty_salon_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionProfile(id: string, tenantId: string, toStatus: BeautySalonFSMState): Promise<BeautySalonProfile | null> {
    return this.updateProfile(id, tenantId, { status: toStatus });
  }

  async createService(input: CreateSalonServiceInput): Promise<SalonService> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.priceKobo) || input.priceKobo < 0) throw new Error('[P9] price_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO salon_services (id, workspace_id, tenant_id, service_name, duration_minutes, price_kobo, staff_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.serviceName, input.durationMinutes,
           input.priceKobo, input.staffId ?? null).run();
    const s = await this.findServiceById(id, input.tenantId);
    if (!s) throw new Error('[beauty-salon] Failed to create service');
    return s;
  }

  async findServiceById(id: string, tenantId: string): Promise<SalonService | null> {
    const row = await this.db.prepare(`SELECT * FROM salon_services WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ServiceRow>();
    return row ? r2svc(row) : null;
  }

  async listServices(workspaceId: string, tenantId: string): Promise<SalonService[]> {
    const { results } = await this.db.prepare(`SELECT * FROM salon_services WHERE workspace_id = ? AND tenant_id = ? ORDER BY service_name ASC`).bind(workspaceId, tenantId).all<ServiceRow>();
    return (results ?? []).map(r2svc);
  }

  async createAppointment(input: CreateSalonAppointmentInput): Promise<SalonAppointment> {
    const id = input.id ?? crypto.randomUUID();
    const deposit = input.depositKobo ?? 0;
    if (!Number.isInteger(deposit) || deposit < 0) throw new Error('[P9] deposit_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO salon_appointments (id, workspace_id, tenant_id, client_phone, service_id, staff_id, appointment_time, deposit_kobo, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'booked', unixepoch(), unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.clientPhone,
           input.serviceId ?? null, input.staffId ?? null, input.appointmentTime, deposit).run();
    const a = await this.findAppointmentById(id, input.tenantId);
    if (!a) throw new Error('[beauty-salon] Failed to create appointment');
    return a;
  }

  async findAppointmentById(id: string, tenantId: string): Promise<SalonAppointment | null> {
    const row = await this.db.prepare(`SELECT * FROM salon_appointments WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<AppointmentRow>();
    return row ? r2apt(row) : null;
  }

  async listAppointments(workspaceId: string, tenantId: string, status?: AppointmentStatus): Promise<SalonAppointment[]> {
    let sql = `SELECT * FROM salon_appointments WHERE workspace_id = ? AND tenant_id = ?`;
    const binds: unknown[] = [workspaceId, tenantId];
    if (status) { sql += ` AND status = ?`; binds.push(status); }
    sql += ` ORDER BY appointment_time ASC`;
    const { results } = await this.db.prepare(sql).bind(...binds).all<AppointmentRow>();
    return (results ?? []).map(r2apt);
  }

  async updateAppointmentStatus(id: string, tenantId: string, status: AppointmentStatus): Promise<SalonAppointment | null> {
    await this.db.prepare(`UPDATE salon_appointments SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findAppointmentById(id, tenantId);
  }

  async createProduct(input: CreateSalonProductInput): Promise<SalonProduct> {
    const id = input.id ?? crypto.randomUUID();
    if (!Number.isInteger(input.unitPriceKobo) || input.unitPriceKobo < 0) throw new Error('[P9] unit_price_kobo must be non-negative integer');
    await this.db.prepare(
      `INSERT INTO salon_products (id, workspace_id, tenant_id, product_name, brand, unit_price_kobo, quantity_in_stock, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.productName, input.brand ?? null,
           input.unitPriceKobo, input.quantityInStock ?? 0).run();
    const p = await this.findProductById(id, input.tenantId);
    if (!p) throw new Error('[beauty-salon] Failed to create product');
    return p;
  }

  async findProductById(id: string, tenantId: string): Promise<SalonProduct | null> {
    const row = await this.db.prepare(`SELECT * FROM salon_products WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProductRow>();
    return row ? r2prod(row) : null;
  }
}
