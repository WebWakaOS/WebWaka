/**
 * WakaPage — blog_post block renderer.
 * (Phase 2 — ADR-0041)
 *
 * Renders the tenant's latest published blog posts (static listing).
 * Data comes from RenderContext.blogPosts (pre-fetched by the route handler).
 */

import type { BlogPostBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

function formatDate(unixSeconds: number): string {
  try {
    return new Date(unixSeconds * 1000).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function renderBlogPostBlock(config: Partial<BlogPostBlockConfig>, ctx: RenderContext): string {
  const heading = config.heading ?? 'Latest Posts';
  const maxPosts = config.maxPosts ?? 3;
  const showExcerpt = config.showExcerpt !== false;
  const showCoverImage = config.showCoverImage !== false;

  const posts = ctx.blogPosts.slice(0, maxPosts);
  if (posts.length === 0) return '';

  const cards = posts.map((post) => `
  <article class="wkp-post-card">
    ${showCoverImage && post.cover_image_url ? `
    <a href="/blog/${esc(post.slug)}" class="wkp-post-cover-link" tabindex="-1" aria-hidden="true">
      <img class="wkp-post-cover" src="${encodeURI(post.cover_image_url)}"
           alt="${esc(post.title)} cover" loading="lazy" width="400" height="200" />
    </a>` : ''}
    <div class="wkp-post-body">
      <h3 class="wkp-post-title">
        <a href="/blog/${esc(post.slug)}">${esc(post.title)}</a>
      </h3>
      <div class="wkp-post-meta">
        ${post.author_name ? `<span>${esc(post.author_name)}</span> · ` : ''}
        <time datetime="${new Date(post.published_at * 1000).toISOString().slice(0, 10)}">
          ${formatDate(post.published_at)}
        </time>
      </div>
      ${showExcerpt && post.excerpt ? `<p class="wkp-post-excerpt">${esc(post.excerpt)}</p>` : ''}
    </div>
  </article>`).join('\n');

  return `
<section class="wkp-blog-posts wkp-section" aria-label="${esc(heading)}">
  <h2 class="wkp-block-heading">${esc(heading)}</h2>
  <div class="wkp-posts-list">
    ${cards}
  </div>
  <a href="/blog" class="wkp-posts-viewall">View all posts →</a>
</section>
<style>
.wkp-blog-posts{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-posts-list{display:flex;flex-direction:column;gap:1rem}
.wkp-post-card{
  border:1px solid var(--ww-border,#e5e7eb);
  border-radius:var(--ww-radius,8px);overflow:hidden;
  background:var(--ww-bg-surface,#fff);
}
.wkp-post-cover{width:100%;height:160px;object-fit:cover;display:block}
.wkp-post-body{padding:.875rem}
.wkp-post-title{font-size:1rem;font-weight:700;line-height:1.35;margin-bottom:.375rem}
.wkp-post-title a{color:var(--ww-text,#111827)}
.wkp-post-title a:hover{color:var(--ww-primary);text-decoration:none}
.wkp-post-meta{font-size:.8125rem;color:var(--ww-text-muted,#6b7280);margin-bottom:.5rem}
.wkp-post-excerpt{font-size:.875rem;color:var(--ww-text-muted,#6b7280);line-height:1.5}
.wkp-posts-viewall{
  display:inline-block;margin-top:1rem;
  font-size:.875rem;font-weight:600;color:var(--ww-primary);
}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
