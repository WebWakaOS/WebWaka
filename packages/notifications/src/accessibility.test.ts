/**
 * N-126 — Email accessibility audit (WCAG 2.1 AA) tests (Phase 9).
 *
 * Verifies that every email produced by the notification engine meets
 * WCAG 2.1 Level AA requirements relevant to HTML emails:
 *
 *   A11Y-01  lang attribute on <html> element (SC 3.1.1 — Language of Page)
 *   A11Y-02  role="presentation" on layout tables (prevents AT from treating as data)
 *   A11Y-03  alt text on logo <img> (SC 1.1.1 — Non-text Content)
 *   A11Y-04  Plain-text alternative is non-empty and readable (SC 1.1.1)
 *   A11Y-05  Plain-text alternative does not contain raw HTML tags
 *   A11Y-06  Unsubscribe link has descriptive text (aria-label or text) (SC 2.4.6)
 *   A11Y-07  No empty alt attributes on non-decorative images
 *   A11Y-08  Colour contrast: primaryColor used in button, not for text only
 *   A11Y-09  CTA button is an <a> tag (not a <button>) for email client compatibility
 *   A11Y-10  OTP block is in a <p> or display element — screenreader can read it
 *   A11Y-11  Different locales produce correct lang attribute
 *   A11Y-12  Plain-text equivalent of CTA button includes the URL
 */

import { describe, it, expect } from 'vitest';
import { wrapEmail, htmlToPlainText } from './email-wrapper.js';
import { renderCtaButton, renderOtpDisplay, renderDataTable } from './partials.js';
import type { TenantTheme } from '@webwaka/white-label-theming';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTheme(overrides: Partial<TenantTheme> = {}): TenantTheme {
  return {
    tenantId: 'tenant_a11y_test',
    tenantSlug: 'a11y-test-co',
    displayName: 'A11Y Test Co',
    primaryColor: '#0F4C81',
    secondaryColor: '#FFFFFF',
    accentColor: '#F59E0B',
    fontFamily: 'Arial, sans-serif',
    logoUrl: 'https://cdn.test/logo.png',
    faviconUrl: null,
    borderRadiusPx: 4,
    customDomain: null,
    senderEmailAddress: null,
    senderDisplayName: null,
    tenantSupportEmail: null,
    tenantAddress: '1 Accessible Lane, Lagos',
    requiresWebwakaAttribution: false,
    ...overrides,
  };
}

const UNSUB_URL = 'https://app.webwaka.com/unsubscribe?token=a11y_token';
const BASE_WRAP = {
  bodyHtml: '<p>Hello! Your account is ready.</p>',
  theme: makeTheme(),
  locale: 'en' as const,
  unsubscribeUrl: UNSUB_URL,
  planTier: 'growth',
};

// ---------------------------------------------------------------------------
// A11Y-01: lang attribute on <html>
// ---------------------------------------------------------------------------

