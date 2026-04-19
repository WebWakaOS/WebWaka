/**
 * ETag Middleware — P14-C
 * Generates weak ETags from response bodies for GET requests.
 * Respects If-None-Match headers for 304 Not Modified responses.
 *
 * ARC-16: Cache-Control + ETag reduces origin load by 30-60% for read-heavy endpoints.
 */

import type { MiddlewareHandler } from 'hono';

function simpleHash(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export interface ETagOptions {
  weak?: boolean;
  cacheControl?: string;
}

export function etagMiddleware(opts: ETagOptions = {}): MiddlewareHandler {
  const { weak = true, cacheControl } = opts;

  return async (c, next) => {
    if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
      return next();
    }
    await next();

    const status = c.res.status;
    if (status < 200 || status >= 300) return;

    const ct = c.res.headers.get('Content-Type') ?? '';
    if (!ct.includes('application/json') && !ct.includes('text/')) return;

    try {
      const clone = c.res.clone();
      const body = await clone.text();
      if (!body) return;

      const hash = simpleHash(body);
      const etag = weak ? `W/"${hash}"` : `"${hash}"`;

      c.res.headers.set('ETag', etag);
      if (cacheControl) {
        c.res.headers.set('Cache-Control', cacheControl);
      }

      const ifNoneMatch = c.req.header('If-None-Match');
      if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === '*')) {
        c.res = new Response(null, {
          status: 304,
          headers: {
            ETag: etag,
            ...(cacheControl ? { 'Cache-Control': cacheControl } : {}),
          },
        });
      }
    } catch (_e) { /* intentionally empty — non-critical path */ }
  };
}

export function readOnlyETag(cacheMaxAge = 60): MiddlewareHandler {
  return etagMiddleware({
    weak: true,
    cacheControl: `public, max-age=${cacheMaxAge}, stale-while-revalidate=30`,
  });
}
