/**
 * WakaPage — community block renderer.
 * (Phase 2 stub — ADR-0041)
 *
 * Live community binding requires @webwaka/community (Phase 3).
 */

import type { CommunityBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderCommunityBlock(config: Partial<CommunityBlockConfig>, _ctx: RenderContext): string {
  const joinCta = config.joinCta ?? 'Join Our Community';

  return `
<section class="wkp-community wkp-section" aria-label="Community">
  <h2 class="wkp-block-heading">Community</h2>
  <div class="wkp-stub-card">
    <span class="wkp-stub-icon" aria-hidden="true">👥</span>
    <p class="wkp-stub-text">${esc(joinCta)}</p>
    <p class="wkp-stub-subtext">Community features coming soon</p>
  </div>
</section>
<style>
.wkp-community{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-stub-card{padding:1.5rem;text-align:center;border:1px dashed var(--ww-border,#e5e7eb);border-radius:var(--ww-radius,8px);background:var(--ww-bg-surface,#f9fafb)}
.wkp-stub-icon{font-size:2rem;display:block;margin-bottom:.5rem}
.wkp-stub-text{color:var(--ww-text,#111827);font-size:.9375rem;font-weight:600;margin-bottom:.25rem}
.wkp-stub-subtext{color:var(--ww-text-muted,#6b7280);font-size:.8125rem}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
