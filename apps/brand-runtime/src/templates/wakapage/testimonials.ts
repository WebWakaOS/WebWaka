/**
 * WakaPage — testimonials block renderer.
 * (Phase 2 — ADR-0041)
 */

import type { TestimonialsBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

const STARS = ['', '★', '★★', '★★★', '★★★★', '★★★★★'];

export function renderTestimonialsBlock(config: Partial<TestimonialsBlockConfig>, _ctx: RenderContext): string {
  const heading = config.heading ?? 'What Our Customers Say';
  const items = config.items ?? [];
  if (items.length === 0) return '';

  const cards = items.map((item) => `
  <article class="wkp-testi-card">
    ${item.rating ? `<p class="wkp-testi-stars" aria-label="${item.rating} out of 5 stars">${STARS[item.rating]}</p>` : ''}
    <blockquote class="wkp-testi-text">"${esc(item.text)}"</blockquote>
    <footer class="wkp-testi-author">
      ${item.avatarUrl ? `<img class="wkp-testi-avatar" src="${encodeURI(item.avatarUrl)}" alt="${esc(item.name)}" width="32" height="32" loading="lazy" />` : ''}
      <span>${esc(item.name)}</span>
    </footer>
  </article>`).join('\n');

  return `
<section class="wkp-testimonials wkp-section" aria-label="${esc(heading)}">
  <h2 class="wkp-block-heading">${esc(heading)}</h2>
  <div class="wkp-testi-grid">
    ${cards}
  </div>
</section>
<style>
.wkp-testimonials{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-testi-grid{display:grid;gap:.875rem}
.wkp-testi-card{
  padding:1rem;background:var(--ww-bg-surface,#f9fafb);
  border:1px solid var(--ww-border,#e5e7eb);
  border-radius:var(--ww-radius,8px);
}
.wkp-testi-stars{color:#f59e0b;font-size:1rem;margin-bottom:.5rem}
.wkp-testi-text{font-size:.9375rem;color:var(--ww-text,#111827);line-height:1.6;font-style:normal;margin-bottom:.75rem}
.wkp-testi-author{display:flex;align-items:center;gap:.5rem;font-size:.875rem;font-weight:600;color:var(--ww-text-muted,#6b7280)}
.wkp-testi-avatar{width:32px;height:32px;border-radius:50%;object-fit:cover}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
