/**
 * Bakery / Confectionery Site — NF-BAK anchor (VN-BAK-001)
 * Pillar 2 — P2-bakery-confectionery · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • NAFDAC food handler certification badge
 *   • "Pre-Order" WhatsApp CTA — Nigerian bakeries require pre-order for custom items
 *   • Products: birthday cake, wedding cake, bread loaves, small chops, puff puff,
 *     meat pies, chin chin, doughnuts, chin chin, pastries, cupcakes
 *   • "Order 24 hours ahead for custom cakes" trust signal
 *   • NGN pricing; null → "Price on order" (custom cakes are bespoke)
 *   • "Made fresh daily" trust signal
 *   • "No preservatives" — health-conscious Nigerian bakery claim
 *   • Photo gallery implied in copy (no DB — gallery prompt via WhatsApp)
 *   • Instagram handle as social proof mechanism
 *
 * CSS namespace: .bk-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to pre-order from your bakery. Please share your menu and pricing.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.bk-hero{text-align:center;padding:2.75rem 0 2rem}
.bk-logo{height:80px;width:80px;object-fit:contain;border-radius:50%;margin-bottom:1.25rem;border:3px solid var(--ww-primary)}
.bk-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.bk-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.bk-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.bk-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.bk-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.bk-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.bk-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.bk-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.bk-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.bk-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.bk-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.bk-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.bk-section{margin-top:2.75rem}
.bk-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.bk-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.bk-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.bk-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.bk-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.bk-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.bk-card-order{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.bk-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.bk-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.bk-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.bk-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.bk-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.bk-info-item{display:flex;flex-direction:column;gap:.25rem}
.bk-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.bk-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.bk-info-value a{color:var(--ww-primary)}
.bk-about-hero{text-align:center;padding:2.5rem 0 2rem}
.bk-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.bk-body{max-width:44rem;margin:0 auto}
.bk-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.bk-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.bk-drow{display:flex;gap:1rem;align-items:flex-start}
.bk-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.bk-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.bk-dvalue a{color:var(--ww-primary);font-weight:600}
.bk-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.bk-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.bk-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.bk-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.bk-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.bk-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.bk-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.bk-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.bk-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.bk-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.bk-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.bk-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.bk-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.bk-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.bk-layout{grid-template-columns:1fr 1fr}}
.bk-info h2,.bk-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.bk-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.bk-info a{color:var(--ww-primary);font-weight:600}
.bk-form{display:flex;flex-direction:column;gap:.875rem}
.bk-fg{display:flex;flex-direction:column;gap:.375rem}
.bk-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.bk-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.bk-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.bk-ta{min-height:100px;resize:vertical}
.bk-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.bk-submit:hover{filter:brightness(1.1)}
.bk-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.bk-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.bk-ctas{flex-direction:column;align-items:stretch}.bk-wa-btn,.bk-sec-btn{width:100%;justify-content:center}}
</style>`;

const waSvg=()=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;
const cakeSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><line x1="2" y1="21" x2="22" y2="21"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>`;

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
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to pre-order. Please share your menu and pricing.`);
  return `${CSS}
<section class="bk-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="bk-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="bk-tagline">${tag?esc(tag):'Freshly baked every day — birthday cakes, bread, pastries, small chops, and custom orders. WhatsApp us to pre-order.'}</p>
  <div class="bk-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="bk-wa-btn">${waSvg()} Pre-Order Now</a>`:`<a class="bk-wa-btn" href="/contact">${waSvg()} Pre-Order Now</a>`}
    <a href="/services" class="bk-sec-btn">${cakeSvg()} Our Products</a>
  </div>
  <div class="bk-trust-strip">
    <span class="bk-badge"><span class="bk-dot"></span>NAFDAC Certified</span>
    <span class="bk-badge"><span class="bk-dot"></span>Made Fresh Daily</span>
    <span class="bk-badge"><span class="bk-dot"></span>Custom Orders Welcome</span>
  </div>
  <p class="bk-avail">Order custom cakes 24 hrs ahead · ${insta?`Instagram: <a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a> · `:''}Delivery available</p>
</section>
${featured.length?`<section class="bk-section"><h2 class="bk-section-title">Our Baked Goods</h2><div class="bk-grid">${featured.map(o=>`<div class="bk-card"><h3 class="bk-card-name">${esc(o.name)}</h3>${o.description?`<p class="bk-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="bk-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="bk-card-order">Price on order</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="bk-see-all">View all products →</a>`:''}</section>`:''}
${bio?`<div class="bk-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place?`<div class="bk-info-strip">${phone?`<div class="bk-info-item"><span class="bk-info-label">Phone</span><span class="bk-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="bk-info-item"><span class="bk-info-label">Location</span><span class="bk-info-value">${esc(place)}</span></div>`:''}<div class="bk-info-item"><span class="bk-info-label">Order</span><span class="bk-info-value">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const insta=(ctx.data.instagramHandle as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to place a bakery order.`);
  return `${CSS}
<section class="bk-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="bk-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="bk-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="bk-body">
  <p class="bk-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a NAFDAC-certified Nigerian bakery producing fresh bread, cakes, pastries, and confectionery daily. We specialise in custom birthday cakes, wedding cakes, and event small chops. All items are baked fresh with no artificial preservatives.`}</p>
  <div class="bk-details">
    ${cat?`<div class="bk-drow"><span class="bk-dlabel">Bakery Type</span><span class="bk-dvalue">${esc(cat)}</span></div>`:''}
    ${place?`<div class="bk-drow"><span class="bk-dlabel">Location</span><span class="bk-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="bk-drow"><span class="bk-dlabel">Phone</span><span class="bk-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${insta?`<div class="bk-drow"><span class="bk-dlabel">Instagram</span><span class="bk-dvalue"><a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a></span></div>`:''}
  </div>
  <div class="bk-btn-row">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="bk-wa-btn">${waSvg()} Pre-Order Now</a>`:`<a class="bk-wa-btn" href="/contact">${waSvg()} Order Now</a>`}
    <a href="/services" class="bk-sec-btn">${cakeSvg()} Our Products</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to pre-order from your bakery. Please share your menu.`);
  const content=offers.length===0
    ?`<div class="bk-empty"><p>Our full menu is available on WhatsApp.<br/>Message us to see our current baked goods and pricing.</p><br/>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="bk-wa-btn">${waSvg()} Pre-Order on WhatsApp</a>`:`<a class="bk-wa-btn" href="/contact">${waSvg()} Order Now</a>`}</div>`
    :`<div class="bk-grid">${offers.map(o=>`<div class="bk-card"><h3 class="bk-card-name">${esc(o.name)}</h3>${o.description?`<p class="bk-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="bk-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="bk-card-order">Price on order</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="bk-svc-hero"><h1>Our Baked Goods</h1><p class="bk-sub">Fresh every day from ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="bk-cta-strip"><h3>Ready to order?</h3><p>Pre-order on WhatsApp. Custom cakes need at least 24 hours notice.</p><div class="bk-btn-row" style="justify-content:center">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="bk-wa-btn">${waSvg()} Pre-Order on WhatsApp</a>`:`<a class="bk-wa-btn" href="/contact">${waSvg()} Order Now</a>`}<a href="/contact" class="bk-sec-btn">Other Enquiries</a></div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const insta=(ctx.data.instagramHandle as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to place a pre-order. Please share your menu and available dates.`);
  return `${CSS}
<section class="bk-contact-hero"><h1>Pre-Order & Contact</h1><p>Place your order on WhatsApp or send a message and we will get back to you.</p></section>
${wa?`<div class="bk-wa-block"><p>Tell us what you want, your event date (if any), and your delivery address — we will confirm availability and price.</p><a href="${wa}" target="_blank" rel="noopener noreferrer" class="bk-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Pre-Order on WhatsApp</a></div>`:''}
<div class="bk-layout">
  <div class="bk-info"><h2>Bakery Details</h2>${place?`<p><strong>Location:</strong> ${esc(place)}</p>`:''}${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${insta?`<p><strong>Instagram:</strong> <a href="https://instagram.com/${esc(insta.replace('@',''))}" target="_blank" rel="noopener noreferrer">@${esc(insta.replace('@',''))}</a></p>`:''} ${!phone&&!email&&!place&&!insta?`<p>Contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Custom cakes need at least 24 hours notice. All products are NAFDAC certified and made fresh daily.</p></div>
  <div class="bk-form-wrap"><h2>Send an Order</h2>
    <form class="bk-form" method="POST" action="/contact" id="bkForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="bk-fg"><label for="bk-name">Your name</label><input id="bk-name" name="name" type="text" required autocomplete="name" class="bk-input" placeholder="e.g. Chidinma Nwosu" /></div>
      <div class="bk-fg"><label for="bk-phone">Phone number</label><input id="bk-phone" name="phone" type="tel" autocomplete="tel" class="bk-input" placeholder="0803 000 0000" /></div>
      <div class="bk-fg"><label for="bk-msg">Your order details</label><textarea id="bk-msg" name="message" required rows="4" class="bk-input bk-ta" placeholder="e.g. I need a 2-tier birthday cake for 50 people, delivery on Saturday 3 May. Flavour: vanilla + strawberry. Name on cake: 'Happy 30th, Temi'."></textarea></div>
      <button type="submit" class="bk-submit">Send Order Request</button>
    </form>
    <div id="bkSuccess" class="bk-success" style="display:none" role="status" aria-live="polite"><h3>Order request received!</h3><p>We will confirm your order details and pricing shortly. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('bkForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('bkSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const bakeryConfectioneryTemplate:WebsiteTemplateContract={
  slug:'bakery-confectionery',
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
