/**
 * @webwaka/hl-wallet — Core ledger operations
 *
 * The hl_ledger table is append-only. NEVER UPDATE OR DELETE rows here.
 * Reversals are new rows with a negative amount_kobo and tx_type = 'reversal'.
 *
 * P9:  All amounts are integer kobo — no floats, no REAL.
 * T3:  tenant_id on every query — never omitted.
 * T4:  Atomic conditional UPDATE prevents double-spend. If rows_changed = 0,
 *      the operation is refused (insufficient balance, wrong tenant, frozen).
 * T7:  Wallet status (frozen/closed) is checked inside every debit.
 * Idempotency: reference UNIQUE on hl_ledger — safe to retry with same ref.
 */

import { WalletError } from './errors.js';
import { generateId } from './reference.js';
import type {
  HlWallet,
  HlLedgerEntry,
  CreditWalletInput,
  DebitWalletInput,
  GetLedgerInput,
} from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

type WalletRow = {
  id: string;
  user_id: string;
  tenant_id: string;
  workspace_id: string;
  balance_kobo: number;
  lifetime_funded_kobo: number;
  lifetime_spent_kobo: number;
  kyc_tier: number;
  status: string;
  currency_code: string;
  frozen_reason: string | null;
  closed_at: number | null;
  closed_reason: string | null;
  created_at: number;
  updated_at: number;
};

type LedgerRow = {
  id: string;
  wallet_id: string;
  user_id: string;
  tenant_id: string;
  entry_type: string;
  amount_kobo: number;
  balance_after: number;
  tx_type: string;
  reference: string;
  description: string;
  currency_code: string;
  related_id: string | null;
  related_type: string | null;
  created_at: number;
};

function mapWalletRow(row: WalletRow): HlWallet {
  return {
    id:                  row.id,
    userId:              row.user_id,
    tenantId:            row.tenant_id,
    workspaceId:         row.workspace_id,
    balanceKobo:         row.balance_kobo,
    lifetimeFundedKobo:  row.lifetime_funded_kobo,
    lifetimeSpentKobo:   row.lifetime_spent_kobo,
    kycTier:             row.kyc_tier as 1 | 2 | 3,
    status:              row.status as HlWallet['status'],
    currencyCode:        row.currency_code,
    frozenReason:        row.frozen_reason,
    closedAt:            row.closed_at,
    closedReason:        row.closed_reason,
    createdAt:           row.created_at,
    updatedAt:           row.updated_at,
  };
}

function mapLedgerRow(row: LedgerRow): HlLedgerEntry {
  return {
    id:           row.id,
    walletId:     row.wallet_id,
    userId:       row.user_id,
    tenantId:     row.tenant_id,
    entryType:    row.entry_type as HlLedgerEntry['entryType'],
    amountKobo:   row.amount_kobo,
    balanceAfter: row.balance_after,
    txType:       row.tx_type as HlLedgerEntry['txType'],
    reference:    row.reference,
    description:  row.description,
    currencyCode: row.currency_code,
    relatedId:    row.related_id,
    relatedType:  row.related_type,
    createdAt:    row.created_at,
  };
}

export async function getWallet(
  db: D1Like,
  walletId: string,
  tenantId: string,
): Promise<HlWallet> {
  const row = await db.prepare(
    'SELECT * FROM hl_wallets WHERE id = ? AND tenant_id = ?',
  ).bind(walletId, tenantId).first<WalletRow>();
  if (!row) throw new WalletError('WALLET_NOT_FOUND', { walletId, tenantId });
  return mapWalletRow(row);
}

export async function getWalletByUser(
  db: D1Like,
  userId: string,
  tenantId: string,
): Promise<HlWallet | null> {
  const row = await db.prepare(
    'SELECT * FROM hl_wallets WHERE user_id = ? AND tenant_id = ?',
  ).bind(userId, tenantId).first<WalletRow>();
  return row ? mapWalletRow(row) : null;
}

