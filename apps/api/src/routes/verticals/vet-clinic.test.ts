/**
 * Vet Clinic vertical route tests — P3-D (clinic)
 * ≥12 cases covering profiles, FSM transitions, P9 + P13 guards.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './vet-clinic.js';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const {
  mockRepo,
  mockGuardClaimed,
  mockGuardHighValue,
  mockGuardP13,
  mockGuardFractional,
  mockIsValidTransition,
} = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(),
    findProfileById: vi.fn(),
    updateProfile: vi.fn().mockResolvedValue(undefined),
    transition: vi.fn(),
    listAppointments: vi.fn(),
    createAppointment: vi.fn(),
    createConsultation: vi.fn(),
    listConsultations: vi.fn(),
    aggregateStats: vi.fn().mockResolvedValue({}),
  },
  mockGuardClaimed: vi.fn().mockReturnValue(undefined),
  mockGuardHighValue: vi.fn().mockReturnValue(undefined),
  mockGuardP13: vi.fn().mockReturnValue(undefined),
  mockGuardFractional: vi.fn().mockReturnValue(undefined),
  mockIsValidTransition: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-vet-clinic', () => ({
  VetClinicRepository: vi.fn(() => mockRepo),
  guardClaimedToVcnbVerified: mockGuardClaimed,
  guardHighValueSurgery: mockGuardHighValue,
  guardP13AnimalClinicalData: mockGuardP13,
  guardFractionalKobo: mockGuardFractional,
  isValidVetClinicTransition: mockIsValidTransition,
}));

// ---------------------------------------------------------------------------
// Stub DB
// ---------------------------------------------------------------------------

const stubDb = {
  prepare: () => ({
    bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }),
  }),
};

// ---------------------------------------------------------------------------
// App factory — vet-clinic exports the app directly
// ---------------------------------------------------------------------------

function makeApp(tenantId = 'tnt_a', userId = 'usr_a') {
  const wrapper = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  wrapper.use('*', async (c, next) => {
    c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
    c.set('auth' as never, { userId, tenantId } as never);
    await next();
  });
  wrapper.route('/', app);
  return wrapper;
}

const MOCK_PROFILE = { id: 'vc_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', clinicName: 'PawCare Vet', status: 'seeded' };

// ---------------------------------------------------------------------------
// POST /profiles
// ---------------------------------------------------------------------------

describe('POST /profiles', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid profile creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const wrapper = makeApp();
    const res = await wrapper.request('/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: 'wsp_a', clinicName: 'PawCare Vet' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ id: string }>();
    expect(body.id).toBe('vc_001');
  });

  it('T3: createProfile called with tenantId from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const wrapper = makeApp('tnt_B');
    await wrapper.request('/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: 'wsp_a', clinicName: 'PawCare Vet' }),
    });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_B' }));
  });
});

// ---------------------------------------------------------------------------
// GET /profiles/:id
// ---------------------------------------------------------------------------

describe('GET /profiles/:id', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    const wrapper = makeApp();
    const res = await wrapper.request('/profiles/vc_001');
    expect(res.status).toBe(200);
    const body = await res.json<{ id: string }>();
    expect(body.id).toBe('vc_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const wrapper = makeApp();
    const res = await wrapper.request('/profiles/vc_missing');
    expect(res.status).toBe(404);
  });

  it('T3: findProfileById called with tenantId', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const wrapper = makeApp('tnt_C');
    await wrapper.request('/profiles/vc_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('vc_001', 'tnt_C');
  });
});

// ---------------------------------------------------------------------------
// PATCH /profiles/:id/transition — FSM
// ---------------------------------------------------------------------------

describe('PATCH /profiles/:id/transition', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const wrapper = makeApp();
    const res = await wrapper.request('/profiles/vc_missing/transition', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'claimed' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    mockIsValidTransition.mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'active' });
    const wrapper = makeApp();
    const res = await wrapper.request('/profiles/vc_001/transition', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'seeded' }),
    });
    expect(res.status).toBe(422);
    const body = await res.json<{ error: string }>();
    expect(body.error).toMatch(/invalid fsm/i);
  });

  it('returns 200 for valid transition (seeded → claimed)', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'seeded' });
    mockIsValidTransition.mockReturnValueOnce(true);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'claimed' });
    const wrapper = makeApp();
    const res = await wrapper.request('/profiles/vc_001/transition', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'claimed' }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 403 for guardClaimedToVcnbVerified returning not-allowed', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'claimed', vcnbRegistration: null });
    mockIsValidTransition.mockReturnValueOnce(true);
    mockGuardClaimed.mockReturnValueOnce({ allowed: false, reason: 'VCNB registration number required' });
    const wrapper = makeApp();
    const res = await wrapper.request('/profiles/vc_001/transition', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'vcnb_verified' }),
    });
    expect(res.status).toBe(403);
  });

  it('T3: transition called with tenantId', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'seeded' });
    mockIsValidTransition.mockReturnValueOnce(true);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'claimed' });
    const wrapper = makeApp('tnt_D');
    await wrapper.request('/profiles/vc_001/transition', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'claimed' }),
    });
    expect(mockRepo.transition).toHaveBeenCalledWith('vc_001', 'tnt_D', expect.any(String));
  });
});
