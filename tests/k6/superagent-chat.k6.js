/**
 * WebWaka OS — SuperAgent Chat Load Test (k6)
 * Release Gate G2 — P95 < 3s for superagent-chat under production load
 *
 * Endpoints exercised:
 *   POST /superagent/chat        — main chat turn (streaming SSE)
 *   GET  /superagent/capabilities — tool manifest (cached on client side)
 *   GET  /superagent/history/:id  — message history retrieval
 *
 * Performance thresholds (production gate):
 *   http_req_duration p(95) < 3000ms  — 95th-percentile chat response
 *   http_req_duration p(50) < 1500ms  — median chat response
 *   http_req_failed   rate < 0.02      — < 2% error rate
 *   chat_ttfb_ms      p(95) < 800ms   — time-to-first-byte (streaming start)
 *
 * Load profile:
 *   Ramp 0→30 VUs over 1 min, sustain 30 VUs for 3 min, ramp down 1 min
 *   Peak: ~30 concurrent chat sessions (realistic pilot scale)
 *
 * Usage:
 *   BASE_URL=https://api.webwaka.com \
 *   AUTH_TOKEN=<bearer> \
 *   k6 run tests/k6/superagent-chat.k6.js
 *
 *   # With output to JSON:
 *   k6 run --out json=results/superagent-$(date +%Y%m%d).json tests/k6/superagent-chat.k6.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Custom Metrics ───────────────────────────────────────────────────────────

const chatTurn     = new Trend('chat_turn_duration_ms');
const chatTtfb     = new Trend('chat_ttfb_ms');
const capabilitiesT= new Trend('capabilities_duration_ms');
const historyT     = new Trend('history_duration_ms');
const errorRate    = new Rate('superagent_error_rate');

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL    = __ENV.BASE_URL    || 'http://localhost:8787';
const AUTH_TOKEN  = __ENV.AUTH_TOKEN  || '';
const WORKSPACE_ID = __ENV.WORKSPACE_ID || 'ws_load_test_01';

export const options = {
  stages: [
    { duration: '1m',  target: 30 },  // ramp up
    { duration: '3m',  target: 30 },  // sustain
    { duration: '1m',  target: 0  },  // ramp down
  ],
  thresholds: {
    http_req_duration:       ['p(95)<3000', 'p(50)<1500'],
    http_req_failed:         ['rate<0.02'],
    chat_turn_duration_ms:   ['p(95)<3000', 'p(50)<1500'],
    chat_ttfb_ms:            ['p(95)<800'],
    superagent_error_rate:   ['rate<0.02'],
  },
};

// ─── Test Prompts ─────────────────────────────────────────────────────────────

const PROMPTS = [
  'What are my sales today?',
  'Show me my top 3 products this week',
  'How do I add a new product to my inventory?',
  'What is my current subscription plan?',
  'Help me write a WhatsApp message to my customers about a new sale',
  'How many orders did I receive yesterday?',
  'Set a reminder to restock rice tomorrow morning',
  'What payment methods do I currently accept?',
  'Show me my recent transactions',
  'Can you summarise this week for me?',
];

function randomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (AUTH_TOKEN) h['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  return h;
}

// ─── Scenario ─────────────────────────────────────────────────────────────────

export default function () {
  const headers = authHeaders();

  group('capabilities', function () {
    const res = http.get(`${BASE_URL}/superagent/capabilities`, { headers });
    const ok = check(res, {
      'capabilities: status 200': (r) => r.status === 200,
      'capabilities: has tools':  (r) => {
        try { return Array.isArray(JSON.parse(r.body)?.tools); } catch { return false; }
      },
    });
    capabilitiesT.add(res.timings.duration);
    if (!ok) errorRate.add(1);
  });

  sleep(0.5 + Math.random() * 0.5);

  group('chat turn', function () {
    const payload = JSON.stringify({
      workspace_id: WORKSPACE_ID,
      message: randomPrompt(),
      stream: false,  // Use non-streaming for predictable timing in load tests
    });
    const res = http.post(`${BASE_URL}/superagent/chat`, payload, {
      headers,
      timeout: '10s',
    });
    const ok = check(res, {
      'chat: status 200':      (r) => r.status === 200,
      'chat: has reply':       (r) => {
        try { const b = JSON.parse(r.body); return !!b?.reply || !!b?.message || !!b?.content; }
        catch { return false; }
      },
      'chat: p95 < 3000ms':    (r) => r.timings.duration < 3000,
    });
    chatTurn.add(res.timings.duration);
    chatTtfb.add(res.timings.waiting);  // TTFB = waiting time
    if (!ok) errorRate.add(1);
  });

  sleep(1 + Math.random() * 2);

  // Occasional history fetch (20% of turns)
  if (Math.random() < 0.2) {
    group('history', function () {
      const res = http.get(
        `${BASE_URL}/superagent/history/${WORKSPACE_ID}?limit=10`,
        { headers }
      );
      check(res, { 'history: status 200 or 404': (r) => r.status === 200 || r.status === 404 });
      historyT.add(res.timings.duration);
    });
  }

  sleep(0.5);
}

export function handleSummary(data) {
  const p50  = data.metrics?.chat_turn_duration_ms?.values?.['p(50)']?.toFixed(0)  ?? '—';
  const p95  = data.metrics?.chat_turn_duration_ms?.values?.['p(95)']?.toFixed(0)  ?? '—';
  const ttfb = data.metrics?.chat_ttfb_ms?.values?.['p(95)']?.toFixed(0)           ?? '—';
  const errs = (data.metrics?.superagent_error_rate?.values?.rate * 100)?.toFixed(2) ?? '—';

  const passed =
    Number(p95) < 3000 &&
    Number(ttfb) < 800 &&
    Number(errs) < 2;

  console.log('\n─────────────────────────────────────────');
  console.log('  SuperAgent Chat Load Test Summary');
  console.log(`  Chat p50:  ${p50}ms   (target: <1500ms)`);
  console.log(`  Chat p95:  ${p95}ms   (target: <3000ms)  ${Number(p95) < 3000 ? '✅' : '❌'}`);
  console.log(`  TTFB p95:  ${ttfb}ms  (target: <800ms)   ${Number(ttfb) < 800 ? '✅' : '❌'}`);
  console.log(`  Error rate: ${errs}%  (target: <2%)      ${Number(errs) < 2 ? '✅' : '❌'}`);
  console.log(`  Gate G2:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('─────────────────────────────────────────\n');

  return { stdout: '' };
}
