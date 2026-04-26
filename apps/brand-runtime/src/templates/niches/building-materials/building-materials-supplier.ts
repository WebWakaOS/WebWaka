/**
 * Building Materials Supplier Site — Pillar 3 Website Template
 * Niche ID: P3-building-materials-building-materials-supplier
 * Vertical: building-materials (priority=3, critical)
 * Category: commerce
 * Family: NF-COM-CON (anchor — variant: iron-steel)
 * Research brief: docs/templates/research/building-materials-building-materials-supplier-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: SON (cement/iron certification), SURCON (structural advisory), FIRS TIN
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtKobo(k: number): string { return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`; }
function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like a building materials quote.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ } return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.bm-hero{text-align:center;padding:2.75rem 0 2rem}
.bm-logo{height:80px;width:80px;object-fit:contain;border-radius:10px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.bm-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.bm-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.bm-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.bm-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.bm-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.bm-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.bm-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.bm-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.bm-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.bm-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.bm-category-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));margin-top:1.5rem}
.bm-category-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.bm-category-icon{font-size:1.75rem;margin-bottom:.375rem}
.bm-category-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.bm-category-brands{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.55}
.bm-category-price{font-size:.9375rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.bm-product-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.bm-product-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.bm-product-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.bm-product-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.bm-product-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.bm-brands-row{margin-top:2rem;padding:1.125rem 1.375rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.bm-brands-row h3{font-size:.9375rem;font-weight:700;margin-bottom:.625rem}
.bm-brand-chips{display:flex;flex-wrap:wrap;gap:.375rem}
.bm-brand{padding:.3rem .75rem;border-radius:999px;font-size:.8125rem;font-weight:600;background:var(--ww-primary);color:#fff}
.bm-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.bm-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.bm-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.bm-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.bm-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.bm-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.bm-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.bm-strip-item{display:flex;flex-direction:column;gap:.2rem}
.bm-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.bm-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.bm-strip-value a{color:var(--ww-primary)}
.bm-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.bm-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.bm-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.bm-contact-layout{grid-template-columns:1fr 1fr}}
.bm-contact-info h2,.bm-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.bm-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.bm-contact-info a{color:var(--ww-primary);font-weight:600}
.bm-form{display:flex;flex-direction:column;gap:.875rem}
.bm-form-group{display:flex;flex-direction:column;gap:.375rem}
.bm-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.bm-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.bm-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.bm-textarea{min-height:100px;resize:vertical}
.bm-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.bm-ndpr a{color:var(--ww-primary)}
.bm-ndpr-check{display:flex;align-items:flex-start;gap:.5rem;margin-top:.5rem}
.bm-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.bm-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.bm-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.bm-submit:hover{filter:brightness(1.1)}
.bm-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.bm-success h3{font-weight:700;margin-bottom:.25rem}
.bm-about-hero{text-align:center;padding:2.5rem 0 2rem}
.bm-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.bm-about-body{max-width:44rem;margin:0 auto}
.bm-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:1.5rem;font-size:1rem}
.bm-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.bm-detail-row{display:flex;gap:1rem;align-items:flex-start}
.bm-detail-label{font-size:.875rem;font-weight:700;min-width:9rem;color:var(--ww-text);flex-shrink:0}
.bm-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.bm-detail-value a{color:var(--ww-primary);font-weight:600}
.bm-services-hero{text-align:center;padding:2.5rem 0 2rem}
.bm-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.bm-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.bm-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.bm-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.bm-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.bm-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.bm-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.bm-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.bm-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.bm-ctas{flex-direction:column;align-items:stretch}.bm-primary-btn,.bm-sec-btn,.bm-wa-btn{width:100%;justify-content:center}}
</style>`;

const BRANDS = ['Dangote Cement','BUA Cement','Unicem','Ibeto Cement','Nigerian Eagle','Alrodo','Afe Iron Rods','MIDROC'];
const CATEGORIES = [
  {icon:'🏗️',name:'Cement',brands:'Dangote, BUA, Unicem, Ibeto',price:'From ₦8,500/bag'},
  {icon:'🔩',name:'Iron Rods (TMT)',brands:'12mm–25mm, Y-bars. MIDROC, Afe, Alrodo.',price:'From ₦18,000/length'},
  {icon:'🧱',name:'Blocks',brands:'6-inch, 9-inch. Hand-moulded &amp; vibrated.',price:'From ₦350/block'},
  {icon:'🏠',name:'Roofing Sheets',brands:'Long span aluminum. Step tiles. Corrugated iron.',price:'From ₦3,800/sheet'},
  {icon:'🪵',name:'Tiles &amp; Flooring',brands:'Ceramic, porcelain. Italian &amp; local brands.',price:'Contact for quote'},
  {icon:'🔧',name:'Plumbing Materials',brands:'Pipes, fittings, tanks. Triton, Reno, Prince.',price:'Contact for quote'},
];
type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like a building materials quote from ${ctx.displayName}. Please share your current prices.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="bm-hero">
  ${ctx.logoUrl ? `<img class="bm-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="bm-cat-badge">🏗️ Building Materials</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="bm-tagline">${esc(tagline ?? `Your trusted building materials partner${placeName ? ` in ${placeName}` : ''}. Cement, iron rods, blocks, roofing &amp; more. SON-certified brands.`)}</p>
  <div class="bm-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="bm-wa-btn">${waSvg()} Get a Bulk Quote</a>` : ''}
    <a class="bm-primary-btn" href="/services">View Prices</a>
    <a class="bm-sec-btn" href="/contact">Visit Warehouse</a>
  </div>
</section>
<section style="margin-top:2rem">
  <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.875rem;color:var(--ww-primary)">Product Categories</h2>
  <div class="bm-category-grid">
    ${(offerings.length === 0 ? CATEGORIES.map(c => `<div class="bm-category-card"><div class="bm-category-icon">${c.icon}</div><div class="bm-category-name">${c.name}</div><div class="bm-category-brands">${c.brands}</div><div class="bm-category-price">${c.price}</div></div>`) : offerings.slice(0,6).map(o => `<div class="bm-category-card"><div class="bm-product-name">${esc(o.name)}</div><div class="bm-category-brands">${o.description ? esc(o.description) : ''}</div><div class="bm-category-price">${o.priceKobo === null ? 'Contact for price' : fmtKobo(o.priceKobo)}</div></div>`)).join('')}
  </div>
</section>
<div class="bm-brands-row">
  <h3>Brands We Stock</h3>
  <div class="bm-brand-chips">${BRANDS.map(b => `<span class="bm-brand">${esc(b)}</span>`).join('')}</div>
</div>
<div class="bm-trust-strip">
  <span class="bm-badge"><span class="bm-dot"></span> SON Certified Brands</span>
  <span class="bm-badge"><span class="bm-dot"></span> FIRS TIN for VAT Invoicing</span>
  <span class="bm-badge"><span class="bm-dot"></span> CAC Registered</span>
  <span class="bm-badge"><span class="bm-dot"></span> Site Delivery Available</span>
</div>
${bioExcerpt ? `<div class="bm-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bioExcerpt)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a></div>` : ''}
${(phone || placeName) ? `<div class="bm-contact-strip">
  ${placeName ? `<div class="bm-strip-item"><span class="bm-strip-label">Warehouse</span><span class="bm-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="bm-strip-item"><span class="bm-strip-label">Order Line</span><span class="bm-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="bm-strip-item"><span class="bm-strip-label">Payment</span><span class="bm-strip-value">Bank Transfer · Paystack · Cheque (Corporate)</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like a building materials quote from ${ctx.displayName}.`);
  return `${CSS}
<section class="bm-about-hero"><h1>About ${esc(ctx.displayName)}</h1><p style="color:var(--ww-text-muted);margin-top:.5rem">Strong Materials. Strong Foundations.</p></section>
<div class="bm-about-body">
  <p class="bm-about-desc">${esc(description ?? `${ctx.displayName} is a trusted building materials supplier stocking SON-certified cement (Dangote, BUA, Unicem), iron rods, blocks, roofing sheets, tiles, and plumbing materials. We serve individual builders, housing developers, and contractors across Nigeria with competitive bulk pricing and delivery to site.`)}</p>
  <div class="bm-detail-list">
    ${placeName ? `<div class="bm-detail-row"><span class="bm-detail-label">Warehouse</span><span class="bm-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="bm-detail-row"><span class="bm-detail-label">Order Line</span><span class="bm-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="bm-detail-row"><span class="bm-detail-label">Email</span><span class="bm-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="bm-detail-row"><span class="bm-detail-label">Compliance</span><span class="bm-detail-value">SON-certified brands only · FIRS TIN for VAT invoicing</span></div>
    <div class="bm-detail-row"><span class="bm-detail-label">Delivery</span><span class="bm-detail-value">Site delivery available — Lagos, Abuja, Onitsha &amp; more</span></div>
    <div class="bm-detail-row"><span class="bm-detail-label">Payment</span><span class="bm-detail-value">Bank Transfer, Paystack, Cheque (corporate clients)</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="bm-wa-btn">${waSvg()} Get a Bulk Quote</a>` : ''}
    <a class="bm-primary-btn" href="/services">View Prices</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I need a bulk quote from ${ctx.displayName} for my construction project.`);
  const defaultProducts = [
    {name:'Dangote Cement (42.5N)',desc:'50kg bag. SON-certified. Suitable for all concrete and masonry work.',price:'From ₦8,500/bag'},
    {name:'BUA Cement (32.5R)',desc:'50kg bag. SON-certified. Ideal for blocks, plastering, and light construction.',price:'From ₦8,000/bag'},
    {name:'Iron Rod (12mm Y-bar, 12m)',desc:'TMT deformed bar. SON-certified. For reinforced concrete structures.',price:'From ₦18,000/length'},
    {name:'Iron Rod (16mm Y-bar, 12m)',desc:'Heavy-duty TMT. For columns, beams, slabs. SON-certified.',price:'From ₦32,000/length'},
    {name:'6-inch Sandcrete Block',desc:'Machine-vibrated. 450 x 225 x 150mm. Strong and precise dimensions.',price:'From ₦350/block'},
    {name:'Long Span Roofing Sheet (0.55mm)',desc:'Aluminium-zinc coated. 1m coverage width. Various lengths available.',price:'From ₦3,800/sheet'},
    {name:'Ceramic Floor Tiles (60x60)',desc:'Various designs. Local and imported brands. Suitable for residential.',price:'Contact for price'},
    {name:'HDPE Water Pipes (110mm)',desc:'High-density polyethylene pipes. Drainage and water supply.',price:'Contact for price'},
  ];
  const grid = offerings.length === 0
    ? `<div class="bm-product-grid">${defaultProducts.map(p => `<div class="bm-product-card"><h3 class="bm-product-name">${esc(p.name)}</h3><p class="bm-product-desc">${esc(p.desc)}</p><span class="bm-product-price">${esc(p.price)}</span></div>`).join('')}</div>`
    : `<div class="bm-product-grid">${offerings.map(o => `<div class="bm-product-card"><h3 class="bm-product-name">${esc(o.name)}</h3>${o.description ? `<p class="bm-product-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="bm-product-price">Contact for price</span>` : `<span class="bm-product-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="bm-services-hero"><h1>Products &amp; Prices</h1><p class="bm-services-sub">All prices in ₦ (Naira) — bulk discounts available · SON-certified brands</p></section>
<section>${grid}</section>
<div class="bm-cta-strip"><h3>Need a bulk quote?</h3><p>WhatsApp us with your bill of quantities or project scope. We'll provide a competitive bulk price and delivery arrangement within 24 hours.</p>
<div class="bm-btn-row">${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="bm-wa-btn">${waSvg()} Get Bulk Quote via WhatsApp</a>` : ''}<a class="bm-sec-btn" href="/contact">Visit Warehouse</a></div></div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I need a building materials quote from ${ctx.displayName} for my construction project. Please share your current prices.`);
  return `${CSS}
<section class="bm-contact-hero"><h1>Get a Quote</h1><p>Contact ${esc(ctx.displayName)} for building materials pricing, bulk quotes, and site delivery.</p></section>
${waHref ? `<div class="bm-wa-block"><p>WhatsApp us your bill of quantities or materials list for a competitive bulk quote within 24 hours.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="bm-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Get a Quote via WhatsApp</a></div>` : ''}
<div class="bm-contact-layout">
  <div class="bm-contact-info">
    <h2>Our Warehouse</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Order Line:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Warehouse details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Bank Transfer · Paystack · Cheque (Corporate)</p>
    <p style="margin-top:.5rem;font-size:.875rem;color:var(--ww-text-muted)">Corporate invoicing with VAT (FIRS TIN available)</p>
    <p style="margin-top:.5rem;font-size:.875rem;color:var(--ww-text-muted)">Delivery to Lagos, Abuja, Onitsha, Nnewi &amp; more</p>
  </div>
  <div class="bm-form-wrapper">
    <h2>Request a Quote</h2>
    <form class="bm-form" method="POST" action="/contact" id="bmContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="bm-form-group"><label for="bm-name">Your name</label><input id="bm-name" name="name" type="text" required autocomplete="name" class="bm-input" placeholder="e.g. Eze Okeke" /></div>
      <div class="bm-form-group"><label for="bm-phone">Phone / WhatsApp</label><input id="bm-phone" name="phone" type="tel" autocomplete="tel" class="bm-input" placeholder="0803 000 0000" /></div>
      <div class="bm-form-group"><label for="bm-company">Company / Project name</label><input id="bm-company" name="company" type="text" class="bm-input" placeholder="e.g. ABC Properties Ltd (optional)" /></div>
      <div class="bm-form-group"><label for="bm-msg">Materials needed &amp; quantities</label><textarea id="bm-msg" name="message" required rows="4" class="bm-input bm-textarea" placeholder="e.g. 200 bags Dangote cement, 100 lengths 12mm iron rod, 500 6-inch blocks. Delivery to Nnewi."></textarea></div>
      <div class="bm-ndpr"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your quote request. <a href="/privacy">Privacy Policy</a>.<div class="bm-ndpr-check"><input type="checkbox" id="bm-consent" name="ndpr_consent" value="yes" required /><label for="bm-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="bm-submit">Request Quote</button>
    </form>
    <div id="bmContactSuccess" class="bm-success" style="display:none" role="status" aria-live="polite"><h3>Quote request received!</h3><p>We will send you a competitive price within 24 hours. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('bmContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('bmContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const buildingMaterialsBuildingMaterialsSupplierTemplate: WebsiteTemplateContract = {
  slug: 'building-materials-building-materials-supplier',
  version: '1.0.0',
  pages: ['home','about','services','contact'],
  renderPage(ctx: WebsiteRenderContext): string {
    try {
      switch(ctx.pageType) {
        case 'home': return renderHome(ctx);
        case 'about': return renderAbout(ctx);
        case 'services': return renderServices(ctx);
        case 'contact': return renderContact(ctx);
        default: return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
      }
    } catch { return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Unable to load page.</p>`; }
  },
};
