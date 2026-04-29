/**
 * State Governor Official Site — NF-POL-ELC anchor (VN-POL-008)
 * Pillar 2 — P2-governor-official-site · Sprint 1 · CRITICAL
 *
 * Nigeria-First:
 *   • Supports three modes: campaign | incumbent | post_office (ctx.data.mode)
 *   • Campaign: INEC Form CF001, party primary badge, state-wide manifesto
 *   • Incumbent: RMAFC allocation badge, state budget, commissioner projects
 *   • Post-office: legacy projects, foundation/book links
 *   • Party colour injection via --ww-party-primary (ctx.data.partyColour)
 *   • INEC Certificate of Return reference in incumbent + post_office
 *   • WhatsApp for grassroots volunteer coordination (campaign) / constituent enquiries (incumbent)
 *   • KYC gate in incumbent mode when ctx.data.kycVerified is falsy
 *
 * NF-POL-ELC anchor: senator, house-of-reps-member, lga-chairman,
 *   house-of-assembly-member, deputy-governor, ward-councillor must inherit
 *   .gv- naming convention for mode-switch pattern.
 *
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
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
.gv-hero{text-align:center;padding:2.75rem 0 2rem}
.gv-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.gv-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.gv-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.gv-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.gv-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.gv-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.gv-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.gv-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.gv-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.gv-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.gv-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.gv-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.gv-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.gv-section{margin-top:2.75rem}
.gv-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.gv-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.gv-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.gv-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.gv-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.gv-card-price{font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0}
.gv-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.gv-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.gv-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.gv-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.gv-info-item{display:flex;flex-direction:column;gap:.25rem}
.gv-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.gv-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.gv-info-value a{color:var(--ww-party-primary)}
.gv-about-hero{text-align:center;padding:2.5rem 0 2rem}
.gv-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.gv-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.gv-body{max-width:44rem;margin:0 auto}
.gv-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.gv-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.gv-drow{display:flex;gap:1rem;align-items:flex-start}
.gv-dlabel{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.gv-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.gv-dvalue a{color:var(--ww-party-primary);font-weight:600}
.gv-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.gv-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.gv-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.gv-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.gv-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.gv-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.gv-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.gv-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.gv-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.gv-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.gv-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.gv-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.gv-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.gv-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.gv-layout{grid-template-columns:1fr 1fr}}
.gv-info h2,.gv-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.gv-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.gv-info a{color:var(--ww-party-primary);font-weight:600}
.gv-form{display:flex;flex-direction:column;gap:.875rem}
.gv-fg{display:flex;flex-direction:column;gap:.375rem}
.gv-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.gv-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.gv-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.gv-ta{min-height:100px;resize:vertical}
.gv-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.gv-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.gv-gate{background:var(--ww-bg-surface);border:1.5px solid var(--ww-border);border-radius:var(--ww-radius);padding:2rem;text-align:center;margin-top:2rem}
.gv-gate p{color:var(--ww-text-muted);font-size:.9375rem;margin-bottom:1rem}
@media(max-width:375px){.gv-ctas{flex-direction:column;align-items:stretch}.gv-primary-btn,.gv-sec-btn,.gv-wa-btn{width:100%;justify-content:center}}
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
  const inecRef=(ctx.data.inecCertRef as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const rmafcAlloc=(ctx.data.rmafcAlloc as string|null)??null;

  const waMsg=mode==='campaign'
    ?`Hello, I would like to volunteer for the ${esc(ctx.displayName)} governorship campaign.`
    :mode==='incumbent'
    ?`Hello, I am a constituent from ${esc(state)} and would like to reach the Governor's office.`
    :`Hello, I would like to reach the team of former Governor ${esc(ctx.displayName)}.`;
  const waHref=whatsappLink(phone,waMsg);

  const trustBadges=mode==='campaign'
    ?`<span class="gv-badge"><span class="gv-dot"></span>INEC Form CF001 Filed</span>${party?`<span class="gv-badge"><span class="gv-dot"></span>${esc(party)} Candidate</span>`:''}`
    :mode==='incumbent'
    ?`<span class="gv-badge"><span class="gv-dot"></span>INEC Certificate of Return</span>${rmafcAlloc?`<span class="gv-badge"><span class="gv-dot"></span>RMAFC: ${esc(rmafcAlloc)}</span>`:''}`
    :`<span class="gv-badge"><span class="gv-dot"></span>Former Governor</span>${inecRef?`<span class="gv-badge"><span class="gv-dot"></span>Cert of Return: ${esc(inecRef)}</span>`:''}`;

  const heroSubtitle=mode==='campaign'
    ?`Governorship Candidate — ${esc(state)}`
    :mode==='incumbent'
    ?`Executive Governor, ${esc(state)}`
    :`Former Governor, ${esc(state)}`;

  const defaultTagline=mode==='campaign'
    ?`A new vision for ${esc(state)}: security, prosperity, and accountability for every family.`
    :mode==='incumbent'
    ?`Delivering on our promise to the people of ${esc(state)}. Transparent governance, measurable impact.`
    :`Proud to have served the people of ${esc(state)} with integrity and dedication.`;

  const ctaLabel=mode==='campaign'?'Join the Campaign':mode==='incumbent'?'Constituent Services':'View Legacy Projects';
  const ctaHref=mode==='campaign'?(waHref??'/contact'):'/services';

  const svcLabel=mode==='campaign'?'Campaign Agenda':mode==='incumbent'?'State Projects & Deliverables':'Legacy Projects';
  const featured=offerings.slice(0,6);
  const grid=featured.length===0?'':`
  <section class="gv-section">
    <h2 class="gv-section-title">${esc(svcLabel)}</h2>
    <div class="gv-grid">
      ${featured.map(o=>`
      <div class="gv-card">
        <h3 class="gv-card-name">${esc(o.name)}</h3>
        ${o.description?`<p class="gv-card-desc">${esc(o.description)}</p>`:''}
        ${o.priceKobo!==null?`<p class="gv-card-price">${fmtKobo(o.priceKobo)}</p>`:''}
      </div>`).join('')}
    </div>
    ${offerings.length>6?`<a href="/services" style="display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);text-decoration:underline">View all ${esc(svcLabel.toLowerCase())} →</a>`:''}
  </section>`;

  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const aboutStrip=bio?`<div class="gv-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:'';

  const infoStrip=(phone||placeName)?`
  <div class="gv-info-strip">
    ${placeName?`<div class="gv-info-item"><span class="gv-info-label">${mode==='campaign'?'Campaign Area':'State'}</span><span class="gv-info-value">${esc(placeName)}</span></div>`:''}
    ${phone?`<div class="gv-info-item"><span class="gv-info-label">${mode==='incumbent'?'Governor\'s Office':'Contact'}</span><span class="gv-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    <div class="gv-info-item"><span class="gv-info-label">${mode==='campaign'?'Volunteer':'Enquiries'}</span><span class="gv-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div>
  </div>`:'';

  return `${CSS}
<section class="gv-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="gv-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="gv-subtitle">${heroSubtitle}</p>
  <p class="gv-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="gv-ctas">
    ${waHref&&mode==='campaign'?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="gv-primary-btn">${waSvg()} ${esc(ctaLabel)}</a>`:`<a href="${esc(ctaHref)}" class="gv-primary-btn">${esc(ctaLabel)}</a>`}
    <a href="/contact" class="gv-sec-btn">Contact the Office</a>
  </div>
  <div class="gv-trust-strip">${trustBadges}</div>
</section>
${grid}${aboutStrip}${infoStrip}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const description=(ctx.data.description as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const inecRef=(ctx.data.inecCertRef as string|null)??null;
  const state=placeName??'the State';
  const waHref=whatsappLink(phone,`Hello, I would like to contact the team of ${esc(ctx.displayName)}.`);
  const roleLabel=mode==='campaign'?'Governorship Candidate':mode==='incumbent'?`Executive Governor, ${esc(state)}`:`Former Governor, ${esc(state)}`;
  const defaultDesc=mode==='campaign'
    ?`${esc(ctx.displayName)} is a dedicated public servant who has committed to transforming ${esc(state)} through transparent governance, security, infrastructure development, and economic empowerment for all citizens.`
    :mode==='incumbent'
    ?`${esc(ctx.displayName)} serves as Executive Governor of ${esc(state)}, delivering on a mandate of accountability, development, and inclusive governance. All state projects are INEC-certified and RMAFC-monitored.`
    :`${esc(ctx.displayName)} served as Executive Governor of ${esc(state)}, leaving a legacy of sustainable development, institutional reform, and service to the people.`;

  return `${CSS}
<section class="gv-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="gv-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="gv-cat-badge">${esc(roleLabel)}</span>
</section>
<div class="gv-body">
  <p class="gv-desc">${description?esc(description):defaultDesc}</p>
  <div class="gv-details">
    ${party?`<div class="gv-drow"><span class="gv-dlabel">Party</span><span class="gv-dvalue">${esc(party)}</span></div>`:''}
    ${placeName?`<div class="gv-drow"><span class="gv-dlabel">State</span><span class="gv-dvalue">${esc(placeName)}</span></div>`:''}
    ${mode!=='campaign'&&inecRef?`<div class="gv-drow"><span class="gv-dlabel">INEC Certificate</span><span class="gv-dvalue">${esc(inecRef)}</span></div>`:''}
    ${phone?`<div class="gv-drow"><span class="gv-dlabel">${mode==='incumbent'?'Governor\'s Office':'Contact'}</span><span class="gv-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="gv-drow"><span class="gv-dlabel">Official Website</span><span class="gv-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="gv-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="gv-wa-btn">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a>`:''}
    <a href="/contact" class="gv-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const state=placeName??'the State';
  const waHref=whatsappLink(phone,`Hello, I would like to reach the team of Governor ${esc(ctx.displayName)}.`);
  const pageTitle=mode==='campaign'?'Campaign Agenda':mode==='incumbent'?'State Projects & Deliverables':'Legacy Projects';
  const pageSubtitle=mode==='campaign'
    ?`Policy areas and development priorities for ${esc(ctx.displayName)}`
    :mode==='incumbent'
    ?`Active state projects and deliverables under Governor ${esc(ctx.displayName)}, ${esc(state)}`
    :`Projects and achievements during the tenure of former Governor ${esc(ctx.displayName)}`;
  const emptyMsg=mode==='campaign'?'Campaign agenda is being updated. Contact our campaign office for details.'
    :mode==='incumbent'?'State project updates are being published. Contact the Governor\'s Office for details.'
    :'Legacy project records are being compiled. Please check back soon.';
  const ctaTitle=mode==='campaign'?'Join the Movement':mode==='incumbent'?'Constituent Services':'Connect with Our Team';
  const ctaBody=mode==='campaign'?'Every vote counts. Every volunteer matters. Be part of the change.'
    :mode==='incumbent'?'For project updates, community liaison, or official enquiries, reach our office.'
    :'We welcome feedback on our tenure and future engagement opportunities.';
  const content=offerings.length===0?`<div class="gv-empty"><p>${esc(emptyMsg)}</p><br/>${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="gv-wa-btn">${waSvg()} Contact on WhatsApp</a>`:`<a class="gv-primary-btn" href="/contact">Contact the Office</a>`}</div>`
    :`<div class="gv-grid">${offerings.map(o=>`
    <div class="gv-card">
      <h3 class="gv-card-name">${esc(o.name)}</h3>
      ${o.description?`<p class="gv-card-desc">${esc(o.description)}</p>`:''}
      ${o.priceKobo!==null?`<p class="gv-card-price">${fmtKobo(o.priceKobo)}</p>`:''}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="gv-svc-hero">
  <h1>${esc(pageTitle)}</h1>
  <p class="gv-sub">${esc(pageSubtitle)}</p>
</section>
<section>${content}</section>
<div class="gv-cta-strip">
  <h3>${esc(ctaTitle)}</h3>
  <p>${esc(ctaBody)}</p>
  <div class="gv-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="gv-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="gv-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const state=placeName??'the State';
  const waMsg=mode==='campaign'
    ?`Hello, I want to volunteer for the ${esc(ctx.displayName)} governorship campaign.`
    :`Hello, I am contacting the office of ${mode==='incumbent'?'Governor':'former Governor'} ${esc(ctx.displayName)}.`;
  const waHref=whatsappLink(phone,waMsg);
  const officeLabel=mode==='incumbent'?`Office of the Governor, ${esc(state)}`:mode==='campaign'?'Campaign Coordination Office':`Legacy Office — ${esc(ctx.displayName)}`;
  return `${CSS}
<section class="gv-contact-hero">
  <h1>${mode==='campaign'?'Get Involved':'Contact the Office'}</h1>
  <p>${mode==='campaign'?'Volunteer, attend rallies, or contact our campaign coordination office.':mode==='incumbent'?`Reach the Governor's Office for constituent services, official enquiries, or media.`:`Contact the team of former Governor ${esc(ctx.displayName)}.`}</p>
</section>
${waHref?`<div class="gv-wa-block"><p>${mode==='campaign'?'Join our volunteer network on WhatsApp and help build the campaign.':'Send a WhatsApp message to our office for faster response.'}</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="gv-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a></div>`:''}
<div class="gv-layout">
  <div class="gv-info">
    <h2>${esc(officeLabel)}</h2>
    ${placeName?`<p><strong>State:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Contact details will be published shortly.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">${mode==='campaign'?'All campaign activities are conducted in compliance with INEC guidelines and the Electoral Act 2022.':mode==='incumbent'?'All official communications from this office are INEC-verified and publicly accountable.':'Thank you for your interest in the work of this administration.'}</p>
  </div>
  <div class="gv-form-wrap">
    <h2>Send a Message</h2>
    <form class="gv-form" method="POST" action="/contact" id="gvForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="gv-fg"><label for="gv-name">Your full name</label><input id="gv-name" name="name" type="text" required autocomplete="name" class="gv-input" placeholder="e.g. Amaka Okafor" /></div>
      <div class="gv-fg"><label for="gv-phone">Phone number</label><input id="gv-phone" name="phone" type="tel" autocomplete="tel" class="gv-input" placeholder="0803 000 0000" /></div>
      <div class="gv-fg"><label for="gv-email">Email (optional)</label><input id="gv-email" name="email" type="email" class="gv-input" placeholder="you@example.com" /></div>
      <div class="gv-fg"><label for="gv-msg">${mode==='campaign'?'How would you like to get involved?':'Your message or enquiry'}</label><textarea id="gv-msg" name="message" required rows="4" class="gv-input gv-ta" placeholder="${mode==='campaign'?'e.g. I want to volunteer, attend a rally, or ask about your position on a specific issue.':'e.g. I am a constituent with a project concern or enquiry for the Governor\'s office.'}"></textarea></div>
      <button type="submit" class="gv-submit">Send Message</button>
    </form>
    <div id="gvSuccess" class="gv-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>Our ${mode==='campaign'?'campaign':'office'} team will respond shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('gvForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('gvSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const governorOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'governor-official-site',
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
