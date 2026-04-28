/**
 * @webwaka/policy-engine — Public API (Phase 1 MVP)
 *
 * The Policy Engine is the single point of truth for platform rules:
 *   - INEC contribution caps (replaces hardcoded checkInecCap in @webwaka/fundraising)
 *   - NDPR data access rules
 *   - AI capability gates (P7, P12)
 *   - GOTV data access (P13)
 *   - Content moderation gates
 *   - Payout approval gates
 *
 * Phase 1: Real rule evaluation with KV cache + D1 loader + audit log.
 * Phase 5: HITL queue integration, automatic rule seeding from compliance db.
 */

export * from './types.js';
export { evaluate, assertAllow, evaluateAll, evaluateCategory } from './engine.js';
export type { EngineOptions } from './engine.js';
export { loadRule, loadRules } from './loader.js';
export { writeAuditLog } from './audit.js';
export { evaluateFinancialCap } from './evaluators/financial-cap.js';
export { evaluateKycRequirement } from './evaluators/kyc.js';
export { evaluateAiGovernance } from './evaluators/ai-governance.js';
export { evaluateModeration } from './evaluators/moderation.js';
export { evaluateDataRetention } from './evaluators/data-retention.js';
export { evaluatePayoutGate } from './evaluators/payout-gate.js';

export const PACKAGE_VERSION = '0.2.0';
