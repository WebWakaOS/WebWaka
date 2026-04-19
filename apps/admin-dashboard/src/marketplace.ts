/**
 * Template Marketplace UI — PROD-02
 *
 * Serves HTML pages for browsing, viewing, and installing templates
 * directly within the tenant admin dashboard.
 *
 * Routes:
 *   GET  /marketplace                  — paginated template listing with search + type filter
 *   GET  /marketplace/:slug            — template detail page
 *   POST /marketplace/install/:slug    — install action (calls main API, then redirects)
 *
 * Auth: all routes require JWT (applied by parent app middleware).
 * T3:   install action is scoped to the caller's workspace_id from JWT.
 * P9:   prices displayed in NGN (price_kobo / 100), but stored as integers.
 */

import { Hono } from 'hono';
import type { AuthContext } from '@webwaka/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  API_BASE_URL: string;
}

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

interface TemplateRow {
  id: string;
  slug: string;
  display_name: string;
  description: string;
  template_type: string;
  version: string;
  compatible_verticals: string;
  is_free: number;
  price_kobo: number;
  install_count: number;
  status: string;
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatPrice(priceKobo: number, isFree: number): string {
  if (isFree === 1 || priceKobo === 0) return 'Free';
  const naira = Math.floor(priceKobo / 100);
  return `₦${naira.toLocaleString('en-NG')}`;
}

function typeLabel(t: string): string {
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    website: 'Website',
    'vertical-blueprint': 'Vertical Blueprint',
    workflow: 'Workflow',
    email: 'Email Template',
    module: 'Module',
  };
  return map[t] ?? t;
}

