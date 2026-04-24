/**
 * TST-009 / ENH-046: Hostile-tenant RLS regression suite
 * TC-INV002 / TC-INV003 — T3 invariant regression
 *
 * Creates two isolated tenant contexts (A, B) and asserts zero cross-tenant
 * data leakage across: workspace settings, user lists, phone-verify, wallet ops.
 *
 * Seed dependency: None — uses fixed test tenant IDs from E2E fixtures.
 * These tests pass when the API correctly enforces tenant_id scoping (T3).
 * All assertions use toBeOneOf([403, 404]) — 403 (forbidden) or 404 (not found
 * in tenant scope) are both acceptable isolation responses.
 */

import { test, expect } from '@playwright/test';
import { API_BASE, authHeaders } from '../fixtures/api-client.js';

// Fixed test-tenant IDs — must not collide with TNT-001/TNT-002 used in other files
const TENANT_A_ID = '10000000-0000-4000-b000-000000000001';
const TENANT_B_ID = '10000000-0000-4000-b000-000000000002';
const WS_A_ID = '20000000-0000-4000-c000-000000000001'; // belongs to Tenant A
const WS_B_ID = '20000000-0000-4000-c000-000000000002'; // belongs to Tenant B

/** Headers with Tenant A token attempting to access Tenant B resources */
function headersAasB() {
  return authHeaders({ 'x-tenant-id': TENANT_B_ID });
}

/** Headers with Tenant B token attempting to access Tenant A resources */
function headersBAsA() {
  return authHeaders({ 'x-tenant-id': TENANT_A_ID });
}

test.describe('TC-INV002 | Cross-tenant isolation — hostile tenant (T3 regression)', () => {

  // ── Workspace settings ───────────────────────────────────────────────────

  test('TC-INV002.1 | Tenant A token cannot read Tenant B workspace settings', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces/${WS_B_ID}/settings`, {
      headers: headersAasB(),
    });
    // Must not return 200 with B's data; 403 or 404 are correct isolation responses
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(500);
    expect([403, 404, 401]).toContain(res.status());
  });

  test('TC-INV002.2 | Tenant B token cannot read Tenant A workspace settings', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces/${WS_A_ID}/settings`, {
      headers: headersBAsA(),
    });
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(500);
    expect([403, 404, 401]).toContain(res.status());
  });

  // ── User listing ─────────────────────────────────────────────────────────

  test('TC-INV002.3 | Tenant A token cannot list Tenant B users', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces/${WS_B_ID}/users`, {
      headers: headersAasB(),
    });
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(500);
    expect([401, 403, 404]).toContain(res.status());
  });

  test('TC-INV002.4 | Tenant A token cannot list Tenant B webhooks', async ({ request }) => {
    const res = await request.get(`${API_BASE}/webhooks?workspace_id=${WS_B_ID}`, {
      headers: headersAasB(),
    });
    // If it returns 200, it must return an empty list (not B's webhooks)
    if (res.status() === 200) {
      const body = await res.json() as { webhooks?: unknown[] };
      expect(body.webhooks?.length ?? 0).toBe(0);
    } else {
      expect([401, 403, 404]).toContain(res.status());
    }
    expect(res.status()).not.toBe(500);
  });

  // ── Offering / inventory isolation ────────────────────────────────────────

  test('TC-INV002.5 | Tenant A token cannot modify Tenant B offerings', async ({ request }) => {
    const res = await request.patch(`${API_BASE}/offerings/60000000-0000-4000-a001-000000000099`, {
      headers: headersAasB(),
      data: { price_kobo: 99900 },
    });
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(500);
    expect([401, 403, 404, 422]).toContain(res.status());
  });

  // ── Phone verification cross-tenant ──────────────────────────────────────

  test('TC-INV002.6 | Phone-verify cannot expose cross-tenant verification state', async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/kyc/phone-verify`, {
      headers: headersAasB(),
      data: { tenant_id_override: TENANT_A_ID },
    });
    // Must not return 200 showing A's phone state; 400/401/403/404/422 expected
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      // If it somehow returns 200, the body must NOT reference Tenant A data
      const body = await res.text();
      expect(body).not.toContain(TENANT_A_ID);
    } else {
      expect([400, 401, 403, 404, 422]).toContain(res.status());
    }
  });

});

test.describe('TC-INV003 | Wallet operations scoped to correct tenant (T3 regression)', () => {

  test('TC-INV003.1 | Tenant B token cannot debit Tenant A wallet', async ({ request }) => {
    const res = await request.post(`${API_BASE}/wallet/debit`, {
      headers: headersBAsA(),
      data: {
        workspace_id: WS_A_ID,
        amount_kobo: 500,
        description: 'TC-INV003 hostile cross-tenant debit attempt',
      },
    });
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(500);
    expect([401, 403, 404, 422]).toContain(res.status());
  });

  test('TC-INV003.2 | Tenant B token cannot credit Tenant A wallet', async ({ request }) => {
    const res = await request.post(`${API_BASE}/wallet/credit`, {
      headers: headersBAsA(),
      data: {
        wallet_id: '40000000-0000-4000-e000-000000000001',
        amount_kobo: 1000,
        reference: 'tc-inv003-hostile-credit',
        description: 'TC-INV003 hostile cross-tenant credit attempt',
      },
    });
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(500);
    expect([401, 403, 404, 422]).toContain(res.status());
  });

  test('TC-INV003.3 | Tenant A payment initiation cannot use Tenant B workspace', async ({ request }) => {
    const res = await request.post(`${API_BASE}/payments/initiate`, {
      headers: headersAasB(),
      data: {
        workspace_id: WS_B_ID,
        amount_kobo: 5000,
        email: 'tc-inv003@webwaka-test.invalid',
        description: 'TC-INV003 cross-tenant payment attempt',
      },
    });
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(201);
    expect(res.status()).not.toBe(500);
    expect([400, 401, 403, 404, 422]).toContain(res.status());
  });

  test('TC-INV003.4 | HL-wallet transfer cannot cross tenant boundary', async ({ request }) => {
    const res = await request.post(`${API_BASE}/wallet/transfer`, {
      headers: headersBAsA(),
      data: {
        from_workspace_id: WS_A_ID,
        to_workspace_id: WS_B_ID,
        amount_kobo: 500,
      },
    });
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(500);
    expect([400, 401, 403, 404, 422]).toContain(res.status());
  });

});
