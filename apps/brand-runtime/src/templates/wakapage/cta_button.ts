/**
 * WakaPage — cta_button block renderer.
 * (Phase 2 — ADR-0041)
 *
 * Single call-to-action button. Full-width on mobile (360px), auto on 480px+.
 * Touch target: 44px minimum height.
 * Supports primary / secondary / outline variants.
 * Also serves as the WhatsApp CTA when url starts with wa.me or whatsapp://.
 */

import type { CtaButtonBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderCtaButtonBlock(config: Partial<CtaButtonBlockConfig>, _ctx: RenderContext): string {
  const label = config.label;
  const url = config.url;
  if (!label || !url) return '';

  const variant = config.variant ?? 'primary';
  const openInNewTab = config.openInNewTab ?? url.startsWith('http');

  const isWhatsApp = url.includes('wa.me') || url.startsWith('whatsapp://');
  const whatsAppPrefix = isWhatsApp ? '💬 ' : '';

  return `
<section class="wkp-cta-section wkp-section" aria-label="Call to action">
  <a class="wkp-btn wkp-cta-btn wkp-cta-btn--${esc(variant)}"
     href="${escAttr(url)}"
     ${openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''}>
    ${whatsAppPrefix}${esc(label)}
  </a>
</section>
<style>
.wkp-cta-section{border-top:1px solid var(--ww-border,#e5e7eb);text-align:center}
.wkp-cta-btn{display:inline-flex;align-items:center;justify-content:center;
  gap:.5rem;padding:.875rem 2rem;min-height:44px;
  border-radius:var(--ww-radius,8px);font-size:1rem;font-weight:700;
  text-decoration:none;transition:filter .15s;
  width:100%;max-width:400px}
.wkp-cta-btn--primary{background:var(--ww-primary);color:#fff;border:2px solid var(--ww-primary)}
.wkp-cta-btn--primary:hover{filter:brightness(1.08);text-decoration:none;color:#fff}
.wkp-cta-btn--secondary{background:var(--ww-secondary,#e5e7eb);color:var(--ww-text,#111827);border:2px solid var(--ww-secondary,#e5e7eb)}
.wkp-cta-btn--outline{background:transparent;color:var(--ww-primary);border:2px solid var(--ww-primary)}
.wkp-cta-btn--outline:hover{background:var(--ww-primary);color:#fff}
@media(min-width:480px){.wkp-cta-btn{width:auto}}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function escAttr(url: string): string {
  return encodeURI(url).replace(/"/g,'%22');
}
