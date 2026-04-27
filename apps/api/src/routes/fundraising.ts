/**
 * Fundraising routes — shared engine (political, church, NGO, personal, emergency)
 *
 * Operations (auth required, T3 tenant from JWT):
 *   POST   /fundraising/campaigns                              — create campaign
 *   PATCH  /fundraising/campaigns/:id                         — update campaign
 *   POST   /fundraising/campaigns/:id/publish                 — activate (admin/ops)
 *   POST   /fundraising/campaigns/:id/moderate                — platform moderation
 *   GET    /fundraising/campaigns                             — list workspace campaigns
 *   GET    /fundraising/campaigns/:idOrSlug                   — get campaign
 *   POST   /fundraising/campaigns/:id/contributions           — record contribution
 *   POST   /fundraising/campaigns/:id/contributions/:cId/confirm — confirm via Paystack
 *   GET    /fundraising/campaigns/:id/contributions           — list contributions
 *   POST   /fundraising/campaigns/:id/pledges                 — create pledge
 *   POST   /fundraising/campaigns/:id/milestones              — add milestone
 *   GET    /fundraising/campaigns/:id/milestones              — list milestones
 *   POST   /fundraising/campaigns/:id/updates                 — post update
 *   GET    /fundraising/campaigns/:id/updates                 — list updates
 *   POST   /fundraising/campaigns/:id/rewards                 — create reward
 *   POST   /fundraising/campaigns/:id/payout-requests         — request payout
 *   GET    /fundraising/campaigns/:id/payout-requests         — list payout requests
 *   POST   /fundraising/campaigns/:id/payout-requests/:prId/approve — HITL approve
 *   POST   /fundraising/campaigns/:id/payout-requests/:prId/reject  — HITL reject
 *   POST   /fundraising/campaigns/:id/compliance              — add compliance declaration
 *   GET    /fundraising/campaigns/:id/stats                   — campaign stats
 *
 * Discovery (public, header-based tenant):
 *   GET    /fundraising/public                                — public campaigns
 *   GET    /fundraising/public/:idOrSlug                      — public campaign profile
 *   GET    /fundraising/public/:id/donor-wall                 — donor wall
 *
 * Compliance:
 *   [A1] INEC cap enforced on createContribution (₦50m per-contributor for political/election campaigns)
 *   [A2] Payout via Paystack Transfers — HITL required for political/election campaigns
 *   P9   — amountKobo must be a positive integer; validated in repository layer
 *   P13  — donor_phone and bank_account_number are never logged or forwarded to AI
 *   T3   — tenant_id from JWT on all auth routes; X-Tenant-Id header on public routes
 */

import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import { publishEvent } from '../lib/publish-event.js';
import { FundraisingEventType } from '@webwaka/events';
import {
  createCampaign,
  getCampaign,
  listCampaigns,
  listPublicCampaigns,
  updateCampaign,
  moderateCampaign,
  createContribution,
  confirmContribution,
  listContributions,
  getDonorWall,
  createPledge,
  createMilestone,
  listMilestones,
  createUpdate,
  listUpdates,
  createReward,
  createPayoutRequest,
  approvePayoutRequest,
  rejectPayoutRequest,
  listPayoutRequests,
  addComplianceDeclaration,
  getCampaignStats,
  checkInecCap,
  INEC_DEFAULT_CAP_KOBO,
  assertCampaignCreationAllowed,
  assertPayoutsEnabled,
  assertPledgesEnabled,
  assertRewardsEnabled,
  FREE_FUNDRAISING_ENTITLEMENTS,
  STARTER_FUNDRAISING_ENTITLEMENTS,
  GROWTH_FUNDRAISING_ENTITLEMENTS,
  PRO_FUNDRAISING_ENTITLEMENTS,
  ENTERPRISE_FUNDRAISING_ENTITLEMENTS,
  PARTNER_FUNDRAISING_ENTITLEMENTS,
  SUB_PARTNER_FUNDRAISING_ENTITLEMENTS,
  type FundraisingEntitlements,
} from '@webwaka/fundraising';
import { indexFundraisingCampaign } from '../lib/search-index.js';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };
type D1Like = Env['DB'];

