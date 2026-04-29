/**
 * Artisanal Mining Operator Site — Pillar 3 Website Template
 * Niche ID: P3-artisanal-mining-artisanal-mining-ops
 * Vertical: artisanal-mining (priority=3, high)
 * Category: commerce/mining
 * Family: NF-COM-MIN (standalone)
 * Research brief: docs/templates/research/artisanal-mining-artisanal-mining-ops-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: MMSD, MCO licence, NUPRC, CAC, NEITI, SEC (gold exports)
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about your mining operations.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.amn-hero{text-align:center;padding:3rem 0 2.25rem}
.amn-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.amn-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.amn-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.amn-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.amn-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.amn-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.amn-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.amn-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.amn-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.amn-section{margin-top:2.75rem}
.amn-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.amn-minerals-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.amn-mineral-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface);text-align:center}
.amn-mineral-icon{font-size:2rem;margin-bottom:.5rem}
.amn-mineral-name{font-weight:700;font-size:1rem;margin-bottom:.25rem}
.amn-mineral-loc{font-size:.8125rem;color:var(--ww-text-muted)}
.amn-licence-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.amn-licence-row{display:flex;gap:.75rem;align-items:flex-start;padding:.5rem 0;border-bottom:1px solid var(--ww-border);font-size:.9rem}
.amn-licence-row:last-child{border-bottom:none}
.amn-licence-label{font-weight:600;color:var(--ww-primary);min-width:130px}
.amn-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.amn-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.amn-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.amn-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
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
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="amn-logo">` : '';
  return `<section class="amn-hero">
    ${logoHtml}
    <div class="amn-badge">⛏️ MCO Licensed · MMSD Registered</div>
    <h1>${esc(name)}</h1>
    <p class="amn-tagline">${esc(tagline ?? 'Licensed artisanal & small-scale mining operator — gold, tin, tantalite & gemstones. Zamfara · Plateau · Ekiti.')}</p>
    <div class="amn-ctas">
      ${wa ? `<a href="${wa}" class="amn-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="amn-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildMinerals(ctx: WebsiteRenderContext): string {
  const minerals = (ctx as unknown as Record<string,unknown>)['minerals'] as {name:string;location:string;icon:string}[] | undefined;
  const list = minerals && minerals.length > 0 ? minerals : [
    {name:'Gold',location:'Zamfara / Osun',icon:'🪙'},
    {name:'Tin / Columbite',location:'Jos Plateau',icon:'🔩'},
    {name:'Tantalite',location:'Kwara / Ekiti',icon:'💎'},
    {name:'Gemstones',location:'Nasarawa / Oyo',icon:'💠'},
    {name:'Limestone',location:'Cross River',icon:'🪨'},
    {name:'Kaolin',location:'Plateau / Ekiti',icon:'🏔️'},
  ];
  const cards = list.slice(0,6).map(m => `
    <div class="amn-mineral-card">
      <div class="amn-mineral-icon">${esc(m.icon)}</div>
      <div class="amn-mineral-name">${esc(m.name)}</div>
      <div class="amn-mineral-loc">📍 ${esc(m.location)}</div>
    </div>`).join('');
  return `<section class="amn-section">
    <h2 class="amn-section-title">Minerals We Operate</h2>
    <div class="amn-minerals-grid">${cards}</div>
  </section>`;
}

function buildLicence(ctx: WebsiteRenderContext): string {
  const lic = (ctx as unknown as Record<string,unknown>)['licenceInfo'] as Record<string,string> | undefined;
  const info = lic ?? {mcoNumber:'MCO-2024-ZF-00XXX',state:'Zamfara',commodity:'Gold',expiryDate:'Dec 2026',neiti:'NEITI Compliant'};
  const rows = Object.entries(info).map(([k,v]) => `
    <div class="amn-licence-row">
      <span class="amn-licence-label">${esc(k.replace(/([A-Z])/g,' $1').trim())}</span>
      <span>${esc(String(v))}</span>
    </div>`).join('');
  return `<section class="amn-section">
    <h2 class="amn-section-title">Licence & Compliance</h2>
    <p style="font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.75rem">All operations are conducted under a valid Mining Cadastre Office (MCO) licence issued by the Federal Ministry of Mines and Steel Development. We comply with NEITI reporting and SEC gold-export regulations.</p>
    <div class="amn-licence-box">${rows}</div>
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
    phone ? `<div class="amn-contact-row"><span class="amn-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="amn-contact-row"><span class="amn-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="amn-contact-row"><span class="amn-contact-label">Office</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="amn-contact-row"><span class="amn-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat on WhatsApp</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="amn-section">
    <h2 class="amn-section-title">Contact & Partnership</h2>
    <div class="amn-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="amn-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; MCO-Licensed Artisanal Mining, Nigeria.<br>
    MMSD Registered &bull; NEITI Compliant &bull; CAC Incorporated &bull; NDPR Compliant
  </footer>`;
}

export const artisanalMiningArtisanalMiningOpsTemplate: WebsiteTemplateContract = {
  slug: 'artisanal-mining-artisanal-mining-ops',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildMinerals(ctx), buildLicence(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
