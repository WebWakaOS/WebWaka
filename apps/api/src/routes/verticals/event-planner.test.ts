/**
 * Event Planner vertical route tests — P10 Set H
 * ≥10 cases: CRUD (health-style /profiles), FSM, T3 isolation, sub-resources.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './event-planner.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createEvent: vi.fn(), createVendor: vi.fn(), createTask: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-event-planner', () => ({
  EventPlannerRepository: vi.fn(() => mockRepo),
  isValidEventPlannerTransition: vi.fn().mockReturnValue(true),
  guardClaimedToLicenceVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardNoClientDataInAi: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'ep_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'Event Pro Ltd', status: 'seeded' };

describe('POST /profiles — create event planner profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', companyName: 'Event Pro Ltd' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', companyName: 'X Events' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/ep_001')).status).toBe(200);
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
    const res = await makeApp().request('/profiles/ep_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidEventPlannerTransition } = await import('@webwaka/verticals-event-planner');
    (isValidEventPlannerTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/ep_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/events', () => {
  it('returns 201 for valid event', async () => {
    mockRepo.createEvent.mockResolvedValueOnce({ id: 'ev_001', eventType: 'wedding', guestCount: 200 });
    const res = await makeApp().request('/profiles/ep_001/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientPhone: '08012345678', eventType: 'wedding', eventDate: 1700000000, guestCount: 200, totalBudgetKobo: 5000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/vendors', () => {
  it('returns 201 for valid vendor', async () => {
    mockRepo.createVendor.mockResolvedValueOnce({ id: 'vnd_001', vendorType: 'caterer' });
    const res = await makeApp().request('/profiles/ep_001/vendors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: 'ev_001', vendorType: 'caterer', vendorPhone: '08012345678', vendorName: 'Tasty Bites', agreedFeeKobo: 500000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/tasks', () => {
  it('returns 201 for valid task', async () => {
    mockRepo.createTask.mockResolvedValueOnce({ id: 'tsk_001', taskTitle: 'Book venue' });
    const res = await makeApp().request('/profiles/ep_001/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: 'ev_001', taskTitle: 'Book venue', dueDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});
