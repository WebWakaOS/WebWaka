/**
 * @webwaka/ai — AI provider abstraction type contracts + routing engine.
 * (TDR-0009, Platform Invariants P7 + P8)
 *
 * SA-1.1: types, capabilities
 * SA-1.2: router (ResolvedAdapter, resolveAdapter, PLATFORM_AGGREGATORS)
 */

export type {
  AIProvider,
  AIProviderConfig,
  AIMessage,
  AIRequest,
  AIResponse,
  AIEmbedRequest,
  AIEmbedResponse,
  AIAdapter,
  AggregatorConfig,
  AIRoutingContext,
  AIRoutingErrorCode,
} from './types.js';

export { AIRoutingError } from './types.js';

export type {
  AICapabilityType,
  CapabilityCheckResult,
} from './capabilities.js';

export {
  evaluateAICapability,
  CAPABILITY_PLAN_TIER,
} from './capabilities.js';

export type {
  ResolvedAdapter,
  ByokKeyResolver,
  RouterOptions,
} from './router.js';

export {
  resolveAdapter,
  PLATFORM_AGGREGATORS,
} from './router.js';
