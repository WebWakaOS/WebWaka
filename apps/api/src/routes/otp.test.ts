import { describe, it, expect } from 'vitest';
import { normalizePhoneToE164 } from './otp.js';

describe('normalizePhoneToE164', () => {
  it('accepts +2348012345678 (already E.164)', () => {
    expect(normalizePhoneToE164('+2348012345678')).toBe('+2348012345678');
  });
  it('converts 08012345678 to +2348012345678', () => {
    expect(normalizePhoneToE164('08012345678')).toBe('+2348012345678');
  });
  it('converts 8012345678 to +2348012345678', () => {
    expect(normalizePhoneToE164('8012345678')).toBe('+2348012345678');
  });
  it('accepts 070x numbers', () => {
    expect(normalizePhoneToE164('07031234567')).toBe('+2347031234567');
  });
  it('accepts 090x numbers', () => {
    expect(normalizePhoneToE164('09021234567')).toBe('+2349021234567');
  });
  it('strips spaces and hyphens', () => {
    expect(normalizePhoneToE164('0801 234 5678')).toBe('+2348012345678');
  });
  it('returns null for UK number', () => {
    expect(normalizePhoneToE164('+447911123456')).toBeNull();
  });
  it('returns null for US number', () => {
    expect(normalizePhoneToE164('+12025551234')).toBeNull();
  });
  it('returns null for too-short number', () => {
    expect(normalizePhoneToE164('0801234')).toBeNull();
  });
  it('returns null for empty string', () => {
    expect(normalizePhoneToE164('')).toBeNull();
  });
});

describe('OTP generation sanity', () => {
  it('6-digit OTP generation produces valid codes', () => {
    for (let i = 0; i < 50; i++) {
      const arr = crypto.getRandomValues(new Uint8Array(4));
      const num = new DataView(arr.buffer).getUint32(0) % 1_000_000;
      const otp = String(num).padStart(6, '0');
      expect(otp).toMatch(/^\d{6}$/);
    }
  });

  it('OTP hash is deterministic', async () => {
    const hash = async (s: string) => {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    };
    const h1 = await hash('123456');
    const h2 = await hash('123456');
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });

  it('different OTPs produce different hashes', async () => {
    const hash = async (s: string) => {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    };
    expect(await hash('123456')).not.toBe(await hash('654321'));
  });
});
