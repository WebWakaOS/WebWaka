/**
 * ResourceHints — Wave 3 C3-4
 * [@webwaka/design-system] [Infra/Pillar 1]
 *
 * Emits <link rel="preconnect"> and <link rel="dns-prefetch"> tags for:
 *   - AI provider HTTP origins (OpenAI, Anthropic, OpenRouter, Google AI)
 *   - Cloudflare KV / Workers origin
 *   - WebWaka API staging + production origins
 *
 * Motivation:
 *   AI chat pages and vertical advisor pages issue requests to these origins
 *   immediately on mount. Pre-connecting eliminates the TLS + DNS overhead
 *   from the critical path, reducing Time-to-First-Byte for AI responses
 *   by ~100–300ms on mobile (platform invariant P4: mobile-first).
 *
 * Usage (add once, near the root of each app):
 *   import { ResourceHints } from '@webwaka/design-system/components/ResourceHints';
 *   // In <head> or top-level component:
 *   <ResourceHints />
 *
 * Props:
 *   includeAIProviders  — include AI provider origins (default: true)
 *   includeCloudflare   — include CF Workers/KV origin (default: true)
 *   extraOrigins        — additional origins to preconnect (for custom BYOK setups)
 */

import React from 'react';

export interface ResourceHintsProps {
  /** Emit preconnect hints for AI provider origins. Default: true */
  includeAIProviders?: boolean;
  /** Emit preconnect hint for Cloudflare Workers origin. Default: true */
  includeCloudflare?: boolean;
  /** Additional origins to preconnect (e.g. custom BYOK proxy) */
  extraOrigins?: string[];
}

/** AI provider HTTP origins used by @webwaka/ai-adapters */
export const AI_PROVIDER_ORIGINS: readonly string[] = [
  'https://api.openai.com',
  'https://api.anthropic.com',
  'https://openrouter.ai',
  'https://generativelanguage.googleapis.com',
  'https://api.groq.com',
];

/** Cloudflare Workers / KV origin */
export const CF_WORKERS_ORIGIN = 'https://workers.cloudflare.com';

/** WebWaka API origins */
export const WEBWAKA_API_ORIGINS: readonly string[] = [
  'https://api.webwaka.com',
  'https://api-staging.webwaka.com',
];

/**
 * Renders <link rel="preconnect"> and <link rel="dns-prefetch"> tags.
 * Designed to be rendered in the document <head> via a React portal
 * or directly at the root of a layout component.
 *
 * Both `preconnect` (full TLS handshake) and `dns-prefetch` (fallback for
 * browsers that don't support preconnect) are emitted for each origin.
 */
export function ResourceHints({
  includeAIProviders = true,
  includeCloudflare = true,
  extraOrigins = [],
}: ResourceHintsProps): React.ReactElement {
  const origins: string[] = [
    ...WEBWAKA_API_ORIGINS,
    ...(includeAIProviders ? AI_PROVIDER_ORIGINS : []),
    ...(includeCloudflare ? [CF_WORKERS_ORIGIN] : []),
    ...extraOrigins,
  ];

  // Deduplicate
  const unique = [...new Set(origins)];

  return (
    <>
      {unique.map(origin => (
        <React.Fragment key={origin}>
          <link rel="preconnect" href={origin} crossOrigin="anonymous" />
          <link rel="dns-prefetch" href={origin} />
        </React.Fragment>
      ))}
    </>
  );
}

export default ResourceHints;
