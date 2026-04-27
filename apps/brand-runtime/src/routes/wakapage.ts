/**
 * WakaPage public renderer route.
 * (Phase 2 — ADR-0041 D2)
 *
 * Route map:
 *   GET  /wakapage           → render tenant's published WakaPage
 *   POST /wakapage/leads     → lead capture form submission → wakapage_leads
 *
 * Tenant resolution: handled by tenantResolve middleware upstream (index.ts).
 * All D1 queries are tenant-scoped (T3 invariant).
 *
 * Rendering data flow:
 *   1. Resolve tenant (via middleware, c.get('tenantId'))
 *   2. Load published WakaPage for tenant → 404 if none
 *   3. Load visible blocks ordered by sort_order
 *   4. Load profile, offerings, blog posts, tenant_branding.social_links_json
 *   5. Resolve brand tokens (resolveCappedTheme)
 *   6. Render all blocks via wakapage-block-registry
 *   7. Wrap in wakaPageShell (standalone page HTML — not the branded site nav)
 *
 * Platform Invariants:
 *   T3 — tenantId from middleware; never from URL params or body
 *   P9 — price_kobo rendered as ₦ at template layer only
 *   P2 — Nigeria First: 360px base, mobile-first CSS, offline-capable forms
 *   NDPR — wakapage_leads PII documented in migration 0421
 *
 * Phase 2 scope: public rendering only.
 * NOT in scope: builder UI, analytics dashboard, audience/CRM (Phase 3).
 */

import { Hono } from 'hono';
import type { Env, Variables } from '../env.js';
import { resolveCappedTheme } from '../lib/depth-cap.js';
import { renderAllBlocks } from '../lib/wakapage-block-registry.js';
import { wakaPageShell } from '../templates/wakapage/page-shell.js';
import type {
  WakaPageDbRow,
  WakaBlockDbRow,
  WakaProfileDbRow,
  OfferingDbRow,
  BlogPostDbRow,
  RenderContext,
} from '../lib/wakapage-types.js';

const router = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------------------------------------------------------------------------
// Data fetchers — all tenant-scoped (T3 invariant)
// ---------------------------------------------------------------------------

async function fetchPublishedPage(
  env: Env,
  tenantId: string,
): Promise<WakaPageDbRow | null> {
  try {
    return await env.DB
      .prepare(
        `SELECT id, tenant_id, workspace_id, profile_id, slug, slug_source,
                publication_state, title, meta_description, og_image_url,
                analytics_enabled, custom_theme_json, template_installation_id,
                published_at, created_at, updated_at
         FROM wakapage_pages
         WHERE tenant_id = ? AND publication_state = 'published'
         ORDER BY published_at DESC
         LIMIT 1`,
      )
      .bind(tenantId)
      .first<WakaPageDbRow>();
  } catch (err) {
    console.error('[wakapage] fetchPublishedPage error:', err);
    return null;
  }
}

async function fetchBlocks(
  env: Env,
  pageId: string,
  tenantId: string,
): Promise<WakaBlockDbRow[]> {
  try {
    const result = await env.DB
      .prepare(
        `SELECT id, tenant_id, page_id, block_type, sort_order, is_visible,
                config_json, created_at, updated_at
         FROM wakapage_blocks
         WHERE page_id = ? AND tenant_id = ? AND is_visible = 1
         ORDER BY sort_order ASC, created_at ASC`,
      )
      .bind(pageId, tenantId)
      .all<WakaBlockDbRow>();
    return result.results ?? [];
  } catch {
    return [];
  }
}

async function fetchProfile(
  env: Env,
  profileId: string,
  tenantId: string,
): Promise<WakaProfileDbRow | null> {
  try {
    return await env.DB
      .prepare(
        `SELECT id, display_name, avatar_url, headline, content,
                verification_state, claim_status
         FROM profiles
         WHERE id = ? AND tenant_id = ?
         LIMIT 1`,
      )
      .bind(profileId, tenantId)
      .first<WakaProfileDbRow>();
  } catch {
    return null;
  }
}

