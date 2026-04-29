/**
 * Software / App Development Agency — VN-PRO-009 (P1, score 44 — highest in candidate set)
 * Pillar 2 — P2-software-agency-software-agency-site
 *
 * Nigeria-First:
 *   • Portfolio-first layout: case studies + tech stack as primary trust signals
 *   • CAC registration badge + ISO/CMMI if applicable
 *   • "Free discovery call" CTA — standard in Nigerian software agency market
 *   • Services: web, mobile (React Native/Flutter), custom ERP, API, cloud
 *   • Client sectors (fintech, logistics, health, govt) as credibility signals
 *   • Project timeline and fixed-price/retainer pricing models
 *
 * CSS namespace: .sa-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */
import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return`https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to discuss a software project with your team.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return'#'}

const CSS=`<style>
.sa-hero{text-align:center;padding:3rem 0 2rem}
.sa-logo{height:80px;width:80px;object-fit:cover;border-radius:12px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.sa-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.sa-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:42rem;margin:0 auto 1.75rem;line-height:1.6}
.sa-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.sa-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.sa-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.sa-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.sa-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.sa-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.sa-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.sa-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.sa-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.sa-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.sa-section{margin-top:2.75rem}
.sa-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.sa-section-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.sa-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.sa-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.sa-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.sa-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.sa-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.sa-card-enq{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.sa-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.sa-stack-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem}
.sa-stack-tag{padding:.3rem .75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:6px;font-size:.8125rem;font-weight:600;color:var(--ww-text-muted)}
.sa-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.sa-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.sa-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.sa-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.sa-info-item{display:flex;flex-direction:column;gap:.25rem}
.sa-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.sa-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.sa-info-value a{color:var(--ww-primary)}
.sa-about-hero{text-align:center;padding:2.5rem 0 2rem}
.sa-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.sa-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.sa-about-body{max-width:44rem;margin:0 auto}
.sa-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.sa-detail-list{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.sa-detail-row{display:flex;gap:1rem;align-items:flex-start}
.sa-detail-label{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.sa-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.sa-detail-value a{color:var(--ww-primary);font-weight:600}
.sa-services-hero{text-align:center;padding:2.5rem 0 2rem}
.sa-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.sa-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.sa-bottom-cta{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.sa-bottom-cta h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.sa-bottom-cta p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.sa-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.sa-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.sa-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.sa-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.sa-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.sa-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.sa-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.sa-contact-layout{grid-template-columns:1fr 1fr}}
.sa-contact-info h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.sa-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.sa-contact-info a{color:var(--ww-primary);font-weight:600}
.sa-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.sa-form{display:flex;flex-direction:column;gap:.875rem}
.sa-form-group{display:flex;flex-direction:column;gap:.375rem}
.sa-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.sa-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.sa-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.sa-textarea{min-height:110px;resize:vertical}
.sa-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.sa-submit:hover{filter:brightness(1.1)}
@media(max-width:375px){.sa-ctas{flex-direction:column;align-items:stretch}.sa-primary-btn,.sa-wa-btn,.sa-sec-btn{width:100%;justify-content:center}}
</style>`;

function waSvg(){return`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`}

type Offering={name:string;description:string|null;priceKobo:number|null};
const STACK=['React','React Native','Flutter','Node.js','Python','Next.js','PostgreSQL','AWS','Firebase','Laravel'];

function renderHome(ctx:WebsiteRenderContext):string{
  const offs=(ctx.data.offerings??[]) as Offering[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const feat=offs.slice(0,6);
  const waHref=waLink(phone,`Hello ${esc(ctx.displayName)}, I have a software project I'd like to discuss with your team.`);
  return`${CSS}
<section class="sa-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="sa-logo"/>`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="sa-tagline">${tag?esc(tag):'We build web apps, mobile apps, and custom software for businesses across Nigeria and beyond. Free discovery call — no obligation.'}</p>
  <div class="sa-ctas">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sa-wa-btn">${waSvg()} Start a Project</a>`:''}
    <a href="/services" class="sa-sec-btn">View Our Work</a>
  </div>
  <div class="sa-trust-strip">
    <span class="sa-badge"><span class="sa-dot"></span>CAC Registered</span>
    <span class="sa-badge"><span class="sa-dot"></span>Free Discovery Call</span>
    <span class="sa-badge"><span class="sa-dot"></span>Agile Delivery</span>
    <span class="sa-badge"><span class="sa-dot"></span>Post-Launch Support</span>
  </div>
</section>
${feat.length?`<section class="sa-section"><h2 class="sa-section-title">What We Build</h2><p class="sa-section-sub">End-to-end software solutions from design to deployment</p><div class="sa-grid">${feat.map(o=>`<div class="sa-card"><h3 class="sa-card-name">${esc(o.name)}</h3>${o.description?`<p class="sa-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="sa-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="sa-card-enq">Price on project scope</p>`}</div>`).join('')}</div>${offs.length>6?`<a href="/services" class="sa-see-all">View all services →</a>`:''}</section>`:''}
<section class="sa-section"><h2 class="sa-section-title">Our Tech Stack</h2><p class="sa-section-sub">Modern tools for production-grade applications</p><div class="sa-stack-row">${STACK.map(t=>`<span class="sa-stack-tag">${t}</span>`).join('')}</div></section>
${desc?`<div class="sa-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(desc.length>220?desc.slice(0,220)+'…':desc)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${(phone||place)?`<div class="sa-info-strip">${phone?`<div class="sa-info-item"><span class="sa-info-label">Phone</span><span class="sa-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="sa-info-item"><span class="sa-info-label">Office</span><span class="sa-info-value">${esc(place)}</span></div>`:''}<div class="sa-info-item"><span class="sa-info-label">Start a Project</span><span class="sa-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const web=(ctx.data.website as string|null)??null;
  const waHref=waLink(phone,`Hello ${esc(ctx.displayName)}, I'd like to learn more about your agency and discuss a potential project.`);
  return`${CSS}
<section class="sa-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="sa-logo"/>`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="sa-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="sa-about-body">
  <p class="sa-about-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a Nigerian software development agency specialising in custom web and mobile application development. We work with startups, SMEs, and enterprise clients across fintech, logistics, healthcare, and government sectors.`}</p>
  <div class="sa-detail-list">
    ${cat?`<div class="sa-detail-row"><span class="sa-detail-label">Agency Type</span><span class="sa-detail-value">${esc(cat)}</span></div>`:''}
    ${place?`<div class="sa-detail-row"><span class="sa-detail-label">Office</span><span class="sa-detail-value">${esc(place)}</span></div>`:''}
    ${phone?`<div class="sa-detail-row"><span class="sa-detail-label">Phone</span><span class="sa-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${web?`<div class="sa-detail-row"><span class="sa-detail-label">Portfolio</span><span class="sa-detail-value"><a href="${safeHref(web)}" target="_blank" rel="noopener noreferrer">${esc(web)} ↗</a></span></div>`:''}
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sa-wa-btn">${waSvg()} Start a Project</a>`:`<a class="sa-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}
    <a href="/services" class="sa-sec-btn">Our Services</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offs=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const waHref=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to discuss a software project and get a quote.`);
  return`${CSS}
<section class="sa-services-hero">
  <h1>Our Services</h1>
  <p style="color:var(--ww-text-muted);max-width:34rem;margin-inline:auto">Software solutions built by ${esc(ctx.displayName)}</p>
</section>
${offs.length===0?`<div class="sa-empty"><p>Our full service list and portfolio are being updated.<br/>Contact us to discuss your project requirements.</p><br/>${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sa-wa-btn">${waSvg()} Start a Project</a>`:`<a class="sa-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}</div>`:`<div class="sa-grid">${offs.map(o=>`<div class="sa-card"><h3 class="sa-card-name">${esc(o.name)}</h3>${o.description?`<p class="sa-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="sa-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="sa-card-enq">Price on project scope</p>`}</div>`).join('')}</div>`}
<div class="sa-bottom-cta"><h3>Have a Project in Mind?</h3><p>Book a free 30-minute discovery call. No sales pressure — just an honest conversation about your needs.</p><div class="sa-btn-row">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sa-wa-btn">${waSvg()} Book Free Discovery Call</a>`:''}</div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const waHref=waLink(phone,'Hello, I would like to discuss a software project with your team.');
  return`${CSS}
<section class="sa-contact-hero">
  <h1>Work With Us</h1>
  <p>Tell us about your project. We'll get back to you within 24 hours.</p>
</section>
${waHref?`<div class="sa-wa-block"><p>Quickest way to reach us — chat directly with our project team:</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sa-wa-btn">${waSvg()} WhatsApp Us</a></div>`:''}
<div class="sa-contact-layout">
  <div class="sa-contact-info">
    <h2>Get in Touch</h2>
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${place?`<p><strong>Office:</strong> ${esc(place)}</p>`:''}
    <p>Discovery calls: Mon–Fri 9am–6pm WAT</p>
  </div>
  <div class="sa-form-wrapper">
    <h2>Tell Us About Your Project</h2>
    <form class="sa-form" action="/api/contact" method="POST">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}"/>
      <div class="sa-form-group"><label for="sa-name">Your Name</label><input id="sa-name" class="sa-input" name="name" type="text" placeholder="Full name" required/></div>
      <div class="sa-form-group"><label for="sa-email">Email Address</label><input id="sa-email" class="sa-input" name="email" type="email" placeholder="you@company.com"/></div>
      <div class="sa-form-group"><label for="sa-msg">Project Brief</label><textarea id="sa-msg" class="sa-input sa-textarea" name="message" placeholder="Describe your project: what you want to build, your timeline, and budget range." required></textarea></div>
      <button type="submit" class="sa-submit">Send Project Brief</button>
    </form>
  </div>
</div>`;
}

export const softwareAgencySoftwareAgencySiteTemplate:WebsiteTemplateContract={
  slug:'software-agency-software-agency-site',
  version:'1.0.0',
  pages:['home','about','services','contact'],
  renderPage(ctx:WebsiteRenderContext):string{
    switch(ctx.pageType){
      case'home':return renderHome(ctx);
      case'about':return renderAbout(ctx);
      case'services':return renderServices(ctx);
      case'contact':return renderContact(ctx);
      default:return`<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
    }
  }
};
