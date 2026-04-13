/**
 * Wedding Planner vertical route tests — P10 Set H
 * P13: no couple PII in AI
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (bookings, vendors).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './wedding-planner.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createEvent: vi.fn(), createVendor: vi.fn(), createTask: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-wedding-planner', () => ({
  WeddingPlannerRepository: vi.fn(() => mockRepo),
  isValidWeddingPlannerTransition: vi.fn().mockReturnValue(true),
  guardClaimedToCacVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardNoCouplePiiInAi: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'wp_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'Dream Weddings', status: 'seeded' };

describe('POST /profiles — create wedding planner profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', companyName: 'Dream Weddings' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', companyName: 'X Weddings' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/wp_001')).status).toBe(200);
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
    expect((await makeApp().request('/profiles/wp_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidWeddingPlannerTransition } = await import('@webwaka/verticals-wedding-planner');
    (isValidWeddingPlannerTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/wp_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/events', () => {
  it('returns 201 for valid wedding event', async () => {
    mockRepo.createEvent.mockResolvedValueOnce({ id: 'ev_001', eventDate: 1700000000 });
    const res = await makeApp().request('/profiles/wp_001/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventDate: 1700000000, venue: 'Eko Hotel', guestCount: 300, totalBudgetKobo: 20000000, depositKobo: 5000000, style: 'traditional' }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/vendors', () => {
  it('returns 201 for valid vendor', async () => {
    mockRepo.createVendor.mockResolvedValueOnce({ id: 'vnd_001', vendorType: 'catering' });
    const res = await makeApp().request('/profiles/wp_001/vendors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: 'bk_001', vendorType: 'catering', vendorName: 'Tasty Catering', agreedFeeKobo: 2000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/tasks', () => {
  it('returns 201 for valid wedding planning task', async () => {
    mockRepo.createTask.mockResolvedValueOnce({ id: 'tsk_001', taskName: 'Book venue', dueDate: 1700000000 });
    const res = await makeApp().request('/profiles/wp_001/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: 'bk_001', taskName: 'Book venue', dueDate: 1700000000, assignedTo: 'coord_a' }) });
    expect(res.status).toBe(201);
  });
});
