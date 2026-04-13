/**
 * Sole Trader vertical route tests — P10 Set I
 * FSM: seeded → claimed → active
 * P13: no personal ID in AI
 * ≥10 cases: CRUD, FSM, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './sole-trader.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    create: vi.fn(), findById: vi.fn(), transition: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-sole-trader', () => ({
  SoleTraderRepository: vi.fn(() => mockRepo),
  isValidSoleTraderTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'st_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', individualId: 'ind_a', tradeType: 'plumber', status: 'seeded' };

describe('POST /profiles — create sole trader profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', individualId: 'ind_a', tradeType: 'plumber', lga: 'Eti-Osa', state: 'Lagos' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', individualId: 'ind_b', tradeType: 'electrician' }) });
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/st_001')).status).toBe(200);
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
    expect((await makeApp().request('/profiles/st_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 200 for claimed→active transition', async () => {
    mockRepo.findById.mockResolvedValue({ ...MOCK, status: 'claimed' });
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'active' });
    expect((await makeApp().request('/profiles/st_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidSoleTraderTransition } = await import('@webwaka/verticals-sole-trader');
    (isValidSoleTraderTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/st_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });

  it('T3: transition scoped to tenantId', async () => {
    mockRepo.findById.mockResolvedValue(MOCK);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    await makeApp('tnt_b').request('/profiles/st_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(mockRepo.findById).toHaveBeenCalledWith('st_001', 'tnt_b');
  });

  it('transition calls repo.transition with correct args', async () => {
    mockRepo.findById.mockResolvedValue(MOCK);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    await makeApp('tnt_a').request('/profiles/st_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(mockRepo.transition).toHaveBeenCalledWith('st_001', 'tnt_a', 'claimed');
  });
});
