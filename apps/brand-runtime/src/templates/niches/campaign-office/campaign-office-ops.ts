/**
 * Political Campaign Office Operations — Pillar 3 Website Template
 * Niche ID: P3-campaign-office-campaign-office-ops
 * Vertical: campaign-office (priority=3, critical)
 * Category: politics
 * Family: NF-POL-CAM standalone
 * Research brief: docs/templates/research/campaign-office-campaign-office-ops-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: INEC Electoral Act 2022, campaign finance disclosure, NDPR
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to join or contact the campaign team.')}`;
}

const CSS = `
<style>
:root{--co-green:#006600;--co-white:#ffffff;--co-dark:#1a2332;--co-gold:#d4a017;--co-light:#f0f4f0;--co-text:#1a2332;--co-muted:#5a6472;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--co-text);background:#fff;font-size:16px;line-height:1.6;}
.co-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.co-nav{background:var(--co-dark);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.co-nav-brand{color:#fff;font-size:1.2rem;font-weight:700;text-decoration:none;}
.co-nav-cta{background:var(--co-green);color:#fff;padding:.5rem 1.1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9rem;}
.co-hero{background:linear-gradient(135deg,var(--co-dark) 0%,var(--co-green) 100%);color:#fff;padding:5rem 1rem 3.5rem;text-align:center;}
.co-hero-flag{display:flex;justify-content:center;gap:0;margin-bottom:1.5rem;}
.co-flag-g{width:40px;height:60px;background:var(--co-green);}
.co-flag-w{width:40px;height:60px;background:#fff;}
.co-hero h1{font-size:clamp(2rem,5vw,3rem);font-weight:800;margin-bottom:.5rem;}
.co-hero-slogan{font-size:1.2rem;opacity:.9;margin-bottom:1rem;font-style:italic;}
.co-hero-candidate{font-size:1rem;color:var(--co-gold);margin-bottom:2rem;}
.co-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:700;font-size:1rem;min-height:44px;line-height:1.3;}
.co-btn-wa{background:#25D366;color:#fff;}
.co-btn-outline{border:2px solid #fff;color:#fff;}
.co-btn-primary{background:var(--co-gold);color:var(--co-dark);}
.co-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.co-inec{background:var(--co-green);color:#fff;text-align:center;padding:.6rem;font-size:.85rem;}
.co-section{padding:3rem 1rem;}
.co-section-alt{background:var(--co-light);}
.co-section h2{font-size:1.6rem;font-weight:700;margin-bottom:.5rem;color:var(--co-dark);}
.co-section-sub{color:var(--co-muted);margin-bottom:2rem;}
.co-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;}
.co-card{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.08);border-left:4px solid var(--co-green);}
.co-card h3{font-size:1rem;font-weight:700;margin-bottom:.5rem;color:var(--co-dark);}
.co-card p{color:var(--co-muted);font-size:.9rem;}
.co-pillars{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;}
.co-pillar{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.08);text-align:center;border-top:4px solid var(--co-green);}
.co-pillar .icon{font-size:2rem;margin-bottom:.5rem;}
.co-pillar h3{font-size:1rem;font-weight:700;color:var(--co-dark);margin-bottom:.5rem;}
.co-pillar p{font-size:.9rem;color:var(--co-muted);}
.co-wa-strip{background:var(--co-green);color:#fff;padding:2.5rem 1rem;text-align:center;}
.co-wa-strip h2{font-size:1.5rem;margin-bottom:.5rem;}
.co-wa-strip p{opacity:.9;margin-bottom:1.25rem;}
.co-wa-btn{background:#fff;color:var(--co-green);font-weight:700;padding:.75rem 2rem;border-radius:6px;text-decoration:none;display:inline-block;}
.co-news{display:grid;gap:1rem;margin-top:1rem;}
.co-news-item{background:#fff;border-radius:6px;padding:1rem 1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.08);border-left:3px solid var(--co-gold);}
.co-news-item h4{font-size:.95rem;font-weight:700;color:var(--co-dark);margin-bottom:.25rem;}
.co-news-item p{font-size:.85rem;color:var(--co-muted);}
.co-news-item .date{font-size:.8rem;color:var(--co-gold);font-weight:600;}
.co-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.co-contact-box{background:var(--co-light);padding:1.5rem;border-radius:8px;}
.co-contact-box h3{margin-bottom:1rem;color:var(--co-dark);}
.co-contact-box a{color:var(--co-green);font-weight:600;}
.co-form{display:flex;flex-direction:column;gap:.75rem;}
.co-input{padding:.75rem;border:1px solid #ddd;border-radius:6px;font-size:1rem;width:100%;}
.co-ndpr{font-size:.8rem;color:var(--co-muted);}
.co-submit{background:var(--co-green);color:#fff;border:none;padding:.75rem 1.5rem;border-radius:6px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.co-footer{background:var(--co-dark);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;}
.co-footer a{color:var(--co-gold);}
@media(max-width:600px){.co-hero{padding:3rem 1rem 2.5rem;}.co-hero h1{font-size:1.8rem;}.co-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const candidateName = esc((ctx.data.candidateName as string | null) ?? ctx.displayName);
  const slogan = esc((ctx.data.tagline as string | null) ?? 'Together, We Can Transform Our Future');
  const position = esc((ctx.data.position as string | null) ?? 'Your Next Governor / Senator / Representative');
  const desc = esc((ctx.data.description as string | null) ?? 'Official campaign website. INEC registered candidate. Transparent campaign finance. Join us in building a better Nigeria — ward by ward, state by state.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Abuja');
  const party = esc((ctx.data.party as string | null) ?? 'Political Party');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20want%20to%20join%20the%20campaign.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const pillarsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="co-pillar"><div class="icon">🎯</div><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}</div>`).join('')
    : `
      <div class="co-pillar"><div class="icon">💼</div><h3>Economy & Jobs</h3><p>Creating 100,000 jobs through SME support, agribusiness expansion, and infrastructure investment.</p></div>
      <div class="co-pillar"><div class="icon">🏥</div><h3>Healthcare</h3><p>Revitalising primary health centres in every ward. Free maternal care. Affordable medicine for all.</p></div>
      <div class="co-pillar"><div class="icon">🎓</div><h3>Education</h3><p>Schools without walls. Teacher salaries prioritised. Technology in every secondary school by 2027.</p></div>
      <div class="co-pillar"><div class="icon">🔒</div><h3>Security</h3><p>Community policing. Equipping local vigilante groups. Digital surveillance for market and transport hubs.</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${candidateName} — Official Campaign | ${city}</title>${CSS}</head><body>
<nav class="co-nav">
  <a href="/" class="co-nav-brand">🇳🇬 ${name}</a>
  <a href="${waHref}" class="co-nav-cta" target="_blank" rel="noopener">📱 Join the Movement</a>
</nav>
<div class="co-inec">
  ✅ INEC Registered Candidate &nbsp;|&nbsp; ${party} &nbsp;|&nbsp; Electoral Act 2022 Compliant &nbsp;|&nbsp; Campaign Finance Disclosed
</div>
<section class="co-hero">
  <div class="co-hero-flag"><div class="co-flag-g"></div><div class="co-flag-w"></div><div class="co-flag-g"></div></div>
  <h1>${candidateName}</h1>
  <p class="co-hero-slogan">"${slogan}"</p>
  <p class="co-hero-candidate">${position} — ${city} | ${party}</p>
  <p style="max-width:620px;margin:0 auto 1.5rem;opacity:.85;">${desc}</p>
  <div class="co-hero-btns">
    <a href="${waHref}" class="co-btn co-btn-wa" target="_blank" rel="noopener">📱 Join the Movement</a>
    <a href="/services" class="co-btn co-btn-outline">Read the Manifesto</a>
  </div>
</section>
<section class="co-section">
  <div class="co-container">
    <h2>Our Policy Pillars</h2>
    <p class="co-section-sub">A clear vision for ${city} and all of Nigeria — read our detailed manifesto</p>
    <div class="co-pillars">${pillarsHtml}</div>
    <div style="text-align:center;margin-top:2rem;"><a href="/services" class="co-btn co-btn-primary">Read Full Manifesto</a></div>
  </div>
</section>
<section class="co-wa-strip">
  <h2>📱 Be Part of the Change</h2>
  <p>Join thousands of volunteers, ward coordinators, and supporters. WhatsApp our campaign headquarters to register.</p>
  <a href="${waHref}" class="co-wa-btn" target="_blank" rel="noopener">Join on WhatsApp</a>
</section>
<section class="co-section co-section-alt">
  <div class="co-container">
    <h2>Latest News</h2>
    <p class="co-section-sub">Official press releases and campaign updates</p>
    <div class="co-news">
      <div class="co-news-item"><p class="date">April 2026</p><h4>Campaign Formally Declared at Tafawa Balewa Square Rally</h4><p>Over 50,000 supporters attended the official campaign declaration rally in ${city}. ${candidateName} outlined the 5-pillar manifesto to thunderous applause.</p></div>
      <div class="co-news-item"><p class="date">March 2026</p><h4>INEC Candidacy Certification Received</h4><p>The Independent National Electoral Commission has officially confirmed the candidacy of ${candidateName} for the 2027 election cycle.</p></div>
    </div>
  </div>
</section>
<footer class="co-footer"><div class="co-container">
  <p>&copy; ${new Date().getFullYear()} ${name} Campaign Office | ${party} | INEC Electoral Act 2022 Compliant</p>
  <p style="margin-top:.5rem;font-size:.8rem;">Campaign finance disclosures available on request. NDPR-compliant volunteer data policy. No voter inducement. <a href="/contact">Press Contact</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const candidateName = esc((ctx.data.candidateName as string | null) ?? ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'Official campaign for a transformative leader committed to economic development, security, education, and healthcare.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Abuja');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  const party = esc((ctx.data.party as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${candidateName}</title>${CSS}</head><body>
<nav class="co-nav"><a href="/" class="co-nav-brand">🇳🇬 ${name}</a><a href="/contact" class="co-nav-cta">Join Campaign</a></nav>
<section class="co-hero" style="padding:3rem 1rem 2.5rem;"><h1>About ${candidateName}</h1><p class="co-hero-slogan">A proven leader with a clear vision for Nigeria</p></section>
<section class="co-section"><div class="co-container"><div class="co-grid">
  <div><h2>Biography & Track Record</h2><p style="margin:1rem 0;color:var(--co-muted);">${desc}</p><p>Representing ${city}. ${party ? `${party} candidate.` : ''} Committed to transparent governance and grassroots development. INEC certified candidacy for the 2027 election cycle.</p>${phone ? `<p style="margin-top:1rem;"><strong>Campaign HQ:</strong> ${phone}</p>` : ''}</div>
  <div><h2>Campaign Commitments</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--co-muted);">
    <li>✅ INEC Electoral Act 2022 compliance</li>
    <li>✅ Full campaign finance disclosure</li>
    <li>✅ NDPR-compliant volunteer data policy</li>
    <li>✅ No voter inducement policy</li>
    <li>✅ Open manifesto — public document</li>
    <li>✅ Ward-level coordinator network active</li>
  </ul></div>
</div></div></section>
<footer class="co-footer"><div class="co-container"><p>&copy; ${new Date().getFullYear()} ${name} | INEC Registered | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const candidateName = esc((ctx.data.candidateName as string | null) ?? ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="co-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}</div>`).join('')
    : `<div class="co-card"><h3>Economy & Job Creation</h3><p>100,000 jobs through SME grants, agribusiness expansion, and youth enterprise fund of ₦50B over 4 years.</p></div>
       <div class="co-card"><h3>Healthcare Reform</h3><p>All primary health centres operational within 12 months. Free maternal care. Drug revolving fund for affordable medicines.</p></div>
       <div class="co-card"><h3>Education Investment</h3><p>Teacher salaries paid on the 25th of every month. 500 smart classrooms. Scholarship fund for SS3 top performers.</p></div>
       <div class="co-card"><h3>Security & Rule of Law</h3><p>Community policing partnership. CCTV in all LGA headquarters. Equipping security agencies under federal/state mandate.</p></div>
       <div class="co-card"><h3>Infrastructure</h3><p>Rural roads, electricity, water. PPP model for bridge projects. LGA-by-LGA infrastructure scorecard published quarterly.</p></div>
       <div class="co-card"><h3>Youth & Women</h3><p>30% cabinet representation for women. Youth enterprise innovation hub in every senatorial zone. Digital skills for 50,000 young Nigerians.</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Manifesto — ${candidateName}</title>${CSS}</head><body>
<nav class="co-nav"><a href="/" class="co-nav-brand">🇳🇬 ${name}</a><a href="/contact" class="co-nav-cta">Join Campaign</a></nav>
<section class="co-hero" style="padding:3rem 1rem 2.5rem;"><h1>Our Manifesto</h1><p class="co-hero-slogan">Clear policies. Concrete commitments. Accountable governance.</p></section>
<section class="co-section"><div class="co-container"><div class="co-grid">${itemsHtml}</div></div></section>
<footer class="co-footer"><div class="co-container"><p>&copy; ${new Date().getFullYear()} ${name} | INEC Electoral Act 2022 Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const candidateName = esc((ctx.data.candidateName as string | null) ?? ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Abuja');
  const waHref = waLink(phone, 'Hello, I want to volunteer for the campaign.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Join — ${candidateName}</title>${CSS}</head><body>
<nav class="co-nav"><a href="/" class="co-nav-brand">🇳🇬 ${name}</a><a href="${waHref}" class="co-nav-cta" target="_blank" rel="noopener">📱 Join</a></nav>
<section class="co-hero" style="padding:3rem 1rem 2.5rem;"><h1>Join the Movement</h1><p class="co-hero-slogan">Every volunteer matters. Every ward counts.</p></section>
<section class="co-section"><div class="co-container"><div class="co-contact-grid">
  <div class="co-contact-box">
    <h3>📱 Campaign Headquarters (WhatsApp)</h3>
    <p>Fastest way to register as a volunteer, ward coordinator, or media contact.</p>
    <a href="${waHref}" class="co-btn co-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">Join on WhatsApp</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Campaign HQ:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Press Office:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Campaign Office:</strong> ${city}, Nigeria</p>
  </div>
  <div class="co-contact-box">
    <h3>Volunteer Registration</h3>
    <form class="co-form" onsubmit="return false;">
      <input class="co-input" type="text" placeholder="Full name" autocomplete="name">
      <input class="co-input" type="tel" placeholder="Phone number (WhatsApp)" autocomplete="tel">
      <input class="co-input" type="text" placeholder="LGA / Ward">
      <select class="co-input"><option value="">-- I want to help as --</option><option>Ward Coordinator</option><option>Polling Unit Agent</option><option>Social Media Volunteer</option><option>Rally / Logistics Volunteer</option><option>Youth Ambassador</option><option>Women's Wing Representative</option><option>Donor / Supporter</option></select>
      <textarea class="co-input" rows="2" placeholder="Brief background or special skills (optional)..."></textarea>
      <div><input type="checkbox" id="ndpr-co" required> <label for="ndpr-co" class="co-ndpr">I consent to ${name} Campaign Office storing my contact details for campaign coordination purposes, in accordance with Nigeria's NDPR. I understand this is not a commercial transaction.</label></div>
      <button class="co-submit" type="submit">Register as Volunteer</button>
    </form>
  </div>
</div>
<div style="margin-top:2rem;padding:1rem;background:var(--co-light);border-radius:8px;font-size:.85rem;color:var(--co-muted);">
  <strong>Campaign donations:</strong> Paystack · Bank transfer | INEC Electoral Act 2022 §§95–105 campaign finance disclosure applies. No cash donations accepted.
</div>
</div></section>
<footer class="co-footer"><div class="co-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | INEC Registered | Electoral Act 2022 Compliant | <a href="/">Home</a></p>
  <p style="margin-top:.5rem;font-size:.8rem;">Volunteer data handled under NDPR. No voter inducement. Campaign finance disclosures available on request.</p>
</div></footer>
</body></html>`;
}

export const campaignOfficeCampaignOfficeOpsTemplate: WebsiteTemplateContract = {
  slug: 'campaign-office-campaign-office-ops',
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
