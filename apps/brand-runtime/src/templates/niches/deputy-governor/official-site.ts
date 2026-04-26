/**
 * Deputy Governor Official Site — NF-POL-ELC variant (VN-POL-020)
 * Pillar 2 — P2-deputy-governor-official-site · Sprint 3
 *
 * Nigeria-First:
 *   • INEC joint ticket with governor — Section 191 CFRN succession
 *   • Portfolio assigned by governor (education, agriculture, etc.)
 *   • Three modes: campaign | incumbent | post_office
 *   • INEC Certificate of Return (joint with governor) in incumbent + post_office
 *
 * Platform Invariants: T2 strict, T3 no DB, P7 CSS vars, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string):string=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtKobo(k:number):string{return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`}
function whatsappLink(phone:string|null,msg:string):string|null{
  if(!phone)return null;
  const d=phone.replace(/\D/g,'');
  const intl=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
}
function safeHref(url:string):string{try{const p=new URL(url,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(url);}catch{/**/}return '#'}

type PoliticalMode='campaign'|'incumbent'|'post_office';
function getMode(ctx:WebsiteRenderContext):PoliticalMode{
  const m=ctx.data?.mode as string|undefined;
  if(m==='incumbent'||m==='post_office')return m;
  return 'campaign';
}

const CSS=`<style>
:root{--ww-party-primary:var(--ww-primary)}
.dg-hero{text-align:center;padding:2.75rem 0 2rem}
.dg-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.dg-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.dg-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.dg-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.dg-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.dg-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.dg-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.dg-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.dg-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.dg-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.dg-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.dg-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.dg-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.dg-section{margin-top:2.75rem}
.dg-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.dg-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.dg-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.dg-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.dg-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.dg-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.dg-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.dg-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.dg-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.dg-info-item{display:flex;flex-direction:column;gap:.25rem}
.dg-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.dg-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.dg-info-value a{color:var(--ww-party-primary)}
.dg-about-hero{text-align:center;padding:2.5rem 0 2rem}
.dg-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.dg-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.dg-body{max-width:44rem;margin:0 auto}
.dg-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.dg-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.dg-drow{display:flex;gap:1rem;align-items:flex-start}
.dg-dlabel{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.dg-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.dg-dvalue a{color:var(--ww-party-primary);font-weight:600}
.dg-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.dg-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.dg-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.dg-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.dg-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.dg-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.dg-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.dg-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.dg-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.dg-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.dg-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.dg-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.dg-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.dg-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.dg-layout{grid-template-columns:1fr 1fr}}
.dg-info h2,.dg-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.dg-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.dg-info a{color:var(--ww-party-primary);font-weight:600}
.dg-form{display:flex;flex-direction:column;gap:.875rem}
.dg-fg{display:flex;flex-direction:column;gap:.375rem}
.dg-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.dg-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.dg-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.dg-ta{min-height:100px;resize:vertical}
.dg-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.dg-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
@media(max-width:375px){.dg-ctas{flex-direction:column;align-items:stretch}.dg-primary-btn,.dg-sec-btn,.dg-wa-btn{width:100%;justify-content:center}}
</style>`;

