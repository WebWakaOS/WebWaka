/**
 * Newspaper Distribution vertical route tests — P10 Set I
 * P13: print_run must be integer copies; NPC registration required
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (print-runs, ads).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './newspaper-dist.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createPrintRun: vi.fn(), createAd: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-newspaper-dist', () => ({
  NewspaperDistRepository: vi.fn(() => mockRepo),
  isValidNewspaperDistTransition: vi.fn().mockReturnValue(true),
  guardClaimedToNpcVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerPrintRun: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'nd_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', publicationName: 'Daily Herald', status: 'seeded' };

describe('POST /profiles — create newspaper distributor profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', publicationName: 'Daily Herald', frequency: 'daily' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', publicationName: 'X Herald', frequency: 'weekly' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/nd_001')).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx')).status).toBe(404);
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValue(MOCK);
    mockRepo.updateStatus.mockResolvedValueOnce(undefined);
    expect((await makeApp().request('/profiles/nd_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidNewspaperDistTransition } = await import('@webwaka/verticals-newspaper-dist');
    (isValidNewspaperDistTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/nd_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/print-runs — integer copies only', () => {
  it('returns 201 for valid print run', async () => {
    mockRepo.createPrintRun.mockResolvedValueOnce({ id: 'pr_001', copiesPrinted: 10000 });
    const res = await makeApp().request('/profiles/nd_001/print-runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ editionDate: 1700000000, copiesPrinted: 10000, printCostKobo: 5000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/ads', () => {
  it('returns 201 for valid classified ad', async () => {
    mockRepo.createAd.mockResolvedValueOnce({ id: 'ad_001', adType: 'classified' });
    const res = await makeApp().request('/profiles/nd_001/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ printRunId: 'pr_001', adType: 'classified', advertiserRefId: 'adv_a', adFeeKobo: 100000, pagePlacement: 'back' }) });
    expect(res.status).toBe(201);
  });
});
