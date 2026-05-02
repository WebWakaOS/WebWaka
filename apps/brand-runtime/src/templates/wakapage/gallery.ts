/**
 * WakaPage — gallery block renderer.
 * (Phase 2 — ADR-0041, C3-4 lightbox added Wave 2 Batch 12)
 *
 * Responsive image grid. Mobile-first: 2-column on 360px, up to 4 on desktop.
 * Images lazy-loaded (Nigeria First — bandwidth-sensitive).
 * C3-4: Tap-to-open native CSS lightbox (no JS lib, zero deps).
 *
 * Security: URLs are encoded (encodeURI) not used as hrefs to prevent SSRF.
 * Images are display-only; no user-controlled JS injection.
 */

import type { GalleryBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderGalleryBlock(config: Partial<GalleryBlockConfig>, ctx: RenderContext): string {
  const heading  = config.heading ?? null;
  const images   = config.images ?? [];
  const columns  = config.columns ?? 2;
  const pageId   = ctx.page.id;

  if (images.length === 0) return '';

  // C3-4: Each image opens a CSS-only lightbox using :target pseudo-class
  const lightboxItems = images.map((img, idx) => {
    const id       = `wkp-lb-${pageId}-${idx}`;
    const prevId   = idx > 0            ? `wkp-lb-${pageId}-${idx - 1}` : null;
    const nextId   = idx < images.length - 1 ? `wkp-lb-${pageId}-${idx + 1}` : null;
    const src      = encodeURI(img.url);
    const altAttr  = esc(img.alt ?? img.caption ?? `Image ${idx + 1}`);
    const caption  = img.caption ? `<p class="wkp-lb-caption">${esc(img.caption)}</p>` : '';

    const prev = prevId ? `<a href="#${prevId}" class="wkp-lb-nav wkp-lb-prev" aria-label="Previous image">&#8249;</a>` : '';
    const next = nextId ? `<a href="#${nextId}" class="wkp-lb-nav wkp-lb-next" aria-label="Next image">&#8250;</a>` : '';

    return `
  <!-- Lightbox overlay for image ${idx} -->
  <div id="${id}" class="wkp-lb-overlay" role="dialog" aria-modal="true" aria-label="${altAttr}">
    <a href="#" class="wkp-lb-backdrop" aria-label="Close lightbox"></a>
    <div class="wkp-lb-inner">
      ${prev}
      <figure class="wkp-lb-figure">
        <img src="${src}" alt="${altAttr}" class="wkp-lb-img" />
        ${caption}
      </figure>
      ${next}
      <a href="#" class="wkp-lb-close" aria-label="Close">&#10005;</a>
    </div>
  </div>`;
  }).join('\n');

  const imgCards = images.map((img, idx) => {
    const id     = `wkp-lb-${pageId}-${idx}`;
    const src    = encodeURI(img.url);
    const altAttr = esc(img.alt ?? img.caption ?? `Image ${idx + 1}`);
    return `
  <figure class="wkp-gallery-item">
    <a href="#${id}" aria-label="View ${altAttr} in lightbox">
      <img class="wkp-gallery-img" src="${src}" alt="${altAttr}"
           loading="lazy" width="400" height="300" />
    </a>
    ${img.caption ? `<figcaption class="wkp-gallery-caption">${esc(img.caption)}</figcaption>` : ''}
  </figure>`;
  }).join('\n');

  return `
<section class="wkp-gallery wkp-section" aria-label="${heading ? esc(heading) : 'Gallery'}">
  ${heading ? `<h2 class="wkp-block-heading">${esc(heading)}</h2>` : ''}
  <div class="wkp-gallery-grid wkp-gallery-cols-${columns}">
    ${imgCards}
  </div>
</section>

${lightboxItems}

<style>
/* ── Gallery grid ─────────────────────────────────────────────────── */
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
.wkp-gallery-item a{display:block;cursor:zoom-in}
.wkp-gallery-img{
  width:100%;height:180px;object-fit:cover;display:block;
  transition:transform .2s;
}
.wkp-gallery-item:hover .wkp-gallery-img{transform:scale(1.04)}
.wkp-gallery-caption{
  font-size:.75rem;color:var(--ww-text-muted,#6b7280);
  padding:.375rem .25rem;text-align:center;
}

/* ── Lightbox (CSS-only, :target based) ──────────────────────────── */
.wkp-lb-overlay{
  display:none;position:fixed;inset:0;z-index:9999;
  align-items:center;justify-content:center;
  /* shown when targeted */
}
.wkp-lb-overlay:target{display:flex}
.wkp-lb-backdrop{
  position:absolute;inset:0;background:rgba(0,0,0,.85);
  -webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);
  cursor:zoom-out;
}
.wkp-lb-inner{
  position:relative;z-index:1;display:flex;align-items:center;gap:.5rem;
  max-width:95vw;max-height:90dvh;
}
.wkp-lb-figure{margin:0;text-align:center}
.wkp-lb-img{
  max-width:88vw;max-height:82dvh;
  object-fit:contain;border-radius:8px;
  box-shadow:0 8px 40px rgba(0,0,0,.6);
  display:block;
}
.wkp-lb-caption{
  color:#e5e7eb;font-size:.875rem;margin:.5rem 0 0;text-align:center;
}
.wkp-lb-nav{
  color:#fff;font-size:2.5rem;line-height:1;
  text-decoration:none;padding:.5rem .25rem;
  flex-shrink:0;opacity:.8;
  transition:opacity .15s;
}
.wkp-lb-nav:hover{opacity:1}
.wkp-lb-close{
  position:absolute;top:-12px;right:-12px;
  background:rgba(0,0,0,.6);color:#fff;
  width:32px;height:32px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  text-decoration:none;font-size:14px;font-weight:700;
  transition:background .15s;
}
.wkp-lb-close:hover{background:rgba(0,0,0,.9)}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
