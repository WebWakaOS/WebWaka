/**
 * Community Radio Station Site — Pillar 3 Website Template
 * Niche ID: P3-community-radio-community-radio-site
 * Vertical: community-radio (priority=3, high)
 * Category: media
 * Family: standalone
 * Research brief: docs/templates/research/community-radio-community-radio-site-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NBC licence (National Broadcasting Commission); CAC; FRCN affiliation; 60% local content quota
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to contact the radio station.')}`;
}

const CSS = `
<style>
:root{--cr-red:#cc0000;--cr-dark:#1a1a2e;--cr-gold:#f5c518;--cr-light:#f8f9fa;--cr-text:#1a1a2e;--cr-muted:#5a6472;--cr-border:#dce3ed;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--cr-text);background:#fff;font-size:16px;line-height:1.6;}
.cr-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.cr-nav{background:var(--cr-dark);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.cr-nav-brand{color:#fff;font-size:1.2rem;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:.5rem;}
.cr-on-air{background:var(--cr-red);color:#fff;font-size:.7rem;font-weight:700;padding:.15rem .4rem;border-radius:3px;animation:blink 1.5s infinite;}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:.4;}}
.cr-nav-cta{background:var(--cr-red);color:#fff;padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9rem;}
.cr-hero{background:linear-gradient(135deg,var(--cr-dark) 0%,#2d1b4e 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;}
.cr-hero-icon{font-size:3.5rem;margin-bottom:1rem;}
.cr-hero h1{font-size:clamp(1.8rem,5vw,2.8rem);font-weight:800;margin-bottom:.5rem;}
.cr-hero-freq{color:var(--cr-gold);font-size:1.1rem;margin-bottom:.5rem;font-weight:700;}
.cr-hero-tagline{opacity:.85;margin-bottom:.5rem;font-size:.95rem;}
.cr-hero-nbc{color:var(--cr-gold);font-size:.85rem;margin-bottom:2rem;}
.cr-btn{display:inline-block;padding:.7rem 1.4rem;border-radius:5px;text-decoration:none;font-weight:700;font-size:.95rem;min-height:44px;line-height:1.3;}
.cr-btn-wa{background:#25D366;color:#fff;}
.cr-btn-outline{border:2px solid #fff;color:#fff;}
.cr-btn-primary{background:var(--cr-red);color:#fff;}
.cr-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.cr-nbc-strip{background:var(--cr-red);color:#fff;text-align:center;padding:.55rem;font-size:.82rem;}
.cr-section{padding:3rem 1rem;}
.cr-section-alt{background:var(--cr-light);}
.cr-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--cr-dark);}
.cr-section-sub{color:var(--cr-muted);margin-bottom:2rem;font-size:.95rem;}
.cr-schedule{display:grid;gap:.75rem;margin-top:1rem;}
.cr-schedule-item{background:#fff;border-radius:6px;padding:.9rem 1.2rem;box-shadow:0 1px 4px rgba(0,0,0,.08);display:grid;grid-template-columns:90px 1fr auto;gap:1rem;align-items:center;border-left:4px solid var(--cr-red);}
.cr-schedule-item .time{font-weight:700;color:var(--cr-red);font-size:.9rem;}
.cr-schedule-item h4{font-size:.95rem;font-weight:700;color:var(--cr-dark);}
.cr-schedule-item p{font-size:.8rem;color:var(--cr-muted);}
.cr-schedule-item .lang{background:var(--cr-dark);color:#fff;font-size:.72rem;padding:.2rem .5rem;border-radius:3px;white-space:nowrap;}
.cr-advert-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;}
.cr-advert-card{background:#fff;border-radius:6px;padding:1.5rem;box-shadow:0 1px 6px rgba(0,0,0,.1);border-top:4px solid var(--cr-gold);}
.cr-advert-card h3{font-size:1rem;font-weight:700;color:var(--cr-dark);margin-bottom:.5rem;}
.cr-advert-card p{color:var(--cr-muted);font-size:.9rem;}
.cr-advert-card .price{margin-top:.5rem;font-weight:700;font-size:1rem;color:var(--cr-dark);}
.cr-wa-strip{background:var(--cr-dark);color:#fff;padding:2.5rem 1rem;text-align:center;}
.cr-wa-strip h2{font-size:1.4rem;margin-bottom:.5rem;}
.cr-wa-strip p{opacity:.85;margin-bottom:1.25rem;font-size:.9rem;}
.cr-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.cr-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.cr-contact-box{background:var(--cr-light);padding:1.5rem;border-radius:6px;border:1px solid var(--cr-border);}
.cr-contact-box h3{margin-bottom:1rem;color:var(--cr-dark);font-size:1rem;}
.cr-contact-box a{color:var(--cr-red);font-weight:600;}
.cr-form{display:flex;flex-direction:column;gap:.75rem;}
.cr-input{padding:.7rem 1rem;border:1px solid var(--cr-border);border-radius:4px;font-size:1rem;width:100%;}
.cr-ndpr{font-size:.8rem;color:var(--cr-muted);}
.cr-submit{background:var(--cr-red);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.cr-footer{background:var(--cr-dark);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;}
.cr-footer a{color:var(--cr-gold);}
@media(max-width:600px){.cr-hero{padding:2.5rem 1rem 2rem;}.cr-hero h1{font-size:1.8rem;}.cr-hero-btns{flex-direction:column;align-items:center;}.cr-schedule-item{grid-template-columns:1fr;}.cr-schedule-item .time{font-size:1rem;}.cr-schedule-item .lang{display:inline-block;width:fit-content;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const freq = esc((ctx.data.frequency as string | null) ?? '91.5 FM');
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Your Voice. Your Community. Your Radio.');
  const desc = esc((ctx.data.description as string | null) ?? 'NBC-licensed community radio serving our local area with news, entertainment, community announcements, and programming in English and local languages. 60% local content. Listener-funded. Community-owned.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const nbcLicence = esc((ctx.data.nbcLicenceNumber as string | null) ?? 'NBC/LC/[XXXX]/[YYYY]');
  const waHref = waLink(phone, 'Hello, I would like to contact the radio station.') ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20to%20contact%20the%20radio%20station.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const scheduleHtml = offerings.length > 0
    ? offerings.map(o => `<div class="cr-schedule-item"><div class="time">See site</div><div><h4>${esc(o.name)}</h4>${o.description ? `<p>${esc(o.description)}</p>` : ''}</div><span class="lang">On Air</span></div>`).join('')
    : `
      <div class="cr-schedule-item"><div class="time">6:00 AM</div><div><h4>Morning Devotion & News</h4><p>Daily news, community announcements, Quran/Bible reading</p></div><span class="lang">English</span></div>
      <div class="cr-schedule-item"><div class="time">8:00 AM</div><div><h4>Oja Oja — Market Women's Programme</h4><p>Prices, market news, woman empowerment</p></div><span class="lang">Yoruba</span></div>
      <div class="cr-schedule-item"><div class="time">12:00 PM</div><div><h4>Midday News</h4><p>Local government news, health bulletins, agricultural tips</p></div><span class="lang">English</span></div>
      <div class="cr-schedule-item"><div class="time">3:00 PM</div><div><h4>Youth Zone</h4><p>Music, interviews, youth empowerment, career guidance</p></div><span class="lang">English/Pidgin</span></div>
      <div class="cr-schedule-item"><div class="time">6:00 PM</div><div><h4>Evening Magazine</h4><p>Community reports, LGA notices, health campaigns</p></div><span class="lang">English</span></div>
      <div class="cr-schedule-item"><div class="time">8:00 PM</div><div><h4>Cultural Night</h4><p>Traditional music, folklore, community history</p></div><span class="lang">Local</span></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — ${freq} | ${city}</title>${CSS}</head><body>
<nav class="cr-nav">
  <a href="/" class="cr-nav-brand">📻 ${name} <span class="cr-on-air">ON AIR</span></a>
  <a href="${waHref}" class="cr-nav-cta" target="_blank" rel="noopener">📱 WhatsApp Us</a>
</nav>
<div class="cr-nbc-strip">
  ✅ NBC Licensed Station — ${nbcLicence} &nbsp;|&nbsp; 60% Local Content Compliant &nbsp;|&nbsp; CAC Registered &nbsp;|&nbsp; ${freq}
</div>
<section class="cr-hero">
  <div class="cr-hero-icon">📻</div>
  <h1>${name}</h1>
  <p class="cr-hero-freq">${freq} | ${city}</p>
  <p class="cr-hero-tagline">${tagline}</p>
  <p class="cr-hero-nbc">NBC Community Broadcasting Licence ${nbcLicence}</p>
  <p style="max-width:580px;margin:0 auto 1.5rem;opacity:.8;font-size:.9rem;">${desc}</p>
  <div class="cr-hero-btns">
    <a href="${waHref}" class="cr-btn cr-btn-wa" target="_blank" rel="noopener">📱 WhatsApp Listener Line</a>
    <a href="/services" class="cr-btn cr-btn-outline">Advertise With Us</a>
  </div>
</section>
<section class="cr-section">
  <div class="cr-container">
    <h2>Today's Programme Schedule</h2>
    <p class="cr-section-sub">All times are WAT (West Africa Time). We broadcast 24 hours, Monday through Sunday.</p>
    <div class="cr-schedule">${scheduleHtml}</div>
  </div>
</section>
<section class="cr-wa-strip">
  <h2>📱 Listener Line</h2>
  <p>Call in, send your shout-outs, report community news, or request a song — WhatsApp us right now.</p>
  <a href="${waHref}" class="cr-wa-btn" target="_blank" rel="noopener">WhatsApp the Station</a>
</section>
<section class="cr-section cr-section-alt">
  <div class="cr-container">
    <h2>Advertise on ${name}</h2>
    <p class="cr-section-sub">Reach thousands of local listeners. All rates in NGN. Paystack and bank transfer accepted.</p>
    <div class="cr-advert-grid">
      <div class="cr-advert-card"><h3>30-Second Spot</h3><p>Single broadcast. Peak or off-peak rates apply.</p><p class="price">From ₦5,000/spot</p></div>
      <div class="cr-advert-card"><h3>Programme Sponsorship</h3><p>Sponsor a weekly programme. Your business mentioned at open and close.</p><p class="price">From ₦50,000/week</p></div>
      <div class="cr-advert-card"><h3>Campaign Package</h3><p>30 spots/week for 4 weeks + jingle production.</p><p class="price">From ₦180,000/month</p></div>
      <div class="cr-advert-card"><h3>Live Outside Broadcast</h3><p>We come to your event or business launch.</p><p class="price">From ₦150,000/event</p></div>
    </div>
  </div>
</section>
<footer class="cr-footer"><div class="cr-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | ${freq} | NBC Licence: ${nbcLicence} | CAC Registered</p>
  <p style="margin-top:.5rem;font-size:.8rem;">60% local content compliant. Watershed programming policy enforced. NDPR-compliant listener data. | <a href="/contact">Contact Us</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const freq = esc((ctx.data.frequency as string | null) ?? '91.5 FM');
  const desc = esc((ctx.data.description as string | null) ?? 'Community radio station serving the local area with quality programming.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const nbcLicence = esc((ctx.data.nbcLicenceNumber as string | null) ?? 'NBC/LC/[XXXX]/[YYYY]');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="cr-nav"><a href="/" class="cr-nav-brand">📻 ${name} <span class="cr-on-air">ON AIR</span></a><a href="/contact" class="cr-nav-cta">Contact Us</a></nav>
<section class="cr-hero" style="padding:3rem 1rem 2.5rem;"><div class="cr-hero-icon">📻</div><h1>About ${name}</h1><p class="cr-hero-freq">${freq} | ${city}</p><p class="cr-hero-nbc">NBC Community Licence: ${nbcLicence}</p></section>
<section class="cr-section"><div class="cr-container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
  <div><h2>Our Station</h2><p style="margin:1rem 0;color:var(--cr-muted);">${desc}</p>${phone ? `<p><strong>Studio:</strong> ${phone}</p>` : ''}<p><strong>City:</strong> ${city}</p></div>
  <div><h2>Compliance</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--cr-muted);">
    <li>✅ NBC Community Broadcasting Licence: ${nbcLicence}</li>
    <li>✅ 60% minimum local content — NBC code compliant</li>
    <li>✅ CAC registered organisation</li>
    <li>✅ Watershed programming policy (9pm watershed)</li>
    <li>✅ NDPR-compliant listener data handling</li>
    <li>✅ Community ownership structure</li>
  </ul></div>
</div></div></section>
<footer class="cr-footer"><div class="cr-container"><p>&copy; ${new Date().getFullYear()} ${name} | NBC Licence: ${nbcLicence} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const freq = esc((ctx.data.frequency as string | null) ?? '91.5 FM');
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="cr-advert-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Contact for rates'}</p></div>`).join('')
    : `<div class="cr-advert-card"><h3>30-Second Spot (Peak)</h3><p>6am–9am, 12pm–2pm, 5pm–8pm.</p><p class="price">₦8,000/spot</p></div>
       <div class="cr-advert-card"><h3>30-Second Spot (Off-Peak)</h3><p>All other hours.</p><p class="price">₦5,000/spot</p></div>
       <div class="cr-advert-card"><h3>60-Second Spot (Peak)</h3><p>Double-length advert.</p><p class="price">₦14,000/spot</p></div>
       <div class="cr-advert-card"><h3>Programme Sponsorship</h3><p>Weekly programme sponsor. Mention at open and close.</p><p class="price">₦50,000/week</p></div>
       <div class="cr-advert-card"><h3>Monthly Campaign</h3><p>30 peak spots + jingle production + certificate of broadcast.</p><p class="price">₦180,000/month</p></div>
       <div class="cr-advert-card"><h3>Outside Broadcast</h3><p>Live broadcast at your event, launch, or market.</p><p class="price">₦150,000/event</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Advertise — ${name} ${freq}</title>${CSS}</head><body>
<nav class="cr-nav"><a href="/" class="cr-nav-brand">📻 ${name} <span class="cr-on-air">ON AIR</span></a><a href="/contact" class="cr-nav-cta">Book Now</a></nav>
<section class="cr-hero" style="padding:3rem 1rem 2.5rem;"><h1>Advertise on ${name}</h1><p class="cr-hero-freq">${freq} — Reaching Thousands of Local Listeners Daily</p></section>
<section class="cr-section"><div class="cr-container"><div class="cr-advert-grid">${itemsHtml}</div>
<div style="margin-top:2rem;padding:1rem;background:var(--cr-light);border-radius:6px;font-size:.85rem;color:var(--cr-muted);border:1px solid var(--cr-border);">
  <strong>Payment:</strong> Paystack · Bank transfer · Cash at station | <strong>Certificate of broadcast</strong> provided for all campaigns | All rates subject to VAT where applicable
</div></div></section>
<footer class="cr-footer"><div class="cr-container"><p>&copy; ${new Date().getFullYear()} ${name} | <a href="/">Home</a> | <a href="/contact">Contact</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const freq = esc((ctx.data.frequency as string | null) ?? '91.5 FM');
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const nbcLicence = esc((ctx.data.nbcLicenceNumber as string | null) ?? 'NBC/LC/[XXXX]/[YYYY]');
  const waHref = waLink(phone, 'Hello, I would like to contact the radio station.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${name}</title>${CSS}</head><body>
<nav class="cr-nav"><a href="/" class="cr-nav-brand">📻 ${name} <span class="cr-on-air">ON AIR</span></a><a href="${waHref}" class="cr-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="cr-hero" style="padding:3rem 1rem 2.5rem;"><div class="cr-hero-icon">📻</div><h1>Contact ${name}</h1><p class="cr-hero-freq">${freq} | ${city}</p></section>
<section class="cr-section"><div class="cr-container"><div class="cr-contact-grid">
  <div class="cr-contact-box">
    <h3>📱 WhatsApp Listener & Advertiser Line</h3>
    <p>Shout-outs, song requests, community news tips, advertising bookings — all via WhatsApp.</p>
    <a href="${waHref}" class="cr-btn cr-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">WhatsApp Station</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Studio Line:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Location:</strong> ${city}, Nigeria</p>
    <p><strong>NBC Licence:</strong> ${nbcLicence}</p>
  </div>
  <div class="cr-contact-box">
    <h3>Advertiser / Partner Enquiry</h3>
    <form class="cr-form" onsubmit="return false;">
      <input class="cr-input" type="text" placeholder="Full name / Business name" autocomplete="name">
      <input class="cr-input" type="tel" placeholder="Phone number" autocomplete="tel">
      <input class="cr-input" type="email" placeholder="Email address" autocomplete="email">
      <select class="cr-input"><option value="">-- Enquiry type --</option><option>Advertising / Sponsorship</option><option>Programme Sponsorship</option><option>Outside Broadcast</option><option>Community Announcement</option><option>Partnership / NGO Campaign</option><option>General Enquiry</option></select>
      <textarea class="cr-input" rows="3" placeholder="Describe your request..."></textarea>
      <div><input type="checkbox" id="ndpr-cr" required> <label for="ndpr-cr" class="cr-ndpr">I consent to ${name} processing my contact details for this enquiry, in line with Nigeria's NDPR and our data protection policy.</label></div>
      <button class="cr-submit" type="submit">Send Enquiry</button>
    </form>
  </div>
</div></div></section>
<footer class="cr-footer"><div class="cr-container"><p>&copy; ${new Date().getFullYear()} ${name} | ${freq} | NBC Licence: ${nbcLicence} | NDPR Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const communityRadioCommunityRadioSiteTemplate: WebsiteTemplateContract = {
  slug: 'community-radio-community-radio-site',
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
