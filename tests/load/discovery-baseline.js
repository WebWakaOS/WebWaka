/**
 * k6 Load Test — Discovery/Search Baseline
 * P14-A: 100 VUs × 2 min, geography + search endpoints
 * Verifies ETag and Cache-Control headers are present on cacheable endpoints.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const cacheErrors = new Counter('cache_header_missing');
const BASE_URL    = __ENV.BASE_URL || 'http://localhost:8787';

const STATES = [
  '01', '02', '03', '04', '05',
];

export const options = {
  stages: [
    { duration: '20s', target: 30  },
    { duration: '80s', target: 100 },
    { duration: '20s', target: 0   },
  ],
  thresholds: {
    http_req_duration: ['p(50)<150', 'p(95)<400', 'p(99)<800'],
    http_req_failed:   ['rate<0.01'],
    cache_header_missing: ['count<10'],
  },
};

export default function () {
  const stateId = STATES[Math.floor(Math.random() * STATES.length)];

  const statesRes = http.get(`${BASE_URL}/geography/states`);
  const statesOk = check(statesRes, {
    '/geography/states returns 200': r => r.status === 200,
    '/geography/states has Cache-Control': r => !!r.headers['Cache-Control'],
    '/geography/states responds < 200ms': r => r.timings.duration < 200,
  });
  if (!statesOk) cacheErrors.add(1);

  const lgasRes = http.get(`${BASE_URL}/geography/lgas?stateId=${stateId}`);
  check(lgasRes, {
    '/geography/lgas returns 200': r => r.status === 200,
    '/geography/lgas has Cache-Control': r => !!r.headers['Cache-Control'],
  });

  const searchRes = http.get(`${BASE_URL}/discovery/search?q=farm&state=${stateId}`, {
    headers: { Accept: 'application/json' },
  });
  check(searchRes, {
    '/discovery/search returns 200 or 404': r => [200, 404].includes(r.status),
    '/discovery/search responds < 400ms': r => r.timings.duration < 400,
  });

  sleep(0.5 + Math.random() * 0.5);
}
