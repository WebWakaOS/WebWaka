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
  getWalletByUser,
  createWallet,
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
  listMlaEarningsPaginated,
  generateId,
  initiateTransfer,
  getTransferRequest,
  listTransferRequests,
  initiateWithdrawal,
  getWithdrawalRequest,
  listWithdrawalRequests,
  confirmWithdrawal,
  rejectWithdrawal,
  initializeOnlineFunding,
  verifyAndCompleteOnlineFunding,
  verifyPaystackWebhookSignature,
} from '@webwaka/hl-wallet';

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
function handleWalletError(err: unknown, c: Context<AppEnv, any>): Response {
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

  let body: { workspace_id?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { /* optional body */ }

  if (!body.workspace_id) {
    return c.json({ error: 'workspace_id is required' }, 400);
  }

  // Look up verified KYC tier from the users table.
  // Never accept kyc_tier from the client — self-reporting would let users claim unlimited T3 access.
  // Mapping: t3 → 3, t2 → 2, t1/t0/missing → 1 (minimum wallet tier).
  const userRow = await (c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { first<T>(): Promise<T | null> } };
  }).prepare('SELECT kyc_tier FROM users WHERE id = ?')
    .bind(auth.userId)
    .first<{ kyc_tier: string }>();
  const kycTierText = userRow?.kyc_tier ?? 't0';
  const kycTier: 1 | 2 | 3 =
    kycTierText === 't3' ? 3 :
    kycTierText === 't2' ? 2 : 1;

  try {
    const walletId = generateId('hlw');
    const wallet = await createWallet(c.env.DB as never, {
      id:          walletId,
      userId:      auth.userId,
      tenantId:    auth.tenantId,
      workspaceId: body.workspace_id,
      kycTier,
    });
    // WF-034: audit log (fire-and-forget)
    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     auth.tenantId,
      userId:       auth.userId,
      action:       'wallet.created',
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

    // Balance cap check: ensures deposit would not push balance over the CBN tier ceiling.
    // Daily limit is NOT checked here — it gates spending (debits), not inbound funding (credits).
    await checkBalanceCap(kv, wallet.balanceKobo, body.amount_kobo, wallet.kycTier);

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
// POST /wallet/transfer — W3: wallet-to-wallet transfer
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

  let body: {
    to_wallet_id?: string;
    to_user_id?:   string;
    amount_kobo?:  number;
    description?:  string;
  } = {};
  try { body = await c.req.json<typeof body>(); } catch {
    return c.json({ error: 'invalid_json', message: 'Request body must be valid JSON.' }, 400);
  }

  if (!body.to_wallet_id || typeof body.to_wallet_id !== 'string') {
    return c.json({ error: 'validation_error', message: 'to_wallet_id is required.' }, 400);
  }
  if (!body.to_user_id || typeof body.to_user_id !== 'string') {
    return c.json({ error: 'validation_error', message: 'to_user_id is required.' }, 400);
  }

  try {
    assertIntegerKobo(body.amount_kobo);
  } catch (err) {
    return handleWalletError(err, c);
  }

  const fromWallet = await getWalletByUser(c.env.DB as never, auth.userId, auth.tenantId);
  if (!fromWallet) {
    return c.json({ error: 'WALLET_NOT_FOUND', message: 'Sender wallet not found.' }, 404);
  }

  try {
    const transfer = await initiateTransfer(c.env.DB as never, kv, {
      fromWalletId: fromWallet.id,
      toWalletId:   body.to_wallet_id,
      fromUserId:   auth.userId,
      toUserId:     body.to_user_id,
      tenantId:     auth.tenantId,
      amountKobo:   body.amount_kobo as number,
      description:  body.description,
    });

    await publishEvent(c.env, {
      eventId:   generateId('notif'),
      eventKey:  'wallet.transfer.completed',
      tenantId:  auth.tenantId,
      actorId:   auth.userId,
      actorType: 'user',
      payload: {
        transfer_id:   transfer.id,
        from_wallet_id: transfer.fromWalletId,
        to_wallet_id:   transfer.toWalletId,
        amount_kobo:    transfer.amountKobo,
        amount_naira:   (transfer.amountKobo / 100).toFixed(2),
        reference:      transfer.reference,
      },
    }).catch(() => {});

    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     auth.tenantId,
      userId:       auth.userId,
      action:       'wallet.transfer',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'hl_transfer_request',
      resourceId:   transfer.id,
      statusCode:   201,
      metadata:     { amount_kobo: transfer.amountKobo, to_wallet_id: transfer.toWalletId },
    });

    return c.json({ transfer }, 201);
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// GET /wallet/transfers — list transfers for the current user's wallet
walletRoutes.get('/transfers', async (c) => {
  const auth   = c.get('auth');
  const limit  = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 100);
  const cursor = c.req.query('cursor') ?? undefined;

  const wallet = await getWalletByUser(c.env.DB as never, auth.userId, auth.tenantId);
  if (!wallet) return c.json({ error: 'WALLET_NOT_FOUND' }, 404);

  try {
    const result = await listTransferRequests(c.env.DB as never, wallet.id, auth.tenantId, limit, cursor);
    return c.json(result);
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// GET /wallet/transfers/:id — get a single transfer
walletRoutes.get('/transfers/:id', async (c) => {
  const { id } = c.req.param();
  const auth   = c.get('auth');

  try {
    const transfer = await getTransferRequest(c.env.DB as never, id, auth.tenantId);
    return c.json({ transfer });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// POST /wallet/withdraw — W4: bank withdrawal
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

  let body: {
    amount_kobo?:    number;
    bank_code?:      string;
    account_number?: string;
    account_name?:   string;
  } = {};
  try { body = await c.req.json<typeof body>(); } catch {
    return c.json({ error: 'invalid_json', message: 'Request body must be valid JSON.' }, 400);
  }

  if (!body.bank_code || typeof body.bank_code !== 'string') {
    return c.json({ error: 'validation_error', message: 'bank_code is required.' }, 400);
  }
  if (!body.account_number || typeof body.account_number !== 'string') {
    return c.json({ error: 'validation_error', message: 'account_number is required.' }, 400);
  }
  if (!body.account_name || typeof body.account_name !== 'string') {
    return c.json({ error: 'validation_error', message: 'account_name is required.' }, 400);
  }

  try {
    assertIntegerKobo(body.amount_kobo);
  } catch (err) {
    return handleWalletError(err, c);
  }

  const wallet = await getWalletByUser(c.env.DB as never, auth.userId, auth.tenantId);
  if (!wallet) return c.json({ error: 'WALLET_NOT_FOUND', message: 'Wallet not found.' }, 404);

  try {
    const withdrawal = await initiateWithdrawal(c.env.DB as never, kv, {
      walletId:      wallet.id,
      userId:        auth.userId,
      tenantId:      auth.tenantId,
      amountKobo:    body.amount_kobo as number,
      bankCode:      body.bank_code,
      accountNumber: body.account_number,
      accountName:   body.account_name,
    });

    await publishEvent(c.env, {
      eventId:   generateId('notif'),
      eventKey:  'wallet.withdrawal.initiated',
      tenantId:  auth.tenantId,
      actorId:   auth.userId,
      actorType: 'user',
      payload: {
        withdrawal_id: withdrawal.id,
        wallet_id:     withdrawal.walletId,
        amount_kobo:   withdrawal.amountKobo,
        amount_naira:  (withdrawal.amountKobo / 100).toFixed(2),
        bank_code:     withdrawal.bankCode,
        account_number: withdrawal.accountNumber,
        account_name:  withdrawal.accountName,
        reference:     withdrawal.reference,
        status:        withdrawal.status,
      },
    }).catch(() => {});

    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     auth.tenantId,
      userId:       auth.userId,
      action:       'wallet.withdrawal.initiate',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'hl_withdrawal_request',
      resourceId:   withdrawal.id,
      statusCode:   201,
      metadata: {
        amount_kobo:    withdrawal.amountKobo,
        bank_code:      withdrawal.bankCode,
        account_number: withdrawal.accountNumber,
      },
    });

    return c.json({ withdrawal }, 201);
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// GET /wallet/withdrawals — list withdrawal requests for the current user's wallet
walletRoutes.get('/withdrawals', async (c) => {
  const auth   = c.get('auth');
  const limit  = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 100);
  const cursor = c.req.query('cursor') ?? undefined;

  const wallet = await getWalletByUser(c.env.DB as never, auth.userId, auth.tenantId);
  if (!wallet) return c.json({ error: 'WALLET_NOT_FOUND' }, 404);

  try {
    const result = await listWithdrawalRequests(c.env.DB as never, wallet.id, auth.tenantId, limit, cursor);
    return c.json(result);
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// GET /wallet/withdrawals/:id — get a single withdrawal request
walletRoutes.get('/withdrawals/:id', async (c) => {
  const { id } = c.req.param();
  const auth   = c.get('auth');

  try {
    const withdrawal = await getWithdrawalRequest(c.env.DB as never, id, auth.tenantId);
    return c.json({ withdrawal });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// POST /wallet/fund/online — W5: Paystack card / bank-transfer online funding
// ---------------------------------------------------------------------------

walletRoutes.post('/fund/online', async (c) => {
  const kv   = getWalletKv(c.env);
  const auth = c.get('auth');

  const enabled = await isFeatureEnabled('online_funding', kv);
  if (!enabled) {
    return c.json({
      error:   'wallet_feature_disabled',
      feature: 'online_funding',
      message: 'Online wallet funding is not yet available. Please use bank transfer instead.',
    }, 503);
  }

  let body: { amount_kobo?: number; email?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch {
    return c.json({ error: 'invalid_json', message: 'Request body must be valid JSON.' }, 400);
  }

  if (!body.email || typeof body.email !== 'string') {
    return c.json({ error: 'validation_error', message: 'email is required.' }, 400);
  }

  try {
    assertIntegerKobo(body.amount_kobo);
  } catch (err) {
    return handleWalletError(err, c);
  }

  const wallet = await getWalletByUser(c.env.DB as never, auth.userId, auth.tenantId);
  if (!wallet) return c.json({ error: 'WALLET_NOT_FOUND', message: 'Wallet not found.' }, 404);

  const paystackSecretKey = (c.env as unknown as { PAYSTACK_SECRET_KEY?: string }).PAYSTACK_SECRET_KEY ?? '';

  try {
    const init = await initializeOnlineFunding(c.env.DB as never, kv, {
      walletId:          wallet.id,
      userId:            auth.userId,
      tenantId:          auth.tenantId,
      workspaceId:       wallet.workspaceId,
      amountKobo:        body.amount_kobo as number,
      email:             body.email,
      paystackSecretKey,
    });

    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     auth.tenantId,
      userId:       auth.userId,
      action:       'wallet.fund.online.init',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'hl_funding_request',
      resourceId:   init.fundingRequestId,
      statusCode:   201,
      metadata:     { amount_kobo: init.amountKobo, reference: init.reference },
    });

    return c.json(init, 201);
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// GET /wallet/fund/online/verify — Paystack redirect callback (W5)
// ---------------------------------------------------------------------------

walletRoutes.get('/fund/online/verify', async (c) => {
  const auth      = c.get('auth');
  const kv        = getWalletKv(c.env);
  const reference = c.req.query('reference');

  if (!reference) {
    return c.json({ error: 'validation_error', message: 'reference query parameter is required.' }, 400);
  }

  const paystackSecretKey = (c.env as unknown as { PAYSTACK_SECRET_KEY?: string }).PAYSTACK_SECRET_KEY ?? '';

  try {
    const result = await verifyAndCompleteOnlineFunding(
      c.env.DB as never,
      kv,
      reference,
      auth.tenantId,
      paystackSecretKey,
      auth.userId,
    );
    return c.json(result);
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// ---------------------------------------------------------------------------
// POST /wallet/fund/paystack-webhook — Paystack webhook (W5)
// Public endpoint — no auth, signature-verified.
// ---------------------------------------------------------------------------

walletRoutes.post('/fund/paystack-webhook', async (c) => {
  const signature = c.req.header('x-paystack-signature') ?? '';
  const rawBody   = await c.req.text();
  const paystackSecretKey = (c.env as unknown as { PAYSTACK_SECRET_KEY?: string }).PAYSTACK_SECRET_KEY ?? '';

  if (!paystackSecretKey) {
    return c.json({ error: 'not_configured' }, 400);
  }

  const valid = await verifyPaystackWebhookSignature(rawBody, signature, paystackSecretKey);
  if (!valid) {
    return c.json({ error: 'invalid_signature' }, 401);
  }

  let event: { event?: string; data?: { reference?: string; customer?: { email?: string } } };
  try { event = JSON.parse(rawBody); } catch {
    return c.json({ error: 'invalid_json' }, 400);
  }

  if (event.event !== 'charge.success') {
    return c.json({ received: true, action: 'ignored' });
  }

  const reference = event.data?.reference;
  if (!reference) return c.json({ received: true, action: 'no_reference' });

  const kv = getWalletKv(c.env);

  const orderRow = await (c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { first<T>(): Promise<T | null> }};
  }).prepare(`
    SELECT bto.id, bto.tenant_id, fr.id AS funding_id
    FROM bank_transfer_orders bto
    JOIN hl_funding_requests fr ON fr.bank_transfer_order_id = bto.id
    WHERE bto.reference = ? AND bto.status != 'confirmed'
    LIMIT 1
  `).bind(reference).first<{ id: string; tenant_id: string; funding_id: string }>();

  if (!orderRow) return c.json({ received: true, action: 'already_processed_or_not_found' });

  try {
    await confirmFunding(c.env.DB as never, kv, orderRow.funding_id, orderRow.tenant_id, 'paystack-webhook');
    return c.json({ received: true, action: 'funded' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ received: true, action: 'error', error: msg }, 500);
  }
});

// ===========================================================================
// Super Admin Routes — /wallet/admin/*
// (Applied under /platform-admin/wallets in router.ts with super_admin guard)
// ===========================================================================

export const walletAdminRoutes = new Hono<AppEnv>();

// GET /platform-admin/wallets/stats
walletAdminRoutes.get('/stats', async (c) => {
  // GOVERNANCE_SKIP: intentional cross-tenant aggregate (platform super-admin stats only).
  // This route requires super_admin role. No tenant filter — counts all wallets on the platform.
  const db = c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): {
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    }};
  };

  const statsRow = await db.prepare(`
    SELECT /* GOVERNANCE_SKIP */
      COUNT(*)                        AS total_wallets,
      SUM(balance_kobo)               AS total_balance_kobo,
      SUM(lifetime_funded_kobo)       AS total_funded_kobo,
      SUM(lifetime_spent_kobo)        AS total_spent_kobo,
      SUM(CASE WHEN status = 'active'      THEN 1 ELSE 0 END) AS active_wallets,
      SUM(CASE WHEN status = 'frozen'      THEN 1 ELSE 0 END) AS frozen_wallets,
      SUM(CASE WHEN status = 'pending_kyc' THEN 1 ELSE 0 END) AS pending_kyc_count,
      SUM(CASE WHEN status = 'closed'      THEN 1 ELSE 0 END) AS closed_count
    FROM hl_wallets
  `).bind().first<{
    total_wallets: number;
    total_balance_kobo: number;
    total_funded_kobo: number;
    total_spent_kobo: number;
    active_wallets: number;
    frozen_wallets: number;
    pending_kyc_count: number;
    closed_count: number;
  }>();

  // Count HITL-pending funding requests (hitl_required = 1, status = 'pending')
  const hitlRow = await db.prepare(`
    SELECT /* GOVERNANCE_SKIP */ COUNT(*) AS pending_hitl_count
    FROM hl_funding_requests
    WHERE hitl_required = 1 AND status = 'pending'
  `).bind().first<{ pending_hitl_count: number }>();

  // Count all funding requests awaiting bank transfer proof (status = 'pending')
  const pendingFundingRow = await db.prepare(`
    SELECT /* GOVERNANCE_SKIP */ COUNT(*) AS pending_funding_count
    FROM hl_funding_requests
    WHERE status = 'pending'
  `).bind().first<{ pending_funding_count: number }>();

  const kv    = getWalletKv(c.env);
  const flags = {
    transfers:      (await kv.get('wallet:flag:transfers_enabled')) === '1',
    withdrawals:    (await kv.get('wallet:flag:withdrawals_enabled')) === '1',
    online_funding: (await kv.get('wallet:flag:online_funding_enabled')) === '1',
    mla_payout:     (await kv.get('wallet:flag:mla_payout_enabled')) === '1',
  };
  const eligibleTenantsRaw = await kv.get('wallet:eligible_tenants');
  const eligibleTenants = eligibleTenantsRaw ? JSON.parse(eligibleTenantsRaw) : [];

  return c.json({
    stats: {
      ...statsRow,
      pending_hitl_count:    hitlRow?.pending_hitl_count    ?? 0,
      pending_funding_count: pendingFundingRow?.pending_funding_count ?? 0,
    },
    feature_flags: flags,
    eligible_tenants: eligibleTenants,
  });
});

// GET /platform-admin/wallets/hitl — List pending HITL funding requests
// GOVERNANCE_SKIP: intentional cross-tenant list (platform super-admin only).
walletAdminRoutes.get('/hitl', async (c) => {
  const db = c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { all<T>(): Promise<{ results: T[] }> }};
  };
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);
  const cursor = c.req.query('cursor') ?? null;

  const { results } = await db.prepare(`
    SELECT /* GOVERNANCE_SKIP */
      fr.id, fr.wallet_id, fr.user_id, fr.tenant_id,
      fr.amount_kobo, fr.bank_transfer_order_id,
      fr.status, fr.created_at, fr.updated_at
    FROM hl_funding_requests fr
    WHERE fr.hitl_required = 1 AND fr.status = 'pending'
      ${cursor ? 'AND fr.id > ?' : ''}
    ORDER BY fr.created_at ASC
    LIMIT ?
  `).bind(...(cursor ? [cursor, limit] : [limit])).all<{
    id: string;
    wallet_id: string;
    user_id: string;
    tenant_id: string;
    amount_kobo: number;
    bank_transfer_order_id: string | null;
    status: string;
    created_at: number;
    updated_at: number;
  }>();

  const nextCursor = results.length === limit ? results[results.length - 1]?.id ?? null : null;
  return c.json({ items: results, count: results.length, next_cursor: nextCursor });
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
// GOVERNANCE_SKIP: intentional cross-tenant lookup (platform super-admin only).
// Super-admins may inspect any wallet platform-wide; tenant scoping is enforced by role guard.
walletAdminRoutes.get('/:walletId', async (c) => {
  const { walletId } = c.req.param();

  const db = c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): {
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    }};
  };

  const walletRow = await db.prepare(
    'SELECT /* GOVERNANCE_SKIP */ * FROM hl_wallets WHERE id = ?',
  ).bind(walletId).first<Record<string, unknown>>();

  if (!walletRow) return c.json({ error: 'WALLET_NOT_FOUND' }, 404);

  return c.json({ wallet: walletRow });
});

// POST /platform-admin/wallets/:walletId/freeze
// GOVERNANCE_SKIP: intentional cross-tenant update (platform super-admin only).
// Super-admins may freeze any wallet platform-wide; role guard enforced at router level.
walletAdminRoutes.post('/:walletId/freeze', async (c) => {
  const { walletId } = c.req.param();
  const auth         = c.get('auth');
  let body: { reason?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { /* optional */ }

  if (!body.reason) return c.json({ error: 'reason is required' }, 400);

  // First look up the wallet's actual tenant_id so we can scope subsequent operations and events.
  const walletRow = await (c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { first<T>(): Promise<T | null> }};
  }).prepare(`SELECT /* GOVERNANCE_SKIP */ tenant_id FROM hl_wallets WHERE id = ? LIMIT 1`)
    .bind(walletId).first<{ tenant_id: string }>();

  if (!walletRow) return c.json({ error: 'WALLET_NOT_FOUND', message: 'Wallet not found' }, 404);

  const now = Math.floor(Date.now() / 1000);
  const result = await (c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { run(): Promise<{ success: boolean; meta?: { changes?: number } }> }};
  }).prepare(`
    UPDATE /* GOVERNANCE_SKIP */ hl_wallets SET status = 'frozen', frozen_reason = ?, updated_at = ?
    WHERE id = ? AND status = 'active'
  `).bind(body.reason, now, walletId).run();

  if (!result.meta?.changes) {
    return c.json({ error: 'WALLET_NOT_FREEZABLE', message: 'Wallet not found or not in active status' }, 409);
  }

  await publishEvent(c.env, {
    eventId:   generateId('notif'),
    eventKey:  'wallet.admin.frozen',
    tenantId:  walletRow.tenant_id,
    actorId:   auth.userId,
    actorType: 'admin',
    payload:   { wallet_id: walletId, frozen_reason: body.reason },
  });

  // WF-034: audit log (fire-and-forget)
  writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
    tenantId:     walletRow.tenant_id,
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
// GOVERNANCE_SKIP: intentional cross-tenant update (platform super-admin only).
walletAdminRoutes.post('/:walletId/unfreeze', async (c) => {
  const { walletId } = c.req.param();
  const auth         = c.get('auth');

  // Look up the wallet's actual tenant_id for event scoping.
  const unfreezeWalletRow = await (c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { first<T>(): Promise<T | null> }};
  }).prepare(`SELECT /* GOVERNANCE_SKIP */ tenant_id FROM hl_wallets WHERE id = ? LIMIT 1`)
    .bind(walletId).first<{ tenant_id: string }>();

  if (!unfreezeWalletRow) return c.json({ error: 'WALLET_NOT_FOUND', message: 'Wallet not found' }, 404);

  const now = Math.floor(Date.now() / 1000);
  const unfreezeResult = await (c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { run(): Promise<{ success: boolean; meta?: { changes?: number } }> }};
  }).prepare(`
    UPDATE /* GOVERNANCE_SKIP */ hl_wallets SET status = 'active', frozen_reason = NULL, updated_at = ?
    WHERE id = ? AND status = 'frozen'
  `).bind(now, walletId).run();

  if (!unfreezeResult.meta?.changes) {
    return c.json({ error: 'WALLET_NOT_FROZEN', message: 'Wallet not found or not in frozen status' }, 409);
  }

  await publishEvent(c.env, {
    eventId:   generateId('notif'),
    eventKey:  'wallet.admin.unfrozen',
    tenantId:  unfreezeWalletRow.tenant_id,
    actorId:   auth.userId,
    actorType: 'admin',
    payload:   { wallet_id: walletId },
  });

  // WF-034: audit log (fire-and-forget)
  writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
    tenantId:     unfreezeWalletRow.tenant_id,
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

// ---------------------------------------------------------------------------
// Admin: withdrawal confirm / reject
// POST /platform-admin/wallets/withdrawals/:id/confirm
// POST /platform-admin/wallets/withdrawals/:id/reject
// GET  /platform-admin/wallets/withdrawals — list all pending withdrawals
// ---------------------------------------------------------------------------

walletAdminRoutes.get('/withdrawals', async (c) => {
  const db = c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { all<T>(): Promise<{ results: T[] }> }};
  };
  const status = c.req.query('status') ?? 'pending';
  const limit  = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);

  const { results } = await db.prepare(`
    SELECT /* GOVERNANCE_SKIP */
      w.id, w.wallet_id, w.user_id, w.tenant_id, w.amount_kobo,
      w.bank_code, w.account_number, w.account_name,
      w.status, w.reference, w.provider_ref, w.rejection_reason,
      w.completed_at, w.created_at, w.updated_at
    FROM hl_withdrawal_requests w
    WHERE w.status = ?
    ORDER BY w.created_at ASC
    LIMIT ?
  `).bind(status, limit).all<Record<string, unknown>>();

  return c.json({ withdrawals: results, count: results.length });
});

