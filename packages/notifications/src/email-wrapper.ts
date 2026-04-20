/**
 * @webwaka/notifications — Email HTML wrapper (N-031, N-038, Phase 3).
 *
 * Wraps a rendered body fragment into a full email-safe HTML document:
 *   - Brand-injected header (logo, primary color, display name)
 *   - Body content area
 *   - NDPR-compliant legal footer with unsubscribe link (N-032, N-039)
 *   - Plain-text alternative generation from HTML (N-038)
 *
 * The wrapper is responsive but email-client safe (table layout, inline styles).
 * Uses MSO conditional comments for Outlook compatibility.
 *
 * Guardrails:
 *   G3  — FROM address is NOT set here; resolved by resolveEmailSender()
 *   G4  — all rendered emails must go through this wrapper (brand injection)
 *   G17 — attribution injected by renderLegalFooter when requiresWebwakaAttribution=true
 *   G18 — locale strings via @webwaka/i18n only (delegated to renderLegalFooter partial)
 */

import type { TenantTheme } from '@webwaka/white-label-theming';
import { renderLegalFooter } from './partials.js';
import type { TemplateLocale } from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WrapEmailOptions {
  /** Subject line — used in preheader and title only, not the <subject> tag */
  subject: string;
  /** Rendered HTML body from template substitution (may contain partials) */
  bodyHtml: string;
  /** Optional preheader text (shows in email client preview after subject) */
  preheader?: string | undefined;
  /** Resolved TenantTheme for brand context injection */
  theme: TenantTheme;
  /** Rendering locale (G18: @webwaka/i18n) */
  locale: TemplateLocale;
  /** Pre-signed unsubscribe URL (N-039); MUST be HTTPS */
  unsubscribeUrl: string;
}

export interface WrappedEmail {
  /** Full email HTML document ready to send */
  html: string;
  /** Auto-generated plain-text alternative (N-038) */
  plainText: string;
}

// ---------------------------------------------------------------------------
// wrapEmail — N-031
// ---------------------------------------------------------------------------

/**
 * Wrap a rendered body fragment into a complete email HTML document.
 *
 * G4: all notification emails MUST go through this function — brand context
 *     (logo, colors, display name) is injected here, never in templates.
 */
export function wrapEmail(opts: WrapEmailOptions): WrappedEmail {
  const { subject, bodyHtml, preheader, theme, locale, unsubscribeUrl } = opts;

  const primaryColor = theme.primaryColor;
  const displayName = escapeHtml(theme.displayName);
  const preheaderText = preheader ? escapeHtml(preheader) : escapeHtml(subject);

  // Logo or text header
  const headerHtml = theme.logoUrl
    ? `<img src="${escapeAttr(theme.logoUrl)}" alt="${displayName}" height="40"
            style="display:block;height:40px;width:auto;max-width:200px;" />`
    : `<span style="font-size:22px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">${displayName}</span>`;

  const footerHtml = renderLegalFooter({
    theme,
    locale,
    unsubscribeUrl,
    tenantName: theme.displayName,
    channel: 'email',
  });

  const html = `<!DOCTYPE html>
<html lang="${escapeAttr(locale)}" xmlns="http://www.w3.org/1999/xhtml"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body { margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    a { color:${primaryColor}; }
    h1, h2, h3 { margin:0 0 16px; font-family:Arial, sans-serif; color:#111827; }
    h1 { font-size:24px; line-height:1.3; }
    h2 { font-size:20px; }
    h3 { font-size:16px; }
    p  { margin:0 0 14px; font-size:15px; line-height:1.6; color:#374151; }
    @media only screen and (max-width:600px) {
      .email-wrapper { width:100% !important; }
      .email-body    { padding:16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,'Helvetica Neue',sans-serif;">

<!-- Preheader (hidden, shown in email client preview) -->
<div style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
  ${preheaderText}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<!-- Outer wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
       style="background-color:#f3f4f6;min-width:100%;padding:24px 0;">
  <tr>
    <td align="center" valign="top">

      <!-- Email container -->
      <table class="email-wrapper" width="600" cellpadding="0" cellspacing="0" border="0"
             role="presentation"
             style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;
                    box-shadow:0 1px 3px rgba(0,0,0,0.1);overflow:hidden;">

        <!-- Header -->
        <tr>
          <td align="center" bgcolor="${primaryColor}"
              style="background-color:${primaryColor};padding:24px 32px;">
            ${headerHtml}
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td class="email-body"
              style="padding:32px 32px 24px;font-size:15px;line-height:1.6;color:#374151;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 32px 24px;">
            ${footerHtml}
          </td>
        </tr>

      </table>
      <!-- /Email container -->

    </td>
  </tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>`;

  const plainText = htmlToPlainText(bodyHtml, {
    subject,
    tenantName: theme.displayName,
    unsubscribeUrl,
  });

  return { html, plainText };
}

