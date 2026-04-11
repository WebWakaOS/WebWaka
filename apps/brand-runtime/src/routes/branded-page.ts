/**
 * Branded public home page route.
 * (Pillar 2 — PV-1.1)
 *
 * GET /            → branded home (when host is custom domain or brand-*.webwaka.ng)
 * GET /:slug       → branded home by slug (fallback path pattern)
 *
 * No auth required — public page.
 * T3: tenant isolation via tenantResolve middleware.
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env, Variables } from '../env.js';
import { generateCssTokens } from '../lib/theme.js';
import { baseTemplate } from '../templates/base.js';
import { brandedHomeBody } from '../templates/branded-home.js';

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

router.get('/', async (c) => {
  const slug = c.get('tenantSlug');
  return renderBrandedHome(c.env, slug, c);
});

router.get('/:slug', async (c) => {
  const slug = c.get('tenantSlug');
  return renderBrandedHome(c.env, slug, c);
});

async function renderBrandedHome(
  env: Env,
  slug: string,
  c: Context<{ Bindings: Env; Variables: Variables }>,
) {
  let cssVars: string;
  let theme: import('../lib/theme.js').TenantTheme;

  try {
    const result = await generateCssTokens(slug, env);
    cssVars = result.cssVars;
    theme = result.theme;
  } catch {
    return c.text('Tenant not found', 404);
  }

  // Fetch top 6 offerings for this tenant (T3 — WHERE tenant_id = ?)
  const offeringsResult = await env.DB
    .prepare(
      `SELECT name, description, price_kobo
       FROM offerings
       WHERE tenant_id = ? AND is_published = 1
       ORDER BY sort_order ASC, created_at DESC
       LIMIT 6`,
    )
    .bind(theme.tenantId)
    .all<{ name: string; description: string | null; price_kobo: number | null }>();

  const body = brandedHomeBody({
    displayName: theme.displayName,
    tagline: null,
    description: null,
    primaryColor: theme.primaryColor,
    logoUrl: theme.logoUrl,
    ctaLabel: 'View Offerings',
    ctaUrl: '#offerings',
    offerings: (offeringsResult.results ?? []).map((o) => ({
      name: o.name,
      description: o.description,
      priceKobo: o.price_kobo,
    })),
  });

  const html = baseTemplate({
    title: 'Welcome',
    cssVars,
    logoUrl: theme.logoUrl,
    displayName: theme.displayName,
    faviconUrl: theme.faviconUrl,
    body,
  });

  return c.html(html);
}

export { router as brandedPageRouter };
