/**
 * Travel Agent / Tour Operator Site — NF-SVC standalone (VN-SVC-003)
 * Pillar 2 — P2-travel-agent-tour-operator · Milestone M10 · HIGH
 * Research brief: docs/templates/research/travel-agent-tour-operator-brief.md
 *
 * Nigeria-First:
 *   • NANTA (Nigeria Association of Travel Agents) number — primary trust signal
 *   • IATA accreditation badge for airlines ticket issuance
 *   • Hajj/Umrah packages — Nigeria sends 90,000+ pilgrims annually (2nd globally)
 *   • Package types: hajj | umrah | holiday | domestic | corporate
 *   • Domestic tours: Obudu Cattle Ranch, Yankari Game Reserve, Olumo Rock
 *   • International: Dubai, Turkey, UK, US, Schengen — visa assistance a major revenue
 *   • Price per pax in kobo (₦3.5m–₦5.5m Hajj; ₦750k–₦1.5m Dubai/Turkey)
 *   • "Book via WhatsApp" is primary booking channel — WhatsApp is non-negotiable CTA
 *   • Respectful Islamic terminology for Hajj/Umrah packages
 *   • P13: No passport or visa personal details in template context
 *
 * CSS namespace: .ta-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract, WebsitePageType } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to inquire about a travel package. Please share your rates and available dates.')}`}

const CSS=`<style>
.ta-hero{text-align:center;padding:2.75rem 0 2rem}
.ta-logo{height:80px;width:80px;object-fit:cover;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.ta-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.ta-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.ta-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ta-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.ta-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ta-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ta-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.ta-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ta-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ta-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ta-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ta-section{margin-top:2.75rem}
.ta-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ta-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
.ta-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.ta-card-type{font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ww-primary);margin:0}
.ta-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.ta-card-dest{font-size:.8125rem;color:var(--ww-text-muted);margin:0}
.ta-card-dur{font-size:.8125rem;color:var(--ww-text-muted);margin:0}
.ta-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:.25rem 0 0}
.ta-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.5rem 0 0}
.ta-card-enquiry{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.5rem 0 0}
.ta-card-book{display:inline-flex;align-items:center;gap:.375rem;margin-top:.75rem;padding:.625rem 1rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.875rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ta-card-book:hover{filter:brightness(1.08);text-decoration:none}
.ta-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.ta-nanta-box{margin-top:2rem;padding:1.25rem 1.5rem;background:var(--ww-bg-surface);border:2px solid var(--ww-primary);border-radius:var(--ww-radius);display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
.ta-nanta-box span{font-size:.8125rem;font-weight:700;color:var(--ww-primary);text-transform:uppercase;letter-spacing:.06em}
.ta-nanta-box strong{font-size:1rem;color:var(--ww-text)}
.ta-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ta-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ta-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ta-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.ta-info-item{display:flex;flex-direction:column;gap:.25rem}
.ta-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ta-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ta-info-value a{color:var(--ww-primary)}
.ta-services-list{margin-top:.5rem;display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.ta-svc-item{padding:1rem 1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;color:var(--ww-text)}
@media(max-width:480px){.ta-grid{grid-template-columns:1fr}.ta-services-list{grid-template-columns:1fr}}
</style>`;

function planeSvg(){return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2l-1.7 2 5.9 3.6L3 15l-2 1 3 3 1-2 4.2-3 3.5 5.9Z"/></svg>`}
function waSvg(){return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.486 2 2 6.486 2 12c0 1.759.47 3.411 1.291 4.845L2 22l5.293-1.268A9.945 9.945 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2z"/></svg>`}

function pkgTypeBadge(type:string|null):string{
  const map:Record<string,string>={hajj:'Hajj ✦',umrah:'Umrah ✦',holiday:'Holiday',domestic:'Domestic',corporate:'Corporate'};
  return map[type??'']??type??'Package';
}

function renderHome(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const desc=(ctx.data.description as string|null)??null;
  const logo=(ctx.data.logoUrl as string|null)??null;
  const nanta=(ctx.data.nantaNumber as string|null)??null;
  const iata=(ctx.data.iataCode as string|null)??null;
  const wa=waLink(phone);
  const waBook=waLink(phone,'Hello, I am interested in one of your travel packages. Please share details and availability.');
  const bio=desc&&desc.length>20?desc:null;
  const offerings=(ctx.data.offerings as Array<{name:string;description:string|null;priceKobo:number|null;type?:string|null;destination?:string|null;durationDays?:number|null}>|null)??[];
  const featured=offerings.slice(0,6);
  const hasMore=offerings.length>6;
  try{return `${CSS}
<section class="ta-hero">
  ${logo?`<img src="${esc(logo)}" alt="${esc(ctx.displayName)} logo" class="ta-logo" loading="lazy">`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="ta-tagline">${bio?esc(bio):'Your Trusted NANTA-Registered Travel Partner — Hajj &amp; Umrah, Holiday Packages, Visa Assistance &amp; Domestic Tours'}</p>
  <div class="ta-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ta-wa-btn">${waSvg()} Book via WhatsApp</a>`:''}
    <a href="/services" class="ta-sec-btn">${planeSvg()} View All Packages</a>
  </div>
  <div class="ta-trust-strip">
    ${nanta?`<span class="ta-badge"><span class="ta-dot"></span>NANTA No. ${esc(nanta)}</span>`:'<span class="ta-badge"><span class="ta-dot"></span>NANTA Registered</span>'}
    ${iata?`<span class="ta-badge"><span class="ta-dot"></span>IATA ${esc(iata)}</span>`:''}
    <span class="ta-badge"><span class="ta-dot"></span>Hajj &amp; Umrah</span>
    <span class="ta-badge"><span class="ta-dot"></span>Visa Assistance</span>
  </div>
  ${place?`<p class="ta-avail">Serving clients from ${esc(place)} and across Nigeria</p>`:''}
</section>
${featured.length?`<section class="ta-section"><h2 class="ta-section-title">Featured Packages</h2><div class="ta-grid">${featured.map(o=>{const bk=waBook??`/contact`;const bkEl=waBook?`<a href="${waBook}" target="_blank" rel="noopener noreferrer" class="ta-card-book">${waSvg()} Book via WhatsApp</a>`:`<a href="/contact" class="ta-card-book">Enquire</a>`;return `<div class="ta-card"><p class="ta-card-type">${esc(pkgTypeBadge((o as {type?:string|null}).type??null))}</p><h3 class="ta-card-name">${esc(o.name)}</h3>${(o as {destination?:string|null}).destination?`<p class="ta-card-dest">📍 ${esc((o as {destination?:string|null}).destination!)}</p>`:''} ${(o as {durationDays?:number|null}).durationDays?`<p class="ta-card-dur">⏱ ${(o as {durationDays?:number|null}).durationDays} days</p>`:''} ${o.description?`<p class="ta-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null&&o.priceKobo!==undefined?`<p class="ta-card-price">From ${fmtKobo(o.priceKobo)} per person</p>`:`<p class="ta-card-enquiry">Call/WhatsApp for package price</p>`}${bkEl}</div>`}).join('')}</div>${hasMore?`<a href="/services" class="ta-see-all">View all packages →</a>`:''}</section>`:''}
<section class="ta-section"><h2 class="ta-section-title">Our Services</h2><div class="ta-services-list"><div class="ta-svc-item">✦ Hajj Packages</div><div class="ta-svc-item">✦ Umrah Packages</div><div class="ta-svc-item">✦ Holiday Packages</div><div class="ta-svc-item">✦ Visa Assistance</div><div class="ta-svc-item">✦ Domestic Tours</div><div class="ta-svc-item">✦ Corporate Travel</div></div></section>
${nanta?`<div class="ta-nanta-box"><span>NANTA Registration</span><strong>No. ${esc(nanta)}</strong>${iata?`<span>IATA</span><strong>${esc(iata)}</strong>`:''}</div>`:''}
${bio?`<div class="ta-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place?`<div class="ta-info-strip">${phone?`<div class="ta-info-item"><span class="ta-info-label">Phone / WhatsApp</span><span class="ta-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="ta-info-item"><span class="ta-info-label">Office</span><span class="ta-info-value">${esc(place)}</span></div>`:''}<div class="ta-info-item"><span class="ta-info-label">Booking</span><span class="ta-info-value">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div></div>`:''}`;
  }catch{return `<p style="text-align:center;padding:4rem">Travel packages loading… please try again.</p>`;}
}

function renderServices(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const waBook=waLink(phone,'Hello, I am interested in one of your travel packages. Please share full details and availability.');
  const offerings=(ctx.data.offerings as Array<{name:string;description:string|null;priceKobo:number|null;type?:string|null;destination?:string|null;durationDays?:number|null}>|null)??[];
  try{return `${CSS}<div style="padding:2rem 0"><h1 style="font-size:1.875rem;font-weight:900;margin-bottom:1.5rem;color:var(--ww-primary)">Our Travel Packages</h1>${offerings.length?`<div class="ta-grid">${offerings.map(o=>`<div class="ta-card"><p class="ta-card-type">${esc(pkgTypeBadge((o as {type?:string|null}).type??null))}</p><h3 class="ta-card-name">${esc(o.name)}</h3>${(o as {destination?:string|null}).destination?`<p class="ta-card-dest">📍 ${esc((o as {destination?:string|null}).destination!)}</p>`:''} ${(o as {durationDays?:number|null}).durationDays?`<p class="ta-card-dur">⏱ ${(o as {durationDays?:number|null}).durationDays} days</p>`:''} ${o.description?`<p class="ta-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null&&o.priceKobo!==undefined?`<p class="ta-card-price">From ${fmtKobo(o.priceKobo)} per person</p>`:`<p class="ta-card-enquiry">WhatsApp for package price</p>`}${waBook?`<a href="${waBook}" target="_blank" rel="noopener noreferrer" class="ta-card-book">${waSvg()} Book via WhatsApp</a>`:`<a href="/contact" class="ta-card-book">Enquire Now</a>`}</div>`).join('')}</div>`:`<p style="color:var(--ww-text-muted)">Packages coming soon — please WhatsApp us for current offers.</p>`}</div>`;}catch{return `<p style="padding:4rem">Packages loading…</p>`;}
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const nanta=(ctx.data.nantaNumber as string|null)??null;
  const iata=(ctx.data.iataCode as string|null)??null;
  const cac=(ctx.data.cacRc as string|null)??null;
  const wa=waLink(phone);
  return `${CSS}<div style="padding:2rem 0"><h1 style="font-size:1.875rem;font-weight:900;margin-bottom:1rem;color:var(--ww-primary)">About ${esc(ctx.displayName)}</h1>${desc?`<p style="color:var(--ww-text-muted);line-height:1.8;margin-bottom:1.5rem;font-size:.9375rem">${esc(desc)}</p>`:''}<div class="ta-trust-strip" style="justify-content:flex-start;margin-bottom:1.5rem">${nanta?`<span class="ta-badge"><span class="ta-dot"></span>NANTA No. ${esc(nanta)}</span>`:'<span class="ta-badge"><span class="ta-dot"></span>NANTA Registered</span>'}${iata?`<span class="ta-badge"><span class="ta-dot"></span>IATA ${esc(iata)}</span>`:''}<span class="ta-badge"><span class="ta-dot"></span>Hajj &amp; Umrah Specialists</span><span class="ta-badge"><span class="ta-dot"></span>Visa Assistance</span></div>${nanta||iata||cac?`<div class="ta-info-strip" style="margin-top:1rem;margin-bottom:1.5rem">${nanta?`<div class="ta-info-item"><span class="ta-info-label">NANTA No.</span><span class="ta-info-value">${esc(nanta)}</span></div>`:''} ${iata?`<div class="ta-info-item"><span class="ta-info-label">IATA Code</span><span class="ta-info-value">${esc(iata)}</span></div>`:''} ${cac?`<div class="ta-info-item"><span class="ta-info-label">CAC RC No.</span><span class="ta-info-value">${esc(cac)}</span></div>`:''}</div>`:''} ${place?`<p style="font-size:.9375rem;color:var(--ww-text-muted)"><strong>Office:</strong> ${esc(place)}</p>`:''} ${phone?`<p style="font-size:.9375rem;margin-top:.5rem;color:var(--ww-text-muted)"><strong>Phone:</strong> <a href="tel:${esc(phone)}" style="color:var(--ww-primary)">${esc(phone)}</a></p>`:''} ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ta-wa-btn" style="margin-top:1.25rem">${waSvg()} WhatsApp Us</a>`:''}</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const wa=waLink(phone,'Hello, I would like to inquire about a travel package. Please share your current offers and availability.');
  return `${CSS}<div style="padding:2rem 0"><h1 style="font-size:1.875rem;font-weight:900;margin-bottom:1.5rem;color:var(--ww-primary)">Contact Us</h1><p style="color:var(--ww-text-muted);margin-bottom:1.5rem;font-size:.9375rem">We respond to all WhatsApp enquiries within 1 hour during business hours (Mon–Sat, 8am–6pm).</p><div class="ta-info-strip" style="flex-direction:column">${phone?`<div class="ta-info-item"><span class="ta-info-label">Phone / WhatsApp</span><span class="ta-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="ta-info-item"><span class="ta-info-label">Office Address</span><span class="ta-info-value">${esc(place)}</span></div>`:''} ${website?`<div class="ta-info-item"><span class="ta-info-label">Website</span><span class="ta-info-value"><a href="${esc(website)}" target="_blank" rel="noopener noreferrer">${esc(website)}</a></span></div>`:''}</div>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ta-wa-btn" style="margin-top:1.5rem">${waSvg()} WhatsApp for a Package Quote</a>`:''}</div>`;
}

export const travelAgentTourOperatorTemplate: WebsiteTemplateContract = {
  slug: 'travel-agent-tour-operator',
  version: '1.0.0',
  pages: ['home','about','services','contact'] as WebsitePageType[],
  renderPage(ctx:WebsiteRenderContext):string{
    switch(ctx.pageType){
      case 'about':   return renderAbout(ctx);
      case 'services':return renderServices(ctx);
      case 'contact': return renderContact(ctx);
      default:        return renderHome(ctx);
    }
  }
};
