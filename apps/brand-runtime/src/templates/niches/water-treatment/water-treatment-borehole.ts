/**
 * Water Treatment / Borehole Operator — Pillar 2 Website Template
 * Slug: water-treatment-water-treatment-borehole
 * Vertical: water-treatment (priority=2)
 * Category: place
 * Nigeria-First Priority: high
 * Regulatory signals: NAFDAC (sachet water), NESREA, WAN, SON, CAC
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need water treatment or borehole services. Can you assist?')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.wtr-hero{text-align:center;padding:3rem 0 2.25rem}
.wtr-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.wtr-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.wtr-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.wtr-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.wtr-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.wtr-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.wtr-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.wtr-section{margin-top:2.75rem}
.wtr-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.wtr-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.wtr-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.wtr-card-icon{font-size:1.75rem;margin-bottom:.5rem}
.wtr-card-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.wtr-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.wtr-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.wtr-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.wtr-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
  const logoUrl = ctx.logoUrl;
  const phone = (ctx.data.phone as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need water treatment or borehole services. Please advise.');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="wtr-logo">` : '';
  return `<section class="wtr-hero">
    ${logoHtml}
    <div class="wtr-badge">💧 Pure · Safe · Tested Water</div>
    <h1>${esc(name)}</h1>
    <p class="wtr-tagline">${esc(tagline ?? 'NAFDAC-compliant water treatment and borehole operator — sachet water production, borehole drilling, water treatment plants and community water supply solutions.')}</p>
    <div class="wtr-ctas">
      ${wa ? `<a href="${wa}" class="wtr-wa-btn" target="_blank" rel="noopener">${waSvg()} Get Quote</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="wtr-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildServices(_ctx: WebsiteRenderContext): string {
  const svcs = [
    {icon:'🔩',name:'Borehole Drilling',desc:'Rotary borehole drilling up to 250m depth. Casing, pump installation and water yield test.'},
    {icon:'🏭',name:'Water Treatment Plant',desc:'Design and installation of reverse osmosis, UV and chlorination systems.'},
    {icon:'💧',name:'Sachet Water Production',desc:'NAFDAC-licensed sachet water and table water (pure water) factory setup.'},
    {icon:'🧪',name:'Water Quality Test',desc:'Laboratory analysis of borehole, tap and packaged water. WHO standard reporting.'},
    {icon:'🔧',name:'Pump Maintenance',desc:'Submersible pump servicing, overhead tank cleaning and pipeline repairs.'},
    {icon:'🚚',name:'Water Tanker Supply',desc:'10,000–20,000 litre water tanker delivery for construction sites and estates.'},
  ];
  const cards = svcs.map(s=>`<div class="wtr-card"><div class="wtr-card-icon">${s.icon}</div><div class="wtr-card-name">${s.name}</div><div class="wtr-card-desc">${s.desc}</div></div>`).join('');
  return `<section class="wtr-section"><h2 class="wtr-section-title">Our Services</h2><div class="wtr-grid">${cards}</div></section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const address = (ctx.data.address as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need water services. Please send a quote.');
  return `<section class="wtr-section"><h2 class="wtr-section-title">Contact Us</h2>
    <div class="wtr-contact-box">
      ${address ? `<div class="wtr-contact-row"><span class="wtr-contact-label">Address</span><span>${esc(address)}</span></div>` : ''}
      ${phone ? `<div class="wtr-contact-row"><span class="wtr-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : ''}
      ${email ? `<div class="wtr-contact-row"><span class="wtr-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
      ${wa ? `<div class="wtr-contact-row"><span class="wtr-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">${waSvg()} Get Quote</a></div>` : ''}
    </div>
    <p style="font-size:.75rem;color:var(--ww-text-muted);margin-top:1rem">NAFDAC Licensed. NESREA Compliant. CAC Registered. Your data handled under NDPR.</p>
  </section>`;
}

function renderPage(ctx: WebsiteRenderContext): string {
  return CSS + buildHero(ctx) + buildServices(ctx) + buildContact(ctx);
}

export const waterTreatmentWaterTreatmentBoreholeTemplate: WebsiteTemplateContract = {
  slug: 'water-treatment-water-treatment-borehole',
  version: '1.0.0',
  pages: ['home'],
  renderPage,
};
