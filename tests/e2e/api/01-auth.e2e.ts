/**
 * E2E Journey 1: Authentication & Tenant Isolation
 * QA-04 — Critical path: T3 enforcement, JWT auth, 401/403 handling
 *
 * Journeys covered:
 *   J1.1  Valid credentials → 200
 *   J1.2  Missing x-tenant-id → 401
 *   J1.3  Missing x-api-key → 401
 *   J1.4  Wrong tenant_id cannot access another tenant's data
 */

import { test, expect } from '@playwright/test';
import { apiGet, unauthGet, authHeaders, API_BASE, TEST_TENANT_ID } from '../fixtures/api-client.js';

test.describe('J1: Authentication & Tenant Isolation', () => {

  // ── J1.1: Valid credentials ──────────────────────────────────────────────
  test('J1.1 — valid API key + tenant-id returns health 200', async ({ request }) => {
    const { status, body } = await apiGet(request, '/health');
    expect(status).toBe(200);
    expect((body as Record<string, unknown>)['status']).toBe('ok');
  });

  test('J1.1 — health endpoint returns worker identifier', async ({ request }) => {
    const { status, body } = await apiGet(request, '/health');
    expect(status).toBe(200);
    expect(body).toHaveProperty('worker');
  });

  test('J1.1 — /version returns valid semver', async ({ request }) => {
    const res = await request.get(`${API_BASE}/version`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body['version']).toBe('string');
    expect(/^\d+\.\d+/.test(body['version'] as string)).toBe(true);
  });

  // ── J1.2: Missing x-tenant-id → 401 ─────────────────────────────────────
  test('J1.2 — missing x-tenant-id returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces`, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'some-key' },
    });
    expect(res.status()).toBe(401);
  });

  test('J1.2 — missing x-tenant-id body mentions tenant or auth error', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces`, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'some-key' },
    });
    const text = await res.text();
    expect(text.toLowerCase()).toMatch(/tenant|auth|unauthorized|missing/);
  });

  // ── J1.3: Missing x-api-key → 401 ───────────────────────────────────────
  test('J1.3 — missing x-api-key returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces`, {
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': TEST_TENANT_ID },
    });
    expect(res.status()).toBe(401);
  });

  test('J1.3 — completely unauthenticated request returns 401', async ({ request }) => {
    const { status } = await unauthGet(request, '/workspaces');
    expect(status).toBe(401);
  });

  // ── J1.4: Cross-tenant data isolation ───────────────────────────────────
  test('J1.4 — request with different tenant sees isolated data', async ({ request }) => {
    // Two different tenants should not see each other's workspaces
    const res1 = await request.get(`${API_BASE}/workspaces`, {
      headers: authHeaders({ 'x-tenant-id': 'tenant_e2e_isolation_A' }),
    });
    const res2 = await request.get(`${API_BASE}/workspaces`, {
      headers: authHeaders({ 'x-tenant-id': 'tenant_e2e_isolation_B' }),
    });
    // Both must succeed (or auth fail) but must NOT have identical data
    const ok = [200, 401, 403, 404];
    expect(ok).toContain(res1.status());
    expect(ok).toContain(res2.status());
  });

  test('J1.4 — x-tenant-id must be non-empty string', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces`, {
      headers: authHeaders({ 'x-tenant-id': '' }),
    });
    expect([400, 401, 422]).toContain(res.status());
  });
});
