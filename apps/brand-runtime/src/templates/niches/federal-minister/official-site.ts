/**
 * Federal Minister Official Site — NF-POL-APT variant (VN-POL-012)
 * Pillar 2 — P2-federal-minister-official-site · Sprint 2
 *
 * Nigeria-First:
 *   • Presidential appointment — Senate screening (Section 147 CFRN)
 *   • FEC (Federal Executive Council) membership badge
 *   • Abuja-based ministry — federal portfolio identity
 *   • NO campaign mode — appointed office only (incumbent + post_office)
 *   • Senate screening reference as trust signal
 *   • WhatsApp for ministry/stakeholder enquiries
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

type ApptMode='incumbent'|'post_office';
function getMode(ctx:WebsiteRenderContext):ApptMode{
  const m=ctx.data?.mode as string|undefined;
  if(m==='post_office')return 'post_office';
  return 'incumbent';
}

const CSS=`<style>
:root{--ww-party-primary:var(--ww-primary)}
.fm-hero{text-align:center;padding:2.75rem 0 2rem}
.fm-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.fm-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.fm-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.fm-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.fm-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.fm-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.fm-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.fm-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.fm-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.fm-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.fm-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.fm-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.fm-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.fm-section{margin-top:2.75rem}
.fm-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.fm-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.fm-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.fm-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.fm-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.fm-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.fm-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.fm-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.fm-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.fm-info-item{display:flex;flex-direction:column;gap:.25rem}
.fm-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.fm-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.fm-info-value a{color:var(--ww-party-primary)}
.fm-about-hero{text-align:center;padding:2.5rem 0 2rem}
.fm-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.fm-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.fm-body{max-width:44rem;margin:0 auto}
.fm-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.fm-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.fm-drow{display:flex;gap:1rem;align-items:flex-start}
.fm-dlabel{font-size:.875rem;font-weight:700;min-width:9rem;color:var(--ww-text);flex-shrink:0}
.fm-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.fm-dvalue a{color:var(--ww-party-primary);font-weight:600}
.fm-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.fm-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.fm-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.fm-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.fm-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.fm-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.fm-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.fm-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.fm-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.fm-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.fm-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.fm-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.fm-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.fm-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.fm-layout{grid-template-columns:1fr 1fr}}
.fm-info h2,.fm-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.fm-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.fm-info a{color:var(--ww-party-primary);font-weight:600}
.fm-form{display:flex;flex-direction:column;gap:.875rem}
.fm-fg{display:flex;flex-direction:column;gap:.375rem}
.fm-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.fm-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.fm-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.fm-ta{min-height:100px;resize:vertical}
.fm-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.fm-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
@media(max-width:375px){.fm-ctas{flex-direction:column;align-items:stretch}.fm-primary-btn,.fm-sec-btn,.fm-wa-btn{width:100%;justify-content:center}}
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
  const ministry=(ctx.data.ministry as string|null)??null;
  const senateRef=(ctx.data.senateScreeningRef as string|null)??null;
  const waHref=whatsappLink(phone,`Hello, I would like to reach the office of ${mode==='incumbent'?'Honourable Minister':'former Minister'} ${esc(ctx.displayName)}.`);
  const heroSubtitle=ministry
    ?`${mode==='incumbent'?'Honourable Minister of':'Former Minister of'} ${esc(ministry)}`
    :`${mode==='incumbent'?'Federal Minister':'Former Federal Minister'} — Federal Republic of Nigeria`;
  const defaultTagline=mode==='incumbent'
    ?`Executing the President's agenda for ${esc(ministry??'the Ministry')}: policy reform, stakeholder engagement, and measurable outcomes.`
    :`Proud to have served as Federal Minister of ${esc(ministry??'the Ministry')}, delivering key national policy outcomes.`;
  const trustBadges=`<span class="fm-badge"><span class="fm-dot"></span>Presidential Appointee</span><span class="fm-badge"><span class="fm-dot"></span>Senate-Screened</span>${senateRef?`<span class="fm-badge"><span class="fm-dot"></span>${esc(senateRef)}</span>`:''}${ministry?`<span class="fm-badge"><span class="fm-dot"></span>FEC Member</span>`:''}`;
  const svcLabel=mode==='incumbent'?'Ministry Initiatives & Projects':'Legacy Achievements';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const grid=featured.length===0?'':`<section class="fm-section"><h2 class="fm-section-title">${esc(svcLabel)}</h2><div class="fm-grid">${featured.map(o=>`<div class="fm-card"><h3 class="fm-card-name">${esc(o.name)}</h3>${o.description?`<p class="fm-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>${offerings.length>6?`<a href="/services" style="display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">View all →</a>`:''}</section>`;
  return `${CSS}
<section class="fm-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="fm-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="fm-subtitle">${heroSubtitle}</p>
  <p class="fm-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="fm-ctas">
    <a href="/services" class="fm-primary-btn">${mode==='incumbent'?'Ministry Initiatives':'View Record'}</a>
    <a href="/contact" class="fm-sec-btn">Contact the Office</a>
  </div>
  <div class="fm-trust-strip">${trustBadges}</div>
</section>
${grid}
${bio?`<div class="fm-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone||placeName?`<div class="fm-info-strip">${ministry?`<div class="fm-info-item"><span class="fm-info-label">Ministry</span><span class="fm-info-value">${esc(ministry)}</span></div>`:''} ${placeName?`<div class="fm-info-item"><span class="fm-info-label">Location</span><span class="fm-info-value">${esc(placeName)}</span></div>`:''} ${phone?`<div class="fm-info-item"><span class="fm-info-label">Minister's Office</span><span class="fm-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="fm-info-item"><span class="fm-info-label">Enquiries</span><span class="fm-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const description=(ctx.data.description as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const ministry=(ctx.data.ministry as string|null)??null;
  const senateRef=(ctx.data.senateScreeningRef as string|null)??null;
  const waHref=whatsappLink(phone,`Hello, I would like to reach the office of Minister ${esc(ctx.displayName)}.`);
  const roleLabel=ministry
    ?`${mode==='incumbent'?'Honourable Minister of':'Former Minister of'} ${esc(ministry)}`
    :`${mode==='incumbent'?'Federal Minister':'Former Federal Minister'}`;
  const defaultDesc=mode==='incumbent'
    ?`${esc(ctx.displayName)} serves as Honourable Minister of ${esc(ministry??'the Ministry')}, appointed by the President and screened by the Senate. A member of the Federal Executive Council (FEC), responsible for federal policy implementation and ministerial oversight.`
    :`${esc(ctx.displayName)} served as Honourable Minister of ${esc(ministry??'the Ministry')}, appointed by the President and screened by the Senate, delivering key national policy initiatives during tenure.`;
  return `${CSS}
<section class="fm-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="fm-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="fm-cat-badge">${esc(roleLabel)}</span>
</section>
<div class="fm-body">
  <p class="fm-desc">${description?esc(description):defaultDesc}</p>
  <div class="fm-details">
    ${ministry?`<div class="fm-drow"><span class="fm-dlabel">Ministry</span><span class="fm-dvalue">${esc(ministry)}</span></div>`:''}
    <div class="fm-drow"><span class="fm-dlabel">Appointment</span><span class="fm-dvalue">Presidential — Senate-Screened (Section 147 CFRN)</span></div>
    ${senateRef?`<div class="fm-drow"><span class="fm-dlabel">Senate Reference</span><span class="fm-dvalue">${esc(senateRef)}</span></div>`:''}
    ${placeName?`<div class="fm-drow"><span class="fm-dlabel">Location</span><span class="fm-dvalue">${esc(placeName)}</span></div>`:''}
    ${phone?`<div class="fm-drow"><span class="fm-dlabel">Office Phone</span><span class="fm-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="fm-drow"><span class="fm-dlabel">Official Site</span><span class="fm-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="fm-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="fm-wa-btn">${waSvg()} WhatsApp the Office</a>`:''}
    <a href="/contact" class="fm-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const ministry=(ctx.data.ministry as string|null)??null;
  const waHref=whatsappLink(phone,`Hello, I would like to enquire about ministry projects under Minister ${esc(ctx.displayName)}.`);
  const pageTitle=mode==='incumbent'?'Ministry Initiatives & Projects':'Ministerial Record';
  const pageSubtitle=mode==='incumbent'
    ?`Active national projects and policy initiatives under the Ministry${ministry?` of ${esc(ministry)}`:''}`
    :`Federal policy achievements and projects delivered during tenure of ${esc(ctx.displayName)}`;
  const emptyMsg=mode==='incumbent'?'Ministry project details are being published. Contact the Minister\'s office.':'Ministerial record is being compiled. Please check back.';
  const content=offerings.length===0?`<div class="fm-empty"><p>${esc(emptyMsg)}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="fm-wa-btn">${waSvg()} WhatsApp</a>`:`<br/><a class="fm-primary-btn" href="/contact">Contact the Office</a>`}</div>`
    :`<div class="fm-grid">${offerings.map(o=>`<div class="fm-card"><h3 class="fm-card-name">${esc(o.name)}</h3>${o.description?`<p class="fm-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="fm-svc-hero"><h1>${esc(pageTitle)}</h1><p class="fm-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="fm-cta-strip">
  <h3>Stakeholder Engagement</h3>
  <p>${mode==='incumbent'?`For ministry project enquiries, policy engagement, or official matters, reach the Minister's office.`:'For legacy ministry engagement or further information, contact our team.'}</p>
  <div class="fm-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="fm-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="fm-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const ministry=(ctx.data.ministry as string|null)??null;
  const waHref=whatsappLink(phone,`Hello, I am contacting the office of ${mode==='incumbent'?'Honourable Minister':'former Minister'} ${esc(ctx.displayName)}${ministry?`, Ministry of ${esc(ministry)}`:''}.`);
  return `${CSS}
<section class="fm-contact-hero">
  <h1>Contact the Office</h1>
  <p>${mode==='incumbent'?`Reach the Minister's office for policy enquiries, stakeholder engagement, or media liaison.`:`Contact the team of former Minister ${esc(ctx.displayName)}.`}</p>
</section>
${waHref?`<div class="fm-wa-block"><p>Send a WhatsApp message to our office for faster response.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="fm-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp the Office</a></div>`:''}
<div class="fm-layout">
  <div class="fm-info">
    <h2>${ministry?`Ministry of ${esc(ministry)}`:'Federal Ministry'}</h2>
    ${ministry?`<p><strong>Ministry:</strong> ${esc(ministry)}</p>`:''}
    ${placeName?`<p><strong>Location:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Office contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Presidential appointment — Senate-screened under Section 147 CFRN. FEC member and accountable to the National Assembly.</p>
  </div>
  <div class="fm-form-wrap">
    <h2>Send a Message</h2>
    <form class="fm-form" method="POST" action="/contact" id="fmForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="fm-fg"><label for="fm-name">Your full name</label><input id="fm-name" name="name" type="text" required autocomplete="name" class="fm-input" placeholder="e.g. Hauwa Musa" /></div>
      <div class="fm-fg"><label for="fm-phone">Phone number</label><input id="fm-phone" name="phone" type="tel" autocomplete="tel" class="fm-input" placeholder="0803 000 0000" /></div>
      <div class="fm-fg"><label for="fm-email">Email (optional)</label><input id="fm-email" name="email" type="email" class="fm-input" placeholder="you@example.com" /></div>
      <div class="fm-fg"><label for="fm-msg">Your message or enquiry</label><textarea id="fm-msg" name="message" required rows="4" class="fm-input fm-ta" placeholder="e.g. I have a question about a ministry initiative, policy implementation, or media enquiry."></textarea></div>
      <button type="submit" class="fm-submit">Send Message</button>
    </form>
    <div id="fmSuccess" class="fm-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>The Minister's team will respond shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('fmForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('fmSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const federalMinisterOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'federal-minister-official-site',
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
