/**
 * Party Chapter Officer (Ward/LGA) Official Site — NF-POL-PTY anchor (VN-POL-018)
 * Pillar 2 — P2-party-chapter-officer-official-site · Sprint 3
 *
 * Nigeria-First:
 *   • Party internal appointment — ward or LGA chapter level
 *   • DIFFERENTIATE from vtx_political_party (individual vs organisation)
 *   • Two modes: active | post_office (party roles don't campaign in INEC sense)
 *   • Party mobilisation, membership drive, ward coordination
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

type PartyMode='active'|'post_office';
function getMode(ctx:WebsiteRenderContext):PartyMode{
  const m=ctx.data?.mode as string|undefined;
  if(m==='post_office')return 'post_office';
  return 'active';
}

const CSS=`<style>
:root{--ww-party-primary:var(--ww-primary)}
.pch-hero{text-align:center;padding:2.75rem 0 2rem}
.pch-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.pch-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.pch-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.pch-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.pch-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pch-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.pch-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.pch-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.pch-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.pch-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.pch-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.pch-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.pch-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.pch-section{margin-top:2.75rem}
.pch-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.pch-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.pch-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.pch-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.pch-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.pch-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pch-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.pch-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.pch-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.pch-info-item{display:flex;flex-direction:column;gap:.25rem}
.pch-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pch-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.pch-info-value a{color:var(--ww-party-primary)}
.pch-about-hero{text-align:center;padding:2.5rem 0 2rem}
.pch-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.pch-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.pch-body{max-width:44rem;margin:0 auto}
.pch-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.pch-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.pch-drow{display:flex;gap:1rem;align-items:flex-start}
.pch-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.pch-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.pch-dvalue a{color:var(--ww-party-primary);font-weight:600}
.pch-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pch-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.pch-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pch-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.pch-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.pch-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.pch-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.pch-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.pch-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.pch-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pch-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.pch-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.pch-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.pch-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.pch-layout{grid-template-columns:1fr 1fr}}
.pch-info h2,.pch-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.pch-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.pch-info a{color:var(--ww-party-primary);font-weight:600}
.pch-form{display:flex;flex-direction:column;gap:.875rem}
.pch-fg{display:flex;flex-direction:column;gap:.375rem}
.pch-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.pch-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.pch-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.pch-ta{min-height:100px;resize:vertical}
.pch-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.pch-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
@media(max-width:375px){.pch-ctas{flex-direction:column;align-items:stretch}.pch-primary-btn,.pch-sec-btn,.pch-wa-btn{width:100%;justify-content:center}}
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
  const party=(ctx.data.party as string|null)??null;
  const partyTitle=(ctx.data.partyTitle as string|null)??null;
  const chapterLevel=(ctx.data.chapterLevel as string|null)??null;
  const displayTitle=partyTitle??'Chapter Officer';
  const waMsg=mode==='active'?`Hello, I would like to contact ${esc(displayTitle)} ${esc(ctx.displayName)} about party matters.`:`Hello, I would like to reach the team of former ${esc(displayTitle)} ${esc(ctx.displayName)}.`;
  const waHref=whatsappLink(phone,waMsg);
  const heroSubtitle=`${mode==='active'?esc(displayTitle):`Former ${esc(displayTitle)}`}${party?`, ${esc(party)}`:''}${chapterLevel?` — ${esc(chapterLevel)} Chapter`:''}`;
  const defaultTagline=mode==='active'?`Building a stronger party chapter: membership growth, mobilisation, and grassroots party development.`:`Proud to have led this party chapter with commitment to our party's values and objectives.`;
  const trustBadges=`<span class="pch-badge"><span class="pch-dot"></span>${party?`${esc(party)} Chapter Officer`:'Party Chapter Officer'}</span>${chapterLevel?`<span class="pch-badge"><span class="pch-dot"></span>${esc(chapterLevel)}</span>`:''}`;
  const svcLabel=mode==='active'?'Chapter Activities & Initiatives':'Chapter Record';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const grid=featured.length===0?'':`<section class="pch-section"><h2 class="pch-section-title">${esc(svcLabel)}</h2><div class="pch-grid">${featured.map(o=>`<div class="pch-card"><h3 class="pch-card-name">${esc(o.name)}</h3>${o.description?`<p class="pch-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div></section>`;
  return `${CSS}
<section class="pch-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pch-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="pch-subtitle">${heroSubtitle}</p>
  <p class="pch-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="pch-ctas">
    ${waHref&&mode==='active'?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pch-primary-btn">${waSvg()} Join Chapter</a>`:`<a href="/services" class="pch-primary-btn">${mode==='active'?'Chapter Activities':'View Record'}</a>`}
    <a href="/contact" class="pch-sec-btn">Contact the Officer</a>
  </div>
  <div class="pch-trust-strip">${trustBadges}</div>
</section>
${grid}
${bio?`<div class="pch-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone||placeName?`<div class="pch-info-strip">${party?`<div class="pch-info-item"><span class="pch-info-label">Party</span><span class="pch-info-value">${esc(party)}</span></div>`:''} ${placeName?`<div class="pch-info-item"><span class="pch-info-label">Chapter</span><span class="pch-info-value">${esc(placeName)}</span></div>`:''} ${phone?`<div class="pch-info-item"><span class="pch-info-label">Phone</span><span class="pch-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="pch-info-item"><span class="pch-info-label">WhatsApp</span><span class="pch-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">Join on WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const description=(ctx.data.description as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const partyTitle=(ctx.data.partyTitle as string|null)??null;
  const chapterLevel=(ctx.data.chapterLevel as string|null)??null;
  const displayTitle=partyTitle??'Chapter Officer';
  const waHref=whatsappLink(phone,`Hello, I would like to contact ${esc(displayTitle)} ${esc(ctx.displayName)}.`);
  const roleLabel=`${mode==='active'?esc(displayTitle):`Former ${esc(displayTitle)}`}${party?`, ${esc(party)}`:''}${chapterLevel?` — ${esc(chapterLevel)}`:''}`;
  const defaultDesc=mode==='active'?`${esc(ctx.displayName)} serves as ${esc(displayTitle)}${party?` of ${esc(party)}`:''}${chapterLevel?` at the ${esc(chapterLevel)} level`:''}. Responsible for party mobilisation, membership coordination, and chapter governance.`:`${esc(ctx.displayName)} served as ${esc(displayTitle)}${party?` of ${esc(party)}`:''}${chapterLevel?` at the ${esc(chapterLevel)} level`:''}, delivering strong party chapter coordination and membership growth.`;
  return `${CSS}
<section class="pch-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pch-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="pch-cat-badge">${roleLabel}</span>
</section>
<div class="pch-body">
  <p class="pch-desc">${description?esc(description):defaultDesc}</p>
  <div class="pch-details">
    ${partyTitle?`<div class="pch-drow"><span class="pch-dlabel">Title</span><span class="pch-dvalue">${esc(partyTitle)}</span></div>`:''}
    ${party?`<div class="pch-drow"><span class="pch-dlabel">Party</span><span class="pch-dvalue">${esc(party)}</span></div>`:''}
    ${chapterLevel?`<div class="pch-drow"><span class="pch-dlabel">Chapter Level</span><span class="pch-dvalue">${esc(chapterLevel)}</span></div>`:''}
    ${placeName?`<div class="pch-drow"><span class="pch-dlabel">Chapter Area</span><span class="pch-dvalue">${esc(placeName)}</span></div>`:''}
    ${phone?`<div class="pch-drow"><span class="pch-dlabel">Phone</span><span class="pch-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="pch-drow"><span class="pch-dlabel">Party Website</span><span class="pch-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="pch-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pch-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="pch-sec-btn">Contact the Officer</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const waHref=whatsappLink(phone,`Hello, I would like to enquire about chapter activities.`);
  const pageTitle=mode==='active'?'Chapter Activities':'Chapter Record';
  const pageSubtitle=mode==='active'?`Ongoing party mobilisation, membership drives, and chapter initiatives${party?` — ${esc(party)}`:''}`:`Record of chapter activities and achievements during this term`;
  const content=offerings.length===0?`<div class="pch-empty"><p>${mode==='active'?'Chapter activities are being updated.':'Chapter record being compiled.'}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pch-wa-btn">${waSvg()} WhatsApp</a>`:`<br/><a class="pch-primary-btn" href="/contact">Contact</a>`}</div>`
    :`<div class="pch-grid">${offerings.map(o=>`<div class="pch-card"><h3 class="pch-card-name">${esc(o.name)}</h3>${o.description?`<p class="pch-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="pch-svc-hero"><h1>${esc(pageTitle)}</h1><p class="pch-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="pch-cta-strip">
  <h3>${mode==='active'?'Join the Chapter':'Connect with Our Team'}</h3>
  <p>${mode==='active'?'Become an active member of our party chapter and contribute to building a stronger party.':'For information about our chapter\'s work, reach our team.'}</p>
  <div class="pch-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pch-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="pch-sec-btn">Contact</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const partyTitle=(ctx.data.partyTitle as string|null)??null;
  const displayTitle=partyTitle??'Chapter Officer';
  const waHref=whatsappLink(phone,`Hello, I would like to join or contact the ${esc(party??'party')} chapter coordinated by ${esc(displayTitle)} ${esc(ctx.displayName)}.`);
  return `${CSS}
<section class="pch-contact-hero">
  <h1>Contact the Officer</h1>
  <p>${mode==='active'?`Reach ${esc(displayTitle)} ${esc(ctx.displayName)} for party membership, chapter activities, or enquiries.`:`Contact the team of former ${esc(displayTitle)} ${esc(ctx.displayName)}.`}</p>
</section>
${waHref?`<div class="pch-wa-block"><p>${mode==='active'?'Join our party chapter on WhatsApp.':'Send a WhatsApp message to reach our team.'}</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pch-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp</a></div>`:''}
<div class="pch-layout">
  <div class="pch-info">
    <h2>${esc(ctx.displayName)} — ${esc(displayTitle)}</h2>
    ${party?`<p><strong>Party:</strong> ${esc(party)}</p>`:''}
    ${placeName?`<p><strong>Chapter:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Contact details coming soon.</p>`:''}
  </div>
  <div class="pch-form-wrap">
    <h2>Send a Message</h2>
    <form class="pch-form" method="POST" action="/contact" id="pchForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pch-fg"><label for="pch-name">Your full name</label><input id="pch-name" name="name" type="text" required autocomplete="name" class="pch-input" placeholder="e.g. Adamu Suleiman" /></div>
      <div class="pch-fg"><label for="pch-phone">Phone number</label><input id="pch-phone" name="phone" type="tel" autocomplete="tel" class="pch-input" placeholder="0803 000 0000" /></div>
      <div class="pch-fg"><label for="pch-email">Email (optional)</label><input id="pch-email" name="email" type="email" class="pch-input" placeholder="you@example.com" /></div>
      <div class="pch-fg"><label for="pch-msg">Your message</label><textarea id="pch-msg" name="message" required rows="4" class="pch-input pch-ta" placeholder="e.g. I want to join the chapter, attend an event, or ask about party membership."></textarea></div>
      <button type="submit" class="pch-submit">Send Message</button>
    </form>
    <div id="pchSuccess" class="pch-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>Our party team will respond shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('pchForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('pchSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const partyChapterOfficerOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'party-chapter-officer-official-site',
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
