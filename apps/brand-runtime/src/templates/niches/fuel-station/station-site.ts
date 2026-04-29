/**
 * Fuel Station / Filling Station — Pillar 2 Website Template
 * Slug: fuel-station-station-site
 * Vertical: fuel-station (priority=2)
 * Category: commerce
 * Nigeria-First Priority: critical
 * Regulatory signals: NUPRC (DPR), NNPC, IPMAN, SON, CAC
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, please confirm current fuel prices and availability.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3-636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.fst-hero{text-align:center;padding:3rem 0 2.25rem}
.fst-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.fst-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.fst-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.fst-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.fst-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.fst-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.fst-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.fst-section{margin-top:2.75rem}
.fst-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.fst-products-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
.fst-prod-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface);text-align:center}
.fst-prod-icon{font-size:2rem;margin-bottom:.5rem}
.fst-prod-name{font-weight:700;font-size:1rem;margin-bottom:.25rem}
.fst-prod-desc{font-size:.8125rem;color:var(--ww-text-muted)}
.fst-trust-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem}
.fst-trust-chip{padding:.3rem .8rem;border-radius:999px;font-size:.8rem;font-weight:600;background:var(--ww-primary);color:#fff;opacity:.85}
.fst-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.fst-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.fst-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
  const logoUrl = ctx.logoUrl;
  const phone = (ctx.data.phone as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, please confirm fuel availability and current price.');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="fst-logo">` : '';
  return `<section class="fst-hero">
    ${logoHtml}
    <div class="fst-badge">⛽ PMS · AGO · DPK · Lubes</div>
    <h1>${esc(name)}</h1>
    <p class="fst-tagline">${esc(tagline ?? 'NUPRC-licensed filling station — premium motor spirit, diesel, kerosene and lubricants. Always available, calibrated pumps, quality guaranteed.')}</p>
    <div class="fst-ctas">
      ${wa ? `<a href="${wa}" class="fst-wa-btn" target="_blank" rel="noopener">${waSvg()} Check Availability</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="fst-primary-btn">📞 Call Station</a>` : ''}
    </div>
  </section>`;
}

function buildProducts(_ctx: WebsiteRenderContext): string {
  const prods = [
    {icon:'⛽',name:'PMS (Petrol)',desc:'Premium Motor Spirit at regulated NUPRC price. Calibrated dispensers.'},
    {icon:'🛢',name:'AGO (Diesel)',desc:'Automotive Gas Oil for trucks, generators and heavy machinery.'},
    {icon:'🔵',name:'DPK (Kerosene)',desc:'Dual Purpose Kerosene for domestic cooking and industrial use.'},
    {icon:'🔧',name:'Lubricants',desc:'Genuine engine oils, grease and hydraulic fluids for all vehicle types.'},
    {icon:'🚗',name:'Car Wash',desc:'Drive-through and hand wash available on-site. From ₦2,000.'},
    {icon:'💳',name:'POS & Transfer',desc:'Pay by POS machine, bank transfer or cash. No surcharge.'},
  ];
  const cards = prods.map(s=>`<div class="fst-prod-card"><div class="fst-prod-icon">${s.icon}</div><div class="fst-prod-name">${s.name}</div><div class="fst-prod-desc">${s.desc}</div></div>`).join('');
  return `<section class="fst-section"><h2 class="fst-section-title">Products & Services</h2><div class="fst-products-grid">${cards}</div></section>`;
}

function buildTrust(_ctx: WebsiteRenderContext): string {
  const chips = ['NUPRC Licensed','IPMAN Member','SON Certified Pumps','NNPC Partner','Calibrated Meters','24/7 Operation'].map(c=>`<span class="fst-trust-chip">${c}</span>`).join('');
  return `<section class="fst-section"><h2 class="fst-section-title">Licensed & Certified</h2><div class="fst-trust-row">${chips}</div></section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const address = (ctx.data.address as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I want to confirm your fuel price and availability.');
  return `<section class="fst-section"><h2 class="fst-section-title">Station Location</h2>
    <div class="fst-contact-box">
      ${address ? `<div class="fst-contact-row"><span class="fst-contact-label">Address</span><span>${esc(address)}</span></div>` : ''}
      ${phone ? `<div class="fst-contact-row"><span class="fst-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : ''}
      ${email ? `<div class="fst-contact-row"><span class="fst-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
      ${wa ? `<div class="fst-contact-row"><span class="fst-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">${waSvg()} Enquire Now</a></div>` : ''}
    </div>
  </section>`;
}

function renderPage(ctx: WebsiteRenderContext): string {
  return CSS + buildHero(ctx) + buildProducts(ctx) + buildTrust(ctx) + buildContact(ctx);
}

export const fuelStationStationSiteTemplate: WebsiteTemplateContract = {
  slug: 'fuel-station-station-site',
  version: '1.0.0',
  pages: ['home'],
  renderPage,
};
