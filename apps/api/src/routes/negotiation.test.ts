/**
 * Negotiation route tests — P3-B (HIGH-004)
 * Covers all 14 endpoints with ≥30 cases.
 * NegotiationRepository + NegotiationEngine fully mocked — no DB side effects.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { negotiationRouter } from './negotiation.js';

// ---------------------------------------------------------------------------
// Hoisted mocks (required: vi.mock is hoisted, so vars must also be hoisted)
// ---------------------------------------------------------------------------

const {
  mockRepo,
  mockEngine,
  mockIsNegotiationBlocked,
  mockGeneratePriceLockToken,
  mockVerifyPriceLockToken,
  NegotiationBlockedError,
  NegotiationNotEnabledError,
  SessionNotFoundError,
  SessionClosedError,
  MaxRoundsExceededError,
  UnauthorizedNegotiationError,
  DuplicateSessionError,
  InvalidPriceLockError,
} = vi.hoisted(() => {
  class NegotiationBlockedError extends Error { code = 'negotiation_blocked'; constructor(m = 'Negotiation blocked') { super(m); } }
  class NegotiationNotEnabledError extends Error { code = 'negotiation_not_enabled'; constructor(m = 'Not enabled') { super(m); } }
  class SessionNotFoundError extends Error { code = 'session_not_found'; constructor(m = 'Not found') { super(m); } }
  class SessionClosedError extends Error { code = 'session_closed'; constructor(m = 'Session closed') { super(m); } }
  class MaxRoundsExceededError extends Error { code = 'max_rounds_exceeded'; constructor(m = 'Max rounds') { super(m); } }
  class UnauthorizedNegotiationError extends Error { code = 'unauthorized_negotiation'; constructor(m = 'Unauthorized') { super(m); } }
  class DuplicateSessionError extends Error { code = 'duplicate_session'; constructor(m = 'Duplicate') { super(m); } }
  class InvalidPriceLockError extends Error { code = 'invalid_price_lock'; constructor(m = 'Invalid token') { super(m); } }

  const mockRepo = {
    getVendorPolicy: vi.fn(),
    upsertVendorPolicy: vi.fn(),
    getListingOverride: vi.fn(),
    upsertListingOverride: vi.fn(),
    deleteListingOverride: vi.fn(),
    listSessionsForSeller: vi.fn(),
    listSessionsForBuyer: vi.fn(),
    getSession: vi.fn(),
    listOffersForSession: vi.fn(),
    getSellerAnalytics: vi.fn(),
  };

  const mockEngine = {
    openSession: vi.fn(),
    submitOffer: vi.fn(),
    acceptOffer: vi.fn(),
    declineSession: vi.fn(),
    cancelSession: vi.fn(),
  };

  return {
    mockRepo,
    mockEngine,
    mockIsNegotiationBlocked: vi.fn().mockReturnValue(false),
    mockGeneratePriceLockToken: vi.fn().mockResolvedValue('lock_tok_abc'),
    mockVerifyPriceLockToken: vi.fn(),
    NegotiationBlockedError,
    NegotiationNotEnabledError,
    SessionNotFoundError,
    SessionClosedError,
    MaxRoundsExceededError,
    UnauthorizedNegotiationError,
    DuplicateSessionError,
    InvalidPriceLockError,
  };
});

vi.mock('@webwaka/negotiation', () => ({
  NegotiationRepository: vi.fn(() => mockRepo),
  NegotiationEngine: vi.fn(() => mockEngine),
  isNegotiationBlocked: mockIsNegotiationBlocked,
  generatePriceLockToken: mockGeneratePriceLockToken,
  verifyPriceLockToken: mockVerifyPriceLockToken,
  NegotiationBlockedError,
  NegotiationNotEnabledError,
  SessionNotFoundError,
  SessionClosedError,
  MaxRoundsExceededError,
  UnauthorizedNegotiationError,
  DuplicateSessionError,
  DuplicateSessionError: DuplicateSessionError,
  InvalidPriceLockError,
  OfferBelowFloorError: class extends Error { code = 'offer_below_floor'; },
  OfferExceedsDiscountError: class extends Error { code = 'offer_exceeds_discount'; },
  NoOpenOfferError: class extends Error { code = 'no_open_offer'; },
  BelowWholesaleMinQtyError: class extends Error { code = 'below_wholesale_min_qty'; },
  InsufficientKycError: class extends Error { code = 'insufficient_kyc'; },
  InvalidSessionTypeForListingError: class extends Error { code = 'invalid_session_type'; },
}));

// ---------------------------------------------------------------------------
// DB stub (not used directly — NegotiationRepository is mocked)
// ---------------------------------------------------------------------------

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

function makeApp(tenantId = 'tnt_a', workspaceId = 'wsp_a', userId = 'usr_a') {
  const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string; PRICE_LOCK_SECRET: string } }>();
  app.use('*', async (c, next) => {
    c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development', PRICE_LOCK_SECRET: 'plsec' } as never;
    c.set('auth' as never, { userId, tenantId, workspaceId, kycTier: 2 } as never);
    await next();
  });
  app.route('/negotiation', negotiationRouter);
  return app;
}

function makeAppNoWorkspace(tenantId = 'tnt_a', userId = 'usr_a') {
  const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string; PRICE_LOCK_SECRET: string } }>();
  app.use('*', async (c, next) => {
    c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development', PRICE_LOCK_SECRET: 'plsec' } as never;
    c.set('auth' as never, { userId, tenantId, kycTier: 2 } as never);
    await next();
  });
  app.route('/negotiation', negotiationRouter);
  return app;
}

const MOCK_POLICY = { workspace_id: 'wsp_a', tenant_id: 'tnt_a', default_pricing_mode: 'negotiable', max_discount_bps: 1500, max_offer_rounds: 3, offer_expiry_hours: 48, auto_accept_threshold_bps: null, eligible_buyer_kyc_tier: 1, wholesale_min_qty: null };
const MOCK_SESSION = { id: 'neg_001', tenant_id: 'tnt_a', seller_workspace_id: 'wsp_a', buyer_ref_id: 'usr_a', listing_type: 'product', listing_id: 'prod_001', status: 'open', current_best_kobo: 5000, session_type: 'offer', round_count: 1 };

// ---------------------------------------------------------------------------
// GET /negotiation/policy
// ---------------------------------------------------------------------------

describe('GET /negotiation/policy', () => {
  beforeEach(() => { vi.clearAllMocks(); mockIsNegotiationBlocked.mockReturnValue(false); });

  it('returns 400 when workspaceId missing from auth', async () => {
    const app = makeAppNoWorkspace();
    const res = await app.request('/negotiation/policy');
    expect(res.status).toBe(400);
  });

  it('returns 404 when no policy configured', async () => {
    mockRepo.getVendorPolicy.mockResolvedValueOnce(null);
    const app = makeApp();
    const res = await app.request('/negotiation/policy');
    expect(res.status).toBe(404);
  });

  it('returns 200 with policy (min_price_kobo stripped)', async () => {
    mockRepo.getVendorPolicy.mockResolvedValueOnce({ ...MOCK_POLICY, min_price_kobo: 1000 });
    const app = makeApp();
    const res = await app.request('/negotiation/policy');
    expect(res.status).toBe(200);
    const body = await res.json<{ policy: Record<string, unknown> }>();
    expect(body.policy.default_pricing_mode).toBe('negotiable');
    expect(body.policy.min_price_kobo).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// PUT /negotiation/policy
// ---------------------------------------------------------------------------

describe('PUT /negotiation/policy', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 422 for invalid pricing mode', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ default_pricing_mode: 'auction' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for max_discount_bps > 10000', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ default_pricing_mode: 'negotiable', max_discount_bps: 10001 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for max_offer_rounds > 10', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ default_pricing_mode: 'fixed', max_offer_rounds: 11 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for offer_expiry_hours > 720', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ default_pricing_mode: 'hybrid', offer_expiry_hours: 721 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for eligible_buyer_kyc_tier > 3', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ default_pricing_mode: 'fixed', eligible_buyer_kyc_tier: 4 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 200 for valid policy upsert', async () => {
    mockRepo.upsertVendorPolicy.mockResolvedValueOnce(MOCK_POLICY);
    const app = makeApp();
    const res = await app.request('/negotiation/policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ default_pricing_mode: 'negotiable', max_discount_bps: 1500, max_offer_rounds: 3 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ policy: Record<string, unknown> }>();
    expect(body.policy.default_pricing_mode).toBe('negotiable');
    expect(body.policy.min_price_kobo).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// POST /negotiation/listings/:type/:id/mode
// ---------------------------------------------------------------------------

describe('POST /negotiation/listings/:type/:id/mode', () => {
  beforeEach(() => { vi.clearAllMocks(); mockIsNegotiationBlocked.mockReturnValue(false); });

  it('returns 422 for blocked listing type (pharmacy_chain)', async () => {
    mockIsNegotiationBlocked.mockReturnValue(true);
    const app = makeApp();
    const res = await app.request('/negotiation/listings/pharmacy_chain/prod_001/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricing_mode: 'negotiable', listed_price_kobo: 5000 }),
    });
    expect(res.status).toBe(422);
    const body = await res.json<{ code: string }>();
    expect(body.code).toBe('negotiation_blocked');
  });

  it('returns 422 for blocked listing type (food_vendor)', async () => {
    mockIsNegotiationBlocked.mockReturnValue(true);
    const app = makeApp();
    const res = await app.request('/negotiation/listings/food_vendor/prod_002/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricing_mode: 'negotiable', listed_price_kobo: 5000 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for blocked listing type (bakery)', async () => {
    mockIsNegotiationBlocked.mockReturnValue(true);
    const app = makeApp();
    const res = await app.request('/negotiation/listings/bakery/prod_003/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricing_mode: 'negotiable', listed_price_kobo: 5000 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid pricing mode', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/listings/product/prod_001/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricing_mode: 'auction', listed_price_kobo: 5000 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for float listed_price_kobo (P9)', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/listings/product/prod_001/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricing_mode: 'negotiable', listed_price_kobo: 1500.50 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 200 for valid listing mode set', async () => {
    mockRepo.upsertListingOverride.mockResolvedValueOnce({ pricing_mode: 'negotiable', listed_price_kobo: 5000 });
    const app = makeApp();
    const res = await app.request('/negotiation/listings/product/prod_001/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricing_mode: 'negotiable', listed_price_kobo: 5000 }),
    });
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// POST /negotiation/sessions
// ---------------------------------------------------------------------------

describe('POST /negotiation/sessions', () => {
  beforeEach(() => { vi.clearAllMocks(); mockIsNegotiationBlocked.mockReturnValue(false); });

  it('returns 422 when required fields are missing', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_type: 'product' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for float initial_offer_kobo (P9 invariant)', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_type: 'product', listing_id: 'prod_001', seller_workspace_id: 'wsp_seller', initial_offer_kobo: 1500.75 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for zero initial_offer_kobo', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_type: 'product', listing_id: 'prod_001', seller_workspace_id: 'wsp_seller', initial_offer_kobo: 0 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid session_type', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_type: 'product', listing_id: 'prod_001', seller_workspace_id: 'wsp_seller', initial_offer_kobo: 5000, session_type: 'auction' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 201 for valid session creation', async () => {
    mockEngine.openSession.mockResolvedValueOnce(MOCK_SESSION);
    const app = makeApp();
    const res = await app.request('/negotiation/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_type: 'product', listing_id: 'prod_001', seller_workspace_id: 'wsp_seller', initial_offer_kobo: 5000 }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ session: typeof MOCK_SESSION }>();
    expect(body.session.id).toBe('neg_001');
  });

  it('returns 422 for NegotiationBlockedError from engine', async () => {
    mockEngine.openSession.mockRejectedValueOnce(new NegotiationBlockedError());
    const app = makeApp();
    const res = await app.request('/negotiation/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_type: 'product', listing_id: 'prod_001', seller_workspace_id: 'wsp_seller', initial_offer_kobo: 5000 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for DuplicateSessionError', async () => {
    mockEngine.openSession.mockRejectedValueOnce(new DuplicateSessionError());
    const app = makeApp();
    const res = await app.request('/negotiation/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_type: 'product', listing_id: 'prod_001', seller_workspace_id: 'wsp_seller', initial_offer_kobo: 5000 }),
    });
    expect(res.status).toBe(422);
    const body = await res.json<{ code: string }>();
    expect(body.code).toBe('duplicate_session');
  });
});

// ---------------------------------------------------------------------------
// POST /negotiation/sessions/:id/offer
// ---------------------------------------------------------------------------

describe('POST /negotiation/sessions/:id/offer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 422 for float amount_kobo (P9)', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offered_by: 'buyer', amount_kobo: 1500.50 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid offered_by', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offered_by: 'agent', amount_kobo: 5000 }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 200 for valid offer', async () => {
    mockEngine.submitOffer.mockResolvedValueOnce({ id: 'off_001', amount_kobo: 5000, offered_by: 'buyer' });
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offered_by: 'buyer', amount_kobo: 5000 }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ offer: { amount_kobo: number } }>();
    expect(body.offer.amount_kobo).toBe(5000);
  });

  it('returns 422 for MaxRoundsExceededError', async () => {
    mockEngine.submitOffer.mockRejectedValueOnce(new MaxRoundsExceededError());
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offered_by: 'buyer', amount_kobo: 5000 }),
    });
    expect(res.status).toBe(422);
    const body = await res.json<{ code: string }>();
    expect(body.code).toBe('max_rounds_exceeded');
  });

  it('returns 422 for SessionClosedError', async () => {
    mockEngine.submitOffer.mockRejectedValueOnce(new SessionClosedError());
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offered_by: 'buyer', amount_kobo: 5000 }),
    });
    expect(res.status).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// GET /negotiation/sessions + GET /negotiation/sessions/:id
// ---------------------------------------------------------------------------

describe('GET /negotiation/sessions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns merged seller+buyer session list deduped', async () => {
    mockRepo.listSessionsForSeller.mockResolvedValueOnce([MOCK_SESSION]);
    mockRepo.listSessionsForBuyer.mockResolvedValueOnce([MOCK_SESSION]);
    const app = makeApp();
    const res = await app.request('/negotiation/sessions');
    expect(res.status).toBe(200);
    const body = await res.json<{ sessions: unknown[] }>();
    expect(body.sessions).toHaveLength(1);
  });

  it('GET /sessions/:id returns 404 when session not found', async () => {
    mockRepo.getSession.mockResolvedValueOnce(null);
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_999');
    expect(res.status).toBe(404);
  });

  it('GET /sessions/:id returns 403 when caller is not seller or buyer', async () => {
    mockRepo.getSession.mockResolvedValueOnce({ ...MOCK_SESSION, seller_workspace_id: 'wsp_other', buyer_ref_id: 'usr_other' });
    const app = makeApp('tnt_a', 'wsp_a', 'usr_a');
    const res = await app.request('/negotiation/sessions/neg_001');
    expect(res.status).toBe(403);
  });

  it('GET /sessions/:id returns 200 for seller', async () => {
    mockRepo.getSession.mockResolvedValueOnce({ ...MOCK_SESSION, seller_workspace_id: 'wsp_a' });
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001');
    expect(res.status).toBe(200);
  });

  it('T3: GET /sessions/:id scoped to tenantId', async () => {
    mockRepo.getSession.mockResolvedValueOnce(null);
    const app = makeApp('tnt_B');
    const res = await app.request('/negotiation/sessions/neg_001');
    expect(res.status).toBe(404);
    expect(mockRepo.getSession).toHaveBeenCalledWith('neg_001', 'tnt_B');
  });
});

// ---------------------------------------------------------------------------
// POST /negotiation/sessions/:id/accept + /decline + /cancel
// ---------------------------------------------------------------------------

describe('POST accept/decline/cancel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('accept returns 200 with session and price_lock_token', async () => {
    mockEngine.acceptOffer.mockResolvedValueOnce({ ...MOCK_SESSION, status: 'accepted', final_price_kobo: 4500 });
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001/accept', { method: 'POST' });
    expect(res.status).toBe(200);
    const body = await res.json<{ price_lock_token: string }>();
    expect(body.price_lock_token).toBeDefined();
  });

  it('decline returns 200', async () => {
    mockEngine.declineSession.mockResolvedValueOnce(undefined);
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001/decline', { method: 'POST' });
    expect(res.status).toBe(200);
    const body = await res.json<{ declined: boolean }>();
    expect(body.declined).toBe(true);
  });

  it('cancel returns 200', async () => {
    mockEngine.cancelSession.mockResolvedValueOnce(undefined);
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001/cancel', { method: 'POST' });
    expect(res.status).toBe(200);
    const body = await res.json<{ cancelled: boolean }>();
    expect(body.cancelled).toBe(true);
  });

  it('accept returns 403 for UnauthorizedNegotiationError', async () => {
    mockEngine.acceptOffer.mockRejectedValueOnce(new UnauthorizedNegotiationError());
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001/accept', { method: 'POST' });
    expect(res.status).toBe(403);
  });

  it('decline returns 404 for SessionNotFoundError', async () => {
    mockEngine.declineSession.mockRejectedValueOnce(new SessionNotFoundError());
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001/decline', { method: 'POST' });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// GET /negotiation/sessions/:id/history
// ---------------------------------------------------------------------------

describe('GET /negotiation/sessions/:id/history', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when session not found', async () => {
    mockRepo.getSession.mockResolvedValueOnce(null);
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_999/history');
    expect(res.status).toBe(404);
  });

  it('returns 200 with offers for seller', async () => {
    mockRepo.getSession.mockResolvedValueOnce({ ...MOCK_SESSION, seller_workspace_id: 'wsp_a' });
    mockRepo.listOffersForSession.mockResolvedValueOnce([{ id: 'off_001', amount_kobo: 5000, offered_by: 'buyer' }]);
    const app = makeApp();
    const res = await app.request('/negotiation/sessions/neg_001/history');
    expect(res.status).toBe(200);
    const body = await res.json<{ offers: unknown[] }>();
    expect(body.offers).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// GET /negotiation/analytics
// ---------------------------------------------------------------------------

describe('GET /negotiation/analytics', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when no workspaceId (seller required)', async () => {
    const app = makeAppNoWorkspace();
    const res = await app.request('/negotiation/analytics');
    expect(res.status).toBe(403);
  });

  it('returns 200 with analytics', async () => {
    mockRepo.getSellerAnalytics.mockResolvedValueOnce({ total_sessions: 5, accepted_sessions: 3, avg_discount_bps: 800 });
    const app = makeApp();
    const res = await app.request('/negotiation/analytics');
    expect(res.status).toBe(200);
    const body = await res.json<{ analytics: { total_sessions: number } }>();
    expect(body.analytics.total_sessions).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// POST /negotiation/checkout/verify-price-lock
// ---------------------------------------------------------------------------

describe('POST /negotiation/checkout/verify-price-lock', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 422 when token is missing', async () => {
    const app = makeApp();
    const res = await app.request('/negotiation/checkout/verify-price-lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(422);
  });

  it('returns 200 with valid lock verification', async () => {
    mockVerifyPriceLockToken.mockResolvedValueOnce({ session_id: 'neg_001', final_price_kobo: 4500 });
    const app = makeApp();
    const res = await app.request('/negotiation/checkout/verify-price-lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_lock_token: 'lock_tok_abc' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ valid: boolean; final_price_kobo: number }>();
    expect(body.valid).toBe(true);
    expect(body.final_price_kobo).toBe(4500);
  });

  it('returns 422 for InvalidPriceLockError', async () => {
    mockVerifyPriceLockToken.mockRejectedValueOnce(new InvalidPriceLockError());
    const app = makeApp();
    const res = await app.request('/negotiation/checkout/verify-price-lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_lock_token: 'bad_token' }),
    });
    expect(res.status).toBe(422);
  });
});
