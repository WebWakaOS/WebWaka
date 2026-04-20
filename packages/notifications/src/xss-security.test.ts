/**
 * N-125 — Template XSS security review tests (Phase 9).
 *
 * Adversarial injection scenarios for the email rendering pipeline.
 * Every injection payload must emerge HTML-escaped (entities or stripped)
 * in the final output — never as executable HTML/JS.
 *
 * Attack vectors:
 *   XSS-01  HTML tag injection in subject line
 *   XSS-02  Script tag injection in preheader
 *   XSS-03  Attribute breakout in displayName (theme)
 *   XSS-04  javascript: URL in unsubscribeUrl
 *   XSS-05  javascript: URL in CTA button URL (partials)
 *   XSS-06  Double-quote injection in logo alt attribute
 *   XSS-07  Backtick injection (template literal breakout)
 *   XSS-08  HTML entity in OTP partial code (prevent double-encoding confusion)
 *   XSS-09  Script injection in table row value (partials.renderKeyValueTable)
 *   XSS-10  SVG/onload vector in logo URL attribute
 *   XSS-11  Data URI injection in CTA URL
 *   XSS-12  Null-byte injection in subject
 *   XSS-13  Unicode direction-override in display name
 *   XSS-14  HTML injection in plain-text output (must not introduce tags)
 *
 * All tests assert: the rendered HTML does NOT contain the raw injection payload
 * as an executable construct, and the plain-text alternative is tag-free.
 */

import { describe, it, expect } from 'vitest';
import { wrapEmail } from './email-wrapper.js';
import { renderCtaButton, renderDataTable, renderOtpDisplay, escapeHtml, escapeAttr } from './partials.js';
import type { TenantTheme } from '@webwaka/white-label-theming';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTheme(overrides: Partial<TenantTheme> = {}): TenantTheme {
  return {
    tenantId: 'tenant_xss_test',
    tenantSlug: 'xss-test-corp',
    displayName: 'XSS Test Corp',
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
    tenantAddress: '1 Test Lane, Lagos',
    requiresWebwakaAttribution: false,
    ...overrides,
  };
}

const SAFE_UNSUB_URL = 'https://app.webwaka.com/unsubscribe?token=safe_token';
const BASE_WRAP = {
  bodyHtml: '<p>Hello, world.</p>',
  theme: makeTheme(),
  locale: 'en' as const,
  unsubscribeUrl: SAFE_UNSUB_URL,
  planTier: 'growth',
};

// ---------------------------------------------------------------------------
// XSS-01: HTML tag injection in subject line
// ---------------------------------------------------------------------------

describe('XSS-01 — HTML tag injection in subject line', () => {
  it('<script> in subject is HTML-escaped in rendered output', () => {
    const { html } = wrapEmail({
      ...BASE_WRAP,
      subject: '<script>alert("XSS")</script>',
    });
    expect(html).not.toContain('<script>alert("XSS")</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('<img src=x onerror=alert(1)> in subject is escaped', () => {
    const { html } = wrapEmail({
      ...BASE_WRAP,
      subject: '<img src=x onerror=alert(1)>',
    });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
  });

  it('plain-text output does not contain raw <script> tag', () => {
    const { plainText } = wrapEmail({
      ...BASE_WRAP,
      subject: '<script>alert("XSS")</script>',
    });
    expect(plainText).not.toContain('<script>');
  });
});

// ---------------------------------------------------------------------------
// XSS-02: Script tag injection in preheader
// ---------------------------------------------------------------------------

describe('XSS-02 — Script tag injection in preheader', () => {
  it('<script> in preheader is escaped', () => {
    const { html } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Normal Subject',
      preheader: '<script>document.cookie</script>Preview text',
    });
    expect(html).not.toContain('<script>document.cookie</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('event handler in preheader is escaped', () => {
    const { html } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Normal Subject',
      preheader: '<p onclick="steal()">Preview</p>',
    });
    expect(html).not.toContain('onclick="steal()"');
  });
});

// ---------------------------------------------------------------------------
// XSS-03: Attribute breakout in displayName (theme)
// ---------------------------------------------------------------------------

