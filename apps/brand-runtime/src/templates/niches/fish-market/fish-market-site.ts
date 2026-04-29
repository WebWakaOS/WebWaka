/**
 * Fish Market / Fishmonger — Pillar 3 Website Template
 * Niche ID: P3-fish-market-fish-market-site
 * Vertical: fish-market (priority=3, critical)
 * Category: agricultural
 * Family: NF-AGR-MKT standalone
 * Research brief: docs/templates/research/fish-market-fish-market-site-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: NAFDAC food safety, FMARD fisheries licence, cold chain SON standards
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to order fish.')}`;
}

const CSS = `
<style>
:root{--fm-blue:#0077b6;--fm-teal:#00b4d8;--fm-light:#e0f7fe;--fm-dark:#03045e;--fm-text:#2c2c2c;--fm-muted:#6c757d;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',sans-serif;color:var(--fm-text);background:#fff;font-size:16px;line-height:1.6;}
.fm-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.fm-nav{background:var(--fm-dark);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.fm-nav-brand{color:#fff;font-size:1.3rem;font-weight:700;text-decoration:none;}
.fm-nav-cta{background:var(--fm-teal);color:#fff;padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9rem;}
.fm-hero{background:linear-gradient(135deg,var(--fm-dark) 0%,var(--fm-blue) 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;}
.fm-hero h1{font-size:clamp(1.8rem,5vw,2.6rem);font-weight:800;margin-bottom:.75rem;}
.fm-hero-badge{background:var(--fm-teal);color:#fff;display:inline-block;padding:.4rem 1rem;border-radius:20px;font-size:.85rem;font-weight:700;margin-bottom:1rem;}
.fm-hero p{max-width:600px;margin:0 auto 1.5rem;opacity:.9;}
.fm-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:700;font-size:1rem;min-height:44px;line-height:1.3;text-align:center;}
.fm-btn-wa{background:#25D366;color:#fff;}
.fm-btn-outline{border:2px solid #fff;color:#fff;}
.fm-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.fm-nafdac{background:var(--fm-blue);color:#fff;text-align:center;padding:.6rem;font-size:.85rem;}
.fm-section{padding:3rem 1rem;}
.fm-section-alt{background:var(--fm-light);}
.fm-section h2{font-size:1.6rem;font-weight:700;margin-bottom:.5rem;color:var(--fm-dark);}
.fm-section-sub{color:var(--fm-muted);margin-bottom:2rem;}
.fm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;}
.fm-card{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.08);border-top:4px solid var(--fm-teal);}
.fm-card h3{font-size:1.05rem;font-weight:700;margin-bottom:.5rem;color:var(--fm-dark);}
.fm-card p{color:var(--fm-muted);font-size:.9rem;}
.fm-price{margin-top:.75rem;font-weight:700;color:var(--fm-blue);font-size:1rem;}
.fm-wa-strip{background:#25D366;color:#fff;padding:2rem 1rem;text-align:center;}
.fm-wa-strip h2{font-size:1.5rem;margin-bottom:.5rem;}
.fm-wa-btn{background:#fff;color:#128C7E;font-weight:700;padding:.75rem 2rem;border-radius:6px;text-decoration:none;display:inline-block;}
.fm-testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;margin-top:1.5rem;}
.fm-testi{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 6px rgba(0,0,0,.08);}
.fm-testi-text{font-style:italic;margin-bottom:.75rem;}
.fm-testi-author{font-weight:700;font-size:.9rem;color:var(--fm-blue);}
.fm-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.fm-contact-box{background:var(--fm-light);padding:1.5rem;border-radius:8px;}
.fm-contact-box h3{margin-bottom:1rem;color:var(--fm-dark);}
.fm-contact-box a{color:var(--fm-blue);font-weight:600;}
.fm-form{display:flex;flex-direction:column;gap:.75rem;}
.fm-input{padding:.75rem;border:1px solid #ddd;border-radius:6px;font-size:1rem;width:100%;}
.fm-ndpr{font-size:.8rem;color:var(--fm-muted);}
.fm-submit{background:var(--fm-blue);color:#fff;border:none;padding:.75rem 1.5rem;border-radius:6px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.fm-footer{background:var(--fm-dark);color:rgba(255,255,255,.8);text-align:center;padding:1.5rem;font-size:.85rem;}
.fm-footer a{color:var(--fm-teal);}
@media(max-width:600px){.fm-hero{padding:2.5rem 1rem 2rem;}.fm-hero h1{font-size:1.6rem;}.fm-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Fresh Fish — Direct from the Water to Your Table');
  const desc = esc((ctx.data.description as string | null) ?? 'We supply fresh, smoked, dried stockfish (okporoko), and frozen fish to caterers, hotels, restaurants, and households across Nigeria. NAFDAC-certified and cold-chain compliant.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20to%20order%20fish.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const productsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="fm-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="fm-price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Call for price'}</p></div>`).join('')
    : `
      <div class="fm-card"><h3>Fresh Catfish (Eja Aro)</h3><p>Live and fresh catfish from trusted farms. Slaughter and cleaning service available.</p><p class="fm-price">From ₦4,500/kg</p></div>
      <div class="fm-card"><h3>Smoked Mackerel (Titus)</h3><p>Smoked titus — hotel and restaurant bulk supply. Cold-chain maintained throughout.</p><p class="fm-price">From ₦3,200/kg</p></div>
      <div class="fm-card"><h3>Stockfish (Okporoko)</h3><p>Premium Norwegian stockfish — whole and pre-cut. Onitsha and Apongbon sourced.</p><p class="fm-price">From ₦8,500/kg</p></div>
      <div class="fm-card"><h3>Frozen Tilapia</h3><p>IQF frozen tilapia in 20kg cartons. NAFDAC-compliant cold chain from import to delivery.</p><p class="fm-price">From ₦45,000/carton</p></div>
      <div class="fm-card"><h3>Bonga Fish (Shawa)</h3><p>Smoked and dried bonga for pepper soup, egusi, and afang. Bulk and retail.</p><p class="fm-price">From ₦2,800/kg</p></div>
      <div class="fm-card"><h3>Croaker (Eja Abo)</h3><p>Fresh and smoked croaker — a Lagos party favourite. Available in bulk cartons.</p><p class="fm-price">From ₦6,000/kg</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Fresh Fish Supply | ${city}</title>${CSS}</head><body>
<nav class="fm-nav">
  <a href="/" class="fm-nav-brand">🐟 ${name}</a>
  <a href="${waHref}" class="fm-nav-cta" target="_blank" rel="noopener">📱 Order on WhatsApp</a>
</nav>
<div class="fm-nafdac">
  <strong>NAFDAC Food Safety Compliant</strong> &nbsp;|&nbsp; FMARD Fisheries Licence &nbsp;|&nbsp; Cold Chain Maintained &nbsp;|&nbsp; Bulk & Retail Supply
</div>
<section class="fm-hero">
  <div class="fm-hero-badge">🐟 Fish Market — ${city}</div>
  <h1>${name}</h1>
  <p>${tagline}</p>
  <p>${desc}</p>
  <div class="fm-hero-btns">
    <a href="${waHref}" class="fm-btn fm-btn-wa" target="_blank" rel="noopener">📱 Order on WhatsApp</a>
    <a href="/services" class="fm-btn fm-btn-outline">View All Fish & Prices</a>
  </div>
</section>
<section class="fm-section">
  <div class="fm-container">
    <h2>Our Fish Selection</h2>
    <p class="fm-section-sub">Fresh, smoked, dried, and frozen fish — all prices in Nigerian Naira (₦). WhatsApp for bulk pricing.</p>
    <div class="fm-grid">${productsHtml}</div>
  </div>
</section>
<section class="fm-wa-strip">
  <h2>📱 Standing Orders for Restaurants & Hotels</h2>
  <p>Caterers, hotels, restaurants — WhatsApp us to set up a weekly standing order. Consistent supply, cold chain guarantee, bulk invoice.</p>
  <a href="${waHref}" class="fm-wa-btn" target="_blank" rel="noopener">Set Up Your Standing Order</a>
</section>
<section class="fm-section fm-section-alt">
  <div class="fm-container">
    <h2>Trusted by Caterers & Restaurants</h2>
    <div class="fm-testimonials">
      <div class="fm-testi"><p class="fm-testi-text">"Best stockfish quality in Lagos. I run a pepper soup joint and they supply me every Monday. NAFDAC-certified, no issues."</p><p class="fm-testi-author">— Mama Ifeoma, Caterer, Enugu</p></div>
      <div class="fm-testi"><p class="fm-testi-text">"Their frozen titus supply for our hotel kitchen is always fresh and cold chain compliant. Excellent Paystack invoicing too."</p><p class="fm-testi-author">— Chef Kayode, Hotel Chef, Lagos Island</p></div>
    </div>
  </div>
</section>
<footer class="fm-footer"><div class="fm-container"><p>&copy; ${new Date().getFullYear()} ${name}. NAFDAC Compliant. FMARD Licensed. | Payment: Bank Transfer · POS · Mobile Money | <a href="/contact">Contact</a></p></div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'We are a NAFDAC-compliant fish market supplying fresh, smoked, and frozen fish to caterers, hotels, restaurants, and households across Nigeria.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="fm-nav"><a href="/" class="fm-nav-brand">🐟 ${name}</a><a href="/contact" class="fm-nav-cta">Contact Us</a></nav>
<section class="fm-hero" style="padding:3rem 1rem 2rem;"><h1>About ${name}</h1><p>From the water to your table — fresh and certified</p></section>
<section class="fm-section"><div class="fm-container"><div class="fm-grid">
  <div><h2>Who We Are</h2><p style="margin:1rem 0;color:var(--fm-muted)">${desc}</p><p>Based at ${city}, our market serves caterers, hotels, restaurants, supermarkets, and households with genuine, fresh-sourced fish. We maintain cold chain from source to delivery.</p>${phone ? `<p style="margin-top:1rem;"><strong>Phone:</strong> ${phone}</p>` : ''}</div>
  <div><h2>Our Certifications</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--fm-muted);">
    <li>✅ NAFDAC Food Safety Compliance</li>
    <li>✅ FMARD Fisheries Licence</li>
    <li>✅ SON Cold Chain Standards</li>
    <li>✅ CAC Business Registration</li>
    <li>✅ Market Association Membership</li>
  </ul></div>
</div></div></section>
<footer class="fm-footer"><div class="fm-container"><p>&copy; ${new Date().getFullYear()} ${name} | NAFDAC Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="fm-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="fm-price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Call for price'}</p></div>`).join('')
    : `<div class="fm-card"><h3>Fresh Catfish</h3><p>Live and fresh, slaughter available.</p><p class="fm-price">From ₦4,500/kg</p></div>
       <div class="fm-card"><h3>Smoked Titus</h3><p>Bulk supply to restaurants and hotels.</p><p class="fm-price">From ₦3,200/kg</p></div>
       <div class="fm-card"><h3>Stockfish (Okporoko)</h3><p>Premium Norwegian — whole and cut.</p><p class="fm-price">From ₦8,500/kg</p></div>
       <div class="fm-card"><h3>Frozen Tilapia</h3><p>IQF, NAFDAC-compliant 20kg cartons.</p><p class="fm-price">From ₦45,000/carton</p></div>
       <div class="fm-card"><h3>Bonga (Shawa)</h3><p>Smoked and dried, bulk and retail.</p><p class="fm-price">From ₦2,800/kg</p></div>
       <div class="fm-card"><h3>Croaker (Eja Abo)</h3><p>Fresh and smoked, Lagos favourite.</p><p class="fm-price">From ₦6,000/kg</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Our Fish — ${name}</title>${CSS}</head><body>
<nav class="fm-nav"><a href="/" class="fm-nav-brand">🐟 ${name}</a><a href="/contact" class="fm-nav-cta">Order Now</a></nav>
<section class="fm-hero" style="padding:3rem 1rem 2rem;"><h1>Fish Selection & Prices</h1><p>All prices in Nigerian Naira (₦). WhatsApp for bulk orders and custom pricing.</p></section>
<section class="fm-section"><div class="fm-container"><div class="fm-grid">${itemsHtml}</div></div></section>
<footer class="fm-footer"><div class="fm-container"><p>&copy; ${new Date().getFullYear()} ${name} | NAFDAC Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const waHref = waLink(phone, 'Hello, I would like to order fish.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${name}</title>${CSS}</head><body>
<nav class="fm-nav"><a href="/" class="fm-nav-brand">🐟 ${name}</a><a href="${waHref}" class="fm-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="fm-hero" style="padding:3rem 1rem 2rem;"><h1>Place Your Order</h1><p>WhatsApp for the fastest response — we deliver across ${city}</p></section>
<section class="fm-section"><div class="fm-container"><div class="fm-contact-grid">
  <div class="fm-contact-box">
    <h3>📱 WhatsApp Order</h3>
    <p>Send your fish type, quantity, and delivery location on WhatsApp.</p>
    <a href="${waHref}" class="fm-btn fm-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">Open WhatsApp</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Market Location:</strong> ${city}, Nigeria</p>
  </div>
  <div class="fm-contact-box">
    <h3>Order Form</h3>
    <form class="fm-form" onsubmit="return false;">
      <input class="fm-input" type="text" placeholder="Your name" autocomplete="name">
      <input class="fm-input" type="tel" placeholder="Phone number" autocomplete="tel">
      <select class="fm-input"><option value="">-- Select fish type --</option><option>Fresh Catfish</option><option>Smoked Titus</option><option>Stockfish (Okporoko)</option><option>Frozen Tilapia</option><option>Bonga Fish</option><option>Croaker</option><option>Mixed order</option></select>
      <input class="fm-input" type="text" placeholder="Quantity (kg or cartons)">
      <textarea class="fm-input" rows="2" placeholder="Delivery address (optional)..."></textarea>
      <div><input type="checkbox" id="ndpr-fm" required> <label for="ndpr-fm" class="fm-ndpr">I consent to ${name} storing my contact details to process this order, per Nigeria's NDPR.</label></div>
      <button class="fm-submit" type="submit">Send Order</button>
    </form>
  </div>
</div>
<div style="margin-top:2rem;padding:1rem;background:var(--fm-light);border-radius:8px;font-size:.85rem;color:var(--fm-muted);">
  <strong>Payment:</strong> Bank transfer · POS · Mobile money (Opay, Palmpay) · Cash on collection
</div>
</div></section>
<footer class="fm-footer"><div class="fm-container"><p>&copy; ${new Date().getFullYear()} ${name} | NAFDAC Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const fishMarketFishMarketSiteTemplate: WebsiteTemplateContract = {
  slug: 'fish-market-fish-market-site',
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
