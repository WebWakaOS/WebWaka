/**
 * WakaPage — event_list block renderer.
 * (Phase 3 — ADR-0041: live community_events data)
 *
 * Data source: ctx.communityEvents (pre-fetched upcoming events for this tenant).
 * Falls back to an empty-state card when no events are scheduled.
 *
 * Platform Invariants:
 *   P9 — ticket_price_kobo rendered as ₦; free events show "Free"
 *   T3 — data already scoped to tenantId by renderer route fetcher
 */

import type { EventListBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext, CommunityEventDbRow } from '../../lib/wakapage-types.js';

export function renderEventListBlock(config: Partial<EventListBlockConfig>, ctx: RenderContext): string {
  const heading = config.heading ?? 'Upcoming Events';
  const events = ctx.communityEvents ?? [];

  const headingHtml = `<h2 class="wkp-block-heading">${esc(heading)}</h2>`;

  if (events.length === 0) {
    return `
<section class="wkp-event-list wkp-section" aria-label="${esc(heading)}">
  ${headingHtml}
  <div class="wkp-el-empty">
    <p class="wkp-el-empty-text">No upcoming events scheduled.</p>
  </div>
</section>
${eventListStyles()}`;
  }

  const eventCards = events.map(ev => renderEventCard(ev)).join('');

  return `
<section class="wkp-event-list wkp-section" aria-label="${esc(heading)}">
  ${headingHtml}
  <ul class="wkp-el-list" role="list">
    ${eventCards}
  </ul>
</section>
${eventListStyles()}`;
}

function renderEventCard(ev: CommunityEventDbRow): string {
  const date = formatEventDate(ev.starts_at);
  const price = ev.ticket_price_kobo > 0
    ? `₦${formatKobo(ev.ticket_price_kobo)}`
    : 'Free';
  const spotsLeft = ev.max_attendees > 0
    ? ev.max_attendees - ev.rsvp_count
    : null;
  const spotsHtml = spotsLeft !== null && spotsLeft >= 0
    ? `<span class="wkp-el-spots">${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left</span>`
    : '';

  return `
<li class="wkp-el-card">
  <div class="wkp-el-date-badge" aria-label="Event date">${esc(date)}</div>
  <div class="wkp-el-body">
    <p class="wkp-el-title">${esc(ev.title)}</p>
    <div class="wkp-el-meta">
      <span class="wkp-el-price">${esc(price)}</span>
      ${spotsHtml}
    </div>
  </div>
</li>`;
}

function formatEventDate(unixTs: number): string {
  try {
    return new Date(unixTs * 1000).toLocaleDateString('en-NG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(unixTs);
  }
}

function formatKobo(kobo: number): string {
  const naira = kobo / 100;
  return naira.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function eventListStyles(): string {
  return `<style>
.wkp-event-list{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-el-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.75rem}
.wkp-el-card{display:flex;gap:.875rem;padding:.875rem;border:1px solid var(--ww-border,#e5e7eb);border-radius:var(--ww-radius,8px);background:var(--ww-bg-surface,#f9fafb);align-items:flex-start}
.wkp-el-date-badge{flex-shrink:0;min-width:56px;padding:.4rem .5rem;background:var(--ww-primary,#1a6b3a);color:#fff;border-radius:6px;font-size:.75rem;font-weight:700;text-align:center;line-height:1.2}
.wkp-el-body{flex:1;min-width:0}
.wkp-el-title{font-size:.9375rem;font-weight:600;color:var(--ww-text,#111827);margin:0 0 .25rem}
.wkp-el-meta{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap}
.wkp-el-price{font-size:.8125rem;font-weight:700;color:var(--ww-primary,#1a6b3a)}
.wkp-el-spots{font-size:.75rem;color:var(--ww-text-muted,#6b7280)}
.wkp-el-empty{padding:1.5rem;text-align:center;border:1px dashed var(--ww-border,#e5e7eb);border-radius:var(--ww-radius,8px)}
.wkp-el-empty-text{color:var(--ww-text-muted,#6b7280);font-size:.9rem;margin:0}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
