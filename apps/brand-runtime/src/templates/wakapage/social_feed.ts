/**
 * WakaPage — social_feed block renderer.
 * (Phase 3 — ADR-0041: live social_posts data)
 *
 * Data source: ctx.socialPosts (pre-fetched recent published posts for this tenant).
 * Shows up to 5 recent social posts with like/comment counts.
 * Falls back to an informational card when no posts exist.
 *
 * Platform Invariants:
 *   T3 — data already scoped to tenantId by renderer route fetcher
 *   NDPR — content column is user-generated text; no PII exposure beyond what user posted
 */

import type { SocialFeedBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext, SocialPostDbRow } from '../../lib/wakapage-types.js';

export function renderSocialFeedBlock(_config: Partial<SocialFeedBlockConfig>, ctx: RenderContext): string {
  const posts = ctx.socialPosts ?? [];

  if (posts.length === 0) {
    return `
<section class="wkp-social-feed wkp-section" aria-label="Social feed">
  <h2 class="wkp-block-heading">Social Feed</h2>
  <div class="wkp-sf-empty">
    <p class="wkp-sf-empty-text">No posts yet — check back soon.</p>
  </div>
</section>
${socialFeedStyles()}`;
  }

  const postCards = posts.map(p => renderPostCard(p)).join('');

  return `
<section class="wkp-social-feed wkp-section" aria-label="Social feed">
  <h2 class="wkp-block-heading">Social Feed</h2>
  <ul class="wkp-sf-list" role="list">
    ${postCards}
  </ul>
</section>
${socialFeedStyles()}`;
}

function renderPostCard(post: SocialPostDbRow): string {
  const date = formatPostDate(post.created_at);
  const snippet = truncate(post.content, 200);
  const likes = post.like_count > 0
    ? `<span class="wkp-sf-stat" aria-label="${post.like_count} like${post.like_count !== 1 ? 's' : ''}">&#10084; ${post.like_count}</span>`
    : '';
  const comments = post.comment_count > 0
    ? `<span class="wkp-sf-stat" aria-label="${post.comment_count} comment${post.comment_count !== 1 ? 's' : ''}">&#128172; ${post.comment_count}</span>`
    : '';
  const statsHtml = (likes || comments) ? `<div class="wkp-sf-stats">${likes}${comments}</div>` : '';

  return `
<li class="wkp-sf-card">
  <p class="wkp-sf-content">${esc(snippet)}</p>
  <div class="wkp-sf-footer">
    <span class="wkp-sf-date">${esc(date)}</span>
    ${statsHtml}
  </div>
</li>`;
}

function formatPostDate(unixTs: number): string {
  try {
    return new Date(unixTs * 1000).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(unixTs);
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

function socialFeedStyles(): string {
  return `<style>
.wkp-social-feed{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-sf-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.75rem}
.wkp-sf-card{padding:.875rem;border:1px solid var(--ww-border,#e5e7eb);border-radius:var(--ww-radius,8px);background:var(--ww-bg-surface,#f9fafb)}
.wkp-sf-content{font-size:.9375rem;color:var(--ww-text,#111827);margin:0 0 .625rem;line-height:1.5;word-break:break-word}
.wkp-sf-footer{display:flex;justify-content:space-between;align-items:center;gap:.5rem}
.wkp-sf-date{font-size:.75rem;color:var(--ww-text-muted,#6b7280)}
.wkp-sf-stats{display:flex;gap:.625rem}
.wkp-sf-stat{font-size:.75rem;color:var(--ww-text-muted,#6b7280)}
.wkp-sf-empty{padding:1.5rem;text-align:center;border:1px dashed var(--ww-border,#e5e7eb);border-radius:var(--ww-radius,8px);background:var(--ww-bg-surface,#f9fafb)}
.wkp-sf-empty-text{color:var(--ww-text-muted,#6b7280);font-size:.9rem;margin:0}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
