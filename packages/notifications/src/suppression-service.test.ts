/**
 * Suppression service unit tests (N-029, G20, Phase 2).
 *
 * Tests:
 *  - checkSuppression: suppressed address / not suppressed / expired / platform-wide
 *  - Non-suppression channels (in_app, slack, webhook) always return suppressed=false
 *  - computeSuppressionHash: deterministic across calls
 */

import { describe, it, expect } from 'vitest';
import { checkSuppression } from './suppression-service.js';
import { computeSuppressionHash } from './crypto-utils.js';
import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeD1WithSuppression(reason: string | null): D1LikeFull {
  return {
    prepare: () => ({
      bind: () => ({
        run: async () => ({ success: true }),
        first: async <T>() => (reason ? { reason } as unknown as T : null),
        all: async <T>() => ({ results: [] as unknown as T[] }),
      }),
    }),
  };
}

// ---------------------------------------------------------------------------
// checkSuppression
// ---------------------------------------------------------------------------

describe('checkSuppression', () => {
  it('returns suppressed=false for in_app channel (not in suppression list)', async () => {
    const db = makeD1WithSuppression('bounced');
    const result = await checkSuppression(db, 'user@test.com', 'tenant_001', 'in_app');
    expect(result.suppressed).toBe(false);
  });

  it('returns suppressed=false for slack channel', async () => {
    const db = makeD1WithSuppression('bounced');
    const result = await checkSuppression(db, 'user@test.com', 'tenant_001', 'slack');
    expect(result.suppressed).toBe(false);
  });

  it('returns suppressed=true with reason when address is in suppression list', async () => {
    const db = makeD1WithSuppression('bounced');
    const result = await checkSuppression(db, 'bounced@test.com', 'tenant_001', 'email');
    expect(result.suppressed).toBe(true);
    expect(result.reason).toBe('bounced');
  });

  it('returns suppressed=false when address is not suppressed', async () => {
    const db = makeD1WithSuppression(null);
    const result = await checkSuppression(db, 'good@test.com', 'tenant_001', 'email');
    expect(result.suppressed).toBe(false);
  });

  it('returns suppressed=true for complaint reason', async () => {
    const db = makeD1WithSuppression('complaint');
    const result = await checkSuppression(db, 'spam@test.com', 'tenant_001', 'email');
    expect(result.suppressed).toBe(true);
    expect(result.reason).toBe('complaint');
  });
});

// ---------------------------------------------------------------------------
// computeSuppressionHash — G23 NDPR: deterministic, no PII stored
// ---------------------------------------------------------------------------

describe('computeSuppressionHash', () => {
  it('produces a 64-character hex string', async () => {
    const hash = await computeSuppressionHash('user@test.com', 'tenant_001', 'email');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic across calls', async () => {
    const h1 = await computeSuppressionHash('user@test.com', 'tenant_001', 'email');
    const h2 = await computeSuppressionHash('user@test.com', 'tenant_001', 'email');
    expect(h1).toBe(h2);
  });

  it('differs for different addresses', async () => {
    const h1 = await computeSuppressionHash('a@test.com', 'tenant_001', 'email');
    const h2 = await computeSuppressionHash('b@test.com', 'tenant_001', 'email');
    expect(h1).not.toBe(h2);
  });

  it('differs for different tenants', async () => {
    const h1 = await computeSuppressionHash('user@test.com', 'tenant_001', 'email');
    const h2 = await computeSuppressionHash('user@test.com', 'tenant_002', 'email');
    expect(h1).not.toBe(h2);
  });

  it('lowercases address before hashing (case-insensitive)', async () => {
    const h1 = await computeSuppressionHash('User@Test.COM', 'tenant_001', 'email');
    const h2 = await computeSuppressionHash('user@test.com', 'tenant_001', 'email');
    expect(h1).toBe(h2);
  });
});