function basePage(opts: { title: string; body: string; activeWorkspace?: string }): string {
  return `<!DOCTYPE html>
<html lang="en-NG">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(opts.title)} — WebWaka Admin</title>
  <link rel="icon" href="https://webwaka.com/favicon.ico" fetchpriority="low" />
  <style>
:root {
  --ww-primary: #006400;
  --ww-secondary: #f5a623;
  --ww-bg: #f9fafb;
  --ww-surface: #ffffff;
  --ww-border: #e5e7eb;
  --ww-text: #111827;
  --ww-muted: #6b7280;
  --ww-radius: 8px;
  --ww-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter','Segoe UI',system-ui,sans-serif; background: var(--ww-bg); color: var(--ww-text); min-height: 100dvh; }
.ww-nav { background: var(--ww-primary); padding: 0.75rem 1.5rem; display: flex; align-items: center; gap: 1.5rem; }
.ww-nav a { color: #fff; text-decoration: none; font-weight: 500; opacity: .85; }
.ww-nav a:hover, .ww-nav a.active { opacity: 1; }
.ww-nav .brand { font-size: 1.1rem; font-weight: 700; }
.ww-container { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }
.ww-heading { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
.ww-sub { font-size: 0.95rem; color: var(--ww-muted); margin-top: .25rem; }
.ww-card { background: var(--ww-surface); border: 1px solid var(--ww-border); border-radius: var(--ww-radius); box-shadow: var(--ww-shadow); padding: 1.25rem; display: flex; flex-direction: column; gap: .5rem; }
.ww-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
.ww-badge { display: inline-block; padding: .2rem .6rem; border-radius: 4px; font-size: .75rem; font-weight: 600; background: #e8f5e9; color: var(--ww-primary); }
.ww-badge.paid { background: #fff3cd; color: #856404; }
.ww-badge.type { background: #e0f2fe; color: #0369a1; }
.ww-btn { display: inline-block; padding: .5rem 1.25rem; border-radius: 6px; font-weight: 600; font-size: .9rem; cursor: pointer; text-decoration: none; border: none; }
.ww-btn-primary { background: var(--ww-primary); color: #fff; }
.ww-btn-primary:hover { background: #004d00; }
.ww-btn-secondary { background: var(--ww-surface); color: var(--ww-primary); border: 1.5px solid var(--ww-primary); }
.ww-btn-secondary:hover { background: #e8f5e9; }
.ww-search-bar { display: flex; gap: .75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
.ww-search-bar input, .ww-search-bar select { padding: .5rem .75rem; border: 1px solid var(--ww-border); border-radius: 6px; font-size: .9rem; }
.ww-search-bar input { flex: 1; min-width: 200px; }
.ww-install-count { font-size: .8rem; color: var(--ww-muted); }
.ww-price { font-size: 1rem; font-weight: 700; color: var(--ww-primary); }
.ww-price.paid { color: #856404; }
.ww-card-actions { display: flex; gap: .75rem; margin-top: .5rem; align-items: center; }
.ww-detail { background: var(--ww-surface); border: 1px solid var(--ww-border); border-radius: var(--ww-radius); padding: 2rem; max-width: 720px; }
.ww-detail h2 { font-size: 1.4rem; margin-bottom: .75rem; }
.ww-detail p { color: var(--ww-muted); line-height: 1.6; margin-bottom: 1.25rem; }
.ww-meta-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.ww-meta-item { font-size: .85rem; color: var(--ww-muted); }
.ww-meta-item strong { color: var(--ww-text); }
.ww-alert { padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
.ww-alert-success { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
.ww-alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.ww-pagination { display: flex; gap: .5rem; margin-top: 2rem; align-items: center; }
.ww-pagination a { padding: .4rem .8rem; border: 1px solid var(--ww-border); border-radius: 5px; text-decoration: none; color: var(--ww-primary); font-size: .9rem; }
.ww-pagination a.active { background: var(--ww-primary); color: #fff; border-color: var(--ww-primary); }
.ww-empty { text-align: center; padding: 3rem 1rem; color: var(--ww-muted); }
.ww-verticals { font-size: .8rem; color: var(--ww-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
  </style>
</head>
<body>
  <nav class="ww-nav">
    <span class="brand">WebWaka Admin</span>
    <a href="/layout">Dashboard</a>
    <a href="/billing">Billing</a>
    <a href="/marketplace" class="active">Marketplace</a>
  </nav>
  <div class="ww-container">
    ${opts.body}
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const marketplaceRouter = new Hono<{ Bindings: Env }>();

const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// GET /marketplace — template listing with search + filter
// ---------------------------------------------------------------------------

marketplaceRouter.get('/', async (c) => {
  const db = c.env.DB as unknown as D1Like;

  const q = (c.req.query('q') ?? '').trim();
  const typeFilter = c.req.query('type') ?? '';
  const priceFilter = c.req.query('price') ?? '';   // 'free' | 'paid' | ''
  const pageStr = c.req.query('page') ?? '1';
  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Build WHERE clauses
  const conditions: string[] = ["status = 'approved'"];
  const bindings: unknown[] = [];

  if (q) {
    conditions.push("(display_name LIKE ? OR description LIKE ?)");
    bindings.push(`%${q}%`, `%${q}%`);
  }
  if (typeFilter) {
    conditions.push("template_type = ?");
    bindings.push(typeFilter);
  }
  if (priceFilter === 'free') {
    conditions.push("is_free = 1");
  } else if (priceFilter === 'paid') {
    conditions.push("is_free = 0");
  }

  const where = conditions.join(' AND ');

  // Count total for pagination
  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total FROM template_registry WHERE ${where}`)
    .bind(...bindings)
    .first<{ total: number }>();
  const total = countRow?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Fetch page
  const { results } = await db
    .prepare(
      `SELECT id, slug, display_name, description, template_type, version,
              compatible_verticals, is_free, price_kobo, install_count, status
         FROM template_registry
        WHERE ${where}
        ORDER BY install_count DESC, created_at DESC
        LIMIT ? OFFSET ?`,
    )
    .bind(...bindings, PAGE_SIZE, offset)
    .all<TemplateRow>();

  // Build search/filter bar
  const qParam = esc(q);
  const filterBar = `
    <form class="ww-search-bar" method="GET" action="/marketplace">
      <input type="search" name="q" value="${qParam}" placeholder="Search templates…" />
      <select name="type">
        <option value="">All types</option>
        ${['dashboard','website','vertical-blueprint','workflow','email','module']
          .map((t) => `<option value="${t}"${typeFilter === t ? ' selected' : ''}>${typeLabel(t)}</option>`)
          .join('')}
      </select>
      <select name="price">
        <option value="">Any price</option>
        <option value="free"${priceFilter === 'free' ? ' selected' : ''}>Free</option>
        <option value="paid"${priceFilter === 'paid' ? ' selected' : ''}>Paid</option>
      </select>
      <button type="submit" class="ww-btn ww-btn-primary">Search</button>
      ${q || typeFilter || priceFilter
        ? `<a href="/marketplace" class="ww-btn ww-btn-secondary">Clear</a>`
        : ''}
    </form>`;

  // Build template cards
  let cardsHtml: string;
  if (results.length === 0) {
    cardsHtml = `<div class="ww-empty"><p>No templates found matching your filters.</p></div>`;
  } else {
    const cards = results.map((t) => {
      const isFree = t.is_free === 1 || t.price_kobo === 0;
      const priceLabel = formatPrice(t.price_kobo, t.is_free);
      const verticalsRaw: unknown[] = (() => {
        try { return JSON.parse(t.compatible_verticals) as unknown[]; } catch { return []; }
      })();
      const verticalsList = (verticalsRaw as string[]).slice(0, 3).join(', ');

      return `
        <div class="ww-card">
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.25rem">
            <span class="ww-badge type">${esc(typeLabel(t.template_type))}</span>
            <span class="ww-badge${isFree ? '' : ' paid'}">${isFree ? 'Free' : 'Paid'}</span>
          </div>
          <strong style="font-size:1rem">${esc(t.display_name)}</strong>
          <p style="font-size:.875rem;color:var(--ww-muted);line-height:1.4;flex:1">${esc(t.description.slice(0, 120))}${t.description.length > 120 ? '…' : ''}</p>
          ${verticalsList ? `<p class="ww-verticals">Verticals: ${esc(verticalsList)}</p>` : ''}
          <div class="ww-card-actions">
            <span class="ww-price${isFree ? '' : ' paid'}">${esc(priceLabel)}</span>
            <span class="ww-install-count">↓ ${t.install_count.toLocaleString('en-NG')}</span>
            <a href="/marketplace/${esc(t.slug)}" class="ww-btn ww-btn-secondary" style="margin-left:auto">View</a>
          </div>
        </div>`;
    }).join('');
    cardsHtml = `<div class="ww-grid">${cards}</div>`;
  }

  // Pagination
  let pagHtml = '';
  if (totalPages > 1) {
    const buildHref = (p: number) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (typeFilter) params.set('type', typeFilter);
      if (priceFilter) params.set('price', priceFilter);
      params.set('page', String(p));
      return `/marketplace?${params.toString()}`;
    };
    const links = [];
    if (page > 1) links.push(`<a href="${buildHref(page - 1)}">‹ Prev</a>`);
    for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) {
      links.push(`<a href="${buildHref(p)}"${p === page ? ' class="active"' : ''}>${p}</a>`);
    }
    if (page < totalPages) links.push(`<a href="${buildHref(page + 1)}">Next ›</a>`);
    pagHtml = `<div class="ww-pagination">${links.join('')}<span style="margin-left:auto;font-size:.85rem;color:var(--ww-muted)">${total} template${total !== 1 ? 's' : ''}</span></div>`;
  }

  const body = `
    <div style="display:flex;align-items:baseline;gap:1rem;margin-bottom:1rem">
      <h1 class="ww-heading" style="margin-bottom:0">Template Marketplace</h1>
      <span class="ww-sub">${total} template${total !== 1 ? 's' : ''} available</span>
    </div>
    ${filterBar}
    ${cardsHtml}
    ${pagHtml}`;

  return c.html(basePage({ title: 'Template Marketplace', body }));
});

