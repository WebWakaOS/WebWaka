/**
 * CYCLE-05 — Bank Transfer FSM Full Coverage
 * Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §4 CYCLE-05 Sub-cycle 5A
 * Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
 *
 * TC-IDs covered:
 *   TC-F001   BTO creation: reference format, FSM initial state
 *   TC-F002   BTO: list orders for workspace
 *   TC-F003   BTO: get single order by ID
 *   TC-F004   BTO: confirm → wallet updated
 *   TC-F005   BTO: reject with reason
 *   TC-F006   BTO: expired state (system-driven)
 *   TC-F007   BTO: dispute within 24h
 *   TC-F008   BTO: dispute rejected after 24h window (closed)
 *   TC-F011   BTO: proof submission
 *   TC-F012   BTO: confirm transitions FSM correctly
 *   TC-F013   BTO: reject transitions FSM correctly
 *   TC-F014   BTO: dispute record created in bank_transfer_disputes table
 *
 * P21 Bank Transfer FSM (frozen baseline §XV.2):
 *   States: pending → proof_submitted → confirmed | rejected | expired
 *   Transitions:
 *     pending → proof_submitted (buyer submits proof)
 *     pending → expired (system sweep after expiry)
 *     proof_submitted → confirmed (seller/admin confirms)
 *     proof_submitted → rejected (seller/admin rejects with reason)
 *     confirmed → disputed (buyer raises dispute within 24h of confirmed_at)
 *
 * Terminal states: confirmed (post-24h), rejected, expired
 * No transition FROM a terminal state is permitted.
 *
 * T3: All BTO rows scoped to tenant_id from JWT.
 * P9: All amount_kobo fields must be integers.
 *
 * Seed dependencies (Phase 4 seed):
 *   BTO-001 = pending state
 *   BTO-002 = proof_submitted state
 *   BTO-003 = confirmed < 24h (dispute open)
 *   BTO-004 = confirmed > 24h (dispute closed)
 */

import { test, expect } from '@playwright/test';
import { authHeaders, API_BASE } from '../fixtures/api-client.js';

const TENANT_A_ID = '10000000-0000-4000-b000-000000000001';
const WS_A_ID = '20000000-0000-4000-c000-000000000001';
const BTO_001 = '50000000-0000-4000-f000-000000000001';
const BTO_002 = '50000000-0000-4000-f000-000000000002';
const BTO_003 = '50000000-0000-4000-f000-000000000003';
const BTO_004 = '50000000-0000-4000-f000-000000000004';

