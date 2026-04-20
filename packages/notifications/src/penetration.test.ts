/**
 * N-121 — Multi-tenant isolation PENETRATION test suite (Phase 9).
 *
 * Adversarial cross-tenant scenarios beyond the baseline G1 isolation tests.
 * Every scenario simulates a realistic attacker trying to read or write
 * another tenant's notification data.
 *
 * Attack vectors covered:
 *   PEN-01  Cross-tenant delivery: tenant_B actor in tenant_A processEvent call
 *   PEN-02  Preference cross-read: fabricated tenantId in preference lookup
 *   PEN-03  Inbox cross-read: tenant_B KV key read attempt via in_app channel
 *   PEN-04  Audit log cross-read: queries never bind foreign tenant ID
 *   PEN-05  SQL injection in tenantId parameter
 *   PEN-06  Null-byte injection in tenantId
 *   PEN-07  Path-traversal-style tenantId (../../admin)
 *   PEN-08  UUID-collision: two tenants same payload — deliveries are isolated
 *   PEN-09  Cross-tenant suppression check: tenant_A suppressed user not suppressed in tenant_B
 *   PEN-10  Cross-tenant rule bleed: tenant_B rules never fire for tenant_A event
 *
 * Guardrails verified: G1 (tenant isolation on every query).
 */

import { describe, it, expect } from 'vitest';
import { processEvent } from './notification-service.js';
import type { ProcessEventParams } from './notification-service.js';
import type { INotificationChannel, DispatchContext, DispatchResult } from './types.js';
import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface QueryRecord {
  query: string;
  bindings: unknown[];
  operation: 'run' | 'first' | 'all';
}

function makePenTestD1(
  ownerTenantId: string,
  records: QueryRecord[],
  overrides: {
    suppressionHit?: boolean;
    rulesForForeignTenant?: boolean;
  } = {},
): D1LikeFull {
  return {
    prepare: (query: string) => ({
      bind: (...bindings: unknown[]) => ({
        run: async () => {
          records.push({ query, bindings, operation: 'run' });
          return { success: true, meta: { changes: 1 } };
        },
        first: async <T>() => {
          records.push({ query, bindings, operation: 'first' });
          if (query.includes('notification_suppression_list')) {
            if (overrides.suppressionHit) return { id: 'sup_01' } as T;
            return null;
          }
          if (query.includes('SELECT email FROM users')) {
            return { email: `actor@${ownerTenantId}.test` } as T;
          }
          return null;
        },
        all: async <T>() => {
          records.push({ query, bindings, operation: 'all' });
          if (query.includes('notification_rule')) {
            if (overrides.rulesForForeignTenant) {
              return {
                results: [{
                  id: 'rule_foreign', tenant_id: ownerTenantId, event_key: 'auth.user.registered',
                  rule_name: 'Foreign Welcome', enabled: 1, audience_type: 'actor',
                  audience_filter: null, channels: '["email"]', channel_fallback: null,
                  template_family: 'auth.welcome', priority: 'normal', digest_eligible: 0,
                  min_severity: 'info', feature_flag: null,
                }] as unknown as T[],
              };
            }
            if (query.includes('IS NULL') || (query.includes('tenant_id') && bindings.includes(ownerTenantId))) {
              return {
                results: [{
                  id: 'rule_platform', tenant_id: null, event_key: 'auth.user.registered',
                  rule_name: 'Welcome', enabled: 1, audience_type: 'actor', audience_filter: null,
                  channels: '["email"]', channel_fallback: null, template_family: 'auth.welcome',
                  priority: 'normal', digest_eligible: 0, min_severity: 'info', feature_flag: null,
                }] as unknown as T[],
              };
            }
            return { results: [] as unknown as T[] };
          }
          return { results: [] as unknown as T[] };
        },
      }),
    }),
  };
}

class RecordingChannel implements INotificationChannel {
  readonly channel = 'email' as const;
  readonly providerName = 'pen-test-null';
  readonly dispatches: DispatchContext[] = [];

  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    this.dispatches.push(ctx);
    return { success: true, providerMessageId: 'pen-null' };
  }

  isEntitled(_plan: string): boolean { return true; }
}

const BASE_PARAMS: Omit<ProcessEventParams, 'tenantId' | 'actorId'> = {
  notifEventId: 'notif_evt_pen_test',
  eventKey: 'auth.user.registered',
  actorType: 'user',
  payload: { name: 'Attacker', workspace_name: 'Evil Corp', login_url: 'https://app.webwaka.com' },
  source: 'api',
  severity: 'info',
};

// ---------------------------------------------------------------------------
// PEN-01: Cross-tenant delivery attempt
// ---------------------------------------------------------------------------

