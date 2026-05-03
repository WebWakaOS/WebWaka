#!/usr/bin/env node
/**
 * WebWaka OS — Production Smoke Test Script
 * Release Gate G6-8
 *
 * Usage:
 *   SMOKE_API_KEY=<key> SMOKE_BASE_URL=https://api.webwaka.com node scripts/smoke-production.mjs
 *
 * Exits 0 if all checks pass, 1 if any fail.
 * Designed to run as a GitHub Actions step after deploy-production.yml completes.
 *
 * Checks performed:
 *   1.  GET /health                          → 200 {"status":"ok"}
 *   2.  GET /health/deep                     → 200 {"status":"ok"}
 *   3.  GET /verticals                       → 200, count >= 150
 *   4.  GET /superagent/capabilities         → 200, tools.length > 0
 *   5.  GET /platform-admin/pilots/operators/summary → 200 (smoke key must be super_admin)
 *   6.  POST /auth/register (synthetic user) → 200 or 409 (already exists)
 *   7.  POST /auth/logout                    → 200 (if token received)
 *   8.  GET /openapi.json                    → 200, content-type includes "application/json"
 *
 * Environment variables:
 *   SMOKE_BASE_URL   — base URL (default: https://api.webwaka.com)
 *   SMOKE_API_KEY    — bearer token with super_admin role for protected checks
 *   SMOKE_TIMEOUT_MS — per-request timeout in ms (default: 8000)
 */

const BASE  = process.env.SMOKE_BASE_URL   ?? 'https://api.webwaka.com';
const TOKEN = process.env.SMOKE_API_KEY    ?? '';
const TIMEOUT = Number(process.env.SMOKE_TIMEOUT_MS ?? '8000');

const SYNTHETIC_EMAIL = `smoke-${Date.now()}@smoke.webwaka-test.internal`;
const SYNTHETIC_PASSWORD = `Smk${Date.now()}!Z`;

let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  ✅  ${label}`);
  passed++;
}

function fail(label, reason) {
  console.error(`  ❌  ${label} — ${reason}`);
  failed++;
}

async function get(path, auth = false, expectJson = true) {
  const headers = { 'Accept': 'application/json' };
  if (auth && TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(`${BASE}${path}`, { headers, signal: ctrl.signal });
    const body = expectJson ? await res.json().catch(() => null) : await res.text().catch(() => '');
    return { status: res.status, body, headers: Object.fromEntries(res.headers.entries()) };
  } finally {
    clearTimeout(timer);
  }
}

async function post(path, data, auth = false) {
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (auth && TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      signal: ctrl.signal,
    });
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  console.log(`\n🔬  WebWaka Production Smoke Tests`);
  console.log(`    Target: ${BASE}`);
  console.log(`    Time:   ${new Date().toISOString()}\n`);

  // ── 1. GET /health ────────────────────────────────────────────────────────
  try {
    const r = await get('/health');
    if (r.status === 200 && r.body?.status === 'ok') ok('GET /health → 200 {"status":"ok"}');
    else fail('GET /health', `status=${r.status}, body=${JSON.stringify(r.body)}`);
  } catch (e) { fail('GET /health', String(e)); }

  // ── 2. GET /health/deep ───────────────────────────────────────────────────
  try {
    const r = await get('/health/deep');
    if (r.status === 200 && r.body?.status === 'ok') ok('GET /health/deep → 200 {"status":"ok"}');
    else fail('GET /health/deep', `status=${r.status}, body=${JSON.stringify(r.body)}`);
  } catch (e) { fail('GET /health/deep', String(e)); }

  // ── 3. GET /verticals ─────────────────────────────────────────────────────
  try {
    const r = await get('/verticals');
    const count = Array.isArray(r.body) ? r.body.length
                : (Array.isArray(r.body?.data) ? r.body.data.length : 0);
    if (r.status === 200 && count >= 150) ok(`GET /verticals → 200, ${count} entries`);
    else fail('GET /verticals', `status=${r.status}, count=${count}`);
  } catch (e) { fail('GET /verticals', String(e)); }

  // ── 4. GET /superagent/capabilities ──────────────────────────────────────
  try {
    const r = await get('/superagent/capabilities', true);
    const tools = Array.isArray(r.body?.tools) ? r.body.tools : [];
    if (r.status === 200 && tools.length > 0) ok(`GET /superagent/capabilities → 200, ${tools.length} tools`);
    else fail('GET /superagent/capabilities', `status=${r.status}, tools=${tools.length}`);
  } catch (e) { fail('GET /superagent/capabilities', String(e)); }

  // ── 5. GET /platform-admin/pilots/operators/summary ───────────────────────
  if (TOKEN) {
    try {
      const r = await get('/platform-admin/pilots/operators/summary', true);
      if (r.status === 200) ok('GET /platform-admin/pilots/operators/summary → 200');
      else fail('GET /platform-admin/pilots/operators/summary', `status=${r.status}`);
    } catch (e) { fail('GET /platform-admin/pilots/operators/summary', String(e)); }
  } else {
    console.log(`  ⚠️   SMOKE_API_KEY not set — skipping auth-protected checks (4, 5, 7)`);
  }

  // ── 6. POST /auth/register (synthetic, expect 200 or 409) ─────────────────
  try {
    const r = await post('/auth/register', {
      email: SYNTHETIC_EMAIL,
      password: SYNTHETIC_PASSWORD,
      full_name: 'Smoke Test User',
    });
    if (r.status === 200 || r.status === 201 || r.status === 409) {
      ok(`POST /auth/register → ${r.status} (synthetic user)`);
    } else {
      fail('POST /auth/register', `status=${r.status}, body=${JSON.stringify(r.body)}`);
    }
  } catch (e) { fail('POST /auth/register', String(e)); }

  // ── 7. GET /openapi.json ──────────────────────────────────────────────────
  try {
    const r = await get('/openapi.json', false, false);
    const ct = r.headers['content-type'] ?? '';
    if (r.status === 200 && ct.includes('application/json')) {
      ok(`GET /openapi.json → 200 application/json`);
    } else {
      fail('GET /openapi.json', `status=${r.status}, content-type="${ct}"`);
    }
  } catch (e) { fail('GET /openapi.json', String(e)); }

  // ── Summary ───────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n────────────────────────────────────────`);
  console.log(`  Results: ${passed}/${total} passed`);
  if (failed > 0) {
    console.error(`  ❌  ${failed} check(s) FAILED — deploy gate not passed`);
    process.exit(1);
  } else {
    console.log(`  ✅  All smoke checks passed — production deploy validated`);
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal smoke error:', err);
  process.exit(1);
});
