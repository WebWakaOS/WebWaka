/**
 * WakaPage — faq block renderer.
 * (Phase 2 — ADR-0041)
 *
 * FAQ accordion using native <details>/<summary> — zero JS required.
 * Accessible and offline-capable.
 */

import type { FaqBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderFaqBlock(config: Partial<FaqBlockConfig>, _ctx: RenderContext): string {
  const heading = config.heading ?? 'Frequently Asked Questions';
  const items = config.items ?? [];
  if (items.length === 0) return '';

  const items_html = items.map((item) => `
  <details class="wkp-faq-item">
    <summary class="wkp-faq-q">${esc(item.question)}</summary>
    <div class="wkp-faq-a">${esc(item.answer)}</div>
  </details>`).join('\n');

  return `
<section class="wkp-faq wkp-section" aria-label="${esc(heading)}">
  <h2 class="wkp-block-heading">${esc(heading)}</h2>
  <div class="wkp-faq-list">
    ${items_html}
  </div>
</section>
<style>
.wkp-faq{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-faq-list{display:flex;flex-direction:column;gap:.5rem}
.wkp-faq-item{
  border:1px solid var(--ww-border,#e5e7eb);
  border-radius:var(--ww-radius,6px);overflow:hidden;
}
.wkp-faq-q{
  list-style:none;padding:.875rem 1rem;font-size:.9375rem;font-weight:600;
  cursor:pointer;color:var(--ww-text,#111827);min-height:44px;
  display:flex;align-items:center;justify-content:space-between;
  background:var(--ww-bg-surface,#f9fafb);
}
.wkp-faq-q::-webkit-details-marker{display:none}
.wkp-faq-q::after{content:'＋';color:var(--ww-primary);font-size:1.1rem;flex-shrink:0;margin-left:.5rem}
details[open] .wkp-faq-q::after{content:'－'}
.wkp-faq-a{
  padding:.875rem 1rem;font-size:.875rem;color:var(--ww-text-muted,#6b7280);
  line-height:1.6;border-top:1px solid var(--ww-border,#e5e7eb);
}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
