/**
 * Electrical Fittings Dealer — Pillar 3 Website Template
 * Niche ID: P3-electrical-fittings-electrical-fittings-dealer
 * Vertical: electrical-fittings (priority=3, high)
 * Category: commerce
 * Family: NF-COM-HRD anchor (paints-distributor, plumbing-supplies variants)
 * Research brief: docs/templates/research/electrical-fittings-electrical-fittings-dealer-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: SON conformity, NERC compliance, CAC registration
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like a quote for electrical fittings.')}`;
}

const CSS = `
<style>
:root{--ef-green:#1a7f3c;--ef-gold:#f5a623;--ef-dark:#1a1a2e;--ef-light:#f8f9fa;--ef-text:#2c2c2c;--ef-muted:#6c757d;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',sans-serif;color:var(--ef-text);background:#fff;font-size:16px;line-height:1.6;}
.ef-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.ef-nav{background:var(--ef-dark);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.ef-nav-brand{color:#fff;font-size:1.3rem;font-weight:700;text-decoration:none;}
.ef-nav-cta{background:var(--ef-gold);color:var(--ef-dark);padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:600;font-size:.9rem;}
.ef-hero{background:linear-gradient(135deg,var(--ef-dark) 0%,#2d3561 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;}
.ef-hero h1{font-size:clamp(1.8rem,5vw,2.8rem);font-weight:800;margin-bottom:1rem;}
.ef-hero .ef-tagline{font-size:1.1rem;color:rgba(255,255,255,.85);margin-bottom:1.5rem;max-width:600px;margin-left:auto;margin-right:auto;}
.ef-hero-badge{display:inline-block;background:var(--ef-gold);color:var(--ef-dark);padding:.4rem 1rem;border-radius:20px;font-size:.85rem;font-weight:700;margin-bottom:1.5rem;}
.ef-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:700;font-size:1rem;min-height:44px;line-height:1.3;text-align:center;}
.ef-btn-wa{background:#25D366;color:#fff;}
.ef-btn-primary{background:var(--ef-gold);color:var(--ef-dark);}
.ef-btn-outline{border:2px solid #fff;color:#fff;}
.ef-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:1rem;}
.ef-trust{background:var(--ef-dark);color:#fff;padding:1rem;text-align:center;}
.ef-trust-inner{display:flex;gap:1.5rem;justify-content:center;flex-wrap:wrap;}
.ef-trust-item{font-size:.85rem;opacity:.9;}
.ef-trust-item strong{color:var(--ef-gold);}
.ef-section{padding:3rem 1rem;}
.ef-section-alt{background:var(--ef-light);}
.ef-section h2{font-size:1.6rem;font-weight:700;margin-bottom:.5rem;color:var(--ef-dark);}
.ef-section-sub{color:var(--ef-muted);margin-bottom:2rem;}
.ef-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;}
.ef-card{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.08);border-left:4px solid var(--ef-green);}
.ef-card h3{font-size:1.05rem;font-weight:700;margin-bottom:.5rem;color:var(--ef-dark);}
.ef-card p{color:var(--ef-muted);font-size:.9rem;}
.ef-price{margin-top:.75rem;font-weight:700;color:var(--ef-green);font-size:1rem;}
.ef-product-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;}
.ef-product-item{background:#fff;border-radius:8px;padding:1rem;box-shadow:0 1px 4px rgba(0,0,0,.07);text-align:center;border-top:3px solid var(--ef-gold);}
.ef-product-item h4{font-size:.95rem;font-weight:600;margin-bottom:.3rem;}
.ef-product-item p{font-size:.8rem;color:var(--ef-muted);}
.ef-wa-strip{background:#25D366;color:#fff;padding:2rem 1rem;text-align:center;}
.ef-wa-strip h2{font-size:1.5rem;margin-bottom:.5rem;}
.ef-wa-strip p{margin-bottom:1rem;opacity:.95;}
.ef-wa-btn{background:#fff;color:#128C7E;font-weight:700;padding:.75rem 2rem;border-radius:6px;text-decoration:none;display:inline-block;font-size:1rem;}
.ef-brands{display:flex;gap:1.5rem;flex-wrap:wrap;justify-content:center;margin-top:1rem;}
.ef-brand-badge{background:#fff;border:1px solid #ddd;border-radius:6px;padding:.5rem 1rem;font-weight:700;font-size:.9rem;color:var(--ef-dark);}
.ef-son-strip{background:var(--ef-green);color:#fff;text-align:center;padding:.75rem 1rem;font-size:.9rem;}
.ef-son-strip strong{font-weight:700;}
.ef-testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;margin-top:1.5rem;}
.ef-testi{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 6px rgba(0,0,0,.08);}
.ef-testi-text{font-style:italic;color:var(--ef-text);margin-bottom:1rem;}
.ef-testi-author{font-weight:700;font-size:.9rem;color:var(--ef-green);}
.ef-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.ef-contact-box{background:var(--ef-light);padding:1.5rem;border-radius:8px;}
.ef-contact-box h3{margin-bottom:1rem;color:var(--ef-dark);}
.ef-contact-box p{margin-bottom:.5rem;font-size:.95rem;}
.ef-contact-box a{color:var(--ef-green);font-weight:600;}
.ef-form{display:flex;flex-direction:column;gap:1rem;}
.ef-input{padding:.75rem;border:1px solid #ddd;border-radius:6px;font-size:1rem;width:100%;}
.ef-ndpr{font-size:.8rem;color:var(--ef-muted);margin-top:.25rem;}
.ef-submit{background:var(--ef-green);color:#fff;border:none;padding:.75rem 1.5rem;border-radius:6px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.ef-footer{background:var(--ef-dark);color:rgba(255,255,255,.8);text-align:center;padding:1.5rem 1rem;font-size:.85rem;}
.ef-footer a{color:var(--ef-gold);}
@media(max-width:600px){.ef-hero{padding:2.5rem 1rem 2rem;}.ef-hero h1{font-size:1.6rem;}.ef-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Your Trusted Electrical Fittings Dealer in Nigeria');
  const desc = esc((ctx.data.description as string | null) ?? 'We supply cables, circuit breakers, sockets, DBs, inverters, solar panels, and all electrical fittings to contractors, electricians, and self-builders across Nigeria.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20need%20a%20quote%20for%20electrical%20fittings.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const productsHtml = offerings.length > 0
    ? offerings.map(o => `
      <div class="ef-card">
        <h3>${esc(o.name)}</h3>
        ${o.description ? `<p>${esc(o.description)}</p>` : ''}
        ${o.priceKobo !== null ? `<p class="ef-price">From ${fmtKobo(o.priceKobo)}</p>` : `<p class="ef-price">Call for price</p>`}
      </div>`).join('')
    : `
      <div class="ef-card"><h3>Cables & Wires</h3><p>1mm–25mm armoured and flexible cables. Nexans, Ducab, Tower brands stocked.</p><p class="ef-price">From ₦3,500/roll</p></div>
      <div class="ef-card"><h3>Circuit Breakers & DBs</h3><p>MCBs, RCDs, distribution boards — Schneider Electric, Havells, ABB.</p><p class="ef-price">From ₦2,000</p></div>
      <div class="ef-card"><h3>Inverters & Solar</h3><p>Luminous, Sukam, Felicity Solar inverters and MPPT charge controllers.</p><p class="ef-price">From ₦85,000</p></div>
      <div class="ef-card"><h3>Sockets & Switches</h3><p>UK-standard sockets, NEMA fittings, surface/flush mount — Clipsal, Schneider.</p><p class="ef-price">From ₦800</p></div>
      <div class="ef-card"><h3>Meters & Accessories</h3><p>Energy meters, conduit, trunking, junction boxes, cable trays.</p><p class="ef-price">From ₦1,500</p></div>
      <div class="ef-card"><h3>Lighting Solutions</h3><p>LED bulbs, floodlights, battens, street lights — energy-efficient solutions.</p><p class="ef-price">From ₦1,200</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Electrical Fittings | ${city}</title>${CSS}</head><body>
<nav class="ef-nav">
  <a href="/" class="ef-nav-brand">⚡ ${name}</a>
  <a href="${waHref}" class="ef-nav-cta" target="_blank" rel="noopener">📱 WhatsApp Us</a>
</nav>
<div class="ef-son-strip">
  <strong>✅ SON-Compliant Products</strong> &nbsp;|&nbsp; <strong>CAC Registered Business</strong> &nbsp;|&nbsp; Authorised Dealers: Schneider · Havells · Clipsal
</div>
<section class="ef-hero">
  <div class="ef-hero-badge">⚡ Electrical Fittings Specialists — ${city}</div>
  <h1>${name}</h1>
  <p class="ef-tagline">${tagline}</p>
  <p style="color:rgba(255,255,255,.8);max-width:600px;margin:0 auto 1.5rem;">${desc}</p>
  <div class="ef-hero-btns">
    <a href="${waHref}" class="ef-btn ef-btn-wa" target="_blank" rel="noopener">📱 Get Quote on WhatsApp</a>
    <a href="/services" class="ef-btn ef-btn-outline">View Products</a>
  </div>
</section>
<div class="ef-trust">
  <div class="ef-trust-inner">
    <span class="ef-trust-item"><strong>SON</strong> Conformity Certified</span>
    <span class="ef-trust-item"><strong>CAC</strong> Registered Business</span>
    <span class="ef-trust-item"><strong>Bulk</strong> Orders Welcome</span>
    <span class="ef-trust-item"><strong>Paystack</strong> · Bank Transfer · POS</span>
  </div>
</div>
<section class="ef-section">
  <div class="ef-container">
    <h2>Products & Stock</h2>
    <p class="ef-section-sub">Quality electrical materials for contractors, electricians, and self-builders across Nigeria</p>
    <div class="ef-grid">${productsHtml}</div>
  </div>
</section>
<section class="ef-wa-strip">
  <h2>📱 Order on WhatsApp — Fast Response</h2>
  <p>Send us your materials list or specification and get a quote within minutes. Bulk orders and contractor accounts welcome.</p>
  <a href="${waHref}" class="ef-wa-btn" target="_blank" rel="noopener">Chat on WhatsApp Now</a>
</section>
<section class="ef-section ef-section-alt">
  <div class="ef-container">
    <h2>Brands We Stock</h2>
    <p class="ef-section-sub">We are authorised dealers and resellers for leading electrical brands</p>
    <div class="ef-brands">
      <span class="ef-brand-badge">Schneider Electric</span>
      <span class="ef-brand-badge">Havells</span>
      <span class="ef-brand-badge">Clipsal</span>
      <span class="ef-brand-badge">Luminous</span>
      <span class="ef-brand-badge">Sukam</span>
      <span class="ef-brand-badge">Felicity Solar</span>
      <span class="ef-brand-badge">Nexans</span>
      <span class="ef-brand-badge">Tower Cables</span>
    </div>
  </div>
</section>
<section class="ef-section">
  <div class="ef-container">
    <h2>What Our Clients Say</h2>
    <div class="ef-testimonials">
      <div class="ef-testi"><p class="ef-testi-text">"Their cable prices are the best in Trade Fair. I buy all my estate project materials from them. Fast delivery to Lekki."</p><p class="ef-testi-author">— Chukwuemeka Eze, Electrical Contractor, Abuja</p></div>
      <div class="ef-testi"><p class="ef-testi-text">"Ordered a Felicity Solar 5kVA inverter on WhatsApp, payment confirmed on Paystack, delivered next day. Excellent service."</p><p class="ef-testi-author">— Amaka Okonkwo, Facility Manager, Victoria Island</p></div>
    </div>
  </div>
</section>
<footer class="ef-footer"><div class="ef-container"><p>&copy; ${new Date().getFullYear()} ${name}. CAC Registered. SON-Compliant Products. | <a href="/contact">Contact Us</a> | Payment: Paystack · Bank Transfer · POS</p></div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'We are a SON-certified electrical fittings dealer supplying quality cables, panels, inverters, and accessories to contractors, electricians, and self-builders across Nigeria.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="ef-nav"><a href="/" class="ef-nav-brand">⚡ ${name}</a><a href="/contact" class="ef-nav-cta">Contact Us</a></nav>
<section class="ef-hero" style="padding:3rem 1rem 2rem;">
  <h1>About ${name}</h1>
  <p class="ef-tagline">Your reliable electrical fittings partner in ${city}</p>
</section>
<section class="ef-section"><div class="ef-container">
  <div class="ef-grid">
    <div>
      <h2>Who We Are</h2>
      <p style="margin:1rem 0;color:var(--ef-muted)">${desc}</p>
      <p>Located in ${city}, we serve electricians, contractors, estate developers, and self-builders with genuine, SON-certified electrical materials. We stock cables from 1mm to 25mm, circuit breakers, distribution boards, inverters, solar panels, sockets, switches, and accessories.</p>
    </div>
    <div>
      <h2>Why Choose Us</h2>
      <ul style="margin:1rem 0;padding-left:1.5rem;color:var(--ef-muted);line-height:2;">
        <li>SON Conformity Assessment — all imports certified</li>
        <li>CAC Registered Business</li>
        <li>Authorised dealer: Schneider, Havells, Clipsal</li>
        <li>Bulk contractor accounts available</li>
        <li>Paystack, bank transfer, POS payment options</li>
        <li>Delivery to all states in Nigeria</li>
        <li>Technical advice from qualified electricians on staff</li>
      </ul>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
    </div>
  </div>
</div></section>
<footer class="ef-footer"><div class="ef-container"><p>&copy; ${new Date().getFullYear()} ${name} | CAC Registered | SON Certified | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="ef-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="ef-price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Call for price'}</p></div>`).join('')
    : `
      <div class="ef-card"><h3>Cables & Wires (1mm–25mm)</h3><p>Armoured, flexible, twin and earth cables. Nexans, Ducab, Tower brands.</p><p class="ef-price">From ₦3,500/roll</p></div>
      <div class="ef-card"><h3>MCBs & Distribution Boards</h3><p>Single/three phase DBs, MCBs, RCDs, surge protection devices.</p><p class="ef-price">From ₦2,000</p></div>
      <div class="ef-card"><h3>Inverters & Batteries</h3><p>5kVA–20kVA inverters, deep cycle VRLA and lithium batteries.</p><p class="ef-price">From ₦85,000</p></div>
      <div class="ef-card"><h3>Solar Panels & Accessories</h3><p>100W–550W panels, MPPT charge controllers, mounting systems.</p><p class="ef-price">From ₦45,000</p></div>
      <div class="ef-card"><h3>Sockets & Switches</h3><p>UK-standard, NEMA, flush/surface mount in single and double gang.</p><p class="ef-price">From ₦800</p></div>
      <div class="ef-card"><h3>Lighting</h3><p>LED bulbs, battens, floodlights, street lights — all energy-efficient.</p><p class="ef-price">From ₦1,200</p></div>
      <div class="ef-card"><h3>Conduits & Trunking</h3><p>PVC and steel conduit, cable trays, flexible conduit, joint boxes.</p><p class="ef-price">From ₦600/length</p></div>
      <div class="ef-card"><h3>Meters & Accessories</h3><p>Single and three phase energy meters, meter boxes, seals.</p><p class="ef-price">From ₦1,500</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Products — ${name}</title>${CSS}</head><body>
<nav class="ef-nav"><a href="/" class="ef-nav-brand">⚡ ${name}</a><a href="/contact" class="ef-nav-cta">Get Quote</a></nav>
<section class="ef-hero" style="padding:3rem 1rem 2rem;">
  <h1>Our Products & Stock</h1>
  <p class="ef-tagline">SON-certified electrical materials for every project size</p>
</section>
<section class="ef-section"><div class="ef-container">
  <p class="ef-section-sub" style="margin-bottom:2rem;">All prices subject to market rates. WhatsApp us for bulk/contractor quotes. Prices in Nigerian Naira (₦) only.</p>
  <div class="ef-grid">${itemsHtml}</div>
</div></section>
<footer class="ef-footer"><div class="ef-container"><p>&copy; ${new Date().getFullYear()} ${name} | Payment: Paystack · Bank Transfer · POS | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const waHref = waLink(phone, 'Hello, I need a quote for electrical fittings.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${name}</title>${CSS}</head><body>
<nav class="ef-nav"><a href="/" class="ef-nav-brand">⚡ ${name}</a><a href="${waHref}" class="ef-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="ef-hero" style="padding:3rem 1rem 2rem;">
  <h1>Contact Us</h1>
  <p class="ef-tagline">Get a quote or place your order — we respond fast on WhatsApp</p>
</section>
<section class="ef-section"><div class="ef-container">
  <div class="ef-contact-grid">
    <div class="ef-contact-box">
      <h3>📱 WhatsApp (Fastest)</h3>
      <p>Send your materials list and we'll quote you immediately.</p>
      <p><a href="${waHref}" target="_blank" rel="noopener" class="ef-btn ef-btn-wa" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">Open WhatsApp Chat</a></p>
      ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
      ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
      <p><strong>Location:</strong> ${city}, Nigeria</p>
    </div>
    <div class="ef-contact-box">
      <h3>Send a Quote Request</h3>
      <form class="ef-form" onsubmit="return false;">
        <input class="ef-input" type="text" placeholder="Your name" autocomplete="name">
        <input class="ef-input" type="tel" placeholder="Phone number (e.g. 08012345678)" autocomplete="tel">
        <textarea class="ef-input" rows="4" placeholder="Describe what you need — cable size, quantity, brands preferred..."></textarea>
        <div><input type="checkbox" id="ndpr-ef" required> <label for="ndpr-ef" class="ef-ndpr">I consent to ${name} storing my contact details to process this quote request, in accordance with Nigeria's NDPR.</label></div>
        <button class="ef-submit" type="submit">Send Request via WhatsApp</button>
      </form>
    </div>
  </div>
  <div style="margin-top:2rem;padding:1rem;background:var(--ef-light);border-radius:8px;font-size:.85rem;color:var(--ef-muted);">
    <strong>Payment methods:</strong> Paystack online payment &nbsp;|&nbsp; Bank transfer &nbsp;|&nbsp; POS on collection
  </div>
</div></section>
<footer class="ef-footer"><div class="ef-container"><p>&copy; ${new Date().getFullYear()} ${name} | CAC Registered | SON Certified | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const electricalFittingsElectricalFittingsDealerTemplate: WebsiteTemplateContract = {
  slug: 'electrical-fittings-electrical-fittings-dealer',
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
