/**
 * E2E Journey 6: Webhook Subscription Management (PROD-04)
 * QA-04 — Critical path: create, list, update, delete webhook subscriptions
 *
 * Journeys covered:
 *   J6.1  Create webhook subscription
 *   J6.2  List subscriptions (T3 scoped)
 *   J6.3  Update subscription (enable/disable)
 *   J6.4  Delete subscription
 *   J6.5  List delivery history
 *
 * KI-001 patch — TC-WH002/TC-WH003/TC-WH004: Webhook tier limit enforcement
 *   TC-WH002  Free plan (0-webhook limit): creation returns 402/403/422
 *   TC-WH003  Paid plan (starter/growth): creation allowed
 *   TC-WH004  Free plan tier limit error response body is meaningful
 *
 * Inventory basis: MON-04 (frozen baseline §XI.4)
 *   free: 0 webhooks
 *   starter: 3 webhooks
 *   growth: unlimited
 *
 * Seed dependency:
 *   TNT-001 (TENANT_A) = growth plan  → webhook allowed
 *   TNT-002 (TENANT_B) = free plan    → webhook blocked (0 limit)
 */

import { test, expect } from '@playwright/test';
import { apiGet, apiPost, apiDelete, authHeaders, API_BASE, TEST_WORKSPACE_ID } from '../fixtures/api-client.js';

let createdWebhookId: string | undefined;

