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
import type { Env } from '../env.js';
import { tenantResolve } from '../middleware/tenant-resolve.js';
import { generateCssTokens } from '../lib/theme.js';
import { baseTemplate } from '../templates/base.js';

type Variables = { tenantSlug: string };

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

router.use('*', tenantResolve);

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
  const identifier = form.get('identifier') as string | null;
  const password = form.get('password') as string | null;

  if (!identifier || !password) {
    return c.redirect(`/portal/login?error=missing_fields`);
  }

  // Delegate auth to API Worker (inter-service call)
  const apiBase =
    c.env.ENVIRONMENT === 'production'
      ? 'https://api.webwaka.ng'
      : c.env.ENVIRONMENT === 'staging'
        ? 'https://api-staging.webwaka.ng'
        : 'http://localhost:8787';

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

export { router as portalRouter };

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
