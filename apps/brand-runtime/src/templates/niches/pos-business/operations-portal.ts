/**
 * POS Business Operations Portal — Standalone (VN-SVC-001)
 * Pillar 2 — P2-pos-business-operations-portal · Milestone M8b · CRITICAL
 *
 * Nigeria-First:
 *   • Operations portal — targeted at POS agent managing their own business
 *   • Services = financial transactions offered (cash-out, transfers, airtime, bills, POS payment)
 *   • "Start a Transaction" WhatsApp CTA — customers WhatsApp the agent for complex transactions
 *   • CAC Business Name + FIRS TIN registration badges as trust signals
 *   • Daily cash limits and service availability prominently displayed
 *   • "Always Available" / "Open Now" hours signal — many POS agents operate extended hours
 *   • Null priceKobo → "Enquire for rate" (transaction fees vary by agent/network)
 *   • "Fast. Safe. Reliable." — core value proposition in tagline
 *   • NIBSS / CBN compliance note for customer confidence
 *
 * Standalone: not anchoring a family. .pb- CSS namespace.
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg??'Hello, I would like to carry out a POS transaction.')}`;
}
function safeHref(url:string):string{try{const p=new URL(url,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(url);}catch{/**/}return '#'}

const CSS=`<style>
.pb-hero{text-align:center;padding:2.75rem 0 2rem}
.pb-logo{height:80px;width:80px;object-fit:cover;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.pb-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.pb-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.pb-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pb-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.pb-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.pb-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.pb-open-note{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.pb-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.pb-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.pb-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.pb-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.pb-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.pb-section{margin-top:2.75rem}
.pb-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.pb-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.pb-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.pb-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.pb-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.pb-card-fee{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.pb-card-enquiry{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.pb-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.pb-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pb-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.pb-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.pb-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.pb-info-item{display:flex;flex-direction:column;gap:.25rem}
.pb-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pb-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.pb-info-value a{color:var(--ww-primary)}
.pb-about-hero{text-align:center;padding:2.5rem 0 2rem}
.pb-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pb-body{max-width:44rem;margin:0 auto}
.pb-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.pb-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.pb-drow{display:flex;gap:1rem;align-items:flex-start}
.pb-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.pb-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.pb-dvalue a{color:var(--ww-primary);font-weight:600}
.pb-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pb-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.pb-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pb-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.pb-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.pb-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.pb-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.pb-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.pb-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.pb-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pb-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.pb-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.pb-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.pb-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.pb-layout{grid-template-columns:1fr 1fr}}
.pb-info h2,.pb-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.pb-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.pb-info a{color:var(--ww-primary);font-weight:600}
.pb-form{display:flex;flex-direction:column;gap:.875rem}
.pb-fg{display:flex;flex-direction:column;gap:.375rem}
.pb-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.pb-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.pb-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.pb-ta{min-height:100px;resize:vertical}
.pb-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.pb-submit:hover{filter:brightness(1.1)}
.pb-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.pb-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.pb-ctas{flex-direction:column;align-items:stretch}.pb-wa-btn,.pb-sec-btn{width:100%;justify-content:center}}
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
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to carry out a transaction. Please advise.`);
  const grid=featured.length===0?'':`
  <section class="pb-section">
    <h2 class="pb-section-title">Services Available</h2>
    <div class="pb-grid">
      ${featured.map(o=>`
      <div class="pb-card">
        <h3 class="pb-card-name">${esc(o.name)}</h3>
        ${o.description?`<p class="pb-card-desc">${esc(o.description)}</p>`:''}
        ${o.priceKobo!==null?`<p class="pb-card-fee">Fee: ${fmtKobo(o.priceKobo)}</p>`:`<p class="pb-card-enquiry">Enquire for rate</p>`}
      </div>`).join('')}
    </div>
    ${hasMore?`<a href="/services" class="pb-see-all">View all services →</a>`:''}
  </section>`;
  const aboutStrip=bio?`
  <div class="pb-about-strip">
    <h2>About ${esc(ctx.displayName)}</h2>
    <p>${esc(bio)}</p>
    <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a>
  </div>`:'';
  const infoStrip=(phone||placeName)?`
  <div class="pb-info-strip">
    ${phone?`<div class="pb-info-item"><span class="pb-info-label">Phone</span><span class="pb-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${placeName?`<div class="pb-info-item"><span class="pb-info-label">Location</span><span class="pb-info-value">${esc(placeName)}</span></div>`:''}
    <div class="pb-info-item"><span class="pb-info-label">Transactions</span><span class="pb-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">Start on WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div>
  </div>`:'';
  return `${CSS}
<section class="pb-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pb-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline?`<p class="pb-tagline">${esc(tagline)}</p>`:`<p class="pb-tagline">Fast. Safe. Reliable. Your trusted POS agent — cash withdrawals, transfers, airtime and bill payments.</p>`}
  <div class="pb-ctas">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pb-wa-btn" aria-label="Start a transaction with ${esc(ctx.displayName)}">${waSvg()} Start a Transaction</a>`:`<a class="pb-wa-btn" href="/contact">${waSvg()} Start a Transaction</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="pb-sec-btn">${phoneSvg()} Call Now</a>`:`<a class="pb-sec-btn" href="/contact">View Contact</a>`}
  </div>
  <div class="pb-trust-strip">
    <span class="pb-badge"><span class="pb-dot"></span>CAC Registered</span>
    <span class="pb-badge"><span class="pb-dot"></span>FIRS TIN Issued</span>
    <span class="pb-badge"><span class="pb-dot"></span>CBN Compliant</span>
  </div>
  <p class="pb-open-note">Open daily — extended hours for your convenience</p>
