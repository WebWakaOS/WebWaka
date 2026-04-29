/**
 * Palm Oil Producer / Trader Site — Pillar 3 Website Template
 * Niche ID: P3-palm-oil-trader-palm-oil-trader-site
 * Vertical: palm-oil-trader (priority=3, critical)
 * Category: agricultural
 * Family: NF-AGR-COM (anchor)
 * Research brief: docs/templates/research/palm-oil-trader-palm-oil-trader-site-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: NAFDAC (food processing/export), NADP/NEXIM (export), FMARD, SON
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtKobo(k: number): string { return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`; }
function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to order palm oil.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ } return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.po-hero{text-align:center;padding:2.75rem 0 2rem}
.po-logo{height:80px;width:80px;object-fit:contain;border-radius:12px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.po-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.po-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.po-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.po-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.po-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.po-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.po-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.po-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.po-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.po-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.po-product-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));margin-top:1.5rem}
.po-product-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.po-product-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.po-product-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.po-product-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.po-origin-strip{margin-top:1.75rem;padding:1.125rem 1.375rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.po-origin-strip h3{font-size:.9375rem;font-weight:700;margin:0;flex-shrink:0}
.po-state-chips{display:flex;flex-wrap:wrap;gap:.375rem}
.po-state{padding:.275rem .7rem;border-radius:999px;font-size:.78rem;font-weight:600;background:var(--ww-primary);color:#fff}
.po-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.po-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.po-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.po-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.po-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.po-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.po-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.po-strip-item{display:flex;flex-direction:column;gap:.2rem}
.po-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.po-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.po-strip-value a{color:var(--ww-primary)}
.po-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.po-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.po-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.po-contact-layout{grid-template-columns:1fr 1fr}}
.po-contact-info h2,.po-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.po-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.po-contact-info a{color:var(--ww-primary);font-weight:600}
.po-form{display:flex;flex-direction:column;gap:.875rem}
.po-form-group{display:flex;flex-direction:column;gap:.375rem}
.po-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.po-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.po-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.po-textarea{min-height:100px;resize:vertical}
.po-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.po-ndpr a{color:var(--ww-primary)}
.po-ndpr-check{display:flex;align-items:flex-start;gap:.5rem;margin-top:.5rem}
.po-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.po-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.po-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.po-submit:hover{filter:brightness(1.1)}
.po-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.po-success h3{font-weight:700;margin-bottom:.25rem}
.po-about-hero{text-align:center;padding:2.5rem 0 2rem}
.po-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.po-about-body{max-width:44rem;margin:0 auto}
.po-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:1.5rem;font-size:1rem}
.po-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.po-detail-row{display:flex;gap:1rem;align-items:flex-start}
.po-detail-label{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.po-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.po-detail-value a{color:var(--ww-primary);font-weight:600}
.po-services-hero{text-align:center;padding:2.5rem 0 2rem}
.po-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.po-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.po-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.po-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.po-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.po-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.po-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.po-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.po-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.po-ctas{flex-direction:column;align-items:stretch}.po-primary-btn,.po-sec-btn,.po-wa-btn{width:100%;justify-content:center}}
</style>`;

const ORIGIN_STATES = ['Edo','Delta','Imo','Rivers','Cross River','Ondo'];
type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const nafdacNo = (ctx.data.nafdacNumber as string | null) ?? null;
  const featured = offerings.slice(0,4);
  const waHref = whatsappLink(phone, `Hello! I would like to order palm oil from ${ctx.displayName}. Please share your current prices and available quantities.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="po-hero">
  ${ctx.logoUrl ? `<img class="po-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="po-cat-badge">🌴 Palm Oil Trader</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="po-tagline">${esc(tagline ?? `Pure Nigerian palm oil — red CPO, palm kernel oil &amp; bulk supply. NAFDAC registered.${nafdacNo ? ` No. ${nafdacNo}.` : ''}`)}</p>
  <div class="po-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="po-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}
    <a class="po-sec-btn" href="/services">View Prices</a>
    <a class="po-sec-btn" href="/contact">Contact Us</a>
  </div>
</section>
${featured.length > 0 ? `
<section style="margin-top:1.75rem">
  <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.875rem;color:var(--ww-primary)">Products &amp; Prices</h2>
  <div class="po-product-grid">
    ${featured.map(o => `<div class="po-product-card"><h3 class="po-product-name">${esc(o.name)}</h3>${o.description ? `<p class="po-product-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="po-product-price">Price on request</span>` : `<span class="po-product-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}
  </div>
</section>` : ''}
<div class="po-origin-strip">
  <h3>Sourced from:</h3>
  <div class="po-state-chips">${ORIGIN_STATES.map(s => `<span class="po-state">${esc(s)}</span>`).join('')}</div>
</div>
<div class="po-trust-strip">
  <span class="po-badge"><span class="po-dot"></span> NAFDAC Registered</span>
  <span class="po-badge"><span class="po-dot"></span> NADP Certified</span>
  <span class="po-badge"><span class="po-dot"></span> FMARD Compliant</span>
  <span class="po-badge"><span class="po-dot"></span> CAC Registered</span>
</div>
${bioExcerpt ? `<div class="po-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bioExcerpt)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a></div>` : ''}
${(phone || placeName) ? `<div class="po-contact-strip">
  ${placeName ? `<div class="po-strip-item"><span class="po-strip-label">Location</span><span class="po-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="po-strip-item"><span class="po-strip-label">Order Line</span><span class="po-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="po-strip-item"><span class="po-strip-label">Payment</span><span class="po-strip-value">Bank Transfer · Paystack · POS</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const nafdacNo = (ctx.data.nafdacNumber as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to place a palm oil order with ${ctx.displayName}.`);
  return `${CSS}
<section class="po-about-hero"><h1>About ${esc(ctx.displayName)}</h1><p style="color:var(--ww-text-muted);margin-top:.5rem">Pure Nigerian Palm Oil — Traceable from Source</p></section>
<div class="po-about-body">
  <p class="po-about-desc">${esc(description ?? `${ctx.displayName} is a NAFDAC-registered palm oil aggregator and trader sourcing premium crude palm oil (CPO) and palm kernel oil (PKO) from mills in Edo, Delta, Imo, Rivers, and Cross River states. We supply retail, wholesale, and export quantities with consistent quality and transparent pricing.`)}</p>
  <div class="po-detail-list">
    ${placeName ? `<div class="po-detail-row"><span class="po-detail-label">Location</span><span class="po-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="po-detail-row"><span class="po-detail-label">Order Line</span><span class="po-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="po-detail-row"><span class="po-detail-label">Email</span><span class="po-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    ${nafdacNo ? `<div class="po-detail-row"><span class="po-detail-label">NAFDAC No.</span><span class="po-detail-value">${esc(nafdacNo)}</span></div>` : '<div class="po-detail-row"><span class="po-detail-label">Compliance</span><span class="po-detail-value">NAFDAC Registered &amp; NADP Certified</span></div>'}
    <div class="po-detail-row"><span class="po-detail-label">Source States</span><span class="po-detail-value">Edo, Delta, Imo, Rivers, Cross River</span></div>
    <div class="po-detail-row"><span class="po-detail-label">Payment</span><span class="po-detail-value">Bank Transfer, Paystack, POS</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="po-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}
    <a class="po-primary-btn" href="/services">View Prices</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I want to order palm oil from ${ctx.displayName}. Please share your full price list.`);
  const defaultProducts = [
    {name:'Crude Palm Oil (CPO) — Retail',desc:'Per litre, 5-litre and 10-litre containers. Fresh from mill. Orange-red colour.',price:'₦4,500–₦6,500 / litre'},
    {name:'CPO — 25-Litre Drum (Wholesale)',desc:'25-litre yellow jerrican. Wholesale pricing. Delivery available.',price:'₦80,000–₦150,000 / drum'},
    {name:'CPO — 200-Litre Industrial Drum',desc:'Industrial quantity for food processors, soap manufacturers, hotels.',price:'Contact for quote'},
    {name:'Palm Kernel Oil (PKO)',desc:'Pure palm kernel oil. Per litre or wholesale drum. Food and cosmetic grade.',price:'Contact for price'},
    {name:'Bulk / Tanker Supply',desc:'Metric-tonne supply for large industrial buyers. NAFDAC certified.',price:'Contact for bulk quote'},
    {name:'Export Supply',desc:'Export-grade CPO/PKO. NADP/NEXIM certified. Minimum 5MT.',price:'Contact for export quote'},
  ];
  const grid = offerings.length === 0
    ? `<div class="po-product-grid">${defaultProducts.map(p => `<div class="po-product-card"><h3 class="po-product-name">${esc(p.name)}</h3><p class="po-product-desc">${esc(p.desc)}</p><span class="po-product-price">${esc(p.price)}</span></div>`).join('')}</div>`
    : `<div class="po-product-grid">${offerings.map(o => `<div class="po-product-card"><h3 class="po-product-name">${esc(o.name)}</h3>${o.description ? `<p class="po-product-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="po-product-price">Price on request</span>` : `<span class="po-product-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="po-services-hero"><h1>Products &amp; Pricing</h1><p class="po-services-sub">All prices in ₦ (Naira) — retail, wholesale &amp; export available</p></section>
<section>${grid}</section>
<div class="po-cta-strip"><h3>Ready to order?</h3><p>WhatsApp us to place your order or request a bulk quote. We deliver to Lagos, Abuja, Enugu, Port Harcourt, and more.</p>
<div class="po-btn-row">${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="po-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}<a class="po-sec-btn" href="/contact">Contact Us</a></div></div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to order palm oil from ${ctx.displayName}. Please share your current prices and available quantities.`);
  return `${CSS}
<section class="po-contact-hero"><h1>Order &amp; Enquiries</h1><p>Place your palm oil order at ${esc(ctx.displayName)} — retail, wholesale, or export.</p></section>
${waHref ? `<div class="po-wa-block"><p>WhatsApp us to place your order or get a bulk quote. We respond same day.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="po-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Order via WhatsApp</a></div>` : ''}
<div class="po-contact-layout">
  <div class="po-contact-info">
    <h2>Our Location</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Order Line:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Bank Transfer · Paystack · POS</p>
    <p style="margin-top:.5rem;font-size:.875rem;color:var(--ww-text-muted)">Delivery to Lagos, Abuja, Enugu, Port Harcourt &amp; more</p>
  </div>
  <div class="po-form-wrapper">
    <h2>Send an Order Enquiry</h2>
    <form class="po-form" method="POST" action="/contact" id="poContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="po-form-group"><label for="po-name">Your name</label><input id="po-name" name="name" type="text" required autocomplete="name" class="po-input" placeholder="e.g. Chinedu Obi" /></div>
      <div class="po-form-group"><label for="po-phone">Phone / WhatsApp</label><input id="po-phone" name="phone" type="tel" autocomplete="tel" class="po-input" placeholder="0803 000 0000" /></div>
      <div class="po-form-group"><label for="po-msg">What would you like to order?</label><textarea id="po-msg" name="message" required rows="4" class="po-input po-textarea" placeholder="e.g. I need 10 drums (25L) of red palm oil delivered to Lagos monthly. Please quote."></textarea></div>
      <div class="po-ndpr"><strong>Privacy notice (NDPR):</strong> Your details are used only to process your order enquiry. <a href="/privacy">Privacy Policy</a>.<div class="po-ndpr-check"><input type="checkbox" id="po-consent" name="ndpr_consent" value="yes" required /><label for="po-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="po-submit">Send Enquiry</button>
    </form>
    <div id="poContactSuccess" class="po-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will contact you with pricing and delivery details shortly. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('poContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('poContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const palmOilTraderPalmOilTraderSiteTemplate: WebsiteTemplateContract = {
  slug: 'palm-oil-trader-palm-oil-trader-site',
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
