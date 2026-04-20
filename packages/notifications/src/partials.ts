/**
 * @webwaka/notifications — Email HTML partials library (N-032, Phase 3).
 *
 * Reusable HTML fragments for email templates. All partials:
 *   - Produce table-safe HTML (email-client compatible, no flexbox/grid)
 *   - Respect TenantTheme brand colors for interactive elements
 *   - Are safe to inline into any email body_template
 *
 * Partials:
 *   renderCtaButton   — primary call-to-action button
 *   renderDataTable   — key-value data summary table
 *   renderAlertBox    — severity-colored alert box (info/warning/critical)
 *   renderLegalFooter — NDPR-compliant footer with unsubscribe link (N-039)
 *   renderOtpDisplay  — large formatted OTP display (G5: SMS/email OTPs only)
 *
 * Guardrails:
 *   G5  — OTP display never exposes raw code; caller must format (e.g. "123 456")
 *   G14 — partials do NOT validate variables; TemplateRenderer (N-030) owns that
 *   G17 — attribution footer injected only when TenantTheme.requiresWebwakaAttribution
 *   G18 — locale strings via @webwaka/i18n only
 */

import { createI18n } from '@webwaka/i18n';
import type { SupportedLocale } from '@webwaka/i18n';
import type { TenantTheme } from '@webwaka/white-label-theming';
import type { TemplateLocale } from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LegalFooterOptions {
  theme: TenantTheme;
  locale: TemplateLocale;
  unsubscribeUrl: string;
  tenantName: string;
  channel?: string;
  year?: number;
}

export interface DataTableRow {
  label: string;
  value: string;
}

export type AlertBoxType = 'info' | 'warning' | 'critical';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map TemplateLocale to SupportedLocale (they are identical in this version). */
function toSupportedLocale(locale: TemplateLocale): SupportedLocale {
  const valid: SupportedLocale[] = ['en', 'ha', 'yo', 'ig', 'pcm', 'fr'];
  return (valid as string[]).includes(locale) ? (locale as SupportedLocale) : 'en';
}

// ---------------------------------------------------------------------------
// renderCtaButton — N-032
// ---------------------------------------------------------------------------

/**
 * Render an email-safe CTA button.
 *
 * Uses a table-based MSO VML button for maximum email-client compatibility.
 * `url` must already be HTML-attribute-safe (caller must escape if needed).
 *
 * @param label       - Button label text (plain text, not HTML)
 * @param url         - Destination URL (HTTPS)
 * @param primaryColor - Hex background color (from TenantTheme)
 */
export function renderCtaButton(label: string, url: string, primaryColor: string): string {
  const safeLabel = escapeHtml(label);
  const safeUrl = escapeAttr(url);
  const safeColor = /^#[0-9a-fA-F]{3,6}$/.test(primaryColor) ? primaryColor : '#1a6b3a';

  return `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
  href="${safeUrl}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="10%"
  stroke="f" fillcolor="${safeColor}">
  <w:anchorlock/>
  <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">
    ${safeLabel}
  </center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:24px auto;">
  <tr>
    <td align="center" bgcolor="${safeColor}"
        style="border-radius:6px;padding:0;">
      <a href="${safeUrl}" target="_blank"
         style="background-color:${safeColor};border-radius:6px;color:#ffffff;
                display:inline-block;font-family:Arial,sans-serif;font-size:15px;
                font-weight:bold;line-height:44px;padding:0 24px;text-decoration:none;
                mso-padding-alt:0;text-underline-color:${safeColor};">
        ${safeLabel}
      </a>
    </td>
  </tr>
</table>
<!--<![endif]-->`;
}

// ---------------------------------------------------------------------------
// renderDataTable — N-032
// ---------------------------------------------------------------------------

/**
 * Render a key-value summary table (e.g. receipt details, account info).
 *
 * @param rows  - Array of { label, value } pairs (plain text; will be HTML-escaped)
 * @param title - Optional table caption (plain text)
 */
