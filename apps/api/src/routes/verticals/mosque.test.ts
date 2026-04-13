/**
 * Mosque vertical route tests — P9 Set E (V-CIV-EXT-E1)
 * ≥10 cases: CRUD, FSM, T3 isolation, donations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { mosqueRoutes } from './mosque.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    create: vi.fn(), findByWorkspace: vi.fn(), findById: vi.fn(),
    update: vi.fn(), transition: vi.fn(),
    createDonation: vi.fn(), findDonationsByProfile: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-mosque', () => ({
  MosqueRepository: vi.fn(() => mockRepo),
  isValidMosqueTransition: mockIsValid,
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', mosqueRoutes);
  return w;
}

const MOCK = { id: 'msq_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', mosqueName: 'Jama Masjid Lagos', status: 'seeded' };

describe('POST / — create mosque profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', mosque_name: 'Jama Masjid Lagos' }) });
    expect(res.status).toBe(201);
  });

  it('returns 400 when mosque_name is missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: tenantId injected from auth, not body', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', mosque_name: 'Test Masjid' }) });
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /workspace/:workspaceId', () => {
  it('returns 200 with mosque list', async () => {
    mockRepo.findByWorkspace.mockResolvedValueOnce([MOCK]);
    expect((await makeApp().request('/workspace/wsp_a')).status).toBe(200);
  });
});

describe('GET /:id', () => {
  it('returns 200 when found', async () => { mockRepo.findById.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/msq_001')).status).toBe(200); });
  it('returns 404 when not found', async () => { mockRepo.findById.mockResolvedValueOnce(null); expect((await makeApp().request('/nx')).status).toBe(404); });
});

describe('PATCH /:id', () => {
  it('returns 200 on update', async () => {
    mockRepo.update.mockResolvedValueOnce({ ...MOCK, mosqueName: 'Updated Masjid' });
    expect((await makeApp().request('/msq_001', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mosque_name: 'Updated Masjid' }) })).status).toBe(200);
  });
  it('returns 404 on update when not found', async () => {
    mockRepo.update.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mosque_name: 'X' }) })).status).toBe(404);
  });
});

describe('POST /:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 422 for invalid FSM transition', async () => {
    mockRepo.findById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/msq_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' }); mockIsValid.mockReturnValueOnce(true); mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/msq_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /:id/donations', () => {
  it('returns 201 for valid donation', async () => {
    mockRepo.createDonation.mockResolvedValueOnce({ id: 'don_001', amountKobo: 100000 });
    expect((await makeApp().request('/msq_001/donations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount_kobo: 100000, donation_date: 1700000000 }) })).status).toBe(201);
  });
});

describe('GET /:id/donations', () => {
  it('returns 200 with donation list', async () => {
    mockRepo.findDonationsByProfile.mockResolvedValueOnce([]);
    expect((await makeApp().request('/msq_001/donations')).status).toBe(200);
  });
});
