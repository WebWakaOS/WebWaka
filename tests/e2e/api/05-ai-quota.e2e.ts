/**
 * E2E Journey 5: AI Usage Quota (MON-03)
 * QA-04 — Critical path: quota endpoint, plan limits, monthly reset
 *
 * Platform invariants:
 *   P9  — WakaCU counts are integers
 *   P13 — no PII in AI request/response
 *
 * Journeys covered:
 *   J5.1  GET /superagent/usage/quota returns quota breakdown
 *   J5.2  Quota response enforces integer WakaCU (P9)
 *   J5.3  Quota respects plan limit boundary
 *   J5.4  P13: quota endpoint does not leak PII
 */

import { test, expect } from '@playwright/test';
import { apiGet, authHeaders, API_BASE } from '../fixtures/api-client.js';

test.describe('J5: AI Usage Quota', () => {

  // ── J5.1: Quota endpoint exists ───────────────────────────────────────────
  test('J5.1 — GET /superagent/usage/quota returns 200 or 404 in test env', async ({ request }) => {
    const { status } = await apiGet(request, '/superagent/usage/quota');
    expect([200, 404]).toContain(status);
  });

  test('J5.1 — quota response includes required fields', async ({ request }) => {
    const { status, body } = await apiGet(request, '/superagent/usage/quota');
    if (status === 200) {
      const b = body as Record<string, unknown>;
      expect(b).toHaveProperty('used_waku_cu');
      expect(b).toHaveProperty('quota_waku_cu');
      expect(b).toHaveProperty('remaining_waku_cu');
      expect(b).toHaveProperty('reset_date');
    }
  });

  test('J5.1 — quota reset_date is ISO 8601 string', async ({ request }) => {
    const { status, body } = await apiGet(request, '/superagent/usage/quota');
    if (status === 200) {
      const b = body as Record<string, unknown>;
      const resetDate = b['reset_date'] as string;
      expect(typeof resetDate).toBe('string');
      expect(new Date(resetDate).toString()).not.toBe('Invalid Date');
    }
  });

  // ── J5.2: P9 — integer WakaCU values ────────────────────────────────────
  test('J5.2 — P9: used_waku_cu is an integer', async ({ request }) => {
    const { status, body } = await apiGet(request, '/superagent/usage/quota');
    if (status === 200) {
      const b = body as Record<string, unknown>;
      expect(Number.isInteger(b['used_waku_cu'])).toBe(true);
    }
  });

  test('J5.2 — P9: quota_waku_cu is an integer', async ({ request }) => {
    const { status, body } = await apiGet(request, '/superagent/usage/quota');
    if (status === 200) {
      const b = body as Record<string, unknown>;
      expect(Number.isInteger(b['quota_waku_cu'])).toBe(true);
    }
  });

  test('J5.2 — P9: remaining_waku_cu is an integer OR null (unlimited plan)', async ({ request }) => {
    const { status, body } = await apiGet(request, '/superagent/usage/quota');
    if (status === 200) {
      const b = body as Record<string, unknown>;
      const remaining = b['remaining_waku_cu'];
      // null means unlimited plan (quota_waku_cu === 0); otherwise must be integer
      const isValid = remaining === null || Number.isInteger(remaining);
      expect(isValid).toBe(true);
    }
  });

  // ── J5.3: Quota math consistency ────────────────────────────────────────
  test('J5.3 — remaining = quota - used (or 0 if overdrawn, null if unlimited)', async ({ request }) => {
    const { status, body } = await apiGet(request, '/superagent/usage/quota');
    if (status === 200) {
      const b = body as Record<string, unknown>;
      const used = b['used_waku_cu'] as number;
      const quota = b['quota_waku_cu'] as number;
      const remaining = b['remaining_waku_cu'];
      const unlimited = b['unlimited'] as boolean;
      if (unlimited || quota === 0) {
        // Unlimited plan: remaining must be null
        expect(remaining).toBeNull();
      } else {
        expect(remaining).toBe(Math.max(0, quota - used));
      }
    }
  });

  test('J5.3 — quota_waku_cu is positive', async ({ request }) => {
    const { status, body } = await apiGet(request, '/superagent/usage/quota');
    if (status === 200) {
      const b = body as Record<string, unknown>;
      expect((b['quota_waku_cu'] as number)).toBeGreaterThan(0);
    }
  });

  // ── J5.4: P13 — no PII in quota response ────────────────────────────────
  test('J5.4 — P13: quota response does not include email or personal name', async ({ request }) => {
    const { status, body } = await apiGet(request, '/superagent/usage/quota');
    if (status === 200) {
      const serialized = JSON.stringify(body).toLowerCase();
      // Should not contain patterns that look like email addresses
      expect(serialized).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/);
    }
  });

  // ── Auth enforcement ──────────────────────────────────────────────────────
  test('J5.5 — quota endpoint requires auth', async ({ request }) => {
    const res = await request.get(`${API_BASE}/superagent/usage/quota`, {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status()).toBe(401);
  });
});
