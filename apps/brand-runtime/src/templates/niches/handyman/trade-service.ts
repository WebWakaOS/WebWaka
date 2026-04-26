/**
 * Handyman / Home Trade Service Site — NF-HMS anchor (VN-HMS-001)
 * Pillar 2 — P2-handyman-trade-service · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • "Licensed Artisans" trust signal — skilled labour quality concern
 *   • COREN (Council for the Regulation of Engineering) for electrical work
 *   • Services: plumbing, electrical, painting, carpentry, tiling, POP ceiling,
 *     generator servicing, wall cracks, waterproofing
 *   • "Book a Job" WhatsApp CTA — home service bookings typically via WhatsApp
 *   • NGN pricing per job / per day rate; null → "Call for quote" (bespoke jobs)
 *   • "We bring our tools" — materials vs labour distinction common in Nigeria
 *   • Location radius note — "Serving [City] and environs"
 *   • "Before/after" promise without DB (copy only)
 *
 * CSS namespace: .hm-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I need a handyman job done. Please advise on availability and rates.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.hm-hero{text-align:center;padding:2.75rem 0 2rem}
.hm-logo{height:80px;width:80px;object-fit:contain;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.hm-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.hm-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.hm-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.hm-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.hm-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.hm-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.hm-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.hm-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.hm-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.hm-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.hm-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.hm-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.hm-section{margin-top:2.75rem}
.hm-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.hm-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.hm-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.hm-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.hm-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.hm-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.hm-card-quote{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.hm-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.hm-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.hm-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.hm-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.hm-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.hm-info-item{display:flex;flex-direction:column;gap:.25rem}
.hm-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.hm-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.hm-info-value a{color:var(--ww-primary)}
.hm-about-hero{text-align:center;padding:2.5rem 0 2rem}
.hm-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.hm-body{max-width:44rem;margin:0 auto}
.hm-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.hm-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.hm-drow{display:flex;gap:1rem;align-items:flex-start}
.hm-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.hm-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.hm-dvalue a{color:var(--ww-primary);font-weight:600}
.hm-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.hm-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.hm-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.hm-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.hm-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.hm-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.hm-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.hm-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.hm-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.hm-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.hm-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.hm-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.hm-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.hm-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.hm-layout{grid-template-columns:1fr 1fr}}
.hm-info h2,.hm-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.hm-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.hm-info a{color:var(--ww-primary);font-weight:600}
.hm-form{display:flex;flex-direction:column;gap:.875rem}
.hm-fg{display:flex;flex-direction:column;gap:.375rem}
.hm-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.hm-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.hm-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.hm-ta{min-height:100px;resize:vertical}
.hm-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.hm-submit:hover{filter:brightness(1.1)}
.hm-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.hm-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.hm-ctas{flex-direction:column;align-items:stretch}.hm-wa-btn,.hm-sec-btn{width:100%;justify-content:center}}
</style>`;

const waSvg=()=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;
const toolSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`;

type Offer={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const featured=offers.slice(0,6);const hasMore=offers.length>6;
  const bio=desc?(desc.length>200?desc.slice(0,200).trimEnd()+'…':desc):null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I need a handyman. Please advise on availability and rates.`);
  return `${CSS}
<section class="hm-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="hm-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="hm-tagline">${tag?esc(tag):'Reliable handymen for plumbing, electrical, painting, carpentry, tiling, and more. We come to you with our tools.'}</p>
  <div class="hm-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="hm-wa-btn">${waSvg()} Book a Job</a>`:`<a class="hm-wa-btn" href="/contact">${waSvg()} Book a Job</a>`}
    <a href="/services" class="hm-sec-btn">${toolSvg()} Our Services</a>
  </div>
  <div class="hm-trust-strip">
    <span class="hm-badge"><span class="hm-dot"></span>Licensed Artisans</span>
    <span class="hm-badge"><span class="hm-dot"></span>COREN Compliant</span>
    <span class="hm-badge"><span class="hm-dot"></span>We Bring Our Tools</span>
  </div>
  <p class="hm-avail">Serving ${place?esc(place.split(',')[0]??place):'your city'} and environs · Materials can be quoted separately</p>
</section>
${featured.length?`<section class="hm-section"><h2 class="hm-section-title">Trade Services</h2><div class="hm-grid">${featured.map(o=>`<div class="hm-card"><h3 class="hm-card-name">${esc(o.name)}</h3>${o.description?`<p class="hm-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="hm-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="hm-card-quote">Call for quote</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="hm-see-all">View all services →</a>`:''}</section>`:''}
${bio?`<div class="hm-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place?`<div class="hm-info-strip">${phone?`<div class="hm-info-item"><span class="hm-info-label">Phone</span><span class="hm-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="hm-info-item"><span class="hm-info-label">Location</span><span class="hm-info-value">${esc(place)}</span></div>`:''}<div class="hm-info-item"><span class="hm-info-label">Book</span><span class="hm-info-value">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const site=(ctx.data.website as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I need a handyman job done.`);
  return `${CSS}
<section class="hm-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="hm-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="hm-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="hm-body">
  <p class="hm-desc">${desc?esc(desc):`${esc(ctx.displayName)} provides reliable, licensed artisan services for homes and offices across Nigeria. Our skilled tradespeople handle plumbing, electrical, carpentry, painting, tiling, POP ceiling, and general repairs.`}</p>
  <div class="hm-details">
    ${cat?`<div class="hm-drow"><span class="hm-dlabel">Trade Type</span><span class="hm-dvalue">${esc(cat)}</span></div>`:''}
    ${place?`<div class="hm-drow"><span class="hm-dlabel">Service Area</span><span class="hm-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="hm-drow"><span class="hm-dlabel">Phone</span><span class="hm-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${site?`<div class="hm-drow"><span class="hm-dlabel">Website</span><span class="hm-dvalue"><a href="${safeHref(site)}" target="_blank" rel="noopener noreferrer">${esc(site)} ↗</a></span></div>`:''}
  </div>
  <div class="hm-btn-row">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="hm-wa-btn">${waSvg()} Book a Job</a>`:`<a class="hm-wa-btn" href="/contact">${waSvg()} Book Now</a>`}
    <a href="/services" class="hm-sec-btn">${toolSvg()} Our Services</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I need a handyman. Please share your rates.`);
  const content=offers.length===0
    ?`<div class="hm-empty"><p>Our trade services cover plumbing, electrical, painting, carpentry, tiling, and more.<br/>Contact us to discuss your job and get a quote.</p><br/>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="hm-wa-btn">${waSvg()} Book on WhatsApp</a>`:`<a class="hm-wa-btn" href="/contact">${waSvg()} Book Now</a>`}</div>`
    :`<div class="hm-grid">${offers.map(o=>`<div class="hm-card"><h3 class="hm-card-name">${esc(o.name)}</h3>${o.description?`<p class="hm-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="hm-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="hm-card-quote">Call for quote</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="hm-svc-hero"><h1>Trade Services</h1><p class="hm-sub">Home and office repairs from ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="hm-cta-strip"><h3>Need a job done?</h3><p>Book on WhatsApp for same-day or next-day response. We come to you with our tools.</p><div class="hm-btn-row" style="justify-content:center">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="hm-wa-btn">${waSvg()} Book on WhatsApp</a>`:`<a class="hm-wa-btn" href="/contact">${waSvg()} Book Now</a>`}<a href="/contact" class="hm-sec-btn">Get a Quote</a></div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I need a handyman. Please advise on rates and availability.`);
  return `${CSS}
<section class="hm-contact-hero"><h1>Book a Job</h1><p>WhatsApp us for the fastest response. Or fill the form and we will call you back.</p></section>
${wa?`<div class="hm-wa-block"><p>Describe the job, your location, and your preferred date — we will confirm availability quickly.</p><a href="${wa}" target="_blank" rel="noopener noreferrer" class="hm-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Book on WhatsApp</a></div>`:''}
<div class="hm-layout">
  <div class="hm-info"><h2>Contact Details</h2>${place?`<p><strong>Service Area:</strong> ${esc(place)}</p>`:''}${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${!phone&&!email&&!place?`<p>Contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Labour and materials quoted separately on request. All artisans are vetted and insured.</p></div>
  <div class="hm-form-wrap"><h2>Job Request</h2>
    <form class="hm-form" method="POST" action="/contact" id="hmForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="hm-fg"><label for="hm-name">Your name</label><input id="hm-name" name="name" type="text" required autocomplete="name" class="hm-input" placeholder="e.g. Tunde Balogun" /></div>
      <div class="hm-fg"><label for="hm-phone">Phone number</label><input id="hm-phone" name="phone" type="tel" autocomplete="tel" class="hm-input" placeholder="0803 000 0000" /></div>
      <div class="hm-fg"><label for="hm-msg">Describe the job</label><textarea id="hm-msg" name="message" required rows="4" class="hm-input hm-ta" placeholder="e.g. Plumbing issue — burst pipe under kitchen sink. I am in Surulere, Lagos. Please come this week."></textarea></div>
      <button type="submit" class="hm-submit">Send Job Request</button>
    </form>
    <div id="hmSuccess" class="hm-success" style="display:none" role="status" aria-live="polite"><h3>Job request received!</h3><p>We will contact you shortly to schedule your job. Thank you for choosing us.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('hmForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('hmSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const handymanTradeServiceTemplate:WebsiteTemplateContract={
  slug:'handyman-trade-service',
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
