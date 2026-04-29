/**
 * Capability Metadata Registry — SA-2.3 / Task #3
 * WebWaka OS — Human-readable catalogue of all AICapabilityType values.
 *
 * Used by:
 *   GET /superagent/capabilities     — public catalogue endpoint
 *   GET /superagent/vertical/:slug/capabilities — per-vertical config endpoint
 *   GET /superagent/vertical/:slug/capabilities/check — O(1) capability gate for UIs
 *
 * Platform Invariants:
 *   P10 — Capability list does not waive NDPR consent; consent is still required at call time
 *   P7  — All AI invocations still go through resolveAdapter (not listed here)
 *
 * Phase 5 (E29): 5 new mobilization-intelligence capabilities added (PRD §12.8).
 */

import type { AICapabilityType } from '@webwaka/ai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CapabilityMetadata {
  capability: AICapabilityType;
  displayName: string;
  description: string;
  /**
   * Pillar grouping:
   *   1 = Pillar 1 — Operations & cross-pillar utilities
   *   2 = Pillar 2 — Branding & website
   *   3 = Pillar 3 — Marketplace & discovery
   */
  pillar: 1 | 2 | 3;
  /** Minimum plan tier required (from CAPABILITY_PLAN_TIER) */
  planTier: 'growth' | 'pro' | 'enterprise';
}

// ---------------------------------------------------------------------------
// Registry — all 28 AICapabilityType values (23 original + 5 Phase 5 additions)
// ---------------------------------------------------------------------------