export async function createWallet(
  db: D1Like,
  input: { id: string; userId: string; tenantId: string; workspaceId: string; kycTier?: 1 | 2 | 3 },
): Promise<HlWallet> {
  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    INSERT INTO hl_wallets
      (id, user_id, tenant_id, workspace_id, balance_kobo, lifetime_funded_kobo, lifetime_spent_kobo,
       kyc_tier, status, currency_code, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, 0, 0, ?, 'active', 'NGN', ?, ?)
  `).bind(input.id, input.userId, input.tenantId, input.workspaceId, input.kycTier ?? 1, now, now).run();

  return getWallet(db, input.id, input.tenantId);
}

export async function creditWallet(
  db: D1Like,
  input: CreditWalletInput,
): Promise<HlLedgerEntry> {
  if (!Number.isInteger(input.amountKobo) || input.amountKobo <= 0) {
    throw new WalletError('INVALID_AMOUNT', { amountKobo: input.amountKobo });
  }

  const isTopUp = input.txType === 'bank_fund' || input.txType === 'mla_credit' || input.txType === 'refund';

  const updateResult = await db.prepare(`
    UPDATE hl_wallets
    SET balance_kobo         = balance_kobo + ?,
        lifetime_funded_kobo = lifetime_funded_kobo + ?,
        updated_at           = unixepoch()
    WHERE id = ? AND tenant_id = ? AND status != 'closed'
  `).bind(
    input.amountKobo,
    isTopUp ? input.amountKobo : 0,
    input.walletId,
    input.tenantId,
  ).run();

  if (!updateResult.meta?.changes || updateResult.meta.changes === 0) {
    const wallet = await db.prepare(
      'SELECT status FROM hl_wallets WHERE id = ? AND tenant_id = ?',
    ).bind(input.walletId, input.tenantId).first<{ status: string }>();
    if (!wallet) throw new WalletError('WALLET_NOT_FOUND', { walletId: input.walletId });
    if (wallet.status === 'closed') throw new WalletError('WALLET_CLOSED');
    throw new WalletError('WALLET_NOT_FOUND', { walletId: input.walletId, tenantId: input.tenantId });
  }

  const updated = await db.prepare(
    'SELECT balance_kobo FROM hl_wallets WHERE id = ? AND tenant_id = ?',
  ).bind(input.walletId, input.tenantId).first<{ balance_kobo: number }>();

  const entryId = generateId('hll');
  const now = Math.floor(Date.now() / 1000);

  await db.prepare(`
    INSERT INTO hl_ledger
      (id, wallet_id, user_id, tenant_id, entry_type, amount_kobo, balance_after,
       tx_type, reference, description, currency_code, related_id, related_type, created_at)
    VALUES (?, ?, ?, ?, 'credit', ?, ?, ?, ?, ?, 'NGN', ?, ?, ?)
  `).bind(
    entryId,
    input.walletId,
    '',
    input.tenantId,
    input.amountKobo,
    updated!.balance_kobo,
    input.txType,
    input.reference,
    input.description,
    input.relatedId ?? null,
    input.relatedType ?? null,
    now,
  ).run();

  return {
    id:           entryId,
    walletId:     input.walletId,
    userId:       '',
    tenantId:     input.tenantId,
    entryType:    'credit',
    amountKobo:   input.amountKobo,
    balanceAfter: updated!.balance_kobo,
    txType:       input.txType,
    reference:    input.reference,
    description:  input.description,
    currencyCode: 'NGN',
    relatedId:    input.relatedId ?? null,
    relatedType:  input.relatedType ?? null,
    createdAt:    now,
  };
}

export async function debitWallet(
  db: D1Like,
  input: DebitWalletInput,
): Promise<HlLedgerEntry> {
  if (!Number.isInteger(input.amountKobo) || input.amountKobo <= 0) {
    throw new WalletError('INVALID_AMOUNT', { amountKobo: input.amountKobo });
  }

  const updateResult = await db.prepare(`
    UPDATE hl_wallets
    SET balance_kobo        = balance_kobo - ?,
        lifetime_spent_kobo = lifetime_spent_kobo + ?,
        updated_at          = unixepoch()
    WHERE id = ?
      AND tenant_id = ?
      AND user_id   = ?
      AND balance_kobo >= ?
      AND status = 'active'
  `).bind(
    input.amountKobo,
    input.amountKobo,
    input.walletId,
    input.tenantId,
    input.userId,
    input.amountKobo,
  ).run();

  if (!updateResult.meta?.changes || updateResult.meta.changes === 0) {
    const wallet = await db.prepare(
      'SELECT balance_kobo, status FROM hl_wallets WHERE id = ? AND tenant_id = ?',
    ).bind(input.walletId, input.tenantId).first<{ balance_kobo: number; status: string }>();
    if (!wallet) throw new WalletError('WALLET_NOT_FOUND', { walletId: input.walletId });
    if (wallet.status === 'frozen') throw new WalletError('WALLET_FROZEN');
    if (wallet.status === 'closed') throw new WalletError('WALLET_CLOSED');
    throw new WalletError('INSUFFICIENT_BALANCE', {
      balanceKobo: wallet.balance_kobo,
      requiredKobo: input.amountKobo,
    });
  }

  const updated = await db.prepare(
    'SELECT balance_kobo FROM hl_wallets WHERE id = ? AND tenant_id = ?',
  ).bind(input.walletId, input.tenantId).first<{ balance_kobo: number }>();

  const entryId = generateId('hll');
  const now = Math.floor(Date.now() / 1000);

  await db.prepare(`
    INSERT INTO hl_ledger
      (id, wallet_id, user_id, tenant_id, entry_type, amount_kobo, balance_after,
       tx_type, reference, description, currency_code, related_id, related_type, created_at)
    VALUES (?, ?, ?, ?, 'debit', ?, ?, ?, ?, ?, 'NGN', ?, ?, ?)
  `).bind(
    entryId,
    input.walletId,
    input.userId,
    input.tenantId,
    -input.amountKobo,
    updated!.balance_kobo,
    input.txType,
    input.reference,
    input.description,
    input.relatedId ?? null,
    input.relatedType ?? null,
    now,
  ).run();

  return {
    id:           entryId,
    walletId:     input.walletId,
    userId:       input.userId,
    tenantId:     input.tenantId,
    entryType:    'debit',
    amountKobo:   -input.amountKobo,
    balanceAfter: updated!.balance_kobo,
    txType:       input.txType,
    reference:    input.reference,
    description:  input.description,
    currencyCode: 'NGN',
    relatedId:    input.relatedId ?? null,
    relatedType:  input.relatedType ?? null,
    createdAt:    now,
  };
}

export async function getLedger(
  db: D1Like,
  input: GetLedgerInput,
): Promise<{ entries: HlLedgerEntry[]; nextCursor: string | null }> {
  const limit = Math.min(input.limit ?? 50, 100);

  // Composite cursor: { t: created_at (unix), i: id } — prevents skips/duplicates
  // when multiple transactions share the same created_at second.
  let cursorCreatedAt: number | null = null;
  let cursorId: string | null = null;
  if (input.cursor) {
    try {
      const decoded = JSON.parse(
        Buffer.from(input.cursor, 'base64').toString(),
      ) as { t: number; i: string };
      cursorCreatedAt = typeof decoded.t === 'number' ? decoded.t : null;
      cursorId        = typeof decoded.i === 'string'  ? decoded.i : null;
    } catch { /* invalid cursor — start from beginning */ }
  }
  const hasCursor = cursorCreatedAt !== null && cursorId !== null;

  const rows = await db.prepare(`
    SELECT * FROM hl_ledger
    WHERE wallet_id = ? AND tenant_id = ?
      ${hasCursor ? 'AND (created_at < ? OR (created_at = ? AND id < ?))' : ''}
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `).bind(
    ...[
      input.walletId,
      input.tenantId,
      ...(hasCursor ? [cursorCreatedAt, cursorCreatedAt, cursorId] : []),
      limit + 1,
    ],
  ).all<LedgerRow>();

  const entries  = rows.results.slice(0, limit).map(mapLedgerRow);
  const hasMore  = rows.results.length > limit;
  const lastEntry = entries[entries.length - 1];
  const nextCursor = hasMore && lastEntry
    ? Buffer.from(JSON.stringify({ t: lastEntry.createdAt, i: lastEntry.id })).toString('base64')
    : null;

  return { entries, nextCursor };
}

export async function getBalance(
  db: D1Like,
  userId: string,
  tenantId: string,
): Promise<{ balanceKobo: number; wallet: HlWallet }> {
  const row = await db.prepare(
    'SELECT * FROM hl_wallets WHERE user_id = ? AND tenant_id = ?',
  ).bind(userId, tenantId).first<WalletRow>();
  if (!row) throw new WalletError('WALLET_NOT_FOUND', { userId, tenantId });
  const wallet = mapWalletRow(row);
  return { balanceKobo: wallet.balanceKobo, wallet };
}
