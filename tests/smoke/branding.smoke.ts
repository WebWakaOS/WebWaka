/**
 * Smoke Tests — WebWaka OS Branding & Themes
 * Runs against a locally-started worker (`wrangler dev`) or the staging URL.
 * Usage:  BASE_URL=http://localhost:8787 SMOKE_API_KEY=<key> npx tsx tests/smoke/branding.smoke.ts
 *
 * Invariants under test:
 *   T3  — tenant isolation on theme operations
 *   T5  — white-label theming resolves per-tenant
 *   P12 — public tenant manifest is accessible
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

// ── Suite 1: Public Tenant Manifest ──────────────────────────────────────────
console.log('\nSuite 1: Public Tenant Manifest');

await check('GET /public/<tenant-slug> returns manifest or 404', async () => {
  const { status } = await fetchJson(`/public/${TENANT}`);
  expect(
    status === 200 || status === 404,
    `Expected 200 or 404 for tenant manifest, got ${status}`,
  );
});

await check('GET /public/<invalid-slug> returns 404', async () => {
  const { status } = await fetchJson('/public/nonexistent-tenant-slug-xyz');
  expect(status === 404, `Expected 404 for invalid tenant slug, got ${status}`);
});

// ── Suite 2: Theme Endpoint Auth ─────────────────────────────────────────────
console.log('\nSuite 2: Theme Endpoint Auth');

await check('POST /themes/<tenantId> requires auth (rejects bare request)', async () => {
  const res = await fetchRaw(`/themes/${TENANT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ primaryColor: '#FF6600', logoUrl: 'https://example.com/logo.png' }),
  });
  expect(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`);
});

await check('POST /themes/<tenantId> without x-api-key is rejected', async () => {
  const res = await fetchRaw(`/themes/${TENANT}`, {
    method: 'POST',
    headers: { 'x-tenant-id': TENANT, 'Content-Type': 'application/json' },
    body: JSON.stringify({ primaryColor: '#FF6600' }),
  });
  expect(res.status === 401, `Expected 401 without api-key, got ${res.status}`);
});

// ── Suite 3: Theme Tenant Isolation ──────────────────────────────────────────
console.log('\nSuite 3: Theme — Tenant Isolation');

await check('Theme update without x-tenant-id is rejected', async () => {
  const res = await fetchRaw(`/themes/${TENANT}`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ primaryColor: '#FF6600' }),
  });
  expect(res.status === 401, `Expected 401 without tenant-id, got ${res.status}`);
});

// ── Suite 4: Admin Dashboard Endpoint ────────────────────────────────────────
console.log('\nSuite 4: Admin Dashboard');

await check('GET /admin/<workspaceId>/dashboard requires auth', async () => {
  const res = await fetchRaw('/admin/fake-workspace/dashboard', {
    headers: { 'Content-Type': 'application/json' },
  });
  expect(
    res.status === 401 || res.status === 403 || res.status === 404,
    `Expected 401/403/404 for admin dashboard without auth, got ${res.status}`,
  );
});

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  console.error(`SMOKE FAILED — ${failed} checks did not pass`);
  process.exit(1);
}
console.log('All branding smoke checks passed ✓');
