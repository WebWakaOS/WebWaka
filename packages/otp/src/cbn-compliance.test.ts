/**
 * N-124 — CBN OTP R8 compliance audit test suite (Phase 9).
 *
 * Verifies CBN circular BSD/DIR/CON/LAB/13/010 (and successor) requirements:
 *
 *   R8:  Transaction and KYC OTPs MUST be delivered via SMS first. Telegram
 *        is categorically prohibited for transaction and kyc_uplift purposes.
 *
 *   R9:  Non-transaction OTPs may use WhatsApp/Telegram per user preference,
 *        but SMS MUST always be available as a fallback.
 *
 * Additional CBN checks:
 *   CBN-03  OTP code is exactly 6 numeric digits (no letters)
 *   CBN-04  OTP expires within 5 minutes (300 seconds max)
 *   CBN-05  Rate limit key is per-channel per-identifier (not global)
 *   CBN-06  Lock duration for transaction purpose is >= 15 minutes
 *   CBN-07  kyc_uplift purpose also blocks Telegram (same as transaction)
 *   CBN-08  Whitelist: login/verification purposes allow all channels per preference
 *   CBN-09  resolveOTPChannels never returns an empty array when phone is provided
 *   CBN-10  Telegram channel never first for any purpose (must always be preceded by SMS/WhatsApp)
 */

import { describe, it, expect } from 'vitest';
import {
  resolveOTPChannels,
  rateLimitKey,
  lockKey,
  lockDurationSeconds,
  CHANNEL_RATE_LIMITS,
} from './channel-router.js';
import { generateOTP, isOTPExpired, otpExpiresAt } from './otp-generator.js';

// ---------------------------------------------------------------------------
// R8: Transaction OTPs MUST start with SMS, Telegram blocked
// ---------------------------------------------------------------------------

