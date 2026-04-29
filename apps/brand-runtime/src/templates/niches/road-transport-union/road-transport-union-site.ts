/**
 * Road Transport Workers Union — Pillar 2 Website Template
 * Slug: road-transport-union-road-transport-union-site
 * Vertical: road-transport-union (priority=2)
 * Category: civic
 * Nigeria-First Priority: medium
 * Regulatory signals: FRSC, NLC, VIO, NLC affiliation, CAC
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need information about your union membership and services.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.347.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.rtu-hero{text-align:center;padding:3rem 0 2.25rem}
.rtu-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.rtu-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.rtu-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.rtu-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.rtu-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.rtu-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.rtu-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.rtu-section{margin-top:2.75rem}
.rtu-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.rtu-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.rtu-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.rtu-card-icon{font-size:1.75rem;margin-bottom:.5rem}
.rtu-card-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.rtu-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.rtu-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.rtu-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.rtu-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
  const logoUrl = ctx.logoUrl;
  const phone = (ctx.data.phone as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need information about union membership, route allocation or dues.');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="rtu-logo">` : '';
  return `<section class="rtu-hero">
    ${logoHtml}
    <div class="rtu-badge">🚌 Union · Safety · Member Welfare</div>
    <h1>${esc(name)}</h1>
    <p class="rtu-tagline">${esc(tagline ?? 'Road transport workers union — member registration, route allocation, road safety compliance, welfare fund, dispute resolution and driver training services.')}</p>
    <div class="rtu-ctas">
      ${wa ? `<a href="${wa}" class="rtu-wa-btn" target="_blank" rel="noopener">${waSvg()} Contact Secretariat</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="rtu-primary-btn">📞 Call Office</a>` : ''}
    </div>
  </section>`;
}

function buildServices(_ctx: WebsiteRenderContext): string {
  const svcs = [
    {icon:'📋',name:'Member Registration',desc:'New member enrolment for bus, taxi, tricycle (keke) and truck operators. ID card issued.'},
    {icon:'🛣',name:'Route Allocation',desc:'Formal route permits, park ticketing and motor park allocation for registered members.'},
    {icon:'🛡',name:'Safety Compliance',desc:'FRSC road safety training, vehicle roadworthiness checks and accident reporting.'},
    {icon:'💰',name:'Welfare Fund',desc:'Accident benefit, burial assistance, medical support and emergency loans for members.'},
    {icon:'⚖',name:'Dispute Resolution',desc:'Mediation of disputes between operators, conductors and passengers.'},
    {icon:'📚',name:'Driver Training',desc:'Defensive driving, first aid and road safety certification programmes.'},
  ];
  const cards = svcs.map(s=>`<div class="rtu-card"><div class="rtu-card-icon">${s.icon}</div><div class="rtu-card-name">${s.name}</div><div class="rtu-card-desc">${s.desc}</div></div>`).join('');
  return `<section class="rtu-section"><h2 class="rtu-section-title">Union Services</h2><div class="rtu-grid">${cards}</div></section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const address = (ctx.data.address as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I want to register as a union member or enquire about services.');
  return `<section class="rtu-section"><h2 class="rtu-section-title">Union Secretariat</h2>
    <div class="rtu-contact-box">
      ${address ? `<div class="rtu-contact-row"><span class="rtu-contact-label">Office</span><span>${esc(address)}</span></div>` : ''}
      ${phone ? `<div class="rtu-contact-row"><span class="rtu-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : ''}
      ${email ? `<div class="rtu-contact-row"><span class="rtu-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
      ${wa ? `<div class="rtu-contact-row"><span class="rtu-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">${waSvg()} Contact Secretariat</a></div>` : ''}
    </div>
    <p style="font-size:.75rem;color:var(--ww-text-muted);margin-top:1rem">NLC Affiliated. FRSC Compliant. CAC Registered. Member data handled under the Nigeria Data Protection Regulation (NDPR).</p>
  </section>`;
}

function renderPage(ctx: WebsiteRenderContext): string {
  return CSS + buildHero(ctx) + buildServices(ctx) + buildContact(ctx);
}

export const roadTransportUnionRoadTransportUnionSiteTemplate: WebsiteTemplateContract = {
  slug: 'road-transport-union-road-transport-union-site',
  version: '1.0.0',
  pages: ['home'],
  renderPage,
};
