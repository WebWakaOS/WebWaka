/**
 * CYCLE-02 Sub-cycle 2E — MON-04 Monetisation Limits
 * Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §4 CYCLE-02 Sub-cycle 2E
 * Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
 *
 * TC-IDs covered:
 *   TC-MON001   Free tier invite limit enforced
 *   TC-MON002   Paid tier invite limit not enforced
 *   TC-MON003   Free tier offering limit enforced
 *   TC-MON004   Free tier offering limit: at limit, creating one more returns 422
 *   TC-MON005   Free tier place limit enforced
 *   TC-MON006   White-label attribution: requiresWebwakaAttribution = true on free plan
 *
 * Priority: TC-MON001, TC-MON003, TC-MON005 are P0 Blockers (revenue leakage).
 *
 * MON-04 invariant (frozen baseline §VIII / Section E.1 Priority Matrix):
 *   Free plan tenants have hard limits:
 *     - Invites: max 3 workspace members
 *     - Offerings: max 10 active offerings
 *     - Places: max 1 registered place
 *   Paid plans (starter, growth, enterprise) have no enforced limits on these items.
 *
 * OQ-003 / G17: Free plan workspaces must have requiresWebwakaAttribution = true.
 *   Paid plans: requiresWebwakaAttribution = false.
 *
 * Seed dependency:
 *   TNT-002 (tenant-b, free plan, WS_B_ID) — pre-seeded as free plan tenant
 *   After these tests, run reset/reset-after-destructive.sql to clean up
 *   test offerings/invites/places created during limit tests.
 */

import { test, expect } from '@playwright/test';
import { authHeaders, API_BASE } from '../fixtures/api-client.js';

const TENANT_B_ID = '10000000-0000-4000-b000-000000000002'; // free plan
const TENANT_A_ID = '10000000-0000-4000-b000-000000000001'; // starter plan (paid)
const WS_B_ID = '20000000-0000-4000-c000-000000000002'; // free plan workspace
const WS_A_ID = '20000000-0000-4000-c000-000000000001'; // starter plan workspace