export function renderDataTable(rows: DataTableRow[], title?: string): string {
  if (rows.length === 0) return '';

  const titleHtml = title
    ? `<tr><td colspan="2" style="padding:12px 16px 8px;font-weight:bold;font-size:14px;color:#111827;border-bottom:2px solid #e5e7eb;">${escapeHtml(title)}</td></tr>`
    : '';

  const rowsHtml = rows
    .map(
      (row) => `<tr>
      <td style="padding:10px 16px;font-size:14px;color:#6b7280;white-space:nowrap;border-bottom:1px solid #f3f4f6;vertical-align:top;">${escapeHtml(row.label)}</td>
      <td style="padding:10px 16px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;word-break:break-word;">${escapeHtml(row.value)}</td>
    </tr>`,
    )
    .join('\n');

  return `<table cellpadding="0" cellspacing="0" border="0" width="100%"
    style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:collapse;margin:16px 0;max-width:520px;">
  ${titleHtml}
  ${rowsHtml}
</table>`;
}

// ---------------------------------------------------------------------------
// renderAlertBox — N-032
// ---------------------------------------------------------------------------

const ALERT_STYLES: Record<AlertBoxType, { bg: string; border: string; icon: string }> = {
  info:     { bg: '#eff6ff', border: '#3b82f6', icon: 'ℹ️' },
  warning:  { bg: '#fffbeb', border: '#f59e0b', icon: '⚠️' },
  critical: { bg: '#fef2f2', border: '#ef4444', icon: '🚨' },
};

/**
 * Render a severity-colored alert box (informational, warning, or critical).
 *
 * @param type    - Alert type
 * @param message - Alert body text (plain text; will be HTML-escaped)
 * @param title   - Optional alert title (plain text)
 */
export function renderAlertBox(type: AlertBoxType, message: string, title?: string): string {
  const style = ALERT_STYLES[type];
  const titleHtml = title
    ? `<p style="margin:0 0 6px;font-weight:bold;font-size:14px;color:#111827;">${style.icon} ${escapeHtml(title)}</p>`
    : '';

  return `<table cellpadding="0" cellspacing="0" border="0" width="100%"
    style="background:${style.bg};border-left:4px solid ${style.border};border-radius:4px;margin:16px 0;max-width:520px;">
  <tr>
    <td style="padding:14px 16px;">
      ${titleHtml}
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">${escapeHtml(message)}</p>
    </td>
  </tr>
</table>`;
}

// ---------------------------------------------------------------------------
// renderOtpDisplay — N-032 (G5: caller formats OTP, e.g. "123 456")
// ---------------------------------------------------------------------------

/**
 * Render a large, readable OTP display block.
 *
 * G5: NEVER call this with raw OTP codes — always pass pre-formatted display value
 *     (e.g. "123 456" with space), as stored in the `otp_display` template variable.
 * G14: variables_schema marks otp_display as sensitive=true; never log this value.
 *
 * @param otpDisplay - Pre-formatted OTP string (e.g. "123 456")
 * @param expiryNote - Optional expiry note (plain text, HTML-escaped)
 */
export function renderOtpDisplay(otpDisplay: string, expiryNote?: string): string {
  const expiryHtml = expiryNote
    ? `<p style="margin:8px 0 0;font-size:12px;color:#6b7280;text-align:center;">${escapeHtml(expiryNote)}</p>`
    : '';

  return `<table cellpadding="0" cellspacing="0" border="0" width="100%"
    style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:8px;margin:20px 0;max-width:400px;margin-left:auto;margin-right:auto;">
  <tr>
    <td style="padding:20px 16px;text-align:center;">
      <p style="margin:0;font-size:11px;letter-spacing:0.05em;color:#6b7280;text-transform:uppercase;">Your verification code</p>
      <p style="margin:8px 0 0;font-size:36px;font-weight:bold;letter-spacing:0.15em;color:#111827;font-family:monospace,'Courier New',Courier;">${escapeHtml(otpDisplay)}</p>
      ${expiryHtml}
    </td>
  </tr>
</table>`;
}

