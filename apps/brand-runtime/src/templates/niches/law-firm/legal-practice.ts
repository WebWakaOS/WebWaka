/**
 * Law Firm / Legal Practice Site — NF-LAW anchor (VN-LAW-001)
 * Pillar 2 — P2-law-firm-legal-practice · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • NBA (Nigerian Bar Association) membership badge — mandatory for practising
 *   • SAN (Senior Advocate of Nigeria) designation highlighted if applicable
 *   • Serious, formal, trust-first register
 *   • "Book a Consultation" CTA — not WhatsApp-primary (formal legal context)
 *   • Practice areas as offerings; null → "Consultation fee applies"
 *   • "Confidential consultation" trust signal
 *   • Nigerian legal context: property law, company law, criminal, matrimonial, probate
 *   • Supreme Court, Court of Appeal, Federal High Court experience referenced
 *   • No price display without consultation — ethical responsibility
 *
 * CSS namespace: .lf-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to book a legal consultation.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.lf-hero{text-align:center;padding:2.75rem 0 2rem}
.lf-logo{height:80px;width:80px;object-fit:contain;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.lf-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.lf-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.lf-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.lf-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.lf-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.lf-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.lf-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.lf-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.lf-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.lf-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.lf-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.lf-section{margin-top:2.75rem}
.lf-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.lf-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.lf-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.lf-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.lf-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.lf-card-fee{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.lf-card-enquiry{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.lf-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.lf-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.lf-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.lf-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.lf-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.lf-info-item{display:flex;flex-direction:column;gap:.25rem}
.lf-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.lf-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.lf-info-value a{color:var(--ww-primary)}
.lf-about-hero{text-align:center;padding:2.5rem 0 2rem}
.lf-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.lf-body{max-width:44rem;margin:0 auto}
.lf-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.lf-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.lf-drow{display:flex;gap:1rem;align-items:flex-start}
.lf-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.lf-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.lf-dvalue a{color:var(--ww-primary);font-weight:600}
.lf-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.lf-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.lf-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.lf-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.lf-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.lf-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.lf-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.lf-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.lf-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.lf-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.lf-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.lf-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.lf-layout{grid-template-columns:1fr 1fr}}
.lf-info h2,.lf-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.lf-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.lf-info a{color:var(--ww-primary);font-weight:600}
.lf-form{display:flex;flex-direction:column;gap:.875rem}
.lf-fg{display:flex;flex-direction:column;gap:.375rem}
.lf-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.lf-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.lf-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.lf-ta{min-height:100px;resize:vertical}
.lf-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.lf-submit:hover{filter:brightness(1.1)}
.lf-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.lf-success h3{font-weight:700;margin-bottom:.25rem}
.lf-confid{font-size:.8125rem;color:var(--ww-text-muted);margin-top:.625rem;font-style:italic}
@media(max-width:375px){.lf-ctas{flex-direction:column;align-items:stretch}.lf-primary-btn,.lf-sec-btn{width:100%;justify-content:center}}
</style>`;

const scaleSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="21" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>`;
const phoneSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`;

type Offer={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const featured=offers.slice(0,6);const hasMore=offers.length>6;
  const bio=desc?(desc.length>200?desc.slice(0,200).trimEnd()+'…':desc):null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book a legal consultation.`);
  return `${CSS}
<section class="lf-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="lf-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="lf-tagline">${tag?esc(tag):'Experienced Nigerian legal practitioners. Confidential consultations, sound counsel, and rigorous representation across all courts.'}</p>
  <div class="lf-ctas">
    <a href="/contact" class="lf-primary-btn">${scaleSvg()} Book a Consultation</a>
    ${phone?`<a href="tel:${esc(phone)}" class="lf-sec-btn">${phoneSvg()} Call Chambers</a>`:`<a class="lf-sec-btn" href="/services">Practice Areas</a>`}
  </div>
  <div class="lf-trust-strip">
    <span class="lf-badge"><span class="lf-dot"></span>NBA Member</span>
    <span class="lf-badge"><span class="lf-dot"></span>CAC Registered</span>
    <span class="lf-badge"><span class="lf-dot"></span>Confidential Consultation</span>
  </div>
</section>
${featured.length?`<section class="lf-section"><h2 class="lf-section-title">Practice Areas</h2><div class="lf-grid">${featured.map(o=>`<div class="lf-card"><h3 class="lf-card-name">${esc(o.name)}</h3>${o.description?`<p class="lf-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="lf-card-fee">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="lf-card-enquiry">Consultation fee applies</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="lf-see-all">View all practice areas →</a>`:''}</section>`:''}
${bio?`<div class="lf-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place?`<div class="lf-info-strip">${phone?`<div class="lf-info-item"><span class="lf-info-label">Chambers</span><span class="lf-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="lf-info-item"><span class="lf-info-label">Address</span><span class="lf-info-value">${esc(place)}</span></div>`:''}<div class="lf-info-item"><span class="lf-info-label">Consultation</span><span class="lf-info-value"><a href="/contact">Book now →</a></span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const site=(ctx.data.website as string|null)??null;
  return `${CSS}
<section class="lf-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="lf-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="lf-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="lf-body">
  <p class="lf-desc">${desc?esc(desc):`${esc(ctx.displayName)} is an NBA-registered Nigerian law firm providing expert legal counsel and representation across civil, criminal, commercial, property, matrimonial, and probate matters. All consultations are confidential.`}</p>
  <div class="lf-details">
    ${cat?`<div class="lf-drow"><span class="lf-dlabel">Practice Type</span><span class="lf-dvalue">${esc(cat)}</span></div>`:''}
    ${place?`<div class="lf-drow"><span class="lf-dlabel">Chambers</span><span class="lf-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="lf-drow"><span class="lf-dlabel">Phone</span><span class="lf-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${site?`<div class="lf-drow"><span class="lf-dlabel">Portal</span><span class="lf-dvalue"><a href="${safeHref(site)}" target="_blank" rel="noopener noreferrer">${esc(site)} ↗</a></span></div>`:''}
  </div>
  <div class="lf-btn-row">
    <a href="/contact" class="lf-primary-btn">${scaleSvg()} Book a Consultation</a>
    ${phone?`<a href="tel:${esc(phone)}" class="lf-sec-btn">${phoneSvg()} Call Chambers</a>`:''}
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const content=offers.length===0
    ?`<div class="lf-empty"><p>Our practice areas cover a wide range of Nigerian legal matters.<br/>Contact chambers to discuss your specific legal needs.</p><br/><a href="/contact" class="lf-primary-btn">${scaleSvg()} Book a Consultation</a></div>`
    :`<div class="lf-grid">${offers.map(o=>`<div class="lf-card"><h3 class="lf-card-name">${esc(o.name)}</h3>${o.description?`<p class="lf-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="lf-card-fee">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="lf-card-enquiry">Consultation fee applies</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="lf-svc-hero"><h1>Practice Areas</h1><p class="lf-sub">Legal services offered by ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="lf-cta-strip"><h3>Need legal advice?</h3><p>Book a confidential consultation with our experienced legal team.</p><div class="lf-btn-row" style="justify-content:center"><a href="/contact" class="lf-primary-btn">${scaleSvg()} Book a Consultation</a>${phone?`<a href="tel:${esc(phone)}" class="lf-sec-btn">${phoneSvg()} Call Chambers</a>`:''}</div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to book a legal consultation.`);
  return `${CSS}
<section class="lf-contact-hero"><h1>Book a Consultation</h1><p>All consultations are confidential. Provide a brief description of your legal matter and we will respond promptly.</p></section>
<div class="lf-layout">
  <div class="lf-info"><h2>Chambers Details</h2>${place?`<p><strong>Address:</strong> ${esc(place)}</p>`:''}${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${!phone&&!email&&!place?`<p>Chambers contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">NBA-registered practitioners. All information shared is treated with strict confidentiality.</p>${wa?`<p style="margin-top:.5rem"><a href="${wa}" target="_blank" rel="noopener noreferrer" style="color:var(--ww-primary);font-weight:600">WhatsApp Chambers →</a></p>`:''}</div>
  <div class="lf-form-wrap"><h2>Consultation Request</h2>
    <form class="lf-form" method="POST" action="/contact" id="lfForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="lf-fg"><label for="lf-name">Your full name</label><input id="lf-name" name="name" type="text" required autocomplete="name" class="lf-input" placeholder="e.g. Barrister Ngozi Okafor" /></div>
      <div class="lf-fg"><label for="lf-phone">Phone number</label><input id="lf-phone" name="phone" type="tel" autocomplete="tel" class="lf-input" placeholder="0803 000 0000" /></div>
      <div class="lf-fg"><label for="lf-email">Email address</label><input id="lf-email" name="email" type="email" class="lf-input" placeholder="you@example.com" /></div>
      <div class="lf-fg"><label for="lf-msg">Brief description of your legal matter</label><textarea id="lf-msg" name="message" required rows="4" class="lf-input lf-ta" placeholder="e.g. I need advice on a land dispute in Lagos. The other party has filed a claim and I need representation urgently."></textarea></div>
      <button type="submit" class="lf-submit">Send Consultation Request</button>
    </form>
    <p class="lf-confid">All information is treated with strict professional confidentiality.</p>
    <div id="lfSuccess" class="lf-success" style="display:none" role="status" aria-live="polite"><h3>Request received!</h3><p>A member of our legal team will contact you shortly to arrange your consultation.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('lfForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('lfSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const lawFirmLegalPracticeTemplate:WebsiteTemplateContract={
  slug:'law-firm-legal-practice',
  version:'1.0.0',
  pages:['home','about','services','contact'],
  renderPage(ctx:WebsiteRenderContext):string{
    try{
      switch(ctx.pageType){
        case 'home':return renderHome(ctx);
        case 'about':return renderAbout(ctx);
        case 'services':return renderServices(ctx);
        case 'contact':return renderContact(ctx);
        default:return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
      }
    }catch{return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Unable to load page.</p>`}
  },
};
