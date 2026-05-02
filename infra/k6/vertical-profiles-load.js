/**
 * k6 Load Test — Vertical Profile List (Wave 3 C5-3)
 *
 * 100 concurrent reads to GET /v1/vertical/:slug/profiles
 * assert P95 < 500ms
 *
 * Usage:
 *   k6 run --env BASE_URL=https://api-staging.webwaka.com \
 *           --env API_KEY=$STAGING_API_KEY \
 *           --out json=results-vertical.json \
 *           infra/k6/vertical-profiles-load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate   = new Rate('vertical_error_rate');
const readLatency = new Trend('vertical_read_ms', true);

const VERTICALS = [
  'fashion', 'food-beverage', 'electronics', 'beauty', 'health-pharma',
  'agriculture', 'logistics', 'fintech', 'education', 'professional-services',
];

export const options = {
  scenarios: {
    concurrent_reads: {
      executor: 'constant-vus',
      vus: 100,
      duration: '3m',
    },
  },
  thresholds: {
    // C5-3 requirement: P95 < 500ms
    'vertical_read_ms': ['p(95)<500'],
    'vertical_error_rate': ['rate<0.01'],
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8787';
const API_KEY  = __ENV.API_KEY  || 'smoke-test-key';

export default function () {
  const slug = VERTICALS[Math.floor(Math.random() * VERTICALS.length)];
  const url  = `${BASE_URL}/v1/vertical/${slug}/profiles?limit=20`;

  const res = http.get(url, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
    timeout: '5s',
  });

  const ok = check(res, {
    'status 200 or 404 (valid slug)': (r) => r.status === 200 || r.status === 404,
    'no server error':                (r) => r.status < 500,
  });

  errorRate.add(!ok);
  readLatency.add(res.timings.duration);

  sleep(Math.random() * 0.5); // up to 500ms think time
}

export function handleSummary(data) {
  return {
    'results-vertical-profiles.json': JSON.stringify(data),
    stdout: `
╔══════════════════════════════════════════════════════╗
║  Vertical Profile List Load Test Summary (C5-3)     ║
╠══════════════════════════════════════════════════════╣
║  VUs: 100   Duration: 3m                            ║
║  P50: ${data.metrics?.vertical_read_ms?.values?.['p(50)']?.toFixed(0) ?? 'N/A'} ms                                   ║
║  P95: ${data.metrics?.vertical_read_ms?.values?.['p(95)']?.toFixed(0) ?? 'N/A'} ms  (threshold: <500ms)             ║
║  Error rate: ${((data.metrics?.vertical_error_rate?.values?.rate ?? 0) * 100).toFixed(2)}%                                   ║
╚══════════════════════════════════════════════════════╝
`,
  };
}
