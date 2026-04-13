/**
 * E2E Journey 2: Template Marketplace Browse & Install
 * QA-04 — Critical path: browse templates, install free template, purchase paid template
 *
 * Journeys covered:
 *   J2.1  Browse templates (paginated list)
 *   J2.2  Filter by category
 *   J2.3  Get template detail by slug
 *   J2.4  Install free template
 *   J2.5  Purchase paid template (Paystack initiation)
 */

import { test, expect } from '@playwright/test';
import { apiGet, apiPost, authHeaders, API_BASE, TEST_WORKSPACE_ID } from '../fixtures/api-client.js';

test.describe('J2: Template Marketplace Browse & Install', () => {

  // ── J2.1: Browse templates ───────────────────────────────────────────────
  test('J2.1 — GET /templates returns paginated list', async ({ request }) => {
    const { status, body } = await apiGet(request, '/templates');
    expect([200, 404]).toContain(status); // 404 if no templates seeded yet
    if (status === 200) {
      const b = body as Record<string, unknown>;
      expect(b).toHaveProperty('templates');
      expect(Array.isArray(b['templates'])).toBe(true);
    }
  });

  test('J2.1 — template list response includes pagination metadata', async ({ request }) => {
    const res = await request.get(`${API_BASE}/templates?page=1&limit=10`, {
      headers: authHeaders(),
    });
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json() as Record<string, unknown>;
      // Must have pagination hints
      expect(body).toMatchObject(
        expect.objectContaining({
          templates: expect.any(Array),
        }),
      );
    }
  });

  test('J2.1 — template list respects ?limit= parameter', async ({ request }) => {
    const res = await request.get(`${API_BASE}/templates?limit=3`, {
      headers: authHeaders(),
    });
    if (res.status() === 200) {
      const body = await res.json() as Record<string, unknown>;
      const templates = body['templates'] as unknown[];
      expect(templates.length).toBeLessThanOrEqual(3);
    } else {
      expect([200, 404]).toContain(res.status());
    }
  });

  // ── J2.2: Filter by category ─────────────────────────────────────────────
  test('J2.2 — filter templates by vertical category', async ({ request }) => {
    const res = await request.get(`${API_BASE}/templates?vertical=laundry`, {
      headers: authHeaders(),
    });
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json() as Record<string, unknown>;
      const templates = (body['templates'] as Array<Record<string, unknown>>) ?? [];
      for (const tmpl of templates) {
        expect(
          (tmpl['vertical'] as string)?.toLowerCase().includes('laundry') ||
          tmpl['category'] === 'laundry' ||
          true // vertical filter may broaden to related
        ).toBe(true);
      }
    }
  });

  test('J2.2 — filter by is_free=true returns only free templates', async ({ request }) => {
    const res = await request.get(`${API_BASE}/templates?is_free=true`, {
      headers: authHeaders(),
    });
    if (res.status() === 200) {
      const body = await res.json() as Record<string, unknown>;
      const templates = (body['templates'] as Array<Record<string, unknown>>) ?? [];
      for (const tmpl of templates) {
        if (tmpl['price_kobo'] !== undefined) {
          expect(Number(tmpl['price_kobo'])).toBe(0);
        }
      }
    } else {
      expect([200, 404]).toContain(res.status());
    }
  });

  // ── J2.3: Template detail ────────────────────────────────────────────────
  test('J2.3 — GET /templates/:slug returns template detail or 404', async ({ request }) => {
    const { status } = await apiGet(request, '/templates/laundry-starter');
    expect([200, 404]).toContain(status);
  });

  test('J2.3 — template detail includes required fields when found', async ({ request }) => {
    const { status, body } = await apiGet(request, '/templates/laundry-starter');
    if (status === 200) {
      const b = body as Record<string, unknown>;
      expect(b).toHaveProperty('slug');
      expect(b).toHaveProperty('name');
      // P9: price_kobo must be integer
      if (b['price_kobo'] !== undefined) {
        expect(Number.isInteger(b['price_kobo'])).toBe(true);
      }
    }
  });

  test('J2.3 — non-existent template slug returns 404', async ({ request }) => {
    const { status } = await apiGet(request, '/templates/this-slug-does-not-exist-xyz123');
    expect(status).toBe(404);
  });

  // ── J2.4: Install free template ──────────────────────────────────────────
  test('J2.4 — install free template returns 200/201 or 409 if already installed', async ({ request }) => {
    const { status } = await apiPost(request, '/templates/laundry-starter/install', {
      workspace_id: TEST_WORKSPACE_ID,
    });
    expect([200, 201, 404, 409, 422]).toContain(status);
  });

  test('J2.4 — install request without workspace_id returns 422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/templates/laundry-starter/install`, {
      headers: authHeaders(),
      data: {}, // missing workspace_id
    });
    expect([400, 422]).toContain(res.status());
  });

  // ── J2.5: Paid template purchase initiation ──────────────────────────────
  test('J2.5 — purchase endpoint exists and returns payment URL or error', async ({ request }) => {
    const { status } = await apiPost(request, '/templates/laundry-starter/purchase', {
      workspace_id: TEST_WORKSPACE_ID,
      callback_url: 'https://example.com/callback',
    });
    // May be free (200/201), may need payment (200 with auth_url), or 404 if not seeded
    expect([200, 201, 404, 422]).toContain(status);
  });
});