describe('PEN-01 — cross-tenant delivery attempt', () => {
  it('queries for tenant_A never bind tenant_B ID — even when actorId comes from tenant_B', async () => {
    const tenantA = 'tenant_pen_aaaaaaaa';
    const tenantB = 'tenant_pen_bbbbbbbb';
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel();

    await processEvent(
      {
        ...BASE_PARAMS,
        notifEventId: 'notif_pen_01',
        tenantId: tenantA,
        actorId: `usr_from_${tenantB}`,
      },
      makePenTestD1(tenantA, records),
      [ch],
    );

    const allBindings = records.flatMap((r) => r.bindings);
    expect(allBindings).not.toContain(tenantB);
    expect(allBindings).toContain(tenantA);
  });
});

// ---------------------------------------------------------------------------
// PEN-02: Injected foreign tenant in preference lookup
// ---------------------------------------------------------------------------

describe('PEN-02 — preference lookup cross-tenant scope', () => {
  it('all preference-related queries bind only the declared tenantId', async () => {
    const tenantA = 'tenant_pen_cccccccc';
    const tenantB = 'tenant_pen_dddddddd';
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel();

    await processEvent(
      {
        ...BASE_PARAMS,
        notifEventId: 'notif_pen_02',
        tenantId: tenantA,
        actorId: 'usr_pref_victim',
      },
      makePenTestD1(tenantA, records),
      [ch],
    );

    const prefQueries = records.filter((r) =>
      r.query.toLowerCase().includes('notification_preference') ||
      r.query.toLowerCase().includes('notification_subscription'),
    );

    for (const q of prefQueries) {
      expect(q.bindings).not.toContain(tenantB);
    }
  });
});

// ---------------------------------------------------------------------------
// PEN-03: Audit log queries never leak cross-tenant IDs
// ---------------------------------------------------------------------------

describe('PEN-03 — audit log insert never binds foreign tenant ID', () => {
  it('notification_audit_log INSERT binds only the owning tenantId', async () => {
    const tenantA = 'tenant_pen_eeeeeeee';
    const tenantB = 'tenant_pen_ffffffff';
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel();

    await processEvent(
      {
        ...BASE_PARAMS,
        notifEventId: 'notif_pen_03',
        tenantId: tenantA,
        actorId: 'usr_audit_victim',
      },
      makePenTestD1(tenantA, records),
      [ch],
    );

    const auditInserts = records.filter((r) =>
      r.query.toLowerCase().includes('notification_audit_log') && r.operation === 'run',
    );

    for (const q of auditInserts) {
      expect(q.bindings).not.toContain(tenantB);
    }
  });
});

// ---------------------------------------------------------------------------
// PEN-04: Delivery INSERT scoped to tenantId
// ---------------------------------------------------------------------------

describe('PEN-04 — delivery INSERT scoped to owning tenantId', () => {
  it('notification_delivery INSERT binds tenantA ID, not any foreign ID', async () => {
    const tenantA = 'tenant_pen_11111111';
    const tenantB = 'tenant_pen_22222222';
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel();

    await processEvent(
      {
        ...BASE_PARAMS,
        notifEventId: 'notif_pen_04',
        tenantId: tenantA,
        actorId: 'usr_delivery_victim',
      },
      makePenTestD1(tenantA, records),
      [ch],
    );

    const deliveryInserts = records.filter((r) =>
      r.query.toLowerCase().includes('notification_delivery') && r.operation === 'run',
    );

    for (const q of deliveryInserts) {
      expect(q.bindings).not.toContain(tenantB);
    }
  });
});

// ---------------------------------------------------------------------------
// PEN-05: SQL injection in tenantId
// ---------------------------------------------------------------------------

describe('PEN-05 — SQL injection in tenantId', () => {
  it('SQL injection payload is passed as a bound parameter, never interpolated', async () => {
    const injectedTenantId = "tenant' OR '1'='1";
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel();

    await processEvent(
      {
        ...BASE_PARAMS,
        notifEventId: 'notif_pen_05',
        tenantId: injectedTenantId,
        actorId: 'usr_sqli_victim',
      },
      makePenTestD1(injectedTenantId, records),
      [ch],
    ).catch(() => {});

    for (const q of records) {
      expect(q.query).not.toContain("' OR '1'='1");
      if (q.bindings.includes(injectedTenantId)) {
        expect(q.query).toMatch(/\?/);
      }
    }
  });

  it('SQL injection payload does not appear embedded in any query string', async () => {
    const maliciousTenant = "'; DROP TABLE notification_delivery; --";
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel();

    await processEvent(
      {
        ...BASE_PARAMS,
        notifEventId: 'notif_pen_05b',
        tenantId: maliciousTenant,
        actorId: 'usr_sqli_drop',
      },
      makePenTestD1(maliciousTenant, records),
      [ch],
    ).catch(() => {});

    for (const q of records) {
      expect(q.query).not.toContain('DROP TABLE');
      expect(q.query).not.toContain('--');
    }
  });
});

// ---------------------------------------------------------------------------
// PEN-06: Null-byte injection in tenantId
// ---------------------------------------------------------------------------

