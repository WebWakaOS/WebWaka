/**
 * fallback-chain.test.ts — N-050 (Phase 4)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  dispatchWithFallback,
  buildFallbackCandidates,
} from './fallback-chain.js';
import type { INotificationChannel, DispatchContext, DispatchResult } from './types.js';

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

function makeChannel(
  channel: string,
  providerName: string,
  result: DispatchResult,
  throws = false,
): INotificationChannel {
  return {
    channel: channel as INotificationChannel['channel'],
    providerName,
    dispatch: throws
      ? async () => { throw new Error(`${providerName} threw`); }
      : async () => result,
    isEntitled: () => true,
  };
}

function makeCtx(): DispatchContext {
  return {
    deliveryId: 'delivery_001',
    tenantId: 'tenant_abc',
    recipientId: 'user_001',
    recipientType: 'user',
    channel: 'whatsapp',
    template: {
      body: 'Hello',
      locale: 'en',
      templateId: 'test',
      templateVersion: 1,
    },
    idempotencyKey: 'idem-001',
    source: 'queue_consumer',
    severity: 'info',
    sandboxMode: false,
  };
}

// ---------------------------------------------------------------------------
// dispatchWithFallback tests
// ---------------------------------------------------------------------------

describe('dispatchWithFallback', () => {
  it('returns success immediately when first candidate succeeds', async () => {
    const primary = makeChannel('whatsapp', 'meta_whatsapp', { success: true, providerMessageId: 'wamid.001' });
    const fallback = makeChannel('sms', 'termii', { success: true, providerMessageId: 'sms.001' });

    const chainResult = await dispatchWithFallback([primary, fallback], makeCtx());

    expect(chainResult.result.success).toBe(true);
    expect(chainResult.result.providerMessageId).toBe('wamid.001');
    expect(chainResult.fallbackUsed).toBe(false);
    expect(chainResult.attempts).toHaveLength(1);
    expect(chainResult.succeededAt?.provider).toBe('meta_whatsapp');
  });

  it('falls back to second candidate when first fails', async () => {
    const primary = makeChannel('whatsapp', 'meta_whatsapp', { success: false, lastError: 'not_meta_approved' });
    const fallback = makeChannel('sms', 'termii', { success: true, providerMessageId: 'sms.001' });

    const chainResult = await dispatchWithFallback([primary, fallback], makeCtx());

    expect(chainResult.result.success).toBe(true);
    expect(chainResult.result.providerMessageId).toBe('sms.001');
    expect(chainResult.fallbackUsed).toBe(true);
    expect(chainResult.attempts).toHaveLength(2);
    expect(chainResult.succeededAt?.provider).toBe('termii');
    expect(chainResult.succeededAt?.attempt).toBe(2);
  });

  it('tries all candidates before giving up', async () => {
    const ch1 = makeChannel('whatsapp', 'meta_whatsapp', { success: false, lastError: 'error1' });
    const ch2 = makeChannel('sms', 'termii', { success: false, lastError: 'error2' });
    const ch3 = makeChannel('sms', 'africas_talking', { success: false, lastError: 'error3' });

    const chainResult = await dispatchWithFallback([ch1, ch2, ch3], makeCtx());

    expect(chainResult.result.success).toBe(false);
    expect(chainResult.result.lastError).toBe('error3');
    expect(chainResult.attempts).toHaveLength(3);
    expect(chainResult.succeededAt).toBeNull();
    expect(chainResult.fallbackUsed).toBe(false);
  });

  it('catches thrown errors from dispatch and continues to next candidate', async () => {
    const primary = makeChannel('whatsapp', 'meta_whatsapp', { success: false }, true /* throws */);
    const fallback = makeChannel('sms', 'termii', { success: true, providerMessageId: 'sms.123' });

    const chainResult = await dispatchWithFallback([primary, fallback], makeCtx());

    expect(chainResult.result.success).toBe(true);
    expect(chainResult.fallbackUsed).toBe(true);
    expect(chainResult.attempts[0]?.result.success).toBe(false);
    expect(chainResult.attempts[0]?.result.lastError).toContain('meta_whatsapp threw');
  });

  it('returns empty result when no candidates provided', async () => {
    const chainResult = await dispatchWithFallback([], makeCtx());

    expect(chainResult.result.success).toBe(false);
    expect(chainResult.result.lastError).toContain('No channel candidates');
    expect(chainResult.attempts).toHaveLength(0);
    expect(chainResult.fallbackUsed).toBe(false);
  });

  it('records attempt numbers correctly', async () => {
    const ch1 = makeChannel('email', 'resend_tenant', { success: false, lastError: 'e1' });
    const ch2 = makeChannel('email', 'resend_platform', { success: false, lastError: 'e2' });
    const ch3 = makeChannel('sms', 'termii', { success: true, providerMessageId: 'ok' });

    const chainResult = await dispatchWithFallback([ch1, ch2, ch3], makeCtx());

    expect(chainResult.attempts[0]?.attempt).toBe(1);
    expect(chainResult.attempts[1]?.attempt).toBe(2);
    expect(chainResult.attempts[2]?.attempt).toBe(3);
  });

  it('sets fallbackUsed=false when single candidate succeeds', async () => {
    const ch = makeChannel('email', 'resend', { success: true, providerMessageId: 'resend.001' });
    const chainResult = await dispatchWithFallback([ch], makeCtx());

    expect(chainResult.fallbackUsed).toBe(false);
  });

  it('records provider and channel in each attempt', async () => {
    const ch1 = makeChannel('whatsapp', 'meta_whatsapp', { success: false, lastError: 'err' });
    const ch2 = makeChannel('sms', 'termii', { success: true, providerMessageId: 'ok' });

    const chainResult = await dispatchWithFallback([ch1, ch2], makeCtx());

    expect(chainResult.attempts[0]?.channel).toBe('whatsapp');
    expect(chainResult.attempts[0]?.provider).toBe('meta_whatsapp');
    expect(chainResult.attempts[1]?.channel).toBe('sms');
    expect(chainResult.attempts[1]?.provider).toBe('termii');
  });
});

