/**
 * Government Agency / Parastatal Portal — Pillar 3 Website Template
 * Niche ID: P3-government-agency-govt-agency-portal
 * Vertical: government-agency (priority=3, high)
 * Category: institutional
 * Family: NF-INS-GOV (standalone)
 * Research brief: docs/templates/research/government-agency-govt-agency-portal-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NITDA e-government framework, FOIA 2011, NDPR, SON, NIPOST, DG directives
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need information about agency services.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.gva-hero{text-align:center;padding:3rem 0 2.25rem}
.gva-logo{height:90px;width:90px;object-fit:contain;margin-bottom:1rem}
.gva-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.gva-hero h1{font-size:clamp(1.75rem,4.5vw,2.5rem);font-weight:800;line-height:1.2;margin-bottom:.25rem}
.gva-mandate{font-size:.9375rem;color:var(--ww-text-muted);max-width:42rem;margin:0 auto .75rem;line-height:1.7}
.gva-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.gva-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.gva-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.gva-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.gva-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.gva-section{margin-top:2.75rem}
.gva-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.gva-services-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.gva-svc-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.gva-svc-icon{font-size:1.5rem;margin-bottom:.5rem}
.gva-svc-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.gva-svc-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.gva-docs-list{display:flex;flex-direction:column;gap:.6rem}
.gva-doc-row{display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);background:var(--ww-surface);font-size:.9rem;flex-wrap:wrap;gap:.5rem}
.gva-doc-name{font-weight:600}
.gva-doc-link{color:var(--ww-primary);font-weight:600;text-decoration:none}
.gva-doc-link:hover{text-decoration:underline}
.gva-contact-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.gva-contact-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.gva-contact-label{font-weight:700;font-size:.9375rem;margin-bottom:.5rem;color:var(--ww-primary)}
.gva-contact-value{font-size:.9375rem}
.gva-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
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
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="gva-logo">` : '';
  return `<section class="gva-hero">
    ${logoHtml}
    <div class="gva-badge">🏛️ Federal / State Parastatal · NITDA e-Gov</div>
    <h1>${esc(name)}</h1>
    <p class="gva-mandate">${esc(tagline ?? 'Official information portal — services, publications, contact directories, and policy updates for the public.')}</p>
    <div class="gva-ctas">
      ${wa ? `<a href="${wa}" class="gva-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp Helpline</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="gva-primary-btn">📞 Call</a>` : ''}
    </div>
  </section>`;
}

function buildServices(ctx: WebsiteRenderContext): string {
  const services = (((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).length > 0) ? ((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).slice(0,6) : [
    {name:'Licences & Permits',description:'Application, renewal, and status tracking for all agency-issued licences and operating permits.'},
    {name:'Regulatory Compliance',description:'Industry compliance checks, audit scheduling, and enforcement notice management.'},
    {name:'Public Enquiries',description:'Citizens and businesses can submit enquiries, complaints, and FOIA requests online.'},
    {name:'Data & Statistics',description:'Official sector data, annual reports, and statistical publications for public and research use.'},
    {name:'Capacity Building',description:'Stakeholder training, workshop registration, and certification programmes.'},
    {name:'Tender & Procurement',description:'Published tenders, contractor pre-qualification, and award notifications in line with PPA 2007.'},
  ];
  const cards = services.map((s: Record<string,unknown>) => `
    <div class="gva-svc-card">
      <div class="gva-svc-icon">🏛️</div>
      <div class="gva-svc-name">${esc(String(s.name ?? ''))}</div>
      <div class="gva-svc-desc">${esc(String(s.description ?? ''))}</div>
    </div>`).join('');
  return `<section class="gva-section">
    <h2 class="gva-section-title">Services & Functions</h2>
    <div class="gva-services-grid">${cards}</div>
  </section>`;
}

function buildPublications(ctx: WebsiteRenderContext): string {
  const docs = (ctx as unknown as Record<string,unknown>)['publications'] as {name:string;url?:string}[] | undefined;
  const list = docs && docs.length > 0 ? docs : [
    {name:'Annual Report 2024'},
    {name:'Policy Framework 2025–2030'},
    {name:'Sector Data Report Q1 2026'},
    {name:'Stakeholder Engagement Guidelines'},
    {name:'FOIA Request Procedure'},
  ];
  const rows = list.slice(0,6).map(d => `
    <div class="gva-doc-row">
      <span class="gva-doc-name">📄 ${esc(d.name)}</span>
      ${d.url ? `<a href="${safeHref(d.url)}" class="gva-doc-link" target="_blank" rel="noopener">Download →</a>` : '<span style="font-size:.8rem;color:var(--ww-text-muted)">Contact for access</span>'}
    </div>`).join('');
  return `<section class="gva-section">
    <h2 class="gva-section-title">Publications & Reports</h2>
    <div class="gva-docs-list">${rows}</div>
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
  const contacts = [
    {label:'Phone',value:phone ? `<a href="tel:${esc(phone)}">${esc(phone)}</a>` : null},
    {label:'Email',value:email ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : null},
    {label:'Address',value:address ? esc(address) : null},
    {label:'WhatsApp',value:wa ? `<a href="${wa}" target="_blank" rel="noopener">Chat on WhatsApp</a>` : null},
  ].filter(c=>c.value!=null);
  const cards = contacts.map(c => `
    <div class="gva-contact-card">
      <div class="gva-contact-label">${esc(c.label)}</div>
      <div class="gva-contact-value">${c.value}</div>
    </div>`).join('');
  return `<section class="gva-section">
    <h2 class="gva-section-title">Contact Directory</h2>
    <div class="gva-contact-grid">${cards}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="gva-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Federal / State Government Agency, Nigeria.<br>
    NITDA e-Gov Framework &bull; FOIA 2011 Compliant &bull; NDPR Compliant
  </footer>`;
}

export const governmentAgencyGovtAgencyPortalTemplate: WebsiteTemplateContract = {
  slug: 'government-agency-govt-agency-portal',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildServices(ctx), buildPublications(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
