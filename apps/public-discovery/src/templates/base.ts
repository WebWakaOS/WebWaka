/**
 * Base HTML template for public-discovery Worker.
 * (Pillar 3 — PV-1.2, Phase 3 P3IN1-002)
 *
 * Platform colours (WebWaka green/gold) — no tenant-specific branding.
 * Mobile-first responsive design (P4 — 360px base).
 * SEO-ready with structured data support.
 */

import { renderAttribution } from '@webwaka/white-label-theming';
import type { SupportedLocale } from '@webwaka/i18n';

export interface BaseTemplateOptions {
  title: string;
  body: string;
  headExtra?: string;
  structuredData?: object;
  locale?: SupportedLocale;
  searchLabel?: string;
  footerTagline?: string;
}

export function baseTemplate(opts: BaseTemplateOptions): string {
  const { title, body, headExtra = '', structuredData, locale = 'en', searchLabel = 'Search', footerTagline } = opts;

  const jsonLd = structuredData
    ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`
    : '';

  // Map SupportedLocale to BCP-47 lang tag with NG country suffix for Nigerian context
  const langTag = locale === 'en' ? 'en-NG' : `${locale}-NG`;

  return `<!DOCTYPE html>
<html lang="${langTag}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} | WebWaka Discover</title>
  <!-- SEO-04: Resource hints — preconnect to origin for faster favicon/icon fetch -->
  <link rel="preconnect" href="https://webwaka.com" crossorigin />
  <link rel="dns-prefetch" href="https://webwaka.com" />
  <link rel="icon" href="https://webwaka.com/favicon.ico" fetchpriority="low" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#1a6b3a" />
  ${headExtra}
  ${jsonLd}
  <style>
:root {
  --ww-primary:    #1a6b3a;
  --ww-secondary:  #f5a623;
  --ww-accent:     #e8f5e9;
  --ww-text:       #111827;
  --ww-text-muted: #6b7280;
  --ww-bg:         #ffffff;
  --ww-bg-surface: #f9fafb;
  --ww-border:     #e5e7eb;
  --ww-radius:     8px;
  --ww-font:       'Inter','Segoe UI',system-ui,sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--ww-font);
  background: var(--ww-bg);
  color: var(--ww-text);
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

img, video, svg { max-width: 100%; height: auto; display: block; }
a { color: var(--ww-primary); text-decoration: none; }
a:hover { text-decoration: underline; }
button, input, select, textarea { font: inherit; color: inherit; }

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
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--ww-border);
  background: var(--ww-bg);
  position: sticky;
  top: 0;
  z-index: 100;
}
@media (min-width: 768px) { .ww-nav { padding: 0.875rem 1.5rem; } }

.ww-nav-brand { font-size: 1.125rem; font-weight: 800; color: var(--ww-primary); letter-spacing: -0.5px; text-decoration: none; }
.ww-nav-brand:hover { text-decoration: none; }

.ww-nav-links { display: none; gap: 1.5rem; }
.ww-nav-links a { color: var(--ww-text); font-size: 0.875rem; font-weight: 500; }
.ww-nav-links a:hover { color: var(--ww-primary); text-decoration: none; }
@media (min-width: 768px) { .ww-nav-links { display: flex; } }

.ww-content {
  flex: 1;
  padding: 1.5rem 1rem;
  max-width: 72rem;
  margin: 0 auto;
  width: 100%;
}
@media (min-width: 768px) { .ww-content { padding: 2rem 1.5rem; } }
@media (min-width: 1024px) { .ww-content { padding: 2.5rem 2rem; } }

.ww-footer { text-align: center; padding: 1.5rem 1rem; font-size: 0.8125rem; color: var(--ww-text-muted); border-top: 1px solid var(--ww-border); }
.ww-footer a { color: var(--ww-text-muted); }

.ww-search { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.ww-search input {
  flex: 1;
  min-width: 0;
  padding: 0.625rem 1rem;
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  font-size: 1rem;
  outline: none;
  min-height: 44px;
}
.ww-search input:focus { border-color: var(--ww-primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ww-primary) 20%, transparent); }
.ww-search button {
  padding: 0.625rem 1.25rem;
  background: var(--ww-primary);
  color: #fff;
  border: none;
  border-radius: var(--ww-radius);
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
  white-space: nowrap;
}

