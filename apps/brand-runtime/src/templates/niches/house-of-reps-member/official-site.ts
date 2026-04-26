/**
 * House of Representatives Member Official Site — NF-POL-ELC variant (VN-POL-010)
 * Pillar 2 — P2-house-of-reps-member-official-site · Sprint 1
 *
 * Nigeria-First:
 *   • 360 Reps across federal constituencies (INEC-delineated)
 *   • HB-prefix bills, House committee work, CDF delivery tracking
 *   • Federal constituency identity (below senatorial district level)
 *   • INEC Certificate of Return in incumbent + post_office
 *   • Three modes: campaign | incumbent | post_office
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
.hr-hero{text-align:center;padding:2.75rem 0 2rem}
.hr-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.hr-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.hr-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.hr-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.hr-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.hr-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.hr-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.hr-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.hr-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.hr-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.hr-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.hr-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.hr-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.hr-section{margin-top:2.75rem}
.hr-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.hr-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.hr-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.hr-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.hr-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.hr-card-price{font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0}
.hr-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.hr-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.hr-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.hr-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.hr-info-item{display:flex;flex-direction:column;gap:.25rem}
.hr-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.hr-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.hr-info-value a{color:var(--ww-party-primary)}
.hr-about-hero{text-align:center;padding:2.5rem 0 2rem}
.hr-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.hr-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.hr-body{max-width:44rem;margin:0 auto}
.hr-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.hr-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.hr-drow{display:flex;gap:1rem;align-items:flex-start}
.hr-dlabel{font-size:.875rem;font-weight:700;min-width:9rem;color:var(--ww-text);flex-shrink:0}
.hr-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.hr-dvalue a{color:var(--ww-party-primary);font-weight:600}
.hr-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.hr-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.hr-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.hr-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.hr-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.hr-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.hr-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.hr-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.hr-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.hr-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.hr-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.hr-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.hr-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.hr-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.hr-layout{grid-template-columns:1fr 1fr}}
.hr-info h2,.hr-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.hr-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.hr-info a{color:var(--ww-party-primary);font-weight:600}
.hr-form{display:flex;flex-direction:column;gap:.875rem}
.hr-fg{display:flex;flex-direction:column;gap:.375rem}
.hr-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.hr-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.hr-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.hr-ta{min-height:100px;resize:vertical}
.hr-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.hr-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
@media(max-width:375px){.hr-ctas{flex-direction:column;align-items:stretch}.hr-primary-btn,.hr-sec-btn,.hr-wa-btn{width:100%;justify-content:center}}
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
  const constituency=placeName??'Federal Constituency';
  const party=(ctx.data.party as string|null)??null;
  const inecRef=(ctx.data.inecCertRef as string|null)??null;
  const committee=(ctx.data.committee as string|null)??null;
  const waMsg=mode==='campaign'
    ?`Hello, I would like to volunteer for the House of Reps campaign of ${esc(ctx.displayName)}.`
    :`Hello, I am a constituent from ${esc(constituency)} reaching the Member's office.`;
  const waHref=whatsappLink(phone,waMsg);
  const trustBadges=mode==='campaign'
    ?`<span class="hr-badge"><span class="hr-dot"></span>INEC HoR Candidate</span>${party?`<span class="hr-badge"><span class="hr-dot"></span>${esc(party)}</span>`:''}`
    :mode==='incumbent'
    ?`<span class="hr-badge"><span class="hr-dot"></span>INEC Certificate of Return</span>${committee?`<span class="hr-badge"><span class="hr-dot"></span>House Committee: ${esc(committee)}</span>`:''}`
    :`<span class="hr-badge"><span class="hr-dot"></span>Former Member, HoR</span>${inecRef?`<span class="hr-badge"><span class="hr-dot"></span>${esc(inecRef)}</span>`:''}`;
  const heroSubtitle=mode==='campaign'
    ?`House of Representatives Candidate — ${esc(constituency)}`
    :mode==='incumbent'
    ?`Member, House of Representatives — ${esc(constituency)}`
    :`Former Member, HoR — ${esc(constituency)}`;
  const defaultTagline=mode==='campaign'
    ?`Committed to delivering HB bills, CDF projects, and real federal oversight for ${esc(constituency)}.`
    :mode==='incumbent'
    ?`Sponsoring HB bills, delivering CDF projects, and representing ${esc(constituency)} at the federal level.`
    :`Proud to have delivered federal legislation and CDF projects for ${esc(constituency)}.`;
  const svcLabel=mode==='campaign'?'Legislative Agenda':mode==='incumbent'?'Bills & CDF Projects':'House Record';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const grid=featured.length===0?'':`<section class="hr-section"><h2 class="hr-section-title">${esc(svcLabel)}</h2><div class="hr-grid">${featured.map(o=>`<div class="hr-card"><h3 class="hr-card-name">${esc(o.name)}</h3>${o.description?`<p class="hr-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p class="hr-card-price">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>${offerings.length>6?`<a href="/services" style="display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">View all →</a>`:''}</section>`;
  return `${CSS}
<section class="hr-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="hr-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="hr-subtitle">${heroSubtitle}</p>
  <p class="hr-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="hr-ctas">
    ${waHref&&mode==='campaign'?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hr-primary-btn">${waSvg()} Join Campaign</a>`:`<a href="/services" class="hr-primary-btn">${mode==='incumbent'?'Bills & CDF Projects':'View House Record'}</a>`}
    <a href="/contact" class="hr-sec-btn">Contact the Office</a>
  </div>
  <div class="hr-trust-strip">${trustBadges}</div>
</section>
${grid}
${bio?`<div class="hr-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone||placeName?`<div class="hr-info-strip">${placeName?`<div class="hr-info-item"><span class="hr-info-label">Federal Constituency</span><span class="hr-info-value">${esc(placeName)}</span></div>`:''} ${phone?`<div class="hr-info-item"><span class="hr-info-label">Office Phone</span><span class="hr-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="hr-info-item"><span class="hr-info-label">${mode==='campaign'?'Volunteer':'Enquiries'}</span><span class="hr-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const description=(ctx.data.description as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const inecRef=(ctx.data.inecCertRef as string|null)??null;
  const committee=(ctx.data.committee as string|null)??null;
  const constituency=placeName??'Federal Constituency';
  const waHref=whatsappLink(phone,`Hello, I would like to contact the office of ${esc(ctx.displayName)}, Member HoR.`);
  const roleLabel=mode==='campaign'?`HoR Candidate — ${esc(constituency)}`:mode==='incumbent'?`Member, HoR — ${esc(constituency)}`:`Former Member, HoR — ${esc(constituency)}`;
  const defaultDesc=mode==='campaign'
    ?`${esc(ctx.displayName)} is seeking a federal mandate from ${esc(constituency)} to sponsor HB bills, deliver CDF projects, and provide real legislative oversight at the National Assembly.`
    :mode==='incumbent'
    ?`${esc(ctx.displayName)} serves as Member of the House of Representatives for ${esc(constituency)}, sponsoring HB bills, participating in House committees, and delivering CDF projects.`
    :`${esc(ctx.displayName)} served as Member of the House of Representatives for ${esc(constituency)}, delivering HB legislation and CDF projects that transformed the constituency.`;
  return `${CSS}
<section class="hr-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="hr-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="hr-cat-badge">${esc(roleLabel)}</span>
</section>
<div class="hr-body">
  <p class="hr-desc">${description?esc(description):defaultDesc}</p>
  <div class="hr-details">
    ${party?`<div class="hr-drow"><span class="hr-dlabel">Party</span><span class="hr-dvalue">${esc(party)}</span></div>`:''}
    ${placeName?`<div class="hr-drow"><span class="hr-dlabel">Constituency</span><span class="hr-dvalue">${esc(placeName)}</span></div>`:''}
    ${committee?`<div class="hr-drow"><span class="hr-dlabel">House Committee</span><span class="hr-dvalue">${esc(committee)}</span></div>`:''}
    ${mode!=='campaign'&&inecRef?`<div class="hr-drow"><span class="hr-dlabel">INEC Certificate</span><span class="hr-dvalue">${esc(inecRef)}</span></div>`:''}
    ${phone?`<div class="hr-drow"><span class="hr-dlabel">Office Phone</span><span class="hr-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="hr-drow"><span class="hr-dlabel">Official Site</span><span class="hr-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="hr-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hr-wa-btn">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a>`:''}
    <a href="/contact" class="hr-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const constituency=placeName??'Federal Constituency';
  const waHref=whatsappLink(phone,`Hello, I would like to reach the office of Member ${esc(ctx.displayName)} HoR.`);
  const pageTitle=mode==='campaign'?'Legislative Agenda':mode==='incumbent'?'Bills & CDF Projects':'House Record';
  const pageSubtitle=mode==='campaign'
    ?`Proposed HB bills and development priorities for ${esc(constituency)}`
    :mode==='incumbent'
    ?`Active HB bills, House committee work, and CDF projects for ${esc(constituency)}`
    :`HB bills and CDF projects delivered for ${esc(constituency)} during tenure`;
  const emptyMsg=mode==='campaign'?'Legislative agenda coming soon. Contact the campaign office.':mode==='incumbent'?'Bills and project updates being published. Contact the Member\'s office.':'House record being compiled. Please check back.';
  const content=offerings.length===0?`<div class="hr-empty"><p>${esc(emptyMsg)}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hr-wa-btn">${waSvg()} WhatsApp</a>`:`<br/><a class="hr-primary-btn" href="/contact">Contact the Office</a>`}</div>`
    :`<div class="hr-grid">${offerings.map(o=>`<div class="hr-card"><h3 class="hr-card-name">${esc(o.name)}</h3>${o.description?`<p class="hr-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p class="hr-card-price">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="hr-svc-hero"><h1>${esc(pageTitle)}</h1><p class="hr-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="hr-cta-strip">
  <h3>${mode==='campaign'?'Support the Campaign':'Constituent Services'}</h3>
  <p>${mode==='campaign'?`Help us win the mandate to deliver real federal representation for ${esc(constituency)}.`:`For CDF project enquiries, HB bill support, or House committee matters, reach the Member's office.`}</p>
  <div class="hr-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hr-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="hr-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const constituency=placeName??'Federal Constituency';
  const waMsg=mode==='campaign'
    ?`Hello, I want to support the HoR campaign of ${esc(ctx.displayName)}.`
    :`Hello, I am a constituent from ${esc(constituency)} contacting the office of Member ${esc(ctx.displayName)}.`;
  const waHref=whatsappLink(phone,waMsg);
  return `${CSS}
<section class="hr-contact-hero">
  <h1>${mode==='campaign'?'Join the Campaign':'Contact the Office'}</h1>
  <p>${mode==='campaign'?`Support our campaign to deliver real representation for ${esc(constituency)} in the National Assembly.`:mode==='incumbent'?`Reach the Member's office for constituency matters, CDF enquiries, or media liaison.`:`Contact the team of former Member ${esc(ctx.displayName)}.`}</p>
</section>
${waHref?`<div class="hr-wa-block"><p>${mode==='campaign'?'Join our campaign volunteers on WhatsApp.':'Send a WhatsApp message for faster response.'}</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hr-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a></div>`:''}
<div class="hr-layout">
  <div class="hr-info">
    <h2>${mode==='incumbent'?`Member's Office — ${esc(constituency)}`:mode==='campaign'?'Campaign Office':'Office Contact'}</h2>
    ${placeName?`<p><strong>Constituency:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Office contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">${mode==='campaign'?'Campaign in compliance with INEC guidelines and the Electoral Act 2022.':'All National Assembly communications comply with House rules and constitutional requirements.'}</p>
  </div>
  <div class="hr-form-wrap">
    <h2>Send a Message</h2>
    <form class="hr-form" method="POST" action="/contact" id="hrForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="hr-fg"><label for="hr-name">Your full name</label><input id="hr-name" name="name" type="text" required autocomplete="name" class="hr-input" placeholder="e.g. Emeka Obi" /></div>
      <div class="hr-fg"><label for="hr-phone">Phone number</label><input id="hr-phone" name="phone" type="tel" autocomplete="tel" class="hr-input" placeholder="0803 000 0000" /></div>
      <div class="hr-fg"><label for="hr-email">Email (optional)</label><input id="hr-email" name="email" type="email" class="hr-input" placeholder="you@example.com" /></div>
      <div class="hr-fg"><label for="hr-msg">${mode==='campaign'?'How would you like to help?':'Your message or constituency matter'}</label><textarea id="hr-msg" name="message" required rows="4" class="hr-input hr-ta" placeholder="${mode==='campaign'?'e.g. I want to canvass, donate to the campaign, or ask about legislative priorities.':'e.g. I have a question about a CDF project or HB bill in our constituency.'}"></textarea></div>
      <button type="submit" class="hr-submit">Send Message</button>
    </form>
    <div id="hrSuccess" class="hr-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>The Member's team will respond shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('hrForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('hrSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const houseOfRepsMemberOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'house-of-reps-member-official-site',
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
