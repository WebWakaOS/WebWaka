/**
 * Container Depot / Logistics Hub Site — Pillar 3 Website Template
 * Niche ID: P3-container-depot-container-depot-hub
 * Vertical: container-depot (priority=3, high)
 * Category: transport/logistics
 * Family: NF-TRP-PORT (standalone)
 * Research brief: docs/templates/research/container-depot-container-depot-hub-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NPA, NIMASA, Nigeria Customs, SON, CAC, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need container depot or logistics services.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.cdp-hero{text-align:center;padding:3rem 0 2.25rem}
.cdp-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.cdp-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.cdp-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.cdp-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.cdp-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.cdp-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.cdp-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.cdp-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.cdp-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.cdp-section{margin-top:2.75rem}
.cdp-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.cdp-services-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.cdp-svc-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.cdp-svc-icon{font-size:1.75rem;margin-bottom:.5rem}
.cdp-svc-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.cdp-svc-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.5}
.cdp-stats-row{display:flex;flex-wrap:wrap;gap:1rem;margin-top:.5rem}
.cdp-stat{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1rem 1.5rem;background:var(--ww-surface);text-align:center;flex:1 1 120px}
.cdp-stat-num{font-size:1.75rem;font-weight:900;color:var(--ww-primary)}
.cdp-stat-label{font-size:.8rem;color:var(--ww-text-muted)}
.cdp-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.cdp-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.cdp-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.cdp-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
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
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="cdp-logo">` : '';
  return `<section class="cdp-hero">
    ${logoHtml}
    <div class="cdp-badge">🚢 NPA Licensed · Apapa ICD · Tin Can</div>
    <h1>${esc(name)}</h1>
    <p class="cdp-tagline">${esc(tagline ?? 'Licensed container depot & ICD operator — Apapa, Tin Can, and inland haulage across Nigeria.')}</p>
    <div class="cdp-ctas">
      ${wa ? `<a href="${wa}" class="cdp-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="cdp-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildServices(ctx: WebsiteRenderContext): string {
  const services = (((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).length > 0) ? ((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).slice(0,6) : [
    {name:'Container Storage',description:'ISO-certified yard with 24/7 security, reefer plug points, and CCTV monitoring at Apapa ICD.'},
    {name:'Port Evacuation',description:'Fast-track container evacuation from Apapa and Tin Can, avoiding demurrage. 24–48hr turnaround.'},
    {name:'Customs Clearing',description:'SON PVOC/SONCAP coordination, Form M processing, and NCS duty assessment support.'},
    {name:'Inland Haulage',description:'ECOWAS corridor haulage — Lagos to Kano, Abuja, Onitsha, Aba, and Port Harcourt.'},
    {name:'Container Leasing',description:'20ft and 40ft container leasing — dry, reefer, and flat-rack for project cargo.'},
    {name:'Stuffing & Stripping',description:'On-site container stuffing, stripping, and cargo consolidation (LCL/FCL).'},
  ];
  const cards = services.map((s: Record<string,unknown>) => `
    <div class="cdp-svc-card">
      <div class="cdp-svc-icon">📦</div>
      <div class="cdp-svc-name">${esc(String(s.name ?? ''))}</div>
      <div class="cdp-svc-desc">${esc(String(s.description ?? ''))}</div>
    </div>`).join('');
  return `<section class="cdp-section">
    <h2 class="cdp-section-title">Our Services</h2>
    <div class="cdp-services-grid">${cards}</div>
  </section>`;
}

function buildStats(ctx: WebsiteRenderContext): string {
  const stats = (ctx as unknown as Record<string,unknown>)['stats'] as {num:string;label:string}[] | undefined;
  const list = stats && stats.length > 0 ? stats : [
    {num:'5,000+',label:'TEUs handled/month'},
    {num:'48hr',label:'Average evacuation time'},
    {num:'12+',label:'Years in operation'},
    {num:'200+',label:'Haulage destinations'},
  ];
  const items = list.map((s: Record<string,unknown>) => `
    <div class="cdp-stat">
      <div class="cdp-stat-num">${esc(String(s.num ?? ''))}</div>
      <div class="cdp-stat-label">${esc(String(s.label ?? ''))}</div>
    </div>`).join('');
  return `<section class="cdp-section">
    <h2 class="cdp-section-title">Operations at a Glance</h2>
    <div class="cdp-stats-row">${items}</div>
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
    phone ? `<div class="cdp-contact-row"><span class="cdp-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="cdp-contact-row"><span class="cdp-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="cdp-contact-row"><span class="cdp-contact-label">Depot</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="cdp-contact-row"><span class="cdp-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat on WhatsApp</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="cdp-section">
    <h2 class="cdp-section-title">Contact & Enquiries</h2>
    <div class="cdp-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="cdp-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; NPA-Licensed Container Depot, Nigeria.<br>
    Nigeria Customs Compliant &bull; NIMASA Registered &bull; CAC Incorporated &bull; NDPR Compliant
  </footer>`;
}

export const containerDepotContainerDepotHubTemplate: WebsiteTemplateContract = {
  slug: 'container-depot-container-depot-hub',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildServices(ctx), buildStats(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
