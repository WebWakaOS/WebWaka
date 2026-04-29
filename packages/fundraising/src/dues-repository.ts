/**
 * @webwaka/fundraising — Dues Collection repository
 *
 * Phase 2: D1 data layer for dues_schedules and dues_payments tables.
 *
 * Platform Invariants:
 *   T3  — every query includes tenant_id predicate
 *   P9  — assertIntegerKobo() called before every INSERT
 *   P10 — ndpr_consented=1 required on recordDuesPayment
 */

import type {
  DuesSchedule,
  DuesPayment,
  CreateDuesScheduleInput,
  RecordDuesPaymentInput,
  MemberDuesStatus,
} from './dues.js';
import { assertIntegerKobo } from './dues.js';

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

// ---------------------------------------------------------------------------
// Row maps (snake_case DB → camelCase domain)
// ---------------------------------------------------------------------------

interface DuesScheduleRow {
  id: string;
  tenant_id: string;
  workspace_id: string;
  group_id: string;
  title: string;
  description: string | null;
  amount_kobo: number;
  period: string;
  currency_code: string;
  start_date: string;
  end_date: string | null;
  status: string;
  created_by: string;
  created_at: number;
  updated_at: number;
}

interface DuesPaymentRow {
  id: string;
  tenant_id: string;
  workspace_id: string;
  schedule_id: string;
  member_user_id: string;
  amount_kobo: number;
  period_label: string;
  paystack_ref: string | null;
  payment_channel: string;
  status: string;
  ndpr_consented: number;
  note: string | null;
  created_at: number;
  confirmed_at: number | null;
}

function mapSchedule(r: DuesScheduleRow): DuesSchedule {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    workspaceId: r.workspace_id,
    groupId: r.group_id,
    title: r.title,
    description: r.description,
    amountKobo: r.amount_kobo,
    period: r.period as DuesSchedule['period'],
    currencyCode: r.currency_code,
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status as DuesSchedule['status'],
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapPayment(r: DuesPaymentRow): DuesPayment {
  return {
    id: r.id,
    tenantId: r.tenant_id,
    workspaceId: r.workspace_id,
    scheduleId: r.schedule_id,
    memberUserId: r.member_user_id,
    amountKobo: r.amount_kobo,
    periodLabel: r.period_label,
    paystackRef: r.paystack_ref,
    paymentChannel: r.payment_channel as DuesPayment['paymentChannel'],
    status: r.status as DuesPayment['status'],
    ndprConsented: r.ndpr_consented === 1,
    note: r.note,
    createdAt: r.created_at,
    confirmedAt: r.confirmed_at,
  };
}

// ---------------------------------------------------------------------------
// Dues Schedule CRUD
// ---------------------------------------------------------------------------

export async function createDuesSchedule(
  db: D1Like,
  input: CreateDuesScheduleInput,
): Promise<DuesSchedule> {
  assertIntegerKobo(input.amountKobo, 'amountKobo');
  const id = generateId('dues_sched');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO dues_schedules
         (id, tenant_id, workspace_id, group_id, title, description, amount_kobo, period,
          currency_code, start_date, end_date, status, created_by, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id,
      input.tenantId,
      input.workspaceId,
      input.groupId,
      input.title,
      input.description ?? null,
      input.amountKobo,
      input.period,
      input.currencyCode ?? 'NGN',
      input.startDate,
      input.endDate ?? null,
      'active',
      input.createdBy,
      ts,
      ts,
    )
    .run();

  const row = await db
    .prepare('SELECT * FROM dues_schedules WHERE id = ? AND tenant_id = ?')
    .bind(id, input.tenantId)
    .first<DuesScheduleRow>();
  if (!row) throw new Error('dues schedule creation failed');
  return mapSchedule(row);
}

export async function getDuesSchedule(
  db: D1Like,
  id: string,
  tenantId: string,
): Promise<DuesSchedule | null> {
  const row = await db
    .prepare('SELECT * FROM dues_schedules WHERE id = ? AND tenant_id = ?')
    .bind(id, tenantId)
    .first<DuesScheduleRow>();
  return row ? mapSchedule(row) : null;
}

export async function listDuesSchedules(
  db: D1Like,
  tenantId: string,
  groupId: string,
  limit = 50,
): Promise<DuesSchedule[]> {
  const { results } = await db
    .prepare(
      'SELECT * FROM dues_schedules WHERE tenant_id = ? AND group_id = ? ORDER BY created_at DESC LIMIT ?',
    )
    .bind(tenantId, groupId, limit)
    .all<DuesScheduleRow>();
  return results.map(mapSchedule);
}

export async function closeDuesSchedule(
  db: D1Like,
  id: string,
  tenantId: string,
): Promise<void> {
  await db
    .prepare(
      'UPDATE dues_schedules SET status = ?, updated_at = ? WHERE id = ? AND tenant_id = ?',
    )
    .bind('closed', now(), id, tenantId)
    .run();
}

// ---------------------------------------------------------------------------
// Dues Payments
// ---------------------------------------------------------------------------

export async function recordDuesPayment(
  db: D1Like,
  input: RecordDuesPaymentInput,
): Promise<DuesPayment> {
  assertIntegerKobo(input.amountKobo, 'amountKobo');
  if (!input.ndprConsented) {
    throw new Error('P10_VIOLATION: ndprConsented must be true for dues payment recording');
  }
  const id = generateId('dues_pay');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO dues_payments
         (id, tenant_id, workspace_id, schedule_id, member_user_id, amount_kobo, period_label,
          paystack_ref, payment_channel, status, ndpr_consented, note, created_at, confirmed_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id,
      input.tenantId,
      input.workspaceId,
      input.scheduleId,
      input.memberUserId,
      input.amountKobo,
      input.periodLabel,
      input.paystackRef ?? null,
      input.paymentChannel ?? 'card',
      'confirmed',
      1,
      input.note ?? null,
      ts,
      ts,
    )
    .run();

  const row = await db
    .prepare('SELECT * FROM dues_payments WHERE id = ? AND tenant_id = ?')
    .bind(id, input.tenantId)
    .first<DuesPaymentRow>();
  if (!row) throw new Error('dues payment creation failed');
  return mapPayment(row);
}

export async function listSchedulePayments(
  db: D1Like,
  scheduleId: string,
  tenantId: string,
  limit = 100,
): Promise<DuesPayment[]> {
  const { results } = await db
    .prepare(
      'SELECT * FROM dues_payments WHERE schedule_id = ? AND tenant_id = ? ORDER BY created_at DESC LIMIT ?',
    )
    .bind(scheduleId, tenantId, limit)
    .all<DuesPaymentRow>();
  return results.map(mapPayment);
}

export async function getMemberDuesStatus(
  db: D1Like,
  scheduleId: string,
  memberUserId: string,
  tenantId: string,
): Promise<MemberDuesStatus> {
  const { results } = await db
    .prepare(
      `SELECT period_label, amount_kobo, confirmed_at
       FROM dues_payments
       WHERE schedule_id = ? AND member_user_id = ? AND tenant_id = ? AND status = 'confirmed'
       ORDER BY created_at DESC`,
    )
    .bind(scheduleId, memberUserId, tenantId)
    .all<{ period_label: string; amount_kobo: number; confirmed_at: number | null }>();

  const paidPeriods = results.map((r) => r.period_label);
  const totalPaidKobo = results.reduce((sum, r) => sum + r.amount_kobo, 0);
  const lastPaymentAt =
    results.length > 0 ? (results[0]?.confirmed_at ?? null) : null;

  return { scheduleId, memberUserId, paidPeriods, totalPaidKobo, lastPaymentAt };
}