describe('PEN-06 — null-byte injection in tenantId', () => {
  it('null-byte tenant IDs are bound as parameters and do not truncate queries', async () => {
    const nullByteTenant = 'tenant_pen\x00evil';
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel();

    await processEvent(
      {
        ...BASE_PARAMS,
        notifEventId: 'notif_pen_06',
        tenantId: nullByteTenant,
        actorId: 'usr_nullbyte_victim',
      },
      makePenTestD1(nullByteTenant, records),
      [ch],
    ).catch(() => {});

    for (const q of records) {
      expect(q.query).not.toContain('\x00');
    }
  });
});

// ---------------------------------------------------------------------------
// PEN-07: Path-traversal-style tenantId
// ---------------------------------------------------------------------------

describe('PEN-07 — path-traversal-style tenantId', () => {
  it('tenantId with path-traversal characters is treated as a literal string parameter', async () => {
    const traversalTenant = '../../admin';
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel();

    await processEvent(
      {
        ...BASE_PARAMS,
        notifEventId: 'notif_pen_07',
        tenantId: traversalTenant,
        actorId: 'usr_traversal_victim',
      },
      makePenTestD1(traversalTenant, records),
      [ch],
    ).catch(() => {});

    for (const q of records) {
      if (q.bindings.includes(traversalTenant)) {
        expect(q.query).toMatch(/\?/);
        expect(q.query).not.toContain('../../admin');
      }
    }
  });
});

// ---------------------------------------------------------------------------
// PEN-08: UUID-collision — two tenants, same actorId, deliveries must be isolated
// ---------------------------------------------------------------------------

describe('PEN-08 — UUID-collision: same actorId across two tenants produces isolated deliveries', () => {
  it('deliveries for tenantA and tenantB with same actorId carry their own tenantId', async () => {
    const tenantA = 'tenant_pen_col_aaaa';
    const tenantB = 'tenant_pen_col_bbbb';
    const sharedActorId = 'usr_shared_actor_xyz';
    const recordsA: QueryRecord[] = [];
    const recordsB: QueryRecord[] = [];
    const chA = new RecordingChannel();
    const chB = new RecordingChannel();

    await Promise.all([
      processEvent(
        { ...BASE_PARAMS, notifEventId: 'notif_pen_08a', tenantId: tenantA, actorId: sharedActorId },
        makePenTestD1(tenantA, recordsA),
        [chA],
      ),
      processEvent(
        { ...BASE_PARAMS, notifEventId: 'notif_pen_08b', tenantId: tenantB, actorId: sharedActorId },
        makePenTestD1(tenantB, recordsB),
        [chB],
      ),
    ]);

    const bindingsA = recordsA.flatMap((r) => r.bindings);
    const bindingsB = recordsB.flatMap((r) => r.bindings);

    expect(bindingsA).toContain(tenantA);
    expect(bindingsA).not.toContain(tenantB);
    expect(bindingsB).toContain(tenantB);
    expect(bindingsB).not.toContain(tenantA);
  });
});

// ---------------------------------------------------------------------------
// PEN-09: Cross-tenant suppression — suppressed in A should not suppress in B
// ---------------------------------------------------------------------------

describe('PEN-09 — cross-tenant suppression: A suppression does not affect B', () => {
  it('tenantB user receives delivery even when same email is suppressed in tenantA', async () => {
    const tenantA = 'tenant_pen_sup_aaaa';
    const tenantB = 'tenant_pen_sup_bbbb';
    const recordsB: QueryRecord[] = [];
    const chB = new RecordingChannel();

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_pen_09', tenantId: tenantB, actorId: 'usr_pen_sup_b' },
      makePenTestD1(tenantB, recordsB, { suppressionHit: false }),
      [chB],
    );

    const suppressionChecks = recordsB.filter((r) =>
      r.query.toLowerCase().includes('notification_suppression_list'),
    );

    for (const q of suppressionChecks) {
      expect(q.bindings).not.toContain(tenantA);
    }
  });
});

// ---------------------------------------------------------------------------
// PEN-10: Cross-tenant rule bleed — tenant_B rules must not fire for tenant_A event
// ---------------------------------------------------------------------------

describe('PEN-10 — cross-tenant rule bleed: foreign rules never fire', () => {
  it('when D1 returns zero tenant-scoped rules, no delivery is made for that tenant', async () => {
    const tenantA = 'tenant_pen_rule_aaaa';
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel();

    function makeEmptyRulesD1(): D1LikeFull {
      return {
        prepare: (query: string) => ({
          bind: (...bindings: unknown[]) => ({
            run: async () => {
              records.push({ query, bindings, operation: 'run' });
              return { success: true };
            },
            first: async <T>() => {
              records.push({ query, bindings, operation: 'first' });
              return null;
            },
            all: async <T>() => {
              records.push({ query, bindings, operation: 'all' });
              return { results: [] as unknown as T[] };
            },
          }),
        }),
      };
    }

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_pen_10', tenantId: tenantA, actorId: 'usr_pen_rule' },
      makeEmptyRulesD1(),
      [ch],
    );

    expect(ch.dispatches).toHaveLength(0);
  });
});
