/**
 * Tech Hub / Innovation Centre Site — Standalone (VN-PLC-002)
 * Pillar 2 — P2-tech-hub-innovation-centre · Milestone M8e · HIGH
 *
 * Nigeria-First:
 *   • Coworking + incubation + acceleration programmes as services
 *   • NITDA / GIZ / World Bank / Lagos State LASER accelerator affiliation badges
 *   • Dual CTA: "Apply for Space" + "Apply for Incubation" (two distinct user journeys)
 *   • Portfolio companies as trust signals (startups that emerged from the hub)
 *   • "Community for builders" register — energetic, innovation-positive tone
 *   • Events / cohort intake cycles as offerings — null → "Enquire for pricing"
 *   • WhatsApp for quick membership/tour enquiries
 *   • CcHUB, FATE Foundation, Co-Creation Hub, Ventures Platform, Itanna, Seedstars context
 *
 * Standalone — P1 tech anchor: .th- CSS namespace.
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg??'Hello, I would like to enquire about membership or space at your hub.')}`;
}
function safeHref(url:string):string{try{const p=new URL(url,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(url);}catch{/**/}return '#'}

const CSS=`<style>
.th-hero{text-align:center;padding:2.75rem 0 2rem}
.th-logo{height:80px;width:80px;object-fit:contain;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.th-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.th-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.th-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.th-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.th-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.th-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.th-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.th-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.th-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.th-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.th-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.th-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.th-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.th-section{margin-top:2.75rem}
.th-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.th-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.th-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.th-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.th-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.th-card-fee{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.th-card-enquiry{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.th-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.th-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.th-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.th-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.th-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.th-info-item{display:flex;flex-direction:column;gap:.25rem}
.th-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.th-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.th-info-value a{color:var(--ww-primary)}
.th-about-hero{text-align:center;padding:2.5rem 0 2rem}
.th-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.th-body{max-width:44rem;margin:0 auto}
.th-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.th-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.th-drow{display:flex;gap:1rem;align-items:flex-start}
.th-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.th-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.th-dvalue a{color:var(--ww-primary);font-weight:600}
.th-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.th-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.th-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.th-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.th-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.th-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.th-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.th-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.th-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.th-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.th-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.th-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.th-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.th-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.th-layout{grid-template-columns:1fr 1fr}}
.th-info h2,.th-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.th-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.th-info a{color:var(--ww-primary);font-weight:600}
.th-form{display:flex;flex-direction:column;gap:.875rem}
.th-fg{display:flex;flex-direction:column;gap:.375rem}
.th-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.th-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.th-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.th-ta{min-height:100px;resize:vertical}
.th-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.th-submit:hover{filter:brightness(1.1)}
.th-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.th-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.th-ctas{flex-direction:column;align-items:stretch}.th-primary-btn,.th-sec-btn,.th-wa-btn{width:100%;justify-content:center}}
</style>`;