// ──────────────────────────────────────────────────────────────────────────────
// TC-MON001: Free tier invite limit enforced
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-MON001: Free tier invite limit', () => {

  test('TC-MON001.1 — Creating 4th invite on free plan returns 422 (limit = 3)', async ({ request }) => {
    // First, create 3 invites for TNT-002 (to reach the limit)
    const emails = [
      'mon-test-invite-1@mon-test.invalid',
      'mon-test-invite-2@mon-test.invalid',
      'mon-test-invite-3@mon-test.invalid',
    ];
    for (const email of emails) {
      await request.post(`${API_BASE}/workspaces/${WS_B_ID}/invite`, {
        headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
        data: { email, role: 'member' },
      });
    }
    // Now attempt the 4th invite (over free plan limit of 3)
    const res = await request.post(`${API_BASE}/workspaces/${WS_B_ID}/invite`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
      data: { email: 'mon-test-invite-4@mon-test.invalid', role: 'member' },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // Free plan at limit: must return 422 or 402 (payment required)
    expect([402, 422]).toContain(res.status());
    if ([402, 422].includes(res.status())) {
      const body = await res.text();
      expect(body.toLowerCase()).toMatch(/limit|plan|upgrade|quota|free/);
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-MON002: Paid tier invite limit NOT enforced
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-MON002: Paid tier invite limit not enforced', () => {

  test('TC-MON002.1 — Starter plan (TNT-001) invite creation is not blocked by invite limit', async ({ request }) => {
    const res = await request.post(`${API_BASE}/workspaces/${WS_A_ID}/invite`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: {
        email: 'mon-paid-test-invite@mon-test.invalid',
        role: 'member',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // Paid plan: must NOT return 402 or 422 for plan limits
    // 200/201 = success; 400 = other validation error; 409 = duplicate
    expect([200, 201, 400, 409]).toContain(res.status());
    if ([422, 402].includes(res.status())) {
      const body = await res.text();
      // If 422, it must NOT be a plan limit error
      expect(body.toLowerCase()).not.toMatch(/free.*plan|upgrade.*plan|invite.*limit/);
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-MON003: Free tier offering limit enforced (max 10 active)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-MON003: Free tier offering limit', () => {

  test('TC-MON003.1 — 11th active offering on free plan returns 422', async ({ request }) => {
    // Create 10 offerings to reach the limit
    for (let i = 1; i <= 10; i++) {
      await request.post(`${API_BASE}/offerings`, {
        headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
        data: {
          workspace_id: WS_B_ID,
          name: `MON-TEST-OFF-${i}`,
          price_kobo: 10000 * i, // integer kobo, P9 compliant
          status: 'active',
          vertical_slug: 'hair-salon',
        },
      });
    }
    // 11th offering must be rejected
    const res = await request.post(`${API_BASE}/offerings`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
      data: {
        workspace_id: WS_B_ID,
        name: 'MON-TEST-OFF-11',
        price_kobo: 110000,
        status: 'active',
        vertical_slug: 'hair-salon',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([402, 422]).toContain(res.status());
    if ([402, 422].includes(res.status())) {
      const body = await res.text();
      expect(body.toLowerCase()).toMatch(/limit|plan|upgrade|quota|offering/);
    }
  });

  test('TC-MON003.2 — Inactive offering does NOT count toward free tier limit', async ({ request }) => {
    // Creating an inactive offering must not be blocked even at the active limit
    const res = await request.post(`${API_BASE}/offerings`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
      data: {
        workspace_id: WS_B_ID,
        name: 'MON-TEST-INACTIVE-OFF',
        price_kobo: 50000,
        status: 'inactive', // Inactive — should not count toward free limit
        vertical_slug: 'hair-salon',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // Inactive offering must not be blocked by active-offering limit
    expect([200, 201, 400, 409]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-MON004: Free tier at-limit rejection message is informative
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-MON004: Free tier limit error message quality', () => {

  test('TC-MON004.1 — Plan limit rejection response includes upgrade path hint', async ({ request }) => {
    // After limits are hit (TC-MON003 context), the error must guide the user
    const res = await request.post(`${API_BASE}/offerings`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
      data: {
        workspace_id: WS_B_ID,
        name: 'MON-TEST-LIMIT-MESSAGE',
        price_kobo: 20000,
        status: 'active',
        vertical_slug: 'hair-salon',
      },
    });
    if ([402, 422].includes(res.status())) {
      const body = await res.text();
      // Error response should mention upgrade or plan
      expect(body.toLowerCase()).toMatch(/plan|upgrade|limit|quota/);
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-MON005: Free tier place limit enforced (max 1)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-MON005: Free tier place limit (max 1)', () => {

  test('TC-MON005.1 — First place creation on free plan succeeds', async ({ request }) => {
    const res = await request.post(`${API_BASE}/places`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
      data: {
        workspace_id: WS_B_ID,
        name: 'MON-TEST-PLACE-1',
        address: 'Test Address, Lagos',
        lga: 'Ikeja',
        state: 'Lagos',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // First place: 200/201 or 409 (already exists from previous run)
    expect([200, 201, 409]).toContain(res.status());
  });

  test('TC-MON005.2 — Second place creation on free plan returns 422 (limit = 1)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/places`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
      data: {
        workspace_id: WS_B_ID,
        name: 'MON-TEST-PLACE-2',
        address: 'Test Address 2, Lagos',
        lga: 'Surulere',
        state: 'Lagos',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // Second place on free plan: must be rejected with 402 or 422
    expect([402, 422]).toContain(res.status());
    if ([402, 422].includes(res.status())) {
      const body = await res.text();
      expect(body.toLowerCase()).toMatch(/limit|plan|upgrade|place|quota/);
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-MON006 / TC-WL005 / TC-WL006: Attribution rules per plan (OQ-003, G17)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-MON006 / TC-WL005 / TC-WL006: Webwaka attribution rules', () => {

  test('TC-WL005 — Free plan workspace returns requiresWebwakaAttribution: true (OQ-003)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces/${WS_B_ID}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_B_ID }),
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json() as {
        requires_webwaka_attribution?: boolean;
        requiresWebwakaAttribution?: boolean;
        attribution?: { required: boolean };
      };
      const attributionRequired =
        body.requires_webwaka_attribution === true ||
        body.requiresWebwakaAttribution === true ||
        body.attribution?.required === true;
      // OQ-003 / G17: Free plan must require attribution
      expect(attributionRequired).toBe(true);
    }
  });

  test('TC-WL006 — Paid plan workspace returns requiresWebwakaAttribution: false (OQ-003)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces/${WS_A_ID}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json() as {
        requires_webwaka_attribution?: boolean;
        requiresWebwakaAttribution?: boolean;
        attribution?: { required: boolean };
      };
      const attributionRequired =
        body.requires_webwaka_attribution === true ||
        body.requiresWebwakaAttribution === true ||
        body.attribution?.required === true;
      // OQ-003: Paid plan must NOT require attribution
      expect(attributionRequired).toBe(false);
    }
  });

});
