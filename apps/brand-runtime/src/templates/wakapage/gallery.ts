/**
 * WakaPage — gallery block renderer.
 * (Phase 2 — ADR-0041)
 *
 * Responsive image grid. Mobile-first: 2-column on 360px, up to 4 on desktop.
 * Images lazy-loaded (Nigeria First — bandwidth-sensitive).
 * No arbitrary remote URLs are proxied — images rendered via direct img src.
 *
 * Security: URLs are encoded (encodeURI) not used as hrefs to prevent SSRF.
 * Images are display-only; no user-controlled JS injection.
 */

import type { GalleryBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderGalleryBlock(config: Partial<GalleryBlockConfig>, _ctx: RenderContext): string {
  const heading = config.heading ?? null;
  const images = config.images ?? [];
  const columns = config.columns ?? 2;

  if (images.length === 0) return '';

  const imgCards = images.map((img, idx) => `
  <figure class="wkp-gallery-item">
    <img class="wkp-gallery-img" src="${encodeURI(img.url)}"
         alt="${esc(img.alt ?? img.caption ?? `Image ${idx + 1}`)}"
         loading="lazy" width="400" height="300" />
    ${img.caption ? `<figcaption class="wkp-gallery-caption">${esc(img.caption)}</figcaption>` : ''}
  </figure>`).join('\n');

  return `
<section class="wkp-gallery wkp-section" aria-label="${heading ? esc(heading) : 'Gallery'}">
  ${heading ? `<h2 class="wkp-block-heading">${esc(heading)}</h2>` : ''}
  <div class="wkp-gallery-grid wkp-gallery-cols-${columns}">
    ${imgCards}
  </div>
</section>
<style>
.wkp-gallery{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-gallery-grid{display:grid;gap:.5rem;grid-template-columns:repeat(2,1fr)}
.wkp-gallery-cols-3{grid-template-columns:repeat(2,1fr)}
.wkp-gallery-cols-4{grid-template-columns:repeat(2,1fr)}
@media(min-width:480px){
  .wkp-gallery-cols-3{grid-template-columns:repeat(3,1fr)}
  .wkp-gallery-cols-4{grid-template-columns:repeat(4,1fr)}
}
.wkp-gallery-item{margin:0;position:relative;overflow:hidden;border-radius:var(--ww-radius,6px)}
.wkp-gallery-img{
  width:100%;height:180px;object-fit:cover;display:block;
  transition:transform .2s;
}
.wkp-gallery-item:hover .wkp-gallery-img{transform:scale(1.04)}
.wkp-gallery-caption{
  font-size:.75rem;color:var(--ww-text-muted,#6b7280);
  padding:.375rem .25rem;text-align:center;
}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
