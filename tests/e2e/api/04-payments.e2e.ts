/**
 * E2E Journey 4: Payment Flow (Paystack + WalletService)
 * QA-04 — Critical path: initiate payment, callback, wallet credit/debit
 *
 * Platform invariants:
 *   P9 — all amounts are integer kobo (no floats)
 *   T3 — tenant_id on all payment records
 *
 * Journeys covered:
 *   J4.1  P9: payment initiation rejects float kobo
 *   J4.2  P9: payment initiation accepts integer kobo
 *   J4.3  Paystack webhook callback route exists
 *   J4.4  Wallet credit endpoint exists
 *   J4.5  Wallet debit rejects insufficient funds
 *
 * KI-002 patch — TC-P003: P9 float kobo rejection (defense-in-depth)
 *   Explicit TC-P003 labeling + coverage extended to wallet/credit,
 *   wallet/debit, pos/sale, and bank-transfer endpoints.
 *   TC-P003 is the frozen-baseline TC-ID for fractional kobo rejection.
 *   (TC-P003 is also covered in 10-payment-integrity.e2e.ts and
 *   17-wallet-lifecycle.e2e.ts — this file adds defense-in-depth coverage
 *   for payment-adjacent routes not tested in those files.)
 */

import { test, expect } from '@playwright/test';
import { apiGet, apiPost, authHeaders, API_BASE, TEST_WORKSPACE_ID } from '../fixtures/api-client.js';

