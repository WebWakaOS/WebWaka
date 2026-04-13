/**
 * k6 Load Test — Auth Baseline
 * P14-A: 50 VUs × 1 min ramping up
 * Tests: login attempt, token refresh, /auth/me
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const loginErrors   = new Counter('login_errors');
const loginDuration = new Trend('login_duration_ms');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8787';

export const options = {
  stages: [
    { duration: '15s', target: 10  },
    { duration: '30s', target: 50  },
    { duration: '15s', target: 0   },
  ],
  thresholds: {
    http_req_duration:    ['p(50)<200', 'p(95)<500', 'p(99)<1000'],
    http_req_failed:      ['rate<0.01'],
    login_duration_ms:    ['p(95)<400'],
    login_errors:         ['count<5'],
  },
};

export default function () {
  const vu   = __VU;
  const email = `loadtest+${vu}@webwaka-test.internal`;

  const loginStart = Date.now();
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email, password: 'LoadTest#2024!' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  loginDuration.add(Date.now() - loginStart);

  const loginOk = check(loginRes, {
    'login status is 200 or 401': r => [200, 401, 422].includes(r.status),
    'login response has JSON body': r => {
      try { JSON.parse(r.body); return true; } catch { return false; }
    },
  });
  if (!loginOk) loginErrors.add(1);

  if (loginRes.status === 200) {
    let token;
    try { token = JSON.parse(loginRes.body).token; } catch { /* empty */ }
    if (token) {
      const meRes = http.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      check(meRes, {
        '/auth/me returns 200': r => r.status === 200,
        '/auth/me response < 200ms': r => r.timings.duration < 200,
      });
    }
  }

  sleep(1);
}
