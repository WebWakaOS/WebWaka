/**
 * POS float double-entry ledger.
 * (Platform Invariants P9 + T4 — all monetary values are integer kobo. NEVER floating point.)
 *
 * The float_ledger table is append-only.
 * No UPDATE or DELETE on ledger rows ever.
 * Reversals are new rows with negative amountKobo.
 */

interface D1BoundStmt {
  first<T>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
  all<T>(): Promise<{ results: T[] }>;
}

interface D1Like {
  prepare(sql: string): { bind(...values: unknown[]): D1BoundStmt };
  batch(statements: D1BoundStmt[]): Promise<{ success: boolean }[]>;
}

export interface LedgerEntry {
  walletId: string;
  amountKobo: number;       // Platform Invariant T4 — integer kobo only
  transactionType: 'top_up' | 'cash_in' | 'cash_out' | 'commission' | 'reversal' | 'fee';
  reference: string;
  description?: string;
}

export interface LedgerResult {
  id: string;
  runningBalanceKobo: number;
}

export interface LedgerRow {
  id: string;
  wallet_id: string;
  amount_kobo: number;
  running_balance_kobo: number;
  transaction_type: string;
  reference: string;
  description: string | null;
  created_at: number;
}

/**
 * Guard: amountKobo must be a non-zero integer. Never a float.
 */
function assertIntegerKobo(amount: number, label = 'amountKobo'): void {
  if (!Number.isInteger(amount)) {
    throw new TypeError(`${label} must be an integer (kobo). Got: ${amount}`);
  }
  if (amount === 0) {
    throw new TypeError(`${label} must be non-zero.`);
  }
}

/**
 * Posts a double-entry ledger transaction.
 *
 * Platform Invariant P9: All amounts are integer kobo. Never floats.
 * Ledger is append-only — no UPDATE or DELETE on float_ledger rows.
 *
 * Race-condition fix: the wallet balance is updated atomically via a single
 * conditional UPDATE … RETURNING statement whose WHERE clause enforces the
 * non-negative constraint at the database level.  This eliminates the
 * time-of-check / time-of-use (TOCTOU) window that existed when a separate
 * SELECT was used to read the balance before computing and writing the new value.
 *
 * Flow:
 *   1. Attempt atomic UPDATE agent_wallets SET balance = balance + amount
 *      WHERE id = ? AND (balance + amount) >= 0  RETURNING new_balance
 *   2. If no row is returned → either the wallet is missing or the balance is
 *      insufficient.  A follow-up read distinguishes the two cases so the
 *      correct error is raised.
 *   3. INSERT float_ledger row using the confirmed new balance.
 */
export async function postLedgerEntry(
  db: D1Like,
  entry: LedgerEntry,
): Promise<LedgerResult> {
  assertIntegerKobo(entry.amountKobo);

  // Step 1 — atomic, race-free balance update.
  // The constraint `(balance_kobo + ?) >= 0` is evaluated inside SQLite so no
  // concurrent request can observe the pre-update balance and pass the same
  // check; one of the two concurrent writes will match 0 rows and be rejected.
  const updated = await db.prepare(
    `UPDATE agent_wallets
        SET balance_kobo = balance_kobo + ?,
            updated_at   = unixepoch()
      WHERE id = ?
        AND (balance_kobo + ?) >= 0
      RETURNING balance_kobo`,
  ).bind(entry.amountKobo, entry.walletId, entry.amountKobo)
   .first<{ balance_kobo: number }>();

  if (!updated) {
    // Step 2 — distinguish "wallet missing" from "insufficient float".
    const wallet = await db.prepare(
      'SELECT balance_kobo FROM agent_wallets WHERE id = ?',
    ).bind(entry.walletId).first<{ balance_kobo: number }>();

    if (!wallet) throw new Error(`Wallet not found: ${entry.walletId}`);

    throw new InsufficientFloatError(
      `Insufficient float: balance=${wallet.balance_kobo} kobo, debit=${Math.abs(entry.amountKobo)} kobo`,
    );
  }

  const newBalance = updated.balance_kobo;
  const id = `flt_${crypto.randomUUID()}`;

  // Step 3 — append immutable ledger row (P9: append-only, no UPDATE/DELETE).
  await db.prepare(
    `INSERT INTO float_ledger
       (id, wallet_id, amount_kobo, running_balance_kobo, transaction_type, reference, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    id,
    entry.walletId,
    entry.amountKobo,
    newBalance,
    entry.transactionType,
    entry.reference,
    entry.description ?? null,
  ).run();

  return { id, runningBalanceKobo: newBalance };
}

export class InsufficientFloatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientFloatError';
  }
}

/**
 * Reverse a ledger entry. Posts an equal and opposite entry.
 * Ledger is append-only — no row deletion or mutation. (P9)
 */
export async function reverseLedgerEntry(
  db: D1Like,
  originalReference: string,
  reversalReference: string,
  reason: string,
): Promise<LedgerResult> {
  const original = await db.prepare(
    'SELECT wallet_id, amount_kobo FROM float_ledger WHERE reference = ?',
  ).bind(originalReference).first<{ wallet_id: string; amount_kobo: number }>();

  if (!original) throw new Error(`Original entry not found: ${originalReference}`);

  return postLedgerEntry(db, {
    walletId: original.wallet_id,
    amountKobo: -original.amount_kobo,  // Equal and opposite
    transactionType: 'reversal',
    reference: reversalReference,
    description: `Reversal of ${originalReference}: ${reason}`,
  });
}

/**
 * Get paginated ledger entries for a wallet.
 */
export async function getLedgerHistory(
  db: D1Like,
  walletId: string,
  limit = 20,
): Promise<LedgerRow[]> {
  const result = await db.prepare(
    'SELECT * FROM float_ledger WHERE wallet_id = ? ORDER BY created_at DESC LIMIT ?',
  ).bind(walletId, limit).all<LedgerRow>();
  return result.results;
}
