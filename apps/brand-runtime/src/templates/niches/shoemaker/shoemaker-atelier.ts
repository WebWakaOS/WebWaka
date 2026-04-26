/**
 * Shoe Cobbler / Shoe Maker Atelier Site — Pillar 3 Website Template
 * Niche ID: P3-shoemaker-shoemaker-atelier
 * Vertical: shoemaker (priority=3, high)
 * Category: commerce/fashion
 * Family: NF-COM-FSH (standalone)
 * Research brief: docs/templates/research/shoemaker-shoemaker-atelier-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: Aba shoemakers cooperative, SON, CAC, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function fmtKobo(k: number): string {
  return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
}

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to order custom shoes or a shoe repair.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.skm-hero{text-align:center;padding:3rem 0 2.25rem}
.skm-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.skm-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.skm-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.skm-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.skm-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.skm-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.skm-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.skm-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.skm-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.skm-section{margin-top:2.75rem}
.skm-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.skm-catalogue-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.skm-item-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);overflow:hidden;background:var(--ww-surface)}
.skm-item-img{width:100%;height:160px;object-fit:cover;background:var(--ww-border)}
.skm-item-body{padding:1rem}
.skm-item-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.skm-item-price{font-size:1rem;font-weight:700;color:var(--ww-primary)}
.skm-item-desc{font-size:.8rem;color:var(--ww-text-muted);margin-top:.25rem}
.skm-services-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:.6rem}
.skm-svc-item{display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);background:var(--ww-surface);font-size:.9375rem}
.skm-svc-name-cell{font-weight:600}
.skm-svc-price-cell{font-weight:700;color:var(--ww-primary)}
.skm-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.skm-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.skm-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.skm-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
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
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="skm-logo">` : '';
  return `<section class="skm-hero">
    ${logoHtml}
    <div class="skm-badge">👟 Aba-Trained Craftsmen · Bespoke Made</div>
    <h1>${esc(name)}</h1>
    <p class="skm-tagline">${esc(tagline ?? 'Bespoke shoe making & expert cobbling — Aba-trained craftsmen. Custom designs, repairs & corporate supply.')}</p>
    <div class="skm-ctas">
      ${wa ? `<a href="${wa}" class="skm-wa-btn" target="_blank" rel="noopener">${waSvg()} Order on WhatsApp</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="skm-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildCatalogue(ctx: WebsiteRenderContext): string {
  type CatItem = {name:string;price?:number;priceKobo?:number;description?:string;imageUrl?:string};
  const products = (ctx.data.products as unknown[] | undefined) as CatItem[] | undefined;
  const defaults: CatItem[] = [
    {name:'Oxford Brogues (Bespoke)',priceKobo:2500000,description:'Full-grain leather, Goodyear welt, last fitted to your measurements.'},
    {name:'Agbada Wedding Slippers',priceKobo:1500000,description:'Embroidered aso-oke fabric uppers, traditional Yoruba design.'},
    {name:'Corporate Loafers',priceKobo:2000000,description:'Supple calf leather, cushioned insole. Office-ready, Lagos-approved.'},
    {name:'Ankara Sneakers',priceKobo:1800000,description:'West African ankara-print canvas sneakers. Afrocentric streetwear.'},
  ];
  const list = (products && products.length > 0) ? products.slice(0,4) : defaults;
  const cards = list.map(p => {
    const displayPrice = p.priceKobo != null ? fmtKobo(p.priceKobo) : p.price != null ? fmtKobo(p.price*100) : null;
    const imgHtml = p.imageUrl ? `<img src="${safeHref(p.imageUrl)}" alt="${esc(p.name)}" class="skm-item-img">` : '<div class="skm-item-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem">👟</div>';
    return `<div class="skm-item-card">
      ${imgHtml}
      <div class="skm-item-body">
        <div class="skm-item-name">${esc(p.name)}</div>
        ${displayPrice ? `<div class="skm-item-price">${displayPrice}</div>` : ''}
        ${p.description ? `<div class="skm-item-desc">${esc(p.description)}</div>` : ''}
      </div>
    </div>`;
  }).join('');
  return `<section class="skm-section">
    <h2 class="skm-section-title">Bespoke Catalogue</h2>
    <div class="skm-catalogue-grid">${cards}</div>
  </section>`;
}

function buildRepairs(ctx: WebsiteRenderContext): string {
  const repairs = (ctx as unknown as Record<string,unknown>)['repairServices'] as {name:string;price:string}[] | undefined;
  const list = repairs && repairs.length > 0 ? repairs : [
    {name:'Full Sole Replacement',price:'From ₦3,500'},
    {name:'Heel Replacement',price:'From ₦1,500'},
    {name:'Upper Stitching Repair',price:'From ₦2,000'},
    {name:'Shoe Stretching',price:'From ₦1,000'},
    {name:'Leather Polish & Conditioning',price:'From ₦800'},
    {name:'Zipper Replacement',price:'From ₦2,500'},
  ];
  const items = list.map(r => `
    <li class="skm-svc-item">
      <span class="skm-svc-name-cell">${esc(r.name)}</span>
      <span class="skm-svc-price-cell">${esc(r.price)}</span>
    </li>`).join('');
  return `<section class="skm-section">
    <h2 class="skm-section-title">Repair & Cobbling Services</h2>
    <ul class="skm-services-list">${items}</ul>
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
    phone ? `<div class="skm-contact-row"><span class="skm-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="skm-contact-row"><span class="skm-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="skm-contact-row"><span class="skm-contact-label">Workshop</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="skm-contact-row"><span class="skm-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Order on WhatsApp</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="skm-section">
    <h2 class="skm-section-title">Contact & Orders</h2>
    <div class="skm-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="skm-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Bespoke Shoemaker, Nigeria.<br>
    Aba Craft Heritage &bull; CAC Registered &bull; NDPR Compliant
  </footer>`;
}

export const shoemakerShoemakerAtelierTemplate: WebsiteTemplateContract = {
  slug: 'shoemaker-shoemaker-atelier',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildCatalogue(ctx), buildRepairs(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
