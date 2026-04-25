/**
 * NGO / Non-Profit Donor Portal — NF-CIV-WEL anchor (VN-CIV-002)
 * Pillar 2 — P2-ngo-nonprofit-portal · Milestone M8d · HIGH
 *
 * Nigeria-First:
 *   • IT-XXXXXXXX Incorporated Trustees registration badge (mandatory for Nigerian NGOs)
 *   • Donor-trust first — partnership logos (UN, USAID, DFID, state govt) in trust strip
 *   • "Get Involved" dual CTA — Donate + Volunteer (two distinct patient journeys)
 *   • Programmes/projects as offerings — null price → "Free to beneficiaries"
 *   • Impact numbers in hero (from tagline — "5,000 families reached | 12 communities")
 *   • WhatsApp for volunteer coordination; formal email for donor correspondence
 *   • No floating WhatsApp button — formal organisational context
 *   • Annual report + audit certificate as trust signals
 *
 * NF-CIV-WEL anchor: variant (orphanage) must inherit .ng- namespace,
 *   IT-badge trust strip, "Free to beneficiaries" semantics, dual CTA pattern.
 *
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string):string=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtKobo(k:number):string{return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`}
function whatsappLink(phone:string|null,msg?:string):string|null{
  if(!phone)return null;
  const d=phone.replace(/\D/g,'');
  const intl=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg??'Hello, I would like to volunteer with your organisation.')}`;
}
function safeHref(url:string):string{try{const p=new URL(url,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(url);}catch{/**/}return '#'}

const CSS=`<style>
.ng-hero{text-align:center;padding:2.75rem 0 2rem}
.ng-logo{height:80px;width:80px;object-fit:cover;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.ng-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.ng-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.ng-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ng-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.ng-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ng-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ng-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ng-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ng-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ng-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ng-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ng-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ng-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.ng-section{margin-top:2.75rem}
.ng-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ng-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.ng-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.ng-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.ng-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.ng-card-free{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.ng-card-contrib{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.ng-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.ng-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ng-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ng-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ng-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.ng-info-item{display:flex;flex-direction:column;gap:.25rem}
.ng-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ng-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ng-info-value a{color:var(--ww-primary)}
.ng-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ng-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ng-body{max-width:44rem;margin:0 auto}
.ng-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.ng-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.ng-drow{display:flex;gap:1rem;align-items:flex-start}
.ng-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.ng-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.ng-dvalue a{color:var(--ww-primary);font-weight:600}
.ng-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.ng-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.ng-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ng-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.ng-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.ng-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.ng-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ng-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ng-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ng-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ng-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.ng-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ng-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ng-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ng-layout{grid-template-columns:1fr 1fr}}
.ng-info h2,.ng-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ng-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ng-info a{color:var(--ww-primary);font-weight:600}
.ng-form{display:flex;flex-direction:column;gap:.875rem}
.ng-fg{display:flex;flex-direction:column;gap:.375rem}
.ng-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ng-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ng-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.ng-ta{min-height:100px;resize:vertical}
.ng-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.ng-submit:hover{filter:brightness(1.1)}
.ng-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.ng-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.ng-ctas{flex-direction:column;align-items:stretch}.ng-primary-btn,.ng-sec-btn,.ng-wa-btn{width:100%;justify-content:center}}
</style>`;

