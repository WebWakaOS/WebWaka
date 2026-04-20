/**
 * Email wrapper tests (N-031, N-038, Phase 3).
 *
 * Covers:
 *   - wrapEmail: wraps HTML body in complete email shell with brand colours
 *   - wrapEmail: reserved brand vars (tenant_name, unsubscribe_url) from theme
 *   - wrapEmail: requires_webwaka_attribution flag adds attribution footer
 *   - wrapEmail: preheader injected when provided
 *   - wrapEmail: address + support email from theme in legal footer
 *   - htmlToPlainText: strips HTML tags (N-038)
 *   - htmlToPlainText: preserves hyperlink text and URLs
 *   - htmlToPlainText: collapses multiple blank lines to max one blank line
 *   - G4: brand context applied (primary colour in output when theme provided)
 *
 * NOTE on URL HTML-encoding:
 *   escapeAttr() encodes '=' as '&#61;' and '?' as '&#63;' in href attributes.
 *   Tests check for the attribute-escaped form when testing raw HTML.
 */

import { describe, it, expect } from 'vitest';
import { wrapEmail, htmlToPlainText } from './email-wrapper.js';
import type { WrapEmailOptions } from './email-wrapper.js';

// ---------------------------------------------------------------------------
// Minimal TenantTheme fixture
// ---------------------------------------------------------------------------

const MINIMAL_THEME = {
  tenantId: 'ten_acme',
  tenantSlug: 'acmecorp',
  displayName: 'AcmeCorp',
  primaryColor: '#e63946',
  secondaryColor: '#1e293b',
  accentColor: '#f59e0b',
  logoUrl: 'https://example.com/logo.png',
  faviconUrl: null,
  fontFamily: 'Inter, sans-serif',
  borderRadiusPx: 6,
  customDomain: null,
  requiresWebwakaAttribution: false,
  senderEmailAddress: 'hello@acme.com',
  senderDisplayName: 'AcmeCorp',
  tenantSupportEmail: 'support@acme.com',
  tenantAddress: '1 Acme Street, Lagos',
};

