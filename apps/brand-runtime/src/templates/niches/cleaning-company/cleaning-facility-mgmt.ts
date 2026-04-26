/**
 * Cleaning & Facility Management Company Site — Pillar 3 Website Template
 * Niche ID: P3-cleaning-company-cleaning-facility-mgmt
 * Vertical: cleaning-company (priority=3, high)
 * Category: commerce/services
 * Family: NF-COM-SVC (standalone)
 * Research brief: docs/templates/research/cleaning-company-cleaning-facility-mgmt-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NAFDAC (disinfectants), LASEPA, ISO 9001, CAC, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need cleaning and facility management services.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.ccm-hero{text-align:center;padding:3rem 0 2.25rem}
.ccm-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.ccm-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.ccm-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.ccm-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.ccm-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ccm-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ccm-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ccm-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.ccm-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ccm-section{margin-top:2.75rem}
.ccm-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ccm-services-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.ccm-svc-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.ccm-svc-icon{font-size:1.75rem;margin-bottom:.5rem}
.ccm-svc-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.ccm-svc-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.ccm-clients-row{display:flex;flex-wrap:wrap;gap:.6rem}
.ccm-client-chip{padding:.35rem .85rem;border-radius:999px;font-size:.8rem;font-weight:600;background:var(--ww-surface);border:1px solid var(--ww-border)}
.ccm-cert-row{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.5rem}
.ccm-cert-chip{padding:.3rem .8rem;border-radius:999px;font-size:.8rem;font-weight:600;background:var(--ww-primary);color:#fff;opacity:.85}
.ccm-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.ccm-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.ccm-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.ccm-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
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
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="ccm-logo">` : '';
  return `<section class="ccm-hero">
    ${logoHtml}
    <div class="ccm-badge">🧹 ISO Aligned · NAFDAC-Approved Products</div>
    <h1>${esc(name)}</h1>
    <p class="ccm-tagline">${esc(tagline ?? 'Professional cleaning & facility management — hospitals, corporate offices, estates & warehouses across Nigeria.')}</p>
    <div class="ccm-ctas">
      ${wa ? `<a href="${wa}" class="ccm-wa-btn" target="_blank" rel="noopener">${waSvg()} Get a Quote</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="ccm-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildServices(ctx: WebsiteRenderContext): string {
  const services = (((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).length > 0) ? ((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).slice(0,6) : [
    {name:'Hospital & Healthcare Cleaning',description:'Infection control protocols, biohazard disposal, and NAFDAC-approved disinfectants for clinical environments.'},
    {name:'Corporate Office Cleaning',description:'Daily/weekly office cleaning, window cleaning, and waste management for Lagos and Abuja commercial buildings.'},
    {name:'Industrial & Warehouse Cleaning',description:'Factory floor cleaning, machinery degreasing, and large-scale sanitation for industrial sites.'},
    {name:'Estate & Residential Cleaning',description:'Serviced apartment turnover, post-construction cleaning, and recurring residential housekeeping.'},
    {name:'Facility Management',description:'Full FM outsourcing — cleaning, pest control, fumigation, minor maintenance, and electrical/plumbing coordination.'},
    {name:'Post-Event & Deep Cleaning',description:'Post-event venue restoration, event hall turn-arounds, and deep-sanitisation for hospitality venues.'},
  ];
  const cards = services.map((s: Record<string,unknown>) => `
    <div class="ccm-svc-card">
      <div class="ccm-svc-icon">🧹</div>
      <div class="ccm-svc-name">${esc(String(s.name ?? ''))}</div>
      <div class="ccm-svc-desc">${esc(String(s.description ?? ''))}</div>
    </div>`).join('');
  return `<section class="ccm-section">
    <h2 class="ccm-section-title">Our Services</h2>
    <div class="ccm-services-grid">${cards}</div>
  </section>`;
}

function buildClientSectors(ctx: WebsiteRenderContext): string {
  const sectors = (ctx as unknown as Record<string,unknown>)['clientSectors'] as string[] | undefined;
  const list = sectors && sectors.length > 0 ? sectors : ['Hospitals & Clinics','Banks & Fintech Offices','Hotels & Hospitality','Industrial Plants','Schools & Universities','Government Buildings','Shopping Malls','Residential Estates'];
  const chips = list.map((s: string) => `<span class="ccm-client-chip">${esc(s)}</span>`).join('');
  return `<section class="ccm-section">
    <h2 class="ccm-section-title">Industries We Serve</h2>
    <div class="ccm-clients-row">${chips}</div>
  </section>`;
}

function buildCerts(ctx: WebsiteRenderContext): string {
  const certs = ((ctx.data as Record<string,unknown>) as Record<string,unknown>)['certifications'] as string[] | undefined;
  const list = certs && certs.length > 0 ? certs : ['CAC Registered','NAFDAC Products','ISO 9001 Aligned','LASEPA Compliant','NDPR Compliant','Bonded & Insured'];
  const chips = list.map(c => `<span class="ccm-cert-chip">${esc(c)}</span>`).join('');
  return `<section class="ccm-section">
    <h2 class="ccm-section-title">Our Credentials</h2>
    <div class="ccm-cert-row">${chips}</div>
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
    phone ? `<div class="ccm-contact-row"><span class="ccm-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="ccm-contact-row"><span class="ccm-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="ccm-contact-row"><span class="ccm-contact-label">Office</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="ccm-contact-row"><span class="ccm-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Request a Quote</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="ccm-section">
    <h2 class="ccm-section-title">Contact Us</h2>
    <div class="ccm-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="ccm-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Cleaning & Facility Management, Nigeria.<br>
    CAC Registered &bull; NAFDAC-Approved Products &bull; LASEPA Compliant &bull; NDPR Compliant
  </footer>`;
}

export const cleaningCompanyCleaningFacilityMgmtTemplate: WebsiteTemplateContract = {
  slug: 'cleaning-company-cleaning-facility-mgmt',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildServices(ctx), buildClientSectors(ctx), buildCerts(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
