/**
 * ETag middleware tests — P14-C
 * Verifies weak ETag generation, If-None-Match 304 handling,
 * and pass-through for non-GET methods and non-2xx responses.
 */

import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { etagMiddleware, readOnlyETag } from './etag.js';

function makeApp(opts?: Parameters<typeof etagMiddleware>[0]) {
  const app = new Hono();
  app.use('*', etagMiddleware(opts));
  app.get('/data', c => c.json({ hello: 'world' }));
  app.get('/error', c => { c.status(500); return c.json({ error: 'fail' }); });
  app.post('/data', c => c.json({ created: true }));
  app.get('/text', c => c.text('hello'));
  return app;
}

describe('etagMiddleware', () => {
  it('adds ETag header to GET JSON responses', async () => {
    const res = await makeApp().request('/data');
    expect(res.status).toBe(200);
    expect(res.headers.get('ETag')).toBeTruthy();
    expect(res.headers.get('ETag')).toMatch(/^W\//);
  });

  it('returns 304 when If-None-Match matches ETag', async () => {
    const first = await makeApp().request('/data');
    const etag = first.headers.get('ETag')!;
    expect(etag).toBeTruthy();
    const second = await makeApp().request('/data', {
      headers: { 'If-None-Match': etag },
    });
    expect(second.status).toBe(304);
    const body = await second.text();
    expect(body).toBe('');
  });

  it('returns 200 when If-None-Match does not match', async () => {
    const res = await makeApp().request('/data', {
      headers: { 'If-None-Match': 'W/"00000000"' },
    });
    expect(res.status).toBe(200);
  });

  it('does NOT add ETag to POST responses', async () => {
    const res = await makeApp().request('/data', { method: 'POST' });
    expect(res.headers.get('ETag')).toBeNull();
  });

  it('does NOT add ETag to 5xx responses', async () => {
    const res = await makeApp().request('/error');
    expect(res.status).toBe(500);
    expect(res.headers.get('ETag')).toBeNull();
  });

  it('adds Cache-Control when configured via readOnlyETag', async () => {
    const app = new Hono();
    app.use('*', readOnlyETag(300));
    app.get('/data', c => c.json({ x: 1 }));
    const res = await app.request('/data');
    expect(res.headers.get('Cache-Control')).toContain('max-age=300');
    expect(res.headers.get('ETag')).toBeTruthy();
  });

  it('produces consistent ETags for identical responses', async () => {
    const app = makeApp();
    const r1 = await app.request('/data');
    const r2 = await app.request('/data');
    expect(r1.headers.get('ETag')).toBe(r2.headers.get('ETag'));
  });
});
