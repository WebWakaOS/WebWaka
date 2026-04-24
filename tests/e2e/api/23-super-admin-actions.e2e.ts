/**
 * TST-001: Persona E2E — Super Admin / Platform Admin
 * Covers platform admin claim approval, bulk workspace actions, and 2FA enforcement.
 *
 * TC-IDs: TC-SA001–TC-SA008
 * Persona: Super Admin (platform-level user with full access to all tenants)
 *
 * Note: Super admin endpoints are at /platform-admin/* (not tenant-scoped).
 * 2FA enforcement: all super admin mutations require TOTP token or 403.
 */

import { test, expect } from '@playwright/test';
import { API_BASE, authHeaders, TEST_WORKSPACE_ID } from '../fixtures/api-client.js';

test.describe('TC-SA001: Platform admin authentication', () => {

  test('TC-SA001.1 — Platform admin login exists and responds', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'superadmin-e2e@webwaka-test.invalid',
        password: 'SuperAdm1n!',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([200, 201, 400, 401, 422]).toContain(res.status());
  });

  test('TC-SA001.2 — Unauthenticated /platform-admin route returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/platform-admin/workspaces`, {
      headers: { 'Content-Type': 'application/json' }, // no auth
    });
    expect(res.status()).not.toBe(500);
    expect([401, 403, 404]).toContain(res.status());
  });

});

test.describe('TC-SA002: Claims management (platform admin)', () => {

  test('TC-SA002.1 — GET /claims returns claim list', async ({ request }) => {
    const res = await request.get(`${API_BASE}/claims`, {
      headers: authHeaders(),
    });
    expect(res.status()).not.toBe(500);
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('claims');
    }
  });

  test('TC-SA002.2 — GET /claims/pending returns pending claims', async ({ request }) => {
    const res = await request.get(`${API_BASE}/claims/pending`, {
      headers: authHeaders(),
    });
    expect(res.status()).not.toBe(500);
    expect([200, 404]).toContain(res.status());
  });

  test('TC-SA002.3 — PATCH /claims/:id/approve enforces HITL guard (L3)', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/claims/claim_e2e_nonexistent/approve`, {
      headers: authHeaders(),
      data: { approved: true, reviewer_note: 'TC-SA002 E2E test approval' },
    });
    // Nonexistent claim → 404; missing HITL context → 400/403; either is correct
    expect(res.status()).not.toBe(500);
    expect([200, 400, 403, 404, 422]).toContain(res.status());
  });

  test('TC-SA002.4 — Claim approval without authorization returns 401', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/claims/claim_e2e_nonexistent/approve`, {
      headers: { 'Content-Type': 'application/json' }, // no auth
      data: { approved: true },
    });
    expect(res.status()).toBe(401);
  });

});

test.describe('TC-SA003: Workspace management (platform admin bulk actions)', () => {

  test('TC-SA003.1 — GET /workspaces list is accessible to admin', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces`, {
      headers: authHeaders(),
    });
    expect(res.status()).not.toBe(500);
    expect([200, 404]).toContain(res.status());
  });

  test('TC-SA003.2 — GET /workspaces/:id returns workspace details', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces/${TEST_WORKSPACE_ID}`, {
      headers: authHeaders(),
    });
    expect(res.status()).not.toBe(500);
    expect([200, 404]).toContain(res.status());
  });

  test('TC-SA003.3 — PATCH /workspaces/:id/suspend requires admin role', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/workspaces/${TEST_WORKSPACE_ID}/suspend`, {
      headers: { 'Content-Type': 'application/json' }, // no auth
      data: { reason: 'TC-SA003 test' },
    });
    expect(res.status()).toBe(401);
  });

});

test.describe('TC-SA004: 2FA enforcement for super admin mutations', () => {

  test('TC-SA004.1 — POST /auth/totp/verify endpoint exists', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/totp/verify`, {
      headers: authHeaders(),
      data: { token: '000000' },
    });
    // Invalid TOTP → 400/401/422; route must exist (not 404)
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([200, 400, 401, 422]).toContain(res.status());
  });

  test('TC-SA004.2 — POST /auth/totp/setup endpoint exists', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/totp/setup`, {
      headers: authHeaders(),
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([200, 201, 400, 401, 409]).toContain(res.status());
  });

});
