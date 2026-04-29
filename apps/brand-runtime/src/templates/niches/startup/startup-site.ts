/**
 * Startup / Tech Company Site — Pillar 3 Website Template
 * Niche ID: P3-startup-startup-site
 * Vertical: startup (priority=3, high)
 * Category: tech
 * Family: NF-PRO-TEC (standalone)
 * Research brief: docs/templates/research/startup-startup-site-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: CAC registration, NITDA e-registration, CBN (fintech)
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to learn more about your startup.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.su-hero{text-align:center;padding:3rem 0 2.5rem;position:relative}
.su-logo{height:72px;width:72px;object-fit:cover;border-radius:12px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.su-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.su-hero h1{font-size:clamp(2rem,5vw,3.25rem);font-weight:900;line-height:1.1;margin-bottom:.625rem;letter-spacing:-.03em}
.su-tagline{font-size:1.125rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 2rem;line-height:1.7}
.su-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.su-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.9rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.su-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.su-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.su-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.su-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.su-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.su-section{margin-top:3rem}
.su-section-title{font-size:1.375rem;font-weight:800;margin-bottom:1.25rem;color:var(--ww-primary)}
.su-product-grid{display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.su-product-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.5rem}
.su-product-name{font-size:1rem;font-weight:800;color:var(--ww-text);margin:0}
.su-product-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.6;flex:1;margin:0}
.su-product-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin-top:.25rem}
.su-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2.5rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.su-badge-item{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.su-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.su-about-strip{margin-top:2.5rem;padding:2rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.su-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.su-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.su-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.su-strip-item{display:flex;flex-direction:column;gap:.2rem}
.su-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.su-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.su-strip-value a{color:var(--ww-primary)}
.su-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.su-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.su-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.su-contact-layout{grid-template-columns:1fr 1fr}}
.su-contact-info h2,.su-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.su-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.su-contact-info a{color:var(--ww-primary);font-weight:600}
.su-form{display:flex;flex-direction:column;gap:.875rem}
.su-form-group{display:flex;flex-direction:column;gap:.375rem}
.su-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.su-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.su-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.su-textarea{min-height:100px;resize:vertical}
.su-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.su-ndpr a{color:var(--ww-primary)}
.su-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.su-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.su-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.su-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.su-submit:hover{filter:brightness(1.1)}
.su-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.su-about-hero{text-align:center;padding:2.5rem 0 2rem}
.su-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.su-about-body{max-width:44rem;margin:0 auto}
.su-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.su-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.su-detail-row{display:flex;gap:1rem;align-items:flex-start}
.su-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.su-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.su-detail-value a{color:var(--ww-primary);font-weight:600}
.su-products-hero{text-align:center;padding:2.5rem 0 2rem}
.su-products-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.su-products-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.su-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.su-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.su-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.su-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.su-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.su-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.su-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.su-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.su-ctas{flex-direction:column;align-items:stretch}.su-primary-btn,.su-sec-btn,.su-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I would like to learn more about ${ctx.displayName} and explore a partnership or demo.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="su-hero">
  ${ctx.logoUrl ? `<img class="su-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="su-badge">🚀 ${esc(category ?? 'Startup')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="su-tagline">${esc(tagline ?? `Solving real Nigerian problems with technology. CAC-registered. NITDA-compliant. Built in ${placeName ?? 'Nigeria'}.`)}</p>
  <div class="su-ctas">
    <a class="su-primary-btn" href="/services">See What We Build</a>
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="su-wa-btn">${waSvg()} Contact Us</a>` : ''}
    <a class="su-sec-btn" href="/contact">Partner With Us</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="su-section">
  <h2 class="su-section-title">Our Products &amp; Services</h2>
  <div class="su-product-grid">
    ${featured.map(o => `
    <div class="su-product-card">
      <h3 class="su-product-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="su-product-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="su-product-price">Pricing on request</span>` : `<span class="su-product-price">${fmtKobo(o.priceKobo)}/mo</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">See all products &rarr;</a>` : ''}
</section>` : ''}
<div class="su-trust-strip">
  <span class="su-badge-item"><span class="su-dot"></span> CAC Registered</span>
  <span class="su-badge-item"><span class="su-dot"></span> NITDA Compliant</span>
  <span class="su-badge-item"><span class="su-dot"></span> Nigeria-Built</span>
  <span class="su-badge-item"><span class="su-dot"></span> NDPR Compliant</span>
</div>
${bioExcerpt ? `
<div class="su-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Our story &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="su-contact-strip">
  ${placeName ? `<div class="su-strip-item"><span class="su-strip-label">Headquarters</span><span class="su-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="su-strip-item"><span class="su-strip-label">Phone / WhatsApp</span><span class="su-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="su-strip-item"><span class="su-strip-label">Payment</span><span class="su-strip-value">Bank Transfer · Paystack · Invoice</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to learn more about ${ctx.displayName}.`);
  return `${CSS}
<section class="su-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Built in Nigeria, for Nigeria and beyond</p>
</section>
<div class="su-about-body">
  <p class="su-about-desc">${esc(description ?? `${ctx.displayName} is a Nigerian-built technology startup tackling real-world problems with innovative, scalable solutions. Founded and incorporated under the Corporate Affairs Commission (CAC) in Nigeria, we operate in full compliance with NITDA's Nigeria Data Protection Regulation (NDPR) and relevant sector regulations. Our team of engineers, product designers, and business operators is based in Lagos, with reach across Nigeria and West Africa.`)}</p>
  <div class="su-detail-list">
    ${placeName ? `<div class="su-detail-row"><span class="su-detail-label">HQ</span><span class="su-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="su-detail-row"><span class="su-detail-label">Phone</span><span class="su-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="su-detail-row"><span class="su-detail-label">Email</span><span class="su-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="su-detail-row"><span class="su-detail-label">Legal</span><span class="su-detail-value">CAC Registered · NITDA NDPR Compliant</span></div>
    <div class="su-detail-row"><span class="su-detail-label">Ecosystem</span><span class="su-detail-value">Lagos Tech Hub · FATE Foundation · CcHUB network</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="su-wa-btn">${waSvg()} Contact Us</a>` : ''}
    <a class="su-primary-btn" href="/services">Our Products</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like a demo or pricing information for ${ctx.displayName}'s products.`);
  const grid = offerings.length === 0
    ? `<div class="su-empty"><p>Our product details are being updated.<br/>Please contact us for a demo or pricing consultation.</p><br/><a class="su-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Request a Demo</a></div>`
    : `<div class="su-product-grid">${offerings.map(o => `
    <div class="su-product-card">
      <h3 class="su-product-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="su-product-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="su-product-price">Pricing on request</span>` : `<span class="su-product-price">${fmtKobo(o.priceKobo)}/mo</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="su-products-hero">
  <h1>Products &amp; Services</h1>
  <p class="su-products-sub">${esc(ctx.displayName)} — technology solutions built for Nigerian and African markets</p>
</section>
<section>${grid}</section>
<div class="su-cta-strip">
  <h3>Ready to see it in action?</h3>
  <p>Request a free product demo or speak directly with our team via WhatsApp.</p>
  <div class="su-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="su-wa-btn">${waSvg()} Request a Demo</a>` : ''}
    <a class="su-sec-btn" href="/contact">Contact Us</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to discuss a partnership or demo with ${ctx.displayName}.`);
  return `${CSS}
<section class="su-contact-hero">
  <h1>Get In Touch</h1>
  <p>Partner with us, request a demo, or explore investment opportunities at ${esc(ctx.displayName)}.</p>
</section>
${waHref ? `<div class="su-wa-block">
  <p>The fastest way to reach us is via WhatsApp. Our team responds within business hours.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="su-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Chat With Us</a>
</div>` : ''}
<div class="su-contact-layout">
  <div class="su-contact-info">
    <h2>Our Details</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Bank Transfer · Paystack · Invoice</p>
    <p style="margin-top:.75rem"><a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">View our products &rarr;</a></p>
  </div>
  <div class="su-form-wrapper">
    <h2>Send a Message</h2>
    <form class="su-form" method="POST" action="/contact" id="suContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="su-form-group"><label for="su-name">Your name</label><input id="su-name" name="name" type="text" required autocomplete="name" class="su-input" placeholder="e.g. Oluwaseun Adeyemi" /></div>
      <div class="su-form-group"><label for="su-email">Work email</label><input id="su-email" name="email" type="email" required autocomplete="email" class="su-input" placeholder="you@company.com" /></div>
      <div class="su-form-group"><label for="su-phone">Phone / WhatsApp</label><input id="su-phone" name="phone" type="tel" autocomplete="tel" class="su-input" placeholder="0803 000 0000" /></div>
      <div class="su-form-group"><label for="su-msg">How can we help you?</label><textarea id="su-msg" name="message" required rows="4" class="su-input su-textarea" placeholder="e.g. I would like a demo of your product for our company. We have 500 employees in Lagos."></textarea></div>
      <div class="su-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="su-ndpr-check"><input type="checkbox" id="su-consent" name="ndpr_consent" value="yes" required /><label for="su-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="su-submit">Send Message</button>
    </form>
    <div id="suContactSuccess" class="su-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>Our team will get back to you within 1 business day. Thank you for reaching out!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('suContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('suContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const startupStartupSiteTemplate: WebsiteTemplateContract = {
  slug: 'startup-startup-site',
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
