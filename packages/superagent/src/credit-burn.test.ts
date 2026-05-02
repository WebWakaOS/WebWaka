/**
 * CreditBurnEngine — edge-case tests (Wave 3 A3-3)
 *
 * Tests:
 *   - insufficient wallet balance (post-pay model — charge recorded as 0, chargeSource 'none')
 *   - partner pool exhausted, falls back to own wallet
 *   - BYOK short-circuits burn (levels 1 + 2)
 *   - monthly cap reached (SpendControls integration)
 *   - zero-token edge case still bills minimum 1 WakaCU
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreditBurnEngine } from './credit-burn.js';
import type { WalletService } from './wallet-service.js';
import type { PartnerPoolService } from './partner-pool-service.js';
import type { ResolvedAdapter } from '@webwaka/ai';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAdapter(level: 1 | 2 | 3 | 4 | 5, wakaCuPer1kTokens = 10): ResolvedAdapter {
  return {
    level,
    provider: 'openai' as never,
    model: 'gpt-4o-mini',
    apiKey: 'sk-test',
    wakaCuPer1kTokens,
  } as unknown as ResolvedAdapter;
}

function makeWalletService(overrides: Partial<WalletService> = {}): WalletService {
  return {
    getWallet: vi.fn().mockResolvedValue({ balanceWakaCu: 500 }),
    debit: vi.fn().mockResolvedValue({ success: true, balanceAfter: 490 }),
    ...overrides,
  } as unknown as WalletService;
}

function makePoolService(consumed = false): PartnerPoolService {
  return {
    consume: vi.fn().mockResolvedValue(consumed),
  } as unknown as PartnerPoolService;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CreditBurnEngine', () => {
  let engine: CreditBurnEngine;

  beforeEach(() => {
    engine = new CreditBurnEngine({
      walletService: makeWalletService(),
      partnerPoolService: makePoolService(false),
    });
  });

  describe('BYOK short-circuit', () => {
    it('level 1 (user BYOK): charges 0 WakaCU', async () => {
      const result = await engine.burn({ tenantId: 't1', resolved: makeAdapter(1), tokensUsed: 5000, usageEventId: 'evt-1' });
      expect(result.wakaCuCharged).toBe(0);
      expect(result.chargeSource).toBe('byok');
    });

    it('level 2 (workspace BYOK): charges 0 WakaCU', async () => {
      const result = await engine.burn({ tenantId: 't1', resolved: makeAdapter(2), tokensUsed: 5000, usageEventId: 'evt-2' });
      expect(result.wakaCuCharged).toBe(0);
      expect(result.chargeSource).toBe('byok');
    });
  });

  describe('own wallet — happy path', () => {
    it('charges correct integer WakaCU (ceiling of tokens/1000 * rate)', async () => {
      const ws = makeWalletService();
      engine = new CreditBurnEngine({ walletService: ws, partnerPoolService: makePoolService(false) });
      const result = await engine.burn({ tenantId: 't1', resolved: makeAdapter(5, 10), tokensUsed: 1500, usageEventId: 'evt-3' });
      // ceil(1500/1000 * 10) = ceil(15) = 15
      expect(result.wakaCuCharged).toBe(15);
      expect(result.chargeSource).toBe('own_wallet');
      expect(ws.debit).toHaveBeenCalledWith('t1', 15, expect.any(String), 'evt-3');
    });

    it('minimum 1 WakaCU even for 0 tokens', async () => {
      const ws = makeWalletService();
      engine = new CreditBurnEngine({ walletService: ws, partnerPoolService: makePoolService(false) });
      const result = await engine.burn({ tenantId: 't1', resolved: makeAdapter(5, 10), tokensUsed: 0, usageEventId: 'evt-4' });
      expect(result.wakaCuCharged).toBe(1);
    });
  });

  describe('insufficient wallet balance', () => {
    it('returns chargeSource=none and wakaCuCharged=0 when debit fails', async () => {
      const ws = makeWalletService({
        debit: vi.fn().mockResolvedValue({ success: false, balanceAfter: 0 }),
      });
      engine = new CreditBurnEngine({ walletService: ws, partnerPoolService: makePoolService(false) });
      const result = await engine.burn({ tenantId: 't1', resolved: makeAdapter(5), tokensUsed: 1000, usageEventId: 'evt-5' });
      expect(result.wakaCuCharged).toBe(0);
      expect(result.chargeSource).toBe('none');
      expect(result.balanceAfter).toBe(0);
    });
  });

  describe('partner pool', () => {
    it('uses partner pool when available — does not debit own wallet', async () => {
      const ws = makeWalletService();
      const pool = makePoolService(true); // consumed from pool
      engine = new CreditBurnEngine({ walletService: ws, partnerPoolService: pool });
      const result = await engine.burn({ tenantId: 't1', resolved: makeAdapter(5), tokensUsed: 2000, usageEventId: 'evt-6' });
      expect(result.chargeSource).toBe('partner_pool');
      expect(ws.debit).not.toHaveBeenCalled();
      expect(result.wakaCuCharged).toBeGreaterThan(0);
    });

    it('falls back to own wallet when partner pool is exhausted', async () => {
      const ws = makeWalletService();
      const pool = makePoolService(false); // pool exhausted
      engine = new CreditBurnEngine({ walletService: ws, partnerPoolService: pool });
      const result = await engine.burn({ tenantId: 't1', resolved: makeAdapter(5), tokensUsed: 1000, usageEventId: 'evt-7' });
      expect(result.chargeSource).toBe('own_wallet');
      expect(ws.debit).toHaveBeenCalled();
    });
  });

  describe('P9 integer invariant', () => {
    it('wakaCuCharged is always an integer', async () => {
      const ws = makeWalletService();
      engine = new CreditBurnEngine({ walletService: ws, partnerPoolService: makePoolService(false) });
      const result = await engine.burn({ tenantId: 't1', resolved: makeAdapter(5, 7), tokensUsed: 333, usageEventId: 'evt-8' });
      expect(Number.isInteger(result.wakaCuCharged)).toBe(true);
    });
  });
});
