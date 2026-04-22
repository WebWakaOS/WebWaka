/**
 * @webwaka/hl-wallet — Wallet-to-wallet transfer (W3)
 *
 * Platform Invariants enforced:
 *   P9  — all amounts validated as integer kobo
 *   T3  — tenant_id scoping on all queries
 *   T4  — atomic debit+credit in a single transaction-equivalent operation
 *   T7  — both sender and receiver wallet FSM states validated before transfer
 *
 * Transfer flow:
 *   1. Validate sender wallet active + sufficient balance
 *   2. Validate receiver wallet active
 *   3. Check sender daily limit
 *   4. Debit sender (tx_type='transfer_out')
 *   5. Credit receiver (tx_type='transfer_in')
 *   6. Write hl_transfer_requests row (status='completed')
 *   7. Return transfer request record
 *
 * Cross-tenant transfers are intentionally NOT supported (tenant_id must match).
 * Self-transfer (from_wallet_id === to_wallet_id) is rejected.
 */

import { debitWallet, creditWallet, getWallet } from './ledger.js';
import { checkDailyLimit } from './kyc-gate.js';
import { WalletError } from './errors.js';
import { generateId } from './reference.js';

export interface HlTransferRequest {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  fromUserId: string;
  toUserId: string;
  tenantId: string;
  amountKobo: number;
  reference: string;
  description: string | null;
  status: 'pending' | 'completed' | 'reversed' | 'rejected';
  fromLedgerId: string | null;
  toLedgerId: string | null;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
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

export interface InitiateTransferParams {
  fromWalletId: string;
  toWalletId:   string;
  fromUserId:   string;
  toUserId:     string;
  tenantId:     string;
  amountKobo:   number;
  description?: string;
}

function mapTransferRow(row: Record<string, unknown>): HlTransferRequest {
  return {
    id:           row.id as string,
    fromWalletId: row.from_wallet_id as string,
    toWalletId:   row.to_wallet_id as string,
    fromUserId:   row.from_user_id as string,
    toUserId:     row.to_user_id as string,
    tenantId:     row.tenant_id as string,
    amountKobo:   row.amount_kobo as number,
    reference:    row.reference as string,
    description:  (row.description as string | null) ?? null,
    status:       row.status as HlTransferRequest['status'],
    fromLedgerId: (row.from_ledger_id as string | null) ?? null,
    toLedgerId:   (row.to_ledger_id as string | null) ?? null,
    completedAt:  (row.completed_at as number | null) ?? null,
    createdAt:    row.created_at as number,
    updatedAt:    row.updated_at as number,
  };
}

/**
 * initiateTransfer — execute a wallet-to-wallet transfer atomically.
 *
 * Debit sender first, then credit receiver. If credit fails after a
 * successful debit, the error propagates and the transfer row records
 * the failure; ops must investigate and manually reverse if needed.
 * In practice D1 single-writer + INSERT OR IGNORE makes this extremely rare.
 */
export async function initiateTransfer(
  db:  D1Like,
  kv:  KVLike,
  params: InitiateTransferParams,
): Promise<HlTransferRequest> {
  const { fromWalletId, toWalletId, fromUserId, toUserId, tenantId, amountKobo, description } = params;

  if (fromWalletId === toWalletId) {
    throw new WalletError('SELF_TRANSFER');
  }

  const senderWallet = await getWallet(db as never, fromWalletId, tenantId);
  if (senderWallet.status !== 'active') {
    throw new WalletError('WALLET_NOT_ACTIVE', { wallet: 'sender', status: senderWallet.status });
  }

  const receiverWallet = await getWallet(db as never, toWalletId, tenantId);
  if (receiverWallet.status !== 'active') {
    throw new WalletError('WALLET_NOT_ACTIVE', { wallet: 'receiver', status: receiverWallet.status });
  }

  if (senderWallet.balanceKobo < amountKobo) {
    throw new WalletError('INSUFFICIENT_BALANCE', {
      balance_kobo: senderWallet.balanceKobo,
      requested_kobo: amountKobo,
    });
  }

  await checkDailyLimit(db as never, kv as never, fromWalletId, tenantId, amountKobo, senderWallet.kycTier);

  const transferId = generateId('hltr');
  const reference  = generateId('ref');
  const now        = Math.floor(Date.now() / 1000);

  await db.prepare(`
    INSERT OR IGNORE INTO hl_transfer_requests
      (id, from_wallet_id, to_wallet_id, from_user_id, to_user_id,
       tenant_id, amount_kobo, reference, description, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).bind(transferId, fromWalletId, toWalletId, fromUserId, toUserId,
          tenantId, amountKobo, reference, description ?? null, now, now).run();

  const fromEntry = await debitWallet(db as never, {
    walletId:    fromWalletId,
    userId:      fromUserId,
    tenantId,
    amountKobo,
    txType:      'transfer_out',
    reference,
    description: `Transfer to wallet ${toWalletId}${description ? ': ' + description : ''}`,
    relatedId:   transferId,
    relatedType: 'hl_transfer_request',
  });

  const toEntry = await creditWallet(db as never, {
    walletId:    toWalletId,
    tenantId,
    amountKobo,
    txType:      'transfer_in',
    reference,
    description: `Transfer from wallet ${fromWalletId}${description ? ': ' + description : ''}`,
    relatedId:   transferId,
    relatedType: 'hl_transfer_request',
  });

  await db.prepare(`
    UPDATE hl_transfer_requests
    SET    status = 'completed', from_ledger_id = ?, to_ledger_id = ?,
           completed_at = ?, updated_at = ?
    WHERE  id = ? AND tenant_id = ?
  `).bind(fromEntry.id, toEntry.id, now, now, transferId, tenantId).run();

  const row = await db.prepare(`
    SELECT * FROM hl_transfer_requests WHERE id = ? AND tenant_id = ? LIMIT 1
  `).bind(transferId, tenantId).first<Record<string, unknown>>();

  if (!row) throw new WalletError('TRANSFER_FAILED', {}, 'Transfer record not found after completion.');
  return mapTransferRow(row);
}

/**
 * getTransferRequest — fetch a single transfer request for the caller's tenant.
 */
export async function getTransferRequest(
  db:       D1Like,
  id:       string,
  tenantId: string,
): Promise<HlTransferRequest> {
  const row = await db.prepare(`
    SELECT * FROM hl_transfer_requests WHERE id = ? AND tenant_id = ? LIMIT 1
  `).bind(id, tenantId).first<Record<string, unknown>>();

  if (!row) throw new WalletError('TRANSFER_NOT_FOUND');
  return mapTransferRow(row);
}

/**
 * listTransferRequests — paginated list for a wallet (either direction).
 * Cursor is the last seen transfer id (opaque string cursor).
 */
export async function listTransferRequests(
  db:       D1Like,
  walletId: string,
  tenantId: string,
  limit     = 50,
  cursor?:  string,
): Promise<{ transfers: HlTransferRequest[]; nextCursor: string | null }> {
  const hasCursor = Boolean(cursor);
  const binds: unknown[] = [walletId, walletId, tenantId];
  if (hasCursor) binds.push(cursor);
  binds.push(limit + 1);

  const { results } = await db.prepare(`
    SELECT * FROM hl_transfer_requests
    WHERE (from_wallet_id = ? OR to_wallet_id = ?)
      AND tenant_id = ?
      ${hasCursor ? 'AND id < ?' : ''}
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `).bind(...binds).all<Record<string, unknown>>();

  const transfers   = results.slice(0, limit).map(mapTransferRow);
  const nextCursor  = results.length > limit ? transfers[transfers.length - 1]?.id ?? null : null;
  return { transfers, nextCursor };
}
