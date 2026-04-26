/**
 * Senator Official Site — NF-POL-ELC variant of governor (VN-POL-009)
 * Pillar 2 — P2-senator-official-site · Sprint 1
 *
 * Nigeria-First:
 *   • 109 senators across 36 states + FCT (3 per state)
 *   • Senatorial district identity (not state-wide mandate)
 *   • SB-prefix bills, Senate committee chairmanship badge
 *   • INEC Certificate of Return reference in incumbent + post_office
 *   • Three modes: campaign | incumbent | post_office
 *   • WhatsApp for constituent liaison and campaign volunteering
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
.sn-hero{text-align:center;padding:2.75rem 0 2rem}
.sn-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.sn-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.sn-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.sn-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.sn-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.sn-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.sn-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.sn-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.sn-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.sn-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.sn-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.sn-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.sn-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.sn-section{margin-top:2.75rem}
.sn-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.sn-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.sn-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.sn-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.sn-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.sn-card-price{font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0}
.sn-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.sn-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.sn-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.sn-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.sn-info-item{display:flex;flex-direction:column;gap:.25rem}
.sn-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.sn-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.sn-info-value a{color:var(--ww-party-primary)}
.sn-about-hero{text-align:center;padding:2.5rem 0 2rem}
.sn-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.sn-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.sn-body{max-width:44rem;margin:0 auto}
.sn-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.sn-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.sn-drow{display:flex;gap:1rem;align-items:flex-start}
.sn-dlabel{font-size:.875rem;font-weight:700;min-width:9rem;color:var(--ww-text);flex-shrink:0}
.sn-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.sn-dvalue a{color:var(--ww-party-primary);font-weight:600}
.sn-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.sn-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.sn-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.sn-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.sn-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.sn-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.sn-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.sn-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.sn-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.sn-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.sn-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.sn-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.sn-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.sn-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.sn-layout{grid-template-columns:1fr 1fr}}
.sn-info h2,.sn-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.sn-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.sn-info a{color:var(--ww-party-primary);font-weight:600}
.sn-form{display:flex;flex-direction:column;gap:.875rem}
.sn-fg{display:flex;flex-direction:column;gap:.375rem}
.sn-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.sn-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.sn-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.sn-ta{min-height:100px;resize:vertical}
.sn-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.sn-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
@media(max-width:375px){.sn-ctas{flex-direction:column;align-items:stretch}.sn-primary-btn,.sn-sec-btn,.sn-wa-btn{width:100%;justify-content:center}}
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
  const district=placeName??'the Senatorial District';
  const party=(ctx.data.party as string|null)??null;
  const inecRef=(ctx.data.inecCertRef as string|null)??null;
  const committee=(ctx.data.committee as string|null)??null;

  const waMsg=mode==='campaign'
    ?`Hello, I would like to volunteer for the Senate campaign of ${esc(ctx.displayName)}.`
    :mode==='incumbent'
    ?`Hello, I am a constituent from ${esc(district)} reaching the Senator's office.`
    :`Hello, I would like to contact the team of former Senator ${esc(ctx.displayName)}.`;
  const waHref=whatsappLink(phone,waMsg);

  const trustBadges=mode==='campaign'
    ?`<span class="sn-badge"><span class="sn-dot"></span>INEC Senatorial Candidate</span>${party?`<span class="sn-badge"><span class="sn-dot"></span>${esc(party)}</span>`:''}`
    :mode==='incumbent'
    ?`<span class="sn-badge"><span class="sn-dot"></span>INEC Certificate of Return</span>${committee?`<span class="sn-badge"><span class="sn-dot"></span>Senate Committee: ${esc(committee)}</span>`:''}`
    :`<span class="sn-badge"><span class="sn-dot"></span>Former Senator</span>${inecRef?`<span class="sn-badge"><span class="sn-dot"></span>Cert: ${esc(inecRef)}</span>`:''}`;

  const heroSubtitle=mode==='campaign'
    ?`Senatorial Candidate — ${esc(district)}`
    :mode==='incumbent'
    ?`Senator, ${esc(district)}`
    :`Former Senator, ${esc(district)}`;

  const defaultTagline=mode==='campaign'
    ?`Real representation for ${esc(district)}: strong legislation, constituency development, and federal accountability.`
    :mode==='incumbent'
    ?`Sponsoring bills, delivering CDF projects, and ensuring federal accountability for ${esc(district)}.`
    :`Proud to have represented the people of ${esc(district)} in the Senate of the Federal Republic.`;

  const svcLabel=mode==='campaign'?'Legislative Agenda':mode==='incumbent'?'Bills & CDF Projects':'Senate Record';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;

  const grid=featured.length===0?'':`
  <section class="sn-section">
    <h2 class="sn-section-title">${esc(svcLabel)}</h2>
    <div class="sn-grid">
      ${featured.map(o=>`<div class="sn-card"><h3 class="sn-card-name">${esc(o.name)}</h3>${o.description?`<p class="sn-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p class="sn-card-price">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}
    </div>
    ${offerings.length>6?`<a href="/services" style="display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">View all ${esc(svcLabel.toLowerCase())} →</a>`:''}
  </section>`;

  return `${CSS}
<section class="sn-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="sn-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="sn-subtitle">${heroSubtitle}</p>
  <p class="sn-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="sn-ctas">
    ${waHref&&mode==='campaign'?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sn-primary-btn">${waSvg()} Join Campaign</a>`:`<a href="/services" class="sn-primary-btn">${mode==='incumbent'?'View Bills & Projects':'View Senate Record'}</a>`}
    <a href="/contact" class="sn-sec-btn">Contact the Office</a>
  </div>
  <div class="sn-trust-strip">${trustBadges}</div>
</section>
${grid}
${bio?`<div class="sn-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone||placeName?`<div class="sn-info-strip">${placeName?`<div class="sn-info-item"><span class="sn-info-label">Senatorial District</span><span class="sn-info-value">${esc(placeName)}</span></div>`:''} ${phone?`<div class="sn-info-item"><span class="sn-info-label">Senator's Office</span><span class="sn-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="sn-info-item"><span class="sn-info-label">${mode==='campaign'?'Volunteer':'Enquiries'}</span><span class="sn-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
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
  const district=placeName??'the Senatorial District';
  const waHref=whatsappLink(phone,`Hello, I would like to contact the office of ${mode==='campaign'?'Senatorial Candidate':'Senator'} ${esc(ctx.displayName)}.`);
  const roleLabel=mode==='campaign'?`Senatorial Candidate — ${esc(district)}`:mode==='incumbent'?`Senator, ${esc(district)}`:`Former Senator, ${esc(district)}`;
  const defaultDesc=mode==='campaign'
    ?`${esc(ctx.displayName)} is seeking a mandate from the people of ${esc(district)} to deliver strong federal legislation, CDF project oversight, and accountable representation in the Senate.`
    :mode==='incumbent'
    ?`${esc(ctx.displayName)} represents ${esc(district)} in the Nigerian Senate, sponsoring bills, chairing committees, and ensuring federal allocations reach the district.`
    :`${esc(ctx.displayName)} served as Senator for ${esc(district)}, sponsoring landmark bills and delivering constituency development fund projects across the district.`;

  return `${CSS}
<section class="sn-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="sn-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="sn-cat-badge">${esc(roleLabel)}</span>
</section>
<div class="sn-body">
  <p class="sn-desc">${description?esc(description):defaultDesc}</p>
  <div class="sn-details">
    ${party?`<div class="sn-drow"><span class="sn-dlabel">Party</span><span class="sn-dvalue">${esc(party)}</span></div>`:''}
    ${placeName?`<div class="sn-drow"><span class="sn-dlabel">District</span><span class="sn-dvalue">${esc(placeName)}</span></div>`:''}
    ${committee?`<div class="sn-drow"><span class="sn-dlabel">Committee</span><span class="sn-dvalue">${esc(committee)}</span></div>`:''}
    ${mode!=='campaign'&&inecRef?`<div class="sn-drow"><span class="sn-dlabel">INEC Certificate</span><span class="sn-dvalue">${esc(inecRef)}</span></div>`:''}
    ${phone?`<div class="sn-drow"><span class="sn-dlabel">Office Phone</span><span class="sn-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="sn-drow"><span class="sn-dlabel">Official Site</span><span class="sn-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="sn-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sn-wa-btn">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a>`:''}
    <a href="/contact" class="sn-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const district=placeName??'the Senatorial District';
  const waHref=whatsappLink(phone,`Hello, I would like to reach the office of Senator ${esc(ctx.displayName)}.`);
  const pageTitle=mode==='campaign'?'Legislative Agenda':mode==='incumbent'?'Bills & CDF Projects':'Senate Record';
  const pageSubtitle=mode==='campaign'
    ?`Policy priorities and legislative commitments of ${esc(ctx.displayName)} for ${esc(district)}`
    :mode==='incumbent'
    ?`Active SB-bills, Senate committee work, and CDF projects by Senator ${esc(ctx.displayName)}`
    :`Bills sponsored and CDF projects delivered during the Senate tenure of ${esc(ctx.displayName)}`;
  const emptyMsg=mode==='campaign'?'Legislative agenda is being finalised. Contact the campaign office for details.'
    :mode==='incumbent'?'Bills and project updates are being published. Contact the Senator\'s office for details.'
    :'Senate record is being compiled. Please check back soon.';
  const content=offerings.length===0?`<div class="sn-empty"><p>${esc(emptyMsg)}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sn-wa-btn">${waSvg()} Contact on WhatsApp</a>`:`<br/><a class="sn-primary-btn" href="/contact">Contact the Office</a>`}</div>`
    :`<div class="sn-grid">${offerings.map(o=>`<div class="sn-card"><h3 class="sn-card-name">${esc(o.name)}</h3>${o.description?`<p class="sn-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p class="sn-card-price">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="sn-svc-hero"><h1>${esc(pageTitle)}</h1><p class="sn-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="sn-cta-strip">
  <h3>${mode==='campaign'?'Support the Campaign':'Constituent Liaison'}</h3>
  <p>${mode==='campaign'?'Stand with us for stronger federal representation for our senatorial district.':'For CDF project enquiries, bill support, or constituency matters, reach the Senator\'s office.'}</p>
  <div class="sn-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sn-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="sn-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const district=placeName??'the Senatorial District';
  const waMsg=mode==='campaign'
    ?`Hello, I want to volunteer for the Senate campaign of ${esc(ctx.displayName)}.`
    :`Hello, I am contacting the office of ${mode==='incumbent'?'Senator':'former Senator'} ${esc(ctx.displayName)} from ${esc(district)}.`;
  const waHref=whatsappLink(phone,waMsg);
  return `${CSS}
<section class="sn-contact-hero">
  <h1>${mode==='campaign'?'Get Involved':'Contact the Office'}</h1>
  <p>${mode==='campaign'?`Volunteer for the Senate campaign or reach our coordination office in ${esc(district)}.`:mode==='incumbent'?`Reach Senator ${esc(ctx.displayName)}'s office for constituency matters, CDF enquiries, or media.`:`Contact the team of former Senator ${esc(ctx.displayName)}.`}</p>
</section>
${waHref?`<div class="sn-wa-block"><p>${mode==='campaign'?'Join our volunteer network and support the campaign.':'Send a WhatsApp message to our office for faster response.'}</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sn-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} ${mode==='campaign'?'Volunteer on WhatsApp':'WhatsApp the Office'}</a></div>`:''}
<div class="sn-layout">
  <div class="sn-info">
    <h2>${mode==='incumbent'?`Senator's Office — ${esc(district)}`:mode==='campaign'?'Campaign Office':'Office Contact'}</h2>
    ${placeName?`<p><strong>District:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Office contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">${mode==='campaign'?'Campaign conducted in compliance with INEC guidelines and Electoral Act 2022.':'All official Senate correspondence is in compliance with the Nigerian Constitution.'}</p>
  </div>
  <div class="sn-form-wrap">
    <h2>Send a Message</h2>
    <form class="sn-form" method="POST" action="/contact" id="snForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="sn-fg"><label for="sn-name">Your full name</label><input id="sn-name" name="name" type="text" required autocomplete="name" class="sn-input" placeholder="e.g. Chukwudi Eze" /></div>
      <div class="sn-fg"><label for="sn-phone">Phone number</label><input id="sn-phone" name="phone" type="tel" autocomplete="tel" class="sn-input" placeholder="0803 000 0000" /></div>
      <div class="sn-fg"><label for="sn-email">Email (optional)</label><input id="sn-email" name="email" type="email" class="sn-input" placeholder="you@example.com" /></div>
      <div class="sn-fg"><label for="sn-msg">${mode==='campaign'?'How would you like to support the campaign?':'Your message or constituency matter'}</label><textarea id="sn-msg" name="message" required rows="4" class="sn-input sn-ta" placeholder="${mode==='campaign'?'e.g. I want to canvass, donate, or ask about your legislative priorities.':'e.g. I have a question about a CDF project or Senate bill in our district.'}"></textarea></div>
      <button type="submit" class="sn-submit">Send Message</button>
    </form>
    <div id="snSuccess" class="sn-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>The Senator's team will respond shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('snForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('snSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const senatorOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'senator-official-site',
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
