/**
 * Credit burn engine — AI spend accounting.
 * (SA-1.7 — TDR-0009, Platform Invariant P9)
 *
 * Determines WakaCU cost for an AI usage event and charges the correct
 * source in priority order:
 *
 *   1. Partner credit pool  (if beneficiary tenant has a funded pool)
 *   2. Own WakaCU wallet    (tenant's own balance)
 *   3. BYOK usage           (no WakaCU charged — tenant uses own key)
 *
 * P9: All amounts are integers. Never use floats for credit balances.
 * T3: All charges are scoped to tenantId.
 */

import type { ResolvedAdapter } from '@webwaka/ai';
import type { WalletService } from './wallet-service.js';
import type { PartnerPoolService } from './partner-pool-service.js';

export interface CreditBurnInput {
  tenantId: string;
  resolved: ResolvedAdapter;
  tokensUsed: number;       // integer total tokens (input + output)
  usageEventId: string;     // reference for the wc_transactions ledger
}

export interface CreditBurnResult {
  /** Total WakaCU charged (0 if BYOK or partner pool covered) */
  wakaCuCharged: number;
  /** Where the cost was sourced from */
  chargeSource: 'partner_pool' | 'own_wallet' | 'byok' | 'none';
  balanceAfter: number;
}

export class CreditBurnEngine {
  private readonly walletService: WalletService;
  private readonly partnerPoolService: PartnerPoolService;

  constructor(deps: { walletService: WalletService; partnerPoolService: PartnerPoolService }) {
    this.walletService = deps.walletService;
    this.partnerPoolService = deps.partnerPoolService;
  }

  /**
   * Calculate and charge WakaCU for a completed AI call.
   *
   * Call this AFTER the AI adapter returns a response, never before.
   * Idempotency: callers must pass a stable usageEventId to prevent
   * double-charging if the Worker retries.
   */
  async burn(input: CreditBurnInput): Promise<CreditBurnResult> {
    const { tenantId, resolved, tokensUsed, usageEventId } = input;

    // BYOK levels 1 + 2 — no WakaCU charged (tenant uses their own API key)
    if (resolved.level === 1 || resolved.level === 2) {
      return {
        wakaCuCharged: 0,
        chargeSource: 'byok',
        balanceAfter: 0,
      };
    }

    // Calculate cost (P9 — integer ceiling)
    const wakaCuCharged = Math.max(
      1,
      Math.ceil((tokensUsed / 1000) * resolved.wakaCuPer1kTokens),
    );

    const description = `AI usage: ${usageEventId}`;

    // Priority 1: Try partner credit pool
    const poolConsumed = await this.partnerPoolService.consume(tenantId, wakaCuCharged);
    if (poolConsumed) {
      const wallet = await this.walletService.getWallet(tenantId);
      return {
        wakaCuCharged,
        chargeSource: 'partner_pool',
        balanceAfter: wallet?.balanceWakaCu ?? 0,
      };
    }

    // Priority 2: Own wallet debit
    const debitResult = await this.walletService.debit(
      tenantId,
      wakaCuCharged,
      description,
      usageEventId,
    );

    if (!debitResult.success) {
      // Insufficient balance — log but do not block the response (post-pay model)
      // Usage event is still recorded; collections are handled out-of-band.
      return {
        wakaCuCharged: 0,
        chargeSource: 'none',
        balanceAfter: debitResult.balanceAfter,
      };
    }

    return {
      wakaCuCharged,
      chargeSource: 'own_wallet',
      balanceAfter: debitResult.balanceAfter,
    };
  }
}
