/**
 * Base HTML template for public-discovery Worker.
 * (Pillar 3 — PV-1.2)
 *
 * Platform colours are used (WebWaka green/gold) — no tenant-specific branding
 * on the public marketplace pages.
 */

export interface BaseTemplateOptions {
  title: string;
  body: string;
  headExtra?: string;
}

export function baseTemplate(opts: BaseTemplateOptions): string {
  const { title, body, headExtra = '' } = opts;

  return `<!DOCTYPE html>
<html lang="en-NG">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} | WebWaka Discover</title>
  <link rel="icon" href="https://webwaka.ng/favicon.ico" />
  ${headExtra}
  <style>
:root {
  --ww-primary:    #1a6b3a;
  --ww-secondary:  #f5a623;
  --ww-text:       #111827;
  --ww-text-muted: #6b7280;
  --ww-bg:         #ffffff;
  --ww-bg-surface: #f9fafb;
  --ww-border:     #e5e7eb;
  --ww-radius:     8px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter','Segoe UI',system-ui,sans-serif; background:var(--ww-bg); color:var(--ww-text); min-height:100vh; display:flex; flex-direction:column; }
a { color: var(--ww-primary); text-decoration: none; }
a:hover { text-decoration: underline; }
.ww-nav { display:flex; align-items:center; justify-content:space-between; padding:.875rem 1.5rem; border-bottom:1px solid var(--ww-border); background:var(--ww-bg); }
.ww-nav-brand { font-size:1.125rem; font-weight:800; color:var(--ww-primary); letter-spacing:-.5px; }
.ww-content { flex:1; padding:2rem 1.5rem; max-width:72rem; margin:0 auto; width:100%; }
.ww-footer { text-align:center; padding:1.5rem; font-size:.8125rem; color:var(--ww-text-muted); border-top:1px solid var(--ww-border); }
.ww-search { display:flex; gap:.5rem; margin-bottom:1.5rem; }
.ww-search input { flex:1; padding:.625rem 1rem; border:1px solid var(--ww-border); border-radius:var(--ww-radius); font-size:1rem; outline:none; }
.ww-search button { padding:.625rem 1.25rem; background:var(--ww-primary); color:#fff; border:none; border-radius:var(--ww-radius); font-weight:600; cursor:pointer; }
.ww-grid { display:grid; gap:1rem; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); }
.ww-card { border:1px solid var(--ww-border); border-radius:var(--ww-radius); padding:1.25rem; background:var(--ww-bg-surface); }
.ww-card h3 { font-size:1rem; font-weight:600; margin-bottom:.375rem; }
.ww-card p { font-size:.875rem; color:var(--ww-text-muted); }
.ww-badge { display:inline-block; padding:.125rem .5rem; border-radius:999px; font-size:.75rem; font-weight:600; background:var(--ww-secondary); color:#fff; margin-bottom:.5rem; }
@media (min-width:640px) { .ww-content { padding:2.5rem 2rem; } }
  </style>
</head>
<body>
  <nav class="ww-nav">
    <a class="ww-nav-brand" href="/">WebWaka Discover</a>
    <a href="https://webwaka.ng" style="font-size:.875rem;color:var(--ww-text-muted)">List your business →</a>
  </nav>
  <main class="ww-content">${body}</main>
  <footer class="ww-footer">
    <p>© ${new Date().getFullYear()} WebWaka OS — Nigeria's Business Platform</p>
  </footer>
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
