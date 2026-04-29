/**
 * Private School Operator — Pillar 3 Website Template
 * Niche ID: P3-private-school-private-school-site
 * Vertical: private-school (priority=3, critical)
 * Category: education
 * Family: NF-EDU-PRV anchor (nursery-school variant)
 * Research brief: docs/templates/research/private-school-private-school-site-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: State Ministry of Education licence, SUBEB, WAEC/NECO registration, NDPR
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like information about admission to your school.')}`;
}

const CSS = `
<style>
:root{--ps-blue:#1a3c6b;--ps-gold:#f5a623;--ps-light:#eef3fb;--ps-text:#2c2c2c;--ps-muted:#6c757d;--ps-green:#2d7d4f;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',sans-serif;color:var(--ps-text);background:#fff;font-size:16px;line-height:1.6;}
.ps-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.ps-nav{background:var(--ps-blue);padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.ps-nav-brand{color:#fff;font-size:1.2rem;font-weight:700;text-decoration:none;}
.ps-nav-cta{background:var(--ps-gold);color:#fff;padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9rem;}
.ps-hero{background:linear-gradient(135deg,var(--ps-blue) 0%,#2d5da8 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;}
.ps-hero h1{font-size:clamp(1.8rem,5vw,2.8rem);font-weight:800;margin-bottom:.75rem;}
.ps-hero-badge{background:var(--ps-gold);color:#fff;display:inline-block;padding:.4rem 1rem;border-radius:20px;font-size:.85rem;font-weight:700;margin-bottom:1rem;}
.ps-hero p{max-width:650px;margin:0 auto 1.5rem;opacity:.9;}
.ps-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:700;font-size:1rem;min-height:44px;line-height:1.3;}
.ps-btn-wa{background:#25D366;color:#fff;}
.ps-btn-primary{background:var(--ps-gold);color:#fff;}
.ps-btn-outline{border:2px solid #fff;color:#fff;}
.ps-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.ps-certs{background:var(--ps-green);color:#fff;text-align:center;padding:.75rem;font-size:.85rem;}
.ps-section{padding:3rem 1rem;}
.ps-section-alt{background:var(--ps-light);}
.ps-section h2{font-size:1.6rem;font-weight:700;margin-bottom:.5rem;color:var(--ps-blue);}
.ps-section-sub{color:var(--ps-muted);margin-bottom:2rem;}
.ps-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;}
.ps-card{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 8px rgba(26,60,107,.1);border-top:4px solid var(--ps-gold);}
.ps-card h3{font-size:1.05rem;font-weight:700;margin-bottom:.5rem;color:var(--ps-blue);}
.ps-card p{color:var(--ps-muted);font-size:.9rem;}
.ps-fee{margin-top:.75rem;font-weight:700;color:var(--ps-green);}
.ps-results-strip{background:var(--ps-blue);color:#fff;padding:2rem 1rem;text-align:center;}
.ps-results-strip h2{font-size:1.6rem;margin-bottom:.75rem;}
.ps-results-grid{display:flex;gap:2rem;justify-content:center;flex-wrap:wrap;margin-top:1rem;}
.ps-result-item{text-align:center;}
.ps-result-item .num{font-size:2.5rem;font-weight:800;color:var(--ps-gold);}
.ps-result-item .lbl{font-size:.9rem;opacity:.85;}
.ps-wa-strip{background:#25D366;color:#fff;padding:2rem 1rem;text-align:center;}
.ps-wa-strip h2{font-size:1.5rem;margin-bottom:.5rem;}
.ps-wa-btn{background:#fff;color:#128C7E;font-weight:700;padding:.75rem 2rem;border-radius:6px;text-decoration:none;display:inline-block;}
.ps-testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;margin-top:1.5rem;}
.ps-testi{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 6px rgba(0,0,0,.08);}
.ps-testi-text{font-style:italic;margin-bottom:.75rem;}
.ps-testi-author{font-weight:700;font-size:.9rem;color:var(--ps-blue);}
.ps-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.ps-contact-box{background:var(--ps-light);padding:1.5rem;border-radius:8px;}
.ps-contact-box h3{margin-bottom:1rem;color:var(--ps-blue);}
.ps-contact-box a{color:var(--ps-blue);font-weight:600;}
.ps-form{display:flex;flex-direction:column;gap:.75rem;}
.ps-input{padding:.75rem;border:1px solid #ddd;border-radius:6px;font-size:1rem;width:100%;}
.ps-ndpr{font-size:.8rem;color:var(--ps-muted);}
.ps-submit{background:var(--ps-blue);color:#fff;border:none;padding:.75rem 1.5rem;border-radius:6px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.ps-footer{background:var(--ps-blue);color:rgba(255,255,255,.8);text-align:center;padding:1.5rem;font-size:.85rem;}
.ps-footer a{color:var(--ps-gold);}
@media(max-width:600px){.ps-hero{padding:2.5rem 1rem 2rem;}.ps-hero h1{font-size:1.6rem;}.ps-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Excellence. Discipline. Character. Your Child\'s Future Starts Here.');
  const desc = esc((ctx.data.description as string | null) ?? 'We provide quality nursery, primary, and secondary education in a safe, disciplined environment. State Ministry of Education licensed. WAEC/NECO registered. Shaping future Nigerian leaders.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20information%20about%20admission.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const programmesHtml = offerings.length > 0
    ? offerings.map(o => `<div class="ps-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="ps-fee">${o.priceKobo !== null ? fmtKobo(o.priceKobo) + ' per term' : 'Contact for fees'}</p></div>`).join('')
    : `
      <div class="ps-card"><h3>Nursery (Ages 3–5)</h3><p>Phonics, numeracy, social skills, and play-based learning in a nurturing environment.</p><p class="ps-fee">From ₦85,000/term</p></div>
      <div class="ps-card"><h3>Primary (JSS Basic 1–6)</h3><p>NERDC-aligned curriculum, literacy, numeracy, science, civic education, and Yoruba/Igbo/Hausa.</p><p class="ps-fee">From ₦120,000/term</p></div>
      <div class="ps-card"><h3>Junior Secondary (JSS1–3)</h3><p>WAEC-certified BECE preparation. Mathematics, English, sciences, and vocational subjects.</p><p class="ps-fee">From ₦180,000/term</p></div>
      <div class="ps-card"><h3>Senior Secondary (SS1–3)</h3><p>WAEC/NECO registered. Science, arts, and commercial streams. JAMB UTME preparation.</p><p class="ps-fee">From ₦220,000/term</p></div>
      <div class="ps-card"><h3>After-School Programme</h3><p>Homework club, coding, music, sports, and debate. Monday–Friday 3pm–5:30pm.</p><p class="ps-fee">From ₦25,000/month</p></div>
      <div class="ps-card"><h3>Boarding (Optional)</h3><p>Secure on-campus boarding for JSS and SS students. 24/7 supervision and feeding.</p><p class="ps-fee">From ₦350,000/term</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Private School | ${city}</title>${CSS}</head><body>
<nav class="ps-nav">
  <a href="/" class="ps-nav-brand">🎓 ${name}</a>
  <a href="${waHref}" class="ps-nav-cta" target="_blank" rel="noopener">📱 Admissions WhatsApp</a>
</nav>
<div class="ps-certs">
  ✅ State Ministry of Education Licensed &nbsp;|&nbsp; SUBEB Registered &nbsp;|&nbsp; WAEC/NECO Registered &nbsp;|&nbsp; CAC Registered
</div>
<section class="ps-hero">
  <div class="ps-hero-badge">🎓 Private School — ${city}</div>
  <h1>${name}</h1>
  <p>${tagline}</p>
  <p>${desc}</p>
  <div class="ps-hero-btns">
    <a href="${waHref}" class="ps-btn ps-btn-wa" target="_blank" rel="noopener">📱 Enquire About Admission</a>
    <a href="/services" class="ps-btn ps-btn-outline">View Classes & Fees</a>
  </div>
</section>
<section class="ps-results-strip">
  <h2>Our Academic Performance</h2>
  <div class="ps-results-grid">
    <div class="ps-result-item"><div class="num">98%</div><div class="lbl">WAEC Pass Rate (2024)</div></div>
    <div class="ps-result-item"><div class="num">15+</div><div class="lbl">Years of Excellence</div></div>
    <div class="ps-result-item"><div class="num">500+</div><div class="lbl">Students Enrolled</div></div>
    <div class="ps-result-item"><div class="num">30+</div><div class="lbl">Qualified Teachers</div></div>
  </div>
</section>
<section class="ps-section">
  <div class="ps-container">
    <h2>Programmes & Fees</h2>
    <p class="ps-section-sub">All fees in Nigerian Naira (₦) per term. Paystack and bank transfer accepted.</p>
    <div class="ps-grid">${programmesHtml}</div>
  </div>
</section>
<section class="ps-wa-strip">
  <h2>📱 Book a School Visit on WhatsApp</h2>
  <p>WhatsApp our admissions team to schedule a tour, collect our prospectus, or ask about available spaces for the next session.</p>
  <a href="${waHref}" class="ps-wa-btn" target="_blank" rel="noopener">Chat With Admissions Team</a>
</section>
<section class="ps-section ps-section-alt">
  <div class="ps-container">
    <h2>What Parents Say</h2>
    <div class="ps-testimonials">
      <div class="ps-testi"><p class="ps-testi-text">"My daughter moved here in JSS1 and got 7 A's in her WAEC. The teaching quality is outstanding. Very disciplined environment."</p><p class="ps-testi-author">— Mrs Blessing Osei, Parent, GRA Ikeja</p></div>
      <div class="ps-testi"><p class="ps-testi-text">"They have Islamic Studies as an option and the fees are reasonable. My children love the school. Highly recommend to Muslim parents."</p><p class="ps-testi-author">— Mr Salihu Garba, Parent, Kaduna</p></div>
    </div>
  </div>
</section>
<footer class="ps-footer"><div class="wp-container"><p>&copy; ${new Date().getFullYear()} ${name}. State Ministry of Education Licensed. WAEC/NECO Registered. | Payment: Paystack · Bank Transfer · USSD | <a href="/contact">Contact</a></p></div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'We are a State Ministry of Education licensed private school providing nursery, primary, and secondary education in a disciplined, academically excellent environment.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="ps-nav"><a href="/" class="ps-nav-brand">🎓 ${name}</a><a href="/contact" class="ps-nav-cta">Contact Us</a></nav>
<section class="ps-hero" style="padding:3rem 1rem 2rem;"><h1>About ${name}</h1><p>Building tomorrow's leaders, one student at a time</p></section>
<section class="ps-section"><div class="ps-container"><div class="ps-grid">
  <div><h2>Our Mission</h2><p style="margin:1rem 0;color:var(--ps-muted);">${desc}</p><p>Located in ${city}, our school combines academic rigour with strong values. We are registered with the State Ministry of Education, SUBEB, and WAEC/NECO.</p>${phone ? `<p style="margin-top:1rem;"><strong>Phone:</strong> ${phone}</p>` : ''}</div>
  <div><h2>Our Licences</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--ps-muted);">
    <li>✅ State Ministry of Education Licence</li>
    <li>✅ SUBEB Registration (Primary)</li>
    <li>✅ WAEC/NECO Registration (Secondary)</li>
    <li>✅ UBEC Compliance</li>
    <li>✅ CAC Business Registration</li>
    <li>✅ Child Safeguarding Policy in place</li>
  </ul></div>
</div></div></section>
<footer class="ps-footer"><div class="ps-container"><p>&copy; ${new Date().getFullYear()} ${name} | Ministry Licensed | WAEC Registered | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="ps-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="ps-fee">${o.priceKobo !== null ? fmtKobo(o.priceKobo) + '/term' : 'Contact for fees'}</p></div>`).join('')
    : `<div class="ps-card"><h3>Nursery</h3><p>Ages 3–5, phonics and play-based learning.</p><p class="ps-fee">From ₦85,000/term</p></div>
       <div class="ps-card"><h3>Primary (Basic 1–6)</h3><p>NERDC curriculum, literacy, numeracy, science.</p><p class="ps-fee">From ₦120,000/term</p></div>
       <div class="ps-card"><h3>Junior Secondary</h3><p>JSS1–3, BECE preparation.</p><p class="ps-fee">From ₦180,000/term</p></div>
       <div class="ps-card"><h3>Senior Secondary</h3><p>SS1–3, WAEC/NECO registered.</p><p class="ps-fee">From ₦220,000/term</p></div>
       <div class="ps-card"><h3>After-School</h3><p>Homework, coding, music, sports.</p><p class="ps-fee">From ₦25,000/month</p></div>
       <div class="ps-card"><h3>Boarding</h3><p>Secure on-campus boarding with 24/7 supervision.</p><p class="ps-fee">From ₦350,000/term</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Classes & Fees — ${name}</title>${CSS}</head><body>
<nav class="ps-nav"><a href="/" class="ps-nav-brand">🎓 ${name}</a><a href="/contact" class="ps-nav-cta">Apply Now</a></nav>
<section class="ps-hero" style="padding:3rem 1rem 2rem;"><h1>Classes & Fee Schedule</h1><p>All fees in Nigerian Naira (₦) per term. Payment: Paystack · Bank Transfer.</p></section>
<section class="ps-section"><div class="ps-container"><div class="ps-grid">${itemsHtml}</div></div></section>
<footer class="ps-footer"><div class="ps-container"><p>&copy; ${new Date().getFullYear()} ${name} | WAEC Registered | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const waHref = waLink(phone, 'Hello, I would like information about admission to your school.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admissions — ${name}</title>${CSS}</head><body>
<nav class="ps-nav"><a href="/" class="ps-nav-brand">🎓 ${name}</a><a href="${waHref}" class="ps-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<section class="ps-hero" style="padding:3rem 1rem 2rem;"><h1>Admissions Enquiry</h1><p>WhatsApp our admissions team or fill the form below</p></section>
<section class="ps-section"><div class="ps-container"><div class="ps-contact-grid">
  <div class="ps-contact-box">
    <h3>📱 Admissions WhatsApp</h3>
    <p>Ask about spaces, fees, and book a school visit.</p>
    <a href="${waHref}" class="ps-btn ps-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">Open WhatsApp</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>School Address:</strong> ${city}, Nigeria</p>
  </div>
  <div class="ps-contact-box">
    <h3>Admission Application</h3>
    <form class="ps-form" onsubmit="return false;">
      <input class="ps-input" type="text" placeholder="Parent/Guardian name" autocomplete="name">
      <input class="ps-input" type="tel" placeholder="Phone number" autocomplete="tel">
      <input class="ps-input" type="text" placeholder="Student's name">
      <select class="ps-input"><option value="">-- Class applying for --</option><option>Nursery</option><option>Primary (Basic 1–3)</option><option>Primary (Basic 4–6)</option><option>JSS1</option><option>JSS2</option><option>JSS3</option><option>SS1</option><option>SS2</option><option>SS3</option></select>
      <textarea class="ps-input" rows="2" placeholder="Any special requirements or questions..."></textarea>
      <div><input type="checkbox" id="ndpr-ps" required> <label for="ndpr-ps" class="ps-ndpr">I consent to ${name} storing my child's application details for admission processing, per Nigeria's NDPR.</label></div>
      <button class="ps-submit" type="submit">Submit Application</button>
    </form>
  </div>
</div>
<div style="margin-top:2rem;padding:1rem;background:var(--ps-light);border-radius:8px;font-size:.85rem;color:var(--ps-muted);">
  <strong>School fees payment:</strong> Paystack online payment · Bank transfer · USSD | Child Protection Policy available on request.
</div>
</div></section>
<footer class="ps-footer"><div class="ps-container"><p>&copy; ${new Date().getFullYear()} ${name} | Ministry of Education Licensed | WAEC/NECO Registered | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const privateSchoolPrivateSchoolSiteTemplate: WebsiteTemplateContract = {
  slug: 'private-school-private-school-site',
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
