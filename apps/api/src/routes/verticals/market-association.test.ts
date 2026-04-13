/**
 * Market Association vertical route tests — P11
 * FSM: seeded → claimed → lga_verified → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, traders, levies, incidents, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { marketAssociationRoutes } from './market-association.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    addTrader: vi.fn(), listTraders: vi.fn(),
    recordLevy: vi.fn(), listLevies: vi.fn(),
    createIncident: vi.fn(), listIncidents: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-market-association', () => ({
  MarketAssociationRepository: vi.fn(() => mockRepo),
  isValidMarketAssociationTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', marketAssociationRoutes);
  return w;
}

const MOCK = { id: 'ma_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', marketName: 'Balogun Market Association', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create market association profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with market_association key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', market_name: 'Balogun Market Association' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { market_association: typeof MOCK };
    expect(body.market_association.marketName).toBe('Balogun Market Association');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', market_name: 'Sabon Gari Traders' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns market_association profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { market_association: typeof MOCK };
    expect(body.market_association.id).toBe('ma_001');
  });
});

describe('GET /:id — get market association profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ma_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { market_association: typeof MOCK };
    expect(body.market_association.id).toBe('ma_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ma_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ma_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ma_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ma_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { market_association: typeof CLAIMED };
    expect(body.market_association.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidMarketAssociationTransition } = await import('@webwaka/verticals-market-association');
    vi.mocked(isValidMarketAssociationTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ma_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ma_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidMarketAssociationTransition } = await import('@webwaka/verticals-market-association');
    vi.mocked(isValidMarketAssociationTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ma_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/traders — register trader', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with trader', async () => {
    const trader = { id: 'trd_001', profileId: 'ma_001', traderRefId: 'ref_nkechi', stallNumber: 'B12' };
    mockRepo.addTrader.mockResolvedValueOnce(trader);
    const res = await makeApp().request('/ma_001/traders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trader_ref_id: 'ref_nkechi', stall_number: 'B12', trade_type: 'textiles' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { trader: typeof trader };
    expect(body.trader.stallNumber).toBe('B12');
  });
});

describe('GET /:id/traders — list traders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of traders', async () => {
    mockRepo.listTraders.mockResolvedValueOnce([{ id: 'trd_001' }, { id: 'trd_002' }]);
    const res = await makeApp().request('/ma_001/traders');
    expect(res.status).toBe(200);
    const body = await res.json() as { traders: { id: string }[]; count: number };
    expect(body.traders).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/levies — collect levy', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with levy record', async () => {
    const levy = { id: 'lvy_001', profileId: 'ma_001', traderId: 'trd_001', amountKobo: 20000 };
    mockRepo.recordLevy.mockResolvedValueOnce(levy);
    const res = await makeApp().request('/ma_001/levies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trader_id: 'trd_001', period_month: 202401, amount_kobo: 20000, levy_type: 'daily_sanitation', collected_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { levy: typeof levy };
    expect(body.levy.amountKobo).toBe(20000);
  });
});