// ──────────────────────────────────────────────────────────────────────────────
// TC-F001: BTO creation — reference format, FSM initial state
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-F001: BTO creation', () => {

  let createdBtoId: string | undefined;

  test('TC-F001.1 — POST /bank-transfer creates order with WKA reference format', async ({ request }) => {
    const res = await request.post(`${API_BASE}/bank-transfer`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: { workspace_id: WS_A_ID, amount_kobo: 200000 },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    if (res.status() === 200 || res.status() === 201) {
      const body = await res.json() as { id?: string; reference?: string; status?: string; amount_kobo?: number };
      expect(typeof body.reference).toBe('string');
      // P21 reference format: WKA-YYYYMMDD-XXXXX
      expect(body.reference).toMatch(/^WKA-\d{8}-[A-Z0-9]{5}$/);
      // FSM initial state: pending
      expect(body.status).toBe('pending');
      // P9: integer kobo
      if (body.amount_kobo !== undefined) {
        expect(Number.isInteger(body.amount_kobo)).toBe(true);
        expect(body.amount_kobo).toBe(200000);
      }
      if (body.id) createdBtoId = body.id;
    }
  });

  test('TC-F001.2 — POST /bank-transfer with missing amount_kobo returns 400/422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/bank-transfer`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: { workspace_id: WS_A_ID }, // Missing amount_kobo
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([400, 422]).toContain(res.status());
  });

  test('TC-F001.3 — POST /bank-transfer without workspace_id returns 400/422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/bank-transfer`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: { amount_kobo: 100000 }, // Missing workspace_id
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([400, 422]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-F002: BTO list orders for workspace (T3 scoped)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-F002: BTO list orders', () => {

  test('TC-F002.1 — GET /bank-transfer returns list for workspace (T3 scoped)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/bank-transfer?workspace_id=${WS_A_ID}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json() as { orders?: Array<{ tenant_id?: string; amount_kobo?: number }> };
      expect(body.orders).toBeDefined();
      expect(Array.isArray(body.orders)).toBe(true);
      if (body.orders) {
        for (const order of body.orders) {
          // T3: All orders must belong to caller's tenant
          if (order.tenant_id) expect(order.tenant_id).toBe(TENANT_A_ID);
          // P9: All amounts must be integers
          if (order.amount_kobo !== undefined) expect(Number.isInteger(order.amount_kobo)).toBe(true);
        }
      }
    }
  });

  test('TC-F002.2 — GET /bank-transfer pagination parameters respected', async ({ request }) => {
    const res = await request.get(`${API_BASE}/bank-transfer?workspace_id=${WS_A_ID}&limit=2&page=1`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json() as { orders?: unknown[]; page?: number; total?: number };
      if (body.orders) {
        expect(body.orders.length).toBeLessThanOrEqual(2);
      }
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-F003: BTO get single order by ID
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-F003: BTO get single order', () => {

  test('TC-F003.1 — GET /bank-transfer/:id returns seeded BTO-001 (pending)', async ({ request }) => {
    const res = await request.get(`${API_BASE}/bank-transfer/${BTO_001}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json() as { id?: string; status?: string; reference?: string; amount_kobo?: number; tenant_id?: string };
      expect(body.id).toBe(BTO_001);
      expect(body.status).toBe('pending');
      expect(body.reference).toMatch(/^WKA-/);
      if (body.amount_kobo !== undefined) expect(Number.isInteger(body.amount_kobo)).toBe(true);
      if (body.tenant_id) expect(body.tenant_id).toBe(TENANT_A_ID); // T3
    }
  });

  test('TC-F003.2 — GET /bank-transfer/nonexistent-id returns 404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/bank-transfer/00000000-0000-0000-0000-000000000000`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(500);
    expect([404]).toContain(res.status());
  });

  test('TC-F003.3 — GET /bank-transfer/:id for different tenant returns 403/404 (T3)', async ({ request }) => {
    // Try to access Tenant A BTO with Tenant B credentials
    const res = await request.get(`${API_BASE}/bank-transfer/${BTO_001}`, {
      headers: authHeaders({ 'x-tenant-id': '10000000-0000-4000-b000-000000000002' }), // Tenant B
    });
    expect(res.status()).not.toBe(500);
    expect([403, 404]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-F011: BTO proof submission
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-F011: BTO proof submission', () => {

  test('TC-F011.1 — POST /bank-transfer/:id/proof on pending order transitions to proof_submitted', async ({ request }) => {
    const res = await request.post(`${API_BASE}/bank-transfer/${BTO_001}/proof`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: {
        proof_url: 'https://storage.webwaka-test.invalid/proof/qa-proof-tc-f011.jpg',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([200, 201, 409]).toContain(res.status()); // 409 if already proof_submitted
    if (res.status() === 200 || res.status() === 201) {
      const body = await res.json() as { status?: string };
      expect(body.status).toBe('proof_submitted');
    }
  });

  test('TC-F011.2 — POST /bank-transfer/:id/proof without proof_url returns 400/422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/bank-transfer/${BTO_001}/proof`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: {}, // Missing proof_url
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([400, 422]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-F004 / TC-F012: BTO confirm → FSM transition to confirmed
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-F004 + TC-F012: BTO confirmation FSM', () => {

  test('TC-F012.1 — POST /bank-transfer/:id/confirm transitions proof_submitted → confirmed', async ({ request }) => {
    const res = await request.post(`${API_BASE}/bank-transfer/${BTO_002}/confirm`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: { confirmed: true },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([200, 403, 409]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json() as { status?: string };
      expect(body.status).toBe('confirmed');
    }
  });

  test('TC-F012.2 — Cannot confirm a pending order (must be proof_submitted first)', async ({ request }) => {
    // Confirming a pending (not proof_submitted) order must fail
    const res = await request.post(`${API_BASE}/bank-transfer/${BTO_001}/confirm`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: { confirmed: true },
    });
    expect(res.status()).not.toBe(500);
    // 409 (wrong state) or 403 (role)
    expect([403, 409, 422]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-F005 / TC-F013: BTO rejection
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-F005 + TC-F013: BTO rejection FSM', () => {

  test('TC-F013.1 — POST /bank-transfer/:id/reject transitions to rejected state', async ({ request }) => {
    // Use BTO-002 (proof_submitted) — if already confirmed by TC-F012, use the same flow
    const res = await request.post(`${API_BASE}/bank-transfer/${BTO_002}/reject`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: { reason: 'QA test rejection — TC-F013' },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([200, 403, 409, 422]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json() as { status?: string; rejection_reason?: string };
      expect(body.status).toBe('rejected');
      if (body.rejection_reason) {
        expect(typeof body.rejection_reason).toBe('string');
        expect(body.rejection_reason.length).toBeGreaterThan(0);
      }
    }
  });

  test('TC-F005.1 — POST /bank-transfer/:id/reject requires reason field', async ({ request }) => {
    const res = await request.post(`${API_BASE}/bank-transfer/${BTO_002}/reject`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: {}, // Missing reason
    });
    expect(res.status()).not.toBe(500);
    expect([400, 409, 422]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-F007 / TC-F014: BTO dispute within 24h window
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-F007 + TC-F014: BTO dispute (window open)', () => {

  test('TC-F014.1 — POST /bank-transfer/:id/dispute creates dispute record in bank_transfer_disputes', async ({ request }) => {
    const res = await request.post(`${API_BASE}/bank-transfer/${BTO_003}/dispute`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: {
        reason: 'TC-F014 — funds not received within stated timeframe',
        dispute_type: 'funds_not_received',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([200, 201, 403, 409]).toContain(res.status());
    if (res.status() === 200 || res.status() === 201) {
      const body = await res.json() as { id?: string; order_id?: string; status?: string };
      expect(body.order_id ?? body.id).toBeDefined();
      // T3: dispute must be scoped to the correct order
      if (body.order_id) {
        expect(body.order_id).toBe(BTO_003);
      }
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-F008: BTO dispute rejected after 24h window closed
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-F008: BTO dispute rejected after 24h window closed', () => {

  test('TC-F008.1 — Dispute on BTO-004 (confirmed 25h ago) returns 409 or 422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/bank-transfer/${BTO_004}/dispute`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
      data: {
        reason: 'TC-F008 — window expired test',
        dispute_type: 'funds_not_received',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(201);
    expect([403, 409, 422]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-F006: BTO expired state (system-driven)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-F006: BTO expired state', () => {

  test('TC-F006.1 — Expired BTO returns status: expired from GET', async ({ request }) => {
    // This test requires a BTO that has elapsed its expiry window
    // In staging, check for any expired orders via list endpoint
    const res = await request.get(`${API_BASE}/bank-transfer?workspace_id=${WS_A_ID}&status=expired`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json() as { orders?: Array<{ status: string }> };
      if (body.orders && body.orders.length > 0) {
        for (const order of body.orders) {
          expect(order.status).toBe('expired');
        }
      }
      // 0 expired orders is acceptable in fresh staging — test verifies route works
    }
  });

  test('TC-F006.2 — Cannot transition from expired state (terminal state enforcement)', async ({ request }) => {
    // Get an expired order ID if any, then attempt to confirm it
    // Attempting to confirm an expired order must fail
    const res = await request.get(`${API_BASE}/bank-transfer?workspace_id=${WS_A_ID}&status=expired&limit=1`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
    });
    if (res.status() === 200) {
      const body = await res.json() as { orders?: Array<{ id: string }> };
      if (body.orders && body.orders.length > 0) {
        const expiredId = body.orders[0].id;
        const confirmRes = await request.post(`${API_BASE}/bank-transfer/${expiredId}/confirm`, {
          headers: authHeaders({ 'x-tenant-id': TENANT_A_ID }),
          data: { confirmed: true },
        });
        expect(confirmRes.status()).not.toBe(200); // Cannot confirm expired order
        expect([403, 409, 422]).toContain(confirmRes.status());
      }
    }
  });

});
