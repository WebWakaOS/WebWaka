/**
 * @webwaka/notifications — Fallback channel chain (N-050, Phase 4).
 *
 * Implements provider-level fallback dispatch for a single channel type.
 * When the primary channel implementation fails (e.g. Meta WhatsApp not approved,
 * or network error), the dispatcher tries the next candidate in the ordered list.
 *
 * Key use cases:
 *   1. WhatsApp (meta_approved gate fails) → SMS fallback (G17)
 *   2. SMS primary provider fails → SMS secondary provider (Africa's Talking)
 *   3. Email tenant domain not verified → platform Resend (G3/OQ-004)
 *      (email fallback handled inside ResendEmailChannel itself via senderFallbackUsed)
 *
 * Design:
 *   dispatchWithFallback() accepts an ordered list of INotificationChannel candidates
 *   and a DispatchContext. It tries each in order, returning the first success.
 *   If all fail, it returns the last failure result.
 *
 *   Each attempt is logged with attempt number, channel name, and provider name.
 *   The delivery status update is handled by the caller (NotificationService/consumer)
 *   using the final result — fallback-chain is not responsible for D1 updates.
 *
 * Guardrails enforced:
 *   G10 — all failures logged; never silent discard
 *   G13 — channel abstraction: fallback logic has no provider-specific code
 */

import type { INotificationChannel, DispatchContext, DispatchResult } from './types.js';

// ---------------------------------------------------------------------------
// FallbackAttempt — result of each attempt in the chain
// ---------------------------------------------------------------------------

export interface FallbackAttempt {
  /** Attempt number (1-indexed). */
  attempt: number;
  /** Channel type tried (e.g. 'whatsapp', 'sms'). */
  channel: string;
  /** Provider name (e.g. 'meta_whatsapp', 'termii'). */
  provider: string;
  /** Result of this dispatch attempt. */
  result: DispatchResult;
}

// ---------------------------------------------------------------------------
// FallbackChainResult — outcome of the entire chain
// ---------------------------------------------------------------------------

export interface FallbackChainResult {
  /** Final dispatch result (success OR last failure). */
  result: DispatchResult;
  /** Which attempt succeeded (null if all failed). */
  succeededAt: FallbackAttempt | null;
  /** All attempts made (for audit/logging). */
  attempts: FallbackAttempt[];
  /** True if fallback was used (i.e. primary failed and a secondary succeeded). */
  fallbackUsed: boolean;
}

// ---------------------------------------------------------------------------
// dispatchWithFallback
// ---------------------------------------------------------------------------

/**
 * Dispatch to the first channel in `candidates` that succeeds.
 *
 * @param candidates - Ordered list of channel implementations to try.
 *   The first candidate is the primary; subsequent ones are fallbacks.
 *   Candidates may have different channel types (e.g. ['whatsapp', 'sms'])
 *   or the same type with different providers (e.g. two 'sms' providers).
 *
 * @param ctx - The dispatch context. Passed unmodified to each candidate.
 *   Note: ctx.channel reflects the original channel intent; individual
 *   INotificationChannel.channel may differ (e.g. fallback from whatsapp to sms).
 *
 * @returns FallbackChainResult with the winning result and all attempt logs.
 *
 * @example
 * // WhatsApp with SMS fallback (G17)
 * const result = await dispatchWithFallback(
 *   [metaWhatsAppChannel, termiiSmsChannel],
 *   ctx,
 * );
 *
 * @example
 * // SMS with secondary provider fallback
 * const result = await dispatchWithFallback(
 *   [termiiSmsChannel, africastalkingChannel],
 *   ctx,
 * );
 */
export async function dispatchWithFallback(
  candidates: INotificationChannel[],
  ctx: DispatchContext,
): Promise<FallbackChainResult> {
  if (candidates.length === 0) {
    const emptyResult: DispatchResult = {
      success: false,
      lastError: 'No channel candidates provided to dispatchWithFallback()',
    };
    return {
      result: emptyResult,
      succeededAt: null,
      attempts: [],
      fallbackUsed: false,
    };
  }

  const attempts: FallbackAttempt[] = [];
  let lastResult: DispatchResult = { success: false, lastError: 'No attempts made' };

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]!;
    let result: DispatchResult;

    try {
      result = await candidate.dispatch(ctx);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result = {
        success: false,
        lastError: `dispatch threw: ${msg}`,
      };
    }

    const attempt: FallbackAttempt = {
      attempt: i + 1,
      channel: candidate.channel,
      provider: candidate.providerName,
      result,
    };
    attempts.push(attempt);
    lastResult = result;

    if (result.success) {
      const fallbackUsed = i > 0;
      if (fallbackUsed) {
        console.log(
          `[fallback-chain] fallback succeeded — ` +
          `attempt=${i + 1} channel=${candidate.channel} provider=${candidate.providerName} ` +
          `deliveryId=${ctx.deliveryId} tenant=${ctx.tenantId}`,
        );
      }
      return {
        result,
        succeededAt: attempt,
        attempts,
        fallbackUsed,
      };
    }

    // G10: log every failure; never silently discard
    console.warn(
      `[fallback-chain] attempt ${i + 1}/${candidates.length} failed — ` +
      `channel=${candidate.channel} provider=${candidate.providerName} ` +
      `deliveryId=${ctx.deliveryId} tenant=${ctx.tenantId} ` +
      `error=${result.lastError?.slice(0, 200) ?? 'unknown'}` +
      (i + 1 < candidates.length ? ' — trying fallback' : ' — all candidates exhausted'),
    );
  }

  // All candidates failed
  return {
    result: lastResult,
    succeededAt: null,
    attempts,
    fallbackUsed: false,
  };
}

// ---------------------------------------------------------------------------
// buildFallbackCandidates
// ---------------------------------------------------------------------------

/**
 * Filter and order a set of channel implementations to build a fallback list
 * for a given channel type (and optional fallback channel type).
 *
 * Common use: buildFallbackCandidates(channels, 'whatsapp', 'sms')
 * → returns [whatsappChannel, smsChannel] for G17 fallback pattern.
 *
 * @param allChannels   - All wired channel implementations
 * @param primaryType   - The channel type to try first
 * @param fallbackType  - Optional fallback channel type (e.g. 'sms' for WhatsApp fallback)
 */
export function buildFallbackCandidates(
  allChannels: INotificationChannel[],
  primaryType: string,
  fallbackType?: string,
): INotificationChannel[] {
  const primary = allChannels.filter((c) => c.channel === primaryType);
  if (!fallbackType) {
    return primary;
  }
  const fallback = allChannels.filter((c) => c.channel === fallbackType);
  return [...primary, ...fallback];
}