// ---------------------------------------------------------------------------
// htmlToPlainText — N-038
// ---------------------------------------------------------------------------

interface PlainTextOptions {
  subject?: string | undefined;
  tenantName?: string | undefined;
  unsubscribeUrl?: string | undefined;
}

/**
 * Auto-generate a plain-text email alternative from rendered HTML (N-038).
 *
 * Strategy:
 *   1. Strip <style>, <script>, <head> blocks
 *   2. Replace block-level elements with newlines
 *   3. Preserve link URLs: <a href="url">text</a> → text (url)
 *   4. Strip remaining HTML tags
 *   5. Decode common HTML entities
 *   6. Collapse whitespace; ensure max 2 consecutive newlines
 *   7. Append unsubscribe URL as plain line
 *
 * This is intentionally simple — it does NOT need to render as beautifully
 * as the HTML version. Plain-text is a legal/accessibility requirement.
 */
export function htmlToPlainText(html: string, opts: PlainTextOptions = {}): string {
  let text = html;

  // Remove head, style, script blocks entirely
  text = text.replace(/<head[\s\S]*?<\/head>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Convert block-level elements to newlines BEFORE stripping tags
  text = text.replace(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi, '\n\n$2\n');
  text = text.replace(/<(p|div|tr|li|dt|dd)\b[^>]*>/gi, '\n');
  text = text.replace(/<\/(p|div|tr|li|dt|dd|table|ul|ol|dl)>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<hr\s*\/?>/gi, '\n---\n');

  // Convert <th> and <td> with separators
  text = text.replace(/<th\b[^>]*>/gi, '  ');
  text = text.replace(/<td\b[^>]*>/gi, '  ');

  // Preserve links: <a href="url">text</a> → text (url)
  text = text.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, url, label) => {
    const cleanLabel = label.replace(/<[^>]+>/g, '').trim();
    if (!cleanLabel || cleanLabel === url) return url;
    if (url.startsWith('mailto:') || url.startsWith('#')) return cleanLabel;
    return `${cleanLabel} (${url})`;
  });

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&zwnj;/g, '')
    .replace(/&#96;/g, '`')
    .replace(/&#61;/g, '=');

  // Normalize whitespace
  text = text
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Build final plain-text with header and unsubscribe footer
  const parts: string[] = [];
  if (opts.subject) parts.push(`${opts.subject}\n${'─'.repeat(opts.subject.length)}`);
  parts.push(text);
  if (opts.unsubscribeUrl) {
    parts.push(`\n---\nTo unsubscribe from ${opts.tenantName ?? 'this service'}, visit:\n${opts.unsubscribeUrl}`);
  }

  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ---------------------------------------------------------------------------
// Internal HTML escape helpers (email-wrapper internal use only)
// Duplicated from partials.ts to keep this file self-contained.
// ---------------------------------------------------------------------------

function escapeHtml(text: string | number): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/`/g, '&#96;').replace(/=/g, '&#61;');
}
