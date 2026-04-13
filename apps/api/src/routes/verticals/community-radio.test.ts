/**
 * Community Radio / TV Station vertical route tests — P10 Set I
 * FSM: seeded → claimed → nbc_licensed → active
 * ≥10 cases: CRUD, FSM, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './community-radio.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-community-radio', () => ({
  CommunityRadioRepository: vi.fn(() => mockRepo),
  isValidCommunityRadioTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'cr_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', displayName: 'Voice FM', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };
const NBC = { ...MOCK, status: 'nbc_licensed' };

describe('POST /profiles — create community radio profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', displayName: 'Voice FM' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', displayName: 'X Radio' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/cr_001')).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx')).status).toBe(404);
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 for seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValue(MOCK);
    mockRepo.updateStatus.mockResolvedValueOnce(undefined);
    mockRepo.findProfileById.mockResolvedValueOnce(CLAIMED);
    expect((await makeApp().request('/profiles/cr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 200 for claimed→nbc_licensed transition', async () => {
    mockRepo.findProfileById.mockResolvedValue(CLAIMED);
    mockRepo.updateStatus.mockResolvedValueOnce(undefined);
    mockRepo.findProfileById.mockResolvedValueOnce(NBC);
    expect((await makeApp().request('/profiles/cr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'nbc_licensed' }) })).status).toBe(200);
  });

  it('returns 200 for nbc_licensed→active transition', async () => {
    mockRepo.findProfileById.mockResolvedValue(NBC);
    mockRepo.updateStatus.mockResolvedValueOnce(undefined);
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK, status: 'active' });
    expect((await makeApp().request('/profiles/cr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidCommunityRadioTransition } = await import('@webwaka/verticals-community-radio');
    (isValidCommunityRadioTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/cr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });

  it('T3: transition scoped to tenantId', async () => {
    mockRepo.findProfileById.mockResolvedValue(MOCK);
    mockRepo.updateStatus.mockResolvedValueOnce(undefined);
    mockRepo.findProfileById.mockResolvedValueOnce(CLAIMED);
    await makeApp('tnt_b').request('/profiles/cr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('cr_001', 'tnt_b');
  });
});
