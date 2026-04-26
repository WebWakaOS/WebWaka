/**
 * Music Studio / Artist Profile Site — NF-MUS anchor (VN-MUS-001)
 * Pillar 2 — P2-music-studio-artist-profile · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • COSON (Copyright Society of Nigeria) / NCC badge — rights management
 *   • "Book Studio Time" WhatsApp CTA — studio bookings via WhatsApp is standard
 *   • Services: recording, mixing, mastering, beat purchase, songwriting, jingles
 *   • NGN hourly / per-session rates; null → "Quote on request"
 *   • "Professional equipment" trust signal: SSL console, Pro Tools, plugins
 *   • Nigerian music context: Afrobeats, highlife, gospel, fuji, hip-hop, R&B
 *   • Artist profile variant: streaming links, EPK download, booking for shows
 *   • "In-house producer" differentiation
 *   • Beat licensing note: exclusive vs non-exclusive
 *   • Soundcloud / YouTube / Spotify links as social proof
 *
 * CSS namespace: .ms-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to book studio time or enquire about your music services. Please share your rates and availability.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.ms-hero{text-align:center;padding:2.75rem 0 2rem}
.ms-logo{height:90px;width:90px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-primary)}
.ms-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.ms-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.ms-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ms-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.ms-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ms-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ms-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.ms-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ms-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ms-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ms-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ms-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.ms-section{margin-top:2.75rem}
.ms-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ms-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.ms-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.ms-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.ms-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.ms-card-rate{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.ms-card-qor{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.ms-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.ms-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ms-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ms-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ms-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.ms-info-item{display:flex;flex-direction:column;gap:.25rem}
.ms-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ms-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ms-info-value a{color:var(--ww-primary)}
.ms-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ms-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ms-body{max-width:44rem;margin:0 auto}
.ms-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.ms-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.ms-drow{display:flex;gap:1rem;align-items:flex-start}
.ms-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.ms-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.ms-dvalue a{color:var(--ww-primary);font-weight:600}
.ms-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.ms-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.ms-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ms-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.ms-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.ms-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.ms-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ms-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ms-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ms-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ms-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.ms-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ms-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ms-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ms-layout{grid-template-columns:1fr 1fr}}
.ms-info h2,.ms-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ms-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ms-info a{color:var(--ww-primary);font-weight:600}
.ms-form{display:flex;flex-direction:column;gap:.875rem}
.ms-fg{display:flex;flex-direction:column;gap:.375rem}
.ms-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ms-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ms-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.ms-ta{min-height:100px;resize:vertical}
.ms-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.ms-submit:hover{filter:brightness(1.1)}
.ms-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.ms-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.ms-ctas{flex-direction:column;align-items:stretch}.ms-wa-btn,.ms-sec-btn{width:100%;justify-content:center}}
</style>`;

const waSvg=()=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;
const micSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;

type Offer={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const insta=(ctx.data.instagramHandle as string|null)??null;
  const streaming=(ctx.data.streamingUrl as string|null)??null;
  const featured=offers.slice(0,6);const hasMore=offers.length>6;
  const bio=desc?(desc.length>200?desc.slice(0,200).trimEnd()+'…':desc):null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book studio time or enquire about music services. Please share your rates and availability.`);
  return `${CSS}
<section class="ms-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ms-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="ms-tagline">${tag?esc(tag):'Professional recording studio — Afrobeats, gospel, highlife, hip-hop, and more. Recording, mixing, mastering, and beat production under one roof.'}</p>
  <div class="ms-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn">${waSvg()} Book Studio Time</a>`:`<a class="ms-wa-btn" href="/contact">${waSvg()} Book Now</a>`}
    ${streaming?`<a href="${safeHref(streaming)}" target="_blank" rel="noopener noreferrer" class="ms-sec-btn">${micSvg()} Listen Now</a>`:`<a href="/services" class="ms-sec-btn">${micSvg()} Our Services</a>`}
  </div>
  <div class="ms-trust-strip">
    <span class="ms-badge"><span class="ms-dot"></span>COSON Member</span>
    <span class="ms-badge"><span class="ms-dot"></span>Professional Equipment</span>
    <span class="ms-badge"><span class="ms-dot"></span>In-House Producer</span>
  </div>
  <p class="ms-avail">Recording · Mixing · Mastering · Beats · Jingles${insta?` · Instagram: @${esc(insta.replace('@',''))}`:''}${streaming?` · <a href="${safeHref(streaming)}" target="_blank" rel="noopener noreferrer" style="color:var(--ww-primary)">Stream our music</a>`:''}</p>
</section>
${featured.length?`<section class="ms-section"><h2 class="ms-section-title">Studio Services</h2><div class="ms-grid">${featured.map(o=>`<div class="ms-card"><h3 class="ms-card-name">${esc(o.name)}</h3>${o.description?`<p class="ms-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="ms-card-rate">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="ms-card-qor">Quote on request</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="ms-see-all">View all services →</a>`:''}</section>`:''}
${bio?`<div class="ms-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place||insta?`<div class="ms-info-strip">${phone?`<div class="ms-info-item"><span class="ms-info-label">Phone</span><span class="ms-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="ms-info-item"><span class="ms-info-label">Studio</span><span class="ms-info-value">${esc(place)}</span></div>`:''} ${insta?`<div class="ms-info-item"><span class="ms-info-label">Instagram</span><span class="ms-info-value"><a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a></span></div>`:''}</div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const insta=(ctx.data.instagramHandle as string|null)??null;
  const streaming=(ctx.data.streamingUrl as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book studio time.`);
  return `${CSS}
<section class="ms-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ms-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="ms-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="ms-body">
  <p class="ms-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a COSON-registered Nigerian music studio offering professional recording, mixing, mastering, beat production, and jingle creation. We serve Afrobeats, gospel, highlife, hip-hop, and R&B artists with in-house production expertise.`}</p>
  <div class="ms-details">
    ${cat?`<div class="ms-drow"><span class="ms-dlabel">Studio Type</span><span class="ms-dvalue">${esc(cat)}</span></div>`:''}
    ${place?`<div class="ms-drow"><span class="ms-dlabel">Studio</span><span class="ms-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="ms-drow"><span class="ms-dlabel">Phone</span><span class="ms-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${insta?`<div class="ms-drow"><span class="ms-dlabel">Instagram</span><span class="ms-dvalue"><a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a></span></div>`:''}
    ${streaming?`<div class="ms-drow"><span class="ms-dlabel">Music</span><span class="ms-dvalue"><a href="${safeHref(streaming)}" target="_blank" rel="noopener noreferrer">Listen on streaming ↗</a></span></div>`:''}
  </div>
  <div class="ms-btn-row">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn">${waSvg()} Book Studio Time</a>`:`<a class="ms-wa-btn" href="/contact">${waSvg()} Book Now</a>`}
    <a href="/services" class="ms-sec-btn">${micSvg()} Our Services</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book studio time or enquire about music production services.`);
  const content=offers.length===0
    ?`<div class="ms-empty"><p>Our studio services include recording, mixing, mastering, beat production, and jingles.<br/>Contact us to check availability and get a quote.</p><br/>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn">${waSvg()} Book on WhatsApp</a>`:`<a class="ms-wa-btn" href="/contact">${waSvg()} Book Now</a>`}</div>`
    :`<div class="ms-grid">${offers.map(o=>`<div class="ms-card"><h3 class="ms-card-name">${esc(o.name)}</h3>${o.description?`<p class="ms-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="ms-card-rate">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="ms-card-qor">Quote on request</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="ms-svc-hero"><h1>Studio Services</h1><p class="ms-sub">Music production and recording at ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="ms-cta-strip"><h3>Ready to record?</h3><p>Book your studio session on WhatsApp. Beat licensing: exclusive and non-exclusive options available.</p><div class="ms-btn-row" style="justify-content:center">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn">${waSvg()} Book on WhatsApp</a>`:`<a class="ms-wa-btn" href="/contact">${waSvg()} Book Now</a>`}<a href="/contact" class="ms-sec-btn">Get a Quote</a></div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const insta=(ctx.data.instagramHandle as string|null)??null;
  const streaming=(ctx.data.streamingUrl as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book studio time or enquire about your music services.`);
  return `${CSS}
<section class="ms-contact-hero"><h1>Book Studio Time</h1><p>WhatsApp us to check availability and book your session. We look forward to creating with you.</p></section>
${wa?`<div class="ms-wa-block"><p>Tell us your project type (single, EP, jingle, beat purchase), preferred dates, and budget — we will confirm availability immediately.</p><a href="${wa}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Book on WhatsApp</a></div>`:''}
<div class="ms-layout">
  <div class="ms-info"><h2>Studio Details</h2>${place?`<p><strong>Studio:</strong> ${esc(place)}</p>`:''}${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${insta?`<p><strong>Instagram:</strong> <a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a></p>`:''}${streaming?`<p><strong>Listen:</strong> <a href="${safeHref(streaming)}" target="_blank" rel="noopener noreferrer">Stream our music ↗</a></p>`:''} ${!phone&&!email&&!place&&!insta&&!streaming?`<p>Contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">COSON registered. Professional equipment. Beats available on exclusive and non-exclusive licence. In-house producer on site.</p></div>
  <div class="ms-form-wrap"><h2>Studio Booking</h2>
    <form class="ms-form" method="POST" action="/contact" id="msForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ms-fg"><label for="ms-name">Your name / artist name</label><input id="ms-name" name="name" type="text" required autocomplete="name" class="ms-input" placeholder="e.g. Davido Jr. / Segun Ola" /></div>
      <div class="ms-fg"><label for="ms-phone">Phone number</label><input id="ms-phone" name="phone" type="tel" autocomplete="tel" class="ms-input" placeholder="0803 000 0000" /></div>
      <div class="ms-fg"><label for="ms-msg">Project details</label><textarea id="ms-msg" name="message" required rows="4" class="ms-input ms-ta" placeholder="e.g. I want to record a 5-track EP (Afrobeats). Looking for a weekend session in May. Do you have beats available? Budget: ₦150,000."></textarea></div>
      <button type="submit" class="ms-submit">Send Booking Request</button>
    </form>
    <div id="msSuccess" class="ms-success" style="display:none" role="status" aria-live="polite"><h3>Booking request received!</h3><p>We will confirm your session details and rates shortly. Looking forward to making music with you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('msForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('msSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const musicStudioArtistProfileTemplate:WebsiteTemplateContract={
  slug:'music-studio-artist-profile',
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