function getTenantIdFromHeader(c: { req: { header(name: string): string | undefined } }): string | null {
  return c.req.header('X-Tenant-Id') ?? null;
}

function getEntitlements(plan: string): FundraisingEntitlements {
  switch (plan) {
    case 'starter':     return STARTER_FUNDRAISING_ENTITLEMENTS;
    case 'growth':      return GROWTH_FUNDRAISING_ENTITLEMENTS;
    case 'pro':         return PRO_FUNDRAISING_ENTITLEMENTS;
    case 'enterprise':  return ENTERPRISE_FUNDRAISING_ENTITLEMENTS;
    case 'partner':     return PARTNER_FUNDRAISING_ENTITLEMENTS;
    case 'sub_partner': return SUB_PARTNER_FUNDRAISING_ENTITLEMENTS;
    default:            return FREE_FUNDRAISING_ENTITLEMENTS;
  }
}

export const fundraisingRoutes = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Public (discovery) — registered BEFORE /:id catch-all
// ---------------------------------------------------------------------------

fundraisingRoutes.get('/public', async (c) => {
  const tenantId = getTenantIdFromHeader(c);
  if (!tenantId) return c.json({ error: 'X-Tenant-Id header required' }, 400);

  const db = c.env.DB as unknown as D1Like;
  const q = c.req.query;
  const campaigns = await listPublicCampaigns(db as never, {
    tenantId,
    campaignType:   q('campaign_type') ?? undefined,
    supportGroupId: q('support_group_id') ?? undefined,
    limit:  parseInt(q('limit')  ?? '50', 10),
    offset: parseInt(q('offset') ?? '0',  10),
  });
  return c.json({ campaigns });
});

fundraisingRoutes.get('/public/:idOrSlug', async (c) => {
  const tenantId = getTenantIdFromHeader(c);
  if (!tenantId) return c.json({ error: 'X-Tenant-Id header required' }, 400);

  const db = c.env.DB as unknown as D1Like;
  const campaign = await getCampaign(db as never, c.req.param('idOrSlug'), tenantId);
  if (!campaign || campaign.visibility !== 'public') return c.json({ error: 'NOT_FOUND' }, 404);

  const { hitlRequired: _, moderationNote: _mn, moderatedBy: _mb, ...publicCampaign } = campaign;
  return c.json({ campaign: publicCampaign });
});

fundraisingRoutes.get('/public/:id/donor-wall', async (c) => {
  const tenantId = getTenantIdFromHeader(c);
  if (!tenantId) return c.json({ error: 'X-Tenant-Id header required' }, 400);

  const db = c.env.DB as unknown as D1Like;
  const campaign = await getCampaign(db as never, c.req.param('id'), tenantId);
  if (!campaign || campaign.visibility !== 'public') return c.json({ error: 'NOT_FOUND' }, 404);
  if (!campaign.donorWallEnabled) return c.json({ error: 'DONOR_WALL_DISABLED' }, 403);

  const entries = await getDonorWall(db as never, c.req.param('id'), tenantId,
    parseInt(c.req.query('limit') ?? '20', 10));
  return c.json({ entries });
});

// ---------------------------------------------------------------------------
// Authenticated operations
// ---------------------------------------------------------------------------

const createCampaignSchema = z.object({
  title:           z.string().min(2).max(200),
  slug:            z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  description:     z.string().min(1).max(2000),
  story:           z.string().max(10000).optional(),
  campaignType:    z.enum(['general','political','emergency','community','election','church','ngo','personal','education','health']).optional(),
  goalKobo:        z.number().int().min(0).optional(),
  currencyCode:    z.string().length(3).optional(),
  beneficiaryName: z.string().min(1).max(200),
  beneficiaryWorkspaceId: z.string().optional(),
  coverImageUrl:   z.string().url().optional(),
  visibility:      z.enum(['public','private','unlisted']).optional(),
  endsAt:          z.number().int().optional(),
  inecCapKobo:     z.number().int().min(0).optional(),
  inecDisclosureRequired: z.boolean().optional(),
  ndprConsentRequired:    z.boolean().optional(),
  donorWallEnabled:       z.boolean().optional(),
  anonymousAllowed:       z.boolean().optional(),
  rewardsEnabled:         z.boolean().optional(),
  supportGroupId:  z.string().optional(),
});