// ---------------------------------------------------------------------------
// renderLegalFooter — N-032, N-039 (NDPR + unsubscribe + attribution)
// ---------------------------------------------------------------------------

/**
 * Render the email legal footer block.
 *
 * Includes:
 *   - Unsubscribe link (N-039; G1: tenant-scoped token)
 *   - NDPR compliance notice (notif_legal_footer_ndpr)
 *   - Copyright line (notif_legal_footer_rights)
 *   - Tenant mailing address (NDPR requirement for commercial email)
 *   - "Powered by WebWaka" attribution (G17: free-plan tenants only)
 *
 * @param opts.theme           - Resolved TenantTheme (brand + sender + attribution)
 * @param opts.locale          - Rendering locale (@webwaka/i18n; G18)
 * @param opts.unsubscribeUrl  - Pre-signed unsubscribe URL (N-039)
 * @param opts.tenantName      - Tenant display name for footer text
 * @param opts.channel         - Channel label for unsubscribe text (default: 'email')
 * @param opts.year            - Copyright year (default: current year)
 */
export function renderLegalFooter(opts: LegalFooterOptions): string {
  const t = createI18n(toSupportedLocale(opts.locale));
  const year = opts.year ?? new Date().getFullYear();
  const channel = opts.channel ?? 'email';

  const ndprText = t('notif_legal_footer_ndpr');
  const rightsText = t('notif_legal_footer_rights', {
    year,
    company_name: opts.tenantName,
  });
  const unsubscribeText = t('notif_unsubscribe_text', { tenant_name: opts.tenantName });
  const unsubscribeAction = t('notif_unsubscribe_action');
  const tooManyEmails = t('notif_too_many_emails');

  const addressHtml = opts.theme.tenantAddress
    ? `<p style="margin:4px 0;">${t('notif_marketing_address_label')} ${escapeHtml(opts.theme.tenantAddress)}</p>`
    : '';

  const attributionHtml = opts.theme.requiresWebwakaAttribution
    ? `<p style="margin:8px 0 0;">${escapeHtml(t('notif_powered_by'))} — <a href="https://webwaka.com" style="color:#6b7280;" target="_blank" rel="noopener">webwaka.com</a></p>`
    : '';

  const safeUnsubUrl = escapeAttr(opts.unsubscribeUrl);

  return `<table cellpadding="0" cellspacing="0" border="0" width="100%"
    style="border-top:1px solid #e5e7eb;margin-top:32px;padding-top:20px;">
  <tr>
    <td style="font-size:11px;color:#9ca3af;text-align:center;line-height:1.7;padding:0 16px;">
      <p style="margin:0 0 6px;">${escapeHtml(unsubscribeText)}</p>
      <p style="margin:0 0 6px;">${escapeHtml(tooManyEmails)}</p>
      <p style="margin:0 0 8px;"><a href="${safeUnsubUrl}" style="color:#9ca3af;text-decoration:underline;"
           aria-label="${escapeAttr(unsubscribeAction)} ${escapeAttr(opts.tenantName)} ${escapeAttr(channel)}"
        >${escapeHtml(unsubscribeAction)}</a></p>
      <p style="margin:0 0 4px;">${escapeHtml(ndprText)}</p>
      ${addressHtml}
      <p style="margin:4px 0;">${escapeHtml(rightsText)}</p>
      ${attributionHtml}
    </td>
  </tr>
</table>`;
}

// ---------------------------------------------------------------------------
// HTML escape helpers (used within partials only)
// ---------------------------------------------------------------------------

/**
 * Escape a string for safe use inside HTML text content.
 * Replaces: & " < > '
 */
export function escapeHtml(text: string | number): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape a string for safe use inside HTML attribute values (href, aria-label, etc.).
 * More conservative than escapeHtml — also escapes backticks and equals signs.
 */
export function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/`/g, '&#96;').replace(/=/g, '&#61;');
}
