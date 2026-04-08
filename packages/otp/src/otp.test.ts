/**
 * @webwaka/otp — Unit tests (M7a)
 * Target: 20 tests covering phone validation, OTP generation, channel routing, waterfall
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateNigerianPhone } from './phone-validator.js';
import { generateOTP, hashOTP, otpExpiresAt, isOTPExpired } from './otp-generator.js';
import { resolveOTPChannels, rateLimitKey, lockKey, CHANNEL_RATE_LIMITS } from './channel-router.js';
import { OTPError } from './types.js';

// ─── validateNigerianPhone ─────────────────────────────────────────────────────

describe('validateNigerianPhone', () => {
  it('normalizes 080XXXXXXXX to E.164', () => {
    const result = validateNigerianPhone('08012345678');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('+2348012345678');
  });

  it('accepts +234 E.164 format unchanged', () => {
    const result = validateNigerianPhone('+2348012345678');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('+2348012345678');
  });

  it('accepts 234XXXXXXXXXX format', () => {
    const result = validateNigerianPhone('2348012345678');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('+2348012345678');
  });

  it('rejects invalid phone number', () => {
    const result = validateNigerianPhone('12345');
    expect(result.valid).toBe(false);
  });

  it('detects MTN carrier for 0803 prefix', () => {
    const result = validateNigerianPhone('08031234567');
    expect(result.carrier).toBe('mtn');
  });

  it('detects Airtel carrier for 0802 prefix', () => {
    const result = validateNigerianPhone('08021234567');
    expect(result.carrier).toBe('airtel');
  });

  it('detects Glo carrier for 0805 prefix', () => {
    const result = validateNigerianPhone('08051234567');
    expect(result.carrier).toBe('glo');
  });

  it('detects 9mobile carrier for 0809 prefix', () => {
    const result = validateNigerianPhone('08091234567');
    expect(result.carrier).toBe('9mobile');
  });
});

// ─── generateOTP ─────────────────────────────────────────────────────────────

describe('generateOTP', () => {
  it('returns a 6-character string of digits', () => {
    const otp = generateOTP();
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it('produces unique OTPs on successive calls', () => {
    const otps = new Set(Array.from({ length: 20 }, () => generateOTP()));
    expect(otps.size).toBeGreaterThan(15);
  });

  it('pads small values to 6 digits', () => {
    const otp = generateOTP();
    expect(otp.length).toBe(6);
  });
});

// ─── hashOTP ─────────────────────────────────────────────────────────────────

describe('hashOTP', () => {
  it('returns a 64-char hex hash', async () => {
    const hash = await hashOTP('salt', '123456');
    expect(hash).toHaveLength(64);
  });

  it('is deterministic', async () => {
    const h1 = await hashOTP('salt', '123456');
    const h2 = await hashOTP('salt', '123456');
    expect(h1).toBe(h2);
  });

  it('differs for different OTPs', async () => {
    const h1 = await hashOTP('salt', '123456');
    const h2 = await hashOTP('salt', '654321');
    expect(h1).not.toBe(h2);
  });
});

// ─── otpExpiresAt / isOTPExpired ─────────────────────────────────────────────

describe('otpExpiresAt + isOTPExpired', () => {
  it('expiresAt is in the future for a fresh OTP', () => {
    const expiresAt = otpExpiresAt(600);
    const now = Math.floor(Date.now() / 1000);
    expect(expiresAt).toBeGreaterThan(now);
    expect(expiresAt - now).toBeCloseTo(600, -1);
  });

  it('isOTPExpired returns false for future timestamp', () => {
    const future = Math.floor(Date.now() / 1000) + 600;
    expect(isOTPExpired(future)).toBe(false);
  });

  it('isOTPExpired returns true for past timestamp', () => {
    const past = Math.floor(Date.now() / 1000) - 1;
    expect(isOTPExpired(past)).toBe(true);
  });
});

// ─── resolveOTPChannels ───────────────────────────────────────────────────────

describe('resolveOTPChannels', () => {
  it('returns SMS first for transaction purpose (R8)', () => {
    const channels = resolveOTPChannels(
      { phone: '+2348012345678', whatsapp: '+2348012345678', telegram: '@user' },
      'transaction',
    );
    expect(channels[0]?.channel).toBe('sms');
    expect(channels.find((c) => c.channel === 'telegram')).toBeUndefined();
  });

  it('blocks Telegram for kyc_uplift purpose (R8)', () => {
    const channels = resolveOTPChannels(
      { phone: '+2348012345678', telegram: '@user' },
      'kyc_uplift',
    );
    expect(channels.find((c) => c.channel === 'telegram')).toBeUndefined();
  });

  it('respects WhatsApp preference for non-transaction purposes', () => {
    const channels = resolveOTPChannels(
      { phone: '+2348012345678', whatsapp: '+2348012345678', otp_preference: 'whatsapp' },
      'login',
    );
    expect(channels[0]?.channel).toBe('whatsapp');
  });

  it('returns no channels if contact has no phone/whatsapp/telegram', () => {
    const channels = resolveOTPChannels({}, 'verification');
    expect(channels).toHaveLength(0);
  });
});

// ─── rateLimitKey / lockKey ───────────────────────────────────────────────────

describe('rateLimitKey + lockKey', () => {
  it('generates consistent rate limit key', () => {
    const key = rateLimitKey('sms', '+2348012345678');
    expect(key).toBe('rate:otp:sms:+2348012345678');
  });

  it('generates consistent lock key', () => {
    const key = lockKey('whatsapp', '+2348012345678');
    expect(key).toBe('lock:otp:whatsapp:+2348012345678');
  });
});

// ─── CHANNEL_RATE_LIMITS ─────────────────────────────────────────────────────

describe('CHANNEL_RATE_LIMITS', () => {
  it('SMS and WhatsApp limits are 5/hr (R9)', () => {
    expect(CHANNEL_RATE_LIMITS.sms).toBe(5);
    expect(CHANNEL_RATE_LIMITS.whatsapp).toBe(5);
  });

  it('Telegram and email limits are 3/hr (R9)', () => {
    expect(CHANNEL_RATE_LIMITS.telegram).toBe(3);
    expect(CHANNEL_RATE_LIMITS.email).toBe(3);
  });
});

// ─── OTPError ─────────────────────────────────────────────────────────────────

describe('OTPError', () => {
  it('has correct name and code', () => {
    const err = new OTPError('rate_limited', 'Too many attempts');
    expect(err.name).toBe('OTPError');
    expect(err.code).toBe('rate_limited');
    expect(err instanceof Error).toBe(true);
  });
});
