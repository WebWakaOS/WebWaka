/**
 * SuperAgent routing engine — 5-level key resolution chain.
 * (SA-1.2 — TDR-0009, Platform Invariants P7, P8, P10, P12, P13)
 *
 * Key resolution priority (highest → lowest):
 *   Level 1: User BYOK key   (individual user's own key, stored in user KV)
 *   Level 2: Workspace BYOK  (tenant operator's own key, stored in workspace KV)
 *   Level 3: Platform key     (WebWaka platform key, env var, charges WakaCU)
 *   Level 4: Aggregator key   (openrouter/together/groq, charges WakaCU)
 *   Level 5: Fallback model   (smallest free-tier model if aggregator fails)
 *
 * The router does NOT make AI calls. It resolves the adapter config and
 * returns it to the caller in packages/superagent/ for actual execution.
 *
 * P7:  Caller must use the resolved adapter — no direct SDK calls.
 * P8:  BYOK keys are never logged or exposed in error messages.
 * P13: PII must be stripped by the caller before passing AIRequest.
 */

import {
  AIRoutingError,
  type AIRoutingContext,
  type AIProvider,
  type AIProviderConfig,
  type AggregatorConfig,
} from './types.js';
import { evaluateAICapability } from './capabilities.js';

// ---------------------------------------------------------------------------
// Platform aggregator registry (Level 3 / 4 of the chain)
// ---------------------------------------------------------------------------

/**
 * Ordered list of aggregators tried in sequence when BYOK is unavailable.
 * Order: lowest-latency / most cost-effective for African traffic first.
 */
export const PLATFORM_AGGREGATORS: readonly AggregatorConfig[] = [
  {
    provider: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKeyEnvVar: 'GROQ_API_KEY',
    capabilities: [
      'superagent_chat', 'function_call', 'pos_receipt_ai',
      'shift_summary_ai', 'bio_generator', 'brand_copywriter',
      'listing_enhancer', 'inventory_ai',
    ],
    wakaCuPer1kTokens: 1,
  },
  {
    provider: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKeyEnvVar: 'OPENROUTER_API_KEY',
    capabilities: [
      'superagent_chat', 'function_call', 'pos_receipt_ai', 'shift_summary_ai',
      'fraud_flag_ai', 'bio_generator', 'brand_copywriter', 'brand_image_alt',
      'seo_meta_ai', 'listing_enhancer', 'review_summary', 'search_rerank',
      'price_suggest', 'embedding', 'content_moderation', 'inventory_ai',
    ],
    wakaCuPer1kTokens: 2,
  },
  {
    provider: 'together',
    baseUrl: 'https://api.together.xyz/v1',
    apiKeyEnvVar: 'TOGETHER_API_KEY',
    // function_call removed: Together AI does not support OpenAI-compatible native tool calling.
    // Route function_call requests to groq or openrouter which have native tool call support.
    capabilities: [
      'superagent_chat', 'embedding', 'bio_generator',
      'brand_copywriter', 'listing_enhancer', 'inventory_ai',
    ],
    wakaCuPer1kTokens: 1,
  },
  {
    provider: 'deepinfra',
    baseUrl: 'https://api.deepinfra.com/v1/openai',
    apiKeyEnvVar: 'DEEPINFRA_API_KEY',
    capabilities: [
      'superagent_chat', 'embedding', 'bio_generator', 'listing_enhancer',
      'content_moderation',
    ],
    wakaCuPer1kTokens: 1,
  },
] as const;

// ---------------------------------------------------------------------------
// BYOK key resolver type (injected at runtime by superagent package SA-1.4)
// ---------------------------------------------------------------------------

export interface ByokKeyResolver {
  /**
   * Look up a BYOK key for the given tenant/user.
   * Returns null if no key is configured at this level.
   * MUST NOT log the returned key value (P8).
   */
  resolveUserKey(userId: string, provider: AIProvider): Promise<string | null>;
  resolveWorkspaceKey(tenantId: string, provider: AIProvider): Promise<string | null>;
}

// ---------------------------------------------------------------------------
// Routing result
// ---------------------------------------------------------------------------

