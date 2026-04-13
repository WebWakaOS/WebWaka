/**
 * Ministry / Mission vertical route tests — P11
 * FSM: seeded → claimed → cac_registered → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, events, donations, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { ministryMissionRoutes } from './ministry-mission.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createEvent: vi.fn(), listEvents: vi.fn(),
    recordDonation: vi.fn(), listDonations: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-ministry-mission', () => ({
  MinistryMissionRepository: vi.fn(() => mockRepo),
  isValidMinistryMissionTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', ministryMissionRoutes);
  return w;
}

const MOCK = { id: 'mm_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', ministryName: 'Living Word Mission', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create ministry profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with ministry_mission key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', ministry_name: 'Living Word Mission' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { ministry_mission: typeof MOCK };
    expect(body.ministry_mission.ministryName).toBe('Living Word Mission');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', ministry_name: 'Grace Church Abuja' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns ministry_mission profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { ministry_mission: typeof MOCK };
    expect(body.ministry_mission.id).toBe('mm_001');
  });
});

describe('GET /:id — get ministry profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/mm_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { ministry_mission: typeof MOCK };
    expect(body.ministry_mission.id).toBe('mm_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/mm_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/mm_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('mm_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/mm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { ministry_mission: typeof CLAIMED };
    expect(body.ministry_mission.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidMinistryMissionTransition } = await import('@webwaka/verticals-ministry-mission');
    vi.mocked(isValidMinistryMissionTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/mm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/mm_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidMinistryMissionTransition } = await import('@webwaka/verticals-ministry-mission');
    vi.mocked(isValidMinistryMissionTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/mm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/events — create ministry event', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with event record', async () => {
    const event = { id: 'ev_001', profileId: 'mm_001', eventName: 'Annual Crusade 2024', expectedAttendance: 10000 };
    mockRepo.createEvent.mockResolvedValueOnce(event);
    const res = await makeApp().request('/mm_001/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event_name: 'Annual Crusade 2024', event_date: 1700000000, venue: 'Tafawa Balewa Square', expected_attendance: 10000, budget_kobo: 5000000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { event: typeof event };
    expect(body.event.eventName).toBe('Annual Crusade 2024');
  });
});

describe('GET /:id/events — list events', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of events', async () => {
    mockRepo.listEvents.mockResolvedValueOnce([{ id: 'ev_001' }, { id: 'ev_002' }]);
    const res = await makeApp().request('/mm_001/events');
    expect(res.status).toBe(200);
    const body = await res.json() as { events: { id: string }[]; count: number };
    expect(body.events).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/donations — record donation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with donation record', async () => {
    const donation = { id: 'don_001', profileId: 'mm_001', donationType: 'tithe', amountKobo: 100000000 };
    mockRepo.recordDonation.mockResolvedValueOnce(donation);
    const res = await makeApp().request('/mm_001/donations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ donation_type: 'tithe', amount_kobo: 100000000, donation_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { donation: typeof donation };
    expect(body.donation.amountKobo).toBe(100000000);
  });
});
