/**
 * LGA Vice Chairman Official Site — NF-POL-ELC variant (VN-POL-023)
 * Pillar 2 — P2-lga-vice-chairman-official-site · Sprint 4
 *
 * Nigeria-First:
 *   • SIEC election — joint ticket with LGA Chairman (~774 LGAs, one per LGA)
 *   • Second-in-command at LGA executive level
 *   • Three modes: campaign | incumbent | post_office
 *   • CSS prefix: .lv-
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

type PoliticalMode='campaign'|'incumbent'|'post_office';
function getMode(ctx:WebsiteRenderContext):PoliticalMode{
  const m=ctx.data?.mode as string|undefined;
  if(m==='incumbent'||m==='post_office')return m;
  return 'campaign';
}

const CSS=`<style>
:root{--ww-party-primary:var(--ww-primary)}
.lv-hero{text-align:center;padding:2.75rem 0 2rem}
.lv-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.lv-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.lv-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.lv-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.lv-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.lv-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.lv-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.lv-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.lv-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.lv-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.lv-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.lv-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.lv-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.lv-section{margin-top:2.75rem}
.lv-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.lv-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.lv-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.lv-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.lv-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.lv-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.lv-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.lv-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.lv-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.lv-info-item{display:flex;flex-direction:column;gap:.25rem}
.lv-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.lv-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.lv-info-value a{color:var(--ww-party-primary)}
.lv-about-hero{text-align:center;padding:2.5rem 0 2rem}
.lv-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.lv-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.lv-body{max-width:44rem;margin:0 auto}
.lv-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.lv-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.lv-drow{display:flex;gap:1rem;align-items:flex-start}
.lv-dlabel{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.lv-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.lv-dvalue a{color:var(--ww-party-primary);font-weight:600}
.lv-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.lv-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.lv-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.lv-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.lv-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.lv-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.lv-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.lv-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.lv-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.lv-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.lv-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.lv-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.lv-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.lv-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.lv-layout{grid-template-columns:1fr 1fr}}
.lv-info h2,.lv-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.lv-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.lv-info a{color:var(--ww-party-primary);font-weight:600}
.lv-form{display:flex;flex-direction:column;gap:.875rem}
.lv-fg{display:flex;flex-direction:column;gap:.375rem}
.lv-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.lv-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.lv-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.lv-ta{min-height:100px;resize:vertical}
.lv-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.lv-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
@media(max-width:375px){.lv-ctas{flex-direction:column;align-items:stretch}.lv-primary-btn,.lv-sec-btn,.lv-wa-btn{width:100%;justify-content:center}}
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
  const lga=placeName??'the LGA';
  const party=(ctx.data.party as string|null)??null;
  const chairmanName=(ctx.data.chairmanName as string|null)??null;
  const siecRef=(ctx.data.siecCertRef as string|null)??null;
  const waMsg=mode==='campaign'?`Hello, I want to support the Vice Chairman campaign of ${esc(ctx.displayName)} for ${esc(lga)}.`:`Hello, I would like to reach the office of Vice Chairman ${esc(ctx.displayName)}, ${esc(lga)}.`;
  const waHref=whatsappLink(phone,waMsg);
  const heroSubtitle=mode==='campaign'
    ?`LGA Vice Chairman Candidate — ${esc(lga)}${chairmanName?` (Joint ticket with ${esc(chairmanName)})`:''}`
    :mode==='incumbent'
    ?`LGA Vice Chairman, ${esc(lga)}`
    :`Former LGA Vice Chairman, ${esc(lga)}`;
  const defaultTagline=mode==='campaign'
    ?`A joint ticket committed to delivering grassroots development, community projects, and accountable governance in ${esc(lga)}.`
    :mode==='incumbent'
    ?`Supporting the Chairman's administration in ${esc(lga)}: driving projects, coordinating departments, and serving every ward.`
    :`Proud to have served the people of ${esc(lga)} as LGA Vice Chairman.`;
  const trustBadges=mode==='campaign'
    ?`<span class="lv-badge"><span class="lv-dot"></span>SIEC Joint Ticket</span>${party?`<span class="lv-badge"><span class="lv-dot"></span>${esc(party)}</span>`:''}`
    :mode==='incumbent'
    ?`<span class="lv-badge"><span class="lv-dot"></span>SIEC Certificate of Return</span><span class="lv-badge"><span class="lv-dot"></span>LGA Vice Chairman</span>`
    :`<span class="lv-badge"><span class="lv-dot"></span>Former LGA Vice Chairman</span>${siecRef?`<span class="lv-badge"><span class="lv-dot"></span>${esc(siecRef)}</span>`:''}`;
  const svcLabel=mode==='campaign'?'Campaign Agenda':mode==='incumbent'?'LGA Initiatives':'Tenure Record';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const grid=featured.length===0?'':`<section class="lv-section"><h2 class="lv-section-title">${esc(svcLabel)}</h2><div class="lv-grid">${featured.map(o=>`<div class="lv-card"><h3 class="lv-card-name">${esc(o.name)}</h3>${o.description?`<p class="lv-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div></section>`;
  return `${CSS}
<section class="lv-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="lv-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="lv-subtitle">${heroSubtitle}</p>
  <p class="lv-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="lv-ctas">
    ${waHref&&mode==='campaign'?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="lv-primary-btn">${waSvg()} Join Campaign</a>`:`<a href="/services" class="lv-primary-btn">${mode==='incumbent'?'LGA Initiatives':'View Record'}</a>`}
    <a href="/contact" class="lv-sec-btn">${mode==='campaign'?'Campaign HQ':'Contact the Office'}</a>
  </div>
  <div class="lv-trust-strip">${trustBadges}</div>
</section>
${grid}
${bio?`<div class="lv-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone||placeName?`<div class="lv-info-strip">${placeName?`<div class="lv-info-item"><span class="lv-info-label">LGA</span><span class="lv-info-value">${esc(placeName)}</span></div>`:''} ${chairmanName&&mode==='campaign'?`<div class="lv-info-item"><span class="lv-info-label">Running With</span><span class="lv-info-value">${esc(chairmanName)}</span></div>`:''} ${phone?`<div class="lv-info-item"><span class="lv-info-label">${mode==='campaign'?'Campaign':'Office'}</span><span class="lv-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="lv-info-item"><span class="lv-info-label">WhatsApp</span><span class="lv-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">${mode==='campaign'?'Join Campaign →':'Chat →'}</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const description=(ctx.data.description as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const chairmanName=(ctx.data.chairmanName as string|null)??null;
  const siecRef=(ctx.data.siecCertRef as string|null)??null;
  const lga=placeName??'the LGA';
  const waHref=whatsappLink(phone,`Hello, I would like to contact Vice Chairman ${esc(ctx.displayName)}, ${esc(lga)}.`);
  const roleLabel=mode==='campaign'?`LGA Vice Chairman Candidate — ${esc(lga)}`:mode==='incumbent'?`LGA Vice Chairman, ${esc(lga)}`:`Former LGA Vice Chairman, ${esc(lga)}`;
  const defaultDesc=mode==='campaign'
    ?`${esc(ctx.displayName)} is the LGA Vice Chairman candidate for ${esc(lga)}, running on a joint SIEC ticket${chairmanName?` alongside Chairman candidate ${esc(chairmanName)}`:''}${party?` under ${esc(party)}`:''}. Committed to community development, ward projects, and grassroots accountability.`
    :mode==='incumbent'
    ?`${esc(ctx.displayName)} serves as LGA Vice Chairman of ${esc(lga)}, supporting the Chairman's administration in delivering community development, department coordination, and grassroots governance.`
    :`${esc(ctx.displayName)} served as LGA Vice Chairman of ${esc(lga)}, contributing to local governance, community projects, and LGA department administration.`;
  return `${CSS}
<section class="lv-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="lv-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="lv-cat-badge">${roleLabel}</span>
</section>
<div class="lv-body">
  <p class="lv-desc">${description?esc(description):defaultDesc}</p>
  <div class="lv-details">
    ${party?`<div class="lv-drow"><span class="lv-dlabel">Party</span><span class="lv-dvalue">${esc(party)}</span></div>`:''}
    ${placeName?`<div class="lv-drow"><span class="lv-dlabel">LGA</span><span class="lv-dvalue">${esc(placeName)}</span></div>`:''}
    ${chairmanName?`<div class="lv-drow"><span class="lv-dlabel">${mode==='campaign'?'Chairman Candidate':'LGA Chairman'}</span><span class="lv-dvalue">${esc(chairmanName)}</span></div>`:''}
    <div class="lv-drow"><span class="lv-dlabel">Election Body</span><span class="lv-dvalue">State Independent Electoral Commission (SIEC)</span></div>
    ${mode!=='campaign'&&siecRef?`<div class="lv-drow"><span class="lv-dlabel">SIEC Certificate</span><span class="lv-dvalue">${esc(siecRef)}</span></div>`:''}
    ${phone?`<div class="lv-drow"><span class="lv-dlabel">Phone</span><span class="lv-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
  </div>
  <div class="lv-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="lv-wa-btn">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a>`:''}
    <a href="/contact" class="lv-sec-btn">${mode==='campaign'?'Campaign HQ':'Contact the Office'}</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const lga=placeName??'the LGA';
  const waHref=whatsappLink(phone,`Hello, I would like to enquire about LGA initiatives in ${esc(lga)}.`);
  const pageTitle=mode==='campaign'?'Campaign Agenda':mode==='incumbent'?'LGA Initiatives':'Tenure Record';
  const pageSubtitle=mode==='campaign'?`Community priorities and development plans for ${esc(lga)}`:mode==='incumbent'?`Projects and initiatives coordinated by Vice Chairman ${esc(ctx.displayName)}`:`Achievements during the tenure of Vice Chairman ${esc(ctx.displayName)}, ${esc(lga)}`;
  const emptyMsg=mode==='campaign'?'Full campaign agenda coming soon.':mode==='incumbent'?'LGA initiatives being published.':'Record being compiled.';
  const content=offerings.length===0?`<div class="lv-empty"><p>${esc(emptyMsg)}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="lv-wa-btn">${waSvg()} WhatsApp</a>`:`<br/><a class="lv-primary-btn" href="/contact">Contact</a>`}</div>`
    :`<div class="lv-grid">${offerings.map(o=>`<div class="lv-card"><h3 class="lv-card-name">${esc(o.name)}</h3>${o.description?`<p class="lv-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="lv-svc-hero"><h1>${esc(pageTitle)}</h1><p class="lv-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="lv-cta-strip">
  <h3>${mode==='campaign'?'Support Our Joint Ticket':'Engage the Office'}</h3>
  <p>${mode==='campaign'?`Join our grassroots campaign for ${esc(lga)}.`:mode==='incumbent'?`For LGA project enquiries or community matters, reach the Vice Chairman's office.`:`Connect with our team.`}</p>
  <div class="lv-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="lv-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="lv-sec-btn">${mode==='campaign'?'Campaign HQ':'Contact'}</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const lga=placeName??'the LGA';
  const waMsg=mode==='campaign'?`Hello, I want to volunteer for the LGA Vice Chairman campaign of ${esc(ctx.displayName)}, ${esc(lga)}.`:`Hello, I am contacting the office of LGA Vice Chairman ${esc(ctx.displayName)}, ${esc(lga)}.`;
  const waHref=whatsappLink(phone,waMsg);
  return `${CSS}
<section class="lv-contact-hero">
  <h1>${mode==='campaign'?'Join Our Campaign':'Contact the Office'}</h1>
  <p>${mode==='campaign'?`Support the ${esc(lga)} joint LGA ticket — volunteer, attend campaign events, or reach our HQ.`:mode==='incumbent'?`Reach the office of LGA Vice Chairman ${esc(ctx.displayName)} for project enquiries, community concerns, or official liaison.`:`Contact the team of former LGA Vice Chairman ${esc(ctx.displayName)}, ${esc(lga)}.`}</p>
</section>
${waHref?`<div class="lv-wa-block"><p>${mode==='campaign'?'Connect with our campaign on WhatsApp.':'Send a WhatsApp message for faster response.'}</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="lv-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a></div>`:''}
<div class="lv-layout">
  <div class="lv-info">
    <h2>${mode==='campaign'?`Campaign HQ — ${esc(lga)}`:`Vice Chairman's Office — ${esc(lga)}`}</h2>
    ${placeName?`<p><strong>LGA:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">${mode==='campaign'?'Campaign under SIEC regulations.':'SIEC-elected office accountable to the people of '+esc(lga)+'.'}</p>
  </div>
  <div class="lv-form-wrap">
    <h2>Send a Message</h2>
    <form class="lv-form" method="POST" action="/contact" id="lvForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="lv-fg"><label for="lv-name">Your full name</label><input id="lv-name" name="name" type="text" required autocomplete="name" class="lv-input" placeholder="e.g. Adaeze Nwosu" /></div>
      <div class="lv-fg"><label for="lv-phone">Phone number</label><input id="lv-phone" name="phone" type="tel" autocomplete="tel" class="lv-input" placeholder="0803 000 0000" /></div>
      <div class="lv-fg"><label for="lv-email">Email (optional)</label><input id="lv-email" name="email" type="email" class="lv-input" placeholder="you@example.com" /></div>
      <div class="lv-fg"><label for="lv-msg">${mode==='campaign'?'How would you like to help?':'Your message or community concern'}</label><textarea id="lv-msg" name="message" required rows="4" class="lv-input lv-ta" placeholder="${mode==='campaign'?'e.g. I want to canvas wards or attend a rally.':'e.g. I have a community concern or LGA project question.'}"></textarea></div>
      <button type="submit" class="lv-submit">Send Message</button>
    </form>
    <div id="lvSuccess" class="lv-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>The Vice Chairman's team will respond shortly.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('lvForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('lvSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const lgaViceChairmanOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'lga-vice-chairman-official-site',
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
