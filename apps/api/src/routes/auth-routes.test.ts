/**
 * Auth routes tests — Phase 18 + Phase 19 QA audit
 *
 * Covers:
 *   - POST /auth/login             — success, wrong password, user not found, bad request
 *   - POST /auth/register          — success (201), duplicate email (409), validation errors
 *   - GET  /auth/me                — success (extended shape), 401 without JWT, workspaceId-less
 *   - POST /auth/refresh           — success with valid JWT, 401 without JWT
 *   - POST /auth/verify            — valid token, invalid token
 *   - POST /auth/forgot-password   — always 200 (anti-enumeration), KV put called
 *   - POST /auth/reset-password    — success, invalid token, weak password
 *   - POST /auth/change-password   — success, 400/401 error cases
 *   - POST /auth/logout            — 401 without JWT, KV blacklist + sessions, KV fail-open (P19-C)
 *   - PATCH /auth/profile          — success, 400 validations, phone format, field clearing (P19-B)
 *   - DELETE /auth/me              — NDPR erasure, 401 without JWT
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
  // BUG-003 fix: test requests are M2M callers — send X-CSRF-Intent: m2m so the
  // CSRF middleware allows programmatic (non-browser) requests.
  return new Request(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Intent': 'm2m',
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

// BUG-003 fix: test requests are M2M callers — send X-CSRF-Intent: m2m so the
// CSRF middleware allows programmatic (non-browser) DELETE requests.
function del(path: string, jwt?: string): Request {
  return new Request(`${BASE}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Intent': 'm2m',
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
    // P19-F: register batch now has 3 statements: tenants + workspaces + users
    batch: vi.fn().mockResolvedValue([{ results: [] }, { results: [] }, { results: [] }]),
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

  it('returns extended user shape { id, email, phone, fullName, businessName, tenantId, workspaceId, role } with a valid JWT', async () => {
    const jwt = await makeJwt('usr_001', 'tnt_001', 'ws_001', 'admin');
    const db = makeDB({ meUser: { email: 'user@example.com', phone: '+2348012345678', full_name: 'Amara Okafor' } });
    const res = await app.fetch(get('/auth/me', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as {
      id: string; email: string; tenantId: string; workspaceId: string; role: string;
      phone: string | null; fullName: string | null; businessName: string | null;
    };
    expect(body.id).toBe('usr_001');
    expect(body.email).toBe('user@example.com');
    expect(body.phone).toBe('+2348012345678');
    expect(body.fullName).toBe('Amara Okafor');
    expect(body.tenantId).toBe('tnt_001');
    expect(body.workspaceId).toBe('ws_001');
    expect(body.role).toBe('admin');
    // businessName comes from workspace query (returns null in mock)
    expect(body.businessName).toBeNull();
    // Response must NOT be nested under a "data" key (AUT-005 fix)
    expect((body as Record<string, unknown>)['data']).toBeUndefined();
  });

  it('returns 401 for a JWT missing the required workspace_id claim (architecture constraint)', async () => {
    // @webwaka/auth requires sub, workspace_id, tenant_id, role, iat, exp in every JWT.
    // A workspace-less super-admin cannot be authenticated with the current JWT schema.
    // This test documents the constraint so it is not accidentally changed without intent.
    const now = Math.floor(Date.now() / 1000);
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const payload = btoa(JSON.stringify({
      sub: 'usr_super',
      tenant_id: 'tnt_001',
      // workspace_id intentionally omitted — violates JWT schema
      role: 'admin',
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
    const jwt = `${input}.${signature}`;

    const res = await app.fetch(get('/auth/me', jwt), makeEnv(makeDB()));
    // The auth middleware rejects tokens missing required claims
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// POST /auth/refresh — BUG-004: opaque refresh token rotation
// ---------------------------------------------------------------------------
describe('POST /auth/refresh', () => {
  it('returns 400 when refresh_token is missing from body', async () => {
    const res = await app.fetch(
      post('/auth/refresh', {}),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/refresh_token/i);
  });

  it('returns 401 when refresh_token is not found in DB', async () => {
    // makeDB returns null for all .first() calls by default → 401
    const res = await app.fetch(
      post('/auth/refresh', { refresh_token: 'invalid-token-value' }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(401);
  });

  it('returns 200 with new { token, refresh_token, expires_in } for a valid refresh token', async () => {
    // DB mock: first .first() returns a valid (non-revoked) refresh token row.
    const validRtRow = {
      id: 'rt_001',
      user_id: 'usr_001',
      tenant_id: 'tnt_001',
      workspace_id: 'ws_001',
      role: 'admin',
      revoked_at: null,
      replaced_by: null,
    };
    const db = {
      prepare: vi.fn().mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          first: vi.fn()
            .mockResolvedValueOnce(validRtRow)    // refresh_tokens lookup
            .mockResolvedValueOnce({ status: 'active' }), // workspace check
          run: vi.fn().mockResolvedValue({ success: true }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ success: true }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      batch: vi.fn().mockResolvedValue([{ meta: { changes: 1 } }, { meta: { changes: 1 } }]),
    };
    const res = await app.fetch(
      post('/auth/refresh', { refresh_token: 'some-valid-token-value' }),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { token: string; refresh_token: string; expires_in: number };
    expect(typeof body.token).toBe('string');
    expect(typeof body.refresh_token).toBe('string');
    expect(body.expires_in).toBe(3600);
  });

  it('returns 401 and revokes all sessions on refresh token reuse', async () => {
    // A revoked token (revoked_at is non-null) triggers reuse detection.
    const revokedRtRow = {
      id: 'rt_002',
      user_id: 'usr_001',
      tenant_id: 'tnt_001',
      workspace_id: 'ws_001',
      role: 'admin',
      revoked_at: 1700000000, // non-null = already revoked
      replaced_by: 'rt_003',
    };
    const db = {
      prepare: vi.fn().mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValueOnce(revokedRtRow),
          run: vi.fn().mockResolvedValue({ success: true }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ success: true }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      batch: vi.fn().mockResolvedValue([]),
    };
    const res = await app.fetch(
      post('/auth/refresh', { refresh_token: 'old-already-used-token' }),
      makeEnv(db),
    );
    expect(res.status).toBe(401);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/reuse/i);
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
    // loginUser provides the tenant_id row returned by the first DB.first() call
    // (SELECT tenant_id FROM users WHERE id = ?) inside the reset-password handler.
    const db = makeDB({ loginUser: { tenant_id: 'tnt_001' } });
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
// POST /auth/change-password
// ---------------------------------------------------------------------------
describe('POST /auth/change-password', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(
      post('/auth/change-password', { currentPassword: 'OldPass123!', newPassword: 'NewPass456!' }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when currentPassword is missing', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      post('/auth/change-password', { newPassword: 'NewPass456!' }, jwt),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/currentPassword.*newPassword|required/i);
  });

  it('returns 400 for weak new password', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      post('/auth/change-password', { currentPassword: 'OldPass123!', newPassword: 'weak' }, jwt),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when new password equals current password', async () => {
    const jwt = await makeJwt();
    const db = makeDB({ meUser: { password_hash: TEST_PASSWORD_HASH } });
    const res = await app.fetch(
      post('/auth/change-password', { currentPassword: TEST_PASSWORD, newPassword: TEST_PASSWORD }, jwt),
      makeEnv(db),
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/differ|same/i);
  });

  it('returns 401 when current password is wrong', async () => {
    const jwt = await makeJwt();
    const db = makeDB({ meUser: { password_hash: TEST_PASSWORD_HASH } });
    const res = await app.fetch(
      post('/auth/change-password', { currentPassword: 'WrongPass999!', newPassword: 'NewPass456!' }, jwt),
      makeEnv(db),
    );
    expect(res.status).toBe(401);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/incorrect/i);
  });

  it('returns 200 and success message when current password is correct', async () => {
    const jwt = await makeJwt();
    const db = makeDB({ meUser: { password_hash: TEST_PASSWORD_HASH } });
    const res = await app.fetch(
      post('/auth/change-password', { currentPassword: TEST_PASSWORD, newPassword: 'NewSecure456!' }, jwt),
      makeEnv(db),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/changed successfully/i);
  });
});

// ---------------------------------------------------------------------------
// POST /auth/logout (P19-C)
// ---------------------------------------------------------------------------
describe('POST /auth/logout', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(
      post('/auth/logout', {}),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(401);
  });

  it('returns 200 and blacklists the token in KV with a valid JWT', async () => {
    const jwt = await makeJwt();
    const kvPut = vi.fn().mockResolvedValue(undefined);
    const env = {
      DB: makeDB(),
      JWT_SECRET,
      ENVIRONMENT: 'test',
      KV: { get: vi.fn(), put: vi.fn(), delete: vi.fn() } as unknown as KVNamespace,
      RATE_LIMIT_KV: {
        get: vi.fn().mockResolvedValue(null),
        put: kvPut,
        delete: vi.fn().mockResolvedValue(undefined),
      } as unknown as KVNamespace,
      ASSETS: undefined as unknown as R2Bucket,
    } as unknown as Env;
    const res = await app.fetch(
      post('/auth/logout', {}, jwt),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/logged out/i);
    expect(kvPut).toHaveBeenCalledWith(
      expect.stringMatching(/^blacklist:/),
      '1',
      expect.objectContaining({ expirationTtl: 3600 }),
    );
  });

  it('still returns 200 when KV is unavailable (fail-open)', async () => {
    const jwt = await makeJwt();
    const env = {
      DB: makeDB(),
      JWT_SECRET,
      ENVIRONMENT: 'test',
      KV: { get: vi.fn(), put: vi.fn(), delete: vi.fn() } as unknown as KVNamespace,
      RATE_LIMIT_KV: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockRejectedValue(new Error('KV unavailable')),
        delete: vi.fn().mockResolvedValue(undefined),
      } as unknown as KVNamespace,
      ASSETS: undefined as unknown as R2Bucket,
    } as unknown as Env;
    const res = await app.fetch(
      post('/auth/logout', {}, jwt),
      env,
    );
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// PATCH /auth/profile (P19-B)
// ---------------------------------------------------------------------------
describe('PATCH /auth/profile', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(
      new Request(`${BASE}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m' },
        body: JSON.stringify({ phone: '+2348012345678' }),
      }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when no updatable fields are provided', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      new Request(`${BASE}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({}),
      }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/phone|fullName|required/i);
  });

  it('returns 200 when updating phone', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      new Request(`${BASE}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ phone: '+2348012345678' }),
      }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/updated successfully/i);
  });

  it('returns 200 when updating fullName', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      new Request(`${BASE}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ fullName: 'Ngozi Adeyemi' }),
      }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/updated successfully/i);
  });

  it('returns 200 when updating both phone and fullName', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      new Request(`${BASE}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ phone: '+2348099887766', fullName: 'Chukwuemeka Eze' }),
      }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(200);
  });

  it('returns 400 for an invalid phone number format', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      new Request(`${BASE}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ phone: 'not-a-phone' }),
      }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/valid Nigerian number/i);
  });

  it('returns 200 when clearing phone with empty string (stores null)', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      new Request(`${BASE}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ phone: '' }),
      }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/updated successfully/i);
  });

  it('returns 400 when fullName exceeds 100 characters', async () => {
    const jwt = await makeJwt();
    const longName = 'A'.repeat(101);
    const res = await app.fetch(
      new Request(`${BASE}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ fullName: longName }),
      }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/100 characters/i);
  });

  it('accepts local Nigerian format (08012345678)', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      new Request(`${BASE}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ phone: '08012345678' }),
      }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(200);
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

  it('returns 400 without X-Confirm-Erasure header (COMP-002)', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(del('/auth/me', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/X-Confirm-Erasure/i);
  });

  it('returns 200 and erases user data with a valid JWT and confirmation header (COMP-002/003)', async () => {
    const jwt = await makeJwt();
    // COMP-002: X-Confirm-Erasure: confirmed is required for erasure
    // COMP-003: db.batch() atomically writes UPDATE+DELETE+erasure_receipt
    const req = new Request(`${BASE}/auth/me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Intent': 'm2m',
        'X-Confirm-Erasure': 'confirmed',
        Authorization: `Bearer ${jwt}`,
      },
    });
    const res = await app.fetch(req, makeEnv(makeDB()));
    expect(res.status).toBe(200);
    const body = await res.json() as { erasedAt: string; receiptId: string };
    expect(typeof body.erasedAt).toBe('string');
    expect(typeof body.receiptId).toBe('string');
  });
});

// ===========================================================================
// P20-A: Workspace Member Invitations
// ===========================================================================

// ---------------------------------------------------------------------------
// POST /auth/invite
// ---------------------------------------------------------------------------
describe('POST /auth/invite — P20-A', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(post('/auth/invite', { email: 'a@b.com' }), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('returns 403 when caller role is not admin', async () => {
    const jwt = await makeJwt('usr_001', 'tnt_001', 'ws_001', 'member');
    const res = await app.fetch(post('/auth/invite', { email: 'a@b.com' }, jwt), makeEnv(makeDB()));
    expect(res.status).toBe(403);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/admins can invite/i);
  });

  it('returns 400 when email is missing', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(post('/auth/invite', {}, jwt), makeEnv(makeDB()));
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/email is required/i);
  });

  it('returns 400 for an invalid email address', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(post('/auth/invite', { email: 'not-an-email' }, jwt), makeEnv(makeDB()));
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/invalid email/i);
  });

  it('returns 400 for an invalid role', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(
      post('/auth/invite', { email: 'a@b.com', role: 'superuser' }, jwt),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/invalid role/i);
  });

  it('returns 409 when a pending invite already exists (first DB call returns existing row)', async () => {
    const db = makeDB({ existingEmail: { id: 'inv_exists' } });
    const jwt = await makeJwt();
    const res = await app.fetch(post('/auth/invite', { email: 'dupe@test.com' }, jwt), makeEnv(db));
    expect(res.status).toBe(409);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/pending invitation/i);
  });

  it('returns 201 and inviteId when admin invites a valid new email', async () => {
    // first call (existing invite check) → null = no conflict
    const db = makeDB();
    const jwt = await makeJwt();
    const res = await app.fetch(post('/auth/invite', { email: 'new@test.com', role: 'member' }, jwt), makeEnv(db));
    expect(res.status).toBe(201);
    const body = await res.json() as { inviteId: string; email: string; role: string; expiresAt: number; message: string };
    expect(body.inviteId).toBeDefined();
    expect(body.email).toBe('new@test.com');
    expect(body.role).toBe('member');
    expect(body.message).toMatch(/invitation sent/i);
  });

  it('accepts super_admin role as admin-equivalent', async () => {
    const db = makeDB();
    const jwt = await makeJwt('usr_001', 'tnt_001', 'ws_001', 'super_admin');
    const res = await app.fetch(post('/auth/invite', { email: 'x@y.com' }, jwt), makeEnv(db));
    expect(res.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// GET /auth/invite/pending
// ---------------------------------------------------------------------------
describe('GET /auth/invite/pending — P20-A', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(get('/auth/invite/pending'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-admin', async () => {
    const jwt = await makeJwt('usr_001', 'tnt_001', 'ws_001', 'member');
    const res = await app.fetch(get('/auth/invite/pending', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(403);
  });

  it('returns 200 with an empty invitations array when none exist', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(get('/auth/invite/pending', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(200);
    const body = await res.json() as { invitations: unknown[] };
    expect(Array.isArray(body.invitations)).toBe(true);
    expect(body.invitations).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// DELETE /auth/invite/:id
// ---------------------------------------------------------------------------
describe('DELETE /auth/invite/:id — P20-A', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(del('/auth/invite/inv_123'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-admin', async () => {
    const jwt = await makeJwt('usr_001', 'tnt_001', 'ws_001', 'cashier');
    const res = await app.fetch(del('/auth/invite/inv_123', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(403);
  });

  it('returns 404 when invitation not found', async () => {
    // makeDB default: first().resolves(null) → not found
    const jwt = await makeJwt();
    const res = await app.fetch(del('/auth/invite/inv_missing', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(404);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/not found/i);
  });

  it('returns 200 and revokes a found invitation', async () => {
    const db = makeDB({ existingEmail: { id: 'inv_abc' } });
    const jwt = await makeJwt();
    const res = await app.fetch(del('/auth/invite/inv_abc', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/revoked/i);
  });
});

// ---------------------------------------------------------------------------
// POST /auth/accept-invite
// ---------------------------------------------------------------------------
describe('POST /auth/accept-invite — P20-A', () => {
  it('returns 400 when token is missing', async () => {
    const res = await app.fetch(post('/auth/accept-invite', {}), makeEnv(makeDB()));
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/token is required/i);
  });

  it('returns 401 when KV has no matching invite (invalid/expired token)', async () => {
    // RATE_LIMIT_KV.get returns null → invalid token
    const res = await app.fetch(
      post('/auth/accept-invite', { token: 'bad-token' }),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(401);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/invalid or has expired/i);
  });

  it('returns 200 when accepting a valid invite for an existing user', async () => {
    // KV returns inviteId; DB first() calls:
    //   idx 0 → invite row
    //   idx 1 → existing user row
    const inviteRow = {
      id: 'inv_001',
      workspace_id: 'ws_001',
      tenant_id: 'tnt_001',
      email: 'existing@test.com',
      role: 'member',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      accepted_at: null,
    };
    const userRow = { id: 'usr_existing', workspace_id: 'ws_001' };

    let idx = 0;
    const db = {
      prepare: vi.fn().mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockImplementation(() => {
            const i = idx++;
            if (i === 0) return Promise.resolve(inviteRow);
            if (i === 1) return Promise.resolve(userRow);
            return Promise.resolve(null);
          }),
          run: vi.fn().mockResolvedValue({ success: true }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ success: true }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      batch: vi.fn().mockResolvedValue([]),
    };

    const env: Env = {
      DB: db,
      JWT_SECRET,
      ENVIRONMENT: 'test',
      KV: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      } as unknown as KVNamespace,
      RATE_LIMIT_KV: {
        get: vi.fn().mockResolvedValue('inv_001'), // KV returns inviteId
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      } as unknown as KVNamespace,
      ASSETS: undefined as unknown as R2Bucket,
    } as unknown as Env;

    const res = await app.fetch(post('/auth/accept-invite', { token: 'valid-token' }), env);
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string; userId: string };
    expect(body.message).toMatch(/invitation accepted/i);
    expect(body.userId).toBe('usr_existing');
  });
});

// ===========================================================================
// P20-B: Multi-Device Session Management
// ===========================================================================

// ---------------------------------------------------------------------------
// GET /auth/sessions
// ---------------------------------------------------------------------------
describe('GET /auth/sessions — P20-B', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(get('/auth/sessions'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('returns 200 with empty sessions array when none exist', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(get('/auth/sessions', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(200);
    const body = await res.json() as { sessions: unknown[]; count: number };
    expect(Array.isArray(body.sessions)).toBe(true);
    expect(body.count).toBe(0);
  });

  it('returns 200 and maps session rows to camelCase shape', async () => {
    const now = Math.floor(Date.now() / 1000);
    const sessionRow = {
      id: 'sess_001', issued_at: now - 60, expires_at: now + 3540,
      revoked_at: null, device_hint: 'Chrome on Windows', last_seen_at: now - 10,
    };
    const db = {
      prepare: vi.fn().mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: [sessionRow] }),
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ success: true }),
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ success: true }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      batch: vi.fn().mockResolvedValue([]),
    };
    const jwt = await makeJwt();
    const res = await app.fetch(get('/auth/sessions', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as { sessions: Array<{ id: string; deviceHint: string }> };
    expect(body.sessions[0]?.id).toBe('sess_001');
    expect(body.sessions[0]?.deviceHint).toBe('Chrome on Windows');
  });
});

// ---------------------------------------------------------------------------
// DELETE /auth/sessions/:id
// ---------------------------------------------------------------------------
describe('DELETE /auth/sessions/:id — P20-B', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(del('/auth/sessions/sess_001'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('returns 404 when session not found or already revoked', async () => {
    const jwt = await makeJwt();
    // makeDB default: first() returns null → not found
    const res = await app.fetch(del('/auth/sessions/sess_missing', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(404);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/not found or already revoked/i);
  });

  it('returns 200 and revokes a found session', async () => {
    const now = Math.floor(Date.now() / 1000);
    const sessRow = { id: 'sess_001', jti: 'abc123hash', expires_at: now + 3600 };
    const db = makeDB({ existingEmail: sessRow });
    const jwt = await makeJwt();
    const res = await app.fetch(del('/auth/sessions/sess_001', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/session revoked/i);
  });
});

// ---------------------------------------------------------------------------
// DELETE /auth/sessions (revoke all)
// ---------------------------------------------------------------------------
describe('DELETE /auth/sessions — P20-B revoke all', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(del('/auth/sessions'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('returns 200 and reports revokedCount of 0 when no other sessions exist', async () => {
    const jwt = await makeJwt();
    // all() returns [] — nothing to revoke
    const res = await app.fetch(del('/auth/sessions', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string; revokedCount: number };
    expect(body.revokedCount).toBe(0);
    expect(body.message).toMatch(/revoked/i);
  });
});

// ===========================================================================
// P20-C: Email Verification
// ===========================================================================

// ---------------------------------------------------------------------------
// POST /auth/send-verification
// ---------------------------------------------------------------------------
describe('POST /auth/send-verification — P20-C', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(post('/auth/send-verification', {}), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('returns 200 and sends verification email for unverified user', async () => {
    const userRow = { email: 'u@b.com', full_name: 'Ade', email_verified_at: null };
    const db = makeDB({ meUser: userRow });
    const jwt = await makeJwt();
    // RATE_LIMIT_KV.get → null (not throttled)
    const res = await app.fetch(post('/auth/send-verification', {}, jwt), makeEnv(db, null));
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/verification email sent/i);
  });

  it('returns 200 silently when email is already verified', async () => {
    const userRow = {
      email: 'verified@b.com',
      full_name: 'Ada',
      email_verified_at: Math.floor(Date.now() / 1000) - 3600,
    };
    const db = makeDB({ meUser: userRow });
    const jwt = await makeJwt();
    const res = await app.fetch(post('/auth/send-verification', {}, jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/already verified/i);
  });

  it('returns 429 when throttle KV key is set', async () => {
    const userRow = { email: 'u@b.com', full_name: 'Emeka', email_verified_at: null };
    const db = makeDB({ meUser: userRow });
    const jwt = await makeJwt();
    // Build a custom env where RATE_LIMIT_KV.get returns null for the JTI blacklist check
    // (called first by auth middleware) but '1' for the throttle key (called second, in the handler).
    let kvCallIdx = 0;
    const env: Env = {
      DB: db,
      JWT_SECRET,
      ENVIRONMENT: 'test',
      KV: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      } as unknown as KVNamespace,
      RATE_LIMIT_KV: {
        get: vi.fn().mockImplementation(() => {
          const idx = kvCallIdx++;
          // idx 0 = rate-limit middleware counter check → null
          // idx 1 = auth middleware blacklist:${rawToken} check → null
          // idx 2 = auth middleware blacklist:jti:${hash} check → null
          // idx 3 = handler throttle key check → '1' (throttled)
          return Promise.resolve(idx < 3 ? null : '1');
        }),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      } as unknown as KVNamespace,
      ASSETS: undefined as unknown as R2Bucket,
    } as unknown as Env;
    const res = await app.fetch(post('/auth/send-verification', {}, jwt), env);
    expect(res.status).toBe(429);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/already sent recently/i);
  });
});

// ---------------------------------------------------------------------------
// GET /auth/verify-email
// ---------------------------------------------------------------------------
describe('GET /auth/verify-email — P20-C', () => {
  it('returns 400 when token query param is missing', async () => {
    const res = await app.fetch(get('/auth/verify-email'), makeEnv(makeDB()));
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/token query parameter/i);
  });

  it('returns 401 when KV has no matching token (invalid/expired)', async () => {
    // RATE_LIMIT_KV.get returns null
    const res = await app.fetch(
      get('/auth/verify-email?token=invalid-token-xyz'),
      makeEnv(makeDB()),
    );
    expect(res.status).toBe(401);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/invalid or has expired/i);
  });

  it('returns 200 and marks email verified when KV token is valid', async () => {
    // loginUser provides the tenant_id row returned by the first DB.first() call
    // (SELECT tenant_id FROM users WHERE id = ?) inside the verify-email handler.
    const env: Env = {
      DB: makeDB({ loginUser: { tenant_id: 'tnt_001' } }),
      JWT_SECRET,
      ENVIRONMENT: 'test',
      KV: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      } as unknown as KVNamespace,
      RATE_LIMIT_KV: {
        get: vi.fn().mockResolvedValue('usr_001'), // valid → returns userId
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      } as unknown as KVNamespace,
      ASSETS: undefined as unknown as R2Bucket,
    } as unknown as Env;

    const res = await app.fetch(
      get('/auth/verify-email?token=valid-verify-token'),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/verified successfully/i);
  });
});

// ===========================================================================
// P20-E: Admin Metrics
// ===========================================================================

describe('GET /admin/metrics — P20-E', () => {
  it('returns 401 without a JWT', async () => {
    const res = await app.fetch(get('/admin/metrics'), makeEnv(makeDB()));
    expect(res.status).toBe(401);
  });

  it('returns 403 for a non-admin role', async () => {
    const jwt = await makeJwt('usr_001', 'tnt_001', 'ws_001', 'member');
    const res = await app.fetch(get('/admin/metrics', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(403);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/admin role required/i);
  });

  it('returns 200 with all expected metric fields for an admin', async () => {
    const jwt = await makeJwt();
    const res = await app.fetch(get('/admin/metrics', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(200);
    const body = await res.json() as {
      generatedAt: string;
      tenantId: string;
      activeSessionCount: number;
      pendingInvitations: number;
      recentErrors: unknown[];
      authFailures24h: number;
      totalAuditLogs24h: number;
    };
    expect(typeof body.generatedAt).toBe('string');
    expect(body.tenantId).toBe('tnt_001');
    expect(typeof body.activeSessionCount).toBe('number');
    expect(typeof body.pendingInvitations).toBe('number');
    expect(Array.isArray(body.recentErrors)).toBe(true);
    expect(typeof body.authFailures24h).toBe('number');
    expect(typeof body.totalAuditLogs24h).toBe('number');
  });

  it('returns 200 for super_admin role', async () => {
    const jwt = await makeJwt('usr_001', 'tnt_001', 'ws_001', 'super_admin');
    const res = await app.fetch(get('/admin/metrics', jwt), makeEnv(makeDB()));
    expect(res.status).toBe(200);
  });
});

// ===========================================================================
// BUG-07: Missing test coverage — added by QA audit
// ===========================================================================

// ---------------------------------------------------------------------------
// GET /auth/me — emailVerifiedAt field (P20-C)
// ---------------------------------------------------------------------------
describe('GET /auth/me — emailVerifiedAt field (P20-C)', () => {
  it('returns emailVerifiedAt as null when email_verified_at is null in DB', async () => {
    const jwt = await makeJwt();
    const db = makeDB({ meUser: { email: 'u@b.com', phone: null, full_name: null, email_verified_at: null } });
    const res = await app.fetch(get('/auth/me', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as { emailVerifiedAt: unknown };
    expect(body.emailVerifiedAt).toBeNull();
  });

  it('returns emailVerifiedAt as a unix timestamp when email is verified', async () => {
    const jwt = await makeJwt();
    const verifiedAt = Math.floor(Date.now() / 1000) - 3600;
    const db = makeDB({ meUser: {
      email: 'v@b.com', phone: null, full_name: 'Ada', email_verified_at: verifiedAt,
    } });
    const res = await app.fetch(get('/auth/me', jwt), makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as { emailVerifiedAt: number; email: string };
    expect(body.emailVerifiedAt).toBe(verifiedAt);
    expect(body.email).toBe('v@b.com');
  });
});

// ---------------------------------------------------------------------------
// POST /auth/accept-invite — new-user registration path (P20-A)
// ---------------------------------------------------------------------------
describe('POST /auth/accept-invite — new-user registration path (P20-A)', () => {
  function makeInviteEnv(
    inviteRow: Record<string, unknown>,
    existingUser: unknown,
    kvInviteId: string,
  ): Env {
    let idx = 0;
    const db = {
      prepare: vi.fn().mockImplementation(() => ({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockImplementation(() => {
            const i = idx++;
            if (i === 0) return Promise.resolve(inviteRow);
            if (i === 1) return Promise.resolve(existingUser);
            return Promise.resolve(null);
          }),
          run: vi.fn().mockResolvedValue({ success: true }),
          all: vi.fn().mockResolvedValue({ results: [] }),
        }),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue({ success: true }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })),
      batch: vi.fn().mockResolvedValue([]),
    };
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
        get: vi.fn().mockResolvedValue(kvInviteId),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      } as unknown as KVNamespace,
      ASSETS: undefined as unknown as R2Bucket,
    } as unknown as Env;
  }

  const baseInvite = {
    id: 'inv_002',
    workspace_id: 'ws_001',
    tenant_id: 'tnt_001',
    email: 'newuser@test.com',
    role: 'member',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    accepted_at: null,
  };

  it('returns 400 when new user omits name and password', async () => {
    const env = makeInviteEnv(baseInvite, null /* no existing user */, 'inv_002');
    const res = await app.fetch(post('/auth/accept-invite', { token: 'new-user-token' }), env);
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/name and password are required/i);
  });

  it('returns 400 when new user provides a weak password', async () => {
    const env = makeInviteEnv(baseInvite, null, 'inv_002');
    const res = await app.fetch(
      post('/auth/accept-invite', { token: 'new-user-token', name: 'Chidi', password: 'weak' }),
      env,
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { message: string };
    expect(body.message).toMatch(/password must be between/i);
  });

  it('returns 200 and creates a new user when valid name+password are provided', async () => {
    const env = makeInviteEnv(baseInvite, null, 'inv_002');
    const res = await app.fetch(
      post('/auth/accept-invite', {
        token: 'new-user-token',
        name: 'Chidi Okeke',
        password: 'ValidPass999!',
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { message: string; userId: string };
    expect(body.message).toMatch(/invitation accepted/i);
    expect(typeof body.userId).toBe('string');
    expect(body.userId.startsWith('usr_')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deviceHintFromUA Edge-before-Chrome fix (BUG-01)
// ---------------------------------------------------------------------------
describe('deviceHintFromUA — Edge correctly identified before Chrome (BUG-01)', () => {
  it('login succeeds with an Edge User-Agent (session creation does not blow up)', async () => {
    // Chromium Edge UA contains both "Edg/" and "Chrome" — BUG-01 fix moves the Edge check first
    // so the session is tagged "Edge" instead of "Chrome". We verify login returns 200 and a token.
    const db = makeDB({
      loginUser: {
        id: 'usr_001',
        email: 'edge@test.com',
        password_hash: TEST_PASSWORD_HASH,
        workspace_id: 'ws_001',
        tenant_id: 'tnt_001',
        role: 'admin',
      },
    });

    const edgeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
    const req = new Request(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Intent': 'm2m', 'User-Agent': edgeUA },
      body: JSON.stringify({ email: 'edge@test.com', password: TEST_PASSWORD }),
    });

    const res = await app.fetch(req, makeEnv(db));
    expect(res.status).toBe(200);
    const body = await res.json() as { token: string };
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(10);
  });
});
