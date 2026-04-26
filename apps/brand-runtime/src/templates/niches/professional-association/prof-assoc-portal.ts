/**
 * Professional Association / Regulatory Body Portal — Pillar 3 Website Template
 * Niche ID: P3-professional-association-prof-assoc-portal
 * Vertical: professional-association (priority=3, critical)
 * Category: civic
 * Family: NF-CIV-PRO standalone
 * Research brief: docs/templates/research/professional-association-prof-assoc-portal-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: Federal gazette registration, ministry oversight, professional practice acts, NDPR
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to contact the secretariat.')}`;
}

const CSS = `
<style>
:root{--pa-navy:#0a1f44;--pa-gold:#c9a84c;--pa-light:#f5f7fa;--pa-text:#1a1a2e;--pa-muted:#5a6472;--pa-border:#d1d9e6;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--pa-text);background:#fff;font-size:16px;line-height:1.65;}
.pa-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.pa-nav{background:var(--pa-navy);padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.pa-nav-brand{color:#fff;font-size:1.1rem;font-weight:700;text-decoration:none;letter-spacing:.3px;}
.pa-nav-cta{background:var(--pa-gold);color:var(--pa-navy);padding:.5rem 1rem;border-radius:3px;text-decoration:none;font-weight:700;font-size:.85rem;}
.pa-hero{background:linear-gradient(180deg,var(--pa-navy) 0%,#162d5a 100%);color:#fff;padding:4.5rem 1rem 3.5rem;text-align:center;border-bottom:4px solid var(--pa-gold);}
.pa-hero-seal{width:80px;height:80px;background:var(--pa-gold);border-radius:50%;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center;font-size:2rem;}
.pa-hero h1{font-size:clamp(1.6rem,4vw,2.4rem);font-weight:700;margin-bottom:.5rem;letter-spacing:.3px;}
.pa-hero-tagline{font-size:1rem;opacity:.85;margin-bottom:.5rem;}
.pa-hero-mandate{font-size:.9rem;color:var(--pa-gold);margin-bottom:2rem;}
.pa-btn{display:inline-block;padding:.7rem 1.4rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.95rem;min-height:44px;line-height:1.3;}
.pa-btn-primary{background:var(--pa-gold);color:var(--pa-navy);}
.pa-btn-outline{border:2px solid #fff;color:#fff;}
.pa-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.pa-gazette{background:var(--pa-gold);color:var(--pa-navy);text-align:center;padding:.6rem;font-size:.85rem;font-weight:600;}
.pa-section{padding:3rem 1rem;}
.pa-section-alt{background:var(--pa-light);}
.pa-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--pa-navy);}
.pa-section-sub{color:var(--pa-muted);margin-bottom:2rem;font-size:.95rem;}
.pa-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;}
.pa-card{background:#fff;border-radius:6px;padding:1.5rem;box-shadow:0 1px 6px rgba(10,31,68,.1);border-left:4px solid var(--pa-gold);}
.pa-card h3{font-size:1rem;font-weight:700;margin-bottom:.5rem;color:var(--pa-navy);}
.pa-card p{color:var(--pa-muted);font-size:.9rem;}
.pa-fee{margin-top:.5rem;font-weight:700;color:var(--pa-navy);}
.pa-membership-table{width:100%;border-collapse:collapse;margin-top:1rem;}
.pa-membership-table th{background:var(--pa-navy);color:#fff;padding:.75rem 1rem;text-align:left;font-size:.9rem;}
.pa-membership-table td{padding:.75rem 1rem;border-bottom:1px solid var(--pa-border);font-size:.9rem;}
.pa-membership-table tr:last-child td{border-bottom:none;}
.pa-membership-table tr:nth-child(even) td{background:var(--pa-light);}
.pa-events{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-top:1rem;}
.pa-event{background:#fff;border-radius:6px;padding:1rem 1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.08);display:flex;gap:1rem;align-items:flex-start;}
.pa-event-date{background:var(--pa-navy);color:#fff;border-radius:4px;padding:.5rem .75rem;text-align:center;min-width:52px;flex-shrink:0;}
.pa-event-date .day{font-size:1.3rem;font-weight:800;line-height:1;}
.pa-event-date .mon{font-size:.7rem;text-transform:uppercase;opacity:.8;}
.pa-event-info h4{font-size:.95rem;font-weight:700;color:var(--pa-navy);margin-bottom:.2rem;}
.pa-event-info p{font-size:.85rem;color:var(--pa-muted);}
.pa-event-info .fee{font-weight:700;color:var(--pa-navy);font-size:.85rem;}
.pa-wa-strip{background:var(--pa-navy);color:#fff;padding:2.5rem 1rem;text-align:center;border-top:3px solid var(--pa-gold);}
.pa-wa-strip h2{font-size:1.5rem;margin-bottom:.5rem;}
.pa-wa-strip p{opacity:.85;margin-bottom:1.25rem;font-size:.95rem;}
.pa-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.pa-verify{background:var(--pa-light);padding:2.5rem 1rem;text-align:center;}
.pa-verify h2{font-size:1.4rem;color:var(--pa-navy);margin-bottom:.75rem;}
.pa-verify-form{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;max-width:500px;margin:0 auto;}
.pa-verify-input{padding:.7rem 1rem;border:1px solid var(--pa-border);border-radius:4px;font-size:1rem;flex:1;min-width:180px;}
.pa-verify-btn{background:var(--pa-navy);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-weight:700;cursor:pointer;min-height:44px;}
.pa-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.pa-contact-box{background:var(--pa-light);padding:1.5rem;border-radius:6px;border:1px solid var(--pa-border);}
.pa-contact-box h3{margin-bottom:1rem;color:var(--pa-navy);font-size:1rem;}
.pa-contact-box a{color:var(--pa-navy);font-weight:600;}
.pa-form{display:flex;flex-direction:column;gap:.75rem;}
.pa-input{padding:.7rem 1rem;border:1px solid var(--pa-border);border-radius:4px;font-size:1rem;width:100%;}
.pa-ndpr{font-size:.8rem;color:var(--pa-muted);}
.pa-submit{background:var(--pa-navy);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.pa-footer{background:var(--pa-navy);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;border-top:3px solid var(--pa-gold);}
.pa-footer a{color:var(--pa-gold);}
@media(max-width:600px){.pa-hero{padding:3rem 1rem 2.5rem;}.pa-hero h1{font-size:1.5rem;}.pa-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Regulating. Elevating. Protecting the Profession.');
  const desc = esc((ctx.data.description as string | null) ?? 'The foremost body for professional regulation and member advocacy in Nigeria. Federal government gazetted. Ministry-supervised. Serving thousands of licensed professionals across all 36 states and FCT.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Abuja');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20to%20contact%20the%20secretariat.';
  const gazetteNo = esc((ctx.data.gazetteNumber as string | null) ?? 'FGN Gazette Vol. [XX] No. [YYY]');
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const eventsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="pa-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="pa-fee">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'See programme'}</p></div>`).join('')
    : `
      <div class="pa-event"><div class="pa-event-date"><div class="day">14</div><div class="mon">Jun</div></div><div class="pa-event-info"><h4>Annual General Meeting 2026</h4><p>Abuja International Conference Centre</p><p class="fee">Free for members</p></div></div>
      <div class="pa-event"><div class="pa-event-date"><div class="day">22</div><div class="mon">Jul</div></div><div class="pa-event-info"><h4>CPD Workshop: Ethics in Practice</h4><p>Online + Lagos Chapter</p><p class="fee">₦15,000 per delegate</p></div></div>
      <div class="pa-event"><div class="pa-event-date"><div class="day">10</div><div class="mon">Sep</div></div><div class="pa-event-info"><h4>Annual Dinner & Awards Gala</h4><p>Eko Hotels, Lagos</p><p class="fee">₦45,000 per table (₦250,000/table of 6)</p></div></div>
      <div class="pa-event"><div class="pa-event-date"><div class="day">05</div><div class="mon">Nov</div></div><div class="pa-event-info"><h4>Induction of New Members</h4><p>All chapters simultaneously</p><p class="fee">Free — new members only</p></div></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Professional Association | ${city}</title>${CSS}</head><body>
<nav class="pa-nav">
  <a href="/" class="pa-nav-brand">⚖️ ${name}</a>
  <a href="/contact" class="pa-nav-cta">Renew Membership</a>
</nav>
<div class="pa-gazette">
  Federal Government of Nigeria — Gazette Registered &nbsp;|&nbsp; ${gazetteNo} &nbsp;|&nbsp; Ministry Supervised &nbsp;|&nbsp; NDPR Compliant
</div>
<section class="pa-hero">
  <div class="pa-hero-seal">⚖️</div>
  <h1>${name}</h1>
  <p class="pa-hero-tagline">${tagline}</p>
  <p class="pa-hero-mandate">${desc}</p>
  <div class="pa-hero-btns">
    <a href="/contact" class="pa-btn pa-btn-primary">Renew Membership</a>
    <a href="/services" class="pa-btn pa-btn-outline">Membership Categories</a>
  </div>
</section>
<section class="pa-section">
  <div class="pa-container">
    <h2>Upcoming Events & CPD</h2>
    <p class="pa-section-sub">Continuous Professional Development, AGMs, inductions, and networking events across Nigeria</p>
    <div class="pa-events">${eventsHtml}</div>
  </div>
</section>
<section class="pa-verify">
  <h2>Member Verification Portal</h2>
  <p style="color:var(--pa-muted);margin-bottom:1.5rem;font-size:.95rem;">Verify the licence status of a registered member by entering their name or membership number.</p>
  <div class="pa-verify-form">
    <input class="pa-verify-input" type="text" placeholder="Member name or licence number">
    <button class="pa-verify-btn" type="button">Verify Member</button>
  </div>
  <p style="font-size:.8rem;color:var(--pa-muted);margin-top:1rem;">This service is for public verification only. Employers, agencies, and regulators may use it freely.</p>
</section>
<section class="pa-section pa-section-alt">
  <div class="pa-container">
    <h2>Membership Categories</h2>
    <p class="pa-section-sub">Annual subscription in Nigerian Naira (₦). Paystack and bank transfer accepted.</p>
    <table class="pa-membership-table">
      <thead><tr><th>Category</th><th>Annual Fee</th><th>Benefits</th></tr></thead>
      <tbody>
        <tr><td>Student Affiliate</td><td>₦15,000</td><td>Student ID, newsletters, chapter events</td></tr>
        <tr><td>Graduate Member</td><td>₦35,000</td><td>Practising certificate, CPD access, directory listing</td></tr>
        <tr><td>Full Member</td><td>₦60,000</td><td>All graduate benefits + voting rights + committee eligibility</td></tr>
        <tr><td>Fellow</td><td>₦90,000</td><td>FRCN post-nominal, conference fee waiver, mentorship leadership</td></tr>
        <tr><td>Corporate Member</td><td>₦150,000</td><td>5 named staff, conference table, logo on website</td></tr>
      </tbody>
    </table>
  </div>
</section>
<section class="pa-wa-strip">
  <h2>📱 Contact the Secretariat</h2>
  <p>For membership renewals, CPD certificates, gazette verification, and general enquiries — WhatsApp the secretariat.</p>
  <a href="${waHref}" class="pa-wa-btn" target="_blank" rel="noopener">WhatsApp Secretariat</a>
</section>
<footer class="pa-footer"><div class="pa-container">
  <p>&copy; ${new Date().getFullYear()} ${name}. Federal Government Gazetted. | Payment: Paystack · Bank Transfer | <a href="/contact">Contact Secretariat</a> | <a href="/services">Publications</a></p>
  <p style="margin-top:.5rem;font-size:.8rem;">Registered under the relevant Nigerian professional practice act. NDPR-compliant member data policy.</p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'We are the foremost professional regulatory body in Nigeria, serving licensed practitioners across all states and the FCT. Federal government gazetted and ministry supervised.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Abuja');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="pa-nav"><a href="/" class="pa-nav-brand">⚖️ ${name}</a><a href="/contact" class="pa-nav-cta">Contact</a></nav>
<section class="pa-hero" style="padding:3.5rem 1rem 2.5rem;"><div class="pa-hero-seal">⚖️</div><h1>About ${name}</h1><p class="pa-hero-tagline">Institution, Integrity, Impact</p></section>
<section class="pa-section"><div class="pa-container"><div class="pa-grid">
  <div><h2>Our Mandate</h2><p style="margin:1rem 0;color:var(--pa-muted);">${desc}</p><p>Located in ${city} with chapters in all 36 states and FCT. We regulate, licence, and support the professional development of our members while protecting public interest through disciplinary oversight.</p>${phone ? `<p style="margin-top:1rem;"><strong>Secretariat:</strong> ${phone}</p>` : ''}</div>
  <div><h2>Governance</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--pa-muted);">
    <li>✅ Federal Government Gazette Registration</li>
    <li>✅ Ministry Supervision (oversight ministry)</li>
    <li>✅ Professional Practice Act compliance</li>
    <li>✅ Elected Council — 3-year term</li>
    <li>✅ Disciplinary Committee (published proceedings)</li>
    <li>✅ NDPR member data policy</li>
    <li>✅ Open annual financial report</li>
  </ul></div>
</div></div></section>
<footer class="pa-footer"><div class="pa-container"><p>&copy; ${new Date().getFullYear()} ${name} | Federal Government Gazetted | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="pa-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="pa-fee">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Contact secretariat'}</p></div>`).join('')
    : `<div class="pa-card"><h3>Student Affiliate</h3><p>Student ID, newsletters, chapter events access.</p><p class="pa-fee">₦15,000/year</p></div>
       <div class="pa-card"><h3>Graduate Member</h3><p>Practising certificate, CPD, directory listing.</p><p class="pa-fee">₦35,000/year</p></div>
       <div class="pa-card"><h3>Full Member</h3><p>All benefits + voting rights + committee eligibility.</p><p class="pa-fee">₦60,000/year</p></div>
       <div class="pa-card"><h3>Fellow</h3><p>FRCN post-nominal, conference fee waiver, mentorship.</p><p class="pa-fee">₦90,000/year</p></div>
       <div class="pa-card"><h3>Corporate Member</h3><p>5 named staff, conference table, logo on website.</p><p class="pa-fee">₦150,000/year</p></div>
       <div class="pa-card"><h3>Publications</h3><p>Practice directions, newsletters, disciplinary notices — free download for members.</p><p class="pa-fee">Free for members</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Membership — ${name}</title>${CSS}</head><body>
<nav class="pa-nav"><a href="/" class="pa-nav-brand">⚖️ ${name}</a><a href="/contact" class="pa-nav-cta">Renew Now</a></nav>
<section class="pa-hero" style="padding:3.5rem 1rem 2.5rem;"><h1>Membership & Publications</h1><p class="pa-hero-tagline">All fees in Nigerian Naira (₦). Paystack and bank transfer accepted.</p></section>
<section class="pa-section"><div class="pa-container"><div class="pa-grid">${itemsHtml}</div></div></section>
<footer class="pa-footer"><div class="pa-container"><p>&copy; ${new Date().getFullYear()} ${name} | Payment: Paystack · Bank Transfer | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Abuja');
  const waHref = waLink(phone, 'Hello, I would like to contact the secretariat.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${name}</title>${CSS}</head><body>
<nav class="pa-nav"><a href="/" class="pa-nav-brand">⚖️ ${name}</a><a href="${waHref}" class="pa-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="pa-hero" style="padding:3.5rem 1rem 2.5rem;"><div class="pa-hero-seal">⚖️</div><h1>Contact the Secretariat</h1><p class="pa-hero-tagline">Membership renewals, CPD certificates, and general enquiries</p></section>
<section class="pa-section"><div class="pa-container"><div class="pa-contact-grid">
  <div class="pa-contact-box">
    <h3>📱 WhatsApp Secretariat</h3>
    <p>Fastest channel for membership, CPD, and verification queries.</p>
    <a href="${waHref}" class="pa-btn pa-btn-primary" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">WhatsApp Secretariat</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Secretariat Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Headquarters:</strong> ${city}, Nigeria</p>
  </div>
  <div class="pa-contact-box">
    <h3>Member Enquiry Form</h3>
    <form class="pa-form" onsubmit="return false;">
      <input class="pa-input" type="text" placeholder="Full name" autocomplete="name">
      <input class="pa-input" type="tel" placeholder="Phone number" autocomplete="tel">
      <input class="pa-input" type="email" placeholder="Email address" autocomplete="email">
      <input class="pa-input" type="text" placeholder="Membership number (if applicable)">
      <select class="pa-input"><option value="">-- Enquiry type --</option><option>Membership renewal</option><option>New membership application</option><option>CPD certificate request</option><option>Member verification</option><option>Disciplinary complaint</option><option>General enquiry</option></select>
      <textarea class="pa-input" rows="3" placeholder="Describe your enquiry..."></textarea>
      <div><input type="checkbox" id="ndpr-pa" required> <label for="ndpr-pa" class="pa-ndpr">I consent to ${name} processing my details for this membership enquiry, in accordance with Nigeria's NDPR and our data protection policy.</label></div>
      <button class="pa-submit" type="submit">Submit Enquiry</button>
    </form>
  </div>
</div>
<div style="margin-top:2rem;padding:1rem;background:var(--pa-light);border-radius:6px;font-size:.85rem;color:var(--pa-muted);border:1px solid var(--pa-border);">
  <strong>Payment of membership dues:</strong> Paystack online payment · Bank transfer (account details on receipt)
</div>
</div></section>
<footer class="pa-footer"><div class="pa-container"><p>&copy; ${new Date().getFullYear()} ${name} | Federal Government Gazetted | NDPR Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const professionalAssociationProfAssocPortalTemplate: WebsiteTemplateContract = {
  slug: 'professional-association-prof-assoc-portal',
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
