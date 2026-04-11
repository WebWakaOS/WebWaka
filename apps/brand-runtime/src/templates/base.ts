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
}

export function baseTemplate(opts: BaseTemplateOptions): string {
  const { title, cssVars, logoUrl, displayName, faviconUrl, body, headExtra = '', removeAttribution } = opts;

  return `<!DOCTYPE html>
<html lang="en-NG">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(title)} | ${escHtml(displayName)}</title>
  ${faviconUrl ? `<link rel="icon" href="${escAttr(faviconUrl)}" />` : '<link rel="icon" href="/favicon.ico" />'}
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
  <nav class="ww-nav">
    <a class="ww-nav-brand" href="/">
      ${logoUrl ? `<img src="${escAttr(logoUrl)}" alt="${escAttr(displayName)} logo" />` : ''}
      <span>${escHtml(displayName)}</span>
    </a>
    <div class="ww-nav-links">
      <a href="/about">About</a>
      <a href="/services">Services</a>
      <a href="/contact">Contact</a>
    </div>
    <div class="ww-nav-actions">
      <a class="ww-btn ww-btn-outline" href="/portal/login">Log in</a>
    </div>
  </nav>

  <main class="ww-content">
    ${body}
  </main>

  <footer class="ww-footer">
    ${renderAttribution({ removeAttribution })}
  </footer>
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
