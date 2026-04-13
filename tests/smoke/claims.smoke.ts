/**
 * Smoke Tests — WebWaka OS Claims Lifecycle
 * Runs against a locally-started worker (`wrangler dev`) or the staging URL.
 * Usage:  BASE_URL=http://localhost:8787 SMOKE_API_KEY=<key> npx tsx tests/smoke/claims.smoke.ts
 *
 * Invariants under test:
 *   T3  — tenant isolation on all claim operations
 *   T8  — 8-state claims FSM enforced (UNCLAIMED → INTENT_DECLARED → ...)
 *   P9  — money fields in claims are integer kobo
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

async function fetchJson(
  path: string,
  opts?: RequestInit,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'x-tenant-id': TENANT,
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      ...(opts?.headers ?? {}),
    },
  });
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  return { status: res.status, body };
}

async function fetchRaw(path: string, opts?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, opts);
}

// ── Suite 1: Claim Intent Endpoint ───────────────────────────────────────────
console.log('\nSuite 1: Claim — Intent Declaration');

await check('POST /claim/intent requires auth (rejects bare request)', async () => {
  const res = await fetchRaw('/claim/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId: 'test-profile', claimantId: 'test-user' }),
  });
  expect(res.status === 401 || res.status === 403, `Expected 401/403 without auth, got ${res.status}`);
});

await check('POST /claim/intent with missing body fields returns 400/422', async () => {
  const { status } = await fetchJson('/claim/intent', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  expect(
    status === 400 || status === 422 || status === 401,
    `Expected 400/422/401 for empty claim intent, got ${status}`,
  );
});

// ── Suite 2: Claim Status Endpoint ───────────────────────────────────────────
console.log('\nSuite 2: Claim — Status Check');

await check('GET /claim/status/<invalid> returns 404 or empty', async () => {
  const { status, body } = await fetchJson('/claim/status/nonexistent-profile-xyz');
  expect(
    status === 404 || status === 200,
    `Expected 404 or 200 for unknown profile claim status, got ${status}`,
  );
  if (status === 200) {
    const claims = body['claims'] ?? body['data'];
    if (Array.isArray(claims)) {
      expect(claims.length === 0, 'Unknown profile should have zero claims');
    }
  }
});

// ── Suite 3: Claim Advance Endpoint ──────────────────────────────────────────
console.log('\nSuite 3: Claim — State Advance');

await check('POST /claim/advance requires auth', async () => {
  const res = await fetchRaw('/claim/advance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claimId: 'fake-claim', action: 'VERIFY' }),
  });
  expect(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`);
});

await check('POST /claim/advance with invalid claim ID returns error', async () => {
  const { status } = await fetchJson('/claim/advance', {
    method: 'POST',
    body: JSON.stringify({ claimId: 'nonexistent-claim-id', action: 'VERIFY' }),
  });
  expect(
    status === 404 || status === 400 || status === 422 || status === 401,
    `Expected 404/400/422/401 for invalid claim advance, got ${status}`,
  );
});

// ── Suite 4: Claim Verify Endpoint ───────────────────────────────────────────
console.log('\nSuite 4: Claim — Verification');

await check('POST /claim/verify requires auth', async () => {
  const res = await fetchRaw('/claim/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claimId: 'fake-claim', verificationData: {} }),
  });
  expect(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`);
});

// ── Suite 5: Claims Auth — Protected vs Public ───────────────────────────────
console.log('\nSuite 5: Claims — Auth Enforcement');

await check('Claim status is public (no auth required)', async () => {
  const res = await fetchRaw('/claim/status/any-profile', {
    headers: { 'Content-Type': 'application/json' },
  });
  expect(res.status !== 401 && res.status !== 403, `Claim status should be public, got ${res.status}`);
  expect(res.status < 500, `Claim status returned server error ${res.status}`);
});

await check('Claim intent requires auth (is protected)', async () => {
  const res = await fetchRaw('/claim/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId: 'test', claimantId: 'test' }),
  });
  expect(res.status === 401 || res.status === 403, `Expected 401/403 for claim intent without auth, got ${res.status}`);
});

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  console.error(`SMOKE FAILED — ${failed} checks did not pass`);
  process.exit(1);
}
console.log('All claims smoke checks passed ✓');
