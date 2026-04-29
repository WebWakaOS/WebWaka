/**
 * Catering / Event Food Service Site — NF-CAT anchor (VN-CAT-001)
 * Pillar 2 — P2-catering-event-service · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • NAFDAC compliance badge — food safety for events
 *   • "Get a Quote" WhatsApp CTA — event catering is always bespoke
 *   • Packages as offerings: small chops, jollof rice & pepper soup, full buffet,
 *     canape, cocktail, breakfast/brunch
 *   • "Minimum 50 guests" note — common Nigerian catering floor
 *   • NGN per-head pricing; null → "Quote on request" (bespoke/full events)
 *   • "We bring chafing dishes and serving staff" trust signal
 *   • Nigerian event food context: jollof rice, fried rice, egusi, pepper soup,
 *     small chops, asun, point & kill
 *   • "No deposit lost" / satisfaction guarantee copy
 *
 * CSS namespace: .ct-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like a catering quote for an upcoming event. Please advise on your packages and rates.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.ct-hero{text-align:center;padding:2.75rem 0 2rem}
.ct-logo{height:80px;width:80px;object-fit:contain;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.ct-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.ct-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.ct-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ct-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.ct-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ct-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ct-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.ct-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ct-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ct-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ct-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ct-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.ct-section{margin-top:2.75rem}
.ct-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ct-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.ct-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.ct-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.ct-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.ct-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.ct-card-qor{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.ct-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.ct-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ct-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ct-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ct-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.ct-info-item{display:flex;flex-direction:column;gap:.25rem}
.ct-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ct-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ct-info-value a{color:var(--ww-primary)}
.ct-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ct-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ct-body{max-width:44rem;margin:0 auto}
.ct-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.ct-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.ct-drow{display:flex;gap:1rem;align-items:flex-start}
.ct-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.ct-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.ct-dvalue a{color:var(--ww-primary);font-weight:600}
.ct-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.ct-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.ct-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ct-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.ct-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.ct-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.ct-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ct-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ct-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ct-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ct-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.ct-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ct-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ct-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ct-layout{grid-template-columns:1fr 1fr}}
.ct-info h2,.ct-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ct-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ct-info a{color:var(--ww-primary);font-weight:600}
.ct-form{display:flex;flex-direction:column;gap:.875rem}
.ct-fg{display:flex;flex-direction:column;gap:.375rem}
.ct-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ct-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ct-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.ct-ta{min-height:100px;resize:vertical}
.ct-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.ct-submit:hover{filter:brightness(1.1)}
.ct-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.ct-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.ct-ctas{flex-direction:column;align-items:stretch}.ct-wa-btn,.ct-sec-btn{width:100%;justify-content:center}}
</style>`;

const waSvg=()=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;
const forkSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`;

type Offer={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const featured=offers.slice(0,6);const hasMore=offers.length>6;
  const bio=desc?(desc.length>200?desc.slice(0,200).trimEnd()+'…':desc):null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like a catering quote for an upcoming event. Please share your packages and rates.`);
  return `${CSS}
<section class="ct-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ct-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="ct-tagline">${tag?esc(tag):'Exceptional Nigerian event catering — weddings, birthdays, corporate events, and parties. Jollof rice, small chops, buffets, and more. We set up and serve.'}</p>
  <div class="ct-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ct-wa-btn">${waSvg()} Get a Quote</a>`:`<a class="ct-wa-btn" href="/contact">${waSvg()} Get a Quote</a>`}
    <a href="/services" class="ct-sec-btn">${forkSvg()} Our Packages</a>
  </div>
  <div class="ct-trust-strip">
    <span class="ct-badge"><span class="ct-dot"></span>NAFDAC Compliant</span>
    <span class="ct-badge"><span class="ct-dot"></span>We Set Up & Serve</span>
    <span class="ct-badge"><span class="ct-dot"></span>Satisfaction Guaranteed</span>
  </div>
  <p class="ct-avail">Minimum 50 guests · Chafing dishes and serving staff included · Nigerian & continental menus</p>
</section>
${featured.length?`<section class="ct-section"><h2 class="ct-section-title">Catering Packages</h2><div class="ct-grid">${featured.map(o=>`<div class="ct-card"><h3 class="ct-card-name">${esc(o.name)}</h3>${o.description?`<p class="ct-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="ct-card-price">From ${fmtKobo(o.priceKobo)} per head</p>`:`<p class="ct-card-qor">Quote on request</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="ct-see-all">View all packages →</a>`:''}</section>`:''}
${bio?`<div class="ct-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place?`<div class="ct-info-strip">${phone?`<div class="ct-info-item"><span class="ct-info-label">Phone</span><span class="ct-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="ct-info-item"><span class="ct-info-label">Based In</span><span class="ct-info-value">${esc(place)}</span></div>`:''}<div class="ct-info-item"><span class="ct-info-label">Quote</span><span class="ct-info-value">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const site=(ctx.data.website as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like a catering quote.`);
  return `${CSS}
<section class="ct-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ct-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="ct-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="ct-body">
  <p class="ct-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a NAFDAC-compliant Nigerian catering company delivering exceptional food and service for weddings, birthdays, corporate dinners, and social events. We provide Nigerian and continental menus with full setup and serving staff.`}</p>
  <div class="ct-details">
    ${cat?`<div class="ct-drow"><span class="ct-dlabel">Service Type</span><span class="ct-dvalue">${esc(cat)}</span></div>`:''}
    ${place?`<div class="ct-drow"><span class="ct-dlabel">Based In</span><span class="ct-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="ct-drow"><span class="ct-dlabel">Phone</span><span class="ct-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${site?`<div class="ct-drow"><span class="ct-dlabel">Website</span><span class="ct-dvalue"><a href="${safeHref(site)}" target="_blank" rel="noopener noreferrer">${esc(site)} ↗</a></span></div>`:''}
  </div>
  <div class="ct-btn-row">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ct-wa-btn">${waSvg()} Get a Quote</a>`:`<a class="ct-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}
    <a href="/services" class="ct-sec-btn">${forkSvg()} Our Packages</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to get a catering quote for an event.`);
  const content=offers.length===0
    ?`<div class="ct-empty"><p>Our catering packages cover weddings, birthdays, corporate events, and more.<br/>Contact us to discuss your event and get a tailored quote.</p><br/>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ct-wa-btn">${waSvg()} Get a Quote</a>`:`<a class="ct-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}</div>`
    :`<div class="ct-grid">${offers.map(o=>`<div class="ct-card"><h3 class="ct-card-name">${esc(o.name)}</h3>${o.description?`<p class="ct-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="ct-card-price">From ${fmtKobo(o.priceKobo)} per head</p>`:`<p class="ct-card-qor">Quote on request</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="ct-svc-hero"><h1>Catering Packages</h1><p class="ct-sub">Event food services from ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="ct-cta-strip"><h3>Planning an event?</h3><p>Tell us your event type, guest count, and date — we will send a tailored quote promptly.</p><div class="ct-btn-row" style="justify-content:center">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ct-wa-btn">${waSvg()} Get a Quote</a>`:`<a class="ct-wa-btn" href="/contact">${waSvg()} Get a Quote</a>`}<a href="/contact" class="ct-sec-btn">Send Event Details</a></div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like a catering quote for an upcoming event. Please advise.`);
  return `${CSS}
<section class="ct-contact-hero"><h1>Get a Catering Quote</h1><p>Share your event details and we will send a comprehensive quote within 24 hours.</p></section>
${wa?`<div class="ct-wa-block"><p>Tell us your event type, date, venue, and number of guests — we will tailor a menu and quote for you.</p><a href="${wa}" target="_blank" rel="noopener noreferrer" class="ct-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp Us Now</a></div>`:''}
<div class="ct-layout">
  <div class="ct-info"><h2>Company Details</h2>${place?`<p><strong>Based in:</strong> ${esc(place)}</p>`:''}${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${!phone&&!email&&!place?`<p>Contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Minimum 50 guests. Full setup and serving staff included. NAFDAC-compliant food handling.</p></div>
  <div class="ct-form-wrap"><h2>Event Enquiry</h2>
    <form class="ct-form" method="POST" action="/contact" id="ctForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ct-fg"><label for="ct-name">Your name</label><input id="ct-name" name="name" type="text" required autocomplete="name" class="ct-input" placeholder="e.g. Ngozi Adeyemi" /></div>
      <div class="ct-fg"><label for="ct-phone">Phone number</label><input id="ct-phone" name="phone" type="tel" autocomplete="tel" class="ct-input" placeholder="0803 000 0000" /></div>
      <div class="ct-fg"><label for="ct-msg">Event details</label><textarea id="ct-msg" name="message" required rows="4" class="ct-input ct-ta" placeholder="e.g. Birthday party for 150 guests, Saturday 10 May in Lekki Lagos. Need jollof rice, fried rice, small chops buffet, and drinks service."></textarea></div>
      <button type="submit" class="ct-submit">Request a Quote</button>
    </form>
    <div id="ctSuccess" class="ct-success" style="display:none" role="status" aria-live="polite"><h3>Quote request received!</h3><p>We will send your catering proposal within 24 hours. Looking forward to serving your event!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('ctForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('ctSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const cateringEventServiceTemplate:WebsiteTemplateContract={
  slug:'catering-event-service',
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
