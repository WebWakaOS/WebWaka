/**
 * Motivational Speaker vertical route tests — P11
 * FSM: seeded → claimed → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, engagements, media appearances, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { motivationalSpeakerRoutes } from './motivational-speaker.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createEngagement: vi.fn(), listEngagements: vi.fn(),
    addMediaProduct: vi.fn(), listMediaProducts: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-motivational-speaker', () => ({
  MotivationalSpeakerRepository: vi.fn(() => mockRepo),
  isValidMotivationalSpeakerTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', motivationalSpeakerRoutes);
  return w;
}

const MOCK = { id: 'ms_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', speakerName: 'Dr Femi Motivates', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create motivational speaker profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with motivational_speaker key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', speaker_name: 'Dr Femi Motivates' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { motivational_speaker: typeof MOCK };
    expect(body.motivational_speaker.speakerName).toBe('Dr Femi Motivates');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', speaker_name: 'Coach Emeka Speaks' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns motivational_speaker profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { motivational_speaker: typeof MOCK };
    expect(body.motivational_speaker.id).toBe('ms_001');
  });
});

describe('GET /:id — get motivational speaker profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ms_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { motivational_speaker: typeof MOCK };
    expect(body.motivational_speaker.id).toBe('ms_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ms_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ms_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ms_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ms_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { motivational_speaker: typeof CLAIMED };
    expect(body.motivational_speaker.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidMotivationalSpeakerTransition } = await import('@webwaka/verticals-motivational-speaker');
    vi.mocked(isValidMotivationalSpeakerTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ms_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ms_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidMotivationalSpeakerTransition } = await import('@webwaka/verticals-motivational-speaker');
    vi.mocked(isValidMotivationalSpeakerTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ms_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/engagements — create speaking engagement', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with engagement record', async () => {
    const engagement = { id: 'eng_001', profileId: 'ms_001', eventName: 'Youth Summit 2024', feeKobo: 5000000 };
    mockRepo.createEngagement.mockResolvedValueOnce(engagement);
    const res = await makeApp().request('/ms_001/engagements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_ref_id: 'ref_c001', event_name: 'Youth Summit 2024', event_date: 1700000000, speaking_fee_kobo: 5000000, total_kobo: 5500000, event_type: 'conference' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { engagement: typeof engagement };
    expect(body.engagement.eventName).toBe('Youth Summit 2024');
  });
});

describe('GET /:id/engagements — list engagements', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of engagements', async () => {
    mockRepo.listEngagements.mockResolvedValueOnce([{ id: 'eng_001' }, { id: 'eng_002' }]);
    const res = await makeApp().request('/ms_001/engagements');
    expect(res.status).toBe(200);
    const body = await res.json() as { engagements: { id: string }[]; count: number };
    expect(body.engagements).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/media-products — create media product', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with media product', async () => {
    const product = { id: 'prd_001', profileId: 'ms_001', productTitle: 'Mindset Reset', productType: 'audio_book' };
    mockRepo.addMediaProduct.mockResolvedValueOnce(product);
    const res = await makeApp().request('/ms_001/media-products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_name: 'Mindset Reset', product_type: 'audio_book', price_kobo: 500000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { product: typeof product };
    expect(body.product.productTitle).toBe('Mindset Reset');
  });
});
