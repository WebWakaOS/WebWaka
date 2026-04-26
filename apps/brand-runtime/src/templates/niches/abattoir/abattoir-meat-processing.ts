/**
 * Abattoir & Meat Processing — Pillar 3 Website Template
 * Niche ID: P3-abattoir-abattoir-meat-processing
 * Vertical: abattoir (priority=3, high)
 * Category: agricultural
 * Family: standalone
 * Research brief: docs/templates/research/abattoir-abattoir-meat-processing-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NAFDAC food safety; NVS (Nigerian Veterinary Service) inspection; Halal certification; FMARD licence; LGA permit; NESREA waste compliance
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to place a bulk meat order.')}`;
}

const CSS = `
<style>
:root{--ab-red:#8b0000;--ab-green:#2d5a27;--ab-dark:#1a2332;--ab-light:#f5f8f4;--ab-text:#1a2332;--ab-muted:#5a6472;--ab-border:#c8d8c4;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--ab-text);background:#fff;font-size:16px;line-height:1.65;}
.ab-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.ab-nav{background:var(--ab-dark);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.ab-nav-brand{color:#fff;font-size:1.1rem;font-weight:700;text-decoration:none;}
.ab-nav-cta{background:var(--ab-green);color:#fff;padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.85rem;}
.ab-hero{background:linear-gradient(160deg,var(--ab-dark) 0%,var(--ab-green) 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;}
.ab-hero-icon{font-size:3rem;margin-bottom:1rem;}
.ab-hero h1{font-size:clamp(1.7rem,4vw,2.4rem);font-weight:700;margin-bottom:.5rem;}
.ab-hero-tagline{opacity:.85;margin-bottom:.5rem;font-size:.95rem;}
.ab-hero-certs{color:#a8ffa8;font-size:.85rem;margin-bottom:2rem;}
.ab-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.95rem;min-height:44px;line-height:1.3;}
.ab-btn-primary{background:var(--ab-green);color:#fff;}
.ab-btn-outline{border:2px solid #fff;color:#fff;}
.ab-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.ab-cert-strip{background:var(--ab-green);color:#fff;text-align:center;padding:.55rem;font-size:.83rem;}
.ab-section{padding:3rem 1rem;}
.ab-section-alt{background:var(--ab-light);}
.ab-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--ab-dark);}
.ab-section-sub{color:var(--ab-muted);margin-bottom:2rem;font-size:.9rem;}
.ab-products{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;}
.ab-product{background:#fff;border-radius:6px;padding:1.25rem;box-shadow:0 1px 6px rgba(0,0,0,.09);border-left:4px solid var(--ab-green);}
.ab-product h3{font-size:1rem;font-weight:700;color:var(--ab-dark);margin-bottom:.5rem;}
.ab-product p{font-size:.9rem;color:var(--ab-muted);}
.ab-product .price{margin-top:.5rem;font-weight:700;color:var(--ab-dark);}
.ab-product .halal{display:inline-block;background:#e8f8e8;color:var(--ab-green);font-size:.75rem;font-weight:700;padding:.2rem .5rem;border-radius:3px;margin-top:.3rem;}
.ab-certs{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-top:1rem;}
.ab-cert-badge{background:#fff;border-radius:6px;padding:1rem;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.07);border:2px solid var(--ab-green);}
.ab-cert-badge .icon{font-size:1.5rem;margin-bottom:.3rem;}
.ab-cert-badge h4{font-size:.85rem;font-weight:700;color:var(--ab-dark);}
.ab-cert-badge p{font-size:.78rem;color:var(--ab-muted);}
.ab-wa-strip{background:var(--ab-dark);color:#fff;padding:2.5rem 1rem;text-align:center;border-top:3px solid var(--ab-green);}
.ab-wa-strip h2{font-size:1.4rem;margin-bottom:.5rem;}
.ab-wa-strip p{opacity:.85;margin-bottom:1.25rem;font-size:.9rem;}
.ab-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.ab-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.ab-contact-box{background:var(--ab-light);padding:1.5rem;border-radius:6px;border:1px solid var(--ab-border);}
.ab-contact-box h3{margin-bottom:1rem;color:var(--ab-dark);font-size:1rem;}
.ab-contact-box a{color:var(--ab-green);font-weight:600;}
.ab-form{display:flex;flex-direction:column;gap:.75rem;}
.ab-input{padding:.7rem 1rem;border:1px solid var(--ab-border);border-radius:4px;font-size:1rem;width:100%;}
.ab-ndpr{font-size:.8rem;color:var(--ab-muted);}
.ab-submit{background:var(--ab-green);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.ab-footer{background:var(--ab-dark);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;}
.ab-footer a{color:#a8ffa8;}
@media(max-width:600px){.ab-hero{padding:2.5rem 1rem 2rem;}.ab-hero h1{font-size:1.6rem;}.ab-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'NAFDAC-Compliant. Halal-Certified. Delivered Fresh.');
  const desc = esc((ctx.data.description as string | null) ?? 'Commercial abattoir and meat processor supplying NAFDAC-compliant, NVS-inspected, and Halal-certified beef, chicken, and goat meat to hotels, restaurants, caterers, and supermarkets across Nigeria.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const nafdacNo = esc((ctx.data.nafdacNumber as string | null) ?? '');
  const halalCert = esc((ctx.data.halalCertification as string | null) ?? 'Halal Certified');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20to%20place%20a%20bulk%20meat%20order.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const productsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="ab-product"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="price">${o.priceKobo !== null ? `${fmtKobo(o.priceKobo)}/kg` : 'Contact for bulk pricing'}</p><span class="halal">Halal ✓</span></div>`).join('')
    : `<div class="ab-product"><h3>🥩 Beef (Whole Carcass)</h3><p>Fresh daily. NVS inspected. Minimum 50kg order.</p><p class="price">From ₦4,500/kg</p><span class="halal">Halal ✓</span></div>
       <div class="ab-product"><h3>🐔 Chicken (Live & Dressed)</h3><p>Daily dressed chickens. Minimum 50 birds.</p><p class="price">From ₦3,200/kg</p><span class="halal">Halal ✓</span></div>
       <div class="ab-product"><h3>🐐 Goat / Ram</h3><p>Whole carcass or cut portions. Market and restaurant supply.</p><p class="price">From ₦5,000/kg</p><span class="halal">Halal ✓</span></div>
       <div class="ab-product"><h3>🫀 Offal (Roundabout)</h3><p>Tripe, liver, kidney, intestine — fresh daily. Suya and buka supply.</p><p class="price">From ₦1,800/kg</p><span class="halal">Halal ✓</span></div>
       <div class="ab-product"><h3>🥩 Pork (Selected Clients)</h3><p>Fresh pork for hotels and non-Muslim caterers. On request.</p><p class="price">From ₦3,800/kg</p></div>
       <div class="ab-product"><h3>❄️ Frozen Bulk</h3><p>IQF frozen cartons. 20kg minimum. NAFDAC-labelled cold chain storage.</p><p class="price">Contact for rates</p><span class="halal">Halal ✓</span></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Meat Processing | ${city}</title>${CSS}</head><body>
<nav class="ab-nav">
  <a href="/" class="ab-nav-brand">🥩 ${name}</a>
  <a href="${waHref}" class="ab-nav-cta" target="_blank" rel="noopener">📱 Bulk Order WhatsApp</a>
</nav>
<div class="ab-cert-strip">
  ✅ NAFDAC Registered ${nafdacNo ? `(${nafdacNo})` : ''} &nbsp;|&nbsp; ${halalCert} &nbsp;|&nbsp; NVS Veterinary Inspection Daily &nbsp;|&nbsp; FMARD Licensed &nbsp;|&nbsp; ${city}
</div>
<section class="ab-hero">
  <div class="ab-hero-icon">🥩</div>
  <h1>${name}</h1>
  <p class="ab-hero-tagline">${tagline}</p>
  <p style="max-width:600px;margin:0 auto .75rem;opacity:.8;font-size:.9rem;">${desc}</p>
  <p class="ab-hero-certs">NAFDAC ${nafdacNo ? `No: ${nafdacNo}` : 'Registered'} | ${halalCert} | NVS Inspected | ${city}</p>
  <div class="ab-hero-btns">
    <a href="${waHref}" class="ab-btn ab-btn-primary" target="_blank" rel="noopener">📱 WhatsApp Bulk Orders</a>
    <a href="/services" class="ab-btn ab-btn-outline">View Products & Prices</a>
  </div>
</section>
<section class="ab-section">
  <div class="ab-container">
    <h2>Products — Fresh Daily</h2>
    <p class="ab-section-sub">All prices per kg in NGN. Minimum orders apply for wholesale. Cold chain maintained.</p>
    <div class="ab-products">${productsHtml}</div>
  </div>
</section>
<section class="ab-section ab-section-alt">
  <div class="ab-container">
    <h2>Our Certifications</h2>
    <p class="ab-section-sub">Compliance you can verify — for hotels, restaurants, caterers, and supermarket procurement</p>
    <div class="ab-certs">
      <div class="ab-cert-badge"><div class="icon">🏛️</div><h4>NAFDAC</h4><p>Food safety registration ${nafdacNo ? `— Reg. No: ${nafdacNo}` : 'registered'}</p></div>
      <div class="ab-cert-badge"><div class="icon">☪️</div><h4>${halalCert}</h4><p>Certified by recognised Halal authority</p></div>
      <div class="ab-cert-badge"><div class="icon">🩺</div><h4>NVS Inspected</h4><p>Ante-mortem & post-mortem inspection daily</p></div>
      <div class="ab-cert-badge"><div class="icon">🌿</div><h4>FMARD Licensed</h4><p>Federal Ministry of Agriculture abattoir licence</p></div>
      <div class="ab-cert-badge"><div class="icon">❄️</div><h4>Cold Chain</h4><p>Refrigerated storage and delivery fleet</p></div>
      <div class="ab-cert-badge"><div class="icon">📋</div><h4>LGA Permit</h4><p>Local government operating permit current</p></div>
    </div>
  </div>
</section>
<section class="ab-wa-strip">
  <h2>📱 Place a Bulk Order</h2>
  <p>Hotels, restaurants, caterers, supermarkets — WhatsApp our sales team for daily prices, delivery schedules, and account setup.</p>
  <a href="${waHref}" class="ab-wa-btn" target="_blank" rel="noopener">WhatsApp Bulk Orders</a>
</section>
<footer class="ab-footer"><div class="ab-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | NAFDAC ${nafdacNo ? `Reg. ${nafdacNo}` : 'Registered'} | ${halalCert} | NVS Inspected | ${city}</p>
  <p style="margin-top:.5rem;font-size:.8rem;">Payment: Paystack · Bank transfer · Cheque (approved accounts) | NDPR-compliant B2B data | <a href="/contact">Contact</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'Commercial abattoir providing NAFDAC-compliant, Halal-certified meat to the food service industry.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const nafdacNo = esc((ctx.data.nafdacNumber as string | null) ?? '');
  const halalCert = esc((ctx.data.halalCertification as string | null) ?? 'Halal Certified');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="ab-nav"><a href="/" class="ab-nav-brand">🥩 ${name}</a><a href="/contact" class="ab-nav-cta">Bulk Orders</a></nav>
<div class="ab-cert-strip">NAFDAC ${nafdacNo ? `Reg. ${nafdacNo}` : 'Registered'} | ${halalCert} | NVS Inspected</div>
<section class="ab-hero" style="padding:3rem 1rem 2.5rem;"><div class="ab-hero-icon">🥩</div><h1>About ${name}</h1><p class="ab-hero-tagline">Compliant. Clean. Fresh. Every Day.</p></section>
<section class="ab-section"><div class="ab-container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
  <div><h2>Our Facility</h2><p style="margin:1rem 0;color:var(--ab-muted);">${desc}</p>${phone ? `<p><strong>Abattoir:</strong> ${phone}</p>` : ''}<p><strong>Location:</strong> ${city}</p></div>
  <div><h2>Compliance</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--ab-muted);">
    ${nafdacNo ? `<li>✅ NAFDAC Food Safety Reg. ${nafdacNo}</li>` : '<li>✅ NAFDAC Food Safety Registered</li>'}
    <li>✅ ${halalCert}</li>
    <li>✅ NVS ante-mortem & post-mortem inspection</li>
    <li>✅ FMARD abattoir licence</li>
    <li>✅ LGA operating permit</li>
    <li>✅ NESREA waste compliance</li>
    <li>✅ Cold chain refrigerated storage</li>
  </ul></div>
</div></div></section>
<footer class="ab-footer"><div class="ab-container"><p>&copy; ${new Date().getFullYear()} ${name} | NAFDAC | ${halalCert} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const nafdacNo = esc((ctx.data.nafdacNumber as string | null) ?? '');
  const halalCert = esc((ctx.data.halalCertification as string | null) ?? 'Halal Certified');
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="ab-product"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="price">${o.priceKobo !== null ? `${fmtKobo(o.priceKobo)}/kg` : 'Contact for rates'}</p><span class="halal">Halal ✓</span></div>`).join('')
    : `<div class="ab-product"><h3>Beef</h3><p>Fresh daily. Wholesale 50kg+.</p><p class="price">From ₦4,500/kg</p><span class="halal">Halal ✓</span></div>
       <div class="ab-product"><h3>Chicken (Dressed)</h3><p>Daily. Minimum 50 birds.</p><p class="price">From ₦3,200/kg</p><span class="halal">Halal ✓</span></div>
       <div class="ab-product"><h3>Goat / Ram</h3><p>Whole carcass or cuts.</p><p class="price">From ₦5,000/kg</p><span class="halal">Halal ✓</span></div>
       <div class="ab-product"><h3>Offal</h3><p>Tripe, liver, kidney — fresh daily.</p><p class="price">From ₦1,800/kg</p><span class="halal">Halal ✓</span></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Products — ${name}</title>${CSS}</head><body>
<nav class="ab-nav"><a href="/" class="ab-nav-brand">🥩 ${name}</a><a href="/contact" class="ab-nav-cta">Order Now</a></nav>
<div class="ab-cert-strip">NAFDAC ${nafdacNo ? `Reg. ${nafdacNo}` : 'Registered'} | ${halalCert} | NVS Inspected | Prices per kg in NGN</div>
<section class="ab-hero" style="padding:3rem 1rem 2.5rem;"><h1>Products & Prices</h1><p class="ab-hero-tagline">Fresh daily. Cold chain maintained. Minimum orders apply for wholesale.</p></section>
<section class="ab-section"><div class="ab-container"><div class="ab-products">${itemsHtml}</div>
<div style="margin-top:2rem;padding:1rem;background:var(--ab-light);border-radius:6px;font-size:.85rem;color:var(--ab-muted);border:1px solid var(--ab-border);">
  <strong>Payment:</strong> Paystack · Bank transfer · Cash (wholesale accounts) | <strong>Delivery:</strong> Refrigerated vehicle, minimum ₦50,000 order for delivery
</div></div></section>
<footer class="ab-footer"><div class="ab-container"><p>&copy; ${new Date().getFullYear()} ${name} | NAFDAC | ${halalCert} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const nafdacNo = esc((ctx.data.nafdacNumber as string | null) ?? '');
  const halalCert = esc((ctx.data.halalCertification as string | null) ?? 'Halal Certified');
  const waHref = waLink(phone, 'Hello, I would like to place a bulk meat order or open a wholesale account.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${name}</title>${CSS}</head><body>
<nav class="ab-nav"><a href="/" class="ab-nav-brand">🥩 ${name}</a><a href="${waHref}" class="ab-nav-cta" target="_blank" rel="noopener">📱 Order</a></nav>
<div class="ab-cert-strip">NAFDAC ${nafdacNo ? `Reg. ${nafdacNo}` : 'Registered'} | ${halalCert} | ${city}</div>
<section class="ab-hero" style="padding:3rem 1rem 2.5rem;"><div class="ab-hero-icon">🥩</div><h1>Bulk Orders & Accounts</h1><p class="ab-hero-tagline">Hotels · Restaurants · Caterers · Supermarkets · Market Traders</p></section>
<section class="ab-section"><div class="ab-container"><div class="ab-contact-grid">
  <div class="ab-contact-box">
    <h3>📱 WhatsApp Bulk Order Line</h3>
    <p>For daily prices, delivery scheduling, and new account setup — WhatsApp our sales team.</p>
    <a href="${waHref}" class="ab-btn ab-btn-primary" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">WhatsApp Order Line</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Abattoir:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Location:</strong> ${city}, Nigeria</p>
    ${nafdacNo ? `<p><strong>NAFDAC Reg.:</strong> ${nafdacNo}</p>` : ''}
  </div>
  <div class="ab-contact-box">
    <h3>Wholesale Account / Procurement Enquiry</h3>
    <form class="ab-form" onsubmit="return false;">
      <input class="ab-input" type="text" placeholder="Business name" autocomplete="organization">
      <input class="ab-input" type="text" placeholder="Contact person name">
      <input class="ab-input" type="tel" placeholder="Phone number (WhatsApp)" autocomplete="tel">
      <input class="ab-input" type="email" placeholder="Email address" autocomplete="email">
      <select class="ab-input"><option value="">-- Business type --</option><option>Hotel / Restaurant</option><option>Catering Company</option><option>Supermarket / Retail</option><option>Market Butcher</option><option>Event Caterer</option><option>Individual Buyer</option></select>
      <input class="ab-input" type="text" placeholder="Estimated weekly order (e.g. 200kg beef, 100 chickens)">
      <div><input type="checkbox" id="ndpr-ab" required> <label for="ndpr-ab" class="ab-ndpr">I consent to ${name} processing my business contact details for this procurement enquiry, in accordance with Nigeria's NDPR.</label></div>
      <button class="ab-submit" type="submit">Submit Order Enquiry</button>
    </form>
  </div>
</div></div></section>
<footer class="ab-footer"><div class="ab-container"><p>&copy; ${new Date().getFullYear()} ${name} | NAFDAC | ${halalCert} | NVS Inspected | NDPR Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const abattoirAbattoirMeatProcessingTemplate: WebsiteTemplateContract = {
  slug: 'abattoir-abattoir-meat-processing',
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
