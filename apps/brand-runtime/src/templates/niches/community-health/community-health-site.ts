/**
 * Community Health Worker Network — Pillar 3 Website Template
 * Niche ID: P3-community-health-community-health-site
 * Vertical: community-health (priority=3, critical)
 * Category: health
 * Family: NF-HLT-PHC standalone
 * Research brief: docs/templates/research/community-health-community-health-site-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: NPHCDA, CHODANP, MDCN supervising physician, CAC NGO, NDPR
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to speak with a community health worker.')}`;
}

const CSS = `
<style>
:root{--ch-green:#1b5e20;--ch-teal:#00897b;--ch-light:#e8f5e9;--ch-text:#2c2c2c;--ch-muted:#6c757d;--ch-blue:#1565c0;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',sans-serif;color:var(--ch-text);background:#fff;font-size:16px;line-height:1.6;}
.ch-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.ch-nav{background:var(--ch-green);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.ch-nav-brand{color:#fff;font-size:1.2rem;font-weight:700;text-decoration:none;}
.ch-nav-cta{background:#fff;color:var(--ch-green);padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9rem;}
.ch-hero{background:linear-gradient(135deg,var(--ch-green) 0%,var(--ch-teal) 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;}
.ch-hero h1{font-size:clamp(1.8rem,5vw,2.6rem);font-weight:800;margin-bottom:.75rem;}
.ch-hero-badge{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);display:inline-block;padding:.4rem 1rem;border-radius:20px;font-size:.85rem;font-weight:700;margin-bottom:1rem;}
.ch-hero p{max-width:650px;margin:0 auto 1.5rem;opacity:.9;}
.ch-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:700;font-size:1rem;min-height:44px;line-height:1.3;}
.ch-btn-wa{background:#25D366;color:#fff;}
.ch-btn-outline{border:2px solid #fff;color:#fff;}
.ch-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.ch-nphcda{background:var(--ch-teal);color:#fff;text-align:center;padding:.6rem;font-size:.85rem;}
.ch-section{padding:3rem 1rem;}
.ch-section-alt{background:var(--ch-light);}
.ch-section h2{font-size:1.6rem;font-weight:700;margin-bottom:.5rem;color:var(--ch-green);}
.ch-section-sub{color:var(--ch-muted);margin-bottom:2rem;}
.ch-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;}
.ch-card{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 8px rgba(27,94,32,.1);border-left:4px solid var(--ch-teal);}
.ch-card h3{font-size:1.05rem;font-weight:700;margin-bottom:.5rem;color:var(--ch-green);}
.ch-card p{color:var(--ch-muted);font-size:.9rem;}
.ch-free{margin-top:.75rem;font-weight:700;color:var(--ch-teal);}
.ch-stats{background:var(--ch-green);color:#fff;padding:2.5rem 1rem;text-align:center;}
.ch-stats h2{font-size:1.5rem;margin-bottom:1.5rem;}
.ch-stats-grid{display:flex;gap:2rem;justify-content:center;flex-wrap:wrap;}
.ch-stat{text-align:center;}
.ch-stat .num{font-size:2.5rem;font-weight:800;}
.ch-stat .lbl{font-size:.85rem;opacity:.85;}
.ch-wa-strip{background:#25D366;color:#fff;padding:2rem 1rem;text-align:center;}
.ch-wa-strip h2{font-size:1.5rem;margin-bottom:.5rem;}
.ch-wa-btn{background:#fff;color:#128C7E;font-weight:700;padding:.75rem 2rem;border-radius:6px;text-decoration:none;display:inline-block;}
.ch-donor-strip{background:var(--ch-light);padding:2rem 1rem;text-align:center;}
.ch-donor-strip h2{font-size:1.4rem;color:var(--ch-green);margin-bottom:.75rem;}
.ch-donors{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;}
.ch-donor{background:#fff;border:1px solid #ddd;border-radius:6px;padding:.5rem 1rem;font-size:.9rem;font-weight:600;color:var(--ch-text);}
.ch-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.ch-contact-box{background:var(--ch-light);padding:1.5rem;border-radius:8px;}
.ch-contact-box h3{margin-bottom:1rem;color:var(--ch-green);}
.ch-contact-box a{color:var(--ch-green);font-weight:600;}
.ch-form{display:flex;flex-direction:column;gap:.75rem;}
.ch-input{padding:.75rem;border:1px solid #ddd;border-radius:6px;font-size:1rem;width:100%;}
.ch-ndpr{font-size:.8rem;color:var(--ch-muted);}
.ch-submit{background:var(--ch-green);color:#fff;border:none;padding:.75rem 1.5rem;border-radius:6px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.ch-footer{background:var(--ch-green);color:rgba(255,255,255,.8);text-align:center;padding:1.5rem;font-size:.85rem;}
.ch-footer a{color:#a5d6a7;}
@media(max-width:600px){.ch-hero{padding:2.5rem 1rem 2rem;}.ch-hero h1{font-size:1.6rem;}.ch-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Bringing Quality Healthcare to Every Nigerian Community');
  const desc = esc((ctx.data.description as string | null) ?? 'We deploy trained Community Health Workers (CHOs, CHEWs, VHWs) across rural and underserved communities. NPHCDA partner. BHCPF-funded services. Free immunisation, antenatal care, and maternal health support.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Abuja');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20need%20community%20health%20assistance.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const servicesHtml = offerings.length > 0
    ? offerings.map(o => `<div class="ch-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="ch-free">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Free under BHCPF'}</p></div>`).join('')
    : `
      <div class="ch-card"><h3>Immunisation (EPI)</h3><p>BCG, OPV, DPT, Hepatitis B, Yellow Fever, Measles vaccines for children 0–5 years. NPHCDA schedule.</p><p class="ch-free">Free under BHCPF</p></div>
      <div class="ch-card"><h3>Antenatal Care (ANC)</h3><p>Pregnancy monitoring, nutritional counselling, birth preparedness, and skilled birth attendant referral.</p><p class="ch-free">Free for registered mothers</p></div>
      <div class="ch-card"><h3>Malaria Prevention</h3><p>LLIN distribution, malaria testing (RDT), artemisinin-based treatment (ACT), and IPTp for pregnant women.</p><p class="ch-free">Free under BHCPF</p></div>
      <div class="ch-card"><h3>Family Planning</h3><p>Condom distribution, injectable contraceptives, and referral for long-acting reversible contraception (LARC).</p><p class="ch-free">Free for registered clients</p></div>
      <div class="ch-card"><h3>Nutrition Screening</h3><p>MUAC measurement for children under 5. SAM/MAM identification and referral to stabilisation centres.</p><p class="ch-free">Free under UNICEF/WFP</p></div>
      <div class="ch-card"><h3>TB / HIV Screening</h3><p>Community TB and HIV testing, referral for treatment initiation, contact tracing support.</p><p class="ch-free">Free — donor funded</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Community Health | ${city}</title>${CSS}</head><body>
<nav class="ch-nav">
  <a href="/" class="ch-nav-brand">🏥 ${name}</a>
  <a href="${waHref}" class="ch-nav-cta" target="_blank" rel="noopener">📱 Find a CHW</a>
</nav>
<div class="ch-nphcda">
  <strong>NPHCDA Partner</strong> &nbsp;|&nbsp; CHODANP Member &nbsp;|&nbsp; MDCN Supervised &nbsp;|&nbsp; CAC Registered NGO &nbsp;|&nbsp; BHCPF Funded Services
</div>
<section class="ch-hero">
  <div class="ch-hero-badge">🏥 Community Health Network — ${city}</div>
  <h1>${name}</h1>
  <p>${tagline}</p>
  <p>${desc}</p>
  <div class="ch-hero-btns">
    <a href="${waHref}" class="ch-btn ch-btn-wa" target="_blank" rel="noopener">📱 Talk to a Health Worker</a>
    <a href="/services" class="ch-btn ch-btn-outline">View Our Services</a>
  </div>
</section>
<section class="ch-stats">
  <h2>Our Impact</h2>
  <div class="ch-stats-grid">
    <div class="ch-stat"><div class="num">50+</div><div class="lbl">CHWs Deployed</div></div>
    <div class="ch-stat"><div class="num">15</div><div class="lbl">LGAs Covered</div></div>
    <div class="ch-stat"><div class="num">10,000+</div><div class="lbl">Patients Served</div></div>
    <div class="ch-stat"><div class="num">95%</div><div class="lbl">Immunisation Coverage</div></div>
  </div>
</section>
<section class="ch-section">
  <div class="ch-container">
    <h2>Our Services</h2>
    <p class="ch-section-sub">All primary healthcare services are free or subsidised under NPHCDA/BHCPF for registered community members.</p>
    <div class="ch-grid">${servicesHtml}</div>
  </div>
</section>
<section class="ch-wa-strip">
  <h2>📱 Find Your Nearest Community Health Worker</h2>
  <p>WhatsApp us with your LGA and ward — we will connect you to the nearest trained CHW in your community.</p>
  <a href="${waHref}" class="ch-wa-btn" target="_blank" rel="noopener">Find a CHW on WhatsApp</a>
</section>
<section class="ch-donor-strip">
  <h2>Supported By</h2>
  <div class="ch-donors">
    <span class="ch-donor">NPHCDA</span>
    <span class="ch-donor">UNICEF Nigeria</span>
    <span class="ch-donor">WHO Nigeria</span>
    <span class="ch-donor">USAID</span>
    <span class="ch-donor">BHCPF</span>
    <span class="ch-donor">State Ministry of Health</span>
  </div>
</section>
<footer class="ch-footer"><div class="ch-container"><p>&copy; ${new Date().getFullYear()} ${name}. NPHCDA Partner. CAC Registered NGO. MDCN Supervised. | Donations: Paystack · Bank Transfer | <a href="/contact">Contact & Partner</a></p></div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'We are a NPHCDA-registered community health network deploying trained CHOs, CHEWs, and village health workers across underserved communities in Nigeria.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Abuja');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="ch-nav"><a href="/" class="ch-nav-brand">🏥 ${name}</a><a href="/contact" class="ch-nav-cta">Contact Us</a></nav>
<section class="ch-hero" style="padding:3rem 1rem 2rem;"><h1>About ${name}</h1><p>Healthcare at the doorstep of every Nigerian community</p></section>
<section class="ch-section"><div class="ch-container"><div class="ch-grid">
  <div><h2>Our Mission</h2><p style="margin:1rem 0;color:var(--ch-muted);">${desc}</p><p>Operating from ${city}, our network bridges the gap between Nigeria's formal health system and hard-to-reach communities. We are NPHCDA registered, MDCN supervised, and BHCPF-funded.</p>${phone ? `<p style="margin-top:1rem;"><strong>Phone:</strong> ${phone}</p>` : ''}</div>
  <div><h2>Our Credentials</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--ch-muted);">
    <li>✅ NPHCDA Partner Registration</li>
    <li>✅ CHODANP Membership</li>
    <li>✅ MDCN-registered Supervising Physician</li>
    <li>✅ CAC NGO Registration</li>
    <li>✅ NDPR-compliant patient data policy</li>
    <li>✅ Child Protection Policy in place</li>
  </ul></div>
</div></div></section>
<footer class="ch-footer"><div class="ch-container"><p>&copy; ${new Date().getFullYear()} ${name} | NPHCDA Partner | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="ch-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="ch-free">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Free / subsidised'}</p></div>`).join('')
    : `<div class="ch-card"><h3>Immunisation (EPI)</h3><p>BCG, OPV, DPT, Hep B, Yellow Fever, Measles.</p><p class="ch-free">Free under BHCPF</p></div>
       <div class="ch-card"><h3>Antenatal Care</h3><p>Pregnancy monitoring, nutritional counselling, referral.</p><p class="ch-free">Free for registered mothers</p></div>
       <div class="ch-card"><h3>Malaria Prevention</h3><p>LLIN, RDT testing, ACT treatment, IPTp.</p><p class="ch-free">Free under BHCPF</p></div>
       <div class="ch-card"><h3>Family Planning</h3><p>Contraceptives, LARC referral.</p><p class="ch-free">Free for registered clients</p></div>
       <div class="ch-card"><h3>Nutrition Screening</h3><p>MUAC measurement, SAM/MAM referral.</p><p class="ch-free">Free under UNICEF/WFP</p></div>
       <div class="ch-card"><h3>TB / HIV Screening</h3><p>Community testing, referral, contact tracing.</p><p class="ch-free">Free — donor funded</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Services — ${name}</title>${CSS}</head><body>
<nav class="ch-nav"><a href="/" class="ch-nav-brand">🏥 ${name}</a><a href="/contact" class="ch-nav-cta">Find a CHW</a></nav>
<section class="ch-hero" style="padding:3rem 1rem 2rem;"><h1>Our Health Services</h1><p>Free and subsidised healthcare for all registered community members</p></section>
<section class="ch-section"><div class="ch-container"><div class="ch-grid">${itemsHtml}</div></div></section>
<footer class="ch-footer"><div class="ch-container"><p>&copy; ${new Date().getFullYear()} ${name} | NPHCDA Partner | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Abuja');
  const waHref = waLink(phone, 'Hello, I need community health assistance or want to partner.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${name}</title>${CSS}</head><body>
<nav class="ch-nav"><a href="/" class="ch-nav-brand">🏥 ${name}</a><a href="${waHref}" class="ch-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="ch-hero" style="padding:3rem 1rem 2rem;"><h1>Contact & Partner</h1><p>Community members, donors, and NGO partners — reach us here</p></section>
<section class="ch-section"><div class="ch-container"><div class="ch-contact-grid">
  <div class="ch-contact-box">
    <h3>📱 Community Member (WhatsApp)</h3>
    <p>Send your LGA and health need — we'll connect you to the nearest CHW.</p>
    <a href="${waHref}" class="ch-btn ch-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">Open WhatsApp</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Hotline:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Programme Office:</strong> ${city}, Nigeria</p>
  </div>
  <div class="ch-contact-box">
    <h3>Partner / Donor Enquiry</h3>
    <form class="ch-form" onsubmit="return false;">
      <input class="ch-input" type="text" placeholder="Organisation / Name" autocomplete="name">
      <input class="ch-input" type="tel" placeholder="Phone number" autocomplete="tel">
      <input class="ch-input" type="email" placeholder="Email address" autocomplete="email">
      <select class="ch-input"><option value="">-- Enquiry type --</option><option>Community member seeking CHW</option><option>NGO / Government partnership</option><option>Donor / CSR partnership</option><option>Volunteer registration</option><option>Research / data access</option></select>
      <textarea class="ch-input" rows="3" placeholder="Describe your enquiry or the area you want to reach (LGA/Ward)..."></textarea>
      <div><input type="checkbox" id="ndpr-ch" required> <label for="ndpr-ch" class="ch-ndpr">I consent to ${name} storing my contact details for programme purposes, per Nigeria's NDPR and our data protection policy.</label></div>
      <button class="ch-submit" type="submit">Send Enquiry</button>
    </form>
  </div>
</div></div></section>
<footer class="ch-footer"><div class="ch-container"><p>&copy; ${new Date().getFullYear()} ${name} | NPHCDA Partner | CAC Registered NGO | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const communityHealthCommunityHealthSiteTemplate: WebsiteTemplateContract = {
  slug: 'community-health-community-health-site',
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