.ww-grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
@media (min-width: 480px) { .ww-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } }

.ww-card {
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  padding: 1.25rem;
  background: var(--ww-bg-surface);
  transition: box-shadow 0.15s ease;
}
.ww-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.ww-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.375rem; }
.ww-card p { font-size: 0.875rem; color: var(--ww-text-muted); }

.ww-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--ww-secondary);
  color: #fff;
  margin-bottom: 0.5rem;
}

.ww-section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
@media (min-width: 768px) { .ww-section-title { font-size: 1.375rem; } }

.ww-cta-banner {
  background: var(--ww-accent);
  border-radius: var(--ww-radius);
  padding: 1.5rem;
  text-align: center;
  margin-top: 2rem;
}
.ww-cta-banner h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; }
.ww-cta-banner p { color: var(--ww-text-muted); margin-bottom: 1rem; font-size: 0.875rem; }
.ww-cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.5rem;
  background: var(--ww-primary);
  color: #fff;
  border: none;
  border-radius: var(--ww-radius);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  min-height: 44px;
}
.ww-cta-btn:hover { filter: brightness(1.1); text-decoration: none; }

.ww-chip-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
.ww-chip {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  font-size: 0.8125rem;
  color: var(--ww-text);
  background: var(--ww-bg);
  text-decoration: none;
  transition: background 0.1s ease;
}
.ww-chip:hover { background: var(--ww-bg-surface); text-decoration: none; }
  
/* D1-5: Enhanced card styles */
.ww-card-v2 {
  display: block;
  text-decoration: none;
  color: inherit;
}
.ww-card-header {
  display: flex;
  align-items: flex-start;
  gap: .625rem;
  margin-bottom: .5rem;
}
.ww-card-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--ww-border);
  flex-shrink: 0;
}
.ww-card-logo-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--ww-primary);
  color: #fff;
  font-size: 1.25rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ww-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}
.ww-card-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ww-text);
  margin-bottom: .25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ww-card-location {
  font-size: .8125rem;
  color: var(--ww-text-muted);
  margin-bottom: .25rem;
}
.ww-stars {
  color: var(--ww-secondary);
  font-size: .875rem;
  letter-spacing: .05em;
}
.ww-verified-badge {
  font-size: .75rem;
  font-weight: 600;
  color: #059669;
  background: #dcfce7;
  padding: 1px 8px;
  border-radius: 999px;
}
.ww-pagination {
  display: flex;
  gap: 10px;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}
.ww-btn {
  display: inline-flex;
  align-items: center;
  padding: .5rem 1rem;
  border-radius: var(--ww-radius);
  font-size: .875rem;
  font-weight: 600;
  background: var(--ww-primary);
  color: #fff;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: opacity .15s;
}
.ww-btn:hover { opacity: .85; text-decoration: none; }
.ww-btn-outline {
  background: transparent;
  color: var(--ww-primary);
  border: 1.5px solid var(--ww-primary);
}

</style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <nav class="ww-nav" role="navigation" aria-label="Main navigation">
    <a class="ww-nav-brand" href="/discover">WebWaka Discover</a>
    <div class="ww-nav-links">
      <a href="/discover">Browse</a>
      <a href="/discover" onclick="var i=document.querySelector('.ww-search input');if(i){event.preventDefault();i.focus();i.scrollIntoView({behavior:'smooth'})}">${esc(searchLabel)}</a>
    </div>
    <a href="https://webwaka.com" style="font-size:.875rem;color:var(--ww-text-muted);text-decoration:none;white-space:nowrap">List your business &rarr;</a>
  </nav>
  <main id="main-content" class="ww-content" role="main">${body}</main>
  <footer class="ww-footer" role="contentinfo">
    ${renderAttribution()}
    <p style="margin-top:0.25rem">${footerTagline ? esc(footerTagline) : `&copy; ${new Date().getFullYear()} WebWaka OS &mdash; Nigeria's Business Platform`}</p>
  </footer>
  <!-- SEO-04: Add loading=lazy to non-critical images (Core Web Vitals) -->
  <script>document.querySelectorAll('img:not([loading])').forEach(function(i,idx){if(idx>0)i.setAttribute('loading','lazy');});</script>
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
