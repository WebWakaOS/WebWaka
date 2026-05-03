/**
 * Tests for E2EE key management routes (L-9 / ADR-0043)
 */

import { describe, it, expect, vi } from 'vitest';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
type AppEnv = { Bindings: Env; Variables: { auth: AuthContext; userId: string; tenantId: string } };
import { Hono } from 'hono';

// ── Mock authMiddleware to be a no-op pass-through ─────────────────────────
vi.mock('../middleware/auth.js', () => ({
  authMiddleware: vi.fn(async (_c: unknown, next: () => Promise<void>) => { await next(); }),
}));

import { e2eeRoutes } from './e2ee.js';

// ── Test helpers ──────────────────────────────────────────────────────────────

const VALID_P256_JWK = {
  kty: 'EC',
  crv: 'P-256',
  x: 'f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU',
  y: 'x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0',
  use: 'enc',
};

function makeDb(rows: Record<string, unknown> | null = null) {
  const stmt = {
    bind: vi.fn().mockReturnThis(),
    run: vi.fn().mockResolvedValue({ success: true }),
    first: vi.fn().mockResolvedValue(rows),
    all: vi.fn().mockResolvedValue({ results: [] }),
  };
  return {
    prepare: vi.fn().mockReturnValue(stmt),
  };
}

function makeApp(db: ReturnType<typeof makeDb> | null = null) {
  const app = new Hono<AppEnv>();
  app.use('*', async (c, next) => {
    c.set('userId', 'u1');
    c.set('tenantId', 't1');
    if (db) {
      // c.env may be undefined in Hono test context — initialise it first
      if (!c.env) (c as unknown as { env: Record<string, unknown> }).env = {};
      ((c.env as unknown) as Record<string, unknown>).DB = db;
    }
    await next();
  });
  app.route('/', e2eeRoutes);
  return app;
}

// ── PATCH /profile/e2e-pubkey ────────────────────────────────────────────────

describe('PATCH /profile/e2e-pubkey', () => {
  it('returns 400 for missing publicKey', async () => {
    const app = makeApp();
    const res = await app.request('/profile/e2e-pubkey', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: null }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when private key component (d) is present', async () => {
    const app = makeApp();
    const res = await app.request('/profile/e2e-pubkey', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: { ...VALID_P256_JWK, d: 'secret' } }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toContain('private key');
  });

  it('returns 400 for wrong curve', async () => {
    const app = makeApp();
    const res = await app.request('/profile/e2e-pubkey', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: { ...VALID_P256_JWK, crv: 'P-384' } }),
    });
    expect(res.status).toBe(400);
  });
});

// ── validateEcdhPublicKey logic ───────────────────────────────────────────────

describe('JWK validation logic', () => {
  it('valid P-256 JWK passes without d', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/profile/e2e-pubkey', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: VALID_P256_JWK }),
    });
    expect(res.status).not.toBe(400);
  });
});

// ── GET /profile/:id/e2e-pubkey ──────────────────────────────────────────────

describe('GET /profile/:id/e2e-pubkey', () => {
  it('returns 404 when no key on record', async () => {
    const app = makeApp(makeDb({ e2e_public_key: null, e2e_pubkey_updated_at: null }));
    const res = await app.request('/profile/user-999/e2e-pubkey');
    expect(res.status).toBe(404);
    const body = await res.json() as { e2ee_enabled: boolean };
    expect(body.e2ee_enabled).toBe(false);
  });

  it('returns publicKey JSON when key exists', async () => {
    const app = makeApp(makeDb({
      e2e_public_key: JSON.stringify(VALID_P256_JWK),
      e2e_pubkey_updated_at: 1700000000,
    }));
    const res = await app.request('/profile/user-001/e2e-pubkey');
    expect(res.status).toBe(200);
    const body = await res.json() as { e2ee_enabled: boolean; publicKey: { crv: string } };
    expect(body.e2ee_enabled).toBe(true);
    expect(body.publicKey.crv).toBe('P-256');
  });
});

// ── DELETE /profile/e2e-pubkey ────────────────────────────────────────────────

describe('DELETE /profile/e2e-pubkey', () => {
  it('returns 200 and ok:true', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/profile/e2e-pubkey', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });
});
