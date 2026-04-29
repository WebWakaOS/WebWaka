/**
 * Oil & Gas Service Provider Site — Pillar 3 Website Template
 * Niche ID: P3-oil-gas-services-oil-gas-service-provider
 * Vertical: oil-gas-services (priority=3, high)
 * Category: commerce/energy
 * Family: NF-COM-ENE (standalone)
 * Research brief: docs/templates/research/oil-gas-services-oil-gas-service-provider-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NUPRC, NOGIC, DPR legacy, NIMASA, CAC, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need oil & gas services. Can you assist?')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.ogs-hero{text-align:center;padding:3rem 0 2.25rem}
.ogs-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.ogs-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.ogs-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.ogs-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.ogs-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ogs-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ogs-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ogs-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.ogs-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ogs-section{margin-top:2.75rem}
.ogs-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ogs-services-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.ogs-svc-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.ogs-svc-icon{font-size:1.75rem;margin-bottom:.5rem}
.ogs-svc-name{font-weight:700;font-size:1rem;margin-bottom:.25rem}
.ogs-svc-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.5}
.ogs-cert-row{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.75rem}
.ogs-cert-chip{padding:.3rem .8rem;border-radius:999px;font-size:.8rem;font-weight:600;background:var(--ww-primary);color:#fff;opacity:.85}
.ogs-clients-grid{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.ogs-client-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1rem;text-align:center;background:var(--ww-surface)}
.ogs-client-name{font-weight:600;font-size:.9375rem;margin-bottom:.25rem}
.ogs-client-scope{font-size:.8125rem;color:var(--ww-text-muted)}
.ogs-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.ogs-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.ogs-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.ogs-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need oil & gas services. Can you assist?');
  const logoHtml = logoUrl
    ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="ogs-logo">`
    : '';
  return `<section class="ogs-hero">
    ${logoHtml}
    <div class="ogs-badge">⚙️ NUPRC-Aware · CAC Registered</div>
    <h1>${esc(name)}</h1>
    <p class="ogs-tagline">${esc(tagline ?? 'Oilfield services, well engineering & facility management — Nigeria upstream and midstream.')}</p>
    <div class="ogs-ctas">
      ${wa ? `<a href="${wa}" class="ogs-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="ogs-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildServices(ctx: WebsiteRenderContext): string {
  const services = (((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).length > 0) ? ((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).slice(0,8) : [
    {name:'Well Engineering & Drilling',description:'NUPRC-compliant well planning, directional drilling, and completion services across the Niger Delta.'},
    {name:'Pipeline & Facility Mgmt',description:'Pipeline integrity surveys, cathodic protection, and facility integrity management.'},
    {name:'Wireline & Logging',description:'Formation evaluation, cased-hole logging, and perforating across conventional assets.'},
    {name:'HSE Consulting',description:'DPR/NUPRC HSE audits, emergency response planning, SPDC and IOC contractor certification.'},
    {name:'Procurement & Logistics',description:'In-country value (ICV) procurement, Apapa port clearing, and upstream logistics coordination.'},
    {name:'Mechanical & Instrumentation',description:'Process equipment maintenance, I&E services, SCADA integration for wellhead and flow stations.'},
  ];
  const cards = services.map((s: Record<string,unknown>) => `
    <div class="ogs-svc-card">
      <div class="ogs-svc-icon">⚙️</div>
      <div class="ogs-svc-name">${esc(String(s.name ?? ''))}</div>
      <div class="ogs-svc-desc">${esc(String(s.description ?? ''))}</div>
    </div>`).join('');
  return `<section class="ogs-section">
    <h2 class="ogs-section-title">Our Services</h2>
    <div class="ogs-services-grid">${cards}</div>
  </section>`;
}

function buildCertifications(ctx: WebsiteRenderContext): string {
  const certs = ((ctx.data as Record<string,unknown>) as Record<string,unknown>)['certifications'] as string[] | undefined;
  const list = certs && certs.length > 0 ? certs : ['NUPRC Registered','NOGIC JQS Listed','CAC Incorporated','ISO 9001','HSSEQ Certified','NAPIMS Compliant'];
  const chips = list.map(c => `<span class="ogs-cert-chip">${esc(c)}</span>`).join('');
  return `<section class="ogs-section">
    <h2 class="ogs-section-title">Certifications & Compliance</h2>
    <p style="font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.5rem">NUPRC, NOGIC, and NAPIMS registrations ensure we meet Nigerian upstream requirements. Our HSSEQ management system aligns with ISO 14001 and OHSAS 18001.</p>
    <div class="ogs-cert-row">${chips}</div>
  </section>`;
}

function buildClients(ctx: WebsiteRenderContext): string {
  const clients = (ctx as unknown as Record<string,unknown>)['clients'] as {name:string;scope:string}[] | undefined;
  const list = clients && clients.length > 0 ? clients : [
    {name:'SEPLAT Energy',scope:'Well integrity & wireline'},
    {name:'Eroton E&P',scope:'Facility management'},
    {name:'First E&P',scope:'HSE consulting'},
    {name:'MIDL Energia',scope:'Pipeline services'},
  ];
  const cards = list.slice(0,6).map(c => `
    <div class="ogs-client-card">
      <div class="ogs-client-name">${esc(c.name)}</div>
      <div class="ogs-client-scope">${esc(c.scope)}</div>
    </div>`).join('');
  return `<section class="ogs-section">
    <h2 class="ogs-section-title">Key Clients & Projects</h2>
    <div class="ogs-clients-grid">${cards}</div>
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
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need oil & gas services. Can you assist?');
  const rows = [
    phone ? `<div class="ogs-contact-row"><span class="ogs-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="ogs-contact-row"><span class="ogs-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="ogs-contact-row"><span class="ogs-contact-label">Office</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="ogs-contact-row"><span class="ogs-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat on WhatsApp</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="ogs-section">
    <h2 class="ogs-section-title">Contact Us</h2>
    <div class="ogs-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  return `<footer class="ogs-footer">
    &copy; ${new Date().getFullYear()} ${esc(name)} &mdash; NUPRC-registered oil &amp; gas services provider, Nigeria.<br>
    CAC Registered &bull; NDPR Compliant &bull; NOGIC JQS Listed
  </footer>`;
}

export const oilGasServicesOilGasServiceProviderTemplate: WebsiteTemplateContract = {
  slug: 'oil-gas-services-oil-gas-service-provider',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [
      CSS,
      buildHero(ctx),
      buildServices(ctx),
      buildCertifications(ctx),
      buildClients(ctx),
      buildContact(ctx),
      buildFooter(ctx),
    ].join('\n');
  },
};
