/**
 * Spare Parts vertical route tests — P11
 * FSM: seeded → claimed → son_verified → active (old-style, to_status body key)
 * ≥10 cases: CRUD, FSM, catalogue, mechanic credits, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { sparePartsRoutes } from './spare-parts.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createPart: vi.fn(), listParts: vi.fn(),
    createMechanicCredit: vi.fn(), listMechanicCredits: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-spare-parts', () => ({
  SparePartsRepository: vi.fn(() => mockRepo),
  isValidSparePartsTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToCacVerified: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', sparePartsRoutes);
  return w;
}

const MOCK = { id: 'sp_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', shopName: 'AutoParts Hub', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create spare parts profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with spare_parts key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', shop_name: 'AutoParts Hub' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { spare_parts: typeof MOCK };
    expect(body.spare_parts.shopName).toBe('AutoParts Hub');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shop_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', shop_name: 'Suya Parts Kano' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns spare_parts profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { spare_parts: typeof MOCK };
    expect(body.spare_parts.id).toBe('sp_001');
  });
});

describe('GET /:id — get spare parts profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/sp_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { spare_parts: typeof MOCK };
    expect(body.spare_parts.id).toBe('sp_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/sp_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/sp_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('sp_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/sp_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { spare_parts: typeof CLAIMED };
    expect(body.spare_parts.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/sp_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/sp_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidSparePartsTransition } = await import('@webwaka/verticals-spare-parts');
    vi.mocked(isValidSparePartsTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/sp_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/catalogue — add part to catalogue', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with catalogue item', async () => {
    const item = { id: 'cat_001', partName: 'Toyota Camry Brake Pad', priceKobo: 1200000 };
    mockRepo.createPart.mockResolvedValueOnce(item);
    const res = await makeApp().request('/sp_001/catalogue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ part_name: 'Toyota Camry Brake Pad', category: 'brakes', unit_price_kobo: 1200000, quantity_in_stock: 20 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { part: typeof item };
    expect(body.part.partName).toBe('Toyota Camry Brake Pad');
  });
});

describe('GET /:id/catalogue — list catalogue items', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of catalogue items', async () => {
    mockRepo.listParts.mockResolvedValueOnce([{ id: 'cat_001' }, { id: 'cat_002' }]);
    const res = await makeApp().request('/sp_001/catalogue');
    expect(res.status).toBe(200);
    const body = await res.json() as { parts: { id: string }[]; count: number };
    expect(body.parts).toHaveLength(2);
  });
});

describe('POST /:id/mechanic-credits — create mechanic credit account', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with mechanic credit account', async () => {
    const credit = { id: 'mc_001', profileId: 'sp_001', mechanicName: 'Emeka Auto', creditLimitKobo: 2000000000 };
    mockRepo.createMechanicCredit.mockResolvedValueOnce(credit);
    const res = await makeApp().request('/sp_001/mechanic-credits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mechanic_name: 'Emeka Auto', mechanic_phone: '08012345678', credit_limit_kobo: 2000000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { mechanic_credit: typeof credit };
    expect(body.mechanic_credit.mechanicName).toBe('Emeka Auto');
  });
});
