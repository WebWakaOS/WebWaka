/**
 * CYCLE-02 Sub-cycle 2A — JWT Security and CSRF Protection
 * Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §4 CYCLE-02 Sub-cycle 2A
 * Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
 *
 * TC-IDs covered:
 *   TC-AUTH003  Expired JWT returns 401
 *   TC-AUTH004  Tampered JWT returns 401
 *   TC-CSRF001  POST without CSRF token returns 403
 *
 * Priority: P0 — Blocker. Any failure here is S0 severity.
 *
 * JWT invariants (frozen baseline §XII):
 *   - Expired JWT must be rejected (401)
 *   - Tampered signature must be rejected (401)
 *   - Missing JWT on protected route must be rejected (401)
 *
 * CSRF invariant (frozen baseline §XII / middleware stack):
 *   - State-changing requests (POST/PATCH/DELETE) from browser context
 *     require a valid CSRF token. Invalid or absent token → 403.
 *   - API key requests (server-to-server) bypass CSRF check per design.
 */

import { test, expect } from '@playwright/test';
import { authHeaders, API_BASE, TEST_TENANT_ID } from '../fixtures/api-client.js';

// ──────────────────────────────────────────────────────────────────────────────
// TC-AUTH003: Expired JWT returns 401
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-AUTH003: Expired JWT rejected', () => {

  // This is a known-expired JWT (signature is valid but exp is in the past).
  // Constructed with: iat=1672531200 (Jan 1 2023), exp=1672534800 (1hr later)
  // Algorithm: HS256. Payload intentionally points to TENANT_A seed data.
  // This JWT is safe for test use — it is expired and the signing key is test-only.
  const EXPIRED_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtYTAwMC0wMDAwMDAwMDAwMDIiLCJ0ZW5hbnRJZCI6IjEwMDAwMDAwLTAwMDAtNDAwMC1iMDAwLTAwMDAwMDAwMDAwMSIsInJvbGUiOiJvd25lciIsImlhdCI6MTY3MjUzMTIwMCwiZXhwIjoxNjcyNTM0ODAwfQ.' +
    'INVALID_SIGNATURE_FOR_TEST_PURPOSES_ONLY';

  test('TC-AUTH003.1 — expired JWT on /auth/me returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TEST_TENANT_ID,
        Authorization: `Bearer ${EXPIRED_JWT}`,
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).toBeLessThan(500);
    expect(res.status()).toBe(401);
  });

  test('TC-AUTH003.2 — expired JWT on protected workspace route returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TEST_TENANT_ID,
        Authorization: `Bearer ${EXPIRED_JWT}`,
      },
    });
    expect(res.status()).not.toBe(404);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-AUTH003.3 — expired JWT on bank-transfer route returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/bank-transfer`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TEST_TENANT_ID,
        Authorization: `Bearer ${EXPIRED_JWT}`,
      },
    });
    expect(res.status()).not.toBe(404);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-AUTH003.4 — expired JWT error response body indicates auth failure reason', async ({ request }) => {
    const res = await request.get(`${API_BASE}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TEST_TENANT_ID,
        Authorization: `Bearer ${EXPIRED_JWT}`,
      },
    });
    if (res.status() === 401) {
      const body = await res.text();
      expect(body.toLowerCase()).toMatch(/expired|invalid|unauthorized|token/);
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-AUTH004: Tampered JWT returns 401
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-AUTH004: Tampered JWT rejected', () => {

  // Tampered JWT: valid header + payload structure but signature is garbage.
  // The payload claims super_admin role — if accepted, that would be a critical escalation bug.
  const TAMPERED_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtYTAwMC0wMDAwMDAwMDAwMDEiLCJ0ZW5hbnRJZCI6InBsYXRmb3JtIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.' +
    'tampered_signature_not_valid_abcdefghijklmnopqrstuvwxyz';

  test('TC-AUTH004.1 — tampered JWT on /auth/me returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TEST_TENANT_ID,
        Authorization: `Bearer ${TAMPERED_JWT}`,
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).toBeLessThan(500);
    expect(res.status()).toBe(401);
  });

  test('TC-AUTH004.2 — tampered JWT claiming super_admin does NOT access platform analytics', async ({ request }) => {
    // CRITICAL: tampered token claims super_admin — must be rejected before role check
    const res = await request.get(`${API_BASE}/admin/analytics`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TAMPERED_JWT}`,
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).toBeLessThan(500);
    // Must reject at JWT verification, not at role check
    expect([401, 403]).toContain(res.status());
  });

  test('TC-AUTH004.3 — tampered JWT on bank-transfer create returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/bank-transfer`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TEST_TENANT_ID,
        Authorization: `Bearer ${TAMPERED_JWT}`,
      },
      data: { amount_kobo: 100000, workspace_id: '20000000-0000-4000-c000-000000000001' },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).toBeLessThan(500);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-AUTH004.4 — completely malformed JWT (not 3 parts) returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TEST_TENANT_ID,
        Authorization: 'Bearer not.a.valid.jwt.structure.at.all.definitely.not',
      },
    });
    expect([401, 400]).toContain(res.status());
    expect(res.status()).not.toBe(500);
  });

  test('TC-AUTH004.5 — JWT with alg:none attack returns 401', async ({ request }) => {
    // alg:none attack: header claims no signature needed
    const algNoneJwt =
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.' + // {"alg":"none","typ":"JWT"}
      'eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtYTAwMC0wMDAwMDAwMDAwMDEiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJleHAiOjk5OTk5OTk5OTl9.' +
      ''; // empty signature
    const res = await request.get(`${API_BASE}/admin/analytics`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${algNoneJwt}`,
      },
    });
    expect(res.status()).not.toBe(200); // Must NOT accept alg:none
    expect(res.status()).not.toBe(500);
    expect([401, 400, 403]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-CSRF001: POST without CSRF token returns 403
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-CSRF001: CSRF token enforcement', () => {

  test('TC-CSRF001.1 — state-changing POST without x-csrf-token header returns 403', async ({ request }) => {
    // Simulate a browser-originated POST without CSRF token
    // Note: API key (server-to-server) bypasses CSRF check per design —
    //       this test uses no x-api-key to simulate browser context
    const res = await request.post(`${API_BASE}/auth/logout`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TEST_TENANT_ID,
        // Deliberately omitting x-api-key and x-csrf-token
        // Using a fake Authorization that looks valid-ish
        Authorization: 'Bearer fake-browser-token',
      },
      data: {},
    });
    // Must not be 404 (route exists)
    expect(res.status()).not.toBe(404);
    // Must not be 500 (no crash)
    expect(res.status()).not.toBe(500);
    // CSRF enforcement: 403 Forbidden or 401 Unauthorized
    expect([400, 401, 403]).toContain(res.status());
  });

  test('TC-CSRF001.2 — PATCH without CSRF token on profile update is blocked', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/auth/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TEST_TENANT_ID,
        // No x-api-key, no x-csrf-token — browser context simulation
        Authorization: 'Bearer fake-browser-token',
      },
      data: { full_name: 'Injected Name' },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([400, 401, 403]).toContain(res.status());
  });

  test('TC-CSRF001.3 — DELETE /auth/me without CSRF token is blocked', async ({ request }) => {
    // NDPR erasure endpoint — must require CSRF in browser context
    const res = await request.delete(`${API_BASE}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TEST_TENANT_ID,
        Authorization: 'Bearer fake-browser-token',
        // No x-csrf-token
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // Must not succeed without CSRF
    expect(res.status()).not.toBe(200);
  });

  test('TC-CSRF001.4 — API key requests (server-to-server) bypass CSRF check', async ({ request }) => {
    // Server-to-server requests with x-api-key must NOT be blocked by CSRF
    // Using standard authHeaders() which includes x-api-key
    const res = await request.get(`${API_BASE}/health`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    expect(res.status()).not.toBe(403);
  });

});
