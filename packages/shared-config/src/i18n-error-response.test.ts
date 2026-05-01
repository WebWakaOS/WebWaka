/**
 * Tests for i18nErrorResponse and detectApiLocale (L-12)
 */

import { describe, it, expect } from 'vitest';
import {
  i18nErrorResponse,
  getLocalizedErrorMessage,
  detectApiLocale,
} from './i18n-error-response.js';
import { ErrorCode } from './error-response.js';

// ── getLocalizedErrorMessage ─────────────────────────────────────────────────

describe('getLocalizedErrorMessage', () => {
  it('returns English by default', () => {
    const msg = getLocalizedErrorMessage(ErrorCode.Unauthorized);
    expect(msg).toContain('authorised');
  });

  it('returns Hausa for ha locale', () => {
    const msg = getLocalizedErrorMessage(ErrorCode.Unauthorized, 'ha');
    expect(msg).toBeTruthy();
    expect(msg).not.toContain('authorised'); // not English
  });

  it('returns Pidgin for pcm locale', () => {
    const msg = getLocalizedErrorMessage(ErrorCode.Unauthorized, 'pcm');
    expect(msg).toContain('Abeg');
  });

  it('returns French for fr locale', () => {
    const msg = getLocalizedErrorMessage(ErrorCode.NotFound, 'fr');
    expect(msg).toContain('introuvable');
  });

  it('returns Yoruba for yo locale', () => {
    const msg = getLocalizedErrorMessage(ErrorCode.Forbidden, 'yo');
    expect(msg).toBeTruthy();
    expect(msg).not.toContain('Access denied');
  });

  it('returns Igbo for ig locale', () => {
    const msg = getLocalizedErrorMessage(ErrorCode.RateLimitExceeded, 'ig');
    expect(msg).toBeTruthy();
    expect(msg).not.toContain('Too many');
  });

  it('falls back to English for unknown code', () => {
    const msg = getLocalizedErrorMessage('unknown_code' as ErrorCode, 'ha');
    expect(msg).toBeTruthy(); // should return en internal_error fallback
  });
});

// ── i18nErrorResponse ────────────────────────────────────────────────────────

describe('i18nErrorResponse', () => {
  it('uses localised message when no override provided', () => {
    const resp = i18nErrorResponse(ErrorCode.Unauthorized, 'pcm');
    expect(resp.error).toBe('unauthorized');
    expect(resp.message).toContain('Abeg');
  });

  it('uses override message when provided (English detail)', () => {
    const resp = i18nErrorResponse(ErrorCode.BadRequest, 'ha', 'email and password are required.');
    expect(resp.error).toBe('bad_request');
    expect(resp.message).toBe('email and password are required.');
  });

  it('includes details when provided', () => {
    const resp = i18nErrorResponse(ErrorCode.ValidationFailed, 'en', undefined, { field: 'email' });
    expect(resp.details).toEqual({ field: 'email' });
  });

  it('includes request_id when provided', () => {
    const resp = i18nErrorResponse(ErrorCode.InternalError, 'en', undefined, undefined, 'req-001');
    expect(resp.request_id).toBe('req-001');
  });

  it('returns correct error code for rate limit', () => {
    const resp = i18nErrorResponse(ErrorCode.RateLimitExceeded, 'yo');
    expect(resp.error).toBe('rate_limit_exceeded');
    expect(resp.message).toBeTruthy();
  });
});

// ── detectApiLocale ──────────────────────────────────────────────────────────

describe('detectApiLocale', () => {
  function makeReq(acceptLang?: string, url?: string) {
    return {
      headers: { get: (name: string) => name === 'Accept-Language' ? (acceptLang ?? null) : null },
      url,
    };
  }

  it('returns en by default (no header, no param)', () => {
    expect(detectApiLocale(makeReq())).toBe('en');
  });

  it('detects ha from Accept-Language header', () => {
    expect(detectApiLocale(makeReq('ha-NG,ha;q=0.9,en;q=0.8'))).toBe('ha');
  });

  it('detects yo from Accept-Language', () => {
    expect(detectApiLocale(makeReq('yo;q=1.0'))).toBe('yo');
  });

  it('detects pcm from Accept-Language', () => {
    expect(detectApiLocale(makeReq('pcm'))).toBe('pcm');
  });

  it('detects fr from Accept-Language', () => {
    expect(detectApiLocale(makeReq('fr-FR,fr;q=0.9'))).toBe('fr');
  });

  it('detects locale from ?lang= query param', () => {
    const sp = new URLSearchParams('lang=ig');
    expect(detectApiLocale(makeReq(), undefined, sp)).toBe('ig');
  });

  it('?lang= takes priority over Accept-Language', () => {
    const sp = new URLSearchParams('lang=ha');
    expect(detectApiLocale(makeReq('yo'), undefined, sp)).toBe('ha');
  });

  it('returns en for unsupported language tag', () => {
    expect(detectApiLocale(makeReq('zh-CN,zh;q=0.9'))).toBe('en');
  });

  it('handles null input gracefully', () => {
    expect(detectApiLocale(null)).toBe('en');
  });

  it('handles malformed Accept-Language gracefully', () => {
    expect(detectApiLocale(makeReq(';;;,,invalid'))).toBe('en');
  });
});
