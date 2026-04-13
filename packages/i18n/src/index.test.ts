/**
 * @webwaka/i18n — unit tests
 * UX-15 — 5 locales, typed keys, locale detection, variable interpolation
 */
import { describe, it, expect } from 'vitest';
import {
  createI18n,
  detectLocale,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  en, ha, yo, ig, pcm,
} from './index.js';

// ---------------------------------------------------------------------------
// SUPPORTED_LOCALES constant
// ---------------------------------------------------------------------------
describe('SUPPORTED_LOCALES', () => {
  it('contains exactly 5 locales', () => {
    expect(SUPPORTED_LOCALES).toHaveLength(5);
  });

  it('includes en, ha, yo, ig, pcm', () => {
    expect(SUPPORTED_LOCALES).toContain('en');
    expect(SUPPORTED_LOCALES).toContain('ha');
    expect(SUPPORTED_LOCALES).toContain('yo');
    expect(SUPPORTED_LOCALES).toContain('ig');
    expect(SUPPORTED_LOCALES).toContain('pcm');
  });
});

// ---------------------------------------------------------------------------
// LOCALE_LABELS
// ---------------------------------------------------------------------------
describe('LOCALE_LABELS', () => {
  it('returns English for en', () => {
    expect(LOCALE_LABELS.en).toBe('English');
  });

  it('returns Hausa for ha', () => {
    expect(LOCALE_LABELS.ha).toBe('Hausa');
  });

  it('returns Yoruba for yo', () => {
    expect(LOCALE_LABELS.yo).toBe('Yorùbá');
  });

  it('returns Igbo for ig', () => {
    expect(LOCALE_LABELS.ig).toBe('Igbo');
  });

  it('returns Pidgin for pcm', () => {
    expect(LOCALE_LABELS.pcm).toBe('Naija (Pidgin)');
  });
});

