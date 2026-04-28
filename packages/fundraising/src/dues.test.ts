/**
 * @webwaka/fundraising — Dues Collection tests (Phase 2, T001)
 * 12 tests covering: schedule create → list → pay → status → close lifecycle.
 */

import { describe, it, expect } from 'vitest';
import {
  createDuesSchedule,
  getDuesSchedule,
  listDuesSchedules,
  recordDuesPayment,
  listSchedulePayments,
  getMemberDuesStatus,
  closeDuesSchedule,
} from './dues-repository.js';
import { assertIntegerKobo } from './dues.js';

// ── In-memory mock DB ──────────────────────────────────────────────────────

type Row = Record<string, unknown>;

function makeMockDb() {
  const schedules: Row[] = [];
  const payments: Row[] = [];

  return {
    _schedules: schedules,
    _payments: payments,

    prepare(sql: string) {
      const lsql = sql.trim().toLowerCase();

      return {
        bind(...args: unknown[]) {
          return {
            async run() {
              if (lsql.startsWith('insert into dues_schedules')) {
                const row: Row = {
                  id: args[0], tenant_id: args[1], workspace_id: args[2], group_id: args[3],
                  title: args[4], description: args[5], amount_kobo: args[6], period: args[7],
                  currency_code: args[8], start_date: args[9], end_date: args[10], status: args[11],
                  created_by: args[12], created_at: args[13], updated_at: args[14],
                };
                schedules.push(row);
              } else if (lsql.startsWith('insert into dues_payments')) {
                const row: Row = {
                  id: args[0], tenant_id: args[1], workspace_id: args[2], schedule_id: args[3],
                  member_user_id: args[4], amount_kobo: args[5], period_label: args[6],
                  paystack_ref: args[7], payment_channel: args[8], status: args[9],
                  ndpr_consented: args[10], note: args[11], created_at: args[12], confirmed_at: args[13],
                };
                payments.push(row);
              } else if (lsql.startsWith('update dues_schedules')) {
                const id = args[2], tenantId = args[3];
                const s = schedules.find(r => r.id === id && r.tenant_id === tenantId);
                if (s) { s.status = args[0]; s.updated_at = args[1]; }
              }
              return { success: true };
            },
            async first<T>(): Promise<T | null> {
              if (lsql.startsWith('select * from dues_schedules')) {
                const [id, tenantId] = args as [string, string];
                return (schedules.find(r => r.id === id && r.tenant_id === tenantId) ?? null) as T | null;
              }
              if (lsql.startsWith('select * from dues_payments') && lsql.includes('where id')) {
                const [id, tenantId] = args as [string, string];
                return (payments.find(r => r.id === id && r.tenant_id === tenantId) ?? null) as T | null;
              }
              if (lsql.includes('period_label') && lsql.includes('amount_kobo')) {
                const [scheduleId, memberUserId, tenantId] = args as [string, string, string];
                const memberPays = payments.filter(
                  r => r.schedule_id === scheduleId && r.member_user_id === memberUserId && r.tenant_id === tenantId && r.status === 'confirmed'
                );
                if (lsql.includes('select period_label')) {
                  return null as T | null;
                }
                return null as T | null;
              }
              return null as T | null;
            },
            async all<T>(): Promise<{ results: T[] }> {
              if (lsql.includes('from dues_schedules') && lsql.includes('group_id')) {
                const [tenantId, groupId] = args as [string, string];
                const results = schedules.filter(r => r.tenant_id === tenantId && r.group_id === groupId);
                return { results: results as T[] };
              }
              if (lsql.includes('from dues_payments') && lsql.includes('period_label')) {
                const [scheduleId, memberUserId, tenantId] = args as [string, string, string];
                const results = payments.filter(
                  r => r.schedule_id === scheduleId && r.member_user_id === memberUserId && r.tenant_id === tenantId && r.status === 'confirmed'
                );
                return { results: results as T[] };
              }
              if (lsql.includes('from dues_payments') && lsql.includes('schedule_id')) {
                const [scheduleId, tenantId] = args as [string, string];
                const results = payments.filter(r => r.schedule_id === scheduleId && r.tenant_id === tenantId);
                return { results: results as T[] };
              }
              return { results: [] };
            },
          };
        },
        async first<T>(): Promise<T | null> { return null as T | null; },
        async all<T>(): Promise<{ results: T[] }> { return { results: [] }; },
      };
    },
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

const TENANT = 'ten_test';
const WS = 'ws_test';
const GROUP = 'grp_test';

describe('@webwaka/fundraising — Dues Collection', () => {

  describe('assertIntegerKobo guard', () => {
    it('D01 — passes for positive integer', () => {
      expect(() => assertIntegerKobo(100_000)).not.toThrow();
    });
    it('D02 — throws for float amount', () => {
      expect(() => assertIntegerKobo(100.5)).toThrow('P9_VIOLATION');
    });
    it('D03 — throws for zero', () => {
      expect(() => assertIntegerKobo(0)).toThrow('P9_VIOLATION');
    });
    it('D04 — throws for negative', () => {
      expect(() => assertIntegerKobo(-1000)).toThrow('P9_VIOLATION');
    });
  });

  describe('createDuesSchedule', () => {
    it('D05 — creates schedule with required fields', async () => {
      const db = makeMockDb();
      const sched = await createDuesSchedule(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        title: 'Monthly Dues', amountKobo: 500_000, period: 'monthly',
        startDate: '2026-01-01', createdBy: 'user_admin',
      });
      expect(sched.tenantId).toBe(TENANT);
      expect(sched.amountKobo).toBe(500_000);
      expect(sched.period).toBe('monthly');
      expect(sched.status).toBe('active');
    });

    it('D06 — rejects float amountKobo (P9)', async () => {
      const db = makeMockDb();
      await expect(createDuesSchedule(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        title: 'Bad', amountKobo: 5.5, period: 'monthly',
        startDate: '2026-01-01', createdBy: 'user_admin',
      })).rejects.toThrow('P9_VIOLATION');
    });
  });

  describe('listDuesSchedules', () => {
    it('D07 — lists schedules for group', async () => {
      const db = makeMockDb();
      await createDuesSchedule(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        title: 'Annual Levy', amountKobo: 2_000_000, period: 'annual',
        startDate: '2026-01-01', createdBy: 'user_admin',
      });
      const list = await listDuesSchedules(db as any, TENANT, GROUP);
      expect(list).toHaveLength(1);
      expect(list[0]?.title).toBe('Annual Levy');
    });
  });

  describe('recordDuesPayment', () => {
    it('D08 — records payment with ndprConsented=true', async () => {
      const db = makeMockDb();
      const sched = await createDuesSchedule(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        title: 'Q1 Dues', amountKobo: 250_000, period: 'quarterly',
        startDate: '2026-01-01', createdBy: 'user_admin',
      });
      const payment = await recordDuesPayment(db as any, {
        tenantId: TENANT, workspaceId: WS, scheduleId: sched.id,
        memberUserId: 'user_member1', amountKobo: 250_000,
        periodLabel: '2026-Q1', ndprConsented: true,
      });
      expect(payment.status).toBe('confirmed');
      expect(payment.ndprConsented).toBe(true);
      expect(payment.amountKobo).toBe(250_000);
    });

    it('D09 — rejects payment without NDPR consent (P10)', async () => {
      const db = makeMockDb();
      const sched = await createDuesSchedule(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        title: 'Dues', amountKobo: 100_000, period: 'monthly',
        startDate: '2026-01-01', createdBy: 'user_admin',
      });
      await expect(recordDuesPayment(db as any, {
        tenantId: TENANT, workspaceId: WS, scheduleId: sched.id,
        memberUserId: 'user_nonconsent', amountKobo: 100_000,
        periodLabel: '2026-05', ndprConsented: false,
      })).rejects.toThrow('P10_VIOLATION');
    });

    it('D10 — rejects float payment amount (P9)', async () => {
      const db = makeMockDb();
      const sched = await createDuesSchedule(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        title: 'Dues', amountKobo: 100_000, period: 'monthly',
        startDate: '2026-01-01', createdBy: 'user_admin',
      });
      await expect(recordDuesPayment(db as any, {
        tenantId: TENANT, workspaceId: WS, scheduleId: sched.id,
        memberUserId: 'user_float', amountKobo: 100.99,
        periodLabel: '2026-05', ndprConsented: true,
      })).rejects.toThrow('P9_VIOLATION');
    });
  });

  describe('getMemberDuesStatus', () => {
    it('D11 — returns paid periods and total for member', async () => {
      const db = makeMockDb();
      const sched = await createDuesSchedule(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        title: 'Monthly', amountKobo: 100_000, period: 'monthly',
        startDate: '2026-01-01', createdBy: 'user_admin',
      });
      await recordDuesPayment(db as any, {
        tenantId: TENANT, workspaceId: WS, scheduleId: sched.id,
        memberUserId: 'user_m1', amountKobo: 100_000,
        periodLabel: '2026-05', ndprConsented: true,
      });
      const status = await getMemberDuesStatus(db as any, sched.id, 'user_m1', TENANT);
      expect(status.scheduleId).toBe(sched.id);
      expect(status.paidPeriods).toContain('2026-05');
      expect(status.totalPaidKobo).toBe(100_000);
    });
  });

  describe('closeDuesSchedule', () => {
    it('D12 — closes an active schedule', async () => {
      const db = makeMockDb();
      const sched = await createDuesSchedule(db as any, {
        tenantId: TENANT, workspaceId: WS, groupId: GROUP,
        title: 'Short Levy', amountKobo: 50_000, period: 'weekly',
        startDate: '2026-01-01', createdBy: 'user_admin',
      });
      await closeDuesSchedule(db as any, sched.id, TENANT);
      const fetched = await getDuesSchedule(db as any, sched.id, TENANT);
      expect(fetched?.status).toBe('closed');
    });
  });

});
