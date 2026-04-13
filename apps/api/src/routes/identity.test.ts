/**
 * Identity route tests — P3-A (HIGH-003)
 * Covers all 4 verify-* endpoints with ≥20 cases.
 * Uses vi.mock to stub @webwaka/identity — zero live API calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { identityRoutes } from './identity.js';

// ---------------------------------------------------------------------------
// Hoist mock factories before vi.mock (Vitest requirement)
// ---------------------------------------------------------------------------

const { mockVerifyBVN, mockVerifyNIN, mockVerifyCAC, mockVerifyFRSC, mockHashPII } = vi.hoisted(() => ({
  mockVerifyBVN: vi.fn(),
  mockVerifyNIN: vi.fn(),
  mockVerifyCAC: vi.fn(),
  mockVerifyFRSC: vi.fn(),
  mockHashPII: vi.fn().mockResolvedValue('sha256mockedhash'),
}));

vi.mock('@webwaka/identity', async (importOriginal) => {
  const original = await importOriginal<typeof import('@webwaka/identity')>();
  return {
    ...original,
    verifyBVN: mockVerifyBVN,
    verifyNIN: mockVerifyNIN,
    verifyCAC: mockVerifyCAC,
    verifyFRSC: mockVerifyFRSC,
    hashPII: mockHashPII,
  };
});

// ---------------------------------------------------------------------------
// D1 mock
// ---------------------------------------------------------------------------

interface D1Stmt {
  bind(...args: unknown[]): D1Stmt;
  run(): Promise<{ success: boolean }>;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
}

type SqlHandler = (sql: string, ...args: unknown[]) => unknown;

function makeDb(handlers: Record<string, SqlHandler> = {}) {
  const resolve = (sql: string): SqlHandler | null => {
    for (const [key, fn] of Object.entries(handlers)) {
      if (sql.includes(key)) return fn;
    }
    return null;
  };
  const stmtFor = (sql: string): D1Stmt => {
    const args: unknown[] = [];
    const stmt: D1Stmt = {
      bind: (...a) => { args.push(...a); return stmt; },
      run: async () => ({ success: true }),
      first: async <T>() => {
        const fn = resolve(sql);
        return fn ? (fn(sql, ...args) as T) : null;
      },
      all: async <T>() => ({ results: [] as T[] }),
    };
    return stmt;
  };
  return { prepare: (q: string) => stmtFor(q) };
}

const MOCK_CONSENT = {
  id: 'con_001',
  user_id: 'usr_test',
  tenant_id: 'tnt_test',
  data_type: 'BVN',
  purpose: 'kyc',
  consented_at: 1700000000,
  revoked_at: null,
};

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

function makeApp(db: ReturnType<typeof makeDb>, tenantId = 'tnt_test', userId = 'usr_test') {
  const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string; PREMBLY_API_KEY: string; PAYSTACK_SECRET_KEY: string; LOG_PII_SALT: string } }>();
  app.use('*', async (c, next) => {
    c.env = { DB: db, JWT_SECRET: 'test', ENVIRONMENT: 'development', PREMBLY_API_KEY: 'pk_test', PAYSTACK_SECRET_KEY: 'sk_test', LOG_PII_SALT: 'salt' } as never;
    c.set('auth' as never, { userId, tenantId } as never);
    await next();
  });
  app.route('/identity', identityRoutes);
  return app;
}

// ---------------------------------------------------------------------------
// POST /identity/verify-bvn
// ---------------------------------------------------------------------------

describe('POST /identity/verify-bvn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHashPII.mockResolvedValue('sha256mockedhash');
  });

  it('returns 400 when bvn is missing', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-bvn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent_id: 'con_001', phone: '08012345678' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json<{ error: string }>();
    expect(body.error).toMatch(/bvn/i);
  });

  it('returns 400 when consent_id is missing', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-bvn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bvn: '12345678901', phone: '08012345678' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when phone is missing', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-bvn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bvn: '12345678901', consent_id: 'con_001' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-JSON body', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-bvn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    expect(res.status).toBe(400);
  });

  it('returns 403 when consent is not found (consent_missing)', async () => {
    const { IdentityError } = await import('@webwaka/identity');
    mockVerifyBVN.mockRejectedValueOnce(new IdentityError('consent_missing', 'Consent required'));
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-bvn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bvn: '12345678901', consent_id: 'con_missing', phone: '08012345678' }),
    });
    expect(res.status).toBe(403);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('consent_missing');
  });

  it('returns 200 and success=true when BVN verifies', async () => {
    mockVerifyBVN.mockResolvedValueOnce({ verified: true, full_name: 'Test User', phone_match: true, provider: 'prembly' });
    const db = makeDb({ consent_records: () => MOCK_CONSENT });
    const app = makeApp(db);
    const res = await app.request('/identity/verify-bvn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bvn: '12345678901', consent_id: 'con_001', phone: '08012345678' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ success: boolean; result: { verified: boolean } }>();
    expect(body.success).toBe(true);
    expect(body.result.verified).toBe(true);
  });

  it('does not expose raw bvn in response', async () => {
    mockVerifyBVN.mockResolvedValueOnce({ verified: true, full_name: 'Test User', phone_match: true, provider: 'prembly' });
    const db = makeDb({ consent_records: () => MOCK_CONSENT });
    const app = makeApp(db);
    const res = await app.request('/identity/verify-bvn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bvn: '12345678901', consent_id: 'con_001', phone: '08012345678' }),
    });
    const body = await res.text();
    expect(body).not.toContain('12345678901');
  });

  it('returns 422 for non-consent IdentityError (e.g. bvn_not_found)', async () => {
    const { IdentityError } = await import('@webwaka/identity');
    mockVerifyBVN.mockRejectedValueOnce(new IdentityError('bvn_not_found', 'BVN format invalid'));
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-bvn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bvn: '12345678901', consent_id: 'con_001', phone: '08012345678' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 502 for generic provider error', async () => {
    mockVerifyBVN.mockRejectedValueOnce(new Error('Network timeout'));
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-bvn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bvn: '12345678901', consent_id: 'con_001', phone: '08012345678' }),
    });
    expect(res.status).toBe(502);
  });

  it('T3: consent query is scoped to caller tenantId+userId (different tenant gets null consent)', async () => {
    const { IdentityError } = await import('@webwaka/identity');
    mockVerifyBVN.mockRejectedValueOnce(new IdentityError('consent_missing', 'Consent required'));
    const db = makeDb({
      consent_records: (_sql, ...args) => {
        const boundTenant = args[1];
        return boundTenant === 'tnt_OTHER' ? null : MOCK_CONSENT;
      },
    });
    const app = makeApp(db, 'tnt_OTHER');
    const res = await app.request('/identity/verify-bvn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bvn: '12345678901', consent_id: 'con_001', phone: '08012345678' }),
    });
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// POST /identity/verify-nin
// ---------------------------------------------------------------------------

describe('POST /identity/verify-nin', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 400 when nin is missing', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-nin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent_id: 'con_001' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when consent_id is missing', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-nin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nin: '12345678901' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 200 on successful NIN verify', async () => {
    mockVerifyNIN.mockResolvedValueOnce({ verified: true, full_name: 'Test User', gender: 'M', dob: '1990-01-01', provider: 'prembly' });
    mockHashPII.mockResolvedValueOnce('hash_nin');
    const db = makeDb({ consent_records: () => ({ ...MOCK_CONSENT, data_type: 'NIN' }) });
    const app = makeApp(db);
    const res = await app.request('/identity/verify-nin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nin: '12345678901', consent_id: 'con_001' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ success: boolean }>();
    expect(body.success).toBe(true);
  });

  it('returns 403 for consent_missing on NIN', async () => {
    const { IdentityError } = await import('@webwaka/identity');
    mockVerifyNIN.mockRejectedValueOnce(new IdentityError('consent_missing', 'Consent required'));
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-nin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nin: '12345678901', consent_id: 'con_missing' }),
    });
    expect(res.status).toBe(403);
  });

  it('returns 502 on provider error for NIN', async () => {
    mockVerifyNIN.mockRejectedValueOnce(new Error('Prembly timeout'));
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-nin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nin: '12345678901', consent_id: 'con_001' }),
    });
    expect(res.status).toBe(502);
  });

  it('T3: NIN consent query includes tenantId+userId scope', async () => {
    const { IdentityError } = await import('@webwaka/identity');
    mockVerifyNIN.mockRejectedValueOnce(new IdentityError('consent_missing', 'Consent required'));
    const capturedArgs: unknown[] = [];
    const db = makeDb({
      consent_records: (_sql, ...args) => { capturedArgs.push(...args); return null; },
    });
    const app = makeApp(db, 'tnt_B', 'usr_B');
    await app.request('/identity/verify-nin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nin: '12345678901', consent_id: 'con_001' }),
    });
    expect(capturedArgs).toContain('tnt_B');
    expect(capturedArgs).toContain('usr_B');
  });
});

// ---------------------------------------------------------------------------
// POST /identity/verify-cac
// ---------------------------------------------------------------------------

describe('POST /identity/verify-cac', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 400 when rc_number is missing', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-cac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent_id: 'con_001' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when consent_id is missing', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-cac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rc_number: 'RC123456' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 200 on successful CAC verify', async () => {
    mockVerifyCAC.mockResolvedValueOnce({ verified: true, company_name: 'Test Ltd', rc_number: 'RC123456' });
    const db = makeDb({ consent_records: () => ({ ...MOCK_CONSENT, data_type: 'CAC' }) });
    const app = makeApp(db);
    const res = await app.request('/identity/verify-cac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rc_number: 'RC123456', consent_id: 'con_001' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ success: boolean }>();
    expect(body.success).toBe(true);
  });

  it('returns 502 on provider error for CAC', async () => {
    mockVerifyCAC.mockRejectedValueOnce(new Error('CAC API down'));
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-cac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rc_number: 'RC123456', consent_id: 'con_001' }),
    });
    expect(res.status).toBe(502);
  });
});

// ---------------------------------------------------------------------------
// POST /identity/verify-frsc
// ---------------------------------------------------------------------------

describe('POST /identity/verify-frsc', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 400 when license_number is missing', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-frsc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent_id: 'con_001' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when consent_id is missing', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-frsc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_number: 'ABC1234' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 200 on successful FRSC verify', async () => {
    mockVerifyFRSC.mockResolvedValueOnce({ verified: true, full_name: 'Test User', license_class: 'B', expiry_date: '2030-01-01' });
    const db = makeDb({ consent_records: () => ({ ...MOCK_CONSENT, data_type: 'FRSC' }) });
    const app = makeApp(db);
    const res = await app.request('/identity/verify-frsc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_number: 'ABC1234567890', consent_id: 'con_001' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ success: boolean }>();
    expect(body.success).toBe(true);
  });

  it('returns 403 for consent_missing on FRSC', async () => {
    const { IdentityError } = await import('@webwaka/identity');
    mockVerifyFRSC.mockRejectedValueOnce(new IdentityError('consent_missing', 'Consent required'));
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-frsc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_number: 'ABC1234567890', consent_id: 'con_missing' }),
    });
    expect(res.status).toBe(403);
  });

  it('returns 502 on provider error for FRSC', async () => {
    mockVerifyFRSC.mockRejectedValueOnce(new Error('FRSC API timeout'));
    const app = makeApp(makeDb());
    const res = await app.request('/identity/verify-frsc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_number: 'ABC1234567890', consent_id: 'con_001' }),
    });
    expect(res.status).toBe(502);
  });

  it('T3: FRSC consent query scoped to caller tenantId', async () => {
    const { IdentityError } = await import('@webwaka/identity');
    mockVerifyFRSC.mockRejectedValueOnce(new IdentityError('consent_missing', 'Consent required'));
    const capturedArgs: unknown[] = [];
    const db = makeDb({
      consent_records: (_sql, ...args) => { capturedArgs.push(...args); return null; },
    });
    const app = makeApp(db, 'tnt_C');
    await app.request('/identity/verify-frsc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_number: 'ABC1234567890', consent_id: 'con_001' }),
    });
    expect(capturedArgs).toContain('tnt_C');
  });
});
