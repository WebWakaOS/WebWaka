/**
 * Constituency Office vertical route tests — P9 Set E (V-CIV-EXT-E9)
 * ≥10 cases: CRUD, FSM, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { constituencyOfficeRoutes } from './constituency-office.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    create: vi.fn(), findById: vi.fn(), update: vi.fn(), transition: vi.fn(),
    createProject: vi.fn(), listProjects: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-constituency-office', () => ({
  ConstituencyOfficeRepository: vi.fn(() => mockRepo),
  isValidConstituencyTransition: mockIsValid,
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', constituencyOfficeRoutes);
  return w;
}

const MOCK = { id: 'cof_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', legislatorName: 'Hon. Adamu Musa', status: 'seeded' };

describe('POST / — create constituency office profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 201 for valid creation', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', legislator_name: 'Hon. Adamu Musa' }) });
    expect(res.status).toBe(201);
  });

  it('returns 400 when legislator_name missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', legislator_name: 'Hon. Adamu Musa' }) });
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /:id', () => {
  it('returns 200 when found', async () => { mockRepo.findById.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/cof_001')).status).toBe(200); });
  it('returns 404 when not found', async () => { mockRepo.findById.mockResolvedValueOnce(null); expect((await makeApp().request('/nx')).status).toBe(404); });
});

describe('PATCH /:id', () => {
  it('returns 200 on update', async () => {
    mockRepo.update.mockResolvedValueOnce({ ...MOCK, legislatorName: 'Hon. Adamu Musa II' });
    expect((await makeApp().request('/cof_001', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ legislator_name: 'Hon. Adamu Musa II' }) })).status).toBe(200);
  });
  it('returns 404 when not found on update', async () => {
    mockRepo.update.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ legislator_name: 'X' }) })).status).toBe(404);
  });
});

describe('POST /:id/transition — FSM', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 422 for invalid transition', async () => {
    mockRepo.findById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/cof_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' }); mockIsValid.mockReturnValueOnce(true); mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/cof_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});
