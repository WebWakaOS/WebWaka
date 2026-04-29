/**
 * Nursery / Crèche / Early Childhood Centre Site — Pillar 3 Website Template
 * Niche ID: P3-nursery-school-nursery-school-site
 * Vertical: nursery-school (priority=3, high)
 * Category: education
 * Family: NF-EDU-NRS (variant of private-school)
 * Research brief: docs/templates/research/nursery-school-nursery-school-site-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NERDC Early Childhood Care Development & Education (ECCDE),
 *   NASB crèche registration, LASG SUBEB (Lagos) or state education board, CAC, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about nursery school admission for my child.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.nrs-hero{text-align:center;padding:3rem 0 2.25rem}
.nrs-logo{height:80px;width:80px;object-fit:cover;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.nrs-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.nrs-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.nrs-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.nrs-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.nrs-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.nrs-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.nrs-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.nrs-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.nrs-section{margin-top:2.75rem}
.nrs-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.nrs-classes-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.nrs-class-card{border:2px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface);text-align:center}
.nrs-class-icon{font-size:2rem;margin-bottom:.5rem}
.nrs-class-name{font-weight:800;font-size:1rem;margin-bottom:.25rem}
.nrs-class-age{font-size:.8125rem;color:var(--ww-text-muted);margin-bottom:.5rem}
.nrs-class-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.nrs-features-grid{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.nrs-feature{display:flex;align-items:center;gap:.6rem;padding:.75rem 1rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);background:var(--ww-surface);font-size:.9rem}
.nrs-feature-icon{font-size:1.25rem}
.nrs-admission-box{border:2px solid var(--ww-primary);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface)}
.nrs-admission-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:.5rem;font-size:.9375rem}
.nrs-admission-item::before{content:'✅ ';font-size:.9rem}
.nrs-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.nrs-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.nrs-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.nrs-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I would like to enquire about nursery school admission for my child.');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="nrs-logo">` : '';
  return `<section class="nrs-hero">
    ${logoHtml}
    <div class="nrs-badge">🌟 NERDC ECCDE · NASB Registered</div>
    <h1>${esc(name)}</h1>
    <p class="nrs-tagline">${esc(tagline ?? 'A nurturing early childhood environment — crèche, nursery & pre-primary. Ages 3 months to 5 years. NERDC-aligned curriculum.')}</p>
    <div class="nrs-ctas">
      ${wa ? `<a href="${wa}" class="nrs-wa-btn" target="_blank" rel="noopener">${waSvg()} Enquire via WhatsApp</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="nrs-primary-btn">📞 Call the School</a>` : ''}
    </div>
  </section>`;
}

function buildClasses(ctx: WebsiteRenderContext): string {
  const classes = (ctx as unknown as Record<string,unknown>)['ageGroups'] as {name:string;age:string;icon:string;description:string}[] | undefined;
  const list = classes && classes.length > 0 ? classes : [
    {name:'Crèche',age:'3 months – 18 months',icon:'🍼',description:'Dedicated nursery room with qualified caregivers, feeding schedules, and sensory play.'},
    {name:'Toddlers',age:'18 months – 2.5 years',icon:'🧸',description:'Play-based learning, language development, socialisation, and toilet training.'},
    {name:'Nursery 1',age:'2.5 – 3.5 years',icon:'🎨',description:'NERDC pre-primary curriculum — phonics, numeracy, arts, and motor skills.'},
    {name:'Nursery 2',age:'3.5 – 5 years',icon:'📚',description:'School readiness — reading, writing, counting, Yoruba/Igbo/Hausa, and coding basics.'},
  ];
  const cards = list.slice(0,4).map(c => `
    <div class="nrs-class-card">
      <div class="nrs-class-icon">${esc(c.icon)}</div>
      <div class="nrs-class-name">${esc(c.name)}</div>
      <div class="nrs-class-age">${esc(c.age)}</div>
      <div class="nrs-class-desc">${esc(c.description)}</div>
    </div>`).join('');
  return `<section class="nrs-section">
    <h2 class="nrs-section-title">Classes & Age Groups</h2>
    <div class="nrs-classes-grid">${cards}</div>
  </section>`;
}

function buildFeatures(ctx: WebsiteRenderContext): string {
  const features = (ctx as unknown as Record<string,unknown>)['features'] as {name:string;icon:string}[] | undefined;
  const list = features && features.length > 0 ? features : [
    {name:'CCTV Parent Monitoring',icon:'📹'},{name:'Qualified ECCDE Teachers',icon:'👩‍🏫'},
    {name:'Air-Conditioned Classrooms',icon:'❄️'},{name:'Nutritious Meals & Snacks',icon:'🥗'},
    {name:'Outdoor Play Area',icon:'🛝'},{name:'School Bus Service',icon:'🚌'},
    {name:'Daily Parent WhatsApp Report',icon:'📱'},{name:'First Aid & Nurse on Site',icon:'🏥'},
  ];
  const items = list.slice(0,8).map(f => `
    <div class="nrs-feature">
      <span class="nrs-feature-icon">${esc(f.icon)}</span>
      <span>${esc(f.name)}</span>
    </div>`).join('');
  return `<section class="nrs-section">
    <h2 class="nrs-section-title">Our Facilities</h2>
    <div class="nrs-features-grid">${items}</div>
  </section>`;
}

function buildAdmission(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I would like to enquire about admission for my child. Can you send the requirements?');
  const requirements = (ctx as unknown as Record<string,unknown>)['admissionRequirements'] as string[] | undefined;
  const reqs = requirements && requirements.length > 0 ? requirements : [
    'Completed admission form (collect at school or WhatsApp us)',
    'Child\'s birth certificate / immunisation card',
    'Two passport photographs of child',
    'Parent / Guardian ID (NIN or Driver\'s licence)',
    'Medical history form (provided at interview)',
    'Payment of non-refundable registration fee',
  ];
  const items = reqs.map(r => `<li class="nrs-admission-item">${esc(r)}</li>`).join('');
  return `<section class="nrs-section">
    <h2 class="nrs-section-title">Admission Process</h2>
    <div class="nrs-admission-box">
      <ul class="nrs-admission-list">${items}</ul>
      <div style="margin-top:1rem;text-align:center">
        ${wa ? `<a href="${wa}" class="nrs-wa-btn" target="_blank" rel="noopener">${waSvg()} Start Admission via WhatsApp</a>` : ''}
      </div>
    </div>
  </section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone);
  const rows = [
    phone ? `<div class="nrs-contact-row"><span class="nrs-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="nrs-contact-row"><span class="nrs-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="nrs-contact-row"><span class="nrs-contact-label">School</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="nrs-contact-row"><span class="nrs-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat with Admin</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="nrs-section">
    <h2 class="nrs-section-title">Contact the School</h2>
    <div class="nrs-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="nrs-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Nursery School &amp; Crèche, Nigeria.<br>
    NERDC ECCDE Aligned &bull; NASB Registered &bull; State Education Board Approved &bull; NDPR Compliant
  </footer>`;
}

export const nurserySchoolNurserySchoolSiteTemplate: WebsiteTemplateContract = {
  slug: 'nursery-school-nursery-school-site',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildClasses(ctx), buildFeatures(ctx), buildAdmission(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