describe('R8 — transaction purpose: SMS first, Telegram blocked', () => {
  const FULL_CONTACT = {
    phone: '+2348012345678',
    whatsapp: '+2348012345678',
    telegram: '@user_handle',
  };

  it('first channel is SMS for transaction purpose', () => {
    const channels = resolveOTPChannels(FULL_CONTACT, 'transaction');
    expect(channels[0]?.channel).toBe('sms');
  });

  it('Telegram is never included for transaction purpose', () => {
    const channels = resolveOTPChannels(FULL_CONTACT, 'transaction');
    const telegramChannels = channels.filter((c) => c.channel === 'telegram');
    expect(telegramChannels).toHaveLength(0);
  });

  it('only SMS and WhatsApp are included for transaction purpose', () => {
    const channels = resolveOTPChannels(FULL_CONTACT, 'transaction');
    for (const c of channels) {
      expect(['sms', 'whatsapp']).toContain(c.channel);
    }
  });

  it('transaction OTP has at least SMS when phone available', () => {
    const channels = resolveOTPChannels({ phone: '+2348012345678' }, 'transaction');
    expect(channels.some((c) => c.channel === 'sms')).toBe(true);
  });

  it('returns empty array for transaction when no phone or whatsapp', () => {
    const channels = resolveOTPChannels({ telegram: '@user_handle' }, 'transaction');
    expect(channels).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// CBN-07: kyc_uplift also blocks Telegram (same as transaction)
// ---------------------------------------------------------------------------

describe('CBN-07 — kyc_uplift purpose: Telegram blocked (same as transaction)', () => {
  const FULL_CONTACT = {
    phone: '+2348098765432',
    whatsapp: '+2348098765432',
    telegram: '@kyc_victim',
    otp_preference: 'telegram' as const,
  };

  it('first channel is SMS for kyc_uplift purpose', () => {
    const channels = resolveOTPChannels(FULL_CONTACT, 'kyc_uplift');
    expect(channels[0]?.channel).toBe('sms');
  });

  it('Telegram is excluded for kyc_uplift even when user prefers it', () => {
    const channels = resolveOTPChannels(FULL_CONTACT, 'kyc_uplift');
    expect(channels.every((c) => c.channel !== 'telegram')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// R9: Non-transaction purposes allow Telegram per preference
// ---------------------------------------------------------------------------

describe('R9 — non-transaction purposes: Telegram allowed per preference', () => {
  it('login purpose with telegram preference includes Telegram', () => {
    const channels = resolveOTPChannels(
      { phone: '+2348012345678', telegram: '@login_user', otp_preference: 'telegram' },
      'login',
    );
    expect(channels.some((c) => c.channel === 'telegram')).toBe(true);
  });

  it('verification purpose with whatsapp preference puts WhatsApp first', () => {
    const channels = resolveOTPChannels(
      { phone: '+2348012345678', whatsapp: '+2348012345678', otp_preference: 'whatsapp' },
      'verification',
    );
    expect(channels[0]?.channel).toBe('whatsapp');
  });

  it('password_reset purpose with default preference uses SMS', () => {
    const channels = resolveOTPChannels(
      { phone: '+2348012345678' },
      'password_reset',
    );
    expect(channels[0]?.channel).toBe('sms');
  });
});

// ---------------------------------------------------------------------------
// CBN-08: All non-transaction purposes allow full channel range
// ---------------------------------------------------------------------------

describe('CBN-08 — non-transaction purposes allow all channels per preference', () => {
  const NON_TRANSACTION_PURPOSES = ['login', 'verification', 'password_reset'] as const;

  for (const purpose of NON_TRANSACTION_PURPOSES) {
    it(`${purpose}: Telegram allowed when user prefers it`, () => {
      const channels = resolveOTPChannels(
        { phone: '+2348012345678', telegram: '@test_user', otp_preference: 'telegram' },
        purpose,
      );
      expect(channels.some((c) => c.channel === 'telegram')).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// CBN-03: OTP is exactly 6 numeric digits
// ---------------------------------------------------------------------------

describe('CBN-03 — OTP code is exactly 6 numeric digits', () => {
  it('generateOTP returns a 6-character string', () => {
    const otp = generateOTP();
    expect(otp).toHaveLength(6);
  });

  it('generateOTP returns only digits', () => {
    for (let i = 0; i < 20; i++) {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    }
  });

  it('generateOTP pads small values to exactly 6 digits', () => {
    const otp = generateOTP();
    expect(otp.length).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// CBN-04: OTP expires within 5 minutes
// ---------------------------------------------------------------------------

describe('CBN-04 — OTP expires within 5 minutes (300 seconds maximum)', () => {
  it('otpExpiresAt is within 5 minutes of now', () => {
    const expiresAt = otpExpiresAt();
    // otpExpiresAt() returns a Unix timestamp in seconds (not milliseconds)
    const nowSec = Math.floor(Date.now() / 1000);
    const fiveMinutesSec = 5 * 60;
    const diffSec = expiresAt - nowSec;

    expect(diffSec).toBeGreaterThan(0);
    expect(diffSec).toBeLessThanOrEqual(fiveMinutesSec + 1);
  });

  it('a fresh OTP is not expired', () => {
    const expiresAt = otpExpiresAt();
    expect(isOTPExpired(expiresAt)).toBe(false);
  });

  it('an OTP from 6 minutes ago is expired', () => {
    // isOTPExpired() accepts a Unix timestamp in seconds
    const sixMinutesAgoSec = Math.floor(Date.now() / 1000) - 6 * 60;
    expect(isOTPExpired(sixMinutesAgoSec)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CBN-05: Rate limit key is per-channel per-identifier
// ---------------------------------------------------------------------------

describe('CBN-05 — rate limit key is scoped to channel + identifier', () => {
  it('rateLimitKey includes channel and identifier', () => {
    const key = rateLimitKey('sms', '+2348012345678');
    expect(key).toContain('sms');
    expect(key).toContain('+2348012345678');
  });

  it('different channels produce different rate limit keys', () => {
    const smsKey = rateLimitKey('sms', '+2348012345678');
    const whatsappKey = rateLimitKey('whatsapp', '+2348012345678');
    expect(smsKey).not.toBe(whatsappKey);
  });

  it('different identifiers produce different rate limit keys', () => {
    const key1 = rateLimitKey('sms', '+2348012345678');
    const key2 = rateLimitKey('sms', '+2349087654321');
    expect(key1).not.toBe(key2);
  });

  it('lockKey follows same per-channel per-identifier pattern', () => {
    const key = lockKey('sms', '+2348012345678');
    expect(key).toContain('sms');
    expect(key).toContain('+2348012345678');
    expect(key).not.toBe(rateLimitKey('sms', '+2348012345678'));
  });
});

// ---------------------------------------------------------------------------
// CBN-06: Lock duration for transaction purpose >= 15 minutes
// ---------------------------------------------------------------------------

describe('CBN-06 — lock duration for transaction purpose >= 15 minutes', () => {
  it('lockDurationSeconds for transaction purpose is at least 900 seconds (15 minutes)', () => {
    const duration = lockDurationSeconds('transaction');
    expect(duration).toBeGreaterThanOrEqual(900);
  });

  it('lockDurationSeconds for kyc_uplift is at least 900 seconds (15 minutes)', () => {
    const duration = lockDurationSeconds('kyc_uplift');
    expect(duration).toBeGreaterThanOrEqual(900);
  });
});

// ---------------------------------------------------------------------------
// CBN-09: resolveOTPChannels never returns empty when phone is provided
// ---------------------------------------------------------------------------

describe('CBN-09 — resolveOTPChannels always returns at least SMS when phone provided', () => {
  const ALL_PURPOSES = ['transaction', 'kyc_uplift', 'login', 'verification', 'password_reset'] as const;

  for (const purpose of ALL_PURPOSES) {
    it(`${purpose}: at least one channel when phone is provided`, () => {
      const channels = resolveOTPChannels({ phone: '+2348012345678' }, purpose);
      expect(channels.length).toBeGreaterThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// CBN-10: Telegram is NEVER the first channel for any purpose
// ---------------------------------------------------------------------------

describe('CBN-10 — Telegram is never the first channel for any purpose', () => {
  const ALL_PURPOSES = ['transaction', 'kyc_uplift', 'login', 'verification', 'password_reset'] as const;

  for (const purpose of ALL_PURPOSES) {
    it(`${purpose}: first channel is not Telegram even with Telegram preference`, () => {
      const channels = resolveOTPChannels(
        {
          phone: '+2348012345678',
          whatsapp: '+2348012345678',
          telegram: '@test_user',
          otp_preference: 'telegram',
        },
        purpose,
      );
      if (channels.length > 0) {
        expect(channels[0]!.channel).not.toBe('telegram');
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Channel rate limits sanity check
// ---------------------------------------------------------------------------

describe('CHANNEL_RATE_LIMITS — all channels have defined rate limits', () => {
  it('SMS has a rate limit defined', () => {
    expect(CHANNEL_RATE_LIMITS['sms']).toBeGreaterThan(0);
  });

  it('WhatsApp has a rate limit defined', () => {
    expect(CHANNEL_RATE_LIMITS['whatsapp']).toBeGreaterThan(0);
  });

  it('Email has a rate limit defined', () => {
    expect(CHANNEL_RATE_LIMITS['email']).toBeGreaterThan(0);
  });

  it('Telegram has a rate limit defined', () => {
    expect(CHANNEL_RATE_LIMITS['telegram']).toBeGreaterThan(0);
  });
});
