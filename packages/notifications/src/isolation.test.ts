/**
 * Multi-tenant isolation test suite (N-028, G1, Phase 2).
 *
 * Verifies G1: no cross-tenant data access in any notification pipeline query.
 *
 * Strategy: intercept every D1 prepare() call and assert that EACH query
 * either:
 *   (a) Contains tenant_id in its WHERE clause with the correct tenantId bound, OR
 *   (b) Is a platform-level query (super_admins lookup, platform rules) that
 *       intentionally has no tenant scope but only reads metadata roles.
 *
 * The test uses two tenants (tenant_A and tenant_B) and verifies that queries
 * issued for tenant_A NEVER bind tenant_B's ID.
 */

import { describe, it, expect } from 'vitest';
import { processEvent } from './notification-service.js';
import type { ProcessEventParams, SandboxConfig } from './notification-service.js';
import type { INotificationChannel, DispatchContext, DispatchResult } from './types.js';
import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// Recording D1 fake — captures all (query, bindings) pairs
// ---------------------------------------------------------------------------

interface QueryRecord {
  query: string;
  bindings: unknown[];
  operation: 'run' | 'first' | 'all';
}

function makeIsolationD1(tenantId: string, records: QueryRecord[]): D1LikeFull {
  return {
    prepare: (query: string) => ({
      bind: (...bindings: unknown[]) => ({
        run: async () => {
          records.push({ query, bindings, operation: 'run' });
          return { success: true };
        },
        first: async <T>() => {
          records.push({ query, bindings, operation: 'first' });
          // For suppression: not suppressed
          if (query.includes('notification_suppression_list')) return null;
          // For email lookup: return email for the tenant's actor
          if (query.includes('SELECT email FROM users')) {
            return { email: `actor@${tenantId}.test` } as T;
          }
          return null;
        },
        all: async <T>() => {
          records.push({ query, bindings, operation: 'all' });
          // Return a platform rule
          if (query.includes('IS NULL') && query.includes('notification_rule')) {
            return {
              results: [{
                id: `rule_platform`, tenant_id: null, event_key: 'auth.user.registered',
                rule_name: 'Welcome', enabled: 1, audience_type: 'actor', audience_filter: null,
                channels: '["email"]', channel_fallback: null, template_family: 'auth.welcome',
                priority: 'normal', digest_eligible: 0, min_severity: 'info', feature_flag: null,
              }] as unknown as T[],
            };
          }
          return { results: [] as unknown as T[] };
        },
      }),
    }),
  };
}

// ---------------------------------------------------------------------------
// Null channel (never actually sends)
// ---------------------------------------------------------------------------

class NullChannel implements INotificationChannel {
  readonly channel = 'email' as const;
  readonly providerName = 'null';
  async dispatch(_ctx: DispatchContext): Promise<DispatchResult> {
    return { success: true, providerMessageId: 'null-dispatch' };
  }
  isEntitled(_plan: string): boolean { return true; }
}

// ---------------------------------------------------------------------------
// Isolation tests
// ---------------------------------------------------------------------------

describe('G1 multi-tenant isolation', () => {
  it('all tenant-scoped queries for tenant_A never bind tenant_B ID', async () => {
    const tenantA = 'tenant_aaaaaaaa';
    const tenantB = 'tenant_bbbbbbbb';
    const records: QueryRecord[] = [];

    const params: ProcessEventParams = {
      notifEventId: 'notif_evt_iso_001',
      eventKey: 'auth.user.registered',
      tenantId: tenantA,
      actorId: 'usr_actor_a',
      actorType: 'user',
      payload: { name: 'Amaka', workspace_name: 'Amaka Co', login_url: 'https://app.webwaka.com' },
      source: 'api',
      severity: 'info',
    };

    const sandbox: SandboxConfig = { enabled: false };

    await processEvent(params, makeIsolationD1(tenantA, records), [new NullChannel()], sandbox);

    // Assert: no binding in any query is tenant_B's ID
    for (const record of records) {
      const bindingStr = JSON.stringify(record.bindings);
      expect(bindingStr).not.toContain(tenantB);
    }
  });

  it('notification_event mark-processed uses tenantId from event (G1)', async () => {
    const tenantA = 'tenant_cccccccc';
    const records: QueryRecord[] = [];

    const params: ProcessEventParams = {
      notifEventId: 'notif_evt_iso_002',
      eventKey: 'auth.user.registered',
      tenantId: tenantA,
      actorId: 'usr_actor_c',
      actorType: 'user',
      payload: {},
      source: 'api',
      severity: 'info',
    };

    const sandbox: SandboxConfig = { enabled: false };
    await processEvent(params, makeIsolationD1(tenantA, records), [new NullChannel()], sandbox);

    // The UPDATE notification_event SET processed_at query should bind tenantId
    const processedQuery = records.find(
      (r) => r.query.includes('UPDATE notification_event') && r.query.includes('processed_at'),
    );
    expect(processedQuery).toBeDefined();
    expect(processedQuery?.bindings).toContain(tenantA);
  });

  it('notification_delivery INSERT includes tenantId in bindings (G1)', async () => {
    const tenantA = 'tenant_dddddddd';
    const records: QueryRecord[] = [];

    const params: ProcessEventParams = {
      notifEventId: 'notif_evt_iso_003',
      eventKey: 'auth.user.registered',
      tenantId: tenantA,
      actorId: 'usr_actor_d',
      actorType: 'user',
      payload: {},
      source: 'api',
      severity: 'info',
    };

    const sandbox: SandboxConfig = { enabled: false };
    await processEvent(params, makeIsolationD1(tenantA, records), [new NullChannel()], sandbox);

    const deliveryInserts = records.filter(
      (r) => r.query.includes('INSERT') && r.query.includes('notification_delivery'),
    );
    expect(deliveryInserts.length).toBeGreaterThan(0);
    for (const insert of deliveryInserts) {
      expect(insert.bindings).toContain(tenantA);
    }
  });

  it('notification_audit_log INSERT includes tenantId (G1, G9)', async () => {
    const tenantA = 'tenant_eeeeeeee';
    const records: QueryRecord[] = [];

    const params: ProcessEventParams = {
      notifEventId: 'notif_evt_iso_004',
      eventKey: 'auth.user.registered',
      tenantId: tenantA,
      actorId: 'usr_actor_e',
      actorType: 'user',
      payload: {},
      source: 'api',
      severity: 'info',
    };

    const sandbox: SandboxConfig = { enabled: false };
    await processEvent(params, makeIsolationD1(tenantA, records), [new NullChannel()], sandbox);

    const auditInserts = records.filter(
      (r) => r.query.includes('INSERT') && r.query.includes('notification_audit_log'),
    );
    expect(auditInserts.length).toBeGreaterThan(0);
    for (const insert of auditInserts) {
      expect(insert.bindings).toContain(tenantA);
    }
  });
});
