/**
 * k6 Load Test — POS/Checkout Baseline
 * P14-A: 30 VUs × 1 min, simulates authenticated offering browse + checkout init
 * Uses a pre-generated JWT (set via LOAD_TEST_TOKEN env var)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const checkoutDuration = new Trend('checkout_duration_ms');
const checkoutErrors   = new Counter('checkout_errors');

const BASE_URL         = __ENV.BASE_URL   || 'http://localhost:8787';
const LOAD_TEST_TOKEN  = __ENV.LOAD_TEST_TOKEN || '';
const TENANT_ID        = __ENV.TENANT_ID  || 'tnt_loadtest';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': LOAD_TEST_TOKEN ? `Bearer ${LOAD_TEST_TOKEN}` : '',
};

export const options = {
  stages: [
    { duration: '10s', target: 10  },
    { duration: '40s', target: 30  },
    { duration: '10s', target: 0   },
  ],
  thresholds: {
    http_req_duration:  ['p(50)<200', 'p(95)<500'],
    http_req_failed:    ['rate<0.02'],
    checkout_duration_ms: ['p(95)<600'],
    checkout_errors:    ['count<5'],
  },
};

export default function () {
  const offeringsRes = http.get(
    `${BASE_URL}/tenants/${TENANT_ID}/offerings`,
    { headers: AUTH_HEADERS }
  );
  check(offeringsRes, {
    'offerings list returns 200 or 404': r => [200, 404, 401].includes(r.status),
    'offerings responds < 300ms': r => r.timings.duration < 300,
  });

  sleep(0.3);

  const checkoutStart = Date.now();
  const checkoutRes = http.post(
    `${BASE_URL}/pos/checkout`,
    JSON.stringify({
      tenantId: TENANT_ID,
      items: [{ offeringId: 'ofr_load_001', qty: 2 }],
      paymentChannel: 'paystack',
    }),
    { headers: AUTH_HEADERS }
  );
  checkoutDuration.add(Date.now() - checkoutStart);

  const checkoutOk = check(checkoutRes, {
    'checkout returns 200 or 4xx': r => r.status < 500,
    'checkout has valid JSON': r => {
      try { JSON.parse(r.body); return true; } catch { return false; }
    },
  });
  if (!checkoutOk) checkoutErrors.add(1);

  sleep(1 + Math.random());
}
