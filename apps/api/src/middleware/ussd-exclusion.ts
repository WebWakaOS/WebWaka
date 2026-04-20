import { createMiddleware } from 'hono/factory';
import type { Env } from '../env.js';

export const ussdExclusionMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const channel = c.req.header('x-waka-channel');
  if (channel === 'ussd') {
    return c.json(
      { error: 'AI_USSD_BLOCKED', message: 'AI features are not available via USSD (P12).' },
      400,
    );
  }

  const ussdSession = c.req.header('X-USSD-Session');
  if (ussdSession) {
    return c.json(
      { error: 'AI_USSD_BLOCKED', message: 'AI features are not available via USSD (P12).' },
      503,
    );
  }

  await next();
});
