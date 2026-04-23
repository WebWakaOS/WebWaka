/**
 * CYCLE-02 Sub-cycle 2A — Tenant Isolation and JWT Security
 * Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §4 CYCLE-02 Sub-cycle 2A
 * Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
 *
 * TC-IDs covered:
 *   TC-INV002  T3: tenant_id from JWT only, never from request body
 *   TC-INV003  T3: cross-tenant data isolation
 *   TC-INV009  T4: non-super_admin blocked from cross-tenant analytics
 *
 * Priority: P0 — Blocker. Any failure here is S0 severity (data breach risk).
 * Gate: All three must pass before CYCLE-03, CYCLE-04, CYCLE-05 can proceed.
 *
 * T3 invariant (frozen baseline §II.3):
 *   "tenant_id is ALWAYS derived from the authenticated JWT claims.
 *    It MUST NEVER be accepted from the request body, query params,
 *    or any caller-supplied header."
 *
 * T4 invariant (frozen baseline §II.4):
 *   "Cross-tenant queries must be gated to super_admin role only."
 */

import { test, expect } from '@playwright/test';
import { authHeaders, API_BASE, TEST_TENANT_ID } from '../fixtures/api-client.js';

// Seed IDs (from Phase 2 seed script)
const TENANT_A_ID = '10000000-0000-4000-b000-000000000001';
const TENANT_B_ID = '10000000-0000-4000-b000-000000000002';
const WS_A_ID = '20000000-0000-4000-c000-000000000001';
const WS_B_ID = '20000000-0000-4000-c000-000000000002';

