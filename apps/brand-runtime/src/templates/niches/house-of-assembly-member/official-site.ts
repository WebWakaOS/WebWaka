/**
 * House of Assembly Member Official Site — NF-POL-ELC variant (VN-POL-014)
 * Pillar 2 — P2-house-of-assembly-member-official-site · Sprint 2
 *
 * Nigeria-First:
 *   • State constituency — INEC-delineated
 *   • State House of Assembly (HOA) — bills, committees, CDF delivery
 *   • Three modes: campaign | incumbent | post_office
 *   • INEC Certificate of Return in incumbent + post_office
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
.ha-hero{text-align:center;padding:2.75rem 0 2rem}
.ha-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.ha-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.ha-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.ha-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.ha-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ha-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.ha-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.ha-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.ha-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.ha-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ha-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.ha-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.ha-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.ha-section{margin-top:2.75rem}
.ha-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.ha-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.ha-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.ha-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.ha-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.ha-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ha-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ha-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ha-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.ha-info-item{display:flex;flex-direction:column;gap:.25rem}
.ha-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ha-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ha-info-value a{color:var(--ww-party-primary)}
.ha-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ha-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.ha-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.ha-body{max-width:44rem;margin:0 auto}
.ha-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.ha-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.ha-drow{display:flex;gap:1rem;align-items:flex-start}
.ha-dlabel{font-size:.875rem;font-weight:700;min-width:9rem;color:var(--ww-text);flex-shrink:0}
.ha-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.ha-dvalue a{color:var(--ww-party-primary);font-weight:600}
.ha-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.ha-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.ha-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ha-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.ha-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.ha-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.ha-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ha-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ha-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ha-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.ha-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.ha-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ha-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ha-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ha-layout{grid-template-columns:1fr 1fr}}
.ha-info h2,.ha-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ha-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ha-info a{color:var(--ww-party-primary);font-weight:600}
.ha-form{display:flex;flex-direction:column;gap:.875rem}
.ha-fg{display:flex;flex-direction:column;gap:.375rem}
.ha-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ha-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ha-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.ha-ta{min-height:100px;resize:vertical}
.ha-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.ha-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
@media(max-width:375px){.ha-ctas{flex-direction:column;align-items:stretch}.ha-primary-btn,.ha-sec-btn,.ha-wa-btn{width:100%;justify-content:center}}
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
  const constituency=placeName??'State Constituency';
  const party=(ctx.data.party as string|null)??null;
  const inecRef=(ctx.data.inecCertRef as string|null)??null;
  const committee=(ctx.data.committee as string|null)??null;
  const waMsg=mode==='campaign'?`Hello, I would like to support the HOA campaign of ${esc(ctx.displayName)}.`:`Hello, I am a constituent reaching the office of Hon. ${esc(ctx.displayName)}.`;
  const waHref=whatsappLink(phone,waMsg);
  const trustBadges=mode==='campaign'
    ?`<span class="ha-badge"><span class="ha-dot"></span>INEC HOA Candidate</span>${party?`<span class="ha-badge"><span class="ha-dot"></span>${esc(party)}</span>`:''}`
    :mode==='incumbent'
    ?`<span class="ha-badge"><span class="ha-dot"></span>INEC Certificate of Return</span>${committee?`<span class="ha-badge"><span class="ha-dot"></span>HOA Committee: ${esc(committee)}</span>`:''}`
    :`<span class="ha-badge"><span class="ha-dot"></span>Former Member, HOA</span>${inecRef?`<span class="ha-badge"><span class="ha-dot"></span>${esc(inecRef)}</span>`:''}`;
  const heroSubtitle=mode==='campaign'?`House of Assembly Candidate — ${esc(constituency)}`:mode==='incumbent'?`Member, State House of Assembly — ${esc(constituency)}`:`Former Member, HOA — ${esc(constituency)}`;
  const defaultTagline=mode==='campaign'?`Strong state legislation and CDF delivery for ${esc(constituency)}.`:mode==='incumbent'?`Sponsoring HOA bills, delivering CDF projects, and scrutinising the state budget for ${esc(constituency)}.`:`Proud to have delivered HOA legislation and constituency projects for ${esc(constituency)}.`;
  const svcLabel=mode==='campaign'?'Legislative Agenda':mode==='incumbent'?'Bills & CDF Projects':'HOA Record';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const grid=featured.length===0?'':`<section class="ha-section"><h2 class="ha-section-title">${esc(svcLabel)}</h2><div class="ha-grid">${featured.map(o=>`<div class="ha-card"><h3 class="ha-card-name">${esc(o.name)}</h3>${o.description?`<p class="ha-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>${offerings.length>6?`<a href="/services" style="display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">View all →</a>`:''}</section>`;
  return `${CSS}
<section class="ha-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ha-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="ha-subtitle">${heroSubtitle}</p>
  <p class="ha-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="ha-ctas">
    ${waHref&&mode==='campaign'?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ha-primary-btn">${waSvg()} Join Campaign</a>`:`<a href="/services" class="ha-primary-btn">${mode==='incumbent'?'Bills & Projects':'View Record'}</a>`}
    <a href="/contact" class="ha-sec-btn">Contact the Office</a>
  </div>
  <div class="ha-trust-strip">${trustBadges}</div>
</section>
${grid}
${bio?`<div class="ha-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone||placeName?`<div class="ha-info-strip">${placeName?`<div class="ha-info-item"><span class="ha-info-label">State Constituency</span><span class="ha-info-value">${esc(placeName)}</span></div>`:''} ${phone?`<div class="ha-info-item"><span class="ha-info-label">Office Phone</span><span class="ha-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="ha-info-item"><span class="ha-info-label">${mode==='campaign'?'Volunteer':'Enquiries'}</span><span class="ha-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
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
  const constituency=placeName??'State Constituency';
  const waHref=whatsappLink(phone,`Hello, I would like to contact the office of Hon. ${esc(ctx.displayName)}.`);
  const roleLabel=mode==='campaign'?`HOA Candidate — ${esc(constituency)}`:mode==='incumbent'?`Member, HOA — ${esc(constituency)}`:`Former Member, HOA — ${esc(constituency)}`;
  const defaultDesc=mode==='campaign'?`${esc(ctx.displayName)} is seeking a state legislative mandate from ${esc(constituency)} to sponsor HOA bills, deliver CDF projects, and provide accountable state-level representation.`:mode==='incumbent'?`${esc(ctx.displayName)} represents ${esc(constituency)} in the State House of Assembly, sponsoring bills, serving on committees, and ensuring CDF projects reach the constituency.`:`${esc(ctx.displayName)} served as Member for ${esc(constituency)} in the State House of Assembly, sponsoring bills and delivering CDF projects for the constituency.`;
  return `${CSS}
<section class="ha-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ha-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="ha-cat-badge">${esc(roleLabel)}</span>
</section>
<div class="ha-body">
  <p class="ha-desc">${description?esc(description):defaultDesc}</p>
  <div class="ha-details">
    ${party?`<div class="ha-drow"><span class="ha-dlabel">Party</span><span class="ha-dvalue">${esc(party)}</span></div>`:''}
    ${placeName?`<div class="ha-drow"><span class="ha-dlabel">Constituency</span><span class="ha-dvalue">${esc(placeName)}</span></div>`:''}
    ${committee?`<div class="ha-drow"><span class="ha-dlabel">HOA Committee</span><span class="ha-dvalue">${esc(committee)}</span></div>`:''}
    ${mode!=='campaign'&&inecRef?`<div class="ha-drow"><span class="ha-dlabel">INEC Certificate</span><span class="ha-dvalue">${esc(inecRef)}</span></div>`:''}
    ${phone?`<div class="ha-drow"><span class="ha-dlabel">Office Phone</span><span class="ha-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="ha-drow"><span class="ha-dlabel">Official Site</span><span class="ha-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="ha-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ha-wa-btn">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a>`:''}
    <a href="/contact" class="ha-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const constituency=placeName??'State Constituency';
  const waHref=whatsappLink(phone,`Hello, I would like to reach the office of Hon. ${esc(ctx.displayName)}.`);
  const pageTitle=mode==='campaign'?'Legislative Agenda':mode==='incumbent'?'Bills & CDF Projects':'HOA Record';
  const pageSubtitle=mode==='campaign'?`Proposed HOA bills and CDF priorities for ${esc(constituency)}`:mode==='incumbent'?`Active HOA bills, committee work, and CDF projects for ${esc(constituency)}`:`HOA bills and CDF projects delivered for ${esc(constituency)} during tenure`;
  const emptyMsg=mode==='campaign'?'Legislative agenda coming soon.':mode==='incumbent'?'Bills and project updates being published.':'Record being compiled.';
  const content=offerings.length===0?`<div class="ha-empty"><p>${esc(emptyMsg)}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ha-wa-btn">${waSvg()} WhatsApp</a>`:`<br/><a class="ha-primary-btn" href="/contact">Contact the Office</a>`}</div>`
    :`<div class="ha-grid">${offerings.map(o=>`<div class="ha-card"><h3 class="ha-card-name">${esc(o.name)}</h3>${o.description?`<p class="ha-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="ha-svc-hero"><h1>${esc(pageTitle)}</h1><p class="ha-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="ha-cta-strip">
  <h3>${mode==='campaign'?'Support the Campaign':'Constituent Services'}</h3>
  <p>${mode==='campaign'?`Help us deliver strong state legislation and CDF projects for ${esc(constituency)}.`:`For HOA bill information, CDF project enquiries, or constituent matters, reach the Member's office.`}</p>
  <div class="ha-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ha-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="ha-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const constituency=placeName??'State Constituency';
  const waMsg=mode==='campaign'?`Hello, I want to support the HOA campaign of ${esc(ctx.displayName)}.`:`Hello, I am a constituent from ${esc(constituency)} reaching the office of Hon. ${esc(ctx.displayName)}.`;
  const waHref=whatsappLink(phone,waMsg);
  return `${CSS}
<section class="ha-contact-hero">
  <h1>${mode==='campaign'?'Join the Campaign':'Contact the Office'}</h1>
  <p>${mode==='campaign'?`Volunteer for our HOA campaign or contact the coordination office.`:mode==='incumbent'?`Reach the Member's office for constituency matters, HOA bills, or CDF project enquiries.`:`Contact the team of former Member ${esc(ctx.displayName)}.`}</p>
</section>
${waHref?`<div class="ha-wa-block"><p>${mode==='campaign'?'Join our campaign team on WhatsApp.':'Send a WhatsApp message for faster response.'}</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ha-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a></div>`:''}
<div class="ha-layout">
  <div class="ha-info">
    <h2>${mode==='incumbent'?`Member's Office — ${esc(constituency)}`:'Campaign Office'}</h2>
    ${placeName?`<p><strong>Constituency:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Office contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">${mode==='campaign'?'Campaign under INEC guidelines.':'All HOA correspondence is constitutionally compliant.'}</p>
  </div>
  <div class="ha-form-wrap">
    <h2>Send a Message</h2>
    <form class="ha-form" method="POST" action="/contact" id="haForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ha-fg"><label for="ha-name">Your full name</label><input id="ha-name" name="name" type="text" required autocomplete="name" class="ha-input" placeholder="e.g. Kola Adebisi" /></div>
      <div class="ha-fg"><label for="ha-phone">Phone number</label><input id="ha-phone" name="phone" type="tel" autocomplete="tel" class="ha-input" placeholder="0803 000 0000" /></div>
      <div class="ha-fg"><label for="ha-email">Email (optional)</label><input id="ha-email" name="email" type="email" class="ha-input" placeholder="you@example.com" /></div>
      <div class="ha-fg"><label for="ha-msg">${mode==='campaign'?'How would you like to help?':'Your message'}</label><textarea id="ha-msg" name="message" required rows="4" class="ha-input ha-ta" placeholder="${mode==='campaign'?'e.g. I want to campaign or ask about HOA bills.':'e.g. I have a question about a CDF project or HOA bill.'}"></textarea></div>
      <button type="submit" class="ha-submit">Send Message</button>
    </form>
    <div id="haSuccess" class="ha-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>The Member's team will respond shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('haForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('haSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const houseOfAssemblyMemberOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'house-of-assembly-member-official-site',
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
