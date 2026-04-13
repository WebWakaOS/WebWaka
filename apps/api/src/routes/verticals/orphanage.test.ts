/**
 * Orphanage vertical route tests — P11
 * FSM: seeded → claimed → mossw_verified → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, intake, donations, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { orphanageRoutes } from './orphanage.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    recordIntake: vi.fn(),
    recordDonation: vi.fn(), listDonations: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-orphanage', () => ({
  OrphanageRepository: vi.fn(() => mockRepo),
  isValidOrphanageTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', orphanageRoutes);
  return w;
}

const MOCK = { id: 'or_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', facilityName: 'Grace Children Home', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create orphanage profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with orphanage key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', facility_name: 'Grace Children Home' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { orphanage: typeof MOCK };
    expect(body.orphanage.facilityName).toBe('Grace Children Home');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', facility_name: 'Hope House Abuja' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns orphanage profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { orphanage: typeof MOCK };
    expect(body.orphanage.id).toBe('or_001');
  });
});

describe('GET /:id — get orphanage profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/or_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { orphanage: typeof MOCK };
    expect(body.orphanage.id).toBe('or_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/or_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/or_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('or_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/or_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { orphanage: typeof CLAIMED };
    expect(body.orphanage.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidOrphanageTransition } = await import('@webwaka/verticals-orphanage');
    vi.mocked(isValidOrphanageTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/or_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/or_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidOrphanageTransition } = await import('@webwaka/verticals-orphanage');
    vi.mocked(isValidOrphanageTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/or_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/intake — create child intake', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with intake record', async () => {
    const intake = { id: 'int_001', profileId: 'or_001', ageBracket: '5-10', genderCode: 'M', intakeDate: 1700000000 };
    mockRepo.recordIntake.mockResolvedValueOnce(intake);
    const res = await makeApp().request('/or_001/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ age_bracket: '5-10', gender_code: 'M', intake_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { intake: typeof intake };
    expect(body.intake.ageBracket).toBe('5-10');
  });

  it('returns 422 if child_ref_id present (P13 compliance)', async () => {
    const res = await makeApp().request('/or_001/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ child_ref_id: 'ch_001', age_bracket: '5-10', gender_code: 'M', intake_date: 1700000000 }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/donations — record donation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with donation record', async () => {
    const donation = { id: 'don_001', profileId: 'or_001', donationType: 'cash', amountKobo: 200000 };
    mockRepo.recordDonation.mockResolvedValueOnce(donation);
    const res = await makeApp().request('/or_001/donations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ donor_ref_id: 'ref_d001', donation_type: 'cash', amount_kobo: 200000, donation_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { donation: typeof donation };
    expect(body.donation.donationType).toBe('cash');
  });
});

describe('GET /:id/donations — list donations', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of donations', async () => {
    mockRepo.listDonations.mockResolvedValueOnce([{ id: 'don_001' }, { id: 'don_002' }]);
    const res = await makeApp().request('/or_001/donations');
    expect(res.status).toBe(200);
    const body = await res.json() as { donations: { id: string }[]; count: number };
    expect(body.donations).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});
