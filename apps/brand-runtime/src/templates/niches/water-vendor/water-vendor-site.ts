/**
 * Water Vendor / Sachet Water Producer Site — Pillar 3 Website Template
 * Niche ID: P3-water-vendor-water-vendor-site
 * Vertical: water-vendor (priority=3, critical)
 * Category: commerce
 * Family: standalone
 * Research brief: docs/templates/research/water-vendor-water-vendor-site-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: NAFDAC (MANDATORY for sachet/bottle water), NESREA, SON
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtKobo(k: number): string { return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`; }
function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to order water delivery.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ } return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.wv-nafdac-alert{background:var(--ww-primary);color:#fff;text-align:center;padding:.625rem 1rem;font-size:.875rem;font-weight:700;border-radius:var(--ww-radius);margin-bottom:1.25rem}
.wv-hero{text-align:center;padding:2.5rem 0 2rem}
.wv-logo{height:80px;width:80px;object-fit:contain;border-radius:12px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.wv-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.wv-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.wv-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.wv-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.wv-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.wv-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.wv-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.wv-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.wv-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.wv-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.wv-product-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));margin-top:1.5rem}
.wv-product-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.wv-product-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.wv-product-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.wv-product-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.wv-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:2px solid var(--ww-primary);border-radius:var(--ww-radius)}
.wv-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.wv-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.wv-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.wv-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.wv-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.wv-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.wv-strip-item{display:flex;flex-direction:column;gap:.2rem}
.wv-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.wv-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.wv-strip-value a{color:var(--ww-primary)}
.wv-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.wv-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.wv-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.wv-contact-layout{grid-template-columns:1fr 1fr}}
.wv-contact-info h2,.wv-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.wv-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.wv-contact-info a{color:var(--ww-primary);font-weight:600}
.wv-form{display:flex;flex-direction:column;gap:.875rem}
.wv-form-group{display:flex;flex-direction:column;gap:.375rem}
.wv-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.wv-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.wv-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.wv-textarea{min-height:100px;resize:vertical}
.wv-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.wv-ndpr a{color:var(--ww-primary)}
.wv-ndpr-check{display:flex;align-items:flex-start;gap:.5rem;margin-top:.5rem}
.wv-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.wv-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.wv-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.wv-submit:hover{filter:brightness(1.1)}
.wv-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.wv-success h3{font-weight:700;margin-bottom:.25rem}
.wv-about-hero{text-align:center;padding:2.5rem 0 2rem}
.wv-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.wv-about-body{max-width:44rem;margin:0 auto}
.wv-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:1.5rem;font-size:1rem}
.wv-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.wv-detail-row{display:flex;gap:1rem;align-items:flex-start}
.wv-detail-label{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.wv-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.wv-detail-value a{color:var(--ww-primary);font-weight:600}
.wv-services-hero{text-align:center;padding:2.5rem 0 2rem}
.wv-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.wv-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.wv-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.wv-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.wv-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.wv-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.wv-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.wv-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.wv-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.wv-ctas{flex-direction:column;align-items:stretch}.wv-primary-btn,.wv-sec-btn,.wv-wa-btn{width:100%;justify-content:center}}
</style>`;

type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const nafdacNo = (ctx.data.nafdacNumber as string | null) ?? null;
  const featured = offerings.slice(0,6);
  const waHref = whatsappLink(phone, `Hello! I would like to order water from ${ctx.displayName}. Please share your current prices and delivery areas.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<div class="wv-nafdac-alert">✅ NAFDAC Registered${nafdacNo ? ` — Reg. No: ${esc(nafdacNo)}` : ''} | Safe. Pure. Certified.</div>
<section class="wv-hero">
  ${ctx.logoUrl ? `<img class="wv-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="wv-cat-badge">💧 Water Vendor</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="wv-tagline">${esc(tagline ?? `Pure, safe, NAFDAC-registered water delivery${placeName ? ` in ${placeName}` : ''}. Sachet water, bottled water &amp; tanker supply.`)}</p>
  <div class="wv-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="wv-wa-btn">${waSvg()} Order Water Now</a>` : ''}
    <a class="wv-sec-btn" href="/services">View Prices</a>
    <a class="wv-sec-btn" href="/contact">Delivery Areas</a>
  </div>
</section>
${featured.length > 0 ? `
<section style="margin-top:2rem">
  <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.875rem;color:var(--ww-primary)">Products &amp; Services</h2>
  <div class="wv-product-grid">
    ${featured.map(o => `<div class="wv-product-card"><h3 class="wv-product-name">${esc(o.name)}</h3>${o.description ? `<p class="wv-product-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="wv-product-price">Price on request</span>` : `<span class="wv-product-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}
  </div>
</section>` : ''}
<div class="wv-trust-strip">
  <span class="wv-badge"><span class="wv-dot"></span> NAFDAC Registered</span>
  <span class="wv-badge"><span class="wv-dot"></span> NESREA Compliant</span>
  <span class="wv-badge"><span class="wv-dot"></span> SON Mark of Quality</span>
  <span class="wv-badge"><span class="wv-dot"></span> CAC Registered</span>
</div>
${bioExcerpt ? `<div class="wv-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bioExcerpt)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a></div>` : ''}
${(phone || placeName) ? `<div class="wv-contact-strip">
  ${placeName ? `<div class="wv-strip-item"><span class="wv-strip-label">Location</span><span class="wv-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="wv-strip-item"><span class="wv-strip-label">Order Line</span><span class="wv-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="wv-strip-item"><span class="wv-strip-label">Payment</span><span class="wv-strip-value">Cash · POS · Bank Transfer · Paystack</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const nafdacNo = (ctx.data.nafdacNumber as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to place a water order with ${ctx.displayName}.`);
  return `${CSS}
<section class="wv-about-hero"><h1>About ${esc(ctx.displayName)}</h1><p style="color:var(--ww-text-muted);margin-top:.5rem">NAFDAC-Registered. Pure Water. Reliable Delivery.</p></section>
<div class="wv-about-body">
  <p class="wv-about-desc">${esc(description ?? `${ctx.displayName} is a NAFDAC-registered water production and delivery company serving homes, estates, offices, restaurants, and construction sites. We produce sachet water, bottled water, and operate a water tanker delivery service to meet all your clean water needs.`)}</p>
  <div class="wv-detail-list">
    ${placeName ? `<div class="wv-detail-row"><span class="wv-detail-label">Address</span><span class="wv-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="wv-detail-row"><span class="wv-detail-label">Order Line</span><span class="wv-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="wv-detail-row"><span class="wv-detail-label">Email</span><span class="wv-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    ${nafdacNo ? `<div class="wv-detail-row"><span class="wv-detail-label">NAFDAC No.</span><span class="wv-detail-value">${esc(nafdacNo)}</span></div>` : '<div class="wv-detail-row"><span class="wv-detail-label">Compliance</span><span class="wv-detail-value">NAFDAC Registered &amp; NESREA Compliant</span></div>'}
    <div class="wv-detail-row"><span class="wv-detail-label">Payment</span><span class="wv-detail-value">Cash, POS, Bank Transfer, Paystack</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="wv-wa-btn">${waSvg()} Order Water</a>` : ''}
    <a class="wv-primary-btn" href="/services">View Prices</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to order water from ${ctx.displayName}. Please send me your price list.`);
  const grid = offerings.length === 0
    ? `<div class="wv-product-grid">
  <div class="wv-product-card"><h3 class="wv-product-name">Sachet Water (Pure Water)</h3><p class="wv-product-desc">20 sachets per pack, 50cl each. NAFDAC registered. Ideal for homes, offices, events.</p><span class="wv-product-price">Contact for price</span></div>
  <div class="wv-product-card"><h3 class="wv-product-name">Bottled Water (50cl Carton)</h3><p class="wv-product-desc">24 bottles per carton. SON mark of quality. Perfect for restaurants, hotels, and institutions.</p><span class="wv-product-price">Contact for price</span></div>
  <div class="wv-product-card"><h3 class="wv-product-name">Water Tanker Delivery</h3><p class="wv-product-desc">5,000–20,000 litre tanker delivery to estates, construction sites, and rural areas.</p><span class="wv-product-price">Contact for price</span></div>
  <div class="wv-product-card"><h3 class="wv-product-name">Bulk Wholesale Supply</h3><p class="wv-product-desc">Wholesale supply for distributors, supermarkets, and institutional buyers. Minimum order applies.</p><span class="wv-product-price">Contact for price</span></div>
</div>`
    : `<div class="wv-product-grid">${offerings.map(o => `<div class="wv-product-card"><h3 class="wv-product-name">${esc(o.name)}</h3>${o.description ? `<p class="wv-product-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="wv-product-price">Price on request</span>` : `<span class="wv-product-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="wv-services-hero"><h1>Products &amp; Pricing</h1><p class="wv-services-sub">NAFDAC-registered water products — prices in ₦ (Naira)</p></section>
<section>${grid}</section>
<div class="wv-cta-strip"><h3>Ready to order?</h3><p>Order via WhatsApp for same-day delivery where available. We cover estates, offices, restaurants, and construction sites.</p>
<div class="wv-btn-row">${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="wv-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}<a class="wv-sec-btn" href="/contact">Contact Us</a></div></div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to order water from ${ctx.displayName}. Please share your delivery areas and current prices.`);
  return `${CSS}
<section class="wv-contact-hero"><h1>Order &amp; Delivery</h1><p>Place your water order at ${esc(ctx.displayName)} — fast, pure, NAFDAC-registered delivery.</p></section>
${waHref ? `<div class="wv-wa-block"><p>WhatsApp is the fastest way to order. We confirm delivery times and pricing immediately.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="wv-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Order Water via WhatsApp</a></div>` : ''}
<div class="wv-contact-layout">
  <div class="wv-contact-info">
    <h2>Our Location</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Order Line:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Cash · POS · Bank Transfer · Paystack</p>
  </div>
  <div class="wv-form-wrapper">
    <h2>Delivery Enquiry</h2>
    <form class="wv-form" method="POST" action="/contact" id="wvContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="wv-form-group"><label for="wv-name">Your name</label><input id="wv-name" name="name" type="text" required autocomplete="name" class="wv-input" placeholder="e.g. Gbenga Adebayo" /></div>
      <div class="wv-form-group"><label for="wv-phone">Phone / WhatsApp</label><input id="wv-phone" name="phone" type="tel" autocomplete="tel" class="wv-input" placeholder="0803 000 0000" /></div>
      <div class="wv-form-group"><label for="wv-address">Delivery address</label><input id="wv-address" name="delivery_address" type="text" class="wv-input" placeholder="e.g. 5 Bode Thomas Street, Surulere, Lagos" /></div>
      <div class="wv-form-group"><label for="wv-msg">What do you need?</label><textarea id="wv-msg" name="message" required rows="3" class="wv-input wv-textarea" placeholder="e.g. I need weekly sachet water supply for my office of 30 people in Ikorodu."></textarea></div>
      <div class="wv-ndpr"><strong>Privacy notice (NDPR):</strong> Your details are used only to process your delivery enquiry. <a href="/privacy">Privacy Policy</a>.<div class="wv-ndpr-check"><input type="checkbox" id="wv-consent" name="ndpr_consent" value="yes" required /><label for="wv-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="wv-submit">Send Enquiry</button>
    </form>
    <div id="wvContactSuccess" class="wv-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will contact you shortly to confirm your delivery details. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('wvContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('wvContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const waterVendorWaterVendorSiteTemplate: WebsiteTemplateContract = {
  slug: 'water-vendor-water-vendor-site',
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
