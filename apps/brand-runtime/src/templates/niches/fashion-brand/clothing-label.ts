/**
 * Fashion Brand / Clothing Label Site — NF-FSH anchor (VN-FSH-001)
 * Pillar 2 — P2-fashion-brand-clothing-label · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • "Made in Nigeria" / "100% Indigenous" trust signal
 *   • CAC registered badge — formal brand registration
 *   • Instagram portfolio link prominent — Nigerian fashion brands live on IG
 *   • "Shop the Collection" + "Custom Orders" as dual CTAs
 *   • Pieces as offerings with NGN prices; null → "Price on request" (bespoke)
 *   • Designer name credentialing
 *   • "We ship nationwide / worldwide" shipping note
 *   • Ankara, Adire, Aso-Oke, Agbada context references
 *   • WhatsApp ordering for custom pieces
 *   • "DM us on Instagram" / "Order via WhatsApp" call pattern
 *
 * CSS namespace: .fb-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to order from your fashion brand. Please share your collection and pricing.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.fb-hero{text-align:center;padding:2.75rem 0 2rem}
.fb-logo{height:90px;width:90px;object-fit:contain;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-primary)}
.fb-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.03em}
.fb-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6;font-style:italic}
.fb-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.fb-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.fb-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.fb-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.fb-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.fb-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.fb-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.fb-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.fb-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.fb-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.fb-section{margin-top:2.75rem}
.fb-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.fb-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.fb-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.fb-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.fb-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.fb-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.fb-card-por{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.fb-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.fb-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.fb-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.fb-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.fb-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.fb-info-item{display:flex;flex-direction:column;gap:.25rem}
.fb-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.fb-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.fb-info-value a{color:var(--ww-primary)}
.fb-about-hero{text-align:center;padding:2.5rem 0 2rem}
.fb-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.02em}
.fb-body{max-width:44rem;margin:0 auto}
.fb-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.fb-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.fb-drow{display:flex;gap:1rem;align-items:flex-start}
.fb-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.fb-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.fb-dvalue a{color:var(--ww-primary);font-weight:600}
.fb-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.fb-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.fb-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.fb-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.fb-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.fb-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.fb-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.fb-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.fb-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.fb-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.fb-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.fb-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.fb-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.fb-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.fb-layout{grid-template-columns:1fr 1fr}}
.fb-info h2,.fb-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.fb-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.fb-info a{color:var(--ww-primary);font-weight:600}
.fb-form{display:flex;flex-direction:column;gap:.875rem}
.fb-fg{display:flex;flex-direction:column;gap:.375rem}
.fb-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.fb-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.fb-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.fb-ta{min-height:100px;resize:vertical}
.fb-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.fb-submit:hover{filter:brightness(1.1)}
.fb-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.fb-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.fb-ctas{flex-direction:column;align-items:stretch}.fb-wa-btn,.fb-sec-btn{width:100%;justify-content:center}}
</style>`;

const waSvg=()=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;
const shirtSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>`;

type Offer={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const insta=(ctx.data.instagramHandle as string|null)??null;
  const featured=offers.slice(0,6);const hasMore=offers.length>6;
  const bio=desc?(desc.length>200?desc.slice(0,200).trimEnd()+'…':desc):null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to shop your collection. Please share your available pieces and pricing.`);
  return `${CSS}
<section class="fb-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="fb-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="fb-tagline">${tag?esc(tag):'Made in Nigeria. Crafted with pride. Ankara, Adire, and contemporary designs for the modern Nigerian.'}</p>
  <div class="fb-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="fb-wa-btn">${waSvg()} Shop the Collection</a>`:`<a class="fb-wa-btn" href="/contact">${waSvg()} Shop Now</a>`}
    <a href="/contact" class="fb-sec-btn">${shirtSvg()} Custom Orders</a>
  </div>
  <div class="fb-trust-strip">
    <span class="fb-badge"><span class="fb-dot"></span>Made in Nigeria</span>
    <span class="fb-badge"><span class="fb-dot"></span>CAC Registered</span>
    <span class="fb-badge"><span class="fb-dot"></span>Nationwide Delivery</span>
  </div>
  <p class="fb-avail">${insta?`Instagram: <a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer" style="color:var(--ww-primary)">@${esc(insta.replace('@',''))}</a> · `:''}Custom orders welcome · Ships worldwide</p>
</section>
${featured.length?`<section class="fb-section"><h2 class="fb-section-title">The Collection</h2><div class="fb-grid">${featured.map(o=>`<div class="fb-card"><h3 class="fb-card-name">${esc(o.name)}</h3>${o.description?`<p class="fb-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="fb-card-price">${fmtKobo(o.priceKobo)}</p>`:`<p class="fb-card-por">Price on request</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="fb-see-all">View full collection →</a>`:''}</section>`:''}
${bio?`<div class="fb-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place||insta?`<div class="fb-info-strip">${phone?`<div class="fb-info-item"><span class="fb-info-label">Order</span><span class="fb-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="fb-info-item"><span class="fb-info-label">Studio</span><span class="fb-info-value">${esc(place)}</span></div>`:''} ${insta?`<div class="fb-info-item"><span class="fb-info-label">Instagram</span><span class="fb-info-value"><a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a></span></div>`:''}</div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const insta=(ctx.data.instagramHandle as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to order from your collection.`);
  return `${CSS}
<section class="fb-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="fb-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="fb-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="fb-body">
  <p class="fb-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a CAC-registered Nigerian fashion label creating contemporary clothing with authentic Nigerian fabrics — Ankara, Adire, Aso-Oke, and more. We ship nationwide and internationally, and welcome custom bespoke orders.`}</p>
  <div class="fb-details">
    ${cat?`<div class="fb-drow"><span class="fb-dlabel">Brand Type</span><span class="fb-dvalue">${esc(cat)}</span></div>`:''}
    ${place?`<div class="fb-drow"><span class="fb-dlabel">Studio</span><span class="fb-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="fb-drow"><span class="fb-dlabel">Phone</span><span class="fb-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${insta?`<div class="fb-drow"><span class="fb-dlabel">Instagram</span><span class="fb-dvalue"><a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a></span></div>`:''}
  </div>
  <div class="fb-btn-row">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="fb-wa-btn">${waSvg()} Shop Now</a>`:`<a class="fb-wa-btn" href="/contact">${waSvg()} Shop Now</a>`}
    <a href="/services" class="fb-sec-btn">${shirtSvg()} View Collection</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to shop your collection. Please share available pieces.`);
  const content=offers.length===0
    ?`<div class="fb-empty"><p>Browse our latest collection on WhatsApp or Instagram.<br/>Message us to see available pieces and place an order.</p><br/>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="fb-wa-btn">${waSvg()} Shop on WhatsApp</a>`:`<a class="fb-wa-btn" href="/contact">${waSvg()} Shop Now</a>`}</div>`
    :`<div class="fb-grid">${offers.map(o=>`<div class="fb-card"><h3 class="fb-card-name">${esc(o.name)}</h3>${o.description?`<p class="fb-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="fb-card-price">${fmtKobo(o.priceKobo)}</p>`:`<p class="fb-card-por">Price on request</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="fb-svc-hero"><h1>The Collection</h1><p class="fb-sub">Ready-to-wear and custom pieces from ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="fb-cta-strip"><h3>Want a custom piece?</h3><p>We welcome bespoke orders. Share your idea, measurements, and occasion — we will bring it to life.</p><div class="fb-btn-row" style="justify-content:center">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="fb-wa-btn">${waSvg()} Order on WhatsApp</a>`:`<a class="fb-wa-btn" href="/contact">${waSvg()} Order Now</a>`}<a href="/contact" class="fb-sec-btn">Custom Order</a></div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const insta=(ctx.data.instagramHandle as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to order from your collection or place a custom order.`);
  return `${CSS}
<section class="fb-contact-hero"><h1>Order & Enquiries</h1><p>Shop our collection or commission a custom piece. We ship Nigeria-wide.</p></section>
${wa?`<div class="fb-wa-block"><p>Tell us what you need — ready-to-wear, custom outfit, or a gift. We will guide you through the process.</p><a href="${wa}" target="_blank" rel="noopener noreferrer" class="fb-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Order on WhatsApp</a></div>`:''}
<div class="fb-layout">
  <div class="fb-info"><h2>Brand Details</h2>${place?`<p><strong>Studio:</strong> ${esc(place)}</p>`:''}${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${insta?`<p><strong>Instagram:</strong> <a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a></p>`:''} ${!phone&&!email&&!place&&!insta?`<p>Contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Made in Nigeria. CAC registered. Nationwide shipping. Custom orders welcomed. Lead time: 5–14 days for bespoke pieces.</p></div>
  <div class="fb-form-wrap"><h2>Order Enquiry</h2>
    <form class="fb-form" method="POST" action="/contact" id="fbForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="fb-fg"><label for="fb-name">Your name</label><input id="fb-name" name="name" type="text" required autocomplete="name" class="fb-input" placeholder="e.g. Adaeze Obi" /></div>
      <div class="fb-fg"><label for="fb-phone">Phone number</label><input id="fb-phone" name="phone" type="tel" autocomplete="tel" class="fb-input" placeholder="0803 000 0000" /></div>
      <div class="fb-fg"><label for="fb-msg">What are you looking for?</label><textarea id="fb-msg" name="message" required rows="4" class="fb-input fb-ta" placeholder="e.g. I saw your Ankara dress on Instagram and would like to order in Size 12. Also interested in a matching fascinator."></textarea></div>
      <button type="submit" class="fb-submit">Send Order Enquiry</button>
    </form>
    <div id="fbSuccess" class="fb-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will get back to you with pricing, availability, and next steps. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('fbForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('fbSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const fashionBrandClothingLabelTemplate:WebsiteTemplateContract={
  slug:'fashion-brand-clothing-label',
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
