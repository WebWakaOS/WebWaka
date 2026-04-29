/**
 * @webwaka/fundraising — Dues Collection types
 *
 * Phase 2: FR-VM-15 — Dues collection (group-linked, recurring schedule, member dues status)
 *
 * Platform Invariants:
 *   T3  — tenant_id on all records
 *   P9  — amount_kobo is INTEGER (never float); assertIntegerKobo() enforced at repository layer
 *   P4  — dues fields in dues_* tables; core groups table untouched
 *   P10 — ndpr_consented required on every dues_payments record
 */

export type DuesPeriod = 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type DuesScheduleStatus = 'active' | 'paused' | 'closed';
export type DuesPaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';
export type DuesPaymentChannel = 'card' | 'bank_transfer' | 'ussd' | 'mobile_money' | 'manual';

// ---------------------------------------------------------------------------
// Dues Schedule — group-level recurring dues definition
// DB table: dues_schedules
// ---------------------------------------------------------------------------

export interface DuesSchedule {
  id: string;
  tenantId: string;
  workspaceId: string;
  groupId: string;
  title: string;
  description: string | null;
  amountKobo: number;
  period: DuesPeriod;
  currencyCode: string;
  startDate: string;
  endDate: string | null;
  status: DuesScheduleStatus;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateDuesScheduleInput {
  tenantId: string;
  workspaceId: string;
  groupId: string;
  title: string;
  description?: string;
  amountKobo: number;
  period: DuesPeriod;
  currencyCode?: string;
  startDate: string;
  endDate?: string;
  createdBy: string;
}

// ---------------------------------------------------------------------------
// Dues Payment — per-member payment record for a dues period
// DB table: dues_payments
// ---------------------------------------------------------------------------

export interface DuesPayment {
  id: string;
  tenantId: string;
  workspaceId: string;
  scheduleId: string;
  memberUserId: string;
  amountKobo: number;
  periodLabel: string;
  paystackRef: string | null;
  paymentChannel: DuesPaymentChannel;
  status: DuesPaymentStatus;
  ndprConsented: boolean;
  note: string | null;
  createdAt: number;
  confirmedAt: number | null;
}

export interface RecordDuesPaymentInput {
  tenantId: string;
  workspaceId: string;
  scheduleId: string;
  memberUserId: string;
  amountKobo: number;
  periodLabel: string;
  paystackRef?: string;
  paymentChannel?: DuesPaymentChannel;
  ndprConsented: boolean;
  note?: string;
}

// ---------------------------------------------------------------------------
// Member Dues Status — summary per member for a schedule
// ---------------------------------------------------------------------------

export interface MemberDuesStatus {
  scheduleId: string;
  memberUserId: string;
  paidPeriods: string[];
  totalPaidKobo: number;
  lastPaymentAt: number | null;
}

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

export function assertIntegerKobo(amount: number, field = 'amount_kobo'): void {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(`P9_VIOLATION: ${field} must be a positive integer (got ${amount})`);
  }
}
