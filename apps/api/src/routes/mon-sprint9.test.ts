/**
 * MON Sprint 9 — Monetization Infrastructure Tests
 *
 * MON-01: Template purchase payment flow
 *   POST /templates/:slug/purchase        — initiate Paystack payment
 *   POST /templates/:slug/purchase/verify — verify + record split + install
 *   POST /templates/:slug/install         — guard for paid templates
 *
 * MON-02: Revenue share tracking
 *   70/30 split recorded in revenue_splits on successful verify
 *
 * MON-04: Free tier limits enforcement
 *   POST /workspaces/:id/invite           — user limit
 *   POST /workspaces/:id/offerings        — offering limit
 *   POST /workspaces/:id/places           — place limit
 *
 * 38 tests total
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { templateRoutes } from './templates.js';
import { workspaceRoutes } from './workspaces.js';
import app from '../index.js';

// ---------------------------------------------------------------------------
// Mock @webwaka/payments — avoids real Paystack HTTP calls
// ---------------------------------------------------------------------------

const mockInitializePayment = vi.fn();
const mockVerifyPayment = vi.fn();

vi.mock('@webwaka/payments', () => ({
  initializePayment: (...args: unknown[]) => mockInitializePayment(...args),
  verifyPayment: (...args: unknown[]) => mockVerifyPayment(...args),
  verifyWebhookSignature: vi.fn(),
  syncPaymentToSubscription: vi.fn(),
  recordFailedPayment: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Shared types and helpers
// ---------------------------------------------------------------------------

const JWT_SECRET = 'test-secret-32-chars-minimum-length-required';

type HonoEnv = {
  Bindings: {
    DB: ReturnType<typeof makeDB>;
    JWT_SECRET: string;
    ENVIRONMENT: string;
    PAYSTACK_SECRET_KEY?: string;
    [k: string]: unknown;
  };
  Variables: { [key: string]: unknown };
};

function makeAuth(overrides: Record<string, unknown> = {}) {
  return { userId: 'usr_001', tenantId: 'tnt_001', workspaceId: 'wsp_001', role: 'admin', ...overrides };
}

// ---------------------------------------------------------------------------
// Mock DB factory
// ---------------------------------------------------------------------------

interface DBOptions {
  template?: Record<string, unknown> | null;
  purchase?: Record<string, unknown> | null;
  installation?: Record<string, unknown> | null;
  subscription?: { plan: string; status: string } | null;
  memberCount?: number;
  offeringCount?: number;
  placeCount?: number;
  workspaceExists?: boolean;
}

function makeDB(opts: DBOptions = {}) {
  const {
    template = null,
    purchase = null,
    installation = null,
    subscription = null,
    memberCount = 0,
    offeringCount = 0,
    placeCount = 0,
    workspaceExists = true,
  } = opts;

  const boundable = (sql: string, boundArgs: unknown[]) => ({
    run: async () => ({ success: true }),
    first: async <T>(): Promise<T | null> => {
      const lo = sql.toLowerCase();
      if (lo.includes('count(*)')) {
        if (lo.includes('memberships')) return { cnt: memberCount } as T;
        if (lo.includes('offerings')) return { cnt: offeringCount } as T;
        if (lo.includes('organizations')) return { cnt: placeCount } as T;
        return { cnt: 0 } as T;
      }
      if (lo.includes('subscriptions')) return subscription as T;
      if (lo.includes('workspaces')) {
        if (!workspaceExists) return null;
        if (boundArgs.includes('wsp_bad')) return null;
        return { id: 'wsp_001', tenant_id: 'tnt_001', owner_id: 'usr_001', name: 'Test WS' } as T;
      }
      if (lo.includes('template_registry')) return template as T;
      if (lo.includes('template_purchases')) return purchase as T;
      if (lo.includes('template_installations')) return installation as T;
      return null;
    },
    all: async <T>() => ({ results: [] as T[] }),
  });

  return {
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => boundable(sql, args),
      run: async () => ({ success: true }),
      first: async <T>(): Promise<T | null> => null,
      all: async <T>() => ({ results: [] as T[] }),
    }),
    batch: (stmts: unknown[]) => Promise.resolve(stmts.map(() => ({ success: true }))),
  };
}

function makeEnv(db: ReturnType<typeof makeDB>, extras: Record<string, unknown> = {}) {
  return {
    DB: db,
    JWT_SECRET,
    ENVIRONMENT: 'development',
    PAYSTACK_SECRET_KEY: 'sk_test_fake_key_12345',
    GEOGRAPHY_CACHE: { get: async () => null, put: async () => undefined },
    RATE_LIMIT_KV: { get: async () => null, put: async () => undefined },
    PREMBLY_API_KEY: 'prembly_test',
    TERMII_API_KEY: 'termii_test',
    WHATSAPP_ACCESS_TOKEN: 'wa_test',
    WHATSAPP_PHONE_NUMBER_ID: 'wa_phone',
    TELEGRAM_BOT_TOKEN: 'tg_test',
    LOG_PII_SALT: 'test-pii-salt-minimum-32-characters!!',
    ...extras,
  };
}

function makeTemplateApp(db: ReturnType<typeof makeDB>, authOverrides?: Record<string, unknown>) {
  const app = new Hono<HonoEnv>();
  app.use('*', async (c, next) => { c.set('auth', makeAuth(authOverrides)); await next(); });
  app.route('/templates', templateRoutes);
  return { app, env: makeEnv(db) };
}

function makeWorkspaceApp(db: ReturnType<typeof makeDB>, authOverrides?: Record<string, unknown>) {
  const app = new Hono<HonoEnv>();
  app.use('*', async (c, next) => { c.set('auth', makeAuth(authOverrides)); await next(); });
  app.route('/workspaces', workspaceRoutes);
  return { app, env: makeEnv(db) };
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const PAID_TEMPLATE = {
  id: 'tpl_paid_001',
  slug: 'premium-dashboard',
  display_name: 'Premium Dashboard',
  description: 'A premium template',
  version: '1.0.0',
  platform_compat: '^1.0.0',
  compatible_verticals: '[]',
  manifest_json: '{"config_schema":{"properties":{}}}',
  status: 'approved',
  is_free: 0,
  price_kobo: 50_000_00,
  author_tenant_id: 'tnt_author_001',
  install_count: 5,
};

const FREE_TEMPLATE = {
  ...PAID_TEMPLATE,
  id: 'tpl_free_001',
  slug: 'free-dashboard',
  display_name: 'Free Dashboard',
  is_free: 1,
  price_kobo: 0,
};

const PENDING_PURCHASE = {
  id: 'tpurch_001',
  tenant_id: 'tnt_001',
  template_id: 'tpl_paid_001',
  paystack_ref: 'test_pay_ref_001',
  amount_kobo: 50_000_00,
  status: 'pending',
};

const PAID_PURCHASE = { ...PENDING_PURCHASE, status: 'paid', paid_at: Date.now() };

const FREE_SUBSCRIPTION = { plan: 'free', status: 'active' };
const STARTER_SUBSCRIPTION = { plan: 'starter', status: 'active' };

// ---------------------------------------------------------------------------
// MON-01: POST /templates/:slug/purchase — initiate payment
// ---------------------------------------------------------------------------

describe('MON-01: POST /templates/:slug/purchase', () => {
  beforeEach(() => {
    mockInitializePayment.mockReset();
    mockInitializePayment.mockResolvedValue({
      reference: 'test_pay_ref_001',
      authorizationUrl: 'https://paystack.com/pay/test_pay_ref_001',
      accessCode: 'acc_001',
      amountKobo: 50_000_00,
    });
  });

  it('returns 400 if email is missing', async () => {
    const db = makeDB({ template: PAID_TEMPLATE });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }, env);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/email/i);
  });

  it('returns 404 if template not found', async () => {
    const db = makeDB({ template: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/nonexistent/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'buyer@example.com' }),
    }, env);
    expect(res.status).toBe(404);
  });

  it('returns 400 if template is free', async () => {
    const db = makeDB({ template: FREE_TEMPLATE });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/free-dashboard/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'buyer@example.com' }),
    }, env);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/free/i);
  });

  it('returns 409 if template already purchased (paid)', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: PAID_PURCHASE });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'buyer@example.com' }),
    }, env);
    expect(res.status).toBe(409);
    const body = await res.json() as { already_purchased: boolean };
    expect(body.already_purchased).toBe(true);
  });

  it('returns 503 if PAYSTACK_SECRET_KEY is not set', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: null });
    const { app } = makeTemplateApp(db);
    const env = makeEnv(db, { PAYSTACK_SECRET_KEY: undefined });
    const res = await app.request('/templates/premium-dashboard/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'buyer@example.com' }),
    }, env);
    expect(res.status).toBe(503);
  });

  it('returns 201 with authorization_url on success', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'buyer@example.com' }),
    }, env);
    expect(res.status).toBe(201);
    const body = await res.json() as {
      purchase_id: string; template_slug: string;
      amount_kobo: number; reference: string; authorization_url: string;
    };
    expect(body.template_slug).toBe('premium-dashboard');
    expect(body.amount_kobo).toBe(50_000_00);
    expect(body.reference).toBe('test_pay_ref_001');
    expect(body.authorization_url).toMatch(/paystack\.com/);
    expect(body.purchase_id).toMatch(/^tpurch_/);
  });

  it('calls initializePayment with correct amount and template metadata', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: null });
    const { app, env } = makeTemplateApp(db);
    await app.request('/templates/premium-dashboard/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'buyer@example.com' }),
    }, env);
    expect(mockInitializePayment).toHaveBeenCalledOnce();
    const callArg = mockInitializePayment.mock.calls[0]?.[1] as {
      amountKobo: number; email: string; metadata: Record<string, unknown>
    };
    expect(callArg?.amountKobo).toBe(50_000_00);
    expect(callArg?.email).toBe('buyer@example.com');
    expect(callArg?.metadata?.purchase_type).toBe('template');
  });
});

// ---------------------------------------------------------------------------
// MON-01 + MON-02: POST /templates/:slug/purchase/verify — verify + split + install
// ---------------------------------------------------------------------------

describe('MON-01 + MON-02: POST /templates/:slug/purchase/verify', () => {
  beforeEach(() => {
    mockVerifyPayment.mockReset();
    mockVerifyPayment.mockResolvedValue({
      reference: 'test_pay_ref_001',
      status: 'success',
      amountKobo: 50_000_00,
      currency: 'NGN',
      paidAt: new Date().toISOString(),
      metadata: {},
    });
  });

  it('returns 400 if reference is missing', async () => {
    const db = makeDB({ template: PAID_TEMPLATE });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }, env);
    expect(res.status).toBe(400);
  });

  it('returns 404 if template not found', async () => {
    const db = makeDB({ template: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/nonexistent/purchase/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'ref_001' }),
    }, env);
    expect(res.status).toBe(404);
  });

  it('returns 404 if purchase record not found', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'unknown_ref' }),
    }, env);
    expect(res.status).toBe(404);
  });

  it('returns 409 if purchase already paid', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: PAID_PURCHASE });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'test_pay_ref_001' }),
    }, env);
    expect(res.status).toBe(409);
    const body = await res.json() as { already_verified: boolean };
    expect(body.already_verified).toBe(true);
  });

  it('returns 402 if Paystack payment failed', async () => {
    mockVerifyPayment.mockResolvedValue({
      reference: 'test_pay_ref_001',
      status: 'failed',
      amountKobo: 50_000_00,
      currency: 'NGN',
      paidAt: null,
      metadata: {},
    });
    const db = makeDB({ template: PAID_TEMPLATE, purchase: PENDING_PURCHASE });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'test_pay_ref_001' }),
    }, env);
    expect(res.status).toBe(402);
  });

  it('returns 422 if Paystack amount does not match purchase amount', async () => {
    mockVerifyPayment.mockResolvedValue({
      reference: 'test_pay_ref_001',
      status: 'success',
      amountKobo: 1_000_00,   // wrong amount
      currency: 'NGN',
      paidAt: new Date().toISOString(),
      metadata: {},
    });
    const db = makeDB({ template: PAID_TEMPLATE, purchase: PENDING_PURCHASE });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'test_pay_ref_001' }),
    }, env);
    expect(res.status).toBe(422);
  });

  it('returns 200 with verified: true and revenue_split on success', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: PENDING_PURCHASE, installation: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'test_pay_ref_001' }),
    }, env);
    expect(res.status).toBe(200);
    const body = await res.json() as {
      verified: boolean;
      purchase_id: string;
      installation_id: string;
      template_slug: string;
      revenue_split: { gross_kobo: number; platform_fee_kobo: number; author_share_kobo: number };
    };
    expect(body.verified).toBe(true);
    expect(body.template_slug).toBe('premium-dashboard');
    expect(body.installation_id).toMatch(/^inst_/);
  });

  it('MON-02: revenue split is 70/30 (author 70%, platform 30%)', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: PENDING_PURCHASE, installation: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'test_pay_ref_001' }),
    }, env);
    const body = await res.json() as {
      revenue_split: { gross_kobo: number; platform_fee_kobo: number; author_share_kobo: number };
    };
    const { gross_kobo, platform_fee_kobo, author_share_kobo } = body.revenue_split;
    // Gross = 50,000 kobo (₦500)
    expect(gross_kobo).toBe(50_000_00);
    // Platform fee = floor((50_000_00 * 30) / 100) = 15_000_00
    expect(platform_fee_kobo).toBe(15_000_00);
    // Author share = 50_000_00 - 15_000_00 = 35_000_00
    expect(author_share_kobo).toBe(35_000_00);
    // Invariant: fees + share = gross
    expect(platform_fee_kobo + author_share_kobo).toBe(gross_kobo);
  });

  it('MON-02: P9 — all split amounts are integers (kobo, no decimals)', async () => {
    // Odd amount to test rounding: 10_001 kobo
    const oddPurchase = { ...PENDING_PURCHASE, amount_kobo: 10_001 };
    const oddTemplate = { ...PAID_TEMPLATE, price_kobo: 10_001 };
    mockVerifyPayment.mockResolvedValue({
      reference: 'test_pay_ref_001', status: 'success', amountKobo: 10_001, currency: 'NGN',
      paidAt: new Date().toISOString(), metadata: {},
    });
    const db = makeDB({ template: oddTemplate, purchase: oddPurchase, installation: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'test_pay_ref_001' }),
    }, env);
    const body = await res.json() as {
      revenue_split: { gross_kobo: number; platform_fee_kobo: number; author_share_kobo: number };
    };
    expect(Number.isInteger(body.revenue_split.platform_fee_kobo)).toBe(true);
    expect(Number.isInteger(body.revenue_split.author_share_kobo)).toBe(true);
    expect(body.revenue_split.platform_fee_kobo + body.revenue_split.author_share_kobo)
      .toBe(body.revenue_split.gross_kobo);
  });

  it('reinstall flag true when installation already exists', async () => {
    const existingInstall = { id: 'inst_existing', status: 'rolled_back', template_version: '0.9.0' };
    const db = makeDB({ template: PAID_TEMPLATE, purchase: PENDING_PURCHASE, installation: existingInstall });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'test_pay_ref_001' }),
    }, env);
    const body = await res.json() as { reinstalled: boolean };
    expect(body.reinstalled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// MON-01: POST /templates/:slug/install — guard for paid templates
// ---------------------------------------------------------------------------

describe('MON-01: POST /templates/:slug/install — paid template guard', () => {
  it('returns 402 when paid template has no purchase record', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }, env);
    expect(res.status).toBe(402);
    const body = await res.json() as { payment_required: boolean; price_kobo: number };
    expect(body.payment_required).toBe(true);
    expect(body.price_kobo).toBe(50_000_00);
  });

  it('installs successfully when paid template has verified purchase', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: PAID_PURCHASE, installation: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }, env);
    expect(res.status).toBe(201);
    const body = await res.json() as { installed: boolean };
    expect(body.installed).toBe(true);
  });

  it('installs free templates without payment check', async () => {
    const db = makeDB({ template: FREE_TEMPLATE, purchase: null, installation: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/free-dashboard/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }, env);
    expect(res.status).toBe(201);
    const body = await res.json() as { installed: boolean };
    expect(body.installed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// MON-04: POST /workspaces/:id/offerings — offering creation + limit
// ---------------------------------------------------------------------------

describe('MON-04: POST /workspaces/:id/offerings', () => {
  it('returns 403 if caller is not admin', async () => {
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, offeringCount: 0 });
    const { app, env } = makeWorkspaceApp(db, { role: 'member' });
    const res = await app.request('/workspaces/wsp_001/offerings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Haircut' }),
    }, env);
    expect(res.status).toBe(403);
  });

  it('returns 404 if workspace not found', async () => {
    const db = makeDB({ workspaceExists: false });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_bad/offerings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Haircut' }),
    }, env);
    expect(res.status).toBe(404);
  });

  it('returns 400 if name is missing', async () => {
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, offeringCount: 0 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/offerings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_kobo: 5000 }),
    }, env);
    expect(res.status).toBe(400);
  });

  it('returns 422 if price_kobo is not an integer (P9)', async () => {
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, offeringCount: 0 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/offerings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Trim', price_kobo: 99.99 }),
    }, env);
    expect(res.status).toBe(422);
  });

  it('returns 403 when free tier offering limit (5) is reached', async () => {
    // Free plan: maxOfferings = 5. Currently 5 published.
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, offeringCount: 5 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/offerings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sixth Offering', price_kobo: 100_00 }),
    }, env);
    expect(res.status).toBe(403);
    const body = await res.json() as { limit_exceeded: boolean; error: string };
    expect(body.limit_exceeded).toBe(true);
    expect(body.error).toMatch(/offering limit/i);
  });

  it('allows creation when under the free tier offering limit', async () => {
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, offeringCount: 4 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/offerings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Fifth Offering', price_kobo: 500_00 }),
    }, env);
    expect(res.status).toBe(201);
    const body = await res.json() as { created: boolean; name: string; price_kobo: number };
    expect(body.created).toBe(true);
    expect(body.name).toBe('Fifth Offering');
    expect(body.price_kobo).toBe(500_00);
  });

  it('allows creation on starter plan (maxOfferings=25) with 24 existing', async () => {
    const db = makeDB({ workspaceExists: true, subscription: STARTER_SUBSCRIPTION, offeringCount: 24 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/offerings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Offering' }),
    }, env);
    expect(res.status).toBe(201);
  });

  it('returns 403 when starter plan (maxOfferings=25) already at limit', async () => {
    const db = makeDB({ workspaceExists: true, subscription: STARTER_SUBSCRIPTION, offeringCount: 25 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/offerings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Over Limit' }),
    }, env);
    expect(res.status).toBe(403);
    const body = await res.json() as { limit_exceeded: boolean };
    expect(body.limit_exceeded).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// MON-04: POST /workspaces/:id/places — place creation + limit
// ---------------------------------------------------------------------------

describe('MON-04: POST /workspaces/:id/places', () => {
  it('returns 403 if caller is not admin', async () => {
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, placeCount: 0 });
    const { app, env } = makeWorkspaceApp(db, { role: 'member' });
    const res = await app.request('/workspaces/wsp_001/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Main Branch' }),
    }, env);
    expect(res.status).toBe(403);
  });

  it('returns 400 if name is missing', async () => {
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, placeCount: 0 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'Restaurant' }),
    }, env);
    expect(res.status).toBe(400);
  });

  it('returns 403 when free tier place limit (1) is reached', async () => {
    // Free plan: maxPlaces = 1. Currently 1 place.
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, placeCount: 1 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Second Branch' }),
    }, env);
    expect(res.status).toBe(403);
    const body = await res.json() as { limit_exceeded: boolean; error: string };
    expect(body.limit_exceeded).toBe(true);
    expect(body.error).toMatch(/place limit/i);
  });

  it('allows creation on free plan when under place limit', async () => {
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, placeCount: 0 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'First Branch', category: 'Restaurant' }),
    }, env);
    expect(res.status).toBe(201);
    const body = await res.json() as { created: boolean; name: string };
    expect(body.created).toBe(true);
    expect(body.name).toBe('First Branch');
  });

  it('allows creation on starter plan (maxPlaces=3) with 2 existing', async () => {
    const db = makeDB({ workspaceExists: true, subscription: STARTER_SUBSCRIPTION, placeCount: 2 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Third Branch' }),
    }, env);
    expect(res.status).toBe(201);
  });

  it('returns 403 when starter plan (maxPlaces=3) already at limit', async () => {
    const db = makeDB({ workspaceExists: true, subscription: STARTER_SUBSCRIPTION, placeCount: 3 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Over Limit' }),
    }, env);
    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// MON-04: POST /workspaces/:id/invite — user limit enforcement
// ---------------------------------------------------------------------------

describe('MON-04: POST /workspaces/:id/invite — user limit', () => {
  it('returns 403 when free tier user limit (3) is reached', async () => {
    // Free plan: maxUsers = 3. Currently 3 members.
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, memberCount: 3 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_new', role: 'member' }),
    }, env);
    expect(res.status).toBe(403);
    const body = await res.json() as { limit_exceeded: boolean; error: string };
    expect(body.limit_exceeded).toBe(true);
    expect(body.error).toMatch(/user limit/i);
  });

  it('allows invite when under the free tier user limit', async () => {
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, memberCount: 2 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_new', role: 'member' }),
    }, env);
    expect(res.status).toBe(201);
    const body = await res.json() as { invited: boolean };
    expect(body.invited).toBe(true);
  });

  it('allows invite on starter plan (maxUsers=10) with 9 existing', async () => {
    const db = makeDB({ workspaceExists: true, subscription: STARTER_SUBSCRIPTION, memberCount: 9 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_10th', role: 'member' }),
    }, env);
    expect(res.status).toBe(201);
  });

  it('returns 403 when starter plan (maxUsers=10) already at limit', async () => {
    const db = makeDB({ workspaceExists: true, subscription: STARTER_SUBSCRIPTION, memberCount: 10 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_11th', role: 'member' }),
    }, env);
    expect(res.status).toBe(403);
    const body = await res.json() as { limit_exceeded: boolean };
    expect(body.limit_exceeded).toBe(true);
  });

  it('proceeds with invite when no subscription record (workspace not yet activated)', async () => {
    // If no subscription row found, limit check is skipped — invitation allowed
    const db = makeDB({ workspaceExists: true, subscription: null, memberCount: 99 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_free', role: 'member' }),
    }, env);
    expect(res.status).toBe(201);
  });
});

// ---------------------------------------------------------------------------
// Bug Fix B1: Auth middleware enforcement on purchase/verify routes
// Tests use the full main app (index.ts) to verify authMiddleware is wired up.
// ---------------------------------------------------------------------------

function makeMainEnv(overrides: Record<string, unknown> = {}) {
  return {
    DB: makeDB() as unknown,
    JWT_SECRET,
    ENVIRONMENT: 'development',
    PAYSTACK_SECRET_KEY: 'sk_test_fake_key',
    GEOGRAPHY_CACHE: { get: async () => null, put: async () => undefined },
    RATE_LIMIT_KV: { get: async () => null, put: async () => undefined },
    PREMBLY_API_KEY: 'prembly_test',
    TERMII_API_KEY: 'termii_test',
    WHATSAPP_ACCESS_TOKEN: 'wa_test',
    WHATSAPP_PHONE_NUMBER_ID: 'wa_phone',
    TELEGRAM_BOT_TOKEN: 'tg_test',
    LOG_PII_SALT: 'test-pii-salt-minimum-32-characters!!',
    ...overrides,
  };
}

describe('B1: Auth middleware on /templates/*/purchase and /*/purchase/verify', () => {
  it('returns 401 for POST /templates/:slug/purchase without Authorization header', async () => {
    const req = new Request('http://localhost/templates/premium-dashboard/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'buyer@example.com' }),
    });
    const res = await app.fetch(req, makeMainEnv());
    expect(res.status).toBe(401);
  });

  it('returns 401 for POST /templates/:slug/purchase/verify without Authorization header', async () => {
    const req = new Request('http://localhost/templates/premium-dashboard/purchase/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: 'test_ref_001' }),
    });
    const res = await app.fetch(req, makeMainEnv());
    expect(res.status).toBe(401);
  });

  it('returns non-401 for GET /templates (public endpoint) without Authorization header', async () => {
    const req = new Request('http://localhost/templates', { method: 'GET' });
    const res = await app.fetch(req, makeMainEnv());
    expect(res.status).not.toBe(401);
  });

  it('returns non-401 for GET /templates/:slug (public manifest) without Authorization header', async () => {
    const req = new Request('http://localhost/templates/some-template', { method: 'GET' });
    const res = await app.fetch(req, makeMainEnv());
    expect(res.status).not.toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Bug Fix B4: upgrade_url contains real workspace ID, not literal ':id'
// ---------------------------------------------------------------------------

describe('B4: upgrade_url contains actual workspace ID in limit responses', () => {
  it('invite user-limit response includes real workspace ID in upgrade_url', async () => {
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, memberCount: 3 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_new', role: 'member' }),
    }, env);
    expect(res.status).toBe(403);
    const body = await res.json() as { upgrade_url: string };
    expect(body.upgrade_url).toBe('/workspaces/wsp_001/activate');
    expect(body.upgrade_url).not.toContain(':id');
  });

  it('offerings limit response includes real workspace ID in upgrade_url', async () => {
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, offeringCount: 5 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/offerings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Over Limit', price_kobo: 100_00 }),
    }, env);
    expect(res.status).toBe(403);
    const body = await res.json() as { upgrade_url: string };
    expect(body.upgrade_url).toBe('/workspaces/wsp_001/activate');
    expect(body.upgrade_url).not.toContain(':id');
  });

  it('places limit response includes real workspace ID in upgrade_url', async () => {
    const db = makeDB({ workspaceExists: true, subscription: FREE_SUBSCRIPTION, placeCount: 1 });
    const { app, env } = makeWorkspaceApp(db);
    const res = await app.request('/workspaces/wsp_001/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Second Branch' }),
    }, env);
    expect(res.status).toBe(403);
    const body = await res.json() as { upgrade_url: string };
    expect(body.upgrade_url).toBe('/workspaces/wsp_001/activate');
    expect(body.upgrade_url).not.toContain(':id');
  });
});

// ---------------------------------------------------------------------------
// Bug Fix B5: Email format validation in POST /templates/:slug/purchase
// ---------------------------------------------------------------------------

describe('B5: Email format validation in purchase endpoint', () => {
  beforeEach(() => {
    mockInitializePayment.mockReset();
    mockInitializePayment.mockResolvedValue({
      reference: 'test_pay_ref_001',
      authorizationUrl: 'https://paystack.com/pay/test_pay_ref_001',
      accessCode: 'acc_001',
      amountKobo: 50_000_00,
    });
  });

  it('returns 400 for malformed email (no @ symbol)', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'notanemail' }),
    }, env);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/valid email/i);
  });

  it('returns 400 for malformed email (no domain)', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@' }),
    }, env);
    expect(res.status).toBe(400);
  });

  it('returns 400 for malformed email (spaces in address)', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: null });
    const { app, env } = makeTemplateApp(db);
    const res = await app.request('/templates/premium-dashboard/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user name@example.com' }),
    }, env);
    expect(res.status).toBe(400);
  });

  it('accepts valid email addresses', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: null });
    const { app, env } = makeTemplateApp(db);
    const validEmails = ['user@example.com', 'a+b@sub.domain.ng', 'test.email@company.co.uk'];
    for (const email of validEmails) {
      const res = await app.request('/templates/premium-dashboard/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }, env);
      expect(res.status).toBe(201);
    }
  });

  it('does not call initializePayment for invalid email', async () => {
    const db = makeDB({ template: PAID_TEMPLATE, purchase: null });
    const { app, env } = makeTemplateApp(db);
    mockInitializePayment.mockClear();
    await app.request('/templates/premium-dashboard/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad-email' }),
    }, env);
    expect(mockInitializePayment).not.toHaveBeenCalled();
  });
});