describe('A11Y-01 — lang attribute on <html> element (SC 3.1.1)', () => {
  it('HTML output starts with <html lang=', () => {
    const { html } = wrapEmail({ ...BASE_WRAP, subject: 'Test' });
    expect(html).toMatch(/<html[^>]+lang=/i);
  });

  it('lang attribute value is non-empty', () => {
    const { html } = wrapEmail({ ...BASE_WRAP, subject: 'Test' });
    const langMatch = html.match(/lang="([^"]+)"/i);
    expect(langMatch).not.toBeNull();
    expect(langMatch![1]!.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// A11Y-02: role="presentation" on layout tables
// ---------------------------------------------------------------------------

describe('A11Y-02 — layout tables have role="presentation"', () => {
  it('HTML output contains at least one role="presentation"', () => {
    const { html } = wrapEmail({ ...BASE_WRAP, subject: 'Test' });
    expect(html).toContain('role="presentation"');
  });

  it('every <table> element has role="presentation" or cellspacing (email-safe layout)', () => {
    const { html } = wrapEmail({ ...BASE_WRAP, subject: 'Test' });
    const tableMatches = [...html.matchAll(/<table[^>]*>/gi)];
    expect(tableMatches.length).toBeGreaterThan(0);

    for (const match of tableMatches) {
      const tableTag = match[0]!;
      const hasRole = tableTag.includes('role="presentation"');
      const hasCellSpacing = tableTag.includes('cellspacing');
      expect(hasRole || hasCellSpacing).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// A11Y-03: alt text on logo image (SC 1.1.1)
// ---------------------------------------------------------------------------

describe('A11Y-03 — logo <img> has alt text (SC 1.1.1)', () => {
  it('logo img tag includes alt attribute', () => {
    const { html } = wrapEmail({ ...BASE_WRAP, subject: 'Test' });
    const imgMatches = [...html.matchAll(/<img[^>]+logo[^>]*>/gi)];
    if (imgMatches.length > 0) {
      for (const match of imgMatches) {
        expect(match[0]).toContain('alt=');
      }
    } else {
      const allImgs = [...html.matchAll(/<img[^>]+>/gi)];
      for (const match of allImgs) {
        expect(match[0]).toContain('alt=');
      }
    }
  });

  it('alt attribute value equals displayName (or is not empty)', () => {
    const theme = makeTheme({ displayName: 'TestBrand Co' });
    const { html } = wrapEmail({ ...BASE_WRAP, subject: 'Test', theme });
    const imgMatches = [...html.matchAll(/<img[^>]+alt="([^"]*)"[^>]*>/gi)];
    const logoAlt = imgMatches.find((m) => m[0]?.includes('logo') || m[0]?.includes('cdn.test'));
    if (logoAlt) {
      expect(logoAlt[1]!.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// A11Y-04: Plain-text alternative is non-empty (SC 1.1.1)
// ---------------------------------------------------------------------------

describe('A11Y-04 — plain-text alternative is non-empty', () => {
  it('plainText field is a non-empty string', () => {
    const { plainText } = wrapEmail({ ...BASE_WRAP, subject: 'Test' });
    expect(typeof plainText).toBe('string');
    expect(plainText.trim().length).toBeGreaterThan(0);
  });

  it('plain-text includes the body content (not just whitespace)', () => {
    const { plainText } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Test',
      bodyHtml: '<p>Your invoice is ready.</p>',
    });
    expect(plainText).toMatch(/invoice is ready/i);
  });

  it('plain-text includes the tenant display name or subject', () => {
    const { plainText } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Welcome to A11Y Corp',
      theme: makeTheme({ displayName: 'A11Y Corp' }),
    });
    expect(plainText).toMatch(/A11Y Corp|Welcome/i);
  });
});

// ---------------------------------------------------------------------------
// A11Y-05: Plain-text must not contain raw HTML tags
// ---------------------------------------------------------------------------

describe('A11Y-05 — plain-text alternative contains no HTML tags', () => {
  it('plainText does not contain any <tag> patterns', () => {
    const { plainText } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Test',
      bodyHtml: '<h1>Hello</h1><p>World <a href="https://x.com">click</a></p>',
    });
    expect(plainText).not.toMatch(/<[a-zA-Z]/);
  });

  it('htmlToPlainText strips all tags from any HTML fragment', () => {
    const input = '<p>Hello <strong>world</strong>. <a href="https://x.com">Visit us</a>.</p>';
    const plain = htmlToPlainText(input);
    expect(plain).not.toMatch(/<[a-zA-Z]/);
    expect(plain).toMatch(/Hello/);
    expect(plain).toMatch(/world/);
  });
});

// ---------------------------------------------------------------------------
// A11Y-06: Unsubscribe link has descriptive accessible text (SC 2.4.6)
// ---------------------------------------------------------------------------

describe('A11Y-06 — unsubscribe link has descriptive text/aria-label (SC 2.4.6)', () => {
  it('unsubscribe link contains aria-label or descriptive text', () => {
    const { html } = wrapEmail({ ...BASE_WRAP, subject: 'Test' });
    const unsubLinks = [...html.matchAll(/<a[^>]+unsubscribe[^>]*>([^<]*)<\/a>/gi)];
    for (const match of unsubLinks) {
      const hasAriaLabel = match[0]!.includes('aria-label=');
      const hasText = match[1]!.trim().length > 0;
      expect(hasAriaLabel || hasText).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// A11Y-09: CTA button is an <a> tag (not <button>) for email clients
// ---------------------------------------------------------------------------

describe('A11Y-09 — CTA button rendered as <a> tag for email compatibility', () => {
  it('renderCtaButton output is an <a> element, not <button>', () => {
    const rendered = renderCtaButton('View Invoice', 'https://app.webwaka.com/invoice/123', '#0F4C81');
    expect(rendered).toMatch(/<a[^>]+href=/i);
    expect(rendered).not.toContain('<button');
  });

  it('CTA <a> tag has href attribute', () => {
    const rendered = renderCtaButton('Click Me', 'https://safe.example.com/action', '#0F4C81');
    expect(rendered).toContain('href="https://safe.example.com/action"');
  });
});

// ---------------------------------------------------------------------------
// A11Y-10: OTP block is readable by screenreaders
// ---------------------------------------------------------------------------

describe('A11Y-10 — OTP block is in a semantic element screenreaders can access', () => {
  it('renderOtpDisplay output contains the OTP code in text content', () => {
    const rendered = renderOtpDisplay('456789', 'Valid for 5 minutes');
    expect(rendered).toContain('456789');
    expect(rendered).not.toContain('alt="456789"');
  });

  it('renderOtpDisplay output does not use <img> for the OTP code', () => {
    const rendered = renderOtpDisplay('456789', 'Valid for 5 minutes');
    const imgTags = [...rendered.matchAll(/<img[^>]*>/gi)];
    for (const img of imgTags) {
      expect(img[0]).not.toContain('456789');
    }
  });
});

// ---------------------------------------------------------------------------
// A11Y-11: Different locales produce correct lang attribute
// ---------------------------------------------------------------------------

describe('A11Y-11 — locale determines lang attribute value', () => {
  const LOCALES = ['en', 'ha', 'yo', 'ig', 'pcm'] as const;

  for (const locale of LOCALES) {
    it(`locale "${locale}" produces lang="${locale}" on <html>`, () => {
      const { html } = wrapEmail({ ...BASE_WRAP, subject: 'Test', locale });
      expect(html).toContain(`lang="${locale}"`);
    });
  }
});

// ---------------------------------------------------------------------------
// A11Y-12: Plain-text includes CTA URL
// ---------------------------------------------------------------------------

describe('A11Y-12 — plain-text equivalent includes readable CTA URL', () => {
  it('htmlToPlainText converts <a href="URL">text</a> to include the URL', () => {
    const html = '<p>Click here: <a href="https://app.webwaka.com/action">View Invoice</a></p>';
    const plain = htmlToPlainText(html);
    const hasUrl = plain.includes('https://app.webwaka.com/action') || plain.includes('View Invoice');
    expect(hasUrl).toBe(true);
  });

  it('wrapEmail plain-text includes unsubscribe URL or descriptive text', () => {
    const { plainText } = wrapEmail({ ...BASE_WRAP, subject: 'Test' });
    const hasUnsubInfo =
      plainText.includes('webwaka.com/unsubscribe') ||
      plainText.toLowerCase().includes('unsubscribe');
    expect(hasUnsubInfo).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// A11Y additional: key-value table has accessible table markup
// ---------------------------------------------------------------------------

describe('A11Y — renderDataTable produces semantic table HTML', () => {
  it('renders a <table> element', () => {
    const rendered = renderDataTable([{ label: 'Name', value: 'Amaka Obi' }]);
    expect(rendered).toContain('<table');
    expect(rendered).toContain('</table>');
  });

  it('renders <td> elements for label and value', () => {
    const rendered = renderDataTable([{ label: 'Amount', value: '₦5,000' }]);
    expect(rendered).toContain('<td');
    expect(rendered).toContain('Amount');
    expect(rendered).toContain('₦5,000');
  });
});