fundraisingRoutes.post('/campaigns', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, plan = 'free' } = auth as AuthContext & { plan?: string };
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const parsed = createCampaignSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const ents = getEntitlements(plan);
  const existing = await (db as unknown as { prepare: (q: string) => { bind: (...a: unknown[]) => { first: <T>() => Promise<T | null> } } })
    .prepare(`SELECT COUNT(*) as cnt FROM fundraising_campaigns WHERE workspace_id = ? AND tenant_id = ? AND status = 'active'`)
    .bind(workspaceId, tenantId)
    .first<{ cnt: number }>();
  assertCampaignCreationAllowed(existing?.cnt ?? 0, ents);

  try {
    const campaign = await createCampaign(db as never, { workspaceId, tenantId, ...parsed.data });

    try {
      await indexFundraisingCampaign(db as never, {
        id: campaign.id, title: campaign.title, tenantId, workspaceId,
        campaignType: campaign.campaignType, slug: campaign.slug, visibility: campaign.visibility,
        supportGroupId: campaign.supportGroupId,
      });
    } catch { /* non-fatal */ }

    await publishEvent(c.env, {
      aggregate: 'fundraising_campaign', aggregateId: campaign.id,
      eventType: FundraisingEventType.FundraisingCampaignCreated,
      tenantId, payload: { campaignId: campaign.id, title: campaign.title, campaignType: campaign.campaignType },
    });

    return c.json({ campaign }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create campaign';
    if (msg.includes('UNIQUE')) return c.json({ error: 'SLUG_CONFLICT', message: 'Slug already in use' }, 409);
    return c.json({ error: msg }, 400);
  }
});

fundraisingRoutes.get('/campaigns', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const campaigns = await listCampaigns(db as never, {
    workspaceId, tenantId,
    status:       c.req.query('status') ?? undefined,
    campaignType: c.req.query('campaign_type') ?? undefined,
    limit:  parseInt(c.req.query('limit')  ?? '50', 10),
    offset: parseInt(c.req.query('offset') ?? '0',  10),
  });
  return c.json({ campaigns });
});

fundraisingRoutes.get('/campaigns/:idOrSlug', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const campaign = await getCampaign(db as never, c.req.param('idOrSlug'), tenantId);
  if (!campaign) return c.json({ error: 'NOT_FOUND' }, 404);
  return c.json({ campaign });
});

const updateCampaignSchema = z.object({
  title:             z.string().min(2).max(200).optional(),
  description:       z.string().min(1).max(2000).optional(),
  story:             z.string().max(10000).optional(),
  goalKobo:          z.number().int().min(0).optional(),
  coverImageUrl:     z.string().url().optional(),
  visibility:        z.enum(['public','private','unlisted']).optional(),
  endsAt:            z.number().int().optional(),
  status:            z.enum(['draft','pending_review','active','paused','completed','cancelled']).optional(),
  donorWallEnabled:  z.boolean().optional(),
  anonymousAllowed:  z.boolean().optional(),
  rewardsEnabled:    z.boolean().optional(),
});

fundraisingRoutes.patch('/campaigns/:id', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const parsed = updateCampaignSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  await updateCampaign(db as never, c.req.param('id'), tenantId, parsed.data);

  const updated = await getCampaign(db as never, c.req.param('id'), tenantId);
  if (!updated) return c.json({ error: 'NOT_FOUND' }, 404);

  try {
    await indexFundraisingCampaign(db as never, {
      id: updated.id, title: updated.title, tenantId, workspaceId: updated.workspaceId,
      campaignType: updated.campaignType, slug: updated.slug, visibility: updated.visibility,
      supportGroupId: updated.supportGroupId,
    });
  } catch { /* non-fatal */ }

  return c.json({ campaign: updated });
});

