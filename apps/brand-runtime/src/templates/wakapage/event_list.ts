/**
 * WakaPage — event_list block renderer.
 * (Phase 2 stub — ADR-0041)
 *
 * Live event listing requires @webwaka/community events (Phase 3).
 */

import type { EventListBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderEventListBlock(config: Partial<EventListBlockConfig>, _ctx: RenderContext): string {
  const heading = config.heading ?? 'Upcoming Events';

  return `
<section class="wkp-event-list wkp-section" aria-label="${esc(heading)}">
  <h2 class="wkp-block-heading">${esc(heading)}</h2>
  <div class="wkp-stub-card">
    <span class="wkp-stub-icon" aria-hidden="true">📅</span>
    <p class="wkp-stub-text">Event listings coming soon</p>
  </div>
</section>
<style>
.wkp-event-list{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-stub-card{padding:1.5rem;text-align:center;border:1px dashed var(--ww-border,#e5e7eb);border-radius:var(--ww-radius,8px);background:var(--ww-bg-surface,#f9fafb)}
.wkp-stub-icon{font-size:2rem;display:block;margin-bottom:.5rem}
.wkp-stub-text{color:var(--ww-text-muted,#6b7280);font-size:.9rem}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
