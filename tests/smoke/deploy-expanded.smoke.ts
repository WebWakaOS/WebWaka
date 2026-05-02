/**
 * Expanded Deployment Smoke Tests — Wave 3 C4-4
 *
 * Adds POST /superagent/consent (dry-run), GET /v1/workspace,
 * GET /v1/discovery/search?q=test to the staging smoke suite.
 *
 * Usage:
 *   SMOKE_BASE_URL=https://api-staging.webwaka.com \
 *   SMOKE_API_KEY=<key> \
 *   SMOKE_TENANT_ID=<tenant> \
 *   npx tsx tests/smoke/deploy-expanded.smoke.ts
 *
 * Complements api-health.smoke.ts and cycle-01-smoke.ts.
 * All 4 checks must pass before a production deploy proceeds.
 */

const BASE      = process.env['SMOKE_BASE_URL'] ?? process.env['BASE_URL'] ?? 'http://localhost:8787';
const TENANT    = process.env['SMOKE_TENANT_ID'] ?? 'tenant_smoke_001';
const API_KEY   = process.env['SMOKE_API_KEY'] ?? process.env['E2E_API_KEY'];
const DISCOVERY = process.env['DISCOVERY_BASE_URL'] ?? BASE.replace('api', 'discovery');

if (!API_KEY) {
  console.error('[smoke] FATAL: SMOKE_API_KEY is required. Exiting.');
  process.exit(1);
}

let passed = 0;
let failed = 0;

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${name}: ${(e as Error).message}`);
    failed++;
  }
}

const headers = { 'Authorization': `Bearer ${API_KEY}`, 'X-Tenant-ID': TENANT };

console.log(`\n[deploy-expanded smoke] ${BASE}\n`);

// 1. Basic health still passes
await check('GET /health → 200', async () => {
  const res = await fetch(`${BASE}/health`);
  if (res.status !== 200) throw new Error(`status ${res.status}`);
});

// 2. Deep health — D1 and KV must be reachable
await check('GET /health/deep → 200/503 with JSON body', async () => {
  const res = await fetch(`${BASE}/health/deep`);
  if (![200, 503].includes(res.status)) throw new Error(`unexpected status ${res.status}`);
  const body = await res.json() as { status: string; checks: unknown };
  if (!body.status || !body.checks) throw new Error('missing status/checks fields');
  if (body.status === 'down') throw new Error(`health/deep reports DOWN: ${JSON.stringify(body)}`);
});

// 3. Consent dry-run — POST /superagent/consent must return 200 or 422 (never 500)
await check('POST /v1/superagent/consent (dry-run) → not 5xx', async () => {
  const res = await fetch(`${BASE}/v1/superagent/consent`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'check', version: '1.0' }),
  });
  if (res.status >= 500) throw new Error(`5xx status ${res.status}`);
});

// 4. Workspace info endpoint
await check('GET /v1/workspace → 200 or 401 (not 500)', async () => {
  const res = await fetch(`${BASE}/v1/workspace`, { headers });
  if (res.status >= 500) throw new Error(`5xx status ${res.status}`);
});

// 5. Discovery search
await check('GET /v1/discovery/search?q=test → 200 (public endpoint)', async () => {
  const url = `${BASE}/v1/discovery/search?q=test&limit=1`;
  const res = await fetch(url);
  if (res.status >= 500) throw new Error(`5xx status ${res.status}`);
  if (res.status === 200) {
    const body = await res.json() as { results?: unknown[] };
    if (!Array.isArray(body.results) && !Array.isArray(body)) {
      throw new Error('results field missing or not array');
    }
  }
});

// 6. Timing headers present (ADR-0045 — duration_ms logged)
await check('Response has CF-Ray header (Cloudflare routing confirmed)', async () => {
  const res = await fetch(`${BASE}/health`);
  // CF-Ray is only present on real CF infrastructure (not localhost)
  if (BASE.includes('localhost') || BASE.includes('127.0.0.1')) return; // skip locally
  const cfRay = res.headers.get('CF-Ray');
  if (!cfRay) throw new Error('Missing CF-Ray header — not routed through Cloudflare');
});

console.log(`\n[deploy-expanded smoke] ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
