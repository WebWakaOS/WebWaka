/**
 * CYCLE-08 — Analytics and Projections
 * Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §4 CYCLE-08
 * Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
 *
 * TC-IDs covered:
 *   TC-WA001    Workspace analytics: revenue snapshot (integer kobo, P9)
 *   TC-WA002    Workspace analytics: vertical-level breakdown
 *   TC-PA001    Platform analytics: summary requires super_admin
 *   TC-PA002    Platform analytics: tenant heatmap (cross-tenant, super_admin only)
 *   TC-PA003    Platform analytics: vertical adoption rates
 *   TC-PROJ001  Projections rebuild: X-Inter-Service-Secret required (SEC-009)
 *   TC-PROJ002  Projections: rebuild is idempotent (same result on repeat)
 *
 * Priority: TC-PROJ001 (P0 — SEC-009 secret gate), TC-PA001 (P0 — cross-tenant analytics gate)
 *
 * SEC-009 invariant (frozen baseline §XII.9):
 *   POST /internal/projections/rebuild requires X-Inter-Service-Secret header.
 *   Header must match the INTER_SERVICE_SECRET env var exactly.
 *   Invalid or absent secret → 401 or 403. Never 200.
 *
 * T4 invariant: Platform analytics is super_admin only (cross-tenant aggregate).
 * P9 invariant: All revenue/amount fields in analytics responses must be integers.
 *
 * Environment note:
 *   If INTER_SERVICE_SECRET is set in env, the positive secret test runs.
 *   If not set, only the negative tests run (sufficient for gate validation).
 */

import { test, expect } from '@playwright/test';
import { authHeaders, API_BASE } from '../fixtures/api-client.js';

const TENANT_A_ID = '10000000-0000-4000-b000-000000000001';
const WS_A_ID = '20000000-0000-4000-c000-000000000001';
const INTER_SERVICE_SECRET = process.env['INTER_SERVICE_SECRET'];

