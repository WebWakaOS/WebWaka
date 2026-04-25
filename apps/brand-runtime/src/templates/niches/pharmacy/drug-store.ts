/**
 * Pharmacy / Drug Store Site — NF-PHA anchor (VN-HLT-002)
 * Pillar 2 — P2-pharmacy-drug-store · Milestone M9 · CRITICAL
 *
 * Nigeria-First:
 *   • PCN registration number (Pharmacists Council of Nigeria) prominently displayed
 *   • NAFDAC compliance badge — all drugs sold are NAFDAC-approved
 *   • "Order on WhatsApp" CTA — pharmacy WhatsApp ordering is extremely common in Nigeria
 *   • Superintending Pharmacist name + qualification (B.Pharm/Pharm.D) as trust signal
 *   • No individual drug listings (NAFDAC regulatory risk) — service/category cards instead
 *   • Services = pharmacy categories (prescription, OTC, cosmetics, diagnostics, delivery)
 *   • Null price → "Enquire for price" (drug prices vary; regulatory compliance)
 *   • Delivery available note — home delivery is a growth service
 *   • "Genuine drugs only — NAFDAC approved" as core trust message
 *
 * NF-PHA anchor: variant (pharmacy-chain) must inherit .ph- namespace,
 *   PCN+NAFDAC badge pattern, WhatsApp-order CTA, "Enquire for price" fallback.
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg??'Hello, I would like to order a drug or enquire about a prescription.')}`;
}
function safeHref(url:string):string{try{const p=new URL(url,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(url);}catch{/**/}return '#'}

const CSS=`<style>
.ph-hero{text-align:center;padding:2.75rem 0 2rem}
.ph-logo{height:80px;width:80px;object-fit:cover;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.ph-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.ph-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.ph-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ph-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.ph-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ph-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ph-delivery-note{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.ph-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ph-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ph-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ph-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ph-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.ph-section{margin-top:2.75rem}
.ph-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ph-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.ph-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.ph-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.ph-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.ph-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.ph-card-enquiry{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.ph-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.ph-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ph-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ph-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ph-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.ph-info-item{display:flex;flex-direction:column;gap:.25rem}
.ph-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ph-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ph-info-value a{color:var(--ww-primary)}
.ph-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ph-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ph-body{max-width:44rem;margin:0 auto}
.ph-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.ph-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.ph-drow{display:flex;gap:1rem;align-items:flex-start}
.ph-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.ph-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.ph-dvalue a{color:var(--ww-primary);font-weight:600}
.ph-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.ph-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.ph-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ph-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.ph-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.ph-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.ph-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ph-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ph-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ph-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ph-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.ph-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ph-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ph-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ph-layout{grid-template-columns:1fr 1fr}}
.ph-info h2,.ph-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ph-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ph-info a{color:var(--ww-primary);font-weight:600}
.ph-form{display:flex;flex-direction:column;gap:.875rem}
.ph-fg{display:flex;flex-direction:column;gap:.375rem}
.ph-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ph-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ph-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.ph-ta{min-height:100px;resize:vertical}
.ph-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.ph-submit:hover{filter:brightness(1.1)}
.ph-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.ph-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.ph-ctas{flex-direction:column;align-items:stretch}.ph-wa-btn,.ph-sec-btn{width:100%;justify-content:center}}
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
  const featured=offerings.slice(0,6);
  const hasMore=offerings.length>6;
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to order a drug or enquire about a prescription. Please advise.`);
  const grid=featured.length===0?'':`
  <section class="ph-section">
    <h2 class="ph-section-title">Our Services</h2>
    <div class="ph-grid">
      ${featured.map(o=>`
      <div class="ph-card">
        <h3 class="ph-card-name">${esc(o.name)}</h3>
        ${o.description?`<p class="ph-card-desc">${esc(o.description)}</p>`:''}
        ${o.priceKobo!==null?`<p class="ph-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="ph-card-enquiry">Enquire for price</p>`}
      </div>`).join('')}
    </div>
    ${hasMore?`<a href="/services" class="ph-see-all">View all services →</a>`:''}
  </section>`;
  const aboutStrip=bio?`
  <div class="ph-about-strip">
    <h2>About ${esc(ctx.displayName)}</h2>
    <p>${esc(bio)}</p>
    <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a>
  </div>`:'';
  const infoStrip=(phone||placeName)?`
  <div class="ph-info-strip">
    ${phone?`<div class="ph-info-item"><span class="ph-info-label">Phone</span><span class="ph-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${placeName?`<div class="ph-info-item"><span class="ph-info-label">Address</span><span class="ph-info-value">${esc(placeName)}</span></div>`:''}
    <div class="ph-info-item"><span class="ph-info-label">Order Now</span><span class="ph-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">Order on WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div>
  </div>`:'';
  return `${CSS}
<section class="ph-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ph-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline?`<p class="ph-tagline">${esc(tagline)}</p>`:`<p class="ph-tagline">Genuine drugs only — NAFDAC approved. Prescription and over-the-counter medicines dispensed by PCN-licensed pharmacists.</p>`}
  <div class="ph-ctas">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ph-wa-btn" aria-label="Order from ${esc(ctx.displayName)} on WhatsApp">${waSvg()} Order on WhatsApp</a>`:`<a class="ph-wa-btn" href="/contact">${waSvg()} Order Now</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="ph-sec-btn">${phoneSvg()} Call Now</a>`:`<a class="ph-sec-btn" href="/contact">View Contact</a>`}
  </div>
  <div class="ph-trust-strip">
    <span class="ph-badge"><span class="ph-dot"></span>PCN Registered</span>
    <span class="ph-badge"><span class="ph-dot"></span>NAFDAC Compliant</span>
    <span class="ph-badge"><span class="ph-dot"></span>Licensed Pharmacist</span>
  </div>
  <p class="ph-delivery-note">Home delivery available — order on WhatsApp</p>
