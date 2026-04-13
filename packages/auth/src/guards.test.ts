/**
 * Tests for P13 auth guard — requirePrimaryPhoneVerified.
 * (docs/governance/platform-invariants.md — P13: Primary Phone Mandatory)
 * (M7f: guards.ts added for P13 enforcement at the auth middleware layer)
 *
 * Minimum: 2 tests (QA brief §5.7)
 */

import { describe, it, expect, vi } from 'vitest';
import { requirePrimaryPhoneVerified, AuthGuardError } from './guards.js';

// ---------------------------------------------------------------------------
// Mock D1 helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function mockDbWithPhone(phoneRow: { id: string } | null) {
  return {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        first: vi.fn().mockResolvedValue(phoneRow),
      }),
    }),
  };
}

// ---------------------------------------------------------------------------
// P13 tests
// ---------------------------------------------------------------------------

describe('requirePrimaryPhoneVerified — P13', () => {
  it('P13: resolves when user has a verified primary SMS contact channel', async () => {
    const db = mockDbWithPhone({ id: 'ch_001' });
    await expect(
      requirePrimaryPhoneVerified(db, 'user_001', 'tenant_001'),
    ).resolves.toBeUndefined();
  });

  it('P13: throws AuthGuardError PRIMARY_PHONE_REQUIRED when no verified primary phone exists', async () => {
    const db = mockDbWithPhone(null);
    await expect(
      requirePrimaryPhoneVerified(db, 'user_001', 'tenant_001'),
    ).rejects.toThrow(AuthGuardError);
    await expect(
      requirePrimaryPhoneVerified(db, 'user_001', 'tenant_001'),
    ).rejects.toMatchObject({ code: 'PRIMARY_PHONE_REQUIRED' });
  });
});
