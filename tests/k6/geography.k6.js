/**
 * WebWaka OS — Geography & Discovery API Load Test (k6)
 * Phase 18 — P18-F
 *
 * Endpoints exercised (all public — no auth required):
 *   GET /geography/states           — list all 37 Nigerian states
 *   GET /geography/lgas/:state      — LGAs for a state
 *   GET /geography/ancestry/:lgaId  — full ancestry chain for an LGA
 *   GET /discovery?state=...        — discovery search with state filter
 *
 * These are high-frequency, read-only, geography-anchored endpoints.
 * PERF-11 batch() optimisation should keep ancestry < 80ms at P95.
 *
 * Thresholds:
 *   http_req_duration p(95) < 150ms for geography endpoints
 *   http_req_duration p(95) < 200ms for discovery
 *   http_req_failed   rate  < 0.005 (0.5% — lower tolerance for public routes)
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const statesTrend = new Trend('geo_states_duration_ms');
const lgasTrend = new Trend('geo_lgas_duration_ms');
const ancestryTrend = new Trend('geo_ancestry_duration_ms');
const discoveryTrend = new Trend('discovery_duration_ms');
const errorRate = new Rate('geo_error_rate');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8787';

// Sample of Nigerian state codes for varied requests
const STATES = ['lagos', 'abuja', 'kano', 'rivers', 'ogun', 'enugu', 'anambra', 'delta'];
const LGA_IDS = ['lagos-ikeja', 'lagos-surulere', 'abuja-abuja', 'kano-kano', 'rivers-portharcourt'];

export const options = {
  scenarios: {
    geography_read: {
      executor: 'constant-vus',
      vus: 25,
      duration: '45s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<400'],
    http_req_failed: ['rate<0.005'],
    'geo_states_duration_ms': ['p(95)<100'],
    'geo_lgas_duration_ms': ['p(95)<150'],
    'geo_ancestry_duration_ms': ['p(95)<150'],
    'discovery_duration_ms': ['p(95)<200'],
    'geo_error_rate': ['rate<0.005'],
  },
};

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function () {
  group('GET /geography/states', function () {
    const res = http.get(`${BASE_URL}/geography/states`);
    statesTrend.add(res.timings.duration);
    const ok = check(res, {
      'states status 200': (r) => r.status === 200,
      'states response time < 100ms': (r) => r.timings.duration < 100,
      'states returns array': (r) => {
        try { return Array.isArray(JSON.parse(r.body)); } catch { return false; }
      },
    });
    errorRate.add(ok ? 0 : 1);
  });

  sleep(0.05);

  group('GET /geography/lgas/:state', function () {
    const state = randomElement(STATES);
    const res = http.get(`${BASE_URL}/geography/lgas/${state}`);
    lgasTrend.add(res.timings.duration);
    check(res, {
      'lgas status 200 or 404': (r) => [200, 404].includes(r.status),
      'lgas response time < 150ms': (r) => r.timings.duration < 150,
    });
  });

  sleep(0.05);

  group('GET /geography/ancestry/:lgaId (PERF-11 batch)', function () {
    const lgaId = randomElement(LGA_IDS);
    const res = http.get(`${BASE_URL}/geography/ancestry/${lgaId}`);
    ancestryTrend.add(res.timings.duration);
    check(res, {
      'ancestry status 200 or 404': (r) => [200, 404].includes(r.status),
      'ancestry response time < 150ms (PERF-11 threshold)': (r) => r.timings.duration < 150,
    });
  });

  sleep(0.1);

  group('GET /discovery (state filter)', function () {
    const state = randomElement(STATES);
    const res = http.get(`${BASE_URL}/discovery?state=${state}&limit=20`);
    discoveryTrend.add(res.timings.duration);
    check(res, {
      'discovery status 200 or 4xx': (r) => [200, 400, 401, 404].includes(r.status),
      'discovery response time < 200ms': (r) => r.timings.duration < 200,
    });
  });

  sleep(0.3);
}
