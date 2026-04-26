/**
 * Restaurant / Food Chain Outlet — Pillar 2 Website Template
 * Slug: restaurant-chain-restaurant-chain-outlet
 * Vertical: restaurant-chain (priority=2)
 * Category: hospitality
 * Nigeria-First Priority: high
 * Regulatory signals: NAFDAC, LHAID, HACCP, NFF (if catering for events), CAC
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I want to place a food order or make a reservation. Can you assist?')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.rch-hero{text-align:center;padding:3rem 0 2.25rem}
.rch-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.rch-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.rch-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.rch-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.rch-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.rch-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.rch-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.rch-section{margin-top:2.75rem}
.rch-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.rch-menu-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
.rch-menu-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.rch-menu-icon{font-size:1.75rem;margin-bottom:.5rem}
.rch-menu-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.rch-menu-price{font-weight:700;color:var(--ww-primary);font-size:.875rem;margin-bottom:.25rem}
.rch-menu-desc{font-size:.8125rem;color:var(--ww-text-muted)}
.rch-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.rch-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.rch-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
  const logoUrl = ctx.logoUrl;
  const phone = (ctx.data.phone as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I want to order food or make a reservation. Can you help?');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="rch-logo">` : '';
  return `<section class="rch-hero">
    ${logoHtml}
    <div class="rch-badge">🍽 Dine · Order · Enjoy</div>
    <h1>${esc(name)}</h1>
    <p class="rch-tagline">${esc(tagline ?? 'NAFDAC-certified restaurant and food chain — dine-in, takeaway, delivery, catering and franchise inquiries. Authentic flavours, consistent quality.')}</p>
    <div class="rch-ctas">
      ${wa ? `<a href="${wa}" class="rch-wa-btn" target="_blank" rel="noopener">${waSvg()} Order Now</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="rch-primary-btn">📞 Reserve Table</a>` : ''}
    </div>
  </section>`;
}

function buildMenu(_ctx: WebsiteRenderContext): string {
  const items = [
    {icon:'🍚',name:'Rice & Proteins',price:'₦3,500 – ₦7,000',desc:'Jollof, fried or white rice with grilled chicken, fish or beef.'},
    {icon:'🍲',name:'Nigerian Swallow',price:'₦2,500 – ₦5,000',desc:'Pounded yam, eba, semo with egusi, ogbono or vegetable soup.'},
    {icon:'🥩',name:'Grills & BBQ',price:'₦4,500 – ₦12,000',desc:'Grilled chicken, peppered gizzard, oxtail and mixed grills.'},
    {icon:'🍔',name:'Continental Meals',price:'₦3,500 – ₦8,000',desc:'Burgers, pasta, shawarma and sandwiches for varied tastes.'},
    {icon:'🎂',name:'Special Occasion',price:'Contact for quote',desc:'Birthday, anniversary and corporate event packages.'},
    {icon:'📦',name:'Corporate Lunch Box',price:'₦3,500+',desc:'Office lunch packs delivered daily by 12 noon. Minimum 10 packs.'},
  ];
  const cards = items.map(i=>`<div class="rch-menu-card"><div class="rch-menu-icon">${i.icon}</div><div class="rch-menu-name">${i.name}</div><div class="rch-menu-price">${i.price}</div><div class="rch-menu-desc">${i.desc}</div></div>`).join('');
  return `<section class="rch-section"><h2 class="rch-section-title">Menu Highlights</h2><div class="rch-menu-grid">${cards}</div><p style="font-size:.8125rem;color:var(--ww-text-muted);margin-top:.75rem">Prices in Naira (₦). Full menu via WhatsApp. Payment: Paystack, bank transfer, POS or cash. VAT inclusive.</p></section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const address = (ctx.data.address as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I want to order food or make a reservation. Please advise.');
  return `<section class="rch-section"><h2 class="rch-section-title">Dine In or Order</h2>
    <div class="rch-contact-box">
      ${address ? `<div class="rch-contact-row"><span class="rch-contact-label">Location</span><span>${esc(address)}</span></div>` : ''}
      ${phone ? `<div class="rch-contact-row"><span class="rch-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : ''}
      ${email ? `<div class="rch-contact-row"><span class="rch-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
      ${wa ? `<div class="rch-contact-row"><span class="rch-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">${waSvg()} Order via WhatsApp</a></div>` : ''}
    </div>
    <p style="font-size:.75rem;color:var(--ww-text-muted);margin-top:1rem">NAFDAC Registered. LHAID Compliant. HACCP Kitchen Standards. Your data handled under NDPR.</p>
  </section>`;
}

function renderPage(ctx: WebsiteRenderContext): string {
  return CSS + buildHero(ctx) + buildMenu(ctx) + buildContact(ctx);
}

export const restaurantChainRestaurantChainOutletTemplate: WebsiteTemplateContract = {
  slug: 'restaurant-chain-restaurant-chain-outlet',
  version: '1.0.0',
  pages: ['home'],
  renderPage,
};
