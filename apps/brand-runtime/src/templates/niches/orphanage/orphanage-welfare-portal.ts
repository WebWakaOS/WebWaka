/**
 * Orphanage / Child Welfare NGO Portal — Pillar 3 Website Template
 * Niche ID: P3-orphanage-orphanage-welfare-portal
 * Vertical: orphanage (priority=3, critical)
 * Category: civic/welfare
 * Family: NF-CIV-WLF (standalone)
 * Research brief: docs/templates/research/orphanage-orphanage-welfare-portal-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: FMWSD, National Agency for Prohibition of Trafficking, UNICEF Nigeria partner,
 *   CAC (Corporate Affairs Commission, NGO-type), NDPR, state-level social welfare registration
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to support or partner with your orphanage.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.oph-hero{text-align:center;padding:3rem 0 2.25rem}
.oph-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.oph-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:600;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.oph-hero h1{font-size:clamp(1.75rem,4.5vw,2.625rem);font-weight:800;line-height:1.2;margin-bottom:.5rem}
.oph-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.7}
.oph-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.oph-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.oph-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.oph-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.oph-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.oph-section{margin-top:2.75rem}
.oph-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.oph-programs-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.oph-prog-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.oph-prog-icon{font-size:1.75rem;margin-bottom:.5rem}
.oph-prog-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.oph-prog-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.oph-support-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.oph-support-card{border:2px solid var(--ww-primary);border-radius:var(--ww-radius);padding:1.25rem;text-align:center;background:var(--ww-surface)}
.oph-support-icon{font-size:2rem;margin-bottom:.5rem}
.oph-support-title{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.oph-support-desc{font-size:.8125rem;color:var(--ww-text-muted)}
.oph-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.oph-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.oph-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
.oph-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone);
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="oph-logo">` : '';
  return `<section class="oph-hero">
    ${logoHtml}
    <div class="oph-badge">🤝 FMWSD Registered · CAC-Certified NGO</div>
    <h1>${esc(name)}</h1>
    <p class="oph-tagline">${esc(tagline ?? 'Providing shelter, education, healthcare and love to vulnerable children in Nigeria. Every child deserves a future.')}</p>
    <div class="oph-ctas">
      ${wa ? `<a href="${wa}" class="oph-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp Us</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="oph-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildPrograms(ctx: WebsiteRenderContext): string {
  const programs = (((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).length > 0) ? ((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).slice(0,6) : [
    {name:'Shelter & Nutrition',description:'Safe residential care, three daily meals, clean water, and sanitation for resident children.'},
    {name:'Primary & Secondary Education',description:'School fees, uniforms, books, and tutoring for all children to reach their academic potential.'},
    {name:'Healthcare & Immunisation',description:'Regular medical check-ups, NHIS partnership, immunisation drives, and mental health support.'},
    {name:'Skills & Vocational Training',description:'ICT, tailoring, baking, and artisan training for older children transitioning to independence.'},
    {name:'Legal & Social Support',description:'Birth certificate registration, NIN enrolment, and family reintegration counselling.'},
    {name:'Volunteer Programme',description:'Structured volunteering — teaching, mentoring, medical outreach, and corporate CSR visits.'},
  ];
  const cards = programs.map(p => `
    <div class="oph-prog-card">
      <div class="oph-prog-icon">🤲</div>
      <div class="oph-prog-name">${esc(p.name)}</div>
      <div class="oph-prog-desc">${esc(p.description ?? '')}</div>
    </div>`).join('');
  return `<section class="oph-section">
    <h2 class="oph-section-title">Our Programmes</h2>
    <div class="oph-programs-grid">${cards}</div>
  </section>`;
}

function buildSupport(): string {
  const ways = [
    {icon:'💰',title:'Monetary Donation',desc:'Bank transfer or Paystack. Monthly donors receive annual impact reports.'},
    {icon:'🛍️',title:'Item Donations',desc:'Food, clothing, stationery, medical supplies — coordinate drop-off via WhatsApp.'},
    {icon:'🏢',title:'Corporate CSR',desc:'Partner with us for CSR visits, sponsorship, and Payroll Giving schemes.'},
    {icon:'🙋',title:'Volunteer',desc:'Teaching, medical, legal, and trade skills — one-time or recurring visits welcome.'},
  ];
  const cards = ways.map(w => `
    <div class="oph-support-card">
      <div class="oph-support-icon">${esc(w.icon)}</div>
      <div class="oph-support-title">${esc(w.title)}</div>
      <div class="oph-support-desc">${esc(w.desc)}</div>
    </div>`).join('');
  return `<section class="oph-section">
    <h2 class="oph-section-title">How to Support Us</h2>
    <div class="oph-support-grid">${cards}</div>
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
    phone ? `<div class="oph-contact-row"><span class="oph-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="oph-contact-row"><span class="oph-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="oph-contact-row"><span class="oph-contact-label">Address</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="oph-contact-row"><span class="oph-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat & Donate</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="oph-section">
    <h2 class="oph-section-title">Contact Us</h2>
    <div class="oph-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="oph-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Registered Orphanage & Child Welfare NGO, Nigeria.<br>
    FMWSD Registered &bull; CAC NGO &bull; UNICEF Partner Network &bull; NDPR Compliant
  </footer>`;
}

export const orphanageOrphanageWelfarePortalTemplate: WebsiteTemplateContract = {
  slug: 'orphanage-orphanage-welfare-portal',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildPrograms(ctx), buildSupport(), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
