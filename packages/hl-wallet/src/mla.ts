/**
 * @webwaka/hl-wallet — Multi-Level Affiliate (MLA) earnings
 *
 * Phase 1: MLA earnings are tracked but NOT paid out.
 *          Every qualifying spend records an hl_mla_earnings row with status='pending'.
 *
 * Phase 2+: A daily CRON (apps/projections) checks wallet:flag:mla_payout_enabled
 *           and settles payable earnings to wallets via creditMlaEarning().
 *
 * Commission structure (configurable via KV):
 *   Level 1 (direct referral): wallet:mla:commission_bps:1 = 500  (5%)
 *   Level 2 (second tier):     wallet:mla:commission_bps:2 = 200  (2%)
 *   Level 3 (third tier):      wallet:mla:commission_bps:3 = 100  (1%)
 *
 * Minimum payout: wallet:mla:min_payout_kobo = 50000 (₦500)
 *
 * P9: commissionKobo = Math.floor(amountKobo * bps / 10000) — always integer.
 * T3: All queries tenant-scoped.
 */

import { WalletError } from './errors.js';
import { generateId, generateWalletRef } from './reference.js';
import { creditWallet } from './ledger.js';
import type { HlMlaEarning, MlaEarningStatus } from './types.js';

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

type MlaRow = {
  id: string;
  wallet_id: string;
  earner_user_id: string;
  tenant_id: string;
  source_vertical: string | null;
  source_order_id: string | null;
  source_spend_event_id: string | null;
  referral_level: number;
  commission_bps: number;
  commission_kobo: number;
  base_amount_kobo: number;
  status: string;
  period_start: string | null;
  period_end: string | null;
  ledger_entry_id: string | null;
  credited_at: number | null;
  voided_at: number | null;
  void_reason: string | null;
  created_at: number;
  updated_at: number;
};

function mapMlaRow(row: MlaRow): HlMlaEarning {
  return {
    id:                  row.id,
    walletId:            row.wallet_id,
    earnerUserId:        row.earner_user_id,
    tenantId:            row.tenant_id,
    sourceVertical:      row.source_vertical,
    sourceOrderId:       row.source_order_id,
    sourceSpendEventId:  row.source_spend_event_id,
    referralLevel:       row.referral_level as 1 | 2 | 3,
    commissionBps:       row.commission_bps,
    commissionKobo:      row.commission_kobo,
    baseAmountKobo:      row.base_amount_kobo,
    status:              row.status as MlaEarningStatus,
    periodStart:         row.period_start,
    periodEnd:           row.period_end,
    ledgerEntryId:       row.ledger_entry_id,
    creditedAt:          row.credited_at,
    voidedAt:            row.voided_at,
    voidReason:          row.void_reason,
    createdAt:           row.created_at,
    updatedAt:           row.updated_at,
  };
}

export async function getCommissionBps(kv: KVLike, level: 1 | 2 | 3): Promise<number> {
  const defaults: Record<1 | 2 | 3, number> = { 1: 500, 2: 200, 3: 100 };
  const raw = await kv.get(`wallet:mla:commission_bps:${level}`);
  if (!raw) return defaults[level];
  const n = parseInt(raw, 10);
  return isNaN(n) || n < 0 || n > 10000 ? defaults[level] : n;
}

export async function getMinPayoutKobo(kv: KVLike): Promise<number> {
  const raw = await kv.get('wallet:mla:min_payout_kobo');
  return raw ? parseInt(raw, 10) : 50_000;
}

export function computeCommission(baseAmountKobo: number, bps: number): number {
  return Math.floor((baseAmountKobo * bps) / 10000);
}

export interface RecordMlaEarningInput {
  walletId:           string;
  earnerUserId:       string;
  tenantId:           string;
  referralLevel:      1 | 2 | 3;
  baseAmountKobo:     number;
  sourceVertical?:    string;
  sourceOrderId?:     string;
  sourceSpendEventId?: string;
}

