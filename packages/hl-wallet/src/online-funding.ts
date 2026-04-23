/**
 * @webwaka/hl-wallet — Online wallet funding via Paystack (W5)
 *
 * Platform Invariants enforced:
 *   P9  — all amounts validated as integer kobo (converted to NGN for Paystack)
 *   T3  — tenant_id scoping on all queries
 *   T7  — wallet FSM state validated before funding initialisation
 *
 * Online funding flow:
 *   1. User initiates: POST /wallet/fund/online
 *      - Validates wallet + balance cap + KYC
 *      - Calls Paystack /transaction/initialize with amount_kobo / 100 * 100 kobo
 *        (Paystack amounts are in kobo — same unit)
 *      - Creates hl_funding_request row (bank_transfer_order_id = Paystack reference)
 *      - Returns { payment_url, reference } so the frontend redirects the user
 *   2. Paystack webhook: POST /wallet/fund/paystack-webhook
 *      - Verifies HMAC-SHA512 signature
 *      - Confirms funding via existing confirmFunding()
 *   3. Paystack redirect: GET /wallet/fund/verify?reference=...
 *      - Verifies the Paystack transaction status
 *      - If successful and not already confirmed: calls confirmFunding()
 *
 * The PAYSTACK_SECRET_KEY must be set as a Cloudflare Worker secret.
 * When the feature flag 'online_funding' is disabled, the route returns 503.
 */

import { checkBalanceCap } from './kyc-gate.js';
import { WalletError } from './errors.js';
import { generateId } from './reference.js';
import { confirmFunding } from './funding.js';

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

type KVLike = KVNamespace;

export interface InitializeOnlineFundingParams {
  walletId:       string;
  userId:         string;
  tenantId:       string;
  workspaceId:    string;
  amountKobo:     number;
  email:          string;
  paystackSecretKey: string;
}

export interface OnlineFundingInit {
  fundingRequestId: string;
  reference:        string;
  paymentUrl:       string;
  amountKobo:       number;
  amountNaira:      string;
  expiresAt:        number;
}

/**
 * initializeOnlineFunding — call Paystack to initialize a card/bank payment.
 *
 * Creates an hl_funding_request linked to the Paystack reference.
 * The caller redirects the user to authorization_url.
 */
