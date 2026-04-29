/**
 * LGA Council Portal — Pillar 3 Website Template
 * Niche ID: P3-lga-office-lga-council-portal
 * Vertical: lga-office (priority=3, critical)
 * Category: politics
 * Family: NF-POL-LGA standalone
 * Research brief: docs/templates/research/lga-office-lga-council-portal-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: ALGON, FOIA 2011, FIRS council tax, Code of Conduct Bureau, NDPR
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to contact the council secretariat.')}`;
}

const CSS = `
<style>
:root{--lg-green:#006600;--lg-white:#ffffff;--lg-dark:#1a2332;--lg-grey:#f4f6f8;--lg-gold:#c9a017;--lg-text:#1a2332;--lg-muted:#5a6472;--lg-border:#d1d9e6;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--lg-text);background:#fff;font-size:16px;line-height:1.65;}
.lg-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.lg-nav{background:var(--lg-dark);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.lg-nav-brand{color:#fff;font-size:1.1rem;font-weight:700;text-decoration:none;}
.lg-nav-cta{background:var(--lg-green);color:#fff;padding:.5rem 1rem;border-radius:3px;text-decoration:none;font-weight:700;font-size:.85rem;}
.lg-hero{background:linear-gradient(180deg,var(--lg-dark) 0%,#253045 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;border-bottom:5px solid var(--lg-green);}
.lg-hero-seal{font-size:3rem;margin-bottom:1rem;}
.lg-hero h1{font-size:clamp(1.6rem,4vw,2.4rem);font-weight:800;margin-bottom:.5rem;}
.lg-hero-sub{font-size:.95rem;opacity:.8;margin-bottom:.5rem;}
.lg-hero-algon{color:var(--lg-gold);font-size:.9rem;margin-bottom:2rem;}
.lg-btn{display:inline-block;padding:.7rem 1.4rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.95rem;min-height:44px;line-height:1.3;}
.lg-btn-wa{background:#25D366;color:#fff;}
.lg-btn-outline{border:2px solid #fff;color:#fff;}
.lg-btn-primary{background:var(--lg-green);color:#fff;}
.lg-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.lg-foia{background:var(--lg-green);color:#fff;text-align:center;padding:.6rem;font-size:.85rem;}
.lg-section{padding:3rem 1rem;}
.lg-section-alt{background:var(--lg-grey);}
.lg-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--lg-dark);}
.lg-section-sub{color:var(--lg-muted);margin-bottom:2rem;font-size:.95rem;}
.lg-services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;}
.lg-service-tile{background:#fff;border-radius:6px;padding:1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.08);text-align:center;border-top:3px solid var(--lg-green);}
.lg-service-tile .icon{font-size:1.8rem;margin-bottom:.4rem;}
.lg-service-tile h4{font-size:.9rem;font-weight:700;color:var(--lg-dark);}
.lg-service-tile p{font-size:.8rem;color:var(--lg-muted);margin-top:.25rem;}
.lg-news{display:grid;gap:1rem;margin-top:1rem;}
.lg-news-item{background:#fff;border-radius:6px;padding:1rem 1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.08);border-left:3px solid var(--lg-green);}
.lg-news-item h4{font-size:.95rem;font-weight:700;color:var(--lg-dark);margin-bottom:.25rem;}
.lg-news-item p{font-size:.85rem;color:var(--lg-muted);}
.lg-news-item .date{font-size:.8rem;color:var(--lg-green);font-weight:600;}
.lg-tenders{display:grid;gap:.75rem;margin-top:1rem;}
.lg-tender-item{background:#fff;border-radius:6px;padding:.9rem 1.1rem;box-shadow:0 1px 3px rgba(0,0,0,.07);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;border-left:3px solid var(--lg-gold);}
.lg-tender-item h4{font-size:.9rem;font-weight:700;color:var(--lg-dark);}
.lg-tender-item .tender-meta{font-size:.8rem;color:var(--lg-muted);}
.lg-tender-item .tender-status{background:var(--lg-green);color:#fff;font-size:.75rem;font-weight:700;padding:.2rem .6rem;border-radius:3px;}
.lg-council-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-top:1rem;}
.lg-councillor{background:#fff;border-radius:6px;padding:1.1rem;box-shadow:0 1px 4px rgba(0,0,0,.07);text-align:center;}
.lg-councillor .avatar{width:48px;height:48px;background:var(--lg-green);border-radius:50%;margin:0 auto .5rem;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1.1rem;}
.lg-councillor h4{font-size:.9rem;font-weight:700;color:var(--lg-dark);}
.lg-councillor p{font-size:.8rem;color:var(--lg-muted);}
.lg-wa-strip{background:var(--lg-dark);color:#fff;padding:2.5rem 1rem;text-align:center;border-top:3px solid var(--lg-green);}
.lg-wa-strip h2{font-size:1.4rem;margin-bottom:.5rem;}
.lg-wa-strip p{opacity:.85;margin-bottom:1.25rem;font-size:.95rem;}
.lg-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.lg-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.lg-contact-box{background:var(--lg-grey);padding:1.5rem;border-radius:6px;border:1px solid var(--lg-border);}
.lg-contact-box h3{margin-bottom:1rem;color:var(--lg-dark);font-size:1rem;}
.lg-contact-box a{color:var(--lg-green);font-weight:600;}
.lg-form{display:flex;flex-direction:column;gap:.75rem;}
.lg-input{padding:.7rem 1rem;border:1px solid var(--lg-border);border-radius:4px;font-size:1rem;width:100%;}
.lg-ndpr{font-size:.8rem;color:var(--lg-muted);}
.lg-submit{background:var(--lg-green);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.lg-footer{background:var(--lg-dark);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;border-top:3px solid var(--lg-green);}
.lg-footer a{color:var(--lg-gold);}
@media(max-width:600px){.lg-hero{padding:2.5rem 1rem 2rem;}.lg-hero h1{font-size:1.5rem;}.lg-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const lgaName = esc((ctx.data.lgaName as string | null) ?? ctx.displayName);
  const chairmanName = esc((ctx.data.chairmanName as string | null) ?? 'The Executive Chairman');
  const state = esc((ctx.data.state as string | null) ?? 'Nigeria');
  const desc = esc((ctx.data.description as string | null) ?? 'The official digital portal of the Local Government Council. Providing transparent, citizen-centred governance in line with ALGON standards, FOIA 2011 obligations, and the Open Government Partnership principles.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20need%20information%20from%20the%20council.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const servicesHtml = offerings.length > 0
    ? offerings.map(o => `<div class="lg-service-tile"><div class="icon">🏛️</div><h4>${esc(o.name)}</h4>${o.description ? `<p>${esc(o.description)}</p>` : ''}${o.priceKobo !== null ? `<p style="font-weight:700;color:var(--lg-green);font-size:.8rem;margin-top:.3rem;">${fmtKobo(o.priceKobo)}</p>` : ''}</div>`).join('')
    : `
      <div class="lg-service-tile"><div class="icon">📋</div><h4>Birth Registration</h4><p>Register births within the LGA. ₦2,500 fee.</p></div>
      <div class="lg-service-tile"><div class="icon">🪦</div><h4>Death Registration</h4><p>Death certificates issued within 5 working days.</p></div>
      <div class="lg-service-tile"><div class="icon">🏪</div><h4>Market Levy</h4><p>Pay market stall levies. Daily/monthly rates apply.</p></div>
      <div class="lg-service-tile"><div class="icon">🗑️</div><h4>Refuse Collection</h4><p>Schedule and residential collection service.</p></div>
      <div class="lg-service-tile"><div class="icon">🏫</div><h4>Primary Schools</h4><p>Council-managed schools — enrolment and records.</p></div>
      <div class="lg-service-tile"><div class="icon">🏥</div><h4>Health Centres</h4><p>Primary healthcare facilities and clinic schedules.</p></div>
      <div class="lg-service-tile"><div class="icon">🛣️</div><h4>Minor Roads</h4><p>Report road damage. View maintenance schedule.</p></div>
      <div class="lg-service-tile"><div class="icon">📄</div><h4>Tenders & Contracts</h4><p>Current procurement notices and award announcements.</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${lgaName} — Official Council Portal | ${state}</title>${CSS}</head><body>
<nav class="lg-nav">
  <a href="/" class="lg-nav-brand">🏛️ ${lgaName} Council</a>
  <a href="${waHref}" class="lg-nav-cta" target="_blank" rel="noopener">📱 Contact Secretariat</a>
</nav>
<div class="lg-foia">
  ALGON Member Council &nbsp;|&nbsp; FOIA 2011 Compliant &nbsp;|&nbsp; Code of Conduct Bureau — Officials' Declarations Filed &nbsp;|&nbsp; Open Government Partnership Nigeria
</div>
<section class="lg-hero">
  <div class="lg-hero-seal">🏛️</div>
  <h1>${lgaName} Local Government Council</h1>
  <p class="lg-hero-sub">${state} State &nbsp;|&nbsp; Official Government Portal</p>
  <p class="lg-hero-algon">ALGON Member &nbsp;|&nbsp; Executive Chairman: ${chairmanName}</p>
  <p style="max-width:650px;margin:0 auto 1.5rem;opacity:.8;font-size:.9rem;">${desc}</p>
  <div class="lg-hero-btns">
    <a href="${waHref}" class="lg-btn lg-btn-wa" target="_blank" rel="noopener">📱 Citizen Support Line</a>
    <a href="/services" class="lg-btn lg-btn-outline">Access Services</a>
  </div>
</section>
<section class="lg-section">
  <div class="lg-container">
    <h2>Council Services</h2>
    <p class="lg-section-sub">Official council services available to all residents of ${lgaName} LGA. Fees in Nigerian Naira (₦).</p>
    <div class="lg-services-grid">${servicesHtml}</div>
  </div>
</section>
<section class="lg-section lg-section-alt">
  <div class="lg-container">
    <h2>Latest Notices & Circulars</h2>
    <p class="lg-section-sub">Official announcements from the council</p>
    <div class="lg-news">
      <div class="lg-news-item"><p class="date">April 2026</p><h4>Market Levy Review — New Rates Effective 1 June 2026</h4><p>The council has reviewed market stall levies. New rates are published below. All market traders must update their licences by 31 May 2026.</p></div>
      <div class="lg-news-item"><p class="date">March 2026</p><h4>Refuse Collection Schedule — Q2 2026</h4><p>The new quarterly refuse collection timetable is now available. Households should place bins out by 7am on scheduled days.</p></div>
      <div class="lg-news-item"><p class="date">February 2026</p><h4>2026 Council Budget Published</h4><p>The approved annual budget of ₦850M for ${lgaName} LGA is now public. Revenue projections and departmental allocations available for download.</p></div>
    </div>
  </div>
</section>
<section class="lg-section">
  <div class="lg-container">
    <h2>Current Tenders & Procurement</h2>
    <p class="lg-section-sub">Open procurement notices under Public Procurement Act compliance</p>
    <div class="lg-tenders">
      <div class="lg-tender-item"><div><h4>Supply and Installation of Solar Street Lights — 12 Wards</h4><p class="tender-meta">Deadline: 30 May 2026 &nbsp;|&nbsp; Budget: ₦45M &nbsp;|&nbsp; Category: Infrastructure</p></div><span class="tender-status">OPEN</span></div>
      <div class="lg-tender-item"><div><h4>Renovation of 6 Primary Health Centres</h4><p class="tender-meta">Deadline: 15 June 2026 &nbsp;|&nbsp; Budget: ₦28M &nbsp;|&nbsp; Category: Health</p></div><span class="tender-status">OPEN</span></div>
    </div>
    <p style="margin-top:1rem;font-size:.85rem;color:var(--lg-muted);">All tenders subject to Public Procurement Act. Contact secretariat for prequalification forms.</p>
  </div>
</section>
<section class="lg-wa-strip">
  <h2>📱 Citizen Support — WhatsApp Secretariat</h2>
  <p>For service enquiries, complaints, FOI requests, and general council information — WhatsApp the secretariat during working hours (Mon–Fri 8am–4pm).</p>
  <a href="${waHref}" class="lg-wa-btn" target="_blank" rel="noopener">WhatsApp Council Secretariat</a>
</section>
<footer class="lg-footer"><div class="lg-container">
  <p>&copy; ${new Date().getFullYear()} ${lgaName} Local Government Council | ${state} State | ALGON Member | FOIA 2011 Compliant</p>
  <p style="margin-top:.5rem;font-size:.8rem;">All payments via Remita government payment platform · NDPR-compliant resident data policy · <a href="/contact">Contact Secretariat</a> · <a href="/services">All Services</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const lgaName = esc((ctx.data.lgaName as string | null) ?? ctx.displayName);
  const chairmanName = esc((ctx.data.chairmanName as string | null) ?? 'The Executive Chairman');
  const state = esc((ctx.data.state as string | null) ?? 'Nigeria');
  const desc = esc((ctx.data.description as string | null) ?? 'The official local government council serving residents with transparent, accountable, and citizen-centred governance.');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${lgaName} Council</title>${CSS}</head><body>
<nav class="lg-nav"><a href="/" class="lg-nav-brand">🏛️ ${lgaName} Council</a><a href="/contact" class="lg-nav-cta">Contact Us</a></nav>
<section class="lg-hero" style="padding:3rem 1rem 2.5rem;"><div class="lg-hero-seal">🏛️</div><h1>About ${lgaName} LGA</h1><p class="lg-hero-sub">${state} State — Third Tier of Government</p></section>
<section class="lg-section"><div class="lg-container"><div class="lg-council-grid">
  <div style="grid-column:1/-1"><h2>Council Overview</h2><p style="margin:1rem 0;color:var(--lg-muted);">${desc}</p><p>${lgaName} Local Government Area is one of the 774 councils in Nigeria. Under the leadership of ${chairmanName}, the council manages primary healthcare, primary education, market administration, refuse collection, and civil registration for all residents.</p>${phone ? `<p style="margin-top:1rem;"><strong>Secretariat:</strong> ${phone}</p>` : ''}</div>
</div>
<div class="lg-council-grid" style="margin-top:2rem;">
  <div class="lg-councillor"><div class="lg-councillor avatar">👤</div><h4>${chairmanName}</h4><p>Executive Chairman</p></div>
  <div class="lg-councillor"><div class="lg-councillor avatar">👤</div><h4>Council Secretary</h4><p>Head of Administration</p></div>
  <div class="lg-councillor"><div class="lg-councillor avatar">👤</div><h4>Director Finance</h4><p>Revenue & Expenditure</p></div>
  <div class="lg-councillor"><div class="lg-councillor avatar">👤</div><h4>Director Health</h4><p>PHC Coordination</p></div>
</div>
<div style="margin-top:2rem;"><h2>Compliance & Transparency</h2>
  <ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--lg-muted);">
    <li>✅ ALGON Member Council</li>
    <li>✅ FOIA 2011 — Public information access</li>
    <li>✅ Code of Conduct Bureau filings — all elected officials</li>
    <li>✅ FIRS council tax collection mandate</li>
    <li>✅ Annual budget published online</li>
    <li>✅ NDPR-compliant resident data policy</li>
    <li>✅ Payments via Remita government platform</li>
  </ul>
</div>
</div></section>
<footer class="lg-footer"><div class="lg-container"><p>&copy; ${new Date().getFullYear()} ${lgaName} LGA Council | ALGON Member | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const lgaName = esc((ctx.data.lgaName as string | null) ?? ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="lg-service-tile"><div class="icon">🏛️</div><h4>${esc(o.name)}</h4>${o.description ? `<p>${esc(o.description)}</p>` : ''}${o.priceKobo !== null ? `<p style="font-weight:700;color:var(--lg-green);font-size:.8rem;margin-top:.3rem;">${fmtKobo(o.priceKobo)}</p>` : ''}</div>`).join('')
    : `<div class="lg-service-tile"><div class="icon">📋</div><h4>Birth Registration</h4><p>₦2,500 fee. 3 working days.</p></div>
       <div class="lg-service-tile"><div class="icon">🪦</div><h4>Death Registration</h4><p>Death certificates. 5 working days.</p></div>
       <div class="lg-service-tile"><div class="icon">🏪</div><h4>Market Levy</h4><p>Daily/monthly stall levy payment.</p></div>
       <div class="lg-service-tile"><div class="icon">🗑️</div><h4>Refuse Collection</h4><p>Weekly schedule — residential.</p></div>
       <div class="lg-service-tile"><div class="icon">🏫</div><h4>Primary Schools</h4><p>Enrolment and school records.</p></div>
       <div class="lg-service-tile"><div class="icon">🏥</div><h4>Health Centres</h4><p>Clinic schedules and PHC services.</p></div>
       <div class="lg-service-tile"><div class="icon">📄</div><h4>FOI Requests</h4><p>Freedom of Information — 7-day response.</p></div>
       <div class="lg-service-tile"><div class="icon">📣</div><h4>Tender Notices</h4><p>Current and closed procurement.</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Services — ${lgaName} Council</title>${CSS}</head><body>
<nav class="lg-nav"><a href="/" class="lg-nav-brand">🏛️ ${lgaName} Council</a><a href="/contact" class="lg-nav-cta">Contact Secretariat</a></nav>
<section class="lg-hero" style="padding:3rem 1rem 2.5rem;"><h1>Council Services</h1><p class="lg-hero-sub">All services available to ${lgaName} LGA residents. Fees in Nigerian Naira (₦).</p></section>
<section class="lg-section"><div class="lg-container"><div class="lg-services-grid">${itemsHtml}</div>
<div style="margin-top:2rem;padding:1rem;background:var(--lg-grey);border-radius:6px;font-size:.85rem;color:var(--lg-muted);border:1px solid var(--lg-border);">
  <strong>Payment:</strong> Remita government payment platform · Bank transfer · In-person at council revenue office
</div>
</div></section>
<footer class="lg-footer"><div class="lg-container"><p>&copy; ${new Date().getFullYear()} ${lgaName} LGA Council | ALGON Member | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const lgaName = esc((ctx.data.lgaName as string | null) ?? ctx.displayName);
  const state = esc((ctx.data.state as string | null) ?? 'Nigeria');
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const waHref = waLink(phone, 'Hello, I need information or a service from the council.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${lgaName} Council</title>${CSS}</head><body>
<nav class="lg-nav"><a href="/" class="lg-nav-brand">🏛️ ${lgaName} Council</a><a href="${waHref}" class="lg-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="lg-hero" style="padding:3rem 1rem 2.5rem;"><div class="lg-hero-seal">🏛️</div><h1>Contact the Secretariat</h1><p class="lg-hero-sub">Citizen enquiries · FOI requests · Service applications · Contractor pre-qualification</p></section>
<section class="lg-section"><div class="lg-container"><div class="lg-contact-grid">
  <div class="lg-contact-box">
    <h3>📱 WhatsApp Secretariat</h3>
    <p>Working hours: Monday–Friday, 8:00am–4:00pm. WhatsApp is the fastest channel for service enquiries.</p>
    <a href="${waHref}" class="lg-btn lg-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">WhatsApp Council</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Secretariat Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Council Headquarters:</strong> ${lgaName} LGA, ${state} State, Nigeria</p>
  </div>
  <div class="lg-contact-box">
    <h3>Service / FOI Request Form</h3>
    <form class="lg-form" onsubmit="return false;">
      <input class="lg-input" type="text" placeholder="Full name" autocomplete="name">
      <input class="lg-input" type="tel" placeholder="Phone number" autocomplete="tel">
      <input class="lg-input" type="email" placeholder="Email address (optional)" autocomplete="email">
      <select class="lg-input"><option value="">-- Request type --</option><option>Birth / Death Registration</option><option>Market Levy Payment</option><option>Refuse Collection Complaint</option><option>FOI Request (FOIA 2011)</option><option>Tender / Prequalification</option><option>General Enquiry</option><option>Report a Fault / Road Damage</option></select>
      <textarea class="lg-input" rows="4" placeholder="Describe your request in detail. For FOI requests, specify the document or information you are requesting under FOIA 2011 Section 1..."></textarea>
      <div><input type="checkbox" id="ndpr-lg" required> <label for="ndpr-lg" class="lg-ndpr">I consent to ${lgaName} LGA Council processing my personal information to respond to this request, in accordance with Nigeria's NDPR and the council's data protection policy.</label></div>
      <button class="lg-submit" type="submit">Submit Request</button>
    </form>
  </div>
</div>
<div style="margin-top:2rem;padding:1rem;background:var(--lg-grey);border-radius:6px;font-size:.85rem;color:var(--lg-muted);border:1px solid var(--lg-border);">
  <strong>Payment:</strong> Remita government payment portal · In-person at Revenue Office (BVN required for transactions above ₦50,000)
  <br><strong>FOI requests</strong> must be responded to within 7 working days per FOIA 2011 Section 4.
</div>
</div></section>
<footer class="lg-footer"><div class="lg-container">
  <p>&copy; ${new Date().getFullYear()} ${lgaName} LGA Council | ALGON Member | FOIA 2011 Compliant | NDPR Policy Active</p>
  <p style="margin-top:.5rem;font-size:.8rem;"><a href="/">Home</a> · <a href="/services">Services</a> · <a href="/about">About the Council</a></p>
</div></footer>
</body></html>`;
}

export const lgaOfficeLgaCouncilPortalTemplate: WebsiteTemplateContract = {
  slug: 'lga-office-lga-council-portal',
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
