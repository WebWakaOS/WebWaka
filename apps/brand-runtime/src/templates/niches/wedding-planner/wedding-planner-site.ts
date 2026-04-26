/**
 * Wedding Planner / Celebrant — Pillar 3 Website Template
 * Niche ID: P3-wedding-planner-wedding-planner-site
 * Vertical: wedding-planner (priority=3, critical)
 * Category: professional
 * Family: NF-PRO-EVT anchor (events professional family)
 * Research brief: docs/templates/research/wedding-planner-wedding-planner-site-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: CPPE membership, CAC registration, LASG event permits, NDPR
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to discuss planning my wedding.')}`;
}

const CSS = `
<style>
:root{--wp-gold:#b8860b;--wp-blush:#f5e6d8;--wp-deep:#4a0e35;--wp-rose:#c17b8a;--wp-text:#2c2c2c;--wp-muted:#6c757d;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Georgia',serif;color:var(--wp-text);background:#fff;font-size:16px;line-height:1.7;}
.wp-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.wp-nav{background:var(--wp-deep);padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.wp-nav-brand{color:#fff;font-size:1.3rem;font-weight:700;text-decoration:none;letter-spacing:.5px;}
.wp-nav-cta{background:var(--wp-gold);color:#fff;padding:.5rem 1.2rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9rem;font-family:'Segoe UI',sans-serif;}
.wp-hero{background:linear-gradient(135deg,var(--wp-deep) 0%,#7b2d52 100%);color:#fff;padding:5rem 1rem 4rem;text-align:center;}
.wp-hero h1{font-size:clamp(2rem,6vw,3.2rem);font-weight:700;margin-bottom:.75rem;letter-spacing:.5px;}
.wp-hero-badge{background:rgba(184,134,11,.9);color:#fff;display:inline-block;padding:.4rem 1.2rem;border-radius:20px;font-size:.85rem;font-weight:700;margin-bottom:1rem;font-family:'Segoe UI',sans-serif;}
.wp-hero p{max-width:620px;margin:0 auto 1.5rem;opacity:.9;font-size:1.05rem;}
.wp-btn{display:inline-block;padding:.8rem 1.8rem;border-radius:6px;text-decoration:none;font-weight:700;font-size:1rem;min-height:44px;line-height:1.3;font-family:'Segoe UI',sans-serif;}
.wp-btn-wa{background:#25D366;color:#fff;}
.wp-btn-outline{border:2px solid #fff;color:#fff;}
.wp-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:1rem;}
.wp-trust{background:var(--wp-gold);color:#fff;text-align:center;padding:.75rem;font-size:.85rem;font-family:'Segoe UI',sans-serif;}
.wp-section{padding:4rem 1rem;}
.wp-section-alt{background:var(--wp-blush);}
.wp-section h2{font-size:1.8rem;font-weight:700;margin-bottom:.5rem;color:var(--wp-deep);}
.wp-section-sub{color:var(--wp-muted);margin-bottom:2rem;font-family:'Segoe UI',sans-serif;}
.wp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;}
.wp-card{background:#fff;border-radius:8px;padding:2rem;box-shadow:0 2px 12px rgba(74,14,53,.1);border-top:4px solid var(--wp-gold);}
.wp-card h3{font-size:1.1rem;font-weight:700;margin-bottom:.75rem;color:var(--wp-deep);}
.wp-card p{color:var(--wp-muted);font-size:.9rem;font-family:'Segoe UI',sans-serif;}
.wp-price{margin-top:.75rem;font-weight:700;color:var(--wp-gold);font-size:1rem;font-family:'Segoe UI',sans-serif;}
.wp-package-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;}
.wp-package{background:#fff;border-radius:12px;padding:2rem;box-shadow:0 4px 16px rgba(74,14,53,.12);text-align:center;border:2px solid transparent;}
.wp-package.featured{border-color:var(--wp-gold);background:linear-gradient(135deg,#fff 0%,var(--wp-blush) 100%);}
.wp-package h3{font-size:1.2rem;font-weight:700;color:var(--wp-deep);margin-bottom:.5rem;}
.wp-package .pkg-price{font-size:1.8rem;font-weight:800;color:var(--wp-gold);margin:.75rem 0;font-family:'Segoe UI',sans-serif;}
.wp-package ul{text-align:left;padding-left:1.2rem;color:var(--wp-muted);font-size:.9rem;font-family:'Segoe UI',sans-serif;line-height:2;}
.wp-wa-strip{background:var(--wp-deep);color:#fff;padding:3rem 1rem;text-align:center;}
.wp-wa-strip h2{font-size:1.8rem;margin-bottom:.75rem;}
.wp-wa-strip p{margin-bottom:1.5rem;opacity:.9;font-family:'Segoe UI',sans-serif;}
.wp-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.8rem 2rem;border-radius:6px;text-decoration:none;display:inline-block;font-family:'Segoe UI',sans-serif;}
.wp-testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;margin-top:1.5rem;}
.wp-testi{background:#fff;border-radius:8px;padding:2rem;box-shadow:0 2px 8px rgba(74,14,53,.08);}
.wp-testi-text{font-style:italic;margin-bottom:1rem;color:var(--wp-text);}
.wp-testi-author{font-weight:700;font-size:.9rem;color:var(--wp-deep);font-family:'Segoe UI',sans-serif;}
.wp-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.wp-contact-box{background:var(--wp-blush);padding:2rem;border-radius:8px;}
.wp-contact-box h3{margin-bottom:1rem;color:var(--wp-deep);}
.wp-contact-box a{color:var(--wp-deep);font-weight:600;font-family:'Segoe UI',sans-serif;}
.wp-form{display:flex;flex-direction:column;gap:.75rem;font-family:'Segoe UI',sans-serif;}
.wp-input{padding:.75rem;border:1px solid #ddd;border-radius:6px;font-size:1rem;width:100%;}
.wp-ndpr{font-size:.8rem;color:var(--wp-muted);}
.wp-submit{background:var(--wp-deep);color:#fff;border:none;padding:.8rem 1.5rem;border-radius:6px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.wp-footer{background:var(--wp-deep);color:rgba(255,255,255,.8);text-align:center;padding:1.5rem;font-size:.85rem;font-family:'Segoe UI',sans-serif;}
.wp-footer a{color:var(--wp-gold);}
@media(max-width:600px){.wp-hero{padding:3rem 1rem 2.5rem;}.wp-hero h1{font-size:1.8rem;}.wp-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Your Perfect Nigerian Wedding — Beautifully Planned, Flawlessly Executed');
  const desc = esc((ctx.data.description as string | null) ?? 'We plan and coordinate traditional, white, and court weddings across Nigeria — from intimate ceremonies to 500-guest celebrations. CPPE-certified wedding planners serving Lagos, Abuja, and beyond.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20to%20discuss%20planning%20my%20wedding.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const packagesHtml = offerings.length > 0
    ? offerings.map(o => `<div class="wp-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="wp-price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Contact for pricing'}</p></div>`).join('')
    : `
      <div class="wp-package">
        <h3>Essential</h3>
        <div class="pkg-price">₦350,000</div>
        <ul><li>Day-of coordination</li><li>Vendor liaison</li><li>Ceremony timeline</li><li>WhatsApp support</li></ul>
      </div>
      <div class="wp-package featured">
        <h3>Classic ⭐</h3>
        <div class="pkg-price">₦800,000</div>
        <ul><li>Full planning (3 months)</li><li>Traditional + white wedding</li><li>Décor coordination</li><li>Aso-ebi management</li><li>Vendor sourcing & negotiation</li></ul>
      </div>
      <div class="wp-package">
        <h3>Luxury</h3>
        <div class="pkg-price">₦2,500,000+</div>
        <ul><li>Full 6-month planning</li><li>All ceremony types</li><li>Destination wedding support</li><li>Diaspora coordination</li><li>Dedicated planner on WhatsApp</li></ul>
      </div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Wedding Planner | ${city}</title>${CSS}</head><body>
<nav class="wp-nav">
  <a href="/" class="wp-nav-brand">💍 ${name}</a>
  <a href="${waHref}" class="wp-nav-cta" target="_blank" rel="noopener">📱 Start Planning</a>
</nav>
<div class="wp-trust">
  CPPE Certified Wedding Planner &nbsp;|&nbsp; CAC Registered &nbsp;|&nbsp; Traditional · White · Court Weddings &nbsp;|&nbsp; Lagos · Abuja · Nigeria
</div>
<section class="wp-hero">
  <div class="wp-hero-badge">💍 Wedding Planner — ${city}</div>
  <h1>${name}</h1>
  <p>${tagline}</p>
  <p style="font-family:'Segoe UI',sans-serif;opacity:.85">${desc}</p>
  <div class="wp-hero-btns">
    <a href="${waHref}" class="wp-btn wp-btn-wa" target="_blank" rel="noopener">📱 Start Your Journey on WhatsApp</a>
    <a href="/services" class="wp-btn wp-btn-outline">View Packages</a>
  </div>
</section>
<section class="wp-section">
  <div class="wp-container">
    <h2>Wedding Packages</h2>
    <p class="wp-section-sub">All-inclusive planning for every budget. Nigerian Naira (₦) pricing. Milestone payment schedule available.</p>
    <div class="wp-package-grid">${packagesHtml}</div>
  </div>
</section>
<section class="wp-section wp-section-alt">
  <div class="wp-container">
    <h2>What We Plan</h2>
    <p class="wp-section-sub">Every element of your perfect Nigerian wedding, coordinated with care</p>
    <div class="wp-grid">
      <div class="wp-card"><h3>Traditional Wedding</h3><p>Wine carrying, kolanut ceremony, family rites, aso-ebi coordination. Yoruba, Igbo, Hausa, Urhobo, and all Nigerian traditions.</p></div>
      <div class="wp-card"><h3>White / Church Wedding</h3><p>Venue, officiant, choir, flower arrangements, aisle décor, and reception coordination.</p></div>
      <div class="wp-card"><h3>Court Wedding</h3><p>Registry coordination, legal documentation support, intimate family celebration.</p></div>
      <div class="wp-card"><h3>Décor & Styling</h3><p>Centrepieces, balloon arches, LED backdrops, gold/royal/floral themes — bespoke to your vision.</p></div>
      <div class="wp-card"><h3>Diaspora Weddings</h3><p>Remote coordination for UK/US/EU couples planning a destination wedding in Nigeria. Full WhatsApp management.</p></div>
      <div class="wp-card"><h3>Vendor Network</h3><p>Caterers, photographers, MCs, live bands, cake designers, makeup artists — vetted Nigerian vendors at best prices.</p></div>
    </div>
  </div>
</section>
<section class="wp-wa-strip">
  <h2>💍 Begin Your Wedding Journey Today</h2>
  <p>WhatsApp us with your wedding date, guest count, and style vision. We'll respond with a personalised consultation.</p>
  <a href="${waHref}" class="wp-wa-btn" target="_blank" rel="noopener">Chat on WhatsApp</a>
</section>
<section class="wp-section">
  <div class="wp-container">
    <h2>Couples We've Served</h2>
    <div class="wp-testimonials">
      <div class="wp-testi"><p class="wp-testi-text">"They planned our traditional and white wedding flawlessly. 300 guests, not a single hitch. The aso-ebi coordination alone was worth every kobo."</p><p class="wp-testi-author">— Adaeze & Chibueze, Lagos, 2025</p></div>
      <div class="wp-testi"><p class="wp-testi-text">"We're in London and they coordinated our full Lagos wedding remotely on WhatsApp. Every vendor was on time, décor was breathtaking."</p><p class="wp-testi-author">— Dayo & Tolu, London/Lagos, 2025</p></div>
    </div>
  </div>
</section>
<footer class="wp-footer"><div class="wp-container"><p>&copy; ${new Date().getFullYear()} ${name}. CPPE Certified. CAC Registered. | Payment: Paystack · Bank Transfer (milestone schedule) | <a href="/contact">Contact</a></p></div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'We are CPPE-certified wedding planners specialising in traditional, white, and court weddings across Nigeria. We coordinate every detail so you can enjoy every moment.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="wp-nav"><a href="/" class="wp-nav-brand">💍 ${name}</a><a href="/contact" class="wp-nav-cta">Contact Us</a></nav>
<section class="wp-hero" style="padding:3.5rem 1rem 2.5rem;"><h1>About ${name}</h1><p>Crafting unforgettable Nigerian weddings since we began</p></section>
<section class="wp-section"><div class="wp-container"><div class="wp-grid">
  <div><h2>Our Story</h2><p style="margin:1rem 0;color:var(--wp-muted);font-family:'Segoe UI',sans-serif;">${desc}</p><p style="font-family:'Segoe UI',sans-serif;">Based in ${city}, we have coordinated hundreds of Nigerian weddings — from intimate Abuja registry ceremonies to 500-guest Lagos ballroom receptions. We understand every tradition, every family dynamic, and every budget.</p>${phone ? `<p style="margin-top:1rem;font-family:'Segoe UI',sans-serif;"><strong>Phone:</strong> ${phone}</p>` : ''}</div>
  <div><h2>Our Credentials</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--wp-muted);font-family:'Segoe UI',sans-serif;">
    <li>✅ CPPE Certified Event Planner</li>
    <li>✅ CAC Business Registration</li>
    <li>✅ Featured: Bella Naija Weddings</li>
    <li>✅ 200+ weddings coordinated</li>
    <li>✅ All traditions: Yoruba, Igbo, Hausa, Urhobo</li>
    <li>✅ Diaspora wedding specialists</li>
  </ul></div>
</div></div></section>
<footer class="wp-footer"><div class="wp-container"><p>&copy; ${new Date().getFullYear()} ${name} | CPPE Certified | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="wp-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="wp-price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Contact for pricing'}</p></div>`).join('')
    : `<div class="wp-card"><h3>Essential Package</h3><p>Day-of coordination, vendor liaison, ceremony timeline.</p><p class="wp-price">From ₦350,000</p></div>
       <div class="wp-card"><h3>Classic Package</h3><p>Full 3-month planning, traditional + white wedding.</p><p class="wp-price">From ₦800,000</p></div>
       <div class="wp-card"><h3>Luxury Package</h3><p>6-month full service, diaspora coordination included.</p><p class="wp-price">From ₦2,500,000</p></div>
       <div class="wp-card"><h3>Traditional Only</h3><p>Wine carrying, kolanut, aso-ebi, family rites coordination.</p><p class="wp-price">From ₦250,000</p></div>
       <div class="wp-card"><h3>Décor & Styling</h3><p>Full décor design and execution — any theme.</p><p class="wp-price">From ₦180,000</p></div>
       <div class="wp-card"><h3>Day-of Coordination</h3><p>Arrive on your wedding day and relax — we handle everything.</p><p class="wp-price">From ₦150,000</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Packages — ${name}</title>${CSS}</head><body>
<nav class="wp-nav"><a href="/" class="wp-nav-brand">💍 ${name}</a><a href="/contact" class="wp-nav-cta">Book a Consultation</a></nav>
<section class="wp-hero" style="padding:3.5rem 1rem 2.5rem;"><h1>Wedding Packages</h1><p>All prices in Nigerian Naira (₦). Milestone payment schedule available.</p></section>
<section class="wp-section"><div class="wp-container"><div class="wp-grid">${itemsHtml}</div></div></section>
<footer class="wp-footer"><div class="wp-container"><p>&copy; ${new Date().getFullYear()} ${name} | Payment: Paystack · Bank Transfer | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const waHref = waLink(phone, 'Hello, I would like to discuss planning my wedding.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${name}</title>${CSS}</head><body>
<nav class="wp-nav"><a href="/" class="wp-nav-brand">💍 ${name}</a><a href="${waHref}" class="wp-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="wp-hero" style="padding:3.5rem 1rem 2.5rem;"><h1>Begin Your Journey</h1><p>Every great wedding starts with a conversation — let's talk</p></section>
<section class="wp-section"><div class="wp-container"><div class="wp-contact-grid">
  <div class="wp-contact-box">
    <h3>📱 WhatsApp Consultation</h3>
    <p style="font-family:'Segoe UI',sans-serif;">Share your wedding date, estimated guest count, and style vision. We'll respond with a tailored proposal.</p>
    <a href="${waHref}" class="wp-btn wp-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.75rem;text-decoration:none;padding:.6rem 1.2rem;font-family:'Segoe UI',sans-serif;">Start on WhatsApp</a>
    ${phoneTxt ? `<p style="margin-top:1rem;font-family:'Segoe UI',sans-serif;"><strong>Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p style="font-family:'Segoe UI',sans-serif;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p style="font-family:'Segoe UI',sans-serif;"><strong>Office:</strong> ${city}, Nigeria</p>
  </div>
  <div class="wp-contact-box">
    <h3>Enquiry Form</h3>
    <form class="wp-form" onsubmit="return false;">
      <input class="wp-input" type="text" placeholder="Your full name" autocomplete="name">
      <input class="wp-input" type="tel" placeholder="Phone number" autocomplete="tel">
      <input class="wp-input" type="date" placeholder="Wedding date (approximate)">
      <select class="wp-input"><option value="">-- Wedding type --</option><option>Traditional only</option><option>White / church only</option><option>Traditional + white</option><option>Full multi-day (introduction, trad, white)</option><option>Court (registry)</option><option>Destination / diaspora</option></select>
      <input class="wp-input" type="number" placeholder="Estimated guest count" min="1">
      <textarea class="wp-input" rows="3" placeholder="Tell us more about your vision (venue, theme, budget range)..."></textarea>
      <div><input type="checkbox" id="ndpr-wp" required> <label for="ndpr-wp" class="wp-ndpr">I consent to ${name} storing my enquiry details to plan my wedding, in accordance with Nigeria's NDPR.</label></div>
      <button class="wp-submit" type="submit">Send Enquiry</button>
    </form>
  </div>
</div>
<div style="margin-top:2rem;padding:1rem;background:var(--wp-blush);border-radius:8px;font-size:.85rem;color:var(--wp-muted);font-family:'Segoe UI',sans-serif;">
  <strong>Payment:</strong> Paystack · Bank transfer · Milestone-based payment schedule (30%/40%/30% structure available)
</div>
</div></section>
<footer class="wp-footer"><div class="wp-container"><p>&copy; ${new Date().getFullYear()} ${name} | CPPE Certified | CAC Registered | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const weddingPlannerWeddingPlannerSiteTemplate: WebsiteTemplateContract = {
  slug: 'wedding-planner-wedding-planner-site',
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
