/**
 * Recording Label vertical route tests — P10 Set H
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (artists, deals, royalties).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './recording-label.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createArtiste: vi.fn(), createRelease: vi.fn(), createRoyaltyDistribution: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-recording-label', () => ({
  RecordingLabelRepository: vi.fn(() => mockRepo),
  isValidRecordingLabelTransition: vi.fn().mockReturnValue(true),
  guardClaimedToCosonRegistered: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardNoRoyaltyDataInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerBps: vi.fn().mockReturnValue({ allowed: true }),
  guardRoyaltyArithmetic: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'rl_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', labelName: 'AfroBeats Records', status: 'seeded' };

describe('POST /profiles — create recording label profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', labelName: 'AfroBeats Records' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', labelName: 'X Records' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/rl_001')).status).toBe(200);
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
    expect((await makeApp().request('/profiles/rl_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidRecordingLabelTransition } = await import('@webwaka/verticals-recording-label');
    (isValidRecordingLabelTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/rl_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/artistes', () => {
  it('returns 201 for valid artiste signing', async () => {
    mockRepo.createArtiste.mockResolvedValueOnce({ id: 'art_001', artisteRefId: 'art_a' });
    const res = await makeApp().request('/profiles/rl_001/artistes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ artisteRefId: 'art_a', royaltySplitBps: 1500, contractStart: 1700000000, contractEnd: 1731536000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/royalty-distributions', () => {
  it('returns 201 for valid royalty distribution', async () => {
    mockRepo.createRoyaltyDistribution.mockResolvedValueOnce({ id: 'roy_001', artisteShareKobo: 250000 });
    const res = await makeApp().request('/profiles/rl_001/royalty-distributions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ artisteRefId: 'art_a', period: '2024-Q1', grossKobo: 500000, artisteShareKobo: 250000, labelShareKobo: 250000, distributedDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/releases', () => {
  it('returns 201 for valid release record', async () => {
    mockRepo.createRelease.mockResolvedValueOnce({ id: 'rel_001', releaseTitle: 'Afrobeats Vol 1', releaseType: 'album' });
    const res = await makeApp().request('/profiles/rl_001/releases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ artisteRefId: 'art_a', releaseTitle: 'Afrobeats Vol 1', releaseType: 'album', releaseDate: 1700000000, streamingLinks: [] }) });
    expect(res.status).toBe(201);
  });
});
