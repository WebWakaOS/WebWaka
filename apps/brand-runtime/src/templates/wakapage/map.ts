/**
 * WakaPage — map block renderer.
 * (Phase 2 — ADR-0041)
 *
 * Nigeria First: renders a Google Maps embed via CSP-compliant iframe.
 * Fallback: "Get Directions" link using lat/lng or placeId.
 *
 * Security:
 *   - No user-controlled JS in the iframe src
 *   - Coordinates are validated as numbers before embedding
 *   - placeId is URL-encoded (not user-controlled in src context)
 *
 * CSP: maps.googleapis.com must be in frame-src of Content-Security-Policy.
 * Brand-runtime inherits the project-level CSP; no new domains introduced here
 * beyond what Google Maps requires.
 */

import type { MapBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderMapBlock(config: Partial<MapBlockConfig>, _ctx: RenderContext): string {
  const zoom = Math.min(20, Math.max(1, config.zoom ?? 15));
  const showDirections = config.showDirectionsLink !== false;

  let embedSrc: string | null = null;
  let directionsHref: string | null = null;

  if (config.lat != null && config.lng != null) {
    const lat = Number(config.lat);
    const lng = Number(config.lng);
    if (isFinite(lat) && isFinite(lng)) {
      embedSrc = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=600x300&markers=${lat},${lng}`;
      directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
  }

  if (config.placeId) {
    const safeId = encodeURIComponent(config.placeId);
    directionsHref = `https://www.google.com/maps/place/?q=place_id:${safeId}`;
  }

  if (!embedSrc && !directionsHref) {
    return '';
  }

  const mapVisual = embedSrc
    ? `<div class="wkp-map-placeholder" aria-label="Map location">
        <img class="wkp-map-img" src="${encodeURI(embedSrc)}"
             alt="Map showing location" loading="lazy" width="600" height="300" />
       </div>`
    : `<div class="wkp-map-placeholder wkp-map-text" role="img" aria-label="Location map">
        <span class="wkp-map-pin" aria-hidden="true">📍</span>
        <span>Location map</span>
       </div>`;

  return `
<section class="wkp-map wkp-section" aria-label="Location">
  <h2 class="wkp-block-heading">Find Us</h2>
  ${mapVisual}
  ${showDirections && directionsHref ? `
  <a class="wkp-btn wkp-btn-outline wkp-map-directions"
     href="${encodeURI(directionsHref)}"
     target="_blank" rel="noopener noreferrer"
     aria-label="Get directions to our location">
    📍 Get Directions
  </a>` : ''}
</section>
<style>
.wkp-map{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-map-placeholder{
  width:100%;border-radius:var(--ww-radius,8px);overflow:hidden;
  background:var(--ww-bg-surface,#f3f4f6);
  min-height:180px;margin-bottom:1rem;
}
.wkp-map-img{width:100%;height:auto;display:block;max-height:300px;object-fit:cover}
.wkp-map-text{
  display:flex;align-items:center;justify-content:center;gap:.5rem;
  color:var(--ww-text-muted,#6b7280);font-size:1rem;height:180px;
}
.wkp-map-pin{font-size:1.5rem}
.wkp-map-directions{margin-top:.25rem}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
