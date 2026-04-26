import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P42 — Crèche / Day Care Centre template
 * CSS namespace: .cr-
 * Platform invariants: T4 (kobo), P13 (child_ref_id — MOST SENSITIVE; no child PII in template),
 *   L3 HITL mandatory for all AI calls on child data, P2 (Nigeria First)
 * Trust badge: SUBEB registration
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;background:#fff}
      .cr-header{background:#6a0572;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .cr-logo{font-size:1.3rem;font-weight:700;color:#ffde59}
      .cr-nav a{color:#e8c8f8;text-decoration:none;margin-left:18px;font-size:.95rem}
      .cr-hero{background:linear-gradient(135deg,#6a0572 0%,#9b59b6 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .cr-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .cr-hero p{font-size:1.05rem;color:#e8c8f8;max-width:560px;margin:0 auto 32px}
      .cr-badge{display:inline-block;background:rgba(255,222,89,.15);border:1px solid rgba(255,222,89,.4);color:#ffde59;padding:6px 18px;border-radius:20px;font-size:.85rem;margin-bottom:16px}
      .cr-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .cr-cta:hover{background:#1ebe5d}
      .cr-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .cr-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#6a0572;text-align:center}
      .cr-programmes{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
      .cr-programme{border:2px solid #e8d0f8;border-radius:16px;padding:28px;text-align:center}
      .cr-programme.featured{border-color:#ffde59;background:#fffef0}
      .cr-programme .icon{font-size:2.5rem;margin-bottom:12px}
      .cr-programme h3{font-weight:700;margin-bottom:8px;color:#6a0572}
      .cr-programme .age{background:#f0d8ff;color:#6a0572;font-size:.8rem;padding:3px 10px;border-radius:12px;display:inline-block;margin-bottom:10px;font-weight:600}
      .cr-programme .fee{font-size:1.4rem;font-weight:800;color:#9b59b6;margin:10px 0}
      .cr-programme ul{list-style:none;text-align:left;font-size:.88rem;color:#555}
      .cr-programme ul li{padding:3px 0}
      .cr-programme ul li::before{content:"✓ ";color:#25d366;font-weight:700}
      .cr-trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
      .cr-trust-item{background:#f8f0ff;border-radius:12px;padding:16px;text-align:center;border:1px solid #e8d0f8}
      .cr-trust-item .icon{font-size:1.6rem;margin-bottom:8px}
      .cr-trust-item h4{font-weight:700;color:#6a0572;margin-bottom:4px;font-size:.95rem}
      .cr-trust-item p{font-size:.82rem;color:#888}
      .cr-whatsapp{background:#6a0572;color:#fff;padding:64px 24px;text-align:center}
      .cr-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#ffde59}
      .cr-whatsapp p{color:#e8c8f8;margin-bottom:28px}
      .cr-footer{background:#3d0042;color:#998;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.cr-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Day Care Centre';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const subebRegistration: string = (d['subebRegistration'] as string) ?? '';
  const teacherRatio: string = (d['teacherChildRatio'] as string) ?? '1:5';
  const hasCctv: boolean = (d['hasCctv'] as boolean) ?? true;
  const mealsIncluded: boolean = (d['mealsIncluded'] as boolean) ?? true;
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20a%20nursery%20visit%20at%20${encodeURIComponent(name)}`;

  const programmes = [
    {
      icon: '👶', name: 'Crèche', ageRange: '0–18 months', fee: 'From ₦50,000/month', featured: false,
      features: ['Full-day care (7am–6pm)', 'Trained nursery nurses', mealsIncluded ? 'Baby meals & snacks included' : 'Meal arrangement available', 'Nappy changing service', 'Daily parent report'],
    },
    {
      icon: '🧒', name: 'Toddler Group', ageRange: '18 months–3 years', fee: 'From ₦45,000/month', featured: true,
      features: ['Full-day care (7am–6pm)', 'Play-based learning', mealsIncluded ? 'Breakfast, lunch & snacks' : 'Meal arrangement available', 'Toilet training support', 'Weekly parent update'],
    },
    {
      icon: '📚', name: 'Nursery (Pre-school)', ageRange: '3–5 years', fee: 'From ₦40,000/month', featured: false,
      features: ['Structured learning programme', 'Phonics & numeracy introduction', mealsIncluded ? 'School meals included' : 'Packed lunch option', 'Uniform included', 'Term report card'],
    },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="cr-header">
  <div class="cr-logo">${name}</div>
  <nav class="cr-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Programmes</a><a href="/contact">Visit Us</a>
  </nav>
</header>
<section class="cr-hero">
  ${subebRegistration ? `<div class="cr-badge">🏅 SUBEB Registered: ${subebRegistration}</div><br>` : '<div class="cr-badge">🏅 SUBEB Registered Childcare Centre</div><br>'}
  <h1>Safe, Nurturing Childcare in ${city}</h1>
  <p>SUBEB-registered early childhood centre. Teacher:child ratio ${teacherRatio}.${hasCctv ? ' 24/7 CCTV monitoring.' : ''} Your child's safety and development is our priority.</p>
  ${phone ? `<a class="cr-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book a Nursery Visit</a>` : ''}
</section>

<section class="cr-section">
  <h2>Our Programmes</h2>
  <div class="cr-programmes">
    ${programmes.map(p => `
    <div class="cr-programme${p.featured ? ' featured' : ''}">
      ${p.featured ? '<div style="color:#ffde59;font-weight:700;font-size:.85rem;margin-bottom:8px">⭐ MOST POPULAR</div>' : ''}
      <div class="icon">${p.icon}</div>
      <h3>${p.name}</h3>
      <div class="age">${p.ageRange}</div>
      <div class="fee">${p.fee}</div>
      <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
      ${phone ? `<a href="${waLink}" style="display:block;margin-top:16px;background:#6a0572;color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center" target="_blank" rel="noopener">Enroll Now</a>` : ''}
    </div>`).join('')}
  </div>
</section>

<section class="cr-section" style="background:#f8f0ff;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>Why Parents Choose ${name}</h2>
    <div class="cr-trust">
      ${subebRegistration ? `<div class="cr-trust-item"><div class="icon">🏅</div><h4>SUBEB Registered</h4><p>${subebRegistration}</p></div>` : ''}
      <div class="cr-trust-item"><div class="icon">👩‍🏫</div><h4>Qualified Staff</h4><p>NCE-trained early childhood educators</p></div>
      <div class="cr-trust-item"><div class="icon">📹</div><h4>CCTV Security</h4><p>${hasCctv ? '24/7 CCTV monitoring' : 'Secure gated environment'}</p></div>
      <div class="cr-trust-item"><div class="icon">🍽️</div><h4>Meals ${mealsIncluded ? 'Included' : 'Available'}</h4><p>${mealsIncluded ? 'Nutritious meals prepared daily' : 'Catering arrangement available'}</p></div>
      <div class="cr-trust-item"><div class="icon">🔬</div><h4>Child:Teacher ${teacherRatio}</h4><p>Small class sizes for individual attention</p></div>
      <div class="cr-trust-item"><div class="icon">📋</div><h4>Daily Reports</h4><p>WhatsApp updates on your child's day</p></div>
    </div>
  </div>
</section>

<section class="cr-whatsapp">
  <h2>Visit Our Centre Today</h2>
  <p>Book a free nursery visit — see our facilities and meet our team before enrolling.</p>
  ${phone ? `<a class="cr-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book Visit on WhatsApp</a>` : ''}
</section>

<footer class="cr-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.${subebRegistration ? ` SUBEB: ${subebRegistration}.` : ''}</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Day Care Centre';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const subebRegistration: string = (d['subebRegistration'] as string) ?? '';
  const founderStory: string = (d['founderStory'] as string) ?? 'Founded with a passion for early childhood education and the belief that every Nigerian child deserves a safe, stimulating start.';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="cr-header">
  <div class="cr-logo">${name}</div>
  <nav class="cr-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Programmes</a><a href="/contact">Visit Us</a></nav>
</header>
<section class="cr-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${subebRegistration ? `<p style="background:#f8f0ff;border-radius:10px;padding:14px 18px;margin-bottom:20px">🏅 SUBEB Registration: <strong>${subebRegistration}</strong></p>` : ''}
  <p style="margin-bottom:16px">${founderStory}</p>
  <h3 style="margin-bottom:12px;color:#6a0572">Our Standards</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ SUBEB-registered and regularly inspected</li>
    <li style="padding:6px 0">✓ All staff have valid criminal background checks</li>
    <li style="padding:6px 0">✓ NCE or equivalent qualification in early childhood education</li>
    <li style="padding:6px 0">✓ First aid trained staff on premises at all times</li>
    <li style="padding:6px 0">✓ Emergency protocols and parent contact procedures</li>
    <li style="padding:6px 0">✓ Child safeguarding policy — zero tolerance on any form of harm</li>
  </ul>
  <div style="background:#fff3f3;border-radius:10px;padding:16px 20px;margin-top:20px;border:1px solid #ffd0d0">
    <p style="font-size:.9rem;color:#c0392b"><strong>Child Privacy:</strong> We never share photos of children on social media without explicit written parental consent. All child records are kept strictly confidential.</p>
  </div>
</section>
<footer class="cr-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Day Care Centre';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20enroll%20at%20${encodeURIComponent(name)}`;
  const fees = [
    { prog: 'Crèche (0–18 months)', fee: 'From ₦50,000/month', incl: 'Full-day care, nappy change, baby meals, daily report' },
    { prog: 'Toddler Group (18m–3yr)', fee: 'From ₦45,000/month', incl: 'Full-day care, play-based learning, meals, toilet training' },
    { prog: 'Nursery 1 (3–4 years)', fee: 'From ₦40,000/month', incl: 'Structured learning, phonics, numeracy, meals, uniform' },
    { prog: 'Nursery 2 (4–5 years)', fee: 'From ₦42,000/month', incl: 'Pre-primary curriculum, reading, writing, meals, uniform' },
    { prog: 'After-School Care (5+)', fee: 'From ₦20,000/month', incl: 'Pick-up from school, supervised homework, snacks' },
    { prog: 'School Holiday Programme', fee: 'From ₦15,000/week', incl: 'Activity-based programme during school holidays' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Programmes & Fees — ${name}</title>${css()}</head>
<body>
<header class="cr-header">
  <div class="cr-logo">${name}</div>
  <nav class="cr-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Programmes</a><a href="/contact">Visit Us</a></nav>
</header>
<section class="cr-section">
  <h2>Programmes & Fees</h2>
  <div class="cr-programmes" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
    ${fees.map(f => `
    <div class="cr-programme">
      <h3>${f.prog}</h3>
      <div class="fee">${f.fee}</div>
      <p style="font-size:.88rem;color:#666;margin-bottom:14px">Includes: ${f.incl}</p>
      ${phone ? `<a href="${waLink}" style="display:block;background:#25d366;color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center" target="_blank" rel="noopener">Enroll Now</a>` : ''}
    </div>`).join('')}
  </div>
  <p style="text-align:center;margin-top:28px;color:#888;font-size:.9rem">Fees are monthly. Sibling discounts available. WhatsApp us for the full fee schedule and enrolment forms.</p>
</section>
<footer class="cr-footer"><p>&copy; ${new Date().getFullYear()} ${name}.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Day Care Centre';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Fri: 7am–6pm | Sat: 8am–2pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20visit%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Visit Us — ${name}</title>${css()}</head>
<body>
<header class="cr-header">
  <div class="cr-logo">${name}</div>
  <nav class="cr-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Programmes</a><a href="/contact">Visit Us</a></nav>
</header>
<section class="cr-section" style="max-width:640px">
  <h2>Book a Nursery Visit</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f8f0ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Visit & Enrolment)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f8f0ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Centre Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#f8f0ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Hours</p><p style="font-weight:700">${hours}</p></div>
    <div style="background:#f8f0ff;border-radius:12px;padding:16px"><p style="font-size:.9rem;color:#6a0572"><strong>Free nursery visit:</strong> Visit us with your child to see our facilities and meet our team — no obligation to enroll.</p></div>
  </div>
  ${phone ? `<a class="cr-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Book Visit on WhatsApp</a>` : ''}
</section>
<footer class="cr-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const crecheEarlyChildhoodTemplate: WebsiteTemplateContract = {
  slug: 'creche-early-childhood',
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
