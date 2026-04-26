import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P40 — Dental Clinic / Specialist Care template
 * CSS namespace: .dc-
 * Platform invariants: T4 (kobo), P13 (patient_ref_id opaque, no diagnosis in template), P2 (Nigeria First)
 * Trust badge: MDCN facility registration
 * SLUG MISMATCH: vertical uses 'dental' vs template slug 'dental-clinic' — await migration 0037
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a2234;background:#fff}
      .dc-header{background:#0a4a7a;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .dc-logo{font-size:1.3rem;font-weight:700;color:#7ed4ff;letter-spacing:.3px}
      .dc-nav a{color:#a8d4f0;text-decoration:none;margin-left:18px;font-size:.95rem}
      .dc-hero{background:linear-gradient(135deg,#0a4a7a 0%,#1a6aa8 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .dc-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .dc-hero p{font-size:1.05rem;color:#a8d4f0;max-width:560px;margin:0 auto 32px}
      .dc-badge{display:inline-block;background:rgba(126,212,255,.15);border:1px solid rgba(126,212,255,.4);color:#7ed4ff;padding:6px 18px;border-radius:20px;font-size:.85rem;margin-bottom:16px}
      .dc-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .dc-cta:hover{background:#1ebe5d}
      .dc-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .dc-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#0a4a7a;text-align:center}
      .dc-treatments{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
      .dc-treatment{border:1px solid #d0e8f8;border-radius:14px;padding:24px}
      .dc-treatment .icon{font-size:1.8rem;margin-bottom:10px}
      .dc-treatment h3{font-weight:700;margin-bottom:8px;color:#0a4a7a}
      .dc-treatment .fee{font-size:1rem;font-weight:700;color:#1a6aa8;margin:8px 0}
      .dc-treatment p{font-size:.88rem;color:#666;line-height:1.5}
      .dc-trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
      .dc-trust-item{background:#f0f8ff;border-radius:10px;padding:16px;text-align:center;border:1px solid #d0e8f8}
      .dc-trust-item .icon{font-size:1.5rem;margin-bottom:6px}
      .dc-trust-item p{font-size:.85rem;font-weight:600;color:#0a4a7a}
      .dc-whatsapp{background:#0a4a7a;color:#fff;padding:64px 24px;text-align:center}
      .dc-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#7ed4ff}
      .dc-whatsapp p{color:#a8d4f0;margin-bottom:28px}
      .dc-footer{background:#062a4a;color:#667;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.dc-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Dental Clinic';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const mdcnFacilityReg: string = (d['mdcnFacilityReg'] as string) ?? '';
  const dentistQuals: string = (d['dentistQualifications'] as string) ?? 'BDS-qualified dentist';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20a%20dental%20appointment%20at%20${encodeURIComponent(name)}`;

  const treatments = [
    { icon: '🦷', name: 'Consultation', fee: 'From ₦8,000', desc: 'Full dental examination, X-ray review, and treatment plan.' },
    { icon: '✨', name: 'Scaling & Polishing', fee: 'From ₦15,000', desc: 'Professional cleaning to remove tartar and stains.' },
    { icon: '🔩', name: 'Tooth Filling', fee: 'From ₦12,000', desc: 'Composite (tooth-coloured) or amalgam filling for cavities.' },
    { icon: '🦷', name: 'Tooth Extraction', fee: 'From ₦15,000', desc: 'Simple or surgical extraction under local anaesthesia.' },
    { icon: '😁', name: 'Orthodontics (Braces)', fee: 'From ₦300,000', desc: 'Metal or ceramic braces for teeth straightening. 12–24 month treatment.' },
    { icon: '📸', name: 'Dental X-Ray / OPG', fee: 'From ₦10,000', desc: 'Periapical, bitewing, or full panoramic X-ray (OPG).' },
    { icon: '🪄', name: 'Teeth Whitening', fee: 'From ₦50,000', desc: 'In-office professional whitening for a brighter smile.' },
    { icon: '🔬', name: 'Dental Implants', fee: 'From ₦400,000', desc: 'Permanent tooth replacement. Titanium implant + crown.' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="dc-header">
  <div class="dc-logo">${name}</div>
  <nav class="dc-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Treatments</a><a href="/contact">Book</a>
  </nav>
</header>
<section class="dc-hero">
  ${mdcnFacilityReg ? `<div class="dc-badge">🏅 MDCN Facility Reg: ${mdcnFacilityReg}</div><br>` : '<div class="dc-badge">🏅 MDCN Registered Dental Facility</div><br>'}
  <h1>Gentle, Professional Dental Care in ${city}</h1>
  <p>MDCN-registered dental clinic. ${dentistQuals}. Modern equipment, sterile environment, pain-free treatments.</p>
  ${phone ? `<a class="dc-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book an Appointment</a>` : ''}
</section>

<section class="dc-section">
  <h2>Our Treatments</h2>
  <div class="dc-treatments">
    ${treatments.map(t => `
    <div class="dc-treatment">
      <div class="icon">${t.icon}</div>
      <h3>${t.name}</h3>
      <div class="fee">${t.fee}</div>
      <p>${t.desc}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;margin-top:12px;background:#0a4a7a;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.85rem" target="_blank" rel="noopener">Book</a>` : ''}
    </div>`).join('')}
  </div>
</section>

<section class="dc-section" style="background:#f0f8ff;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>Why Choose ${name}?</h2>
    <div class="dc-trust">
      ${mdcnFacilityReg ? `<div class="dc-trust-item"><div class="icon">🏅</div><p>MDCN Registered<br>Facility</p></div>` : ''}
      <div class="dc-trust-item"><div class="icon">🧼</div><p>Sterile, Single-Use<br>Instruments</p></div>
      <div class="dc-trust-item"><div class="icon">💉</div><p>Pain-Free<br>Anaesthesia</p></div>
      <div class="dc-trust-item"><div class="icon">🦷</div><p>Modern Digital<br>X-Ray</p></div>
      <div class="dc-trust-item"><div class="icon">⏰</div><p>Flexible<br>Appointment Times</p></div>
      <div class="dc-trust-item"><div class="icon">💳</div><p>Accepts Bank<br>Transfer & POS</p></div>
    </div>
  </div>
</section>

<section class="dc-whatsapp">
  <h2>Book Your Appointment Today</h2>
  <p>WhatsApp us to book — same-day appointments available for emergencies.</p>
  ${phone ? `<a class="dc-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book on WhatsApp</a>` : ''}
</section>

<footer class="dc-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.${mdcnFacilityReg ? ` MDCN Reg: ${mdcnFacilityReg}.` : ''}</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Dental Clinic';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const mdcnFacilityReg: string = (d['mdcnFacilityReg'] as string) ?? '';
  const dentistQuals: string = (d['dentistQualifications'] as string) ?? 'BDS-qualified dentist';
  const yearsOfPractice: number = (d['yearsOfPractice'] as number) ?? 0;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="dc-header">
  <div class="dc-logo">${name}</div>
  <nav class="dc-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Treatments</a><a href="/contact">Book</a></nav>
</header>
<section class="dc-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${mdcnFacilityReg ? `<p style="background:#f0f8ff;border-radius:10px;padding:14px 18px;margin-bottom:20px">🏅 MDCN Facility Registration: <strong>${mdcnFacilityReg}</strong></p>` : ''}
  <p style="margin-bottom:16px">${name} is an MDCN-registered dental clinic in ${city}, offering comprehensive dental care from routine check-ups to specialist procedures. ${yearsOfPractice > 0 ? `${yearsOfPractice}+ years of practice.` : ''}</p>
  <p style="margin-bottom:16px">Our dentist: ${dentistQuals}.</p>
  <h3 style="margin-bottom:12px;color:#0a4a7a">Our Standards</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ MDCN-registered facility and licensed dentist on premises</li>
    <li style="padding:6px 0">✓ Sterile instruments — single-use materials wherever possible</li>
    <li style="padding:6px 0">✓ Modern digital X-ray — lower radiation dose</li>
    <li style="padding:6px 0">✓ Pain-free treatment — local anaesthesia administered by qualified dentist</li>
    <li style="padding:6px 0">✓ Transparent fees — all costs quoted before treatment begins</li>
    <li style="padding:6px 0">✓ Flexible appointments including early morning and evening slots</li>
  </ul>
</section>
<footer class="dc-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Dental Clinic';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20at%20${encodeURIComponent(name)}`;
  const treatments = [
    { name: 'Dental Consultation', fee: 'From ₦8,000', duration: '30–45 min', desc: 'Full mouth examination, review of X-rays, treatment planning.' },
    { name: 'Scaling & Polishing (Cleaning)', fee: 'From ₦15,000', duration: '45 min', desc: 'Removal of tartar, plaque, stains. Recommended every 6 months.' },
    { name: 'Tooth Filling (Composite)', fee: 'From ₦15,000/tooth', duration: '45 min', desc: 'Tooth-coloured composite resin filling for cavities.' },
    { name: 'Tooth Extraction (Simple)', fee: 'From ₦15,000', duration: '30 min', desc: 'Simple extraction under local anaesthesia.' },
    { name: 'Tooth Extraction (Surgical)', fee: 'From ₦35,000', duration: '60 min', desc: 'Surgical removal of impacted or difficult teeth.' },
    { name: 'Root Canal Treatment', fee: 'From ₦60,000/tooth', duration: '2–3 visits', desc: 'Save an infected tooth from extraction. Full root canal therapy.' },
    { name: 'Dental Crown (Porcelain)', fee: 'From ₦80,000/crown', duration: '2 visits', desc: 'Tooth-coloured porcelain crown to protect and restore a tooth.' },
    { name: 'Dentures (Full or Partial)', fee: 'From ₦150,000', duration: '2–4 visits', desc: 'Removable dentures — full arch or partial replacement.' },
    { name: 'Orthodontics (Metal Braces)', fee: 'From ₦300,000', duration: '12–24 months', desc: 'Traditional metal braces for teeth alignment correction.' },
    { name: 'Teeth Whitening (In-Office)', fee: 'From ₦50,000', duration: '90 min', desc: 'Professional bleaching for a noticeably whiter smile.' },
    { name: 'Dental Implant', fee: 'From ₦400,000/implant', duration: '2–3 months', desc: 'Permanent titanium implant with porcelain crown.' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Treatments & Fees — ${name}</title>${css()}</head>
<body>
<header class="dc-header">
  <div class="dc-logo">${name}</div>
  <nav class="dc-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Treatments</a><a href="/contact">Book</a></nav>
</header>
<section class="dc-section">
  <h2>Treatments & Fees</h2>
  <div class="dc-treatments">
    ${treatments.map(t => `
    <div class="dc-treatment">
      <h3>${t.name}</h3>
      <div class="fee">${t.fee} · ${t.duration}</div>
      <p>${t.desc}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;margin-top:10px;background:#25d366;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.85rem" target="_blank" rel="noopener">Book</a>` : ''}
    </div>`).join('')}
  </div>
  <p style="text-align:center;margin-top:28px;color:#888;font-size:.9rem">All fees in NGN. Final fees quoted after consultation. NHIS accepted where applicable.</p>
</section>
<footer class="dc-footer"><p>&copy; ${new Date().getFullYear()} ${name}.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Dental Clinic';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Fri: 8am–6pm | Sat: 9am–3pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20a%20dental%20appointment%20at%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Book — ${name}</title>${css()}</head>
<body>
<header class="dc-header">
  <div class="dc-logo">${name}</div>
  <nav class="dc-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Treatments</a><a href="/contact">Book</a></nav>
</header>
<section class="dc-section" style="max-width:640px">
  <h2>Book an Appointment</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f0f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Book / Emergency)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f0f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Clinic Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#f0f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Clinic Hours</p><p style="font-weight:700">${hours}</p></div>
    <div style="background:#fff3e0;border-radius:12px;padding:16px;border:1px solid #ffe082"><p style="font-size:.9rem;color:#e65100"><strong>Dental Emergency?</strong> WhatsApp us — we offer same-day emergency slots.</p></div>
  </div>
  ${phone ? `<a class="dc-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Book on WhatsApp</a>` : ''}
</section>
<footer class="dc-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const dentalClinicSpecialistCareTemplate: WebsiteTemplateContract = {
  slug: 'dental-clinic-specialist-care',
  version: '1.0.0',
  pages: ['home', 'about', 'services', 'contact'] as WebsitePageType[],
  renderPage(ctx: WebsiteRenderContext): string {
    switch (ctx.pageType) {
      case 'about': return renderAbout(ctx);
      case 'services': return renderServices(ctx);
      case 'contact': return renderContact(ctx);
      default: return renderHome(ctx);
    }
  },
};
