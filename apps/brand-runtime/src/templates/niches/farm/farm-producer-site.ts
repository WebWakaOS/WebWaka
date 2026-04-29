/**
 * Farm / Agricultural Producer — Pillar 2 Website Template
 * Slug: farm-farm-producer-site
 * Vertical: farm (priority=2)
 * Category: agricultural
 * Nigeria-First Priority: high
 * Regulatory signals: FMARD, NAFDAC (processed), ADP, CAC, NASRDA
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I am interested in purchasing farm produce. Please advise on availability.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.frm-hero{text-align:center;padding:3rem 0 2.25rem}
.frm-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.frm-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.frm-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.frm-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.frm-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.frm-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.frm-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.frm-section{margin-top:2.75rem}
.frm-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.frm-produce-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.frm-produce-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface);text-align:center}
.frm-produce-icon{font-size:2rem;margin-bottom:.5rem}
.frm-produce-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.frm-produce-desc{font-size:.8125rem;color:var(--ww-text-muted)}
.frm-trust-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem}
.frm-trust-chip{padding:.3rem .8rem;border-radius:999px;font-size:.8rem;font-weight:600;background:var(--ww-primary);color:#fff;opacity:.85}
.frm-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.frm-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.frm-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
  const logoUrl = ctx.logoUrl;
  const phone = (ctx.data.phone as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need farm produce. What do you have available?');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="frm-logo">` : '';
  return `<section class="frm-hero">
    ${logoHtml}
    <div class="frm-badge">🌾 Grow · Harvest · Supply</div>
    <h1>${esc(name)}</h1>
    <p class="frm-tagline">${esc(tagline ?? 'FMARD-registered farm and agricultural producer — fresh vegetables, grains, livestock and direct-to-market supply from our farm in Nigeria.')}</p>
    <div class="frm-ctas">
      ${wa ? `<a href="${wa}" class="frm-wa-btn" target="_blank" rel="noopener">${waSvg()} Order Produce</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="frm-primary-btn">📞 Call Farm</a>` : ''}
    </div>
  </section>`;
}

function buildProduce(_ctx: WebsiteRenderContext): string {
  const items = [
    {icon:'🥬',name:'Leafy Vegetables',desc:'Ugu, waterleaf, bitter leaf, spinach. Fresh from farm.'},
    {icon:'🌽',name:'Cereals & Grains',desc:'Maize, sorghum, millet, groundnuts. Bulk supply available.'},
    {icon:'🍅',name:'Tomatoes & Peppers',desc:'Plum, cherry and Roma tomatoes. Tatashe and rodo.'},
    {icon:'🐔',name:'Poultry & Livestock',desc:'Live broilers, layers, goats and cattle. Wholesale pricing.'},
    {icon:'🥚',name:'Fresh Eggs',desc:'Crates of farm-fresh eggs. From ₦4,500/crate. Weekly supply.'},
    {icon:'🚛',name:'Wholesale Supply',desc:'Direct-to-retailer supply for markets, supermarkets and hotels.'},
  ];
  const cards = items.map(i=>`<div class="frm-produce-card"><div class="frm-produce-icon">${i.icon}</div><div class="frm-produce-name">${i.name}</div><div class="frm-produce-desc">${i.desc}</div></div>`).join('');
  return `<section class="frm-section"><h2 class="frm-section-title">Our Produce</h2><div class="frm-produce-grid">${cards}</div></section>`;
}

function buildTrust(_ctx: WebsiteRenderContext): string {
  const chips = ['FMARD Registered','ADP Partner','CAC Incorporated','GoodAgri Practise','Pesticide-Safe','Direct Farm Supply'].map(c=>`<span class="frm-trust-chip">${c}</span>`).join('');
  return `<section class="frm-section"><h2 class="frm-section-title">Why Buy From Us</h2><div class="frm-trust-row">${chips}</div><p style="font-size:.9rem;margin-top:1rem;color:var(--ww-text-muted)">All produce is grown following Good Agricultural Practices (GAP). We supply supermarkets, hotels, school canteens and market traders. Flexible payment: Paystack, bank transfer or cash on delivery.</p></section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const address = (ctx.data.address as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I want to buy farm produce in bulk. Please advise on pricing.');
  return `<section class="frm-section"><h2 class="frm-section-title">Contact the Farm</h2>
    <div class="frm-contact-box">
      ${address ? `<div class="frm-contact-row"><span class="frm-contact-label">Farm Location</span><span>${esc(address)}</span></div>` : ''}
      ${phone ? `<div class="frm-contact-row"><span class="frm-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : ''}
      ${email ? `<div class="frm-contact-row"><span class="frm-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
      ${wa ? `<div class="frm-contact-row"><span class="frm-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">${waSvg()} Order Produce</a></div>` : ''}
    </div>
    <p style="font-size:.75rem;color:var(--ww-text-muted);margin-top:1rem">CAC Registered Farm Business. Your data handled under the Nigeria Data Protection Regulation (NDPR).</p>
  </section>`;
}

function renderPage(ctx: WebsiteRenderContext): string {
  return CSS + buildHero(ctx) + buildProduce(ctx) + buildTrust(ctx) + buildContact(ctx);
}

export const farmFarmProducerSiteTemplate: WebsiteTemplateContract = {
  slug: 'farm-farm-producer-site',
  version: '1.0.0',
  pages: ['home'],
  renderPage,
};