// ---------------------------------------------------------------------------
// buildFallbackCandidates tests
// ---------------------------------------------------------------------------

describe('buildFallbackCandidates', () => {
  const wa1 = makeChannel('whatsapp', 'meta_whatsapp', { success: true });
  const wa2 = makeChannel('whatsapp', 'dialog360', { success: true });
  const sms1 = makeChannel('sms', 'termii', { success: true });
  const sms2 = makeChannel('sms', 'africas_talking', { success: true });
  const email = makeChannel('email', 'resend', { success: true });

  const all = [wa1, wa2, sms1, sms2, email];

  it('returns only primary-type channels when no fallback type given', () => {
    const candidates = buildFallbackCandidates(all, 'whatsapp');
    expect(candidates).toHaveLength(2);
    expect(candidates.every((c) => c.channel === 'whatsapp')).toBe(true);
  });

  it('appends fallback-type channels after primary-type', () => {
    const candidates = buildFallbackCandidates(all, 'whatsapp', 'sms');
    expect(candidates).toHaveLength(4);
    expect(candidates[0]?.channel).toBe('whatsapp');
    expect(candidates[1]?.channel).toBe('whatsapp');
    expect(candidates[2]?.channel).toBe('sms');
    expect(candidates[3]?.channel).toBe('sms');
  });

  it('returns empty array when no matching channels exist', () => {
    const candidates = buildFallbackCandidates(all, 'telegram');
    expect(candidates).toHaveLength(0);
  });

  it('returns only SMS channels when primary is sms', () => {
    const candidates = buildFallbackCandidates(all, 'sms');
    expect(candidates).toHaveLength(2);
    expect(candidates.every((c) => c.channel === 'sms')).toBe(true);
  });
});
