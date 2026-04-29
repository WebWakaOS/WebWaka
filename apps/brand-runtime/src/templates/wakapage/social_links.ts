/**
 * WakaPage — social_links block renderer.
 * (Phase 2 — ADR-0041)
 *
 * Renders tenant social links as touch-friendly icon buttons.
 * Data sources (priority order):
 *   1. config.links (block-specific override)
 *   2. tenant_branding.social_links_json (0423 migration, shared per tenant)
 *
 * Nigeria First: 44px touch targets, WhatsApp first (most-used platform in NG).
 */

import type { SocialLinksBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

const PLATFORM_ICONS: Record<string, string> = {
  whatsapp:  '💬',
  instagram: '📸',
  facebook:  '👥',
  twitter:   '🐦',
  tiktok:    '🎵',
  youtube:   '▶️',
  linkedin:  '💼',
  telegram:  '✈️',
  website:   '🌐',
};

const PLATFORM_LABELS: Record<string, string> = {
  whatsapp:  'WhatsApp',
  instagram: 'Instagram',
  facebook:  'Facebook',
  twitter:   'Twitter / X',
  tiktok:    'TikTok',
  youtube:   'YouTube',
  linkedin:  'LinkedIn',
  telegram:  'Telegram',
  website:   'Website',
};

interface SocialLink {
  platform: string;
  url: string;
  label?: string;
}

export function renderSocialLinksBlock(config: Partial<SocialLinksBlockConfig>, ctx: RenderContext): string {
  let links: SocialLink[] = [];

  if (config.links && config.links.length > 0) {
    links = config.links;
  } else if (ctx.socialLinksJson) {
    try {
      const parsed = JSON.parse(ctx.socialLinksJson) as unknown;
      if (Array.isArray(parsed)) {
        links = parsed as SocialLink[];
      }
    } catch { /* malformed JSON — render empty */ }
  }

  if (links.length === 0) return '';

  const style = config.style ?? 'buttons';

  const linksHtml = links.map((link) => {
    const icon = PLATFORM_ICONS[link.platform] ?? '🔗';
    const label = link.label ?? PLATFORM_LABELS[link.platform] ?? link.platform;
    const isExternal = link.url.startsWith('http') || link.url.startsWith('whatsapp://') || link.url.startsWith('wa.me');
    return `
    <a class="wkp-social-link wkp-social-link--${esc(style)}"
       href="${escAttr(link.url)}"
       ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}
       aria-label="${esc(label)}">
      <span class="wkp-social-icon" aria-hidden="true">${icon}</span>
      ${style !== 'icons' ? `<span class="wkp-social-label">${esc(label)}</span>` : ''}
    </a>`;
  }).join('\n');

  return `
<section class="wkp-social wkp-section" aria-label="Social media links">
  <div class="wkp-social-list" role="list">
    ${linksHtml}
  </div>
</section>
<style>
.wkp-social{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-social-list{display:flex;flex-wrap:wrap;gap:.75rem}
.wkp-social-link{
  display:inline-flex;align-items:center;gap:.5rem;
  padding:.625rem 1rem;min-height:44px;
  border-radius:var(--ww-radius,8px);
  font-size:.9375rem;font-weight:500;
  text-decoration:none;transition:filter .15s;
  white-space:nowrap;
}
.wkp-social-link--buttons{
  background:var(--ww-primary);color:#fff;
  border:2px solid var(--ww-primary);
}
.wkp-social-link--buttons:hover{filter:brightness(1.1);text-decoration:none;color:#fff}
.wkp-social-link--icons{
  background:var(--ww-bg-surface,#f3f4f6);
  color:var(--ww-text,#111827);
  font-size:1.25rem;padding:.5rem;width:48px;height:48px;
  justify-content:center;border-radius:50%;
}
.wkp-social-link--text{
  color:var(--ww-primary);background:transparent;border:none;
  padding:.5rem 0;
}
.wkp-social-icon{line-height:1;flex-shrink:0}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function escAttr(url: string): string {
  return encodeURI(url).replace(/"/g,'%22');
}
