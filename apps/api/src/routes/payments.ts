/**
 * Payment routes — Paystack checkout + verification + billing history.
 *
 *   POST /workspaces/:id/upgrade          — initialise a checkout
 *                                           (bank_transfer instructions OR Paystack URL)
 *   POST /payments/verify                 — verify + sync a completed payment
 *   GET  /workspaces/:id/billing          — list billing history for workspace
 *   GET  /payments/method                 — current payment mode + bank account details
 *
 * All routes require auth (applied at app level in index.ts).
 *
 * Security invariants (security-baseline.md, TDR-0008):
 *   T1 — Every workspace operation is validated against the caller's workspaceId
 *         from the verified JWT (c.get('auth')).
 *   T3 — Billing history queries are scoped to the authenticated workspace only.
 *   W1 — POST /payments/verify validates the x-paystack-signature HMAC before
 *         processing any payment state change.
 *
 * Payment mode selection:
 *   DEFAULT_PAYMENT_MODE = 'bank_transfer' (default) — routes return bank account
 *   details + a reference for manual transfer. No Paystack key required.
 *   DEFAULT_PAYMENT_MODE = 'paystack' — routes initialise a Paystack checkout.
 *   PAYSTACK_SECRET_KEY must be present; absence falls back to bank_transfer.
 *
 * Milestone 6 — Payments Layer
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import { initializePayment, verifyPayment, verifyWebhookSignature } from '@webwaka/payments';
import { syncPaymentToSubscription, recordFailedPayment } from '@webwaka/payments';
import { WebhookDispatcher } from '../lib/webhook-dispatcher.js';
import { publishEvent } from '../lib/publish-event.js';
import { BillingEventType, WorkspaceEventType } from '@webwaka/events';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

interface PlatformBankAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
  sort_code?: string;
}

/**
 * Parse PLATFORM_BANK_ACCOUNT_JSON.
 *
 * BUG-008 fix: The previous implementation returned a soft 'Not configured' default
 * when the env var was absent or malformed. This silently allowed the upgrade route
 * to present bogus bank account details to users, resulting in failed transfers and
 * silent ops failures.
 *
 * New behaviour: throw on missing or malformed config so callers can return HTTP 503
 * (payment_method_unavailable) with a clear ops alert instead of silently misdirecting
 * user payments to "N/A" account details.
 */
function parseBankAccount(raw: string | undefined): PlatformBankAccount {
  if (!raw) {
    throw new Error('PLATFORM_BANK_ACCOUNT_JSON is not configured');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('PLATFORM_BANK_ACCOUNT_JSON is not valid JSON');
  }
  const p = parsed as Record<string, string>;
  if (!p.bank_name || !p.account_number || !p.account_name) {
    throw new Error('PLATFORM_BANK_ACCOUNT_JSON is missing required fields: bank_name, account_number, account_name');
  }
  return p as unknown as PlatformBankAccount;
}

/**
 * Fetch the platform receiving bank account with the configured priority chain:
 *   1. WALLET_KV key `platform:payment:bank_account`  (set via platform admin dashboard)
 *   2. PLATFORM_BANK_ACCOUNT_JSON env var              (wrangler.toml / Cloudflare secret)
 *   3. Safe "Not configured" default
 */
async function getPlatformBankAccount(
  kv: KVNamespace | undefined,
  envJson: string | undefined,
): Promise<PlatformBankAccount> {
  if (kv) {
    try {
      const raw = await kv.get('platform:payment:bank_account');
      if (raw) return JSON.parse(raw) as PlatformBankAccount;
    } catch { /* fall through */ }
  }
  return parseBankAccount(envJson);
}

/**
 * Generate a short, human-readable, traceable bank transfer reference.
 * Format: WKUP-{8-char workspace suffix}-{5-char random base36}
 * e.g.  WKUP-ABCD1234-X7K3M
 */
function generateUpgradeRef(workspaceId: string): string {
  const suffix = workspaceId.replace(/-/g, '').slice(-8).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `WKUP-${suffix}-${rand}`;
}

