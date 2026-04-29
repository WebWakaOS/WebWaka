/**
 * Food Processing Factory Site — Pillar 3 Website Template
 * Niche ID: P3-food-processing-food-processing-factory
 * Vertical: food-processing (priority=3, high)
 * Category: agricultural/processing
 * Family: NF-AGR-PRO (standalone)
 * Research brief: docs/templates/research/food-processing-food-processing-factory-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NAFDAC mandatory, FMARD, SON, CAC, NCS (Nigerian Customs)
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about your food processing products or services.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.255-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.fpf-hero{text-align:center;padding:2.75rem 0 2rem}
.fpf-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.fpf-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.fpf-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.fpf-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.fpf-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.fpf-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.fpf-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.fpf-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.fpf-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.fpf-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.fpf-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.fpf-section{margin-top:2.75rem}
.fpf-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.fpf-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.fpf-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.fpf-item-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.fpf-item-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.fpf-item-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.fpf-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.fpf-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.fpf-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.fpf-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.fpf-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.fpf-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.fpf-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.fpf-strip-item{display:flex;flex-direction:column;gap:.2rem}
.fpf-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.fpf-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.fpf-strip-value a{color:var(--ww-primary)}
.fpf-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.fpf-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.fpf-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.fpf-contact-layout{grid-template-columns:1fr 1fr}}
.fpf-contact-info h2,.fpf-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.fpf-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.fpf-contact-info a{color:var(--ww-primary);font-weight:600}
.fpf-form{display:flex;flex-direction:column;gap:.875rem}
.fpf-form-group{display:flex;flex-direction:column;gap:.375rem}
.fpf-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.fpf-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.fpf-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.fpf-textarea{min-height:100px;resize:vertical}
.fpf-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.fpf-ndpr a{color:var(--ww-primary)}
.fpf-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.fpf-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.fpf-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.fpf-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.fpf-submit:hover{filter:brightness(1.1)}
.fpf-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.fpf-about-hero{text-align:center;padding:2.5rem 0 2rem}
.fpf-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.fpf-about-body{max-width:44rem;margin:0 auto}
.fpf-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.fpf-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.fpf-detail-row{display:flex;gap:1rem;align-items:flex-start}
.fpf-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.fpf-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.fpf-detail-value a{color:var(--ww-primary);font-weight:600}
.fpf-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.fpf-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.fpf-svc-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.fpf-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.fpf-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.fpf-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.fpf-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.fpf-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.fpf-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.fpf-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.fpf-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.fpf-ctas{flex-direction:column;align-items:stretch}.fpf-primary-btn,.fpf-sec-btn,.fpf-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about your food processing products at ${ctx.displayName}.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="fpf-hero">
  ${ctx.logoUrl ? `<img class="fpf-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="fpf-badge">🌾 ${esc(category ?? 'Food Processing Factory')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="fpf-tagline">${esc(tagline ?? `NAFDAC-certified food processing in ${placeName ?? 'Nigeria'}. Garri · Flour · Palm oil · Groundnut oil · Packaged foods. Bulk B2B supply welcome.`)}</p>
  <div class="fpf-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="fpf-wa-btn">${waSvg()} Enquire via WhatsApp</a>` : ''}
    <a class="fpf-primary-btn" href="/services">View Products</a>
    <a class="fpf-sec-btn" href="/contact">Contact Us</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="fpf-section">
  <h2 class="fpf-section-title">Our Products</h2>
  <div class="fpf-grid">
    ${featured.map(o => `
    <div class="fpf-card">
      <h3 class="fpf-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="fpf-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="fpf-item-price">Bulk price on enquiry</span>` : `<span class="fpf-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">View full product list &rarr;</a>` : ''}
</section>` : ''}
<div class="fpf-trust-strip">
  <span class="fpf-trust-badge"><span class="fpf-dot"></span> NAFDAC Certified</span>
  <span class="fpf-trust-badge"><span class="fpf-dot"></span> CAC Registered</span>
  <span class="fpf-trust-badge"><span class="fpf-dot"></span> FMARD Compliant</span>
  <span class="fpf-trust-badge"><span class="fpf-dot"></span> SON Quality Standard</span>
</div>
${bioExcerpt ? `
<div class="fpf-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="fpf-contact-strip">
  ${placeName ? `<div class="fpf-strip-item"><span class="fpf-strip-label">Factory Location</span><span class="fpf-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="fpf-strip-item"><span class="fpf-strip-label">Phone / WhatsApp</span><span class="fpf-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="fpf-strip-item"><span class="fpf-strip-label">Payment</span><span class="fpf-strip-value">Bank Transfer · Paystack · POS</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to know more about ${ctx.displayName}'s food processing products.`);
  return `${CSS}
<section class="fpf-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">NAFDAC-certified Nigerian food processing — quality you can trust</p>
</section>
<div class="fpf-about-body">
  <p class="fpf-about-desc">${esc(description ?? `${ctx.displayName} is a NAFDAC-certified food processing company producing packaged garri, flour, palm oil, groundnut oil, and other processed food commodities for Nigerian and export markets. All products carry NAFDAC registration numbers. We supply supermarkets, distributors, hotels, and FMCG companies. SON quality standards maintained. FMARD registered.`)}</p>
  <div class="fpf-detail-list">
    ${placeName ? `<div class="fpf-detail-row"><span class="fpf-detail-label">Factory</span><span class="fpf-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="fpf-detail-row"><span class="fpf-detail-label">Phone</span><span class="fpf-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="fpf-detail-row"><span class="fpf-detail-label">Email</span><span class="fpf-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="fpf-detail-row"><span class="fpf-detail-label">Certifications</span><span class="fpf-detail-value">NAFDAC · CAC · FMARD · SON quality standard</span></div>
    <div class="fpf-detail-row"><span class="fpf-detail-label">Customers</span><span class="fpf-detail-value">Supermarkets · Distributors · Hotels · Export buyers</span></div>
    <div class="fpf-detail-row"><span class="fpf-detail-label">Payment</span><span class="fpf-detail-value">Bank Transfer, Paystack, POS</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="fpf-wa-btn">${waSvg()} Enquire via WhatsApp</a>` : ''}
    <a class="fpf-primary-btn" href="/services">View Products</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like a bulk quote from ${ctx.displayName}. Product: [product name]. Quantity: [quantity]. Please send NAFDAC number and price per unit.`);
  const grid = offerings.length === 0
    ? `<div class="fpf-empty"><p>Our NAFDAC-certified product range is available on request.<br/>WhatsApp us your order requirements for bulk pricing.</p><br/><a class="fpf-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Request Bulk Quote</a></div>`
    : `<div class="fpf-grid">${offerings.map(o => `
    <div class="fpf-card">
      <h3 class="fpf-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="fpf-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="fpf-item-price">Bulk price on enquiry</span>` : `<span class="fpf-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="fpf-svc-hero">
  <h1>Our Products</h1>
  <p class="fpf-svc-sub">${esc(ctx.displayName)} — NAFDAC-certified processed foods. All prices in ₦. Bulk discounts available.</p>
</section>
<section>${grid}</section>
<div class="fpf-cta-strip">
  <h3>Looking for bulk or B2B supply?</h3>
  <p>WhatsApp us your order quantity and delivery location — we will send NAFDAC registration numbers and competitive B2B pricing.</p>
  <div class="fpf-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="fpf-wa-btn">${waSvg()} Request Bulk Quote</a>` : ''}
    <a class="fpf-sec-btn" href="/contact">Contact Our Factory</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like a bulk supply quote from ${ctx.displayName}. Please send your product list, NAFDAC numbers, and current prices.`);
  return `${CSS}
<section class="fpf-contact-hero">
  <h1>Contact Our Factory</h1>
  <p>Enquire about bulk supply, B2B partnerships, and custom packaging at ${esc(ctx.displayName)}.</p>
</section>
${waHref ? `<div class="fpf-wa-block">
  <p>WhatsApp us your product requirements, quantity, and delivery location for same-day B2B pricing and NAFDAC documentation.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="fpf-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp Now</a>
</div>` : ''}
<div class="fpf-contact-layout">
  <div class="fpf-contact-info">
    <h2>Factory Contact</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">B2B payment: Bank Transfer · Paystack · POS</p>
  </div>
  <div class="fpf-form-wrapper">
    <h2>Bulk Supply Enquiry</h2>
    <form class="fpf-form" method="POST" action="/contact" id="fpfContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="fpf-form-group"><label for="fpf-name">Your name / company</label><input id="fpf-name" name="name" type="text" required autocomplete="name" class="fpf-input" placeholder="e.g. Nkechi Foods Ltd" /></div>
      <div class="fpf-form-group"><label for="fpf-phone">Phone / WhatsApp</label><input id="fpf-phone" name="phone" type="tel" autocomplete="tel" class="fpf-input" placeholder="0803 000 0000" /></div>
      <div class="fpf-form-group"><label for="fpf-msg">Product, quantity &amp; delivery location</label><textarea id="fpf-msg" name="message" required rows="4" class="fpf-input fpf-textarea" placeholder="e.g. Garri (yellow) — 500kg bags x 20. Groundnut oil — 25L kegs x 50. Delivery: Onitsha Anambra state."></textarea></div>
      <div class="fpf-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="fpf-ndpr-check"><input type="checkbox" id="fpf-consent" name="ndpr_consent" value="yes" required /><label for="fpf-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="fpf-submit">Send Enquiry</button>
    </form>
    <div id="fpfContactSuccess" class="fpf-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>Our sales team will respond with pricing and documentation shortly. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('fpfContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('fpfContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const foodProcessingFoodProcessingFactoryTemplate: WebsiteTemplateContract = {
  slug: 'food-processing-food-processing-factory',
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
