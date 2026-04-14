/**
 * @webwaka/i18n — Typed i18n framework for WebWaka OS.
 * UX-15 — Nigeria-first: en, ha (Hausa), yo (Yoruba), ig (Igbo), pcm (Nigerian Pidgin)
 *
 * Usage:
 *   import { createI18n, detectLocale } from '@webwaka/i18n';
 *
 *   const locale = detectLocale(request);
 *   const t = createI18n(locale);
 *   const title = t('title_home');        // → 'WebWaka — An Gina Don Afirka' (ha)
 *
 * Locale detection order (first match wins):
 *   1. ?lang= query parameter
 *   2. Accept-Language request header
 *   3. Default: 'en'
 *
 * All non-English locales are Partial<I18nLocale> — missing keys fall back to English.
 *
 * Platform invariant: locale is never stored as PII (only used per-request).
 */

import { en } from './locales/en.js';
import { ha } from './locales/ha.js';
import { yo } from './locales/yo.js';
import { ig } from './locales/ig.js';
import { pcm } from './locales/pcm.js';
import { fr } from './locales/fr.js';
import type { I18nKeys, I18nLocale } from './locales/en.js';

export type { I18nKeys, I18nLocale };
export type SupportedLocale = 'en' | 'ha' | 'yo' | 'ig' | 'pcm' | 'fr';

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'ha', 'yo', 'ig', 'pcm', 'fr'];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  ha: 'Hausa',
  yo: 'Yorùbá',
  ig: 'Igbo',
  pcm: 'Naija (Pidgin)',
  fr: 'Français',
};

// Locale data — partial locales fall back to English for missing keys
const LOCALES: Record<SupportedLocale, Partial<I18nLocale>> = {
  en,
  ha,
  yo,
  ig,
  pcm,
  fr,
};

/**
 * Create a typed translation function for the given locale.
 * Falls back to English for any missing key.
 *
 * @param locale - The locale to use (e.g. 'ha', 'yo', 'ig', 'pcm', 'en')
 * @returns A function `t(key, vars?)` that returns the translated string
 */
export function createI18n(locale: SupportedLocale): (key: I18nKeys, vars?: Record<string, string | number>) => string {
  const translations = LOCALES[locale];

  return function t(key: I18nKeys, vars?: Record<string, string | number>): string {
    const value = (translations[key] ?? en[key]) as string;
    if (!vars) return value;

    // Simple variable interpolation: {key} → value
    return value.replace(/\{(\w+)\}/g, (_, varKey: string) => {
      const v = vars[varKey];
      return v !== undefined ? String(v) : `{${varKey}}`;
    });
  };
}

/**
 * Detect the best locale for a request.
 *
 * Priority:
 *   1. ?lang= query parameter (e.g. ?lang=ha)
 *   2. Accept-Language header (e.g. "ha-NG,en;q=0.9")
 *   3. Default: 'en'
 */
export function detectLocale(
  requestOrHeaders: Request | { headers: { get(name: string): string | null }; url?: string } | null,
  urlSearchParams?: URLSearchParams,
): SupportedLocale {
  if (!requestOrHeaders) return 'en';

  // 1. Check ?lang= query param
  let searchParams: URLSearchParams | null = null;
  if (urlSearchParams) {
    searchParams = urlSearchParams;
  } else if ('url' in requestOrHeaders && requestOrHeaders.url) {
    try {
      searchParams = new URL(requestOrHeaders.url).searchParams;
    } catch {
      // ignore invalid URL
    }
  }

  if (searchParams) {
    const langParam = searchParams.get('lang');
    if (langParam && isSupportedLocale(langParam)) {
      return langParam;
    }
  }

  // 2. Check Accept-Language header
  const acceptLang = requestOrHeaders.headers.get('Accept-Language') ?? '';
  if (acceptLang) {
    const preferred = parseAcceptLanguage(acceptLang);
    for (const lang of preferred) {
      if (isSupportedLocale(lang)) return lang;
      // Check language prefix (e.g. "ha-NG" → "ha")
      const prefix = lang.split('-')[0]?.toLowerCase();
      if (prefix && isSupportedLocale(prefix)) return prefix;
    }
  }

  return 'en';
}

/**
 * Parse Accept-Language header into ordered list of language tags.
 * Example: "ha-NG,ha;q=0.9,en;q=0.8" → ["ha-ng", "ha", "en"]
 */
function parseAcceptLanguage(header: string): string[] {
  return header
    .split(',')
    .map((part) => {
      const [lang, q] = part.trim().split(';q=');
      return { lang: (lang ?? '').trim().toLowerCase(), q: parseFloat(q ?? '1') || 1 };
    })
    .sort((a, b) => b.q - a.q)
    .map((item) => item.lang)
    .filter(Boolean);
}

function isSupportedLocale(lang: string): lang is SupportedLocale {
  return (SUPPORTED_LOCALES as string[]).includes(lang.toLowerCase());
}

/**
 * Locale detection middleware factory for Hono.
 * Injects the detected locale into the request context as 'locale'.
 *
 * Usage in Hono:
 *   app.use('*', localeMiddleware());
 *   // Then in handlers: const locale = c.get('locale') as SupportedLocale;
 */
export function createLocaleMiddleware() {
  return async (c: { req: { raw: Request; query: (k: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    const langParam = c.req.query('lang');
    const searchParams = langParam ? new URLSearchParams(`lang=${langParam}`) : undefined;
    const locale = detectLocale(c.req.raw, searchParams);
    c.set('locale', locale);
    await next();
  };
}

// Re-export locale data for direct use
export { en, ha, yo, ig, pcm, fr };