export const CAPABILITY_METADATA: Readonly<Record<AICapabilityType, CapabilityMetadata>> = {

  // ── Pillar 1 — Operations ─────────────────────────────────────────────────

  inventory_ai: {
    capability: 'inventory_ai',
    displayName: 'Inventory Intelligence',
    description:
      'Detect stock anomalies and generate smart reorder recommendations from current inventory levels and historical consumption patterns.',
    pillar: 1,
    planTier: 'growth',
  },

  pos_receipt_ai: {
    capability: 'pos_receipt_ai',
    displayName: 'POS Receipt Summarisation',
    description:
      'Generate natural-language summaries and enriched item descriptions from POS transaction data to improve receipt clarity.',
    pillar: 1,
    planTier: 'growth',
  },

  shift_summary_ai: {
    capability: 'shift_summary_ai',
    displayName: 'Shift Summary Generation',
    description:
      'Produce end-of-shift sales narratives and operational highlights from aggregated shift data for manager review.',
    pillar: 1,
    planTier: 'growth',
  },

  fraud_flag_ai: {
    capability: 'fraud_flag_ai',
    displayName: 'Transaction Fraud Flagging',
    description:
      'Identify anomalous transaction patterns using AI for operator review. Flags are advisory only; final action requires human review (HITL).',
    pillar: 1,
    planTier: 'pro',
  },

  scheduling_assistant: {
    capability: 'scheduling_assistant',
    displayName: 'Scheduling Assistant',
    description:
      'Intelligently suggest and optimise appointment slots, shift patterns, and resource allocation for operational workflows.',
    pillar: 1,
    planTier: 'growth',
  },

  demand_forecasting: {
    capability: 'demand_forecasting',
    displayName: 'Demand Forecasting',
    description:
      'Predict demand patterns from aggregated historical transaction data to improve stock planning, staffing, and procurement decisions.',
    pillar: 1,
    planTier: 'pro',
  },

  route_optimizer: {
    capability: 'route_optimizer',
    displayName: 'Route Optimisation',
    description:
      'Compute optimal logistics and last-mile delivery routes from waypoints to reduce fuel costs and delivery time.',
    pillar: 1,
    planTier: 'pro',
  },

  superagent_chat: {
    capability: 'superagent_chat',
    displayName: 'AI Conversational Assistant',
    description:
      'General-purpose conversational AI assistant for workspace operations, customer queries, and internal knowledge management.',
    pillar: 1,
    planTier: 'growth',
  },

  function_call: {
    capability: 'function_call',
    displayName: 'Structured Tool Calling',
    description:
      'AI-driven function execution via the ToolRegistry — enables multi-turn autonomous workflows with built-in tools. Requires HITL approval in sensitive verticals.',
    pillar: 1,
    planTier: 'pro',
  },

  embedding: {
    capability: 'embedding',
    displayName: 'Text Embedding',
    description:
      'Generate vector representations of text for semantic search, content discovery, and similarity matching.',
    pillar: 1,
    planTier: 'growth',
  },

  content_moderation: {
    capability: 'content_moderation',
    displayName: 'Content Moderation',
    description:
      'Automated safety classification of user-generated content for community platforms, forums, and review boards.',
    pillar: 1,
    planTier: 'growth',
  },

  sentiment_analysis: {
    capability: 'sentiment_analysis',
    displayName: 'Sentiment Analysis',
    description:
      'Classify the sentiment (positive/negative/neutral) of reviews, feedback, and customer messages to drive quality improvement.',
    pillar: 1,
    planTier: 'growth',
  },

  translation: {
    capability: 'translation',
    displayName: 'Language Translation',
    description:
      'Translate content between English, Nigerian Pidgin, Hausa, Yoruba, and Igbo to reach all Nigerian audiences.',
    pillar: 1,
    planTier: 'growth',
  },

  document_extractor: {
    capability: 'document_extractor',
    displayName: 'Document Data Extraction',
    description:
      'Extract structured data from uploaded documents — CAC certificates, INEC forms, permits, contracts, and more.',
    pillar: 1,
    planTier: 'pro',
  },

  // ── Pillar 2 — Branding / Website ─────────────────────────────────────────

  bio_generator: {
    capability: 'bio_generator',
    displayName: 'Bio Generator',
    description:
      'Auto-generate compelling business or personal bios from profile data, tailored for the workspace vertical and target audience.',
    pillar: 2,
    planTier: 'growth',
  },

  brand_copywriter: {
    capability: 'brand_copywriter',
    displayName: 'Brand Copywriter',
    description:
      'Generate headlines, taglines, CTAs, and promotional copy from workspace brand data and tone of voice guidelines.',
    pillar: 2,
    planTier: 'growth',
  },

  brand_image_alt: {
    capability: 'brand_image_alt',
    displayName: 'Image Alt-Text Generation',
    description:
      'Generate accessibility-compliant alt-text for uploaded workspace and product images to meet WCAG 2.1 standards.',
    pillar: 2,
    planTier: 'growth',
  },

  seo_meta_ai: {
    capability: 'seo_meta_ai',
    displayName: 'SEO Metadata Generation',
    description:
      'Generate optimised page titles and meta descriptions for workspace and listing pages to improve search engine visibility.',
    pillar: 2,
    planTier: 'growth',
  },

  policy_summarizer: {
    capability: 'policy_summarizer',
    displayName: 'Policy Document Summariser',
    description:
      'Produce plain-English summaries of policy, legal, and government documents — ideal for INEC circulars, FGN gazettes, and CAC notices.',
    pillar: 2,
    planTier: 'growth',
  },

  // ── Pillar 3 — Marketplace / Discovery ────────────────────────────────────

  listing_enhancer: {
    capability: 'listing_enhancer',
    displayName: 'Listing Text Enhancer',
    description:
      'Improve the quality, clarity, and appeal of marketplace listing descriptions using AI to boost conversion rates.',
    pillar: 3,
    planTier: 'growth',
  },

  review_summary: {
    capability: 'review_summary',
    displayName: 'Review Sentiment Summary',
    description:
      'Aggregate and summarise customer review sentiment for marketplace listings to surface trends and highlight quality signals.',
    pillar: 3,
    planTier: 'growth',
  },

  search_rerank: {
    capability: 'search_rerank',
    displayName: 'Semantic Search Reranking',
    description:
      'Improve marketplace search result relevance using semantic similarity to surface the most contextually relevant listings.',
    pillar: 3,
    planTier: 'pro',
  },

  price_suggest: {
    capability: 'price_suggest',
    displayName: 'AI Price Recommendation',
    description:
      'Recommend competitive listing prices based on market signals and category benchmarks. Advisory only — operator must confirm before publishing.',
    pillar: 3,
    planTier: 'pro',
  },

  product_description_writer: {
    capability: 'product_description_writer',
    displayName: 'Product Description Writer',
    description:
      'Generate compelling product descriptions for marketplace listings from product attributes such as name, category, specifications, and features.',
    pillar: 3,
    planTier: 'growth',
  },

  // ── Phase 5 (E29) — Mobilization Intelligence (PRD §12.8) ─────────────────

  mobilization_analytics: {
    capability: 'mobilization_analytics',
    displayName: 'Mobilization Analytics',
    description:
      'Predict optimal broadcast timing, identify member engagement drop-off risk, and forecast GOTV conversion rates from workspace activity patterns. Advisory only — all recommendations require human review.',
    pillar: 1,
    planTier: 'pro',
  },

  broadcast_scheduler: {
    capability: 'broadcast_scheduler',
    displayName: 'AI Broadcast Scheduler',
    description:
      'Recommend optimal broadcast schedules based on member activity patterns, time-zone distribution, and historical open-rate data. Suggestions only — coordinator approves before sending.',
    pillar: 1,
    planTier: 'pro',
  },

  member_segmentation: {
    capability: 'member_segmentation',
    displayName: 'Member Segmentation',
    description:
      'Automatically segment workspace members by activity level, geographic cluster, and engagement tier for targeted broadcast campaigns. No PII shared with AI provider — segmentation is computed on aggregated signals.',
    pillar: 1,
    planTier: 'pro',
  },

  petition_optimizer: {
    capability: 'petition_optimizer',
    displayName: 'Petition Optimizer',
    description:
      'Suggest petition body improvements — clearer language, stronger calls-to-action, and better argument structure — to increase signature conversion rates. Draft suggestions only; coordinator must approve before publishing.',
    pillar: 1,
    planTier: 'growth',
  },

  case_classifier: {
    capability: 'case_classifier',
    displayName: 'Case Classifier',
    description:
      'Auto-classify incoming cases by type, urgency level, and optimal handler based on historical case patterns. Classification is advisory — human case manager makes final assignment decision (HITL L1).',
    pillar: 1,
    planTier: 'growth',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns all capability metadata entries sorted by pillar (ascending)
 * then alphabetically by capability key within each pillar.
 */
export function listCapabilities(): CapabilityMetadata[] {
  return Object.values(CAPABILITY_METADATA).sort((a, b) => {
    if (a.pillar !== b.pillar) return a.pillar - b.pillar;
    return a.capability.localeCompare(b.capability);
  });
}
