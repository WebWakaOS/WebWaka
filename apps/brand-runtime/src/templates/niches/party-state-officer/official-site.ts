/**
 * Party State Officer Official Site — NF-POL-PTY variant (VN-POL-020)
 * Pillar 2 — P2-party-state-officer-official-site · Sprint 4
 *
 * Nigeria-First:
 *   • State-level party leadership: State Chairman, Deputy Chairman, Secretary, Publicity Secretary
 *   • Commands state structure — supervises LGA and ward chapters
 *   • Two modes: active | post_office (no campaign mode — intra-party congress)
 *   • CSS prefix: .pso-
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

type PartyMode='active'|'post_office';
function getMode(ctx:WebsiteRenderContext):PartyMode{
  const m=ctx.data?.mode as string|undefined;
  if(m==='post_office')return 'post_office';
  return 'active';
}

const CSS=`<style>
:root{--ww-party-primary:var(--ww-primary)}
.pso-hero{text-align:center;padding:2.75rem 0 2rem}
.pso-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-party-primary)}
.pso-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.375rem;color:var(--ww-text);letter-spacing:-.02em}
.pso-subtitle{font-size:1.0625rem;font-weight:600;color:var(--ww-party-primary);margin-bottom:.875rem}
.pso-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.pso-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pso-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.pso-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-party-primary);color:var(--ww-party-primary);white-space:nowrap}
.pso-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-party-primary);flex-shrink:0}
.pso-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-party-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.pso-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.pso-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-party-primary);color:var(--ww-party-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px}
.pso-sec-btn:hover{background:var(--ww-party-primary);color:#fff;text-decoration:none}
.pso-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.pso-section{margin-top:2.75rem}
.pso-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-party-primary)}
.pso-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.pso-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-party-primary)}
.pso-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.pso-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.pso-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pso-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.pso-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.pso-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.pso-info-item{display:flex;flex-direction:column;gap:.25rem}
.pso-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pso-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.pso-info-value a{color:var(--ww-party-primary)}
.pso-about-hero{text-align:center;padding:2.5rem 0 2rem}
.pso-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.375rem;letter-spacing:-.01em}
.pso-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-party-primary);color:#fff;margin-bottom:1rem}
.pso-body{max-width:44rem;margin:0 auto}
.pso-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.pso-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.pso-drow{display:flex;gap:1rem;align-items:flex-start}
.pso-dlabel{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.pso-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.pso-dvalue a{color:var(--ww-party-primary);font-weight:600}
.pso-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.pso-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.pso-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pso-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.pso-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.pso-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.pso-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.pso-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.pso-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.pso-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.pso-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.pso-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.pso-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.pso-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.pso-layout{grid-template-columns:1fr 1fr}}
.pso-info h2,.pso-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.pso-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.pso-info a{color:var(--ww-party-primary);font-weight:600}
.pso-form{display:flex;flex-direction:column;gap:.875rem}
.pso-fg{display:flex;flex-direction:column;gap:.375rem}
.pso-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.pso-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.pso-input:focus{outline:2px solid var(--ww-party-primary);outline-offset:1px;border-color:transparent}
.pso-ta{min-height:100px;resize:vertical}
.pso-submit{padding:.875rem 1.5rem;background:var(--ww-party-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;font-family:var(--ww-font)}
.pso-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
@media(max-width:375px){.pso-ctas{flex-direction:column;align-items:stretch}.pso-primary-btn,.pso-sec-btn,.pso-wa-btn{width:100%;justify-content:center}}
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
  const stateRole=(ctx.data.stateRole as string|null)??'State Officer';
  const state=placeName??'the State';
  const waHref=whatsappLink(phone,`Hello, I would like to reach ${esc(stateRole)} ${esc(ctx.displayName)} of the ${esc(party??'party')} state structure.`);
  const heroSubtitle=mode==='active'
    ?`${esc(stateRole)} — ${esc(state)}${party?`, ${esc(party)}`:''}`
    :`Former ${esc(stateRole)} — ${esc(state)}${party?`, ${esc(party)}`:''}`;
  const defaultTagline=mode==='active'
    ?`Leading the ${esc(party??'party')} state structure in ${esc(state)}: coordinating LGA chapters, directing state campaigns, and driving membership expansion.`
    :`Proud to have led the ${esc(party??'party')} state structure and strengthened our party's presence across ${esc(state)}.`;
  const trustBadges=`<span class="pso-badge"><span class="pso-dot"></span>${mode==='active'?esc(stateRole):`Former ${esc(stateRole)}`}</span>${party?`<span class="pso-badge"><span class="pso-dot"></span>${esc(party)}</span>`:''}${placeName?`<span class="pso-badge"><span class="pso-dot"></span>${esc(placeName)} State</span>`:''}`;
  const svcLabel=mode==='active'?'State Programmes':'State Record';
  const featured=offerings.slice(0,6);
  const bio=description?(description.length>200?description.slice(0,200).trimEnd()+'…':description):null;
  const grid=featured.length===0?'':`<section class="pso-section"><h2 class="pso-section-title">${esc(svcLabel)}</h2><div class="pso-grid">${featured.map(o=>`<div class="pso-card"><h3 class="pso-card-name">${esc(o.name)}</h3>${o.description?`<p class="pso-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div></section>`;
  return `${CSS}
<section class="pso-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pso-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="pso-subtitle">${heroSubtitle}</p>
  <p class="pso-tagline">${tagline?esc(tagline):defaultTagline}</p>
  <div class="pso-ctas">
    <a href="/services" class="pso-primary-btn">${mode==='active'?'State Programmes':'View Record'}</a>
    <a href="/contact" class="pso-sec-btn">Contact</a>
  </div>
  <div class="pso-trust-strip">${trustBadges}</div>
</section>
${grid}
${bio?`<div class="pso-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary)">Read full profile →</a></div>`:''}
${phone||placeName?`<div class="pso-info-strip">${placeName?`<div class="pso-info-item"><span class="pso-info-label">State</span><span class="pso-info-value">${esc(placeName)}</span></div>`:''} ${party?`<div class="pso-info-item"><span class="pso-info-label">Party</span><span class="pso-info-value">${esc(party)}</span></div>`:''} ${phone?`<div class="pso-info-item"><span class="pso-info-label">Phone</span><span class="pso-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} <div class="pso-info-item"><span class="pso-info-label">WhatsApp</span><span class="pso-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">Chat →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const description=(ctx.data.description as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const stateRole=(ctx.data.stateRole as string|null)??'State Officer';
  const state=placeName??'the State';
  const waHref=whatsappLink(phone,`Hello, I would like to contact ${esc(stateRole)} ${esc(ctx.displayName)}.`);
  const roleLabel=mode==='active'?`${esc(stateRole)}, ${esc(state)}`:`Former ${esc(stateRole)}, ${esc(state)}`;
  const defaultDesc=mode==='active'
    ?`${esc(ctx.displayName)} serves as ${esc(stateRole)} of ${esc(party??'the party')} in ${esc(state)}. Responsible for state party coordination, campaign leadership, and managing the LGA/ward chapter network.`
    :`${esc(ctx.displayName)} served as ${esc(stateRole)} of ${esc(party??'the party')} in ${esc(state)}, providing strategic leadership to the state structure and delivering key party milestones.`;
  return `${CSS}
<section class="pso-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pso-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <span class="pso-cat-badge">${roleLabel}</span>
</section>
<div class="pso-body">
  <p class="pso-desc">${description?esc(description):defaultDesc}</p>
  <div class="pso-details">
    ${stateRole?`<div class="pso-drow"><span class="pso-dlabel">Role</span><span class="pso-dvalue">${esc(stateRole)}</span></div>`:''}
    ${party?`<div class="pso-drow"><span class="pso-dlabel">Party</span><span class="pso-dvalue">${esc(party)}</span></div>`:''}
    ${placeName?`<div class="pso-drow"><span class="pso-dlabel">State</span><span class="pso-dvalue">${esc(placeName)}</span></div>`:''}
    <div class="pso-drow"><span class="pso-dlabel">Selection</span><span class="pso-dvalue">State party congress</span></div>
    ${phone?`<div class="pso-drow"><span class="pso-dlabel">Phone</span><span class="pso-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
  </div>
  <div class="pso-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pso-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="pso-sec-btn">Send a Message</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const stateRole=(ctx.data.stateRole as string|null)??'State Officer';
  const state=placeName??'the State';
  const waHref=whatsappLink(phone,`Hello, I would like to enquire about state party programmes under ${esc(ctx.displayName)}.`);
  const pageTitle=mode==='active'?'State Programmes':'State Record';
  const pageSubtitle=mode==='active'?`Active programmes and drives by ${esc(stateRole)} ${esc(ctx.displayName)}, ${esc(state)}`:`Achievements and activities during the tenure of ${esc(stateRole)} ${esc(ctx.displayName)}, ${esc(state)}`;
  const emptyMsg=mode==='active'?'State programmes are being published. Contact the state leadership.':'Record being compiled.';
  const content=offerings.length===0?`<div class="pso-empty"><p>${esc(emptyMsg)}</p>${waHref?`<br/><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pso-wa-btn">${waSvg()} WhatsApp</a>`:`<br/><a class="pso-primary-btn" href="/contact">Contact</a>`}</div>`
    :`<div class="pso-grid">${offerings.map(o=>`<div class="pso-card"><h3 class="pso-card-name">${esc(o.name)}</h3>${o.description?`<p class="pso-card-desc">${esc(o.description)}</p>`:''}${o.priceKobo!==null?`<p style="font-size:.9375rem;font-weight:600;color:var(--ww-party-primary);margin:.375rem 0 0">${fmtKobo(o.priceKobo)}</p>`:''}</div>`).join('')}</div>`;
  return `${CSS}
<section class="pso-svc-hero"><h1>${esc(pageTitle)}</h1><p class="pso-sub">${esc(pageSubtitle)}</p></section>
<section>${content}</section>
<div class="pso-cta-strip">
  <h3>${mode==='active'?`Engage the ${esc(party??'Party')} State Leadership`:'Connect'}</h3>
  <p>${mode==='active'?`For party engagement, inter-chapter matters, or state programmes in ${esc(state)}, reach the state office.`:`Reach the former state leadership team.`}</p>
  <div class="pso-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pso-wa-btn">${waSvg()} WhatsApp</a>`:''}
    <a href="/contact" class="pso-sec-btn">Contact</a>
  </div>
</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const mode=getMode(ctx);
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const party=(ctx.data.party as string|null)??null;
  const stateRole=(ctx.data.stateRole as string|null)??'State Officer';
  const state=placeName??'the State';
  const waHref=whatsappLink(phone,`Hello, I would like to contact ${mode==='active'?esc(stateRole):`former ${esc(stateRole)}`} ${esc(ctx.displayName)}, ${esc(state)}.`);
  return `${CSS}
<section class="pso-contact-hero">
  <h1>Contact the State Office</h1>
  <p>${mode==='active'?`Reach ${esc(stateRole)} ${esc(ctx.displayName)} for party matters, inter-chapter engagement, or media enquiries.`:`Contact the team of former ${esc(stateRole)} ${esc(ctx.displayName)}, ${esc(state)}.`}</p>
</section>
${waHref?`<div class="pso-wa-block"><p>Send a WhatsApp message to the state office for faster response.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pso-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp</a></div>`:''}
<div class="pso-layout">
  <div class="pso-info">
    <h2>${esc(stateRole)}${party?` — ${esc(party)}`:''}, ${esc(state)}</h2>
    ${placeName?`<p><strong>State:</strong> ${esc(placeName)}</p>`:''}
    ${party?`<p><strong>Party:</strong> ${esc(party)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email?`<p>State office contact details coming soon.</p>`:''}
  </div>
  <div class="pso-form-wrap">
    <h2>Send a Message</h2>
    <form class="pso-form" method="POST" action="/contact" id="psoForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pso-fg"><label for="pso-name">Your full name</label><input id="pso-name" name="name" type="text" required autocomplete="name" class="pso-input" placeholder="e.g. Fatima Usman" /></div>
      <div class="pso-fg"><label for="pso-phone">Phone number</label><input id="pso-phone" name="phone" type="tel" autocomplete="tel" class="pso-input" placeholder="0803 000 0000" /></div>
      <div class="pso-fg"><label for="pso-email">Email (optional)</label><input id="pso-email" name="email" type="email" class="pso-input" placeholder="you@example.com" /></div>
      <div class="pso-fg"><label for="pso-msg">Your message</label><textarea id="pso-msg" name="message" required rows="4" class="pso-input pso-ta" placeholder="e.g. I have a state party enquiry or inter-chapter coordination matter."></textarea></div>
      <button type="submit" class="pso-submit">Send Message</button>
    </form>
    <div id="psoSuccess" class="pso-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>The state office team will respond shortly.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('psoForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('psoSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const partyStateOfficerOfficialSiteTemplate:WebsiteTemplateContract={
  slug:'party-state-officer-official-site',
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