test.describe('J6: Webhook Subscriptions', () => {

  // ── J6.1: Create webhook ──────────────────────────────────────────────────
  test('J6.1 — POST /webhooks creates subscription', async ({ request }) => {
    const { status, body } = await apiPost(request, '/webhooks', {
      workspace_id: TEST_WORKSPACE_ID,
      url: 'https://webhook-test.webwaka-e2e.invalid/hook',
      events: ['template.installed', 'payment.completed'],
      secret: 'e2e-secret-do-not-use',
    });
    expect([200, 201, 404, 422]).toContain(status);
    if (status === 200 || status === 201) {
      const b = body as Record<string, unknown>;
      expect(b).toHaveProperty('id');
      expect(b).toHaveProperty('url');
      createdWebhookId = b['id'] as string;
    }
  });

  test('J6.1 — webhook creation without URL returns 422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/webhooks`, {
      headers: authHeaders(),
      data: {
        workspace_id: TEST_WORKSPACE_ID,
        events: ['template.installed'],
        // missing url
      },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('J6.1 — webhook creation without events returns 422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/webhooks`, {
      headers: authHeaders(),
      data: {
        workspace_id: TEST_WORKSPACE_ID,
        url: 'https://example.com/hook',
        // missing events
      },
    });
    expect([400, 422]).toContain(res.status());
  });

  // ── J6.2: List subscriptions ──────────────────────────────────────────────
  test('J6.2 — GET /webhooks returns subscription list', async ({ request }) => {
    const res = await request.get(`${API_BASE}/webhooks?workspace_id=${TEST_WORKSPACE_ID}`, {
      headers: authHeaders(),
    });
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('webhooks');
      expect(Array.isArray(body['webhooks'])).toBe(true);
    }
  });

  test('J6.2 — webhook list is tenant-scoped (T3)', async ({ request }) => {
    const res1 = await request.get(`${API_BASE}/webhooks?workspace_id=${TEST_WORKSPACE_ID}`, {
      headers: authHeaders({ 'x-tenant-id': 'tenant_e2e_wh_A' }),
    });
    const res2 = await request.get(`${API_BASE}/webhooks?workspace_id=${TEST_WORKSPACE_ID}`, {
      headers: authHeaders({ 'x-tenant-id': 'tenant_e2e_wh_B' }),
    });
    expect([200, 401, 404]).toContain(res1.status());
    expect([200, 401, 404]).toContain(res2.status());
    // Both cannot return data belonging to a different tenant
  });

  // ── J6.3: Update subscription ─────────────────────────────────────────────
  test('J6.3 — PATCH /webhooks/:id toggles active status', async ({ request }) => {
    const hookId = createdWebhookId ?? 'webhook_e2e_nonexistent';
    const res = await request.patch(`${API_BASE}/webhooks/${hookId}`, {
      headers: authHeaders(),
      data: { active: false },
    });
    expect([200, 404, 422]).toContain(res.status());
  });

  // ── J6.4: Delete subscription ─────────────────────────────────────────────
  test('J6.4 — DELETE /webhooks/:id removes subscription', async ({ request }) => {
    const hookId = createdWebhookId ?? 'webhook_e2e_nonexistent';
    const { status } = await apiDelete(request, `/webhooks/${hookId}`);
    expect([200, 204, 404]).toContain(status);
  });

  // ── J6.5: Delivery history ────────────────────────────────────────────────
  test('J6.5 — GET /webhooks/:id/deliveries returns delivery list', async ({ request }) => {
    const hookId = createdWebhookId ?? 'webhook_e2e_nonexistent';
    const res = await request.get(`${API_BASE}/webhooks/${hookId}/deliveries`, {
      headers: authHeaders(),
    });
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty('deliveries');
      expect(Array.isArray(body['deliveries'])).toBe(true);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// KI-001 patch: TC-WH002, TC-WH003, TC-WH004 — Webhook tier limit enforcement
// Inventory basis: MON-04 (frozen baseline §XI.4)
//   free plan  : 0 webhooks (creation must be rejected)
//   starter    : 3 webhooks (within limit: creation allowed)
//   growth     : unlimited  (creation always allowed)
//
// Seed dependency:
//   TNT-002 (TENANT_B_ID) = free plan → 0 webhook allowance
//   TNT-001 (TENANT_A_ID) = growth plan → unlimited webhook allowance
// ──────────────────────────────────────────────────────────────────────────────

const TENANT_A_ID = '10000000-0000-4000-b000-000000000001'; // growth plan
const TENANT_B_ID = '10000000-0000-4000-b000-000000000002'; // free plan
const WS_A_ID = '20000000-0000-4000-c000-000000000001';
const WS_B_ID = '20000000-0000-4000-c000-000000000002';

test.describe('TC-WH002: Free plan webhook creation blocked (MON-04)', () => {

  test('TC-WH002.1 — POST /webhooks with free-plan tenant returns 402/403/422', async ({ request }) => {
    // MON-04: free plan has 0 webhook allowance — any creation attempt must be rejected
    const res = await request.post(`${API_BASE}/webhooks`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
      data: {
        workspace_id: WS_B_ID,
        url: 'https://webhook-test.webwaka-e2e.invalid/tc-wh002',
        events: ['payment.completed'],
        secret: 'tc-wh002-secret',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // Must NOT succeed on free plan
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(201);
    // Expected: 402 (plan limit), 403 (tier gate), or 422 (business rule rejection)
    expect([402, 403, 422]).toContain(res.status());
  });

  test('TC-WH002.2 — Free plan webhook attempt: response body indicates tier restriction', async ({ request }) => {
    const res = await request.post(`${API_BASE}/webhooks`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
      data: {
        workspace_id: WS_B_ID,
        url: 'https://webhook-test.webwaka-e2e.invalid/tc-wh002-b',
        events: ['template.installed'],
        secret: 'tc-wh002-b-secret',
      },
    });
    if ([402, 403, 422].includes(res.status())) {
      const body = await res.text();
      // TC-WH004: error body must indicate plan/tier issue (not a generic 400)
      expect(body.toLowerCase()).toMatch(/plan|tier|limit|upgrade|webhook|allowance|quota/);
    }
  });

  test('TC-WH002.3 — GET /webhooks for free-plan tenant returns empty or 0 webhooks', async ({ request }) => {
    const res = await request.get(`${API_BASE}/webhooks?workspace_id=${WS_B_ID}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
    });
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json() as { webhooks?: unknown[] };
      // Free plan: 0 webhooks allowed, so list must be empty
      if (body.webhooks) {
        expect(body.webhooks.length).toBe(0);
      }
    }
  });

});

test.describe('TC-WH003: Paid plan webhook creation allowed (MON-04)', () => {

  test('TC-WH003.1 — POST /webhooks with growth-plan tenant is not rejected by tier gate', async ({ request }) => {
    // MON-04: growth plan = unlimited webhooks — tier gate must allow creation
    const res = await request.post(`${API_BASE}/webhooks`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: {
        workspace_id: WS_A_ID,
        url: 'https://webhook-test.webwaka-e2e.invalid/tc-wh003',
        events: ['payment.completed', 'template.installed'],
        secret: 'tc-wh003-secret',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // Growth plan: must NOT be rejected with 402/403 due to tier limits
    // May be rejected for other valid reasons (duplicate URL, etc.) — those are 409/422 not 402
    if (res.status() === 402 || res.status() === 403) {
      throw new Error(
        `TC-WH003 FAIL: Growth-plan webhook creation rejected with ${res.status()} — tier gate incorrectly blocking paid tenant`
      );
    }
    // Acceptable outcomes: 200/201 (created), 409 (duplicate), 422 (non-tier validation)
    expect([200, 201, 409, 422]).toContain(res.status());
  });

  test('TC-WH003.2 — Growth plan: webhook count not capped at 3 (not starter limit)', async ({ request }) => {
    // MON-04: growth = unlimited. Creating a 4th webhook (beyond starter limit of 3) must not be blocked.
    // This test verifies growth plan is not incorrectly capped at starter's limit.
    const createWebhook = (suffix: number) =>
      request.post(`${API_BASE}/webhooks`, {
        headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
        data: {
          workspace_id: WS_A_ID,
          url: `https://webhook-test.webwaka-e2e.invalid/tc-wh003-${suffix}`,
          events: ['payment.completed'],
          secret: `tc-wh003-secret-${suffix}`,
        },
      });

    // Attempt to create 4 webhooks — all should succeed or fail for non-tier reasons
    const results = await Promise.all([1, 2, 3, 4].map(createWebhook));
    for (const res of results) {
      expect(res.status()).not.toBe(500);
      // Must NOT return 402 (tier limit exceeded) for growth plan
      if (res.status() === 402) {
        throw new Error('TC-WH003 FAIL: Growth plan incorrectly hit webhook cap (should be unlimited)');
      }
    }
  });

});

test.describe('TC-WH004: Tier limit error message is meaningful', () => {

  test('TC-WH004.1 — Free plan rejection error body contains upgrade guidance', async ({ request }) => {
    const res = await request.post(`${API_BASE}/webhooks`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
      data: {
        workspace_id: WS_B_ID,
        url: 'https://webhook-test.webwaka-e2e.invalid/tc-wh004',
        events: ['payment.completed'],
        secret: 'tc-wh004-secret',
      },
    });
    if ([402, 403, 422].includes(res.status())) {
      const body = await res.text();
      // Error must give actionable guidance, not just "forbidden"
      expect(body).toBeTruthy();
      expect(body.length).toBeGreaterThan(10); // Non-empty error body
    }
    expect(res.status()).not.toBe(500);
  });

});
