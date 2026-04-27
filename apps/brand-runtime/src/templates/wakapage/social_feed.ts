/**
 * WakaPage — social_feed block renderer.
 * (Phase 2 stub — ADR-0041)
 *
 * Live social feed binding is Phase 3 (requires @webwaka/social integration).
 * Phase 2 renders an informational stub.
 */

import type { SocialFeedBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderSocialFeedBlock(_config: Partial<SocialFeedBlockConfig>, _ctx: RenderContext): string {
  return `
<section class="wkp-social-feed wkp-section" aria-label="Social feed">
  <h2 class="wkp-block-heading">Social Feed</h2>
  <div class="wkp-stub-card">
    <span class="wkp-stub-icon" aria-hidden="true">📲</span>
    <p class="wkp-stub-text">Social feed coming soon</p>
  </div>
</section>
<style>
.wkp-social-feed{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-stub-card{
  padding:1.5rem;text-align:center;
  border:1px dashed var(--ww-border,#e5e7eb);
  border-radius:var(--ww-radius,8px);
  background:var(--ww-bg-surface,#f9fafb);
}
.wkp-stub-icon{font-size:2rem;display:block;margin-bottom:.5rem}
.wkp-stub-text{color:var(--ww-text-muted,#6b7280);font-size:.9rem}
</style>`;
}
