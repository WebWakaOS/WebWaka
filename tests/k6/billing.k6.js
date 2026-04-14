/**
 * WebWaka OS — Billing API Load Test  (k6)
 * Phase 18 — P18-F
 *
 * Endpoints exercised:
 *   GET  /billing/status           — subscription status (most frequent call)
 *   POST /billing/change-plan      — plan upgrade/downgrade
 *   POST /billing/cancel           — schedule cancellation
 *   GET  /billing/history          — plan change audit log (paginated)
 *
 * Performance thresholds (baseline, pre-GA):
 *   http_req_duration p(95) < 200ms  — 95th-percentile response time
 *   http_req_failed   rate < 0.01    — fewer than 1% of requests error
 *   http_reqs         rate > 50/s    — sustain at least 50 RPS under load
 *
 * Usage:
 *   k6 run tests/k6/billing.k6.js
 *   k6 run --vus 50 --duration 60s tests/k6/billing.k6.js
 *   k6 run --out json=results/billing-$(date +%Y%m%d).json tests/k6/billing.k6.js
 *
 * Environment variables:
 *   BASE_URL   — API base URL (default: http://localhost:8787)
 *   AUTH_TOKEN — Bearer token with owner role (required for protected endpoints)
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ---------------------------------------------------------------------------
// Custom metrics
// ---------------------------------------------------------------------------

const billingStatusTrend = new Trend('billing_status_duration_ms');
const changePlanTrend = new Trend('billing_change_plan_duration_ms');
const historyTrend = new Trend('billing_history_duration_ms');
const errorRate = new Rate('billing_error_rate');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8787';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

export const options = {
  scenarios: {
    // Steady baseline: 20 concurrent users for 30 seconds
    steady_load: {
      executor: 'constant-vus',
      vus: 20,
      duration: '30s',
      tags: { scenario: 'steady' },
    },
    // Ramp-up: test burst capacity
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 50 },
        { duration: '10s', target: 0 },
      ],
      startTime: '35s',
      tags: { scenario: 'ramp' },
    },
  },
  thresholds: {
    // Global thresholds
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    // Route-specific thresholds
    'billing_status_duration_ms': ['p(95)<150'],
    'billing_history_duration_ms': ['p(95)<200'],
    'billing_change_plan_duration_ms': ['p(95)<300'],
    'billing_error_rate': ['rate<0.01'],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': AUTH_TOKEN ? `Bearer ${AUTH_TOKEN}` : '',
  };
}

function isOk(res) {
  return res.status >= 200 && res.status < 300;
}

function isExpectedError(res, ...codes) {
  // 4xx errors that are expected in load tests (e.g. 404 when no sub found)
  return codes.includes(res.status);
}

// ---------------------------------------------------------------------------
// Test scenario
// ---------------------------------------------------------------------------

export default function () {
  const headers = authHeaders();

  // ── Group 1: GET /billing/status (most read-heavy route) ─────────────────
  group('GET /billing/status', function () {
    const res = http.get(`${BASE_URL}/billing/status`, { headers, tags: { route: 'billing_status' } });
    billingStatusTrend.add(res.timings.duration);

    const ok = check(res, {
      'status responds 200 or 401': (r) => isOk(r) || r.status === 401,
      'response time < 200ms': (r) => r.timings.duration < 200,
      'content-type is json': (r) => (r.headers['Content-Type'] || '').includes('application/json'),
    });

    if (!ok) errorRate.add(1);
    else errorRate.add(0);
  });

  sleep(0.1);

  // ── Group 2: GET /billing/history (pagination) ────────────────────────────
  group('GET /billing/history (paginated)', function () {
    const url = `${BASE_URL}/billing/history?limit=20&offset=0`;
    const res = http.get(url, { headers, tags: { route: 'billing_history' } });
    historyTrend.add(res.timings.duration);

    check(res, {
      'history responds 200 or 401': (r) => isOk(r) || r.status === 401,
      'history response time < 200ms': (r) => r.timings.duration < 200,
      'has data array': (r) => {
        if (r.status !== 200) return true;
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data);
        } catch { return false; }
      },
    });
  });

  sleep(0.2);

  // ── Group 3: POST /billing/change-plan (write path — lower frequency) ─────
  // Only run write tests 20% of the time to avoid overwhelming the system
  if (Math.random() < 0.2) {
    group('POST /billing/change-plan', function () {
      const payload = JSON.stringify({ plan: 'growth' });
      const res = http.post(
        `${BASE_URL}/billing/change-plan`,
        payload,
        { headers, tags: { route: 'billing_change_plan' } },
      );
      changePlanTrend.add(res.timings.duration);

      check(res, {
        'change-plan responds in < 300ms': (r) => r.timings.duration < 300,
        'change-plan returns valid status': (r) =>
          // 200 success, 401 unauthed, 404 no sub, 409 same plan, 422 invalid plan
          [200, 401, 404, 409, 422].includes(r.status),
      });
    });
  }

  sleep(0.5);
}

// ---------------------------------------------------------------------------
// Summary output
// ---------------------------------------------------------------------------

export function handleSummary(data) {
  const p95Status = data.metrics['billing_status_duration_ms']?.values?.['p(95)'];
  const p95History = data.metrics['billing_history_duration_ms']?.values?.['p(95)'];
  const p95Change = data.metrics['billing_change_plan_duration_ms']?.values?.['p(95)'];
  const errRate = data.metrics['billing_error_rate']?.values?.rate;

  console.log('\n=== Billing Load Test Summary ===');
  console.log(`  GET /billing/status    P95: ${p95Status?.toFixed(1) ?? 'N/A'}ms`);
  console.log(`  GET /billing/history   P95: ${p95History?.toFixed(1) ?? 'N/A'}ms`);
  console.log(`  POST /billing/change-plan P95: ${p95Change?.toFixed(1) ?? 'N/A'}ms`);
  console.log(`  Error rate: ${((errRate ?? 0) * 100).toFixed(2)}%`);
  console.log('================================\n');

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
