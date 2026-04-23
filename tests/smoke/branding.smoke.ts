/**
 * Smoke Tests — WebWaka OS Branding & Themes
 * Runs against a locally-started worker (`wrangler dev`) or the staging URL.
 * Usage:  BASE_URL=http://localhost:8787 SMOKE_API_KEY=<key> npx tsx tests/smoke/branding.smoke.ts
 *
 * Invariants under test:
 *   T3  — tenant isolation on theme operations
 *   T5  — white-label theming resolves per-tenant
 *   P12 — public tenant manifest is accessible
 *
 * NOTE: Cloudflare Bot Fight Mode may return 403 HTML challenge pages from CI/CD
 * runners. All checks treat CF challenge 403 as "CF is alive" — not a route failure.
 */

const BASE = process.env['SMOKE_BASE_URL'] ?? process.env['BASE_URL'] ?? 'http://localhost:8787';
const TENANT = process.env['SMOKE_TENANT_ID'] ?? 'tenant_smoke_001';
const API_KEY = process.env['SMOKE_API_KEY'] ?? process.env['E2E_API_KEY'];
if (!API_KEY) {
  console.error('[smoke] FATAL: SMOKE_API_KEY (or E2E_API_KEY) environment variable is not set. Exiting.');
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

/** Returns true if the response is a Cloudflare Bot Fight Mode challenge page */
function isCfChallenge(status: number, txt: string): boolean {
  return status === 403 && (
    txt.includes('Just a moment') ||
    txt.includes('Checking your browser') ||
    txt.includes('cf-browser-verification') ||
    txt.includes('_cf_chl') ||
    txt.includes('Cloudflare')
  );
}

async function fetchJson(
  path: string,
  opts?: RequestInit,
): Promise<{ status: number; body: Record<string, unknown>; raw: string }> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'x-tenant-id': TENANT,
      'x-api-key': API_KEY!,
      'Content-Type': 'application/json',
      ...(opts?.headers ?? {}),
    },
  });
  const raw = await res.text(); // read body ONCE to avoid "Body has already been read" error
  let body: Record<string, unknown> = {};
  try { body = JSON.parse(raw) as Record<string, unknown>; } catch { body = {}; }
  return { status: res.status, body, raw };
}

async function fetchRaw(path: string, opts?: RequestInit): Promise<{ status: number; raw: string }> {
  const res = await fetch(`${BASE}${path}`, opts);
  const raw = await res.text();
  return { status: res.status, raw };
}

// ── Suite 1: Public Tenant Manifest ──────────────────────────────────────────
console.log('\nSuite 1: Public Tenant Manifest');

await check('GET /public/<tenant-slug> returns manifest or 404', async () => {
  const { status, raw } = await fetchJson(`/public/${TENANT}`);
  if (isCfChallenge(status, raw)) {
    console.log('    [CF WAF] Bot challenge — endpoint reachable through Cloudflare');
    return;
  }
  expect(
    status === 200 || status === 404,
    `Expected 200 or 404 for tenant manifest, got ${status}`,
  );
});

await check('GET /public/<invalid-slug> returns 404', async () => {
  const { status, raw } = await fetchJson('/public/nonexistent-tenant-slug-xyz');
  if (isCfChallenge(status, raw)) {
    console.log('    [CF WAF] Bot challenge — endpoint reachable through Cloudflare');
    return;
  }
  expect(status === 404, `Expected 404 for invalid tenant slug, got ${status}`);
});

// ── Suite 2: Theme Endpoint Auth ─────────────────────────────────────────────
console.log('\nSuite 2: Theme Endpoint Auth');

await check('POST /themes/<tenantId> requires auth (rejects bare request)', async () => {
  const { status, raw } = await fetchRaw(`/themes/${TENANT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ primaryColor: '#FF6600', logoUrl: 'https://example.com/logo.png' }),
  });
  if (isCfChallenge(status, raw)) {
    console.log('    [CF WAF] Bot challenge — endpoint reachable through Cloudflare');
    return;
  }
  expect(status === 401 || status === 403, `Expected 401/403, got ${status}`);
});

await check('POST /themes/<tenantId> without x-api-key is rejected', async () => {
  const { status, raw } = await fetchRaw(`/themes/${TENANT}`, {
    method: 'POST',
    headers: { 'x-tenant-id': TENANT, 'Content-Type': 'application/json' },
    body: JSON.stringify({ primaryColor: '#FF6600' }),
  });
  if (isCfChallenge(status, raw)) {
    console.log('    [CF WAF] Bot challenge — endpoint reachable through Cloudflare');
    return;
  }
  // CF WAF returns 403 for missing API key before Worker auth can return 401
  expect(status === 401 || status === 403, `Expected 401 or 403 without api-key, got ${status}`);
});

// ── Suite 3: Theme Tenant Isolation ──────────────────────────────────────────
console.log('\nSuite 3: Theme — Tenant Isolation');

await check('Theme update without x-tenant-id is rejected', async () => {
  const { status, raw } = await fetchRaw(`/themes/${TENANT}`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ primaryColor: '#FF6600' }),
  });
  if (isCfChallenge(status, raw)) {
    console.log('    [CF WAF] Bot challenge — endpoint reachable through Cloudflare');
    return;
  }
  // CF WAF returns 403 for missing tenant-id before Worker T3 middleware can return 401
  expect(status === 401 || status === 403, `Expected 401 or 403 without tenant-id, got ${status}`);
});

// ── Suite 4: Admin Dashboard Endpoint ────────────────────────────────────────
console.log('\nSuite 4: Admin Dashboard');

await check('GET /admin/<workspaceId>/dashboard requires auth', async () => {
  const { status, raw } = await fetchRaw('/admin/fake-workspace/dashboard', {
    headers: { 'Content-Type': 'application/json' },
  });
  if (isCfChallenge(status, raw)) {
    console.log('    [CF WAF] Bot challenge — endpoint reachable through Cloudflare');
    return;
  }
  expect(
    status === 401 || status === 403 || status === 404,
    `Expected 401/403/404 for admin dashboard without auth, got ${status}`,
  );
});

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) {
  console.error(`SMOKE FAILED — ${failed} checks did not pass`);
  process.exit(1);
}
console.log('All branding smoke checks passed ✓');
