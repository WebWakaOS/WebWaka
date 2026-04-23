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
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
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
 * Atomicity fix (BUG-LEDGER-01): the previous implementation used two separate
 * D1 round-trips — an UPDATE RETURNING followed by a separate INSERT.  If the
 * Worker was evicted between those two statements the wallet balance would be
 * decremented but no ledger row would be written, silently losing the audit
 * trail.
 *
 * The new implementation merges both operations into a single CTE statement so
 * they are committed atomically by SQLite/D1:
 *
 *   WITH wallet_update AS (
 *     UPDATE agent_wallets SET balance_kobo = balance_kobo + ?
 *     WHERE id = ? AND (balance_kobo + ?) >= 0
 *     RETURNING balance_kobo
 *   )
 *   INSERT INTO float_ledger (...) SELECT ?, ?, ?, balance_kobo, ?, ?, ?
 *   FROM wallet_update
 *   RETURNING running_balance_kobo
 *
 * The CTE returns 0 rows when the UPDATE matched no rows (either the wallet
 * does not exist or the balance would go negative).  The outer INSERT therefore
 * also inserts 0 rows.  A subsequent read distinguishes the two error cases.
 */
export async function postLedgerEntry(
  db: D1Like,
  entry: LedgerEntry,
): Promise<LedgerResult> {
  assertIntegerKobo(entry.amountKobo);

  const id = `flt_${crypto.randomUUID()}`;

  // Single atomic statement: update wallet + append ledger row.
  // The INSERT ... SELECT FROM wallet_update executes only when the CTE
  // (conditional UPDATE) actually matched and updated a row.
  const { results } = await db.prepare(
    `WITH wallet_update AS (
       UPDATE agent_wallets
          SET balance_kobo = balance_kobo + ?,
              updated_at   = unixepoch()
        WHERE id = ?
          AND (balance_kobo + ?) >= 0
        RETURNING balance_kobo
     )
     INSERT INTO float_ledger
       (id, wallet_id, amount_kobo, running_balance_kobo, transaction_type, reference, description)
     SELECT ?, ?, ?, balance_kobo, ?, ?, ?
     FROM wallet_update
     RETURNING running_balance_kobo`,
  ).bind(
    entry.amountKobo,          // UPDATE SET balance_kobo + ?
    entry.walletId,            // UPDATE WHERE id = ?
    entry.amountKobo,          // UPDATE WHERE (balance_kobo + ?) >= 0
    id,                        // INSERT id
    entry.walletId,            // INSERT wallet_id
    entry.amountKobo,          // INSERT amount_kobo
    entry.transactionType,     // INSERT transaction_type
    entry.reference,           // INSERT reference
    entry.description ?? null, // INSERT description
  ).all<{ running_balance_kobo: number }>();

  if (results.length === 0) {
    // CTE returned no rows → UPDATE matched 0 rows.
    // Distinguish "wallet missing" from "insufficient float" for correct errors.
    const wallet = await db.prepare(
      'SELECT balance_kobo FROM agent_wallets WHERE id = ?',
    ).bind(entry.walletId).first<{ balance_kobo: number }>();

    if (!wallet) throw new Error(`Wallet not found: ${entry.walletId}`);

    throw new InsufficientFloatError(
      `Insufficient float: balance=${wallet.balance_kobo} kobo, debit=${Math.abs(entry.amountKobo)} kobo`,
    );
  }

  const newBalance = results[0]!.running_balance_kobo;
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
