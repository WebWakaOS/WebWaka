/**
 * Ministry & Mission Platform — Pillar 3 Website Template
 * Niche ID: P3-ministry-mission-ministry-mission-platform
 * Vertical: ministry-mission (priority=3, high)
 * Category: civic / religious
 * Family: NF-CIV-REL (variant of church — P2 SHIPPED anchor)
 * Research brief: docs/templates/research/ministry-mission-ministry-mission-platform-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: CAC Part F (Incorporated Trustees); CAN/JNI/PFN affiliation; NDPR for counselling data; SCUML for international funding
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to connect with the ministry.')}`;
}

const CSS = `
<style>
:root{--mm-purple:#3b0066;--mm-gold:#d4af37;--mm-warm:#7b2d8b;--mm-light:#fdf8ff;--mm-text:#1a1a2e;--mm-muted:#5a6472;--mm-border:#e0d0f0;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Georgia,sans-serif;color:var(--mm-text);background:#fff;font-size:16px;line-height:1.7;}
.mm-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.mm-nav{background:var(--mm-purple);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.mm-nav-brand{color:#fff;font-size:1.1rem;font-weight:700;text-decoration:none;}
.mm-nav-cta{background:var(--mm-gold);color:var(--mm-purple);padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.85rem;}
.mm-hero{background:linear-gradient(160deg,var(--mm-purple) 0%,var(--mm-warm) 100%);color:#fff;padding:5rem 1rem 4rem;text-align:center;}
.mm-hero-icon{font-size:3rem;margin-bottom:1rem;}
.mm-hero h1{font-size:clamp(1.7rem,4vw,2.5rem);font-weight:700;margin-bottom:.5rem;letter-spacing:.3px;}
.mm-hero-verse{font-style:italic;opacity:.85;margin-bottom:.5rem;font-size:.95rem;}
.mm-hero-mission{color:var(--mm-gold);font-size:.85rem;margin-bottom:2rem;}
.mm-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.95rem;min-height:44px;line-height:1.3;}
.mm-btn-primary{background:var(--mm-gold);color:var(--mm-purple);}
.mm-btn-outline{border:2px solid #fff;color:#fff;}
.mm-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.mm-cac-strip{background:var(--mm-gold);color:var(--mm-purple);text-align:center;padding:.55rem;font-size:.84rem;font-weight:600;}
.mm-section{padding:3.5rem 1rem;}
.mm-section-alt{background:var(--mm-light);}
.mm-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--mm-purple);}
.mm-section-sub{color:var(--mm-muted);margin-bottom:2rem;font-size:.95rem;}
.mm-outreach-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;}
.mm-outreach-card{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 8px rgba(59,0,102,.1);border-top:4px solid var(--mm-gold);}
.mm-outreach-card .icon{font-size:1.8rem;margin-bottom:.5rem;}
.mm-outreach-card h3{font-size:1rem;font-weight:700;color:var(--mm-purple);margin-bottom:.3rem;}
.mm-outreach-card p{font-size:.9rem;color:var(--mm-muted);}
.mm-events{display:grid;gap:1rem;margin-top:1rem;}
.mm-event{background:#fff;border-radius:6px;padding:1.1rem 1.3rem;box-shadow:0 1px 5px rgba(59,0,102,.08);display:flex;gap:1rem;align-items:flex-start;border-left:4px solid var(--mm-gold);}
.mm-event-date{background:var(--mm-purple);color:#fff;border-radius:4px;padding:.5rem .75rem;text-align:center;min-width:54px;flex-shrink:0;}
.mm-event-date .day{font-size:1.3rem;font-weight:800;line-height:1;}
.mm-event-date .mon{font-size:.7rem;text-transform:uppercase;opacity:.8;}
.mm-event-info h4{font-size:.95rem;font-weight:700;color:var(--mm-purple);}
.mm-event-info p{font-size:.85rem;color:var(--mm-muted);}
.mm-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;margin-top:1rem;}
.mm-stat{background:#fff;border-radius:8px;padding:1.5rem;text-align:center;box-shadow:0 1px 5px rgba(59,0,102,.08);}
.mm-stat .num{font-size:1.8rem;font-weight:800;color:var(--mm-purple);}
.mm-stat .label{font-size:.85rem;color:var(--mm-muted);}
.mm-wa-strip{background:var(--mm-purple);color:#fff;padding:2.5rem 1rem;text-align:center;border-top:3px solid var(--mm-gold);}
.mm-wa-strip h2{font-size:1.4rem;margin-bottom:.5rem;}
.mm-wa-strip p{opacity:.85;margin-bottom:1.25rem;font-size:.9rem;}
.mm-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.mm-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.mm-contact-box{background:var(--mm-light);padding:1.5rem;border-radius:8px;border:1px solid var(--mm-border);}
.mm-contact-box h3{margin-bottom:1rem;color:var(--mm-purple);font-size:1rem;}
.mm-contact-box a{color:var(--mm-purple);font-weight:600;}
.mm-form{display:flex;flex-direction:column;gap:.75rem;}
.mm-input{padding:.7rem 1rem;border:1px solid var(--mm-border);border-radius:4px;font-size:1rem;width:100%;font-family:inherit;}
.mm-ndpr{font-size:.8rem;color:var(--mm-muted);}
.mm-submit{background:var(--mm-purple);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.mm-footer{background:var(--mm-purple);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;border-top:3px solid var(--mm-gold);}
.mm-footer a{color:var(--mm-gold);}
@media(max-width:600px){.mm-hero{padding:3rem 1rem 2.5rem;}.mm-hero h1{font-size:1.6rem;}.mm-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Bringing the Gospel to Every Nation. Light for Nigeria, Light for the World.');
  const verse = esc((ctx.data.verse as string | null) ?? '"Go into all the world and preach the gospel." — Mark 16:15');
  const desc = esc((ctx.data.description as string | null) ?? 'CAC-registered apostolic ministry dedicated to evangelism, outreach, discipleship, and community transformation across Nigeria and beyond. CAN affiliated.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const affil = esc((ctx.data.affiliation as string | null) ?? 'CAN Affiliated');
  const founder = esc((ctx.data.founderName as string | null) ?? 'The General Overseer');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20to%20connect%20with%20the%20ministry.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const outreachHtml = offerings.length > 0
    ? offerings.map(o => `<div class="mm-outreach-card"><div class="icon">✝️</div><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}</div>`).join('')
    : `<div class="mm-outreach-card"><div class="icon">📢</div><h3>Crusades & Revivals</h3><p>Large-scale outdoor evangelism crusades across states and LGAs. Healing services, salvation calls, and followup.</p></div>
       <div class="mm-outreach-card"><div class="icon">🏥</div><h3>Healthcare Mission</h3><p>Free medical outreach — blood pressure, malaria testing, blood sugar, and referrals to state hospitals.</p></div>
       <div class="mm-outreach-card"><div class="icon">📺</div><h3>Media Ministry</h3><p>TV and radio broadcast of sermons, testimonies, and teaching programmes across Nigerian and diaspora channels.</p></div>
       <div class="mm-outreach-card"><div class="icon">🎓</div><h3>Discipleship School</h3><p>6-month intensive school of ministry for called and committed believers. Certificates issued.</p></div>
       <div class="mm-outreach-card"><div class="icon">🤝</div><h3>Community Outreach</h3><p>Food distribution, widows and orphan support, back-to-school materials, and vocational training.</p></div>
       <div class="mm-outreach-card"><div class="icon">🌍</div><h3>Mission Territories</h3><p>Active mission stations in 12 states. Supporting indigenous church planting in unreached communities.</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} | ${city}</title>${CSS}</head><body>
<nav class="mm-nav">
  <a href="/" class="mm-nav-brand">✝️ ${name}</a>
  <a href="${waHref}" class="mm-nav-cta" target="_blank" rel="noopener">📱 Connect With Us</a>
</nav>
<div class="mm-cac-strip">
  ✅ CAC Incorporated Trustees ${cacNo ? `(${cacNo})` : ''} &nbsp;|&nbsp; ${affil} &nbsp;|&nbsp; Founder: ${founder} &nbsp;|&nbsp; NDPR Compliant
</div>
<section class="mm-hero">
  <div class="mm-hero-icon">✝️</div>
  <h1>${name}</h1>
  <p class="mm-hero-verse">${verse}</p>
  <p style="max-width:600px;margin:0 auto .75rem;opacity:.85;font-size:.9rem;">${desc}</p>
  <p class="mm-hero-mission">${affil} | ${city} | ${cacNo ? `CAC Reg.: ${cacNo}` : 'CAC Registered'}</p>
  <p class="mm-hero-mission">${tagline}</p>
  <div class="mm-hero-btns">
    <a href="${waHref}" class="mm-btn mm-btn-primary" target="_blank" rel="noopener">📱 Connect With Us</a>
    <a href="/services" class="mm-btn mm-btn-outline">Our Outreach</a>
  </div>
</section>
<section class="mm-section">
  <div class="mm-container">
    <h2>Our Outreach & Programmes</h2>
    <p class="mm-section-sub">From crusade grounds to hospital wards — the mission reaches everywhere</p>
    <div class="mm-outreach-grid">${outreachHtml}</div>
  </div>
</section>
<section class="mm-section mm-section-alt">
  <div class="mm-container">
    <h2>Upcoming Crusades & Events</h2>
    <p class="mm-section-sub">Join us at our next outreach event near you</p>
    <div class="mm-events">
      <div class="mm-event"><div class="mm-event-date"><div class="day">20</div><div class="mon">Jun</div></div><div class="mm-event-info"><h4>Holy Ghost Conference — ${city}</h4><p>4-day revival conference. All are welcome. Free entry.</p></div></div>
      <div class="mm-event"><div class="mm-event-date"><div class="day">14</div><div class="mon">Jul</div></div><div class="mm-event-info"><h4>Outreach Crusade — Rural Community</h4><p>Free medical screening + evening evangelism crusade.</p></div></div>
    </div>
  </div>
</section>
<section class="mm-section">
  <div class="mm-container">
    <h2>Mission Impact</h2>
    <p class="mm-section-sub">To the glory of God — what He has done through this ministry</p>
    <div class="mm-stats">
      <div class="mm-stat"><div class="num">140+</div><div class="label">Mission Outreaches</div></div>
      <div class="mm-stat"><div class="num">12</div><div class="label">States Reached</div></div>
      <div class="mm-stat"><div class="num">45,000+</div><div class="label">Salvation Decisions</div></div>
      <div class="mm-stat"><div class="num">18</div><div class="label">Church Plants</div></div>
    </div>
  </div>
</section>
<section class="mm-wa-strip">
  <h2>📱 Prayer Line & Connect</h2>
  <p>WhatsApp our prayer team for prayer requests, counselling appointments, and ministry partnership enquiries.</p>
  <a href="${waHref}" class="mm-wa-btn" target="_blank" rel="noopener">WhatsApp Prayer Line</a>
</section>
<footer class="mm-footer"><div class="mm-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | CAC Incorporated Trustees ${cacNo ? `(${cacNo})` : ''} | ${affil}</p>
  <p style="margin-top:.5rem;font-size:.8rem;">Offerings & tithes: Paystack · Bank transfer | NDPR-compliant counselling data | <a href="/contact">Contact Ministry</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'Apostolic ministry dedicated to evangelism, discipleship, and community transformation.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const affil = esc((ctx.data.affiliation as string | null) ?? 'CAN Affiliated');
  const founder = esc((ctx.data.founderName as string | null) ?? 'The General Overseer');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="mm-nav"><a href="/" class="mm-nav-brand">✝️ ${name}</a><a href="/contact" class="mm-nav-cta">Connect</a></nav>
<section class="mm-hero" style="padding:3rem 1rem 2.5rem;"><div class="mm-hero-icon">✝️</div><h1>About ${name}</h1><p class="mm-hero-mission">${city} | ${affil} | Founder: ${founder}</p></section>
<section class="mm-section"><div class="mm-container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
  <div><h2>Our Ministry</h2><p style="margin:1rem 0;color:var(--mm-muted);">${desc}</p><p><strong>Founder:</strong> ${founder}</p><p><strong>City:</strong> ${city}</p></div>
  <div><h2>Governance & Compliance</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--mm-muted);">
    ${cacNo ? `<li>✅ CAC Part F Incorporated Trustees (${cacNo})</li>` : '<li>✅ CAC Incorporated Trustees</li>'}
    <li>✅ ${affil}</li>
    <li>✅ Ordained leadership team</li>
    <li>✅ Annual financial report for partners</li>
    <li>✅ NDPR-compliant counselling data policy</li>
    <li>✅ SCUML registered (international partners)</li>
  </ul></div>
</div></div></section>
<footer class="mm-footer"><div class="mm-container"><p>&copy; ${new Date().getFullYear()} ${name} | ${affil} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="mm-outreach-card"><div class="icon">✝️</div><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}</div>`).join('')
    : `<div class="mm-outreach-card"><div class="icon">📢</div><h3>Crusades & Revivals</h3><p>Large-scale evangelism crusades. Free entry.</p></div>
       <div class="mm-outreach-card"><div class="icon">🏥</div><h3>Healthcare Mission</h3><p>Free medical outreach across communities.</p></div>
       <div class="mm-outreach-card"><div class="icon">📺</div><h3>Media Ministry</h3><p>TV, radio, and online broadcast.</p></div>
       <div class="mm-outreach-card"><div class="icon">🎓</div><h3>Discipleship School</h3><p>6-month school of ministry.</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Outreach — ${name}</title>${CSS}</head><body>
<nav class="mm-nav"><a href="/" class="mm-nav-brand">✝️ ${name}</a><a href="/contact" class="mm-nav-cta">Partner With Us</a></nav>
<section class="mm-hero" style="padding:3rem 1rem 2.5rem;"><h1>Our Outreach & Programmes</h1><p class="mm-hero-verse">"For I was hungry and you gave me food..." — Matthew 25:35</p></section>
<section class="mm-section"><div class="mm-container"><div class="mm-outreach-grid">${itemsHtml}</div></div></section>
<footer class="mm-footer"><div class="mm-container"><p>&copy; ${new Date().getFullYear()} ${name} | Offerings: Paystack · Bank Transfer | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const waHref = waLink(phone, 'Hello, I would like to connect with the ministry or send a prayer request.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${name}</title>${CSS}</head><body>
<nav class="mm-nav"><a href="/" class="mm-nav-brand">✝️ ${name}</a><a href="${waHref}" class="mm-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="mm-hero" style="padding:3rem 1rem 2.5rem;"><div class="mm-hero-icon">✝️</div><h1>Connect With Us</h1><p class="mm-hero-verse">Prayer requests, counselling, partnerships, and general enquiries</p></section>
<section class="mm-section"><div class="mm-container"><div class="mm-contact-grid">
  <div class="mm-contact-box">
    <h3>📱 WhatsApp Prayer Line</h3>
    <p>Send prayer requests, request counselling, enquire about events, or partner with this ministry.</p>
    <a href="${waHref}" class="mm-btn mm-btn-primary" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">WhatsApp Ministry</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Office:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Location:</strong> ${city}, Nigeria</p>
    ${cacNo ? `<p><strong>CAC Reg.:</strong> ${cacNo}</p>` : ''}
  </div>
  <div class="mm-contact-box">
    <h3>Prayer Request / Connect Form</h3>
    <form class="mm-form" onsubmit="return false;">
      <input class="mm-input" type="text" placeholder="Full name" autocomplete="name">
      <input class="mm-input" type="tel" placeholder="Phone number (WhatsApp)" autocomplete="tel">
      <input class="mm-input" type="email" placeholder="Email address" autocomplete="email">
      <select class="mm-input"><option value="">-- Reason for contact --</option><option>Prayer Request</option><option>Counselling Appointment</option><option>Ministry Partnership</option><option>Event Attendance</option><option>Donation / Offering</option><option>Volunteer</option><option>General Enquiry</option></select>
      <textarea class="mm-input" rows="4" placeholder="Your prayer request or message (confidential if counselling)..."></textarea>
      <div><input type="checkbox" id="ndpr-mm" required> <label for="ndpr-mm" class="mm-ndpr">I consent to ${name} processing my contact details for ministry communication. Counselling information is kept strictly confidential. Nigeria NDPR compliant.</label></div>
      <button class="mm-submit" type="submit">Send Message</button>
    </form>
  </div>
</div></div></section>
<footer class="mm-footer"><div class="mm-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | CAC Incorporated Trustees | NDPR Compliant — Counselling Data Confidential</p>
  <p style="margin-top:.5rem;font-size:.8rem;">Offerings & tithes: Paystack · Bank transfer | <a href="/">Home</a></p>
</div></footer>
</body></html>`;
}

export const ministryMissionMinistryMissionPlatformTemplate: WebsiteTemplateContract = {
  slug: 'ministry-mission-ministry-mission-platform',
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
