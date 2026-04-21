/**
 * HandyLife Wallet API Routes
 *
 * Platform Invariants enforced:
 *   P9  — all amounts validated as integer kobo before any operation
 *   T3  — tenant_id from JWT auth context, never from request body
 *   T4  — atomic conditional UPDATE in debitWallet / creditWallet
 *   T5  — assertTenantEligible() gates all wallet routes
 *   T7  — wallet status FSM enforced in ledger operations
 *
 * Phase 1: offline bank transfer funding only.
 *   - wallet.transfer  → 503 (FEATURE_DISABLED)
 *   - wallet.withdraw  → 503 (FEATURE_DISABLED)
 *   - online funding   → 503 (FEATURE_DISABLED)
 *
 * Auth: all routes require JWT (applied at router level in router.ts).
 * KYC: requireKYCTier minimum T1 for wallet creation and all operations.
 * NDPR: consent gate applied before wallet creation and spend.
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import { publishEvent } from '../lib/publish-event.js';
import {
  WalletError,
  isFeatureEnabled,
  assertTenantEligible,
  assertIntegerKobo,
  checkDailyLimit,
  checkBalanceCap,
  getWallet,
  getWalletByUser,
  createWallet,
  creditWallet,
  debitWallet,
  getBalance,
  getLedger,
  createFundingRequest,
  getFundingRequest,
  confirmFunding,
  rejectFunding,
  listFundingRequests,
  reserveSpend,
  completeSpend,
  reverseSpend,
  recordMlaEarning,
  listMlaEarnings,
  listMlaEarningsPaginated,
} from '@webwaka/hl-wallet';
import { generateId, generateWalletRef } from '@webwaka/hl-wallet';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

// Minimal D1 interface for inline consent queries and audit log writes.
interface D1Compat {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
    };
  };
}

// WF-034: Fire-and-forget audit log writer for all wallet mutations.
// Never throws — audit log failure MUST NOT block any wallet operation.
function writeWalletAuditLog(
  db: D1Compat,
  opts: {
    tenantId:     string;
    userId:       string;
    action:       string;
    method:       string;
    path:         string;
    resourceType: string;
    resourceId:   string;
    statusCode:   number;
    metadata?:    Record<string, unknown>;
  },
): void {
  const id   = crypto.randomUUID();
  const meta = opts.metadata ? JSON.stringify(opts.metadata) : null;
  db.prepare(
    `INSERT INTO audit_logs
       (id, tenant_id, user_id, action, method, path, resource_type, resource_id,
        ip_masked, status_code, duration_ms, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, '?.?.?.?', ?, 0, ?)`,
  ).bind(
    id, opts.tenantId, opts.userId, opts.action,
    opts.method, opts.path, opts.resourceType, opts.resourceId,
    opts.statusCode, meta,
  ).run().catch(() => {});
}

const walletRoutes = new Hono<AppEnv>();

function getWalletKv(env: Env): KVNamespace {
  if (!env.WALLET_KV) throw new Error('WALLET_KV binding not configured');
  return env.WALLET_KV;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleWalletError(err: unknown, c: Context<AppEnv, any>) {
  if (err instanceof WalletError) {
    if (err.code === 'FEATURE_DISABLED') {
      const feature = String(err.context['feature'] ?? 'unknown');
      const messages: Record<string, string> = {
        transfers:     'Wallet-to-wallet transfers are not yet available. Check back soon.',
        withdrawals:   'Wallet withdrawals are not yet available. Check back soon.',
        online_funding:'Online wallet funding is not yet available. Use bank transfer instead.',
        mla_payout:    'MLA earnings payout is not yet available.',
      };
      return c.json({
        error: 'wallet_feature_disabled',
        feature,
        message: messages[feature] ?? 'This wallet feature is not yet available.',
      }, 503);
    }
    return c.json({ error: err.code, message: err.message, context: err.context }, err.statusCode as 422);
  }
  throw err;
}

// ---------------------------------------------------------------------------
// WF-026: MLA referral chain commission recording helper (fire-and-forget)
// Traverses up to 3 referral levels using the relationships table.
// kind='referral', subject_type='user', object_type='user'
// Records a pending hl_mla_earnings row for each active-wallet referrer found.
// Never throws — individual level failures are caught and swallowed.
// ---------------------------------------------------------------------------

async function recordMlaChain(
  db: D1Compat,
  kv: KVNamespace,
  spendingUserId: string,
  tenantId: string,
  spendEventId: string,
  amountKobo: number,
  verticalSlug?: string,
  orderId?: string,
): Promise<void> {
  let currentUserId = spendingUserId;
  for (let level = 1; level <= 3; level++) {
    let referrerId: string | undefined;
    try {
      const rel = await db
        .prepare(
          `SELECT object_id FROM relationships
           WHERE kind = 'referral' AND subject_type = 'user' AND subject_id = ?
             AND object_type = 'user' AND tenant_id = ? LIMIT 1`,
        )
        .bind(currentUserId, tenantId)
        .first<{ object_id: string }>();
      if (!rel) break;
      referrerId = rel.object_id;
    } catch {
      break;
    }

    try {
      const referrerWallet = await getWalletByUser(db as never, referrerId, tenantId);
      if (referrerWallet && referrerWallet.status === 'active') {
        await recordMlaEarning(db as never, kv as never, {
          walletId:            referrerWallet.id,
          earnerUserId:        referrerId,
          tenantId,
          referralLevel:       level as 1 | 2 | 3,
          baseAmountKobo:      amountKobo,
          sourceVertical:      verticalSlug,
          sourceOrderId:       orderId,
          sourceSpendEventId:  spendEventId,
        });
      }
    } catch {
      // Per-level MLA failure must not block chain traversal or the spend response
    }

    currentUserId = referrerId;
  }
}

// ---------------------------------------------------------------------------
// POST /wallet — Create wallet (idempotent)
// ---------------------------------------------------------------------------

walletRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  const kv   = getWalletKv(c.env);

  try {
    await assertTenantEligible(kv, auth.tenantId);
  } catch (err) {
    return handleWalletError(err, c);
  }

  const existing = await getWalletByUser(c.env.DB as never, auth.userId, auth.tenantId);
  if (existing) {
    return c.json({ wallet: existing }, 200);
  }

  // WF-033: NDPR payment_data consent gate (Platform Invariant P10)
  const consentRow = await (c.env.DB as unknown as D1Compat)
    .prepare(
      `SELECT id FROM consent_records
       WHERE user_id = ? AND tenant_id = ? AND data_type = 'payment_data'
         AND revoked_at IS NULL LIMIT 1`,
    )
    .bind(auth.userId, auth.tenantId)
    .first<{ id: string }>();
  if (!consentRow) {
    return c.json({
      error: 'NDPR_CONSENT_REQUIRED',
      message: 'Payment data consent required before creating a wallet. Provide consent via POST /identity/consent.',
    }, 403);
  }

  let body: { workspace_id?: string; kyc_tier?: number } = {};
  try { body = await c.req.json<typeof body>(); } catch { /* optional body */ }

  if (!body.workspace_id) {
    return c.json({ error: 'workspace_id is required' }, 400);
  }

  try {
    const walletId = generateId('hlw');
    const wallet = await createWallet(c.env.DB as never, {
      id:          walletId,
      userId:      auth.userId,
      tenantId:    auth.tenantId,
      workspaceId: body.workspace_id,
      kycTier:     (body.kyc_tier as 1 | 2 | 3) ?? 1,
    });
    // WF-034: audit log (fire-and-forget)
    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     auth.tenantId,
      userId:       auth.userId,
      action:       'wallet.create',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'wallet',
      resourceId:   wallet.id,
      statusCode:   201,
    });
    return c.json({ wallet }, 201);
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// GET /wallet/balance
// ---------------------------------------------------------------------------