describe('XSS-03 — Attribute breakout in displayName', () => {
  it('double-quote in displayName cannot break out of HTML attribute context', () => {
    const { html } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Test',
      theme: makeTheme({ displayName: 'Evil" onload="alert(1)' }),
    });
    expect(html).not.toContain('" onload="alert(1)"');
    expect(html).toContain('&quot;');
  });

  it('single-quote in displayName is escaped', () => {
    const { html } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Test',
      theme: makeTheme({ displayName: "Evil' onerror='x" }),
    });
    expect(html).not.toContain("' onerror='x'");
    expect(html).toContain('&#39;');
  });
});

// ---------------------------------------------------------------------------
// XSS-04: javascript: URL in unsubscribeUrl
// ---------------------------------------------------------------------------

describe('XSS-04 — javascript: URL in unsubscribeUrl', () => {
  it('javascript: scheme in unsubscribeUrl is escaped, not injected as live href', () => {
    const { html } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Test',
      unsubscribeUrl: 'javascript:alert(document.domain)',
    });
    expect(html).not.toContain('href="javascript:alert(document.domain)"');
    expect(html).not.toContain("href='javascript:");
  });

  it('data: URI in unsubscribeUrl is escaped', () => {
    const { html } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Test',
      unsubscribeUrl: 'data:text/html,<script>alert(1)</script>',
    });
    expect(html).not.toContain('href="data:text/html,<script>');
  });
});

// ---------------------------------------------------------------------------
// XSS-05: javascript: URL in CTA button (partials)
// ---------------------------------------------------------------------------

describe('XSS-05 — javascript: URL in CTA button URL (partials)', () => {
  it('javascript: scheme in CTA URL is escaped, cannot form live href', () => {
    const rendered = renderCtaButton('Click me', 'javascript:steal()', '#0F4C81');
    expect(rendered).not.toContain('href="javascript:steal()"');
    expect(rendered).not.toContain("href='javascript:");
  });

  it('<script> in CTA label is escaped', () => {
    const rendered = renderCtaButton('<script>x()</script>', 'https://safe.example.com', '#0F4C81');
    expect(rendered).not.toContain('<script>x()</script>');
    expect(rendered).toContain('&lt;script&gt;');
  });
});

// ---------------------------------------------------------------------------
// XSS-06: Double-quote injection in logo URL alt attribute
// ---------------------------------------------------------------------------

describe('XSS-06 — double-quote injection in logo URL alt attribute', () => {
  it('displayName with double-quote is escaped in img alt', () => {
    const theme = makeTheme({
      displayName: 'Co" alt="" src="https://evil.com/img.png',
    });
    const { html } = wrapEmail({ ...BASE_WRAP, subject: 'Test', theme });
    expect(html).not.toContain('alt="" src="https://evil.com/img.png"');
    expect(html).toContain('&quot;');
  });
});

// ---------------------------------------------------------------------------
// XSS-07: Backtick injection
// ---------------------------------------------------------------------------

describe('XSS-07 — backtick injection (template literal breakout)', () => {
  it('backtick in subject is escaped', () => {
    const { html } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Hello `${process.env.SECRET}`',
    });
    expect(html).not.toContain('`${process.env.SECRET}`');
    expect(html).toContain('&#96;');
  });
});

// ---------------------------------------------------------------------------
// XSS-08: OTP partial — HTML entities in OTP code
// ---------------------------------------------------------------------------

describe('XSS-08 — OTP partial: numeric OTP code is safe', () => {
  it('renders 6-digit OTP without any HTML injection risk', () => {
    const rendered = renderOtpDisplay('123456', 'Valid for 5 minutes');
    expect(rendered).toContain('123456');
    expect(rendered).not.toContain('<script>');
  });

  it('script in expiryNote is escaped', () => {
    const rendered = renderOtpDisplay('999888', '<script>alert(1)</script>Valid for 5 minutes');
    expect(rendered).not.toContain('<script>alert(1)</script>');
    expect(rendered).toContain('&lt;script&gt;');
  });
});

// ---------------------------------------------------------------------------
// XSS-09: renderKeyValueTable — script injection in row value
// ---------------------------------------------------------------------------

