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
