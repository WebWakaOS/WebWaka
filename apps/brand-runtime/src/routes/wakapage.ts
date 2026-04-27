/**
 * WakaPage public renderer route.
 * (Phase 2 — ADR-0041 D2; Phase 3 enhancements)
 *
 * Route map:
 *   GET  /wakapage           → render tenant's published WakaPage
 *   POST /wakapage/leads     → lead capture form submission → wakapage_leads
 *
 * Phase 3 additions (ADR-0041 D8 + QA scope):
 *   - Suspended-tenant 503: workspaces.status = 'suspended' returns 503 before page load
 *   - WakaPageViewed analytics event: fire-and-forget write to event_log on every page render
 *   - Cache-Control upgrade: s-maxage=300 stale-while-revalidate=600 (ADR D8)
 *   - Live data for social_feed, community, event_list blocks
 *
 * Tenant resolution: handled by tenantResolve middleware upstream (index.ts).
 * All D1 queries are tenant-scoped (T3 invariant).
 *
 * Rendering data flow:
 *   1. Resolve tenant (via middleware, c.get('tenantId'))
 *   2. Resolve brand tokens (resolveCappedTheme)
 *   3. [Phase 3] Check workspace suspension → 503 if suspended
 *   4. Load published WakaPage for tenant → 404 if none
 *   5. Load visible blocks ordered by sort_order
 *   6. Load profile, offerings, blog posts, social posts, community spaces/events
 *   7. Render all blocks via wakapage-block-registry
 *   8. Wrap in wakaPageShell
 *   9. [Phase 3] Fire WakaPageViewed event (fire-and-forget, non-blocking)
 *
 * Platform Invariants:
 *   T3 — tenantId from middleware; never from URL params or body
 *   P9 — price_kobo rendered as ₦ at template layer only
 *   P2 — Nigeria First: 360px base, mobile-first CSS, offline-capable forms
 *   NDPR — wakapage_leads PII documented in migration 0421
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
  SocialPostDbRow,
  CommunitySpaceDbRow,
  CommunityEventDbRow,
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
// Phase 3 — live data fetchers for previously-stubbed blocks
// ---------------------------------------------------------------------------

/**
 * Fetch recent published social posts for the social_feed block.
 * Gracefully degrades to [] if social_posts table does not exist (migration not applied).
 */
