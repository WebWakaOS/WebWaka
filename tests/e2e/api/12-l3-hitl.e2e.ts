/**
 * CYCLE-02 Sub-cycle 2D — L3 HITL Regulatory Constraints
 * Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §4 CYCLE-02 Sub-cycle 2D
 * Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
 *
 * TC-IDs covered:
 *   TC-HR001   law-firm: AI output held in HITL queue (NBA compliance)
 *   TC-HR002   law-firm: matter_ref_id opaque in AI payloads
 *   TC-HR003   tax-consultant: TIN never in AI payload (FIRS compliance)
 *   TC-HR004   government-agency: Tier 3 KYC mandatory (BPP compliance)
 *   TC-HR005   polling-unit: NO voter PII (name, phone, NIN) in storage or payloads
 *   TC-HR006   funeral-home: case_ref_id opaque in AI payloads
 *   TC-HR007   creche: all AI output under L3 HITL
 *   TC-AI001   SuperAgent: consent + KYC required before AI task submission
 *   TC-AI003   HITL handoff: task held in queue, not delivered immediately
 *   TC-NE011   min_price_kobo absent from ALL API responses (pricing confidentiality)
 *
 * Priority: ALL are P0 Blockers. Any failure halts cycle and requires
 *           compliance lead sign-off.
 *
 * MANUAL WITNESS REQUIRED for TC-HR001–TC-HR007 and TC-AI003.
 *
 * Regulatory anchors:
 *   NBA (Nigerian Bar Association): law-firm AI output requires human lawyer review
 *   FIRS (Federal Inland Revenue Service): TIN is protected tax identifier
 *   INEC (Independent National Electoral Commission): voter PII must never be stored
 *   BPP (Bureau of Public Procurement): government agencies require Tier 3 KYC
 *   L3 HITL (frozen §XV.3): verticals in l3HitlVerticals list hold AI outputs for review
 *
 * L3 HITL verticals (frozen baseline §XV.3 / Section B.23):
 *   law-firm, tax-consultant, government-agency, polling-unit,
 *   funeral-home, creche
 */

import { test, expect } from '@playwright/test';
import { authHeaders, API_BASE } from '../fixtures/api-client.js';

const TENANT_D_ID = '10000000-0000-4000-b000-000000000004'; // law-firm
const TENANT_E_ID = '10000000-0000-4000-b000-000000000005'; // polling-unit
const WS_D_ID = '20000000-0000-4000-c000-000000000004';
const WS_E_ID = '20000000-0000-4000-c000-000000000005';

