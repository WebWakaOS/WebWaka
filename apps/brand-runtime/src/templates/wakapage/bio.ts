/**
 * WakaPage — bio block renderer.
 * (Phase 2 — ADR-0041)
 *
 * Text/bio block. Renders stored body text.
 * Body is stored as plain text (or limited HTML subset sanitised at save time).
 * We render it using nl2br (newlines → <br>) for plain-text bodies.
 * No arbitrary HTML injection — content is escaped if it is not trusted HTML.
 *
 * Nigeria First: capped at maxChars (default 500) to keep pages lightweight
 * on mobile data.
 */

import type { BioBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderBioBlock(config: Partial<BioBlockConfig>, ctx: RenderContext): string {
  const body = config.body ?? ctx.profile?.content ?? '';
  const maxChars = config.maxChars ?? 500;
  if (!body.trim()) return '';

  const truncated = body.length > maxChars ? body.slice(0, maxChars) + '…' : body;
  const rendered = esc(truncated).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />');

  return `
<section class="wkp-bio wkp-section" aria-label="About">
  <div class="wkp-bio-body"><p>${rendered}</p></div>
</section>
<style>
.wkp-bio{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-bio-body{font-size:1rem;color:var(--ww-text,#111827);line-height:1.75;max-width:60ch}
.wkp-bio-body p{margin-bottom:1em}
.wkp-bio-body p:last-child{margin-bottom:0}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