/** Format kobo amount as human-readable Naira string: 500000 → "5,000.00" */
function formatNaira(kobo: number): string {
  return (kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PLAN_AMOUNTS: Record<string, number> = {
  starter:    500_000,
  growth:   2_000_000,
  enterprise: 10_000_000,
};

/** True when the platform is in manual (bank-transfer) mode. */
function isBankTransferMode(env: Env): boolean {
  if (!env.PAYSTACK_SECRET_KEY) return true;
  return (env.DEFAULT_PAYMENT_MODE ?? 'bank_transfer') === 'bank_transfer';
}

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

interface BillingRow {
  id: string;
  workspace_id: string;
  paystack_ref: string | null;
  amount_kobo: number;
  status: string;
  metadata: string;
  created_at: string;
}

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

// ---------------------------------------------------------------------------
// Workspace upgrade — POST /workspaces/:id/upgrade
// ---------------------------------------------------------------------------

export const workspaceUpgradeRoute = new Hono<AppEnv>();

workspaceUpgradeRoute.post('/:id/upgrade', async (c) => {
  const workspaceId = c.req.param('id');

  // T1: Verify the caller owns (or is operating in) the requested workspace.
  const auth = c.get('auth');
  if (auth.workspaceId !== workspaceId) {
    return c.json({ error: 'Forbidden — workspace mismatch' }, 403);
  }

  let body: { plan?: string; email?: string } = {};
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const email = body.email;
  if (!email) {
    return c.json({ error: 'email is required' }, 400);
  }

  const plan = body.plan ?? 'starter';
  const validPlans = ['starter', 'growth', 'enterprise'];
  if (!validPlans.includes(plan)) {
    return c.json({ error: `Invalid plan. Must be one of: ${validPlans.join(' | ')}` }, 400);
  }
  const amountKobo = PLAN_AMOUNTS[plan]!;

  // ── Bank transfer (manual) mode ────────────────────────────────────────────
  if (isBankTransferMode(c.env)) {
    // BUG-008 fix: getPlatformBankAccount now throws when config is missing/malformed.
    // Catch here and return 503 (payment_method_unavailable) with structured log so ops
    // are alerted immediately rather than users receiving bogus "N/A" bank details.
    let bankAccount: PlatformBankAccount;
    try {
      bankAccount = await getPlatformBankAccount(c.env.WALLET_KV, c.env.PLATFORM_BANK_ACCOUNT_JSON);
    } catch (configErr) {
      console.error(JSON.stringify({
        level: 'error',
        event: 'bank_account_config_missing',
        message: configErr instanceof Error ? configErr.message : String(configErr),
        workspaceId,
      }));
      return c.json(
        { error: 'payment_method_unavailable', message: 'Bank transfer is temporarily unavailable. Please contact support.' },
        503,
      );
    }
    const reference   = generateUpgradeRef(workspaceId);
    const naira       = formatNaira(amountKobo);
    const expiresAt   = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const requestId   = crypto.randomUUID().replace(/-/g, '');
    const db          = c.env.DB as unknown as D1Like;

    // Persist the upgrade request so the platform admin can confirm or reject it.
    await db
      .prepare(
        `INSERT OR IGNORE INTO workspace_upgrade_requests
           (id, workspace_id, tenant_id, plan, amount_kobo, reference,
            requester_email, status, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      )
      .bind(requestId, workspaceId, auth.tenantId,
            plan, amountKobo, reference, email, expiresAt)
      .run();

    return c.json(
      {
        payment_mode:       'bank_transfer',
        upgrade_request_id: requestId,
        plan,
        amount_kobo:        amountKobo,
        amount_naira:       naira,
        reference,
        narration:          `WebWaka Plan Upgrade - ${reference}`,
        bank_account:       bankAccount,
        instructions:       `Transfer ₦${naira} to the account above. Use the reference ${reference} as your payment narration. Your workspace plan will be activated within 1 business day after payment confirmation by the platform team.`,
        expires_at:         expiresAt,
      },
      200,
    );
  }

  // ── Paystack (online) mode ─────────────────────────────────────────────────
  const secretKey = c.env.PAYSTACK_SECRET_KEY!;

  try {
    const payment = await initializePayment(
      { secretKey },
      {
        workspaceId,
        amountKobo,
        email,
        callbackUrl: `${c.env.APP_BASE_URL ?? 'https://app.webwaka.com'}/billing/verify`,
        metadata: { plan, workspace_id: workspaceId },
      },
    );

    return c.json(
      {
        payment_mode:       'paystack',
        reference:          payment.reference,
        authorization_url:  payment.authorizationUrl,
        access_code:        payment.accessCode,
        amount_kobo:        payment.amountKobo,
        plan,
      },
      201,
    );
  } catch (err) {
    console.error('[payments] initializePayment error:', err);
    return c.json({ error: 'Payment initialization failed' }, 502);
  }
});

// ---------------------------------------------------------------------------
// Payment verification — POST /payments/verify
//
// W1: Paystack sends a x-paystack-signature HMAC-SHA512 header with every
// webhook call. We MUST validate it before acting on the payload, otherwise
// any caller could forge a payment success event.
//
// Flow:
//   1. Read raw body text (before JSON parse — signature covers the raw bytes).
//   2. Validate x-paystack-signature against HMAC-SHA512(body, secretKey).
//   3. Only then parse JSON + run payment sync.
// ---------------------------------------------------------------------------

export const paymentsVerifyRoute = new Hono<AppEnv>();

paymentsVerifyRoute.post('/verify', async (c) => {
  const secretKey = c.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return c.json({ error: 'Payment provider not configured' }, 503);
  }

  // W1: Read raw body FIRST so we can verify the signature over the original bytes.
  const rawBody = await c.req.text();

  // W1: Validate Paystack webhook signature.
  const signature = c.req.header('x-paystack-signature') ?? '';
  const signatureValid = await verifyWebhookSignature(rawBody, signature, secretKey);
  if (!signatureValid) {
    return c.json({ error: 'Invalid webhook signature' }, 401);
  }

  // Parse body after signature validation.
  let body: { reference?: string; workspaceId?: string } = {};
  try {
    body = JSON.parse(rawBody) as typeof body;
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { reference, workspaceId } = body;
  if (!reference || !workspaceId) {
    return c.json({ error: 'reference and workspaceId are required' }, 422);
  }

  // T1: Verify caller is operating in the workspace they are syncing payment for.
  const auth = c.get('auth');
  if (auth.workspaceId !== workspaceId) {
    return c.json({ error: 'Forbidden — workspace mismatch' }, 403);
  }

  try {
    const verified = await verifyPayment({ secretKey }, reference);

    const db = c.env.DB as unknown as D1Like;

    if (verified.status === 'success') {
      const result = await syncPaymentToSubscription(db, {
        workspaceId,
        tenantId: auth.tenantId,
        paystackRef: reference,
        amountKobo: verified.amountKobo,
        metadata: { ...(verified.metadata as Record<string, unknown>) },
      });

      // PROD-04: fire-and-forget webhook dispatch (best effort)
      const dispatcher = new WebhookDispatcher(c.env.DB, auth.tenantId);
      void dispatcher.dispatch('payment.completed', {
        workspace_id: workspaceId,
        reference,
        amount_kobo: verified.amountKobo,
        plan: result.plan,
        billing_id: result.billingId,
      }).catch(() => {});

      // N-082: billing.payment_succeeded event
      void publishEvent(c.env, {
        eventId: reference,
        eventKey: BillingEventType.BillingPaymentSucceeded,
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorType: 'user',
        workspaceId,
        payload: { reference, amount_kobo: verified.amountKobo, plan: result.plan, billing_id: result.billingId },
        source: 'api',
        severity: 'info',
        correlationId: c.get('requestId') ?? undefined,
      });

      // N-081/T2: workspace.activated — payment verified; workspace is now on a paid plan
      void publishEvent(c.env, {
        eventId: crypto.randomUUID(),
        eventKey: WorkspaceEventType.WorkspaceActivated,
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorType: 'user',
        workspaceId,
        payload: { plan: result.plan, reference, billing_id: result.billingId },
        source: 'api',
        severity: 'info',
        correlationId: c.get('requestId') ?? undefined,
      });

      return c.json({
        status: 'success',
        plan: result.plan,
        billingId: result.billingId,
        amountKobo: verified.amountKobo,
      });
    } else {
      await recordFailedPayment(db, workspaceId, reference, verified.amountKobo);

      // N-082: billing.payment_failed event
      void publishEvent(c.env, {
        eventId: reference,
        eventKey: BillingEventType.BillingPaymentFailed,
        tenantId: auth.tenantId,
        actorId: auth.userId,
        actorType: 'user',
        workspaceId,
        payload: { reference, amount_kobo: verified.amountKobo, status: verified.status },
        source: 'api',
        severity: 'warning',
        correlationId: c.get('requestId') ?? undefined,
      });

      return c.json({ status: verified.status, error: 'Payment was not successful' }, 402);
    }
  } catch (err) {
    console.error('[payments] verifyPayment error:', err);
    return c.json({ error: 'Payment verification failed' }, 502);
  }
});

// ---------------------------------------------------------------------------
// Billing history — GET /workspaces/:id/billing
// ---------------------------------------------------------------------------

export const workspaceBillingRoute = new Hono<AppEnv>();

workspaceBillingRoute.get('/:id/billing', async (c) => {
  const workspaceId = c.req.param('id');

  // T3: Scope billing history to the authenticated caller's workspace only.
  const auth = c.get('auth');
  if (auth.workspaceId !== workspaceId) {
    return c.json({ error: 'Forbidden — workspace mismatch' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  const rows = await db
    .prepare(
      `SELECT id, workspace_id, paystack_ref, amount_kobo, status, metadata,
              datetime(created_at,'unixepoch') AS created_at
       FROM billing_history
       WHERE workspace_id = ? AND tenant_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
    )
    .bind(workspaceId, auth.tenantId)
    .all<BillingRow>();

  const records = rows.results.map((r) => ({
    id: r.id,
    workspaceId: r.workspace_id,
    paystackRef: r.paystack_ref,
    amountKobo: r.amount_kobo,
    status: r.status,
    metadata: (() => { try { return JSON.parse(r.metadata) as Record<string, unknown>; } catch { return {}; } })(),
    createdAt: r.created_at,
  }));

  return c.json({ workspaceId, records, total: records.length });
});

// ---------------------------------------------------------------------------
// Payment method info — GET /payments/method
//
// Returns the current payment mode and, when in bank-transfer mode, the
// platform receiving account details. Intended for the workspace app to
// display appropriate payment UI without hard-coding logic client-side.
// ---------------------------------------------------------------------------

export const paymentsMethodRoute = new Hono<AppEnv>();

paymentsMethodRoute.get('/method', async (c) => {
  const mode = isBankTransferMode(c.env) ? 'bank_transfer' : 'paystack';

  const payload: Record<string, unknown> = {
    payment_mode:      mode,
    gateway_available: !!(c.env.PAYSTACK_SECRET_KEY),
    plans: {
      starter:    { amount_kobo: PLAN_AMOUNTS['starter']!,    amount_naira: formatNaira(PLAN_AMOUNTS['starter']!)    },
      growth:     { amount_kobo: PLAN_AMOUNTS['growth']!,     amount_naira: formatNaira(PLAN_AMOUNTS['growth']!)     },
      enterprise: { amount_kobo: PLAN_AMOUNTS['enterprise']!, amount_naira: formatNaira(PLAN_AMOUNTS['enterprise']!) },
    },
  };

  if (mode === 'bank_transfer') {
    payload['bank_account'] = await getPlatformBankAccount(c.env.WALLET_KV, c.env.PLATFORM_BANK_ACCOUNT_JSON);
    payload['instructions']  = 'Transfer the plan amount to the bank account above. Use your workspace ID or the reference provided during upgrade as your payment narration. Activation occurs within 1 business day of confirmation.';
  }

  return c.json(payload);
});