async function fetchOfferings(
  env: Env,
  tenantId: string,
  limit = 12,
): Promise<OfferingDbRow[]> {
  try {
    const result = await env.DB
      .prepare(
        `SELECT id, name, description, price_kobo
         FROM offerings
         WHERE tenant_id = ? AND is_published = 1
         ORDER BY sort_order ASC, created_at DESC
         LIMIT ?`,
      )
      .bind(tenantId, limit)
      .all<OfferingDbRow>();
    return result.results ?? [];
  } catch {
    return [];
  }
}

async function fetchBlogPosts(
  env: Env,
  tenantId: string,
  limit = 5,
): Promise<BlogPostDbRow[]> {
  try {
    const result = await env.DB
      .prepare(
        `SELECT id, slug, title, excerpt, cover_image_url, published_at, author_name
         FROM blog_posts
         WHERE tenant_id = ? AND status = 'published'
         ORDER BY published_at DESC
         LIMIT ?`,
      )
      .bind(tenantId, limit)
      .all<BlogPostDbRow>();
    return result.results ?? [];
  } catch {
    return [];
  }
}

async function fetchSocialLinksJson(
  env: Env,
  tenantId: string,
): Promise<string | null> {
  try {
    const row = await env.DB
      .prepare(`SELECT social_links_json FROM tenant_branding WHERE tenant_id = ? LIMIT 1`)
      .bind(tenantId)
      .first<{ social_links_json: string | null }>();
    return row?.social_links_json ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Schema.org JSON-LD builder
// ---------------------------------------------------------------------------

function buildSchemaJsonLd(
  displayName: string,
  profile: WakaProfileDbRow | null,
  canonicalUrl: string,
): string {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: displayName,
    url: canonicalUrl,
  };
  if (profile?.avatar_url) schema['image'] = profile.avatar_url;
  if (profile?.headline) schema['description'] = profile.headline;
  return JSON.stringify(schema);
}

// ---------------------------------------------------------------------------
// GET /wakapage — render published WakaPage
// ---------------------------------------------------------------------------

router.get('/', async (c) => {
  const tenantId = c.get('tenantId');
  const tenantSlug = c.get('tenantSlug');

  if (!tenantId || !tenantSlug) {
    return c.text('Tenant not found', 404);
  }

  // Resolve brand tokens (includes whiteLabelDepth cap)
  const resolved = await resolveCappedTheme(c);
  if (!resolved) return c.text('Tenant not found', 404);
  const { cssVars, theme } = resolved;

  // Load published WakaPage
  const page = await fetchPublishedPage(c.env, tenantId);
  if (!page) return c.html(render404Page(theme.displayName, cssVars), 404);

  // Load all page data in parallel — Nigeria First: single Worker invocation
  const [blocks, profile, offerings, blogPosts, socialLinksJson] = await Promise.all([
    fetchBlocks(c.env, page.id, tenantId),
    fetchProfile(c.env, page.profile_id, tenantId),
    fetchOfferings(c.env, tenantId),
    fetchBlogPosts(c.env, tenantId),
    fetchSocialLinksJson(c.env, tenantId),
  ]);

  const ctx: RenderContext = {
    tenantId,
    tenantSlug,
    displayName: theme.displayName,
    primaryColor: theme.primaryColor,
    cssVars,
    page,
    profile,
    socialLinksJson,
    offerings,
    blogPosts,
  };

  const blocksHtml = renderAllBlocks(blocks, ctx);

  const host = c.req.header('host') ?? `brand-${tenantSlug}.webwaka.com`;
  const canonicalUrl = `https://${host}/wakapage`;

  const schemaJsonLd = buildSchemaJsonLd(theme.displayName, profile, canonicalUrl);

  const pageTitle = page.title ?? theme.displayName;
  const html = wakaPageShell({
    title: pageTitle,
    displayName: theme.displayName,
    cssVars,
    logoUrl: theme.logoUrl,
    faviconUrl: theme.faviconUrl,
    blocksHtml,
    metaDescription: page.meta_description,
    ogImageUrl: page.og_image_url ?? theme.logoUrl,
    canonicalUrl,
    schemaJsonLd,
    removeAttribution: false,
  });

  return c.html(html, 200, {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  });
});

// ---------------------------------------------------------------------------
// POST /wakapage/leads — lead capture from contact_form block
// ---------------------------------------------------------------------------

router.post('/leads', async (c) => {
  const tenantId = c.get('tenantId');
  if (!tenantId) return c.json({ error: 'Tenant not found' }, 404);

  const contentType = c.req.header('content-type') ?? '';
  let pageId = '';
  let name = '';
  let phone = '';
  let email: string | null = null;
  let message = '';

  if (contentType.includes('application/json')) {
    const body = await c.req.json<{
      page_id?: string; name?: string; phone?: string; email?: string; message?: string;
    }>();
    pageId   = (body.page_id ?? '').trim();
    name     = (body.name ?? '').trim();
    phone    = (body.phone ?? '').trim();
    email    = (body.email ?? '').trim() || null;
    message  = (body.message ?? '').trim();
  } else {
    const form = await c.req.formData();
    pageId   = ((form.get('page_id') as string) ?? '').trim();
    name     = ((form.get('name') as string) ?? '').trim();
    phone    = ((form.get('phone') as string) ?? '').trim();
    email    = ((form.get('email') as string) ?? '').trim() || null;
    message  = ((form.get('message') as string) ?? '').trim();
  }

  if (!name || !phone || !message) {
    return c.json({ error: 'name, phone, and message are required' }, 400);
  }

  if (!pageId) {
    return c.json({ error: 'page_id is required' }, 400);
  }

  // Verify page belongs to this tenant (T3 — never trust client-supplied tenant)
  let verifiedPageId: string | null = null;
  try {
    const pageRow = await c.env.DB
      .prepare(`SELECT id FROM wakapage_pages WHERE id = ? AND tenant_id = ? LIMIT 1`)
      .bind(pageId, tenantId)
      .first<{ id: string }>();
    verifiedPageId = pageRow?.id ?? null;
  } catch {
    return c.json({ error: 'Internal error' }, 500);
  }

  if (!verifiedPageId) {
    return c.json({ error: 'Page not found' }, 404);
  }

  try {
    await c.env.DB
      .prepare(
        `INSERT INTO wakapage_leads (id, tenant_id, page_id, name, phone, email, message, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'new', unixepoch())`,
      )
      .bind(
        `lead_${crypto.randomUUID().replace(/-/g, '')}`,
        tenantId,
        verifiedPageId,
        name,
        phone,
        email,
        message,
      )
      .run();
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('no such table')) {
      console.warn('[wakapage/leads] wakapage_leads table not found — submission not persisted');
    } else {
      console.error('[wakapage/leads] DB error:', msg);
      return c.json({ error: 'Failed to save lead' }, 500);
    }
  }

  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// 404 page for unpublished WakaPage
// ---------------------------------------------------------------------------

function render404Page(displayName: string, cssVars: string): string {
  const dn = displayName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="en-NG">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Page Not Found — ${dn}</title>
  <style>${cssVars}
body{font-family:var(--ww-font,system-ui,sans-serif);background:var(--ww-bg,#f9fafb);color:var(--ww-text,#111827);display:flex;align-items:center;justify-content:center;min-height:100dvh;margin:0}
.card{max-width:380px;text-align:center;padding:2rem 1.5rem}
h1{font-size:1.25rem;margin-bottom:.5rem}
p{color:var(--ww-text-muted,#6b7280);font-size:.9375rem}
  </style>
</head>
<body>
  <div class="card">
    <h1>Page Not Published</h1>
    <p>${dn} hasn't published their WakaPage yet.</p>
  </div>
</body>
</html>`;
}

export { router as wakaPageRouter };
