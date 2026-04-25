/**
 * Beauty Salon / Barber Shop Personal Care Site — NF-BEA anchor (VN-BEA-001)
 * Pillar 2 — P2-beauty-salon-personal-care · Milestone M9 · CRITICAL
 *
 * Nigeria-First:
 *   • African hair specialisation is central — braiding, locs, relaxers, gele, wigs, makeup
 *   • "Book an Appointment" WhatsApp CTA — walk-in-friendly but advance booking preferred
 *   • Services grid with NGN prices displayed — salons commonly share price lists
 *   • Null priceKobo → "Price on request" (bespoke styles or extensions vary)
 *   • Walk-in note alongside appointment CTA — welcoming to spontaneous customers
 *   • Opening hours prominent (most salons open 7 days)
 *   • Lively, friendly, confident tone — "You'll leave looking amazing"
 *   • No regulatory licence (no PCN/MDCN/INEC) — community trust via quality + reviews
 *   • "Highly trained stylists" trust signal
 *   • Barber/salon owner name optional (solo practitioners often want name-first branding)
 *
 * NF-BEA anchor: variants (spa, hair-salon) must inherit .bs- namespace,
 *   services-with-prices pattern, appointment-booking CTA, "Price on request" fallback.
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg??'Hello, I would like to book an appointment. Please share your availability.')}`;
}
function safeHref(url:string):string{try{const p=new URL(url,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(url);}catch{/**/}return '#'}

const CSS=`<style>
.bs-hero{text-align:center;padding:2.75rem 0 2rem}
.bs-logo{height:80px;width:80px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-primary)}
.bs-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.bs-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.bs-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.bs-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.bs-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.bs-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.bs-walkin-note{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.bs-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.bs-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.bs-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.bs-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.bs-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.bs-section{margin-top:2.75rem}
.bs-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.bs-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.bs-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.bs-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.bs-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.bs-card-price{font-size:1rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.bs-card-por{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.bs-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.bs-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.bs-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.bs-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.bs-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.bs-info-item{display:flex;flex-direction:column;gap:.25rem}
.bs-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.bs-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.bs-info-value a{color:var(--ww-primary)}
.bs-about-hero{text-align:center;padding:2.5rem 0 2rem}
.bs-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.bs-body{max-width:44rem;margin:0 auto}
.bs-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.bs-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.bs-drow{display:flex;gap:1rem;align-items:flex-start}
.bs-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.bs-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.bs-dvalue a{color:var(--ww-primary);font-weight:600}
.bs-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.bs-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.bs-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.bs-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.bs-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.bs-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.bs-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.bs-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.bs-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.bs-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.bs-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.bs-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.bs-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.bs-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.bs-layout{grid-template-columns:1fr 1fr}}
.bs-info h2,.bs-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.bs-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.bs-info a{color:var(--ww-primary);font-weight:600}
.bs-form{display:flex;flex-direction:column;gap:.875rem}
.bs-fg{display:flex;flex-direction:column;gap:.375rem}
.bs-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.bs-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.bs-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.bs-ta{min-height:100px;resize:vertical}
.bs-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.bs-submit:hover{filter:brightness(1.1)}
.bs-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.bs-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.bs-ctas{flex-direction:column;align-items:stretch}.bs-wa-btn,.bs-sec-btn{width:100%;justify-content:center}}
</style>`;

function waSvg(){return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`}
function phoneSvg(){return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`}

