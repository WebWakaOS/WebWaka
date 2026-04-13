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
    const contentType = c.req.header('Content-Type') ?? '';
    if (contentType.includes('application/json')) {
      return next();
    }
    return c.json({ error: 'Missing Origin/Referer header (CSRF protection)' }, 403);
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
    allowedOrigins.add('https://admin.webwaka.com');
    allowedOrigins.add('https://webwaka.ng');
  } else {
    allowedOrigins.add('http://localhost:5000');
    allowedOrigins.add('http://localhost:3000');
    allowedOrigins.add('http://127.0.0.1:5000');
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
