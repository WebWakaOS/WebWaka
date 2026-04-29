/**
 * IT Support / Tech Service Provider Site — NF-ITS anchor (VN-ITS-001)
 * Pillar 2 — P2-it-support-tech-service · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • NITDA-aligned / CAC registered badge
 *   • "Get IT Help" WhatsApp CTA — fast response is the key differentiation
 *   • Services: laptop repair, CCTV installation, network cabling, software setup,
 *     POS terminal setup, cloud backup, server rack, WiFi installation
 *   • "Same-day response" trust signal — Nigerian B2B IT expectation
 *   • SME-focused: small business, government MDA, school, church as clients
 *   • null price → "Get a quote" (IT projects are scope-dependent)
 *   • On-site service note — "We come to you"
 *   • COREN (Council for the Regulation of Engineering) for network/electrical
 *
 * CSS namespace: .it-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I need IT support. Please advise on availability and rates.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.it-hero{text-align:center;padding:2.75rem 0 2rem}
.it-logo{height:80px;width:80px;object-fit:contain;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.it-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.it-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.it-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.it-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.it-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.it-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.it-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.it-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.it-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.it-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.it-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.it-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.it-section{margin-top:2.75rem}
.it-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.it-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.it-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.it-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.it-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.it-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.it-card-quote{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.it-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.it-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.it-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.it-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.it-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.it-info-item{display:flex;flex-direction:column;gap:.25rem}
.it-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.it-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.it-info-value a{color:var(--ww-primary)}
.it-about-hero{text-align:center;padding:2.5rem 0 2rem}
.it-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.it-body{max-width:44rem;margin:0 auto}
.it-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.it-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.it-drow{display:flex;gap:1rem;align-items:flex-start}
.it-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.it-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.it-dvalue a{color:var(--ww-primary);font-weight:600}
.it-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.it-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.it-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.it-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.it-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.it-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.it-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.it-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.it-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.it-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.it-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.it-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.it-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.it-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.it-layout{grid-template-columns:1fr 1fr}}
.it-info h2,.it-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.it-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.it-info a{color:var(--ww-primary);font-weight:600}
.it-form{display:flex;flex-direction:column;gap:.875rem}
.it-fg{display:flex;flex-direction:column;gap:.375rem}
.it-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.it-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.it-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.it-ta{min-height:100px;resize:vertical}
.it-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.it-submit:hover{filter:brightness(1.1)}
.it-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.it-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.it-ctas{flex-direction:column;align-items:stretch}.it-wa-btn,.it-sec-btn{width:100%;justify-content:center}}
</style>`;

const waSvg=()=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;
const monitorSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;

type Offer={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const featured=offers.slice(0,6);const hasMore=offers.length>6;
  const bio=desc?(desc.length>200?desc.slice(0,200).trimEnd()+'…':desc):null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I need IT support. Please advise on availability.`);
  return `${CSS}
<section class="it-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="it-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="it-tagline">${tag?esc(tag):'Fast, reliable IT support for Nigerian businesses. Laptop repair, CCTV, networking, POS setup, and cloud services. We come to you.'}</p>
  <div class="it-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="it-wa-btn">${waSvg()} Get IT Help</a>`:`<a class="it-wa-btn" href="/contact">${waSvg()} Get IT Help</a>`}
    <a href="/services" class="it-sec-btn">${monitorSvg()} Our Services</a>
  </div>
  <div class="it-trust-strip">
    <span class="it-badge"><span class="it-dot"></span>CAC Registered</span>
    <span class="it-badge"><span class="it-dot"></span>NITDA Aligned</span>
    <span class="it-badge"><span class="it-dot"></span>Same-Day Response</span>
  </div>
  <p class="it-avail">On-site support available — we come to your office, school, or home</p>
</section>
${featured.length?`<section class="it-section"><h2 class="it-section-title">IT Services</h2><div class="it-grid">${featured.map(o=>`<div class="it-card"><h3 class="it-card-name">${esc(o.name)}</h3>${o.description?`<p class="it-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="it-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="it-card-quote">Get a quote</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="it-see-all">View all services →</a>`:''}</section>`:''}
${bio?`<div class="it-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place?`<div class="it-info-strip">${phone?`<div class="it-info-item"><span class="it-info-label">Phone</span><span class="it-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="it-info-item"><span class="it-info-label">Office</span><span class="it-info-value">${esc(place)}</span></div>`:''}<div class="it-info-item"><span class="it-info-label">Get Help</span><span class="it-info-value">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const site=(ctx.data.website as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I need IT support.`);
  return `${CSS}
<section class="it-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="it-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="it-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="it-body">
  <p class="it-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a CAC-registered Nigerian IT support company providing fast, reliable technology services to SMEs, government offices, schools, and organisations. We offer on-site support with same-day response.`}</p>
  <div class="it-details">
    ${cat?`<div class="it-drow"><span class="it-dlabel">Service Type</span><span class="it-dvalue">${esc(cat)}</span></div>`:''}
    ${place?`<div class="it-drow"><span class="it-dlabel">Office</span><span class="it-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="it-drow"><span class="it-dlabel">Phone</span><span class="it-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${site?`<div class="it-drow"><span class="it-dlabel">Portal</span><span class="it-dvalue"><a href="${safeHref(site)}" target="_blank" rel="noopener noreferrer">${esc(site)} ↗</a></span></div>`:''}
  </div>
  <div class="it-btn-row">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="it-wa-btn">${waSvg()} Get IT Help</a>`:`<a class="it-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}
    <a href="/services" class="it-sec-btn">${monitorSvg()} Our Services</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about IT support services and get a quote.`);
  const content=offers.length===0
    ?`<div class="it-empty"><p>Our full IT service catalogue is available on request.<br/>Contact us to discuss your technology needs.</p><br/>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="it-wa-btn">${waSvg()} Get IT Help</a>`:`<a class="it-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}</div>`
    :`<div class="it-grid">${offers.map(o=>`<div class="it-card"><h3 class="it-card-name">${esc(o.name)}</h3>${o.description?`<p class="it-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="it-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="it-card-quote">Get a quote</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="it-svc-hero"><h1>IT Services</h1><p class="it-sub">Technology solutions from ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="it-cta-strip"><h3>Need IT support today?</h3><p>Contact us on WhatsApp for same-day response. On-site and remote support available.</p><div class="it-btn-row" style="justify-content:center">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="it-wa-btn">${waSvg()} Get IT Help</a>`:`<a class="it-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}<a href="/contact" class="it-sec-btn">Get a Quote</a></div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I need IT support. Please advise on availability and rates.`);
  return `${CSS}
<section class="it-contact-hero"><h1>Get IT Help</h1><p>Same-day response. On-site and remote support. WhatsApp us or send a service request.</p></section>
${wa?`<div class="it-wa-block"><p>Describe your IT issue and we will advise on the fastest solution — usually same day.</p><a href="${wa}" target="_blank" rel="noopener noreferrer" class="it-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp Us</a></div>`:''}
<div class="it-layout">
  <div class="it-info"><h2>Company Details</h2>${place?`<p><strong>Office:</strong> ${esc(place)}</p>`:''}${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${!phone&&!email&&!place?`<p>Contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">We serve Lagos, Abuja, and major cities. On-site visits available. Remote support nationwide.</p></div>
  <div class="it-form-wrap"><h2>Service Request</h2>
    <form class="it-form" method="POST" action="/contact" id="itForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="it-fg"><label for="it-name">Your name</label><input id="it-name" name="name" type="text" required autocomplete="name" class="it-input" placeholder="e.g. Biodun Adeleke" /></div>
      <div class="it-fg"><label for="it-phone">Phone number</label><input id="it-phone" name="phone" type="tel" autocomplete="tel" class="it-input" placeholder="0803 000 0000" /></div>
      <div class="it-fg"><label for="it-msg">Describe the IT issue</label><textarea id="it-msg" name="message" required rows="4" class="it-input it-ta" placeholder="e.g. My laptop won't turn on. I run a small shop and need it fixed urgently. I am in Ikeja, Lagos."></textarea></div>
      <button type="submit" class="it-submit">Send Service Request</button>
    </form>
    <div id="itSuccess" class="it-success" style="display:none" role="status" aria-live="polite"><h3>Request received!</h3><p>Our IT team will respond within hours. We look forward to resolving your issue.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('itForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('itSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const itSupportTechServiceTemplate:WebsiteTemplateContract={
  slug:'it-support-tech-service',
  version:'1.0.0',
  pages:['home','about','services','contact'],
  renderPage(ctx:WebsiteRenderContext):string{
    try{
      switch(ctx.pageType){
        case 'home':return renderHome(ctx);
        case 'about':return renderAbout(ctx);
        case 'services':return renderServices(ctx);
        case 'contact':return renderContact(ctx);
        default:return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
      }
    }catch{return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Unable to load page.</p>`}
  },
};