// ---------------------------------------------------------------------------
// GET /marketplace/:slug — template detail page
// ---------------------------------------------------------------------------

marketplaceRouter.get('/:slug', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');

  const tpl = await db
    .prepare(
      `SELECT id, slug, display_name, description, template_type, version,
              platform_compat, compatible_verticals, is_free, price_kobo,
              install_count, status, author_tenant_id
         FROM template_registry
        WHERE slug = ? AND status = 'approved'`,
    )
    .bind(slug)
    .first<TemplateRow & { platform_compat: string; author_tenant_id: string | null }>();

  if (!tpl) {
    return c.html(
      basePage({
        title: 'Not Found',
        body: `<div class="ww-empty"><p>Template not found or not yet approved.</p><a href="/marketplace" class="ww-btn ww-btn-secondary" style="margin-top:1rem">Back to Marketplace</a></div>`,
      }),
      404,
    );
  }

  const isFree = tpl.is_free === 1 || tpl.price_kobo === 0;
  const priceLabel = formatPrice(tpl.price_kobo, tpl.is_free);

  const verticalsRaw: string[] = (() => {
    try { return JSON.parse(tpl.compatible_verticals) as string[]; } catch { return []; }
  })();

  // Check if already installed for this tenant (T3 scoped by tenant_id + template_id)
  let alreadyInstalled = false;
  if (auth.tenantId) {
    const inst = await db
      .prepare(
        `SELECT id FROM template_installations
          WHERE template_id = ? AND tenant_id = ?`,
      )
      .bind(tpl.id, String(auth.tenantId))
      .first<{ id: string }>();
    alreadyInstalled = inst !== null;
  }

  // Surface ?installed=1 success banner (set by redirect after install)
  const justInstalled = c.req.query('installed') === '1';

  // Build install/purchase CTA
  let cta: string;
  if (alreadyInstalled) {
    cta = `<span class="ww-badge" style="font-size:.9rem;padding:.4rem .8rem">✓ Installed</span>`;
  } else if (isFree) {
    cta = `
      <form method="POST" action="/marketplace/install/${esc(tpl.slug)}">
        <button type="submit" class="ww-btn ww-btn-primary">Install Free Template</button>
      </form>`;
  } else {
    // Paid template — direct to purchase endpoint
    cta = `
      <div style="display:flex;gap:1rem;align-items:center">
        <span class="ww-price paid" style="font-size:1.1rem">${esc(priceLabel)}</span>
        <form method="POST" action="/marketplace/install/${esc(tpl.slug)}">
          <button type="submit" class="ww-btn ww-btn-primary">Purchase &amp; Install</button>
        </form>
      </div>`;
  }

  const body = `
    <div style="margin-bottom:1rem"><a href="/marketplace" style="color:var(--ww-primary);text-decoration:none">← Back to Marketplace</a></div>
    ${justInstalled ? `<div class="ww-alert ww-alert-success">✓ Template installed successfully!</div>` : ''}
    <div class="ww-detail">
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem">
        <span class="ww-badge type">${esc(typeLabel(tpl.template_type))}</span>
        <span class="ww-badge${isFree ? '' : ' paid'}">${isFree ? 'Free' : 'Paid'}</span>
      </div>
      <h2>${esc(tpl.display_name)}</h2>
      <p>${esc(tpl.description)}</p>
      <div class="ww-meta-row">
        <span class="ww-meta-item"><strong>Version:</strong> ${esc(tpl.version)}</span>
        <span class="ww-meta-item"><strong>Installs:</strong> ${tpl.install_count.toLocaleString('en-NG')}</span>
        <span class="ww-meta-item"><strong>Platform:</strong> ${esc(tpl.platform_compat)}</span>
        ${verticalsRaw.length > 0
          ? `<span class="ww-meta-item"><strong>Verticals:</strong> ${esc(verticalsRaw.slice(0, 5).join(', '))}${verticalsRaw.length > 5 ? ` +${verticalsRaw.length - 5} more` : ''}</span>`
          : ''}
      </div>
      <div style="margin-top:1.5rem">${cta}</div>
    </div>`;

  return c.html(basePage({ title: tpl.display_name, body }));
});