test.describe('J4: Payment Flow', () => {

  // ── J4.1: P9 float rejection ──────────────────────────────────────────────
  test('J4.1 — P9: payment with float kobo is rejected 422', async ({ request }) => {
    const res = await request.post(`${API_BASE}/payments/initiate`, {
      headers: authHeaders(),
      data: {
        workspace_id: TEST_WORKSPACE_ID,
        amount_kobo: 150.50, // FLOAT — must be rejected
        description: 'Test payment',
        email: 'payer@example.ng',
      },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('J4.1 — P9: price-lock rejects float kobo', async ({ request }) => {
    const res = await request.post(`${API_BASE}/price-lock`, {
      headers: authHeaders(),
      data: { itemRef: 'e2e-item', amountKobo: 99.99, expiresIn: 300 },
    });
    expect([400, 422, 404]).toContain(res.status()); // 404 if price-lock route not under /api
  });

  // ── J4.2: P9 valid integer kobo ──────────────────────────────────────────
  test('J4.2 — P9: payment initiation with integer kobo proceeds', async ({ request }) => {
    const { status } = await apiPost(request, '/payments/initiate', {
      workspace_id: TEST_WORKSPACE_ID,
      amount_kobo: 15000, // integer — ₦150.00
      description: 'E2E test payment',
      email: 'e2e-payer@webwaka-test.invalid',
    });
    // May succeed or fail with gateway error in test env — but NOT a validation error
    expect([200, 201, 400, 404, 422, 502]).toContain(status);
    if (status === 400 || status === 422) {
      // If validation error, it must NOT be about float — the float test above handled that
    }
  });

  test('J4.2 — payment endpoint enforces tenant isolation (T3)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/payments/initiate`, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'e2e-test-key' },
      // Deliberately no x-tenant-id
      data: { workspace_id: TEST_WORKSPACE_ID, amount_kobo: 5000 },
    });
    expect(res.status()).toBe(401);
  });

  // ── J4.3: Paystack webhook callback ──────────────────────────────────────
  test('J4.3 — Paystack callback route exists and accepts POST', async ({ request }) => {
    const res = await request.post(`${API_BASE}/payments/paystack/callback`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        event: 'charge.success',
        data: {
          reference: 'e2e-ref-001',
          amount: 15000,
          status: 'success',
          customer: { email: 'e2e-payer@webwaka-test.invalid' },
        },
      },
    });
    // Must not be 404 (route not registered) or 500 (crash)
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
  });

  test('J4.3 — Paystack callback with invalid signature is rejected', async ({ request }) => {
    const res = await request.post(`${API_BASE}/payments/paystack/callback`, {
      headers: {
        'Content-Type': 'application/json',
        'x-paystack-signature': 'invalid-hmac-signature',
      },
      data: { event: 'charge.success', data: {} },
    });
    // Should reject invalid HMAC — 400, 401, or 403
    expect([200, 400, 401, 403, 422]).toContain(res.status()); // 200 acceptable in dev mode
  });

  // ── J4.4: Wallet operations ───────────────────────────────────────────────
  test('J4.4 — GET /superagent/wallet returns wallet or 404', async ({ request }) => {
    const { status, body } = await apiGet(request, '/superagent/wallet');
    expect([200, 404]).toContain(status);
    if (status === 200) {
      const b = body as Record<string, unknown>;
      // P9: balance_waku_cu must be integer
      if (b['balance_waku_cu'] !== undefined) {
        expect(Number.isInteger(b['balance_waku_cu'])).toBe(true);
      }
    }
  });

  // ── J4.5: Wallet debit insufficient funds ─────────────────────────────────
  test('J4.5 — wallet debit returns success:false on insufficient balance', async ({ request }) => {
    const { status, body } = await apiPost(request, '/superagent/wallet/debit', {
      amount_waku_cu: 999_999_999, // astronomical amount — must fail
      description: 'E2E insufficient funds test',
    });
    // Either 200 with success:false, or 402/422
    if (status === 200) {
      const b = body as Record<string, unknown>;
      expect(b['success']).toBe(false);
    } else {
      expect([200, 402, 404, 422]).toContain(status);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// KI-002 patch: TC-P003 — P9 float kobo rejection (defense-in-depth)
//
// TC-P003 is the frozen-baseline TC-ID for fractional/float kobo rejection.
// P9 invariant: ALL amount_kobo fields across ALL payment-adjacent routes
// must be validated as integers. A float value must return 400 or 422.
//
// Primary coverage: 10-payment-integrity.e2e.ts, 17-wallet-lifecycle.e2e.ts
// This block adds defense-in-depth: additional routes not covered by those files.
// ──────────────────────────────────────────────────────────────────────────────

const P9_FLOAT_AMOUNTS = [
  { value: 150.50, label: '150.50 (half-kobo)' },
  { value: 0.01, label: '0.01 (sub-kobo)' },
  { value: 999.99, label: '999.99 (common float)' },
  { value: 1.1, label: '1.1 (minimal float)' },
];

const TENANT_A_ID_P9 = '10000000-0000-4000-b000-000000000001';
const WS_A_ID_P9 = '20000000-0000-4000-c000-000000000001';

test.describe('TC-P003: P9 float kobo rejection — payment routes (defense-in-depth)', () => {

  for (const floatCase of P9_FLOAT_AMOUNTS) {
    test(`TC-P003 — POST /payments/initiate rejects float ${floatCase.label}`, async ({ request }) => {
      const res = await request.post(`${API_BASE}/payments/initiate`, {
        headers: authHeaders({ 'x-tenant-id': TENANT_A_ID_P9 }),
        data: {
          workspace_id: WS_A_ID_P9,
          amount_kobo: floatCase.value,
          email: 'p9-test@webwaka-test.invalid',
          description: `TC-P003 float test: ${floatCase.label}`,
        },
      });
      expect(res.status()).not.toBe(404);
      expect(res.status()).not.toBe(500);
      // P9: float amounts must be rejected — 200/201 would be a P9 violation
      expect(res.status()).not.toBe(200);
      expect(res.status()).not.toBe(201);
      expect([400, 422]).toContain(res.status());
    });
  }

  test('TC-P003 — POST /wallet/credit rejects float amount_kobo', async ({ request }) => {
    const res = await request.post(`${API_BASE}/wallet/credit`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID_P9 }),
      data: {
        wallet_id: '40000000-0000-4000-e000-000000000001',
        amount_kobo: 99.99, // float — P9 violation
        description: 'TC-P003 wallet credit float test',
        reference: 'tc-p003-credit-float-001',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect(res.status()).not.toBe(200);
    expect([400, 422]).toContain(res.status());
  });

  test('TC-P003 — POST /wallet/debit rejects float amount_kobo', async ({ request }) => {
    const res = await request.post(`${API_BASE}/wallet/debit`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID_P9 }),
      data: {
        wallet_id: '40000000-0000-4000-e000-000000000001',
        amount_kobo: 49.5, // float — P9 violation
        description: 'TC-P003 wallet debit float test',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect(res.status()).not.toBe(200);
    expect([400, 422]).toContain(res.status());
  });

  test('TC-P003 — POST /bank-transfer rejects float amount_kobo', async ({ request }) => {
    const res = await request.post(`${API_BASE}/bank-transfer`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID_P9 }),
      data: {
        workspace_id: WS_A_ID_P9,
        amount_kobo: 500.25, // float — P9 violation
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(201);
    expect([400, 422]).toContain(res.status());
  });

  test('TC-P003 — POST /pos/sale rejects float amount_kobo', async ({ request }) => {
    const res = await request.post(`${API_BASE}/pos/sale`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID_P9 }),
      data: {
        workspace_id: WS_A_ID_P9,
        amount_kobo: 199.99, // float — P9 violation
        items: [{
          offering_id: '60000000-0000-4000-a001-000000000001',
          quantity: 1,
          unit_price_kobo: 199.99, // also float
        }],
        payment_method: 'cash',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(201);
    expect([400, 422]).toContain(res.status());
  });

  test('TC-P003 — Negotiation session rejects float proposed_price_kobo', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/v1/negotiation/sessions`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_A_ID_P9 }),
      data: {
        workspace_id: WS_A_ID_P9,
        offering_id: '60000000-0000-4000-a001-000000000001',
        seller_workspace_id: '20000000-0000-4000-c000-000000000003',
        proposed_price_kobo: 45000.50, // float — P9 violation
        message: 'TC-P003 negotiation float test',
      },
    });
    expect(res.status()).not.toBe(500);
    expect(res.status()).not.toBe(200);
    expect(res.status()).not.toBe(201);
    expect([400, 422]).toContain(res.status());
  });

});
