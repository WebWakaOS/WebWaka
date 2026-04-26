/**
 * Tailor / Fashion Designer Atelier Site — Pillar 3 Website Template
 * Niche ID: P3-tailoring-fashion-tailoring-atelier
 * Vertical: tailoring-fashion (priority=3, critical)
 * Category: commerce
 * Family: NF-COM-FSH (standalone)
 * Research brief: docs/templates/research/tailoring-fashion-tailoring-atelier-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: CAC registration, LFDW/GFW showcase, NEPC (export), NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtKobo(k: number): string { return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`; }
function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to book a fitting consultation.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ } return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.tf-hero{text-align:center;padding:2.75rem 0 2rem}
.tf-logo{height:80px;width:80px;object-fit:cover;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.tf-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.tf-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.tf-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.tf-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.tf-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.tf-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.tf-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.tf-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.tf-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.tf-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.tf-service-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));margin-top:1.5rem}
.tf-service-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.tf-service-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.tf-service-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.tf-service-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.tf-fabric-strip{margin-top:2rem;padding:1.125rem 1.375rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.tf-fabric-strip h3{font-size:.9375rem;font-weight:700;margin-bottom:.625rem;color:var(--ww-text)}
.tf-fabric-chips{display:flex;flex-wrap:wrap;gap:.375rem}
.tf-fabric{padding:.3rem .75rem;border-radius:999px;font-size:.8125rem;font-weight:600;background:var(--ww-primary);color:#fff}
.tf-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.tf-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.tf-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.tf-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.tf-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.tf-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.tf-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.tf-strip-item{display:flex;flex-direction:column;gap:.2rem}
.tf-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.tf-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.tf-strip-value a{color:var(--ww-primary)}
.tf-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.tf-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.tf-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.tf-contact-layout{grid-template-columns:1fr 1fr}}
.tf-contact-info h2,.tf-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.tf-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.tf-contact-info a{color:var(--ww-primary);font-weight:600}
.tf-form{display:flex;flex-direction:column;gap:.875rem}
.tf-form-group{display:flex;flex-direction:column;gap:.375rem}
.tf-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.tf-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.tf-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.tf-textarea{min-height:100px;resize:vertical}
.tf-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.tf-ndpr a{color:var(--ww-primary)}
.tf-ndpr-check{display:flex;align-items:flex-start;gap:.5rem;margin-top:.5rem}
.tf-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.tf-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.tf-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.tf-submit:hover{filter:brightness(1.1)}
.tf-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.tf-success h3{font-weight:700;margin-bottom:.25rem}
.tf-about-hero{text-align:center;padding:2.5rem 0 2rem}
.tf-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.tf-about-body{max-width:44rem;margin:0 auto}
.tf-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:1.5rem;font-size:1rem}
.tf-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.tf-detail-row{display:flex;gap:1rem;align-items:flex-start}
.tf-detail-label{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.tf-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.tf-detail-value a{color:var(--ww-primary);font-weight:600}
.tf-services-hero{text-align:center;padding:2.5rem 0 2rem}
.tf-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.tf-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.tf-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.tf-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.tf-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.tf-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.tf-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.tf-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.tf-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.tf-ctas{flex-direction:column;align-items:stretch}.tf-primary-btn,.tf-sec-btn,.tf-wa-btn{width:100%;justify-content:center}}
</style>`;

const FABRICS = ['Ankara','Aso-Oke','Adire','George','Lace','Aso-Ebi','Kente','Brocade','Chiffon'];
const DEFAULT_SERVICES = [
  {name:'Custom Native Wear',desc:'Agbada, buba &amp; iro, ankara suit — traditional styles with expert tailoring.',price:'From ₦12,000'},
  {name:'Corporate / Office Wear',desc:'Custom suits, skirts, and blazers in your choice of fabric. Ankara or plain.',price:'From ₦18,000'},
  {name:'Bridal &amp; Aso-Ebi',desc:'Bridal gown, bridesmaids sets, coordinated aso-ebi for your wedding. Bulk discount.',price:'From ₦30,000'},
  {name:'Casual &amp; Ready-to-Wear',desc:'Everyday dresses, tops, trousers. Quick turnaround. Bring your fabric.',price:'From ₦5,000'},
  {name:'Children\'s Outfits',desc:'Native and casual children\'s wear. Party outfits, uniform alterations.',price:'From ₦3,500'},
  {name:'Alterations &amp; Repairs',desc:'Let-out, take-in, hemming, zip replacement for existing garments.',price:'From ₦1,500'},
];
type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const featured = offerings.slice(0,4);
  const waHref = whatsappLink(phone, `Hello! I would like to book a fitting consultation at ${ctx.displayName}. Please share your availability and pricing.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="tf-hero">
  ${ctx.logoUrl ? `<img class="tf-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="tf-cat-badge">✂️ Fashion Atelier</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="tf-tagline">${esc(tagline ?? `Custom Nigerian fashion — Ankara, Aso-Ebi, native wear &amp; bridal${placeName ? ` in ${placeName}` : ''}. Wear your heritage. Define your style.`)}</p>
  <div class="tf-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="tf-wa-btn">${waSvg()} Book a Fitting</a>` : ''}
    <a class="tf-primary-btn" href="/services">View Services</a>
    <a class="tf-sec-btn" href="/contact">Visit Our Studio</a>
  </div>
</section>
${featured.length > 0 ? `
<section style="margin-top:2rem">
  <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.875rem;color:var(--ww-primary)">Our Services &amp; Prices</h2>
  <div class="tf-service-grid">
    ${featured.map(o => `<div class="tf-service-card"><h3 class="tf-service-name">${esc(o.name)}</h3>${o.description ? `<p class="tf-service-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="tf-service-price">Price on request</span>` : `<span class="tf-service-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}
  </div>
</section>` : ''}
<div class="tf-fabric-strip">
  <h3>Fabrics We Work With</h3>
  <div class="tf-fabric-chips">${FABRICS.map(f => `<span class="tf-fabric">${esc(f)}</span>`).join('')}</div>
</div>
<div class="tf-trust-strip">
  <span class="tf-badge"><span class="tf-dot"></span> Lagos Fashion Week</span>
  <span class="tf-badge"><span class="tf-dot"></span> CAC Registered</span>
  <span class="tf-badge"><span class="tf-dot"></span> Original Designs</span>
  <span class="tf-badge"><span class="tf-dot"></span> 50% Deposit on Booking</span>
</div>
${bioExcerpt ? `<div class="tf-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bioExcerpt)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Meet the designer &rarr;</a></div>` : ''}
${(phone || placeName) ? `<div class="tf-contact-strip">
  ${placeName ? `<div class="tf-strip-item"><span class="tf-strip-label">Studio</span><span class="tf-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="tf-strip-item"><span class="tf-strip-label">Book a Fitting</span><span class="tf-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="tf-strip-item"><span class="tf-strip-label">Payment</span><span class="tf-strip-value">50% deposit · Bank Transfer · Paystack</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to book a fitting consultation with ${ctx.displayName}.`);
  return `${CSS}
<section class="tf-about-hero"><h1>About ${esc(ctx.displayName)}</h1><p style="color:var(--ww-text-muted);margin-top:.5rem">Wear your heritage. Define your style.</p></section>
<div class="tf-about-body">
  <p class="tf-about-desc">${esc(description ?? `${ctx.displayName} is a Nigerian fashion atelier specialising in custom native wear, Aso-Ebi sets, bridal, and corporate fashion. Our designer brings years of expertise and a deep love for Nigerian fabric and heritage to every stitch. We work with Ankara, Aso-Oke, George, Adire, and all major Nigerian fabrics.`)}</p>
  <div class="tf-detail-list">
    ${placeName ? `<div class="tf-detail-row"><span class="tf-detail-label">Studio</span><span class="tf-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="tf-detail-row"><span class="tf-detail-label">Book a Fitting</span><span class="tf-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="tf-detail-row"><span class="tf-detail-label">Email</span><span class="tf-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="tf-detail-row"><span class="tf-detail-label">Showcase</span><span class="tf-detail-value">Lagos Fashion Week, GT Fashion Weekend</span></div>
    <div class="tf-detail-row"><span class="tf-detail-label">Fabrics</span><span class="tf-detail-value">Ankara, Aso-Oke, George, Adire, Lace &amp; more</span></div>
    <div class="tf-detail-row"><span class="tf-detail-label">Payment</span><span class="tf-detail-value">50% deposit on booking. Bank Transfer, Paystack.</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="tf-wa-btn">${waSvg()} Book a Fitting</a>` : ''}
    <a class="tf-primary-btn" href="/services">View Services</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to book a fitting consultation at ${ctx.displayName}. Please share your pricing and available dates.`);
  const grid = offerings.length === 0
    ? `<div class="tf-service-grid">${DEFAULT_SERVICES.map(s => `<div class="tf-service-card"><h3 class="tf-service-name">${s.name}</h3><p class="tf-service-desc">${s.desc}</p><span class="tf-service-price">${esc(s.price)}</span></div>`).join('')}</div>`
    : `<div class="tf-service-grid">${offerings.map(o => `<div class="tf-service-card"><h3 class="tf-service-name">${esc(o.name)}</h3>${o.description ? `<p class="tf-service-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="tf-service-price">Price on request</span>` : `<span class="tf-service-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="tf-services-hero"><h1>Services &amp; Prices</h1><p class="tf-services-sub">Custom fashion at ${esc(ctx.displayName)} — prices in ₦ (Naira). 50% deposit on booking.</p></section>
<section>${grid}</section>
<div class="tf-cta-strip"><h3>Ready to create your look?</h3><p>WhatsApp us to book your measurement consultation. We'll discuss your vision, fabric, and delivery timeline.</p>
<div class="tf-btn-row">${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="tf-wa-btn">${waSvg()} Book a Fitting</a>` : ''}<a class="tf-sec-btn" href="/contact">Visit Our Studio</a></div></div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to book a fitting consultation at ${ctx.displayName}. Please share your availability.`);
  return `${CSS}
<section class="tf-contact-hero"><h1>Book Your Consultation</h1><p>WhatsApp us or visit the studio at ${esc(ctx.displayName)} to start your custom order.</p></section>
${waHref ? `<div class="tf-wa-block"><p>WhatsApp us to book a fitting consultation. We'll discuss your vision, take your measurements, and begin crafting your look.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="tf-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Book a Fitting via WhatsApp</a></div>` : ''}
<div class="tf-contact-layout">
  <div class="tf-contact-info">
    <h2>Our Studio</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Studio details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: 50% deposit on booking. Bank Transfer · Paystack.</p>
    <p style="margin-top:.75rem"><a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">View our services &amp; prices &rarr;</a></p>
  </div>
  <div class="tf-form-wrapper">
    <h2>Send a Booking Request</h2>
    <form class="tf-form" method="POST" action="/contact" id="tfContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="tf-form-group"><label for="tf-name">Your name</label><input id="tf-name" name="name" type="text" required autocomplete="name" class="tf-input" placeholder="e.g. Chinwe Okeke" /></div>
      <div class="tf-form-group"><label for="tf-phone">Phone / WhatsApp</label><input id="tf-phone" name="phone" type="tel" autocomplete="tel" class="tf-input" placeholder="0803 000 0000" /></div>
      <div class="tf-form-group"><label for="tf-occasion">Occasion / outfit needed</label><input id="tf-occasion" name="occasion" type="text" class="tf-input" placeholder="e.g. Aso-Ebi for October wedding, 15 sets" /></div>
      <div class="tf-form-group"><label for="tf-msg">More details</label><textarea id="tf-msg" name="message" required rows="3" class="tf-input tf-textarea" placeholder="e.g. I need the outfits ready 2 weeks before 15th October. My fabric is George lace."></textarea></div>
      <div class="tf-ndpr"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your booking request. <a href="/privacy">Privacy Policy</a>.<div class="tf-ndpr-check"><input type="checkbox" id="tf-consent" name="ndpr_consent" value="yes" required /><label for="tf-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="tf-submit">Send Booking Request</button>
    </form>
    <div id="tfContactSuccess" class="tf-success" style="display:none" role="status" aria-live="polite"><h3>Request received!</h3><p>We will contact you shortly to confirm your consultation and discuss your design. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('tfContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('tfContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const tailoringFashionTailoringAtelierTemplate: WebsiteTemplateContract = {
  slug: 'tailoring-fashion-tailoring-atelier',
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