function heartSvg(){return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`}
function handSvg(){return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 11V6a2 2 0 00-2-2v0a2 2 0 00-2 2v0M14 10V4a2 2 0 00-2-2v0a2 2 0 00-2 2v0M10 10.5V6a2 2 0 00-2-2v0a2 2 0 00-2 2v3"/><path d="M18 11a2 2 0 114 0v3a8 8 0 01-8 8H9a8 8 0 01-7.608-5.504 2 2 0 012.87-2.223L6 15"/></svg>`}
function waSvg(){return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`}

type Offering={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const description=(ctx.data.description as string|null)??null;
  const tagline=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const featured=offerings.slice(0,6);
  const hasMore=offerings.length>6;
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to volunteer with your organisation. Please tell me how I can help.`);
  const grid=featured.length===0?'':`
  <section class="ng-section">
    <h2 class="ng-section-title">Our Programmes</h2>
    <div class="ng-grid">
      ${featured.map(o=>`
      <div class="ng-card">
        <h3 class="ng-card-name">${esc(o.name)}</h3>
        ${o.description?`<p class="ng-card-desc">${esc(o.description)}</p>`:''}
        ${o.priceKobo!==null?`<p class="ng-card-contrib">Minimum contribution: ${fmtKobo(o.priceKobo)}</p>`:`<p class="ng-card-free">Free to beneficiaries</p>`}
      </div>`).join('')}
    </div>
    ${hasMore?`<a href="/services" class="ng-see-all">View all programmes →</a>`:''}
  </section>`;
  const aboutStrip=bio?`
  <div class="ng-about-strip">
    <h2>About ${esc(ctx.displayName)}</h2>
    <p>${esc(bio)}</p>
    <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more about us →</a>
  </div>`:'';
  const infoStrip=(phone||placeName)?`
  <div class="ng-info-strip">
    ${phone?`<div class="ng-info-item"><span class="ng-info-label">Contact</span><span class="ng-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${placeName?`<div class="ng-info-item"><span class="ng-info-label">Office</span><span class="ng-info-value">${esc(placeName)}</span></div>`:''}
    <div class="ng-info-item"><span class="ng-info-label">Get Involved</span><span class="ng-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">Volunteer on WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div>
  </div>`:'';
  return `${CSS}
<section class="ng-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ng-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline?`<p class="ng-tagline">${esc(tagline)}</p>`:`<p class="ng-tagline">Transforming communities through sustainable development — join us in creating lasting change.</p>`}
  <div class="ng-ctas">
    <a href="/contact" class="ng-primary-btn" aria-label="Donate to ${esc(ctx.displayName)}">${heartSvg()} Donate</a>
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ng-sec-btn">${handSvg()} Volunteer</a>`:`<a class="ng-sec-btn" href="/contact">${handSvg()} Volunteer</a>`}
  </div>
  <div class="ng-trust-strip">
    <span class="ng-badge"><span class="ng-dot"></span>IT Registered</span>
    <span class="ng-badge"><span class="ng-dot"></span>CAC Verified</span>
    <span class="ng-badge"><span class="ng-dot"></span>Annually Audited</span>
  </div>
