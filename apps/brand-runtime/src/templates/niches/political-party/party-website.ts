/**
 * Political Party Website — NF-POL-ORG anchor (VN-POL-002)
 * Pillar 2 — P2-political-party-party-website · Milestone M8b · CRITICAL
 *
 * Nigeria-First:
 *   • Party organisation website — APC, PDP, LP, NNPP, SDP, ADC, YPP context
 *   • INEC registration certificate + CAC party registration badges
 *   • "Join the Party" primary CTA — membership drive is core party revenue + legitimacy
 *   • Manifesto / policy planks as offerings — null → "Open to all Nigerians"
 *   • Party candidates section, party news, upcoming events
 *   • Strong party colour / identity expression (via CSS vars)
 *   • "Download Membership Form" secondary CTA — common in Nigerian parties
 *   • Party chairman / secretary-general credentialing in about
 *   • INEC party compliance note (PCC — party compliance certificate)
 *
 * NF-POL-ORG anchor: variants (campaign-office, lga-office, constituency-office)
 *   must inherit .pp- namespace, INEC badge, "Join the Party" / membership patterns.
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg??'Hello, I would like to join the party and register as a member.')}`;
}
function safeHref(url:string):string{try{const p=new URL(url,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(url);}catch{/**/}return '#'}

const CSS=`<style>
.pp-hero{text-align:center;padding:2.75rem 0 2rem}
.pp-logo{height:96px;width:96px;object-fit:contain;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.pp-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.pp-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.pp-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pp-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.pp-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.pp-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.pp-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.pp-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.pp-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.pp-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.pp-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.pp-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.pp-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.pp-section{margin-top:2.75rem}
.pp-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.pp-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.pp-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.pp-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.pp-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.pp-card-open{font-size:.9375rem;font-weight:600;color:var(--ww-primary);margin:.375rem 0 0}
.pp-card-fee{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.pp-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.pp-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pp-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.pp-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.pp-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.pp-info-item{display:flex;flex-direction:column;gap:.25rem}
.pp-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pp-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.pp-info-value a{color:var(--ww-primary)}
.pp-about-hero{text-align:center;padding:2.5rem 0 2rem}
.pp-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pp-body{max-width:44rem;margin:0 auto}
.pp-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.pp-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.pp-drow{display:flex;gap:1rem;align-items:flex-start}
.pp-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.pp-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.pp-dvalue a{color:var(--ww-primary);font-weight:600}
.pp-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pp-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.pp-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pp-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.pp-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.pp-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.pp-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.pp-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.pp-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.pp-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pp-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.pp-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.pp-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.pp-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.pp-layout{grid-template-columns:1fr 1fr}}
.pp-info h2,.pp-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.pp-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.pp-info a{color:var(--ww-primary);font-weight:600}
.pp-form{display:flex;flex-direction:column;gap:.875rem}
.pp-fg{display:flex;flex-direction:column;gap:.375rem}
.pp-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.pp-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.pp-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.pp-ta{min-height:100px;resize:vertical}
.pp-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.pp-submit:hover{filter:brightness(1.1)}
.pp-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.pp-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.pp-ctas{flex-direction:column;align-items:stretch}.pp-primary-btn,.pp-sec-btn,.pp-wa-btn{width:100%;justify-content:center}}
</style>`;

function waSvg(){return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`}
function handSvg(){return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 11V6a2 2 0 00-2-2v0a2 2 0 00-2 2v0M14 10V4a2 2 0 00-2-2v0a2 2 0 00-2 2v0M10 10.5V6a2 2 0 00-2-2v0a2 2 0 00-2 2v3"/><path d="M18 11a2 2 0 114 0v3a8 8 0 01-8 8H9a8 8 0 01-7.608-5.504 2 2 0 012.87-2.223L6 15"/></svg>`}

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
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to join the party and register as a member. Please advise on the next steps.`);
  const grid=featured.length===0?'':`
  <section class="pp-section">
    <h2 class="pp-section-title">Party Manifesto</h2>
    <div class="pp-grid">
      ${featured.map(o=>`
      <div class="pp-card">
        <h3 class="pp-card-name">${esc(o.name)}</h3>
        ${o.description?`<p class="pp-card-desc">${esc(o.description)}</p>`:''}
        ${o.priceKobo!==null?`<p class="pp-card-fee">Contribution: ${fmtKobo(o.priceKobo)}</p>`:`<p class="pp-card-open">Open to all Nigerians</p>`}
      </div>`).join('')}
    </div>
    ${hasMore?`<a href="/services" class="pp-see-all">View full manifesto →</a>`:''}
  </section>`;
  const aboutStrip=bio?`
  <div class="pp-about-strip">
    <h2>About ${esc(ctx.displayName)}</h2>
    <p>${esc(bio)}</p>
    <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more about the party →</a>
  </div>`:'';
  const infoStrip=(phone||placeName)?`
  <div class="pp-info-strip">
    ${phone?`<div class="pp-info-item"><span class="pp-info-label">Secretariat</span><span class="pp-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${placeName?`<div class="pp-info-item"><span class="pp-info-label">Address</span><span class="pp-info-value">${esc(placeName)}</span></div>`:''}
    <div class="pp-info-item"><span class="pp-info-label">Membership</span><span class="pp-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">Join on WhatsApp →</a>`:`<a href="/contact">Join the party →</a>`}</span></div>
  </div>`:'';
  return `${CSS}