</section>
${grid}${aboutStrip}${infoStrip}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const description=(ctx.data.description as string|null)??null;
  const category=(ctx.data.category as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to carry out a transaction.`);
  return `${CSS}
<section class="pb-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pb-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${category?`<span class="pb-cat-badge">${esc(category)}</span>`:''}
</section>
<div class="pb-body">
  <p class="pb-desc">${description?esc(description):`${esc(ctx.displayName)} is a registered POS business providing reliable financial services to individuals and businesses. We are CAC-registered, FIRS TIN-issued, and operate in compliance with CBN guidelines for agent banking.`}</p>
  <div class="pb-details">
    ${category?`<div class="pb-drow"><span class="pb-dlabel">Business Type</span><span class="pb-dvalue">${esc(category)}</span></div>`:''}
    ${placeName?`<div class="pb-drow"><span class="pb-dlabel">Location</span><span class="pb-dvalue">${esc(placeName)}</span></div>`:''}
    ${phone?`<div class="pb-drow"><span class="pb-dlabel">Phone</span><span class="pb-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="pb-drow"><span class="pb-dlabel">Portal</span><span class="pb-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="pb-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pb-wa-btn">${waSvg()} Start a Transaction</a>`:`<a class="pb-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="pb-sec-btn">${phoneSvg()} Call Now</a>`:''}
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to carry out a transaction. Please advise on availability and rates.`);
  const content=offerings.length===0?`<div class="pb-empty"><p>Our full list of services and transaction rates is available on enquiry.<br/>Contact us to get started.</p><br/>${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pb-wa-btn">${waSvg()} Enquire on WhatsApp</a>`:`<a class="pb-wa-btn" href="/contact">Contact Us</a>`}</div>`
    :`<div class="pb-grid">${offerings.map(o=>`
    <div class="pb-card">
      <h3 class="pb-card-name">${esc(o.name)}</h3>
      ${o.description?`<p class="pb-card-desc">${esc(o.description)}</p>`:''}
      ${o.priceKobo!==null?`<p class="pb-card-fee">Fee: ${fmtKobo(o.priceKobo)}</p>`:`<p class="pb-card-enquiry">Enquire for rate</p>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="pb-svc-hero">
  <h1>Services Available</h1>
  <p class="pb-sub">Financial services offered by ${esc(ctx.displayName)}</p>
</section>
<section>${content}</section>
<div class="pb-cta-strip">
  <h3>Ready to transact?</h3>
  <p>Start on WhatsApp or call us directly. Fast, secure, and reliable every time.</p>
  <div class="pb-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pb-wa-btn">${waSvg()} Start on WhatsApp</a>`:`<a class="pb-wa-btn" href="/contact">${waSvg()} Start a Transaction</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="pb-sec-btn">${phoneSvg()} Call Now</a>`:''}
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to start a transaction or enquire about your rates.`);
  return `${CSS}
<section class="pb-contact-hero">
  <h1>Start a Transaction</h1>
  <p>Reach us on WhatsApp, by phone, or visit our location to carry out any financial transaction.</p>
</section>
${waHref?`<div class="pb-wa-block"><p>The quickest way to start a transaction or enquire about rates.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pb-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Start on WhatsApp</a></div>`:''}
<div class="pb-layout">
  <div class="pb-info">
    <h2>Agent Details</h2>
    ${placeName?`<p><strong>Location:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email&&!placeName?`<p>Contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">All transactions are processed securely in compliance with CBN and NIBSS guidelines.</p>
  </div>
  <div class="pb-form-wrap">
    <h2>Send an Enquiry</h2>
    <form class="pb-form" method="POST" action="/contact" id="pbForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pb-fg"><label for="pb-name">Your name</label><input id="pb-name" name="name" type="text" required autocomplete="name" class="pb-input" placeholder="e.g. Emeka Nwosu" /></div>
      <div class="pb-fg"><label for="pb-phone">Phone number</label><input id="pb-phone" name="phone" type="tel" autocomplete="tel" class="pb-input" placeholder="0803 000 0000" /></div>
      <div class="pb-fg"><label for="pb-msg">Transaction or enquiry details</label><textarea id="pb-msg" name="message" required rows="4" class="pb-input pb-ta" placeholder="e.g. I need to withdraw ₦50,000, transfer funds, or enquire about your daily limit."></textarea></div>
      <button type="submit" class="pb-submit">Send Enquiry</button>
    </form>
    <div id="pbSuccess" class="pb-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will respond to your transaction request shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('pbForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('pbSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const posBusinessOperationsPortalTemplate:WebsiteTemplateContract={
  slug:'pos-business-operations-portal',
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
