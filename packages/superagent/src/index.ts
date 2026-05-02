/**
 * @webwaka/superagent — Cross-cutting AI layer for WebWaka OS.
 * (SA-1.4 through SA-2.3 — TDR-0009)
 *
 * SuperAgent is NOT a fourth pillar. It is the AI infrastructure that serves
 * all three pillars:
 *   Pillar 1 (Ops):        inventory_ai, pos_receipt_ai, shift_summary_ai, fraud_flag_ai
 *   Pillar 2 (Branding):   bio_generator, brand_copywriter, seo_meta_ai
 *   Pillar 3 (Marketplace): listing_enhancer, review_summary, search_rerank
 *
 * See docs/governance/3in1-platform-architecture.md
 *
 * Exports (SA-1.x):
 *   KeyService         — SA-1.4: BYOK key encryption + D1 storage
 *   WalletService      — SA-1.5: WakaCU balance + double-entry ledger
 *   PartnerPoolService — SA-1.6: Partner credit allocation
 *   CreditBurnEngine   — SA-1.7: AI spend accounting (pool → wallet → BYOK)
 *   UsageMeter         — SA-1.9: Audit log + pillar analytics
 *
 * Exports (SA-2.x):
 *   grantAiConsent     — SA-2.1: Record NDPR AI consent
 *   revokeAiConsent    — SA-2.1: Revoke NDPR AI consent
 *   getAiConsentStatus — SA-2.1: Check consent status
 *   listAiConsents     — SA-2.1: Audit history for DSAR
 *   aiConsentGate      — SA-2.2: Hono middleware (P10/P12/AI-rights guard)
 *   VERTICAL_AI_CONFIGS — SA-2.3: Per-vertical AI capability declarations
 *   getVerticalAiConfig — SA-2.3: Look up config by slug
 *   isCapabilityAllowed — SA-2.3: Check capability permission for a vertical
 *
 * Exports (SA-4.x — M12 Production):
 *   HitlService        — SA-4.5: HITL queue management (submit, review, expire)
 *   SpendControls      — SA-4.4: Per-user/team/project WakaCU budgets
 *   ComplianceFilter   — SA-4.5: Sensitive sector content filtering
 *   NdprRegister       — SA-4.3: NDPR Article 30 processing register
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

export {
  grantAiConsent,
  revokeAiConsent,
  getAiConsentStatus,
  listAiConsents,
} from './consent-service.js';
export type {
  AiConsentPurpose,
  AiConsentLocale,
  AiConsentRecord,
  GrantConsentInput,
  ConsentStatus,
} from './consent-service.js';

export { aiConsentGate } from './middleware.js';

export {
  VERTICAL_AI_CONFIGS,
  DEFAULT_VERTICAL_AI_CONFIG,
  getVerticalAiConfig,
  isCapabilityAllowed,
  isCapabilityProhibited,
  getAllVerticalSlugs,
} from './vertical-ai-config.js';
export type { VerticalAiConfig } from './vertical-ai-config.js';

export { CAPABILITY_METADATA, listCapabilities } from './capability-metadata.js';
export type { CapabilityMetadata } from './capability-metadata.js';

export type {
  SuperAgentKey,
  SuperAgentKeyScope,
  SuperAgentKeyProvider,
  WakaCuWallet,
  WakaCuTransaction,
  PartnerCreditPool,
  AiUsageEvent,
} from './types.js';

export {
  guardAIFinancialWrite,
  AIFinancialWriteError,
  getProhibitedFinancialTables,
} from './guards.js';

export { HitlService } from './hitl-service.js';
export type {
  HitlSubmission,
  HitlReview,
  HitlQueueItem,
  HitlServiceDeps,
} from './hitl-service.js';

export { SpendControls } from './spend-controls.js';
export type {
  BudgetScope,
  SpendBudget,
  SetBudgetInput,
  SpendCheckResult,
  SpendControlsDeps,
} from './spend-controls.js';

export {
  getSensitiveSector,
  isSensitiveVertical,
  preProcessCheck,
  stripPii,
  postProcessCheck,
} from './compliance-filter.js';
export type {
  SensitiveSector,
  ComplianceCheckResult,
  PostProcessResult,
} from './compliance-filter.js';

export { NdprRegister } from './ndpr-register.js';
export type {
  ProcessingActivity,
  RegisterEntry,
  NdprRegisterDeps,
} from './ndpr-register.js';

export { ToolRegistry, MAX_TOOL_ROUNDS } from './tool-registry.js';
export type {
  ToolExecutionContext,
  ToolHandler,
  RegisteredTool,
} from './tool-registry.js';

export { createDefaultToolRegistry } from './tools/index.js';
export { inventoryCheckTool } from './tools/inventory-check.js';
export { posRecentSalesTool } from './tools/pos-recent-sales.js';
export { getActiveOfferingsTool } from './tools/get-active-offerings.js';
export { scheduleAvailabilityTool } from './tools/schedule-availability.js';

export { SessionService } from './session-service.js';
export type {
  Session,
  SessionListItem,
  SessionMessage,
  AppendMessageInput,
  SessionServiceDeps,
} from './session-service.js';

// Wave 3 exports
export { runAgentLoop } from './agent-loop.js';
export type {
  AgentLoopInput,
  AgentLoopResult,
  AIAdapter,
  AIAdapterResponse,
} from './agent-loop.js';

export { PromptManager } from './prompt-manager.js';
export type { PromptContext, BuiltPrompt } from './prompt-manager.js';

export { searchOfferingsTool } from './tools/search-offerings.js';
export { getCustomerHistoryTool } from './tools/get-customer-history.js';
export { getAnalyticsSummaryTool } from './tools/get-analytics-summary.js';
export { logPaymentTool } from './tools/log-payment.js';
export { createSupportTicketTool } from './tools/create-support-ticket.js';

// Wave 3 additions
export { runAgentLoopStream } from './agent-loop-stream.js';
export type { AgentLoopStreamInput, SSEEvent, SSEEmitter, StreamingAIAdapter } from './agent-loop-stream.js';
export { jobRegistry, jobsByName } from './background-jobs/registry.js';
export type { BackgroundJob, BackgroundJobResult, BackgroundJobEnv } from './background-jobs/types.js';
export { DemandForecastJob } from './background-jobs/demand-forecast-job.js';
export { ShiftSummaryJob } from './background-jobs/shift-summary-job.js';
