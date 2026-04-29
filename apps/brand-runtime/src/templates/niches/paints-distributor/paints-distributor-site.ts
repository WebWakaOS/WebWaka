/**
 * Paints & Coatings Distributor Site — Pillar 3 Website Template
 * Niche ID: P3-paints-distributor-paints-distributor-site
 * Vertical: paints-distributor (priority=3, medium)
 * Category: commerce/construction
 * Family: NF-COM-CON (variant of electrical-fittings)
 * Research brief: docs/templates/research/paints-distributor-paints-distributor-site-brief.md
 * Nigeria-First Priority: medium
 * Regulatory signals: SON conformity, NAFDAC for chemical products, CAC
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need paint supplies. Can you help?')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.pd-hero{text-align:center;padding:2.75rem 0 2rem}
.pd-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.pd-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.pd-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.pd-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.pd-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pd-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.pd-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.pd-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.pd-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.pd-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.pd-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.pd-section{margin-top:2.75rem}
.pd-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.pd-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.pd-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.pd-item-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.pd-item-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.pd-item-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.pd-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pd-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.pd-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.pd-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pd-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.pd-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.pd-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.pd-strip-item{display:flex;flex-direction:column;gap:.2rem}
.pd-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pd-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.pd-strip-value a{color:var(--ww-primary)}
.pd-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.pd-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.pd-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.pd-contact-layout{grid-template-columns:1fr 1fr}}
.pd-contact-info h2,.pd-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.pd-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.pd-contact-info a{color:var(--ww-primary);font-weight:600}
.pd-form{display:flex;flex-direction:column;gap:.875rem}
.pd-form-group{display:flex;flex-direction:column;gap:.375rem}
.pd-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.pd-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.pd-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.pd-textarea{min-height:100px;resize:vertical}
.pd-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.pd-ndpr a{color:var(--ww-primary)}
.pd-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.pd-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.pd-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.pd-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.pd-submit:hover{filter:brightness(1.1)}
.pd-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.pd-about-hero{text-align:center;padding:2.5rem 0 2rem}
.pd-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pd-about-body{max-width:44rem;margin:0 auto}
.pd-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.pd-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.pd-detail-row{display:flex;gap:1rem;align-items:flex-start}
.pd-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.pd-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.pd-detail-value a{color:var(--ww-primary);font-weight:600}
.pd-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.pd-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pd-svc-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.pd-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.pd-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.pd-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.pd-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.pd-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pd-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.pd-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pd-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.pd-ctas{flex-direction:column;align-items:stretch}.pd-primary-btn,.pd-sec-btn,.pd-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I need paints and coatings supplies from ${ctx.displayName}. Can you send your price list?`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="pd-hero">
  ${ctx.logoUrl ? `<img class="pd-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="pd-badge">🎨 ${esc(category ?? 'Paints Distributor')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="pd-tagline">${esc(tagline ?? `Premium paints &amp; coatings in ${placeName ?? 'Nigeria'}. Dulux · Berger · Crown · Jotun authorised distributor. Bulk pricing for contractors &amp; developers.`)}</p>
  <div class="pd-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pd-wa-btn">${waSvg()} Get Bulk Quote via WhatsApp</a>` : ''}
    <a class="pd-primary-btn" href="/services">View Paint Brands</a>
    <a class="pd-sec-btn" href="/contact">Contact Us</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="pd-section">
  <h2 class="pd-section-title">Paints &amp; Products</h2>
  <div class="pd-grid">
    ${featured.map(o => `
    <div class="pd-card">
      <h3 class="pd-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="pd-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="pd-item-price">Price on enquiry</span>` : `<span class="pd-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">View full catalogue &rarr;</a>` : ''}
</section>` : ''}
<div class="pd-trust-strip">
  <span class="pd-trust-badge"><span class="pd-dot"></span> Authorised Distributor</span>
  <span class="pd-trust-badge"><span class="pd-dot"></span> CAC Registered</span>
  <span class="pd-trust-badge"><span class="pd-dot"></span> SON Compliant</span>
  <span class="pd-trust-badge"><span class="pd-dot"></span> Contractor Pricing</span>
</div>
${bioExcerpt ? `
<div class="pd-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="pd-contact-strip">
  ${placeName ? `<div class="pd-strip-item"><span class="pd-strip-label">Location</span><span class="pd-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="pd-strip-item"><span class="pd-strip-label">Phone / WhatsApp</span><span class="pd-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="pd-strip-item"><span class="pd-strip-label">Payment</span><span class="pd-strip-value">Cash · Bank Transfer · Paystack · POS</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to know more about paint brands available at ${ctx.displayName}.`);
  return `${CSS}
<section class="pd-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Authorised distributor of premium Nigerian and imported paints &amp; coatings</p>
</section>
<div class="pd-about-body">
  <p class="pd-about-desc">${esc(description ?? `${ctx.displayName} is a CAC-registered authorised distributor of premium paint and coating brands including Dulux, Berger, Crown, Jotun, and Satin Guard. We supply emulsion, gloss, textured, weather-coat, and industrial coatings for residential, commercial, and infrastructure projects. Bulk contractor pricing, colour-matching service, and technical support available. SON-compliant products only.`)}</p>
  <div class="pd-detail-list">
    ${placeName ? `<div class="pd-detail-row"><span class="pd-detail-label">Address</span><span class="pd-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="pd-detail-row"><span class="pd-detail-label">Phone</span><span class="pd-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="pd-detail-row"><span class="pd-detail-label">Email</span><span class="pd-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="pd-detail-row"><span class="pd-detail-label">Brands</span><span class="pd-detail-value">Dulux · Berger · Crown · Jotun · Satin Guard · local brands</span></div>
    <div class="pd-detail-row"><span class="pd-detail-label">Products</span><span class="pd-detail-value">Emulsion · Gloss · Textured · Weather-coat · Industrial coatings</span></div>
    <div class="pd-detail-row"><span class="pd-detail-label">Payment</span><span class="pd-detail-value">Cash, Bank Transfer, Paystack, POS</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pd-wa-btn">${waSvg()} Get Quote via WhatsApp</a>` : ''}
    <a class="pd-primary-btn" href="/services">View Paint Brands</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I need paints from ${ctx.displayName}. Brand: [brand]. Type: [emulsion/gloss]. Quantity: [litres/tins]. Please send current price.`);
  const grid = offerings.length === 0
    ? `<div class="pd-empty"><p>Our full paint brand catalogue is available on request.<br/>WhatsApp us your brand preference and quantity for today's contractor pricing.</p><br/><a class="pd-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Request Price List</a></div>`
    : `<div class="pd-grid">${offerings.map(o => `
    <div class="pd-card">
      <h3 class="pd-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="pd-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="pd-item-price">Price on enquiry</span>` : `<span class="pd-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="pd-svc-hero">
  <h1>Paints &amp; Coatings Catalogue</h1>
  <p class="pd-svc-sub">${esc(ctx.displayName)} — authorised distributor. All prices in ₦. Bulk discounts available.</p>
</section>
<section>${grid}</section>
<div class="pd-cta-strip">
  <h3>Need a colour-matched or bulk order?</h3>
  <p>WhatsApp us your project requirements — we provide colour-matching, technical advice, and contractor pricing.</p>
  <div class="pd-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pd-wa-btn">${waSvg()} Request Bulk Quote</a>` : ''}
    <a class="pd-sec-btn" href="/contact">Contact Us</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I need paints from ${ctx.displayName}. Please send your current price list.`);
  return `${CSS}
<section class="pd-contact-hero">
  <h1>Get a Quote</h1>
  <p>Contact ${esc(ctx.displayName)} for bulk paint pricing, colour-matching, and contractor rates.</p>
</section>
${waHref ? `<div class="pd-wa-block">
  <p>WhatsApp us your paint brand, type, colour, and quantity — we will send your price immediately.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pd-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp for Quote</a>
</div>` : ''}
<div class="pd-contact-layout">
  <div class="pd-contact-info">
    <h2>Find Us</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">We accept: Cash · Bank Transfer · Paystack · POS</p>
  </div>
  <div class="pd-form-wrapper">
    <h2>Paint Order Enquiry</h2>
    <form class="pd-form" method="POST" action="/contact" id="pdContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pd-form-group"><label for="pd-name">Your name</label><input id="pd-name" name="name" type="text" required autocomplete="name" class="pd-input" placeholder="e.g. Arch. Funmilayo Osei" /></div>
      <div class="pd-form-group"><label for="pd-phone">Phone / WhatsApp</label><input id="pd-phone" name="phone" type="tel" autocomplete="tel" class="pd-input" placeholder="0803 000 0000" /></div>
      <div class="pd-form-group"><label for="pd-msg">Paint brand, type, colour &amp; quantity</label><textarea id="pd-msg" name="message" required rows="4" class="pd-input pd-textarea" placeholder="e.g. Dulux Weathershield, magnolia, 20 tins (4L each). Plus 10 tins Dulux Supermat white. Delivery to Surulere Lagos."></textarea></div>
      <div class="pd-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your order enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="pd-ndpr-check"><input type="checkbox" id="pd-consent" name="ndpr_consent" value="yes" required /><label for="pd-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="pd-submit">Send Enquiry</button>
    </form>
    <div id="pdContactSuccess" class="pd-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will send your quote shortly. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('pdContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('pdContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const paintsDistributorPaintsDistributorSiteTemplate: WebsiteTemplateContract = {
  slug: 'paints-distributor-paints-distributor-site',
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
