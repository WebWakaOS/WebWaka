/**
 * Cassava Miller / Garri Producer — Pillar 3 Website Template
 * Niche ID: P3-cassava-miller-cassava-miller-site
 * Vertical: cassava-miller (priority=3, critical)
 * Category: agricultural
 * Family: NF-AGR-PRO anchor (grain processing family)
 * Research brief: docs/templates/research/cassava-miller-cassava-miller-site-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: NAFDAC food processing registration, SON quality mark, FMARD licence
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fmtKobo(kobo: number): string {
  return `\u20A6${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

function waLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g, '');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234' + d.slice(1) : '234' + d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to order garri / cassava products.')}`;
}

const CSS = `
<style>
:root{--cm-green:#2d6a4f;--cm-gold:#e9c46a;--cm-brown:#6b4226;--cm-light:#f0f7f4;--cm-text:#2c2c2c;--cm-muted:#6c757d;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',sans-serif;color:var(--cm-text);background:#fff;font-size:16px;line-height:1.6;}
.cm-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.cm-nav{background:var(--cm-green);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.cm-nav-brand{color:#fff;font-size:1.3rem;font-weight:700;text-decoration:none;}
.cm-nav-cta{background:var(--cm-gold);color:var(--cm-brown);padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9rem;}
.cm-hero{background:linear-gradient(135deg,var(--cm-green) 0%,#40916c 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;}
.cm-hero h1{font-size:clamp(1.8rem,5vw,2.6rem);font-weight:800;margin-bottom:.75rem;}
.cm-hero-badge{background:var(--cm-gold);color:var(--cm-brown);display:inline-block;padding:.4rem 1rem;border-radius:20px;font-size:.85rem;font-weight:700;margin-bottom:1rem;}
.cm-hero p{max-width:600px;margin:0 auto 1.5rem;opacity:.9;}
.cm-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:700;font-size:1rem;min-height:44px;line-height:1.3;}
.cm-btn-wa{background:#25D366;color:#fff;}
.cm-btn-outline{border:2px solid #fff;color:#fff;}
.cm-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.cm-nafdac{background:var(--cm-brown);color:#fff;text-align:center;padding:.75rem;font-size:.85rem;}
.cm-nafdac strong{color:var(--cm-gold);}
.cm-section{padding:3rem 1rem;}
.cm-section-alt{background:var(--cm-light);}
.cm-section h2{font-size:1.6rem;font-weight:700;margin-bottom:.5rem;color:var(--cm-green);}
.cm-section-sub{color:var(--cm-muted);margin-bottom:2rem;}
.cm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;}
.cm-card{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.08);border-top:4px solid var(--cm-gold);}
.cm-card h3{font-size:1.05rem;font-weight:700;margin-bottom:.5rem;color:var(--cm-brown);}
.cm-card p{color:var(--cm-muted);font-size:.9rem;}
.cm-price{margin-top:.75rem;font-weight:700;color:var(--cm-green);font-size:1rem;}
.cm-wa-strip{background:#25D366;color:#fff;padding:2rem 1rem;text-align:center;}
.cm-wa-strip h2{font-size:1.5rem;margin-bottom:.5rem;}
.cm-wa-btn{background:#fff;color:#128C7E;font-weight:700;padding:.75rem 2rem;border-radius:6px;text-decoration:none;display:inline-block;}
.cm-testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;margin-top:1.5rem;}
.cm-testi{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 6px rgba(0,0,0,.08);}
.cm-testi-text{font-style:italic;margin-bottom:.75rem;}
.cm-testi-author{font-weight:700;font-size:.9rem;color:var(--cm-green);}
.cm-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.cm-contact-box{background:var(--cm-light);padding:1.5rem;border-radius:8px;}
.cm-contact-box h3{margin-bottom:1rem;color:var(--cm-green);}
.cm-contact-box a{color:var(--cm-green);font-weight:600;}
.cm-form{display:flex;flex-direction:column;gap:.75rem;}
.cm-input{padding:.75rem;border:1px solid #ddd;border-radius:6px;font-size:1rem;width:100%;}
.cm-ndpr{font-size:.8rem;color:var(--cm-muted);}
.cm-submit{background:var(--cm-green);color:#fff;border:none;padding:.75rem 1.5rem;border-radius:6px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.cm-footer{background:var(--cm-green);color:rgba(255,255,255,.85);text-align:center;padding:1.5rem;font-size:.85rem;}
.cm-footer a{color:var(--cm-gold);}
@media(max-width:600px){.cm-hero{padding:2.5rem 1rem 2rem;}.cm-hero h1{font-size:1.6rem;}.cm-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Fresh Garri & Cassava Products — From Farm to Table');
  const desc = esc((ctx.data.description as string | null) ?? 'We produce and supply premium white and yellow garri, cassava flour, fufu, and corn flour to distributors, restaurants, caterers, and households across Nigeria.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Onitsha');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20to%20order%20garri.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const productsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="cm-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="cm-price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Call for price'}</p></div>`).join('')
    : `
      <div class="cm-card"><h3>White Garri (Ijebu)</h3><p>Fine, crispy, farm-fresh white garri. NAFDAC registered. Available in 25kg and 50kg bags.</p><p class="cm-price">From ₦18,000 / 25kg</p></div>
      <div class="cm-card"><h3>Yellow Garri</h3><p>Palm oil-enriched yellow garri from high-quality cassava tubers. Rich flavour, excellent soaking quality.</p><p class="cm-price">From ₦20,000 / 25kg</p></div>
      <div class="cm-card"><h3>Cassava Flour</h3><p>High-quality cassava flour for baking, swallow, and industrial food use. NAFDAC certified.</p><p class="cm-price">From ₦22,000 / 25kg</p></div>
      <div class="cm-card"><h3>Fufu (Cassava)</h3><p>Smooth, fermented cassava fufu paste — packaged hygienically for households and restaurants.</p><p class="cm-price">From ₦1,500 / 500g wrap</p></div>
      <div class="cm-card"><h3>Corn Flour (Tuwo)</h3><p>Freshly milled corn flour for tuwo shinkafa and corn pudding. Northern Nigeria staple.</p><p class="cm-price">From ₦16,000 / 25kg</p></div>
      <div class="cm-card"><h3>Toll Milling Service</h3><p>Bring your cassava/maize and we process it for you. Fast turnaround, competitive rates per bag.</p><p class="cm-price">₦1,500 / 25kg bag</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Garri & Cassava Products | ${city}</title>${CSS}</head><body>
<nav class="cm-nav">
  <a href="/" class="cm-nav-brand">🌾 ${name}</a>
  <a href="${waHref}" class="cm-nav-cta" target="_blank" rel="noopener">📱 Order on WhatsApp</a>
</nav>
<div class="cm-nafdac">
  <strong>NAFDAC Registered</strong> &nbsp;|&nbsp; <strong>SON Quality Mark</strong> &nbsp;|&nbsp; FMARD Agro-Processing Licence &nbsp;|&nbsp; Farm-to-Table Fresh
</div>
<section class="cm-hero">
  <div class="cm-hero-badge">🌾 Cassava Miller & Garri Producer — ${city}</div>
  <h1>${name}</h1>
  <p>${tagline}</p>
  <p>${desc}</p>
  <div class="cm-hero-btns">
    <a href="${waHref}" class="cm-btn cm-btn-wa" target="_blank" rel="noopener">📱 Order on WhatsApp</a>
    <a href="/services" class="cm-btn cm-btn-outline">View Products & Prices</a>
  </div>
</section>
<section class="cm-section">
  <div class="cm-container">
    <h2>Our Products</h2>
    <p class="cm-section-sub">NAFDAC-certified cassava and grain products available wholesale and retail. All prices in Nigerian Naira (₦).</p>
    <div class="cm-grid">${productsHtml}</div>
  </div>
</section>
<section class="cm-wa-strip">
  <h2>📱 Standing Orders Welcome</h2>
  <p>Restaurants, caterers, distributors — set up a weekly standing order on WhatsApp for consistent supply and preferential pricing.</p>
  <a href="${waHref}" class="cm-wa-btn" target="_blank" rel="noopener">Set Up Your Order on WhatsApp</a>
</section>
<section class="cm-section cm-section-alt">
  <div class="cm-container">
    <h2>What Customers Say</h2>
    <div class="cm-testimonials">
      <div class="cm-testi"><p class="cm-testi-text">"Best white garri in Onitsha. Consistent quality, delivered on time. My restaurant depends on them every week."</p><p class="cm-testi-author">— Ngozi Okafor, Restaurant Owner, Enugu</p></div>
      <div class="cm-testi"><p class="cm-testi-text">"Their toll milling service saved our cooperative. We bring the cassava, they process it cleanly and fast. NAFDAC-compliant output."</p><p class="cm-testi-author">— Emeka Eze, Farm Cooperative, Benue</p></div>
    </div>
  </div>
</section>
<footer class="cm-footer"><div class="cm-container"><p>&copy; ${new Date().getFullYear()} ${name}. NAFDAC Registered. FMARD Licensed. | Payment: Bank Transfer · POS · Mobile Money | <a href="/contact">Contact Us</a></p></div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'We are a NAFDAC-registered cassava miller and garri producer, supplying fresh, high-quality products to distributors, restaurants, and households across Nigeria.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Onitsha');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="cm-nav"><a href="/" class="cm-nav-brand">🌾 ${name}</a><a href="/contact" class="cm-nav-cta">Contact Us</a></nav>
<section class="cm-hero" style="padding:3rem 1rem 2rem;"><h1>About ${name}</h1><p>Rooted in the cassava belt, serving Nigeria's tables</p></section>
<section class="cm-section"><div class="cm-container"><div class="cm-grid">
  <div><h2>Our Story</h2><p style="margin:1rem 0;color:var(--cm-muted)">${desc}</p><p>Based in ${city}, we have been part of Nigeria's cassava value chain for years — sourcing from local farmers, processing with SON-compliant equipment, and delivering fresh products to customers across the country.</p>${phone ? `<p style="margin-top:1rem;"><strong>Phone:</strong> ${phone}</p>` : ''}</div>
  <div><h2>Our Certifications</h2>
    <ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--cm-muted);">
      <li>✅ NAFDAC Food Processing Registration</li>
      <li>✅ SON Quality Mark Certification</li>
      <li>✅ FMARD Agro-Processing Licence</li>
      <li>✅ CAC Business Registration</li>
      <li>✅ NESREA Environmental Compliance</li>
    </ul>
  </div>
</div></div></section>
<footer class="cm-footer"><div class="cm-container"><p>&copy; ${new Date().getFullYear()} ${name} | NAFDAC Registered | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="cm-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="cm-price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Call for price'}</p></div>`).join('')
    : `<div class="cm-card"><h3>White Garri (Ijebu)</h3><p>Fine crispy garri. NAFDAC registered.</p><p class="cm-price">From ₦18,000 / 25kg</p></div>
       <div class="cm-card"><h3>Yellow Garri</h3><p>Palm-oil enriched, excellent quality.</p><p class="cm-price">From ₦20,000 / 25kg</p></div>
       <div class="cm-card"><h3>Cassava Flour</h3><p>High-quality flour for swallow and baking.</p><p class="cm-price">From ₦22,000 / 25kg</p></div>
       <div class="cm-card"><h3>Fufu</h3><p>Fermented cassava fufu, hygienically packaged.</p><p class="cm-price">From ₦1,500 / 500g</p></div>
       <div class="cm-card"><h3>Corn Flour</h3><p>Freshly milled, for tuwo and corn dishes.</p><p class="cm-price">From ₦16,000 / 25kg</p></div>
       <div class="cm-card"><h3>Toll Milling</h3><p>We process your cassava/maize on-site.</p><p class="cm-price">₦1,500 per 25kg bag</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Products — ${name}</title>${CSS}</head><body>
<nav class="cm-nav"><a href="/" class="cm-nav-brand">🌾 ${name}</a><a href="/contact" class="cm-nav-cta">Order Now</a></nav>
<section class="cm-hero" style="padding:3rem 1rem 2rem;"><h1>Products & Milling Services</h1><p>NAFDAC-certified. All prices in Nigerian Naira (₦).</p></section>
<section class="cm-section"><div class="cm-container"><div class="cm-grid">${itemsHtml}</div></div></section>
<footer class="cm-footer"><div class="cm-container"><p>&copy; ${new Date().getFullYear()} ${name} | NAFDAC Registered | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Onitsha');
  const waHref = waLink(phone, 'Hello, I would like to order garri / cassava products.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${name}</title>${CSS}</head><body>
<nav class="cm-nav"><a href="/" class="cm-nav-brand">🌾 ${name}</a><a href="${waHref}" class="cm-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="cm-hero" style="padding:3rem 1rem 2rem;"><h1>Place Your Order</h1><p>WhatsApp orders processed fastest — we respond within minutes</p></section>
<section class="cm-section"><div class="cm-container"><div class="cm-contact-grid">
  <div class="cm-contact-box">
    <h3>📱 WhatsApp Order (Fastest)</h3>
    <p>Send your product, quantity, and delivery address on WhatsApp.</p>
    <a href="${waHref}" class="cm-btn cm-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">Open WhatsApp</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Mill Location:</strong> ${city}, Nigeria</p>
  </div>
  <div class="cm-contact-box">
    <h3>Quick Order Form</h3>
    <form class="cm-form" onsubmit="return false;">
      <input class="cm-input" type="text" placeholder="Your name" autocomplete="name">
      <input class="cm-input" type="tel" placeholder="Phone (e.g. 08012345678)" autocomplete="tel">
      <select class="cm-input"><option value="">-- Select product --</option><option>White Garri (25kg)</option><option>Yellow Garri (25kg)</option><option>Cassava Flour (25kg)</option><option>Fufu</option><option>Corn Flour</option><option>Toll Milling</option></select>
      <input class="cm-input" type="number" placeholder="Quantity (bags/kg)" min="1">
      <textarea class="cm-input" rows="2" placeholder="Delivery address or special instructions..."></textarea>
      <div><input type="checkbox" id="ndpr-cm" required> <label for="ndpr-cm" class="cm-ndpr">I consent to ${name} storing my contact details to process this order, per Nigeria's NDPR.</label></div>
      <button class="cm-submit" type="submit">Send Order on WhatsApp</button>
    </form>
  </div>
</div>
<div style="margin-top:2rem;padding:1rem;background:var(--cm-light);border-radius:8px;font-size:.85rem;color:var(--cm-muted);">
  <strong>Payment:</strong> Bank transfer · POS on collection · Mobile money (Opay, Palmpay)
</div>
</div></section>
<footer class="cm-footer"><div class="cm-container"><p>&copy; ${new Date().getFullYear()} ${name} | NAFDAC Registered | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const cassavaMillerCassavaMillerSiteTemplate: WebsiteTemplateContract = {
  slug: 'cassava-miller-cassava-miller-site',
  version: '1.0.0',
  pages: ['home', 'about', 'services', 'contact'],
  renderPage(ctx: WebsiteRenderContext): string {
    switch (ctx.pageType) {
      case 'home': return renderHome(ctx);
      case 'about': return renderAbout(ctx);
      case 'services': return renderServices(ctx);
      case 'contact': return renderContact(ctx);
      default: return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
    }
  },
};
