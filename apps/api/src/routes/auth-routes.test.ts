/**
 * Auth routes tests — Phase 18 QA audit
 *
 * Covers:
 *   - POST /auth/login       — success, wrong password, user not found, bad request
 *   - POST /auth/register    — success (201), duplicate email (409), validation errors
 *   - GET  /auth/me          — success, 401 without JWT
 *   - POST /auth/refresh     — success with valid JWT, 401 without JWT
 *   - POST /auth/verify      — valid token, invalid token
 *   - POST /auth/forgot-password — always 200 (anti-enumeration)
 *   - POST /auth/reset-password  — success, invalid token, weak password
 *   - DELETE /auth/me        — NDPR erasure, 401 without JWT
 *
 * Pattern: app.fetch(new Request(url, opts), env) — identical to billing tests.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import app from '../index.js';
import type { Env } from '../env.js';

const JWT_SECRET = 'test-jwt-secret-minimum-32-characters!';
const BASE = 'http://localhost';

// Pre-computed test password hash (generated once in beforeAll).
let TEST_PASSWORD_HASH = '';
const TEST_PASSWORD = 'SecurePass123!';

async function computeTestHash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const saltBuf = new Uint8Array(16);
  crypto.getRandomValues(saltBuf);
  const salt64 = btoa(String.fromCharCode(...saltBuf));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuf, iterations: 600_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  const hash64 = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
  return `${salt64}:${hash64}`;
}

beforeAll(async () => {
  TEST_PASSWORD_HASH = await computeTestHash(TEST_PASSWORD);
});

// ---------------------------------------------------------------------------
// JWT factory
// ---------------------------------------------------------------------------
async function makeJwt(
  userId = 'usr_001',
  tenantId = 'tnt_001',
  workspaceId = 'ws_001',
  role = 'admin',
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payload = btoa(JSON.stringify({
    sub: userId,
    workspace_id: workspaceId,
    tenant_id: tenantId,
    role,
    iat: now - 10,
    exp: now + 3600,
  })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const input = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${input}.${signature}`;
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------
function post(path: string, body: unknown, jwt?: string): Request {
  return new Request(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

function get(path: string, jwt?: string): Request {
  return new Request(`${BASE}${path}`, {
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
  });
}

// SEC-12: CSRF middleware passes DELETE requests only when Content-Type is
// application/json (no Origin/Referer). Tests must include this header.
function del(path: string, jwt?: string): Request {
  return new Request(`${BASE}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
  });
}

// ---------------------------------------------------------------------------
// DB / Env mock factories
// ---------------------------------------------------------------------------

// Sentinel distinguishing "not provided" from explicitly-provided null.
const NOT_SET = Symbol('NOT_SET');

function makeDB(opts: {
  loginUser?: unknown;
  meUser?: unknown;
  existingEmail?: unknown;
} = {}) {
  // Use `in` operator to distinguish explicit null from omitted key.
  const loginUser: unknown = 'loginUser' in opts ? opts.loginUser : NOT_SET;
  const meUser: unknown = 'meUser' in opts ? opts.meUser : NOT_SET;
  const existingEmail: unknown = 'existingEmail' in opts ? opts.existingEmail : NOT_SET;
  let callCount = 0;

  return {
    prepare: vi.fn().mockImplementation(() => ({
      bind: vi.fn().mockReturnValue({
        first: vi.fn().mockImplementation(() => {
          const idx = callCount++;
          if (idx === 0) {
            if (loginUser !== NOT_SET) return Promise.resolve(loginUser);
            if (existingEmail !== NOT_SET) return Promise.resolve(existingEmail);
            if (meUser !== NOT_SET) return Promise.resolve(meUser);
          }
          return Promise.resolve(null);
        }),
        run: vi.fn().mockResolvedValue({ success: true }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
      first: vi.fn().mockResolvedValue(null),
      run: vi.fn().mockResolvedValue({ success: true }),
      all: vi.fn().mockResolvedValue({ results: [] }),
    })),
    batch: vi.fn().mockResolvedValue([{ results: [] }, { results: [] }]),
  };
}

function makeEnv(db: unknown, kvGetValue: unknown = null): Env {
  return {
    DB: db,
    JWT_SECRET,
    ENVIRONMENT: 'test',
    KV: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as KVNamespace,
    RATE_LIMIT_KV: {
      get: vi.fn().mockResolvedValue(kvGetValue),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as KVNamespace,
    ASSETS: undefined as unknown as R2Bucket,
  } as unknown as Env;
}

const VALID_USER_ROW = {
  id: 'usr_001',
  email: 'user@example.com',
  workspace_id: 'ws_001',
  tenant_id: 'tnt_001',
  role: 'admin',
  password_hash: '' as string,
};

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
describe('POST /auth/login', () => {
  it('returns 400 when email is missing', async () => {
    const res = await app.fetch(
      post('/auth/login', { password: 'SecurePass123!' }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/email and password/i);
  });

  it('returns 400 for password shorter than 8 characters', async () => {
    const res = await app.fetch(
      post('/auth/login', { email: 'user@example.com', password: 'short' }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
  });

  it('returns 401 when user is not found', async () => {
    const res = await app.fetch(
      post('/auth/login', { email: 'ghost@example.com', password: 'SecurePass123!' }),
      makeEnv(makeDB({ loginUser: null })),
    );
    expect(res.status).toBe(401);
  });

  it('returns 401 with wrong password', async () => {
    const db = makeDB({ loginUser: { ...VALID_USER_ROW, password_hash: TEST_PASSWORD_HASH } });
    const res = await app.fetch(
      post('/auth/login', { email: 'user@example.com', password: 'WrongPassword99!' }),
      makeEnv(db),
    );
    expect(res.status).toBe(401);
  });

  it('returns 200 with { token, user } on valid credentials', async () => {
    // We need TEST_PASSWORD_HASH to be ready
    const userRow = { ...VALID_USER_ROW, password_hash: TEST_PASSWORD_HASH };
    const db = makeDB({ loginUser: userRow });
    const env = makeEnv(db);
    const res = await app.fetch(
      post('/auth/login', { email: 'user@example.com', password: TEST_PASSWORD }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { token: string; user: { id: string; email: string; tenantId: string; role: string } };
    expect(typeof body.token).toBe('string');
    expect(body.user.id).toBe('usr_001');
    expect(body.user.email).toBe('user@example.com');
    expect(body.user.tenantId).toBe('tnt_001');
    expect(body.user.role).toBe('admin');
  });

  it('normalises email to lowercase', async () => {
    const userRow = { ...VALID_USER_ROW, password_hash: TEST_PASSWORD_HASH };
    const db = makeDB({ loginUser: userRow });
    const res = await app.fetch(
      post('/auth/login', { email: 'USER@EXAMPLE.COM', password: TEST_PASSWORD }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------
describe('POST /auth/register', () => {
  it('returns 400 when email is missing', async () => {
    const res = await app.fetch(
      post('/auth/register', { password: 'SecurePass123!', businessName: 'Test Biz' }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/email.*password.*businessName|required/i);
  });

  it('returns 400 when businessName is missing', async () => {
    const res = await app.fetch(
      post('/auth/register', { email: 'new@example.com', password: 'SecurePass123!' }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await app.fetch(
      post('/auth/register', { email: 'not-an-email', password: 'SecurePass123!', businessName: 'Test' }),
      makeEnv(makeDB({ existingEmail: null })),
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 for password too short', async () => {
    const res = await app.fetch(
      post('/auth/register', { email: 'new@example.com', password: 'weak', businessName: 'Test Biz' }),
      makeEnv(makeDB({ existingEmail: null })),
    );
    expect(res.status).toBe(400);
  });

  it('returns 409 when email already exists', async () => {
    const db = makeDB({ existingEmail: { id: 'usr_existing' } });
    const res = await app.fetch(
      post('/auth/register', {
        email: 'taken@example.com',
        password: 'SecurePass123!',
        businessName: 'Test Biz',
      }),
      makeEnv(db),
    );
    expect(res.status).toBe(409);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/already exists/i);
  });

  it('returns 201 with { token, user } on successful registration', async () => {
    const db = makeDB({ existingEmail: null });
    const res = await app.fetch(
      post('/auth/register', {
        email: 'newbiz@example.com',
        password: 'SecurePass123!',
        businessName: 'My Test Business',
        phone: '+2348012345678',
      }),
      makeEnv(db),
    );
    expect(res.status).toBe(201);
    const body = await res.json() as {
      token: string;
      user: { id: string; email: string; tenantId: string; role: string };
    };
    expect(typeof body.token).toBe('string');
    expect(body.user.email).toBe('newbiz@example.com');
    expect(body.user.role).toBe('admin');
    expect(typeof body.user.tenantId).toBe('string');
    expect(body.user.tenantId.startsWith('tnt_')).toBe(true);
  });

  it('normalises email to lowercase on registration', async () => {
    const db = makeDB({ existingEmail: null });
    const res = await app.fetch(
      post('/auth/register', {
        email: 'UPPER@EXAMPLE.COM',
        password: 'SecurePass123!',
        businessName: 'My Business',
      }),
      makeEnv(db),
    );
    expect(res.status).toBe(201);
    const body = await res.json() as { user: { email: string } };
    expect(body.user.email).toBe('upper@example.com');
  });

  it('does not include refreshToken in registration response', async () => {
    const db = makeDB({ existingEmail: null });
    const res = await app.fetch(
      post('/auth/register', {
        email: 'check@example.com',
        password: 'SecurePass123!',
        businessName: 'My Biz',
      }),
      makeEnv(db),
    );
    const body = await res.json() as Record<string, unknown>;
    expect(body['refreshToken']).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// GET /auth/me
// ---------------------------------------------------------------------------
describe('GET /auth/me', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(get('/auth/me'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('returns flat user shape { id, email, tenantId, workspaceId, role } with a valid JWT', async () => {
    const jwt = await makeJwt('usr_001', 'tnt_001', 'ws_001', 'admin');
    const db = makeDB({ meUser: { email: 'user@example.com' } });
    const res = await app.fetch(get('/auth/me', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as {
      id: string; email: string; tenantId: string; workspaceId: string; role: string;
    };
    expect(body.id).toBe('usr_001');
    expect(body.tenantId).toBe('tnt_001');
    expect(body.workspaceId).toBe('ws_001');
    expect(body.role).toBe('admin');
    // Response must NOT be nested under a "data" key (AUT-005 fix)
    expect((body as Record<string, unknown>)['data']).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// POST /auth/refresh
// ---------------------------------------------------------------------------
describe('POST /auth/refresh', () => {
  it('returns 401 without a JWT in Authorization header', async () => {
    const res = await app.fetch(
      post('/auth/refresh', {}),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(401);
  });

  it('returns 200 with a new { token } when called with a valid JWT', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      post('/auth/refresh', {}, jwt),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { token: string };
    expect(typeof body.token).toBe('string');
    // AUT-006: response must NOT include refreshToken
    expect((body as Record<string, unknown>)['refreshToken']).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// POST /auth/verify
// ---------------------------------------------------------------------------
describe('POST /auth/verify', () => {
  it('returns 400 without a token field', async () => {
    const res = await app.fetch(post('/auth/verify', {}), makeEnv(makeDB()));
    expect(res.status).toBe(400);
  });

  it('returns 401 for an invalid token', async () => {
    const res = await app.fetch(
      post('/auth/verify', { token: 'not.a.valid.jwt' }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(401);
    const body = await res.json() as { valid: boolean };
    expect(body.valid).toBe(false);
  });

  it('returns 200 and valid=true for a well-formed JWT', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      post('/auth/verify', { token: jwt }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { valid: boolean };
    expect(body.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST /auth/forgot-password
// ---------------------------------------------------------------------------
describe('POST /auth/forgot-password', () => {
  it('returns 400 when email is missing', async () => {
    const res = await app.fetch(post('/auth/forgot-password', {}), makeEnv(makeDB()));
    expect(res.status).toBe(400);
  });

  it('always returns 200 with a message (anti-enumeration) even for unknown email', async () => {
    const db = makeDB({ loginUser: null });
    const res = await app.fetch(
      post('/auth/forgot-password', { email: 'unknown@example.com' }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(typeof body.message).toBe('string');
  });

  it('returns 200 and stores reset token in KV for known email', async () => {
    const db = makeDB({ loginUser: { id: 'usr_001' } });
    const kv = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as KVNamespace;
    const env = {
      DB: db,
      JWT_SECRET,
      ENVIRONMENT: 'test',
      KV: { get: vi.fn().mockResolvedValue(null), put: vi.fn(), delete: vi.fn() } as unknown as KVNamespace,
      RATE_LIMIT_KV: kv,
      ASSETS: undefined as unknown as R2Bucket,
    } as unknown as Env;
    const res = await app.fetch(
      post('/auth/forgot-password', { email: 'user@example.com' }),
      env,
    );
    expect(res.status).toBe(200);
    expect(kv.put).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// POST /auth/reset-password
// ---------------------------------------------------------------------------
describe('POST /auth/reset-password', () => {
  it('returns 400 when token or password is missing', async () => {
    const res = await app.fetch(
      post('/auth/reset-password', { token: 'abc' }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 for password shorter than 8 characters', async () => {
    const res = await app.fetch(
      post('/auth/reset-password', { token: 'some-token', password: 'weak' }),
      makeEnv(makeDB(), 'usr_001'),
    );
    expect(res.status).toBe(400);
  });

  it('returns 401 when reset token is not found in KV', async () => {
    const res = await app.fetch(
      post('/auth/reset-password', { token: 'invalid-token', password: 'NewSecurePass123!' }),
      makeEnv(makeDB(), null),
    );
    expect(res.status).toBe(401);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/invalid or has expired/i);
  });

  it('returns 200 and updates password when reset token is valid', async () => {
    const db = makeDB();
    const env = {
      DB: db,
      JWT_SECRET,
      ENVIRONMENT: 'test',
      KV: { get: vi.fn().mockResolvedValue(null), put: vi.fn(), delete: vi.fn() } as unknown as KVNamespace,
      RATE_LIMIT_KV: {
        get: vi.fn().mockResolvedValue('usr_001'),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      } as unknown as KVNamespace,
      ASSETS: undefined as unknown as R2Bucket,
    } as unknown as Env;
    const res = await app.fetch(
      post('/auth/reset-password', { token: 'valid-token-uuid', password: 'NewSecurePass123!' }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/reset successfully/i);
  });
});

// ---------------------------------------------------------------------------
// DELETE /auth/me (NDPR erasure)
// ---------------------------------------------------------------------------
describe('DELETE /auth/me', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(del('/auth/me'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('returns 200 and erases user data with a valid JWT', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(del('/auth/me', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(200);
    const body = await res.json() as { erasedAt: string };
    expect(typeof body.erasedAt).toBe('string');
  });
});
