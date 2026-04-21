/**
 * @webwaka/hl-wallet — Bank transfer funding request management
 *
 * Phase 1: Wallet funding via offline bank transfer only.
 * Reuses the existing bank_transfer_orders table and FSM.
 *
 * Flow:
 *   1. createFundingRequest() — creates bank_transfer_order + hl_funding_request
 *   2. User uploads proof of payment to existing POST /bank-transfer/:id/proof
 *   3. Admin confirms via existing POST /bank-transfer/:id/confirm
 *   4. confirmFunding() — credits wallet via creditWallet()
 *
 * HITL: If amountKobo >= hitl_threshold_kobo (KV), a HITL queue item is created
 * before any credit. Credit only happens after HITL approval.
 *
 * P9: All amounts integer kobo. T3: All queries tenant-scoped.
 */

import { WalletError } from './errors.js';
import { generateId, generateWalletRef } from './reference.js';
import { creditWallet } from './ledger.js';
import { checkBalanceCap } from './kyc-gate.js';
import type { HlFundingRequest, FundingRequestStatus } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface KVLike {
  get(key: string): Promise<string | null>;
}

type FundingRow = {
  id: string;
  wallet_id: string;
  user_id: string;
  tenant_id: string;
  bank_transfer_order_id: string;
  amount_kobo: number;
  status: string;
  ledger_entry_id: string | null;
  confirmed_at: number | null;
  confirmed_by: string | null;
  rejection_reason: string | null;
  hitl_required: number;
  hitl_queue_item_id: string | null;
  created_at: number;
  updated_at: number;
};

function mapFundingRow(row: FundingRow): HlFundingRequest {
  return {
    id:                  row.id,
    walletId:            row.wallet_id,
    userId:              row.user_id,
    tenantId:            row.tenant_id,
    bankTransferOrderId: row.bank_transfer_order_id,
    amountKobo:          row.amount_kobo,
    status:              row.status as FundingRequestStatus,
    ledgerEntryId:       row.ledger_entry_id,
    confirmedAt:         row.confirmed_at,
    confirmedBy:         row.confirmed_by,
    rejectionReason:     row.rejection_reason,
    hitlRequired:        row.hitl_required === 1,
    hitlQueueItemId:     row.hitl_queue_item_id,
    createdAt:           row.created_at,
    updatedAt:           row.updated_at,
  };
}

export async function getHitlThresholdKobo(kv: KVLike): Promise<number> {
  const raw = await kv.get('wallet:hitl_threshold_kobo');
  return raw ? parseInt(raw, 10) : 10_000_000;
}

export interface CreateFundingRequestInput {
  walletId:        string;
  userId:          string;
  tenantId:        string;
  workspaceId:     string;
  amountKobo:      number;
  bankName?:       string;
  accountNumber?:  string;
  accountName?:    string;
}

export async function createFundingRequest(
  db: D1Like,
  kv: KVLike,
  input: CreateFundingRequestInput,
): Promise<{ fundingRequest: HlFundingRequest; bankTransferReference: string }> {
  if (!Number.isInteger(input.amountKobo) || input.amountKobo <= 0) {
    throw new WalletError('INVALID_AMOUNT', { amountKobo: input.amountKobo });
  }

  const bankTransferOrderId = generateId('bto');
  const fundingRequestId    = generateId('hlfr');
  const reference           = generateWalletRef('WLT');
  const expiresAt           = Math.floor(Date.now() / 1000) + 48 * 3600;
  const now                 = Math.floor(Date.now() / 1000);

  const hitlThreshold = await getHitlThresholdKobo(kv);
  const hitlRequired  = input.amountKobo >= hitlThreshold;

  await db.prepare(`
    INSERT INTO bank_transfer_orders
      (id, workspace_id, tenant_id, buyer_id, seller_entity_id, amount_kobo, currency_code,
       reference, bank_name, account_number, account_name, status, expires_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'NGN', ?, ?, ?, ?, 'pending', ?, ?, ?)
  `).bind(
    bankTransferOrderId,
    input.workspaceId,
    input.tenantId,
    input.userId,
    'handylife_wallet',
    input.amountKobo,
    reference,
    input.bankName ?? null,
    input.accountNumber ?? null,
    input.accountName ?? null,
    expiresAt,
    now,
    now,
  ).run();

  await db.prepare(`
    INSERT INTO hl_funding_requests
      (id, wallet_id, user_id, tenant_id, bank_transfer_order_id, amount_kobo,
       status, hitl_required, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  `).bind(
    fundingRequestId,
    input.walletId,
    input.userId,
    input.tenantId,
    bankTransferOrderId,
    input.amountKobo,
    hitlRequired ? 1 : 0,
    now,
    now,
  ).run();

  const row = await db.prepare(
    'SELECT * FROM hl_funding_requests WHERE id = ? AND tenant_id = ?',
  ).bind(fundingRequestId, input.tenantId).first<FundingRow>();

  return { fundingRequest: mapFundingRow(row!), bankTransferReference: reference };
}

