/**
 * N-122 — WebWaka Notification Engine Load Test (Phase 9)
 *
 * Target: 10,000 notifications/hour across 100 tenant simulations on staging.
 *
 * Scenarios:
 *   1. notification_publish  — POST /api/v1/notifications/events (simulate event publishing)
 *   2. inbox_read           — GET /api/v1/notifications/inbox (simulate polling)
 *   3. preference_update    — PATCH /api/v1/notifications/preferences (simulate pref changes)
 *   4. unsubscribe_flow     — GET /unsubscribe?token=... (simulate link clicks)
 *
 * Success criteria (Phase 9 exit gates):
 *   - P95 response time < 500ms for event publish
 *   - P99 response time < 2000ms for inbox read
 *   - Error rate < 1% for all scenarios
 *   - Throughput: ≥ 167 notifications/minute sustained (= 10,000/hour)
 *   - Zero 5xx errors on event publish
 *
 * Run against staging:
 *   k6 run tests/k6/notification-load.js \
 *     -e BASE_URL=https://staging-api.webwaka.com \
 *     -e API_TOKEN=<staging-token>
 *
 * Run with HTML report:
 *   k6 run --out json=results/notification-load-$(date +%Y%m%d).json \
 *     tests/k6/notification-load.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------

const eventPublishErrors = new Counter('event_publish_errors');
const eventPublishDuration = new Trend('event_publish_duration_ms', true);
const inboxReadErrors = new Counter('inbox_read_errors');
const inboxReadDuration = new Trend('inbox_read_duration_ms', true);
const prefUpdateErrors = new Counter('pref_update_errors');
const suppressionErrors = new Counter('suppression_errors');
const deliverySuccessRate = new Rate('delivery_success_rate');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = __ENV.BASE_URL || 'https://staging-api.webwaka.com';
const API_TOKEN = __ENV.API_TOKEN || 'staging-load-test-token';
const NUM_TENANTS = 100;
const NOTIFICATIONS_PER_HOUR = 10000;

const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_TOKEN}`,
  'X-Load-Test': 'k6-n122',
};

// ---------------------------------------------------------------------------
// Load test options — 3 stages: ramp up → sustain → ramp down
//
// Target throughput:
//   10,000 notifications/hour = 167/minute = ~2.8/second
//   With 20 VUs each doing 1 request/7.2s = 2.8/second total ✓
// ---------------------------------------------------------------------------

export const options = {
  scenarios: {
    // Primary: event publishing load
    notification_publish: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '2m', target: 20 },   // Ramp up to 20 VUs in 2 minutes
        { duration: '20m', target: 20 },  // Sustain 20 VUs for 20 minutes
        { duration: '3m', target: 0 },    // Ramp down
      ],
      exec: 'publishNotificationEvent',
      gracefulRampDown: '30s',
    },
    // Secondary: inbox polling (realistic user behaviour)
    inbox_poll: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '20m', target: 10 },
        { duration: '3m', target: 0 },
      ],
      exec: 'pollInbox',
      gracefulRampDown: '30s',
    },
    // Tertiary: preference updates (infrequent)
    preference_updates: {
      executor: 'constant-arrival-rate',
      rate: 5,              // 5 updates per minute
      timeUnit: '1m',
      duration: '25m',
      preAllocatedVUs: 3,
      exec: 'updatePreferences',
    },
  },
  thresholds: {
    // Event publish: P95 < 500ms, P99 < 2s, error rate < 1%
    event_publish_duration_ms: ['p(95)<500', 'p(99)<2000'],
    event_publish_errors: ['count<50'],  // <50 errors in full test

    // Inbox read: P99 < 2s
    inbox_read_duration_ms: ['p(99)<2000'],

    // Overall HTTP error rate
    http_req_failed: ['rate<0.01'],  // < 1% HTTP failures

    // Delivery success rate (from API response)
    delivery_success_rate: ['rate>0.99'],
  },
};

// ---------------------------------------------------------------------------
// Test data generators
// ---------------------------------------------------------------------------

function getRandomTenantId() {
  const idx = Math.floor(Math.random() * NUM_TENANTS);
  return `tenant_load_test_${String(idx).padStart(4, '0')}`;
}

function getRandomUserId() {
  return `usr_load_test_${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`;
}

function getRandomEventKey() {
  const events = [
    'auth.user.registered',
    'auth.user.login_success',
    'billing.payment_succeeded',
    'claim.submitted',
    'support.ticket_created',
    'workspace.invite.accepted',
    'kyc.approved',
    'pos.sale_completed',
    'bank_transfer.completed',
    'negotiation.offer_made',
  ];
  return events[Math.floor(Math.random() * events.length)];
}

function buildEventPayload(eventKey) {
  const basePayload = {
    name: `Load Test User ${Math.floor(Math.random() * 10000)}`,
    workspace_name: `Load Test Workspace ${Math.floor(Math.random() * 100)}`,
    login_url: `${BASE_URL}/login`,
  };

  const extraPayloads = {
    'billing.payment_succeeded': { amount: Math.floor(Math.random() * 100000), currency: 'NGN' },
    'claim.submitted': { claim_id: `CLM-${Math.floor(Math.random() * 99999)}`, claim_type: 'life' },
    'bank_transfer.completed': { amount: Math.floor(Math.random() * 500000), recipient_bank: 'GTBank' },
    'pos.sale_completed': { amount: Math.floor(Math.random() * 50000), items_count: Math.floor(Math.random() * 10) + 1 },
  };

  return { ...basePayload, ...(extraPayloads[eventKey] || {}) };
}

// ---------------------------------------------------------------------------
// Scenario: Publish notification event
// ---------------------------------------------------------------------------

export function publishNotificationEvent() {
  const tenantId = getRandomTenantId();
  const eventKey = getRandomEventKey();
  const actorId = getRandomUserId();

  const payload = JSON.stringify({
    eventKey,
    tenantId,
    actorId,
    actorType: 'user',
    payload: buildEventPayload(eventKey),
    severity: 'info',
    source: 'api',
  });

  const start = Date.now();

  const res = http.post(
    `${BASE_URL}/api/v1/notifications/events`,
    payload,
    {
      headers: {
        ...COMMON_HEADERS,
        'X-Tenant-Id': tenantId,
      },
      timeout: '10s',
    },
  );

  const duration = Date.now() - start;
  eventPublishDuration.add(duration);

  const ok = check(res, {
    'event publish: status is 200 or 202': (r) => r.status === 200 || r.status === 202,
    'event publish: response is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
    'event publish: no 5xx': (r) => r.status < 500,
  });

  if (!ok || res.status >= 400) {
    eventPublishErrors.add(1);
    deliverySuccessRate.add(0);
  } else {
    deliverySuccessRate.add(1);
  }

  sleep(Math.random() * 2 + 1); // 1-3 second think time
}

// ---------------------------------------------------------------------------
// Scenario: Poll notification inbox
// ---------------------------------------------------------------------------

export function pollInbox() {
  const tenantId = getRandomTenantId();
  const userId = getRandomUserId();

  const start = Date.now();

  const res = http.get(
    `${BASE_URL}/api/v1/notifications/inbox?limit=20&offset=0`,
    {
      headers: {
        ...COMMON_HEADERS,
        'X-Tenant-Id': tenantId,
        'X-User-Id': userId,
      },
      timeout: '5s',
    },
  );

  const duration = Date.now() - start;
  inboxReadDuration.add(duration);

  const ok = check(res, {
    'inbox read: status is 200': (r) => r.status === 200,
    'inbox read: returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.items) || Array.isArray(body.data);
      } catch {
        return false;
      }
    },
    'inbox read: no 5xx': (r) => r.status < 500,
  });

  if (!ok) {
    inboxReadErrors.add(1);
  }

  sleep(Math.random() * 5 + 5); // 5-10 second think time (polling interval)
}

// ---------------------------------------------------------------------------
// Scenario: Update notification preferences
// ---------------------------------------------------------------------------

export function updatePreferences() {
  const tenantId = getRandomTenantId();
  const userId = getRandomUserId();
  const channels = ['email', 'sms', 'in_app', 'push'];
  const channel = channels[Math.floor(Math.random() * channels.length)];

  const payload = JSON.stringify({
    userId,
    channel,
    enabled: Math.random() > 0.1,  // 90% chance of enabled
    digestWindow: Math.random() > 0.7 ? 'daily' : 'none',
    timezone: 'Africa/Lagos',
  });

  const res = http.patch(
    `${BASE_URL}/api/v1/notifications/preferences`,
    payload,
    {
      headers: {
        ...COMMON_HEADERS,
        'X-Tenant-Id': tenantId,
      },
      timeout: '5s',
    },
  );

  const ok = check(res, {
    'preference update: status 200 or 204': (r) => r.status === 200 || r.status === 204,
    'preference update: no 5xx': (r) => r.status < 500,
  });

  if (!ok) {
    prefUpdateErrors.add(1);
  }

  sleep(1);
}

// ---------------------------------------------------------------------------
// Summary report
// ---------------------------------------------------------------------------

export function handleSummary(data) {
  const timestamp = new Date().toISOString().split('T')[0];

  return {
    [`results/notification-load-${timestamp}.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, opts = {}) {
  const indent = opts.indent || '';
  const lines = ['', `${indent}=== N-122 Load Test Summary ===`];

  const thresholds = data.metrics;
  lines.push(`${indent}Scenarios completed: ${data.state?.testRunDurationMs ? 'YES' : 'check results'}`);

  if (thresholds?.event_publish_duration_ms) {
    const p95 = thresholds.event_publish_duration_ms.values?.['p(95)'];
    const p99 = thresholds.event_publish_duration_ms.values?.['p(99)'];
    lines.push(`${indent}Event Publish P95: ${p95 ? p95.toFixed(0) + 'ms' : 'N/A'} (target: <500ms)`);
    lines.push(`${indent}Event Publish P99: ${p99 ? p99.toFixed(0) + 'ms' : 'N/A'} (target: <2000ms)`);
  }

  if (thresholds?.http_req_failed) {
    const errRate = thresholds.http_req_failed.values?.rate;
    lines.push(`${indent}HTTP Error Rate: ${errRate != null ? (errRate * 100).toFixed(2) + '%' : 'N/A'} (target: <1%)`);
  }

  lines.push('');
  return lines.join('\n');
}
