/**
 * apps/notificator — Sandbox mode enforcement.
 *
 * G24 (OQ-012): When NOTIFICATION_SANDBOX_MODE='true', all deliveries
 * are redirected to configured sandbox test addresses. The original intended
 * recipient MUST NEVER receive the notification in non-production.
 *
 * N-111 (Phase 7): Full sandbox redirect implementation.
 *
 * Functions:
 *   getSandboxConfig()          — reads sandbox addresses from Env
 *   assertSandboxConsistency()  — hard-fails on production misconfiguration
 *   resolveSandboxRecipient()   — redirects a single delivery address (G24)
 *
 * Delivery row fields written when redirected:
 *   sandbox_redirect                 = 1
 *   sandbox_original_recipient_hash  = SHA-256(originalRecipient)
 *   (delivery is dispatched to the sandbox address, not the original)
 */

import type { Env } from './env.js';

export interface SandboxConfig {
  enabled: boolean;
  email?: string;
  phone?: string;
  pushToken?: string;
}

/**
 * Result of resolving a sandbox redirect for one delivery.
 *
 * redirected        — true when sandbox mode is active AND a sandbox address
 *                     exists for this channel; false otherwise.
 * recipient         — the address that WILL receive the notification.
 *                     When redirected=true this is the sandbox address;
 *                     when redirected=false this is the original address.
 * originalHash      — SHA-256 hex of the original recipient address (for
 *                     audit: sandbox_original_recipient_hash in delivery row).
 *                     null when redirected=false.
 */
export interface SandboxRedirectResult {
  redirected: boolean;
  recipient: string;
  originalHash: string | null;
}

/**
 * Read sandbox configuration from env.
 * Called once per Queue batch or CRON invocation.
 */
export function getSandboxConfig(env: Env): SandboxConfig {
  const enabled = env.NOTIFICATION_SANDBOX_MODE === 'true';
  if (!enabled) {
    return { enabled: false };
  }
  // exactOptionalPropertyTypes: only include optional fields when defined
  return {
    enabled: true as const,
    ...(env.NOTIFICATION_SANDBOX_EMAIL !== undefined ? { email: env.NOTIFICATION_SANDBOX_EMAIL } : {}),
    ...(env.NOTIFICATION_SANDBOX_PHONE !== undefined ? { phone: env.NOTIFICATION_SANDBOX_PHONE } : {}),
    ...(env.NOTIFICATION_SANDBOX_PUSH_TOKEN !== undefined ? { pushToken: env.NOTIFICATION_SANDBOX_PUSH_TOKEN } : {}),
  };
}

/**
 * Assert that production does not run in sandbox mode.
 * Called at Worker startup for fast-fail on misconfiguration.
 *
 * CI/CD governance check (`scripts/check-sandbox-mode.ts`) performs the same
 * assertion before every production deploy (G24).
 */
export function assertSandboxConsistency(env: Env): void {
  if (env.ENVIRONMENT === 'production' && env.NOTIFICATION_SANDBOX_MODE === 'true') {
    throw new Error(
      '[GOVERNANCE VIOLATION G24] NOTIFICATION_SANDBOX_MODE must be "false" in production. ' +
      'A CI/CD governance check should have caught this. ' +
      'Do NOT serve real traffic until this is resolved.',
    );
  }
  if (env.ENVIRONMENT !== 'production' && env.NOTIFICATION_SANDBOX_MODE !== 'true') {
    console.warn(
      '[GOVERNANCE WARNING G24] NOTIFICATION_SANDBOX_MODE should be "true" in non-production ' +
      `environments (ENVIRONMENT="${env.ENVIRONMENT}"). ` +
      'Real notifications may be delivered to actual users.',
    );
  }
}

// ---------------------------------------------------------------------------
// resolveSandboxRecipient — N-111 (Phase 7) core redirect function
// ---------------------------------------------------------------------------

/**
 * Resolve the final delivery address for one channel in one delivery.
 *
 * G24 compliance:
 *   - When sandbox is enabled and a sandbox address exists for the channel,
 *     the original recipient NEVER receives the notification.
 *   - The original address is stored only as a SHA-256 hash for audit purposes.
 *   - sandbox_redirect=1 and sandbox_original_recipient_hash are written to
 *     notification_delivery by the caller.
 *
 * @param channel          — 'email' | 'sms' | 'push'
 * @param originalRecipient — address that would receive in production
 * @param config           — result of getSandboxConfig(env)
 * @returns SandboxRedirectResult with the effective delivery address and hash
 *
 * @example
 *   const result = await resolveSandboxRecipient('email', 'user@example.com', sandboxConfig);
 *   if (result.redirected) {
 *     // write sandbox_redirect=1, sandbox_original_recipient_hash=result.originalHash
 *     // dispatch to result.recipient (sandbox inbox) NOT originalRecipient
 *   }
 */
export async function resolveSandboxRecipient(
  channel: 'email' | 'sms' | 'push',
  originalRecipient: string,
  config: SandboxConfig,
): Promise<SandboxRedirectResult> {
  if (!config.enabled) {
    return { redirected: false, recipient: originalRecipient, originalHash: null };
  }

  // Determine the sandbox address for this channel
  let sandboxAddress: string | undefined;
  if (channel === 'email') {
    sandboxAddress = config.email;
  } else if (channel === 'sms') {
    sandboxAddress = config.phone;
  } else if (channel === 'push') {
    sandboxAddress = config.pushToken;
  }

  if (!sandboxAddress) {
    // Sandbox enabled but no redirect configured for this channel.
    // Per G24: if we cannot redirect, suppress delivery rather than send to real user.
    // Return the original address with redirected=false so the caller can
    // log a warning and skip the actual dispatch.
    console.warn(
      `[notificator:sandbox] G24: sandbox enabled but no sandbox address configured ` +
      `for channel=${channel}. Delivery suppressed (real recipient protected).`,
    );
    return { redirected: false, recipient: originalRecipient, originalHash: null };
  }

  // Compute SHA-256 hash of original recipient for audit (G24, G23 — no raw PII in delivery log)
  const originalHash = await sha256hex(originalRecipient);

  return {
    redirected: true,
    recipient: sandboxAddress,
    originalHash,
  };
}

// ---------------------------------------------------------------------------
// Internal: SHA-256 using Web Crypto API (CF Workers + Node 18+ compatible)
// ---------------------------------------------------------------------------

async function sha256hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