walletRoutes.get('/balance', async (c) => {
  const auth = c.get('auth');
  try {
    const { balanceKobo, wallet } = await getBalance(c.env.DB as never, auth.userId, auth.tenantId);
    return c.json({
      balance_kobo:    balanceKobo,
      balance_naira:   (balanceKobo / 100).toFixed(2),
      kyc_tier:        wallet.kycTier,
      status:          wallet.status,
      wallet_id:       wallet.id,
      currency_code:   wallet.currencyCode,
    });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// GET /wallet/ledger
// ---------------------------------------------------------------------------

walletRoutes.get('/ledger', async (c) => {
  const auth   = c.get('auth');
  const cursor = c.req.query('cursor') ?? undefined;
  const limit  = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 100);

  try {
    const wallet = await getWalletByUser(c.env.DB as never, auth.userId, auth.tenantId);
    if (!wallet) return c.json({ error: 'WALLET_NOT_FOUND', message: 'Wallet not found' }, 404);

    const { entries, nextCursor } = await getLedger(c.env.DB as never, {
      walletId: wallet.id,
      tenantId: auth.tenantId,
      limit,
      cursor,
    });
    return c.json({ entries, next_cursor: nextCursor });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// POST /wallet/fund/bank-transfer — Initiate offline bank transfer funding
// ---------------------------------------------------------------------------

walletRoutes.post('/fund/bank-transfer', async (c) => {
  const auth = c.get('auth');
  const kv   = getWalletKv(c.env);

  let body: {
    amount_kobo?:    number;
    bank_name?:      string;
    account_number?: string;
    account_name?:   string;
    workspace_id?:   string;
  } = {};

  try { body = await c.req.json<typeof body>(); } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.amount_kobo || !body.workspace_id) {
    return c.json({ error: 'amount_kobo and workspace_id are required' }, 400);
  }

  try {
    assertIntegerKobo(body.amount_kobo);
    await assertTenantEligible(kv, auth.tenantId);

    const wallet = await getWalletByUser(c.env.DB as never, auth.userId, auth.tenantId);
    if (!wallet) return c.json({ error: 'WALLET_NOT_FOUND', message: 'Create a wallet first' }, 404);
    if (wallet.status === 'frozen') return c.json({ error: 'WALLET_FROZEN', message: 'Wallet is frozen' }, 403);
    if (wallet.status === 'closed') return c.json({ error: 'WALLET_CLOSED', message: 'Wallet is closed' }, 403);

    await checkBalanceCap(kv, wallet.balanceKobo, body.amount_kobo, wallet.kycTier);
    await checkDailyLimit(c.env.DB as never, kv, wallet.id, auth.tenantId, body.amount_kobo, wallet.kycTier);

    const { fundingRequest, bankTransferReference } = await createFundingRequest(
      c.env.DB as never,
      kv,
      {
        walletId:       wallet.id,
        userId:         auth.userId,
        tenantId:       auth.tenantId,
        workspaceId:    body.workspace_id,
        amountKobo:     body.amount_kobo,
        bankName:       body.bank_name,
        accountNumber:  body.account_number,
        accountName:    body.account_name,
      },
    );

    await publishEvent(c.env, {
      eventId:     generateId('notif'),
      eventKey:    'wallet.funding.requested',
      tenantId:    auth.tenantId,
      actorId:     auth.userId,
      actorType:   'user',
      workspaceId: body.workspace_id,
      payload:     {
        wallet_id:    wallet.id,
        amount_kobo:  body.amount_kobo,
        amount_naira: (body.amount_kobo / 100).toFixed(2),
        reference:    bankTransferReference,
      },
    });

    // WF-034: audit log (fire-and-forget)
    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     auth.tenantId,
      userId:       auth.userId,
      action:       'wallet.fund.requested',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'hl_funding_request',
      resourceId:   fundingRequest.id,
      statusCode:   201,
      metadata:     { amount_kobo: fundingRequest.amountKobo, hitl_required: fundingRequest.hitlRequired },
    });

    return c.json({
      funding_request_id:    fundingRequest.id,
      bank_transfer_order_id: fundingRequest.bankTransferOrderId,
      reference:             bankTransferReference,
      amount_kobo:           fundingRequest.amountKobo,
      amount_naira:          (fundingRequest.amountKobo / 100).toFixed(2),
      status:                fundingRequest.status,
      hitl_required:         fundingRequest.hitlRequired,
      instructions:          'Transfer the exact amount to the configured bank account and upload your proof of payment.',
      expires_at:            Math.floor(Date.now() / 1000) + 48 * 3600,
    }, 201);
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// GET /wallet/funding/:id — Funding request status
// ---------------------------------------------------------------------------

walletRoutes.get('/funding/:id', async (c) => {
  const auth = c.get('auth');
  const { id } = c.req.param();
  try {
    const fr = await getFundingRequest(c.env.DB as never, id, auth.tenantId);
    return c.json({ funding_request: fr });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// GET /wallet/funding — List funding requests for current user's wallet
// ---------------------------------------------------------------------------

walletRoutes.get('/funding', async (c) => {
  const auth = c.get('auth');
  try {
    const wallet = await getWalletByUser(c.env.DB as never, auth.userId, auth.tenantId);
    if (!wallet) return c.json({ error: 'WALLET_NOT_FOUND', message: 'Wallet not found' }, 404);
    const requests = await listFundingRequests(c.env.DB as never, wallet.id, auth.tenantId);
    return c.json({ funding_requests: requests });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// POST /wallet/spend — Debit wallet for a purchase
// ---------------------------------------------------------------------------

walletRoutes.post('/spend', async (c) => {
  const auth = c.get('auth');
  const kv   = getWalletKv(c.env);

  let body: {
    amount_kobo?:         number;
    vertical_slug?:       string;
    order_id?:            string;
    order_type?:          string;
    immediate_complete?:  boolean;
  } = {};

  try { body = await c.req.json<typeof body>(); } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.amount_kobo) {
    return c.json({ error: 'amount_kobo is required' }, 400);
  }

  try {
    assertIntegerKobo(body.amount_kobo);
    await assertTenantEligible(kv, auth.tenantId);

    // WF-033: NDPR payment_data consent gate (Platform Invariant P10)
    const spendConsentRow = await (c.env.DB as unknown as D1Compat)
      .prepare(
        `SELECT id FROM consent_records
         WHERE user_id = ? AND tenant_id = ? AND data_type = 'payment_data'
           AND revoked_at IS NULL LIMIT 1`,
      )
      .bind(auth.userId, auth.tenantId)
      .first<{ id: string }>();
    if (!spendConsentRow) {
      return c.json({
        error: 'NDPR_CONSENT_REQUIRED',
        message: 'Payment data consent required before using the wallet. Provide consent via POST /identity/consent.',
      }, 403);
    }

    const wallet = await getWalletByUser(c.env.DB as never, auth.userId, auth.tenantId);
    if (!wallet) return c.json({ error: 'WALLET_NOT_FOUND', message: 'Wallet not found' }, 404);

    await checkDailyLimit(c.env.DB as never, kv, wallet.id, auth.tenantId, body.amount_kobo, wallet.kycTier);

    const spendEvent = await reserveSpend(c.env.DB as never, {
      walletId:          wallet.id,
      userId:            auth.userId,
      tenantId:          auth.tenantId,
      amountKobo:        body.amount_kobo,
      verticalSlug:      body.vertical_slug,
      orderId:           body.order_id,
      orderType:         body.order_type,
      immediateComplete: body.immediate_complete ?? true,
    });

    if (spendEvent.status === 'completed') {
      await publishEvent(c.env, {
        eventId:   generateId('notif'),
        eventKey:  'wallet.spend.completed',
        tenantId:  auth.tenantId,
        actorId:   auth.userId,
        actorType: 'user',
        payload: {
          wallet_id:     wallet.id,
          amount_kobo:   body.amount_kobo,
          amount_naira:  (body.amount_kobo / 100).toFixed(2),
          vertical_slug: body.vertical_slug ?? null,
          order_id:      body.order_id ?? null,
          new_balance_kobo: wallet.balanceKobo - body.amount_kobo,
        },
      });

      // WF-026: Record MLA commissions up the referral chain (fire-and-forget)
      void recordMlaChain(
        c.env.DB as unknown as D1Compat,
        kv,
        auth.userId,
        auth.tenantId,
        spendEvent.id,
        body.amount_kobo!,
        body.vertical_slug,
        body.order_id,
      );
    }

    // WF-034: audit log (fire-and-forget)
    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     auth.tenantId,
      userId:       auth.userId,
      action:       'wallet.spend',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'hl_spend_event',
      resourceId:   spendEvent.id,
      statusCode:   201,
      metadata:     { amount_kobo: spendEvent.amountKobo, status: spendEvent.status },
    });

    return c.json({ spend_event: spendEvent }, 201);
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// POST /wallet/spend/:id/complete — Complete a reserved spend
// ---------------------------------------------------------------------------

walletRoutes.post('/spend/:id/complete', async (c) => {
  const auth = c.get('auth');
  const { id } = c.req.param();
  try {
    const spendEvent = await completeSpend(c.env.DB as never, id, auth.tenantId);
    // WF-034: audit log (fire-and-forget)
    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     auth.tenantId,
      userId:       auth.userId,
      action:       'wallet.spend.completed',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'hl_spend_event',
      resourceId:   id,
      statusCode:   200,
    });
    return c.json({ spend_event: spendEvent });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// POST /wallet/spend/:id/reverse — Reverse a spend
// ---------------------------------------------------------------------------

walletRoutes.post('/spend/:id/reverse', async (c) => {
  const auth = c.get('auth');
  const { id } = c.req.param();
  let body: { reason?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { /* optional */ }

  try {
    const spendEvent = await reverseSpend(c.env.DB as never, id, auth.tenantId, body.reason ?? 'User requested reversal');
    // WF-034: audit log (fire-and-forget)
    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     auth.tenantId,
      userId:       auth.userId,
      action:       'wallet.spend.reversed',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'hl_spend_event',
      resourceId:   id,
      statusCode:   200,
      metadata:     { reason: body.reason ?? 'User requested reversal' },
    });
    return c.json({ spend_event: spendEvent });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// GET /wallet/mla-earnings — MLA earnings history (WF-044: cursor-paginated)
// Query params:
//   status  — filter by status: pending | payable | credited | voided
//   cursor  — pagination cursor (id of last seen row)
//   limit   — page size (default 50, max 100)
// Response: { earnings, next_cursor }
// ---------------------------------------------------------------------------

walletRoutes.get('/mla-earnings', async (c) => {
  const auth   = c.get('auth');
  const status = c.req.query('status') as ('pending' | 'payable' | 'credited' | 'voided') | undefined;
  const cursor = c.req.query('cursor') ?? undefined;
  const limit  = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 100);

  try {
    const wallet = await getWalletByUser(c.env.DB as never, auth.userId, auth.tenantId);
    if (!wallet) return c.json({ error: 'WALLET_NOT_FOUND', message: 'Wallet not found' }, 404);
    const { earnings, nextCursor } = await listMlaEarningsPaginated(
      c.env.DB as never,
      wallet.id,
      auth.tenantId,
      { status, cursor, limit },
    );
    return c.json({ earnings, next_cursor: nextCursor });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// POST /wallet/transfer — DISABLED in Phase 1
// ---------------------------------------------------------------------------

walletRoutes.post('/transfer', async (c) => {
  const auth = c.get('auth');
  const kv   = getWalletKv(c.env);

  const enabled = await isFeatureEnabled('transfers', kv);
  if (!enabled) {
    await publishEvent(c.env, {
      eventId:   generateId('notif'),
      eventKey:  'wallet.transfer.disabled',
      tenantId:  auth.tenantId,
      actorId:   auth.userId,
      actorType: 'user',
      payload:   {},
    }).catch(() => {});
    return c.json({
      error:   'wallet_feature_disabled',
      feature: 'transfers',
      message: 'Wallet-to-wallet transfers are not yet available. Check back soon.',
    }, 503);
  }

  return c.json({ error: 'not_implemented', message: 'Transfers not yet implemented' }, 501);
});

// ---------------------------------------------------------------------------
// POST /wallet/withdraw — DISABLED in Phase 1
// ---------------------------------------------------------------------------

walletRoutes.post('/withdraw', async (c) => {
  const auth = c.get('auth');
  const kv   = getWalletKv(c.env);

  const enabled = await isFeatureEnabled('withdrawals', kv);
  if (!enabled) {
    await publishEvent(c.env, {
      eventId:   generateId('notif'),
      eventKey:  'wallet.withdrawal.disabled',
      tenantId:  auth.tenantId,
      actorId:   auth.userId,
      actorType: 'user',
      payload:   {},
    }).catch(() => {});
    return c.json({
      error:   'wallet_feature_disabled',
      feature: 'withdrawals',
      message: 'Wallet withdrawals are not yet available. Check back soon.',
    }, 503);
  }

  return c.json({ error: 'not_implemented', message: 'Withdrawals not yet implemented' }, 501);
});

// ---------------------------------------------------------------------------
// POST /wallet/fund/online — DISABLED in Phase 1 (card / Paystack)
// ---------------------------------------------------------------------------

walletRoutes.post('/fund/online', async (c) => {
  const kv = getWalletKv(c.env);
  const enabled = await isFeatureEnabled('online_funding', kv);
  if (!enabled) {
    return c.json({
      error:   'wallet_feature_disabled',
      feature: 'online_funding',
      message: 'Online wallet funding is not yet available. Please use bank transfer instead.',
    }, 503);
  }
  return c.json({ error: 'not_implemented', message: 'Online funding not yet implemented' }, 501);
});

// ===========================================================================
// Super Admin Routes — /wallet/admin/*
// (Applied under /platform-admin/wallets in router.ts with super_admin guard)
// ===========================================================================

export const walletAdminRoutes = new Hono<AppEnv>();

// GET /platform-admin/wallets/stats
walletAdminRoutes.get('/stats', async (c) => {
  const auth = c.get('auth');

  const statsRow = await (c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { first<T>(): Promise<T | null> } };
  }).prepare(`
    SELECT
      COUNT(*)                        AS total_wallets,
      SUM(balance_kobo)               AS total_balance_kobo,
      SUM(lifetime_funded_kobo)       AS total_funded_kobo,
      SUM(lifetime_spent_kobo)        AS total_spent_kobo,
      SUM(CASE WHEN status = 'active'      THEN 1 ELSE 0 END) AS active_count,
      SUM(CASE WHEN status = 'frozen'      THEN 1 ELSE 0 END) AS frozen_count,
      SUM(CASE WHEN status = 'pending_kyc' THEN 1 ELSE 0 END) AS pending_kyc_count,
      SUM(CASE WHEN status = 'closed'      THEN 1 ELSE 0 END) AS closed_count
    FROM hl_wallets
  `).bind().first<{
    total_wallets: number;
    total_balance_kobo: number;
    total_funded_kobo: number;
    total_spent_kobo: number;
    active_count: number;
    frozen_count: number;
    pending_kyc_count: number;
    closed_count: number;
  }>();

  const kv    = getWalletKv(c.env);
  const flags = {
    transfers:     (await kv.get('wallet:flag:transfers_enabled')) === '1',
    withdrawals:   (await kv.get('wallet:flag:withdrawals_enabled')) === '1',
    online_funding:(await kv.get('wallet:flag:online_funding_enabled')) === '1',
    mla_payout:    (await kv.get('wallet:flag:mla_payout_enabled')) === '1',
  };
  const eligibleTenantsRaw = await kv.get('wallet:eligible_tenants');
  const eligibleTenants = eligibleTenantsRaw ? JSON.parse(eligibleTenantsRaw) : [];

  return c.json({ stats: statsRow, feature_flags: flags, eligible_tenants: eligibleTenants });
});

// PATCH /platform-admin/wallets/feature-flags
walletAdminRoutes.patch('/feature-flags', async (c) => {
  let body: {
    flag?: string;
    enabled?: boolean;
    eligible_tenants?: string[];
  } = {};
  try { body = await c.req.json<typeof body>(); } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const kv        = getWalletKv(c.env);
  const auth      = c.get('auth');
  const validFlags = ['transfers', 'withdrawals', 'online_funding', 'mla_payout'];

  if (body.eligible_tenants !== undefined) {
    if (!Array.isArray(body.eligible_tenants)) {
      return c.json({ error: 'eligible_tenants must be an array of strings' }, 400);
    }
    await kv.put('wallet:eligible_tenants', JSON.stringify(body.eligible_tenants));
    return c.json({ updated: 'eligible_tenants', value: body.eligible_tenants });
  }

  if (!body.flag || !validFlags.includes(body.flag)) {
    return c.json({ error: `flag must be one of: ${validFlags.join(', ')}` }, 400);
  }
  if (typeof body.enabled !== 'boolean') {
    return c.json({ error: 'enabled must be a boolean' }, 400);
  }

  await kv.put(`wallet:flag:${body.flag}_enabled`, body.enabled ? '1' : '0');
  return c.json({ updated: body.flag, enabled: body.enabled });
});

// GET /platform-admin/wallets/:walletId
walletAdminRoutes.get('/:walletId', async (c) => {
  const { walletId } = c.req.param();
  const auth         = c.get('auth');

  const db = c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): {
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    }};
  };

  const walletRow = await db.prepare(
    'SELECT * FROM hl_wallets WHERE id = ?',
  ).bind(walletId).first<Record<string, unknown>>();

  if (!walletRow) return c.json({ error: 'WALLET_NOT_FOUND' }, 404);

  return c.json({ wallet: walletRow });
});

// POST /platform-admin/wallets/:walletId/freeze
walletAdminRoutes.post('/:walletId/freeze', async (c) => {
  const { walletId } = c.req.param();
  const auth         = c.get('auth');
  let body: { reason?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { /* optional */ }

  if (!body.reason) return c.json({ error: 'reason is required' }, 400);

  const now = Math.floor(Date.now() / 1000);
  await (c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { run(): Promise<{ success: boolean }> }};
  }).prepare(`
    UPDATE hl_wallets SET status = 'frozen', frozen_reason = ?, updated_at = ?
    WHERE id = ? AND status = 'active'
  `).bind(body.reason, now, walletId).run();

  await publishEvent(c.env, {
    eventId:   generateId('notif'),
    eventKey:  'wallet.admin.frozen',
    tenantId:  auth.tenantId,
    actorId:   auth.userId,
    actorType: 'admin',
    payload:   { wallet_id: walletId, frozen_reason: body.reason },
  });

  // WF-034: audit log (fire-and-forget)
  writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
    tenantId:     auth.tenantId,
    userId:       auth.userId,
    action:       'wallet.admin.freeze',
    method:       c.req.method,
    path:         c.req.path,
    resourceType: 'wallet',
    resourceId:   walletId,
    statusCode:   200,
    metadata:     { reason: body.reason },
  });

  return c.json({ wallet_id: walletId, status: 'frozen', frozen_reason: body.reason });
});

// POST /platform-admin/wallets/:walletId/unfreeze
walletAdminRoutes.post('/:walletId/unfreeze', async (c) => {
  const { walletId } = c.req.param();
  const auth         = c.get('auth');

  const now = Math.floor(Date.now() / 1000);
  await (c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { run(): Promise<{ success: boolean }> }};
  }).prepare(`
    UPDATE hl_wallets SET status = 'active', frozen_reason = NULL, updated_at = ?
    WHERE id = ? AND status = 'frozen'
  `).bind(now, walletId).run();

  await publishEvent(c.env, {
    eventId:   generateId('notif'),
    eventKey:  'wallet.admin.unfrozen',
    tenantId:  auth.tenantId,
    actorId:   auth.userId,
    actorType: 'admin',
    payload:   { wallet_id: walletId },
  });

  // WF-034: audit log (fire-and-forget)
  writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
    tenantId:     auth.tenantId,
    userId:       auth.userId,
    action:       'wallet.admin.unfreeze',
    method:       c.req.method,
    path:         c.req.path,
    resourceType: 'wallet',
    resourceId:   walletId,
    statusCode:   200,
  });

  return c.json({ wallet_id: walletId, status: 'active' });
});

// POST /platform-admin/wallets/funding/:id/confirm
walletAdminRoutes.post('/funding/:id/confirm', async (c) => {
  const { id } = c.req.param();
  const auth   = c.get('auth');
  const kv     = getWalletKv(c.env);

  try {
    // WF-032: Pass KV so balance cap is checked at confirmation time against fresh balance.
    const fr = await confirmFunding(c.env.DB as never, kv, id, auth.tenantId, auth.userId);

    const walletRow = await (c.env.DB as never as {
      prepare(sql: string): { bind(...a: unknown[]): { first<T>(): Promise<T | null> }};
    }).prepare('SELECT balance_kobo, user_id FROM hl_wallets WHERE id = ? AND tenant_id = ?')
      .bind(fr.walletId, auth.tenantId)
      .first<{ balance_kobo: number; user_id: string }>();

    await publishEvent(c.env, {
      eventId:   generateId('notif'),
      eventKey:  'wallet.funding.confirmed',
      tenantId:  auth.tenantId,
      actorId:   auth.userId,
      actorType: 'admin',
      payload: {
        wallet_id:          fr.walletId,
        user_id:            walletRow?.user_id ?? '',
        amount_kobo:        fr.amountKobo,
        amount_naira:       (fr.amountKobo / 100).toFixed(2),
        new_balance_kobo:   walletRow?.balance_kobo ?? 0,
        new_balance_naira:  ((walletRow?.balance_kobo ?? 0) / 100).toFixed(2),
        reference:          fr.bankTransferOrderId,
      },
    });

    // WF-034: audit log (fire-and-forget)
    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     auth.tenantId,
      userId:       auth.userId,
      action:       'wallet.funding.confirm',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'hl_funding_request',
      resourceId:   id,
      statusCode:   200,
      metadata:     { amount_kobo: fr.amountKobo, wallet_id: fr.walletId },
    });

    return c.json({ funding_request: fr });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// POST /platform-admin/wallets/funding/:id/reject
walletAdminRoutes.post('/funding/:id/reject', async (c) => {
  const { id } = c.req.param();
  const auth   = c.get('auth');
  let body: { reason?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { /* optional */ }

  if (!body.reason) return c.json({ error: 'reason is required' }, 400);

  try {
    const fr = await rejectFunding(c.env.DB as never, id, auth.tenantId, body.reason);
    await publishEvent(c.env, {
      eventId:   generateId('notif'),
      eventKey:  'wallet.funding.rejected',
      tenantId:  auth.tenantId,
      actorId:   auth.userId,
      actorType: 'admin',
      payload: {
        wallet_id:        fr.walletId,
        amount_kobo:      fr.amountKobo,
        amount_naira:     (fr.amountKobo / 100).toFixed(2),
        reference:        fr.bankTransferOrderId,
        rejection_reason: body.reason,
      },
    });
    // WF-034: audit log (fire-and-forget)
    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     auth.tenantId,
      userId:       auth.userId,
      action:       'wallet.funding.reject',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'hl_funding_request',
      resourceId:   id,
      statusCode:   200,
      metadata:     { reason: body.reason, amount_kobo: fr.amountKobo },
    });
    return c.json({ funding_request: fr });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// GET /platform-admin/wallets/reconciliation
walletAdminRoutes.get('/reconciliation', async (c) => {
  const db = c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { all<T>(): Promise<{ results: T[] }> }};
  };

  const rows = await db.prepare(`
    SELECT
      w.id         AS wallet_id,
      w.tenant_id,
      w.balance_kobo AS wallet_balance_kobo,
      COALESCE(SUM(l.amount_kobo), 0) AS ledger_sum_kobo,
      w.balance_kobo - COALESCE(SUM(l.amount_kobo), 0) AS drift_kobo
    FROM hl_wallets w
    LEFT JOIN hl_ledger l ON l.wallet_id = w.id AND l.tenant_id = w.tenant_id
    GROUP BY w.id, w.tenant_id, w.balance_kobo
    HAVING ABS(drift_kobo) > 0
    LIMIT 100
  `).bind().all<{
    wallet_id: string;
    tenant_id: string;
    wallet_balance_kobo: number;
    ledger_sum_kobo: number;
    drift_kobo: number;
  }>();

  return c.json({
    drifted_wallets: rows.results,
    total_drifted: rows.results.length,
    checked_at: Math.floor(Date.now() / 1000),
  });
});

export { walletRoutes };
export default walletRoutes;
