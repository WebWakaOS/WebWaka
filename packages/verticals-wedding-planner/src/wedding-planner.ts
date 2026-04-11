/**
 * WeddingPlannerRepository — M12
 * T3: all queries scoped to tenantId
 * P9: total_budget_kobo / deposit_kobo / agreed_fee_kobo are integers; guest_count integer
 * AI: L2 cap — aggregate pipeline; P13 no couple PII
 * FSM: seeded → claimed → cac_verified → active → suspended
 */

import type {
  WeddingPlannerProfile, WeddingEvent, WeddingVendor, WeddingTask,
  WeddingPlannerFSMState, WeddingStyle, WeddingStatus, WeddingVendorType, TaskCategory,
  CreateWeddingPlannerInput, CreateWeddingEventInput, CreateWeddingVendorInput, CreateWeddingTaskInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function uuid() { return crypto.randomUUID(); }
function now() { return Math.floor(Date.now() / 1000); }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; company_name: string; cac_rc: string | null; celebrant_cert: string | null; status: string; created_at: number; updated_at: number; }
interface EventRow { id: string; profile_id: string; tenant_id: string; event_date: number; venue: string | null; guest_count: number; total_budget_kobo: number; deposit_kobo: number; balance_kobo: number; style: string; status: string; created_at: number; updated_at: number; }
interface VendorRow { id: string; event_id: string; tenant_id: string; vendor_type: string; vendor_phone: string; agreed_fee_kobo: number; deposit_paid_kobo: number; status: string; created_at: number; }
interface TaskRow { id: string; event_id: string; tenant_id: string; task_name: string; category: string; due_date: number | null; completed: number; created_at: number; }

function rowToProfile(r: ProfileRow): WeddingPlannerProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, companyName: r.company_name, cacRc: r.cac_rc, celebrantCert: r.celebrant_cert, status: r.status as WeddingPlannerFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToEvent(r: EventRow): WeddingEvent { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, eventDate: r.event_date, venue: r.venue, guestCount: r.guest_count, totalBudgetKobo: r.total_budget_kobo, depositKobo: r.deposit_kobo, balanceKobo: r.balance_kobo, style: r.style as WeddingStyle, status: r.status as WeddingStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rowToVendor(r: VendorRow): WeddingVendor { return { id: r.id, eventId: r.event_id, tenantId: r.tenant_id, vendorType: r.vendor_type as WeddingVendorType, vendorPhone: r.vendor_phone, agreedFeeKobo: r.agreed_fee_kobo, depositPaidKobo: r.deposit_paid_kobo, status: r.status, createdAt: r.created_at }; }
function rowToTask(r: TaskRow): WeddingTask { return { id: r.id, eventId: r.event_id, tenantId: r.tenant_id, taskName: r.task_name, category: r.category as TaskCategory, dueDate: r.due_date, completed: Boolean(r.completed), createdAt: r.created_at }; }

export class WeddingPlannerRepository {
  constructor(private db: D1Like) {}

  async createProfile(input: CreateWeddingPlannerInput): Promise<WeddingPlannerProfile> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO wedding_planner_profiles (id,workspace_id,tenant_id,company_name,cac_rc,celebrant_cert,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.workspaceId, input.tenantId, input.companyName, input.cacRc ?? null, input.celebrantCert ?? null, 'seeded', ts, ts).run();
    return (await this.findProfileById(id, input.tenantId))!;
  }

  async findProfileById(id: string, tenantId: string): Promise<WeddingPlannerProfile | null> {
    const r = await this.db.prepare('SELECT * FROM wedding_planner_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<ProfileRow>();
    return r ? rowToProfile(r) : null;
  }

  async updateStatus(id: string, tenantId: string, status: WeddingPlannerFSMState): Promise<void> {
    await this.db.prepare('UPDATE wedding_planner_profiles SET status=?,updated_at=? WHERE id=? AND tenant_id=?').bind(status, now(), id, tenantId).run();
  }

  async createEvent(input: CreateWeddingEventInput): Promise<WeddingEvent> {
    if (!Number.isInteger(input.totalBudgetKobo) || input.totalBudgetKobo < 0) throw new Error('P9: totalBudgetKobo must be a non-negative integer');
    if (!Number.isInteger(input.guestCount) || input.guestCount < 0) throw new Error('guestCount must be a non-negative integer');
    const depositKobo = input.depositKobo ?? 0;
    const balanceKobo = input.totalBudgetKobo - depositKobo;
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO wedding_events (id,profile_id,tenant_id,event_date,venue,guest_count,total_budget_kobo,deposit_kobo,balance_kobo,style,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, input.profileId, input.tenantId, input.eventDate, input.venue ?? null, input.guestCount, input.totalBudgetKobo, depositKobo, balanceKobo, input.style ?? 'church', 'enquiry', ts, ts).run();
    return (await this.findEventById(id, input.tenantId))!;
  }

  async findEventById(id: string, tenantId: string): Promise<WeddingEvent | null> {
    const r = await this.db.prepare('SELECT * FROM wedding_events WHERE id=? AND tenant_id=?').bind(id, tenantId).first<EventRow>();
    return r ? rowToEvent(r) : null;
  }

  async createVendor(input: CreateWeddingVendorInput): Promise<WeddingVendor> {
    if (!Number.isInteger(input.agreedFeeKobo) || input.agreedFeeKobo < 0) throw new Error('P9: agreedFeeKobo must be a non-negative integer');
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO wedding_vendors (id,event_id,tenant_id,vendor_type,vendor_phone,agreed_fee_kobo,deposit_paid_kobo,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id, input.eventId, input.tenantId, input.vendorType, input.vendorPhone, input.agreedFeeKobo, input.depositPaidKobo ?? 0, 'booked', ts).run();
    return (await this.findVendorById(id, input.tenantId))!;
  }

  async findVendorById(id: string, tenantId: string): Promise<WeddingVendor | null> {
    const r = await this.db.prepare('SELECT * FROM wedding_vendors WHERE id=? AND tenant_id=?').bind(id, tenantId).first<VendorRow>();
    return r ? rowToVendor(r) : null;
  }

  async createTask(input: CreateWeddingTaskInput): Promise<WeddingTask> {
    const id = input.id ?? uuid(); const ts = now();
    await this.db.prepare('INSERT INTO wedding_tasks (id,event_id,tenant_id,task_name,category,due_date,completed,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, input.eventId, input.tenantId, input.taskName, input.category ?? 'logistics', input.dueDate ?? null, 0, ts).run();
    return (await this.findTaskById(id, input.tenantId))!;
  }

  async findTaskById(id: string, tenantId: string): Promise<WeddingTask | null> {
    const r = await this.db.prepare('SELECT * FROM wedding_tasks WHERE id=? AND tenant_id=?').bind(id, tenantId).first<TaskRow>();
    return r ? rowToTask(r) : null;
  }

  async completeTask(id: string, tenantId: string): Promise<void> {
    await this.db.prepare('UPDATE wedding_tasks SET completed=1 WHERE id=? AND tenant_id=?').bind(id, tenantId).run();
  }
}