walletAdminRoutes.post('/withdrawals/:id/confirm', async (c) => {
  const { id } = c.req.param();
  const auth   = c.get('auth');
  let body: { provider_ref?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { /* optional */ }

  if (!body.provider_ref || typeof body.provider_ref !== 'string') {
    return c.json({ error: 'provider_ref is required (bank transaction ID)' }, 400);
  }

  const wr = await (c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { first<T>(): Promise<T | null> }};
  }).prepare(`SELECT tenant_id FROM hl_withdrawal_requests WHERE id = ? LIMIT 1`)
    .bind(id).first<{ tenant_id: string }>();

  if (!wr) return c.json({ error: 'WITHDRAWAL_NOT_FOUND' }, 404);

  try {
    const withdrawal = await confirmWithdrawal(c.env.DB as never, id, wr.tenant_id, body.provider_ref);

    await publishEvent(c.env, {
      eventId:   generateId('notif'),
      eventKey:  'wallet.withdrawal.completed',
      tenantId:  wr.tenant_id,
      actorId:   auth.userId,
      actorType: 'admin',
      payload: {
        withdrawal_id: withdrawal.id,
        wallet_id:     withdrawal.walletId,
        amount_kobo:   withdrawal.amountKobo,
        amount_naira:  (withdrawal.amountKobo / 100).toFixed(2),
        bank_code:     withdrawal.bankCode,
        account_number: withdrawal.accountNumber,
        provider_ref:  withdrawal.providerRef,
      },
    }).catch(() => {});

    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     wr.tenant_id,
      userId:       auth.userId,
      action:       'wallet.withdrawal.confirm',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'hl_withdrawal_request',
      resourceId:   id,
      statusCode:   200,
      metadata:     { amount_kobo: withdrawal.amountKobo, provider_ref: body.provider_ref },
    });

    return c.json({ withdrawal });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