export interface ResolvedAdapter {
  config: AIProviderConfig;
  /** Which level of the chain resolved this adapter */
  level: 1 | 2 | 3 | 4 | 5;
  /** WakaCU cost per 1 k tokens (0 for user/workspace BYOK — their own cost) */
  wakaCuPer1kTokens: number;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export interface RouterOptions {
  /**
   * Injected BYOK resolver. If omitted, levels 1 and 2 are skipped and the
   * router falls through directly to platform/aggregator keys (levels 3-5).
   */
  byokResolver?: ByokKeyResolver;
  /**
   * User ID for level-1 (user BYOK) resolution.
   * Required if byokResolver is provided.
   */
  userId?: string;
  /**
   * Preferred provider hint (used if the resolved level allows it).
   * Ignored if the hinted provider lacks the required capability.
   */
  preferredProvider?: AIProvider;
  /**
   * Preferred model override for the resolved provider.
   */
  preferredModel?: string;
}

/**
 * Resolve the adapter config for an AI request.
 *
 * Does NOT make network calls. Safe to call in any Worker context.
 *
 * @throws AIRoutingError with a typed code on any gate failure.
 */
export async function resolveAdapter(
  ctx: AIRoutingContext,
  envVars: Record<string, string | undefined>,
  opts: RouterOptions = {},
): Promise<ResolvedAdapter> {
  // ─── Pre-routing capability gate ────────────────────────────────────────
  const check = evaluateAICapability(ctx);
  if (!check.allowed) {
    throw new AIRoutingError(check.code, check.reason);
  }

  const { byokResolver, userId, preferredProvider, preferredModel } = opts;
  const { tenantId, capability } = ctx;

  // ─── Level 1: User BYOK ─────────────────────────────────────────────────
  if (byokResolver && userId) {
    const providers: AIProvider[] = preferredProvider
      ? [preferredProvider, 'openai', 'anthropic', 'google']
      : ['openai', 'anthropic', 'google'];
    for (const provider of providers) {
      const key = await byokResolver.resolveUserKey(userId, provider);
      if (key) {
        return {
          config: {
            provider,
            model: preferredModel ?? defaultModelFor(provider),
            apiKey: key,
          },
          level: 1,
          wakaCuPer1kTokens: 0,
        };
      }
    }
  }

  // ─── Level 2: Workspace BYOK ─────────────────────────────────────────────
  if (byokResolver) {
    const providers: AIProvider[] = preferredProvider
      ? [preferredProvider, 'openai', 'anthropic', 'google']
      : ['openai', 'anthropic', 'google'];
    for (const provider of providers) {
      const key = await byokResolver.resolveWorkspaceKey(tenantId, provider);
      if (key) {
        return {
          config: {
            provider,
            model: preferredModel ?? defaultModelFor(provider),
            apiKey: key,
          },
          level: 2,
          wakaCuPer1kTokens: 0,
        };
      }
    }
  }

  // ─── Levels 3 + 4: Platform key → Aggregator registry ───────────────────
  for (const agg of PLATFORM_AGGREGATORS) {
    if (!agg.capabilities.includes(capability as never)) {
      continue;
    }
    const key = envVars[agg.apiKeyEnvVar];
    if (!key) continue;

    return {
      config: {
        provider: agg.provider,
        model: preferredModel ?? defaultAggregatorModel(agg.provider, capability),
        apiKey: key,
        baseUrl: agg.baseUrl,
      },
      level: 3,
      wakaCuPer1kTokens: agg.wakaCuPer1kTokens,
    };
  }

  // ─── Level 5: Fallback model (Wave 3 A3-2) ──────────────────────────────
  // Use the smallest/cheapest Groq model as a last-resort fallback.
  // Only a few text-generation capabilities are supported here.
  // If GROQ_API_KEY is missing we finally throw NO_ADAPTER_AVAILABLE.
  const LEVEL5_CAPABILITIES: string[] = [
    'superagent_chat', 'bio_generator', 'brand_copywriter',
    'listing_enhancer', 'shift_summary_ai', 'pos_receipt_ai',
  ];
  if (LEVEL5_CAPABILITIES.includes(capability)) {
    const groqKey = envVars['GROQ_API_KEY'];
    if (groqKey) {
      return {
        config: {
          provider: 'groq',
          model: 'llama-3.1-8b-instant',
          apiKey: groqKey,
          baseUrl: 'https://api.groq.com/openai/v1',
        },
        level: 5,
        wakaCuPer1kTokens: 1,
      };
    }
  }

  throw new AIRoutingError(
    'NO_ADAPTER_AVAILABLE',
    `No AI key is configured for capability '${capability}' on tenant '${tenantId}'. ` +
    `Configure a BYOK key in workspace settings or ensure platform aggregator keys are set in environment.`,
  );
}

// ---------------------------------------------------------------------------
// Default model helpers
// ---------------------------------------------------------------------------

function defaultModelFor(provider: AIProvider): string {
  switch (provider) {
    case 'openai':      return 'gpt-4o-mini';
    case 'anthropic':   return 'claude-3-haiku-20240307';
    case 'google':      return 'gemini-1.5-flash';
    default:            return 'gpt-4o-mini';
  }
}

function defaultAggregatorModel(provider: AIProvider, capability: string): string {
  if (capability === 'embedding') {
    if (provider === 'openrouter') return 'openai/text-embedding-3-small';
    if (provider === 'together')   return 'togethercomputer/m2-bert-80M-8k-retrieval';
    return 'openai/text-embedding-3-small';
  }
  switch (provider) {
    case 'groq':        return 'llama-3.1-8b-instant';
    case 'openrouter':  return 'meta-llama/llama-3.1-8b-instruct:free';
    case 'together':    return 'meta-llama/Llama-3.2-3B-Instruct-Turbo';
    case 'deepinfra':   return 'meta-llama/Meta-Llama-3.1-8B-Instruct';
    default:            return 'gpt-4o-mini';
  }
}
