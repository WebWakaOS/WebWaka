/**
 * Blog routes — Pillar 2 (P4-A HIGH-007)
 *
 * GET /blog            → blog post listing (published only, T3 scoped to tenant)
 * GET /blog/:slug      → single post detail
 *
 * No auth required — public pages.
 * T3: tenant isolation via tenantResolve middleware (c.get('tenantId')).
 */

import { Hono } from 'hono';
import type { Env, Variables } from '../env.js';
import { resolveCappedTheme } from '../lib/depth-cap.js';
import { baseTemplate } from '../templates/base.js';
import { blogListBody } from '../templates/blog-list.js';
import { blogPostBody } from '../templates/blog-post.js';
import type { BlogPost } from '../templates/blog-list.js';
import type { BlogPostDetail } from '../templates/blog-post.js';

export const blogRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------------------------------------------------------------------------
// GET /blog — list published posts for this tenant
// ---------------------------------------------------------------------------

blogRouter.get('/', async (c) => {
  const tenantId = c.get('tenantId');

  // P1 audit fix: blog now applies the white-label depth cap (was bypassed before).
  let cssVars = '';
  let logoUrl: string | null = null;
  let displayName = 'Blog';
  let faviconUrl: string | null = null;

  const themed = await resolveCappedTheme(c);
  if (themed) {
    cssVars = themed.cssVars;
    logoUrl = themed.theme.logoUrl ?? null;
    displayName = themed.theme.displayName ?? displayName;
    faviconUrl = themed.theme.faviconUrl ?? null;
  }

  let posts: BlogPost[] = [];
  if (tenantId) {
    try {
      const result = await c.env.DB
        .prepare(
          `SELECT id, slug, title, excerpt, published_at, author_name
           FROM blog_posts
           WHERE tenant_id = ? AND status = 'published'
           ORDER BY published_at DESC
           LIMIT 20`,
        )
        .bind(tenantId)
        .all<BlogPost>();
      posts = result.results ?? [];
    } catch { /* table may not exist — degrade gracefully */ }
  }

  const html = baseTemplate({
    title: 'Blog',
    cssVars,
    logoUrl,
    displayName,
    faviconUrl,
    body: blogListBody(posts, displayName),
    ogTitle: `Blog | ${displayName}`,
    ogDescription: `Latest posts and updates from ${displayName}`,
  });

  return c.html(html);
});

// ---------------------------------------------------------------------------
// GET /blog/:slug — single post detail
// ---------------------------------------------------------------------------

blogRouter.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const tenantId = c.get('tenantId');

  // P1 audit fix: depth-capped theme.
  let cssVars = '';
  let logoUrl: string | null = null;
  let displayName = '';
  let faviconUrl: string | null = null;

  const themed = await resolveCappedTheme(c);
  if (themed) {
    cssVars = themed.cssVars;
    logoUrl = themed.theme.logoUrl ?? null;
    displayName = themed.theme.displayName ?? '';
    faviconUrl = themed.theme.faviconUrl ?? null;
  }

  if (!tenantId) {
    return c.html(
      baseTemplate({ title: 'Post Not Found', cssVars, logoUrl, displayName, faviconUrl, body: '<p>Post not found.</p>' }),
      404,
    );
  }

  let post: BlogPostDetail | null = null;
  try {
    post = await c.env.DB
      .prepare(
        `SELECT id, slug, title, content, published_at, author_name, cover_image_url
         FROM blog_posts
         WHERE tenant_id = ? AND slug = ? AND status = 'published'
         LIMIT 1`,
      )
      .bind(tenantId, slug)
      .first<BlogPostDetail>();
  } catch { /* graceful degradation */ }

  if (!post) {
    return c.html(
      baseTemplate({
        title: 'Post Not Found',
        cssVars, logoUrl, displayName, faviconUrl,
        body: `<p style="color:var(--ww-text-muted);margin-top:2rem">Blog post not found. <a href="/blog">Back to Blog</a></p>`,
      }),
      404,
    );
  }

  const html = baseTemplate({
    title: post.title,
    cssVars,
    logoUrl,
    displayName,
    faviconUrl,
    body: blogPostBody(post),
    ogTitle: post.title,
    ogDescription: post.content.replace(/<[^>]+>/g, '').slice(0, 160),
    ogImage: post.cover_image_url ?? undefined,
  });

  return c.html(html);
});
