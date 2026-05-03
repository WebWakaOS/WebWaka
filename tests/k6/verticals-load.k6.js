/**
 * WebWaka OS — Verticals Load Test (k6)
 * Release Gate G2 — P95 < 500ms for verticals endpoints
 *
 * Endpoints exercised:
 *   GET  /verticals                    — full list (159+ verticals)
 *   GET  /verticals/:code              — single vertical detail
 *   GET  /verticals/search?q=:query    — search by keyword
 *   GET  /verticals/category/:category — filter by category
 *
 * Performance thresholds (production gate G2):
 *   http_req_duration p(95) < 500ms  — 95th-percentile list response
 *   http_req_duration p(50) < 150ms  — median list response (CDN-cached)
 *   http_req_failed   rate < 0.01    — < 1% error rate
 *
 * Load profile:
 *   Ramp 0→100 VUs over 30s, sustain 100 VUs for 2 min, ramp down 30s
 *   (Verticals are CDN-cached — high concurrency is appropriate)
 *
 * Usage:
 *   BASE_URL=https://api.webwaka.com \
 *   k6 run tests/k6/verticals-load.k6.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Custom Metrics ───────────────────────────────────────────────────────────

const listT    = new Trend('verticals_list_duration_ms');
const detailT  = new Trend('verticals_detail_duration_ms');
const searchT  = new Trend('verticals_search_duration_ms');
const errorRate= new Rate('verticals_error_rate');

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8787';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // ramp up
    { duration: '2m',  target: 100 },  // sustain
    { duration: '30s', target: 0   },  // ramp down
  ],
  thresholds: {
    http_req_duration:         ['p(95)<500', 'p(50)<150'],
    http_req_failed:           ['rate<0.01'],
    verticals_list_duration_ms:['p(95)<500', 'p(50)<150'],
    verticals_error_rate:      ['rate<0.01'],
  },
};

// ─── Sample data ──────────────────────────────────────────────────────────────

const VERTICAL_CODES = [
  'restaurant', 'pharmacy', 'school', 'pos-business', 'cooperative',
  'farm', 'church', 'market', 'hotel', 'logistics-delivery',
  'clinic', 'hair-salon', 'fashion-brand', 'bakery', 'supermarket',
];

const SEARCH_QUERIES = ['food', 'health', 'school', 'market', 'transport', 'agri'];
const CATEGORIES = ['commerce', 'health', 'education', 'transport', 'civic'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Scenario ─────────────────────────────────────────────────────────────────

export default function () {
  const pick = Math.random();

  if (pick < 0.50) {
    // 50% — full list (most common, should be CDN-cached)
    group('list verticals', function () {
      const res = http.get(`${BASE_URL}/verticals`);
      const ok = check(res, {
        'list: status 200': (r) => r.status === 200,
        'list: has data':   (r) => {
          try {
            const b = JSON.parse(r.body);
            return Array.isArray(b) ? b.length >= 100 : Array.isArray(b?.data) && b.data.length >= 100;
          } catch { return false; }
        },
        'list: p95 < 500ms': (r) => r.timings.duration < 500,
      });
      listT.add(res.timings.duration);
      if (!ok) errorRate.add(1);
    });

  } else if (pick < 0.75) {
    // 25% — single vertical detail
    group('vertical detail', function () {
      const code = randomItem(VERTICAL_CODES);
      const res = http.get(`${BASE_URL}/verticals/${code}`);
      check(res, {
        'detail: status 200 or 404': (r) => r.status === 200 || r.status === 404,
        'detail: p95 < 500ms':       (r) => r.timings.duration < 500,
      });
      detailT.add(res.timings.duration);
    });

  } else if (pick < 0.90) {
    // 15% — search
    group('search verticals', function () {
      const q = encodeURIComponent(randomItem(SEARCH_QUERIES));
      const res = http.get(`${BASE_URL}/verticals/search?q=${q}`);
      check(res, {
        'search: status 200':    (r) => r.status === 200,
        'search: p95 < 500ms':   (r) => r.timings.duration < 500,
      });
      searchT.add(res.timings.duration);
    });

  } else {
    // 10% — category filter
    group('category filter', function () {
      const cat = encodeURIComponent(randomItem(CATEGORIES));
      const res = http.get(`${BASE_URL}/verticals/category/${cat}`);
      check(res, {
        'category: status 200 or 404': (r) => r.status === 200 || r.status === 404,
        'category: p95 < 500ms':       (r) => r.timings.duration < 500,
      });
    });
  }

  sleep(0.1 + Math.random() * 0.3);
}

export function handleSummary(data) {
  const p50  = data.metrics?.verticals_list_duration_ms?.values?.['p(50)']?.toFixed(0)  ?? '—';
  const p95  = data.metrics?.verticals_list_duration_ms?.values?.['p(95)']?.toFixed(0)  ?? '—';
  const errs = (data.metrics?.verticals_error_rate?.values?.rate * 100)?.toFixed(2)      ?? '—';

  const passed = Number(p95) < 500 && Number(errs) < 1;

  console.log('\n─────────────────────────────────────────');
  console.log('  Verticals Load Test Summary');
  console.log(`  List p50:  ${p50}ms  (target: <150ms)`);
  console.log(`  List p95:  ${p95}ms  (target: <500ms)  ${Number(p95) < 500 ? '✅' : '❌'}`);
  console.log(`  Error rate: ${errs}% (target: <1%)     ${Number(errs) < 1 ? '✅' : '❌'}`);
  console.log(`  Gate G2:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('─────────────────────────────────────────\n');

  return { stdout: '' };
}
