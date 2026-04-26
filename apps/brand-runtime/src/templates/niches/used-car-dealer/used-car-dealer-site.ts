/**
 * Used Car Dealer / Auto Trader Site — Pillar 3 Website Template
 * Niche ID: P3-used-car-dealer-used-car-dealer-site
 * Vertical: used-car-dealer (priority=3, critical)
 * Category: commerce
 * Family: NF-COM-AUT (anchor)
 * Research brief: docs/templates/research/used-car-dealer-used-car-dealer-site-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: NCS customs clearance, FRSC road worthiness, CAC, FCCPC warranty
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtKobo(k: number): string { return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`; }
function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about a car.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ } return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.uc-hero{text-align:center;padding:2.75rem 0 2rem}
.uc-logo{height:80px;width:80px;object-fit:contain;border-radius:12px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.uc-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.uc-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.uc-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.uc-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.uc-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.uc-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.uc-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.uc-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.uc-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.uc-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.uc-cars-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));margin-top:1.5rem}
.uc-car-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);background:var(--ww-bg-surface);overflow:hidden;display:flex;flex-direction:column}
.uc-car-img{width:100%;height:140px;object-fit:cover;background:var(--ww-bg);display:block}
.uc-car-img-placeholder{width:100%;height:140px;background:var(--ww-border);display:flex;align-items:center;justify-content:center;font-size:2rem}
.uc-car-body{padding:1.125rem;flex:1;display:flex;flex-direction:column;gap:.375rem}
.uc-car-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.uc-car-meta{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.55;flex:1}
.uc-car-price{font-size:1.0625rem;font-weight:900;color:var(--ww-primary);margin-top:.25rem}
.uc-car-cta{display:inline-flex;align-items:center;gap:.375rem;font-size:.875rem;font-weight:600;color:#25D366;text-decoration:none;margin-top:.5rem}
.uc-trust-bar{margin-top:1.75rem;display:flex;flex-wrap:wrap;gap:.75rem;padding:1.125rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:.875rem;font-weight:700;justify-content:center;gap:.5rem 1.5rem}
.uc-trust-item{display:flex;align-items:center;gap:.35rem;white-space:nowrap}
.uc-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.uc-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.uc-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.uc-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.uc-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.uc-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.uc-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.uc-strip-item{display:flex;flex-direction:column;gap:.2rem}
.uc-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.uc-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.uc-strip-value a{color:var(--ww-primary)}
.uc-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.uc-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.uc-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.uc-contact-layout{grid-template-columns:1fr 1fr}}
.uc-contact-info h2,.uc-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.uc-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.uc-contact-info a{color:var(--ww-primary);font-weight:600}
.uc-form{display:flex;flex-direction:column;gap:.875rem}
.uc-form-group{display:flex;flex-direction:column;gap:.375rem}
.uc-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.uc-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.uc-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.uc-textarea{min-height:100px;resize:vertical}
.uc-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.uc-ndpr a{color:var(--ww-primary)}
.uc-ndpr-check{display:flex;align-items:flex-start;gap:.5rem;margin-top:.5rem}
.uc-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.uc-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.uc-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.uc-submit:hover{filter:brightness(1.1)}
.uc-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.uc-success h3{font-weight:700;margin-bottom:.25rem}
.uc-about-hero{text-align:center;padding:2.5rem 0 2rem}
.uc-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.uc-about-body{max-width:44rem;margin:0 auto}
.uc-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:1.5rem;font-size:1rem}
.uc-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.uc-detail-row{display:flex;gap:1rem;align-items:flex-start}
.uc-detail-label{font-size:.875rem;font-weight:700;min-width:9rem;color:var(--ww-text);flex-shrink:0}
.uc-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.uc-detail-value a{color:var(--ww-primary);font-weight:600}
.uc-services-hero{text-align:center;padding:2.5rem 0 2rem}
.uc-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.uc-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.uc-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.uc-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.uc-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.uc-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.uc-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.uc-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.uc-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.uc-ctas{flex-direction:column;align-items:stretch}.uc-primary-btn,.uc-sec-btn,.uc-wa-btn{width:100%;justify-content:center}}
</style>`;

type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const featured = offerings.slice(0,6);
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about a car at ${ctx.displayName}. Please share what you have in stock.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="uc-hero">
  ${ctx.logoUrl ? `<img class="uc-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="uc-cat-badge">🚗 Used Car Dealer</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="uc-tagline">${esc(tagline ?? `Trusted Tokunbo cars — NCS cleared, FRSC certified${placeName ? ` in ${placeName}` : ''}. No surprises. Just good cars.`)}</p>
  <div class="uc-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="uc-wa-btn">${waSvg()} Enquire on WhatsApp</a>` : ''}
    <a class="uc-primary-btn" href="/services">View Our Stock</a>
    <a class="uc-sec-btn" href="/contact">Visit Our Yard</a>
  </div>
</section>
<div class="uc-trust-bar">
  <span class="uc-trust-item">✅ NCS Customs Cleared</span>
  <span class="uc-trust-item">✅ FRSC Road Worthy</span>
  <span class="uc-trust-item">✅ VIN Verification Available</span>
  <span class="uc-trust-item">✅ CAC Registered Dealer</span>
</div>
${featured.length > 0 ? `
<section style="margin-top:2rem">
  <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.875rem;color:var(--ww-primary)">Current Stock</h2>
  <div class="uc-cars-grid">
    ${featured.map(o => {
      const waLink = whatsappLink(phone, `Hello! I am interested in the ${esc(o.name)} you have in stock. Please tell me more.`);
      return `<div class="uc-car-card"><div class="uc-car-img-placeholder">🚗</div><div class="uc-car-body"><h3 class="uc-car-name">${esc(o.name)}</h3><p class="uc-car-meta">${o.description ? esc(o.description) : 'Tokunbo. NCS Cleared. FRSC Certified.'}</p><div class="uc-car-price">${o.priceKobo === null ? 'Contact for price' : fmtKobo(o.priceKobo)}</div>${waLink ? `<a href="${waLink}" target="_blank" rel="noopener noreferrer" class="uc-car-cta">${waSvg()} Enquire</a>` : ''}</div></div>`;
    }).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">Full stock list &rarr;</a>` : ''}
</section>` : ''}
<div class="uc-trust-strip">
  <span class="uc-badge"><span class="uc-dot"></span> NCS Customs Cleared</span>
  <span class="uc-badge"><span class="uc-dot"></span> FRSC Road Worthy</span>
  <span class="uc-badge"><span class="uc-dot"></span> VIN Verification</span>
  <span class="uc-badge"><span class="uc-dot"></span> MVADOP / ADVAN</span>
</div>
${bioExcerpt ? `<div class="uc-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bioExcerpt)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a></div>` : ''}
${(phone || placeName) ? `<div class="uc-contact-strip">
  ${placeName ? `<div class="uc-strip-item"><span class="uc-strip-label">Motor Yard</span><span class="uc-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="uc-strip-item"><span class="uc-strip-label">Dealer Line</span><span class="uc-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="uc-strip-item"><span class="uc-strip-label">Payment</span><span class="uc-strip-value">Bank Transfer · Paystack · Hire-Purchase</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about a car at ${ctx.displayName}.`);
  return `${CSS}
<section class="uc-about-hero"><h1>About ${esc(ctx.displayName)}</h1><p style="color:var(--ww-text-muted);margin-top:.5rem">Trusted Tokunbo Cars. Verified &amp; Cleared.</p></section>
<div class="uc-about-body">
  <p class="uc-about-desc">${esc(description ?? `${ctx.displayName} is a trusted used car dealer with a verified stock of NCS customs-cleared and FRSC road-worthy Tokunbo vehicles. We source from Cotonou, the USA, and UK, covering brands like Toyota, Honda, Nissan, Hyundai, Ford, and more. Every car comes with customs papers, and we offer VIN verification for buyer confidence.`)}</p>
  <div class="uc-detail-list">
    ${placeName ? `<div class="uc-detail-row"><span class="uc-detail-label">Motor Yard</span><span class="uc-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="uc-detail-row"><span class="uc-detail-label">Dealer Line</span><span class="uc-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="uc-detail-row"><span class="uc-detail-label">Email</span><span class="uc-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="uc-detail-row"><span class="uc-detail-label">Compliance</span><span class="uc-detail-value">NCS Customs Cleared &amp; FRSC Road Worthy on all vehicles</span></div>
    <div class="uc-detail-row"><span class="uc-detail-label">VIN Check</span><span class="uc-detail-value">VIN verification available before purchase</span></div>
    <div class="uc-detail-row"><span class="uc-detail-label">Payment</span><span class="uc-detail-value">Bank Transfer, Paystack, Hire-Purchase options available</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="uc-wa-btn">${waSvg()} Enquire on WhatsApp</a>` : ''}
    <a class="uc-primary-btn" href="/services">View Our Stock</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to see your current car stock and prices at ${ctx.displayName}.`);
  const defaultStock = [
    {name:'Toyota Camry (2015–2018)',meta:'Tokunbo. Grade A. 2.5L V4. NCS Cleared. FRSC Certified.',price:'From ₦4,500,000'},
    {name:'Toyota Corolla (2014–2017)',meta:'Tokunbo. USA import. NCS Cleared. Low mileage available.',price:'From ₦3,200,000'},
    {name:'Honda Accord (2013–2016)',meta:'Tokunbo. 2.4L. Grade A/B. NCS Cleared. Full inspection.',price:'From ₦3,500,000'},
    {name:'Toyota Highlander (2012–2016)',meta:'Tokunbo. SUV. 7-seater. NCS Cleared. FRSC Certified.',price:'From ₦6,500,000'},
    {name:'Nissan Sentra / Altima',meta:'Tokunbo. 2013–2018. NCS Cleared. Good condition.',price:'From ₦2,800,000'},
    {name:'Toyota Land Cruiser (2014–2018)',meta:'Tokunbo. Luxury 4x4. NCS Cleared. Full spec.',price:'From ₦20,000,000'},
  ];
  const grid = offerings.length === 0
    ? `<div class="uc-cars-grid">${defaultStock.map(c => {
      const waLink = whatsappLink(phone, `Hello! I am interested in the ${c.name} you have in stock. Please send me more details and photos.`);
      return `<div class="uc-car-card"><div class="uc-car-img-placeholder">🚗</div><div class="uc-car-body"><h3 class="uc-car-name">${esc(c.name)}</h3><p class="uc-car-meta">${esc(c.meta)}</p><div class="uc-car-price">${esc(c.price)}</div>${waLink ? `<a href="${waLink}" target="_blank" rel="noopener noreferrer" class="uc-car-cta">${waSvg()} Enquire on WhatsApp</a>` : ''}</div></div>`;
    }).join('')}</div>`
    : `<div class="uc-cars-grid">${offerings.map(o => {
      const waLink = whatsappLink(phone, `Hello! I am interested in the ${esc(o.name)} at ${ctx.displayName}.`);
      return `<div class="uc-car-card"><div class="uc-car-img-placeholder">🚗</div><div class="uc-car-body"><h3 class="uc-car-name">${esc(o.name)}</h3><p class="uc-car-meta">${o.description ? esc(o.description) : 'Tokunbo. NCS Cleared. FRSC Certified.'}</p><div class="uc-car-price">${o.priceKobo === null ? 'Contact for price' : fmtKobo(o.priceKobo)}</div>${waLink ? `<a href="${waLink}" target="_blank" rel="noopener noreferrer" class="uc-car-cta">${waSvg()} Enquire</a>` : ''}</div></div>`;
    }).join('')}</div>`;
  return `${CSS}
<section class="uc-services-hero"><h1>Our Car Stock</h1><p class="uc-services-sub">All prices in ₦ (Naira) — all vehicles NCS cleared &amp; FRSC certified</p></section>
<section>${grid}</section>
<div class="uc-cta-strip"><h3>Don't see what you want?</h3><p>WhatsApp us your preferred make, model, year, and budget. We'll source it for you from our network across Berger, Ladipo, and Cotonou.</p>
<div class="uc-btn-row">${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="uc-wa-btn">${waSvg()} Enquire on WhatsApp</a>` : ''}<a class="uc-sec-btn" href="/contact">Visit Our Yard</a></div></div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to inspect a car at ${ctx.displayName}. Please share your yard location and opening hours.`);
  return `${CSS}
<section class="uc-contact-hero"><h1>Visit Our Motor Yard</h1><p>Come inspect any car in our stock at ${esc(ctx.displayName)} — all vehicles NCS cleared and FRSC certified.</p></section>
${waHref ? `<div class="uc-wa-block"><p>WhatsApp us to book an inspection or enquire about a specific car. We respond same day.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="uc-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Enquire on WhatsApp</a></div>` : ''}
<div class="uc-contact-layout">
  <div class="uc-contact-info">
    <h2>Our Motor Yard</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Dealer Line:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Yard details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Bank Transfer · Paystack · Hire-Purchase</p>
    <p style="margin-top:.5rem;font-size:.875rem;color:var(--ww-text-muted)">All cars: NCS customs cleared · FRSC road worthy · VIN verifiable</p>
  </div>
  <div class="uc-form-wrapper">
    <h2>Car Enquiry</h2>
    <form class="uc-form" method="POST" action="/contact" id="ucContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="uc-form-group"><label for="uc-name">Your name</label><input id="uc-name" name="name" type="text" required autocomplete="name" class="uc-input" placeholder="e.g. Emeka Oduya" /></div>
      <div class="uc-form-group"><label for="uc-phone">Phone / WhatsApp</label><input id="uc-phone" name="phone" type="tel" autocomplete="tel" class="uc-input" placeholder="0803 000 0000" /></div>
      <div class="uc-form-group"><label for="uc-car">Car you want</label><input id="uc-car" name="car_interest" type="text" class="uc-input" placeholder="e.g. Toyota Camry 2016, budget ₦5M" /></div>
      <div class="uc-form-group"><label for="uc-msg">More details</label><textarea id="uc-msg" name="message" required rows="3" class="uc-input uc-textarea" placeholder="e.g. I need a Grade A condition car with low mileage. Willing to inspect this week."></textarea></div>
      <div class="uc-ndpr"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your car enquiry. <a href="/privacy">Privacy Policy</a>.<div class="uc-ndpr-check"><input type="checkbox" id="uc-consent" name="ndpr_consent" value="yes" required /><label for="uc-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="uc-submit">Send Enquiry</button>
    </form>
    <div id="ucContactSuccess" class="uc-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will contact you with available stock matching your request. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('ucContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('ucContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const usedCarDealerUsedCarDealerSiteTemplate: WebsiteTemplateContract = {
  slug: 'used-car-dealer-used-car-dealer-site',
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
