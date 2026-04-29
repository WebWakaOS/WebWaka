/**
 * Motorcycle Accessories Shop Site — Pillar 3 Website Template
 * Niche ID: P3-motorcycle-accessories-moto-accessories-shop
 * Vertical: motorcycle-accessories (priority=3, high)
 * Category: commerce/automotive
 * Family: NF-COM-AUT (variant of used-car-dealer)
 * Research brief: docs/templates/research/motorcycle-accessories-moto-accessories-shop-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: FRSC helmet compliance, SON conformity, CAC
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I am looking for motorcycle accessories. Can you help?')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.mab-hero{text-align:center;padding:2.75rem 0 2rem}
.mab-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.mab-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.mab-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.mab-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.mab-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.mab-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.mab-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.mab-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.mab-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.mab-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.mab-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.mab-section{margin-top:2.75rem}
.mab-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.mab-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.mab-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.mab-item-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.mab-item-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.mab-item-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.mab-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.mab-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.mab-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.mab-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.mab-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.mab-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.mab-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.mab-strip-item{display:flex;flex-direction:column;gap:.2rem}
.mab-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.mab-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.mab-strip-value a{color:var(--ww-primary)}
.mab-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.mab-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.mab-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.mab-contact-layout{grid-template-columns:1fr 1fr}}
.mab-contact-info h2,.mab-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.mab-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.mab-contact-info a{color:var(--ww-primary);font-weight:600}
.mab-form{display:flex;flex-direction:column;gap:.875rem}
.mab-form-group{display:flex;flex-direction:column;gap:.375rem}
.mab-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.mab-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.mab-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.mab-textarea{min-height:100px;resize:vertical}
.mab-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.mab-ndpr a{color:var(--ww-primary)}
.mab-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.mab-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.mab-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.mab-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.mab-submit:hover{filter:brightness(1.1)}
.mab-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.mab-about-hero{text-align:center;padding:2.5rem 0 2rem}
.mab-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.mab-about-body{max-width:44rem;margin:0 auto}
.mab-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.mab-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.mab-detail-row{display:flex;gap:1rem;align-items:flex-start}
.mab-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.mab-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.mab-detail-value a{color:var(--ww-primary);font-weight:600}
.mab-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.mab-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.mab-svc-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.mab-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.mab-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.mab-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.mab-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.mab-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.mab-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.mab-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.mab-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.mab-ctas{flex-direction:column;align-items:stretch}.mab-primary-btn,.mab-sec-btn,.mab-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I am looking for motorcycle accessories at ${ctx.displayName}.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="mab-hero">
  ${ctx.logoUrl ? `<img class="mab-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="mab-badge">🏍️ ${esc(category ?? 'Motorcycle Accessories')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="mab-tagline">${esc(tagline ?? `FRSC-approved helmets, tyres &amp; accessories for okada &amp; dispatch riders in ${placeName ?? 'Nigeria'}. Rider-ready stock. WhatsApp orders welcome.`)}</p>
  <div class="mab-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="mab-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}
    <a class="mab-primary-btn" href="/services">Browse Accessories</a>
    <a class="mab-sec-btn" href="/contact">Find Our Shop</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="mab-section">
  <h2 class="mab-section-title">Accessories in Stock</h2>
  <div class="mab-grid">
    ${featured.map(o => `
    <div class="mab-card">
      <h3 class="mab-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="mab-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="mab-item-price">Price on enquiry</span>` : `<span class="mab-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">View full catalogue &rarr;</a>` : ''}
</section>` : ''}
<div class="mab-trust-strip">
  <span class="mab-trust-badge"><span class="mab-dot"></span> FRSC-Approved Helmets</span>
  <span class="mab-trust-badge"><span class="mab-dot"></span> CAC Registered</span>
  <span class="mab-trust-badge"><span class="mab-dot"></span> SON-Conforming Stock</span>
  <span class="mab-trust-badge"><span class="mab-dot"></span> Dispatch Rider Specialists</span>
</div>
${bioExcerpt ? `
<div class="mab-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="mab-contact-strip">
  ${placeName ? `<div class="mab-strip-item"><span class="mab-strip-label">Shop Location</span><span class="mab-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="mab-strip-item"><span class="mab-strip-label">Phone / WhatsApp</span><span class="mab-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="mab-strip-item"><span class="mab-strip-label">Payment</span><span class="mab-strip-value">Cash · POS · Bank Transfer · Paystack</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I am looking for motorcycle accessories at ${ctx.displayName}.`);
  return `${CSS}
<section class="mab-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Your trusted motorcycle accessories supplier — helmets, tyres &amp; more</p>
</section>
<div class="mab-about-body">
  <p class="mab-about-desc">${esc(description ?? `${ctx.displayName} is a CAC-registered motorcycle accessories shop supplying FRSC-approved helmets, tyres, mirrors, lights, fairings, and spare parts for okada riders, keke operators, and dispatch companies. We serve individual riders and corporate dispatch fleets. Stock sourced from quality-verified importers. SON conformity certificates available on request.`)}</p>
  <div class="mab-detail-list">
    ${placeName ? `<div class="mab-detail-row"><span class="mab-detail-label">Shop Address</span><span class="mab-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="mab-detail-row"><span class="mab-detail-label">Phone</span><span class="mab-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="mab-detail-row"><span class="mab-detail-label">Email</span><span class="mab-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="mab-detail-row"><span class="mab-detail-label">Stock</span><span class="mab-detail-value">Helmets · Tyres · Mirrors · Lights · Fairings · Engine parts</span></div>
    <div class="mab-detail-row"><span class="mab-detail-label">Compliance</span><span class="mab-detail-value">FRSC-approved helmets · CAC registered · SON conformity</span></div>
    <div class="mab-detail-row"><span class="mab-detail-label">Payment</span><span class="mab-detail-value">Cash, POS, Bank Transfer, Paystack</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="mab-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}
    <a class="mab-primary-btn" href="/services">Browse Catalogue</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I am looking for motorcycle accessories at ${ctx.displayName}. Please send your catalogue and prices.`);
  const grid = offerings.length === 0
    ? `<div class="mab-empty"><p>Our full accessories catalogue is available via WhatsApp.<br/>Send us your motorcycle model and the item you need — we will confirm stock and price.</p><br/><a class="mab-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Ask About Stock</a></div>`
    : `<div class="mab-grid">${offerings.map(o => `
    <div class="mab-card">
      <h3 class="mab-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="mab-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="mab-item-price">Price on enquiry</span>` : `<span class="mab-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="mab-svc-hero">
  <h1>Accessories Catalogue</h1>
  <p class="mab-svc-sub">${esc(ctx.displayName)} — FRSC-approved helmets, tyres &amp; parts. Prices in ₦.</p>
</section>
<section>${grid}</section>
<div class="mab-cta-strip">
  <h3>Looking for a specific item?</h3>
  <p>WhatsApp us your motorcycle model and the part or accessory you need — we respond same day.</p>
  <div class="mab-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="mab-wa-btn">${waSvg()} Ask About Stock</a>` : ''}
    <a class="mab-sec-btn" href="/contact">Find Our Shop</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I need motorcycle accessories at ${ctx.displayName}. Item: [item name]. Motorcycle model: [model].`);
  return `${CSS}
<section class="mab-contact-hero">
  <h1>Find Our Shop</h1>
  <p>Visit ${esc(ctx.displayName)} or WhatsApp us your requirements — FRSC helmets, tyres, and all rider accessories.</p>
</section>
${waHref ? `<div class="mab-wa-block">
  <p>WhatsApp us your motorcycle model and the accessory you need. We confirm stock and price immediately.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="mab-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp Now</a>
</div>` : ''}
<div class="mab-contact-layout">
  <div class="mab-contact-info">
    <h2>Our Shop</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">We accept: Cash · POS · Bank Transfer · Paystack</p>
    <p style="margin-top:.75rem"><a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Browse our catalogue &rarr;</a></p>
  </div>
  <div class="mab-form-wrapper">
    <h2>Accessories Enquiry</h2>
    <form class="mab-form" method="POST" action="/contact" id="mabContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="mab-form-group"><label for="mab-name">Your name</label><input id="mab-name" name="name" type="text" required autocomplete="name" class="mab-input" placeholder="e.g. Chukwudi Eze" /></div>
      <div class="mab-form-group"><label for="mab-phone">Phone / WhatsApp</label><input id="mab-phone" name="phone" type="tel" autocomplete="tel" class="mab-input" placeholder="0803 000 0000" /></div>
      <div class="mab-form-group"><label for="mab-msg">Item needed &amp; motorcycle model</label><textarea id="mab-msg" name="message" required rows="4" class="mab-input mab-textarea" placeholder="e.g. FRSC-approved full-face helmet, size XL. Also need rear tyre for Qlink 125cc."></textarea></div>
      <div class="mab-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="mab-ndpr-check"><input type="checkbox" id="mab-consent" name="ndpr_consent" value="yes" required /><label for="mab-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="mab-submit">Send Enquiry</button>
    </form>
    <div id="mabContactSuccess" class="mab-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will confirm stock and pricing shortly. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('mabContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('mabContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const motorcycleAccessoriesMotoAccessoriesShopTemplate: WebsiteTemplateContract = {
  slug: 'motorcycle-accessories-moto-accessories-shop',
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
