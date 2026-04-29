/**
 * Hotel / Guesthouse Booking Site — NF-HOS anchor (VN-HOS-001)
 * Pillar 2 — P2-hotel-hospitality-booking · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • Transit hotel, family guesthouse, conference hotel — Lagos, Abuja, Owerri, Port Harcourt
 *   • FTAN (Federal Tourism Authority Nigeria) / State Tourism Board badge
 *   • "Book a Room" WhatsApp CTA — room booking via WhatsApp is standard
 *   • Room types as services with NGN nightly rates
 *   • Null price → "Enquire for rate" (corporate/group rates vary)
 *   • "24-hour reception", "Checkout 12 noon" as trust signals
 *   • "No hidden charges" — common Nigerian hospitality concern
 *   • Breakfast included note, self-contained rooms, generator/24hr power signals
 *   • CCTV / security / wifi availability prominent
 *
 * CSS namespace: .ho-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to book a room. Please share your rates and availability.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.ho-hero{text-align:center;padding:2.75rem 0 2rem}
.ho-logo{height:80px;width:80px;object-fit:cover;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.ho-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.ho-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.ho-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ho-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.ho-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ho-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ho-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.ho-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ho-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ho-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ho-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ho-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.ho-section{margin-top:2.75rem}
.ho-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ho-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.ho-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.ho-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.ho-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.ho-card-rate{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.ho-card-enquiry{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.ho-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.ho-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ho-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ho-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ho-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.ho-info-item{display:flex;flex-direction:column;gap:.25rem}
.ho-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ho-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ho-info-value a{color:var(--ww-primary)}
.ho-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ho-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ho-body{max-width:44rem;margin:0 auto}
.ho-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.ho-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.ho-drow{display:flex;gap:1rem;align-items:flex-start}
.ho-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.ho-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.ho-dvalue a{color:var(--ww-primary);font-weight:600}
.ho-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.ho-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.ho-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ho-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.ho-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.ho-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.ho-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ho-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ho-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ho-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ho-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.ho-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ho-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ho-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ho-layout{grid-template-columns:1fr 1fr}}
.ho-info h2,.ho-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ho-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ho-info a{color:var(--ww-primary);font-weight:600}
.ho-form{display:flex;flex-direction:column;gap:.875rem}
.ho-fg{display:flex;flex-direction:column;gap:.375rem}
.ho-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ho-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ho-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.ho-ta{min-height:100px;resize:vertical}
.ho-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.ho-submit:hover{filter:brightness(1.1)}
.ho-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.ho-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.ho-ctas{flex-direction:column;align-items:stretch}.ho-wa-btn,.ho-sec-btn{width:100%;justify-content:center}}
</style>`;

const waSvg=()=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;
const phoneSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`;

type Offer={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const featured=offers.slice(0,6);const hasMore=offers.length>6;
  const bio=desc?(desc.length>200?desc.slice(0,200).trimEnd()+'…':desc):null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book a room. Please share your room types, rates, and availability.`);
  return `${CSS}
<section class="ho-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ho-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="ho-tagline">${tag?esc(tag):'Comfortable, clean, and affordable rooms in the heart of the city. 24-hour reception, secure parking, and reliable power supply.'}</p>
  <div class="ho-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ho-wa-btn">${waSvg()} Book a Room</a>`:`<a class="ho-wa-btn" href="/contact">${waSvg()} Book a Room</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="ho-sec-btn">${phoneSvg()} Call Reception</a>`:`<a class="ho-sec-btn" href="/contact">View Contact</a>`}
  </div>
  <div class="ho-trust-strip">
    <span class="ho-badge"><span class="ho-dot"></span>FTAN Licensed</span>
    <span class="ho-badge"><span class="ho-dot"></span>24-Hour Reception</span>
    <span class="ho-badge"><span class="ho-dot"></span>No Hidden Charges</span>
  </div>
  <p class="ho-avail">Check-in from 2 PM · Check-out 12 noon · Advance booking recommended</p>
</section>
${featured.length?`<section class="ho-section"><h2 class="ho-section-title">Room Types</h2><div class="ho-grid">${featured.map(o=>`<div class="ho-card"><h3 class="ho-card-name">${esc(o.name)}</h3>${o.description?`<p class="ho-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="ho-card-rate">From ${fmtKobo(o.priceKobo)} / night</p>`:`<p class="ho-card-enquiry">Enquire for rate</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="ho-see-all">View all room types →</a>`:''}</section>`:''}
${bio?`<div class="ho-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place?`<div class="ho-info-strip">${phone?`<div class="ho-info-item"><span class="ho-info-label">Reception</span><span class="ho-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="ho-info-item"><span class="ho-info-label">Location</span><span class="ho-info-value">${esc(place)}</span></div>`:''}<div class="ho-info-item"><span class="ho-info-label">Booking</span><span class="ho-info-value">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer">Book on WhatsApp →</a>`:`<a href="/contact">Reserve now →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const site=(ctx.data.website as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book a room.`);
  return `${CSS}
<section class="ho-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ho-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="ho-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="ho-body">
  <p class="ho-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a FTAN-licensed Nigerian hotel offering clean, comfortable rooms for business and leisure travellers. We provide 24-hour reception, secure parking, reliable power, and a welcoming environment with no hidden charges.`}</p>
  <div class="ho-details">
    ${cat?`<div class="ho-drow"><span class="ho-dlabel">Hotel Type</span><span class="ho-dvalue">${esc(cat)}</span></div>`:''}
    ${place?`<div class="ho-drow"><span class="ho-dlabel">Location</span><span class="ho-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="ho-drow"><span class="ho-dlabel">Reception</span><span class="ho-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${site?`<div class="ho-drow"><span class="ho-dlabel">Portal</span><span class="ho-dvalue"><a href="${safeHref(site)}" target="_blank" rel="noopener noreferrer">${esc(site)} ↗</a></span></div>`:''}
  </div>
  <div class="ho-btn-row">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ho-wa-btn">${waSvg()} Book a Room</a>`:`<a class="ho-wa-btn" href="/contact">${waSvg()} Reserve Now</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="ho-sec-btn">${phoneSvg()} Call Reception</a>`:''}
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about room availability and rates.`);
  const content=offers.length===0
    ?`<div class="ho-empty"><p>Our room types and rates are available on request.<br/>Contact reception to check availability.</p><br/>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ho-wa-btn">${waSvg()} Book on WhatsApp</a>`:`<a class="ho-wa-btn" href="/contact">${waSvg()} Reserve Now</a>`}</div>`
    :`<div class="ho-grid">${offers.map(o=>`<div class="ho-card"><h3 class="ho-card-name">${esc(o.name)}</h3>${o.description?`<p class="ho-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="ho-card-rate">From ${fmtKobo(o.priceKobo)} / night</p>`:`<p class="ho-card-enquiry">Enquire for rate</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="ho-svc-hero"><h1>Room Types & Rates</h1><p class="ho-sub">Available rooms at ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="ho-cta-strip"><h3>Ready to reserve your room?</h3><p>Book on WhatsApp or call reception. Corporate rates available.</p><div class="ho-btn-row" style="justify-content:center">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ho-wa-btn">${waSvg()} Book on WhatsApp</a>`:`<a class="ho-wa-btn" href="/contact">${waSvg()} Reserve Now</a>`}${phone?`<a href="tel:${esc(phone)}" class="ho-sec-btn">${phoneSvg()} Call Reception</a>`:''}</div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book a room. Please share your rates and availability for my dates.`);
  return `${CSS}
<section class="ho-contact-hero"><h1>Book a Room</h1><p>Reserve your room on WhatsApp, call reception, or send a booking enquiry.</p></section>
${wa?`<div class="ho-wa-block"><p>Share your check-in date, check-out date, and number of guests — we'll confirm availability and rate immediately.</p><a href="${wa}" target="_blank" rel="noopener noreferrer" class="ho-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Book on WhatsApp</a></div>`:''}
<div class="ho-layout">
  <div class="ho-info"><h2>Hotel Details</h2>${place?`<p><strong>Location:</strong> ${esc(place)}</p>`:''}${phone?`<p><strong>Reception:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${!phone&&!email&&!place?`<p>Contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Check-in from 2 PM · Checkout 12 noon · No hidden charges.</p></div>
  <div class="ho-form-wrap"><h2>Reservation Enquiry</h2>
    <form class="ho-form" method="POST" action="/contact" id="hoForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ho-fg"><label for="ho-name">Your name</label><input id="ho-name" name="name" type="text" required autocomplete="name" class="ho-input" placeholder="e.g. Emeka Okonkwo" /></div>
      <div class="ho-fg"><label for="ho-phone">Phone number</label><input id="ho-phone" name="phone" type="tel" autocomplete="tel" class="ho-input" placeholder="0803 000 0000" /></div>
      <div class="ho-fg"><label for="ho-msg">Booking details</label><textarea id="ho-msg" name="message" required rows="4" class="ho-input ho-ta" placeholder="e.g. Check-in: 2 May. Check-out: 4 May. 2 adults, 1 child. Room type preference: Standard Self-Contain."></textarea></div>
      <button type="submit" class="ho-submit">Send Reservation Request</button>
    </form>
    <div id="hoSuccess" class="ho-success" style="display:none" role="status" aria-live="polite"><h3>Reservation request received!</h3><p>Our reception team will confirm your booking shortly. We look forward to hosting you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('hoForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('hoSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const hotelHospitalityBookingTemplate:WebsiteTemplateContract={
  slug:'hotel-hospitality-booking',
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
