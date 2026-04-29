/**
 * WakaPage — trust_badges block renderer.
 * (Phase 2 — ADR-0041)
 *
 * Displays verification, claim, and custom trust badges.
 * Uses profile.verification_state and profile.claim_status from RenderContext.
 * Sector licence badge requires sector_license_verifications data (Phase 3 live binding).
 */

import type { TrustBadgesBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderTrustBadgesBlock(config: Partial<TrustBadgesBlockConfig>, ctx: RenderContext): string {
  const badges: Array<{ icon: string; label: string; description: string }> = [];

  const showVerification = config.showVerificationBadge !== false;
  const showClaim = config.showClaimBadge !== false;

  if (showVerification && ctx.profile?.verification_state === 'verified') {
    badges.push({ icon: '✅', label: 'Verified Business', description: 'This business has been verified by WebWaka' });
  }

  if (showClaim && (ctx.profile?.claim_status === 'verified' || ctx.profile?.claim_status === 'approved')) {
    badges.push({ icon: '🏆', label: 'Claimed Profile', description: 'This profile has been claimed and managed by the owner' });
  }

  const customBadges = config.customBadges ?? [];
  for (const badge of customBadges) {
    badges.push({ icon: badge.iconUrl ? '' : '🎖', label: badge.label, description: badge.label });
  }

  if (badges.length === 0) return '';

  const badgeCards = badges.map((badge) => `
  <div class="wkp-badge-item" role="img" aria-label="${esc(badge.description)}">
    <span class="wkp-badge-icon" aria-hidden="true">${badge.icon}</span>
    <span class="wkp-badge-label">${esc(badge.label)}</span>
  </div>`).join('\n');

  return `
<section class="wkp-trust-badges wkp-section" aria-label="Trust indicators">
  <div class="wkp-badges-row">
    ${badgeCards}
  </div>
</section>
<style>
.wkp-trust-badges{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-badges-row{display:flex;flex-wrap:wrap;gap:.625rem}
.wkp-badge-item{
  display:inline-flex;align-items:center;gap:.375rem;
  padding:.5rem .875rem;min-height:44px;
  background:var(--ww-bg-surface,#f0fdf4);
  border:1px solid color-mix(in srgb,var(--ww-primary) 30%,transparent);
  border-radius:9999px;
  font-size:.875rem;font-weight:600;color:var(--ww-text,#111827);
}
.wkp-badge-icon{font-size:1rem}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
