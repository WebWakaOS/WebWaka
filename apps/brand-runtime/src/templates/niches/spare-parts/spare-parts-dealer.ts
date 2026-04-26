/**
 * Spare Parts Dealer Site — Pillar 3 Website Template
 * Niche ID: P3-spare-parts-spare-parts-dealer
 * Vertical: spare-parts (priority=3, critical)
 * Category: commerce/automotive
 * Family: NF-COM-AUT (variant of used-car-dealer)
 * Research brief: docs/templates/research/spare-parts-spare-parts-dealer-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: SON certification (quality parts), CAC, Ladipo/Nnewi provenance marks
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I am looking for a spare part. Can you help?')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.spd-hero{text-align:center;padding:2.75rem 0 2rem}
.spd-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.spd-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.spd-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.spd-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.spd-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.spd-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.spd-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.spd-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.spd-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.spd-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.spd-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.spd-section{margin-top:2.75rem}
.spd-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.spd-parts-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.spd-part-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.spd-part-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.spd-part-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.spd-part-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.spd-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.spd-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.spd-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.spd-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.spd-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.spd-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.spd-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.spd-strip-item{display:flex;flex-direction:column;gap:.2rem}
.spd-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.spd-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.spd-strip-value a{color:var(--ww-primary)}
.spd-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.spd-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.spd-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.spd-contact-layout{grid-template-columns:1fr 1fr}}
.spd-contact-info h2,.spd-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.spd-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.spd-contact-info a{color:var(--ww-primary);font-weight:600}
.spd-form{display:flex;flex-direction:column;gap:.875rem}
.spd-form-group{display:flex;flex-direction:column;gap:.375rem}
.spd-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.spd-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.spd-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.spd-textarea{min-height:100px;resize:vertical}
.spd-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.spd-ndpr a{color:var(--ww-primary)}
.spd-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.spd-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.spd-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.spd-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.spd-submit:hover{filter:brightness(1.1)}
.spd-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.spd-about-hero{text-align:center;padding:2.5rem 0 2rem}
.spd-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.spd-about-body{max-width:44rem;margin:0 auto}
.spd-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.spd-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.spd-detail-row{display:flex;gap:1rem;align-items:flex-start}
.spd-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.spd-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.spd-detail-value a{color:var(--ww-primary);font-weight:600}
.spd-parts-hero{text-align:center;padding:2.5rem 0 2rem}
.spd-parts-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.spd-parts-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.spd-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.spd-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.spd-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.spd-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.spd-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.spd-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.spd-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.spd-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.spd-ctas{flex-direction:column;align-items:stretch}.spd-primary-btn,.spd-sec-btn,.spd-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I am looking for a spare part. Can you help me find it?`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="spd-hero">
  ${ctx.logoUrl ? `<img class="spd-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="spd-badge">🔧 ${esc(category ?? 'Spare Parts Dealer')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="spd-tagline">${esc(tagline ?? `Genuine &amp; quality auto spare parts in ${placeName ?? 'Nigeria'}. Toyota · Honda · Hyundai · Tokunbo &amp; Brand New. Ladipo / Nnewi sourced. CAC-registered.`)}</p>
  <div class="spd-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="spd-wa-btn">${waSvg()} Find a Part via WhatsApp</a>` : ''}
    <a class="spd-primary-btn" href="/services">Browse Parts</a>
    <a class="spd-sec-btn" href="/contact">Find Our Shop</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="spd-section">
  <h2 class="spd-section-title">Parts in Stock</h2>
  <div class="spd-parts-grid">
    ${featured.map(o => `
    <div class="spd-part-card">
      <h3 class="spd-part-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="spd-part-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="spd-part-price">Price on enquiry</span>` : `<span class="spd-part-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">View full parts list &rarr;</a>` : ''}
</section>` : ''}
<div class="spd-trust-strip">
  <span class="spd-trust-badge"><span class="spd-dot"></span> SON Certified Parts</span>
  <span class="spd-trust-badge"><span class="spd-dot"></span> CAC Registered</span>
  <span class="spd-trust-badge"><span class="spd-dot"></span> Ladipo / Nnewi Sourced</span>
  <span class="spd-trust-badge"><span class="spd-dot"></span> Genuine &amp; Tokunbo</span>
</div>
${bioExcerpt ? `
<div class="spd-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="spd-contact-strip">
  ${placeName ? `<div class="spd-strip-item"><span class="spd-strip-label">Shop Location</span><span class="spd-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="spd-strip-item"><span class="spd-strip-label">Phone / WhatsApp</span><span class="spd-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="spd-strip-item"><span class="spd-strip-label">Payment</span><span class="spd-strip-value">Cash · POS · Bank Transfer · Paystack</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I am looking for a spare part and would like to know more about ${ctx.displayName}.`);
  return `${CSS}
<section class="spd-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Your trusted source for genuine and quality auto spare parts</p>
</section>
<div class="spd-about-body">
  <p class="spd-about-desc">${esc(description ?? `${ctx.displayName} is a CAC-registered auto spare parts dealer sourcing genuine and quality-tested parts from Ladipo International Motor Parts Market (Lagos), Nnewi Auto Parts Hub (Anambra), and direct manufacturer importers. We stock parts for Toyota, Honda, Hyundai, Kia, Mitsubishi, Mercedes-Benz, and other popular Nigerian makes. Both brand-new and tokunbo (used but tested) parts available. SON-certified products stocked where available.`)}</p>
  <div class="spd-detail-list">
    ${placeName ? `<div class="spd-detail-row"><span class="spd-detail-label">Shop Address</span><span class="spd-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="spd-detail-row"><span class="spd-detail-label">Phone</span><span class="spd-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="spd-detail-row"><span class="spd-detail-label">Email</span><span class="spd-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="spd-detail-row"><span class="spd-detail-label">Sourcing</span><span class="spd-detail-value">Ladipo Market Lagos · Nnewi Parts Hub · Direct importers</span></div>
    <div class="spd-detail-row"><span class="spd-detail-label">Stock Types</span><span class="spd-detail-value">Brand new · Tokunbo (tested) · Reconditioned</span></div>
    <div class="spd-detail-row"><span class="spd-detail-label">Payment</span><span class="spd-detail-value">Cash, POS, Bank Transfer, Paystack</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="spd-wa-btn">${waSvg()} Find a Part</a>` : ''}
    <a class="spd-primary-btn" href="/services">View Parts List</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I am looking for a spare part at ${ctx.displayName}. Can you help me check availability and price?`);
  const grid = offerings.length === 0
    ? `<div class="spd-empty"><p>Our full parts inventory is best checked via WhatsApp — we source hard-to-find parts daily.<br/>Send us the part name, car model, and year and we will find it for you.</p><br/><a class="spd-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Ask About a Part</a></div>`
    : `<div class="spd-parts-grid">${offerings.map(o => `
    <div class="spd-part-card">
      <h3 class="spd-part-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="spd-part-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="spd-part-price">Price on enquiry</span>` : `<span class="spd-part-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="spd-parts-hero">
  <h1>Parts Catalogue</h1>
  <p class="spd-parts-sub">${esc(ctx.displayName)} — genuine &amp; quality auto spare parts, all prices in ₦</p>
</section>
<section>${grid}</section>
<div class="spd-cta-strip">
  <h3>Can't find your part?</h3>
  <p>We source hard-to-find parts across Ladipo, Nnewi, and direct importers. WhatsApp us the part name, car make, model, and year.</p>
  <div class="spd-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="spd-wa-btn">${waSvg()} Ask About a Part</a>` : ''}
    <a class="spd-sec-btn" href="/contact">Contact Our Shop</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I am looking for a spare part at ${ctx.displayName}. Part name: [your part]. Car: [make/model/year].`);
  return `${CSS}
<section class="spd-contact-hero">
  <h1>Find Our Shop</h1>
  <p>Visit ${esc(ctx.displayName)} or WhatsApp us your part requirements — we source across Ladipo, Nnewi &amp; direct importers.</p>
</section>
${waHref ? `<div class="spd-wa-block">
  <p>The fastest way to check part availability is via WhatsApp. Send us: part name, car make, model, year, and whether you want brand new or tokunbo.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="spd-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Ask About a Part</a>
</div>` : ''}
<div class="spd-contact-layout">
  <div class="spd-contact-info">
    <h2>Our Shop</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">We accept: Cash · POS · Bank Transfer · Paystack</p>
    <p style="margin-top:.75rem"><a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Browse our parts catalogue &rarr;</a></p>
  </div>
  <div class="spd-form-wrapper">
    <h2>Part Enquiry</h2>
    <form class="spd-form" method="POST" action="/contact" id="spdContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="spd-form-group"><label for="spd-name">Your name</label><input id="spd-name" name="name" type="text" required autocomplete="name" class="spd-input" placeholder="e.g. Taiwo Ogunyemi" /></div>
      <div class="spd-form-group"><label for="spd-phone">Phone / WhatsApp</label><input id="spd-phone" name="phone" type="tel" autocomplete="tel" class="spd-input" placeholder="0803 000 0000" /></div>
      <div class="spd-form-group"><label for="spd-msg">Part needed — include car make, model, and year</label><textarea id="spd-msg" name="message" required rows="4" class="spd-input spd-textarea" placeholder="e.g. I need a radiator fan for a 2014 Toyota Camry 2.5L. Please check availability and send price."></textarea></div>
      <div class="spd-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your parts enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="spd-ndpr-check"><input type="checkbox" id="spd-consent" name="ndpr_consent" value="yes" required /><label for="spd-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="spd-submit">Send Enquiry</button>
    </form>
    <div id="spdContactSuccess" class="spd-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will check availability and get back to you shortly with pricing and stock status. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('spdContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('spdContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const sparePartsSparePartsDealerTemplate: WebsiteTemplateContract = {
  slug: 'spare-parts-spare-parts-dealer',
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
