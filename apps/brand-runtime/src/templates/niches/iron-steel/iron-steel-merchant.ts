/**
 * Iron & Steel / Roofing Merchant Site — Pillar 3 Website Template
 * Niche ID: P3-iron-steel-iron-steel-merchant
 * Vertical: iron-steel (priority=3, high)
 * Category: commerce/construction
 * Family: NF-COM-CON (variant of building-materials)
 * Research brief: docs/templates/research/iron-steel-iron-steel-merchant-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: SON conformity, CAC, FIRS TIN for VAT dealers
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need a quote for iron rods / roofing sheets. Can you help?')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.ism-hero{text-align:center;padding:2.75rem 0 2rem}
.ism-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.ism-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.ism-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.ism-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.ism-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ism-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ism-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ism-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ism-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ism-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.ism-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ism-section{margin-top:2.75rem}
.ism-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ism-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.ism-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.ism-item-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.ism-item-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.ism-item-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.ism-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ism-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ism-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ism-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ism-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ism-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ism-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.ism-strip-item{display:flex;flex-direction:column;gap:.2rem}
.ism-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ism-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ism-strip-value a{color:var(--ww-primary)}
.ism-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ism-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ism-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ism-contact-layout{grid-template-columns:1fr 1fr}}
.ism-contact-info h2,.ism-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ism-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ism-contact-info a{color:var(--ww-primary);font-weight:600}
.ism-form{display:flex;flex-direction:column;gap:.875rem}
.ism-form-group{display:flex;flex-direction:column;gap:.375rem}
.ism-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ism-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ism-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.ism-textarea{min-height:100px;resize:vertical}
.ism-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.ism-ndpr a{color:var(--ww-primary)}
.ism-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.ism-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.ism-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.ism-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.ism-submit:hover{filter:brightness(1.1)}
.ism-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.ism-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ism-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ism-about-body{max-width:44rem;margin:0 auto}
.ism-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.ism-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.ism-detail-row{display:flex;gap:1rem;align-items:flex-start}
.ism-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.ism-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.ism-detail-value a{color:var(--ww-primary);font-weight:600}
.ism-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.ism-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ism-svc-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.ism-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.ism-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.ism-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ism-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ism-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ism-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ism-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ism-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.ism-ctas{flex-direction:column;align-items:stretch}.ism-primary-btn,.ism-sec-btn,.ism-wa-btn{width:100%;justify-content:center}}
</style>`;

type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const category = (ctx.data.category as string | null) ?? null;
  const featured = offerings.slice(0,6);
  const waHref = whatsappLink(phone, `Hello! I need a quote for iron rods and roofing sheets at ${ctx.displayName}.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="ism-hero">
  ${ctx.logoUrl ? `<img class="ism-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="ism-badge">🔩 ${esc(category ?? 'Iron & Steel Merchant')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="ism-tagline">${esc(tagline ?? `Quality iron rods, roofing sheets &amp; steel in ${placeName ?? 'Nigeria'}. Bulk supply for contractors &amp; developers. SON certified. CAC registered.`)}</p>
  <div class="ism-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ism-wa-btn">${waSvg()} Get Bulk Quote via WhatsApp</a>` : ''}
    <a class="ism-primary-btn" href="/services">View Price List</a>
    <a class="ism-sec-btn" href="/contact">Find Our Yard</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="ism-section">
  <h2 class="ism-section-title">Products in Stock</h2>
  <div class="ism-grid">
    ${featured.map(o => `
    <div class="ism-card">
      <h3 class="ism-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="ism-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="ism-item-price">Price on enquiry</span>` : `<span class="ism-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">View full price list &rarr;</a>` : ''}
</section>` : ''}
<div class="ism-trust-strip">
  <span class="ism-trust-badge"><span class="ism-dot"></span> SON Certified Stock</span>
  <span class="ism-trust-badge"><span class="ism-dot"></span> CAC Registered</span>
  <span class="ism-trust-badge"><span class="ism-dot"></span> Bulk Delivery Available</span>
  <span class="ism-trust-badge"><span class="ism-dot"></span> Contractor Pricing</span>
</div>
${bioExcerpt ? `
<div class="ism-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="ism-contact-strip">
  ${placeName ? `<div class="ism-strip-item"><span class="ism-strip-label">Yard Location</span><span class="ism-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="ism-strip-item"><span class="ism-strip-label">Phone / WhatsApp</span><span class="ism-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="ism-strip-item"><span class="ism-strip-label">Payment</span><span class="ism-strip-value">Cash · Bank Transfer · Paystack · POS</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to know more about ${ctx.displayName} iron and steel supply.`);
  return `${CSS}
<section class="ism-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Trusted iron rods, roofing sheets &amp; structural steel for Nigerian builders</p>
</section>
<div class="ism-about-body">
  <p class="ism-about-desc">${esc(description ?? `${ctx.displayName} is a CAC-registered iron and steel merchant supplying SON-certified iron rods (Y10-Y25 grades), roofing sheets (long-span, corrugated), angle iron, and structural steel sections. We serve property developers, building contractors, government infrastructure projects, and self-build customers. Bulk delivery to site available. Competitive contractor pricing with VAT receipts.`)}</p>
  <div class="ism-detail-list">
    ${placeName ? `<div class="ism-detail-row"><span class="ism-detail-label">Yard Address</span><span class="ism-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="ism-detail-row"><span class="ism-detail-label">Phone</span><span class="ism-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="ism-detail-row"><span class="ism-detail-label">Email</span><span class="ism-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="ism-detail-row"><span class="ism-detail-label">Products</span><span class="ism-detail-value">Iron rods (Y10-Y25) · Roofing sheets · Angle iron · Hollow sections · Binding wire</span></div>
    <div class="ism-detail-row"><span class="ism-detail-label">Compliance</span><span class="ism-detail-value">SON certified · CAC registered · VAT receipts available</span></div>
    <div class="ism-detail-row"><span class="ism-detail-label">Payment</span><span class="ism-detail-value">Cash, Bank Transfer, Paystack, POS</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ism-wa-btn">${waSvg()} Get Quote via WhatsApp</a>` : ''}
    <a class="ism-primary-btn" href="/services">View Price List</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I need a price list for iron rods and roofing sheets at ${ctx.displayName}. Please send your current prices per tonne/bundle.`);
  const grid = offerings.length === 0
    ? `<div class="ism-empty"><p>Current prices fluctuate with the steel market.<br/>WhatsApp us your order specifications for today's best price.</p><br/><a class="ism-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Get Today's Price</a></div>`
    : `<div class="ism-grid">${offerings.map(o => `
    <div class="ism-card">
      <h3 class="ism-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="ism-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="ism-item-price">Price on enquiry</span>` : `<span class="ism-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="ism-svc-hero">
  <h1>Products &amp; Price List</h1>
  <p class="ism-svc-sub">${esc(ctx.displayName)} — SON certified iron &amp; steel. All prices in ₦. Bulk discounts available.</p>
</section>
<section>${grid}</section>
<div class="ism-cta-strip">
  <h3>Need a bulk quote for your project?</h3>
  <p>Send us your bill of quantities via WhatsApp — we will respond with competitive contractor pricing.</p>
  <div class="ism-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ism-wa-btn">${waSvg()} Get Bulk Quote</a>` : ''}
    <a class="ism-sec-btn" href="/contact">Find Our Yard</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I need a quote from ${ctx.displayName}. Item: [iron rods/roofing sheets]. Quantity: [amount]. Delivery: [site address or collection].`);
  return `${CSS}
<section class="ism-contact-hero">
  <h1>Get a Quote</h1>
  <p>Contact ${esc(ctx.displayName)} for competitive iron rod and roofing sheet pricing — bulk orders welcome.</p>
</section>
${waHref ? `<div class="ism-wa-block">
  <p>Send us your specifications via WhatsApp — iron rod grade, roofing type, quantity, and delivery location. We respond with today's best price.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ism-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp for Quote</a>
</div>` : ''}
<div class="ism-contact-layout">
  <div class="ism-contact-info">
    <h2>Our Yard</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">We accept: Cash · Bank Transfer · Paystack · POS</p>
    <p style="margin-top:.75rem"><a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">View price list &rarr;</a></p>
  </div>
  <div class="ism-form-wrapper">
    <h2>Bulk Order Enquiry</h2>
    <form class="ism-form" method="POST" action="/contact" id="ismContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ism-form-group"><label for="ism-name">Your name</label><input id="ism-name" name="name" type="text" required autocomplete="name" class="ism-input" placeholder="e.g. Engr. Abubakar Musa" /></div>
      <div class="ism-form-group"><label for="ism-phone">Phone / WhatsApp</label><input id="ism-phone" name="phone" type="tel" autocomplete="tel" class="ism-input" placeholder="0803 000 0000" /></div>
      <div class="ism-form-group"><label for="ism-msg">Product, quantity &amp; delivery location</label><textarea id="ism-msg" name="message" required rows="4" class="ism-input ism-textarea" placeholder="e.g. Y16 iron rods — 10 tonnes. Roofing sheets (long-span) — 50 sheets. Delivery: Ikorodu Lagos construction site."></textarea></div>
      <div class="ism-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your order enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="ism-ndpr-check"><input type="checkbox" id="ism-consent" name="ndpr_consent" value="yes" required /><label for="ism-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="ism-submit">Send Enquiry</button>
    </form>
    <div id="ismContactSuccess" class="ism-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will send your quote shortly. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('ismContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('ismContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const ironSteelIronSteelMerchantTemplate: WebsiteTemplateContract = {
  slug: 'iron-steel-iron-steel-merchant',
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
