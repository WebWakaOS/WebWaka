/**
 * Music Studio vertical route tests — P10 Set H
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (sessions, royalties).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './music-studio.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createSession: vi.fn(), createBeat: vi.fn(), createEquipment: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-music-studio', () => ({
  MusicStudioRepository: vi.fn(() => mockRepo),
  isValidMusicStudioTransition: vi.fn().mockReturnValue(true),
  guardClaimedToCosonRegistered: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardNoRoyaltyDataInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerHours: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerBpm: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'ms_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', studioName: 'Sound Forge', status: 'seeded' };

describe('POST /profiles — create music studio profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', studioName: 'Sound Forge', studioType: 'recording' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', studioName: 'X Studio', studioType: 'recording' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/ms_001')).status).toBe(200);
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
    expect((await makeApp().request('/profiles/ms_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidMusicStudioTransition } = await import('@webwaka/verticals-music-studio');
    (isValidMusicStudioTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/ms_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/sessions', () => {
  it('returns 201 for valid session booking', async () => {
    mockRepo.createSession.mockResolvedValueOnce({ id: 'sess_001', rateKoboPerHour: 50000 });
    const res = await makeApp().request('/profiles/ms_001/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ artistRefId: 'art_a', sessionType: 'recording', bookedHours: 4, rateKoboPerHour: 50000, sessionDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/beats', () => {
  it('returns 201 for valid beat upload', async () => {
    mockRepo.createBeat.mockResolvedValueOnce({ id: 'beat_001', beatName: 'Afrobeats' });
    const res = await makeApp().request('/profiles/ms_001/beats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ beatName: 'Afrobeats', producerRefId: 'prod_a', genre: 'afrobeats', bpm: 120, licenseType: 'non-exclusive', licenseFeeKobo: 50000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/equipment', () => {
  it('returns 201 for valid equipment record', async () => {
    mockRepo.createEquipment.mockResolvedValueOnce({ id: 'eq_001', equipmentName: 'SSL 4000', category: 'mixing_console' });
    const res = await makeApp().request('/profiles/ms_001/equipment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ equipmentName: 'SSL 4000', category: 'mixing_console', purchaseCostKobo: 5000000, purchaseDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});
