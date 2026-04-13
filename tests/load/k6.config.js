/**
 * k6 Load Test Configuration — WebWaka OS
 * P14-A: Baseline load scenarios for auth, discovery, checkout
 *
 * Usage:
 *   k6 run tests/load/auth-baseline.js
 *   k6 run tests/load/discovery-baseline.js
 *   k6 run tests/load/checkout-baseline.js
 *
 * Environment:
 *   BASE_URL=https://api.webwaka.com k6 run tests/load/auth-baseline.js
 *
 * Targets (P50 < 200ms, P95 < 500ms, error rate < 1%):
 *   auth    : 50 VUs × 1 min
 *   discovery: 100 VUs × 2 min
 *   checkout: 30 VUs × 1 min
 */

export const THRESHOLDS = {
  http_req_duration: ['p(50)<200', 'p(95)<500', 'p(99)<1000'],
  http_req_failed:   ['rate<0.01'],
  http_reqs:         ['rate>10'],
};

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8787';