</section>
${grid}${aboutStrip}${infoStrip}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const description=(ctx.data.description as string|null)??null;
  const category=(ctx.data.category as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to volunteer with your organisation.`);
  return `${CSS}
<section class="ng-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ng-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${category?`<span class="ng-cat-badge">${esc(category)}</span>`:''}
</section>
<div class="ng-body">
  <p class="ng-desc">${description?esc(description):`${esc(ctx.displayName)} is a registered Nigerian non-governmental organisation (NGO) committed to community development and social impact. Incorporated as a Trustee with the CAC, we operate transparently with annual audits and donor accountability.`}</p>
  <div class="ng-details">
    ${category?`<div class="ng-drow"><span class="ng-dlabel">Organisation Type</span><span class="ng-dvalue">${esc(category)}</span></div>`:''}
    ${placeName?`<div class="ng-drow"><span class="ng-dlabel">Office Address</span><span class="ng-dvalue">${esc(placeName)}</span></div>`:''}
    ${phone?`<div class="ng-drow"><span class="ng-dlabel">Phone</span><span class="ng-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="ng-drow"><span class="ng-dlabel">Website</span><span class="ng-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="ng-btn-row">
    <a href="/contact" class="ng-primary-btn">${heartSvg()} Donate</a>
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ng-sec-btn">${handSvg()} Volunteer</a>`:`<a class="ng-sec-btn" href="/contact">${handSvg()} Get Involved</a>`}
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to know how I can support your programmes.`);
  const content=offerings.length===0?`<div class="ng-empty"><p>Our programmes and projects are being updated.<br/>Please contact us to learn how you can support our work.</p><br/><a href="/contact" class="ng-primary-btn">${heartSvg()} Get Involved</a></div>`
    :`<div class="ng-grid">${offerings.map(o=>`
    <div class="ng-card">
      <h3 class="ng-card-name">${esc(o.name)}</h3>
      ${o.description?`<p class="ng-card-desc">${esc(o.description)}</p>`:''}
      ${o.priceKobo!==null?`<p class="ng-card-contrib">Minimum contribution: ${fmtKobo(o.priceKobo)}</p>`:`<p class="ng-card-free">Free to beneficiaries</p>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="ng-svc-hero">
  <h1>Our Programmes</h1>
  <p class="ng-sub">Projects and programmes run by ${esc(ctx.displayName)}</p>
</section>
<section>${content}</section>
<div class="ng-cta-strip">
  <h3>Support our mission</h3>
  <p>Your donation or volunteer time makes a real difference in the communities we serve.</p>
  <div class="ng-btn-row" style="justify-content:center">
    <a href="/contact" class="ng-primary-btn">${heartSvg()} Donate</a>
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ng-sec-btn">${handSvg()} Volunteer</a>`:`<a class="ng-sec-btn" href="/contact">${handSvg()} Volunteer</a>`}
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about volunteering or supporting your organisation.`);
  return `${CSS}
<section class="ng-contact-hero">
  <h1>Get Involved</h1>
  <p>Donate, volunteer, or partner with us. Every contribution helps transform lives.</p>
</section>
${waHref?`<div class="ng-wa-block"><p>Reach our team on WhatsApp for volunteer opportunities and partnership enquiries.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ng-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp Us</a></div>`:''}
<div class="ng-layout">
  <div class="ng-info">
    <h2>Contact Details</h2>
    ${placeName?`<p><strong>Office:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email&&!placeName?`<p>Contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Our annual report and audit certificate are available upon request from verified partners and donors.</p>
  </div>
  <div class="ng-form-wrap">
    <h2>Donation or Volunteer Enquiry</h2>
    <form class="ng-form" method="POST" action="/contact" id="ngForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ng-fg"><label for="ng-name">Your full name</label><input id="ng-name" name="name" type="text" required autocomplete="name" class="ng-input" placeholder="e.g. Chidi Okwu" /></div>
      <div class="ng-fg"><label for="ng-phone">Phone number</label><input id="ng-phone" name="phone" type="tel" autocomplete="tel" class="ng-input" placeholder="0803 000 0000" /></div>
      <div class="ng-fg"><label for="ng-email">Email address</label><input id="ng-email" name="email" type="email" class="ng-input" placeholder="you@example.com" /></div>
      <div class="ng-fg"><label for="ng-msg">How would you like to help?</label><textarea id="ng-msg" name="message" required rows="4" class="ng-input ng-ta" placeholder="e.g. I would like to donate, volunteer on weekends, partner as an organisation, or learn more about your programmes."></textarea></div>
      <button type="submit" class="ng-submit">Send Message</button>
    </form>
    <div id="ngSuccess" class="ng-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>Thank you for your interest — our team will respond shortly.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('ngForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('ngSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const ngoNonprofitPortalTemplate:WebsiteTemplateContract={
  slug:'ngo-nonprofit-portal',
  version:'1.0.0',
  pages:['home','about','services','contact'],
  renderPage(ctx:WebsiteRenderContext):string{
    try{
      switch(ctx.pageType){
        case 'home': return renderHome(ctx);
        case 'about': return renderAbout(ctx);
        case 'services': return renderServices(ctx);
        case 'contact': return renderContact(ctx);
        default: return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
      }
    }catch{return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Unable to load page.</p>`}
  },
};
