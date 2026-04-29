/**
 * Tyre Shop / Vulcanizer Site — Pillar 3 Website Template
 * Niche ID: P3-tyre-shop-tyre-shop-service
 * Vertical: tyre-shop (priority=3, high)
 * Category: commerce/automotive
 * Family: NF-COM-AUT (variant of used-car-dealer)
 * Research brief: docs/templates/research/tyre-shop-tyre-shop-service-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: FRSC road safety compliance, SON import conformity, CAC
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need tyre service. Can you help?')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.tys-hero{text-align:center;padding:2.75rem 0 2rem}
.tys-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.tys-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.tys-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.tys-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.tys-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.tys-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.tys-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.tys-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.tys-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.tys-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.tys-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.tys-section{margin-top:2.75rem}
.tys-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.tys-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.tys-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.tys-item-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.tys-item-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.tys-item-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.tys-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.tys-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.tys-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.tys-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.tys-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.tys-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.tys-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.tys-strip-item{display:flex;flex-direction:column;gap:.2rem}
.tys-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.tys-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.tys-strip-value a{color:var(--ww-primary)}
.tys-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.tys-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.tys-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.tys-contact-layout{grid-template-columns:1fr 1fr}}
.tys-contact-info h2,.tys-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.tys-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.tys-contact-info a{color:var(--ww-primary);font-weight:600}
.tys-form{display:flex;flex-direction:column;gap:.875rem}
.tys-form-group{display:flex;flex-direction:column;gap:.375rem}
.tys-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.tys-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.tys-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.tys-textarea{min-height:100px;resize:vertical}
.tys-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.tys-ndpr a{color:var(--ww-primary)}
.tys-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.tys-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.tys-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.tys-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.tys-submit:hover{filter:brightness(1.1)}
.tys-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.tys-about-hero{text-align:center;padding:2.5rem 0 2rem}
.tys-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.tys-about-body{max-width:44rem;margin:0 auto}
.tys-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.tys-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.tys-detail-row{display:flex;gap:1rem;align-items:flex-start}
.tys-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.tys-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.tys-detail-value a{color:var(--ww-primary);font-weight:600}
.tys-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.tys-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.tys-svc-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.tys-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.tys-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.tys-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.tys-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.tys-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.tys-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.tys-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.tys-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.tys-ctas{flex-direction:column;align-items:stretch}.tys-primary-btn,.tys-sec-btn,.tys-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I need tyre service at ${ctx.displayName}. Can you help?`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="tys-hero">
  ${ctx.logoUrl ? `<img class="tys-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="tys-badge">🔩 ${esc(category ?? 'Tyre Shop')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="tys-tagline">${esc(tagline ?? `Road-ready tyres in ${placeName ?? 'Nigeria'}. Fitting · Balancing · Alignment · Emergency Patching. FRSC-compliant brands. CAC-registered.`)}</p>
  <div class="tys-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="tys-wa-btn">${waSvg()} Order / Emergency via WhatsApp</a>` : ''}
    <a class="tys-primary-btn" href="/services">View Tyre Prices</a>
    <a class="tys-sec-btn" href="/contact">Find Our Shop</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="tys-section">
  <h2 class="tys-section-title">Tyres &amp; Services in Stock</h2>
  <div class="tys-grid">
    ${featured.map(o => `
    <div class="tys-card">
      <h3 class="tys-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="tys-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="tys-item-price">Price on enquiry</span>` : `<span class="tys-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">View full price list &rarr;</a>` : ''}
</section>` : ''}
<div class="tys-trust-strip">
  <span class="tys-trust-badge"><span class="tys-dot"></span> FRSC-Compliant Brands</span>
  <span class="tys-trust-badge"><span class="tys-dot"></span> CAC Registered</span>
  <span class="tys-trust-badge"><span class="tys-dot"></span> Emergency Patching</span>
  <span class="tys-trust-badge"><span class="tys-dot"></span> Fleet Contracts Available</span>
</div>
${bioExcerpt ? `
<div class="tys-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="tys-contact-strip">
  ${placeName ? `<div class="tys-strip-item"><span class="tys-strip-label">Shop Location</span><span class="tys-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="tys-strip-item"><span class="tys-strip-label">Phone / WhatsApp</span><span class="tys-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="tys-strip-item"><span class="tys-strip-label">Payment</span><span class="tys-strip-value">Cash · POS · Bank Transfer · Paystack</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to know more about tyre services at ${ctx.displayName}.`);
  return `${CSS}
<section class="tys-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Your road-safety tyre partner — fitting, balancing &amp; alignment</p>
</section>
<div class="tys-about-body">
  <p class="tys-about-desc">${esc(description ?? `${ctx.displayName} is a CAC-registered tyre shop offering professional fitting, balancing, wheel alignment, and emergency patching services. We stock FRSC-compliant tyre brands including Michelin, Bridgestone, Dunlop, and affordable Asian brands. Emergency roadside patching available. Fleet contracts welcome for transport companies, logistics firms, and corporate fleets.`)}</p>
  <div class="tys-detail-list">
    ${placeName ? `<div class="tys-detail-row"><span class="tys-detail-label">Shop Address</span><span class="tys-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="tys-detail-row"><span class="tys-detail-label">Phone</span><span class="tys-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="tys-detail-row"><span class="tys-detail-label">Email</span><span class="tys-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="tys-detail-row"><span class="tys-detail-label">Brands</span><span class="tys-detail-value">Michelin · Bridgestone · Dunlop · Continental · Asian brands</span></div>
    <div class="tys-detail-row"><span class="tys-detail-label">Services</span><span class="tys-detail-value">Fitting · Balancing · Alignment · Patching · Nitrogen inflation</span></div>
    <div class="tys-detail-row"><span class="tys-detail-label">Payment</span><span class="tys-detail-value">Cash, POS, Bank Transfer, Paystack</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="tys-wa-btn">${waSvg()} Contact via WhatsApp</a>` : ''}
    <a class="tys-primary-btn" href="/services">View Tyre Prices</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I need a tyre at ${ctx.displayName}. Please send your price list and available sizes.`);
  const grid = offerings.length === 0
    ? `<div class="tys-empty"><p>Our full tyre price list is available on request.<br/>WhatsApp us your vehicle type and tyre size for immediate pricing.</p><br/><a class="tys-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} WhatsApp for Price List</a></div>`
    : `<div class="tys-grid">${offerings.map(o => `
    <div class="tys-card">
      <h3 class="tys-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="tys-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="tys-item-price">Price on enquiry</span>` : `<span class="tys-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="tys-svc-hero">
  <h1>Tyre Price List</h1>
  <p class="tys-svc-sub">${esc(ctx.displayName)} — all prices in ₦ (Naira). Fitting &amp; balancing included.</p>
</section>
<section>${grid}</section>
<div class="tys-cta-strip">
  <h3>Need a specific size or brand?</h3>
  <p>WhatsApp us your vehicle make, model, and tyre size — we will confirm stock and price immediately.</p>
  <div class="tys-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="tys-wa-btn">${waSvg()} WhatsApp for Quote</a>` : ''}
    <a class="tys-sec-btn" href="/contact">Find Our Shop</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I need tyre service at ${ctx.displayName}. Vehicle: [make/model]. Tyre size: [size]. Service needed: [fitting/patching/alignment].`);
  return `${CSS}
<section class="tys-contact-hero">
  <h1>Find Our Shop</h1>
  <p>Visit ${esc(ctx.displayName)} for road-ready tyres — or WhatsApp for emergency patching and pricing.</p>
</section>
${waHref ? `<div class="tys-wa-block">
  <p>For emergency tyre help or pricing, WhatsApp us your vehicle details and location. We respond fast.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="tys-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp Now</a>
</div>` : ''}
<div class="tys-contact-layout">
  <div class="tys-contact-info">
    <h2>Our Shop</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">We accept: Cash · POS · Bank Transfer · Paystack</p>
    <p style="margin-top:.75rem"><a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">View tyre price list &rarr;</a></p>
  </div>
  <div class="tys-form-wrapper">
    <h2>Tyre Enquiry</h2>
    <form class="tys-form" method="POST" action="/contact" id="tysContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="tys-form-group"><label for="tys-name">Your name</label><input id="tys-name" name="name" type="text" required autocomplete="name" class="tys-input" placeholder="e.g. Olumide Adeyemi" /></div>
      <div class="tys-form-group"><label for="tys-phone">Phone / WhatsApp</label><input id="tys-phone" name="phone" type="tel" autocomplete="tel" class="tys-input" placeholder="0803 000 0000" /></div>
      <div class="tys-form-group"><label for="tys-msg">Vehicle, tyre size &amp; service needed</label><textarea id="tys-msg" name="message" required rows="4" class="tys-input tys-textarea" placeholder="e.g. Toyota Corolla 2016, need 205/55R16 tyres (2 pieces), fitting and balancing. Location: Ikeja Lagos."></textarea></div>
      <div class="tys-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your tyre enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="tys-ndpr-check"><input type="checkbox" id="tys-consent" name="ndpr_consent" value="yes" required /><label for="tys-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="tys-submit">Send Enquiry</button>
    </form>
    <div id="tysContactSuccess" class="tys-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will confirm tyre availability and pricing shortly. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('tysContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('tysContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const tyreShopTyreShopServiceTemplate: WebsiteTemplateContract = {
  slug: 'tyre-shop-tyre-shop-service',
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
