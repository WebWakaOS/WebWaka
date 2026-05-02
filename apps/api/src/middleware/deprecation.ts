/**
 * Deprecation / Sunset header middleware (L-5 / ADR-0018)
 *
 * Attaches RFC 8594 `Sunset` and IETF draft `Deprecation` headers to
 * responses for deprecated API endpoints or route groups.
 *
 * Usage:
 *   import { sunsetMiddleware } from '@/middleware/deprecation';
 *
 *   // Deprecate a single route
 *   app.use('/auth/old-login', sunsetMiddleware({
 *     sunsetDate: new Date('2026-09-29'),
 *     successorUrl: 'https://api.webwaka.com/v2/auth/login',
 *   }));
 *
 *   // Deprecate a route group
 *   app.use('/v1/*', sunsetMiddleware({
 *     sunsetDate: new Date('2026-12-01'),
 *     successorUrl: 'https://api.webwaka.com/v2/',
 *     deprecationDate: new Date('2026-09-01'),
 *   }));
 *
 * Headers set:
 *   Sunset: <HTTP-date>                        — RFC 8594
 *   Deprecation: <HTTP-date>                   — IETF draft-ietf-httpapi-deprecation-header
 *   Link: <url>; rel="successor-version"       — RFC 8288
 */

import type { MiddlewareHandler } from 'hono';

export interface SunsetOptions {
  /** Date after which the endpoint will be removed */
  sunsetDate: Date;

  /** URL of the replacement endpoint or documentation (optional but recommended) */
  successorUrl?: string;

  /** Date the endpoint was marked deprecated (defaults to now) */
  deprecationDate?: Date;

  /** Whether to emit a structured log warning on each request (default: true) */
  logWarning?: boolean;
}

/**
 * Formats a Date as an HTTP-date string (RFC 7231 §7.1.1.1)
 * Example: "Mon, 29 Sep 2026 00:00:00 GMT"
 */
function toHttpDate(date: Date): string {
  return date.toUTCString();
}

/**
 * Returns a Hono middleware that adds Sunset/Deprecation headers.
 */
export function sunsetMiddleware(opts: SunsetOptions): MiddlewareHandler {
  const sunsetHeader = toHttpDate(opts.sunsetDate);
  const deprecationHeader = toHttpDate(opts.deprecationDate ?? new Date());
  const linkHeader = opts.successorUrl
    ? `<${opts.successorUrl}>; rel="successor-version"`
    : undefined;
  const shouldLog = opts.logWarning !== false;

  return async (c, next) => {
    await next();

    // Set headers on the way out
    c.res.headers.set('Sunset', sunsetHeader);
    c.res.headers.set('Deprecation', deprecationHeader);
    if (linkHeader) {
      c.res.headers.set('Link', linkHeader);
    }

    if (shouldLog) {
      console.warn(JSON.stringify({
        level: 'warn',
        event: 'deprecated_endpoint_called',
        method: c.req.method,
        path: c.req.path,
        sunset: sunsetHeader,
        successor: opts.successorUrl,
        ts: new Date().toISOString(),
      }));
    }
  };
}

/**
 * Convenience: returns true if a given endpoint is past its sunset date.
 * Useful for feature-flag checks during the transition window.
 */
export function isPastSunset(sunsetDate: Date): boolean {
  return Date.now() > sunsetDate.getTime();
}
