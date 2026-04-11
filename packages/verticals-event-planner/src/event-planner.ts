/**
 * EventPlannerRepository — M9
 * T3: all queries scoped to tenantId
 * P9: total_budget_kobo / deposit_kobo / agreed_fee_kobo are integers; guest_count integer
 * AI: L2 cap — aggregate only; P13 no client details
 * FSM: seeded → claimed → licence_verified → active → suspended
 */

import type {
  EventPlannerProfile, PlannedEvent, EventVendor, EventTask,
  EventPlannerFSMState, EventType, EventStatus, VendorType, VendorStatus,
  CreateEventPlannerInput, CreateEventInput, CreateVendorInput, CreateTaskInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; company_name: string; state_event_licence: string | null; cac_rc: string | null; status: string; created_at: number; updated_at: number; }
interface EventRow { id: string; profile_id: string; tenant_id: string; client_phone: string; event_type: string; event_date: number; venue: string | null; guest_count: number; total_budget_kobo: number; deposit_kobo: number; balance_kobo: number; status: string; created_at: number; updated_at: number; }
interface VendorRow { id: string; event_id: string; tenant_id: string; vendor_type: string; vendor_phone: string; vendor_name: string; agreed_fee_kobo: number; deposit_paid_kobo: number; status: string; created_at: number; }
interface TaskRow { id: string; event_id: string; tenant_id: string; task_name: string; due_date: number | null; completed: number; created_at: number; }

function rowToProfile(r: ProfileRow): EventPlannerProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, companyName: r.company_name, stateEventLicence: r.state_event_licence, cacRc: r.cac_rc, status: r.status as EventPlannerFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToEvent(r: EventRow): PlannedEvent { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, clientPhone: r.client_phone, eventType: r.event_type as EventType, eventDate: r.event_date, venue: r.venue, guestCount: r.guest_count, totalBudgetKobo: r.total_budget_kobo, depositKobo: r.deposit_kobo, balanceKobo: r.balance_kobo, status: r.status as EventStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToVendor(r: VendorRow): EventVendor { return { id: r.id, eventId: r.event_id, tenantId: r.tenant_id, vendorType: r.vendor_type as VendorType, vendorPhone: r.vendor_phone, vendorName: r.vendor_name, agreedFeeKobo: r.agreed_fee_kobo, depositPaidKobo: r.deposit_paid_kobo, status: r.status as VendorStatus, createdAt: r.created_at }; }
function rowToTask(r: TaskRow): EventTask { return { id: r.id, eventId: r.event_id, tenantId: r.tenant_id, taskName: r.task_name, dueDate: r.due_date, completed: Boolean(r.completed), createdAt: r.created_at }; }

export class EventPlannerRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateEventPlannerInput): Promise<EventPlannerProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO event_planner_profiles (id,workspace_id,tenant_id,company_name,state_event_licence,cac_rc,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.companyName, input.stateEventLicence ?? null, input.cacRc ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<EventPlannerProfile | null> {
    const r = await this.db.prepare('SELECT * FROM event_planner_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateStatus(id: string, tenantId: string, status: EventPlannerFSMState): Promise<void> {
    await this.db.prepare('UPDATE event_planner_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(status, now(), id, tenantId).run();
  }

  async createEvent(input: CreateEventInput): Promise<PlannedEvent> {
    if (!Number.isInteger(input.totalBudgetKobo) || input.totalBudgetKobo < 0) throw new Error('P9: totalBudgetKobo must be a non-negative integer');
    if (!Number.isInteger(input.guestCount) || input.guestCount < 0) throw new Error('guestCount must be a non-negative integer');
    const depositKobo = input.depositKobo ?? 0;
    const balanceKobo = input.totalBudgetKobo - depositKobo;
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO planned_events (id,profile_id,tenant_id,client_phone,event_type,event_date,venue,guest_count,total_budget_kobo,deposit_kobo,balance_kobo,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.clientPhone, input.eventType, input.eventDate, input.venue ?? null, input.guestCount, input.totalBudgetKobo, depositKobo, balanceKobo, 'enquiry', ts, ts).run();
    return (await this.findEventById(id, input.tenantId))!;
  }

  async findEventById(id: string, tenantId: string): Promise<PlannedEvent | null> {
    const r = await this.db.prepare('SELECT * FROM planned_events WHERE id=? AND tenant_id=?').bind(id, tenantId).first<EventRow>();
    return r ? rowToEvent(r) : null;
  }

  async createVendor(input: CreateVendorInput): Promise<EventVendor> {
    if (!Number.isInteger(input.agreedFeeKobo) || input.agreedFeeKobo < 0) throw new Error('P9: agreedFeeKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO event_vendors (id,event_id,tenant_id,vendor_type,vendor_phone,vendor_name,agreed_fee_kobo,deposit_paid_kobo,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id, input.eventId, input.tenantId, input.vendorType, input.vendorPhone, input.vendorName, input.agreedFeeKobo, input.depositPaidKobo ?? 0, 'booked', ts).run();
    return (await this.findVendorById(id, input.tenantId))!;
  }

  async findVendorById(id: string, tenantId: string): Promise<EventVendor | null> {
    const r = await this.db.prepare('SELECT * FROM event_vendors WHERE id=? AND tenant_id=?').bind(id, tenantId).first<VendorRow>();
    return r ? rowToVendor(r) : null;
  }

  async createTask(input: CreateTaskInput): Promise<EventTask> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO event_tasks (id,event_id,tenant_id,task_name,due_date,completed,created_at) VALUES (?,?,?,?,?,?,?)').bind(id, input.eventId, input.tenantId, input.taskName, input.dueDate ?? null, 0, ts).run();
    return (await this.findTaskById(id, input.tenantId))!;
  }

  async findTaskById(id: string, tenantId: string): Promise<EventTask | null> {
    const r = await this.db.prepare('SELECT * FROM event_tasks WHERE id=? AND tenant_id=?').bind(id, tenantId).first<TaskRow>();
    return r ? rowToTask(r) : null;
  }

  async completeTask(id: string, tenantId: string): Promise<void> {
    await this.db.prepare('UPDATE event_tasks SET completed=1 WHERE id=? AND tenant_id=?').bind(id, tenantId).run();
  }
}