// ---------------------------------------------------------------------------
// POST /marketplace/install/:slug — install action
//
// Calls the main API's POST /templates/:slug/install on behalf of the tenant.
// For paid templates that aren't yet purchased, redirects to the Paystack flow.
// ---------------------------------------------------------------------------

marketplaceRouter.post('/install/:slug', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const slug = c.req.param('slug');
  const apiBase = c.env.API_BASE_URL ?? 'https://api.webwaka.com';

  // Forward the original Authorization header to the main API
  const authHeader = c.req.header('Authorization') ?? '';

  let apiRes: Response;
  try {
    apiRes = await fetch(`${apiBase}/templates/${encodeURIComponent(slug)}/install`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ workspace_id: auth.workspaceId }),
    });
  } catch {
    const body = `
      <div class="ww-alert ww-alert-error">Could not reach the WebWaka API. Please try again.</div>
      <a href="/marketplace/${esc(slug)}" class="ww-btn ww-btn-secondary">Back</a>`;
    return c.html(basePage({ title: 'Install Error', body }), 503);
  }

  if (apiRes.status === 402) {
    // Paid template — redirect to purchase initiation
    const body = `
      <div class="ww-alert ww-alert-error">This template requires purchase before installation.</div>
      <p style="color:var(--ww-muted);margin:.75rem 0 1.25rem">Paid template purchase via Paystack coming soon. Contact support for early access.</p>
      <a href="/marketplace/${esc(slug)}" class="ww-btn ww-btn-secondary">Back to Template</a>`;
    return c.html(basePage({ title: 'Purchase Required', body }), 200);
  }

  if (!apiRes.ok) {
    let errMsg = 'Installation failed.';
    try {
      const errBody = await apiRes.json() as { error?: string };
      errMsg = errBody.error ?? errMsg;
    } catch { /* ignore */ }

    const body = `
      <div class="ww-alert ww-alert-error">${esc(errMsg)}</div>
      <a href="/marketplace/${esc(slug)}" class="ww-btn ww-btn-secondary" style="margin-top:.5rem">Back</a>`;
    return c.html(basePage({ title: 'Install Error', body }), 200);
  }

  // Success — redirect to template detail with success message
  return c.redirect(`/marketplace/${encodeURIComponent(slug)}?installed=1`);
});
