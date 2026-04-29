/**
 * Public Relations Firm Site — Pillar 3 Website Template
 * Niche ID: P3-pr-firm-pr-firm-site
 * Vertical: pr-firm (priority=3, high)
 * Category: professional/communications
 * Family: NF-PRO-COM (standalone)
 * Research brief: docs/templates/research/pr-firm-pr-firm-site-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NIPR accreditation, APCON (advertising adjacent), CAC, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about your PR services.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.prf-hero{text-align:center;padding:3rem 0 2.25rem}
.prf-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.prf-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.prf-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.prf-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.prf-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.prf-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.prf-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.prf-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.prf-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.prf-section{margin-top:2.75rem}
.prf-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.prf-services-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.prf-svc-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.prf-svc-icon{font-size:1.5rem;margin-bottom:.5rem}
.prf-svc-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.prf-svc-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.prf-sectors-row{display:flex;flex-wrap:wrap;gap:.6rem}
.prf-sector-chip{padding:.35rem .85rem;border-radius:999px;font-size:.8rem;font-weight:600;background:var(--ww-primary);color:#fff;opacity:.85}
.prf-media-grid{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
.prf-media-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:.75rem;background:var(--ww-surface);text-align:center;font-size:.875rem;font-weight:600}
.prf-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.prf-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.prf-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.prf-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
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
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="prf-logo">` : '';
  return `<section class="prf-hero">
    ${logoHtml}
    <div class="prf-badge">📣 NIPR Accredited · Crisis Management</div>
    <h1>${esc(name)}</h1>
    <p class="prf-tagline">${esc(tagline ?? 'Strategic public relations, media relations & crisis communications — Nigeria-focused, Africa-ready.')}</p>
    <div class="prf-ctas">
      ${wa ? `<a href="${wa}" class="prf-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="prf-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildServices(ctx: WebsiteRenderContext): string {
  const services = (((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).length > 0) ? ((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).slice(0,6) : [
    {name:'Media Relations',description:'Press releases, journalist pitching, interview coaching, and Channels / TVC / ThisDay placement.'},
    {name:'Crisis Communications',description:'24/7 crisis response, holding statements, reputational risk management, and stakeholder messaging.'},
    {name:'Corporate Communications',description:'Annual report messaging, CEO profiling, investor communications, and AGM support.'},
    {name:'Government & Public Affairs',description:'Policy advocacy, regulatory engagement, NASS committee liaison, and policy monitoring.'},
    {name:'Brand Reputation Management',description:'Online reputation monitoring, social media PR strategy, and influencer engagement (Nigerian market).'},
    {name:'Event PR & Publicity',description:'Product launches, press conferences, endorsement deals, and red-carpet media management.'},
  ];
  const cards = services.map((s: Record<string,unknown>) => `
    <div class="prf-svc-card">
      <div class="prf-svc-icon">📣</div>
      <div class="prf-svc-name">${esc(String(s.name ?? ''))}</div>
      <div class="prf-svc-desc">${esc(String(s.description ?? ''))}</div>
    </div>`).join('');
  return `<section class="prf-section">
    <h2 class="prf-section-title">Our Services</h2>
    <div class="prf-services-grid">${cards}</div>
  </section>`;
}

function buildSectors(ctx: WebsiteRenderContext): string {
  const sectors = (ctx as unknown as Record<string,unknown>)['sectors'] as string[] | undefined;
  const list = sectors && sectors.length > 0 ? sectors : ['Financial Services','FMCG & Consumer','Oil & Gas','Telecoms','Government & Parastatals','Healthcare','Real Estate','Tech & Startups'];
  const chips = list.map((s: string) => `<span class="prf-sector-chip">${esc(s)}</span>`).join('');
  return `<section class="prf-section">
    <h2 class="prf-section-title">Sectors We Serve</h2>
    <div class="prf-sectors-row">${chips}</div>
  </section>`;
}

function buildMediaReach(ctx: WebsiteRenderContext): string {
  const media = (ctx as unknown as Record<string,unknown>)['mediaPartners'] as string[] | undefined;
  const list = media && media.length > 0 ? media : ['Channels TV','TVC News','Arise News','The Punch','ThisDay','Vanguard','BusinessDay','Premium Times'];
  const cards = list.slice(0,8).map(m => `<div class="prf-media-card">${esc(m)}</div>`).join('');
  return `<section class="prf-section">
    <h2 class="prf-section-title">Media Reach</h2>
    <p style="font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.75rem">Strong editorial relationships across Nigeria's leading broadcast, print, and digital media.</p>
    <div class="prf-media-grid">${cards}</div>
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
    phone ? `<div class="prf-contact-row"><span class="prf-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="prf-contact-row"><span class="prf-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="prf-contact-row"><span class="prf-contact-label">Office</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="prf-contact-row"><span class="prf-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat on WhatsApp</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="prf-section">
    <h2 class="prf-section-title">Contact Us</h2>
    <div class="prf-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="prf-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; NIPR-Accredited Public Relations Firm, Nigeria.<br>
    CAC Registered &bull; APCON Adjacent &bull; NDPR Compliant
  </footer>`;
}

export const prFirmPrFirmSiteTemplate: WebsiteTemplateContract = {
  slug: 'pr-firm-pr-firm-site',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildServices(ctx), buildSectors(ctx), buildMediaReach(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
