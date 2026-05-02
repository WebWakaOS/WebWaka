/**
 * k6 Load Test — SuperAgent Chat Endpoint (Wave 3 C5-2)
 *
 * Simulates 50 concurrent users hitting POST /v1/superagent/chat
 * with the `inventory_ai` capability for 2 minutes.
 *
 * Thresholds:
 *   P95 response time < 3000ms
 *   Error rate < 1%
 *
 * Usage:
 *   k6 run --env BASE_URL=https://api-staging.webwaka.com \
 *           --env API_KEY=$STAGING_API_KEY \
 *           --env TENANT_ID=$STAGING_TENANT_ID \
 *           --out json=results-chat.json \
 *           infra/k6/superagent-chat-load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate     = new Rate('chat_error_rate');
const chatDuration  = new Trend('chat_duration_ms', true);

export const options = {
  scenarios: {
    concurrent_users: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2m',
    },
  },
  thresholds: {
    // C5-2 requirement: P95 < 3s, error rate < 1%
    'chat_duration_ms{scenario:concurrent_users}': ['p(95)<3000'],
    'chat_error_rate': ['rate<0.01'],
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE_URL  = __ENV.BASE_URL  || 'http://localhost:8787';
const API_KEY   = __ENV.API_KEY   || 'smoke-test-key';
const TENANT_ID = __ENV.TENANT_ID || 'tenant_load_001';

const CHAT_MESSAGES = [
  'What are my top 5 selling products this month?',
  'How many units of rice did I sell last week?',
  'Show me my current inventory levels for beverages.',
  'What is my profit margin on cooking oil?',
  'Which product category has the highest revenue?',
];

export default function () {
  const message = CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];

  const payload = JSON.stringify({
    messages: [{ role: 'user', content: message }],
    capability: 'inventory_ai',
    session_id: `load-test-${__VU}-${__ITER}`,
    stream: false,
  });

  const params = {
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'X-Tenant-ID':   TENANT_ID,
    },
    timeout: '10s',
  };

  const res = http.post(`${BASE_URL}/v1/superagent/chat`, payload, params);

  const ok = check(res, {
    'status is 200 or 202':   (r) => r.status === 200 || r.status === 202,
    'has response body':      (r) => r.body !== null && r.body.length > 0,
    'no internal error':      (r) => r.status < 500,
  });

  errorRate.add(!ok);
  chatDuration.add(res.timings.duration);

  sleep(Math.random() * 2 + 1); // 1–3s think time
}

export function handleSummary(data) {
  return {
    'results-superagent-chat.json': JSON.stringify(data),
    stdout: `
╔══════════════════════════════════════════════════════╗
║  SuperAgent Chat Load Test Summary (C5-2)           ║
╠══════════════════════════════════════════════════════╣
║  VUs: 50   Duration: 2m                             ║
║  P50: ${data.metrics?.chat_duration_ms?.values?.['p(50)']?.toFixed(0) ?? 'N/A'} ms                                   ║
║  P95: ${data.metrics?.chat_duration_ms?.values?.['p(95)']?.toFixed(0) ?? 'N/A'} ms  (threshold: <3000ms)            ║
║  Error rate: ${((data.metrics?.chat_error_rate?.values?.rate ?? 0) * 100).toFixed(2)}%  (threshold: <1%)        ║
╚══════════════════════════════════════════════════════╝
`,
  };
}
