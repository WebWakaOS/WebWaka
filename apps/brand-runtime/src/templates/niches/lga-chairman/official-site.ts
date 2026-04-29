/**
 * LGA Chairman Official Site — NF-POL-ELC variant (VN-POL-013)
 * Pillar 2 — P2-lga-chairman-official-site · Sprint 2
 *
 * Nigeria-First:
 *   • SIEC election — 774 LGAs across Nigeria
 *   • JAAC (Joint Account Allocation Committee) accountability badge
 *   • LGA revenue allocation and project delivery as primary content
 *   • Three modes: campaign | incumbent | post_office
 *   • SIEC certificate reference in incumbent + post_office
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
.lc-hero{text-align:center;padding:2.75rem 0 2rem}
.lc-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.lc-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.lc-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.lc-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.lc-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.lc-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.lc-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.lc-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.lc-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.lc-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.lc-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.lc-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.lc-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.lc-section{margin-top:2.75rem}
.lc-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.lc-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.lc-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.lc-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.lc-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.lc-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.lc-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.lc-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.lc-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.lc-info-item{display:flex;flex-direction:column;gap:.25rem}
.lc-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.lc-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.lc-info-value a{color:var(--ww-party-primary)}
.lc-about-hero{text-align:center;padding:2.5rem 0 2rem}
.lc-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.lc-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.lc-body{max-width:44rem;margin:0 auto}
.lc-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.lc-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.lc-drow{display:flex;gap:1rem;align-items:flex-start}
.lc-dlabel{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.lc-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.lc-dvalue a{color:var(--ww-party-primary);font-weight:600}
.lc-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.lc-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.lc-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.lc-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.lc-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.lc-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.lc-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.lc-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.lc-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.lc-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.lc-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.lc-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.lc-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.lc-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.lc-layout{grid-template-columns:1fr 1fr}}
.lc-info h2,.lc-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.lc-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.lc-info a{color:var(--ww-party-primary);font-weight:600}
.lc-form{display:flex;flex-direction:column;gap:.875rem}
.lc-fg{display:flex;flex-direction:column;gap:.375rem}
.lc-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.lc-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.lc-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.lc-ta{min-height:100px;resize:vertical}
.lc-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.lc-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
@media(max-width:375px){.lc-ctas{flex-direction:column;align-items:stretch}.lc-primary-btn,.lc-sec-btn,.lc-wa-btn{width:100%;justify-content:center}}
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
  const lga=placeName??'our LGA';
  const party=(ctx.data.party as string|null)??null;
  const siecRef=(ctx.data.siecCertRef as string|null)??null;
  const jaacAlloc=(ctx.data.jaacAlloc as string|null)??null;
  const waMsg=mode==='campaign'
    ?`Hello, I would like to volunteer for the LGA Chairman campaign of ${esc(ctx.displayName)}.`
    :`Hello, I am a resident of ${esc(lga)} reaching the Chairman's office.`;
  const waHref=whatsappLink(phone,waMsg);
  const trustBadges=mode==='campaign'
    ?`<span class="lc-badge"><span class="lc-dot"></span>SIEC LGA Candidate</span>${party?`<span class="lc-badge"><span class="lc-dot"></span>${esc(party)}</span>`:''}`
    :mode==='incumbent'
    ?`<span class="lc-badge"><span class="lc-dot"></span>SIEC Certificate of Return</span><span class="lc-badge"><span class="lc-dot"></span>JAAC Member</span>${jaacAlloc?`<span class="lc-badge"><span class="lc-dot"></span>Alloc: ${esc(jaacAlloc)}</span>`:''}`
    :`<span class="lc-badge"><span class="lc-dot"></span>Former LGA Chairman</span>${siecRef?`<span class="lc-badge"><span class="lc-dot"></span>${esc(siecRef)}</span>`:''}`;
  const heroSubtitle=mode==='campaign'?`LGA Chairman Candidate — ${esc(lga)}`:mode==='incumbent'?`Chairman, ${esc(lga)} Local Government`:`Former Chairman, ${esc(lga)} LGA`;
  const defaultTagline=mode==='campaign'?`A new direction for ${esc(lga)}: grassroots development, transparent JAAC allocations, and accountable local governance.`:mode==='incumbent'?`Delivering grassroots development for ${esc(lga)} through transparent JAAC accountability and community-driven projects.`:`Proud to have served the people of ${esc(lga)} with commitment and transparency.`;
  const svcLabel=mode==='campaign'?'Development Agenda':mode==='incumbent'?'LGA Projects & Initiatives':'Legacy Projects';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const grid=featured.length===0?'':`<section class="lc-section"><h2 class="lc-section-title">${esc(svcLabel)}</h2><div class="lc-grid">${featured.map(o=>`<div class="lc-card"><h3 class="lc-card-name">${esc(o.name)}</h3>${o.description?`<p class="lc-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>${offerings.length>6?`<a href="/services" style="display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">View all →</a>`:''}</section>`;
  return `${CSS}
<section class="lc-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="lc-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="lc-subtitle">${heroSubtitle}</p>
  <p class="lc-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="lc-ctas">
    ${waHref&&mode==='campaign'?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="lc-primary-btn">${waSvg()} Join Campaign</a>`:`<a href="/services" class="lc-primary-btn">${mode==='incumbent'?'LGA Projects':'View Record'}</a>`}
    <a href="/contact" class="lc-sec-btn">Contact the Office</a>
  </div>
  <div class="lc-trust-strip">${trustBadges}</div>
</section>
${grid}
${bio?`<div class="lc-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone||placeName?`<div class="lc-info-strip">${placeName?`<div class="lc-info-item"><span class="lc-info-label">LGA</span><span class="lc-info-value">${esc(placeName)}</span></div>`:''} ${phone?`<div class="lc-info-item"><span class="lc-info-label">Chairman's Office</span><span class="lc-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="lc-info-item"><span class="lc-info-label">${mode==='campaign'?'Volunteer':'Enquiries'}</span><span class="lc-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const description=(ctx.data.description as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const siecRef=(ctx.data.siecCertRef as string|null)??null;
  const lga=placeName??'the LGA';
  const waHref=whatsappLink(phone,`Hello, I would like to contact the office of ${esc(ctx.displayName)}, LGA Chairman.`);
  const roleLabel=mode==='campaign'?`LGA Chairman Candidate — ${esc(lga)}`:mode==='incumbent'?`Chairman, ${esc(lga)} LGA`:`Former Chairman, ${esc(lga)} LGA`;
  const defaultDesc=mode==='campaign'?`${esc(ctx.displayName)} is seeking a mandate to lead ${esc(lga)} LGA, delivering transparent JAAC accountability, grassroots infrastructure, and community-driven governance.`:mode==='incumbent'?`${esc(ctx.displayName)} chairs ${esc(lga)} Local Government, elected via SIEC and accountable to the JAAC. Committed to grassroots development and transparent allocation management.`:`${esc(ctx.displayName)} served as Chairman of ${esc(lga)} LGA, delivering JAAC-monitored projects and grassroots development initiatives during tenure.`;
  return `${CSS}
<section class="lc-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="lc-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="lc-cat-badge">${esc(roleLabel)}</span>
</section>
<div class="lc-body">
  <p class="lc-desc">${description?esc(description):defaultDesc}</p>
  <div class="lc-details">
    ${party?`<div class="lc-drow"><span class="lc-dlabel">Party</span><span class="lc-dvalue">${esc(party)}</span></div>`:''}
    ${placeName?`<div class="lc-drow"><span class="lc-dlabel">LGA</span><span class="lc-dvalue">${esc(placeName)}</span></div>`:''}
    <div class="lc-drow"><span class="lc-dlabel">Election Body</span><span class="lc-dvalue">State Independent Electoral Commission (SIEC)</span></div>
    ${mode!=='campaign'?`<div class="lc-drow"><span class="lc-dlabel">Accountability</span><span class="lc-dvalue">JAAC (Joint Account Allocation Committee)</span></div>`:''}
    ${mode!=='campaign'&&siecRef?`<div class="lc-drow"><span class="lc-dlabel">SIEC Certificate</span><span class="lc-dvalue">${esc(siecRef)}</span></div>`:''}
    ${phone?`<div class="lc-drow"><span class="lc-dlabel">Office Phone</span><span class="lc-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="lc-drow"><span class="lc-dlabel">Official Site</span><span class="lc-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="lc-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="lc-wa-btn">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a>`:''}
    <a href="/contact" class="lc-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const lga=placeName??'the LGA';
  const waHref=whatsappLink(phone,`Hello, I would like to enquire about LGA projects in ${esc(lga)}.`);
  const pageTitle=mode==='campaign'?'Development Agenda':mode==='incumbent'?'LGA Projects & Initiatives':'Legacy Projects';
  const pageSubtitle=mode==='campaign'?`Grassroots development priorities and plans for ${esc(lga)} LGA`:mode==='incumbent'?`Active JAAC-funded projects and initiatives in ${esc(lga)} LGA`:`Projects delivered during the tenure of Chairman ${esc(ctx.displayName)}, ${esc(lga)} LGA`;
  const emptyMsg=mode==='campaign'?'Development agenda coming soon. Contact the campaign office.':mode==='incumbent'?'LGA project updates being published. Contact the Chairman\'s office.':'Legacy record being compiled.';
  const content=offerings.length===0?`<div class="lc-empty"><p>${esc(emptyMsg)}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="lc-wa-btn">${waSvg()} WhatsApp</a>`:`<br/><a class="lc-primary-btn" href="/contact">Contact the Office</a>`}</div>`
    :`<div class="lc-grid">${offerings.map(o=>`<div class="lc-card"><h3 class="lc-card-name">${esc(o.name)}</h3>${o.description?`<p class="lc-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="lc-svc-hero"><h1>${esc(pageTitle)}</h1><p class="lc-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="lc-cta-strip">
  <h3>${mode==='campaign'?'Support Local Development':'Community Liaison'}</h3>
  <p>${mode==='campaign'?`Help us win the mandate to deliver grassroots development for ${esc(lga)} LGA.`:`For JAAC project enquiries or community matters, reach the Chairman's office.`}</p>
  <div class="lc-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="lc-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="lc-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const lga=placeName??'our LGA';
  const waMsg=mode==='campaign'?`Hello, I want to volunteer for the LGA Chairman campaign of ${esc(ctx.displayName)}.`:`Hello, I am a resident reaching the office of ${mode==='incumbent'?'Chairman':'former Chairman'} ${esc(ctx.displayName)}, ${esc(lga)} LGA.`;
  const waHref=whatsappLink(phone,waMsg);
  return `${CSS}
<section class="lc-contact-hero">
  <h1>${mode==='campaign'?'Join the Campaign':'Contact the Office'}</h1>
  <p>${mode==='campaign'?`Support our vision for ${esc(lga)} LGA — volunteer, attend town halls, or reach our campaign office.`:mode==='incumbent'?`Reach the Chairman's office for community matters, JAAC project enquiries, or official correspondence.`:`Contact the team of former Chairman ${esc(ctx.displayName)}.`}</p>
</section>
${waHref?`<div class="lc-wa-block"><p>${mode==='campaign'?'Join our campaign volunteers on WhatsApp.':'Send a WhatsApp message to our office.'}</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="lc-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a></div>`:''}
<div class="lc-layout">
  <div class="lc-info">
    <h2>${mode==='incumbent'?`Chairman's Office — ${esc(lga)} LGA`:'Campaign Office'}</h2>
    ${placeName?`<p><strong>LGA:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Office contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">${mode==='campaign'?'Campaign conducted under SIEC guidelines.':'SIEC-elected office accountable to JAAC and the people.'}</p>
  </div>
  <div class="lc-form-wrap">
    <h2>Send a Message</h2>
    <form class="lc-form" method="POST" action="/contact" id="lcForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="lc-fg"><label for="lc-name">Your full name</label><input id="lc-name" name="name" type="text" required autocomplete="name" class="lc-input" placeholder="e.g. Fatima Bello" /></div>
      <div class="lc-fg"><label for="lc-phone">Phone number</label><input id="lc-phone" name="phone" type="tel" autocomplete="tel" class="lc-input" placeholder="0803 000 0000" /></div>
      <div class="lc-fg"><label for="lc-email">Email (optional)</label><input id="lc-email" name="email" type="email" class="lc-input" placeholder="you@example.com" /></div>
      <div class="lc-fg"><label for="lc-msg">${mode==='campaign'?'How would you like to help?':'Your message'}</label><textarea id="lc-msg" name="message" required rows="4" class="lc-input lc-ta" placeholder="${mode==='campaign'?'e.g. I want to canvass or attend a campaign rally.':'e.g. I have a question about an LGA project or community matter.'}"></textarea></div>
      <button type="submit" class="lc-submit">Send Message</button>
    </form>
    <div id="lcSuccess" class="lc-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>The Chairman's team will respond shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('lcForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('lcSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const lgaChairmanOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'lga-chairman-official-site',
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