type Offering={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const description=(ctx.data.description as string|null)??null;
  const tagline=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const featured=offerings.slice(0,8);
  const hasMore=offerings.length>8;
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book an appointment. Please share your availability and services.`);
  const grid=featured.length===0?'':`
  <section class="bs-section">
    <h2 class="bs-section-title">Our Services</h2>
    <div class="bs-grid">
      ${featured.map(o=>`
      <div class="bs-card">
        <h3 class="bs-card-name">${esc(o.name)}</h3>
        ${o.description?`<p class="bs-card-desc">${esc(o.description)}</p>`:''}
        ${o.priceKobo!==null?`<p class="bs-card-price">${fmtKobo(o.priceKobo)}</p>`:`<p class="bs-card-por">Price on request</p>`}
      </div>`).join('')}
    </div>
    ${hasMore?`<a href="/services" class="bs-see-all">View full price list →</a>`:''}
  </section>`;
  const aboutStrip=bio?`
  <div class="bs-about-strip">
    <h2>About ${esc(ctx.displayName)}</h2>
    <p>${esc(bio)}</p>
    <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more about us →</a>
  </div>`:'';
  const infoStrip=(phone||placeName)?`
  <div class="bs-info-strip">
    ${phone?`<div class="bs-info-item"><span class="bs-info-label">Phone</span><span class="bs-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${placeName?`<div class="bs-info-item"><span class="bs-info-label">Location</span><span class="bs-info-value">${esc(placeName)}</span></div>`:''}
    <div class="bs-info-item"><span class="bs-info-label">Book Now</span><span class="bs-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">Book on WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div>
  </div>`:'';
  return `${CSS}
<section class="bs-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="bs-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline?`<p class="bs-tagline">${esc(tagline)}</p>`:`<p class="bs-tagline">Expert braiding, locs, relaxers, gele, and makeup. You'll leave looking — and feeling — amazing.</p>`}
  <div class="bs-ctas">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="bs-wa-btn" aria-label="Book an appointment at ${esc(ctx.displayName)}">${waSvg()} Book Appointment</a>`:`<a class="bs-wa-btn" href="/contact">${waSvg()} Book Appointment</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="bs-sec-btn">${phoneSvg()} Call Now</a>`:`<a class="bs-sec-btn" href="/contact">View Contact</a>`}
  </div>
  <div class="bs-trust-strip">
    <span class="bs-badge"><span class="bs-dot"></span>Trained Stylists</span>
    <span class="bs-badge"><span class="bs-dot"></span>African Hair Specialists</span>
    <span class="bs-badge"><span class="bs-dot"></span>Open 7 Days</span>
  </div>
  <p class="bs-walkin-note">Walk-ins welcome — book ahead to guarantee your preferred time</p>
</section>
${grid}${aboutStrip}${infoStrip}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const description=(ctx.data.description as string|null)??null;
  const category=(ctx.data.category as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book an appointment.`);
  return `${CSS}
<section class="bs-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="bs-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${category?`<span class="bs-cat-badge">${esc(category)}</span>`:''}
</section>
<div class="bs-body">
  <p class="bs-desc">${description?esc(description):`${esc(ctx.displayName)} is a professional Nigerian beauty salon specialising in African hair care — braiding, locs, relaxers, natural styles, gele, and full makeup. Our trained stylists are passionate about making you look and feel your best.`}</p>
  <div class="bs-details">
    ${category?`<div class="bs-drow"><span class="bs-dlabel">Salon Type</span><span class="bs-dvalue">${esc(category)}</span></div>`:''}
    ${placeName?`<div class="bs-drow"><span class="bs-dlabel">Location</span><span class="bs-dvalue">${esc(placeName)}</span></div>`:''}
    ${phone?`<div class="bs-drow"><span class="bs-dlabel">Phone</span><span class="bs-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="bs-drow"><span class="bs-dlabel">Social / Portfolio</span><span class="bs-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="bs-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="bs-wa-btn">${waSvg()} Book Appointment</a>`:`<a class="bs-wa-btn" href="/contact">${waSvg()} Book Now</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="bs-sec-btn">${phoneSvg()} Call Now</a>`:''}
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book an appointment and enquire about your services.`);
  const content=offerings.length===0?`<div class="bs-empty"><p>Our full service menu and price list is available on request.<br/>WhatsApp us or call to find out what we offer.</p><br/>${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="bs-wa-btn">${waSvg()} WhatsApp Us</a>`:`<a class="bs-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}</div>`
    :`<div class="bs-grid">${offerings.map(o=>`
    <div class="bs-card">
      <h3 class="bs-card-name">${esc(o.name)}</h3>
      ${o.description?`<p class="bs-card-desc">${esc(o.description)}</p>`:''}
      ${o.priceKobo!==null?`<p class="bs-card-price">${fmtKobo(o.priceKobo)}</p>`:`<p class="bs-card-por">Price on request</p>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="bs-svc-hero">
  <h1>Services & Price List</h1>
  <p class="bs-sub">Hair, beauty, and personal care services at ${esc(ctx.displayName)}</p>
</section>
<section>${content}</section>
<div class="bs-cta-strip">
  <h3>Ready to book your appointment?</h3>
  <p>Book on WhatsApp or call us. Walk-ins are also welcome during salon hours.</p>
  <div class="bs-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="bs-wa-btn">${waSvg()} Book on WhatsApp</a>`:`<a class="bs-wa-btn" href="/contact">${waSvg()} Book Now</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="bs-sec-btn">${phoneSvg()} Call Now</a>`:''}
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book an appointment. Please share your available slots this week.`);
  return `${CSS}
<section class="bs-contact-hero">
  <h1>Book an Appointment</h1>
  <p>Book on WhatsApp, call us, or send a message below. Walk-ins also welcome.</p>
</section>
${waHref?`<div class="bs-wa-block"><p>The fastest way to book your slot or ask about availability.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="bs-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Book on WhatsApp</a></div>`:''}
<div class="bs-layout">
  <div class="bs-info">
    <h2>Salon Details</h2>
    ${placeName?`<p><strong>Location:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email&&!placeName?`<p>Contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Open 7 days a week. Advance booking recommended for braids, locs, and bridal makeup.</p>
  </div>
  <div class="bs-form-wrap">
    <h2>Send a Booking Request</h2>
    <form class="bs-form" method="POST" action="/contact" id="bsForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="bs-fg"><label for="bs-name">Your name</label><input id="bs-name" name="name" type="text" required autocomplete="name" class="bs-input" placeholder="e.g. Chidinma Eze" /></div>
      <div class="bs-fg"><label for="bs-phone">Phone number</label><input id="bs-phone" name="phone" type="tel" autocomplete="tel" class="bs-input" placeholder="0803 000 0000" /></div>
      <div class="bs-fg"><label for="bs-msg">Service and preferred date/time</label><textarea id="bs-msg" name="message" required rows="4" class="bs-input bs-ta" placeholder="e.g. I want to book for knotless braids on Saturday morning. Do you have availability?"></textarea></div>
      <button type="submit" class="bs-submit">Send Booking Request</button>
    </form>
    <div id="bsSuccess" class="bs-success" style="display:none" role="status" aria-live="polite"><h3>Booking request received!</h3><p>We'll confirm your appointment slot shortly. See you soon — you're going to look amazing!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('bsForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('bsSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const beautySalonPersonalCareTemplate:WebsiteTemplateContract={
  slug:'beauty-salon-personal-care',
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