function makeOpts(overrides: Partial<WrapEmailOptions> = {}): WrapEmailOptions {
  return {
    subject: 'Test Email Subject',
    bodyHtml: '<p>Hello <strong>World</strong>!</p>',
    theme: MINIMAL_THEME,
    locale: 'en',
    unsubscribeUrl: 'https://api.webwaka.com/notifications/unsubscribe?token=abc',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// wrapEmail
// ---------------------------------------------------------------------------

describe('wrapEmail', () => {
  it('returns a WrappedEmail with html and plainText fields', () => {
    const result = wrapEmail(makeOpts());
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('plainText');
    expect(typeof result.html).toBe('string');
    expect(typeof result.plainText).toBe('string');
  });

  it('wraps body content in DOCTYPE + <html> shell', () => {
    const result = wrapEmail(makeOpts());
    expect(result.html).toContain('<!DOCTYPE html');
    expect(result.html).toContain('<html');
    expect(result.html).toContain('</html>');
  });

  it('includes the original body HTML content', () => {
    const result = wrapEmail(makeOpts({ bodyHtml: '<p>Special content here</p>' }));
    expect(result.html).toContain('Special content here');
  });

  it('applies primary brand colour from theme', () => {
    const result = wrapEmail(makeOpts());
    expect(result.html).toContain('#e63946');
  });

  it('includes logo URL from theme', () => {
    const result = wrapEmail(makeOpts());
    expect(result.html).toContain('https://example.com/logo.png');
  });

  it('includes unsubscribe URL in the HTML (HTML-attribute encoded)', () => {
    const result = wrapEmail(makeOpts());
    // escapeAttr() encodes '=' as '&#61;', so we check for the host+path
    expect(result.html).toContain('https://api.webwaka.com/notifications/unsubscribe');
    // The full URL including encoded params is present in the href
    expect(result.html).toContain('token');
  });

  it('includes tenant display name (from theme) in HTML', () => {
    const result = wrapEmail(makeOpts());
    // AcmeCorp should appear — used as alt text, in footer, etc.
    expect(result.html).toContain('AcmeCorp');
  });

  it('includes preheader text when provided', () => {
    const result = wrapEmail(makeOpts({ preheader: 'Your invoice is ready' }));
    expect(result.html).toContain('Your invoice is ready');
  });

  it('adds WebWaka attribution footer when requiresWebwakaAttribution=true', () => {
    const theme = { ...MINIMAL_THEME, requiresWebwakaAttribution: true };
    const result = wrapEmail(makeOpts({ theme }));
    // Attribution should reference WebWaka somewhere
    expect(result.html.toLowerCase()).toContain('webwaka');
  });

  it('omits "Powered by WebWaka" attribution when requiresWebwakaAttribution=false', () => {
    const theme = { ...MINIMAL_THEME, requiresWebwakaAttribution: false };
    const result = wrapEmail(makeOpts({ theme }));
    const attributionMatch = result.html.match(/powered by.*webwaka/i);
    expect(attributionMatch).toBeNull();
  });

  it('includes tenant address from theme in footer', () => {
    const result = wrapEmail(makeOpts());
    expect(result.html).toContain('1 Acme Street, Lagos');
  });

  it('generates plain text version (N-038)', () => {
    const result = wrapEmail(makeOpts({ bodyHtml: '<p>Hello <a href="https://example.com">World</a></p>' }));
    expect(result.plainText).toContain('Hello');
    expect(result.plainText).not.toContain('<p>');
    expect(result.plainText).not.toContain('<a ');
  });

  it('renders without subject field in WrappedEmail (subject is for metadata only)', () => {
    // WrappedEmail only has { html, plainText } — subject is NOT in the output shape
    const result = wrapEmail(makeOpts({ subject: 'Unique Subject 123' }));
    // The subject appears inside the <title> tag in the HTML, not as a separate property
    expect(result.html).toContain('Unique Subject 123');
    expect((result as unknown as Record<string, unknown>).subject).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// htmlToPlainText (N-038)
// ---------------------------------------------------------------------------

describe('htmlToPlainText', () => {
  it('strips block-level tags and inserts newlines', () => {
    const html = '<p>First paragraph</p><p>Second paragraph</p>';
    const result = htmlToPlainText(html);
    expect(result).toContain('First paragraph');
    expect(result).toContain('Second paragraph');
    expect(result).not.toContain('<p>');
  });

  it('converts <br> and <br/> to newlines', () => {
    const html = 'Line 1<br>Line 2<br/>Line 3';
    const result = htmlToPlainText(html);
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
    expect(result).toContain('Line 3');
    expect(result).not.toContain('<br');
  });

  it('extracts link text and appends URL', () => {
    const html = '<a href="https://example.com">Click here</a>';
    const result = htmlToPlainText(html);
    expect(result).toContain('Click here');
    expect(result).toContain('https://example.com');
  });

  it('strips unknown/inline HTML tags', () => {
    const html = '<span class="bold"><strong>Bold text</strong></span>';
    const result = htmlToPlainText(html);
    expect(result).toContain('Bold text');
    expect(result).not.toContain('<span');
    expect(result).not.toContain('<strong>');
  });

  it('collapses multiple consecutive blank lines to at most two newlines', () => {
    const html = '<p>A</p><p></p><p></p><p>B</p>';
    const result = htmlToPlainText(html);
    // Should not have more than 2 consecutive newlines
    expect(result).not.toMatch(/\n{3,}/);
  });

  it('decodes basic HTML entities', () => {
    const html = '<p>Hello &amp; world &lt;3 &gt;_&lt; &quot;quoted&quot;</p>';
    const result = htmlToPlainText(html);
    expect(result).toContain('Hello & world');
    expect(result).toContain('<3');
    expect(result).toContain('"quoted"');
  });

  it('handles empty string input', () => {
    const result = htmlToPlainText('');
    expect(result).toBe('');
  });

  it('handles plain text input (no HTML)', () => {
    const result = htmlToPlainText('Just plain text');
    expect(result).toContain('Just plain text');
  });
});
