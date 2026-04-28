/**
 * @webwaka/policy-engine — Public API (Phase 5 — all 7 PRD domains)
 *
 * The Policy Engine is the single point of truth for platform rules:
 *   - INEC contribution caps (contribution_cap → financial_cap domain)
 *   - NDPR data access rules (pii_access → kyc_requirement domain)
 *   - AI capability gates (ai_gate → ai_governance domain)
 *   - GOTV + broadcast access (gotv_access / broadcast_gate / access_control → access_control domain)
 *   - Content moderation gates (content_moderation → moderation domain)
 *   - Payout approval gates (payout_gate → financial_cap/payout sub-domain)
 *   - NDPR data retention (compliance → data_retention domain)
 *   - Regulatory compliance regime (compliance_regime → compliance_regime domain) [Phase 5]
 *
 * Phase 5 (E29/T003): All 7 PRD §10.1 domains now have dedicated evaluators.
 *   New: evaluateAccessControl, evaluateComplianceRegime
 *   Extended: evaluateAiGovernance (tenant prohibited_capabilities + max_autonomy_level)
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
export { evaluateAccessControl } from './evaluators/access-control.js';
export { evaluateComplianceRegime } from './evaluators/compliance-regime.js';

export const PACKAGE_VERSION = '0.3.0';
