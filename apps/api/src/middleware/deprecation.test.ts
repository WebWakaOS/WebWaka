/**
 * Tests for deprecation/sunset middleware (L-5)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { sunsetMiddleware, isPastSunset } from './deprecation.js';

function makeApp(opts: Parameters<typeof sunsetMiddleware>[0]) {
  const app = new Hono();
  app.use('/deprecated/*', sunsetMiddleware(opts));
  app.get('/deprecated/resource', (c) => c.json({ ok: true }));
  return app;
}

describe('sunsetMiddleware', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('sets Sunset header in HTTP-date format', async () => {
    const app = makeApp({ sunsetDate: new Date('2026-09-29T00:00:00Z') });
    const res = await app.request('/deprecated/resource');
    expect(res.headers.get('Sunset')).toContain('2026');
    expect(res.headers.get('Sunset')).toContain('GMT');
  });

  it('sets Deprecation header', async () => {
    const app = makeApp({
      sunsetDate: new Date('2026-09-29'),
      deprecationDate: new Date('2026-07-01'),
    });
    const res = await app.request('/deprecated/resource');
    expect(res.headers.get('Deprecation')).toBeTruthy();
  });

  it('sets Link header with successor-version when successorUrl provided', async () => {
    const app = makeApp({
      sunsetDate: new Date('2026-09-29'),
      successorUrl: 'https://api.webwaka.com/v2/auth/login',
    });
    const res = await app.request('/deprecated/resource');
    const link = res.headers.get('Link');
    expect(link).toContain('successor-version');
    expect(link).toContain('https://api.webwaka.com/v2/auth/login');
  });

  it('does not set Link header when successorUrl omitted', async () => {
    const app = makeApp({ sunsetDate: new Date('2026-09-29') });
    const res = await app.request('/deprecated/resource');
    expect(res.headers.get('Link')).toBeNull();
  });

  it('emits structured warn log when logWarning is true (default)', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    const app = makeApp({ sunsetDate: new Date('2026-09-29'), successorUrl: 'https://example.com' });
    await app.request('/deprecated/resource');
    expect(warnSpy).toHaveBeenCalledOnce();
    const logged = JSON.parse((warnSpy.mock.calls[0][0] as string));
    expect(logged.event).toBe('deprecated_endpoint_called');
    expect(logged.path).toBe('/deprecated/resource');
    expect(logged.successor).toBe('https://example.com');
  });

  it('does not emit warn log when logWarning=false', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    const app = makeApp({ sunsetDate: new Date('2026-09-29'), logWarning: false });
    await app.request('/deprecated/resource');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not affect non-deprecated routes', async () => {
    const app = new Hono();
    app.use('/deprecated/*', sunsetMiddleware({ sunsetDate: new Date('2026-09-29') }));
    app.get('/live/resource', (c) => c.json({ ok: true }));
    const res = await app.request('/live/resource');
    expect(res.headers.get('Sunset')).toBeNull();
  });
});

describe('isPastSunset', () => {
  it('returns false for a future sunset date', () => {
    expect(isPastSunset(new Date('2099-01-01'))).toBe(false);
  });

  it('returns true for a past sunset date', () => {
    expect(isPastSunset(new Date('2020-01-01'))).toBe(true);
  });
});
