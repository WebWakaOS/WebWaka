/**
 * Tenant portal routes — login shell and dashboard redirect.
 * (Pillar 2 — PV-1.1)
 *
 * GET  /portal/login   → tenant-branded login page
 * POST /portal/login   → JWT issuance (delegates to API Worker via inter-service call)
 * GET  /portal/        → redirect authenticated users to admin dashboard
 *
 * The portal shell is rendered server-side with tenant branding.
 * Actual auth state lives as a cookie issued by the API Worker — the portal
 * here is purely a branded UI shell.
 */

import { Hono } from 'hono';
import type { Env, Variables } from '../env.js';
import { generateCssTokens } from '../lib/theme.js';
import { baseTemplate } from '../templates/base.js';

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /portal/login — branded login page
router.get('/login', async (c) => {
  const slug = c.get('tenantSlug');
  let cssVars: string;
  let theme: import('../lib/theme.js').TenantTheme;

  try {
    const result = await generateCssTokens(slug, c.env);
    cssVars = result.cssVars;
    theme = result.theme;
  } catch {
    return c.text('Tenant not found', 404);
  }

  const body = `
    <div style="max-width:28rem;margin:4rem auto;padding:2rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);background:var(--ww-bg-surface)">
      <h1 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem;color:var(--ww-primary);text-align:center">
        Sign in to ${escHtml(theme.displayName)}
      </h1>
      <form method="POST" action="/portal/login" style="display:flex;flex-direction:column;gap:1rem">
        <div>
          <label style="display:block;font-size:.875rem;font-weight:600;margin-bottom:.375rem">
            Phone number or email
          </label>
          <input
            name="identifier"
            type="text"
            required
            autocomplete="username"
            style="width:100%;padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:1rem;outline:none"
            placeholder="+234 800 000 0000"
          />
        </div>
        <div>
          <label style="display:block;font-size:.875rem;font-weight:600;margin-bottom:.375rem">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autocomplete="current-password"
            style="width:100%;padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:1rem;outline:none"
          />
        </div>
        <button class="ww-btn" type="submit" style="width:100%;justify-content:center;margin-top:.5rem">
          Sign in
        </button>
      </form>
    </div>`;

  return c.html(
    baseTemplate({
      title: 'Sign in',
      cssVars,
      logoUrl: theme.logoUrl,
      displayName: theme.displayName,
      faviconUrl: theme.faviconUrl,
      body,
    }),
  );
});

// POST /portal/login — forward credentials to API Worker, set cookie, redirect
router.post('/login', async (c) => {
  const slug = c.get('tenantSlug');
  const form = await c.req.formData();
  const identifier = form.get('identifier');
  const password = form.get('password');

  if (!identifier || !password) {
    return c.redirect(`/portal/login?error=missing_fields`);
  }

  // Delegate auth to API Worker (inter-service call).
  // API_BASE_URL env var is the canonical source; per-environment fallbacks used
  // only when the binding is absent (local dev or misconfigured staging).
  const apiBase =
    c.env.API_BASE_URL ??
    (c.env.ENVIRONMENT === 'production'
      ? 'https://api.webwaka.com'
      : c.env.ENVIRONMENT === 'staging'
        ? 'https://api-staging.webwaka.com'
        : 'http://localhost:8787');

  const resp = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Inter-Service-Secret': c.env.INTER_SERVICE_SECRET,
      'X-Tenant-Slug': slug,
    },
    body: JSON.stringify({ identifier, password }),
  });

  if (!resp.ok) {
    return c.redirect(`/portal/login?error=invalid_credentials`);
  }

  const { token } = await resp.json<{ token: string }>();

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/portal/',
      'Set-Cookie': `ww_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
    },
  });
});

// GET /portal/ — dashboard redirect (auth check is on the admin-dashboard Worker)
router.get('/', (c) => c.redirect('/portal/dashboard'));

// GET /portal/dashboard — branded portal dashboard shell.
// The actual workspace content is loaded client-side from the admin-dashboard Worker.
// Auth state is validated by the downstream admin-dashboard Worker; this shell
// only renders the branded HTML wrapper.
router.get('/dashboard', async (c) => {
  const slug = c.get('tenantSlug');
  let cssVars: string;
  let theme: import('../lib/theme.js').TenantTheme;

  try {
    const result = await generateCssTokens(slug, c.env);
    cssVars = result.cssVars;
    theme = result.theme;
  } catch {
    return c.text('Tenant not found', 404);
  }

  const body = `
    <div style="max-width:64rem;margin:0 auto;padding:2rem 1rem">
      <header style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;padding-bottom:1rem;border-bottom:1px solid var(--ww-border)">
        ${theme.logoUrl ? `<img src="${escHtml(theme.logoUrl)}" alt="${escHtml(theme.displayName)} logo" style="height:2.5rem;object-fit:contain" />` : ''}
        <h1 style="font-size:1.25rem;font-weight:700;color:var(--ww-primary)">${escHtml(theme.displayName)} — Dashboard</h1>
      </header>
      <nav style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:2rem">
        <a href="/portal/dashboard" style="padding:.5rem 1rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:.875rem;font-weight:600;text-decoration:none">Overview</a>
        <a href="/portal/login" style="padding:.5rem 1rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.875rem;color:var(--ww-text-muted);text-decoration:none">Sign out</a>
      </nav>
      <section style="background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:2rem;text-align:center;color:var(--ww-text-muted)">
        <p style="font-size:1.125rem;margin-bottom:.5rem">Your workspace dashboard is loading…</p>
        <p style="font-size:.875rem">If this message persists, please <a href="/contact" style="color:var(--ww-primary)">contact support</a>.</p>
      </section>
    </div>`;

  return c.html(
    baseTemplate({
      title: 'Dashboard',
      cssVars,
      logoUrl: theme.logoUrl,
      displayName: theme.displayName,
      faviconUrl: theme.faviconUrl,
      body,
    }),
  );
});

export { router as portalRouter };

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
