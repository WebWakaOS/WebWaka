/**
 * Podcast Studio vertical route tests — P11
 * FSM: seeded → claimed → cac_verified → active → suspended
 * Guards: guardClaimedToCacVerified, guardL3HitlRequired, guardL2AiCapSponsorship, guardNoGuestSponsorInAi, guardFractionalKobo (all sync)
 * P13: guest_ref_id and sponsor_ref_id opaque
 * ≥10 cases: CRUD, FSM, episodes, sessions, AI.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './podcast-studio.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createEpisode: vi.fn(), createSession: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-podcast-studio', () => ({
  PodcastStudioRepository: vi.fn(() => mockRepo),
  isValidPodcastStudioTransition: vi.fn().mockReturnValue(true),
  guardClaimedToCacVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL3HitlRequired: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCapSponsorship: vi.fn().mockReturnValue({ allowed: true }),
  guardNoGuestSponsorInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'pod_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', studioName: 'Naija Podcasts Studio', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST /profiles — create podcast studio profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with profile on success', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', studioName: 'Naija Podcasts Studio' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.studioName).toBe('Naija Podcasts Studio');
  });

  it('T3: creates profile scoped to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_b', studioName: 'Lagos Audio Hub' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /profiles/:id — get podcast studio profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/pod_001');
    expect(res.status).toBe(200);
    const body = await res.json() as typeof MOCK;
    expect(body.id).toBe('pod_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/pod_999');
    expect(res.status).toBe(404);
  });

  it('T3: queries with tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_c').request('/profiles/pod_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('pod_001', 'tnt_c');
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions to claimed and calls updateStatus', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK).mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/pod_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('pod_001', 'tnt_a', 'claimed');
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/pod_999/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidPodcastStudioTransition } = await import('@webwaka/verticals-podcast-studio');
    vi.mocked(isValidPodcastStudioTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/pod_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });

  it('returns 403 if CAC guard fails on cac_verified', async () => {
    const { guardClaimedToCacVerified } = await import('@webwaka/verticals-podcast-studio');
    vi.mocked(guardClaimedToCacVerified).mockReturnValueOnce({ allowed: false, reason: 'CAC RC missing' });
    mockRepo.findProfileById.mockResolvedValueOnce(CLAIMED).mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/pod_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'cac_verified' }) });
    expect(res.status).toBe(403);
  });
});

describe('POST /shows/:showId/episodes — create episode', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with episode record', async () => {
    const episode = { id: 'ep_001', showId: 'show_001', episodeNumber: 1, durationMinutes: 45 };
    mockRepo.createEpisode.mockResolvedValueOnce(episode);
    const res = await makeApp().request('/shows/show_001/episodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ episodeNumber: 1, recordingDate: 1700000000, durationMinutes: 45, releaseDate: 1700086400 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof episode;
    expect(body.episodeNumber).toBe(1);
  });

  it('creates episode scoped to tenantId', async () => {
    const episode = { id: 'ep_002', showId: 'show_001', tenantId: 'tnt_a' };
    mockRepo.createEpisode.mockResolvedValueOnce(episode);
    await makeApp().request('/shows/show_001/episodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ episodeNumber: 2, recordingDate: 1700000000, durationMinutes: 30, releaseDate: 1700172800 }) });
    expect(mockRepo.createEpisode).toHaveBeenCalledWith(expect.objectContaining({ showId: 'show_001', tenantId: 'tnt_a' }));
  });
});

describe('POST /shows/:showId/sessions — create session', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with session record', async () => {
    const session = { id: 'ses_001', showId: 'show_001', guestRefId: 'ref_g001', sessionFeeKobo: 100000 };
    mockRepo.createSession.mockResolvedValueOnce(session);
    const res = await makeApp().request('/shows/show_001/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guestRefId: 'ref_g001', sessionDate: 1700000000, sessionFeeKobo: 100000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof session;
    expect(body.guestRefId).toBe('ref_g001');
  });

  it('returns 422 if fractional kobo guard fails', async () => {
    const { guardFractionalKobo } = await import('@webwaka/verticals-podcast-studio');
    vi.mocked(guardFractionalKobo).mockReturnValueOnce({ allowed: false, reason: 'P9 violation' });
    const res = await makeApp().request('/shows/show_001/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guestRefId: 'ref_g001', sessionDate: 1700000000, sessionFeeKobo: 0.5 }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /profiles/:id/ai/broadcast-schedule — L3 HITL AI', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns queued when L3 HITL approved', async () => {
    const res = await makeApp().request('/profiles/pod_001/ai/broadcast-schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hitlApproved: true }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('queued');
  });

  it('returns 403 if L3 HITL not approved', async () => {
    const { guardL3HitlRequired } = await import('@webwaka/verticals-podcast-studio');
    vi.mocked(guardL3HitlRequired).mockReturnValueOnce({ allowed: false, reason: 'L3 HITL approval required' });
    const res = await makeApp().request('/profiles/pod_001/ai/broadcast-schedule', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hitlApproved: false }) });
    expect(res.status).toBe(403);
  });
});
