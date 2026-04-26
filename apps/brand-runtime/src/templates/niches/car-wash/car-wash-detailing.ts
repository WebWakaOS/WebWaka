/**
 * Car Wash / Auto Detailing Site — Pillar 3 Website Template
 * Niche ID: P3-car-wash-car-wash-detailing
 * Vertical: car-wash (priority=3, medium)
 * Category: commerce/automotive
 * Family: NF-COM-AUT (variant of used-car-dealer)
 * Research brief: docs/templates/research/car-wash-car-wash-detailing-brief.md
 * Nigeria-First Priority: medium
 * Regulatory signals: LASEPA wastewater compliance, CAC
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to book a car wash. Can you help?')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.cw-hero{text-align:center;padding:2.75rem 0 2rem}
.cw-logo{height:80px;width:80px;object-fit:cover;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.cw-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.cw-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.cw-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.cw-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.cw-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.cw-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.cw-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.cw-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.cw-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.cw-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.cw-section{margin-top:2.75rem}
.cw-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.cw-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.cw-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.cw-item-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.cw-item-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.cw-item-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.cw-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.cw-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.cw-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.cw-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.cw-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.cw-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.cw-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.cw-strip-item{display:flex;flex-direction:column;gap:.2rem}
.cw-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.cw-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.cw-strip-value a{color:var(--ww-primary)}
.cw-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.cw-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.cw-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.cw-contact-layout{grid-template-columns:1fr 1fr}}
.cw-contact-info h2,.cw-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.cw-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.cw-contact-info a{color:var(--ww-primary);font-weight:600}
.cw-form{display:flex;flex-direction:column;gap:.875rem}
.cw-form-group{display:flex;flex-direction:column;gap:.375rem}
.cw-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.cw-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.cw-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.cw-textarea{min-height:100px;resize:vertical}
.cw-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.cw-ndpr a{color:var(--ww-primary)}
.cw-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.cw-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.cw-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.cw-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.cw-submit:hover{filter:brightness(1.1)}
.cw-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.cw-about-hero{text-align:center;padding:2.5rem 0 2rem}
.cw-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.cw-about-body{max-width:44rem;margin:0 auto}
.cw-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.cw-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.cw-detail-row{display:flex;gap:1rem;align-items:flex-start}
.cw-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.cw-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.cw-detail-value a{color:var(--ww-primary);font-weight:600}
.cw-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.cw-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.cw-svc-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.cw-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.cw-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.cw-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.cw-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.cw-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.cw-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.cw-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.cw-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.cw-ctas{flex-direction:column;align-items:stretch}.cw-primary-btn,.cw-sec-btn,.cw-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I would like to book a car wash at ${ctx.displayName}.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="cw-hero">
  ${ctx.logoUrl ? `<img class="cw-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="cw-badge">🚿 ${esc(category ?? 'Car Wash')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="cw-tagline">${esc(tagline ?? `Spotless every time — professional car wash &amp; detailing in ${placeName ?? 'Nigeria'}. Book your wash via WhatsApp.`)}</p>
  <div class="cw-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cw-wa-btn">${waSvg()} Book via WhatsApp</a>` : ''}
    <a class="cw-primary-btn" href="/services">View Packages</a>
    <a class="cw-sec-btn" href="/contact">Find Us</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="cw-section">
  <h2 class="cw-section-title">Wash &amp; Detailing Packages</h2>
  <div class="cw-grid">
    ${featured.map(o => `
    <div class="cw-card">
      <h3 class="cw-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="cw-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="cw-item-price">Price on enquiry</span>` : `<span class="cw-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">View all packages &rarr;</a>` : ''}
</section>` : ''}
<div class="cw-trust-strip">
  <span class="cw-trust-badge"><span class="cw-dot"></span> CAC Registered</span>
  <span class="cw-trust-badge"><span class="cw-dot"></span> Eco-Friendly Products</span>
  <span class="cw-trust-badge"><span class="cw-dot"></span> Fleet Packages Available</span>
  <span class="cw-trust-badge"><span class="cw-dot"></span> LASEPA Compliant</span>
</div>
${bioExcerpt ? `
<div class="cw-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="cw-contact-strip">
  ${placeName ? `<div class="cw-strip-item"><span class="cw-strip-label">Location</span><span class="cw-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="cw-strip-item"><span class="cw-strip-label">Phone / WhatsApp</span><span class="cw-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="cw-strip-item"><span class="cw-strip-label">Payment</span><span class="cw-strip-value">Cash · POS · Bank Transfer · Paystack</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to learn more about ${ctx.displayName}'s wash packages.`);
  return `${CSS}
<section class="cw-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Spotless results, every visit — professional car wash &amp; detailing</p>
</section>
<div class="cw-about-body">
  <p class="cw-about-desc">${esc(description ?? `${ctx.displayName} is a CAC-registered car wash and auto detailing centre delivering spotless results for Nigerian drivers. We offer hand wash, full detail, foam wash, interior vacuuming, engine bay cleaning, and ceramic coat application. LASEPA-compliant wastewater management. Fleet contracts available for corporate clients. Saturday morning bookings recommended — book ahead via WhatsApp.`)}</p>
  <div class="cw-detail-list">
    ${placeName ? `<div class="cw-detail-row"><span class="cw-detail-label">Address</span><span class="cw-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="cw-detail-row"><span class="cw-detail-label">Phone</span><span class="cw-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="cw-detail-row"><span class="cw-detail-label">Email</span><span class="cw-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="cw-detail-row"><span class="cw-detail-label">Services</span><span class="cw-detail-value">Hand wash · Full detail · Interior clean · Engine bay · Ceramic coat</span></div>
    <div class="cw-detail-row"><span class="cw-detail-label">Compliance</span><span class="cw-detail-value">CAC registered · LASEPA wastewater compliance</span></div>
    <div class="cw-detail-row"><span class="cw-detail-label">Payment</span><span class="cw-detail-value">Cash, POS, Bank Transfer, Paystack</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cw-wa-btn">${waSvg()} Book via WhatsApp</a>` : ''}
    <a class="cw-primary-btn" href="/services">View Packages</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to book a car wash at ${ctx.displayName}. Please send your available packages and pricing.`);
  const grid = offerings.length === 0
    ? `<div class="cw-empty"><p>Our wash packages start from ₦3,000.<br/>WhatsApp us to book your preferred package and time slot.</p><br/><a class="cw-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Book via WhatsApp</a></div>`
    : `<div class="cw-grid">${offerings.map(o => `
    <div class="cw-card">
      <h3 class="cw-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="cw-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="cw-item-price">Price on enquiry</span>` : `<span class="cw-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="cw-svc-hero">
  <h1>Wash &amp; Detailing Packages</h1>
  <p class="cw-svc-sub">${esc(ctx.displayName)} — all prices in ₦ (Naira)</p>
</section>
<section>${grid}</section>
<div class="cw-cta-strip">
  <h3>Ready to book?</h3>
  <p>WhatsApp us to reserve your slot — Saturday slots fill up fast. Fleet pricing available for 5+ vehicles.</p>
  <div class="cw-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cw-wa-btn">${waSvg()} Book via WhatsApp</a>` : ''}
    <a class="cw-sec-btn" href="/contact">Find Our Location</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to book a car wash at ${ctx.displayName}. Package: [package name]. Vehicle: [type]. Preferred time: [day/time].`);
  return `${CSS}
<section class="cw-contact-hero">
  <h1>Book a Wash</h1>
  <p>Reserve your slot at ${esc(ctx.displayName)} — WhatsApp for fast booking confirmation.</p>
</section>
${waHref ? `<div class="cw-wa-block">
  <p>Book your wash via WhatsApp — send your vehicle type, preferred package, and time slot. Saturday bookings recommended in advance.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cw-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Book via WhatsApp</a>
</div>` : ''}
<div class="cw-contact-layout">
  <div class="cw-contact-info">
    <h2>Find Us</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">We accept: Cash · POS · Bank Transfer · Paystack</p>
    <p style="margin-top:.75rem"><a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">View our wash packages &rarr;</a></p>
  </div>
  <div class="cw-form-wrapper">
    <h2>Booking Enquiry</h2>
    <form class="cw-form" method="POST" action="/contact" id="cwContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="cw-form-group"><label for="cw-name">Your name</label><input id="cw-name" name="name" type="text" required autocomplete="name" class="cw-input" placeholder="e.g. Bola Adeyemi" /></div>
      <div class="cw-form-group"><label for="cw-phone">Phone / WhatsApp</label><input id="cw-phone" name="phone" type="tel" autocomplete="tel" class="cw-input" placeholder="0803 000 0000" /></div>
      <div class="cw-form-group"><label for="cw-msg">Vehicle, package &amp; preferred time</label><textarea id="cw-msg" name="message" required rows="4" class="cw-input cw-textarea" placeholder="e.g. Toyota Camry, full detail package. Preferred: Saturday 9am."></textarea></div>
      <div class="cw-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to process your booking. <a href="/privacy">Privacy Policy</a>.</p><div class="cw-ndpr-check"><input type="checkbox" id="cw-consent" name="ndpr_consent" value="yes" required /><label for="cw-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="cw-submit">Send Booking Request</button>
    </form>
    <div id="cwContactSuccess" class="cw-success" style="display:none" role="status" aria-live="polite"><h3>Booking received!</h3><p>We will confirm your slot shortly. See you soon!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('cwContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('cwContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const carWashCarWashDetailingTemplate: WebsiteTemplateContract = {
  slug: 'car-wash-car-wash-detailing',
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