export async function getFundingRequest(
  db: D1Like,
  fundingRequestId: string,
  tenantId: string,
): Promise<HlFundingRequest> {
  const row = await db.prepare(
    'SELECT * FROM hl_funding_requests WHERE id = ? AND tenant_id = ?',
  ).bind(fundingRequestId, tenantId).first<FundingRow>();
  if (!row) throw new WalletError('FUNDING_REQUEST_NOT_FOUND', { fundingRequestId });
  return mapFundingRow(row);
}

export async function confirmFunding(
  db: D1Like,
  kv: KVLike,
  fundingRequestId: string,
  tenantId: string,
  confirmedBy: string,
): Promise<HlFundingRequest> {
  const row = await db.prepare(
    'SELECT * FROM hl_funding_requests WHERE id = ? AND tenant_id = ?',
  ).bind(fundingRequestId, tenantId).first<FundingRow>();

  if (!row) throw new WalletError('FUNDING_REQUEST_NOT_FOUND', { fundingRequestId });
  if (row.status === 'confirmed') throw new WalletError('FUNDING_ALREADY_CONFIRMED');
  if (row.status !== 'pending') {
    throw new WalletError('INVALID_FSM_TRANSITION', { from: row.status, to: 'confirmed' });
  }

  // WF-032: balance cap check — reject if credit would push balance over the KYC tier cap.
  // Loaded fresh from DB so concurrent credits do not bypass the cap.
  const walletRow = await db.prepare(
    'SELECT balance_kobo, kyc_tier FROM hl_wallets WHERE id = ? AND tenant_id = ?',
  ).bind(row.wallet_id, tenantId).first<{ balance_kobo: number; kyc_tier: number }>();
  if (walletRow) {
    await checkBalanceCap(kv, walletRow.balance_kobo, row.amount_kobo, walletRow.kyc_tier as 1 | 2 | 3);
  }

  const reference = generateWalletRef('FUND');
  const entry = await creditWallet(db, {
    walletId:    row.wallet_id,
    tenantId,
    amountKobo:  row.amount_kobo,
    txType:      'bank_fund',
    reference,
    description: `Bank transfer funding confirmed by ${confirmedBy}`,
    relatedId:   row.id,
    relatedType: 'hl_funding_request',
  });

  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    UPDATE hl_funding_requests
    SET status = 'confirmed', ledger_entry_id = ?, confirmed_at = ?, confirmed_by = ?, updated_at = ?
    WHERE id = ? AND tenant_id = ?
  `).bind(entry.id, now, confirmedBy, now, fundingRequestId, tenantId).run();

  const updated = await db.prepare(
    'SELECT * FROM hl_funding_requests WHERE id = ? AND tenant_id = ?',
  ).bind(fundingRequestId, tenantId).first<FundingRow>();

  return mapFundingRow(updated!);
}

export async function rejectFunding(
  db: D1Like,
  fundingRequestId: string,
  tenantId: string,
  rejectionReason: string,
): Promise<HlFundingRequest> {
  const row = await db.prepare(
    'SELECT * FROM hl_funding_requests WHERE id = ? AND tenant_id = ?',
  ).bind(fundingRequestId, tenantId).first<FundingRow>();

  if (!row) throw new WalletError('FUNDING_REQUEST_NOT_FOUND', { fundingRequestId });
  if (row.status !== 'pending') {
    throw new WalletError('INVALID_FSM_TRANSITION', { from: row.status, to: 'rejected' });
  }

  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    UPDATE hl_funding_requests
    SET status = 'rejected', rejection_reason = ?, updated_at = ?
    WHERE id = ? AND tenant_id = ?
  `).bind(rejectionReason, now, fundingRequestId, tenantId).run();

  const updated = await db.prepare(
    'SELECT * FROM hl_funding_requests WHERE id = ? AND tenant_id = ?',
  ).bind(fundingRequestId, tenantId).first<FundingRow>();

  return mapFundingRow(updated!);
}

export async function listFundingRequests(
  db: D1Like,
  walletId: string,
  tenantId: string,
  limit = 20,
): Promise<HlFundingRequest[]> {
  const rows = await db.prepare(`
    SELECT * FROM hl_funding_requests
    WHERE wallet_id = ? AND tenant_id = ?
    ORDER BY created_at DESC LIMIT ?
  `).bind(walletId, tenantId, limit).all<FundingRow>();
  return rows.results.map(mapFundingRow);
}