walletAdminRoutes.post('/withdrawals/:id/reject', async (c) => {
  const { id } = c.req.param();
  const auth   = c.get('auth');
  let body: { reason?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { /* optional */ }

  if (!body.reason) return c.json({ error: 'reason is required' }, 400);

  const wr = await (c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { first<T>(): Promise<T | null> }};
  }).prepare(`SELECT tenant_id FROM hl_withdrawal_requests WHERE id = ? LIMIT 1`)
    .bind(id).first<{ tenant_id: string }>();

  if (!wr) return c.json({ error: 'WITHDRAWAL_NOT_FOUND' }, 404);

  try {
    const withdrawal = await rejectWithdrawal(c.env.DB as never, id, wr.tenant_id, body.reason);

    await publishEvent(c.env, {
      eventId:   generateId('notif'),
      eventKey:  'wallet.withdrawal.rejected',
      tenantId:  wr.tenant_id,
      actorId:   auth.userId,
      actorType: 'admin',
      payload: {
        withdrawal_id:    withdrawal.id,
        wallet_id:        withdrawal.walletId,
        amount_kobo:      withdrawal.amountKobo,
        amount_naira:     (withdrawal.amountKobo / 100).toFixed(2),
        rejection_reason: body.reason,
      },
    }).catch(() => {});

    writeWalletAuditLog(c.env.DB as unknown as D1Compat, {
      tenantId:     wr.tenant_id,
      userId:       auth.userId,
      action:       'wallet.withdrawal.reject',
      method:       c.req.method,
      path:         c.req.path,
      resourceType: 'hl_withdrawal_request',
      resourceId:   id,
      statusCode:   200,
      metadata:     { reason: body.reason, amount_kobo: withdrawal.amountKobo },
    });

    return c.json({ withdrawal });
  } catch (err) {
    return handleWalletError(err, c);
  }
});

// GET /platform-admin/wallets/reconciliation
// GOVERNANCE_SKIP: intentional cross-tenant aggregate (platform super-admin reconciliation only).
// Requires super_admin role. Shows all drifted wallets platform-wide.
walletAdminRoutes.get('/reconciliation', async (c) => {
  const db = c.env.DB as never as {
    prepare(sql: string): { bind(...a: unknown[]): { all<T>(): Promise<{ results: T[] }> }};
  };

  const rows = await db.prepare(`
    SELECT /* GOVERNANCE_SKIP */
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
