/**
 * WakaPage — offerings block renderer.
 * (Phase 2 — ADR-0041)
 *
 * Renders the tenant's published offerings (static listing — no live cart).
 * Data comes from RenderContext.offerings (pre-fetched by the route handler).
 * Phase 3 will bind live booking/checkout flows.
 *
 * P9: prices stored as integer kobo; displayed as ₦X,XXX.XX NGN at template layer.
 */

import type { OfferingsBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

function koboToNgn(kobo: number): string {
  return (kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function renderOfferingsBlock(config: Partial<OfferingsBlockConfig>, ctx: RenderContext): string {
  const heading = config.heading ?? 'Our Services';
  const maxItems = config.maxItems ?? 6;
  const showPrices = config.showPrices !== false;

  const items = ctx.offerings.slice(0, maxItems);
  if (items.length === 0) return '';

  const cards = items.map((o) => `
  <article class="wkp-offering-card">
    <h3 class="wkp-offering-name">${esc(o.name)}</h3>
    ${o.description ? `<p class="wkp-offering-desc">${esc(o.description)}</p>` : ''}
    ${showPrices && o.price_kobo != null
      ? `<p class="wkp-offering-price">₦${koboToNgn(o.price_kobo)}</p>`
      : ''}
  </article>`).join('\n');

  return `
<section class="wkp-offerings wkp-section" aria-label="${esc(heading)}">
  <h2 class="wkp-block-heading">${esc(heading)}</h2>
  <div class="wkp-offerings-grid">
    ${cards}
  </div>
</section>
<style>
.wkp-offerings{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-offerings-grid{display:grid;gap:.875rem;grid-template-columns:1fr}
@media(min-width:400px){.wkp-offerings-grid{grid-template-columns:repeat(2,1fr)}}
.wkp-offering-card{
  padding:1rem;background:var(--ww-bg-surface,#f9fafb);
  border:1px solid var(--ww-border,#e5e7eb);
  border-radius:var(--ww-radius,8px);
}
.wkp-offering-name{font-size:.9375rem;font-weight:700;color:var(--ww-text,#111827);margin-bottom:.25rem}
.wkp-offering-desc{font-size:.875rem;color:var(--ww-text-muted,#6b7280);line-height:1.5;margin-bottom:.5rem}
.wkp-offering-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary)}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
