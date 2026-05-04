/**
 * Provider Service Factory — Runtime Registry Integration
 *
 * Resolves EmailService and SMS API keys from the provider registry at runtime.
 * Falls back to env-var based behaviour whenever:
 *   - ENCRYPTION_SECRET is absent (registry credentials cannot be decrypted)
 *   - Registry resolution throws / no active provider found
 *   - DB is unavailable
 *
 * Design principles:
 *   - NEVER throw — always return a usable service or key
 *   - KV cache used automatically (5 min TTL via resolveProvider)
 *   - Backward compatible: same behaviour as direct env-var usage when registry
 *     has no active override
 */

import { resolveProvider } from '@webwaka/provider-registry';
import type { ProviderResolutionContext } from '@webwaka/provider-registry';
import { EmailService } from './email-service.js';
import type { Env } from '../env.js';

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

/**
 * Registry-aware EmailService factory.
 *
 * Resolution order:
 *   1. provider_registry (DB) — tenant → partner → platform scope
 *   2. env-var fallback (RESEND_API_KEY)
 *
 * Notes:
 *   - 'cloudflare_email' provider → SEND_EMAIL binding (no credentials in DB)
 *   - 'resend' provider → api_key from DB credentials or RESEND_API_KEY env var
 *   - EmailProviderRouter always tries SEND_EMAIL binding first regardless of
 *     which Resend key source is used (CF Email has no stored credentials)
 */
export async function getEmailService(
  env: Env,
  context?: ProviderResolutionContext,
): Promise<EmailService> {
  if (env.ENCRYPTION_SECRET) {
    try {
      const resolved = await resolveProvider(
        env.DB as never,
        'email',
        context ?? {},
        env.ENCRYPTION_SECRET,
        {
          kv: env.KV,
          envFallback: { RESEND_API_KEY: env.RESEND_API_KEY },
        },
      );

      // Cloudflare Email: binding-only, no stored credentials
      if (resolved.provider_name === 'cloudflare_email') {
        return new EmailService(undefined, env.SEND_EMAIL);
      }

      // Resend (or other SMTP-like): use stored api_key, fall back to env var
      const apiKey =
        (resolved.credentials['api_key'] as string | undefined) ??
        env.RESEND_API_KEY;
      return new EmailService(apiKey, env.SEND_EMAIL);
    } catch {
      // Registry unavailable or misconfigured — safe fallback to env vars
    }
  }

  // Default path: env-var based (always works, no registry dependency)
  return new EmailService(env.RESEND_API_KEY, env.SEND_EMAIL);
}

// ---------------------------------------------------------------------------
// SMS
// ---------------------------------------------------------------------------

/**
 * Registry-aware SMS API key resolver.
 *
 * Resolution order:
 *   1. provider_registry (DB) — tenant → partner → platform scope
 *   2. env-var fallback (TERMII_API_KEY)
 *
 * Returns undefined if no SMS key is available in registry or env vars.
 */
export async function getSmsApiKey(
  env: Env,
  context?: ProviderResolutionContext,
): Promise<string | undefined> {
  if (env.ENCRYPTION_SECRET) {
    try {
      const resolved = await resolveProvider(
        env.DB as never,
        'sms',
        context ?? {},
        env.ENCRYPTION_SECRET,
        {
          kv: env.KV,
          envFallback: { TERMII_API_KEY: env.TERMII_API_KEY },
        },
      );
      return (
        (resolved.credentials['api_key'] as string | undefined) ??
        env.TERMII_API_KEY
      );
    } catch {
      // Registry unavailable — fall through to env var
    }
  }

  return env.TERMII_API_KEY;
}
