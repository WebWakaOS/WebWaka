/**
 * @webwaka/hl-wallet — Spend reservation and completion
 *
 * Two-phase spend pattern (optional):
 *   1. reserveSpend() — debits wallet, creates spend event with status='reserved'
 *   2. completeSpend() — marks spend event status='completed' after order fulfillment
 *   OR
 *   reverseSpend() — reverses the debit if order fails/is cancelled
 *
 * Direct spend (single-phase) is also supported — call reserveSpend() with
 * immediateComplete=true to complete in a single operation.
 *
 * P9: All amounts integer kobo. T3: All queries tenant-scoped.
 */

import { WalletError } from './errors.js';
import { generateId, generateWalletRef } from './reference.js';
import { debitWallet, creditWallet } from './ledger.js';
import type { HlSpendEvent, SpendEventStatus } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

type SpendRow = {
  id: string;
  wallet_id: string;
  user_id: string;
  tenant_id: string;
  vertical_slug: string | null;
  order_id: string | null;
  order_type: string | null;
  amount_kobo: number;
  status: string;
  ledger_debit_id: string | null;
  ledger_refund_id: string | null;
  transactions_id: string | null;
  completed_at: number | null;
  reversed_at: number | null;
  reversal_reason: string | null;
  created_at: number;
  updated_at: number;
};

function mapSpendRow(row: SpendRow): HlSpendEvent {
  return {
    id:              row.id,
    walletId:        row.wallet_id,
    userId:          row.user_id,
    tenantId:        row.tenant_id,
    verticalSlug:    row.vertical_slug,
    orderId:         row.order_id,
    orderType:       row.order_type,
    amountKobo:      row.amount_kobo,
    status:          row.status as SpendEventStatus,
    ledgerDebitId:   row.ledger_debit_id,
    ledgerRefundId:  row.ledger_refund_id,
    transactionsId:  row.transactions_id,
    completedAt:     row.completed_at,
    reversedAt:      row.reversed_at,
    reversalReason:  row.reversal_reason,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

export interface ReserveSpendInput {
  walletId:         string;
  userId:           string;
  tenantId:         string;
  amountKobo:       number;
  verticalSlug?:    string;
  orderId?:         string;
  orderType?:       string;
  immediateComplete?: boolean;
}

export async function reserveSpend(
  db: D1Like,
  input: ReserveSpendInput,
): Promise<HlSpendEvent> {
  const spendEventId = generateId('hlse');
  const reference    = generateWalletRef('SPD');
  const now          = Math.floor(Date.now() / 1000);

  const ledgerEntry = await debitWallet(db, {
    walletId:    input.walletId,
    userId:      input.userId,
    tenantId:    input.tenantId,
    amountKobo:  input.amountKobo,
    txType:      'spend',
    reference,
    description: `Wallet spend${input.orderType ? ` — ${input.orderType}` : ''}${input.orderId ? ` #${input.orderId}` : ''}`,
    relatedId:   spendEventId,
    relatedType: 'hl_spend_event',
  });

  const status = input.immediateComplete ? 'completed' : 'reserved';
  const completedAt = input.immediateComplete ? now : null;

  await db.prepare(`
    INSERT INTO hl_spend_events
      (id, wallet_id, user_id, tenant_id, vertical_slug, order_id, order_type,
       amount_kobo, status, ledger_debit_id, completed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    spendEventId,
    input.walletId,
    input.userId,
    input.tenantId,
    input.verticalSlug ?? null,
    input.orderId ?? null,
    input.orderType ?? null,
    input.amountKobo,
    status,
    ledgerEntry.id,
    completedAt,
    now,
    now,
  ).run();

  const row = await db.prepare(
    'SELECT * FROM hl_spend_events WHERE id = ? AND tenant_id = ?',
  ).bind(spendEventId, input.tenantId).first<SpendRow>();

  return mapSpendRow(row!);
}

export async function completeSpend(
  db: D1Like,
  spendEventId: string,
  tenantId: string,
): Promise<HlSpendEvent> {
  const row = await db.prepare(
    'SELECT * FROM hl_spend_events WHERE id = ? AND tenant_id = ?',
  ).bind(spendEventId, tenantId).first<SpendRow>();

  if (!row) throw new WalletError('SPEND_EVENT_NOT_FOUND', { spendEventId });
  if (row.status !== 'reserved') {
    throw new WalletError('INVALID_FSM_TRANSITION', { from: row.status, to: 'completed' });
  }

  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    UPDATE hl_spend_events
    SET status = 'completed', completed_at = ?, updated_at = ?
    WHERE id = ? AND tenant_id = ?
  `).bind(now, now, spendEventId, tenantId).run();

  const updated = await db.prepare(
    'SELECT * FROM hl_spend_events WHERE id = ? AND tenant_id = ?',
  ).bind(spendEventId, tenantId).first<SpendRow>();

  return mapSpendRow(updated!);
}

export async function reverseSpend(
  db: D1Like,
  spendEventId: string,
  tenantId: string,
  reason: string,
): Promise<HlSpendEvent> {
  const row = await db.prepare(
    'SELECT * FROM hl_spend_events WHERE id = ? AND tenant_id = ?',
  ).bind(spendEventId, tenantId).first<SpendRow>();

  if (!row) throw new WalletError('SPEND_EVENT_NOT_FOUND', { spendEventId });
  if (row.status === 'reversed') {
    throw new WalletError('INVALID_FSM_TRANSITION', { from: row.status, to: 'reversed', reason: 'already reversed' });
  }

  const reference = generateWalletRef('REV');
  const refundEntry = await creditWallet(db, {
    walletId:    row.wallet_id,
    tenantId,
    amountKobo:  row.amount_kobo,
    txType:      'reversal',
    reference,
    description: `Reversal of spend ${spendEventId}: ${reason}`,
    relatedId:   spendEventId,
    relatedType: 'hl_spend_event',
  });

  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    UPDATE hl_spend_events
    SET status = 'reversed', ledger_refund_id = ?, reversed_at = ?, reversal_reason = ?, updated_at = ?
    WHERE id = ? AND tenant_id = ?
  `).bind(refundEntry.id, now, reason, now, spendEventId, tenantId).run();

  const updated = await db.prepare(
    'SELECT * FROM hl_spend_events WHERE id = ? AND tenant_id = ?',
  ).bind(spendEventId, tenantId).first<SpendRow>();

  return mapSpendRow(updated!);
}
