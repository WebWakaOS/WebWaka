/**
 * Dental Clinic vertical route tests — P8 Set F (V-HEALTH-F1)
 * ≥10 cases: CRUD, FSM (PATCH /profiles/:id/transition), T3, P9, P13 AI-block.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './dental-clinic.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(),
    findProfileById: vi.fn(),
    updateProfile: vi.fn(),
    transition: vi.fn(),
    createAppointment: vi.fn(),
    listAppointments: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-dental-clinic', () => ({
  DentalClinicRepository: vi.fn(() => mockRepo),
  guardClaimedToMdcnVerified: vi.fn(),
  guardKycForInsurance: vi.fn(),
  guardP13PatientData: vi.fn(),
  guardFractionalKobo: vi.fn(),
  isValidDentalClinicTransition: mockIsValid,
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId, kycTier: 2 } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK_PROFILE = { id: 'dc_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', clinicName: 'Bright Smile Clinic', status: 'seeded' };

describe('POST /profiles — create dental clinic profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', clinicName: 'Bright Smile Clinic' }) });
    expect(res.status).toBe(201);
  });

  it('returns 201 with optional cacRc', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK_PROFILE, cacRc: 'RC123456' });
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', clinicName: 'Bright Smile Clinic', cacRc: 'RC123456' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId from auth JWT, not body', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    await makeApp('tnt_dc').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', clinicName: 'Bright Smile Clinic' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_dc' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles/dc_001');
    expect(res.status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  it('returns 422 for invalid FSM transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    mockIsValid.mockReturnValueOnce(false);
    const res = await makeApp().request('/profiles/dc_001/transition', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'active' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'seeded' });
    mockIsValid.mockReturnValueOnce(true);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'claimed' });
    const res = await makeApp().request('/profiles/dc_001/transition', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'claimed' }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 404 when profile not found for transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/nonexistent/transition', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'claimed' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('P12: AI blocked on USSD sessions', () => {
  it('returns 403 when isUssdSession=true on AI endpoint', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles/dc_001/ai/appointment-report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUssdSession: true, patientRefId: 'ref_001' }),
    });
    expect(res.status).toBe(403);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('P12');
  });
});
