/**
 * Airtime & VTU Reseller — Pillar 3 Website Template
 * Niche ID: P3-airtime-reseller-airtime-vtu-reseller
 * Vertical: airtime-reseller (priority=3, high)
 * Category: fintech
 * Family: NF-FIN-TEL standalone
 * Research brief: docs/templates/research/airtime-reseller-airtime-vtu-reseller-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: CAC registration; FIRS TIN; NCC licensed reseller; CBN oversight for bulk VTU
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I want to buy airtime or data.')}`;
}

const CSS = `
<style>
:root{--ar-yellow:#ffd700;--ar-dark:#0d1117;--ar-blue:#0066cc;--ar-green:#009900;--ar-light:#f8f9fa;--ar-text:#1a1a2e;--ar-muted:#5a6472;--ar-border:#dce3ed;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--ar-text);background:#fff;font-size:16px;line-height:1.6;}
.ar-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.ar-nav{background:var(--ar-dark);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.ar-nav-brand{color:#fff;font-size:1.2rem;font-weight:700;text-decoration:none;}
.ar-nav-cta{background:#25D366;color:#fff;padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9rem;}
.ar-hero{background:linear-gradient(135deg,var(--ar-dark) 0%,#1a3a6e 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;}
.ar-hero-networks{display:flex;justify-content:center;gap:1.5rem;margin-bottom:1.5rem;flex-wrap:wrap;}
.ar-network-badge{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);border-radius:6px;padding:.5rem 1rem;font-weight:800;font-size:.9rem;color:#fff;}
.ar-network-mtn{color:var(--ar-yellow);border-color:var(--ar-yellow);}
.ar-network-airtel{color:#ff0000;border-color:#ff0000;}
.ar-network-glo{color:#39b54a;border-color:#39b54a;}
.ar-network-mobile{color:#008fd5;border-color:#008fd5;}
.ar-hero h1{font-size:clamp(1.8rem,5vw,2.6rem);font-weight:800;margin-bottom:.5rem;}
.ar-hero-tagline{opacity:.85;margin-bottom:.5rem;}
.ar-hero-trust{color:var(--ar-yellow);font-size:.85rem;margin-bottom:2rem;}
.ar-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:5px;text-decoration:none;font-weight:700;font-size:1rem;min-height:44px;line-height:1.3;}
.ar-btn-wa{background:#25D366;color:#fff;}
.ar-btn-outline{border:2px solid #fff;color:#fff;}
.ar-btn-primary{background:var(--ar-blue);color:#fff;}
.ar-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.ar-trust-strip{background:var(--ar-green);color:#fff;text-align:center;padding:.55rem;font-size:.83rem;}
.ar-section{padding:3rem 1rem;}
.ar-section-alt{background:var(--ar-light);}
.ar-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--ar-dark);}
.ar-section-sub{color:var(--ar-muted);margin-bottom:2rem;font-size:.9rem;}
.ar-products{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;}
.ar-product-card{background:#fff;border-radius:8px;padding:1.25rem;box-shadow:0 1px 6px rgba(0,0,0,.09);border-top:4px solid var(--ar-blue);}
.ar-product-card.mtn{border-top-color:var(--ar-yellow);}
.ar-product-card.airtel{border-top-color:#ff0000;}
.ar-product-card.glo{border-top-color:#39b54a;}
.ar-product-card.mobile{border-top-color:#008fd5;}
.ar-product-card h3{font-size:1rem;font-weight:700;color:var(--ar-dark);margin-bottom:.5rem;}
.ar-product-card table{width:100%;border-collapse:collapse;font-size:.85rem;}
.ar-product-card td{padding:.3rem 0;border-bottom:1px solid var(--ar-border);}
.ar-product-card td:last-child{text-align:right;font-weight:700;color:var(--ar-blue);}
.ar-product-card tr:last-child td{border-bottom:none;}
.ar-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;counter-reset:step;}
.ar-step{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 1px 4px rgba(0,0,0,.07);text-align:center;counter-increment:step;}
.ar-step::before{content:counter(step);display:block;width:40px;height:40px;background:var(--ar-blue);color:#fff;border-radius:50%;font-weight:800;font-size:1.2rem;line-height:40px;margin:0 auto .75rem;}
.ar-step h4{font-size:.95rem;font-weight:700;color:var(--ar-dark);margin-bottom:.3rem;}
.ar-step p{font-size:.85rem;color:var(--ar-muted);}
.ar-wa-strip{background:var(--ar-dark);color:#fff;padding:2.5rem 1rem;text-align:center;}
.ar-wa-strip h2{font-size:1.5rem;margin-bottom:.5rem;}
.ar-wa-strip p{opacity:.85;margin-bottom:1.25rem;}
.ar-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.ar-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.ar-contact-box{background:var(--ar-light);padding:1.5rem;border-radius:8px;border:1px solid var(--ar-border);}
.ar-contact-box h3{margin-bottom:1rem;color:var(--ar-dark);}
.ar-contact-box a{color:var(--ar-blue);font-weight:600;}
.ar-form{display:flex;flex-direction:column;gap:.75rem;}
.ar-input{padding:.7rem 1rem;border:1px solid var(--ar-border);border-radius:4px;font-size:1rem;width:100%;}
.ar-ndpr{font-size:.8rem;color:var(--ar-muted);}
.ar-submit{background:var(--ar-blue);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.ar-footer{background:var(--ar-dark);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;}
.ar-footer a{color:var(--ar-yellow);}
@media(max-width:600px){.ar-hero{padding:2.5rem 1rem 2rem;}.ar-hero h1{font-size:1.7rem;}.ar-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Fast. Reliable. Always On.');
  const desc = esc((ctx.data.description as string | null) ?? 'Authorised VTU reseller for MTN, Airtel, Glo, and 9mobile. Airtime, data bundles, bill payment (DSTV, PHCN, GOTV), and waybill — all in under 2 minutes. CAC registered. FIRS compliant.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20want%20to%20buy%20airtime%20or%20data.';
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const productsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="ar-product-card"><h3>${esc(o.name)}</h3>${o.description ? `<p style="color:var(--ar-muted);font-size:.85rem;">${esc(o.description)}</p>` : ''}${o.priceKobo !== null ? `<p style="margin-top:.5rem;font-weight:700;color:var(--ar-blue);">${fmtKobo(o.priceKobo)}</p>` : ''}</div>`).join('')
    : `<div class="ar-product-card mtn"><h3>🟡 MTN Data Bundles</h3><table><tr><td>1GB (30 days)</td><td>₦350</td></tr><tr><td>3GB (30 days)</td><td>₦1,000</td></tr><tr><td>10GB (30 days)</td><td>₦3,000</td></tr><tr><td>MTN Airtime</td><td>Face Value</td></tr></table></div>
    <div class="ar-product-card airtel"><h3>🔴 Airtel Data Bundles</h3><table><tr><td>1.5GB (30 days)</td><td>₦500</td></tr><tr><td>3GB (30 days)</td><td>₦1,000</td></tr><tr><td>10GB (30 days)</td><td>₦3,000</td></tr><tr><td>Airtel Airtime</td><td>Face Value</td></tr></table></div>
    <div class="ar-product-card glo"><h3>🟢 Glo Data Bundles</h3><table><tr><td>2GB (30 days)</td><td>₦500</td></tr><tr><td>5.8GB (30 days)</td><td>₦1,000</td></tr><tr><td>Glo Berekete 12GB</td><td>₦2,500</td></tr><tr><td>Glo Airtime</td><td>Face Value</td></tr></table></div>
    <div class="ar-product-card mobile"><h3>🔵 9mobile Bundles</h3><table><tr><td>1.5GB (30 days)</td><td>₦1,000</td></tr><tr><td>4.5GB (30 days)</td><td>₦2,000</td></tr><tr><td>9mobile Airtime</td><td>Face Value</td></tr></table></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Airtime & Data VTU | ${city}</title>${CSS}</head><body>
<nav class="ar-nav">
  <a href="/" class="ar-nav-brand">⚡ ${name}</a>
  <a href="${waHref}" class="ar-nav-cta" target="_blank" rel="noopener">📱 Order via WhatsApp</a>
</nav>
<div class="ar-trust-strip">
  ✅ CAC Registered ${cacNo ? `(${cacNo})` : ''} &nbsp;|&nbsp; Authorised VTU Reseller &nbsp;|&nbsp; Orders Fulfilled in Under 2 Minutes &nbsp;|&nbsp; Paystack Accepted
</div>
<section class="ar-hero">
  <div class="ar-hero-networks">
    <span class="ar-network-badge ar-network-mtn">MTN</span>
    <span class="ar-network-badge ar-network-airtel">AIRTEL</span>
    <span class="ar-network-badge ar-network-glo">GLO</span>
    <span class="ar-network-badge ar-network-mobile">9MOBILE</span>
  </div>
  <h1>${name}</h1>
  <p class="ar-hero-tagline">${tagline}</p>
  <p class="ar-hero-trust">${desc}</p>
  <div class="ar-hero-btns">
    <a href="${waHref}" class="ar-btn ar-btn-wa" target="_blank" rel="noopener">📱 Order via WhatsApp</a>
    <a href="/services" class="ar-btn ar-btn-outline">View All Plans</a>
  </div>
</section>
<section class="ar-section">
  <div class="ar-container">
    <h2>Data Plans & Airtime Prices</h2>
    <p class="ar-section-sub">Current rates — all prices in NGN. Updated daily. WhatsApp us to confirm latest prices.</p>
    <div class="ar-products">${productsHtml}</div>
  </div>
</section>
<section class="ar-section ar-section-alt">
  <div class="ar-container">
    <h2>How to Order</h2>
    <p class="ar-section-sub">3 simple steps — order fulfilled in under 2 minutes</p>
    <div class="ar-steps">
      <div class="ar-step"><h4>WhatsApp Your Order</h4><p>Send your network, data plan or airtime amount, and phone number to our WhatsApp.</p></div>
      <div class="ar-step"><h4>Pay via Paystack or Transfer</h4><p>We send you a payment link or bank details. Confirm after payment.</p></div>
      <div class="ar-step"><h4>Receive Instantly</h4><p>Your airtime or data is activated within 2 minutes of payment confirmation.</p></div>
    </div>
  </div>
</section>
<section class="ar-wa-strip">
  <h2>📱 Order Right Now</h2>
  <p>Fastest service in ${city}. WhatsApp us for airtime, data, DSTV renewal, PHCN/electricity token, and more.</p>
  <a href="${waHref}" class="ar-wa-btn" target="_blank" rel="noopener">Order via WhatsApp</a>
</section>
<footer class="ar-footer"><div class="ar-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | CAC Registered ${cacNo ? `(${cacNo})` : ''} | Payment: Paystack · Bank Transfer</p>
  <p style="margin-top:.5rem;font-size:.8rem;">Authorised VTU Reseller. NCC licensed operators. NDPR-compliant customer data. | <a href="/contact">Contact Us</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'Authorised VTU airtime and data reseller serving customers across Nigeria.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="ar-nav"><a href="/" class="ar-nav-brand">⚡ ${name}</a><a href="/contact" class="ar-nav-cta">Order Now</a></nav>
<section class="ar-hero" style="padding:3rem 1rem 2.5rem;"><h1>About ${name}</h1><p class="ar-hero-tagline">Your trusted VTU reseller in ${city}</p></section>
<section class="ar-section"><div class="ar-container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
  <div><h2>Our Business</h2><p style="margin:1rem 0;color:var(--ar-muted);">${desc}</p>${phone ? `<p><strong>Contact:</strong> ${phone}</p>` : ''}<p><strong>Location:</strong> ${city}</p></div>
  <div><h2>Trust & Compliance</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--ar-muted);">
    ${cacNo ? `<li>✅ CAC Registered (${cacNo})</li>` : '<li>✅ CAC Registered Business</li>'}
    <li>✅ Authorised VTU reseller</li>
    <li>✅ NCC operator compliance (MTN, Airtel, Glo, 9mobile)</li>
    <li>✅ FIRS TIN registered</li>
    <li>✅ Paystack-verified payment</li>
    <li>✅ NDPR-compliant customer data</li>
    <li>✅ Orders fulfilled in under 2 minutes</li>
  </ul></div>
</div></div></section>
<footer class="ar-footer"><div class="ar-container"><p>&copy; ${new Date().getFullYear()} ${name} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="ar-product-card"><h3>${esc(o.name)}</h3>${o.description ? `<p style="color:var(--ar-muted);font-size:.85rem;">${esc(o.description)}</p>` : ''}${o.priceKobo !== null ? `<p style="margin-top:.5rem;font-weight:700;color:var(--ar-blue);">${fmtKobo(o.priceKobo)}</p>` : ''}</div>`).join('')
    : `<div class="ar-product-card mtn"><h3>MTN Airtime & Data</h3><table><tr><td>Airtime</td><td>Face Value</td></tr><tr><td>1GB</td><td>₦350</td></tr><tr><td>3GB</td><td>₦1,000</td></tr><tr><td>10GB</td><td>₦3,000</td></tr></table></div>
       <div class="ar-product-card airtel"><h3>Airtel Airtime & Data</h3><table><tr><td>Airtime</td><td>Face Value</td></tr><tr><td>1.5GB</td><td>₦500</td></tr><tr><td>3GB</td><td>₦1,000</td></tr><tr><td>10GB</td><td>₦3,000</td></tr></table></div>
       <div class="ar-product-card glo"><h3>Glo Airtime & Data</h3><table><tr><td>Airtime</td><td>Face Value</td></tr><tr><td>2GB</td><td>₦500</td></tr><tr><td>5.8GB</td><td>₦1,000</td></tr></table></div>
       <div class="ar-product-card mobile"><h3>9mobile Airtime & Data</h3><table><tr><td>Airtime</td><td>Face Value</td></tr><tr><td>1.5GB</td><td>₦1,000</td></tr></table></div>
       <div class="ar-product-card"><h3>Bill Payments</h3><table><tr><td>DSTV / GOtv</td><td>Face Value</td></tr><tr><td>PHCN/Electricity Token</td><td>Face Value</td></tr><tr><td>Startimes</td><td>Face Value</td></tr></table></div>
       <div class="ar-product-card"><h3>Sub-Dealer Packages</h3><table><tr><td>₦5,000 float</td><td>2% bonus</td></tr><tr><td>₦20,000 float</td><td>3% bonus</td></tr><tr><td>₦50,000+ float</td><td>4% bonus</td></tr></table></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Plans & Prices — ${name}</title>${CSS}</head><body>
<nav class="ar-nav"><a href="/" class="ar-nav-brand">⚡ ${name}</a><a href="/contact" class="ar-nav-cta">Order Now</a></nav>
<section class="ar-hero" style="padding:3rem 1rem 2.5rem;"><h1>All Plans & Prices</h1><p class="ar-hero-tagline">Airtime · Data · Bills · Sub-Dealer Packages | All prices in NGN</p></section>
<section class="ar-section"><div class="ar-container"><div class="ar-products">${itemsHtml}</div></div></section>
<footer class="ar-footer"><div class="ar-container"><p>&copy; ${new Date().getFullYear()} ${name} | Payment: Paystack · Bank Transfer | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const waHref = waLink(phone, 'Hello, I want to buy airtime or data.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Order — ${name}</title>${CSS}</head><body>
<nav class="ar-nav"><a href="/" class="ar-nav-brand">⚡ ${name}</a><a href="${waHref}" class="ar-nav-cta" target="_blank" rel="noopener">📱 Order Now</a></nav>
<section class="ar-hero" style="padding:3rem 1rem 2.5rem;"><h1>Place Your Order</h1><p class="ar-hero-tagline">Airtime, data, and bills — fulfilled in under 2 minutes</p></section>
<section class="ar-section"><div class="ar-container"><div class="ar-contact-grid">
  <div class="ar-contact-box">
    <h3>📱 Order via WhatsApp (Fastest)</h3>
    <p>Send: <strong>Network + Amount/Plan + Phone Number</strong> — we respond in under 2 minutes.</p>
    <a href="${waHref}" class="ar-btn ar-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">Order Now on WhatsApp</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Location:</strong> ${city}</p>
    <p style="margin-top:.75rem;font-size:.85rem;color:var(--ar-muted);"><strong>Payment:</strong> Paystack · Bank Transfer · POS (walk-in)</p>
  </div>
  <div class="ar-contact-box">
    <h3>Custom Order / Sub-Dealer Enquiry</h3>
    <form class="ar-form" onsubmit="return false;">
      <input class="ar-input" type="text" placeholder="Your name" autocomplete="name">
      <input class="ar-input" type="tel" placeholder="Your phone number" autocomplete="tel">
      <select class="ar-input"><option value="">-- Request type --</option><option>Bulk Airtime Order</option><option>Bulk Data Order</option><option>Bill Payment (DSTV/PHCN)</option><option>Become a Sub-Dealer</option><option>Corporate VTU Account</option></select>
      <textarea class="ar-input" rows="3" placeholder="Network, amount, and any other details..."></textarea>
      <div><input type="checkbox" id="ndpr-ar" required> <label for="ndpr-ar" class="ar-ndpr">I consent to ${name} processing my contact details for this order enquiry, in accordance with Nigeria's NDPR.</label></div>
      <button class="ar-submit" type="submit">Send Order Request</button>
    </form>
  </div>
</div></div></section>
<footer class="ar-footer"><div class="ar-container"><p>&copy; ${new Date().getFullYear()} ${name} | Paystack · Bank Transfer | NDPR Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const airtimeResellerAirtimeVtuResellerTemplate: WebsiteTemplateContract = {
  slug: 'airtime-reseller-airtime-vtu-reseller',
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