function waSvg(){return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`}

type Offering={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const description=(ctx.data.description as string|null)??null;
  const tagline=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const state=placeName??'our State';
  const party=(ctx.data.party as string|null)??null;
  const portfolio=(ctx.data.portfolio as string|null)??null;
  const inecRef=(ctx.data.inecCertRef as string|null)??null;
  const waMsg=mode==='campaign'?`Hello, I would like to support the campaign of ${esc(ctx.displayName)} for Deputy Governor.`:mode==='incumbent'?`Hello, I am contacting the office of Deputy Governor ${esc(ctx.displayName)}.`:`Hello, I would like to reach the team of former Deputy Governor ${esc(ctx.displayName)}.`;
  const waHref=whatsappLink(phone,waMsg);
  const trustBadges=mode==='campaign'
    ?`<span class="dg-badge"><span class="dg-dot"></span>INEC Joint Ticket</span>${party?`<span class="dg-badge"><span class="dg-dot"></span>${esc(party)}</span>`:''}`
    :mode==='incumbent'
    ?`<span class="dg-badge"><span class="dg-dot"></span>INEC Certificate of Return</span>${portfolio?`<span class="dg-badge"><span class="dg-dot"></span>Portfolio: ${esc(portfolio)}</span>`:''}`
    :`<span class="dg-badge"><span class="dg-dot"></span>Former Deputy Governor</span>${inecRef?`<span class="dg-badge"><span class="dg-dot"></span>${esc(inecRef)}</span>`:''}`;
  const heroSubtitle=mode==='campaign'?`Deputy Governor Candidate — ${esc(state)}`:mode==='incumbent'?`Deputy Governor, ${esc(state)}`:`Former Deputy Governor, ${esc(state)}`;
  const defaultTagline=mode==='campaign'?`Standing with our gubernatorial ticket for a stronger, more prosperous ${esc(state)}.`:mode==='incumbent'?`Delivering on the state's mandate through ${esc(portfolio??'assigned portfolio')} and executive support for the Governor.`:`Proud to have served the people of ${esc(state)} as Deputy Governor.`;
  const svcLabel=mode==='campaign'?'Campaign Agenda':mode==='incumbent'?'Portfolio Projects':'Legacy Record';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const grid=featured.length===0?'':`<section class="dg-section"><h2 class="dg-section-title">${esc(svcLabel)}</h2><div class="dg-grid">${featured.map(o=>`<div class="dg-card"><h3 class="dg-card-name">${esc(o.name)}</h3>${o.description?`<p class="dg-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>${offerings.length>6?`<a href="/services" style="display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">View all →</a>`:''}</section>`;
  return `${CSS}
<section class="dg-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="dg-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="dg-subtitle">${heroSubtitle}</p>
  <p class="dg-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="dg-ctas">
    ${waHref&&mode==='campaign'?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="dg-primary-btn">${waSvg()} Join Campaign</a>`:`<a href="/services" class="dg-primary-btn">${mode==='incumbent'?'Portfolio Projects':'View Record'}</a>`}
    <a href="/contact" class="dg-sec-btn">Contact the Office</a>
  </div>
  <div class="dg-trust-strip">${trustBadges}</div>
</section>
${grid}
${bio?`<div class="dg-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone||placeName?`<div class="dg-info-strip">${placeName?`<div class="dg-info-item"><span class="dg-info-label">State</span><span class="dg-info-value">${esc(placeName)}</span></div>`:''} ${portfolio&&mode!=='campaign'?`<div class="dg-info-item"><span class="dg-info-label">Portfolio</span><span class="dg-info-value">${esc(portfolio)}</span></div>`:''} ${phone?`<div class="dg-info-item"><span class="dg-info-label">Office</span><span class="dg-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="dg-info-item"><span class="dg-info-label">${mode==='campaign'?'Volunteer':'WhatsApp'}</span><span class="dg-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const description=(ctx.data.description as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const portfolio=(ctx.data.portfolio as string|null)??null;
  const inecRef=(ctx.data.inecCertRef as string|null)??null;
  const state=placeName??'the State';
  const waHref=whatsappLink(phone,`Hello, I would like to contact the office of ${mode==='campaign'?'Deputy Governor Candidate':'Deputy Governor'} ${esc(ctx.displayName)}.`);
  const roleLabel=mode==='campaign'?`Deputy Governor Candidate — ${esc(state)}`:mode==='incumbent'?`Deputy Governor, ${esc(state)}`:`Former Deputy Governor, ${esc(state)}`;
  const defaultDesc=mode==='campaign'?`${esc(ctx.displayName)} is running as Deputy Governor on the joint ticket with the gubernatorial candidate for ${esc(state)}, under an INEC-filed candidacy. Section 187 CFRN mandates joint tickets for governor and deputy governor.`:mode==='incumbent'?`${esc(ctx.displayName)} serves as Deputy Governor of ${esc(state)}, elected on a joint ticket under Section 187 CFRN. Responsible for the assigned portfolio and succession under Section 191 CFRN.`:`${esc(ctx.displayName)} served as Deputy Governor of ${esc(state)}, elected on a joint INEC ticket and serving with dedication under the state administration.`;
  return `${CSS}
<section class="dg-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="dg-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="dg-cat-badge">${esc(roleLabel)}</span>
</section>
<div class="dg-body">
  <p class="dg-desc">${description?esc(description):defaultDesc}</p>
  <div class="dg-details">
    ${party?`<div class="dg-drow"><span class="dg-dlabel">Party</span><span class="dg-dvalue">${esc(party)}</span></div>`:''}
    ${placeName?`<div class="dg-drow"><span class="dg-dlabel">State</span><span class="dg-dvalue">${esc(placeName)}</span></div>`:''}
    ${portfolio&&mode!=='campaign'?`<div class="dg-drow"><span class="dg-dlabel">Portfolio</span><span class="dg-dvalue">${esc(portfolio)}</span></div>`:''}
    <div class="dg-drow"><span class="dg-dlabel">Constitutional Basis</span><span class="dg-dvalue">Section 187 CFRN (Joint Ticket) / Section 191 (Succession)</span></div>
    ${mode!=='campaign'&&inecRef?`<div class="dg-drow"><span class="dg-dlabel">INEC Certificate</span><span class="dg-dvalue">${esc(inecRef)}</span></div>`:''}
    ${phone?`<div class="dg-drow"><span class="dg-dlabel">Office Phone</span><span class="dg-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="dg-drow"><span class="dg-dlabel">Official Site</span><span class="dg-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="dg-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="dg-wa-btn">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a>`:''}
    <a href="/contact" class="dg-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const state=placeName??'the State';
  const portfolio=(ctx.data.portfolio as string|null)??null;
  const waHref=whatsappLink(phone,`Hello, I would like to reach the office of Deputy Governor ${esc(ctx.displayName)}.`);
  const pageTitle=mode==='campaign'?'Campaign Agenda':mode==='incumbent'?'Portfolio Projects':'Legacy Record';
  const pageSubtitle=mode==='campaign'?`Campaign priorities for ${esc(state)} as part of the joint gubernatorial ticket`:mode==='incumbent'?`Active portfolio projects${portfolio?` in ${esc(portfolio)}`:''} under Deputy Governor ${esc(ctx.displayName)}`:`Portfolio achievements and state projects during the tenure of ${esc(ctx.displayName)}`;
  const emptyMsg=mode==='campaign'?'Campaign agenda coming soon.':mode==='incumbent'?'Portfolio projects being published.':'Record being compiled.';
  const content=offerings.length===0?`<div class="dg-empty"><p>${esc(emptyMsg)}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="dg-wa-btn">${waSvg()} WhatsApp</a>`:`<br/><a class="dg-primary-btn" href="/contact">Contact</a>`}</div>`
    :`<div class="dg-grid">${offerings.map(o=>`<div class="dg-card"><h3 class="dg-card-name">${esc(o.name)}</h3>${o.description?`<p class="dg-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="dg-svc-hero"><h1>${esc(pageTitle)}</h1><p class="dg-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="dg-cta-strip">
  <h3>${mode==='campaign'?'Support the Ticket':'Constituent Services'}</h3>
  <p>${mode==='campaign'?`Stand with our joint ticket for a better ${esc(state)}.`:mode==='incumbent'?'For portfolio project enquiries or official matters, reach the Deputy Governor\'s office.':'For engagement with the legacy of this term, contact our team.'}</p>
  <div class="dg-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="dg-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="dg-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const state=placeName??'the State';
  const waMsg=mode==='campaign'?`Hello, I want to support the Deputy Governor campaign of ${esc(ctx.displayName)}.`:`Hello, I am contacting the office of ${mode==='incumbent'?'Deputy Governor':'former Deputy Governor'} ${esc(ctx.displayName)}, ${esc(state)}.`;
  const waHref=whatsappLink(phone,waMsg);
  return `${CSS}
<section class="dg-contact-hero">
  <h1>${mode==='campaign'?'Join the Campaign':'Contact the Office'}</h1>
  <p>${mode==='campaign'?`Support our joint gubernatorial ticket for ${esc(state)}.`:mode==='incumbent'?`Reach the Deputy Governor's office for constituent matters, portfolio enquiries, or media.`:`Contact the team of former Deputy Governor ${esc(ctx.displayName)}.`}</p>
</section>
${waHref?`<div class="dg-wa-block"><p>${mode==='campaign'?'Join our campaign on WhatsApp.':'Send a WhatsApp message to our office.'}</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="dg-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a></div>`:''}
<div class="dg-layout">
  <div class="dg-info">
    <h2>${mode==='incumbent'?`Office of the Deputy Governor, ${esc(state)}`:'Campaign Office'}</h2>
    ${placeName?`<p><strong>State:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">${mode==='campaign'?'Campaign in compliance with INEC joint-ticket guidelines.':'Elected on joint INEC ticket per Section 187 CFRN. Succession governed by Section 191 CFRN.'}</p>
  </div>
  <div class="dg-form-wrap">
    <h2>Send a Message</h2>
    <form class="dg-form" method="POST" action="/contact" id="dgForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="dg-fg"><label for="dg-name">Your full name</label><input id="dg-name" name="name" type="text" required autocomplete="name" class="dg-input" placeholder="e.g. Chioma Okonkwo" /></div>
      <div class="dg-fg"><label for="dg-phone">Phone number</label><input id="dg-phone" name="phone" type="tel" autocomplete="tel" class="dg-input" placeholder="0803 000 0000" /></div>
      <div class="dg-fg"><label for="dg-email">Email (optional)</label><input id="dg-email" name="email" type="email" class="dg-input" placeholder="you@example.com" /></div>
      <div class="dg-fg"><label for="dg-msg">${mode==='campaign'?'How would you like to help?':'Your message'}</label><textarea id="dg-msg" name="message" required rows="4" class="dg-input dg-ta" placeholder="${mode==='campaign'?'e.g. I want to campaign or volunteer for the ticket.':'e.g. I have a portfolio project or constituent enquiry.'}"></textarea></div>
      <button type="submit" class="dg-submit">Send Message</button>
    </form>
    <div id="dgSuccess" class="dg-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>Our team will respond shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('dgForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('dgSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const deputyGovernorOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'deputy-governor-official-site',
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
