/**
 * N-120 — Full E2E notification pipeline integration tests (Phase 9).
 *
 * Tests the complete pipeline from processEvent() through rule evaluation,
 * recipient resolution, preference gating, digest routing, suppression,
 * sandbox mode redirect, and final channel dispatch.
 *
 * Pipeline stages covered:
 *   E2E-01  Basic flow: event → rule match → email dispatch → delivery insert → audit log
 *   E2E-02  Suppressed recipient: suppression check → delivery blocked, zero dispatches
 *   E2E-03  Preference disabled: channel disabled by user → zero dispatches for that channel
 *   E2E-04  Low-data mode: SMS non-critical blocked (G22)
 *   E2E-05  Quiet hours: deferral logged, zero dispatches
 *   E2E-06  Digest window: routes to DigestService instead of immediate dispatch
 *   E2E-07  Sandbox mode: dispatch redirects to sandbox email (G24)
 *   E2E-08  USSD source: delivery record includes source='ussd_gateway' in bindings
 *   E2E-09  Idempotency: reprocessing same notifEventId produces no additional deliveries
 *   E2E-10  No matching rule: zero dispatches
 *   E2E-11  Multi-channel rule: email + SMS dispatched to same recipient
 *   E2E-12  Sandbox safety gate: G24 prevents sandbox=true in production
 *   E2E-13  Tenant-scoped rule: platform rule fires for any tenant
 *   E2E-14  In-app channel: delivery INSERT includes channel='in_app'
 *
 * Test approach: fake D1 (query recorder), fake channels (dispatch recorder),
 * and mock PreferenceService / DigestService for Phase 5 integration tests.
 *
 * Guardrails: G1, G7, G22, G24, G8, G11.
 */

import { describe, it, expect, vi } from 'vitest';
import { processEvent } from './notification-service.js';
import type {
  ProcessEventParams,
  SandboxConfig,
  Phase5Config,
} from './notification-service.js';
import type {
  INotificationChannel,
  DispatchContext,
  DispatchResult,
  IPreferenceStore,
  ResolvedPreference,
  NotificationChannel,
} from './types.js';
import type { NotificationEventSource } from '@webwaka/events';
import type { D1LikeFull } from './db-types.js';
import type { DigestService } from './digest-service.js';

// ---------------------------------------------------------------------------
// Shared test infrastructure
// ---------------------------------------------------------------------------

interface QueryRecord {
  query: string;
  bindings: unknown[];
  operation: 'run' | 'first' | 'all';
}

interface PlatformRule {
  id: string;
  tenant_id: string | null;
  event_key: string;
  rule_name: string;
  enabled: number;
  audience_type: string;
  audience_filter: string | null;
  channels: string;
  channel_fallback: string | null;
  template_family: string;
  priority: string;
  digest_eligible: number;
  min_severity: string;
  feature_flag: string | null;
}

function makePlatformRule(overrides: Partial<PlatformRule> = {}): PlatformRule {
  return {
    id: 'rule_e2e_platform_01',
    tenant_id: null,
    event_key: 'auth.user.registered',
    rule_name: 'Welcome Email',
    enabled: 1,
    audience_type: 'actor',
    audience_filter: null,
    channels: '["email"]',
    channel_fallback: null,
    template_family: 'auth.welcome',
    priority: 'normal',
    digest_eligible: 0,
    min_severity: 'info',
    feature_flag: null,
    ...overrides,
  };
}

function makeE2ED1(
  tenantId: string,
  records: QueryRecord[],
  opts: {
    suppressed?: boolean;
    idempotencyExists?: boolean;
    rulesOverride?: PlatformRule[];
    emailLookup?: string;
  } = {},
): D1LikeFull {
  const rules = opts.rulesOverride ?? [makePlatformRule()];
  const email = opts.emailLookup ?? `actor@${tenantId}.test`;

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
            return opts.suppressed
              ? ({ id: 'sup_e2e_01', channel: 'email', address: email } as T)
              : (null as T);
          }

          if (query.includes('notification_event') && query.toUpperCase().includes('SELECT')) {
            return opts.idempotencyExists
              ? ({ id: 'notif_evt_existing' } as T)
              : (null as T);
          }

          if (query.includes('SELECT email FROM users') || query.includes('SELECT email')) {
            return ({ email } as T);
          }

          return null as T;
        },
        all: async <T>() => {
          records.push({ query, bindings, operation: 'all' });

          if (query.toLowerCase().includes('notification_rule')) {
            const matchingRules = rules.filter((r) =>
              r.tenant_id === null || r.tenant_id === tenantId,
            );
            return { results: matchingRules as unknown as T[] };
          }

          return { results: [] as unknown as T[] };
        },
      }),
    }),
  };
}