describe('XSS-09 — renderDataTable: script injection in row value', () => {
  it('script tag in row value is escaped', () => {
    const rendered = renderDataTable(
      [{ label: 'Amount', value: '<script>steal()</script>₦1,000' }],
      'Summary',
    );
    expect(rendered).not.toContain('<script>steal()</script>');
    expect(rendered).toContain('&lt;script&gt;');
  });

  it('HTML in row label is escaped', () => {
    const rendered = renderDataTable(
      [{ label: '<b>Evil</b>', value: '₦1,000' }],
    );
    expect(rendered).not.toContain('<b>Evil</b>');
    expect(rendered).toContain('&lt;b&gt;');
  });
});

// ---------------------------------------------------------------------------
// XSS-10: SVG/onload vector in logo URL
// ---------------------------------------------------------------------------

describe('XSS-10 — SVG/onload vector in logo URL attribute', () => {
  it('logo URL with onload event is escaped in img src', () => {
    const theme = makeTheme({
      logoUrl: 'https://cdn.test/logo.png" onload="alert(1)',
    });
    const { html } = wrapEmail({ ...BASE_WRAP, subject: 'Test', theme });
    expect(html).not.toContain('" onload="alert(1)"');
    expect(html).toContain('&quot;');
  });
});

// ---------------------------------------------------------------------------
// XSS-11: Data URI in CTA URL
// ---------------------------------------------------------------------------

describe('XSS-11 — data: URI injection in CTA URL', () => {
  it('data: URI in CTA label link is escaped', () => {
    const rendered = renderCtaButton('View', "data:text/html,<script>alert(1)</script>", '#0F4C81');
    expect(rendered).not.toContain('href="data:text/html,<script>');
  });
});

// ---------------------------------------------------------------------------
// XSS-12: Null-byte in subject
// ---------------------------------------------------------------------------

describe('XSS-12 — null-byte injection in subject', () => {
  it('null-byte in subject does not appear in HTML output', () => {
    const { html } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Hello\x00World',
    });
    expect(html).not.toContain('\x00');
  });
});

// ---------------------------------------------------------------------------
// XSS-13: Unicode direction-override in displayName
// ---------------------------------------------------------------------------

describe('XSS-13 — Unicode direction-override in displayName', () => {
  it('RLO (U+202E) direction override is harmlessly included but not a code execution risk', () => {
    const { html } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Test',
      theme: makeTheme({ displayName: 'Evil\u202EprocCorp' }),
    });
    expect(html).not.toContain('<script>');
  });
});

// ---------------------------------------------------------------------------
// XSS-14: Plain-text alternative must not contain HTML tags
// ---------------------------------------------------------------------------

describe('XSS-14 — plain-text alternative is tag-free', () => {
  it('bodyHtml with multiple tags produces tag-free plain-text', () => {
    const { plainText } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Test',
      bodyHtml: '<h1>Hello</h1><p>World <strong>bold</strong></p><a href="https://x.com">link</a>',
    });
    expect(plainText).not.toMatch(/<[a-zA-Z]/);
  });

  it('script injection in bodyHtml does not appear as tag in plain-text', () => {
    const { plainText } = wrapEmail({
      ...BASE_WRAP,
      subject: 'Test',
      bodyHtml: '<p>Normal text</p><script>alert("xss")</script>',
    });
    expect(plainText).not.toContain('<script>');
    expect(plainText).not.toContain('</script>');
  });
});

// ---------------------------------------------------------------------------
// escapeHtml / escapeAttr unit tests (direct coverage)
// ---------------------------------------------------------------------------

describe('escapeHtml — entity encoding', () => {
  it('escapes &', () => expect(escapeHtml('a & b')).toContain('&amp;'));
  it('escapes <', () => expect(escapeHtml('<script>')).toContain('&lt;'));
  it('escapes >', () => expect(escapeHtml('</p>')).toContain('&gt;'));
  it('escapes "', () => expect(escapeHtml('"quoted"')).toContain('&quot;'));
  it("escapes '", () => expect(escapeHtml("it's")).toContain('&#39;'));
  it('returns empty string for empty input', () => expect(escapeHtml('')).toBe(''));
  it('handles numbers', () => expect(escapeHtml(42)).toBe('42'));
});

describe('escapeAttr — additional escaping over escapeHtml', () => {
  it('escapes backtick', () => expect(escapeAttr('hello`world')).toContain('&#96;'));
  it('escapes equals sign', () => expect(escapeAttr('k=v')).toContain('&#61;'));
  it('still escapes <', () => expect(escapeAttr('<')).toContain('&lt;'));
});
