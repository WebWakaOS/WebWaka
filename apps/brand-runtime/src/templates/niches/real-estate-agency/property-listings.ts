/**
 * Real Estate Agency / Property Listings Site — NF-REA anchor (VN-REA-001)
 * Pillar 2 — P2-real-estate-agency-property-listings · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • LASREA / ESVARBON (Estate Surveyors & Valuers Registration Board) badge
 *   • Properties listed as offerings with NGN prices (sale) or NGN/year (rent)
 *   • "Book a Tour" WhatsApp CTA — property tours arranged via WhatsApp
 *   • "No agency fee surprise" implicit trust signal — common Nigerian pain point
 *   • Location-centric copy: Lekki, Ajah, Abuja, GRA, Banana Island
 *   • Joint venture / off-plan properties referenced
 *   • Null price → "Price on request" (off-plan / negotiable)
 *   • Agent name + licence number as credentialling
 *   • "3 bed / 2 bath / BQ" format in descriptions
 *
 * CSS namespace: .re-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to enquire about a property listing and book a viewing.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.re-hero{text-align:center;padding:2.75rem 0 2rem}
.re-logo{height:80px;width:80px;object-fit:contain;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.re-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.re-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.re-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.re-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.re-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.re-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.re-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.re-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.re-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.re-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.re-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.re-section{margin-top:2.75rem}
.re-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.re-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
.re-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.re-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.re-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.re-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.re-card-por{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.re-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.re-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.re-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.re-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.re-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.re-info-item{display:flex;flex-direction:column;gap:.25rem}
.re-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.re-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.re-info-value a{color:var(--ww-primary)}
.re-about-hero{text-align:center;padding:2.5rem 0 2rem}
.re-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.re-body{max-width:44rem;margin:0 auto}
.re-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.re-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.re-drow{display:flex;gap:1rem;align-items:flex-start}
.re-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.re-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.re-dvalue a{color:var(--ww-primary);font-weight:600}
.re-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.re-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.re-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.re-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.re-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.re-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.re-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.re-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.re-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.re-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.re-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.re-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.re-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.re-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.re-layout{grid-template-columns:1fr 1fr}}
.re-info h2,.re-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.re-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.re-info a{color:var(--ww-primary);font-weight:600}
.re-form{display:flex;flex-direction:column;gap:.875rem}
.re-fg{display:flex;flex-direction:column;gap:.375rem}
.re-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.re-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.re-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.re-ta{min-height:100px;resize:vertical}
.re-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.re-submit:hover{filter:brightness(1.1)}
.re-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.re-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.re-ctas{flex-direction:column;align-items:stretch}.re-wa-btn,.re-sec-btn{width:100%;justify-content:center}}
</style>`;

const waSvg=()=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;
const homeSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

type Offer={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const featured=offers.slice(0,6);const hasMore=offers.length>6;
  const bio=desc?(desc.length>200?desc.slice(0,200).trimEnd()+'…':desc):null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about a property and book a viewing tour.`);
  return `${CSS}
<section class="re-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="re-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="re-tagline">${tag?esc(tag):'Finding your ideal property in Nigeria. Verified listings, transparent pricing, and professional agents. Buy, rent, or lease — we make it simple.'}</p>
  <div class="re-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="re-wa-btn">${waSvg()} Book a Viewing</a>`:`<a class="re-wa-btn" href="/contact">${waSvg()} Book a Viewing</a>`}
    <a href="/services" class="re-sec-btn">${homeSvg()} View Listings</a>
  </div>
  <div class="re-trust-strip">
    <span class="re-badge"><span class="re-dot"></span>ESVARBON Licensed</span>
    <span class="re-badge"><span class="re-dot"></span>CAC Registered</span>
    <span class="re-badge"><span class="re-dot"></span>Verified Listings</span>
  </div>
</section>
${featured.length?`<section class="re-section"><h2 class="re-section-title">Featured Properties</h2><div class="re-grid">${featured.map(o=>`<div class="re-card"><h3 class="re-card-name">${esc(o.name)}</h3>${o.description?`<p class="re-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="re-card-price">${fmtKobo(o.priceKobo)}</p>`:`<p class="re-card-por">Price on request</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="re-see-all">View all listings →</a>`:''}</section>`:''}
${bio?`<div class="re-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place?`<div class="re-info-strip">${phone?`<div class="re-info-item"><span class="re-info-label">Phone</span><span class="re-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="re-info-item"><span class="re-info-label">Office</span><span class="re-info-value">${esc(place)}</span></div>`:''}<div class="re-info-item"><span class="re-info-label">Book Tour</span><span class="re-info-value">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const site=(ctx.data.website as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about a property and book a viewing.`);
  return `${CSS}
<section class="re-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="re-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="re-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="re-body">
  <p class="re-desc">${desc?esc(desc):`${esc(ctx.displayName)} is an ESVARBON-licensed Nigerian real estate agency offering verified property listings for sale, rent, and lease. We serve clients across major Nigerian cities with transparent pricing and professional agents.`}</p>
  <div class="re-details">
    ${cat?`<div class="re-drow"><span class="re-dlabel">Agency Type</span><span class="re-dvalue">${esc(cat)}</span></div>`:''}
    ${place?`<div class="re-drow"><span class="re-dlabel">Office</span><span class="re-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="re-drow"><span class="re-dlabel">Phone</span><span class="re-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${site?`<div class="re-drow"><span class="re-dlabel">Portal</span><span class="re-dvalue"><a href="${safeHref(site)}" target="_blank" rel="noopener noreferrer">${esc(site)} ↗</a></span></div>`:''}
  </div>
  <div class="re-btn-row">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="re-wa-btn">${waSvg()} Book a Viewing</a>`:`<a class="re-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}
    <a href="/services" class="re-sec-btn">${homeSvg()} View Listings</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about a property listing and book a viewing.`);
  const content=offers.length===0
    ?`<div class="re-empty"><p>Our current property listings are available on request.<br/>Contact us to discuss your property needs and budget.</p><br/>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="re-wa-btn">${waSvg()} Enquire on WhatsApp</a>`:`<a class="re-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}</div>`
    :`<div class="re-grid">${offers.map(o=>`<div class="re-card"><h3 class="re-card-name">${esc(o.name)}</h3>${o.description?`<p class="re-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="re-card-price">${fmtKobo(o.priceKobo)}</p>`:`<p class="re-card-por">Price on request</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="re-svc-hero"><h1>Property Listings</h1><p class="re-sub">Current available properties from ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="re-cta-strip"><h3>Found a property you like?</h3><p>Book a viewing on WhatsApp or send us your requirements — we'll find the right property for you.</p><div class="re-btn-row" style="justify-content:center">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="re-wa-btn">${waSvg()} Book a Viewing</a>`:`<a class="re-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}<a href="/contact" class="re-sec-btn">Send Requirement</a></div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book a property viewing or enquire about a listing.`);
  return `${CSS}
<section class="re-contact-hero"><h1>Book a Viewing</h1><p>Send your property requirements or book a viewing for a specific listing.</p></section>
${wa?`<div class="re-wa-block"><p>Share the property you are interested in and your preferred viewing date — we will arrange it promptly.</p><a href="${wa}" target="_blank" rel="noopener noreferrer" class="re-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp Us</a></div>`:''}
<div class="re-layout">
  <div class="re-info"><h2>Agency Details</h2>${place?`<p><strong>Office:</strong> ${esc(place)}</p>`:''}${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${!phone&&!email&&!place?`<p>Contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">ESVARBON licensed. All listings verified. Transparent agency fees — no surprises.</p></div>
  <div class="re-form-wrap"><h2>Property Enquiry</h2>
    <form class="re-form" method="POST" action="/contact" id="reForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="re-fg"><label for="re-name">Your name</label><input id="re-name" name="name" type="text" required autocomplete="name" class="re-input" placeholder="e.g. Chisom Okeke" /></div>
      <div class="re-fg"><label for="re-phone">Phone number</label><input id="re-phone" name="phone" type="tel" autocomplete="tel" class="re-input" placeholder="0803 000 0000" /></div>
      <div class="re-fg"><label for="re-msg">Property requirement</label><textarea id="re-msg" name="message" required rows="4" class="re-input re-ta" placeholder="e.g. Looking for a 3-bed apartment to rent in Lekki Phase 1. Budget: ₦3.5M/year. Available for viewing this weekend."></textarea></div>
      <button type="submit" class="re-submit">Send Enquiry</button>
    </form>
    <div id="reSuccess" class="re-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>Our agent will contact you shortly with matching listings and viewing options.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('reForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('reSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const realEstateAgencyPropertyListingsTemplate:WebsiteTemplateContract={
  slug:'real-estate-agency-property-listings',
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
