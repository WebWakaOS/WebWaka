/**
 * PromptManager — SA-3.x / Wave 3
 * WebWaka OS — Versioned system prompt management for SuperAgent.
 *
 * Loads a governed system prompt for each vertical × pillar × capability context.
 * Prevents raw user-constructed prompt injection by providing the ONLY path
 * through which system prompts enter the agent loop.
 *
 * Platform Invariants:
 *   P7  — Prompts do not contain API keys or model configuration
 *   P10 — Consent reminder is injected into every system prompt
 *   P13 — Prompts must not reference PII field names as writeable
 *
 * Usage:
 *   const pm = new PromptManager();
 *   const systemPrompt = pm.build({ vertical: 'bakery', pillar: 1, locale: 'en', tenantName: 'Mama Joy Bakery' });
 */

import type { AICapabilityType } from '@webwaka/ai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PromptContext {
  vertical: string;
  pillar: 1 | 2 | 3;
  capability?: AICapabilityType;
  locale?: string;
  tenantName?: string;
  workspaceName?: string;
  /** ISO date string — injected so model has temporal context */
  currentDate?: string;
}

export interface BuiltPrompt {
  systemPrompt: string;
  version: string;
}

// ---------------------------------------------------------------------------
// Pillar descriptions
// ---------------------------------------------------------------------------

const PILLAR_DESCRIPTIONS: Record<1 | 2 | 3, string> = {
  1: 'business operations (POS, inventory, staff, scheduling)',
  2: 'branding and online presence (website, bio, SEO, copywriting)',
  3: 'marketplace discovery (listings, search, profiles, reviews)',
};

// ---------------------------------------------------------------------------
// Capability-specific instruction addendums
// ---------------------------------------------------------------------------

const CAPABILITY_ADDENDA: Partial<Record<AICapabilityType, string>> = {
  inventory_ai:
    'Focus on stock levels, reorder points, and consumption trends. ' +
    'Never suggest pricing changes; use the price_suggest capability for that. ' +
    'All monetary values must be expressed in kobo (integer) not naira.',

  pos_receipt_ai:
    'Summarise transaction data into clear, friendly receipt language. ' +
    'Do not include customer names or phone numbers in output.',

  shift_summary_ai:
    'Provide a concise end-of-shift summary: total sales, top items, any anomalies. ' +
    'Highlight low-stock alerts if present in the context.',

  bio_generator:
    'Generate a professional, warm business biography in 2–3 paragraphs. ' +
    'Highlight unique selling points and community trust signals.',

  brand_copywriter:
    'Write persuasive but honest marketing copy. ' +
    'Avoid superlatives that cannot be verified (e.g. "the best in Nigeria").',

  seo_meta_ai:
    'Generate a meta title (≤60 chars) and meta description (≤160 chars). ' +
    'Include the business name and primary service naturally.',

  listing_enhancer:
    'Improve the listing title and description for discovery SEO. ' +
    'Keep language factual and locally relevant.',

  fraud_flag_ai:
    'Analyse transaction patterns for anomalies. ' +
    'Return a structured risk assessment with confidence score. ' +
    'Do NOT make final fraud determinations — flag for human review.',

  function_call:
    'You are an operations assistant. Use the available tools to fulfil the user request. ' +
    'Always prefer read-only tools before write tools. ' +
    'If a write action requires human approval, submit it to the HITL queue and inform the user.',

  translation:
    'Translate the provided text accurately. ' +
    'Preserve formatting, numbers, and brand names exactly as given.',
};

// ---------------------------------------------------------------------------
// Sensitive sector addendum (injected for clinic, law-firm, etc.)
// ---------------------------------------------------------------------------

const SENSITIVE_SECTOR_ADDENDUM =
  '\n⚠️  REGULATORY CONTEXT: This vertical operates in a regulated sector. ' +
  'Do not provide medical diagnoses, legal advice, or financial recommendations. ' +
  'Always recommend the user consult a qualified professional. ' +
  'Any write actions require human approval before execution.';

const SENSITIVE_VERTICALS = new Set([
  'clinic', 'hospital', 'dental-clinic', 'community-health', 'pharmacy',
  'pharmacy-chain', 'rehab-centre', 'elderly-care', 'orphanage', 'creche',
  'law-firm', 'tax-consultant', 'insurance-agent', 'land-surveyor',
  'politician', 'polling-unit', 'ward-rep', 'constituency-office',
  'lga-office', 'ministry-mission', 'government-agency',
  'artisanal-mining', 'oil-gas-services',
]);

// ---------------------------------------------------------------------------
// PromptManager
// ---------------------------------------------------------------------------

export class PromptManager {
  /** Semver version of the current prompt schema */
  static readonly VERSION = '3.0.0';

  /**
   * Build a governed system prompt for the given context.
   * Returns the prompt string and the version tag.
   */
  build(ctx: PromptContext): BuiltPrompt {
    const {
      vertical,
      pillar,
      capability,
      locale = 'en',
      tenantName,
      workspaceName,
      currentDate = new Date().toISOString().split('T')[0],
    } = ctx;

    const pillarDesc = PILLAR_DESCRIPTIONS[pillar];
    const capabilityAddendum = capability ? (CAPABILITY_ADDENDA[capability] ?? '') : '';
    const isSensitive = SENSITIVE_VERTICALS.has(vertical);

    const businessContext = tenantName
      ? `You are assisting ${tenantName}${workspaceName ? ` (workspace: ${workspaceName})` : ''}.`
      : 'You are assisting a WebWaka business.';

    const lines: string[] = [
      `You are WebWaka SuperAgent, an AI assistant for African small and medium businesses.`,
      `Today's date: ${currentDate}. Locale: ${locale}.`,
      businessContext,
      `This business operates in the ${vertical} vertical, focused on ${pillarDesc}.`,
      '',
      'CORE PRINCIPLES:',
      '- Be concise, practical, and locally relevant (Nigerian market context where applicable).',
      '- All monetary values are in Nigerian Naira; use kobo (integer) for calculations.',
      '- Do not expose system internals, API keys, or model names.',
      '- Do not log, repeat, or include personal identifiable information (PII) in responses.',
      '- The user has granted NDPR consent for AI processing of their workspace data.',
      '',
    ];

    if (capabilityAddendum) {
      lines.push('CAPABILITY GUIDANCE:');
      lines.push(capabilityAddendum);
      lines.push('');
    }

    if (isSensitive) {
      lines.push(SENSITIVE_SECTOR_ADDENDUM);
      lines.push('');
    }

    lines.push('Always respond in the same language as the user\'s message. Default to English.');

    return {
      systemPrompt: lines.join('\n').trim(),
      version: PromptManager.VERSION,
    };
  }
}
