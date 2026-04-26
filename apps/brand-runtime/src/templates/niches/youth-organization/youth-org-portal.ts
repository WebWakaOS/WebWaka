/**
 * Youth Organisation Portal — Pillar 3 Website Template
 * Niche ID: P3-youth-organization-youth-org-portal
 * Vertical: youth-organization (priority=3, high)
 * Category: civic
 * Family: standalone
 * Research brief: docs/templates/research/youth-organization-youth-org-portal-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: CAC (Incorporated Trustees); FMYSD oversight; NYSC affiliation; NDPR
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to join or support the organisation.')}`;
}

const CSS = `
<style>
:root{--yo-green:#009a44;--yo-orange:#ff6b00;--yo-dark:#0d1117;--yo-light:#f0f7f0;--yo-text:#1a1a2e;--yo-muted:#5a6472;--yo-border:#d0e8d0;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--yo-text);background:#fff;font-size:16px;line-height:1.65;}
.yo-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.yo-nav{background:var(--yo-dark);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.yo-nav-brand{color:#fff;font-size:1.2rem;font-weight:700;text-decoration:none;}
.yo-nav-cta{background:var(--yo-orange);color:#fff;padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9rem;}
.yo-hero{background:linear-gradient(135deg,var(--yo-dark) 0%,var(--yo-green) 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;}
.yo-hero-flag{font-size:2.5rem;margin-bottom:1rem;}
.yo-hero h1{font-size:clamp(1.8rem,5vw,2.8rem);font-weight:800;margin-bottom:.5rem;}
.yo-hero-tagline{opacity:.9;font-size:1rem;margin-bottom:.5rem;}
.yo-hero-affil{color:#a8ffb8;font-size:.85rem;margin-bottom:2rem;}
.yo-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:5px;text-decoration:none;font-weight:700;font-size:.95rem;min-height:44px;line-height:1.3;}
.yo-btn-primary{background:var(--yo-orange);color:#fff;}
.yo-btn-outline{border:2px solid #fff;color:#fff;}
.yo-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.yo-cac-strip{background:var(--yo-green);color:#fff;text-align:center;padding:.55rem;font-size:.83rem;}
.yo-section{padding:3rem 1rem;}
.yo-section-alt{background:var(--yo-light);}
.yo-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--yo-dark);}
.yo-section-sub{color:var(--yo-muted);margin-bottom:2rem;}
.yo-progs{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;}
.yo-prog{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.08);border-top:4px solid var(--yo-green);}
.yo-prog .icon{font-size:1.8rem;margin-bottom:.5rem;}
.yo-prog h3{font-size:1rem;font-weight:700;color:var(--yo-dark);margin-bottom:.3rem;}
.yo-prog p{font-size:.9rem;color:var(--yo-muted);}
.yo-impact{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;margin-top:1rem;}
.yo-stat{background:#fff;border-radius:8px;padding:1.5rem;text-align:center;box-shadow:0 1px 5px rgba(0,0,0,.08);}
.yo-stat .num{font-size:2rem;font-weight:800;color:var(--yo-green);}
.yo-stat .label{font-size:.85rem;color:var(--yo-muted);}
.yo-news{display:grid;gap:1rem;margin-top:1rem;}
.yo-news-item{background:#fff;border-radius:6px;padding:1rem 1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.07);border-left:3px solid var(--yo-orange);}
.yo-news-item h4{font-size:.95rem;font-weight:700;color:var(--yo-dark);}
.yo-news-item p{font-size:.85rem;color:var(--yo-muted);}
.yo-news-item .date{font-size:.8rem;color:var(--yo-green);font-weight:600;}
.yo-wa-strip{background:var(--yo-dark);color:#fff;padding:2.5rem 1rem;text-align:center;}
.yo-wa-strip h2{font-size:1.5rem;margin-bottom:.5rem;}
.yo-wa-strip p{opacity:.85;margin-bottom:1.25rem;}
.yo-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.yo-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.yo-contact-box{background:var(--yo-light);padding:1.5rem;border-radius:8px;border:1px solid var(--yo-border);}
.yo-contact-box h3{margin-bottom:1rem;color:var(--yo-dark);}
.yo-contact-box a{color:var(--yo-green);font-weight:600;}
.yo-form{display:flex;flex-direction:column;gap:.75rem;}
.yo-input{padding:.7rem 1rem;border:1px solid var(--yo-border);border-radius:4px;font-size:1rem;width:100%;}
.yo-ndpr{font-size:.8rem;color:var(--yo-muted);}
.yo-submit{background:var(--yo-green);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.yo-footer{background:var(--yo-dark);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;}
.yo-footer a{color:#a8ffb8;}
@media(max-width:600px){.yo-hero{padding:3rem 1rem 2rem;}.yo-hero h1{font-size:1.8rem;}.yo-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Youth Power. Nigeria\'s Future. Not Later. Now.');
  const desc = esc((ctx.data.description as string | null) ?? 'A CAC-registered youth organisation driving civic participation, skills development, community service, and leadership development for young Nigerians.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const affil = esc((ctx.data.affiliation as string | null) ?? 'FMYSD Recognised');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20to%20join.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const progsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="yo-prog"><div class="icon">🎯</div><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}</div>`).join('')
    : `<div class="yo-prog"><div class="icon">🏘️</div><h3>Community Development</h3><p>Clean-up exercises, road repairs, tree planting, and public facility improvement in our communities.</p></div>
       <div class="yo-prog"><div class="icon">💻</div><h3>Digital Skills</h3><p>Free coding, graphic design, social media management, and e-commerce training for young Nigerians.</p></div>
       <div class="yo-prog"><div class="icon">🗳️</div><h3>Civic Engagement</h3><p>Voter registration drives, INEC education, and anti-corruption advocacy. Youth in politics.</p></div>
       <div class="yo-prog"><div class="icon">🎓</div><h3>Scholarship & Mentorship</h3><p>Academic scholarships, university application support, and mentorship from leading professionals.</p></div>
       <div class="yo-prog"><div class="icon">💼</div><h3>Entrepreneurship</h3><p>Business plan competitions, SME grant application support, and startup mentorship.</p></div>
       <div class="yo-prog"><div class="icon">🌍</div><h3>Exchange & Leadership</h3><p>Young African Leaders Initiative, international exchange programmes, UN youth forums.</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} | ${city}</title>${CSS}</head><body>
<nav class="yo-nav">
  <a href="/" class="yo-nav-brand">🇳🇬 ${name}</a>
  <a href="/contact" class="yo-nav-cta">Join the Movement</a>
</nav>
<div class="yo-cac-strip">
  ✅ CAC Registered ${cacNo ? `(${cacNo})` : ''} &nbsp;|&nbsp; ${affil} &nbsp;|&nbsp; NDPR Compliant &nbsp;|&nbsp; ${city}
</div>
<section class="yo-hero">
  <div class="yo-hero-flag">🇳🇬</div>
  <h1>${name}</h1>
  <p class="yo-hero-tagline">${tagline}</p>
  <p style="max-width:600px;margin:0 auto .75rem;opacity:.85;font-size:.9rem;">${desc}</p>
  <p class="yo-hero-affil">${affil} | ${city}</p>
  <div class="yo-hero-btns">
    <a href="/contact" class="yo-btn yo-btn-primary">Join the Movement</a>
    <a href="${waHref}" class="yo-btn yo-btn-outline" target="_blank" rel="noopener">📱 WhatsApp Us</a>
  </div>
</section>
<section class="yo-section">
  <div class="yo-container">
    <h2>Our Programmes</h2>
    <p class="yo-section-sub">What we do for young Nigerians — and what young Nigerians do for Nigeria</p>
    <div class="yo-progs">${progsHtml}</div>
  </div>
</section>
<section class="yo-section yo-section-alt">
  <div class="yo-container">
    <h2>Our Impact</h2>
    <p class="yo-section-sub">Numbers that speak for our communities</p>
    <div class="yo-impact">
      <div class="yo-stat"><div class="num">1,200+</div><div class="label">Active Members</div></div>
      <div class="yo-stat"><div class="num">8</div><div class="label">State Chapters</div></div>
      <div class="yo-stat"><div class="num">45</div><div class="label">Projects Completed</div></div>
      <div class="yo-stat"><div class="num">620</div><div class="label">Skills Trained (2025)</div></div>
    </div>
  </div>
</section>
<section class="yo-section">
  <div class="yo-container">
    <h2>Latest News</h2>
    <p class="yo-section-sub">Official updates from our organisation</p>
    <div class="yo-news">
      <div class="yo-news-item"><p class="date">April 2026</p><h4>Annual General Meeting — New Executive Elected</h4><p>At the 2026 AGM held in ${city}, a new executive committee was elected to lead the organisation for the 2026–2028 term.</p></div>
      <div class="yo-news-item"><p class="date">March 2026</p><h4>Digital Skills Training Reaches 200 Youths in 3 Weeks</h4><p>Our free digital skills workshop (coding, design, e-commerce) reached 200 young people across 3 LGAs in ${city}.</p></div>
    </div>
  </div>
</section>
<section class="yo-wa-strip">
  <h2>📱 Join the Movement on WhatsApp</h2>
  <p>Connect with our team, get updates on events, volunteer opportunities, and programmes for young Nigerians.</p>
  <a href="${waHref}" class="yo-wa-btn" target="_blank" rel="noopener">Join on WhatsApp</a>
</section>
<footer class="yo-footer"><div class="yo-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | CAC Registered ${cacNo ? `(${cacNo})` : ''} | ${affil} | NDPR Compliant</p>
  <p style="margin-top:.5rem;font-size:.8rem;">Membership: Paystack · Bank transfer | <a href="/contact">Join Now</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'A youth organisation dedicated to empowerment, civic engagement, and community development in Nigeria.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const affil = esc((ctx.data.affiliation as string | null) ?? 'FMYSD Recognised');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="yo-nav"><a href="/" class="yo-nav-brand">🇳🇬 ${name}</a><a href="/contact" class="yo-nav-cta">Join Us</a></nav>
<section class="yo-hero" style="padding:3rem 1rem 2.5rem;"><div class="yo-hero-flag">🇳🇬</div><h1>About ${name}</h1><p class="yo-hero-tagline">${city} | ${affil}</p></section>
<section class="yo-section"><div class="yo-container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
  <div><h2>Who We Are</h2><p style="margin:1rem 0;color:var(--yo-muted);">${desc}</p></div>
  <div><h2>Compliance</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--yo-muted);">
    ${cacNo ? `<li>✅ CAC Registered (${cacNo})</li>` : '<li>✅ CAC Registered</li>'}
    <li>✅ ${affil}</li>
    <li>✅ Elected executive committee</li>
    <li>✅ Annual report published</li>
    <li>✅ NDPR-compliant member data</li>
  </ul></div>
</div></div></section>
<footer class="yo-footer"><div class="yo-container"><p>&copy; ${new Date().getFullYear()} ${name} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="yo-prog"><div class="icon">🎯</div><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}</div>`).join('')
    : `<div class="yo-prog"><div class="icon">🏘️</div><h3>Community Service</h3><p>Clean-up, infrastructure repair, tree planting across our LGAs.</p></div>
       <div class="yo-prog"><div class="icon">💻</div><h3>Digital Skills</h3><p>Free coding, design, and e-commerce workshops.</p></div>
       <div class="yo-prog"><div class="icon">🗳️</div><h3>Civic Engagement</h3><p>Voter registration, INEC education, anti-corruption advocacy.</p></div>
       <div class="yo-prog"><div class="icon">🎓</div><h3>Scholarships</h3><p>Academic scholarships and mentorship for secondary and tertiary students.</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Programmes — ${name}</title>${CSS}</head><body>
<nav class="yo-nav"><a href="/" class="yo-nav-brand">🇳🇬 ${name}</a><a href="/contact" class="yo-nav-cta">Join Us</a></nav>
<section class="yo-hero" style="padding:3rem 1rem 2.5rem;"><h1>Our Programmes</h1><p class="yo-hero-tagline">Community. Skills. Civic Power. Leadership.</p></section>
<section class="yo-section"><div class="yo-container"><div class="yo-progs">${itemsHtml}</div></div></section>
<footer class="yo-footer"><div class="yo-container"><p>&copy; ${new Date().getFullYear()} ${name} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const waHref = waLink(phone, 'Hello, I would like to join the organisation.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Join — ${name}</title>${CSS}</head><body>
<nav class="yo-nav"><a href="/" class="yo-nav-brand">🇳🇬 ${name}</a><a href="${waHref}" class="yo-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="yo-hero" style="padding:3rem 1rem 2.5rem;"><div class="yo-hero-flag">🇳🇬</div><h1>Join ${name}</h1><p class="yo-hero-tagline">Be the change. Lead the future.</p></section>
<section class="yo-section"><div class="yo-container"><div class="yo-contact-grid">
  <div class="yo-contact-box">
    <h3>📱 WhatsApp Community Line</h3>
    <p>For membership, volunteer opportunities, events, and general enquiries.</p>
    <a href="${waHref}" class="yo-btn yo-btn-primary" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">Join on WhatsApp</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Location:</strong> ${city}, Nigeria</p>
    ${cacNo ? `<p><strong>CAC Reg.:</strong> ${cacNo}</p>` : ''}
  </div>
  <div class="yo-contact-box">
    <h3>Membership / Volunteer Form</h3>
    <form class="yo-form" onsubmit="return false;">
      <input class="yo-input" type="text" placeholder="Full name" autocomplete="name">
      <input class="yo-input" type="tel" placeholder="Phone number (WhatsApp)" autocomplete="tel">
      <input class="yo-input" type="email" placeholder="Email address" autocomplete="email">
      <input class="yo-input" type="text" placeholder="University / Institution / LGA">
      <select class="yo-input"><option value="">-- I want to --</option><option>Become a regular member</option><option>Volunteer for a project</option><option>Start a local chapter</option><option>Support as a donor</option><option>Partner as an organisation</option></select>
      <textarea class="yo-input" rows="2" placeholder="Tell us about yourself briefly..."></textarea>
      <div><input type="checkbox" id="ndpr-yo" required> <label for="ndpr-yo" class="yo-ndpr">I consent to ${name} processing my details for membership/volunteer registration, in accordance with Nigeria's NDPR.</label></div>
      <button class="yo-submit" type="submit">Submit Application</button>
    </form>
  </div>
</div></div></section>
<footer class="yo-footer"><div class="yo-container"><p>&copy; ${new Date().getFullYear()} ${name} | CAC Registered | NDPR Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const youthOrganizationYouthOrgPortalTemplate: WebsiteTemplateContract = {
  slug: 'youth-organization-youth-org-portal',
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