</section>
${grid}${aboutStrip}${infoStrip}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const description=(ctx.data.description as string|null)??null;
  const category=(ctx.data.category as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about a prescription or order a drug.`);
  return `${CSS}
<section class="ph-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ph-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${category?`<span class="ph-cat-badge">${esc(category)}</span>`:''}
</section>
<div class="ph-body">
  <p class="ph-desc">${description?esc(description):`${esc(ctx.displayName)} is a PCN-registered Nigerian pharmacy dispensing only genuine, NAFDAC-approved drugs. Our licensed pharmacists provide expert dispensing, counselling, and advice on prescription and over-the-counter medications.`}</p>
  <div class="ph-details">
    ${category?`<div class="ph-drow"><span class="ph-dlabel">Pharmacy Type</span><span class="ph-dvalue">${esc(category)}</span></div>`:''}
    ${placeName?`<div class="ph-drow"><span class="ph-dlabel">Address</span><span class="ph-dvalue">${esc(placeName)}</span></div>`:''}
    ${phone?`<div class="ph-drow"><span class="ph-dlabel">Phone</span><span class="ph-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="ph-drow"><span class="ph-dlabel">Portal</span><span class="ph-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="ph-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ph-wa-btn">${waSvg()} Order on WhatsApp</a>`:`<a class="ph-wa-btn" href="/contact">${waSvg()} Order Now</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="ph-sec-btn">${phoneSvg()} Call Now</a>`:''}
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to order a drug or enquire about a prescription.`);
  const content=offerings.length===0?`<div class="ph-empty"><p>Our full pharmacy catalogue is available on enquiry.<br/>Contact our pharmacist directly to check drug availability and pricing.</p><br/>${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ph-wa-btn">${waSvg()} Order on WhatsApp</a>`:`<a class="ph-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}</div>`
    :`<div class="ph-grid">${offerings.map(o=>`
    <div class="ph-card">
      <h3 class="ph-card-name">${esc(o.name)}</h3>
      ${o.description?`<p class="ph-card-desc">${esc(o.description)}</p>`:''}
      ${o.priceKobo!==null?`<p class="ph-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="ph-card-enquiry">Enquire for price</p>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="ph-svc-hero">
  <h1>Our Services</h1>
  <p class="ph-sub">Prescription, OTC, and healthcare services at ${esc(ctx.displayName)}</p>
</section>
<section>${content}</section>
<div class="ph-cta-strip">
  <h3>Need a drug or prescription filled?</h3>
  <p>Order on WhatsApp or call us. Delivery available. Genuine NAFDAC-approved drugs only.</p>
  <div class="ph-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ph-wa-btn">${waSvg()} Order on WhatsApp</a>`:`<a class="ph-wa-btn" href="/contact">${waSvg()} Order Now</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="ph-sec-btn">${phoneSvg()} Call Now</a>`:''}
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to order a drug or enquire about prescription availability and pricing.`);
  return `${CSS}
<section class="ph-contact-hero">
  <h1>Order or Enquire</h1>
  <p>Order drugs on WhatsApp, call us, or send an enquiry. Delivery available within the local area.</p>
</section>
${waHref?`<div class="ph-wa-block"><p>Send us your prescription or drug name on WhatsApp — our pharmacist will advise on availability and pricing.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ph-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Order on WhatsApp</a></div>`:''}
<div class="ph-layout">
  <div class="ph-info">
    <h2>Pharmacy Details</h2>
    ${placeName?`<p><strong>Address:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email&&!placeName?`<p>Contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">We dispense only genuine, NAFDAC-approved drugs. Prescription required for Schedule 3 and above.</p>
  </div>
  <div class="ph-form-wrap">
    <h2>Drug Enquiry</h2>
    <form class="ph-form" method="POST" action="/contact" id="phForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ph-fg"><label for="ph-name">Your name</label><input id="ph-name" name="name" type="text" required autocomplete="name" class="ph-input" placeholder="e.g. Adaeze Okeke" /></div>
      <div class="ph-fg"><label for="ph-phone">Phone number</label><input id="ph-phone" name="phone" type="tel" autocomplete="tel" class="ph-input" placeholder="0803 000 0000" /></div>
      <div class="ph-fg"><label for="ph-email">Email (optional)</label><input id="ph-email" name="email" type="email" class="ph-input" placeholder="you@example.com" /></div>
      <div class="ph-fg"><label for="ph-msg">Drug name or prescription details</label><textarea id="ph-msg" name="message" required rows="4" class="ph-input ph-ta" placeholder="e.g. Drug name: Lisinopril 10mg x 30 tablets. Or: I have a prescription from my doctor — how do I send it to you?"></textarea></div>
      <button type="submit" class="ph-submit">Send Enquiry</button>
    </form>
    <div id="phSuccess" class="ph-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>Our pharmacist will respond shortly to confirm availability and pricing. Stay healthy!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('phForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('phSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const pharmacyDrugStoreTemplate:WebsiteTemplateContract={
  slug:'pharmacy-drug-store',
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
