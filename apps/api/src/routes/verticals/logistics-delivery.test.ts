/**
 * Logistics & Delivery vertical route tests — P11
 * FSM: seeded → claimed → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, orders, fleet, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { logisticsDeliveryRoutes } from './logistics-delivery.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createOrder: vi.fn(), listOrders: vi.fn(), updateOrderStatus: vi.fn(),
    createFleetVehicle: vi.fn(), listFleet: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-logistics-delivery', () => ({
  LogisticsDeliveryRepository: vi.fn(() => mockRepo),
  isValidLogisticsDeliveryTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', logisticsDeliveryRoutes);
  return w;
}

const MOCK = { id: 'ld_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'SwiftCargo Nigeria', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create logistics profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with logistics_delivery key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'SwiftCargo Nigeria' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { logistics_delivery: typeof MOCK };
    expect(body.logistics_delivery.businessName).toBe('SwiftCargo Nigeria');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Abuja Express' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /:id — get logistics profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ld_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { logistics_delivery: typeof MOCK };
    expect(body.logistics_delivery.id).toBe('ld_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ld_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ld_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ld_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ld_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { logistics_delivery: typeof CLAIMED };
    expect(body.logistics_delivery.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidLogisticsDeliveryTransition } = await import('@webwaka/verticals-logistics-delivery');
    vi.mocked(isValidLogisticsDeliveryTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ld_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ld_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidLogisticsDeliveryTransition } = await import('@webwaka/verticals-logistics-delivery');
    vi.mocked(isValidLogisticsDeliveryTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ld_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/orders — create delivery order', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with order', async () => {
    const order = { id: 'ord_001', profileId: 'ld_001', senderRefId: 'ref_s001', deliveryFeeKobo: 500000 };
    mockRepo.createOrder.mockResolvedValueOnce(order);
    const res = await makeApp().request('/ld_001/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sender_ref_id: 'ref_s001', recipient_ref_id: 'ref_r001', pickup_address: '5 Lagos Road', delivery_address: '12 Abuja Street', weight_grams: 5000, declared_value_kobo: 100000, delivery_fee_kobo: 500000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { order: typeof order };
    expect(body.order.senderRefId).toBe('ref_s001');
  });
});

describe('GET /:id/orders — list orders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of orders', async () => {
    mockRepo.listOrders.mockResolvedValueOnce([{ id: 'ord_001' }, { id: 'ord_002' }]);
    const res = await makeApp().request('/ld_001/orders');
    expect(res.status).toBe(200);
    const body = await res.json() as { orders: { id: string }[]; count: number };
    expect(body.orders).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/fleet — add fleet vehicle', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with vehicle', async () => {
    const vehicle = { id: 'veh_001', profileId: 'ld_001', plateNumber: 'LND123GH', vehicleType: 'truck' };
    mockRepo.createFleetVehicle.mockResolvedValueOnce(vehicle);
    const res = await makeApp().request('/ld_001/fleet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plate_number: 'LND123GH', vehicle_type: 'truck', capacity_kg_x100: 500000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { vehicle: typeof vehicle };
    expect(body.vehicle.vehicleType).toBe('truck');
  });
});