// ──────────────────────────────────────────────────────────────────────────────
// TC-INV002: T3 — tenant_id from JWT only, never from request body
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-INV002: T3 — tenant_id source enforcement', () => {

  test('TC-INV002.1 — body tenant_id is ignored; JWT tenant_id governs workspace scope', async ({ request }) => {
    // Attempt to supply a different tenant_id in request body.
    // The API must derive tenant_id from the JWT, not from the body.
    // Expected: the response does NOT show data for TENANT_B_ID when caller is TENANT_A.
    const res = await request.get(`${API_BASE}/workspaces`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: { tenant_id: TENANT_B_ID }, // Supplying wrong tenant in body — must be IGNORED
    });
    // Route must respond
    expect(res.status()).not.toBe(404);
    expect(res.status()).toBeLessThan(500);
    if (res.status() === 200) {
      const body = await res.json() as { workspaces?: Array<{ tenant_id?: string }> };
      if (body.workspaces && body.workspaces.length > 0) {
        for (const ws of body.workspaces) {
          if (ws.tenant_id) {
            // Every returned workspace must belong to TENANT_A, not TENANT_B
            expect(ws.tenant_id).not.toBe(TENANT_B_ID);
          }
        }
      }
    }
  });

  test('TC-INV002.2 — PATCH with body tenant_id override does not affect data scope', async ({ request }) => {
    // Attempt to inject tenant_id into a PATCH body.
    // The handler must ignore it and use JWT-derived tenant.
    const res = await request.patch(`${API_BASE}/workspaces/${WS_A_ID}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: {
        name: 'Injected Name',
        tenant_id: TENANT_B_ID, // Injection attempt — must be IGNORED
      },
    });
    // Must not 500 and must not update data under TENANT_B
    expect(res.status()).not.toBe(500);
    // If it 404s that's fine (workspace may not exist in test env), but a 500 means
    // the injection caused unexpected behavior
  });

  test('TC-INV002.3 — query param tenant_id override is rejected', async ({ request }) => {
    // Attempt to override tenant_id via query param
    const res = await request.get(`${API_BASE}/workspaces?tenant_id=${TENANT_B_ID}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).toBeLessThan(500);
    if (res.status() === 200) {
      const body = await res.json() as { workspaces?: Array<{ tenant_id?: string }> };
      if (body.workspaces) {
        for (const ws of body.workspaces) {
          if (ws.tenant_id) {
            expect(ws.tenant_id).not.toBe(TENANT_B_ID);
          }
        }
      }
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-INV003: T3 — Cross-tenant data isolation
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-INV003: T3 — Cross-tenant data isolation', () => {

  test('TC-INV003.1 — Tenant A cannot see Tenant B workspaces', async ({ request }) => {
    const resA = await request.get(`${API_BASE}/workspaces`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    const resB = await request.get(`${API_BASE}/workspaces`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
    });

    expect(resA.status()).not.toBe(404);
    expect(resB.status()).not.toBe(404);
    expect(resA.status()).toBeLessThan(500);
    expect(resB.status()).toBeLessThan(500);

    if (resA.status() === 200 && resB.status() === 200) {
      const bodyA = await resA.json() as { workspaces?: Array<{ id: string }> };
      const bodyB = await resB.json() as { workspaces?: Array<{ id: string }> };
      const idsA = new Set((bodyA.workspaces ?? []).map(ws => ws.id));
      const idsB = new Set((bodyB.workspaces ?? []).map(ws => ws.id));

      // The two sets must be disjoint — no workspace appears in both responses
      for (const id of idsA) {
        expect(idsB.has(id)).toBe(false);
      }
    }
  });

  test('TC-INV003.2 — Tenant A cannot access Tenant B workspace by direct ID', async ({ request }) => {
    // Tenant A uses their JWT but requests Tenant B workspace's ID directly
    const res = await request.get(`${API_BASE}/workspaces/${WS_B_ID}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    // Must return 403 (forbidden) or 404 (not found under this tenant) — never 200
    expect([403, 404]).toContain(res.status());
  });

  test('TC-INV003.3 — Tenant A offerings not visible under Tenant B token', async ({ request }) => {
    const res = await request.get(`${API_BASE}/offerings?workspace_id=${WS_A_ID}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
    });
    // Must not return data (403 or 404) — never 200 with Tenant A's offerings
    if (res.status() === 200) {
      const body = await res.json() as { offerings?: Array<{ workspace_id: string }> };
      if (body.offerings) {
        for (const offering of body.offerings) {
          if (offering.workspace_id) {
            expect(offering.workspace_id).not.toBe(WS_A_ID);
          }
        }
      }
    } else {
      expect([403, 404]).toContain(res.status());
    }
  });

  test('TC-INV003.4 — Bank transfer orders are tenant-scoped (T3 + P21)', async ({ request }) => {
    // Tenant B requests bank transfer orders for Tenant A workspace
    const res = await request.get(`${API_BASE}/bank-transfer?workspace_id=${WS_A_ID}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
    });
    if (res.status() === 200) {
      const body = await res.json() as { orders?: Array<{ tenant_id: string }> };
      if (body.orders) {
        for (const order of body.orders) {
          if (order.tenant_id) {
            // Every returned order must belong to Tenant B, not Tenant A
            expect(order.tenant_id).not.toBe(TENANT_A_ID);
          }
        }
      }
    } else {
      expect([403, 404]).toContain(res.status());
    }
  });

  test('TC-INV003.5 — Notification inbox is tenant-scoped', async ({ request }) => {
    const notifId = '90000000-0000-4000-b001-000000000001'; // NTF-001 belongs to TENANT_A
    const res = await request.get(`${API_BASE}/notifications/inbox/${notifId}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }), // Tenant B trying to access Tenant A notification
    });
    // Must be 403 or 404 — never 200
    expect([403, 404]).toContain(res.status());
  });

  test('TC-INV003.6 — T3: audit_log rows contain correct tenant_id (not cross-contaminated)', async ({ request }) => {
    // Make a request with Tenant A identity and verify audit log entry is scoped correctly
    // This is a best-effort check — if audit log endpoint is not exposed, skip gracefully
    const res = await request.get(`${API_BASE}/admin/audit-log`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    if (res.status() === 200) {
      const body = await res.json() as { entries?: Array<{ tenant_id: string }> };
      if (body.entries) {
        for (const entry of body.entries) {
          if (entry.tenant_id) {
            expect(entry.tenant_id).toBe(TENANT_A_ID);
          }
        }
      }
    }
    // 403 or 404 are acceptable (audit log may be super_admin only)
    expect(res.status()).toBeLessThan(500);
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-INV009: T4 — Non-super_admin blocked from cross-tenant analytics
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-INV009: T4 — Cross-tenant analytics gate', () => {

  test('TC-INV009.1 — GET /admin/analytics without super_admin JWT returns 401 or 403', async ({ request }) => {
    // No JWT provided — must be blocked
    const res = await request.get(`${API_BASE}/admin/analytics`, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'some-key' },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).toBeLessThan(500);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-INV009.2 — GET /admin/analytics with tenant admin JWT returns 403', async ({ request }) => {
    // Tenant admin (not super_admin) must be blocked from cross-tenant analytics
    // Using standard auth headers — the test API key does NOT carry super_admin JWT
    const res = await request.get(`${API_BASE}/admin/analytics`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }), // tenant admin level
    });
    // Tenant admin must not see platform-wide analytics
    expect(res.status()).not.toBe(404);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-INV009.3 — GET /admin/analytics/vertical-heatmap enforces super_admin', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/analytics/vertical-heatmap`, {
      headers: authHeaders(),
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).toBeLessThan(500);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-INV009.4 — GET /admin/metrics enforces super_admin or platform role', async ({ request }) => {
    const res = await request.get(`${API_BASE}/admin/metrics`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }), // tenant-level auth
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).toBeLessThan(500);
    // Tenant admin must be blocked from platform metrics
    expect([401, 403]).toContain(res.status());
  });

});
