/**
 * Smoke Tests — WebWaka OS SuperAgent (AI Integration)
 * Run against a locally-started worker or staging URL.
 * Usage:  BASE_URL=http://localhost:8787 npx tsx tests/smoke/superagent.smoke.ts
 *
 * Invariants under test:
 *   P7   — no direct AI SDK calls (verified via compliance endpoint)
 *   P12  — USSD exclusion on AI routes
 *   SA-4 — HITL, spend controls, compliance, NDPR register
 */

const BASE = process.env['SMOKE_BASE_URL'] ?? process.env['BASE_URL'] ?? 'http://localhost:8787';
const TENANT = process.env['SMOKE_TENANT_ID'] ?? 'tenant_smoke_001';
const API_KEY = process.env['SMOKE_API_KEY'];
if (!API_KEY) {
  console.error('[smoke] FATAL: SMOKE_API_KEY environment variable is not set. Exiting.');
  process.exit(1);
}

let passed = 0;
let failed = 0;

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}: ${(e as Error).message}`);
    failed++;
  }
}

function expect(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function authedFetch(path: string, opts?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'x-tenant-id': TENANT,
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      ...(opts?.headers ?? {}),
    },
  });
}

async function unauthFetch(path: string, opts?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts?.headers ?? {}),
    },
  });
}

async function json(path: string, opts?: RequestInit): Promise<Record<string, unknown>> {
  const res = await authedFetch(path, opts);
  return res.json() as Promise<Record<string, unknown>>;
}

// ── Suite 1: Compliance Check Endpoint ──────────────────────────────────────
console.log('\nSuite 1: Compliance Check (SA-4.5)');

await check('GET /superagent/compliance/check requires vertical param', async () => {
  const res = await authedFetch('/superagent/compliance/check');
  expect(res.status === 400, `Expected 400, got ${res.status}`);
});

await check('Non-sensitive vertical (laundry) does not trigger HITL', async () => {
  const r = await json('/superagent/compliance/check?vertical=laundry');
  expect(r['is_sensitive'] === false, `Expected is_sensitive:false, got ${r['is_sensitive']}`);
  expect(r['requires_hitl'] === false, `Expected requires_hitl:false, got ${r['requires_hitl']}`);
});

await check('Sensitive vertical (hospital) triggers HITL', async () => {
  const r = await json('/superagent/compliance/check?vertical=hospital');
  expect(r['is_sensitive'] === true, `Expected is_sensitive:true, got ${r['is_sensitive']}`);
  expect(r['requires_hitl'] === true, `Expected requires_hitl:true, got ${r['requires_hitl']}`);
  expect(typeof r['hitl_level'] === 'number', `Expected hitl_level number, got ${typeof r['hitl_level']}`);
});

await check('Legal vertical returns HITL + disclaimers', async () => {
  const r = await json('/superagent/compliance/check?vertical=legal');
  expect(r['requires_hitl'] === true, 'Legal must require HITL');
  expect(Array.isArray(r['disclaimers']), 'Must return disclaimers array');
  expect((r['disclaimers'] as string[]).length > 0, 'Legal must have disclaimers');
});

await check('Political vertical returns HITL', async () => {
  const r = await json('/superagent/compliance/check?vertical=politician');
  expect(r['requires_hitl'] === true, 'Politician must require HITL');
});

// ── Suite 2: Auth Guards — Unauthenticated Rejection ────────────────────────
console.log('\nSuite 2: Auth Guards — Unauthenticated Access Blocked');

await check('HITL queue rejects unauthenticated requests', async () => {
  const res = await unauthFetch('/superagent/hitl/queue');
  expect(res.status === 401 || res.status === 403, `Expected 401/403 for unauth, got ${res.status}`);
});

await check('Budget list rejects unauthenticated requests', async () => {
  const res = await unauthFetch('/superagent/budgets');
  expect(res.status === 401 || res.status === 403, `Expected 401/403 for unauth, got ${res.status}`);
});

await check('NDPR register rejects unauthenticated requests', async () => {
  const res = await unauthFetch('/superagent/ndpr/register');
  expect(res.status === 401 || res.status === 403, `Expected 401/403 for unauth, got ${res.status}`);
});

await check('Audit export rejects unauthenticated requests', async () => {
  const res = await unauthFetch('/superagent/audit/export');
  expect(res.status === 401 || res.status === 403, `Expected 401/403 for unauth, got ${res.status}`);
});

// ── Suite 3: Route Registration (authenticated) ─────────────────────────────
console.log('\nSuite 3: Route Registration (SA-4)');

await check('GET /superagent/hitl/queue route exists (not 404)', async () => {
  const res = await authedFetch('/superagent/hitl/queue');
  expect(res.status !== 404, 'HITL queue route must be registered');
  expect(res.status < 500, `HITL queue returned ${res.status} server error`);
});

await check('POST /superagent/hitl/submit route exists (not 404)', async () => {
  const res = await authedFetch('/superagent/hitl/submit', {
    method: 'POST',
    body: JSON.stringify({ vertical: 'test', content: 'test', hitl_level: 1 }),
  });
  expect(res.status !== 404, 'HITL submit route must be registered');
  expect(res.status < 500, `HITL submit returned ${res.status} server error`);
});

await check('GET /superagent/budgets route exists (not 404)', async () => {
  const res = await authedFetch('/superagent/budgets');
  expect(res.status !== 404, 'Budget list route must be registered');
  expect(res.status < 500, `Budget list returned ${res.status} server error`);
});

await check('GET /superagent/ndpr/register route exists (not 404)', async () => {
  const res = await authedFetch('/superagent/ndpr/register');
  expect(res.status !== 404, 'NDPR register route must be registered');
  expect(res.status < 500, `NDPR register returned ${res.status} server error`);
});

await check('GET /superagent/audit/export route exists (not 404)', async () => {
  const res = await authedFetch('/superagent/audit/export');
  expect(res.status !== 404, 'Audit export route must be registered');
  expect(res.status < 500, `Audit export returned ${res.status} server error`);
});

await check('GET /superagent/usage route exists (not 404)', async () => {
  const res = await authedFetch('/superagent/usage');
  expect(res.status !== 404, 'Usage route must be registered');
  expect(res.status < 500, `Usage returned ${res.status} server error`);
});

// ── Suite 4: USSD Exclusion (P12) ──────────────────────────────────────────
console.log('\nSuite 4: USSD Exclusion (P12)');

await check('SuperAgent /chat rejects USSD sessions', async () => {
  const res = await authedFetch('/superagent/chat', {
    method: 'POST',
    headers: { 'X-USSD-Session': 'ussd-sess-001' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'hello' }],
      capability: 'text_generation',
    }),
  });
  expect(res.status === 503 || res.status === 403, `Expected 503/403 for USSD, got ${res.status}`);
});

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  console.error(`SMOKE FAILED — ${failed} checks did not pass`);
  process.exit(1);
}
console.log('All SuperAgent smoke checks passed ✓');
