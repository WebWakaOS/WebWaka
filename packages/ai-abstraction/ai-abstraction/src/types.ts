/**
 * AI provider abstraction type contracts for WebWaka OS.
 * (Platform Invariants P7, P8 — TDR-0009)
 *
 * SA-1.1: Expanded AIProvider union to cover aggregator-routable and BYOK-direct
 *         providers. Added AIEmbedRequest/AIEmbedResponse, AggregatorConfig,
 *         and routing error codes.
 *
 * P7: No direct SDK calls to OpenAI/Anthropic anywhere in the codebase.
 *     All AI access goes through these typed contracts.
 * P8: BYOK (Bring Your Own Key) — tenants may supply their own API keys.
 *     Never hardcode or log AI API keys.
 *
 * 3-in-1: SuperAgent is a cross-cutting layer serving all three pillars.
 *         It is NOT a fourth pillar. See docs/governance/3in1-platform-architecture.md.
 */

// ---------------------------------------------------------------------------
// Provider union (SA-1.1 — ADL-001, ADL-009, ADL-010)
// ---------------------------------------------------------------------------

/**
 * AI providers accessible via the SuperAgent routing engine.
 *
 * Aggregator-routable (routing levels 3-4 of the 5-level chain):
 *   All use the openai-compat adapter with provider-specific base URLs.
 *
 * BYOK-only direct (routing levels 1-2 — user/workspace BYOK keys):
 *   'openai', 'anthropic', 'google' use native adapters when BYOK keys supplied.
 *
 * 'byok_custom' — escape hatch for self-hosted / non-standard endpoints (P8).
 */
export type AIProvider =
  // Aggregator-routable (platform-managed — WakaCU credits consumed)
  | 'openrouter'
  | 'together'
  | 'groq'
  | 'eden'
  | 'fireworks'
  | 'deepinfra'
  | 'perplexity'
  | 'cohere'
  | 'mistral'
  | 'deepseek'
  | 'qwen'
  | 'yi'
  | 'gemini_via_agg'
  | 'claude_via_agg'
  | 'gpt_via_agg'
  // BYOK-only direct providers (ADL-010)
  | 'openai'
  | 'anthropic'
  | 'google'
  // Generic BYOK escape hatch (P8)
  | 'byok_custom';

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

export interface AIProviderConfig {
  /** Which AI provider to use */
  provider: AIProvider;
  /** Specific model identifier (e.g. "gpt-4o", "claude-3-sonnet") */
  model: string;
  /** API key from tenant BYOK config or platform secret — NEVER hardcoded */
  apiKey: string;
  /** For BYOK or aggregators — override the provider base URL */
  baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ---------------------------------------------------------------------------
// Request / Response — text completion
// ---------------------------------------------------------------------------

export interface AIRequest {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  /** If true, the adapter should return a streaming iterable */
  stream?: boolean;
}

export interface AIResponse {
  /** The generated text content */
  content: string;
  /** Which provider produced this response */
  provider: AIProvider;
  /** Exact model that produced this response */
  model: string;
  /** Total tokens consumed (prompt + completion) */
  tokensUsed: number;
  /** Why the generation stopped */
  finishReason: 'stop' | 'length' | 'error';
}

// ---------------------------------------------------------------------------
// Request / Response — embeddings (SA-1.1)
// ---------------------------------------------------------------------------

export interface AIEmbedRequest {
  /** Single string or batch of strings to embed */
  input: string | string[];
  /** Model override — defaults to provider default */
  model?: string;
}

export interface AIEmbedResponse {
  embeddings: number[][];
  provider: AIProvider;
  model: string;
  tokensUsed: number;
}

// ---------------------------------------------------------------------------
// Adapter interface (P7 — the contract every AI integration must implement)
// ---------------------------------------------------------------------------

/**
 * Every AI provider integration must implement this interface.
 *
 * Implementations live in `packages/ai-adapters/` (SA-1.3).
 * The SuperAgent routing engine selects the adapter via the 5-level chain
 * defined in `packages/ai-abstraction/src/router.ts` (SA-1.2).
 */
export interface AIAdapter {
  /** Non-streaming completion */
  complete(request: AIRequest): Promise<AIResponse>;

  /** Embedding generation (optional — not all providers support this) */
  embed?(request: AIEmbedRequest): Promise<AIEmbedResponse>;

  /**
   * Streaming completion (optional).
   * Callers must check `typeof adapter.stream === 'function'` before use.
   */
  stream?(request: AIRequest): AsyncIterable<string>;
}

// ---------------------------------------------------------------------------
// Aggregator descriptor (used by routing engine SA-1.2)
// ---------------------------------------------------------------------------

export interface AggregatorConfig {
  provider: AIProvider;
  baseUrl: string;
  /** Name of the env var / KV key holding the platform API key — NEVER the key itself */
  apiKeyEnvVar: string;
  /** Capabilities this aggregator supports */
  capabilities: readonly import('./capabilities.js').AICapabilityType[];
  /** Cost per 1 k tokens in WakaCU credits (integer, P9) */
  wakaCuPer1kTokens: number;
}

// ---------------------------------------------------------------------------
// Routing context (passed from the request layer to the router SA-1.2)
// ---------------------------------------------------------------------------

export interface AIRoutingContext {
  /** Pillar originating the request: 1=Ops, 2=Branding, 3=Marketplace */
  pillar: 1 | 2 | 3;
  /** Workspace tenant ID — for BYOK key lookup and spend cap checks */
  tenantId: string;
  /** Whether the user agent is a USSD session (P12 — AI blocked on USSD) */
  isUssd: boolean;
  /** Whether NDPR AI-processing consent has been granted (P10) */
  ndprConsentGranted: boolean;
  /** Plan aiRights flag (from entitlements) */
  aiRights: boolean;
  /** Monthly spend cap in WakaCU (0 = unlimited for partner plans) */
  spendCapWakaCu: number;
  /** Current month spend already consumed */
  currentSpendWakaCu: number;
  /** The specific AI capability being requested */
  capability: import('./capabilities.js').AICapabilityType;
}

// ---------------------------------------------------------------------------
// Routing error (SA-1.2)
// ---------------------------------------------------------------------------

export type AIRoutingErrorCode =
  | 'USSD_EXCLUDED'        // P12 — no AI on USSD sessions
  | 'CONSENT_REQUIRED'     // P10 — NDPR consent not granted
  | 'ENTITLEMENT_DENIED'   // aiRights: false on plan
  | 'SPEND_CAP_EXCEEDED'   // monthly WakaCU cap reached
  | 'NO_ADAPTER_AVAILABLE' // no key at any level of the 5-level chain
  | 'INVALID_CAPABILITY';  // capability not supported by selected provider

export class AIRoutingError extends Error {
  readonly code: AIRoutingErrorCode;
  constructor(code: AIRoutingErrorCode, message: string) {
    super(message);
    this.name = 'AIRoutingError';
    this.code = code;
  }
}
