/**
 * Road Transport Union (NURTW/NUC) vertical route tests — P9 Set D (V-TRN-EXT-D8)
 * ≥10 cases: CRUD, FSM, T3 isolation.
 * FSM: seeded → claimed → active ↔ suspended (no guards)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { roadTransportUnionRoutes } from './road-transport-union.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    create: vi.fn(), findByWorkspace: vi.fn(), findById: vi.fn(),
    update: vi.fn(), transition: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-road-transport-union', () => ({
  RtuRepository: vi.fn(() => mockRepo),
  isValidRtuTransition: mockIsValid,
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', roadTransportUnionRoutes);
  return w;
}

const MOCK = { id: 'rtu_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', unionName: 'Lagos NURTW Zone 4', memberCount: 250, status: 'seeded' };

describe('POST / — create RTU profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 201 for valid creation', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', union_name: 'Lagos NURTW Zone 4' }) });
    expect(res.status).toBe(201);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: tenantId from auth JWT, not body', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', union_name: 'Lagos NURTW Zone 4' }) });
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });

  it('includes optional member_count in creation', async () => {
    mockRepo.create.mockResolvedValueOnce({ ...MOCK, memberCount: 500 });
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', union_name: 'Lagos NURTW Zone 4', member_count: 500 }) });
    expect(res.status).toBe(201);
  });
});

describe('GET /workspace/:workspaceId', () => {
  it('returns 200 with union list', async () => {
    mockRepo.findByWorkspace.mockResolvedValueOnce([MOCK]);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
  });
});

describe('GET /:id', () => {
  it('returns 200 when found', async () => {
    mockRepo.findById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/rtu_001')).status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx')).status).toBe(404);
  });
});

describe('PATCH /:id', () => {
  it('returns 200 on update', async () => {
    mockRepo.update.mockResolvedValueOnce({ ...MOCK, memberCount: 300 });
    expect((await makeApp().request('/rtu_001', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member_count: 300 }) })).status).toBe(200);
  });

  it('returns 404 when profile not found on update', async () => {
    mockRepo.update.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ union_name: 'X' }) })).status).toBe(404);
  });
});

describe('POST /:id/transition — FSM', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when to state missing', async () => {
    const res = await makeApp().request('/rtu_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 422 for invalid FSM transition', async () => {
    mockRepo.findById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/rtu_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' }); mockIsValid.mockReturnValueOnce(true); mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/rtu_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});
