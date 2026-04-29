/**
 * Sports Club / Amateur League Portal — Pillar 3 Website Template
 * Niche ID: P3-sports-club-sports-club-portal
 * Vertical: sports-club (priority=3, high)
 * Category: civic/sports
 * Family: NF-CIV-SPT (standalone)
 * Research brief: docs/templates/research/sports-club-sports-club-portal-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: Football: NFF/LMC; Athletics: AFN; CAC, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I am interested in joining or supporting the sports club.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.spc-hero{text-align:center;padding:3rem 0 2.25rem}
.spc-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.spc-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.spc-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.spc-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.spc-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.spc-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.spc-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.spc-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.spc-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.spc-section{margin-top:2.75rem}
.spc-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.spc-sports-grid{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.spc-sport-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1rem;background:var(--ww-surface);text-align:center}
.spc-sport-icon{font-size:2rem;margin-bottom:.25rem}
.spc-sport-name{font-weight:600;font-size:.9375rem}
.spc-fixtures-list{display:flex;flex-direction:column;gap:.6rem}
.spc-fixture-row{display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);background:var(--ww-surface);font-size:.9rem;flex-wrap:wrap;gap:.5rem}
.spc-fixture-teams{font-weight:700}
.spc-fixture-date{font-size:.8rem;color:var(--ww-text-muted)}
.spc-fixture-venue{font-size:.8rem;color:var(--ww-primary)}
.spc-join-box{border:2px solid var(--ww-primary);border-radius:var(--ww-radius);padding:1.5rem;text-align:center;background:var(--ww-surface)}
.spc-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.spc-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.spc-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.spc-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone);
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="spc-logo">` : '';
  return `<section class="spc-hero">
    ${logoHtml}
    <div class="spc-badge">⚽ Amateur League · NFF Affiliated</div>
    <h1>${esc(name)}</h1>
    <p class="spc-tagline">${esc(tagline ?? 'Building champions on and off the field — football, basketball, athletics & more. Join our community today.')}</p>
    <div class="spc-ctas">
      ${wa ? `<a href="${wa}" class="spc-wa-btn" target="_blank" rel="noopener">${waSvg()} Join via WhatsApp</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="spc-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildSports(ctx: WebsiteRenderContext): string {
  const sports = (ctx as unknown as Record<string,unknown>)['sports'] as {name:string;icon:string}[] | undefined;
  const list = sports && sports.length > 0 ? sports : [
    {name:'Football',icon:'⚽'},{name:'Basketball',icon:'🏀'},{name:'Athletics',icon:'🏃'},
    {name:'Table Tennis',icon:'🏓'},{name:'Volleyball',icon:'🏐'},{name:'Chess',icon:'♟️'},
  ];
  const cards = list.slice(0,6).map((s: Record<string,unknown>) => `
    <div class="spc-sport-card">
      <div class="spc-sport-icon">${esc(String(s.icon ?? ''))}</div>
      <div class="spc-sport-name">${esc(String(s.name ?? ''))}</div>
    </div>`).join('');
  return `<section class="spc-section">
    <h2 class="spc-section-title">Sports & Disciplines</h2>
    <div class="spc-sports-grid">${cards}</div>
  </section>`;
}

function buildFixtures(ctx: WebsiteRenderContext): string {
  const fixtures = (ctx as unknown as Record<string,unknown>)['fixtures'] as {teams:string;date:string;venue:string}[] | undefined;
  const list = fixtures && fixtures.length > 0 ? fixtures : [
    {teams:'Home XI vs Visitors FC',date:'Sat, 3 May 2026 — 4:00 PM',venue:'Estate Pitch, Lekki Phase 1'},
    {teams:'Youth Team A vs Youth Team B',date:'Sun, 4 May 2026 — 10:00 AM',venue:'Training Ground'},
    {teams:'Basketball: Club A vs Rivals',date:'Fri, 9 May 2026 — 6:00 PM',venue:'Community Hall, VI'},
  ];
  const rows = list.slice(0,4).map(f => `
    <div class="spc-fixture-row">
      <span class="spc-fixture-teams">⚽ ${esc(f.teams)}</span>
      <span class="spc-fixture-date">${esc(f.date)}</span>
      <span class="spc-fixture-venue">📍 ${esc(f.venue)}</span>
    </div>`).join('');
  return `<section class="spc-section">
    <h2 class="spc-section-title">Upcoming Fixtures</h2>
    <div class="spc-fixtures-list">${rows}</div>
  </section>`;
}

function buildJoin(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I would like to join the sports club. Please share membership details.');
  return `<section class="spc-section">
    <h2 class="spc-section-title">Join the Club</h2>
    <div class="spc-join-box">
      <p style="font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem">Open to all ages. Annual membership includes kit, training sessions, and league participation. Send us your sport and contact details on WhatsApp to register.</p>
      ${wa ? `<a href="${wa}" class="spc-wa-btn" target="_blank" rel="noopener">${waSvg()} Register via WhatsApp</a>` : ''}
    </div>
  </section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone);
  const rows = [
    phone ? `<div class="spc-contact-row"><span class="spc-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="spc-contact-row"><span class="spc-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="spc-contact-row"><span class="spc-contact-label">Ground</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="spc-contact-row"><span class="spc-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat Now</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="spc-section">
    <h2 class="spc-section-title">Contact & Management</h2>
    <div class="spc-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="spc-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Sports Club, Nigeria.<br>
    NFF Affiliated &bull; CAC Registered &bull; NDPR Compliant
  </footer>`;
}

export const sportsClubSportsClubPortalTemplate: WebsiteTemplateContract = {
  slug: 'sports-club-sports-club-portal',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildSports(ctx), buildFixtures(ctx), buildJoin(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