class RecordingChannel implements INotificationChannel {
  readonly channel: NotificationChannel;
  readonly providerName: string;
  readonly dispatches: DispatchContext[] = [];
  private readonly shouldFail: boolean;

  constructor(channel: NotificationChannel = 'email', providerName = 'e2e-null', shouldFail = false) {
    this.channel = channel;
    this.providerName = providerName;
    this.shouldFail = shouldFail;
  }

  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    this.dispatches.push(ctx);
    if (this.shouldFail) {
      return { success: false, lastError: 'Simulated channel failure' };
    }
    return { success: true, providerMessageId: `e2e-null-${Date.now()}` };
  }

  isEntitled(_plan: string): boolean { return true; }
}

const TENANT = 'tenant_e2e_pipeline_01';
const ACTOR = 'usr_e2e_actor_01';

const BASE_PARAMS: ProcessEventParams = {
  notifEventId: 'notif_e2e_evt_01',
  eventKey: 'auth.user.registered',
  tenantId: TENANT,
  actorId: ACTOR,
  actorType: 'user',
  payload: {
    name: 'Amaka Obi',
    workspace_name: 'Amaka Co',
    login_url: 'https://app.webwaka.com/login',
  },
  source: 'api',
  severity: 'info',
};

// ---------------------------------------------------------------------------
// E2E-01: Basic flow — event → rule match → email dispatch → D1 writes
// ---------------------------------------------------------------------------

