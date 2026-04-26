/**
 * Photography / Visual Portfolio Site — NF-PHO anchor (VN-PHO-001)
 * Pillar 2 — P2-photography-visual-portfolio · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • "Book a Session" WhatsApp CTA — Nigerian photographers book via WhatsApp
 *   • Session packages as offerings with NGN prices; null → "Quote on request"
 *   • Portfolio/Instagram link prominent — visual credentialing
 *   • "Professional Equipment" / "Licensed Creative" trust signal
 *   • Nigerian photography context: wedding, event, portrait, product, fashion,
 *     real estate, graduation, passport, corporate headshots
 *   • "We travel to you" note for event photography
 *   • CAC registered badge for commercial photography studios
 *   • Turnaround note: "Photos ready in 48 hours"
 *   • Retouching included as standard
 *
 * CSS namespace: .pv-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to book a photography session. Please share your packages and availability.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.pv-hero{text-align:center;padding:2.75rem 0 2rem}
.pv-logo{height:90px;width:90px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-primary)}
.pv-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.pv-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.pv-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pv-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.pv-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.pv-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.pv-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.pv-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.pv-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.pv-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.pv-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.pv-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.pv-section{margin-top:2.75rem}
.pv-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.pv-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.pv-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.pv-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.pv-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.pv-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.pv-card-qor{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.pv-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.pv-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pv-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.pv-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.pv-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.pv-info-item{display:flex;flex-direction:column;gap:.25rem}
.pv-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pv-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.pv-info-value a{color:var(--ww-primary)}
.pv-about-hero{text-align:center;padding:2.5rem 0 2rem}
.pv-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pv-body{max-width:44rem;margin:0 auto}
.pv-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.pv-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.pv-drow{display:flex;gap:1rem;align-items:flex-start}
.pv-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.pv-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.pv-dvalue a{color:var(--ww-primary);font-weight:600}
.pv-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pv-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.pv-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pv-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.pv-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.pv-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.pv-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.pv-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.pv-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.pv-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pv-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.pv-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.pv-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.pv-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.pv-layout{grid-template-columns:1fr 1fr}}
.pv-info h2,.pv-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.pv-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.pv-info a{color:var(--ww-primary);font-weight:600}
.pv-form{display:flex;flex-direction:column;gap:.875rem}
.pv-fg{display:flex;flex-direction:column;gap:.375rem}
.pv-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.pv-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.pv-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.pv-ta{min-height:100px;resize:vertical}
.pv-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.pv-submit:hover{filter:brightness(1.1)}
.pv-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.pv-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.pv-ctas{flex-direction:column;align-items:stretch}.pv-wa-btn,.pv-sec-btn{width:100%;justify-content:center}}
</style>`;

const waSvg=()=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;
const camSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`;

type Offer={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const insta=(ctx.data.instagramHandle as string|null)??null;
  const portfolio=(ctx.data.portfolioUrl as string|null)??null;
  const featured=offers.slice(0,6);const hasMore=offers.length>6;
  const bio=desc?(desc.length>200?desc.slice(0,200).trimEnd()+'…':desc):null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book a photography session. Please share your packages and availability.`);
  return `${CSS}
<section class="pv-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pv-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="pv-tagline">${tag?esc(tag):'Professional photography for weddings, events, portraits, products, and corporate sessions. Photos delivered in 48 hours with retouching included.'}</p>
  <div class="pv-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="pv-wa-btn">${waSvg()} Book a Session</a>`:`<a class="pv-wa-btn" href="/contact">${waSvg()} Book Now</a>`}
    ${portfolio?`<a href="${safeHref(portfolio)}" target="_blank" rel="noopener noreferrer" class="pv-sec-btn">${camSvg()} View Portfolio</a>`:insta?`<a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer" class="pv-sec-btn">${camSvg()} Instagram Portfolio</a>`:`<a href="/services" class="pv-sec-btn">${camSvg()} Our Packages</a>`}
  </div>
  <div class="pv-trust-strip">
    <span class="pv-badge"><span class="pv-dot"></span>Professional Equipment</span>
    <span class="pv-badge"><span class="pv-dot"></span>CAC Registered</span>
    <span class="pv-badge"><span class="pv-dot"></span>Photos in 48 Hours</span>
  </div>
  <p class="pv-avail">We travel to you for events · Retouching included · ${insta?`@${esc(insta.replace('@',''))} on Instagram`:''}</p>
</section>
${featured.length?`<section class="pv-section"><h2 class="pv-section-title">Session Packages</h2><div class="pv-grid">${featured.map(o=>`<div class="pv-card"><h3 class="pv-card-name">${esc(o.name)}</h3>${o.description?`<p class="pv-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="pv-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="pv-card-qor">Quote on request</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="pv-see-all">View all packages →</a>`:''}</section>`:''}
${bio?`<div class="pv-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place||insta?`<div class="pv-info-strip">${phone?`<div class="pv-info-item"><span class="pv-info-label">Phone</span><span class="pv-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="pv-info-item"><span class="pv-info-label">Studio</span><span class="pv-info-value">${esc(place)}</span></div>`:''} ${insta?`<div class="pv-info-item"><span class="pv-info-label">Instagram</span><span class="pv-info-value"><a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a></span></div>`:''}</div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const insta=(ctx.data.instagramHandle as string|null)??null;
  const portfolio=(ctx.data.portfolioUrl as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book a photography session.`);
  return `${CSS}
<section class="pv-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pv-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="pv-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="pv-body">
  <p class="pv-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a CAC-registered Nigerian photography studio offering professional photography for weddings, events, portraits, products, real estate, and corporate needs. All sessions include retouching and photos are delivered digitally within 48 hours.`}</p>
  <div class="pv-details">
    ${cat?`<div class="pv-drow"><span class="pv-dlabel">Speciality</span><span class="pv-dvalue">${esc(cat)}</span></div>`:''}
    ${place?`<div class="pv-drow"><span class="pv-dlabel">Studio</span><span class="pv-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="pv-drow"><span class="pv-dlabel">Phone</span><span class="pv-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${insta?`<div class="pv-drow"><span class="pv-dlabel">Instagram</span><span class="pv-dvalue"><a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a></span></div>`:''}
    ${portfolio?`<div class="pv-drow"><span class="pv-dlabel">Portfolio</span><span class="pv-dvalue"><a href="${safeHref(portfolio)}" target="_blank" rel="noopener noreferrer">View Portfolio ↗</a></span></div>`:''}
  </div>
  <div class="pv-btn-row">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="pv-wa-btn">${waSvg()} Book a Session</a>`:`<a class="pv-wa-btn" href="/contact">${waSvg()} Book Now</a>`}
    <a href="/services" class="pv-sec-btn">${camSvg()} View Packages</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book a photography session. Please share packages and availability.`);
  const content=offers.length===0
    ?`<div class="pv-empty"><p>Our photography packages are available on request.<br/>Contact us to discuss your shoot and get a tailored quote.</p><br/>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="pv-wa-btn">${waSvg()} Book on WhatsApp</a>`:`<a class="pv-wa-btn" href="/contact">${waSvg()} Book Now</a>`}</div>`
    :`<div class="pv-grid">${offers.map(o=>`<div class="pv-card"><h3 class="pv-card-name">${esc(o.name)}</h3>${o.description?`<p class="pv-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="pv-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="pv-card-qor">Quote on request</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="pv-svc-hero"><h1>Photography Packages</h1><p class="pv-sub">Session options from ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="pv-cta-strip"><h3>Ready to book?</h3><p>Tell us your shoot type, date, and location — we will confirm availability and send you a package.</p><div class="pv-btn-row" style="justify-content:center">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="pv-wa-btn">${waSvg()} Book on WhatsApp</a>`:`<a class="pv-wa-btn" href="/contact">${waSvg()} Book Now</a>`}<a href="/contact" class="pv-sec-btn">Send Details</a></div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const insta=(ctx.data.instagramHandle as string|null)??null;
  const portfolio=(ctx.data.portfolioUrl as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book a photography session. Please share your packages and available dates.`);
  return `${CSS}
<section class="pv-contact-hero"><h1>Book a Session</h1><p>Share your shoot details and we will send you a package proposal within 24 hours.</p></section>
${wa?`<div class="pv-wa-block"><p>Tell us the type of shoot, your date, and location — we will confirm availability and send options.</p><a href="${wa}" target="_blank" rel="noopener noreferrer" class="pv-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Book on WhatsApp</a></div>`:''}
<div class="pv-layout">
  <div class="pv-info"><h2>Studio Details</h2>${place?`<p><strong>Studio:</strong> ${esc(place)}</p>`:''}${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${insta?`<p><strong>Instagram:</strong> <a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a></p>`:''}${portfolio?`<p><strong>Portfolio:</strong> <a href="${safeHref(portfolio)}" target="_blank" rel="noopener noreferrer">View here ↗</a></p>`:''} ${!phone&&!email&&!place&&!insta&&!portfolio?`<p>Contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Photos delivered in 48 hours. Retouching included. We travel to your location for events.</p></div>
  <div class="pv-form-wrap"><h2>Session Booking</h2>
    <form class="pv-form" method="POST" action="/contact" id="pvForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pv-fg"><label for="pv-name">Your name</label><input id="pv-name" name="name" type="text" required autocomplete="name" class="pv-input" placeholder="e.g. Ola Martins" /></div>
      <div class="pv-fg"><label for="pv-phone">Phone number</label><input id="pv-phone" name="phone" type="tel" autocomplete="tel" class="pv-input" placeholder="0803 000 0000" /></div>
      <div class="pv-fg"><label for="pv-msg">Shoot details</label><textarea id="pv-msg" name="message" required rows="4" class="pv-input pv-ta" placeholder="e.g. Wedding photography for 150 guests, Saturday 7 June in Ikeja. Also need 2-hour video. Please share your rates."></textarea></div>
      <button type="submit" class="pv-submit">Send Booking Request</button>
    </form>
    <div id="pvSuccess" class="pv-success" style="display:none" role="status" aria-live="polite"><h3>Booking request received!</h3><p>We will get back to you with packages and availability. Looking forward to capturing your moments!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('pvForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('pvSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const photographyVisualPortfolioTemplate:WebsiteTemplateContract={
  slug:'photography-visual-portfolio',
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
