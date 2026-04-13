/**
 * Entity route tests — P3-C (HIGH-005)
 * Covers individuals + organizations CRUD with ≥20 cases.
 * Mocks @webwaka/entities, @webwaka/entitlements, search-index.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { entityRoutes } from './entities.js';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const {
  mockCreateIndividual,
  mockGetIndividualById,
  mockListIndividuals,
  mockCreateOrg,
  mockGetOrgById,
  mockListOrgs,
  mockRequireLayerAccess,
  mockIndexIndividual,
  mockIndexOrg,
} = vi.hoisted(() => ({
  mockCreateIndividual: vi.fn(),
  mockGetIndividualById: vi.fn(),
  mockListIndividuals: vi.fn(),
  mockCreateOrg: vi.fn(),
  mockGetOrgById: vi.fn(),
  mockListOrgs: vi.fn(),
  mockRequireLayerAccess: vi.fn(),
  mockIndexIndividual: vi.fn().mockResolvedValue(undefined),
  mockIndexOrg: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@webwaka/entities', () => ({
  createIndividual: mockCreateIndividual,
  getIndividualById: mockGetIndividualById,
  listIndividualsByTenant: mockListIndividuals,
  createOrganization: mockCreateOrg,
  getOrganizationById: mockGetOrgById,
  listOrganizationsByTenant: mockListOrgs,
}));

vi.mock('@webwaka/entitlements', () => {
  class EntitlementError extends Error {
    constructor(msg: string) { super(msg); this.name = 'EntitlementError'; }
  }
  const PLAN_CONFIGS: Record<string, { layers: string[] }> = {
    free: { layers: [] },
    starter: { layers: ['foundation'] },
    business: { layers: ['foundation', 'operational'] },
    enterprise: { layers: ['foundation', 'operational', 'advanced'] },
  };
  return {
    requireLayerAccess: mockRequireLayerAccess,
    EntitlementError,
    PLAN_CONFIGS,
  };
});

vi.mock('@webwaka/types', async (importOriginal) => {
  const original = await importOriginal<typeof import('@webwaka/types')>();
  return { ...original };
});

vi.mock('../lib/search-index.js', () => ({
  indexIndividual: mockIndexIndividual,
  indexOrganization: mockIndexOrg,
}));

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

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

function makeApp(db: ReturnType<typeof makeDb>, tenantId = 'tnt_a', workspaceId = 'wsp_a', plan = 'business') {
  const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  app.use('*', async (c, next) => {
    c.env = { DB: db, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
    c.set('auth' as never, { userId: 'usr_test', tenantId, workspaceId, subscriptionPlan: plan, subscriptionStatus: 'active', activeLayers: ['foundation', 'operational'] } as never);
    await next();
  });
  app.route('/entities', entityRoutes);
  return app;
}

const MOCK_INDIVIDUAL = { id: 'ind_abc', name: 'Ada Okafor', tenantId: 'tnt_a' };
const MOCK_ORG = { id: 'org_xyz', name: 'Waka Ltd', tenantId: 'tnt_a' };

// ---------------------------------------------------------------------------
// Individuals
// ---------------------------------------------------------------------------

describe('POST /entities/individuals', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when name is missing', async () => {
    mockRequireLayerAccess.mockReturnValueOnce(undefined);
    const db = makeDb({ subscriptions: () => ({ plan: 'business', status: 'active' }) });
    const app = makeApp(db);
    const res = await app.request('/entities/individuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await res.json<{ error: string }>();
    expect(body.error).toMatch(/name/i);
  });

  it('returns 400 when name is a number', async () => {
    mockRequireLayerAccess.mockReturnValueOnce(undefined);
    const db = makeDb({ subscriptions: () => ({ plan: 'business', status: 'active' }) });
    const app = makeApp(db);
    const res = await app.request('/entities/individuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 42 }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 403 when entitlement check fails', async () => {
    const { EntitlementError } = await import('@webwaka/entitlements');
    mockRequireLayerAccess.mockImplementationOnce(() => { throw new EntitlementError('Insufficient plan'); });
    const db = makeDb({ subscriptions: () => ({ plan: 'free', status: 'active' }) });
    const app = makeApp(db);
    const res = await app.request('/entities/individuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ada Okafor' }),
    });
    expect(res.status).toBe(403);
  });

  it('returns 201 for valid individual creation', async () => {
    mockRequireLayerAccess.mockReturnValueOnce(undefined);
    mockCreateIndividual.mockResolvedValueOnce(MOCK_INDIVIDUAL);
    const db = makeDb({ subscriptions: () => ({ plan: 'business', status: 'active' }) });
    const app = makeApp(db);
    const res = await app.request('/entities/individuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ada Okafor' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ data: { id: string } }>();
    expect(body.data.id).toBe('ind_abc');
  });

  it('search index failure does not break 201 response', async () => {
    mockRequireLayerAccess.mockReturnValueOnce(undefined);
    mockCreateIndividual.mockResolvedValueOnce(MOCK_INDIVIDUAL);
    mockIndexIndividual.mockRejectedValueOnce(new Error('Search down'));
    const db = makeDb({ subscriptions: () => ({ plan: 'business', status: 'active' }) });
    const app = makeApp(db);
    const res = await app.request('/entities/individuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ada Okafor' }),
    });
    expect(res.status).toBe(201);
  });

  it('createIndividual receives tenantId from auth context (T3)', async () => {
    mockRequireLayerAccess.mockReturnValueOnce(undefined);
    mockCreateIndividual.mockResolvedValueOnce({ ...MOCK_INDIVIDUAL, tenantId: 'tnt_B' });
    const db = makeDb({ subscriptions: () => ({ plan: 'business', status: 'active' }) });
    const app = makeApp(db, 'tnt_B');
    await app.request('/entities/individuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Person' }),
    });
    expect(mockCreateIndividual).toHaveBeenCalledWith(expect.anything(), 'tnt_B', expect.any(Object));
  });
});

describe('GET /entities/individuals', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with items list', async () => {
    mockListIndividuals.mockResolvedValueOnce({ items: [MOCK_INDIVIDUAL], nextCursor: null });
    const app = makeApp(makeDb());
    const res = await app.request('/entities/individuals');
    expect(res.status).toBe(200);
    const body = await res.json<{ data: unknown[] }>();
    expect(body.data).toHaveLength(1);
  });

  it('respects limit query param', async () => {
    mockListIndividuals.mockResolvedValueOnce({ items: [], nextCursor: null });
    const app = makeApp(makeDb());
    await app.request('/entities/individuals?limit=5');
    expect(mockListIndividuals).toHaveBeenCalledWith(expect.anything(), expect.any(String), expect.objectContaining({ limit: 5 }));
  });

  it('passes cursor from query param', async () => {
    mockListIndividuals.mockResolvedValueOnce({ items: [], nextCursor: null });
    const app = makeApp(makeDb());
    await app.request('/entities/individuals?cursor=abc123');
    expect(mockListIndividuals).toHaveBeenCalledWith(expect.anything(), expect.any(String), expect.objectContaining({ cursor: 'abc123' }));
  });

  it('T3: list is scoped to caller tenantId', async () => {
    mockListIndividuals.mockResolvedValueOnce({ items: [], nextCursor: null });
    const app = makeApp(makeDb(), 'tnt_C');
    await app.request('/entities/individuals');
    expect(mockListIndividuals).toHaveBeenCalledWith(expect.anything(), 'tnt_C', expect.any(Object));
  });
});

describe('GET /entities/individuals/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 when individual found', async () => {
    mockGetIndividualById.mockResolvedValueOnce(MOCK_INDIVIDUAL);
    const app = makeApp(makeDb());
    const res = await app.request('/entities/individuals/ind_abc');
    expect(res.status).toBe(200);
    const body = await res.json<{ data: { id: string } }>();
    expect(body.data.id).toBe('ind_abc');
  });

  it('returns 404 when individual not found', async () => {
    mockGetIndividualById.mockResolvedValueOnce(null);
    const app = makeApp(makeDb());
    const res = await app.request('/entities/individuals/ind_missing');
    expect(res.status).toBe(404);
  });

  it('T3: getIndividualById called with tenantId from auth', async () => {
    mockGetIndividualById.mockResolvedValueOnce(null);
    const app = makeApp(makeDb(), 'tnt_D');
    await app.request('/entities/individuals/ind_abc');
    expect(mockGetIndividualById).toHaveBeenCalledWith(expect.anything(), 'tnt_D', expect.any(String));
  });
});

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

describe('POST /entities/organizations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when name is missing', async () => {
    mockRequireLayerAccess.mockReturnValueOnce(undefined);
    const db = makeDb({ subscriptions: () => ({ plan: 'business', status: 'active' }) });
    const app = makeApp(db);
    const res = await app.request('/entities/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('returns 403 when entitlement check fails', async () => {
    const { EntitlementError } = await import('@webwaka/entitlements');
    mockRequireLayerAccess.mockImplementationOnce(() => { throw new EntitlementError('Insufficient plan'); });
    const db = makeDb({ subscriptions: () => ({ plan: 'free', status: 'active' }) });
    const app = makeApp(db);
    const res = await app.request('/entities/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Waka Ltd' }),
    });
    expect(res.status).toBe(403);
  });

  it('returns 201 for valid org creation', async () => {
    mockRequireLayerAccess.mockReturnValueOnce(undefined);
    mockCreateOrg.mockResolvedValueOnce(MOCK_ORG);
    const db = makeDb({ subscriptions: () => ({ plan: 'business', status: 'active' }) });
    const app = makeApp(db);
    const res = await app.request('/entities/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Waka Ltd' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ data: { id: string } }>();
    expect(body.data.id).toBe('org_xyz');
  });

  it('T3: createOrganization called with tenantId from auth', async () => {
    mockRequireLayerAccess.mockReturnValueOnce(undefined);
    mockCreateOrg.mockResolvedValueOnce(MOCK_ORG);
    const db = makeDb({ subscriptions: () => ({ plan: 'business', status: 'active' }) });
    const app = makeApp(db, 'tnt_E');
    await app.request('/entities/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Waka Ltd' }),
    });
    expect(mockCreateOrg).toHaveBeenCalledWith(expect.anything(), 'tnt_E', expect.any(Object));
  });
});

describe('GET /entities/organizations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with org list', async () => {
    mockListOrgs.mockResolvedValueOnce({ items: [MOCK_ORG], nextCursor: null });
    const app = makeApp(makeDb());
    const res = await app.request('/entities/organizations');
    expect(res.status).toBe(200);
    const body = await res.json<{ data: unknown[] }>();
    expect(body.data).toHaveLength(1);
  });
});

describe('GET /entities/organizations/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 when org found', async () => {
    mockGetOrgById.mockResolvedValueOnce(MOCK_ORG);
    const app = makeApp(makeDb());
    const res = await app.request('/entities/organizations/org_xyz');
    expect(res.status).toBe(200);
    const body = await res.json<{ data: { id: string } }>();
    expect(body.data.id).toBe('org_xyz');
  });

  it('returns 404 when org not found', async () => {
    mockGetOrgById.mockResolvedValueOnce(null);
    const app = makeApp(makeDb());
    const res = await app.request('/entities/organizations/org_missing');
    expect(res.status).toBe(404);
  });

  it('T3: getOrganizationById called with tenantId', async () => {
    mockGetOrgById.mockResolvedValueOnce(null);
    const app = makeApp(makeDb(), 'tnt_F');
    await app.request('/entities/organizations/org_xyz');
    expect(mockGetOrgById).toHaveBeenCalledWith(expect.anything(), 'tnt_F', expect.any(String));
  });
});
