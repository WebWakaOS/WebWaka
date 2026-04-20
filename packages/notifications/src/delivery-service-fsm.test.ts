/**
 * delivery-service-fsm.test.ts — N-051 delivery FSM (Phase 4)
 *
 * Tests updateDeliveredByProviderMessageId() — used by bounce webhook (N-052)
 * to transition delivery rows to 'delivered' or 'failed' status.
 */

import { describe, it, expect, vi } from 'vitest';
import { updateDeliveredByProviderMessageId, updateDeliveryStatus } from './delivery-service.js';
import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// Test double
// ---------------------------------------------------------------------------

interface RunResult {
  success: boolean;
  meta: { changes: number };
}

function makeDb(
  capturedBinds: unknown[][],
  runResult: RunResult = { success: true, meta: { changes: 1 } },
): D1LikeFull {
  return {
    prepare: (sql: string) => {
      return {
        bind: (...args: unknown[]) => {
          capturedBinds.push([sql, ...args]);
          return {
            run: async () => runResult,
            first: async <T>() => null as T,
            all: async <T>() => ({ results: [] as T[] }),
          };
        },
      };
    },
  };
}

// ---------------------------------------------------------------------------
// updateDeliveredByProviderMessageId tests
// ---------------------------------------------------------------------------

describe('updateDeliveredByProviderMessageId', () => {
  it('marks delivery as delivered when status=delivered', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveredByProviderMessageId(db, 'tenant_abc', 'resend_msg_001', 'delivered');

    expect(binds).toHaveLength(1);
    const [sql, status, lastError, _ts, providerMessageId, tenantId] = binds[0] as unknown[];
    expect((sql as string)).toContain('UPDATE notification_delivery');
    expect(status).toBe('delivered');
    expect(lastError).toBeNull();
    expect(providerMessageId).toBe('resend_msg_001');
    expect(tenantId).toBe('tenant_abc');
  });

  it('marks delivery as failed with error message when status=failed', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveredByProviderMessageId(
      db,
      'tenant_abc',
      'resend_msg_bounce',
      'failed',
      'hard_bounce: recipient does not exist',
    );

    const [sql, status, lastError, _ts, providerMessageId, tenantId] = binds[0] as unknown[];
    expect((sql as string)).toContain('UPDATE notification_delivery');
    expect(status).toBe('failed');
    expect(lastError).toBe('hard_bounce: recipient does not exist');
    expect(providerMessageId).toBe('resend_msg_bounce');
    expect(tenantId).toBe('tenant_abc');
  });

  it('uses delivered_at column when status=delivered', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveredByProviderMessageId(db, 'tenant_abc', 'msg_001', 'delivered');

    const [sql] = binds[0] as [string];
    expect(sql).toContain('delivered_at');
    expect(sql).not.toContain('failed_at');
  });

  it('uses failed_at column when status=failed', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveredByProviderMessageId(db, 'tenant_abc', 'msg_002', 'failed');

    const [sql] = binds[0] as [string];
    expect(sql).toContain('failed_at');
    expect(sql).not.toContain('delivered_at');
  });

  it('G1: includes tenant_id in WHERE clause', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveredByProviderMessageId(db, 'specific_tenant', 'msg_xyz', 'delivered');

    const args = binds[0] as unknown[];
    const tenantId = args[args.length - 1];
    expect(tenantId).toBe('specific_tenant');
  });

  it('passes null last_error when not provided', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveredByProviderMessageId(db, 'tenant', 'msg_123', 'delivered');

    const [, , lastError] = binds[0] as [string, string, unknown];
    expect(lastError).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// updateDeliveryStatus FSM transition tests
// ---------------------------------------------------------------------------

describe('updateDeliveryStatus FSM transitions', () => {
  it('queued → dispatched: sets dispatched_at', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveryStatus(db, 'tenant_abc', {
      deliveryId: 'del_001',
      status: 'dispatched',
      providerMessageId: 'resend_001',
    });

    const [sql] = binds[0] as [string];
    expect(sql).toContain('dispatched_at');
  });

  it('dispatched → delivered: sets delivered_at', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveryStatus(db, 'tenant_abc', {
      deliveryId: 'del_001',
      status: 'delivered',
      providerMessageId: 'resend_001',
    });

    const [sql] = binds[0] as [string];
    expect(sql).toContain('delivered_at');
  });

  it('dispatched → failed: sets failed_at', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveryStatus(db, 'tenant_abc', {
      deliveryId: 'del_002',
      status: 'failed',
      lastError: 'SMTP reject',
    });

    const [sql] = binds[0] as [string];
    expect(sql).toContain('failed_at');
  });

  it('failed → dead_lettered: sets failed_at', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveryStatus(db, 'tenant_abc', {
      deliveryId: 'del_003',
      status: 'dead_lettered',
      lastError: 'max retries exceeded',
    });

    const [sql] = binds[0] as [string];
    expect(sql).toContain('failed_at');
  });

  it('queued → suppressed: no timestamp column', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveryStatus(db, 'tenant_abc', {
      deliveryId: 'del_004',
      status: 'suppressed',
    });

    const [sql] = binds[0] as [string];
    expect(sql).not.toContain('dispatched_at');
    expect(sql).not.toContain('delivered_at');
    expect(sql).not.toContain('failed_at');
  });

  it('G1: includes tenant_id in WHERE clause', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveryStatus(db, 'my_tenant', {
      deliveryId: 'del_005',
      status: 'delivered',
    });

    const args = binds[0] as unknown[];
    const tenantId = args[args.length - 1];
    expect(tenantId).toBe('my_tenant');
  });

  it('senderFallbackUsed flag is persisted', async () => {
    const binds: unknown[][] = [];
    const db = makeDb(binds);

    await updateDeliveryStatus(db, 'tenant', {
      deliveryId: 'del_006',
      status: 'dispatched',
      senderFallbackUsed: true,
    });

    const args = binds[0] as unknown[];
    const senderFallbackUsedArg = args.find((a) => a === 1);
    expect(senderFallbackUsedArg).toBe(1);
  });
});