async function fetchSocialPosts(
  env: Env,
  tenantId: string,
  limit = 5,
): Promise<SocialPostDbRow[]> {
  try {
    const result = await env.DB
      .prepare(
        `SELECT id, content, post_type, like_count, comment_count, created_at
         FROM social_posts
         WHERE tenant_id = ? AND moderation_status = 'published' AND is_deleted = 0
         ORDER BY created_at DESC
         LIMIT ?`,
      )
      .bind(tenantId, limit)
      .all<SocialPostDbRow>();
    return result.results ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetch public community spaces for the community block.
 * Gracefully degrades to [] if community_spaces table does not exist.
 */
async function fetchCommunitySpaces(
  env: Env,
  tenantId: string,
  limit = 3,
): Promise<CommunitySpaceDbRow[]> {
  try {
    const result = await env.DB
      .prepare(
        `SELECT id, name, slug, description, visibility, member_count
         FROM community_spaces
         WHERE tenant_id = ? AND visibility = 'public'
         ORDER BY member_count DESC, created_at ASC
         LIMIT ?`,
      )
      .bind(tenantId, limit)
      .all<CommunitySpaceDbRow>();
    return result.results ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetch upcoming community events for the event_list block.
 * Returns events whose starts_at is in the future (relative to now).
 * Gracefully degrades to [] if community_events table does not exist.
 */
async function fetchCommunityEvents(
  env: Env,
  tenantId: string,
  limit = 5,
): Promise<CommunityEventDbRow[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const result = await env.DB
      .prepare(
        `SELECT id, title, type, starts_at, ticket_price_kobo, rsvp_count, max_attendees
         FROM community_events
         WHERE tenant_id = ? AND starts_at > ?
         ORDER BY starts_at ASC
         LIMIT ?`,
      )
      .bind(tenantId, now, limit)
      .all<CommunityEventDbRow>();
    return result.results ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Phase 3 — workspace suspension check
// ---------------------------------------------------------------------------

/**
 * Returns the workspace status string for a tenant, or null on error.
 * Used to gate the WakaPage renderer with a 503 for suspended workspaces.
 * Query is separate from the entitlement middleware's JOIN-based subscription check
 * because workspace suspension is a platform-level flag independent of billing.
 */
async function fetchWorkspaceStatus(
  env: Env,
  tenantId: string,
): Promise<string | null> {
  try {
    const row = await env.DB
      .prepare(`SELECT status FROM workspaces WHERE tenant_id = ? LIMIT 1`)
      .bind(tenantId)
      .first<{ status: string }>();
    return row?.status ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Phase 3 — analytics event (fire-and-forget)
// ---------------------------------------------------------------------------

/**
 * Writes a WakaPageViewed event directly to the event_log D1 table.
 * Uses a unique aggregate_id per view event to satisfy the
 * UNIQUE INDEX (aggregate, aggregate_id, version) without a read-then-write race.
 *
 * This is a fire-and-forget call — errors are logged and swallowed
 * so analytics failures never break the public page render.
 */
async function fireWakaPageViewEvent(
  env: Env,
  opts: {
    pageId: string;
    workspaceId: string;
    tenantId: string;
    referrer: string | undefined;
    countryCode: string | undefined;
  },
): Promise<void> {
  try {
    const evtId = `evl_${crypto.randomUUID().replace(/-/g, '')}`;
    const payload = JSON.stringify({
      pageId: opts.pageId,
      workspaceId: opts.workspaceId,
      referrer: opts.referrer ?? null,
      countryCode: opts.countryCode ?? null,
    });
    await env.DB
      .prepare(
        `INSERT INTO event_log (id, aggregate, aggregate_id, event_type, tenant_id, payload, version, created_at)
         VALUES (?, 'wakapage_view', ?, 'wakapage.page.viewed', ?, ?, 1, unixepoch())`,
      )
      .bind(evtId, evtId, opts.tenantId, payload)
      .run();
  } catch (err) {
    console.warn('[wakapage] WakaPageViewed event not persisted (non-fatal):', err instanceof Error ? err.message : String(err));
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

  // Phase 3: Suspended workspace → 503 before any page content is served.
  // This check is intentionally separate from the entitlement middleware's
  // subscription check because workspaces.status is a platform-level flag.
  const wsStatus = await fetchWorkspaceStatus(c.env, tenantId);
  if (wsStatus === 'suspended') {
    return c.html(render503Page(theme.displayName, cssVars), 503);
  }

  // Load published WakaPage
  const page = await fetchPublishedPage(c.env, tenantId);
  if (!page) return c.html(render404Page(theme.displayName, cssVars), 404);

  // Load all page data in parallel — Nigeria First: single Worker invocation.
  // Phase 3: social posts, community spaces, community events added.
  const [
    blocks,
    profile,
    offerings,
    blogPosts,
    socialLinksJson,
    socialPosts,
    communitySpaces,
    communityEvents,
  ] = await Promise.all([
    fetchBlocks(c.env, page.id, tenantId),
    fetchProfile(c.env, page.profile_id, tenantId),
    fetchOfferings(c.env, tenantId),
    fetchBlogPosts(c.env, tenantId),
    fetchSocialLinksJson(c.env, tenantId),
    fetchSocialPosts(c.env, tenantId),
    fetchCommunitySpaces(c.env, tenantId),
    fetchCommunityEvents(c.env, tenantId),
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
    socialPosts,
    communitySpaces,
    communityEvents,
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

  // Phase 3: Fire WakaPageViewed analytics event — fire-and-forget.
  // Must be called AFTER building the HTML response so that analytics
  // failures never delay or break page delivery.
  void fireWakaPageViewEvent(c.env, {
    pageId: page.id,
    workspaceId: page.workspace_id,
    tenantId,
    referrer: c.req.header('referer') ?? undefined,
    countryCode: (c.req.raw as Request & { cf?: { country?: string } }).cf?.country ?? undefined,
  });

  // Phase 3 (ADR D8): s-maxage upgraded from 60→300, stale-while-revalidate 300→600.
  return c.html(html, 200, {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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

// ---------------------------------------------------------------------------
// Phase 3 — 503 page for suspended workspace
// ---------------------------------------------------------------------------

function render503Page(displayName: string, cssVars: string): string {
  const dn = displayName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html lang="en-NG">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Service Unavailable — ${dn}</title>
  <style>${cssVars}
body{font-family:var(--ww-font,system-ui,sans-serif);background:var(--ww-bg,#f9fafb);color:var(--ww-text,#111827);display:flex;align-items:center;justify-content:center;min-height:100dvh;margin:0}
.card{max-width:400px;text-align:center;padding:2rem 1.5rem}
h1{font-size:1.25rem;margin-bottom:.5rem}
p{color:var(--ww-text-muted,#6b7280);font-size:.9375rem;margin-top:.5rem}
  </style>
</head>
<body>
  <div class="card">
    <h1>Temporarily Unavailable</h1>
    <p>${dn}'s page is temporarily unavailable.</p>
    <p>Please check back later.</p>
  </div>
</body>
</html>`;
}

export { router as wakaPageRouter };
