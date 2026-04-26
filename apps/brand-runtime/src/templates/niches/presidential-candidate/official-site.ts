/**
 * Presidential Candidate / President Official Site — NF-POL-ELC standalone (VN-POL-015)
 * Pillar 2 — P2-presidential-candidate-official-site · Sprint 3
 *
 * Nigeria-First:
 *   • INEC Form CF001 (Presidential) — Electoral Act 2022 campaign finance gate
 *   • No donation CTA without ctx.data.inecCampaignAccount (campaign finance gate)
 *   • 36 states + FCT mandate — national constituency
 *   • Three modes: campaign | incumbent | post_office
 *   • post_office is primary (past presidents with ongoing legacy/foundations)
 *   • Highest revenue ceiling of all political templates
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
.pc-hero{text-align:center;padding:2.75rem 0 2rem}
.pc-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.pc-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.pc-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.pc-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:44rem;margin:0 auto 1.75rem;line-height:1.6}
.pc-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pc-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.pc-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.pc-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.pc-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.pc-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.pc-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.pc-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.pc-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.pc-section{margin-top:2.75rem}
.pc-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.pc-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.pc-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.pc-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.pc-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.pc-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pc-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.pc-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.pc-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.pc-info-item{display:flex;flex-direction:column;gap:.25rem}
.pc-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pc-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.pc-info-value a{color:var(--ww-party-primary)}
.pc-about-hero{text-align:center;padding:2.5rem 0 2rem}
.pc-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.pc-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.pc-body{max-width:44rem;margin:0 auto}
.pc-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.pc-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.pc-drow{display:flex;gap:1rem;align-items:flex-start}
.pc-dlabel{font-size:.875rem;font-weight:700;min-width:9rem;color:var(--ww-text);flex-shrink:0}
.pc-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.pc-dvalue a{color:var(--ww-party-primary);font-weight:600}
.pc-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pc-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.pc-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pc-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.pc-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.pc-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.pc-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.pc-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.pc-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.pc-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pc-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.pc-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.pc-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.pc-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.pc-layout{grid-template-columns:1fr 1fr}}
.pc-info h2,.pc-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.pc-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.pc-info a{color:var(--ww-party-primary);font-weight:600}
.pc-form{display:flex;flex-direction:column;gap:.875rem}
.pc-fg{display:flex;flex-direction:column;gap:.375rem}
.pc-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.pc-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.pc-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.pc-ta{min-height:100px;resize:vertical}
.pc-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.pc-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.pc-finance-note{font-size:.78rem;color:var(--ww-text-muted);margin-top:.75rem;text-align:center;line-height:1.5}
@media(max-width:375px){.pc-ctas{flex-direction:column;align-items:stretch}.pc-primary-btn,.pc-sec-btn,.pc-wa-btn{width:100%;justify-content:center}}
</style>`;

function waSvg(){return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`}

type Offering={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const description=(ctx.data.description as string|null)??null;
  const tagline=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const inecCampaignAccount=(ctx.data.inecCampaignAccount as string|null)??null;
  const inecRef=(ctx.data.inecCertRef as string|null)??null;
  const waMsg=mode==='campaign'?`Hello, I would like to volunteer for the Presidential campaign of ${esc(ctx.displayName)}.`:mode==='incumbent'?`Hello, I would like to reach the Office of the President.`:`Hello, I would like to contact the team of former President ${esc(ctx.displayName)}.`;
  const waHref=whatsappLink(phone,waMsg);
  const trustBadges=mode==='campaign'
    ?`<span class="pc-badge"><span class="pc-dot"></span>INEC Form CF001 Filed</span>${party?`<span class="pc-badge"><span class="pc-dot"></span>${esc(party)} Presidential Candidate</span>`:''}`
    :mode==='incumbent'
    ?`<span class="pc-badge"><span class="pc-dot"></span>INEC Certificate of Return</span><span class="pc-badge"><span class="pc-dot"></span>Commander-in-Chief</span>`
    :`<span class="pc-badge"><span class="pc-dot"></span>Former President of Nigeria</span>${inecRef?`<span class="pc-badge"><span class="pc-dot"></span>${esc(inecRef)}</span>`:''}`;
  const heroSubtitle=mode==='campaign'?`Presidential Candidate — Federal Republic of Nigeria`:mode==='incumbent'?'President, Federal Republic of Nigeria':'Former President, Federal Republic of Nigeria';
  const defaultTagline=mode==='campaign'?`A united Nigeria: security, economic prosperity, and opportunities for every citizen across all 36 states and the FCT.`:mode==='incumbent'?`Delivering on the mandate of 220 million Nigerians: security, economic growth, and national development.`:`A legacy of service, sacrifice, and commitment to the Federal Republic of Nigeria.`;

  // Campaign finance gate (REQ-POL-009): no donation CTA without INEC campaign account
  const donationCta=mode==='campaign'&&inecCampaignAccount
    ?`<div style="text-align:center;margin-top:1.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)"><p style="font-size:.9375rem;margin-bottom:.75rem;color:var(--ww-text-muted)">Support the campaign through our INEC-registered account.</p><p style="font-weight:700;color:var(--ww-party-primary)">${esc(inecCampaignAccount)}</p><p class="pc-finance-note">All donations comply with the Electoral Act 2022 limits. INEC-monitored campaign finance.</p></div>`
    :'';

  const svcLabel=mode==='campaign'?'Presidential Agenda':mode==='incumbent'?'National Projects & Priorities':'Presidential Legacy';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const grid=featured.length===0?'':`<section class="pc-section"><h2 class="pc-section-title">${esc(svcLabel)}</h2><div class="pc-grid">${featured.map(o=>`<div class="pc-card"><h3 class="pc-card-name">${esc(o.name)}</h3>${o.description?`<p class="pc-card-desc">${esc(o.description)}</p>`:''}</div>`).join('')}</div>${offerings.length>6?`<a href="/services" style="display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">View full agenda →</a>`:''}</section>`;
  return `${CSS}
<section class="pc-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pc-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="pc-subtitle">${heroSubtitle}</p>
  <p class="pc-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="pc-ctas">
    ${waHref&&mode==='campaign'?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pc-primary-btn">${waSvg()} Volunteer</a>`:`<a href="/services" class="pc-primary-btn">${mode==='incumbent'?'National Priorities':'Presidential Legacy'}</a>`}
    <a href="/contact" class="pc-sec-btn">Contact the Office</a>
  </div>
  <div class="pc-trust-strip">${trustBadges}</div>
</section>
${donationCta}
${grid}
${bio?`<div class="pc-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone?`<div class="pc-info-strip"><div class="pc-info-item"><span class="pc-info-label">Mandate</span><span class="pc-info-value">36 States + FCT — National</span></div> ${phone?`<div class="pc-info-item"><span class="pc-info-label">${mode==='incumbent'?'Office':'Contact'}</span><span class="pc-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="pc-info-item"><span class="pc-info-label">${mode==='campaign'?'Volunteer':'Enquiries'}</span><span class="pc-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const description=(ctx.data.description as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const inecRef=(ctx.data.inecCertRef as string|null)??null;
  const waHref=whatsappLink(phone,`Hello, I would like to contact the team of ${mode==='incumbent'?'President':'former President'} ${esc(ctx.displayName)}.`);
  const roleLabel=mode==='campaign'?'Presidential Candidate, Federal Republic of Nigeria':mode==='incumbent'?'President, Federal Republic of Nigeria':'Former President, Federal Republic of Nigeria';
  const defaultDesc=mode==='campaign'?`${esc(ctx.displayName)} is seeking the Presidential mandate from the people of all 36 states and the FCT to deliver security, economic prosperity, and national unity. Campaign conducted in compliance with INEC Form CF001 and the Electoral Act 2022.`:mode==='incumbent'?`${esc(ctx.displayName)} serves as President of the Federal Republic of Nigeria, Commander-in-Chief of the Armed Forces, and Chairman of the Federal Executive Council (FEC). Accountable to 220 million Nigerians.`:`${esc(ctx.displayName)} served as President of the Federal Republic of Nigeria, delivering landmark national policies and leaving a legacy of governance for the Nigerian people.`;
  return `${CSS}
<section class="pc-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pc-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="pc-cat-badge">${esc(roleLabel)}</span>
</section>
<div class="pc-body">
  <p class="pc-desc">${description?esc(description):defaultDesc}</p>
  <div class="pc-details">
    ${party?`<div class="pc-drow"><span class="pc-dlabel">Party</span><span class="pc-dvalue">${esc(party)}</span></div>`:''}
    <div class="pc-drow"><span class="pc-dlabel">Mandate Scope</span><span class="pc-dvalue">36 States + FCT — Federal Republic of Nigeria</span></div>
    ${mode==='campaign'?`<div class="pc-drow"><span class="pc-dlabel">INEC Filing</span><span class="pc-dvalue">Form CF001 — Presidential</span></div>`:''}
    ${mode!=='campaign'&&inecRef?`<div class="pc-drow"><span class="pc-dlabel">INEC Certificate</span><span class="pc-dvalue">${esc(inecRef)}</span></div>`:''}
    ${phone?`<div class="pc-drow"><span class="pc-dlabel">Office Phone</span><span class="pc-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="pc-drow"><span class="pc-dlabel">Official Site</span><span class="pc-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="pc-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pc-wa-btn">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a>`:''}
    <a href="/contact" class="pc-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const waHref=whatsappLink(phone,`Hello, I would like to reach the team of ${mode==='incumbent'?'President':'former President'} ${esc(ctx.displayName)}.`);
  const pageTitle=mode==='campaign'?'Presidential Agenda':mode==='incumbent'?'National Projects & Priorities':'Presidential Legacy';
  const pageSubtitle=mode==='campaign'?'Policy commitments and national development priorities for a united Nigeria':mode==='incumbent'?`Active federal projects and national priorities under President ${esc(ctx.displayName)}`:`National achievements and legacy projects of President ${esc(ctx.displayName)}`;
  const emptyMsg=mode==='campaign'?'Presidential agenda being published. Contact the campaign office.':mode==='incumbent'?'National project updates being published.':'Presidential record being compiled.';
  const content=offerings.length===0?`<div class="pc-empty"><p>${esc(emptyMsg)}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pc-wa-btn">${waSvg()} WhatsApp</a>`:`<br/><a class="pc-primary-btn" href="/contact">Contact the Office</a>`}</div>`
    :`<div class="pc-grid">${offerings.map(o=>`<div class="pc-card"><h3 class="pc-card-name">${esc(o.name)}</h3>${o.description?`<p class="pc-card-desc">${esc(o.description)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="pc-svc-hero"><h1>${esc(pageTitle)}</h1><p class="pc-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="pc-cta-strip">
  <h3>${mode==='campaign'?'Join the Movement':'Connect with Our Team'}</h3>
  <p>${mode==='campaign'?'Every Nigerian citizen who believes in a united, prosperous Nigeria can make a difference.':mode==='incumbent'?'For official enquiries, media liaison, or stakeholder engagement, reach the President\'s office.':'Engage with the legacy of this administration and its ongoing work.'}</p>
  <div class="pc-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pc-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="pc-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const inecCampaignAccount=(ctx.data.inecCampaignAccount as string|null)??null;
  const waMsg=mode==='campaign'?`Hello, I want to volunteer for the Presidential campaign of ${esc(ctx.displayName)}.`:`Hello, I am contacting the office of ${mode==='incumbent'?'President':'former President'} ${esc(ctx.displayName)}.`;
  const waHref=whatsappLink(phone,waMsg);
  return `${CSS}
<section class="pc-contact-hero">
  <h1>${mode==='campaign'?'Join the Campaign':'Contact the Office'}</h1>
  <p>${mode==='campaign'?'Volunteer across all 36 states and the FCT or contact our campaign coordination office.':mode==='incumbent'?'Reach the President\'s office for official enquiries, media, or stakeholder engagement.':'Contact the team and foundation of former President ${esc(ctx.displayName)}.'}</p>
</section>
${waHref?`<div class="pc-wa-block"><p>${mode==='campaign'?'Join our nationwide campaign volunteers on WhatsApp.':'Send a WhatsApp message for faster response.'}</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pc-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a></div>`:''}
<div class="pc-layout">
  <div class="pc-info">
    <h2>${mode==='incumbent'?'Office of the President, FRN':mode==='campaign'?'Campaign Coordination':'Presidential Office'}</h2>
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Contact details will be published shortly.</p>`:''}
    ${mode==='campaign'&&inecCampaignAccount?`<p><strong>INEC Campaign Account:</strong> ${esc(inecCampaignAccount)}</p><p class="pc-finance-note">All donations comply with Electoral Act 2022 limits.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">${mode==='campaign'?'Campaign conducted in full compliance with INEC Form CF001 requirements and the Electoral Act 2022.':mode==='incumbent'?'All official presidential communications are constitutionally authorised.':'Thank you for your continued interest in the work of this administration.'}</p>
  </div>
  <div class="pc-form-wrap">
    <h2>Send a Message</h2>
    <form class="pc-form" method="POST" action="/contact" id="pcForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pc-fg"><label for="pc-name">Your full name</label><input id="pc-name" name="name" type="text" required autocomplete="name" class="pc-input" placeholder="e.g. Abubakar Suleiman" /></div>
      <div class="pc-fg"><label for="pc-phone">Phone number</label><input id="pc-phone" name="phone" type="tel" autocomplete="tel" class="pc-input" placeholder="0803 000 0000" /></div>
      <div class="pc-fg"><label for="pc-email">Email (optional)</label><input id="pc-email" name="email" type="email" class="pc-input" placeholder="you@example.com" /></div>
      <div class="pc-fg"><label for="pc-msg">${mode==='campaign'?'How would you like to support the campaign?':'Your message or enquiry'}</label><textarea id="pc-msg" name="message" required rows="4" class="pc-input pc-ta" placeholder="${mode==='campaign'?'e.g. I want to volunteer, organise rallies, or support in my state.':'e.g. I have an official enquiry or media request.'}"></textarea></div>
      <button type="submit" class="pc-submit">Send Message</button>
    </form>
    <div id="pcSuccess" class="pc-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>Our team will respond shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('pcForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('pcSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const presidentialCandidateOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'presidential-candidate-official-site',
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
