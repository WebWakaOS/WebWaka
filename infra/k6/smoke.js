/**
 * k6 Smoke Test — WebWaka OS API
 *
 * Tests critical API endpoints with minimal load to verify baseline health.
 * Runs in CI on every push to staging (T012 — P21-P25 coverage added).
 *
 * Thresholds:
 *   - http_req_duration p(95) < 500ms (edge-first — CF Workers target)
 *   - http_req_failed < 0.01 (< 1% error rate)
 *
 * Run locally:
 *   k6 run --env BASE_URL=http://localhost:8787 infra/k6/smoke.js
 *
 * Run in CI:
 *   k6 run --env BASE_URL=${{ env.API_BASE_URL }} infra/k6/smoke.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8787';
const JWT_TOKEN = __ENV.JWT_TOKEN || '';
const SUPER_ADMIN_JWT = __ENV.SUPER_ADMIN_JWT || '';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const authHeaders = {
  Authorization: `Bearer ${JWT_TOKEN}`,
  'Content-Type': 'application/json',
};

const superAdminHeaders = {
  Authorization: `Bearer ${SUPER_ADMIN_JWT}`,
  'Content-Type': 'application/json',
};

export default function () {
  // -------------------------------------------------------------------------
  // Health + version (P0 — always smoke these first)
  // -------------------------------------------------------------------------

  const health = http.get(`${BASE_URL}/health`);
  check(health, {
    'GET /health → 200': (r) => r.status === 200,
    'GET /health → has status field': (r) => JSON.parse(r.body).status === 'ok',
  });

  const version = http.get(`${BASE_URL}/version`);
  check(version, {
    'GET /version → 200': (r) => r.status === 200,
    'GET /version → has version field': (r) => !!JSON.parse(r.body).version,
  });

  sleep(0.1);

  // -------------------------------------------------------------------------
  // Geography routes (public)
  // -------------------------------------------------------------------------

  const states = http.get(`${BASE_URL}/geography/states`);
  check(states, {
    'GET /geography/states → 200': (r) => r.status === 200,
  });

  sleep(0.1);

  // -------------------------------------------------------------------------
  // P24: FX Rates (public GET endpoints — T012)
  // -------------------------------------------------------------------------

  const fxRates = http.get(`${BASE_URL}/fx-rates`);
  check(fxRates, {
    'GET /fx-rates → 200 or 200 with empty': (r) => r.status === 200,
    'GET /fx-rates → has rates array': (r) => Array.isArray(JSON.parse(r.body).rates),
  });

  sleep(0.1);

  // -------------------------------------------------------------------------
  // Auth — protected routes should return 401 without JWT
  // -------------------------------------------------------------------------

  const noAuthMe = http.get(`${BASE_URL}/auth/me`);
  check(noAuthMe, {
    'GET /auth/me without JWT → 401': (r) => r.status === 401,
  });

  const noAuthBankTransfer = http.get(`${BASE_URL}/bank-transfer?workspace_id=test`);
  check(noAuthBankTransfer, {
    'GET /bank-transfer without JWT → 401': (r) => r.status === 401,
  });

  const noAuthB2b = http.get(`${BASE_URL}/b2b/rfqs`);
  check(noAuthB2b, {
    'GET /b2b/rfqs without JWT → 401': (r) => r.status === 401,
  });

  const noAuthAnalytics = http.get(`${BASE_URL}/analytics/workspace/test-ws/summary`);
  check(noAuthAnalytics, {
    'GET /analytics/workspace without JWT → 401': (r) => r.status === 401,
  });

  // P24: POST /fx-rates without JWT must return 401 (not 403) — SEC-002 regression guard
  const noAuthFxPost = http.post(`${BASE_URL}/fx-rates`, JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(noAuthFxPost, {
    'POST /fx-rates without JWT → 401': (r) => r.status === 401,
  });

  sleep(0.1);

  // -------------------------------------------------------------------------
  // OpenAPI spec is reachable
  // -------------------------------------------------------------------------

  const openapi = http.get(`${BASE_URL}/openapi.json`);
  check(openapi, {
    'GET /openapi.json → 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
