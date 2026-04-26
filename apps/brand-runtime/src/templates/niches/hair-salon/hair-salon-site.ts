/**
 * Hair Salon / Barbing Salon Site — Pillar 3 Website Template
 * Niche ID: P3-hair-salon-hair-salon-site
 * Vertical: hair-salon (priority=3, critical)
 * Category: commerce
 * Family: NF-COM-BEA (standalone)
 * Research brief: docs/templates/research/hair-salon-hair-salon-site-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: NAFDAC-approved products, CAC registration
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to book an appointment at your salon.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.hs-hero{text-align:center;padding:2.75rem 0 2rem}
.hs-logo{height:80px;width:80px;object-fit:cover;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.hs-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.hs-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.hs-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.hs-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.hs-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.hs-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.hs-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.hs-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.hs-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.hs-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.hs-section{margin-top:2.75rem}
.hs-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.hs-service-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.hs-service-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.hs-service-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.hs-service-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.hs-service-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.hs-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.hs-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.hs-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.hs-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.hs-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.hs-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.hs-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.hs-strip-item{display:flex;flex-direction:column;gap:.2rem}
.hs-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.hs-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.hs-strip-value a{color:var(--ww-primary)}
.hs-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.hs-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.hs-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.hs-contact-layout{grid-template-columns:1fr 1fr}}
.hs-contact-info h2,.hs-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.hs-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.hs-contact-info a{color:var(--ww-primary);font-weight:600}
.hs-form{display:flex;flex-direction:column;gap:.875rem}
.hs-form-group{display:flex;flex-direction:column;gap:.375rem}
.hs-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.hs-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.hs-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.hs-textarea{min-height:100px;resize:vertical}
.hs-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.hs-ndpr a{color:var(--ww-primary)}
.hs-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.hs-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.hs-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.hs-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.hs-submit:hover{filter:brightness(1.1)}
.hs-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.hs-success h3{font-weight:700;margin-bottom:.25rem}
.hs-about-hero{text-align:center;padding:2.5rem 0 2rem}
.hs-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.hs-about-body{max-width:44rem;margin:0 auto}
.hs-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.hs-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.hs-detail-row{display:flex;gap:1rem;align-items:flex-start}
.hs-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.hs-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.hs-detail-value a{color:var(--ww-primary);font-weight:600}
.hs-services-hero{text-align:center;padding:2.5rem 0 2rem}
.hs-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.hs-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.hs-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.hs-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.hs-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.hs-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.hs-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.hs-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.hs-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.hs-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.hs-ctas{flex-direction:column;align-items:stretch}.hs-primary-btn,.hs-sec-btn,.hs-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I would like to book an appointment at ${ctx.displayName}.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="hs-hero">
  ${ctx.logoUrl ? `<img class="hs-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="hs-cat-badge">✂️ ${esc(category ?? 'Hair Salon')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="hs-tagline">${esc(tagline ?? `Your style destination in ${placeName ?? 'Nigeria'}. Braiding, weaves, relaxer, cuts & more.`)}</p>
  <div class="hs-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hs-wa-btn">${waSvg()} Book via WhatsApp</a>` : ''}
    <a class="hs-sec-btn" href="/services">View Price List</a>
    <a class="hs-sec-btn" href="/contact">Find Us</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="hs-section">
  <h2 class="hs-section-title">Our Services &amp; Prices</h2>
  <div class="hs-service-grid">
    ${featured.map(o => `
    <div class="hs-service-card">
      <h3 class="hs-service-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="hs-service-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="hs-service-price">Price on request</span>` : `<span class="hs-service-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">See full price list &rarr;</a>` : ''}
</section>` : ''}
<div class="hs-trust-strip">
  <span class="hs-badge"><span class="hs-dot"></span> NAFDAC-Approved Products</span>
  <span class="hs-badge"><span class="hs-dot"></span> CAC Registered</span>
  <span class="hs-badge"><span class="hs-dot"></span> Trained Stylists</span>
  <span class="hs-badge"><span class="hs-dot"></span> Walk-ins Welcome</span>
</div>
${bioExcerpt ? `
<div class="hs-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="hs-contact-strip">
  ${placeName ? `<div class="hs-strip-item"><span class="hs-strip-label">Location</span><span class="hs-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="hs-strip-item"><span class="hs-strip-label">Phone / WhatsApp</span><span class="hs-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="hs-strip-item"><span class="hs-strip-label">Payment</span><span class="hs-strip-value">Cash · POS · Bank Transfer · Paystack</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to know more about ${ctx.displayName}.`);
  return `${CSS}
<section class="hs-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Your local hair care experts</p>
</section>
<div class="hs-about-body">
  <p class="hs-about-desc">${esc(description ?? `${ctx.displayName} is a professional hair salon serving our community with top-quality hair care services. From knotless braids and Ghana weaves to relaxers and men's cuts, our trained stylists use only NAFDAC-approved products to give you the best results every time.`)}</p>
  <div class="hs-detail-list">
    ${placeName ? `<div class="hs-detail-row"><span class="hs-detail-label">Address</span><span class="hs-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="hs-detail-row"><span class="hs-detail-label">Phone</span><span class="hs-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="hs-detail-row"><span class="hs-detail-label">Email</span><span class="hs-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="hs-detail-row"><span class="hs-detail-label">Products</span><span class="hs-detail-value">NAFDAC-approved brands only</span></div>
    <div class="hs-detail-row"><span class="hs-detail-label">Payment</span><span class="hs-detail-value">Cash, POS, Bank Transfer, Paystack</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hs-wa-btn">${waSvg()} Book via WhatsApp</a>` : ''}
    <a class="hs-primary-btn" href="/services">View Price List</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about services at ${ctx.displayName}.`);
  const grid = offerings.length === 0
    ? `<div class="hs-empty"><p>Our full price list is coming soon.<br/>Please WhatsApp or call us for current pricing on all services.</p><br/><a class="hs-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Ask for Prices</a></div>`
    : `<div class="hs-service-grid">${offerings.map(o => `
    <div class="hs-service-card">
      <h3 class="hs-service-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="hs-service-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="hs-service-price">Price on request</span>` : `<span class="hs-service-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="hs-services-hero">
  <h1>Services &amp; Price List</h1>
  <p class="hs-services-sub">All services at ${esc(ctx.displayName)} — prices in ₦ (Naira)</p>
</section>
<section>${grid}</section>
<div class="hs-cta-strip">
  <h3>Ready to slay?</h3>
  <p>Book your appointment at ${esc(ctx.displayName)} via WhatsApp — fast, easy, no stress.</p>
  <div class="hs-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hs-wa-btn">${waSvg()} Book via WhatsApp</a>` : ''}
    <a class="hs-sec-btn" href="/contact">Find Our Location</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to book an appointment at ${ctx.displayName}. Please let me know your availability.`);
  return `${CSS}
<section class="hs-contact-hero">
  <h1>Book Your Appointment</h1>
  <p>Walk-ins welcome or book ahead via WhatsApp for priority seating at ${esc(ctx.displayName)}.</p>
</section>
${waHref ? `<div class="hs-wa-block">
  <p>The fastest way to book is via WhatsApp. Send us a message and we will confirm your slot immediately.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hs-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Book via WhatsApp</a>
</div>` : ''}
<div class="hs-contact-layout">
  <div class="hs-contact-info">
    <h2>Find Us</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">We accept: Cash · POS · Bank Transfer · Paystack</p>
    <p style="margin-top:.75rem"><a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">View our price list &rarr;</a></p>
  </div>
  <div class="hs-form-wrapper">
    <h2>Send a Message</h2>
    <form class="hs-form" method="POST" action="/contact" id="hsContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="hs-form-group"><label for="hs-name">Your name</label><input id="hs-name" name="name" type="text" required autocomplete="name" class="hs-input" placeholder="e.g. Adaeze Okonkwo" /></div>
      <div class="hs-form-group"><label for="hs-phone">Phone / WhatsApp</label><input id="hs-phone" name="phone" type="tel" autocomplete="tel" class="hs-input" placeholder="0803 000 0000" /></div>
      <div class="hs-form-group"><label for="hs-msg">Service needed or question</label><textarea id="hs-msg" name="message" required rows="4" class="hs-input hs-textarea" placeholder="e.g. I want knotless braids this Saturday. What time is available?"></textarea></div>
      <div class="hs-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="hs-ndpr-check"><input type="checkbox" id="hs-consent" name="ndpr_consent" value="yes" required /><label for="hs-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="hs-submit">Send Message</button>
    </form>
    <div id="hsContactSuccess" class="hs-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>We will get back to you shortly to confirm your appointment. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('hsContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('hsContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const hairSalonHairSalonSiteTemplate: WebsiteTemplateContract = {
  slug: 'hair-salon-hair-salon-site',
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
