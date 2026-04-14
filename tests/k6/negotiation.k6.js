/**
 * WebWaka OS — Negotiation API Load Test (k6)
 * Phase 18 — P18-F
 *
 * Endpoints exercised:
 *   GET  /api/v1/negotiation/policy                — vendor pricing policy read
 *   GET  /api/v1/negotiation/sessions              — list sessions (merged buyer+seller)
 *   POST /api/v1/negotiation/sessions              — open negotiation session
 *   GET  /api/v1/negotiation/analytics             — seller analytics dashboard
 *
 * Performance thresholds:
 *   http_req_duration p(95) < 250ms
 *   http_req_failed   rate  < 0.01
 *
 * Usage:
 *   k6 run tests/k6/negotiation.k6.js
 *   BASE_URL=https://api.webwaka.com AUTH_TOKEN=<jwt> k6 run tests/k6/negotiation.k6.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const policyTrend = new Trend('neg_policy_duration_ms');
const sessionsTrend = new Trend('neg_sessions_duration_ms');
const openSessionTrend = new Trend('neg_open_session_duration_ms');
const analyticsTrend = new Trend('neg_analytics_duration_ms');
const errorRate = new Rate('neg_error_rate');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8787';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

export const options = {
  scenarios: {
    read_heavy: {
      executor: 'constant-vus',
      vus: 15,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<250', 'p(99)<600'],
    http_req_failed: ['rate<0.01'],
    'neg_policy_duration_ms': ['p(95)<200'],
    'neg_sessions_duration_ms': ['p(95)<250'],
    'neg_analytics_duration_ms': ['p(95)<300'],
    'neg_error_rate': ['rate<0.01'],
  },
};

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': AUTH_TOKEN ? `Bearer ${AUTH_TOKEN}` : '',
  };
}

export default function () {
  const hdrs = headers();

  group('GET /api/v1/negotiation/policy', function () {
    const res = http.get(`${BASE_URL}/api/v1/negotiation/policy`, { headers: hdrs });
    policyTrend.add(res.timings.duration);
    const ok = check(res, {
      'policy responds 200 or 4xx': (r) => [200, 400, 401, 404].includes(r.status),
      'policy response time < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(ok ? 0 : 1);
  });

  sleep(0.1);

  group('GET /api/v1/negotiation/sessions', function () {
    const res = http.get(`${BASE_URL}/api/v1/negotiation/sessions`, { headers: hdrs });
    sessionsTrend.add(res.timings.duration);
    check(res, {
      'sessions responds 200 or 4xx': (r) => [200, 400, 401].includes(r.status),
      'sessions response time < 250ms': (r) => r.timings.duration < 250,
    });
  });

  sleep(0.1);

  group('GET /api/v1/negotiation/analytics', function () {
    const res = http.get(`${BASE_URL}/api/v1/negotiation/analytics`, { headers: hdrs });
    analyticsTrend.add(res.timings.duration);
    check(res, {
      'analytics responds 200 or 4xx': (r) => [200, 400, 401].includes(r.status),
      'analytics response time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  // Write ops at 10% frequency
  if (Math.random() < 0.1) {
    group('POST /api/v1/negotiation/sessions', function () {
      const payload = JSON.stringify({
        listing_type: 'product',
        listing_id: `load_test_prod_${Math.floor(Math.random() * 1000)}`,
        seller_workspace_id: 'wsp_load_test',
        initial_offer_kobo: 500000,
      });
      const res = http.post(`${BASE_URL}/api/v1/negotiation/sessions`, payload, { headers: hdrs });
      openSessionTrend.add(res.timings.duration);
      check(res, {
        'open session responds 201 or 4xx': (r) => [201, 400, 401, 422].includes(r.status),
      });
    });
  }

  sleep(0.5);
}
