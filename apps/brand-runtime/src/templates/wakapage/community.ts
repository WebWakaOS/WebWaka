/**
 * WakaPage — community block renderer.
 * (Phase 3 — ADR-0041: live community_spaces data)
 *
 * Data source: ctx.communitySpaces (pre-fetched public spaces for this tenant).
 * Shows the tenant's public community spaces with member counts and join CTAs.
 * Falls back to an informational card when no spaces exist.
 *
 * Platform Invariants:
 *   T3 — data already scoped to tenantId by renderer route fetcher
 */

import type { CommunityBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext, CommunitySpaceDbRow } from '../../lib/wakapage-types.js';

export function renderCommunityBlock(config: Partial<CommunityBlockConfig>, ctx: RenderContext): string {
  const joinCta = config.joinCta ?? 'Join Our Community';
  const spaces = ctx.communitySpaces ?? [];

  if (spaces.length === 0) {
    return `
<section class="wkp-community wkp-section" aria-label="Community">
  <h2 class="wkp-block-heading">Community</h2>
  <div class="wkp-comm-empty">
    <p class="wkp-comm-empty-title">${esc(joinCta)}</p>
    <p class="wkp-comm-empty-sub">Our community is coming soon — check back shortly.</p>
  </div>
</section>
${communityStyles()}`;
  }

  const spaceCards = spaces.map(s => renderSpaceCard(s, joinCta)).join('');

  return `
<section class="wkp-community wkp-section" aria-label="Community">
  <h2 class="wkp-block-heading">Community</h2>
  <ul class="wkp-comm-list" role="list">
    ${spaceCards}
  </ul>
</section>
${communityStyles()}`;
}

function renderSpaceCard(space: CommunitySpaceDbRow, joinCta: string): string {
  const memberLabel = space.member_count === 1 ? '1 member' : `${space.member_count.toLocaleString('en-NG')} members`;

  return `
<li class="wkp-comm-card">
  <div class="wkp-comm-avatar" aria-hidden="true">${esc(space.name.charAt(0).toUpperCase())}</div>
  <div class="wkp-comm-body">
    <p class="wkp-comm-name">${esc(space.name)}</p>
    ${space.description ? `<p class="wkp-comm-desc">${esc(space.description)}</p>` : ''}
    <p class="wkp-comm-members">${esc(memberLabel)}</p>
  </div>
  <a href="#community-${esc(space.slug)}" class="wkp-comm-join" aria-label="Join ${esc(space.name)}">${esc(joinCta)}</a>
</li>`;
}

function communityStyles(): string {
  return `<style>
.wkp-community{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-comm-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.75rem}
.wkp-comm-card{display:flex;gap:.875rem;padding:.875rem;border:1px solid var(--ww-border,#e5e7eb);border-radius:var(--ww-radius,8px);background:var(--ww-bg-surface,#f9fafb);align-items:center}
.wkp-comm-avatar{flex-shrink:0;width:44px;height:44px;border-radius:50%;background:var(--ww-primary,#1a6b3a);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.125rem;font-weight:700}
.wkp-comm-body{flex:1;min-width:0}
.wkp-comm-name{font-size:.9375rem;font-weight:600;color:var(--ww-text,#111827);margin:0 0 .125rem}
.wkp-comm-desc{font-size:.8125rem;color:var(--ww-text-muted,#6b7280);margin:0 0 .25rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wkp-comm-members{font-size:.75rem;color:var(--ww-text-muted,#6b7280);margin:0}
.wkp-comm-join{flex-shrink:0;padding:.5rem .875rem;background:var(--ww-primary,#1a6b3a);color:#fff;border-radius:var(--ww-radius,8px);text-decoration:none;font-size:.8125rem;font-weight:600;white-space:nowrap;min-height:36px;display:flex;align-items:center}
.wkp-comm-empty{padding:1.5rem;text-align:center;border:1px dashed var(--ww-border,#e5e7eb);border-radius:var(--ww-radius,8px);background:var(--ww-bg-surface,#f9fafb)}
.wkp-comm-empty-title{color:var(--ww-text,#111827);font-size:.9375rem;font-weight:600;margin:0 0 .25rem}
.wkp-comm-empty-sub{color:var(--ww-text-muted,#6b7280);font-size:.8125rem;margin:0}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