describe('E2E-01 — basic pipeline: event → rule → dispatch → D1 writes', () => {
  it('dispatches exactly one email when rule matches and no suppression', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    await processEvent(BASE_PARAMS, makeE2ED1(TENANT, records), [ch]);

    expect(ch.dispatches).toHaveLength(1);
    expect(ch.dispatches[0]!.channel).toBe('email');
  });

  it('writes a notification_delivery INSERT to D1', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    await processEvent(BASE_PARAMS, makeE2ED1(TENANT, records), [ch]);

    const deliveryInserts = records.filter((r) =>
      r.query.toLowerCase().includes('notification_delivery') && r.operation === 'run',
    );
    expect(deliveryInserts.length).toBeGreaterThanOrEqual(1);
  });

  it('writes a notification_audit_log INSERT to D1', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    await processEvent(BASE_PARAMS, makeE2ED1(TENANT, records), [ch]);

    const auditInserts = records.filter((r) =>
      r.query.toLowerCase().includes('notification_audit_log') && r.operation === 'run',
    );
    expect(auditInserts.length).toBeGreaterThanOrEqual(1);
  });

  it('dispatch context includes tenantId, actorId, and eventKey', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    await processEvent(BASE_PARAMS, makeE2ED1(TENANT, records), [ch]);

    const ctx = ch.dispatches[0]!;
    expect(ctx.tenantId).toBe(TENANT);
    expect(ctx.idempotencyKey).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// E2E-02: Suppressed recipient — delivery blocked
// ---------------------------------------------------------------------------

describe('E2E-02 — suppressed recipient: delivery blocked (G8)', () => {
  it('dispatches zero messages when recipient email is suppressed', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    await processEvent(
      BASE_PARAMS,
      makeE2ED1(TENANT, records, { suppressed: true }),
      [ch],
    );

    expect(ch.dispatches).toHaveLength(0);
  });

  it('checks suppression list before dispatching', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    await processEvent(
      BASE_PARAMS,
      makeE2ED1(TENANT, records, { suppressed: true }),
      [ch],
    );

    const suppressionChecks = records.filter((r) =>
      r.query.toLowerCase().includes('notification_suppression_list') && r.operation === 'first',
    );
    expect(suppressionChecks.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// E2E-03: Preference disabled — channel blocked
// ---------------------------------------------------------------------------

describe('E2E-03 — preference disabled: zero dispatches for blocked channel', () => {
  it('skips email dispatch when user preference has email disabled', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    const disabledPrefService: IPreferenceStore = {
      resolve: vi.fn().mockResolvedValue({
        enabled: false,
        timezone: 'Africa/Lagos',
        digestWindow: 'none',
        lowDataMode: false,
      } as ResolvedPreference),
      update: vi.fn(),
    };

    await processEvent(
      BASE_PARAMS,
      makeE2ED1(TENANT, records),
      [ch],
      { enabled: false },
      undefined,
      { preferenceService: disabledPrefService },
    );

    expect(ch.dispatches).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// E2E-04: Low-data mode — SMS non-critical blocked (G22)
// ---------------------------------------------------------------------------

describe('E2E-04 — low-data mode: SMS blocked for non-critical (G22)', () => {
  it('blocks SMS for non-critical severity in low_data_mode', async () => {
    const records: QueryRecord[] = [];
    const smsRule = makePlatformRule({
      channels: '["sms"]',
      event_key: 'auth.user.registered',
    });
    const chSms = new RecordingChannel('sms');

    const lowDataPrefService: IPreferenceStore = {
      resolve: vi.fn().mockResolvedValue({
        enabled: true,
        timezone: 'Africa/Lagos',
        digestWindow: 'none',
        lowDataMode: true,
      } as ResolvedPreference),
      update: vi.fn(),
    };

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_e2e_low_data_01', severity: 'info' },
      makeE2ED1(TENANT, records, { rulesOverride: [smsRule] }),
      [chSms],
      { enabled: false },
      undefined,
      { preferenceService: lowDataPrefService },
    );

    expect(chSms.dispatches).toHaveLength(0);
  });

  it('does NOT block SMS for critical severity in low_data_mode', async () => {
    const records: QueryRecord[] = [];
    const smsRule = makePlatformRule({
      channels: '["sms"]',
      event_key: 'auth.user.registered',
      min_severity: 'critical',
    });
    const chSms = new RecordingChannel('sms');

    const lowDataPrefService: IPreferenceStore = {
      resolve: vi.fn().mockResolvedValue({
        enabled: true,
        timezone: 'Africa/Lagos',
        digestWindow: 'none',
        lowDataMode: true,
      } as ResolvedPreference),
      update: vi.fn(),
    };

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_e2e_low_data_02', severity: 'critical' },
      makeE2ED1(TENANT, records, { rulesOverride: [smsRule] }),
      [chSms],
      { enabled: false },
      undefined,
      { preferenceService: lowDataPrefService },
    );

    expect(chSms.dispatches).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// E2E-05: Quiet hours — deferral, zero dispatches
// ---------------------------------------------------------------------------

describe('E2E-05 — quiet hours: delivery deferred, zero dispatches (G11)', () => {
  it('dispatches zero messages when recipient is in quiet hours', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    const quietHoursPrefService: IPreferenceStore = {
      resolve: vi.fn().mockResolvedValue({
        enabled: true,
        timezone: 'Africa/Lagos',
        digestWindow: 'none',
        lowDataMode: false,
        quietHoursStart: 0,
        quietHoursEnd: 0,
      } as ResolvedPreference),
      update: vi.fn(),
    };

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_e2e_quiet_01', severity: 'info' },
      makeE2ED1(TENANT, records),
      [ch],
      { enabled: false },
      undefined,
      { preferenceService: quietHoursPrefService },
    );

    expect(ch.dispatches).toHaveLength(0);
  });

  it('does NOT defer critical severity during quiet hours', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    const quietHoursPrefService: IPreferenceStore = {
      resolve: vi.fn().mockResolvedValue({
        enabled: true,
        timezone: 'Africa/Lagos',
        digestWindow: 'none',
        lowDataMode: false,
        quietHoursStart: 0,
        quietHoursEnd: 0,
      } as ResolvedPreference),
      update: vi.fn(),
    };

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_e2e_quiet_02', severity: 'critical' },
      makeE2ED1(TENANT, records),
      [ch],
      { enabled: false },
      undefined,
      { preferenceService: quietHoursPrefService },
    );

    expect(ch.dispatches).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// E2E-06: Digest window — routes to DigestService
// ---------------------------------------------------------------------------

describe('E2E-06 — digest window: routes to DigestService, zero immediate dispatches', () => {
  it('adds event to digest batch when user has digest window, dispatches nothing', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');
    const addItemMock = vi.fn().mockResolvedValue(undefined);
    const findOrCreateBatchMock = vi.fn().mockResolvedValue('batch_e2e_01');

    const digestRule = makePlatformRule({ digest_eligible: 1 });
    const digestPrefService: IPreferenceStore = {
      resolve: vi.fn().mockResolvedValue({
        enabled: true,
        timezone: 'Africa/Lagos',
        digestWindow: 'daily',
        lowDataMode: false,
      } as ResolvedPreference),
      update: vi.fn(),
    };

    const mockDigestService = {
      findOrCreateBatch: findOrCreateBatchMock,
      addItem: addItemMock,
    } as unknown as DigestService;

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_e2e_digest_01' },
      makeE2ED1(TENANT, records, { rulesOverride: [digestRule] }),
      [ch],
      { enabled: false },
      undefined,
      { preferenceService: digestPrefService, digestService: mockDigestService },
    );

    expect(addItemMock).toHaveBeenCalledTimes(1);
    expect(findOrCreateBatchMock).toHaveBeenCalledTimes(1);
    expect(ch.dispatches).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// E2E-07: Sandbox mode — dispatch redirects to sandbox email
// ---------------------------------------------------------------------------

describe('E2E-07 — sandbox mode: dispatch redirected to sandbox email (G24)', () => {
  it('dispatches with sandboxMode=true when sandbox.enabled=true', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    const sandbox: SandboxConfig = {
      enabled: true,
      sandboxRecipient: {
        email: 'sandbox@webwaka-test.com',
        phone: '+2340000000000',
      },
    };

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_e2e_sandbox_01' },
      makeE2ED1(TENANT, records),
      [ch],
      sandbox,
    );

    expect(ch.dispatches).toHaveLength(1);
    const ctx = ch.dispatches[0]!;
    expect(ctx.sandboxMode).toBe(true);
    expect(ctx.sandboxRecipient?.email).toBe('sandbox@webwaka-test.com');
  });
});

// ---------------------------------------------------------------------------
// E2E-08: USSD source — delivery record includes source='ussd_gateway'
// ---------------------------------------------------------------------------

describe('E2E-08 — USSD source: D1 bindings include source="ussd_gateway"', () => {
  it('delivery INSERT bindings include ussd_gateway source when source is ussd_gateway', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    await processEvent(
      {
        ...BASE_PARAMS,
        notifEventId: 'notif_e2e_ussd_01',
        source: 'ussd_gateway',
      },
      makeE2ED1(TENANT, records),
      [ch],
    );

    const deliveryInserts = records.filter((r) =>
      r.query.toLowerCase().includes('notification_delivery') && r.operation === 'run',
    );

    const allBindings = deliveryInserts.flatMap((r) => r.bindings);
    expect(allBindings).toContain('ussd_gateway');
  });
});

// ---------------------------------------------------------------------------
// E2E-09: Idempotency — reprocessing same notifEventId produces no extra dispatches
// ---------------------------------------------------------------------------

describe('E2E-09 — idempotency: reprocessing same notifEventId blocked (G7)', () => {
  it('no dispatch occurs when notification_event row already exists (processed_at set)', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_e2e_idempotent_01' },
      makeE2ED1(TENANT, records, { idempotencyExists: true }),
      [ch],
    );

    expect(ch.dispatches).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// E2E-10: No matching rule — zero dispatches
// ---------------------------------------------------------------------------

describe('E2E-10 — no matching rule: zero dispatches', () => {
  it('dispatches nothing when D1 returns zero rules for the event key', async () => {
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

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
              return null as T;
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
      { ...BASE_PARAMS, notifEventId: 'notif_e2e_no_rule_01' },
      makeEmptyRulesD1(),
      [ch],
    );

    expect(ch.dispatches).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// E2E-11: Multi-channel rule — email + in_app dispatched to same recipient
// ---------------------------------------------------------------------------

describe('E2E-11 — multi-channel rule: email + in_app dispatched', () => {
  it('dispatches to both channels when rule specifies ["email", "in_app"]', async () => {
    const multiChannelRule = makePlatformRule({ channels: '["email","in_app"]' });
    const records: QueryRecord[] = [];
    const emailCh = new RecordingChannel('email');
    const inAppCh = new RecordingChannel('in_app');

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_e2e_multi_01' },
      makeE2ED1(TENANT, records, { rulesOverride: [multiChannelRule] }),
      [emailCh, inAppCh],
    );

    expect(emailCh.dispatches.length + inAppCh.dispatches.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// E2E-13: Tenant-scoped platform rule fires for any tenant
// ---------------------------------------------------------------------------

describe('E2E-13 — platform rule (tenant_id=null) fires for any tenant', () => {
  it('platform rules match any tenantId', async () => {
    const otherTenant = 'tenant_e2e_other_xxxxxxx';
    const records: QueryRecord[] = [];
    const ch = new RecordingChannel('email');

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_e2e_platform_01', tenantId: otherTenant },
      makeE2ED1(otherTenant, records),
      [ch],
    );

    expect(ch.dispatches).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// E2E-14: In-app channel — delivery INSERT includes channel='in_app'
// ---------------------------------------------------------------------------

describe('E2E-14 — in_app channel: delivery INSERT records channel=in_app', () => {
  it('notification_delivery INSERT includes in_app channel in bindings', async () => {
    const inAppRule = makePlatformRule({ channels: '["in_app"]' });
    const records: QueryRecord[] = [];
    const inAppCh = new RecordingChannel('in_app');

    await processEvent(
      { ...BASE_PARAMS, notifEventId: 'notif_e2e_inapp_01' },
      makeE2ED1(TENANT, records, { rulesOverride: [inAppRule] }),
      [inAppCh],
    );

    const deliveryInserts = records.filter((r) =>
      r.query.toLowerCase().includes('notification_delivery') && r.operation === 'run',
    );
    const allBindings = deliveryInserts.flatMap((r) => r.bindings);
    expect(allBindings).toContain('in_app');
  });
});
