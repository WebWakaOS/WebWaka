/**
 * Base HTML template for brand-runtime Worker.
 * (Pillar 2 — PV-1.1)
 *
 * All branded pages extend this template. CSS custom properties are injected
 * from white-label-theming generateCssTokens() (PV-1.3).
 *
 * GAP-003: Attribution rendered from shared @webwaka/white-label-theming package.
 */

import { renderAttribution } from '@webwaka/white-label-theming';

export interface BaseTemplateOptions {
  title: string;
  cssVars: string;
  logoUrl: string | null;
  displayName: string;
  faviconUrl: string | null;
  body: string;
  headExtra?: string;
  removeAttribution?: boolean;
  /** SEO-02: Open Graph / social sharing meta tags */
  ogTitle?: string | undefined;
  ogDescription?: string | undefined;
  ogImage?: string | undefined;
  /** SEO-02: canonical URL for this page */
  canonicalUrl?: string | undefined;
  /** WhatsApp contact number for floating CTA button (e.g. +2348012345678) */
  whatsappNumber?: string | null | undefined;
  /** Social proof: number of customers/leads for trust badges */
  customerCount?: number | null | undefined;
}

export function baseTemplate(opts: BaseTemplateOptions): string {
  const {
    title, cssVars, logoUrl, displayName, faviconUrl, body,
    headExtra = '', removeAttribution,
    ogTitle, ogDescription, ogImage, canonicalUrl,
    whatsappNumber, customerCount,
  } = opts;

  const fullTitle = `${escHtml(title)} | ${escHtml(displayName)}`;
  const resolvedOgTitle = ogTitle ?? `${title} | ${displayName}`;
  const ogMeta = `
  <!-- SEO-02: Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escHtml(resolvedOgTitle)}" />
  ${ogDescription ? `<meta property="og:description" content="${escHtml(ogDescription)}" />` : ''}
  ${ogImage ? `<meta property="og:image" content="${escAttr(ogImage)}" />` : ''}
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escHtml(resolvedOgTitle)}" />
  ${ogDescription ? `<meta name="twitter:description" content="${escHtml(ogDescription)}" />` : ''}
  ${canonicalUrl ? `<link rel="canonical" href="${escAttr(canonicalUrl)}" />` : ''}
  <!-- PWA manifest -->
  <link rel="manifest" href="/manifest.webmanifest" />`;

  return `<!DOCTYPE html>
<html lang="en-NG">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullTitle}</title>
  ${faviconUrl ? `<link rel="icon" href="${escAttr(faviconUrl)}" />` : '<link rel="icon" href="/favicon.ico" />'}
  ${ogMeta}
  ${headExtra}
  <style>
${cssVars}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--ww-font);
  background: var(--ww-bg);
  color: var(--ww-text);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

a { color: var(--ww-primary); text-decoration: none; }
a:hover { text-decoration: underline; }

.ww-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .625rem 1.25rem;
  background: var(--ww-primary);
  color: #fff;
  border: none;
  border-radius: var(--ww-radius);
  font-size: .9375rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: filter .15s;
}
.ww-btn:hover { filter: brightness(1.1); text-decoration: none; }
.ww-btn-outline {
  background: transparent;
  color: var(--ww-primary);
  border: 2px solid var(--ww-primary);
}

.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
.skip-link {
  position: absolute; top: -100%; left: 1rem;
  background: var(--ww-primary); color: #fff; padding: .75rem 1.5rem;
  border-radius: 0 0 8px 8px; font-weight: 600; z-index: 200;
  text-decoration: none; font-size: .9rem; transition: top .2s;
}
.skip-link:focus { top: 0; }

.ww-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--ww-border);
  background: var(--ww-bg);
  position: sticky;
  top: 0;
  z-index: 100;
}

.ww-nav-brand {
  display: flex;
  align-items: center;
  gap: .75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ww-primary);
  text-decoration: none;
}
.ww-nav-brand img { height: 36px; width: auto; border-radius: 4px; }

.ww-nav-links { display: none; gap: 1.5rem; }
.ww-nav-links a { color: var(--ww-text); font-size: .875rem; font-weight: 500; }
.ww-nav-links a:hover { color: var(--ww-primary); }
@media (min-width: 768px) { .ww-nav-links { display: flex; } }

.ww-content { flex: 1; padding: 2rem 1.5rem; max-width: 72rem; margin: 0 auto; width: 100%; }

.ww-footer {
  text-align: center;
  padding: 1.5rem;
  font-size: .8125rem;
  color: var(--ww-text-muted);
  border-top: 1px solid var(--ww-border);
}

/* ── Skeleton loading ─────────────────────────────────────────────── */
.ww-skeleton {
  background: linear-gradient(90deg, var(--ww-border) 25%, rgba(200,200,200,0.1) 50%, var(--ww-border) 75%);
  background-size: 200% 100%;
  animation: ww-shimmer 1.4s infinite;
  border-radius: 4px;
}

@keyframes ww-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.ww-skeleton-text { height: 1rem; margin-bottom: 0.5rem; border-radius: 3px; }
.ww-skeleton-heading { height: 1.5rem; width: 60%; margin-bottom: 0.75rem; border-radius: 4px; }
.ww-skeleton-img { height: 200px; width: 100%; border-radius: 8px; margin-bottom: 1rem; }
.ww-skeleton-btn { height: 44px; width: 140px; border-radius: 8px; }

/* Reduced motion: disable animation for accessibility */
@media (prefers-reduced-motion: reduce) {
  .ww-skeleton { animation: none; background: var(--ww-border); }
}

@media (min-width: 640px) {
  .ww-content { padding: 2.5rem 2rem; }
}
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <nav class="ww-nav" role="navigation" aria-label="Main navigation">
    <a class="ww-nav-brand" href="/">
      ${logoUrl ? `<img src="${escAttr(logoUrl)}" alt="${escAttr(displayName)} logo" />` : ''}
      <span>${escHtml(displayName)}</span>
    </a>
    <div class="ww-nav-links">
      <a href="/about">About</a>
      <a href="/services">Services</a>
      <a href="/shop">Shop</a>
      <a href="/blog">Blog</a>
      <a href="/contact">Contact</a>
    </div>
    <div class="ww-nav-actions">
      <a class="ww-btn ww-btn-outline" href="/portal/login">Log in</a>
    </div>
  </nav>

  <main id="main-content" class="ww-content" role="main">
    ${body}
  </main>

  <footer class="ww-footer" role="contentinfo">
    ${customerCount && customerCount > 5 ? `<p style="margin-bottom:0.5rem;font-size:0.8rem;color:var(--ww-text-muted)">⭐ Trusted by ${customerCount}+ customers</p>` : ''}
    ${renderAttribution({ removeAttribution })}
  </footer>

  ${whatsappNumber ? `
  <!-- WhatsApp floating CTA -->
  <a
    href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contact us on WhatsApp"
    style="
      position:fixed;
      bottom:1.5rem;
      right:1.5rem;
      z-index:500;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      width:56px;
      height:56px;
      border-radius:50%;
      background:#25D366;
      color:#fff;
      box-shadow:0 4px 16px rgba(37,211,102,0.45);
      transition:transform 0.2s ease, box-shadow 0.2s ease;
      text-decoration:none;
    "
    onmouseover="this.style.transform='scale(1.08)';this.style.boxShadow='0 6px 24px rgba(37,211,102,0.55)'"
    onmouseout="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(37,211,102,0.45)'"
  >
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  </a>
  ` : ''}

  <!-- BUG-027: Cookie consent banner (NDPR Art. 2.1 — cookies are personal data) -->
  <div id="ww-cookie-banner" role="dialog" aria-modal="false" aria-label="Cookie consent"
    style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;background:var(--ww-bg);border-top:1px solid var(--ww-border);padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;box-shadow:0 -4px 16px rgba(0,0,0,0.08)">
    <p style="margin:0;font-size:0.875rem;color:var(--ww-text-muted);flex:1;min-width:200px">
      We use essential cookies to keep you signed in and improve your experience.
      <a href="/privacy" style="color:var(--ww-primary);text-decoration:underline">Privacy Policy</a>
    </p>
    <div style="display:flex;gap:0.5rem;flex-shrink:0">
      <button id="ww-cookie-reject" style="background:transparent;border:1px solid var(--ww-border);color:var(--ww-text-muted);padding:0.4rem 0.9rem;border-radius:var(--ww-radius);font-size:0.8125rem;cursor:pointer">
        Essential only
      </button>
      <button id="ww-cookie-accept" style="background:var(--ww-primary);border:none;color:#fff;padding:0.4rem 0.9rem;border-radius:var(--ww-radius);font-size:0.8125rem;cursor:pointer;font-weight:600">
        Accept all
      </button>
    </div>
  </div>

  <script>
    // BUG-027: Cookie consent — show banner unless already decided
    (function() {
      var stored = localStorage.getItem('ww_cookie_consent');
      var banner = document.getElementById('ww-cookie-banner');
      if (!stored && banner) {
        banner.style.display = 'flex';
        document.getElementById('ww-cookie-accept').addEventListener('click', function() {
          localStorage.setItem('ww_cookie_consent', 'all');
          banner.style.display = 'none';
        });
        document.getElementById('ww-cookie-reject').addEventListener('click', function() {
          localStorage.setItem('ww_cookie_consent', 'essential');
          banner.style.display = 'none';
        });
      }
    })();

    // BUG-028: Service Worker registration — registers /sw.js for offline support
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function(err) {
          console.warn('[WebWaka SW] Registration failed:', err);
        });
      });
    }
  </script>
</body>
</html>`;
}

/** HTML-escape string values for safe template injection */
function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(s: string): string {
  return encodeURI(s).replace(/"/g, '%22');
}
