/**
 * @webwaka/ledger — Public API (Phase 1)
 *
 * Shared double-entry ledger with atomic CTE pattern.
 * Extracted from @webwaka/pos float-ledger and @webwaka/hl-wallet.
 *
 * Usage (in pos or hl-wallet):
 *   import { postLedgerEntry, getLedgerBalance, listLedgerEntries } from '@webwaka/ledger';
 *
 * P9: All amounts are integer kobo. assertIntegerKobo() validates before writes.
 * T4: Atomic conditional UPDATE — double-spend prevention is the caller's responsibility
 *     via their wallet balance column and this function's reference UNIQUE constraint.
 */

export * from './types.js';
export { postLedgerEntry, getLedgerBalance, listLedgerEntries, reverseLedgerEntry } from './ledger.js';

export const PACKAGE_VERSION = '0.1.0';
