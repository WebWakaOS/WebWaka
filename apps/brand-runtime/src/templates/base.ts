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
}

export function baseTemplate(opts: BaseTemplateOptions): string {
  const {
    title, cssVars, logoUrl, displayName, faviconUrl, body,
    headExtra = '', removeAttribution,
    ogTitle, ogDescription, ogImage, canonicalUrl,
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
    ${renderAttribution({ removeAttribution })}
  </footer>

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