<section class="pp-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pp-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline?`<p class="pp-tagline">${esc(tagline)}</p>`:`<p class="pp-tagline">A democratic, progressive political party committed to good governance, transparency, and prosperity for all Nigerians.</p>`}
  <div class="pp-ctas">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pp-primary-btn">${handSvg()} Join the Party</a>`:`<a class="pp-primary-btn" href="/contact">${handSvg()} Join the Party</a>`}
    <a href="/services" class="pp-sec-btn">Read Our Manifesto</a>
  </div>
  <div class="pp-trust-strip">
    <span class="pp-badge"><span class="pp-dot"></span>INEC Registered</span>
    <span class="pp-badge"><span class="pp-dot"></span>CAC Certified</span>
    <span class="pp-badge"><span class="pp-dot"></span>PCC Compliant</span>
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
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to join the party.`);
  return `${CSS}
<section class="pp-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pp-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${category?`<span class="pp-cat-badge">${esc(category)}</span>`:''}
</section>
<div class="pp-body">
  <p class="pp-desc">${description?esc(description):`${esc(ctx.displayName)} is an INEC-registered Nigerian political party committed to democratic governance and the progressive development of Nigeria. We welcome all Nigerians who share our values to join the party.`}</p>
  <div class="pp-details">
    ${category?`<div class="pp-drow"><span class="pp-dlabel">Party Type</span><span class="pp-dvalue">${esc(category)}</span></div>`:''}
    ${placeName?`<div class="pp-drow"><span class="pp-dlabel">Secretariat</span><span class="pp-dvalue">${esc(placeName)}</span></div>`:''}
    ${phone?`<div class="pp-drow"><span class="pp-dlabel">Phone</span><span class="pp-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="pp-drow"><span class="pp-dlabel">Official Site</span><span class="pp-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="pp-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pp-primary-btn">${handSvg()} Join the Party</a>`:`<a class="pp-primary-btn" href="/contact">${handSvg()} Join the Party</a>`}
    <a href="/services" class="pp-sec-btn">Read Our Manifesto</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to join the party and learn about your manifesto commitments.`);
  const content=offerings.length===0?`<div class="pp-empty"><p>Our full party manifesto and policy positions are being compiled.<br/>Contact the secretariat for more information.</p><br/>${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pp-wa-btn">${waSvg()} WhatsApp Us</a>`:`<a class="pp-primary-btn" href="/contact">${handSvg()} Contact Us</a>`}</div>`
    :`<div class="pp-grid">${offerings.map(o=>`
    <div class="pp-card">
      <h3 class="pp-card-name">${esc(o.name)}</h3>
      ${o.description?`<p class="pp-card-desc">${esc(o.description)}</p>`:''}
      ${o.priceKobo!==null?`<p class="pp-card-fee">Contribution: ${fmtKobo(o.priceKobo)}</p>`:`<p class="pp-card-open">Open to all Nigerians</p>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="pp-svc-hero">
  <h1>Party Manifesto</h1>
  <p class="pp-sub">Policy commitments and party agenda of ${esc(ctx.displayName)}</p>
</section>
<section>${content}</section>
<div class="pp-cta-strip">
  <h3>Join the movement for a better Nigeria</h3>
  <p>Become a card-carrying member and help shape the future of our great nation.</p>
  <div class="pp-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pp-primary-btn">${handSvg()} Join on WhatsApp</a>`:`<a class="pp-primary-btn" href="/contact">${handSvg()} Join the Party</a>`}
    <a href="/contact" class="pp-sec-btn">Contact Secretariat</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to join the party or enquire about membership.`);
  return `${CSS}
<section class="pp-contact-hero">
  <h1>Join the Party</h1>
  <p>Become a member, contact the secretariat, or enquire about party activities in your constituency.</p>
</section>
${waHref?`<div class="pp-wa-block"><p>Register your interest in joining the party via WhatsApp. Our membership team will guide you through the process.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pp-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Join on WhatsApp</a></div>`:''}
<div class="pp-layout">
  <div class="pp-info">
    <h2>Party Secretariat</h2>
    ${placeName?`<p><strong>Address:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email&&!placeName?`<p>Secretariat details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">All party activities are conducted in compliance with INEC guidelines and the Nigerian Constitution.</p>
  </div>
  <div class="pp-form-wrap">
    <h2>Membership Enquiry</h2>
    <form class="pp-form" method="POST" action="/contact" id="ppForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pp-fg"><label for="pp-name">Your full name</label><input id="pp-name" name="name" type="text" required autocomplete="name" class="pp-input" placeholder="e.g. Tunde Fashola" /></div>
      <div class="pp-fg"><label for="pp-phone">Phone number</label><input id="pp-phone" name="phone" type="tel" autocomplete="tel" class="pp-input" placeholder="0803 000 0000" /></div>
      <div class="pp-fg"><label for="pp-state">State of residence</label><input id="pp-state" name="state" type="text" class="pp-input" placeholder="e.g. Lagos, Kano, Rivers" /></div>
      <div class="pp-fg"><label for="pp-msg">How would you like to get involved?</label><textarea id="pp-msg" name="message" required rows="4" class="pp-input pp-ta" placeholder="e.g. I want to join the party, volunteer for an upcoming election, or enquire about party activities in my area."></textarea></div>
      <button type="submit" class="pp-submit">Send Enquiry</button>
    </form>
    <div id="ppSuccess" class="pp-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>Our membership team will contact you shortly. Welcome to the party family!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('ppForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('ppSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const politicalPartyPartyWebsiteTemplate:WebsiteTemplateContract={
  slug:'political-party-party-website',
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
