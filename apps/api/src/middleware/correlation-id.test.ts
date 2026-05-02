/**
 * Tests for correlation-id.ts — Wave 3 C6-1
 */
import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { correlationIdMiddleware } from './correlation-id.js';

function makeApp() {
  const app = new Hono();
  app.use('*', correlationIdMiddleware);
  app.get('/ping', (c) => {
    const id = c.get('correlationId') as string;
    return c.json({ correlationId: id });
  });
  return app;
}

describe('correlationIdMiddleware', () => {
  it('generates a UUID when no X-Correlation-ID header is present', async () => {
    const app = makeApp();
    const res = await app.request('/ping');
    const body = await res.json() as { correlationId: string };
    expect(body.correlationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('propagates existing X-Correlation-ID from request', async () => {
    const app = makeApp();
    const id = 'my-trace-id-12345';
    const res = await app.request('/ping', { headers: { 'X-Correlation-ID': id } });
    const body = await res.json() as { correlationId: string };
    expect(body.correlationId).toBe(id);
  });

  it('echoes the correlation ID in response headers', async () => {
    const app = makeApp();
    const res = await app.request('/ping');
    expect(res.headers.get('x-correlation-id')).toBeTruthy();
  });

  it('echoes the provided ID back in response headers', async () => {
    const app = makeApp();
    const id = 'trace-abc-789';
    const res = await app.request('/ping', { headers: { 'X-Correlation-ID': id } });
    expect(res.headers.get('x-correlation-id')).toBe(id);
  });

  it('ignores suspiciously long IDs (>64 chars) and generates a new UUID', async () => {
    const app = makeApp();
    const long = 'x'.repeat(100);
    const res = await app.request('/ping', { headers: { 'X-Correlation-ID': long } });
    const body = await res.json() as { correlationId: string };
    expect(body.correlationId).not.toBe(long);
    expect(body.correlationId.length).toBeLessThanOrEqual(36);
  });

  it('sets correlationId on context for downstream handlers', async () => {
    const app = new Hono();
    app.use('*', correlationIdMiddleware);
    let captured = '';
    app.get('/check', (c) => {
      captured = c.get('correlationId') as string;
      return c.text('ok');
    });
    await app.request('/check');
    expect(captured).toBeTruthy();
    expect(typeof captured).toBe('string');
  });
});
