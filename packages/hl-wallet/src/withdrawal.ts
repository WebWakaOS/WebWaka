/**
 * @webwaka/hl-wallet — Wallet withdrawal (W4)
 *
 * Platform Invariants enforced:
 *   P9  — all amounts validated as integer kobo
 *   T3  — tenant_id scoping on all queries
 *   T4  — withdrawal reserve debit is atomic; admin-confirm is idempotent
 *   T7  — wallet FSM state validated before reserve
 *
 * Withdrawal flow:
 *   1. User initiates: POST /wallet/withdraw
 *      - Validates wallet active + balance sufficient
 *      - Checks daily limit
 *      - Reserves amount: debit wallet (tx_type='withdrawal_reserved')
 *      - Creates hl_withdrawal_requests row (status='pending')
 *      - Returns reference for bank payout tracking
 *   2. Admin processes bank payout (external)
 *   3. Admin confirms: PATCH /platform-admin/wallets/withdrawals/:id/confirm
 *      - Sets status='completed'; records provider_ref
 *   4. On rejection: PATCH /platform-admin/wallets/withdrawals/:id/reject
 *      - Reverses the reserved debit (credit wallet back, tx_type='reversal')
 *      - Sets status='rejected'
 */

import { debitWallet, creditWallet, getWallet } from './ledger.js';
import { checkDailyLimit } from './kyc-gate.js';
import { WalletError } from './errors.js';
import { generateId } from './reference.js';

export interface HlWithdrawalRequest {
  id:                     string;
  walletId:               string;
  userId:                 string;
  tenantId:               string;
  amountKobo:             number;
  bankCode:               string;
  accountNumber:          string;
  accountName:            string;
  paystackRecipientCode:  string | null;
  status:                 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  reference:              string;
  providerRef:            string | null;
  rejectionReason:        string | null;
  completedAt:            number | null;
  createdAt:              number;
  updatedAt:              number;
}

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

export interface InitiateWithdrawalParams {
  walletId:      string;
  userId:        string;
  tenantId:      string;
  amountKobo:    number;
  bankCode:      string;
  accountNumber: string;
  accountName:   string;
}

function mapWithdrawalRow(row: Record<string, unknown>): HlWithdrawalRequest {
  return {
    id:                    row.id as string,
    walletId:              row.wallet_id as string,
    userId:                row.user_id as string,
    tenantId:              row.tenant_id as string,
    amountKobo:            row.amount_kobo as number,
    bankCode:              row.bank_code as string,
    accountNumber:         row.account_number as string,
    accountName:           row.account_name as string,
    paystackRecipientCode: (row.paystack_recipient_code as string | null) ?? null,
    status:                row.status as HlWithdrawalRequest['status'],
    reference:             row.reference as string,
    providerRef:           (row.provider_ref as string | null) ?? null,
    rejectionReason:       (row.rejection_reason as string | null) ?? null,
    completedAt:           (row.completed_at as number | null) ?? null,
    createdAt:             row.created_at as number,
    updatedAt:             row.updated_at as number,
  };
}

/**
 * initiateWithdrawal — reserve funds and create withdrawal request.
 * The actual bank payout is handled externally by ops/admin.
 */
export async function initiateWithdrawal(
  db:  D1Like,
  kv:  KVLike,
  params: InitiateWithdrawalParams,
): Promise<HlWithdrawalRequest> {
  const { walletId, userId, tenantId, amountKobo, bankCode, accountNumber, accountName } = params;

  const wallet = await getWallet(db as never, walletId, tenantId);
  if (wallet.status !== 'active') {
    throw new WalletError('WALLET_NOT_ACTIVE', { status: wallet.status });
  }
  if (wallet.balanceKobo < amountKobo) {
    throw new WalletError('INSUFFICIENT_BALANCE', {
      balance_kobo:   wallet.balanceKobo,
      requested_kobo: amountKobo,
    });
  }

  await checkDailyLimit(db as never, kv as never, walletId, tenantId, amountKobo, wallet.kycTier);

  const withdrawalId = generateId('hlwd');
  const reference    = generateId('ref');
  const now          = Math.floor(Date.now() / 1000);

  await db.prepare(`
    INSERT OR IGNORE INTO hl_withdrawal_requests
      (id, wallet_id, user_id, tenant_id, amount_kobo, bank_code,
       account_number, account_name, status, reference, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  `).bind(withdrawalId, walletId, userId, tenantId, amountKobo,
          bankCode, accountNumber, accountName, reference, now, now).run();

  await debitWallet(db as never, {
    walletId,
    userId,
    tenantId,
    amountKobo,
    txType:      'withdrawal_reserved',
    reference,
    description: `Withdrawal request to ${bankCode} ${accountNumber} (${accountName})`,
    relatedId:   withdrawalId,
    relatedType: 'hl_withdrawal_request',
  });

  const row = await db.prepare(`
    SELECT * FROM hl_withdrawal_requests WHERE id = ? AND tenant_id = ? LIMIT 1
  `).bind(withdrawalId, tenantId).first<Record<string, unknown>>();

  if (!row) throw new WalletError('WITHDRAWAL_FAILED', {}, 'Withdrawal record not found after creation.');
  return mapWithdrawalRow(row);
}

