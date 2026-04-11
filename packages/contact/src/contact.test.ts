/**
 * @webwaka/contact — Unit tests (M7a)
 * Target: 15 tests covering normalization, channel resolution, verification state
 */

import { describe, it, expect } from 'vitest';
import { normalizeContactChannels } from './normalize.js';
import { getPreferredOTPChannel, resolveContactForOTP } from './channel-resolver.js';
import { isChannelVerified, getVerifiedChannels } from './verification-state.js';
import type { ContactChannelRecord, OTPPreference } from './types.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeChannel(
  overrides: Partial<ContactChannelRecord> & Pick<ContactChannelRecord, 'channel_type' | 'value'>,
): ContactChannelRecord {
  return {
    id: 'ch-' + overrides.channel_type,
    user_id: 'user-1',
    is_primary: overrides.channel_type === 'sms',
    verified: true,
    created_at: 1_700_000_000,
    updated_at: 1_700_000_000,
    ...overrides,
  };
}

// ─── normalizeContactChannels ─────────────────────────────────────────────────

describe('normalizeContactChannels', () => {
  it('creates SMS channel from primary_phone', () => {
    const channels = normalizeContactChannels({
      primary_phone: '08012345678',
      whatsapp_same_as_primary: false,
      otp_preference: 'sms',
    });
    const sms = channels.find((c) => c.channel_type === 'sms');
    expect(sms).toBeDefined();
    expect(sms?.value).toBe('+2348012345678');
    expect(sms?.is_primary).toBe(true);
  });

  it('creates WhatsApp channel with same number when whatsapp_same_as_primary=true', () => {
    const channels = normalizeContactChannels({
      primary_phone: '08012345678',
      whatsapp_same_as_primary: true,
      otp_preference: 'sms',
    });
    const wa = channels.find((c) => c.channel_type === 'whatsapp');
    expect(wa).toBeDefined();
    expect(wa?.value).toBe('+2348012345678');
  });

  it('creates WhatsApp channel with different number when provided', () => {
    const channels = normalizeContactChannels({
      primary_phone: '08012345678',
      whatsapp_same_as_primary: false,
      whatsapp_phone: '07061234567',
      otp_preference: 'sms',
    });
    const wa = channels.find((c) => c.channel_type === 'whatsapp');
    expect(wa?.value).toBe('+2347061234567');
  });

  it('creates Telegram channel from handle (adds @ prefix)', () => {
    const channels = normalizeContactChannels({
      primary_phone: '08012345678',
      whatsapp_same_as_primary: false,
      telegram_handle: 'myhandle',
      otp_preference: 'sms',
    });
    const tg = channels.find((c) => c.channel_type === 'telegram');
    expect(tg?.value).toBe('@myhandle');
  });

  it('returns empty array for invalid primary_phone', () => {
    const channels = normalizeContactChannels({
      primary_phone: '12345',
      whatsapp_same_as_primary: false,
      otp_preference: 'sms',
    });
    expect(channels).toHaveLength(0);
  });

  it('ignores invalid Telegram handle (too short)', () => {
    const channels = normalizeContactChannels({
      primary_phone: '08012345678',
      whatsapp_same_as_primary: false,
      telegram_handle: 'ab',
      otp_preference: 'sms',
    });
    const tg = channels.find((c) => c.channel_type === 'telegram');
    expect(tg).toBeUndefined();
  });
});

// ─── getPreferredOTPChannel ───────────────────────────────────────────────────

describe('getPreferredOTPChannel', () => {
  const sms = makeChannel({ channel_type: 'sms', value: '+2348012345678', verified: true });
  const wa = makeChannel({ channel_type: 'whatsapp', value: '+2348012345678', verified: true });
  const tg = makeChannel({ channel_type: 'telegram', value: '@user', verified: true });

  it('returns preferred channel when verified', () => {
    const target = getPreferredOTPChannel([sms, wa], 'whatsapp');
    expect(target?.channel).toBe('whatsapp');
  });

  it('falls back to SMS when preference channel is missing', () => {
    const target = getPreferredOTPChannel([sms], 'whatsapp');
    expect(target?.channel).toBe('sms');
  });

  it('returns null when no verified channels exist', () => {
    const unverified = makeChannel({ channel_type: 'sms', value: '+2348012345678', verified: false });
    const target = getPreferredOTPChannel([unverified], 'sms');
    expect(target).toBeNull();
  });
});

// ─── resolveContactForOTP ─────────────────────────────────────────────────────

describe('resolveContactForOTP', () => {
  it('puts preferred channel first', () => {
    const sms = makeChannel({ channel_type: 'sms', value: '+2348012345678' });
    const wa = makeChannel({ channel_type: 'whatsapp', value: '+2347061234567' });
    const targets = resolveContactForOTP([sms, wa], 'whatsapp');
    expect(targets[0]?.channel).toBe('whatsapp');
    expect(targets[1]?.channel).toBe('sms');
  });

  it('returns only available channels', () => {
    const sms = makeChannel({ channel_type: 'sms', value: '+2348012345678' });
    const targets = resolveContactForOTP([sms], 'telegram');
    expect(targets.map((t) => t.channel)).toEqual(['sms']);
  });
});

// ─── isChannelVerified / getVerifiedChannels ──────────────────────────────────

describe('verification state helpers', () => {
  const channels: ContactChannelRecord[] = [
    makeChannel({ channel_type: 'sms', value: '+2348012345678', verified: true }),
    makeChannel({ channel_type: 'whatsapp', value: '+2348012345678', verified: false }),
    makeChannel({ channel_type: 'telegram', value: '@user', verified: true }),
  ];

  it('isChannelVerified returns true for verified channel', () => {
    expect(isChannelVerified(channels, 'sms')).toBe(true);
    expect(isChannelVerified(channels, 'telegram')).toBe(true);
  });

  it('isChannelVerified returns false for unverified channel', () => {
    expect(isChannelVerified(channels, 'whatsapp')).toBe(false);
  });

  it('isChannelVerified returns false for absent channel', () => {
    expect(isChannelVerified(channels, 'email')).toBe(false);
  });

  it('getVerifiedChannels returns only verified channels', () => {
    const verified = getVerifiedChannels(channels);
    expect(verified).toHaveLength(2);
    expect(verified.map((c) => c.channel_type).sort()).toEqual(['sms', 'telegram']);
  });
});
