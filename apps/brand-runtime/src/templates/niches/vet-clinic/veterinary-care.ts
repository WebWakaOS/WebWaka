import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P41 — Veterinary Clinic / Pet Care template
 * CSS namespace: .vc-
 * Platform invariants: T4 (kobo), P13 (animal_ref_id and owner_ref_id opaque), P2 (Nigeria First)
 * Trust badge: VCNB registration
 * SLUG MISMATCH: vertical uses 'vet' vs template slug 'vet-clinic' — await migration 0037
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a2e1a;background:#fff}
      .vc-header{background:#1a4a1a;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .vc-logo{font-size:1.3rem;font-weight:700;color:#a0e080}
      .vc-nav a{color:#c0dcc0;text-decoration:none;margin-left:18px;font-size:.95rem}
      .vc-hero{background:linear-gradient(135deg,#1a4a1a 0%,#2a6a2a 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .vc-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .vc-hero p{font-size:1.05rem;color:#b0d4b0;max-width:560px;margin:0 auto 32px}
      .vc-badge{display:inline-block;background:rgba(160,224,128,.15);border:1px solid rgba(160,224,128,.4);color:#a0e080;padding:6px 18px;border-radius:20px;font-size:.85rem;margin-bottom:16px}
      .vc-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .vc-cta:hover{background:#1ebe5d}
      .vc-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .vc-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#1a4a1a;text-align:center}
      .vc-services{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
      .vc-service{border:1px solid #c8e8c8;border-radius:14px;padding:24px}
      .vc-service .icon{font-size:1.8rem;margin-bottom:10px}
      .vc-service h3{font-weight:700;margin-bottom:8px;color:#1a4a1a}
      .vc-service .fee{font-size:1rem;font-weight:700;color:#2a6a2a;margin:8px 0}
      .vc-service p{font-size:.88rem;color:#666;line-height:1.5}
      .vc-animals{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:16px 0}
      .vc-animal{background:#e8f5e0;border-radius:20px;padding:8px 18px;font-size:.9rem;font-weight:600;color:#1a4a1a}
      .vc-trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
      .vc-trust-item{background:#f0faf0;border-radius:10px;padding:16px;text-align:center;border:1px solid #c8e8c8}
      .vc-trust-item .icon{font-size:1.5rem;margin-bottom:6px}
      .vc-trust-item p{font-size:.85rem;font-weight:600;color:#1a4a1a}
      .vc-whatsapp{background:#1a4a1a;color:#fff;padding:64px 24px;text-align:center}
      .vc-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#a0e080}
      .vc-whatsapp p{color:#b0d4b0;margin-bottom:28px}
      .vc-footer{background:#0d2a0d;color:#667;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.vc-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Veterinary Clinic';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const vcnbRegistration: string = (d['vcnbRegistration'] as string) ?? '';
  const clinicType: string = (d['clinicType'] as string) ?? 'companion';
  const vetQuals: string = (d['vetQualifications'] as string) ?? 'DVM-qualified veterinarian';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20a%20vet%20appointment%20at%20${encodeURIComponent(name)}`;

  const clinicTypeLabel: Record<string, string> = {
    companion: 'Small Animal & Pet Clinic',
    livestock: 'Large Animal & Livestock Clinic',
    both: 'Small Animal, Pet & Livestock Clinic',
  };

  const animalsByType: Record<string, string[]> = {
    companion: ['🐕 Dogs', '🐈 Cats', '🐇 Rabbits', '🐦 Birds', '🐠 Fish', '🐢 Tortoises'],
    livestock: ['🐄 Cattle', '🐐 Goats', '🐑 Sheep', '🐖 Pigs', '🐓 Poultry'],
    both: ['🐕 Dogs', '🐈 Cats', '🐦 Birds', '🐄 Cattle', '🐐 Goats', '🐓 Poultry'],
  };

  const services = [
    { icon: '🩺', name: 'Consultation', fee: 'From ₦5,000', desc: 'Full clinical examination, diagnosis, and treatment recommendation.' },
    { icon: '💉', name: 'Vaccination', fee: 'From ₦8,000/dose', desc: 'Rabies, DHLPP, parvo, and other essential vaccines for pets and livestock.' },
    { icon: '🔬', name: 'Surgery', fee: 'From ₦30,000', desc: 'Spay/neuter, wound repair, growth removal, and emergency surgery.' },
    { icon: '✂️', name: 'Pet Grooming', fee: 'From ₦8,000', desc: 'Bath, brush, nail trim, ear cleaning, and styling for dogs and cats.' },
    { icon: '💊', name: 'Pharmacy & Deworm', fee: 'From ₦3,000', desc: 'Medications, dewormers, supplements, and flea/tick treatments.' },
    { icon: '🏥', name: 'In-Patient / Hospitalization', fee: 'From ₦10,000/night', desc: 'Monitoring and treatment for seriously ill animals.' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="vc-header">
  <div class="vc-logo">${name}</div>
  <nav class="vc-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Book</a>
  </nav>
</header>
<section class="vc-hero">
  ${vcnbRegistration ? `<div class="vc-badge">🏅 VCNB Registered: ${vcnbRegistration}</div><br>` : '<div class="vc-badge">🏅 VCNB Licensed Veterinarian</div><br>'}
  <h1>${clinicTypeLabel[clinicType] ?? 'Veterinary Clinic'} in ${city}</h1>
  <p>Professional veterinary care for your animals. ${vetQuals}. Compassionate, thorough, and trusted.</p>
  <div class="vc-animals">
    ${(animalsByType[clinicType] ?? animalsByType['companion'] ?? []).map((a: string) => `<span class="vc-animal">${a}</span>`).join('')}
  </div>
  ${phone ? `<a class="vc-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book an Appointment</a>` : ''}
</section>

<section class="vc-section">
  <h2>Our Services</h2>
  <div class="vc-services">
    ${services.map(s => `
    <div class="vc-service">
      <div class="icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <div class="fee">${s.fee}</div>
      <p>${s.desc}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;margin-top:10px;background:#1a4a1a;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.85rem" target="_blank" rel="noopener">Book</a>` : ''}
    </div>`).join('')}
  </div>
</section>

<section class="vc-section" style="background:#f0faf0;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>Why Choose ${name}?</h2>
    <div class="vc-trust">
      ${vcnbRegistration ? `<div class="vc-trust-item"><div class="icon">🏅</div><p>VCNB<br>Registered Vet</p></div>` : ''}
      <div class="vc-trust-item"><div class="icon">🧼</div><p>Sterile<br>Equipment</p></div>
      <div class="vc-trust-item"><div class="icon">💊</div><p>In-House<br>Pharmacy</p></div>
      <div class="vc-trust-item"><div class="icon">🏥</div><p>Hospitalization<br>Available</p></div>
      <div class="vc-trust-item"><div class="icon">🚨</div><p>Emergency<br>Cases Accepted</p></div>
    </div>
  </div>
</section>

<section class="vc-whatsapp">
  <h2>Book an Appointment</h2>
  <p>WhatsApp us to schedule — we also accept emergency cases.</p>
  ${phone ? `<a class="vc-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book on WhatsApp</a>` : ''}
</section>

<footer class="vc-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.${vcnbRegistration ? ` VCNB: ${vcnbRegistration}.` : ''}</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Veterinary Clinic';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const vcnbRegistration: string = (d['vcnbRegistration'] as string) ?? '';
  const vetQuals: string = (d['vetQualifications'] as string) ?? 'DVM-qualified veterinarian';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="vc-header">
  <div class="vc-logo">${name}</div>
  <nav class="vc-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Book</a></nav>
</header>
<section class="vc-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${vcnbRegistration ? `<p style="background:#f0faf0;border-radius:10px;padding:14px 18px;margin-bottom:20px">🏅 VCNB Registration: <strong>${vcnbRegistration}</strong></p>` : ''}
  <p style="margin-bottom:16px">${name} is a VCNB-registered veterinary clinic in ${city}. Our vet: ${vetQuals}.</p>
  <h3 style="margin-bottom:12px;color:#1a4a1a">Our Commitment</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ VCNB-licensed veterinarian on premises at all times during clinic hours</li>
    <li style="padding:6px 0">✓ Sterile surgical theatre and equipment</li>
    <li style="padding:6px 0">✓ In-house pharmacy — most medications available immediately</li>
    <li style="padding:6px 0">✓ Compassionate care — we treat animals like family</li>
    <li style="padding:6px 0">✓ Emergency cases accepted — WhatsApp us first for guidance</li>
  </ul>
</section>
<footer class="vc-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Veterinary Clinic';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20at%20${encodeURIComponent(name)}`;
  const services = [
    { name: 'General Consultation', fee: 'From ₦5,000', desc: 'Full clinical examination and treatment plan.' },
    { name: 'Vaccination (Dogs) — Rabies', fee: '₦8,000/dose', desc: 'Annual rabies vaccine — compulsory for registered pets.' },
    { name: 'Vaccination (Dogs) — DHLPP', fee: '₦12,000/dose', desc: 'Distemper, Hepatitis, Leptospirosis, Parvovirus, Parainfluenza combo.' },
    { name: 'Vaccination (Cats) — FVRCP', fee: '₦10,000/dose', desc: 'Feline combination vaccine.' },
    { name: 'Spay (Female dog)', fee: 'From ₦25,000', desc: 'Ovariohysterectomy under general anaesthesia.' },
    { name: 'Neuter (Male dog)', fee: 'From ₦18,000', desc: 'Castration under general anaesthesia.' },
    { name: 'Dog Grooming (Full)', fee: 'From ₦10,000', desc: 'Bath, dry, brush, nail trim, ear clean.' },
    { name: 'Deworming', fee: 'From ₦3,000', desc: 'Oral or injectable dewormer for all species.' },
    { name: 'Wound Dressing & Suturing', fee: 'From ₦8,000', desc: 'Wound cleaning, debridement, and suture closure.' },
    { name: 'Hospitalization / ICU', fee: 'From ₦10,000/night', desc: 'IV fluids, monitoring, and nursing care for ill animals.' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Services — ${name}</title>${css()}</head>
<body>
<header class="vc-header">
  <div class="vc-logo">${name}</div>
  <nav class="vc-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Book</a></nav>
</header>
<section class="vc-section">
  <h2>Veterinary Services & Fees</h2>
  <div class="vc-services">
    ${services.map(s => `
    <div class="vc-service">
      <h3>${s.name}</h3>
      <div class="fee">${s.fee}</div>
      <p>${s.desc}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;margin-top:10px;background:#25d366;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.85rem" target="_blank" rel="noopener">Book</a>` : ''}
    </div>`).join('')}
  </div>
  <p style="text-align:center;margin-top:28px;color:#888;font-size:.9rem">Fees are indicative. Final fees depend on animal size/weight and severity. WhatsApp for exact quote.</p>
</section>
<footer class="vc-footer"><p>&copy; ${new Date().getFullYear()} ${name}.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Veterinary Clinic';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Fri: 8am–6pm | Sat: 9am–3pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20a%20vet%20appointment%20at%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Book — ${name}</title>${css()}</head>
<body>
<header class="vc-header">
  <div class="vc-logo">${name}</div>
  <nav class="vc-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Book</a></nav>
</header>
<section class="vc-section" style="max-width:640px">
  <h2>Book an Appointment</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f0faf0;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Book / Emergency)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f0faf0;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Clinic Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#f0faf0;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Clinic Hours</p><p style="font-weight:700">${hours}</p></div>
    <div style="background:#fff8e0;border-radius:12px;padding:16px;border:1px solid #ffe082"><p style="font-size:.9rem;color:#e65100"><strong>Emergency?</strong> WhatsApp us first — we'll advise you immediately and prepare for your arrival.</p></div>
  </div>
  ${phone ? `<a class="vc-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Book on WhatsApp</a>` : ''}
</section>
<footer class="vc-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const vetClinicVeterinaryTemplate: WebsiteTemplateContract = {
  slug: 'vet-clinic-veterinary-care',
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
