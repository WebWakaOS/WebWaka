/**
 * Poultry Farm Site — Pillar 3 Website Template
 * Niche ID: P3-poultry-farm-poultry-farm-site
 * Vertical: poultry-farm (priority=3, critical)
 * Category: agricultural
 * Family: NF-AGR-LIV (anchor)
 * Research brief: docs/templates/research/poultry-farm-poultry-farm-site-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: NAFDAC (vaccines/feed additives), FMARD, VAN vet certification
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtKobo(k: number): string { return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`; }
function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to order from your poultry farm.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ } return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.pf-hero{text-align:center;padding:2.75rem 0 2rem}
.pf-logo{height:80px;width:80px;object-fit:cover;border-radius:12px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.pf-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.pf-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.pf-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.pf-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pf-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.pf-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.pf-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.pf-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.pf-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.pf-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.pf-section{margin-top:2.75rem}
.pf-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.pf-product-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.pf-product-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.pf-product-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.pf-product-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.pf-product-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.pf-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pf-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.pf-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.pf-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pf-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.pf-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.pf-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.pf-strip-item{display:flex;flex-direction:column;gap:.2rem}
.pf-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pf-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.pf-strip-value a{color:var(--ww-primary)}
.pf-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.pf-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.pf-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.pf-contact-layout{grid-template-columns:1fr 1fr}}
.pf-contact-info h2,.pf-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.pf-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.pf-contact-info a{color:var(--ww-primary);font-weight:600}
.pf-form{display:flex;flex-direction:column;gap:.875rem}
.pf-form-group{display:flex;flex-direction:column;gap:.375rem}
.pf-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.pf-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.pf-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.pf-textarea{min-height:100px;resize:vertical}
.pf-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.pf-ndpr a{color:var(--ww-primary)}
.pf-ndpr-check{display:flex;align-items:flex-start;gap:.5rem;margin-top:.5rem}
.pf-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.pf-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.pf-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.pf-submit:hover{filter:brightness(1.1)}
.pf-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.pf-success h3{font-weight:700;margin-bottom:.25rem}
.pf-about-hero{text-align:center;padding:2.5rem 0 2rem}
.pf-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pf-about-body{max-width:44rem;margin:0 auto}
.pf-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.pf-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.pf-detail-row{display:flex;gap:1rem;align-items:flex-start}
.pf-detail-label{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.pf-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.pf-detail-value a{color:var(--ww-primary);font-weight:600}
.pf-services-hero{text-align:center;padding:2.5rem 0 2rem}
.pf-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pf-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.pf-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.pf-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.pf-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.pf-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.pf-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pf-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.pf-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pf-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.pf-ctas{flex-direction:column;align-items:stretch}.pf-primary-btn,.pf-sec-btn,.pf-wa-btn{width:100%;justify-content:center}}
</style>`;

type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const featured = offerings.slice(0,6);
  const waHref = whatsappLink(phone, `Hello! I would like to order from ${ctx.displayName} poultry farm. Please share your current prices and availability.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="pf-hero">
  ${ctx.logoUrl ? `<img class="pf-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="pf-cat-badge">🐔 Poultry Farm</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="pf-tagline">${esc(tagline ?? `Fresh broilers, layers, eggs &amp; day-old chicks — straight from farm to your table${placeName ? ` in ${placeName}` : ''}.`)}</p>
  <div class="pf-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pf-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}
    <a class="pf-sec-btn" href="/services">View Prices</a>
    <a class="pf-sec-btn" href="/contact">Contact Farm</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="pf-section">
  <h2 class="pf-section-title">Products &amp; Prices</h2>
  <div class="pf-product-grid">
    ${featured.map(o => `<div class="pf-product-card"><h3 class="pf-product-name">${esc(o.name)}</h3>${o.description ? `<p class="pf-product-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="pf-product-price">Price on request</span>` : `<span class="pf-product-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">Full price list &rarr;</a>` : ''}
</section>` : ''}
<div class="pf-trust-strip">
  <span class="pf-badge"><span class="pf-dot"></span> NAFDAC-Registered Vaccines</span>
  <span class="pf-badge"><span class="pf-dot"></span> CAC Registered</span>
  <span class="pf-badge"><span class="pf-dot"></span> Biosecurity Certified</span>
  <span class="pf-badge"><span class="pf-dot"></span> VAN Vet On-Call</span>
</div>
${bioExcerpt ? `<div class="pf-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bioExcerpt)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a></div>` : ''}
${(phone || placeName) ? `<div class="pf-contact-strip">
  ${placeName ? `<div class="pf-strip-item"><span class="pf-strip-label">Farm Location</span><span class="pf-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="pf-strip-item"><span class="pf-strip-label">Order Line</span><span class="pf-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="pf-strip-item"><span class="pf-strip-label">Payment</span><span class="pf-strip-value">Bank Transfer · Paystack · POS</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to learn more about ${ctx.displayName}.`);
  return `${CSS}
<section class="pf-about-hero"><h1>About ${esc(ctx.displayName)}</h1><p style="color:var(--ww-text-muted);margin-top:.5rem">NAFDAC-registered poultry farm — fresh from farm to table</p></section>
<div class="pf-about-body">
  <p class="pf-about-desc">${esc(description ?? `${ctx.displayName} is a registered Nigerian poultry farm supplying fresh broilers, layers, eggs, and day-old chicks. We maintain strict biosecurity standards with NAFDAC-registered vaccines and a dedicated Veterinary Association of Nigeria (VAN) vet. Our birds are raised on certified feed for healthy, consistent quality.`)}</p>
  <div class="pf-detail-list">
    ${placeName ? `<div class="pf-detail-row"><span class="pf-detail-label">Farm Address</span><span class="pf-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="pf-detail-row"><span class="pf-detail-label">Order Line</span><span class="pf-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="pf-detail-row"><span class="pf-detail-label">Email</span><span class="pf-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="pf-detail-row"><span class="pf-detail-label">Compliance</span><span class="pf-detail-value">NAFDAC-registered vaccines &amp; feed additives</span></div>
    <div class="pf-detail-row"><span class="pf-detail-label">Veterinary</span><span class="pf-detail-value">VAN-registered vet on-call</span></div>
    <div class="pf-detail-row"><span class="pf-detail-label">Payment</span><span class="pf-detail-value">Bank Transfer, Paystack, POS on delivery</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pf-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}
    <a class="pf-primary-btn" href="/services">View Prices</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to order from ${ctx.displayName}. Please send me your full price list.`);
  const grid = offerings.length === 0
    ? `<div class="pf-empty"><p>Full price list coming soon.<br/>WhatsApp or call us for live pricing on broilers, layers, eggs, and day-old chicks.</p><br/>${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pf-wa-btn">${waSvg()} Get Prices via WhatsApp</a>` : ''}</div>`
    : `<div class="pf-product-grid">${offerings.map(o => `<div class="pf-product-card"><h3 class="pf-product-name">${esc(o.name)}</h3>${o.description ? `<p class="pf-product-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="pf-product-price">Price on request</span>` : `<span class="pf-product-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="pf-services-hero"><h1>Products &amp; Pricing</h1><p class="pf-services-sub">All prices in ₦ (Naira) — bulk discounts available</p></section>
<section>${grid}</section>
<div class="pf-cta-strip"><h3>Ready to order?</h3><p>WhatsApp us to place your order. We offer farm gate pickup and delivery to Lagos, Ibadan, Abuja, and nearby states.</p>
<div class="pf-btn-row">${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pf-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}<a class="pf-sec-btn" href="/contact">Contact Farm</a></div></div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to order from ${ctx.displayName}. Please share your current prices and delivery terms.`);
  return `${CSS}
<section class="pf-contact-hero"><h1>Order &amp; Enquiries</h1><p>Place your order or enquire about bulk pricing at ${esc(ctx.displayName)}.</p></section>
${waHref ? `<div class="pf-wa-block"><p>WhatsApp is the fastest way to place an order or get a bulk quote. We respond promptly.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pf-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Order via WhatsApp</a></div>` : ''}
<div class="pf-contact-layout">
  <div class="pf-contact-info">
    <h2>Farm Location</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Order Line:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Farm contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Bank Transfer · Paystack · POS on delivery</p>
  </div>
  <div class="pf-form-wrapper">
    <h2>Send an Enquiry</h2>
    <form class="pf-form" method="POST" action="/contact" id="pfContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pf-form-group"><label for="pf-name">Your name</label><input id="pf-name" name="name" type="text" required autocomplete="name" class="pf-input" placeholder="e.g. Chukwuemeka Nwachukwu" /></div>
      <div class="pf-form-group"><label for="pf-phone">Phone / WhatsApp</label><input id="pf-phone" name="phone" type="tel" autocomplete="tel" class="pf-input" placeholder="0803 000 0000" /></div>
      <div class="pf-form-group"><label for="pf-msg">What would you like to order?</label><textarea id="pf-msg" name="message" required rows="4" class="pf-input pf-textarea" placeholder="e.g. I need 100 broilers (dressed) for weekly supply to my restaurant in Ibadan."></textarea></div>
      <div class="pf-ndpr"><strong>Privacy notice (NDPR):</strong> Your details are used only to process your order enquiry. <a href="/privacy">Privacy Policy</a>.<div class="pf-ndpr-check"><input type="checkbox" id="pf-consent" name="ndpr_consent" value="yes" required /><label for="pf-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="pf-submit">Send Enquiry</button>
    </form>
    <div id="pfContactSuccess" class="pf-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will contact you shortly with pricing and delivery details. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('pfContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('pfContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const poultryFarmPoultryFarmSiteTemplate: WebsiteTemplateContract = {
  slug: 'poultry-farm-poultry-farm-site',
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
