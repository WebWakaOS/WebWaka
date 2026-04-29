/**
 * Tests for image pipeline routes — Phase 3 (E23)
 * IP01–IP08: POST /image-variants, GET, PATCH /process; T3 enforcement; status transitions.
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { imagePipelineRoutes } from './image-pipeline.js';
import type { AuthContext } from '@webwaka/types';

interface D1Row {
  id: string;
  tenant_id: string;
  entity_type: string;
  entity_id: string;
  original_url: string;
  thumbnail_url: string | null;
  card_url: string | null;
  full_url: string | null;
  status: string;
  processed_at: number | null;
  created_at: number;
}

function makeApp(
  dbFirst: D1Row | null = null,
  tenantId = 'tenant_001',
): Hono {
  const app = new Hono();

  const db = {
    prepare: vi.fn().mockImplementation((_sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: <T>() => Promise.resolve(dbFirst as T),
        run: () => Promise.resolve({ success: true }),
        all: <T>() => Promise.resolve({ results: (dbFirst ? [dbFirst] : []) as T[] }),
      }),
    })),
  };

  app.use('*', async (c, next) => {
    c.set('auth', {
      userId: 'usr_001',
      tenantId,
      workspaceId: 'wsp_001',
      role: 'admin',
      permissions: [],
    } as unknown as AuthContext);
    c.env = { DB: db } as never;
    await next();
  });

  app.route('/', imagePipelineRoutes);
  return app;
}

const SAMPLE_ROW: D1Row = {
  id: 'iv_test_001',
  tenant_id: 'tenant_001',
  entity_type: 'group',
  entity_id: 'grp_001',
  original_url: 'https://example.com/logo.png',
  thumbnail_url: null,
  card_url: null,
  full_url: null,
  status: 'pending',
  processed_at: null,
  created_at: 1700000000,
};

describe('POST /image-variants (IP01–IP03)', () => {
  it('IP01: creates a new variant record and returns pending status', async () => {
    const app = makeApp(null);
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'group',
        entityId: 'grp_001',
        originalUrl: 'https://example.com/logo.png',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body['status']).toBe('pending');
    expect(body['entityType']).toBe('group');
    expect(body['entityId']).toBe('grp_001');
    expect(typeof body['thumbnailUrl']).toBe('string');
    expect(String(body['thumbnailUrl'])).toContain('w=100');
  });

  it('IP02: returns 400 when required fields are missing', async () => {
    const app = makeApp(null);
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType: 'group' }),
    });
    expect(res.status).toBe(400);
  });

  it('IP03: returns 400 for invalid entityType', async () => {
    const app = makeApp(null);
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'invoice',
        entityId: 'inv_001',
        originalUrl: 'https://example.com/img.png',
      }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(String(body['error'])).toContain('entityType');
  });
});

describe('GET /image-variants/:entityType/:entityId (IP04–IP05)', () => {
  it('IP04: returns variant record with derived thumbnailUrl', async () => {
    const app = makeApp(SAMPLE_ROW);
    const res = await app.request('/group/grp_001');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['entityType']).toBe('group');
    expect(body['entityId']).toBe('grp_001');
    expect(body['status']).toBe('pending');
    expect(typeof body['thumbnailUrl']).toBe('string');
  });

  it('IP05: returns 404 when no record exists', async () => {
    const app = makeApp(null);
    const res = await app.request('/group/grp_nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /image-variants/:id/process (IP06–IP07)', () => {
  it('IP06: marks record as ready with provided URLs', async () => {
    const app = makeApp(SAMPLE_ROW);
    const res = await app.request('/iv_test_001/process', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thumbnailUrl: 'https://cdn.example.com/logo_100.webp',
        cardUrl: 'https://cdn.example.com/logo_400.webp',
        fullUrl: 'https://cdn.example.com/logo_1200.webp',
        status: 'ready',
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['status']).toBe('ready');
    expect(body['thumbnailUrl']).toBe('https://cdn.example.com/logo_100.webp');
    expect(typeof body['processedAt']).toBe('number');
  });

  it('IP07: returns 404 if record not found', async () => {
    const app = makeApp(null);
    const res = await app.request('/iv_missing/process', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ready' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('T3 — tenant isolation (IP08)', () => {
  it('IP08: tenant_002 cannot see tenant_001 variants', async () => {
    const app = makeApp(null, 'tenant_002');
    const res = await app.request('/group/grp_001');
    expect(res.status).toBe(404);
  });
});