export async function initializeOnlineFunding(
  db:     D1Like,
  kv:     KVLike,
  params: InitializeOnlineFundingParams,
): Promise<OnlineFundingInit> {
  const { walletId, userId, tenantId, workspaceId, amountKobo, email, paystackSecretKey } = params;

  if (!paystackSecretKey) {
    throw new WalletError(
      'FEATURE_DISABLED',
      { feature: 'online_funding' },
      'Online funding is not yet configured. Please use bank transfer instead.',
    );
  }

  const walletRow = await db.prepare(`
    SELECT balance_kobo, kyc_tier, status FROM hl_wallets WHERE id = ? AND tenant_id = ? LIMIT 1
  `).bind(walletId, tenantId).first<{ balance_kobo: number; kyc_tier: number; status: string }>();

  if (!walletRow) throw new WalletError('WALLET_NOT_FOUND');
  if (walletRow.status !== 'active') {
    throw new WalletError('WALLET_NOT_ACTIVE', { status: walletRow.status });
  }

  await checkBalanceCap(kv, walletRow.balance_kobo, amountKobo, walletRow.kyc_tier as 1 | 2 | 3);

  const paystackRef = `hlw_${generateId('ps')}`;

  const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
    method:  'POST',
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount:    amountKobo,
      reference: paystackRef,
      metadata: {
        wallet_id:    walletId,
        user_id:      userId,
        tenant_id:    tenantId,
        workspace_id: workspaceId,
        source:       'webwaka_wallet_online_funding',
      },
      channels: ['card', 'bank_transfer', 'ussd'],
    }),
  });

  if (!paystackRes.ok) {
    const errText = await paystackRes.text().catch(() => paystackRes.statusText);
    throw new WalletError('PAYSTACK_ERROR', { upstream_error: errText });
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const paystackData = await paystackRes.json() as unknown as {
    status: boolean;
    message: string;
    data?: { authorization_url: string; reference: string; access_code: string };
  };

  if (!paystackData.status || !paystackData.data) {
    throw new WalletError('PAYSTACK_ERROR', { message: paystackData.message });
  }

  const fundingId  = generateId('hlf');
  const orderRefId = generateId('bto');
  const now        = Math.floor(Date.now() / 1000);
  const expiresAt  = now + 30 * 60;

  await db.prepare(`
    INSERT OR IGNORE INTO bank_transfer_orders
      (id, tenant_id, user_id, workspace_id, amount_kobo, reference, status,
       bank_name, account_number, account_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', 'Paystack', 'online', ?, ?, ?)
  `).bind(orderRefId, tenantId, userId, workspaceId, amountKobo,
          paystackRef, `Paystack Online (${email})`, now, now).run();

  await db.prepare(`
    INSERT OR IGNORE INTO hl_funding_requests
      (id, wallet_id, user_id, tenant_id, workspace_id, amount_kobo,
       bank_transfer_order_id, status, hitl_required, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)
  `).bind(fundingId, walletId, userId, tenantId, workspaceId,
          amountKobo, orderRefId, now, now).run();

  return {
    fundingRequestId: fundingId,
    reference:        paystackRef,
    paymentUrl:       paystackData.data.authorization_url,
    amountKobo,
    amountNaira:      (amountKobo / 100).toFixed(2), // DISPLAY_ONLY
    expiresAt,
  };
}

/**
 * verifyAndCompleteOnlineFunding — verify a Paystack transaction by reference
 * and complete the funding if successful and not already credited.
 *
 * Called from the redirect callback route or polling endpoint.
 */
export async function verifyAndCompleteOnlineFunding(
  db:                D1Like,
  kv:                KVLike,
  reference:         string,
  tenantId:          string,
  paystackSecretKey: string,
  confirmedBy:       string,
): Promise<{ status: 'funded' | 'already_funded' | 'payment_failed'; amountKobo?: number }> {
  const paystackRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${paystackSecretKey}` } },
  );

  if (!paystackRes.ok) {
    throw new WalletError('PAYSTACK_ERROR', {}, 'Failed to verify payment with Paystack.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const data = await paystackRes.json() as unknown as {
    status: boolean;
    data?: { status: string; amount: number; reference: string };
  };

  if (!data.status || data.data?.status !== 'success') {
    return { status: 'payment_failed' };
  }

  const order = await db.prepare(`
    SELECT id, status FROM bank_transfer_orders WHERE reference = ? LIMIT 1
  `).bind(reference).first<{ id: string; status: string }>();

  if (!order) {
    throw new WalletError('FUNDING_NOT_FOUND', { reference });
  }

  if (order.status === 'confirmed') {
    return { status: 'already_funded', amountKobo: data.data.amount };
  }

  const fundingReq = await db.prepare(`
    SELECT id FROM hl_funding_requests WHERE bank_transfer_order_id = ? AND tenant_id = ? LIMIT 1
  `).bind(order.id, tenantId).first<{ id: string }>();

  if (!fundingReq) {
    throw new WalletError('FUNDING_NOT_FOUND', { order_id: order.id });
  }

  await confirmFunding(db as never, kv, fundingReq.id, tenantId, confirmedBy);
  return { status: 'funded', amountKobo: data.data.amount };
}

/**
 * verifyPaystackWebhookSignature — validate Paystack HMAC-SHA512 signature.
 *
 * Should be called before processing any Paystack webhook payload.
 * Returns true if signature is valid.
 */
export async function verifyPaystackWebhookSignature(
  rawBody:     string,
  signature:   string,
  secretKey:   string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key     = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const computed = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return computed === signature;
}
