/**
 * @webwaka/ledger — Shared double-entry ledger types (Phase 1)
 *
 * Extracted from @webwaka/pos (float-ledger) and @webwaka/hl-wallet (ledger).
 * Both consumers share this common interface and atomic CTE pattern.
 *
 * Platform Invariants:
 *   P9 — All amounts are integer kobo. Never floats. Never REAL SQL type.
 *   T4 — Atomic conditional UPDATE prevents double-spend.
 */

export interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

export type LedgerEntryType =
  | 'credit'
  | 'debit'
  | 'reversal'
  | 'fee'
  | 'commission'
  | 'top_up'
  | 'cash_in'
  | 'cash_out'
  | 'transfer_in'
  | 'transfer_out';

export interface LedgerPostInput {
  /** Ledger table name — caller specifies which ledger table to write */
  tableName: string;
  /** Wallet/account ID to debit or credit */
  walletId: string;
  /** Tenant ID (T3) */
  tenantId: string;
  /** Amount in kobo — positive = credit, negative = debit (P9: must be integer) */
  amountKobo: number;
  /** Entry type */
  entryType: LedgerEntryType;
  /** Idempotency reference — UNIQUE constraint on ledger table */
  reference: string;
  /** Human-readable description */
  description?: string;
  /** Additional structured metadata */
  metadataJson?: Record<string, unknown>;
}

export interface LedgerPostResult {
  id: string;
  runningBalanceKobo: number;
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  tenantId: string;
  entryType: LedgerEntryType;
  amountKobo: number;
  runningBalanceKobo: number;
  reference: string;
  description: string | null;
  createdAt: number;
}

/**
 * Guard: amountKobo must be a non-zero integer. Never a float. (P9)
 */
export function assertIntegerKobo(amount: number, label = 'amountKobo'): void {
  if (!Number.isInteger(amount)) {
    throw new TypeError(`${label} must be an integer (kobo). Got: ${amount}`);
  }
  if (amount === 0) {
    throw new TypeError(`${label} must be non-zero.`);
  }
}