function waSvg(){return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`}
function rocketSvg(){return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l-.55-.55"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`}

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
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about coworking space or your incubation programme.`);
  const grid=featured.length===0?'':`
  <section class="th-section">
    <h2 class="th-section-title">Programmes & Spaces</h2>
    <div class="th-grid">
      ${featured.map(o=>`
      <div class="th-card">
        <h3 class="th-card-name">${esc(o.name)}</h3>
        ${o.description?`<p class="th-card-desc">${esc(o.description)}</p>`:''}
        ${o.priceKobo!==null?`<p class="th-card-fee">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="th-card-enquiry">Enquire for pricing</p>`}
      </div>`).join('')}
    </div>
    ${hasMore?`<a href="/services" class="th-see-all">View all programmes →</a>`:''}
  </section>`;
  const aboutStrip=bio?`
  <div class="th-about-strip">
    <h2>About ${esc(ctx.displayName)}</h2>
    <p>${esc(bio)}</p>
    <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a>
  </div>`:'';
  const infoStrip=(phone||placeName)?`
  <div class="th-info-strip">
    ${phone?`<div class="th-info-item"><span class="th-info-label">Phone</span><span class="th-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${placeName?`<div class="th-info-item"><span class="th-info-label">Location</span><span class="th-info-value">${esc(placeName)}</span></div>`:''}
    <div class="th-info-item"><span class="th-info-label">Apply</span><span class="th-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div>
  </div>`:'';
  return `${CSS}
<section class="th-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="th-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline?`<p class="th-tagline">${esc(tagline)}</p>`:`<p class="th-tagline">A community for builders, founders, and innovators. Coworking, incubation, and acceleration — all in one place.</p>`}
  <div class="th-ctas">
    <a href="/contact" class="th-primary-btn">${rocketSvg()} Apply for Space</a>
    <a href="/services" class="th-sec-btn">View Programmes</a>
  </div>
  <div class="th-trust-strip">
    <span class="th-badge"><span class="th-dot"></span>CAC Registered</span>
    <span class="th-badge"><span class="th-dot"></span>NITDA Accredited</span>
    <span class="th-badge"><span class="th-dot"></span>Internationally Partnered</span>
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
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about your programmes and spaces.`);
  return `${CSS}
<section class="th-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="th-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${category?`<span class="th-cat-badge">${esc(category)}</span>`:''}
</section>
<div class="th-body">
  <p class="th-desc">${description?esc(description):`${esc(ctx.displayName)} is a CAC-registered Nigerian innovation hub providing coworking space, startup incubation, and acceleration programmes. We are partnered with NITDA and international development organisations to support Nigeria's growing tech ecosystem.`}</p>
  <div class="th-details">
    ${category?`<div class="th-drow"><span class="th-dlabel">Hub Type</span><span class="th-dvalue">${esc(category)}</span></div>`:''}
    ${placeName?`<div class="th-drow"><span class="th-dlabel">Location</span><span class="th-dvalue">${esc(placeName)}</span></div>`:''}
    ${phone?`<div class="th-drow"><span class="th-dlabel">Phone</span><span class="th-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="th-drow"><span class="th-dlabel">Website</span><span class="th-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="th-btn-row">
    <a href="/contact" class="th-primary-btn">${rocketSvg()} Apply for Space</a>
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="th-sec-btn">${waSvg()} WhatsApp Us</a>`:`<a class="th-sec-btn" href="/contact">Contact Us</a>`}
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to apply for one of your programmes or book a coworking space.`);
  const content=offerings.length===0?`<div class="th-empty"><p>Our programmes and spaces are being updated.<br/>Contact us to learn about current availability.</p><br/><a href="/contact" class="th-primary-btn">${rocketSvg()} Apply Now</a></div>`
    :`<div class="th-grid">${offerings.map(o=>`
    <div class="th-card">
      <h3 class="th-card-name">${esc(o.name)}</h3>
      ${o.description?`<p class="th-card-desc">${esc(o.description)}</p>`:''}
      ${o.priceKobo!==null?`<p class="th-card-fee">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="th-card-enquiry">Enquire for pricing</p>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="th-svc-hero">
  <h1>Programmes & Spaces</h1>
  <p class="th-sub">Coworking, incubation, and acceleration programmes at ${esc(ctx.displayName)}</p>
</section>
<section>${content}</section>
<div class="th-cta-strip">
  <h3>Ready to build something great?</h3>
  <p>Apply for a space or programme and join a community of Nigeria's best builders and founders.</p>
  <div class="th-btn-row" style="justify-content:center">
    <a href="/contact" class="th-primary-btn">${rocketSvg()} Apply Now</a>
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="th-sec-btn">${waSvg()} WhatsApp Us</a>`:`<a class="th-sec-btn" href="/contact">Contact Us</a>`}
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about applying for space or your incubation programme.`);
  return `${CSS}
<section class="th-contact-hero">
  <h1>Apply for Space</h1>
  <p>Enquire about coworking, incubation, or acceleration programmes. Our team will respond promptly.</p>
</section>
${waHref?`<div class="th-wa-block"><p>The quickest way to ask about availability and programmes.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="th-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp Us</a></div>`:''}
<div class="th-layout">
  <div class="th-info">
    <h2>Hub Details</h2>
    ${placeName?`<p><strong>Location:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email&&!placeName?`<p>Hub details coming soon.</p>`:''}
  </div>
  <div class="th-form-wrap">
    <h2>Application Enquiry</h2>
    <form class="th-form" method="POST" action="/contact" id="thForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="th-fg"><label for="th-name">Your name</label><input id="th-name" name="name" type="text" required autocomplete="name" class="th-input" placeholder="e.g. Chinyere Okafor" /></div>
      <div class="th-fg"><label for="th-phone">Phone number</label><input id="th-phone" name="phone" type="tel" autocomplete="tel" class="th-input" placeholder="0803 000 0000" /></div>
      <div class="th-fg"><label for="th-email">Email address</label><input id="th-email" name="email" type="email" class="th-input" placeholder="you@startup.com" /></div>
      <div class="th-fg"><label for="th-msg">What are you building / what do you need?</label><textarea id="th-msg" name="message" required rows="4" class="th-input th-ta" placeholder="e.g. I am building a fintech startup and need coworking space + mentorship. Tell me about your current intake."></textarea></div>
      <button type="submit" class="th-submit">Send Application</button>
    </form>
    <div id="thSuccess" class="th-success" style="display:none" role="status" aria-live="polite"><h3>Application received!</h3><p>Our team will review and get back to you shortly. Keep building!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('thForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('thSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const techHubInnovationCentreTemplate:WebsiteTemplateContract={
  slug:'tech-hub-innovation-centre',
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