/**
 * getWithdrawalRequest — fetch a single withdrawal request.
 */
export async function getWithdrawalRequest(
  db:       D1Like,
  id:       string,
  tenantId: string,
): Promise<HlWithdrawalRequest> {
  const row = await db.prepare(`
    SELECT * FROM hl_withdrawal_requests WHERE id = ? AND tenant_id = ? LIMIT 1
  `).bind(id, tenantId).first<Record<string, unknown>>();

  if (!row) throw new WalletError('WITHDRAWAL_NOT_FOUND');
  return mapWithdrawalRow(row);
}

/**
 * listWithdrawalRequests — paginated list for a wallet, newest first.
 */
export async function listWithdrawalRequests(
  db:       D1Like,
  walletId: string,
  tenantId: string,
  limit     = 50,
  cursor?:  string,
): Promise<{ withdrawals: HlWithdrawalRequest[]; nextCursor: string | null }> {
  const hasCursor = Boolean(cursor);
  const binds: unknown[] = [walletId, tenantId];
  if (hasCursor) binds.push(cursor);
  binds.push(limit + 1);

  const { results } = await db.prepare(`
    SELECT * FROM hl_withdrawal_requests
    WHERE wallet_id = ? AND tenant_id = ?
      ${hasCursor ? 'AND id < ?' : ''}
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `).bind(...binds).all<Record<string, unknown>>();

  const withdrawals = results.slice(0, limit).map(mapWithdrawalRow);
  const nextCursor  = results.length > limit ? withdrawals[withdrawals.length - 1]?.id ?? null : null;
  return { withdrawals, nextCursor };
}

/**
 * confirmWithdrawal — mark withdrawal completed after bank payout.
 * Called by admin after confirming funds were sent to user's account.
 */
export async function confirmWithdrawal(
  db:          D1Like,
  id:          string,
  tenantId:    string,
  providerRef: string,
): Promise<HlWithdrawalRequest> {
  const existing = await getWithdrawalRequest(db, id, tenantId);
  if (existing.status !== 'pending' && existing.status !== 'processing') {
    throw new WalletError(
      'INVALID_WITHDRAWAL_STATE',
      { current_status: existing.status, action: 'confirm' },
    );
  }

  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    UPDATE hl_withdrawal_requests
    SET    status = 'completed', provider_ref = ?, completed_at = ?, updated_at = ?
    WHERE  id = ? AND tenant_id = ?
  `).bind(providerRef, now, now, id, tenantId).run();

  return getWithdrawalRequest(db, id, tenantId);
}

/**
 * rejectWithdrawal — cancel withdrawal and reverse the reserved debit.
 * Called by admin when payout cannot be processed.
 */
export async function rejectWithdrawal(
  db:      D1Like,
  id:      string,
  tenantId: string,
  reason:  string,
): Promise<HlWithdrawalRequest> {
  const existing = await getWithdrawalRequest(db, id, tenantId);
  if (existing.status !== 'pending' && existing.status !== 'processing') {
    throw new WalletError(
      'INVALID_WITHDRAWAL_STATE',
      { current_status: existing.status, action: 'reject' },
    );
  }

  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    UPDATE hl_withdrawal_requests
    SET    status = 'rejected', rejection_reason = ?, updated_at = ?
    WHERE  id = ? AND tenant_id = ?
  `).bind(reason, now, id, tenantId).run();

  await creditWallet(db as never, {
    walletId:    existing.walletId,
    tenantId,
    amountKobo:  existing.amountKobo,
    txType:      'reversal',
    reference:   existing.reference,
    description: `Withdrawal reversal: ${reason}`,
    relatedId:   id,
    relatedType: 'hl_withdrawal_request',
  });

  return getWithdrawalRequest(db, id, tenantId);
}