fundraisingRoutes.post('/campaigns/:id/publish', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  await updateCampaign(db as never, c.req.param('id'), tenantId, { status: 'active' });

  const campaign = await getCampaign(db as never, c.req.param('id'), tenantId);
  if (!campaign) return c.json({ error: 'NOT_FOUND' }, 404);

  await publishEvent(c.env, {
    aggregate: 'fundraising_campaign', aggregateId: campaign.id,
    eventType: FundraisingEventType.FundraisingCampaignApproved,
    tenantId, payload: { campaignId: campaign.id },
  });

  return c.json({ campaign });
});

fundraisingRoutes.post('/campaigns/:id/moderate', async (c) => {
  const auth = c.get('auth');
  const { tenantId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    action: z.enum(['active','rejected']),
    note:   z.string().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  await moderateCampaign(db as never, c.req.param('id'), tenantId, parsed.data.action, userId, parsed.data.note);

  await publishEvent(c.env, {
    aggregate: 'fundraising_campaign', aggregateId: c.req.param('id'),
    eventType: parsed.data.action === 'active'
      ? FundraisingEventType.FundraisingCampaignApproved
      : FundraisingEventType.FundraisingCampaignRejected,
    tenantId, payload: { campaignId: c.req.param('id'), moderatedBy: userId },
  });

  return c.json({ success: true });
});

// --- Contributions (P9: kobo; P13: donor_phone write-only in this context) ---

fundraisingRoutes.post('/campaigns/:id/contributions', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    donorPhone:      z.string().min(7).max(20),
    amountKobo:      z.number().int().positive('amountKobo must be a positive integer'),
    donorDisplayName: z.string().max(100).optional(),
    paystackRef:     z.string().optional(),
    paymentChannel:  z.enum(['card','bank_transfer','ussd','mobile_money']).optional(),
    isAnonymous:     z.boolean().optional(),
    ndprConsented:   z.boolean(),
    pledgeId:        z.string().optional(),
    rewardId:        z.string().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const campaign = await getCampaign(db as never, c.req.param('id'), tenantId);
  if (!campaign) return c.json({ error: 'NOT_FOUND' }, 404);
  if (campaign.status !== 'active') return c.json({ error: 'CAMPAIGN_NOT_ACTIVE' }, 400);

  // [A1] INEC cap check — only for political/election campaigns
  if (campaign.inecCapKobo > 0) {
    const existingTotal = await (db as unknown as { prepare: (q: string) => { bind: (...a: unknown[]) => { first: <T>() => Promise<T | null> } } })
      .prepare(`SELECT COALESCE(SUM(amount_kobo),0) as total FROM fundraising_contributions
                WHERE campaign_id = ? AND tenant_id = ? AND donor_phone = ? AND status = 'confirmed'`)
      .bind(c.req.param('id'), tenantId, parsed.data.donorPhone)
      .first<{ total: number }>();
    try {
      checkInecCap(parsed.data.amountKobo, campaign.inecCapKobo, existingTotal?.total ?? 0);
    } catch (err) {
      return c.json({ error: 'INEC_CAP_EXCEEDED', message: (err as Error).message }, 400);
    }
  }

  const contribution = await createContribution(db as never, {
    campaignId: c.req.param('id'), workspaceId, tenantId,
    donorUserId: userId, ...parsed.data,
  });

  await publishEvent(c.env, {
    aggregate: 'fundraising_campaign', aggregateId: c.req.param('id'),
    eventType: FundraisingEventType.FundraisingContributionReceived,
    tenantId, payload: { contributionId: contribution.id, amountKobo: contribution.amountKobo },
    // P13: donor_phone deliberately omitted from event payload
  });

  // Strip P13 fields from response
  const { donorPhone: _phone, ...safeContribution } = contribution;
  return c.json({ contribution: safeContribution }, 201);
});

