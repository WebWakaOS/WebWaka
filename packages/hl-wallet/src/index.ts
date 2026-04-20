/**
 * @webwaka/hl-wallet — Public API
 *
 * HandyLife Wallet: shared ledger-backed user-level NGN wallet.
 * Build Once Use Infinitely — used across all WebWaka verticals and partners.
 *
 * Platform Invariants enforced: P9, T3, T4, T5, T7
 * See docs/handylife-wallet-master-plan.md for full architecture.
 */

export * from './types.js';
export * from './errors.js';
export * from './reference.js';
export * from './feature-flags.js';
export * from './eligibility.js';
export * from './kyc-gate.js';
export * from './ledger.js';
export * from './spend-controls.js';
export * from './funding.js';
export * from './mla.js';
