/**
 * Printing Press vertical route tests — P11
 * FSM: seeded → claimed → son_verified → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, jobs, inventory, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { printingPressRoutes } from './printing-press.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createJob: vi.fn(), listJobs: vi.fn(),
    addInventory: vi.fn(), listInventory: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-printing-press', () => ({
  PrintingPressRepository: vi.fn(() => mockRepo),
  isValidPrintingPressTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', printingPressRoutes);
  return w;
}

const MOCK = { id: 'pp_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'PrintCity Lagos', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create printing press profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with printing_press key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'PrintCity Lagos' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { printing_press: typeof MOCK };
    expect(body.printing_press.businessName).toBe('PrintCity Lagos');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Ibadan Printers' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /:id — get printing press profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/pp_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { printing_press: typeof MOCK };
    expect(body.printing_press.id).toBe('pp_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/pp_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/pp_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('pp_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/pp_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { printing_press: typeof CLAIMED };
    expect(body.printing_press.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidPrintingPressTransition } = await import('@webwaka/verticals-printing-press');
    vi.mocked(isValidPrintingPressTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/pp_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/pp_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidPrintingPressTransition } = await import('@webwaka/verticals-printing-press');
    vi.mocked(isValidPrintingPressTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/pp_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/jobs — create print job', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with print job', async () => {
    const job = { id: 'job_001', profileId: 'pp_001', clientRefId: 'ref_c001', printType: 'flyers', quantity: 1000, totalKobo: 250000 };
    mockRepo.createJob.mockResolvedValueOnce(job);
    const res = await makeApp().request('/pp_001/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_ref_id: 'ref_c001', print_type: 'flyers', quantity: 1000, paper_size: 'A5', total_kobo: 250000, deadline_date: 1700259200 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { job: typeof job };
    expect(body.job.printType).toBe('flyers');
  });
});

describe('GET /:id/jobs — list print jobs', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of print jobs', async () => {
    mockRepo.listJobs.mockResolvedValueOnce([{ id: 'job_001' }, { id: 'job_002' }]);
    const res = await makeApp().request('/pp_001/jobs');
    expect(res.status).toBe(200);
    const body = await res.json() as { jobs: { id: string }[]; count: number };
    expect(body.jobs).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/inventory — add material to inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with inventory item', async () => {
    const item = { id: 'inv_001', profileId: 'pp_001', materialName: 'A4 Paper Ream', unitCostKobo: 150000 };
    mockRepo.addInventory.mockResolvedValueOnce(item);
    const res = await makeApp().request('/pp_001/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ material_name: 'A4 Paper Ream', quantity_in_stock: 200, unit_cost_kobo: 150000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { item: typeof item };
    expect(body.item.materialName).toBe('A4 Paper Ream');
  });
});
