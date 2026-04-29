/**
 * Event Hall / Venue Booking Site — NF-EVH anchor (VN-EVH-001)
 * Pillar 2 — P2-event-hall-venue-booking · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • FTAN (Federal Tourism Authority Nigeria) / State Tourism Board badge
 *   • "Book this Venue" + "Request a Tour" as dual CTAs
 *   • Room types / capacity tiers as offerings with NGN rates
 *   • "Available for wedding receptions, corporate events, birthdays, naming ceremonies"
 *   • "24-hour generator backup", "AC" as Nigerian venue trust signals
 *   • null → "Rate on request" (large events are negotiated)
 *   • Minimum hours note — common Nigerian event hall practice
 *   • Catering partner note — "We can recommend caterers"
 *   • Parking capacity prominently shown
 *
 * CSS namespace: .eh-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to book your event hall. Please share available dates and rates.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.eh-hero{text-align:center;padding:2.75rem 0 2rem}
.eh-logo{height:80px;width:80px;object-fit:contain;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.eh-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.eh-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.eh-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.eh-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.eh-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.eh-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.eh-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.eh-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.eh-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.eh-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.eh-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.eh-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.eh-section{margin-top:2.75rem}
.eh-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.eh-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.eh-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.eh-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.eh-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.eh-card-rate{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.eh-card-ror{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.eh-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.eh-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.eh-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.eh-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.eh-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.eh-info-item{display:flex;flex-direction:column;gap:.25rem}
.eh-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.eh-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.eh-info-value a{color:var(--ww-primary)}
.eh-about-hero{text-align:center;padding:2.5rem 0 2rem}
.eh-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.eh-body{max-width:44rem;margin:0 auto}
.eh-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.eh-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.eh-drow{display:flex;gap:1rem;align-items:flex-start}
.eh-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.eh-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.eh-dvalue a{color:var(--ww-primary);font-weight:600}
.eh-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.eh-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.eh-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.eh-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.eh-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.eh-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.eh-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.eh-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.eh-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.eh-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.eh-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.eh-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.eh-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.eh-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.eh-layout{grid-template-columns:1fr 1fr}}
.eh-info h2,.eh-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.eh-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.eh-info a{color:var(--ww-primary);font-weight:600}
.eh-form{display:flex;flex-direction:column;gap:.875rem}
.eh-fg{display:flex;flex-direction:column;gap:.375rem}
.eh-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.eh-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.eh-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.eh-ta{min-height:100px;resize:vertical}
.eh-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.eh-submit:hover{filter:brightness(1.1)}
.eh-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.eh-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.eh-ctas{flex-direction:column;align-items:stretch}.eh-wa-btn,.eh-sec-btn{width:100%;justify-content:center}}
</style>`;

const waSvg=()=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;
const hallSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

type Offer={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const cap=(ctx.data.capacity as string|null)??null;
  const featured=offers.slice(0,6);const hasMore=offers.length>6;
  const bio=desc?(desc.length>200?desc.slice(0,200).trimEnd()+'…':desc):null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book your event hall. Please share available dates and rates.`);
  return `${CSS}
<section class="eh-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="eh-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="eh-tagline">${tag?esc(tag):'A premium event venue for weddings, corporate dinners, birthdays, and naming ceremonies. Fully AC, 24-hour generator backup, and ample parking.'}</p>
  <div class="eh-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="eh-wa-btn">${waSvg()} Book this Venue</a>`:`<a class="eh-wa-btn" href="/contact">${waSvg()} Book Now</a>`}
    <a href="/contact" class="eh-sec-btn">${hallSvg()} Request a Tour</a>
  </div>
  <div class="eh-trust-strip">
    <span class="eh-badge"><span class="eh-dot"></span>FTAN Licensed</span>
    <span class="eh-badge"><span class="eh-dot"></span>24-Hr Generator</span>
    <span class="eh-badge"><span class="eh-dot"></span>Fully Air-Conditioned</span>
  </div>
  <p class="eh-avail">${cap?`Capacity: ${esc(cap)} guests · `:''}Weddings · Corporate Events · Birthdays · Naming Ceremonies</p>
</section>
${featured.length?`<section class="eh-section"><h2 class="eh-section-title">Hall Packages</h2><div class="eh-grid">${featured.map(o=>`<div class="eh-card"><h3 class="eh-card-name">${esc(o.name)}</h3>${o.description?`<p class="eh-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="eh-card-rate">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="eh-card-ror">Rate on request</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="eh-see-all">View all packages →</a>`:''}</section>`:''}
${bio?`<div class="eh-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place?`<div class="eh-info-strip">${phone?`<div class="eh-info-item"><span class="eh-info-label">Phone</span><span class="eh-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="eh-info-item"><span class="eh-info-label">Venue Address</span><span class="eh-info-value">${esc(place)}</span></div>`:''}<div class="eh-info-item"><span class="eh-info-label">Book</span><span class="eh-info-value">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Reserve now →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const cap=(ctx.data.capacity as string|null)??null;
  const site=(ctx.data.website as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book your event hall.`);
  return `${CSS}
<section class="eh-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="eh-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="eh-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="eh-body">
  <p class="eh-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a FTAN-licensed Nigerian event hall offering a premium, fully air-conditioned venue with 24-hour generator backup for weddings, corporate events, birthdays, naming ceremonies, and conferences.`}</p>
  <div class="eh-details">
    ${cat?`<div class="eh-drow"><span class="eh-dlabel">Venue Type</span><span class="eh-dvalue">${esc(cat)}</span></div>`:''}
    ${cap?`<div class="eh-drow"><span class="eh-dlabel">Capacity</span><span class="eh-dvalue">${esc(cap)} guests</span></div>`:''}
    ${place?`<div class="eh-drow"><span class="eh-dlabel">Address</span><span class="eh-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="eh-drow"><span class="eh-dlabel">Phone</span><span class="eh-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${site?`<div class="eh-drow"><span class="eh-dlabel">Website</span><span class="eh-dvalue"><a href="${safeHref(site)}" target="_blank" rel="noopener noreferrer">${esc(site)} ↗</a></span></div>`:''}
  </div>
  <div class="eh-btn-row">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="eh-wa-btn">${waSvg()} Book this Venue</a>`:`<a class="eh-wa-btn" href="/contact">${waSvg()} Book Now</a>`}
    <a href="/services" class="eh-sec-btn">${hallSvg()} View Packages</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about booking your event hall.`);
  const content=offers.length===0
    ?`<div class="eh-empty"><p>Our hall packages and rates are available on request.<br/>Contact us to check availability and arrange a viewing.</p><br/>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="eh-wa-btn">${waSvg()} Book on WhatsApp</a>`:`<a class="eh-wa-btn" href="/contact">${waSvg()} Book Now</a>`}</div>`
    :`<div class="eh-grid">${offers.map(o=>`<div class="eh-card"><h3 class="eh-card-name">${esc(o.name)}</h3>${o.description?`<p class="eh-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="eh-card-rate">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="eh-card-ror">Rate on request</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="eh-svc-hero"><h1>Hall Packages & Rates</h1><p class="eh-sub">Event space options at ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="eh-cta-strip"><h3>Ready to book?</h3><p>WhatsApp us your event date and guest count — we will confirm availability and send a detailed proposal.</p><div class="eh-btn-row" style="justify-content:center">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="eh-wa-btn">${waSvg()} Book on WhatsApp</a>`:`<a class="eh-wa-btn" href="/contact">${waSvg()} Book Now</a>`}<a href="/contact" class="eh-sec-btn">Request a Tour</a></div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const cap=(ctx.data.capacity as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book your event hall. Please share your available dates and rates.`);
  return `${CSS}
<section class="eh-contact-hero"><h1>Book the Venue</h1><p>Share your event details to check availability and receive a tailored quote.</p></section>
${wa?`<div class="eh-wa-block"><p>Tell us your event type, date, and guest count — we will confirm availability immediately.</p><a href="${wa}" target="_blank" rel="noopener noreferrer" class="eh-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Book on WhatsApp</a></div>`:''}
<div class="eh-layout">
  <div class="eh-info"><h2>Venue Details</h2>${place?`<p><strong>Address:</strong> ${esc(place)}</p>`:''}${cap?`<p><strong>Capacity:</strong> ${esc(cap)} guests</p>`:''}${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${!phone&&!email&&!place?`<p>Contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Minimum 4-hour booking. FTAN licensed. 24-hr generator. Fully AC. Ample parking. Catering partners available.</p></div>
  <div class="eh-form-wrap"><h2>Venue Booking Enquiry</h2>
    <form class="eh-form" method="POST" action="/contact" id="ehForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="eh-fg"><label for="eh-name">Your name</label><input id="eh-name" name="name" type="text" required autocomplete="name" class="eh-input" placeholder="e.g. Funmi Adeola" /></div>
      <div class="eh-fg"><label for="eh-phone">Phone number</label><input id="eh-phone" name="phone" type="tel" autocomplete="tel" class="eh-input" placeholder="0803 000 0000" /></div>
      <div class="eh-fg"><label for="eh-msg">Event details</label><textarea id="eh-msg" name="message" required rows="4" class="eh-input eh-ta" placeholder="e.g. Wedding reception for 300 guests, Saturday 14 June. Venue needed 8 AM to midnight. Please share rates and available dates."></textarea></div>
      <button type="submit" class="eh-submit">Send Booking Enquiry</button>
    </form>
    <div id="ehSuccess" class="eh-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will confirm availability and send your venue proposal shortly. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('ehForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('ehSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const eventHallVenueBookingTemplate:WebsiteTemplateContract={
  slug:'event-hall-venue-booking',
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
