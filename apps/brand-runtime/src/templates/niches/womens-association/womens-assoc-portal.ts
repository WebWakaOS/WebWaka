/**
 * Women's Association Portal — Pillar 3 Website Template
 * Niche ID: P3-womens-association-womens-assoc-portal
 * Vertical: womens-association (priority=3, high)
 * Category: civic
 * Family: NF-CIV-GEN standalone
 * Research brief: docs/templates/research/womens-association-womens-assoc-portal-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: CAC (Incorporated Trustees/Cooperative); FMWA oversight; NCWS affiliation; NDPR
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to join the association.')}`;
}

const CSS = `
<style>
:root{--wa-purple:#5c2d91;--wa-pink:#e91e8c;--wa-light:#fdf5ff;--wa-gold:#f5a623;--wa-text:#1a1a2e;--wa-muted:#5a6472;--wa-border:#e0d0ee;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--wa-text);background:#fff;font-size:16px;line-height:1.65;}
.wa-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.wa-nav{background:var(--wa-purple);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.wa-nav-brand{color:#fff;font-size:1.1rem;font-weight:700;text-decoration:none;}
.wa-nav-cta{background:var(--wa-pink);color:#fff;padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.85rem;}
.wa-hero{background:linear-gradient(135deg,var(--wa-purple) 0%,var(--wa-pink) 100%);color:#fff;padding:4.5rem 1rem 3.5rem;text-align:center;}
.wa-hero-icon{font-size:3rem;margin-bottom:1rem;}
.wa-hero h1{font-size:clamp(1.7rem,4vw,2.4rem);font-weight:700;margin-bottom:.5rem;}
.wa-hero-tagline{opacity:.9;margin-bottom:.5rem;font-size:1rem;}
.wa-hero-affil{color:var(--wa-gold);font-size:.85rem;margin-bottom:2rem;}
.wa-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:5px;text-decoration:none;font-weight:700;font-size:.95rem;min-height:44px;line-height:1.3;}
.wa-btn-primary{background:var(--wa-gold);color:#1a1a2e;}
.wa-btn-outline{border:2px solid #fff;color:#fff;}
.wa-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.wa-cac-strip{background:var(--wa-gold);color:#1a1a2e;text-align:center;padding:.55rem;font-size:.84rem;font-weight:600;}
.wa-section{padding:3rem 1rem;}
.wa-section-alt{background:var(--wa-light);}
.wa-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--wa-purple);}
.wa-section-sub{color:var(--wa-muted);margin-bottom:2rem;font-size:.95rem;}
.wa-progs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;}
.wa-prog-card{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 1px 6px rgba(92,45,145,.1);border-left:4px solid var(--wa-pink);}
.wa-prog-card h3{font-size:1rem;font-weight:700;color:var(--wa-purple);margin-bottom:.5rem;}
.wa-prog-card p{color:var(--wa-muted);font-size:.9rem;}
.wa-prog-card .badge{margin-top:.5rem;display:inline-block;background:var(--wa-light);color:var(--wa-purple);font-size:.78rem;font-weight:700;padding:.2rem .6rem;border-radius:3px;border:1px solid var(--wa-border);}
.wa-impact{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;margin-top:1rem;}
.wa-stat{background:#fff;border-radius:8px;padding:1.5rem;text-align:center;box-shadow:0 1px 5px rgba(92,45,145,.1);}
.wa-stat .num{font-size:2rem;font-weight:800;color:var(--wa-purple);}
.wa-stat .label{font-size:.85rem;color:var(--wa-muted);}
.wa-events{display:grid;gap:1rem;margin-top:1rem;}
.wa-event{background:#fff;border-radius:6px;padding:1rem 1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.07);border-left:3px solid var(--wa-purple);}
.wa-event h4{font-size:.95rem;font-weight:700;color:var(--wa-purple);}
.wa-event p{font-size:.85rem;color:var(--wa-muted);}
.wa-event .date{font-size:.8rem;color:var(--wa-pink);font-weight:600;}
.wa-wa-strip{background:var(--wa-purple);color:#fff;padding:2.5rem 1rem;text-align:center;}
.wa-wa-strip h2{font-size:1.4rem;margin-bottom:.5rem;}
.wa-wa-strip p{opacity:.85;margin-bottom:1.25rem;}
.wa-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.wa-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.wa-contact-box{background:var(--wa-light);padding:1.5rem;border-radius:8px;border:1px solid var(--wa-border);}
.wa-contact-box h3{margin-bottom:1rem;color:var(--wa-purple);font-size:1rem;}
.wa-contact-box a{color:var(--wa-purple);font-weight:600;}
.wa-form{display:flex;flex-direction:column;gap:.75rem;}
.wa-input{padding:.7rem 1rem;border:1px solid var(--wa-border);border-radius:4px;font-size:1rem;width:100%;}
.wa-ndpr{font-size:.8rem;color:var(--wa-muted);}
.wa-submit{background:var(--wa-purple);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.wa-footer{background:var(--wa-purple);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;}
.wa-footer a{color:var(--wa-gold);}
@media(max-width:600px){.wa-hero{padding:3rem 1rem 2.5rem;}.wa-hero h1{font-size:1.6rem;}.wa-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Empowering Women. Strengthening Nigeria.');
  const desc = esc((ctx.data.description as string | null) ?? 'A CAC-registered women\'s association dedicated to the economic empowerment, skills development, and political participation of Nigerian women. NCWS affiliated. FMWA recognised.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const ncwsAffil = esc((ctx.data.affiliation as string | null) ?? 'NCWS Affiliated');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20to%20join%20the%20association.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const progsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="wa-prog-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}${o.priceKobo !== null ? `<span class="wa-badge">${fmtKobo(o.priceKobo)}</span>` : '<span class="wa-badge">Free for members</span>'}</div>`).join('')
    : `<div class="wa-prog-card"><h3>💰 Cooperative Savings (Ajo/Esusu)</h3><p>Weekly/monthly rotating savings scheme for members. Loan access after 3 months of contribution.</p><span class="wa-badge">Members only</span></div>
       <div class="wa-prog-card"><h3>🎓 Skills Training</h3><p>Tailoring, soap-making, food processing, ICT, and financial literacy workshops — subsidised for members.</p><span class="wa-badge">₦5,000–₦15,000</span></div>
       <div class="wa-prog-card"><h3>🏛️ Political Participation</h3><p>Voter education, party coordination, advocacy for the 35% Affirmative Action. Women in leadership support.</p><span class="wa-badge">Free</span></div>
       <div class="wa-prog-card"><h3>📦 Market Advocacy</h3><p>Levies negotiation, market regulation compliance, dispute resolution for market trader members.</p><span class="wa-badge">Members only</span></div>
       <div class="wa-prog-card"><h3>🤝 Microcredit Scheme</h3><p>Group-guaranteed business loans of ₦50,000–₦500,000 for member businesses.</p><span class="wa-badge">₦50k–₦500k</span></div>
       <div class="wa-prog-card"><h3>📋 Legal Aid</h3><p>Pro bono legal referral for domestic, property, and market-related issues via partner lawyers.</p><span class="wa-badge">Free referral</span></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} | ${city}</title>${CSS}</head><body>
<nav class="wa-nav">
  <a href="/" class="wa-nav-brand">👩🏾‍🤝‍👩🏿 ${name}</a>
  <a href="/contact" class="wa-nav-cta">Join the Association</a>
</nav>
<div class="wa-cac-strip">
  ✅ CAC Registered ${cacNo ? `(${cacNo})` : ''} &nbsp;|&nbsp; ${ncwsAffil} &nbsp;|&nbsp; FMWA Recognised &nbsp;|&nbsp; NDPR Compliant
</div>
<section class="wa-hero">
  <div class="wa-hero-icon">👩🏾‍🤝‍👩🏿</div>
  <h1>${name}</h1>
  <p class="wa-hero-tagline">${tagline}</p>
  <p style="max-width:600px;margin:0 auto .75rem;opacity:.85;font-size:.9rem;">${desc}</p>
  <p class="wa-hero-affil">${ncwsAffil} | ${city} | CAC Registered</p>
  <div class="wa-hero-btns">
    <a href="/contact" class="wa-btn wa-btn-primary">Join the Association</a>
    <a href="${waHref}" class="wa-btn wa-btn-outline" target="_blank" rel="noopener">📱 WhatsApp Secretariat</a>
  </div>
</section>
<section class="wa-section">
  <div class="wa-container">
    <h2>Our Programmes & Services</h2>
    <p class="wa-section-sub">Empowerment, savings, skills, advocacy — for all women in ${city} and beyond</p>
    <div class="wa-progs-grid">${progsHtml}</div>
  </div>
</section>
<section class="wa-section wa-section-alt">
  <div class="wa-container">
    <h2>Our Impact</h2>
    <p class="wa-section-sub">Serving Nigerian women across our chapter network</p>
    <div class="wa-impact">
      <div class="wa-stat"><div class="num">2,400+</div><div class="label">Active Members</div></div>
      <div class="wa-stat"><div class="num">12</div><div class="label">State Chapters</div></div>
      <div class="wa-stat"><div class="num">₦18M</div><div class="label">Loans Disbursed (2025)</div></div>
      <div class="wa-stat"><div class="num">340</div><div class="label">Skills Trained (2025)</div></div>
    </div>
  </div>
</section>
<section class="wa-wa-strip">
  <h2>📱 Join Our WhatsApp Community</h2>
  <p>Connect with the secretariat, get programme updates, and join the sister network on WhatsApp.</p>
  <a href="${waHref}" class="wa-wa-btn" target="_blank" rel="noopener">WhatsApp Secretariat</a>
</section>
<footer class="wa-footer"><div class="wa-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | CAC Registered ${cacNo ? `(${cacNo})` : ''} | ${ncwsAffil} | NDPR Compliant</p>
  <p style="margin-top:.5rem;font-size:.8rem;">Membership dues: Paystack · Bank transfer | <a href="/contact">Join Now</a> | <a href="/about">About Us</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'A women\'s association dedicated to empowerment, advocacy, and community development.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const ncwsAffil = esc((ctx.data.affiliation as string | null) ?? 'NCWS Affiliated');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="wa-nav"><a href="/" class="wa-nav-brand">👩🏾‍🤝‍👩🏿 ${name}</a><a href="/contact" class="wa-nav-cta">Join Us</a></nav>
<section class="wa-hero" style="padding:3rem 1rem 2.5rem;"><div class="wa-hero-icon">👩🏾‍🤝‍👩🏿</div><h1>About ${name}</h1><p class="wa-hero-tagline">Women Leading. Communities Thriving.</p><p class="wa-hero-affil">${city} | ${ncwsAffil}</p></section>
<section class="wa-section"><div class="wa-container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
  <div><h2>Our Story</h2><p style="margin:1rem 0;color:var(--wa-muted);">${desc}</p>${phone ? `<p><strong>Secretariat:</strong> ${phone}</p>` : ''}</div>
  <div><h2>Governance & Compliance</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--wa-muted);">
    ${cacNo ? `<li>✅ CAC Registered (${cacNo})</li>` : '<li>✅ CAC Registered Association</li>'}
    <li>✅ ${ncwsAffil}</li>
    <li>✅ FMWA recognised</li>
    <li>✅ Elected executive — 2-year term</li>
    <li>✅ Annual accounts published</li>
    <li>✅ NDPR member data policy</li>
  </ul></div>
</div></div></section>
<footer class="wa-footer"><div class="wa-container"><p>&copy; ${new Date().getFullYear()} ${name} | ${ncwsAffil} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="wa-prog-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}${o.priceKobo !== null ? `<span class="wa-badge">${fmtKobo(o.priceKobo)}</span>` : '<span class="wa-badge">See secretariat</span>'}</div>`).join('')
    : `<div class="wa-prog-card"><h3>Cooperative Savings</h3><p>Ajo/Esusu rotating savings for members.</p><span class="wa-badge">Members only</span></div>
       <div class="wa-prog-card"><h3>Microcredit Loans</h3><p>₦50,000–₦500,000 for member businesses.</p><span class="wa-badge">₦50k–₦500k</span></div>
       <div class="wa-prog-card"><h3>Skills Training</h3><p>Tailoring, soap-making, ICT, financial literacy.</p><span class="wa-badge">₦5,000–₦15,000</span></div>
       <div class="wa-prog-card"><h3>Market Advocacy</h3><p>Levy negotiation and market trader support.</p><span class="wa-badge">Members only</span></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Programmes — ${name}</title>${CSS}</head><body>
<nav class="wa-nav"><a href="/" class="wa-nav-brand">👩🏾‍🤝‍👩🏿 ${name}</a><a href="/contact" class="wa-nav-cta">Join Us</a></nav>
<section class="wa-hero" style="padding:3rem 1rem 2.5rem;"><h1>Programmes & Services</h1><p class="wa-hero-tagline">For every Nigerian woman — savings, loans, training, advocacy</p></section>
<section class="wa-section"><div class="wa-container"><div class="wa-progs-grid">${itemsHtml}</div></div></section>
<footer class="wa-footer"><div class="wa-container"><p>&copy; ${new Date().getFullYear()} ${name} | Payment: Paystack · Bank Transfer | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const waHref = waLink(phone, 'Hello, I would like to join the association.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Join — ${name}</title>${CSS}</head><body>
<nav class="wa-nav"><a href="/" class="wa-nav-brand">👩🏾‍🤝‍👩🏿 ${name}</a><a href="${waHref}" class="wa-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="wa-hero" style="padding:3rem 1rem 2.5rem;"><div class="wa-hero-icon">👩🏾‍🤝‍👩🏿</div><h1>Join ${name}</h1><p class="wa-hero-tagline">Become a member. Uplift yourself. Uplift Nigeria.</p></section>
<section class="wa-section"><div class="wa-container"><div class="wa-contact-grid">
  <div class="wa-contact-box">
    <h3>📱 WhatsApp Secretariat</h3>
    <p>For membership enquiries, programme information, meeting schedules, and general questions.</p>
    <a href="${waHref}" class="wa-btn wa-btn-primary" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">WhatsApp Secretariat</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Association:</strong> ${city}, Nigeria</p>
    ${cacNo ? `<p><strong>CAC Reg.:</strong> ${cacNo}</p>` : ''}
  </div>
  <div class="wa-contact-box">
    <h3>Membership Application</h3>
    <form class="wa-form" onsubmit="return false;">
      <input class="wa-input" type="text" placeholder="Full name" autocomplete="name">
      <input class="wa-input" type="tel" placeholder="Phone number (WhatsApp)" autocomplete="tel">
      <input class="wa-input" type="email" placeholder="Email address (optional)" autocomplete="email">
      <input class="wa-input" type="text" placeholder="LGA / State">
      <input class="wa-input" type="text" placeholder="Occupation / Business type">
      <select class="wa-input"><option value="">-- Membership type --</option><option>Regular Member</option><option>Market Trader Member</option><option>Professional Women Member</option><option>Student Affiliate</option><option>Corporate Partner</option></select>
      <textarea class="wa-input" rows="2" placeholder="How did you hear about us?"></textarea>
      <div><input type="checkbox" id="ndpr-wa" required> <label for="ndpr-wa" class="wa-ndpr">I consent to ${name} processing my personal details for membership registration, in accordance with Nigeria's NDPR and our data protection policy.</label></div>
      <button class="wa-submit" type="submit">Apply for Membership</button>
    </form>
  </div>
</div>
<div style="margin-top:2rem;padding:1rem;background:var(--wa-light);border-radius:8px;font-size:.85rem;color:var(--wa-muted);border:1px solid var(--wa-border);">
  <strong>Membership dues:</strong> Paystack · Bank transfer · Cash at secretariat | Annual and monthly options available
</div>
</div></section>
<footer class="wa-footer"><div class="wa-container"><p>&copy; ${new Date().getFullYear()} ${name} | CAC Registered | NDPR Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const womensAssociationWomensAssocPortalTemplate: WebsiteTemplateContract = {
  slug: 'womens-association-womens-assoc-portal',
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
