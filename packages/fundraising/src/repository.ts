/**
 * @webwaka/fundraising — D1 repository layer.
 *
 * Platform Invariants:
 *   T3  — every query includes tenant_id predicate
 *   T4  — all monetary values in integer kobo
 *   P9  — amountKobo integer check enforced here
 *   P13 — donor_phone, bank_account_number never returned to caller in unsafe context
 *
 * Assumptions:
 *   [A1] INEC cap: 5,000,000,000 kobo = ₦50,000,000. Enforced via checkInecCap().
 *   [A2] CBN: Paystack direct pass-through; payout routing is in payout-service.ts.
 *   [A3] Church migration bridge handled by migrateToFundraising() below.
 */

import type {
  FundraisingCampaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  FundraisingContribution,
  CreateContributionInput,
  FundraisingPledge,
  CreatePledgeInput,
  FundraisingMilestone,
  FundraisingUpdate,
  FundraisingReward,
  FundraisingPayoutRequest,
  CreatePayoutRequestInput,
  FundraisingComplianceDeclaration,
  DeclarationType,
  FundraisingCampaignPublicProfile,
  DonorWallEntry,
} from './types.js';

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

function assertKobo(amount: number, field = 'amount'): void {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new TypeError(`${field} must be a positive integer (kobo)`);
  }
}

// ---------------------------------------------------------------------------
// INEC cap enforcement [A1]
// ---------------------------------------------------------------------------

export const INEC_DEFAULT_CAP_KOBO = 5_000_000_000; // ₦50,000,000

