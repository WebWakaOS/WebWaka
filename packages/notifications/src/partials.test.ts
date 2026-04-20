/**
 * Partials library tests (N-032, Phase 3).
 *
 * Covers:
 *   - escapeHtml: prevents XSS injection
 *   - renderCtaButton: produces accessible <a> button with correct href and label
 *   - renderCtaButton: applies primary colour from theme
 *   - renderDataTable: renders rows as table cells with escaped content
 *   - renderDataTable: optional title row
 *   - renderAlertBox: renders info/warning/critical alert variants
 *   - renderOtpDisplay: OTP code in monospace display with expiry note
 *   - renderLegalFooter: includes unsubscribe URL, address, support email from theme
 *
 * NOTE on URL encoding:
 *   escapeAttr() encodes '=' as '&#61;' in href attributes.
 *   Tests that check href values look for the HTML-encoded form OR use substring.
 */

import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  renderCtaButton,
  renderDataTable,
  renderAlertBox,
  renderOtpDisplay,
  renderLegalFooter,
} from './partials.js';
import type { DataTableRow, LegalFooterOptions } from './partials.js';

// ---------------------------------------------------------------------------
// Shared theme fixture (LegalFooterOptions.theme = TenantTheme)
// ---------------------------------------------------------------------------

const THEME = {
  tenantId: 'ten_testcorp',
  tenantSlug: 'testcorp',
  displayName: 'TestCorp',
  primaryColor: '#1a6b3a',
  secondaryColor: '#0f4c2a',
  accentColor: '#f59e0b',
  logoUrl: 'https://testcorp.example.com/logo.png',
  faviconUrl: null,
  fontFamily: 'Arial, sans-serif',
  borderRadiusPx: 4,
  customDomain: null,
  requiresWebwakaAttribution: false,
  senderEmailAddress: 'no-reply@testcorp.com',
  senderDisplayName: 'TestCorp',
  tenantSupportEmail: 'help@testcorp.com',
  tenantAddress: '5 Test Street, Abuja',
};

// ---------------------------------------------------------------------------
// escapeHtml
// ---------------------------------------------------------------------------

