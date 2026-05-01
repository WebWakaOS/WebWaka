import { createMiddleware } from 'hono/factory';
import type { Env } from '../env.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const csrfMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  if (SAFE_METHODS.has(c.req.method)) {
    return next();
  }

  const origin = c.req.header('Origin');
  const referer = c.req.header('Referer');

  if (!origin && !referer) {
    // BUG-003 fix: The previous behaviour allowed any JSON POST without Origin/Referer to
    // bypass CSRF protection. This is exploitable: an attacker can craft a cross-origin
    // request with Content-Type: application/json and no Origin header in certain browser
    // contexts, and in automated tooling it is trivially exploitable.
    //
    // New behaviour: browser clients always send Origin or Referer. Absence means a
    // non-browser (M2M) caller. M2M callers MUST explicitly declare intent via:
    //   - Header: X-CSRF-Intent: m2m   (for service-to-service calls)
    //   - Header: X-Inter-Service-Secret: <secret>  (server-to-server with shared secret)
    // Governance reference: security-baseline.md §CSRF — M2M API policy (ADR-0XX)
    const csrfIntent = c.req.header('X-CSRF-Intent');
    const interServiceSecret = c.req.header('X-Inter-Service-Secret');
    const expectedSecret = c.env?.INTER_SERVICE_SECRET;
    if (csrfIntent === 'm2m') {
      return next();
    }
    if (expectedSecret && interServiceSecret === expectedSecret) {
      return next();
    }
    return c.json(
      {
        error: 'Missing Origin/Referer header. M2M callers must send X-CSRF-Intent: m2m or X-Inter-Service-Secret. (CSRF protection)',
      },
      403,
    );
  }

  const allowedOriginsEnv = c.env?.ALLOWED_ORIGINS ?? '';
  const environment = c.env?.ENVIRONMENT ?? 'production';
  const allowedOrigins = new Set(
    allowedOriginsEnv
      .split(',')
      .map((o: string) => o.trim())
      .filter(Boolean),
  );

  if (environment === 'production') {
    allowedOrigins.add('https://app.webwaka.com');
    allowedOrigins.add('https://workspace.webwaka.com');
    allowedOrigins.add('https://admin.webwaka.com');
    allowedOrigins.add('https://webwaka.com');
    allowedOrigins.add('https://www.webwaka.com');
  } else {
    allowedOrigins.add('http://localhost:5000');
    allowedOrigins.add('http://localhost:3000');
    allowedOrigins.add('http://localhost:5173');
    allowedOrigins.add('http://127.0.0.1:5000');
    allowedOrigins.add('http://127.0.0.1:5173');
    allowedOrigins.add('https://webwaka-workspace-app.pages.dev');
  }

  let requestOrigin: string;
  if (origin) {
    requestOrigin = origin;
  } else {
    try {
      requestOrigin = new URL(referer!).origin;
    } catch {
      console.error(`[CSRF] Invalid Referer header: ${referer}`);
      return c.json({ error: 'Invalid Referer header (CSRF protection)' }, 403);
    }
  }

  if (!allowedOrigins.has(requestOrigin)) {
    console.error(`[CSRF] Blocked request from origin: ${requestOrigin}`);
    return c.json({ error: 'Cross-origin request blocked (CSRF protection)' }, 403);
  }

  await next();
});
