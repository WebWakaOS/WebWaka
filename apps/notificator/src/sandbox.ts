/**
 * apps/notificator — Sandbox mode enforcement.
 *
 * G24 (OQ-012): When NOTIFICATION_SANDBOX_MODE='true', all deliveries
 * are redirected to configured sandbox test addresses. The original intended
 * recipient MUST NEVER receive the notification in non-production.
 *
 * N-111 (Phase 7): Full sandbox redirect implementation with provider wiring.
 * This file provides the sandbox guard utility used by the consumer.
 */

import type { Env } from './env.js';

export interface SandboxConfig {
  enabled: boolean;
  email?: string;
  phone?: string;
  pushToken?: string;
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
 * assertion before every production deploy.
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