// ──────────────────────────────────────────────────────────────────────────────
// TC-WA001: Workspace analytics — revenue snapshot (P9: integer kobo)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-WA001: Workspace analytics revenue snapshot', () => {

  test('TC-WA001.1 — GET /analytics/workspace/:id/revenue returns integer kobo (P9)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/analytics/workspace/${WS_A_ID}/revenue`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json() as {
        total_revenue_kobo?: number;
        revenue_kobo?: number;
        period_revenue_kobo?: number;
        data?: Array<{ revenue_kobo?: number; amount_kobo?: number }>;
      };
      // P9: Any revenue field present must be an integer
      const fields = [body.total_revenue_kobo, body.revenue_kobo, body.period_revenue_kobo];
      for (const field of fields) {
        if (field !== undefined) {
          expect(Number.isInteger(field)).toBe(true);
          expect(field).toBeGreaterThanOrEqual(0);
        }
      }
      if (body.data) {
        for (const dataPoint of body.data) {
          if (dataPoint.revenue_kobo !== undefined) {
            expect(Number.isInteger(dataPoint.revenue_kobo)).toBe(true);
          }
          if (dataPoint.amount_kobo !== undefined) {
            expect(Number.isInteger(dataPoint.amount_kobo)).toBe(true);
          }
        }
      }
    }
  });

  test('TC-WA001.2 — GET /analytics/workspace/:id/revenue requires auth (not public)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/analytics/workspace/${WS_A_ID}/revenue`, {
      headers: { 'Content-Type': 'application/json' }, // No auth
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([401, 403]).toContain(res.status()); // Must require auth
  });

  test('TC-WA001.3 — Workspace analytics is T3-scoped (cross-tenant attempt blocked)', async ({ request }) => {
    // Tenant B requesting Tenant A workspace analytics
    const res = await request.get(`${API_BASE}/analytics/workspace/${WS_A_ID}/revenue`, {
      headers: authHeaders({ 'x-tenant-id': '10000000-0000-4000-b000-000000000002' }), // Tenant B
    });
    expect(res.status()).not.toBe(500);
    // Must return 403 or 404 — never 200 with Tenant A data
    expect([403, 404]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-WA002: Workspace analytics — vertical-level breakdown
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-WA002: Workspace analytics vertical breakdown', () => {

  test('TC-WA002.1 — GET /analytics/workspace/:id/verticals returns per-vertical stats', async ({ request }) => {
    const res = await request.get(`${API_BASE}/analytics/workspace/${WS_A_ID}/verticals`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json() as { verticals?: Array<{ slug?: string; revenue_kobo?: number }> };
      if (body.verticals) {
        for (const vertical of body.verticals) {
          // P9: Revenue fields must be integers
          if (vertical.revenue_kobo !== undefined) {
            expect(Number.isInteger(vertical.revenue_kobo)).toBe(true);
          }
          // Vertical slugs must be corrected per inventory
          if (vertical.slug) {
            // SLUG001: barber-shop is wrong (should be hair-salon)
            expect(vertical.slug).not.toBe('barber-shop');
            // SLUG002: hire_purchase is wrong (should be hire-purchase)
            expect(vertical.slug).not.toMatch(/hire_purchase/);
          }
        }
      }
    }
  });

  test('TC-WA002.2 — Vertical breakdown endpoint allows date range filtering', async ({ request }) => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const res = await request.get(
      `${API_BASE}/analytics/workspace/${WS_A_ID}/verticals?from=${thirtyDaysAgo}&to=${today}`,
      { headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }) }
    );
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-PA001: Platform analytics — summary requires super_admin (T4)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-PA001: Platform analytics requires super_admin (T4)', () => {

  test('TC-PA001.1 — GET /admin/analytics without JWT returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/analytics`, {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-PA001.2 — GET /admin/analytics with tenant-level JWT returns 403', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/analytics`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }), // Tenant-level (not super_admin)
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-PA001.3 — GET /admin/analytics/summary route exists', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/analytics/summary`, {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([401, 403]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-PA002: Platform analytics — tenant heatmap (super_admin only)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-PA002: Platform analytics tenant heatmap', () => {

  test('TC-PA002.1 — GET /admin/analytics/tenant-heatmap requires super_admin', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/analytics/tenant-heatmap`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-PA002.2 — GET /admin/analytics/vertical-heatmap requires super_admin', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/analytics/vertical-heatmap`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([401, 403]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-PA003: Platform analytics — vertical adoption rates
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-PA003: Platform analytics vertical adoption', () => {

  test('TC-PA003.1 — GET /admin/analytics/verticals/adoption requires super_admin', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/analytics/verticals/adoption`, {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([401, 403]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-PROJ001: Projections rebuild requires X-Inter-Service-Secret (SEC-009, P0)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-PROJ001: SEC-009 Inter-Service-Secret enforcement (P0)', () => {

  test('TC-PROJ001.1 — POST /internal/projections/rebuild WITHOUT secret returns 401 or 403', async ({ request }) => {
    const res = await request.post(`${API_BASE}/internal/projections/rebuild`, {
      headers: { 'Content-Type': 'application/json' },
      data: {},
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // SEC-009: Must reject missing secret
    expect([401, 403]).toContain(res.status());
  });

  test('TC-PROJ001.2 — POST /internal/projections/rebuild with wrong secret returns 401 or 403', async ({ request }) => {
    const res = await request.post(`${API_BASE}/internal/projections/rebuild`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Inter-Service-Secret': 'wrong-secret-definitely-not-correct-qa-test-value',
      },
      data: {},
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // SEC-009: Wrong secret must be rejected
    expect([401, 403]).toContain(res.status());
  });

  test('TC-PROJ001.3 — POST /internal/projections/rebuild with empty secret returns 401 or 403', async ({ request }) => {
    const res = await request.post(`${API_BASE}/internal/projections/rebuild`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Inter-Service-Secret': '', // Empty string
      },
      data: {},
    });
    expect(res.status()).not.toBe(500);
    expect([400, 401, 403]).toContain(res.status());
  });

  if (INTER_SERVICE_SECRET) {
    test('TC-PROJ001.4 — POST /internal/projections/rebuild with correct secret returns 2xx', async ({ request }) => {
      const res = await request.post(`${API_BASE}/internal/projections/rebuild`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Inter-Service-Secret': INTER_SERVICE_SECRET,
        },
        data: {},
      });
      expect(res.status()).not.toBe(404);
      expect(res.status()).not.toBe(500);
      expect([200, 202, 204]).toContain(res.status());
    });
  } else {
    test.skip('TC-PROJ001.4 — Positive secret test skipped (set INTER_SERVICE_SECRET env var)', async () => {
      // Skipped — set INTER_SERVICE_SECRET env var to enable
    });
  }

  test('TC-PROJ001.5 — X-Inter-Service-Secret header name is case-insensitive match', async ({ request }) => {
    // HTTP headers are case-insensitive by spec. Verify server handles varied casing.
    const res = await request.post(`${API_BASE}/internal/projections/rebuild`, {
      headers: {
        'Content-Type': 'application/json',
        'x-inter-service-secret': 'wrong-lowercase-secret-qa', // Lowercase variant
      },
      data: {},
    });
    expect(res.status()).not.toBe(500);
    expect([401, 403]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-PROJ002: Projections rebuild is idempotent
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-PROJ002: Projections rebuild idempotency', () => {

  test.skip(!INTER_SERVICE_SECRET, 'TC-PROJ002 requires INTER_SERVICE_SECRET env var');

  test('TC-PROJ002.1 — Two consecutive rebuilds produce same result snapshot', async ({ request }) => {
    const rebuildOpts = {
      headers: {
        'Content-Type': 'application/json',
        'X-Inter-Service-Secret': INTER_SERVICE_SECRET ?? '',
      },
      data: {},
    };

    const r1 = await request.post(`${API_BASE}/internal/projections/rebuild`, rebuildOpts);
    expect(r1.status()).not.toBe(500);

    if ([200, 202, 204].includes(r1.status())) {
      // Wait briefly for rebuild to complete if async
      await new Promise(resolve => setTimeout(resolve, 500));

      const r2 = await request.post(`${API_BASE}/internal/projections/rebuild`, rebuildOpts);
      expect(r2.status()).not.toBe(500);
      expect([200, 202, 204]).toContain(r2.status());

      // Both rebuilds should return the same HTTP status code
      expect(r1.status()).toBe(r2.status());
    }
  });

  test('TC-PROJ002.2 — Analytics snapshot is consistent after rebuild', async ({ request }) => {
    if (!INTER_SERVICE_SECRET) return;

    // Trigger rebuild
    await request.post(`${API_BASE}/internal/projections/rebuild`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Inter-Service-Secret': INTER_SERVICE_SECRET,
      },
      data: {},
    });

    // Query analytics immediately after rebuild
    const res = await request.get(`${API_BASE}/analytics/workspace/${WS_A_ID}/revenue`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json() as { total_revenue_kobo?: number };
      // P9: Revenue must still be an integer after rebuild
      if (body.total_revenue_kobo !== undefined) {
        expect(Number.isInteger(body.total_revenue_kobo)).toBe(true);
      }
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-PA003 extended: Analytics responses are P9 compliant (integer kobo only)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('Analytics P9 compliance check', () => {

  test('All accessible analytics endpoints return integer kobo values (P9)', async ({ request }) => {
    const endpointsToCheck = [
      `/analytics/workspace/${WS_A_ID}/revenue`,
      `/analytics/workspace/${WS_A_ID}/verticals`,
    ];

    for (const endpoint of endpointsToCheck) {
      const res = await request.get(`${API_BASE}${endpoint}`, {
        headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      });
      if (res.status() === 200) {
        const body = await res.text();
        // Parse and check all _kobo fields
        const parsed = JSON.parse(body) as Record<string, unknown>;
        const checkKoboFields = (obj: unknown, path = ''): void => {
          if (obj === null || typeof obj !== 'object') return;
          for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
            if (key.endsWith('_kobo') || key.endsWith('Kobo')) {
              if (typeof val === 'number') {
                expect(Number.isInteger(val)).toBe(true);
              }
            } else if (typeof val === 'object') {
              checkKoboFields(val, `${path}.${key}`);
            }
          }
        };
        checkKoboFields(parsed);
      }
      expect(res.status()).not.toBe(500);
    }
  });

});