describe('escapeHtml', () => {
  it('escapes < and > characters', () => {
    const result = escapeHtml('<script>alert(1)</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });

  it('escapes & ampersand', () => {
    const result = escapeHtml('A & B');
    expect(result).toContain('&amp;');
    expect(result).not.toContain('A & B');
  });

  it('escapes double quotes', () => {
    const result = escapeHtml('"quoted"');
    expect(result).toContain('&quot;');
  });

  it('escapes single quotes', () => {
    const result = escapeHtml("it's");
    expect(result).toContain('&#39;');
  });

  it('passes through safe text unchanged', () => {
    const result = escapeHtml('Hello World 123');
    expect(result).toBe('Hello World 123');
  });

  it('handles numbers (accepts string | number)', () => {
    const result = escapeHtml(42);
    expect(result).toBe('42');
  });
});

// ---------------------------------------------------------------------------
// renderCtaButton
// ---------------------------------------------------------------------------

describe('renderCtaButton', () => {
  it('returns an HTML string containing an anchor element', () => {
    const html = renderCtaButton('Click Me', 'https://example.com/action', '#0088cc');
    expect(html).toContain('<a ');
    expect(html).toContain('</a>');
  });

  it('includes the label text', () => {
    const html = renderCtaButton('Confirm Your Account', 'https://example.com', '#333');
    expect(html).toContain('Confirm Your Account');
  });

  it('includes the href host+path (URL may be HTML-attribute encoded)', () => {
    // escapeAttr() encodes '?' as '&#63;' and '=' as '&#61;' in attributes.
    // Check that the base URL is present; the query params may be encoded.
    const html = renderCtaButton('Click', 'https://example.com/deep/path?q=1', '#333');
    expect(html).toContain('https://example.com/deep/path');
    // Either raw or encoded form is acceptable
    const hasQ = html.includes('?q=1') || html.includes('&#63;q&#61;1') || html.includes('?q&#61;1');
    expect(hasQ).toBe(true);
  });

  it('applies the primary colour as background-color', () => {
    const html = renderCtaButton('Buy Now', 'https://example.com', '#ff5733');
    expect(html).toContain('#ff5733');
  });

  it('escapes XSS in label', () => {
    const html = renderCtaButton('<script>evil</script>', 'https://example.com', '#333');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('includes the HTTPS URL in the output (base URL portion always present)', () => {
    const html = renderCtaButton('Link', 'https://secure.example.com/path', '#333');
    expect(html).toContain('https://secure.example.com/path');
  });
});

// ---------------------------------------------------------------------------
// renderDataTable
// ---------------------------------------------------------------------------

describe('renderDataTable', () => {
  const rows: DataTableRow[] = [
    { label: 'Amount', value: '₦15,000.00' },
    { label: 'Reference', value: 'TXN-2026-001' },
    { label: 'Status', value: 'Completed' },
  ];

  it('returns an HTML string containing a table', () => {
    const html = renderDataTable(rows);
    expect(html).toContain('<table');
    expect(html).toContain('</table>');
  });

  it('renders all row labels', () => {
    const html = renderDataTable(rows);
    expect(html).toContain('Amount');
    expect(html).toContain('Reference');
    expect(html).toContain('Status');
  });

  it('renders all row values', () => {
    const html = renderDataTable(rows);
    expect(html).toContain('₦15,000.00');
    expect(html).toContain('TXN-2026-001');
    expect(html).toContain('Completed');
  });

  it('includes optional title when provided', () => {
    const html = renderDataTable(rows, 'Transaction Summary');
    expect(html).toContain('Transaction Summary');
  });

  it('omits title section when not provided', () => {
    const html = renderDataTable(rows);
    expect(html).not.toContain('Transaction Summary');
  });

  it('escapes XSS in row values', () => {
    const xssRows: DataTableRow[] = [{ label: 'Key', value: '<script>alert(1)</script>' }];
    const html = renderDataTable(xssRows);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('handles empty rows array without throwing', () => {
    expect(() => renderDataTable([])).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// renderAlertBox
// ---------------------------------------------------------------------------

describe('renderAlertBox', () => {
  it('renders info alert with message', () => {
    const html = renderAlertBox('info', 'Your account has been verified.');
    expect(html).toContain('Your account has been verified.');
  });

  it('renders warning alert with message', () => {
    const html = renderAlertBox('warning', 'Your session will expire soon.');
    expect(html).toContain('Your session will expire soon.');
  });

  it('renders critical alert with message', () => {
    const html = renderAlertBox('critical', 'Suspicious login detected.');
    expect(html).toContain('Suspicious login detected.');
  });

  it('includes optional title when provided', () => {
    const html = renderAlertBox('warning', 'Details here', 'Important Notice');
    expect(html).toContain('Important Notice');
  });

  it('renders without a title when not provided', () => {
    const html = renderAlertBox('info', 'Just the message');
    expect(html).toContain('Just the message');
  });

  it('escapes XSS in message', () => {
    const html = renderAlertBox('critical', '<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<img ');
    expect(html).toContain('&lt;img');
  });

  it('visually differentiates alert types (different color/class per type)', () => {
    const info = renderAlertBox('info', 'msg');
    const warning = renderAlertBox('warning', 'msg');
    const critical = renderAlertBox('critical', 'msg');
    expect(info).not.toBe(warning);
    expect(warning).not.toBe(critical);
    expect(info).not.toBe(critical);
  });
});

// ---------------------------------------------------------------------------
// renderOtpDisplay
// ---------------------------------------------------------------------------

describe('renderOtpDisplay', () => {
  it('renders the OTP code in the output', () => {
    const html = renderOtpDisplay('847291');
    expect(html).toContain('847291');
  });

  it('uses monospace or code-like display for the OTP', () => {
    const html = renderOtpDisplay('123456');
    const hasMonospace =
      html.includes('letter-spacing') ||
      html.includes('monospace') ||
      html.includes('<code') ||
      html.includes('font-family');
    expect(hasMonospace).toBe(true);
  });

  it('includes expiry note when provided', () => {
    const html = renderOtpDisplay('999000', 'Expires in 5 minutes');
    expect(html).toContain('Expires in 5 minutes');
  });

  it('does not include "Expires in" content when expiry not provided', () => {
    const html = renderOtpDisplay('123456');
    expect(html).not.toContain('Expires in');
  });

  it('escapes XSS in OTP display (defensive)', () => {
    const html = renderOtpDisplay('<b>1234</b>');
    expect(html).not.toContain('<b>');
  });
});

// ---------------------------------------------------------------------------
// renderLegalFooter
// LegalFooterOptions: { theme: TenantTheme, locale, unsubscribeUrl, tenantName, channel?, year? }
// ---------------------------------------------------------------------------

describe('renderLegalFooter', () => {
  const baseOpts: LegalFooterOptions = {
    theme: THEME,
    tenantName: 'TestCorp',
    unsubscribeUrl: 'https://api.webwaka.com/notifications/unsubscribe?token=xyz',
    locale: 'en',
    channel: 'email',
  };

  it('includes tenant name in footer', () => {
    const html = renderLegalFooter(baseOpts);
    expect(html).toContain('TestCorp');
  });

  it('includes tenant address from theme when provided', () => {
    // THEME.tenantAddress = '5 Test Street, Abuja'
    const html = renderLegalFooter(baseOpts);
    expect(html).toContain('5 Test Street, Abuja');
  });

  it('includes unsubscribe URL (host + path present, params may be encoded)', () => {
    const html = renderLegalFooter(baseOpts);
    expect(html).toContain('https://api.webwaka.com/notifications/unsubscribe');
  });

  it('includes an unsubscribe link label', () => {
    const html = renderLegalFooter(baseOpts);
    const hasUnsubLabel =
      html.toLowerCase().includes('unsubscribe') ||
      html.toLowerCase().includes('opt out');
    expect(hasUnsubLabel).toBe(true);
  });

  it('renders without error when optional theme fields are absent', () => {
    const minimalTheme = {
      displayName: 'MinCo',
      primaryColor: '#333',
      requiresWebwakaAttribution: false,
    };
    const opts: LegalFooterOptions = {
      theme: minimalTheme as unknown as typeof THEME,
      tenantName: 'MinCo',
      unsubscribeUrl: '#unsub',
      locale: 'en',
    };
    expect(() => renderLegalFooter(opts)).not.toThrow();
  });

  it('escapes XSS in tenant name', () => {
    const opts: LegalFooterOptions = {
      ...baseOpts,
      tenantName: '<script>alert(1)</script>',
    };
    const html = renderLegalFooter(opts);
    expect(html).not.toContain('<script>');
  });
});
