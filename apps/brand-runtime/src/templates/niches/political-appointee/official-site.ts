/**
 * Political Appointee (General) Official Site — NF-POL-APT variant (VN-POL-016)
 * Pillar 2 — P2-political-appointee-official-site · Sprint 3
 *
 * Nigeria-First:
 *   • SSA / SA / Technical Adviser / Board Chair — gubernatorial or presidential
 *   • High volume: ~2000+ across 36 states + federal level
 *   • NO campaign mode — appointed office only (incumbent + post_office)
 *   • Portfolio/function identity is primary framing
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
.pa-hero{text-align:center;padding:2.75rem 0 2rem}
.pa-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.pa-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.pa-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.pa-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.pa-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pa-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.pa-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.pa-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.pa-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.pa-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.pa-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.pa-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.pa-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.pa-section{margin-top:2.75rem}
.pa-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.pa-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.pa-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.pa-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.pa-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.pa-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pa-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.pa-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.pa-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.pa-info-item{display:flex;flex-direction:column;gap:.25rem}
.pa-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pa-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.pa-info-value a{color:var(--ww-party-primary)}
.pa-about-hero{text-align:center;padding:2.5rem 0 2rem}
.pa-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.pa-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.pa-body{max-width:44rem;margin:0 auto}
.pa-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.pa-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.pa-drow{display:flex;gap:1rem;align-items:flex-start}
.pa-dlabel{font-size:.875rem;font-weight:700;min-width:9rem;color:var(--ww-text);flex-shrink:0}
.pa-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.pa-dvalue a{color:var(--ww-party-primary);font-weight:600}
.pa-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pa-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.pa-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pa-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.pa-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.pa-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.pa-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.pa-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.pa-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.pa-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pa-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.pa-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.pa-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.pa-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.pa-layout{grid-template-columns:1fr 1fr}}
.pa-info h2,.pa-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.pa-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.pa-info a{color:var(--ww-party-primary);font-weight:600}
.pa-form{display:flex;flex-direction:column;gap:.875rem}
.pa-fg{display:flex;flex-direction:column;gap:.375rem}
.pa-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.pa-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.pa-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.pa-ta{min-height:100px;resize:vertical}
.pa-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.pa-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
@media(max-width:375px){.pa-ctas{flex-direction:column;align-items:stretch}.pa-primary-btn,.pa-sec-btn,.pa-wa-btn{width:100%;justify-content:center}}
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
  const portfolio=((ctx.data.portfolio as string|null)??((ctx.data.ministry as string|null)))??null;
  const appointedBy=(ctx.data.appointedBy as string|null)??null;
  const roleTitle=(ctx.data.roleTitle as string|null)??null;
  const displayRole=roleTitle??'Special Adviser';
  const waHref=whatsappLink(phone,`Hello, I would like to reach the office of ${esc(displayRole)} ${esc(ctx.displayName)}.`);
  const heroSubtitle=portfolio
    ?`${mode==='incumbent'?esc(displayRole)+' on':esc(displayRole)+' (former) on'} ${esc(portfolio)}`
    :`${mode==='incumbent'?esc(displayRole):`Former ${esc(displayRole)}`}`;
  const defaultTagline=mode==='incumbent'?`Delivering on the mandate of this office with commitment to policy excellence and stakeholder engagement.`:`Proud to have served in this appointed capacity with dedication and integrity.`;
  const trustBadges=`<span class="pa-badge"><span class="pa-dot"></span>${appointedBy?`Appointed by ${esc(appointedBy)}`:'Political Appointee'}</span>${portfolio?`<span class="pa-badge"><span class="pa-dot"></span>${esc(portfolio)}</span>`:''}`;
  const svcLabel=mode==='incumbent'?'Portfolio Initiatives':'Tenure Record';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const grid=featured.length===0?'':`<section class="pa-section"><h2 class="pa-section-title">${esc(svcLabel)}</h2><div class="pa-grid">${featured.map(o=>`<div class="pa-card"><h3 class="pa-card-name">${esc(o.name)}</h3>${o.description?`<p class="pa-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div></section>`;
  return `${CSS}
<section class="pa-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pa-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="pa-subtitle">${heroSubtitle}</p>
  <p class="pa-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="pa-ctas">
    <a href="/services" class="pa-primary-btn">${mode==='incumbent'?'Portfolio Initiatives':'View Record'}</a>
    <a href="/contact" class="pa-sec-btn">Contact the Office</a>
  </div>
  <div class="pa-trust-strip">${trustBadges}</div>
</section>
${grid}
${bio?`<div class="pa-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone||placeName?`<div class="pa-info-strip">${portfolio?`<div class="pa-info-item"><span class="pa-info-label">Portfolio</span><span class="pa-info-value">${esc(portfolio)}</span></div>`:''} ${placeName?`<div class="pa-info-item"><span class="pa-info-label">Location</span><span class="pa-info-value">${esc(placeName)}</span></div>`:''} ${phone?`<div class="pa-info-item"><span class="pa-info-label">Office</span><span class="pa-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="pa-info-item"><span class="pa-info-label">Enquiries</span><span class="pa-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const description=(ctx.data.description as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const portfolio=((ctx.data.portfolio as string|null)??((ctx.data.ministry as string|null)))??null;
  const appointedBy=(ctx.data.appointedBy as string|null)??null;
  const roleTitle=(ctx.data.roleTitle as string|null)??null;
  const displayRole=roleTitle??'Special Adviser';
  const waHref=whatsappLink(phone,`Hello, I would like to contact the office of ${esc(displayRole)} ${esc(ctx.displayName)}.`);
  const roleLabel=mode==='incumbent'?`${esc(displayRole)}${portfolio?` on ${esc(portfolio)}`:''}`:esc(`Former ${displayRole}${portfolio?` on ${portfolio}`:''}`) ;
  const defaultDesc=mode==='incumbent'?`${esc(ctx.displayName)} serves as ${esc(displayRole)}${portfolio?` on ${esc(portfolio)}`:', an appointed official'}, appointed by ${esc(appointedBy??'the Executive')}. Responsible for policy coordination and stakeholder engagement within this portfolio.`:`${esc(ctx.displayName)} served as ${esc(displayRole)}${portfolio?` on ${esc(portfolio)}`:''}${appointedBy?`, appointed by ${esc(appointedBy)}`:''}. Delivered measurable outcomes in this appointed role.`;
  return `${CSS}
<section class="pa-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pa-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="pa-cat-badge">${roleLabel}</span>
</section>
<div class="pa-body">
  <p class="pa-desc">${description?esc(description):defaultDesc}</p>
  <div class="pa-details">
    ${roleTitle?`<div class="pa-drow"><span class="pa-dlabel">Title</span><span class="pa-dvalue">${esc(roleTitle)}</span></div>`:''}
    ${portfolio?`<div class="pa-drow"><span class="pa-dlabel">Portfolio</span><span class="pa-dvalue">${esc(portfolio)}</span></div>`:''}
    ${appointedBy?`<div class="pa-drow"><span class="pa-dlabel">Appointed by</span><span class="pa-dvalue">${esc(appointedBy)}</span></div>`:''}
    ${placeName?`<div class="pa-drow"><span class="pa-dlabel">Location</span><span class="pa-dvalue">${esc(placeName)}</span></div>`:''}
    ${phone?`<div class="pa-drow"><span class="pa-dlabel">Office Phone</span><span class="pa-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="pa-drow"><span class="pa-dlabel">Official Site</span><span class="pa-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="pa-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pa-wa-btn">${waSvg()} WhatsApp the Office</a>`:''}
    <a href="/contact" class="pa-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const portfolio=((ctx.data.portfolio as string|null)??((ctx.data.ministry as string|null)))??null;
  const waHref=whatsappLink(phone,`Hello, I would like to enquire about portfolio initiatives under ${esc(ctx.displayName)}.`);
  const pageTitle=mode==='incumbent'?'Portfolio Initiatives':'Tenure Record';
  const pageSubtitle=mode==='incumbent'?`Active initiatives and engagements${portfolio?` in the ${esc(portfolio)} portfolio`:''}`:portfolio?`Record of service in the ${esc(portfolio)} portfolio`:'Record of service in this appointed role';
  const emptyMsg=mode==='incumbent'?'Portfolio initiatives being published. Contact the office.':'Record being compiled.';
  const content=offerings.length===0?`<div class="pa-empty"><p>${esc(emptyMsg)}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pa-wa-btn">${waSvg()} WhatsApp</a>`:`<br/><a class="pa-primary-btn" href="/contact">Contact the Office</a>`}</div>`
    :`<div class="pa-grid">${offerings.map(o=>`<div class="pa-card"><h3 class="pa-card-name">${esc(o.name)}</h3>${o.description?`<p class="pa-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="pa-svc-hero"><h1>${esc(pageTitle)}</h1><p class="pa-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="pa-cta-strip">
  <h3>Stakeholder Engagement</h3>
  <p>${mode==='incumbent'?'For portfolio enquiries, stakeholder engagement, or official matters, reach the office.':'For further information on this portfolio tenure, contact our team.'}</p>
  <div class="pa-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pa-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="pa-sec-btn">Contact the Office</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const portfolio=((ctx.data.portfolio as string|null)??((ctx.data.ministry as string|null)))??null;
  const roleTitle=(ctx.data.roleTitle as string|null)??null;
  const displayRole=roleTitle??'Special Adviser';
  const waHref=whatsappLink(phone,`Hello, I am contacting the office of ${mode==='incumbent'?esc(displayRole):`former ${esc(displayRole)}`} ${esc(ctx.displayName)}.`);
  return `${CSS}
<section class="pa-contact-hero">
  <h1>Contact the Office</h1>
  <p>${mode==='incumbent'?`Reach the office of ${esc(ctx.displayName)} for portfolio enquiries or official liaison.`:`Contact the team of former ${esc(displayRole)} ${esc(ctx.displayName)}.`}</p>
</section>
${waHref?`<div class="pa-wa-block"><p>Send a WhatsApp message to our office for faster response.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pa-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp the Office</a></div>`:''}
<div class="pa-layout">
  <div class="pa-info">
    <h2>${esc(ctx.displayName)} — ${esc(displayRole)}</h2>
    ${portfolio?`<p><strong>Portfolio:</strong> ${esc(portfolio)}</p>`:''}
    ${placeName?`<p><strong>Location:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>Office contact details coming soon.</p>`:''}
  </div>
  <div class="pa-form-wrap">
    <h2>Send a Message</h2>
    <form class="pa-form" method="POST" action="/contact" id="paForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pa-fg"><label for="pa-name">Your full name</label><input id="pa-name" name="name" type="text" required autocomplete="name" class="pa-input" placeholder="e.g. Yusuf Ibrahim" /></div>
      <div class="pa-fg"><label for="pa-phone">Phone number</label><input id="pa-phone" name="phone" type="tel" autocomplete="tel" class="pa-input" placeholder="0803 000 0000" /></div>
      <div class="pa-fg"><label for="pa-email">Email (optional)</label><input id="pa-email" name="email" type="email" class="pa-input" placeholder="you@example.com" /></div>
      <div class="pa-fg"><label for="pa-msg">Your message or enquiry</label><textarea id="pa-msg" name="message" required rows="4" class="pa-input pa-ta" placeholder="e.g. I have an enquiry related to this portfolio or a stakeholder engagement request."></textarea></div>
      <button type="submit" class="pa-submit">Send Message</button>
    </form>
    <div id="paSuccess" class="pa-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>Our team will respond shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('paForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('paSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const politicalAppointeeOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'political-appointee-official-site',
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
