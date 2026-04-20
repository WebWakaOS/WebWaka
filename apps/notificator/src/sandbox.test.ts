/**
 * N-111 (Phase 7) — Sandbox mode enforcement tests.
 *
 * Tests getSandboxConfig(), assertSandboxConsistency(), and
 * resolveSandboxRecipient() across all channels and edge cases.
 *
 * G24 (OQ-012): Sandbox mode must redirect ALL deliveries to test addresses
 * in non-production. Real recipients must never receive notifications from
 * non-production environments.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  getSandboxConfig,
  assertSandboxConsistency,
  resolveSandboxRecipient,
  type SandboxConfig,
} from './sandbox.js';
import type { Env } from './env.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEnv(overrides: Partial<Record<string, string>> = {}): Env {
  return {
    ENVIRONMENT: 'staging',
    NOTIFICATION_SANDBOX_MODE: 'true',
    NOTIFICATION_PIPELINE_ENABLED: '1',
    INTER_SERVICE_SECRET: 'test-secret',
    ...overrides,
  } as unknown as Env;
}

// ---------------------------------------------------------------------------
// getSandboxConfig
// ---------------------------------------------------------------------------

describe('getSandboxConfig', () => {
  it('returns enabled=false when NOTIFICATION_SANDBOX_MODE is not "true"', () => {
    const env = makeEnv({ NOTIFICATION_SANDBOX_MODE: 'false' });
    const config = getSandboxConfig(env);
    expect(config.enabled).toBe(false);
    expect(config.email).toBeUndefined();
    expect(config.phone).toBeUndefined();
    expect(config.pushToken).toBeUndefined();
  });

  it('returns enabled=true with all addresses when all sandbox secrets are set', () => {
    const env = makeEnv({
      NOTIFICATION_SANDBOX_MODE: 'true',
      NOTIFICATION_SANDBOX_EMAIL: 'sandbox@example.com',
      NOTIFICATION_SANDBOX_PHONE: '+2348000000000',
      NOTIFICATION_SANDBOX_PUSH_TOKEN: 'fcm-test-token-abc',
    });
    const config = getSandboxConfig(env);
    expect(config.enabled).toBe(true);
    expect(config.email).toBe('sandbox@example.com');
    expect(config.phone).toBe('+2348000000000');
    expect(config.pushToken).toBe('fcm-test-token-abc');
  });

  it('returns enabled=true with only email when only email is set', () => {
    const env = makeEnv({
      NOTIFICATION_SANDBOX_MODE: 'true',
      NOTIFICATION_SANDBOX_EMAIL: 'sandbox@example.com',
    });
    const config = getSandboxConfig(env);
    expect(config.enabled).toBe(true);
    expect(config.email).toBe('sandbox@example.com');
    expect(config.phone).toBeUndefined();
    expect(config.pushToken).toBeUndefined();
  });

  it('returns enabled=true with no addresses when none are configured', () => {
    const env = makeEnv({ NOTIFICATION_SANDBOX_MODE: 'true' });
    const config = getSandboxConfig(env);
    expect(config.enabled).toBe(true);
    expect(config.email).toBeUndefined();
    expect(config.phone).toBeUndefined();
    expect(config.pushToken).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// assertSandboxConsistency
// ---------------------------------------------------------------------------

describe('assertSandboxConsistency', () => {
  it('throws GOVERNANCE VIOLATION when production runs with sandbox=true', () => {
    const env = makeEnv({
      ENVIRONMENT: 'production',
      NOTIFICATION_SANDBOX_MODE: 'true',
    });
    expect(() => assertSandboxConsistency(env)).toThrow(
      '[GOVERNANCE VIOLATION G24]',
    );
  });

  it('does not throw when production has sandbox=false', () => {
    const env = makeEnv({
      ENVIRONMENT: 'production',
      NOTIFICATION_SANDBOX_MODE: 'false',
    });
    expect(() => assertSandboxConsistency(env)).not.toThrow();
  });

  it('does not throw when staging has sandbox=true', () => {
    const env = makeEnv({
      ENVIRONMENT: 'staging',
      NOTIFICATION_SANDBOX_MODE: 'true',
    });
    expect(() => assertSandboxConsistency(env)).not.toThrow();
  });

  it('emits console.warn when non-production runs with sandbox=false', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const env = makeEnv({
      ENVIRONMENT: 'staging',
      NOTIFICATION_SANDBOX_MODE: 'false',
    });
    assertSandboxConsistency(env);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[GOVERNANCE WARNING G24]'));
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// resolveSandboxRecipient — core G24 redirect logic (N-111)
// ---------------------------------------------------------------------------

describe('resolveSandboxRecipient', () => {
  const disabledConfig: SandboxConfig = { enabled: false };

  const fullConfig: SandboxConfig = {
    enabled: true,
    email: 'sandbox@webwaka.test',
    phone: '+2348099999999',
    pushToken: 'test-push-token-xyz',
  };

  const emailOnlyConfig: SandboxConfig = {
    enabled: true,
    email: 'sandbox@webwaka.test',
  };

  // --- sandbox disabled ---

  it('returns original recipient unchanged when sandbox is disabled', async () => {
    const result = await resolveSandboxRecipient('email', 'real@user.com', disabledConfig);
    expect(result.redirected).toBe(false);
    expect(result.recipient).toBe('real@user.com');
    expect(result.originalHash).toBeNull();
  });

  it('returns redirected=false for sms when sandbox is disabled', async () => {
    const result = await resolveSandboxRecipient('sms', '+2348012345678', disabledConfig);
    expect(result.redirected).toBe(false);
    expect(result.recipient).toBe('+2348012345678');
    expect(result.originalHash).toBeNull();
  });

  it('returns redirected=false for push when sandbox is disabled', async () => {
    const result = await resolveSandboxRecipient('push', 'fcm-token-real', disabledConfig);
    expect(result.redirected).toBe(false);
    expect(result.recipient).toBe('fcm-token-real');
    expect(result.originalHash).toBeNull();
  });

  // --- sandbox enabled, all channels configured ---

  it('redirects email to sandbox email when enabled', async () => {
    const result = await resolveSandboxRecipient('email', 'real@user.com', fullConfig);
    expect(result.redirected).toBe(true);
    expect(result.recipient).toBe('sandbox@webwaka.test');
    expect(result.originalHash).not.toBeNull();
    // SHA-256 is 64 hex chars
    expect(result.originalHash).toHaveLength(64);
    expect(result.originalHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('redirects sms to sandbox phone when enabled', async () => {
    const result = await resolveSandboxRecipient('sms', '+2348012345678', fullConfig);
    expect(result.redirected).toBe(true);
    expect(result.recipient).toBe('+2348099999999');
    expect(result.originalHash).not.toBeNull();
    expect(result.originalHash).toHaveLength(64);
  });

  it('redirects push to sandbox pushToken when enabled', async () => {
    const result = await resolveSandboxRecipient('push', 'real-fcm-token', fullConfig);
    expect(result.redirected).toBe(true);
    expect(result.recipient).toBe('test-push-token-xyz');
    expect(result.originalHash).not.toBeNull();
    expect(result.originalHash).toHaveLength(64);
  });

  // --- deterministic hash ---

  it('produces the same hash for the same original recipient', async () => {
    const r1 = await resolveSandboxRecipient('email', 'user@example.com', fullConfig);
    const r2 = await resolveSandboxRecipient('email', 'user@example.com', fullConfig);
    expect(r1.originalHash).toBe(r2.originalHash);
  });

  it('produces different hashes for different original recipients', async () => {
    const r1 = await resolveSandboxRecipient('email', 'alice@example.com', fullConfig);
    const r2 = await resolveSandboxRecipient('email', 'bob@example.com', fullConfig);
    expect(r1.originalHash).not.toBe(r2.originalHash);
  });

  // --- sandbox enabled, channel address missing (suppress not expose) ---

  it('returns redirected=false and suppresses sms when sandbox phone not configured', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await resolveSandboxRecipient('sms', '+2348012345678', emailOnlyConfig);
    expect(result.redirected).toBe(false);
    // The caller still sees the original recipient — it is the caller's
    // responsibility to NOT dispatch when redirected=false in sandbox mode.
    expect(result.recipient).toBe('+2348012345678');
    expect(result.originalHash).toBeNull();
    // Must log a warning so ops can spot the misconfiguration
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('no sandbox address configured'));
    warnSpy.mockRestore();
  });

  it('returns redirected=false and suppresses push when sandbox pushToken not configured', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await resolveSandboxRecipient('push', 'real-token', emailOnlyConfig);
    expect(result.redirected).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('no sandbox address configured'));
    warnSpy.mockRestore();
  });

  // --- G24: original hash protects real PII ---

  it('originalHash is not the same as the original recipient (confirms hashing)', async () => {
    const original = 'real@user.com';
    const result = await resolveSandboxRecipient('email', original, fullConfig);
    expect(result.originalHash).not.toBe(original);
  });
});
