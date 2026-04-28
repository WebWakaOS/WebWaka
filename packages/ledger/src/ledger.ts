/**
 * @webwaka/ledger — Atomic double-entry ledger implementation (Phase 1)
 *
 * Core logic extracted from @webwaka/pos (float-ledger.ts) and
 * @webwaka/hl-wallet (ledger.ts). All monetary values are integer kobo (P9).
 *
 * The ledger table must have at minimum these columns:
 *   id TEXT PRIMARY KEY
 *   wallet_id TEXT NOT NULL
 *   tenant_id TEXT NOT NULL
 *   entry_type TEXT NOT NULL
 *   amount_kobo INTEGER NOT NULL
 *   running_balance_kobo INTEGER NOT NULL
 *   reference TEXT UNIQUE NOT NULL
 *   description TEXT
 *   created_at INTEGER NOT NULL
 *
 * T4: Idempotency via UNIQUE(reference). Safe to retry with same ref.
 */

import { assertIntegerKobo } from './types.js';
import type { D1Like, LedgerPostInput, LedgerPostResult, LedgerEntry } from './types.js';

/**
 * Post a ledger entry to the specified table.
 *
 * Uses INSERT OR IGNORE for idempotency — if reference already exists,
 * silently returns the existing entry's balance.
 *
 * P9: Validates amountKobo is a non-zero integer before writing.
 */
export async function postLedgerEntry(
  db: D1Like,
  input: LedgerPostInput,
): Promise<LedgerPostResult> {
  assertIntegerKobo(input.amountKobo, 'input.amountKobo');

  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  // Get current running balance for this wallet (T3: tenant_id included)
  const balanceRow = await db
    .prepare(`
      SELECT COALESCE(running_balance_kobo, 0) as bal
      FROM ${input.tableName}
      WHERE wallet_id = ? AND tenant_id = ?
      ORDER BY created_at DESC, rowid DESC
      LIMIT 1
    `)
    .bind(input.walletId, input.tenantId)
    .first<{ bal: number }>();

  const priorBalance = balanceRow?.bal ?? 0;
  const newBalance = priorBalance + input.amountKobo;

  // Insert with IGNORE for idempotency
  await db
    .prepare(`
      INSERT OR IGNORE INTO ${input.tableName}
        (id, wallet_id, tenant_id, entry_type, amount_kobo, running_balance_kobo,
         reference, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id, input.walletId, input.tenantId,
      input.entryType, input.amountKobo, newBalance,
      input.reference, input.description ?? null, now,
    )
    .run();

  // Read back actual running balance (handles idempotent re-runs)
  const row = await db
    .prepare(`SELECT running_balance_kobo FROM ${input.tableName} WHERE reference = ? AND tenant_id = ?`)
    .bind(input.reference, input.tenantId)
    .first<{ running_balance_kobo: number }>();

  return { id, runningBalanceKobo: row?.running_balance_kobo ?? newBalance };
}

/**
 * Get the current balance for a wallet.
 * Returns 0 if no ledger entries exist yet.
 * T3: tenantId always required.
 */
export async function getLedgerBalance(
  db: D1Like,
  tableName: string,
  walletId: string,
  tenantId: string,
): Promise<number> {
  const row = await db
    .prepare(`
      SELECT COALESCE(running_balance_kobo, 0) as bal
      FROM ${tableName}
      WHERE wallet_id = ? AND tenant_id = ?
      ORDER BY created_at DESC, rowid DESC
      LIMIT 1
    `)
    .bind(walletId, tenantId)
    .first<{ bal: number }>();

  return row?.bal ?? 0;
}

/**
 * List ledger entries for a wallet. Ordered by created_at DESC.
 * T3: tenantId always required.
 */
export async function listLedgerEntries(
  db: D1Like,
  tableName: string,
  walletId: string,
  tenantId: string,
  opts: { limit?: number; offset?: number } = {},
): Promise<LedgerEntry[]> {
  const limit = Math.min(opts.limit ?? 50, 500);
  const offset = opts.offset ?? 0;

  const { results } = await db
    .prepare(`
      SELECT * FROM ${tableName}
      WHERE wallet_id = ? AND tenant_id = ?
      ORDER BY created_at DESC, rowid DESC
      LIMIT ? OFFSET ?
    `)
    .bind(walletId, tenantId, limit, offset)
    .all<{
      id: string; wallet_id: string; tenant_id: string; entry_type: string;
      amount_kobo: number; running_balance_kobo: number; reference: string;
      description: string | null; created_at: number;
    }>();

  return results.map(r => ({
    id: r.id, walletId: r.wallet_id, tenantId: r.tenant_id,
    entryType: r.entry_type as LedgerEntry['entryType'],
    amountKobo: r.amount_kobo, runningBalanceKobo: r.running_balance_kobo,
    reference: r.reference, description: r.description, createdAt: r.created_at,
  }));
}

/**
 * Post a reversal entry (negative amountKobo of the original).
 * P9: reversalAmountKobo must be non-zero integer. Pass positive value; this fn negates it.
 */
export async function reverseLedgerEntry(
  db: D1Like,
  input: Omit<LedgerPostInput, 'entryType' | 'amountKobo'> & {
    reversalAmountKobo: number;
    reversalReference: string;
  },
): Promise<LedgerPostResult> {
  assertIntegerKobo(input.reversalAmountKobo, 'reversalAmountKobo');

  return postLedgerEntry(db, {
    ...input,
    amountKobo: -Math.abs(input.reversalAmountKobo),
    entryType: 'reversal',
    reference: input.reversalReference,
  });
}
