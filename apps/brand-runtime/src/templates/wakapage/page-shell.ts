/**
 * WakaPage public renderer — standalone page shell.
 * (Phase 2 — ADR-0041 D2)
 *
 * A purpose-built HTML shell for WakaPage public rendering.
 * Intentionally minimal — no branded site nav or footer links.
 * Mobile-first: 360px base viewport, max-width 640px for readability.
 *
 * Distinct from base.ts (the branded site shell) by design.
 * ADR-0041 D6: WakaPage is a standalone public profile surface,
 * not a page within the tenant's branded website.
 *
 * Platform Invariants:
 *   P2 — Nigeria First: 360px base, offline-capable via SW, low-bandwidth CSS
 *   T3 — tenant data already scoped at route layer
 */

import { renderAttribution } from '@webwaka/white-label-theming';

export interface WakaPageShellOptions {
  /** SEO page title (tenant's display name or custom title) */
  title: string;
  displayName: string;
  cssVars: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  /** Rendered block HTML (all visible blocks concatenated) */
  blocksHtml: string;
  /** <meta> description for SEO */
  metaDescription: string | null;
  /** OG image URL */
  ogImageUrl: string | null;
  /** Canonical URL for this page */
  canonicalUrl: string;
  /** Schema.org JSON-LD (Profile → Person/Organization) */
  schemaJsonLd: string;
  removeAttribution?: boolean;
}

export function wakaPageShell(opts: WakaPageShellOptions): string {
  const {
    title, displayName, cssVars, logoUrl, faviconUrl,
    blocksHtml, metaDescription, ogImageUrl, canonicalUrl,
    schemaJsonLd, removeAttribution,
  } = opts;

  const pageTitle = `${esc(title)} — ${esc(displayName)}`;
  const metaDesc = metaDescription?.slice(0, 160) ?? `${displayName} — powered by WebWaka`;

  return `<!DOCTYPE html>
<html lang="en-NG">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  ${faviconUrl ? `<link rel="icon" href="${encodeURI(faviconUrl)}" />` : '<link rel="icon" href="/favicon.ico" />'}
  <meta name="description" content="${esc(metaDesc)}" />

  <!-- Open Graph / Twitter Card — SEO-02 -->
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="${esc(pageTitle)}" />
  <meta property="og:description" content="${esc(metaDesc)}" />
  ${ogImageUrl ? `<meta property="og:image" content="${encodeURI(ogImageUrl)}" />` : ''}
  <meta property="og:url" content="${escAttr(canonicalUrl)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(pageTitle)}" />
  <meta name="twitter:description" content="${esc(metaDesc)}" />
  ${ogImageUrl ? `<meta name="twitter:image" content="${encodeURI(ogImageUrl)}" />` : ''}
  <link rel="canonical" href="${escAttr(canonicalUrl)}" />

  <!-- PWA manifest (tenant-dynamic) -->
  <link rel="manifest" href="/manifest.json" />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">${schemaJsonLd}</script>

  <style>
${cssVars}

/* ── Reset ─────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
img{max-width:100%;display:block}
a{color:var(--ww-primary);text-decoration:none}
a:hover{text-decoration:underline}
button{font-family:inherit;cursor:pointer}

/* ── Body — Nigeria First: 360px base ─────────── */
body{
  font-family:var(--ww-font,'Inter',system-ui,sans-serif);
  background:var(--ww-bg,#f9fafb);
  color:var(--ww-text,#111827);
  line-height:1.6;
  min-height:100dvh;
  display:flex;
  flex-direction:column;
}

/* ── Skip link (accessibility) ────────────────── */
.wkp-skip{
  position:absolute;top:-100%;left:1rem;
  background:var(--ww-primary);color:#fff;
  padding:.625rem 1rem;border-radius:0 0 6px 6px;
  font-weight:600;font-size:.875rem;z-index:200;
  text-decoration:none;transition:top .15s;
}
.wkp-skip:focus{top:0}

/* ── Page header (minimal — logo + name only) ─── */
.wkp-header{
  padding:1rem 1.25rem;
  border-bottom:1px solid var(--ww-border,#e5e7eb);
  background:var(--ww-bg,#fff);
  display:flex;
  align-items:center;
  gap:.75rem;
}
.wkp-header-logo{height:36px;width:auto;border-radius:4px}
.wkp-header-name{
  font-size:1rem;font-weight:700;
  color:var(--ww-primary);
}

/* ── Main page canvas ──────────────────────────── */
.wkp-page{
  flex:1;
  width:100%;
  max-width:640px;
  margin:0 auto;
  padding:0 0 3rem;
}

/* ── Global token shorthand ────────────────────── */
.wkp-section{padding:1.5rem 1.25rem}

/* ── Button tokens (touch-friendly ≥44px) ──────── */
.wkp-btn{
  display:inline-flex;align-items:center;justify-content:center;
  gap:.5rem;padding:.75rem 1.5rem;
  background:var(--ww-primary);color:#fff;
  border:none;border-radius:var(--ww-radius,8px);
  font-size:1rem;font-weight:600;min-height:44px;
  text-decoration:none;transition:filter .15s;
  width:100%;max-width:400px;
}
.wkp-btn:hover{filter:brightness(1.08);text-decoration:none;color:#fff}
.wkp-btn-outline{
  background:transparent;color:var(--ww-primary);
  border:2px solid var(--ww-primary);
}
.wkp-btn-outline:hover{background:var(--ww-primary);color:#fff}

/* ── Footer ────────────────────────────────────── */
.wkp-footer{
  text-align:center;padding:1.25rem;
  font-size:.75rem;color:var(--ww-text-muted,#6b7280);
  border-top:1px solid var(--ww-border,#e5e7eb);
}

/* ── Responsive ─────────────────────────────────── */
@media(min-width:480px){
  .wkp-section{padding:1.75rem 1.5rem}
}
  </style>
</head>
<body>
  <a href="#wkp-main" class="wkp-skip">Skip to content</a>

  <header class="wkp-header" role="banner">
    ${logoUrl ? `<img class="wkp-header-logo" src="${encodeURI(logoUrl)}" alt="${esc(displayName)} logo" />` : ''}
    <span class="wkp-header-name">${esc(displayName)}</span>
  </header>

  <main id="wkp-main" class="wkp-page" role="main">
    ${blocksHtml}
  </main>

  <footer class="wkp-footer" role="contentinfo">
    ${renderAttribution({ removeAttribution })}
  </footer>

  <!-- PWA service worker (reuse existing sw.js) -->
  <script>
    if('serviceWorker' in navigator){
      window.addEventListener('load',function(){
        navigator.serviceWorker.register('/sw.js',{scope:'/'})
          .catch(function(e){console.warn('[WakaPage SW]',e);});
      });
    }
  </script>
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function escAttr(s: string): string {
  return encodeURI(s).replace(/"/g,'%22');
}
