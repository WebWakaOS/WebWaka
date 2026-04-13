/**
 * Tech Hub vertical route tests — P10 Set I
 * FSM: seeded → claimed → active
 * P13: no member PII in AI
 * ≥10 cases: CRUD, FSM, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './tech-hub.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    create: vi.fn(), findById: vi.fn(), transition: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-tech-hub', () => ({
  TechHubRepository: vi.fn(() => mockRepo),
  isValidTechHubTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'th_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', hubName: 'Lagos Tech Hub', status: 'seeded' };

describe('POST /profiles — create tech hub profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', hubName: 'Lagos Tech Hub', lga: 'Yaba', state: 'Lagos', deskCount: 50 }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', hubName: 'X Hub' }) });
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/th_001')).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx')).status).toBe(404);
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findById.mockResolvedValue(MOCK);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/profiles/th_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 200 for claimed→active transition', async () => {
    mockRepo.findById.mockResolvedValue({ ...MOCK, status: 'claimed' });
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'active' });
    expect((await makeApp().request('/profiles/th_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidTechHubTransition } = await import('@webwaka/verticals-tech-hub');
    (isValidTechHubTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/th_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });

  it('T3: transition scoped to tenantId', async () => {
    mockRepo.findById.mockResolvedValue(MOCK);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    await makeApp('tnt_b').request('/profiles/th_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(mockRepo.findById).toHaveBeenCalledWith('th_001', 'tnt_b');
  });

  it('transition calls repo.transition with correct args', async () => {
    mockRepo.findById.mockResolvedValue(MOCK);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    await makeApp('tnt_a').request('/profiles/th_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(mockRepo.transition).toHaveBeenCalledWith('th_001', 'tnt_a', 'claimed');
  });
});
