/**
 * WakaPage — hero block renderer.
 * (Phase 2 — ADR-0041)
 *
 * Profile hero: display_name, avatar, headline, cover image, CTA.
 * Falls back gracefully when optional fields are absent.
 * Mobile-first — stacks on 360px, side-by-side on 480px+.
 */

import type { HeroBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderHeroBlock(config: Partial<HeroBlockConfig>, ctx: RenderContext): string {
  const displayName = config.displayName ?? ctx.profile?.display_name ?? ctx.displayName;
  const tagline = config.tagline ?? ctx.profile?.headline ?? null;
  const avatarUrl = config.avatarUrl ?? ctx.profile?.avatar_url ?? null;
  const coverImageUrl = config.coverImageUrl ?? null;
  const ctaLabel = config.ctaLabel ?? null;
  const ctaUrl = config.ctaUrl ?? null;

  const hasCover = Boolean(coverImageUrl);

  return `
<section class="wkp-hero wkp-section" aria-label="Profile hero"
  ${hasCover ? `style="background-image:url('${encodeURI(coverImageUrl!)}');background-size:cover;background-position:center"` : ''}>
  ${hasCover ? '<div class="wkp-hero-overlay"></div>' : ''}
  <div class="wkp-hero-inner">
    ${avatarUrl ? `
    <div class="wkp-hero-avatar-wrap">
      <img class="wkp-hero-avatar" src="${encodeURI(avatarUrl)}"
           alt="${esc(displayName)} avatar" width="96" height="96" loading="eager" />
    </div>` : ''}
    <div class="wkp-hero-body">
      <h1 class="wkp-hero-name">${esc(displayName)}</h1>
      ${tagline ? `<p class="wkp-hero-tagline">${esc(tagline)}</p>` : ''}
      ${ctaLabel && ctaUrl ? `
      <a class="wkp-btn wkp-hero-cta" href="${escAttr(ctaUrl)}"
         ${ctaUrl.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>
        ${esc(ctaLabel)}
      </a>` : ''}
    </div>
  </div>
</section>
<style>
.wkp-hero{
  position:relative;text-align:center;padding-top:2rem;padding-bottom:2rem;
  background:var(--ww-bg-surface,#f3f4f6);
}
.wkp-hero-overlay{
  position:absolute;inset:0;
  background:rgba(0,0,0,.45);
}
.wkp-hero-inner{
  position:relative;z-index:1;
  display:flex;flex-direction:column;align-items:center;gap:1rem;
}
.wkp-hero-avatar-wrap{
  width:96px;height:96px;border-radius:50%;overflow:hidden;
  border:3px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,.18);
  flex-shrink:0;
}
.wkp-hero-avatar{width:100%;height:100%;object-fit:cover}
.wkp-hero-body{display:flex;flex-direction:column;align-items:center;gap:.5rem}
.wkp-hero-name{font-size:1.5rem;font-weight:700;line-height:1.2;color:inherit}
.wkp-hero-tagline{font-size:1rem;color:var(--ww-text-muted,#6b7280);max-width:32ch;line-height:1.5}
.wkp-hero-cta{margin-top:.5rem}

/* Cover image: invert text for contrast */
.wkp-hero[style*="background-image"] .wkp-hero-name,
.wkp-hero[style*="background-image"] .wkp-hero-tagline{color:#fff}

@media(min-width:480px){
  .wkp-hero-inner{flex-direction:row;text-align:left;gap:1.25rem}
  .wkp-hero-body{align-items:flex-start}
  .wkp-hero-cta{width:auto}
}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function escAttr(url: string): string {
  return encodeURI(url).replace(/"/g,'%22');
}
