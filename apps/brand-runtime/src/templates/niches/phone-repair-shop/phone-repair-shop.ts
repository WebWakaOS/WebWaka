/**
 * Phone Repair & Accessories Shop Site — Pillar 3 Website Template
 * Niche ID: P3-phone-repair-shop-phone-repair-shop
 * Vertical: phone-repair-shop (priority=3, critical)
 * Category: commerce
 * Family: NF-COM-DIG (standalone)
 * Research brief: docs/templates/research/phone-repair-shop-phone-repair-shop-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: NCC technician certification, FCCPC warranty obligations, SON genuine parts
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtKobo(k: number): string { return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`; }
function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about phone repair.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ } return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.pr-hero{text-align:center;padding:2.75rem 0 2rem}
.pr-logo{height:80px;width:80px;object-fit:cover;border-radius:12px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.pr-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.pr-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.pr-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.pr-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pr-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.pr-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.pr-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.pr-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.pr-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.pr-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.pr-service-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));margin-top:1.5rem}
.pr-service-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.pr-service-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.pr-service-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.pr-service-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.pr-warranty-bar{margin-top:1.75rem;padding:1rem 1.25rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);text-align:center;font-weight:700;font-size:.9375rem}
.pr-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:1.5rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pr-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.pr-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.pr-brands{margin-top:2rem}
.pr-brands h2{font-size:1rem;font-weight:700;margin-bottom:.75rem;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pr-brand-row{display:flex;flex-wrap:wrap;gap:.5rem}
.pr-brand-chip{padding:.375rem .875rem;border-radius:999px;border:1px solid var(--ww-border);font-size:.8125rem;font-weight:600;color:var(--ww-text);background:var(--ww-bg-surface)}
.pr-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pr-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.pr-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.pr-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.pr-strip-item{display:flex;flex-direction:column;gap:.2rem}
.pr-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pr-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.pr-strip-value a{color:var(--ww-primary)}
.pr-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.pr-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.pr-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.pr-contact-layout{grid-template-columns:1fr 1fr}}
.pr-contact-info h2,.pr-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.pr-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.pr-contact-info a{color:var(--ww-primary);font-weight:600}
.pr-form{display:flex;flex-direction:column;gap:.875rem}
.pr-form-group{display:flex;flex-direction:column;gap:.375rem}
.pr-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.pr-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.pr-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.pr-textarea{min-height:100px;resize:vertical}
.pr-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.pr-ndpr a{color:var(--ww-primary)}
.pr-ndpr-check{display:flex;align-items:flex-start;gap:.5rem;margin-top:.5rem}
.pr-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.pr-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.pr-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.pr-submit:hover{filter:brightness(1.1)}
.pr-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.pr-success h3{font-weight:700;margin-bottom:.25rem}
.pr-about-hero{text-align:center;padding:2.5rem 0 2rem}
.pr-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pr-about-body{max-width:44rem;margin:0 auto}
.pr-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:1.5rem;font-size:1rem}
.pr-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.pr-detail-row{display:flex;gap:1rem;align-items:flex-start}
.pr-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.pr-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.pr-detail-value a{color:var(--ww-primary);font-weight:600}
.pr-services-hero{text-align:center;padding:2.5rem 0 2rem}
.pr-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pr-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.pr-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.pr-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.pr-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.pr-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pr-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.pr-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pr-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.pr-ctas{flex-direction:column;align-items:stretch}.pr-primary-btn,.pr-sec-btn,.pr-wa-btn{width:100%;justify-content:center}}
</style>`;

const BRANDS = ['Apple (iPhone)','Samsung','Tecno','Infinix','itel','Nokia','Huawei','Xiaomi','Oppo','Vivo'];

type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const featured = offerings.slice(0,6);
  const waHref = whatsappLink(phone, `Hello! I have a phone that needs repair. Can I send you a photo of the fault?`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="pr-hero">
  ${ctx.logoUrl ? `<img class="pr-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="pr-cat-badge">📱 Phone Repair Shop</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="pr-tagline">${esc(tagline ?? `Fast. Reliable. Guaranteed phone repairs${placeName ? ` in ${placeName}` : ''}. Screen, battery, charging port, software &amp; more.`)}</p>
  <div class="pr-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pr-wa-btn">${waSvg()} Send Fault Photo</a>` : ''}
    <a class="pr-primary-btn" href="/services">See Repair Prices</a>
    <a class="pr-sec-btn" href="/contact">Find Our Location</a>
  </div>
</section>
<div class="pr-warranty-bar">✅ 90-Day Warranty on All Repairs &nbsp;|&nbsp; Original OEM Parts Used &nbsp;|&nbsp; Same-Day Repair for Most Faults</div>
${featured.length > 0 ? `
<section style="margin-top:2rem">
  <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.875rem;color:var(--ww-primary)">Repair Services &amp; Prices</h2>
  <div class="pr-service-grid">
    ${featured.map(o => `<div class="pr-service-card"><h3 class="pr-service-name">${esc(o.name)}</h3>${o.description ? `<p class="pr-service-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="pr-service-price">Price on request</span>` : `<span class="pr-service-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}
  </div>
</section>` : ''}
<div class="pr-trust-strip">
  <span class="pr-badge"><span class="pr-dot"></span> NCC Certified Technicians</span>
  <span class="pr-badge"><span class="pr-dot"></span> 90-Day Warranty</span>
  <span class="pr-badge"><span class="pr-dot"></span> Original OEM Parts</span>
  <span class="pr-badge"><span class="pr-dot"></span> FCCPC Consumer Rights</span>
</div>
<div class="pr-brands">
  <h2>Brands We Fix</h2>
  <div class="pr-brand-row">${BRANDS.map(b => `<span class="pr-brand-chip">${esc(b)}</span>`).join('')}</div>
</div>
${bioExcerpt ? `<div class="pr-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bioExcerpt)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a></div>` : ''}
${(phone || placeName) ? `<div class="pr-contact-strip">
  ${placeName ? `<div class="pr-strip-item"><span class="pr-strip-label">Workshop</span><span class="pr-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="pr-strip-item"><span class="pr-strip-label">Phone</span><span class="pr-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="pr-strip-item"><span class="pr-strip-label">Payment</span><span class="pr-strip-value">Cash · POS · Bank Transfer</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I have a phone fault — can you help? Can I send a photo?`);
  return `${CSS}
<section class="pr-about-hero"><h1>About ${esc(ctx.displayName)}</h1><p style="color:var(--ww-text-muted);margin-top:.5rem">Your trusted phone repair experts — fast, reliable, guaranteed</p></section>
<div class="pr-about-body">
  <p class="pr-about-desc">${esc(description ?? `${ctx.displayName} is a professional phone repair workshop serving customers across our area. Our NCC-certified technicians fix all major brands — Apple, Samsung, Tecno, Infinix, itel, and more — using original OEM parts backed by a 90-day warranty. We offer same-day repair for most common faults.`)}</p>
  <div class="pr-detail-list">
    ${placeName ? `<div class="pr-detail-row"><span class="pr-detail-label">Workshop</span><span class="pr-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="pr-detail-row"><span class="pr-detail-label">Phone</span><span class="pr-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="pr-detail-row"><span class="pr-detail-label">Email</span><span class="pr-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="pr-detail-row"><span class="pr-detail-label">Warranty</span><span class="pr-detail-value">90-day warranty on all repairs</span></div>
    <div class="pr-detail-row"><span class="pr-detail-label">Parts</span><span class="pr-detail-value">Original OEM parts used on all repairs</span></div>
    <div class="pr-detail-row"><span class="pr-detail-label">Payment</span><span class="pr-detail-value">Cash, POS, Bank Transfer</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pr-wa-btn">${waSvg()} Send Fault Photo</a>` : ''}
    <a class="pr-primary-btn" href="/services">Repair Prices</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I want to know the repair price for my phone. Can I send a photo of the fault?`);
  const defaultServices = [
    {name:'Screen Replacement (Android)',desc:'Tecno, Infinix, Samsung, Oppo, Xiaomi — display + digitizer assembly',price:'From ₦8,000'},
    {name:'Screen Replacement (iPhone)',desc:'iPhone 11–15 series. Original LCD or OLED restoration. Call for exact model price.',price:'From ₦25,000'},
    {name:'Battery Replacement',desc:'All brands. Genuine battery, restored battery health, 90-day warranty.',price:'From ₦5,000'},
    {name:'Charging Port Repair',desc:'Loose/broken charging port — USB-C, Lightning, micro-USB. Same-day fix.',price:'From ₦3,500'},
    {name:'Network / SIM Unlock',desc:'Network unlock and SIM card issues resolved. Software-level solution.',price:'From ₦2,500'},
    {name:'Water Damage Recovery',desc:'Device immersion recovery — board cleaning, component drying, diagnostics.',price:'From ₦8,000'},
    {name:'Software / OS Flash',desc:'Factory reset, OS reinstall, virus removal, hanging/frozen phone fix.',price:'From ₦2,000'},
    {name:'Speaker / Microphone',desc:'No sound, muffled audio, microphone fault — component replacement.',price:'From ₦4,000'},
  ];
  const grid = offerings.length === 0
    ? `<div class="pr-service-grid">${defaultServices.map(s => `<div class="pr-service-card"><h3 class="pr-service-name">${esc(s.name)}</h3><p class="pr-service-desc">${esc(s.desc)}</p><span class="pr-service-price">${esc(s.price)}</span></div>`).join('')}</div>`
    : `<div class="pr-service-grid">${offerings.map(o => `<div class="pr-service-card"><h3 class="pr-service-name">${esc(o.name)}</h3>${o.description ? `<p class="pr-service-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="pr-service-price">Price on request</span>` : `<span class="pr-service-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="pr-services-hero"><h1>Repair Services &amp; Prices</h1><p class="pr-services-sub">All prices in ₦ (Naira) — 90-day warranty on all repairs</p></section>
<section>${grid}</section>
<div class="pr-cta-strip"><h3>Not sure what's wrong?</h3><p>WhatsApp us a photo of your phone fault — we'll diagnose it free of charge and give you a price before you come in.</p>
<div class="pr-btn-row">${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pr-wa-btn">${waSvg()} Send Fault Photo</a>` : ''}<a class="pr-sec-btn" href="/contact">Find Our Location</a></div></div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! My phone has a fault and I want to get it repaired. Can I send a photo of the problem?`);
  return `${CSS}
<section class="pr-contact-hero"><h1>Get Your Phone Fixed</h1><p>Walk in or WhatsApp your fault photo first — we'll give you a price before you come to ${esc(ctx.displayName)}.</p></section>
${waHref ? `<div class="pr-wa-block"><p>The fastest way to get a quote — WhatsApp us a photo of your phone fault. We diagnose it and tell you the repair price instantly.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pr-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Send Fault Photo on WhatsApp</a></div>` : ''}
<div class="pr-contact-layout">
  <div class="pr-contact-info">
    <h2>Find Our Workshop</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Workshop details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Cash · POS · Bank Transfer</p>
    <p style="margin-top:.75rem"><a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">View repair prices &rarr;</a></p>
  </div>
  <div class="pr-form-wrapper">
    <h2>Send an Enquiry</h2>
    <form class="pr-form" method="POST" action="/contact" id="prContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pr-form-group"><label for="pr-name">Your name</label><input id="pr-name" name="name" type="text" required autocomplete="name" class="pr-input" placeholder="e.g. Tunde Akindele" /></div>
      <div class="pr-form-group"><label for="pr-phone">Phone / WhatsApp</label><input id="pr-phone" name="phone" type="tel" autocomplete="tel" class="pr-input" placeholder="0803 000 0000" /></div>
      <div class="pr-form-group"><label for="pr-device">Device &amp; fault</label><input id="pr-device" name="device" type="text" class="pr-input" placeholder="e.g. iPhone 13 — cracked screen" /></div>
      <div class="pr-form-group"><label for="pr-msg">More details</label><textarea id="pr-msg" name="message" required rows="3" class="pr-input pr-textarea" placeholder="e.g. Screen is cracked but still shows. Need urgent fix today."></textarea></div>
      <div class="pr-ndpr"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your repair enquiry. <a href="/privacy">Privacy Policy</a>.<div class="pr-ndpr-check"><input type="checkbox" id="pr-consent" name="ndpr_consent" value="yes" required /><label for="pr-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="pr-submit">Send Enquiry</button>
    </form>
    <div id="prContactSuccess" class="pr-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will respond with a quote for your repair shortly. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('prContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('prContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const phoneRepairShopPhoneRepairShopTemplate: WebsiteTemplateContract = {
  slug: 'phone-repair-shop-phone-repair-shop',
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
