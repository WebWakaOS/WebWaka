/**
 * Constituency Development Office Portal — Pillar 3 Website Template
 * Niche ID: P3-constituency-office-constituency-dev-portal
 * Vertical: constituency-office (priority=3, high)
 * Category: politics
 * Family: NF-POL-CON (standalone)
 * Research brief: docs/templates/research/constituency-office-constituency-dev-portal-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NASS CDF Act, INEC, CAC, FOIA, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I have a matter I would like to bring to my representative\'s attention.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.cdo-hero{text-align:center;padding:3rem 0 2.25rem}
.cdo-logo{height:80px;width:80px;object-fit:cover;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.cdo-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.cdo-hero h1{font-size:clamp(1.75rem,4.5vw,2.625rem);font-weight:800;line-height:1.2;margin-bottom:.25rem}
.cdo-subtitle{font-size:1rem;color:var(--ww-text-muted);margin-bottom:.75rem;font-weight:600}
.cdo-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.65}
.cdo-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.cdo-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.cdo-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.cdo-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.cdo-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.cdo-section{margin-top:2.75rem}
.cdo-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.cdo-projects-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.cdo-proj-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.cdo-proj-icon{font-size:1.5rem;margin-bottom:.5rem}
.cdo-proj-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.cdo-proj-status{font-size:.8rem;font-weight:600;padding:.2rem .6rem;border-radius:999px;display:inline-block;margin-bottom:.5rem}
.cdo-proj-status.ongoing{background:#fef3c7;color:#92400e}
.cdo-proj-status.completed{background:#d1fae5;color:#065f46}
.cdo-proj-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.cdo-cdf-box{border:2px solid var(--ww-primary);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface)}
.cdo-cdf-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid var(--ww-border);font-size:.9rem;flex-wrap:wrap;gap:.5rem}
.cdo-cdf-row:last-child{border-bottom:none}
.cdo-cdf-label{font-weight:600}
.cdo-cdf-val{font-weight:700;color:var(--ww-primary)}
.cdo-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.cdo-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.cdo-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
.cdo-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const rep = (ctx as unknown as Record<string,unknown>)['rep'] as {name?:string;constituency?:string;chamber?:string} | undefined;
  const wa = whatsappLink(whatsapp ?? phone);
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="Rep photo" class="cdo-logo">` : '';
  return `<section class="cdo-hero">
    ${logoHtml}
    <div class="cdo-badge">🏛️ CDF Transparency · Constituency Service</div>
    <h1>${esc(rep?.name ?? name)}</h1>
    <p class="cdo-subtitle">${esc(rep?.chamber ?? 'House of Representatives')} Member — ${esc(String(rep?.constituency ?? (ctx.data as Record<string,unknown>).address ?? 'Federal Constituency'))}</p>
    <p class="cdo-tagline">${esc(tagline ?? 'Serving constituents with transparent CDF reporting, development projects, and direct access to your representative.')}</p>
    <div class="cdo-ctas">
      ${wa ? `<a href="${wa}" class="cdo-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp Your Rep</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="cdo-primary-btn">📞 Office Line</a>` : ''}
    </div>
  </section>`;
}

function buildProjects(ctx: WebsiteRenderContext): string {
  const projects = (ctx as unknown as Record<string,unknown>)['projects'] as {name:string;status:string;description:string}[] | undefined;
  const list = projects && projects.length > 0 ? projects : [
    {name:'Road Rehabilitation',status:'ongoing',description:'2.5km road reconstruction — Ifako Inner Road to Estate Junction. CDF-funded.'},
    {name:'Borehole & Water Supply',status:'completed',description:'3 solar-powered boreholes installed in underserved wards. 1,200 beneficiaries.'},
    {name:'Secondary School Renovation',status:'ongoing',description:'Classroom block renovation, desks supply, and library restocking at Government College.'},
    {name:'Youth Empowerment Training',status:'completed',description:'Skills acquisition — tailoring, ICT, and welding for 150 youths in the constituency.'},
    {name:'Scholarship Programme',status:'ongoing',description:'Annual constituency scholarship — 40 students at federal universities sponsored.'},
    {name:'Healthcare Outreach',status:'completed',description:'Free medical check, BP/glucose screening, and drug distribution to 800 residents.'},
  ];
  const cards = list.slice(0,6).map(p => `
    <div class="cdo-proj-card">
      <div class="cdo-proj-icon">🏗️</div>
      <div class="cdo-proj-name">${esc(p.name)}</div>
      <span class="cdo-proj-status ${esc(p.status)}">${p.status==='ongoing'?'🔄 Ongoing':'✅ Completed'}</span>
      <div class="cdo-proj-desc">${esc(p.description)}</div>
    </div>`).join('');
  return `<section class="cdo-section">
    <h2 class="cdo-section-title">Constituency Projects</h2>
    <div class="cdo-projects-grid">${cards}</div>
  </section>`;
}

function buildCDF(ctx: WebsiteRenderContext): string {
  const cdf = (ctx as unknown as Record<string,unknown>)['cdfReport'] as Record<string,string> | undefined;
  const data = cdf ?? {
    'Total CDF Allocation':'₦100,000,000',
    'Disbursed to Date':'₦68,000,000',
    'Projects Completed':'12',
    'Projects Ongoing':'4',
    'Beneficiaries Reached':'8,500+',
    'Audit Status':'2024 Audit Report Published',
  };
  const rows = Object.entries(data).map(([k,v]) => `
    <div class="cdo-cdf-row">
      <span class="cdo-cdf-label">${esc(k)}</span>
      <span class="cdo-cdf-val">${esc(String(v))}</span>
    </div>`).join('');
  return `<section class="cdo-section">
    <h2 class="cdo-section-title">CDF Transparency Report</h2>
    <p style="font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.75rem">In compliance with the Constituency Development Fund Act and FOIA, we publish our CDF utilisation quarterly.</p>
    <div class="cdo-cdf-box">${rows}</div>
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
    phone ? `<div class="cdo-contact-row"><span class="cdo-contact-label">Office Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="cdo-contact-row"><span class="cdo-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="cdo-contact-row"><span class="cdo-contact-label">Office</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="cdo-contact-row"><span class="cdo-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Send a Message</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="cdo-section">
    <h2 class="cdo-section-title">Constituency Office</h2>
    <div class="cdo-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="cdo-footer">
    &copy; ${new Date().getFullYear()} Office of ${esc(ctx.displayName)} &mdash; Constituency Development Portal, Nigeria.<br>
    CDF Act Compliant &bull; FOIA Compliant &bull; INEC Registered &bull; NDPR Compliant
  </footer>`;
}

export const constituencyOfficeConstituencyDevPortalTemplate: WebsiteTemplateContract = {
  slug: 'constituency-office-constituency-dev-portal',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildProjects(ctx), buildCDF(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