export async function recordMlaEarning(
  db: D1Like,
  kv: KVLike,
  input: RecordMlaEarningInput,
): Promise<HlMlaEarning> {
  const bps            = await getCommissionBps(kv, input.referralLevel);
  const commissionKobo = computeCommission(input.baseAmountKobo, bps);

  if (commissionKobo <= 0) {
    throw new WalletError('INVALID_AMOUNT', { reason: 'Commission computed to zero or negative', bps, baseAmountKobo: input.baseAmountKobo });
  }

  const id  = generateId('hlmla');
  const now = Math.floor(Date.now() / 1000);

  await db.prepare(`
    INSERT INTO hl_mla_earnings
      (id, wallet_id, earner_user_id, tenant_id, source_vertical, source_order_id,
       source_spend_event_id, referral_level, commission_bps, commission_kobo,
       base_amount_kobo, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).bind(
    id,
    input.walletId,
    input.earnerUserId,
    input.tenantId,
    input.sourceVertical ?? null,
    input.sourceOrderId ?? null,
    input.sourceSpendEventId ?? null,
    input.referralLevel,
    bps,
    commissionKobo,
    input.baseAmountKobo,
    now,
    now,
  ).run();

  const row = await db.prepare(
    'SELECT * FROM hl_mla_earnings WHERE id = ? AND tenant_id = ?',
  ).bind(id, input.tenantId).first<MlaRow>();

  return mapMlaRow(row!);
}

export async function getPendingEarnings(
  db: D1Like,
  walletId: string,
  tenantId: string,
  limit = 50,
): Promise<HlMlaEarning[]> {
  const rows = await db.prepare(`
    SELECT * FROM hl_mla_earnings
    WHERE wallet_id = ? AND tenant_id = ? AND status = 'pending'
    ORDER BY created_at DESC LIMIT ?
  `).bind(walletId, tenantId, limit).all<MlaRow>();
  return rows.results.map(mapMlaRow);
}

export async function listMlaEarnings(
  db: D1Like,
  walletId: string,
  tenantId: string,
  status?: MlaEarningStatus,
  limit = 50,
): Promise<HlMlaEarning[]> {
  const rows = status
    ? await db.prepare(
        'SELECT * FROM hl_mla_earnings WHERE wallet_id = ? AND tenant_id = ? AND status = ? ORDER BY created_at DESC LIMIT ?',
      ).bind(walletId, tenantId, status, limit).all<MlaRow>()
    : await db.prepare(
        'SELECT * FROM hl_mla_earnings WHERE wallet_id = ? AND tenant_id = ? ORDER BY created_at DESC LIMIT ?',
      ).bind(walletId, tenantId, limit).all<MlaRow>();
  return rows.results.map(mapMlaRow);
}

// WF-044: cursor-based paginated variant.
// Cursor is the `id` of the last item seen. Pagination direction: newest-first.
export interface ListMlaEarningsPaginatedResult {
  earnings:   HlMlaEarning[];
  nextCursor: string | undefined;
}

export async function listMlaEarningsPaginated(
  db: D1Like,
  walletId: string,
  tenantId: string,
  opts: {
    status?:  MlaEarningStatus;
    cursor?:  string;            // id of the last seen row
    limit?:   number;            // default 50, max 100
  } = {},
): Promise<ListMlaEarningsPaginatedResult> {
  const pageSize = Math.min(opts.limit ?? 50, 100);
  const fetchSize = pageSize + 1;     // fetch one extra to detect next page

  let rows: { results: MlaRow[] };

  if (opts.cursor && opts.status) {
    rows = await db.prepare(`
      SELECT * FROM hl_mla_earnings
      WHERE wallet_id = ? AND tenant_id = ? AND status = ?
        AND id < ?
      ORDER BY id DESC LIMIT ?
    `).bind(walletId, tenantId, opts.status, opts.cursor, fetchSize).all<MlaRow>();
  } else if (opts.cursor) {
    rows = await db.prepare(`
      SELECT * FROM hl_mla_earnings
      WHERE wallet_id = ? AND tenant_id = ?
        AND id < ?
      ORDER BY id DESC LIMIT ?
    `).bind(walletId, tenantId, opts.cursor, fetchSize).all<MlaRow>();
  } else if (opts.status) {
    rows = await db.prepare(`
      SELECT * FROM hl_mla_earnings
      WHERE wallet_id = ? AND tenant_id = ? AND status = ?
      ORDER BY id DESC LIMIT ?
    `).bind(walletId, tenantId, opts.status, fetchSize).all<MlaRow>();
  } else {
    rows = await db.prepare(`
      SELECT * FROM hl_mla_earnings
      WHERE wallet_id = ? AND tenant_id = ?
      ORDER BY id DESC LIMIT ?
    `).bind(walletId, tenantId, fetchSize).all<MlaRow>();
  }

  const hasMore  = rows.results.length > pageSize;
  const items    = hasMore ? rows.results.slice(0, pageSize) : rows.results;
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

  return { earnings: items.map(mapMlaRow), nextCursor };
}

// WF-042: promote pending earnings to payable after the settlement window has elapsed.
// Uses a subquery to work around SQLite's lack of UPDATE...LIMIT.
// P9: all amounts integer kobo; T3: tenant_id always included.
export interface MarkPayableOptions {
  tenantId?:            string;    // undefined = all tenants (used by system CRON)
  settlementWindowSecs?: number;   // default 86400 (24h)
  batchSize?:           number;    // default 100
}

export async function markEarningsPayable(
  db: D1Like,
  opts: MarkPayableOptions = {},
): Promise<number> {
  const windowSecs = opts.settlementWindowSecs ?? 86400;
  const batchSize  = opts.batchSize ?? 100;
  const cutoff     = Math.floor(Date.now() / 1000) - windowSecs;
  const now        = Math.floor(Date.now() / 1000);

  // SQLite does not support UPDATE...LIMIT in all builds — use subquery form.
  const result = opts.tenantId
    ? await db.prepare(`
        UPDATE hl_mla_earnings SET status = 'payable', updated_at = ?
        WHERE id IN (
          SELECT id FROM hl_mla_earnings
          WHERE status = 'pending' AND tenant_id = ? AND created_at <= ?
          LIMIT ?
        )
      `).bind(now, opts.tenantId, cutoff, batchSize).run()
    : await db.prepare(`
        UPDATE hl_mla_earnings SET status = 'payable', updated_at = ?
        WHERE id IN (
          SELECT id FROM hl_mla_earnings
          WHERE status = 'pending' AND created_at <= ?
          LIMIT ?
        )
      `).bind(now, cutoff, batchSize).run();

  return result.meta?.changes ?? 0;
}

export async function creditMlaEarning(
  db: D1Like,
  earningId: string,
  tenantId: string,
): Promise<HlMlaEarning> {
  const row = await db.prepare(
    'SELECT * FROM hl_mla_earnings WHERE id = ? AND tenant_id = ?',
  ).bind(earningId, tenantId).first<MlaRow>();

  if (!row) throw new WalletError('MLA_EARNING_NOT_FOUND', { earningId });

  // WF-042: idempotency guard — if already credited return the existing row unchanged.
  if (row.status === 'credited') return mapMlaRow(row);

  if (row.status !== 'payable') {
    throw new WalletError('INVALID_FSM_TRANSITION', { from: row.status, to: 'credited', reason: 'must be payable first' });
  }

  const reference = generateWalletRef('MLA');
  const entry = await creditWallet(db, {
    walletId:    row.wallet_id,
    tenantId,
    amountKobo:  row.commission_kobo,
    txType:      'mla_credit',
    reference,
    description: `MLA L${row.referral_level} commission credit`,
    relatedId:   row.id,
    relatedType: 'hl_mla_earning',
  });

  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    UPDATE hl_mla_earnings
    SET status = 'credited', ledger_entry_id = ?, credited_at = ?, updated_at = ?
    WHERE id = ? AND tenant_id = ?
  `).bind(entry.id, now, now, earningId, tenantId).run();

  const updated = await db.prepare(
    'SELECT * FROM hl_mla_earnings WHERE id = ? AND tenant_id = ?',
  ).bind(earningId, tenantId).first<MlaRow>();

  return mapMlaRow(updated!);
}

export async function voidMlaEarning(
  db: D1Like,
  earningId: string,
  tenantId: string,
  reason: string,
): Promise<HlMlaEarning> {
  const row = await db.prepare(
    'SELECT * FROM hl_mla_earnings WHERE id = ? AND tenant_id = ?',
  ).bind(earningId, tenantId).first<MlaRow>();

  if (!row) throw new WalletError('MLA_EARNING_NOT_FOUND', { earningId });
  if (row.status === 'credited') {
    throw new WalletError('INVALID_FSM_TRANSITION', { from: row.status, to: 'voided', reason: 'cannot void credited earning' });
  }

  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    UPDATE hl_mla_earnings
    SET status = 'voided', voided_at = ?, void_reason = ?, updated_at = ?
    WHERE id = ? AND tenant_id = ?
  `).bind(now, reason, now, earningId, tenantId).run();

  const updated = await db.prepare(
    'SELECT * FROM hl_mla_earnings WHERE id = ? AND tenant_id = ?',
  ).bind(earningId, tenantId).first<MlaRow>();

  return mapMlaRow(updated!);
}
