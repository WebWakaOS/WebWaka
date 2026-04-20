/**
 * N-117: Attribution enforcement tests.
 *
 * Verifies that resolveEffectiveAttribution():
 *   - Forces attribution on for free, starter, growth, business plans (regardless of DB flag)
 *   - Respects the DB flag for enterprise plan only
 *   - Defaults to requiring attribution for unknown/null plan tiers
 *
 * And that isAttributionSuppressible():
 *   - Returns true only for 'enterprise'
 *   - Returns false for all other tiers and null/undefined
 *
 * Guardrails:
 *   white-label-policy.md Rule 5: "WebWaka attribution rules are defined per plan tier
 *     and may not be removed below the minimum required attribution level."
 */

import { describe, it, expect } from 'vitest';
import { resolveEffectiveAttribution, isAttributionSuppressible } from './attribution.js';

// ---------------------------------------------------------------------------
// resolveEffectiveAttribution
// ---------------------------------------------------------------------------

describe('resolveEffectiveAttribution — N-117 plan-tier enforcement', () => {
  // --- free tier ---
  it('free tier: always requires attribution even when DB flag is false', () => {
    expect(resolveEffectiveAttribution('free', false)).toBe(true);
  });

  it('free tier: requires attribution when DB flag is true', () => {
    expect(resolveEffectiveAttribution('free', true)).toBe(true);
  });

  // --- starter tier ---
  it('starter tier: always requires attribution even when DB flag is false', () => {
    expect(resolveEffectiveAttribution('starter', false)).toBe(true);
  });

  it('starter tier: requires attribution when DB flag is true', () => {
    expect(resolveEffectiveAttribution('starter', true)).toBe(true);
  });

  // --- growth tier ---
  it('growth tier: always requires attribution even when DB flag is false', () => {
    expect(resolveEffectiveAttribution('growth', false)).toBe(true);
  });

  it('growth tier: requires attribution when DB flag is true', () => {
    expect(resolveEffectiveAttribution('growth', true)).toBe(true);
  });

  // --- business tier ---
  it('business tier: always requires attribution even when DB flag is false', () => {
    expect(resolveEffectiveAttribution('business', false)).toBe(true);
  });

  it('business tier: requires attribution when DB flag is true', () => {
    expect(resolveEffectiveAttribution('business', true)).toBe(true);
  });

  // --- enterprise tier ---
  it('enterprise tier: respects DB flag false (attribution may be suppressed)', () => {
    expect(resolveEffectiveAttribution('enterprise', false)).toBe(false);
  });

  it('enterprise tier: respects DB flag true (shows attribution)', () => {
    expect(resolveEffectiveAttribution('enterprise', true)).toBe(true);
  });

  // --- edge cases ---
  it('null planTier defaults to requiring attribution (safe fallback)', () => {
    expect(resolveEffectiveAttribution(null, false)).toBe(true);
  });

  it('undefined planTier defaults to requiring attribution (safe fallback)', () => {
    expect(resolveEffectiveAttribution(undefined, false)).toBe(true);
  });

  it('empty string planTier defaults to requiring attribution', () => {
    expect(resolveEffectiveAttribution('', false)).toBe(true);
  });

  it('unknown planTier defaults to requiring attribution', () => {
    expect(resolveEffectiveAttribution('premium_gold', false)).toBe(true);
  });

  it('case matters: ENTERPRISE does not suppress attribution (exact string match)', () => {
    expect(resolveEffectiveAttribution('ENTERPRISE', false)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isAttributionSuppressible
// ---------------------------------------------------------------------------

describe('isAttributionSuppressible — entitlement check', () => {
  it('returns true only for enterprise tier', () => {
    expect(isAttributionSuppressible('enterprise')).toBe(true);
  });

  it('returns false for free tier', () => {
    expect(isAttributionSuppressible('free')).toBe(false);
  });

  it('returns false for starter tier', () => {
    expect(isAttributionSuppressible('starter')).toBe(false);
  });

  it('returns false for growth tier', () => {
    expect(isAttributionSuppressible('growth')).toBe(false);
  });

  it('returns false for business tier', () => {
    expect(isAttributionSuppressible('business')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isAttributionSuppressible(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isAttributionSuppressible(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isAttributionSuppressible('')).toBe(false);
  });

  it('returns false for unknown plan string', () => {
    expect(isAttributionSuppressible('turbo')).toBe(false);
  });
});