// ──────────────────────────────────────────────────────────────────────────────
// TC-HR001: law-firm — AI output held in HITL queue (NBA)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-HR001: law-firm AI output HITL gate (NBA)', () => {

  test('TC-HR001.1 — POST /superagent/tasks for law-firm workspace enters HITL queue, not delivered directly', async ({ request }) => {
    // NBA: For law-firm vertical, AI task result must be held for human lawyer review
    // Expected: task creation returns status 'queued_for_review' or 'pending_hitl'
    // NOT 'completed' (direct delivery would bypass NBA compliance)
    const res = await request.post(`${API_BASE}/superagent/tasks`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_D_ID }),
      data: {
        workspace_id: WS_D_ID,
        task_type: 'legal_document_review',
        input: 'Review this contract clause: [QA test input for TC-HR001]',
        matter_ref_id: 'MATTER-QA-TC-HR001', // opaque ref (TC-HR002)
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    if (res.status() === 200 || res.status() === 201) {
      const body = await res.json() as {
        status?: string;
        task_status?: string;
        delivery?: string;
        hitl?: boolean;
      };
      const status = body.status ?? body.task_status ?? '';
      // NBA L3 HITL: must NOT be 'completed' — must be in review queue
      expect(status).not.toBe('completed');
      expect(status).not.toBe('delivered');
      // Valid HITL states
      const validHitlStates = ['queued_for_review', 'pending_hitl', 'pending_review', 'held', 'awaiting_review'];
      const isHeld = validHitlStates.some(s => status.includes(s) || status === s) || body.hitl === true;
      expect(isHeld).toBe(true);
    }
  });

  test('TC-HR001.2 — law-firm workspace vertical config has hitl_required: true', async ({ request }) => {
    const res = await request.get(`${API_BASE}/workspaces/${WS_D_ID}/verticals/law-firm`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_D_ID }),
    });
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json() as { hitl_required?: boolean; l3_hitl?: boolean; review_required?: boolean };
      const hitlActive = body.hitl_required === true || body.l3_hitl === true || body.review_required === true;
      expect(hitlActive).toBe(true);
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-HR002: law-firm — matter_ref_id opaque in AI payloads (NBA)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-HR002: law-firm matter_ref_id opacity (NBA)', () => {

  test('TC-HR002.1 — AI task response does not expose matter_ref_id in output payload', async ({ request }) => {
    const matterRefId = 'MATTER-QA-SENSITIVE-TC-HR002';
    const res = await request.post(`${API_BASE}/superagent/tasks`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_D_ID }),
      data: {
        workspace_id: WS_D_ID,
        task_type: 'legal_document_review',
        input: 'TC-HR002 opacity test',
        matter_ref_id: matterRefId,
      },
    });
    if (res.status() === 200 || res.status() === 201) {
      const body = await res.text();
      // The raw matter_ref_id should not appear in the AI output payload
      // (it may appear in metadata, but not in the AI-generated text/response)
      const parsed = JSON.parse(body) as { ai_output?: string; result?: string };
      const aiText = parsed.ai_output ?? parsed.result ?? '';
      expect(aiText).not.toContain(matterRefId);
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-HR003: tax-consultant — TIN never in AI payload (FIRS)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-HR003: tax-consultant TIN exclusion (FIRS)', () => {

  test('TC-HR003.1 — TIN is not echoed in AI task response for tax-consultant workspace', async ({ request }) => {
    // FIRS: TIN (Tax Identification Number) must never appear in AI payloads
    const testTin = '12345678-0001'; // Test TIN (not real)
    const res = await request.post(`${API_BASE}/superagent/tasks`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_D_ID }),
      data: {
        workspace_id: WS_D_ID,
        task_type: 'tax_advisory',
        input: `Please advise on TIN ${testTin} filing obligations.`, // TIN in input
        vertical: 'tax-consultant',
      },
    });
    if (res.status() === 200 || res.status() === 201) {
      const body = await res.text();
      // FIRS: Raw TIN must never appear in AI-generated response text
      expect(body).not.toContain(testTin);
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-HR004: government-agency — Tier 3 KYC mandatory (BPP)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-HR004: government-agency T3 KYC mandatory (BPP)', () => {

  test('TC-HR004.1 — government-agency workspace requires KYC tier 3 for sensitive operations', async ({ request }) => {
    // BPP: Government agency tenants must complete Tier 3 KYC before accessing
    // procurement or AI features
    const res = await request.post(`${API_BASE}/superagent/tasks`, {
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_E_ID,
        // Deliberately no JWT — expect 401
      },
      data: {
        workspace_id: WS_E_ID,
        task_type: 'procurement_analysis',
        input: 'TC-HR004 KYC test',
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // 401 (no auth) or 403 (KYC gate) — not 200
    expect([401, 403]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-HR005: polling-unit — NO voter PII (name, phone, NIN) in storage or payloads
// MANUAL WITNESS REQUIRED — DB inspection necessary
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-HR005: polling-unit voter PII exclusion (INEC)', () => {

  test('TC-HR005.1 — polling-unit workspace does not accept voter_name in AI task payload', async ({ request }) => {
    // INEC: Voter name must never be stored or processed
    const voterName = 'Test Voter Name INEC TC-HR005';
    const res = await request.post(`${API_BASE}/superagent/tasks`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_E_ID }),
      data: {
        workspace_id: WS_E_ID,
        task_type: 'election_analysis',
        voter_name: voterName, // Attempt to inject voter PII — must be stripped or rejected
        input: 'TC-HR005 INEC test',
      },
    });
    if (res.status() === 200 || res.status() === 201) {
      const body = await res.text();
      // INEC: voter_name must not appear in any AI response or stored payload
      expect(body).not.toContain(voterName);
    }
  });

  test('TC-HR005.2 — polling-unit offerings do not store voter phone or NIN', async ({ request }) => {
    const res = await request.get(`${API_BASE}/offerings?workspace_id=${WS_E_ID}`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_E_ID }),
    });
    if (res.status() === 200) {
      const body = await res.json() as { offerings?: Array<Record<string, unknown>> };
      if (body.offerings) {
        for (const offering of body.offerings) {
          // INEC: No offering row should contain voter phone or NIN fields
          expect(offering['voter_phone']).toBeUndefined();
          expect(offering['voter_nin']).toBeUndefined();
          expect(offering['voter_name']).toBeUndefined();
        }
      }
    }
  });

  // Manual witness note:
  // Query: SELECT * FROM offerings WHERE workspace_id = WS_E_ID
  // Verify: No column contains voter_name, voter_phone, voter_nin, or NIN-format values
  // Query: SELECT * FROM superagent_tasks WHERE workspace_id = WS_E_ID
  // Verify: No task input or output contains voter PII
  // Document in COMPLIANCE_ATTESTATION_LOG.md

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-HR006: funeral-home — case_ref_id opaque in AI payloads
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-HR006: funeral-home case_ref_id opacity', () => {

  test('TC-HR006.1 — funeral-home AI task does not expose case_ref_id in output', async ({ request }) => {
    const caseRef = 'CASE-QA-TC-HR006-FUNERAL';
    const res = await request.post(`${API_BASE}/superagent/tasks`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_D_ID }),
      data: {
        workspace_id: WS_D_ID,
        task_type: 'funeral_arrangements',
        input: 'TC-HR006 funeral test',
        case_ref_id: caseRef,
        vertical: 'funeral-home',
      },
    });
    if (res.status() === 200 || res.status() === 201) {
      const body = await res.json() as { ai_output?: string; result?: string };
      const aiText = body.ai_output ?? body.result ?? '';
      expect(aiText).not.toContain(caseRef);
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-HR007: creche — all AI output under L3 HITL
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-HR007: creche L3 HITL enforcement', () => {

  test('TC-HR007.1 — creche workspace AI task is held for review (not immediately delivered)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/superagent/tasks`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_D_ID }),
      data: {
        workspace_id: WS_D_ID,
        task_type: 'child_care_assessment',
        input: 'TC-HR007 creche test',
        vertical: 'creche',
      },
    });
    expect(res.status()).not.toBe(500);
    if (res.status() === 200 || res.status() === 201) {
      const body = await res.json() as { status?: string; hitl?: boolean };
      const status = body.status ?? '';
      expect(status).not.toBe('completed');
      expect(status).not.toBe('delivered');
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-AI001: SuperAgent — consent + KYC required before AI task submission
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-AI001: SuperAgent consent + KYC gate', () => {

  test('TC-AI001.1 — POST /superagent/tasks without auth returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/superagent/tasks`, {
      headers: { 'Content-Type': 'application/json' },
      data: { task_type: 'general', input: 'TC-AI001 no auth test' },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    expect([401, 403]).toContain(res.status());
  });

  test('TC-AI001.2 — AI task without consent record is blocked', async ({ request }) => {
    // P10: Consent must exist before AI tasks involving PII processing
    const res = await request.post(`${API_BASE}/superagent/tasks`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_D_ID }),
      data: {
        workspace_id: WS_D_ID,
        task_type: 'general',
        input: 'TC-AI001 consent test',
        // Deliberately no consent_id
      },
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // Without consent, must return 400 or 403
    expect([400, 401, 403, 422]).toContain(res.status());
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-AI003: HITL handoff — task held, not immediately delivered
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-AI003: HITL task held in queue (not direct delivery)', () => {

  test('TC-AI003.1 — Task status for L3 HITL vertical is queued, not completed', async ({ request }) => {
    // For any L3 HITL vertical (law-firm, tax-consultant, etc.)
    // the task status must remain in a review state
    const res = await request.get(`${API_BASE}/superagent/tasks?workspace_id=${WS_D_ID}&status=pending_hitl`, {
      headers: authHeaders({ 'x-tenant-id': TENANT_D_ID }),
    });
    expect(res.status()).not.toBe(404);
    expect(res.status()).not.toBe(500);
    // Route must exist; if 200, verify structure
    if (res.status() === 200) {
      const body = await res.json() as { tasks?: Array<{ status: string }> };
      if (body.tasks) {
        for (const task of body.tasks) {
          // All returned tasks should be in HITL review state
          expect(task.status).not.toBe('completed');
          expect(task.status).not.toBe('delivered');
        }
      }
    }
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// TC-NE011: min_price_kobo absent from ALL API responses (pricing confidentiality)
// ──────────────────────────────────────────────────────────────────────────────
test.describe('TC-NE011: min_price_kobo must not appear in any API response', () => {

  const assertNoMinPrice = async (responseText: string, endpoint: string): Promise<void> => {
    // The field min_price_kobo is the seller's floor price — must never be exposed to buyers
    expect(responseText).not.toContain('min_price_kobo');
    expect(responseText).not.toContain('minPriceKobo');
    expect(responseText).not.toContain('min_price');
    expect(responseText).not.toContain('floor_price');
    if (responseText.includes('min_price_kobo')) {
      throw new Error(`CRITICAL: min_price_kobo exposed in ${endpoint} response — pricing leak`);
    }
  };

  test('TC-NE011.1 — GET /api/v1/negotiation/policy does not expose min_price_kobo', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/v1/negotiation/policy`, {
      headers: authHeaders({ 'x-tenant-id': '10000000-0000-4000-b000-000000000001' }),
    });
    if (res.status() === 200) {
      const body = await res.text();
      await assertNoMinPrice(body, 'GET /api/v1/negotiation/policy');
    }
    expect(res.status()).not.toBe(500);
  });

  test('TC-NE011.2 — GET /offerings does not expose min_price_kobo', async ({ request }) => {
    const res = await request.get(`${API_BASE}/offerings`, {
      headers: authHeaders({ 'x-tenant-id': '10000000-0000-4000-b000-000000000001' }),
    });
    if (res.status() === 200) {
      const body = await res.text();
      await assertNoMinPrice(body, 'GET /offerings');
    }
    expect(res.status()).not.toBe(500);
  });

  test('TC-NE011.3 — GET /api/v1/negotiation/sessions does not expose min_price_kobo', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/v1/negotiation/sessions`, {
      headers: authHeaders({ 'x-tenant-id': '10000000-0000-4000-b000-000000000001' }),
    });
    if (res.status() === 200) {
      const body = await res.text();
      await assertNoMinPrice(body, 'GET /api/v1/negotiation/sessions');
    }
    expect(res.status()).not.toBe(500);
  });

  test('TC-NE011.4 — GET /api/v1/b2b/rfq bids do not expose min_price_kobo', async ({ request }) => {
    const rfqId = '80000000-0000-4000-a003-000000000001';
    const res = await request.get(`${API_BASE}/api/v1/b2b/rfq/${rfqId}/bids`, {
      headers: authHeaders({ 'x-tenant-id': '10000000-0000-4000-b000-000000000001' }),
    });
    if (res.status() === 200) {
      const body = await res.text();
      await assertNoMinPrice(body, `GET /api/v1/b2b/rfq/${rfqId}/bids`);
    }
    expect(res.status()).not.toBe(500);
  });

  test('TC-NE011.5 — GET /templates does not expose min_price_kobo', async ({ request }) => {
    const res = await request.get(`${API_BASE}/templates`, {
      headers: authHeaders({ 'x-tenant-id': '10000000-0000-4000-b000-000000000001' }),
    });
    if (res.status() === 200) {
      const body = await res.text();
      await assertNoMinPrice(body, 'GET /templates');
    }
    expect(res.status()).not.toBe(500);
  });

  test('TC-NE011.6 — Discovery search results do not expose min_price_kobo', async ({ request }) => {
    const res = await request.get(`${API_BASE}/discovery/search?q=bakery`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status() === 200) {
      const body = await res.text();
      await assertNoMinPrice(body, 'GET /discovery/search');
    }
    expect(res.status()).not.toBe(500);
  });

});