fundraisingRoutes.post('/campaigns/:id/contributions/:cId/confirm', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const schema = z.object({ paystackRef: z.string().min(1) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  await confirmContribution(db as never, c.req.param('cId'), tenantId, parsed.data.paystackRef);

  await publishEvent(c.env, {
    aggregate: 'fundraising_campaign', aggregateId: c.req.param('id'),
    eventType: FundraisingEventType.FundraisingContributionConfirmed,
    tenantId, payload: { contributionId: c.req.param('cId'), paystackRef: parsed.data.paystackRef },
  });

  return c.json({ success: true });
});

fundraisingRoutes.get('/campaigns/:id/contributions', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const contributions = await listContributions(db as never, c.req.param('id'), tenantId, {
    status: c.req.query('status') ?? undefined,
    limit:  parseInt(c.req.query('limit')  ?? '50', 10),
    offset: parseInt(c.req.query('offset') ?? '0',  10),
  });
  // P13: strip donorPhone before returning to calling admin
  return c.json({ contributions: contributions.map(({ donorPhone: _p, ...rest }) => rest) });
});

// --- Pledges ---

fundraisingRoutes.post('/campaigns/:id/pledges', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, userId, plan = 'free' } = auth as AuthContext & { plan?: string };
  const db = c.env.DB as unknown as D1Like;

  assertPledgesEnabled(getEntitlements(plan));

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    pledgerPhone: z.string().min(7).max(20),
    amountKobo:  z.number().int().positive(),
    frequency:   z.enum(['one_time','weekly','monthly','quarterly','annual']).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const pledge = await createPledge(db as never, {
    campaignId: c.req.param('id'), workspaceId, tenantId,
    pledgerUserId: userId, ...parsed.data,
  });

  await publishEvent(c.env, {
    aggregate: 'fundraising_campaign', aggregateId: c.req.param('id'),
    eventType: FundraisingEventType.FundraisingPledgeCreated,
    tenantId, payload: { pledgeId: pledge.id, amountKobo: pledge.amountKobo, frequency: pledge.frequency },
    // P13: pledgerPhone omitted from event payload
  });

  const { pledgerPhone: _p, ...safePledge } = pledge;
  return c.json({ pledge: safePledge }, 201);
});

// --- Milestones ---

fundraisingRoutes.post('/campaigns/:id/milestones', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    title:       z.string().min(1).max(200),
    targetKobo:  z.number().int().positive(),
    description: z.string().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const milestone = await createMilestone(db as never, {
    campaignId: c.req.param('id'), workspaceId, tenantId, ...parsed.data,
  });
  return c.json({ milestone }, 201);
});

fundraisingRoutes.get('/campaigns/:id/milestones', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const milestones = await listMilestones(db as never, c.req.param('id'), tenantId);
  return c.json({ milestones });
});

// --- Updates ---

fundraisingRoutes.post('/campaigns/:id/updates', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    title:      z.string().min(1).max(200),
    body:       z.string().min(1).max(10000),
    mediaUrl:   z.string().url().optional(),
    visibility: z.enum(['all','donors_only']).optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const update = await createUpdate(db as never, {
    campaignId: c.req.param('id'), workspaceId, tenantId, postedBy: userId, ...parsed.data,
  });

  await publishEvent(c.env, {
    aggregate: 'fundraising_campaign', aggregateId: c.req.param('id'),
    eventType: FundraisingEventType.FundraisingUpdatePosted,
    tenantId, payload: { updateId: update.id },
  });

  return c.json({ update }, 201);
});

fundraisingRoutes.get('/campaigns/:id/updates', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const updates = await listUpdates(db as never, c.req.param('id'), tenantId, 'all',
    parseInt(c.req.query('limit')  ?? '20', 10),
    parseInt(c.req.query('offset') ?? '0',  10));
  return c.json({ updates });
});

// --- Rewards ---

fundraisingRoutes.post('/campaigns/:id/rewards', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, plan = 'free' } = auth as AuthContext & { plan?: string };
  const db = c.env.DB as unknown as D1Like;

  assertRewardsEnabled(getEntitlements(plan));

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    title:          z.string().min(1).max(200),
    description:    z.string().optional(),
    minAmountKobo:  z.number().int().positive(),
    quantity:       z.number().int().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const reward = await createReward(db as never, { campaignId: c.req.param('id'), workspaceId, tenantId, ...parsed.data });
  return c.json({ reward }, 201);
});

