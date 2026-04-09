/**
 * @webwaka/superagent — Cross-cutting AI layer for WebWaka OS.
 * (SA-1.4 through SA-1.9 — TDR-0009)
 *
 * SuperAgent is NOT a fourth pillar. It is the AI infrastructure that serves
 * all three pillars:
 *   Pillar 1 (Ops):        inventory_ai, pos_receipt_ai, shift_summary_ai, fraud_flag_ai
 *   Pillar 2 (Branding):   bio_generator, brand_copywriter, seo_meta_ai
 *   Pillar 3 (Marketplace): listing_enhancer, review_summary, search_rerank
 *
 * See docs/governance/3in1-platform-architecture.md
 *
 * Exports:
 *   KeyService         — SA-1.4: BYOK key encryption + D1 storage
 *   WalletService      — SA-1.5: WakaCU balance + double-entry ledger
 *   PartnerPoolService — SA-1.6: Partner credit allocation
 *   CreditBurnEngine   — SA-1.7: AI spend accounting (pool → wallet → BYOK)
 *   UsageMeter         — SA-1.9: Audit log + pillar analytics
 */

export { KeyService } from './key-service.js';
export type { KeyServiceDeps, UpsertKeyInput, ResolveKeyResult } from './key-service.js';

export { WalletService } from './wallet-service.js';
export type { WalletServiceDeps } from './wallet-service.js';

export { PartnerPoolService } from './partner-pool-service.js';
export type { PartnerPoolServiceDeps } from './partner-pool-service.js';

export { CreditBurnEngine } from './credit-burn.js';
export type { CreditBurnInput, CreditBurnResult } from './credit-burn.js';

export { UsageMeter } from './usage-meter.js';
export type { UsageMeterDeps, RecordUsageInput } from './usage-meter.js';

export type {
  SuperAgentKey,
  SuperAgentKeyScope,
  SuperAgentKeyProvider,
  WakaCuWallet,
  WakaCuTransaction,
  PartnerCreditPool,
  AiUsageEvent,
} from './types.js';
