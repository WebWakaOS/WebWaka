/**
 * Printing & Branding Shop — Pillar 2 Website Template
 * Slug: print-shop-print-branding-shop
 * Vertical: print-shop (priority=2)
 * Category: commerce
 * Nigeria-First Priority: high
 * Regulatory signals: CAC, APCON (branding/advertising), SON (ink standards)
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need printing services. Can you send me your price list?')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.prt-hero{text-align:center;padding:3rem 0 2.25rem}
.prt-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.prt-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.prt-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.prt-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.prt-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.prt-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.prt-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.prt-section{margin-top:2.75rem}
.prt-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.prt-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
.prt-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.prt-card-icon{font-size:1.75rem;margin-bottom:.5rem}
.prt-card-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.prt-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.prt-price-row{display:flex;justify-content:space-between;padding:.75rem 1rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);background:var(--ww-surface);font-size:.9375rem;margin-bottom:.5rem}
.prt-price-val{font-weight:700;color:var(--ww-primary)}
.prt-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.prt-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.prt-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
  const logoUrl = ctx.logoUrl;
  const phone = (ctx.data.phone as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need printing services. Please send your price list.');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="prt-logo">` : '';
  return `<section class="prt-hero">
    ${logoHtml}
    <div class="prt-badge">🖨 Print · Brand · Deliver</div>
    <h1>${esc(name)}</h1>
    <p class="prt-tagline">${esc(tagline ?? 'One-stop printing & branding shop — business cards, banners, flyers, T-shirts, branded merchandise and vehicle wraps across Nigeria.')}</p>
    <div class="prt-ctas">
      ${wa ? `<a href="${wa}" class="prt-wa-btn" target="_blank" rel="noopener">${waSvg()} Send Design/Order</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="prt-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildServices(_ctx: WebsiteRenderContext): string {
  const svcs = [
    {icon:'💼',name:'Business Cards',desc:'Single/double-sided, gloss, matte or spot UV. 250 cards from ₦5,000.'},
    {icon:'🚩',name:'Banners & Flexes',desc:'Outdoor and indoor banners, rollup stands, pop-up backdrops and billboards.'},
    {icon:'📄',name:'Flyers & Brochures',desc:'A4/A5/A6 flyers, tri-fold and bi-fold brochures, corporate proposals.'},
    {icon:'👕',name:'Custom T-Shirts',desc:'DTG and screen printing on cotton tees, polos, hoodies and caps.'},
    {icon:'🚗',name:'Vehicle Branding',desc:'Fleet graphics, window decals, reflective livery and motorcycle branding.'},
    {icon:'📦',name:'Branded Merchandise',desc:'Custom mugs, pens, notepad, bags, face caps and gift items.'},
  ];
  const cards = svcs.map(s=>`<div class="prt-card"><div class="prt-card-icon">${s.icon}</div><div class="prt-card-name">${s.name}</div><div class="prt-card-desc">${s.desc}</div></div>`).join('');
  return `<section class="prt-section"><h2 class="prt-section-title">What We Print</h2><div class="prt-grid">${cards}</div></section>`;
}

function buildPricing(_ctx: WebsiteRenderContext): string {
  const items = [
    ['Business Cards (250 pcs)','₦5,000 – ₦12,000'],
    ['A4 Flyers (100 pcs)','₦8,000 – ₦15,000'],
    ['Roll-up Banner (85×200cm)','₦18,000 – ₦30,000'],
    ['Custom T-Shirts (per unit)','₦3,500 – ₦6,000'],
    ['Vehicle Graphics (basic)','₦35,000+'],
  ];
  const rows = items.map(([n,p])=>`<div class="prt-price-row"><span>${n}</span><span class="prt-price-val">${p}</span></div>`).join('');
  return `<section class="prt-section"><h2 class="prt-section-title">Price Guide</h2>${rows}<p style="font-size:.8125rem;color:var(--ww-text-muted);margin-top:.5rem">Prices in Naira (₦). Design included. Files accepted: AI, CDR, PDF, PNG (300 DPI). Payment via Paystack, bank transfer or POS.</p></section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const address = (ctx.data.address as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I want to place a print order. Please advise.');
  return `<section class="prt-section"><h2 class="prt-section-title">Place Your Order</h2>
    <div class="prt-contact-box">
      ${address ? `<div class="prt-contact-row"><span class="prt-contact-label">Address</span><span>${esc(address)}</span></div>` : ''}
      ${phone ? `<div class="prt-contact-row"><span class="prt-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : ''}
      ${email ? `<div class="prt-contact-row"><span class="prt-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
      ${wa ? `<div class="prt-contact-row"><span class="prt-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">${waSvg()} Send Design</a></div>` : ''}
    </div>
    <p style="font-size:.75rem;color:var(--ww-text-muted);margin-top:1rem">CAC Registered. Your data is handled under the Nigeria Data Protection Regulation (NDPR).</p>
  </section>`;
}

function renderPage(ctx: WebsiteRenderContext): string {
  return CSS + buildHero(ctx) + buildServices(ctx) + buildPricing(ctx) + buildContact(ctx);
}

export const printShopPrintBrandingShopTemplate: WebsiteTemplateContract = {
  slug: 'print-shop-print-branding-shop',
  version: '1.0.0',
  pages: ['home'],
  renderPage,
};