// --- Payout requests ([A2] Paystack Transfers, HITL for political) ---

fundraisingRoutes.post('/campaigns/:id/payout-requests', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, userId, plan = 'free' } = auth as AuthContext & { plan?: string };
  const db = c.env.DB as unknown as D1Like;

  assertPayoutsEnabled(getEntitlements(plan));

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    amountKobo:       z.number().int().positive(),
    bankAccountName:  z.string().min(1).max(200),
    bankAccountNumber: z.string().min(10).max(10),
    bankCode:         z.string().min(3).max(10),
    reason:           z.string().min(1).max(1000),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const payoutRequest = await createPayoutRequest(db as never, {
    campaignId: c.req.param('id'), workspaceId, tenantId, requestedBy: userId, ...parsed.data,
  });

  await publishEvent(c.env, {
    aggregate: 'fundraising_campaign', aggregateId: c.req.param('id'),
    eventType: FundraisingEventType.FundraisingPayoutRequested,
    tenantId, payload: { payoutRequestId: payoutRequest.id, amountKobo: payoutRequest.amountKobo,
      hitlRequired: payoutRequest.hitlRequired },
    // P13: bankAccountNumber stripped (already masked in repository output)
  });

  const { bankAccountNumber: _acct, ...safePayout } = payoutRequest;
  return c.json({ payoutRequest: safePayout }, 201);
});

fundraisingRoutes.get('/campaigns/:id/payout-requests', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const requests = await listPayoutRequests(db as never, c.req.param('id'), tenantId, {
    hitlStatus: c.req.query('hitl_status') ?? undefined,
    status:     c.req.query('status') ?? undefined,
  });
  return c.json({ requests });
});

fundraisingRoutes.post('/campaigns/:id/payout-requests/:prId/approve', async (c) => {
  const auth = c.get('auth');
  const { tenantId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => ({}));
  const note = (body as { note?: string }).note;
  await approvePayoutRequest(db as never, c.req.param('prId'), tenantId, userId, note);

  await publishEvent(c.env, {
    aggregate: 'fundraising_campaign', aggregateId: c.req.param('id'),
    eventType: FundraisingEventType.FundraisingPayoutApproved,
    tenantId, payload: { payoutRequestId: c.req.param('prId'), reviewerId: userId },
  });

  return c.json({ success: true });
});

fundraisingRoutes.post('/campaigns/:id/payout-requests/:prId/reject', async (c) => {
  const auth = c.get('auth');
  const { tenantId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const schema = z.object({ note: z.string().min(1) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  await rejectPayoutRequest(db as never, c.req.param('prId'), tenantId, userId, parsed.data.note);

  await publishEvent(c.env, {
    aggregate: 'fundraising_campaign', aggregateId: c.req.param('id'),
    eventType: FundraisingEventType.FundraisingPayoutRejected,
    tenantId, payload: { payoutRequestId: c.req.param('prId'), reviewerId: userId, note: parsed.data.note },
  });

  return c.json({ success: true });
});

// --- Compliance declarations ---

fundraisingRoutes.post('/campaigns/:id/compliance', async (c) => {
  const auth = c.get('auth');
  const { tenantId, workspaceId, userId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json().catch(() => null);
  const schema = z.object({
    declarationType: z.enum(['inec_political','cbn_psp_exempt','ndpr_dpa','church_tithe_migration','ngo_it_exempt']),
    referenceDoc:    z.string().url().optional(),
    notes:           z.string().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'VALIDATION_FAILED', issues: parsed.error.issues }, 400);

  const declaration = await addComplianceDeclaration(db as never, {
    campaignId: c.req.param('id'), workspaceId, tenantId, declaredBy: userId, ...parsed.data,
  });
  return c.json({ declaration }, 201);
});

// --- Stats ---

fundraisingRoutes.get('/campaigns/:id/stats', async (c) => {
  const auth = c.get('auth');
  const { tenantId } = auth as AuthContext;
  const db = c.env.DB as unknown as D1Like;

  const stats = await getCampaignStats(db as never, c.req.param('id'), tenantId);
  return c.json({ stats });
});