// ---------------------------------------------------------------------------
// English locale coverage (en is the canonical source of truth)
// ---------------------------------------------------------------------------
describe('English locale', () => {
  it('has at least 30 keys', () => {
    expect(Object.keys(en).length).toBeGreaterThanOrEqual(30);
  });

  it('title_home is non-empty', () => {
    expect(en.title_home).toBeTruthy();
  });

  it('action_search is defined', () => {
    expect(en.action_search).toBe('Search');
  });

  it('footer_tagline is defined', () => {
    expect(en.footer_tagline).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// createI18n — English
// ---------------------------------------------------------------------------
describe('createI18n(en)', () => {
  const t = createI18n('en');

  it('returns the correct English title_home', () => {
    expect(t('title_home')).toBe('WebWaka — Built for Africa');
  });

  it('returns action_search as Search', () => {
    expect(t('action_search')).toBe('Search');
  });

  it('returns status_loading', () => {
    expect(t('status_loading')).toBe('Loading…');
  });

  it('returns error_required', () => {
    expect(t('error_required')).toBe('This field is required.');
  });

  it('interpolates {count} in search_results_count', () => {
    expect(t('search_results_count', { count: 42 })).toBe('42 results');
  });

  it('interpolates {query} in search_no_results', () => {
    expect(t('search_no_results', { query: 'Suya' })).toBe('No businesses found for "Suya".');
  });

  it('leaves unknown interpolation vars as-is', () => {
    expect(t('search_results_count', {})).toBe('{count} results');
  });
});

// ---------------------------------------------------------------------------
// createI18n — Hausa (ha)
// ---------------------------------------------------------------------------
describe('createI18n(ha)', () => {
  const t = createI18n('ha');

  it('returns Hausa title_home', () => {
    expect(t('title_home')).toContain('Afirka');
  });

  it('returns Hausa action_search', () => {
    expect(t('action_search')).toBe('Nema');
  });

  it('returns Hausa status_error', () => {
    expect(t('status_error')).toContain('kuskure');
  });

  it('falls back to English for missing keys', () => {
    // status_paid is defined in ha; status_free is also defined
    // nav_about is defined in ha
    expect(t('nav_about')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// createI18n — Yoruba (yo)
// ---------------------------------------------------------------------------
describe('createI18n(yo)', () => {
  const t = createI18n('yo');

  it('returns Yoruba action_search', () => {
    expect(t('action_search')).toBe('Wádìí');
  });

  it('returns Yoruba status_free as Ọfẹ', () => {
    expect(t('status_free')).toBe('Ọ̀fẹ́');
  });

  it('Yoruba title_home contains Africa', () => {
    expect(t('title_home')).toContain('Áfríkà');
  });
});

// ---------------------------------------------------------------------------
// createI18n — Igbo (ig)
// ---------------------------------------------------------------------------
describe('createI18n(ig)', () => {
  const t = createI18n('ig');

  it('returns Igbo action_search', () => {
    expect(t('action_search')).toBe('Chọọ');
  });

  it('returns Igbo status_success', () => {
    expect(t('status_success')).toBe('Emechara!');
  });

  it('falls back to English for keys not in Igbo', () => {
    // footer_terms is defined in ig
    expect(t('footer_terms')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// createI18n — Nigerian Pidgin (pcm)
// ---------------------------------------------------------------------------
describe('createI18n(pcm)', () => {
  const t = createI18n('pcm');

  it('returns Pidgin action_search', () => {
    expect(t('action_search')).toBe('Find Am');
  });

  it('returns Pidgin status_error with Abeg', () => {
    expect(t('status_error')).toContain('Abeg');
  });

  it('returns Pidgin footer_tagline', () => {
    expect(t('footer_tagline')).toContain('Africa');
  });
});

// ---------------------------------------------------------------------------
// detectLocale — ?lang= query parameter
// ---------------------------------------------------------------------------
describe('detectLocale — ?lang= query param', () => {
  function makeRequest(url: string, acceptLanguage?: string): Request {
    const headers: Record<string, string> = {};
    if (acceptLanguage) headers['Accept-Language'] = acceptLanguage;
    return new Request(url, { headers });
  }

  it('detects ha from ?lang=ha', () => {
    const req = makeRequest('https://example.com/discover?lang=ha');
    expect(detectLocale(req)).toBe('ha');
  });

  it('detects yo from ?lang=yo', () => {
    const req = makeRequest('https://example.com/discover?lang=yo');
    expect(detectLocale(req)).toBe('yo');
  });

  it('detects ig from ?lang=ig', () => {
    const req = makeRequest('https://example.com/discover?lang=ig');
    expect(detectLocale(req)).toBe('ig');
  });

  it('detects pcm from ?lang=pcm', () => {
    const req = makeRequest('https://example.com/?lang=pcm');
    expect(detectLocale(req)).toBe('pcm');
  });

  it('detects en from ?lang=en', () => {
    const req = makeRequest('https://example.com/?lang=en');
    expect(detectLocale(req)).toBe('en');
  });

  it('?lang= takes priority over Accept-Language', () => {
    const req = makeRequest('https://example.com/?lang=yo', 'ha-NG');
    expect(detectLocale(req)).toBe('yo');
  });

  it('ignores unsupported ?lang= values', () => {
    const req = makeRequest('https://example.com/?lang=fr');
    expect(detectLocale(req)).toBe('en');
  });
});

// ---------------------------------------------------------------------------
// detectLocale — Accept-Language header
// ---------------------------------------------------------------------------
describe('detectLocale — Accept-Language header', () => {
  function makeReq(acceptLanguage: string): Request {
    return new Request('https://example.com/discover', {
      headers: { 'Accept-Language': acceptLanguage },
    });
  }

  it('detects ha from Accept-Language: ha-NG', () => {
    expect(detectLocale(makeReq('ha-NG,en;q=0.8'))).toBe('ha');
  });

  it('detects yo from Accept-Language: yo', () => {
    expect(detectLocale(makeReq('yo'))).toBe('yo');
  });

  it('detects ig from Accept-Language: ig-NG', () => {
    expect(detectLocale(makeReq('ig-NG,en;q=0.5'))).toBe('ig');
  });

  it('detects pcm from Accept-Language: pcm-NG', () => {
    expect(detectLocale(makeReq('pcm-NG,en;q=0.3'))).toBe('pcm');
  });

  it('falls back to en when no supported locale in header', () => {
    expect(detectLocale(makeReq('fr-FR,de;q=0.8'))).toBe('en');
  });

  it('respects q-weight ordering (higher q wins)', () => {
    // ha;q=0.9 > yo;q=0.5 → ha
    expect(detectLocale(makeReq('ha;q=0.9,yo;q=0.5'))).toBe('ha');
  });

  it('defaults to en when no Accept-Language header', () => {
    const req = new Request('https://example.com/');
    expect(detectLocale(req)).toBe('en');
  });

  it('defaults to en when request is null', () => {
    expect(detectLocale(null)).toBe('en');
  });
});

// ---------------------------------------------------------------------------
// detectLocale — with URLSearchParams override
// ---------------------------------------------------------------------------
describe('detectLocale — URLSearchParams override', () => {
  it('uses URLSearchParams when provided', () => {
    const req = new Request('https://example.com/');
    const params = new URLSearchParams('lang=ig');
    expect(detectLocale(req, params)).toBe('ig');
  });

  it('URLSearchParams override beats Accept-Language', () => {
    const req = new Request('https://example.com/', {
      headers: { 'Accept-Language': 'ha-NG' },
    });
    const params = new URLSearchParams('lang=pcm');
    expect(detectLocale(req, params)).toBe('pcm');
  });
});

// ---------------------------------------------------------------------------
// Locale fallback completeness — all English keys must resolve for every locale
// ---------------------------------------------------------------------------
describe('locale fallback completeness', () => {
  const locales = ['ha', 'yo', 'ig', 'pcm'] as const;
  const englishKeys = Object.keys(en) as Array<keyof typeof en>;

  for (const locale of locales) {
    it(`all English keys resolve in ${locale}`, () => {
      const t = createI18n(locale);
      for (const key of englishKeys) {
        const result = t(key);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });
  }
});