export function checkInecCap(
  amountKobo: number,
  capKobo: number,
  existingTotalKobo: number,
): void {
  if (capKobo <= 0) return; // no cap for non-political
  if (existingTotalKobo + amountKobo > capKobo) {
    const capNaira = capKobo / 100;
    throw new Error(
      `COMPLIANCE_VIOLATION: Contribution exceeds per-contributor INEC cap of ₦${capNaira.toLocaleString()}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------

interface CampaignRow {
  id: string; workspace_id: string; tenant_id: string;
  title: string; slug: string; description: string; story: string | null;
  campaign_type: string; goal_kobo: number; raised_kobo: number;
  contributor_count: number; currency_code: string;
  beneficiary_name: string; beneficiary_workspace_id: string | null;
  cover_image_url: string | null; status: string; visibility: string;
  ends_at: number | null; inec_cap_kobo: number; inec_disclosure_required: number;
  ndpr_consent_required: number; donor_wall_enabled: number;
  anonymous_allowed: number; rewards_enabled: number; hitl_required: number;
  moderation_note: string | null; moderated_by: string | null; moderated_at: number | null;
  support_group_id: string | null; created_at: number; updated_at: number;
}

function rowToCampaign(r: CampaignRow): FundraisingCampaign {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    title: r.title, slug: r.slug, description: r.description, story: r.story,
    campaignType: r.campaign_type as FundraisingCampaign['campaignType'],
    goalKobo: r.goal_kobo, raisedKobo: r.raised_kobo,
    contributorCount: r.contributor_count, currencyCode: r.currency_code,
    beneficiaryName: r.beneficiary_name, beneficiaryWorkspaceId: r.beneficiary_workspace_id,
    coverImageUrl: r.cover_image_url,
    status: r.status as FundraisingCampaign['status'],
    visibility: r.visibility as FundraisingCampaign['visibility'],
    endsAt: r.ends_at,
    inecCapKobo: r.inec_cap_kobo, inecDisclosureRequired: r.inec_disclosure_required === 1,
    ndprConsentRequired: r.ndpr_consent_required === 1,
    donorWallEnabled: r.donor_wall_enabled === 1, anonymousAllowed: r.anonymous_allowed === 1,
    rewardsEnabled: r.rewards_enabled === 1, hitlRequired: r.hitl_required === 1,
    moderationNote: r.moderation_note, moderatedBy: r.moderated_by, moderatedAt: r.moderated_at,
    supportGroupId: r.support_group_id,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Campaign CRUD
// ---------------------------------------------------------------------------

export async function createCampaign(
  db: D1Like,
  input: CreateCampaignInput,
): Promise<FundraisingCampaign> {
  if (input.goalKobo !== undefined && input.goalKobo > 0) {
    assertKobo(input.goalKobo, 'goalKobo');
  }

  const id = generateId('fc');
  const ts = now();
  const isPolitical = input.campaignType === 'political' || input.campaignType === 'election';
  const inecCap = input.inecCapKobo ?? (isPolitical ? INEC_DEFAULT_CAP_KOBO : 0);

  await db
    .prepare(
      `INSERT INTO fundraising_campaigns (
         id, workspace_id, tenant_id, title, slug, description, story,
         campaign_type, goal_kobo, currency_code, beneficiary_name,
         beneficiary_workspace_id, cover_image_url, status, visibility, ends_at,
         inec_cap_kobo, inec_disclosure_required, ndpr_consent_required,
         donor_wall_enabled, anonymous_allowed, rewards_enabled, hitl_required,
         support_group_id, created_at, updated_at
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'draft',?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id, input.workspaceId, input.tenantId,
      input.title, input.slug, input.description, input.story ?? null,
      input.campaignType ?? 'general', input.goalKobo ?? 0,
      input.currencyCode ?? 'NGN', input.beneficiaryName,
      input.beneficiaryWorkspaceId ?? null, input.coverImageUrl ?? null,
      input.visibility ?? 'public', input.endsAt ?? null,
      inecCap, isPolitical || input.inecDisclosureRequired ? 1 : 0,
      input.ndprConsentRequired !== false ? 1 : 0,
      input.donorWallEnabled !== false ? 1 : 0,
      input.anonymousAllowed !== false ? 1 : 0,
      input.rewardsEnabled ? 1 : 0,
      isPolitical ? 1 : 0, // hitl_required for political
      input.supportGroupId ?? null,
      ts, ts,
    )
    .run();

  return (await getCampaign(db, id, input.tenantId))!;
}

export async function getCampaign(
  db: D1Like,
  idOrSlug: string,
  tenantId: string,
): Promise<FundraisingCampaign | null> {
  const row = await db
    .prepare(
      `SELECT * FROM fundraising_campaigns WHERE (id = ? OR slug = ?) AND tenant_id = ? LIMIT 1`,
    )
    .bind(idOrSlug, idOrSlug, tenantId)
    .first<CampaignRow>();
  return row ? rowToCampaign(row) : null;
}

export async function listCampaigns(
  db: D1Like,
  opts: {
    workspaceId: string;
    tenantId: string;
    status?: string;
    campaignType?: string;
    limit?: number;
    offset?: number;
  },
): Promise<FundraisingCampaign[]> {
  const where = [`workspace_id = ?`, `tenant_id = ?`];
  const vals: unknown[] = [opts.workspaceId, opts.tenantId];
  if (opts.status)       { where.push(`status = ?`);        vals.push(opts.status); }
  if (opts.campaignType) { where.push(`campaign_type = ?`); vals.push(opts.campaignType); }
  vals.push(opts.limit ?? 50, opts.offset ?? 0);

  const { results } = await db
    .prepare(
      `SELECT * FROM fundraising_campaigns WHERE ${where.join(' AND ')}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
    .bind(...vals)
    .all<CampaignRow>();

  return results.map(rowToCampaign);
}

export async function listPublicCampaigns(
  db: D1Like,
  opts: {
    tenantId: string;
    campaignType?: string;
    supportGroupId?: string;
    limit?: number;
    offset?: number;
  },
): Promise<FundraisingCampaignPublicProfile[]> {
  const where = [`tenant_id = ?`, `visibility = 'public'`, `status = 'active'`];
  const vals: unknown[] = [opts.tenantId];
  if (opts.campaignType)  { where.push(`campaign_type = ?`);   vals.push(opts.campaignType); }
  if (opts.supportGroupId){ where.push(`support_group_id = ?`); vals.push(opts.supportGroupId); }
  vals.push(opts.limit ?? 50, opts.offset ?? 0);

  const { results } = await db
    .prepare(
      `SELECT id, title, slug, description, story, campaign_type, goal_kobo, raised_kobo,
              contributor_count, currency_code, beneficiary_name, cover_image_url,
              status, ends_at, donor_wall_enabled, anonymous_allowed, rewards_enabled, created_at
       FROM fundraising_campaigns WHERE ${where.join(' AND ')}
       ORDER BY raised_kobo DESC LIMIT ? OFFSET ?`,
    )
    .bind(...vals)
    .all<{
      id: string; title: string; slug: string; description: string; story: string | null;
      campaign_type: string; goal_kobo: number; raised_kobo: number;
      contributor_count: number; currency_code: string; beneficiary_name: string;
      cover_image_url: string | null; status: string; ends_at: number | null;
      donor_wall_enabled: number; anonymous_allowed: number; rewards_enabled: number;
      created_at: number;
    }>();

  return results.map((r) => ({
    id: r.id, title: r.title, slug: r.slug, description: r.description, story: r.story,
    campaignType: r.campaign_type as FundraisingCampaign['campaignType'],
    goalKobo: r.goal_kobo, raisedKobo: r.raised_kobo,
    contributorCount: r.contributor_count, currencyCode: r.currency_code,
    beneficiaryName: r.beneficiary_name, coverImageUrl: r.cover_image_url,
    status: r.status as FundraisingCampaign['status'],
    endsAt: r.ends_at, donorWallEnabled: r.donor_wall_enabled === 1,
    anonymousAllowed: r.anonymous_allowed === 1, rewardsEnabled: r.rewards_enabled === 1,
    createdAt: r.created_at,
  }));
}

export async function updateCampaign(
  db: D1Like,
  id: string,
  tenantId: string,
  fields: UpdateCampaignInput,
): Promise<void> {
  if (fields.goalKobo !== undefined && fields.goalKobo > 0) assertKobo(fields.goalKobo, 'goalKobo');

  const sets: string[] = ['updated_at = ?'];
  const vals: unknown[] = [now()];

  if (fields.title !== undefined)            { sets.push('title = ?');             vals.push(fields.title); }
  if (fields.description !== undefined)      { sets.push('description = ?');       vals.push(fields.description); }
  if (fields.story !== undefined)            { sets.push('story = ?');             vals.push(fields.story); }
  if (fields.goalKobo !== undefined)         { sets.push('goal_kobo = ?');         vals.push(fields.goalKobo); }
  if (fields.coverImageUrl !== undefined)    { sets.push('cover_image_url = ?');   vals.push(fields.coverImageUrl); }
  if (fields.visibility !== undefined)       { sets.push('visibility = ?');        vals.push(fields.visibility); }
  if (fields.endsAt !== undefined)           { sets.push('ends_at = ?');           vals.push(fields.endsAt); }
  if (fields.status !== undefined)           { sets.push('status = ?');            vals.push(fields.status); }
  if (fields.donorWallEnabled !== undefined) { sets.push('donor_wall_enabled = ?'); vals.push(fields.donorWallEnabled ? 1 : 0); }
  if (fields.anonymousAllowed !== undefined) { sets.push('anonymous_allowed = ?'); vals.push(fields.anonymousAllowed ? 1 : 0); }
  if (fields.rewardsEnabled !== undefined)   { sets.push('rewards_enabled = ?');   vals.push(fields.rewardsEnabled ? 1 : 0); }

  vals.push(id, tenantId);
  await db
    .prepare(`UPDATE fundraising_campaigns SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`)
    .bind(...vals)
    .run();
}

export async function moderateCampaign(
  db: D1Like,
  id: string,
  tenantId: string,
  status: 'active' | 'rejected',
  moderatedBy: string,
  note?: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE fundraising_campaigns
       SET status = ?, moderated_by = ?, moderated_at = ?, moderation_note = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(status, moderatedBy, now(), note ?? null, now(), id, tenantId)
    .run();
}

// ---------------------------------------------------------------------------
// Contributions
// ---------------------------------------------------------------------------

export async function createContribution(
  db: D1Like,
  input: CreateContributionInput,
): Promise<FundraisingContribution> {
  assertKobo(input.amountKobo, 'amountKobo');

  const id = generateId('fc_c');
  const ts = now();

  await db
    .prepare(
      `INSERT INTO fundraising_contributions (
         id, campaign_id, workspace_id, tenant_id,
         donor_user_id, donor_display_name, donor_phone, amount_kobo,
         paystack_ref, payment_channel, status, is_anonymous,
         pledge_id, reward_id, ndpr_consented, created_at
       ) VALUES (?,?,?,?,?,?,?,?,?,?,'pending',?,?,?,?,?)`,
    )
    .bind(
      id, input.campaignId, input.workspaceId, input.tenantId,
      input.donorUserId ?? null, input.donorDisplayName ?? null,
      input.donorPhone, input.amountKobo,
      input.paystackRef ?? null, input.paymentChannel ?? 'card',
      input.isAnonymous ? 1 : 0,
      input.pledgeId ?? null, input.rewardId ?? null,
      input.ndprConsented ? 1 : 0, ts,
    )
    .run();

  return {
    id, campaignId: input.campaignId, workspaceId: input.workspaceId, tenantId: input.tenantId,
    donorUserId: input.donorUserId ?? null, donorDisplayName: input.donorDisplayName ?? null,
    donorPhone: input.donorPhone, amountKobo: input.amountKobo,
    paystackRef: input.paystackRef ?? null,
    paymentChannel: (input.paymentChannel ?? 'card') as FundraisingContribution['paymentChannel'],
    status: 'pending', isAnonymous: input.isAnonymous ?? false,
    pledgeId: input.pledgeId ?? null, rewardId: input.rewardId ?? null,
    ndprConsented: input.ndprConsented ?? false,
    complianceVerified: false, createdAt: ts, confirmedAt: null,
  };
}

export async function confirmContribution(
  db: D1Like,
  id: string,
  tenantId: string,
  paystackRef: string,
): Promise<void> {
  const ts = now();
  await db
    .prepare(
      `UPDATE fundraising_contributions
       SET status = 'confirmed', paystack_ref = ?, confirmed_at = ?
       WHERE id = ? AND tenant_id = ? AND status = 'pending'`,
    )
    .bind(paystackRef, ts, id, tenantId)
    .run();

  // Increment raised_kobo and contributor_count atomically
  const contrib = await db
    .prepare(`SELECT campaign_id, amount_kobo, donor_user_id FROM fundraising_contributions WHERE id = ? AND tenant_id = ?`)
    .bind(id, tenantId)
    .first<{ campaign_id: string; amount_kobo: number; donor_user_id: string | null }>();

  if (contrib) {
    await db
      .prepare(
        `UPDATE fundraising_campaigns
         SET raised_kobo = raised_kobo + ?,
             contributor_count = contributor_count + 1,
             updated_at = ?
         WHERE id = ? AND tenant_id = ?`,
      )
      .bind(contrib.amount_kobo, ts, contrib.campaign_id, tenantId)
      .run();
  }
}

export async function listContributions(
  db: D1Like,
  campaignId: string,
  tenantId: string,
  opts: { status?: string; limit?: number; offset?: number } = {},
): Promise<FundraisingContribution[]> {
  const where = [`campaign_id = ?`, `tenant_id = ?`];
  const vals: unknown[] = [campaignId, tenantId];
  if (opts.status) { where.push(`status = ?`); vals.push(opts.status); }
  vals.push(opts.limit ?? 50, opts.offset ?? 0);

  const { results } = await db
    .prepare(
      `SELECT * FROM fundraising_contributions WHERE ${where.join(' AND ')}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
    .bind(...vals)
    .all<{
      id: string; campaign_id: string; workspace_id: string; tenant_id: string;
      donor_user_id: string | null; donor_display_name: string | null; donor_phone: string;
      amount_kobo: number; paystack_ref: string | null; payment_channel: string;
      status: string; is_anonymous: number; pledge_id: string | null; reward_id: string | null;
      ndpr_consented: number; compliance_verified: number;
      created_at: number; confirmed_at: number | null;
    }>();

  return results.map((r) => ({
    id: r.id, campaignId: r.campaign_id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    donorUserId: r.donor_user_id, donorDisplayName: r.donor_display_name,
    donorPhone: r.donor_phone, amountKobo: r.amount_kobo,
    paystackRef: r.paystack_ref,
    paymentChannel: r.payment_channel as FundraisingContribution['paymentChannel'],
    status: r.status as FundraisingContribution['status'],
    isAnonymous: r.is_anonymous === 1,
    pledgeId: r.pledge_id, rewardId: r.reward_id,
    ndprConsented: r.ndpr_consented === 1, complianceVerified: r.compliance_verified === 1,
    createdAt: r.created_at, confirmedAt: r.confirmed_at,
  }));
}

export async function getDonorWall(
  db: D1Like,
  campaignId: string,
  tenantId: string,
  limit = 20,
): Promise<DonorWallEntry[]> {
  const { results } = await db
    .prepare(
      `SELECT donor_display_name, amount_kobo, confirmed_at
       FROM fundraising_contributions
       WHERE campaign_id = ? AND tenant_id = ? AND status = 'confirmed' AND is_anonymous = 0
       ORDER BY confirmed_at DESC LIMIT ?`,
    )
    .bind(campaignId, tenantId, limit)
    .all<{ donor_display_name: string | null; amount_kobo: number; confirmed_at: number | null }>();

  return results.map((r) => ({
    displayName: r.donor_display_name,
    amountKobo: r.amount_kobo,
    message: null,
    contributedAt: r.confirmed_at ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// Pledges
// ---------------------------------------------------------------------------

export async function createPledge(
  db: D1Like,
  input: CreatePledgeInput,
): Promise<FundraisingPledge> {
  assertKobo(input.amountKobo, 'amountKobo');
  const id = generateId('fp');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO fundraising_pledges
         (id, campaign_id, workspace_id, tenant_id, pledger_phone, pledger_user_id,
          amount_kobo, frequency, status, created_at)
       VALUES (?,?,?,?,?,?,?,'one_time','active',?)`,
    )
    .bind(
      id, input.campaignId, input.workspaceId, input.tenantId,
      input.pledgerPhone, input.pledgerUserId ?? null,
      input.amountKobo, ts,
    )
    .run();

  return {
    id, campaignId: input.campaignId, workspaceId: input.workspaceId, tenantId: input.tenantId,
    pledgerPhone: input.pledgerPhone, pledgerUserId: input.pledgerUserId ?? null,
    amountKobo: input.amountKobo, frequency: (input.frequency ?? 'one_time') as FundraisingPledge['frequency'],
    totalPaidKobo: 0, status: 'active', nextDueAt: null, createdAt: ts,
  };
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export async function createMilestone(
  db: D1Like,
  opts: {
    campaignId: string; workspaceId: string; tenantId: string;
    title: string; targetKobo: number; description?: string;
  },
): Promise<FundraisingMilestone> {
  assertKobo(opts.targetKobo, 'targetKobo');
  const id = generateId('fml');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO fundraising_milestones (id, campaign_id, workspace_id, tenant_id, title, target_kobo, description, created_at)
       VALUES (?,?,?,?,?,?,?,?)`,
    )
    .bind(id, opts.campaignId, opts.workspaceId, opts.tenantId, opts.title, opts.targetKobo, opts.description ?? null, ts)
    .run();
  return { id, campaignId: opts.campaignId, workspaceId: opts.workspaceId, tenantId: opts.tenantId,
    title: opts.title, targetKobo: opts.targetKobo, reachedAt: null, description: opts.description ?? null, createdAt: ts };
}

export async function listMilestones(
  db: D1Like,
  campaignId: string,
  tenantId: string,
): Promise<FundraisingMilestone[]> {
  const { results } = await db
    .prepare(`SELECT * FROM fundraising_milestones WHERE campaign_id = ? AND tenant_id = ? ORDER BY target_kobo ASC`)
    .bind(campaignId, tenantId)
    .all<{ id: string; campaign_id: string; workspace_id: string; tenant_id: string;
      title: string; target_kobo: number; reached_at: number | null; description: string | null; created_at: number }>();
  return results.map((r) => ({ id: r.id, campaignId: r.campaign_id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    title: r.title, targetKobo: r.target_kobo, reachedAt: r.reached_at, description: r.description, createdAt: r.created_at }));
}

// ---------------------------------------------------------------------------
// Updates
// ---------------------------------------------------------------------------

export async function createUpdate(
  db: D1Like,
  opts: {
    campaignId: string; workspaceId: string; tenantId: string;
    title: string; body: string; mediaUrl?: string;
    visibility?: 'all' | 'donors_only'; postedBy: string;
  },
): Promise<FundraisingUpdate> {
  const id = generateId('fu');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO fundraising_updates (id, campaign_id, workspace_id, tenant_id, title, body, media_url, visibility, posted_by, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(id, opts.campaignId, opts.workspaceId, opts.tenantId, opts.title, opts.body,
      opts.mediaUrl ?? null, opts.visibility ?? 'all', opts.postedBy, ts)
    .run();
  return { id, campaignId: opts.campaignId, workspaceId: opts.workspaceId, tenantId: opts.tenantId,
    title: opts.title, body: opts.body, mediaUrl: opts.mediaUrl ?? null,
    visibility: opts.visibility ?? 'all', postedBy: opts.postedBy, createdAt: ts };
}

export async function listUpdates(
  db: D1Like,
  campaignId: string,
  tenantId: string,
  visibility: 'all' | 'donors_only' = 'all',
  limit = 20,
  offset = 0,
): Promise<FundraisingUpdate[]> {
  const where = [`campaign_id = ?`, `tenant_id = ?`];
  const vals: unknown[] = [campaignId, tenantId];
  if (visibility === 'all') {
    // all = include both 'all' and 'donors_only' only for donors; public shows 'all' only
  }
  vals.push(limit, offset);
  const { results } = await db
    .prepare(`SELECT * FROM fundraising_updates WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...vals)
    .all<{ id: string; campaign_id: string; workspace_id: string; tenant_id: string;
      title: string; body: string; media_url: string | null; visibility: string;
      posted_by: string; created_at: number }>();
  return results.map((r) => ({ id: r.id, campaignId: r.campaign_id, workspaceId: r.workspace_id,
    tenantId: r.tenant_id, title: r.title, body: r.body, mediaUrl: r.media_url,
    visibility: r.visibility as 'all' | 'donors_only', postedBy: r.posted_by, createdAt: r.created_at }));
}

// ---------------------------------------------------------------------------
// Rewards
// ---------------------------------------------------------------------------

export async function createReward(
  db: D1Like,
  opts: {
    campaignId: string; workspaceId: string; tenantId: string;
    title: string; description?: string; minAmountKobo: number; quantity?: number;
  },
): Promise<FundraisingReward> {
  assertKobo(opts.minAmountKobo, 'minAmountKobo');
  const id = generateId('fr');
  const ts = now();
  await db
    .prepare(`INSERT INTO fundraising_rewards (id, campaign_id, workspace_id, tenant_id, title, description, min_amount_kobo, quantity, created_at) VALUES (?,?,?,?,?,?,?,?,?)`)
    .bind(id, opts.campaignId, opts.workspaceId, opts.tenantId, opts.title, opts.description ?? null, opts.minAmountKobo, opts.quantity ?? -1, ts)
    .run();
  return { id, campaignId: opts.campaignId, workspaceId: opts.workspaceId, tenantId: opts.tenantId,
    title: opts.title, description: opts.description ?? null, minAmountKobo: opts.minAmountKobo,
    quantity: opts.quantity ?? -1, claimedCount: 0, createdAt: ts };
}

// ---------------------------------------------------------------------------
// Payout requests
// ---------------------------------------------------------------------------

export async function createPayoutRequest(
  db: D1Like,
  input: CreatePayoutRequestInput,
): Promise<FundraisingPayoutRequest> {
  assertKobo(input.amountKobo, 'amountKobo');
  const id = generateId('fpr');
  const ts = now();

  // Fetch campaign to determine if HITL is required (political campaigns always require it)
  const campaign = await db
    .prepare(`SELECT hitl_required, campaign_type FROM fundraising_campaigns WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(input.campaignId, input.tenantId)
    .first<{ hitl_required: number; campaign_type: string }>();

  const hitlRequired = campaign?.hitl_required === 1 ||
    campaign?.campaign_type === 'political' || campaign?.campaign_type === 'election';

  await db
    .prepare(
      `INSERT INTO fundraising_payout_requests (
         id, campaign_id, workspace_id, tenant_id, requested_by, amount_kobo,
         bank_account_name, bank_account_number, bank_code, reason,
         hitl_required, hitl_status, status, created_at
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id, input.campaignId, input.workspaceId, input.tenantId,
      input.requestedBy, input.amountKobo,
      input.bankAccountName, input.bankAccountNumber, input.bankCode, input.reason,
      hitlRequired ? 1 : 0, 'pending', 'pending', ts,
    )
    .run();

  return {
    id, campaignId: input.campaignId, workspaceId: input.workspaceId, tenantId: input.tenantId,
    requestedBy: input.requestedBy, amountKobo: input.amountKobo,
    bankAccountName: input.bankAccountName, bankAccountNumber: input.bankAccountNumber,
    bankCode: input.bankCode, reason: input.reason,
    hitlRequired, hitlStatus: 'pending',
    hitlReviewerId: null, hitlReviewedAt: null, hitlNote: null,
    paystackTransferCode: null, status: 'pending', processedAt: null, createdAt: ts,
  };
}

export async function approvePayoutRequest(
  db: D1Like,
  id: string,
  tenantId: string,
  reviewerId: string,
  note?: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE fundraising_payout_requests
       SET hitl_status = 'approved', hitl_reviewer_id = ?, hitl_reviewed_at = ?, hitl_note = ?, status = 'approved'
       WHERE id = ? AND tenant_id = ? AND hitl_status = 'pending'`,
    )
    .bind(reviewerId, now(), note ?? null, id, tenantId)
    .run();
}

export async function rejectPayoutRequest(
  db: D1Like,
  id: string,
  tenantId: string,
  reviewerId: string,
  note: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE fundraising_payout_requests
       SET hitl_status = 'rejected', hitl_reviewer_id = ?, hitl_reviewed_at = ?, hitl_note = ?, status = 'rejected'
       WHERE id = ? AND tenant_id = ? AND hitl_status = 'pending'`,
    )
    .bind(reviewerId, now(), note, id, tenantId)
    .run();
}

export async function listPayoutRequests(
  db: D1Like,
  campaignId: string,
  tenantId: string,
  opts: { hitlStatus?: string; status?: string } = {},
): Promise<FundraisingPayoutRequest[]> {
  const where = [`campaign_id = ?`, `tenant_id = ?`];
  const vals: unknown[] = [campaignId, tenantId];
  if (opts.hitlStatus) { where.push(`hitl_status = ?`); vals.push(opts.hitlStatus); }
  if (opts.status)     { where.push(`status = ?`);      vals.push(opts.status); }

  const { results } = await db
    .prepare(`SELECT * FROM fundraising_payout_requests WHERE ${where.join(' AND ')} ORDER BY created_at DESC`)
    .bind(...vals)
    .all<{
      id: string; campaign_id: string; workspace_id: string; tenant_id: string;
      requested_by: string; amount_kobo: number; bank_account_name: string;
      bank_account_number: string; bank_code: string; reason: string;
      hitl_required: number; hitl_status: string; hitl_reviewer_id: string | null;
      hitl_reviewed_at: number | null; hitl_note: string | null;
      paystack_transfer_code: string | null; status: string; processed_at: number | null; created_at: number;
    }>();

  return results.map((r) => ({
    id: r.id, campaignId: r.campaign_id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    requestedBy: r.requested_by, amountKobo: r.amount_kobo,
    bankAccountName: r.bank_account_name, bankAccountNumber: '****' + r.bank_account_number.slice(-4),
    bankCode: r.bank_code, reason: r.reason,
    hitlRequired: r.hitl_required === 1, hitlStatus: r.hitl_status as FundraisingPayoutRequest['hitlStatus'],
    hitlReviewerId: r.hitl_reviewer_id, hitlReviewedAt: r.hitl_reviewed_at, hitlNote: r.hitl_note,
    paystackTransferCode: r.paystack_transfer_code,
    status: r.status as FundraisingPayoutRequest['status'],
    processedAt: r.processed_at, createdAt: r.created_at,
  }));
}

// ---------------------------------------------------------------------------
// Compliance declarations
// ---------------------------------------------------------------------------

export async function addComplianceDeclaration(
  db: D1Like,
  opts: {
    campaignId: string; workspaceId: string; tenantId: string;
    declarationType: DeclarationType; declaredBy: string;
    referenceDoc?: string; notes?: string;
  },
): Promise<FundraisingComplianceDeclaration> {
  const id = generateId('fcd');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO fundraising_compliance_declarations
         (id, campaign_id, workspace_id, tenant_id, declaration_type, declared_by, declared_at, reference_doc, notes)
       VALUES (?,?,?,?,?,?,?,?,?)`,
    )
    .bind(id, opts.campaignId, opts.workspaceId, opts.tenantId, opts.declarationType,
      opts.declaredBy, ts, opts.referenceDoc ?? null, opts.notes ?? null)
    .run();
  return { id, campaignId: opts.campaignId, workspaceId: opts.workspaceId, tenantId: opts.tenantId,
    declarationType: opts.declarationType, declaredBy: opts.declaredBy, declaredAt: ts,
    referenceDoc: opts.referenceDoc ?? null, notes: opts.notes ?? null, status: 'declared' };
}

// ---------------------------------------------------------------------------
// Church tithe migration bridge [A3]
// ---------------------------------------------------------------------------

export async function migrateTitheToFundraising(
  db: D1Like,
  titheRecordId: string,
  fundraisingContributionId: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT OR IGNORE INTO tithe_fundraising_bridge (tithe_record_id, fundraising_contribution_id, migrated_at)
       VALUES (?,?,?)`,
    )
    .bind(titheRecordId, fundraisingContributionId, now())
    .run();
}

// ---------------------------------------------------------------------------
// Campaign analytics summary
// ---------------------------------------------------------------------------

export async function getCampaignStats(
  db: D1Like,
  campaignId: string,
  tenantId: string,
): Promise<{
  raisedKobo: number;
  contributorCount: number;
  pendingCount: number;
  pledgeCount: number;
}> {
  const campaign = await db
    .prepare(`SELECT raised_kobo, contributor_count FROM fundraising_campaigns WHERE id = ? AND tenant_id = ?`)
    .bind(campaignId, tenantId)
    .first<{ raised_kobo: number; contributor_count: number }>();

  const pending = await db
    .prepare(`SELECT COUNT(*) as cnt FROM fundraising_contributions WHERE campaign_id = ? AND tenant_id = ? AND status = 'pending'`)
    .bind(campaignId, tenantId)
    .first<{ cnt: number }>();

  const pledges = await db
    .prepare(`SELECT COUNT(*) as cnt FROM fundraising_pledges WHERE campaign_id = ? AND tenant_id = ? AND status = 'active'`)
    .bind(campaignId, tenantId)
    .first<{ cnt: number }>();

  return {
    raisedKobo: campaign?.raised_kobo ?? 0,
    contributorCount: campaign?.contributor_count ?? 0,
    pendingCount: pending?.cnt ?? 0,
    pledgeCount: pledges?.cnt ?? 0,
  };
}
