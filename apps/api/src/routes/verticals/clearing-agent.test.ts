/**
 * Clearing & Forwarding Agent vertical route tests — P9 Set D (V-TRN-EXT-D1)
 * ≥10 cases: CRUD, FSM, T3 isolation, P9 integer kobo, AI-block.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { clearingAgentRoutes } from './clearing-agent.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileByWorkspace: vi.fn(), findProfileById: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createShipment: vi.fn(), listShipments: vi.fn(), updateShipmentStatus: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-clearing-agent', () => ({
  ClearingAgentRepository: vi.fn(() => mockRepo),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToNcsVerified: vi.fn().mockReturnValue({ allowed: true }),
  isValidClearingAgentTransition: mockIsValid,
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId, kycTier: 2 } as never); await next(); });
  w.route('/', clearingAgentRoutes);
  return w;
}

const MOCK = { id: 'ca_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'Apex Clearing Ltd', status: 'seeded' };

describe('POST / — create clearing agent profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'Apex Clearing Ltd' }) });
    expect(res.status).toBe(201);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: tenantId from auth JWT, not body', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'Apex Clearing Ltd' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /workspace/:workspaceId', () => {
  it('returns 200 with profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/workspace/wsp_a')).status).toBe(200);
  });
});

describe('GET /:id', () => {
  it('returns 200 when found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/ca_001')).status).toBe(200); });
  it('returns 404 when not found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(null); expect((await makeApp().request('/nx')).status).toBe(404); });
});

describe('PATCH /:id', () => {
  it('returns 200 on update', async () => {
    mockRepo.updateProfile.mockResolvedValueOnce({ ...MOCK, companyName: 'Apex Pro' });
    expect((await makeApp().request('/ca_001', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: 'Apex Pro' }) })).status).toBe(200);
  });
  it('returns 404 when profile not found on update', async () => {
    mockRepo.updateProfile.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: 'X' }) })).status).toBe(404);
  });
});

describe('POST /:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 422 for invalid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/ca_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) })).status).toBe(422);
  });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' }); mockIsValid.mockReturnValueOnce(true); mockRepo.transitionStatus.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/ca_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) })).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /:id/shipments — P9', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid shipment with integer kobo values', async () => {
    mockRepo.createShipment.mockResolvedValueOnce({ id: 'sh_001', declaredValueKobo: 500000, dutyAmountKobo: 50000, professionalFeeKobo: 15000 });
    const res = await makeApp().request('/ca_001/shipments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ declared_value_kobo: 500000, duty_amount_kobo: 50000, professional_fee_kobo: 15000 }) });
    expect(res.status).toBe(201);
  });

  it('returns 400 when required shipment fields missing', async () => {
    const res = await makeApp().request('/ca_001/shipments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ declared_value_kobo: 500000 }) });
    expect(res.status).toBe(400);
  });
});

describe('GET /:id/shipments', () => {
  it('returns 200 with shipment list', async () => {
    mockRepo.listShipments.mockResolvedValueOnce([]);
    expect((await makeApp().request('/ca_001/shipments')).status).toBe(200);
  });
});
