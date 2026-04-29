/**
 * Assembly Speaker Official Site — NF-POL-ELC variant (VN-POL-022)
 * Pillar 2 — P2-assembly-speaker-official-site · Sprint 4
 *
 * Nigeria-First:
 *   • Speaker of State House of Assembly — elected by assembly members (SIEC supervised)
 *   • Presides over legislative chamber; also holds LGA-level: LGA legislative council speaker
 *   • Three modes: campaign | incumbent | post_office
 *   • CSS prefix: .asp-
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
.asp-hero{text-align:center;padding:2.75rem 0 2rem}
.asp-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.asp-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.asp-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.asp-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.asp-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.asp-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.asp-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.asp-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.asp-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.asp-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.asp-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.asp-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.asp-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.asp-section{margin-top:2.75rem}
.asp-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.asp-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.asp-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.asp-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.asp-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.asp-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.asp-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.asp-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.asp-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.asp-info-item{display:flex;flex-direction:column;gap:.25rem}
.asp-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.asp-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.asp-info-value a{color:var(--ww-party-primary)}
.asp-about-hero{text-align:center;padding:2.5rem 0 2rem}
.asp-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.asp-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.asp-body{max-width:44rem;margin:0 auto}
.asp-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.asp-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.asp-drow{display:flex;gap:1rem;align-items:flex-start}
.asp-dlabel{font-size:.875rem;font-weight:700;min-width:9rem;color:var(--ww-text);flex-shrink:0}
.asp-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.asp-dvalue a{color:var(--ww-party-primary);font-weight:600}
.asp-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.asp-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.asp-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.asp-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.asp-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.asp-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.asp-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.asp-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.asp-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.asp-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.asp-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.asp-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.asp-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.asp-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.asp-layout{grid-template-columns:1fr 1fr}}
.asp-info h2,.asp-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.asp-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.asp-info a{color:var(--ww-party-primary);font-weight:600}
.asp-form{display:flex;flex-direction:column;gap:.875rem}
.asp-fg{display:flex;flex-direction:column;gap:.375rem}
.asp-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.asp-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.asp-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.asp-ta{min-height:100px;resize:vertical}
.asp-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.asp-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
@media(max-width:375px){.asp-ctas{flex-direction:column;align-items:stretch}.asp-primary-btn,.asp-sec-btn,.asp-wa-btn{width:100%;justify-content:center}}
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
  const assemblyName=(ctx.data.assemblyName as string|null)??null;
  const assembly=assemblyName??'State House of Assembly';
  const location=placeName??'the State';
  const waMsg=mode==='campaign'?`Hello, I want to support the Speakership campaign of ${esc(ctx.displayName)}.`:`Hello, I would like to reach the office of Rt. Hon. ${esc(ctx.displayName)}, Speaker.`;
  const waHref=whatsappLink(phone,waMsg);
  const heroSubtitle=mode==='campaign'
    ?`Speakership Candidate — ${esc(assembly)}`
    :mode==='incumbent'
    ?`Speaker, ${esc(assembly)}, ${esc(location)}`
    :`Former Speaker, ${esc(assembly)}, ${esc(location)}`;
  const defaultTagline=mode==='campaign'
    ?`Seeking the Speakership mandate to lead ${esc(assembly)} with fairness, legislative excellence, and bipartisan consensus.`
    :mode==='incumbent'
    ?`Presiding over ${esc(assembly)} with order, impartiality, and a commitment to landmark legislation for ${esc(location)}.`
    :`Honoured to have presided over ${esc(assembly)} — advancing legislation and upholding the rule of law.`;
  const trustBadges=mode==='campaign'
    ?`<span class="asp-badge"><span class="asp-dot"></span>Speakership Candidate</span>${party?`<span class="asp-badge"><span class="asp-dot"></span>${esc(party)}</span>`:''}`
    :mode==='incumbent'
    ?`<span class="asp-badge"><span class="asp-dot"></span>Elected Speaker</span><span class="asp-badge"><span class="asp-dot"></span>${esc(assembly)}</span>`
    :`<span class="asp-badge"><span class="asp-dot"></span>Former Speaker</span><span class="asp-badge"><span class="asp-dot"></span>${esc(assembly)}</span>`;
  const svcLabel=mode==='campaign'?'Legislative Agenda':mode==='incumbent'?'Assembly Bills & Resolutions':'Speakership Record';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const grid=featured.length===0?'':`<section class="asp-section"><h2 class="asp-section-title">${esc(svcLabel)}</h2><div class="asp-grid">${featured.map(o=>`<div class="asp-card"><h3 class="asp-card-name">${esc(o.name)}</h3>${o.description?`<p class="asp-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div></section>`;
  return `${CSS}
<section class="asp-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="asp-logo" />`:''}
  <h1>${mode!=='campaign'?`Rt. Hon. ${esc(ctx.displayName)}`:esc(ctx.displayName)}</h1>
  <p class="asp-subtitle">${heroSubtitle}</p>
  <p class="asp-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="asp-ctas">
    <a href="/services" class="asp-primary-btn">${mode==='campaign'?'Legislative Agenda':mode==='incumbent'?'Assembly Matters':'View Record'}</a>
    <a href="/contact" class="asp-sec-btn">${mode==='campaign'?'Contact Campaign':'Contact the Speaker'}</a>
  </div>
  <div class="asp-trust-strip">${trustBadges}</div>
</section>
${grid}
${bio?`<div class="asp-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone||placeName?`<div class="asp-info-strip">${placeName?`<div class="asp-info-item"><span class="asp-info-label">State</span><span class="asp-info-value">${esc(placeName)}</span></div>`:''} ${assemblyName?`<div class="asp-info-item"><span class="asp-info-label">Assembly</span><span class="asp-info-value">${esc(assemblyName)}</span></div>`:''} ${phone?`<div class="asp-info-item"><span class="asp-info-label">${mode==='campaign'?'Campaign':'Office'}</span><span class="asp-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="asp-info-item"><span class="asp-info-label">WhatsApp</span><span class="asp-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">${mode==='campaign'?'Support Campaign →':'Chat →'}</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const description=(ctx.data.description as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const assemblyName=(ctx.data.assemblyName as string|null)??null;
  const assembly=assemblyName??'State House of Assembly';
  const location=placeName??'the State';
  const waHref=whatsappLink(phone,`Hello, I would like to contact the office of Rt. Hon. ${esc(ctx.displayName)}, Speaker.`);
  const roleLabel=mode==='campaign'?`Speakership Candidate, ${esc(assembly)}`:mode==='incumbent'?`Speaker, ${esc(assembly)}`:`Former Speaker, ${esc(assembly)}`;
  const defaultDesc=mode==='campaign'
    ?`${esc(ctx.displayName)} is seeking the Speakership of ${esc(assembly)}, pledging fair presiding of sessions, robust legislative output, and cross-party collaboration for the benefit of ${esc(location)}.`
    :mode==='incumbent'
    ?`Rt. Hon. ${esc(ctx.displayName)} presides over ${esc(assembly)} as Speaker, ensuring orderly legislative proceedings, fair representation of members, and passage of impactful laws for ${esc(location)}.`
    :`Rt. Hon. ${esc(ctx.displayName)} served as Speaker of ${esc(assembly)}, presiding over legislative sessions and overseeing the passage of landmark bills for ${esc(location)}.`;
  return `${CSS}
<section class="asp-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="asp-logo" />`:''}
  <h1>${mode!=='campaign'?`Rt. Hon. ${esc(ctx.displayName)}`:esc(ctx.displayName)}</h1>
  <span class="asp-cat-badge">${roleLabel}</span>
</section>
<div class="asp-body">
  <p class="asp-desc">${description?esc(description):defaultDesc}</p>
  <div class="asp-details">
    ${party?`<div class="asp-drow"><span class="asp-dlabel">Party</span><span class="asp-dvalue">${esc(party)}</span></div>`:''}
    ${placeName?`<div class="asp-drow"><span class="asp-dlabel">State</span><span class="asp-dvalue">${esc(placeName)}</span></div>`:''}
    <div class="asp-drow"><span class="asp-dlabel">Assembly</span><span class="asp-dvalue">${esc(assembly)}</span></div>
    <div class="asp-drow"><span class="asp-dlabel">Election</span><span class="asp-dvalue">Elected by assembly members</span></div>
    ${phone?`<div class="asp-drow"><span class="asp-dlabel">Phone</span><span class="asp-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
  </div>
  <div class="asp-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="asp-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="asp-sec-btn">${mode==='campaign'?'Contact Campaign':'Contact the Speaker'}</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const assemblyName=(ctx.data.assemblyName as string|null)??null;
  const assembly=assemblyName??'State House of Assembly';
  const waHref=whatsappLink(phone,`Hello, I would like to enquire about the ${esc(assembly)} legislative record under Speaker ${esc(ctx.displayName)}.`);
  const pageTitle=mode==='campaign'?'Legislative Agenda':mode==='incumbent'?'Assembly Bills & Resolutions':'Speakership Record';
  const pageSubtitle=mode==='campaign'?`Legislative priorities for the ${esc(assembly)} under ${esc(ctx.displayName)}`:`Bills, resolutions, and legislative milestones${mode==='incumbent'?` under Speaker ${esc(ctx.displayName)}`:''}`;
  const emptyMsg=mode==='campaign'?'Legislative agenda coming soon.':mode==='incumbent'?'Assembly matters being published.':'Record being compiled.';
  const content=offerings.length===0?`<div class="asp-empty"><p>${esc(emptyMsg)}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="asp-wa-btn">${waSvg()} WhatsApp</a>`:`<br/><a class="asp-primary-btn" href="/contact">Contact</a>`}</div>`
    :`<div class="asp-grid">${offerings.map(o=>`<div class="asp-card"><h3 class="asp-card-name">${esc(o.name)}</h3>${o.description?`<p class="asp-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="asp-svc-hero"><h1>${esc(pageTitle)}</h1><p class="asp-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="asp-cta-strip">
  <h3>${mode==='campaign'?'Support the Speakership Bid':'Engage the Speaker\'s Office'}</h3>
  <p>${mode==='campaign'?`Back ${esc(ctx.displayName)} for a fair, productive ${esc(assembly)}.`:`For legislative enquiries, media, or stakeholder engagement, reach the Speaker's office.`}</p>
  <div class="asp-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="asp-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="asp-sec-btn">${mode==='campaign'?'Contact Campaign':'Contact the Speaker'}</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const assemblyName=(ctx.data.assemblyName as string|null)??null;
  const assembly=assemblyName??'State House of Assembly';
  const location=placeName??'the State';
  const waHref=whatsappLink(phone,`Hello, I would like to contact ${mode==='campaign'?'the campaign of':'the office of Speaker'} ${esc(ctx.displayName)}.`);
  return `${CSS}
<section class="asp-contact-hero">
  <h1>${mode==='campaign'?'Contact the Campaign':'Contact the Speaker\'s Office'}</h1>
  <p>${mode==='campaign'?`Reach the Speakership campaign of ${esc(ctx.displayName)} — ${esc(assembly)}.`:mode==='incumbent'?`Reach the office of Speaker Rt. Hon. ${esc(ctx.displayName)}, ${esc(assembly)}, for legislative enquiries or official matters.`:`Contact the team of former Speaker ${esc(ctx.displayName)}, ${esc(assembly)}.`}</p>
</section>
${waHref?`<div class="asp-wa-block"><p>${mode==='campaign'?'Connect with our campaign.':'Send a WhatsApp message to the Speaker\'s office.'}</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="asp-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp</a></div>`:''}
<div class="asp-layout">
  <div class="asp-info">
    <h2>${mode==='campaign'?`Speakership Campaign — ${esc(assembly)}`:`Speaker's Office — ${esc(assembly)}`}</h2>
    ${placeName?`<p><strong>State:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">${mode==='incumbent'?`Speaker ${esc(ctx.displayName)} presides over the ${esc(assembly)} and is accountable to the people of ${esc(location)}.`:''}</p>
  </div>
  <div class="asp-form-wrap">
    <h2>Send a Message</h2>
    <form class="asp-form" method="POST" action="/contact" id="aspForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="asp-fg"><label for="asp-name">Your full name</label><input id="asp-name" name="name" type="text" required autocomplete="name" class="asp-input" placeholder="e.g. Maryam Suleiman" /></div>
      <div class="asp-fg"><label for="asp-phone">Phone number</label><input id="asp-phone" name="phone" type="tel" autocomplete="tel" class="asp-input" placeholder="0803 000 0000" /></div>
      <div class="asp-fg"><label for="asp-email">Email (optional)</label><input id="asp-email" name="email" type="email" class="asp-input" placeholder="you@example.com" /></div>
      <div class="asp-fg"><label for="asp-msg">Your message</label><textarea id="asp-msg" name="message" required rows="4" class="asp-input asp-ta" placeholder="e.g. I have a legislative enquiry or a message for the Speaker's office."></textarea></div>
      <button type="submit" class="asp-submit">Send Message</button>
    </form>
    <div id="aspSuccess" class="asp-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>The Speaker's office will respond shortly.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('aspForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('aspSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const assemblySpeakerOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'assembly-speaker-official-site',
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
