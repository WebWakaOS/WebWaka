/**
 * Burial / Funeral Home Site — Pillar 3 Website Template
 * Niche ID: P3-funeral-home-funeral-home-site
 * Vertical: funeral-home (priority=3, high)
 * Category: professional/memorial
 * Family: NF-PRO-MEM (standalone)
 * Research brief: docs/templates/research/funeral-home-funeral-home-site-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: MDCN (embalming), CAC, NAFDAC (chemicals), Janazah Islamic compliance, Lagos State LSMW, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need funeral and burial arrangements. Please help.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.fnh-hero{text-align:center;padding:3rem 0 2.25rem}
.fnh-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.fnh-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:600;background:var(--ww-primary);color:#fff;margin-bottom:.875rem;opacity:.9}
.fnh-hero h1{font-size:clamp(1.75rem,4.5vw,2.625rem);font-weight:800;line-height:1.2;margin-bottom:.5rem}
.fnh-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.7}
.fnh-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.fnh-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.fnh-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.fnh-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.fnh-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.fnh-section{margin-top:2.75rem}
.fnh-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.fnh-services-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.fnh-svc-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.fnh-svc-icon{font-size:1.5rem;margin-bottom:.5rem}
.fnh-svc-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.fnh-svc-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.fnh-faith-row{display:flex;flex-wrap:wrap;gap:.75rem}
.fnh-faith-chip{padding:.5rem 1rem;border-radius:var(--ww-radius);font-size:.9rem;font-weight:600;background:var(--ww-surface);border:1px solid var(--ww-border)}
.fnh-hotline{border:2px solid var(--ww-primary);border-radius:var(--ww-radius);padding:1.5rem;text-align:center;background:var(--ww-surface)}
.fnh-hotline-label{font-size:.9rem;color:var(--ww-text-muted);margin-bottom:.5rem}
.fnh-hotline-number{font-size:1.5rem;font-weight:900;color:var(--ww-primary)}
.fnh-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.fnh-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.fnh-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
.fnh-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
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
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="fnh-logo">` : '';
  return `<section class="fnh-hero">
    ${logoHtml}
    <div class="fnh-badge">🕊️ CAC Registered · MDCN Certified Embalmers</div>
    <h1>${esc(name)}</h1>
    <p class="fnh-tagline">${esc(tagline ?? 'Compassionate funeral and burial services — Christian, Islamic, and Traditional. Diaspora repatriation available. Available 24/7.')}</p>
    <div class="fnh-ctas">
      ${wa ? `<a href="${wa}" class="fnh-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp 24/7</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="fnh-primary-btn">📞 Emergency Line</a>` : ''}
    </div>
  </section>`;
}

function buildServices(ctx: WebsiteRenderContext): string {
  const services = (((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).length > 0) ? ((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).slice(0,6) : [
    {name:'Embalming & Preservation',description:'MDCN-certified embalmers. Body preservation, refrigeration, and preparation for viewing.'},
    {name:'Coffin & Casket Supply',description:'Full range of hardwood, steel, and imported caskets. Burial vaults and shrouds available.'},
    {name:'Burial Arrangement',description:'Cemetery liaison, council permits, gravedigging, and graveside service coordination.'},
    {name:'Islamic Janazah Service',description:'Ghusl washing, kafan shrouding, Janazah prayer coordination, and Islamic cemetery liaison.'},
    {name:'Diaspora Repatriation',description:'International body shipment with NIS, NHS, and IATA paperwork. UK, USA, and EU corridors.'},
    {name:'Celebration of Life Events',description:'Chapel hire, live streaming, event decoration, and catering coordination for send-off events.'},
  ];
  const cards = services.map((s: Record<string,unknown>) => `
    <div class="fnh-svc-card">
      <div class="fnh-svc-icon">🕊️</div>
      <div class="fnh-svc-name">${esc(String(s.name ?? ''))}</div>
      <div class="fnh-svc-desc">${esc(String(s.description ?? ''))}</div>
    </div>`).join('');
  return `<section class="fnh-section">
    <h2 class="fnh-section-title">Our Services</h2>
    <div class="fnh-services-grid">${cards}</div>
  </section>`;
}

function buildFaithTraditions(ctx: WebsiteRenderContext): string {
  const traditions = (ctx as unknown as Record<string,unknown>)['faithTraditions'] as string[] | undefined;
  const list = traditions && traditions.length > 0 ? traditions : ['Christian','Islamic (Janazah)','Traditional / Cultural','Non-Religious'];
  const chips = list.map(t => `<span class="fnh-faith-chip">${esc(t)}</span>`).join('');
  return `<section class="fnh-section">
    <h2 class="fnh-section-title">Faith Traditions We Serve</h2>
    <p style="font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.75rem">We provide culturally and religiously sensitive services for families of all backgrounds across Nigeria.</p>
    <div class="fnh-faith-row">${chips}</div>
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
  const hotline = phone ?? '';
  return `<section class="fnh-section">
    <h2 class="fnh-section-title">24/7 Emergency Hotline</h2>
    ${hotline ? `<div class="fnh-hotline">
      <div class="fnh-hotline-label">Available day and night — we answer every call</div>
      <a href="tel:${esc(hotline)}" class="fnh-hotline-number">${esc(hotline)}</a>
    </div>` : ''}
    <div class="fnh-contact-box" style="margin-top:1rem">
      ${phone ? `<div class="fnh-contact-row"><span class="fnh-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : ''}
      ${email ? `<div class="fnh-contact-row"><span class="fnh-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
      ${address ? `<div class="fnh-contact-row"><span class="fnh-contact-label">Address</span><span>${esc(address)}</span></div>` : ''}
      ${wa ? `<div class="fnh-contact-row"><span class="fnh-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat Now</a></div>` : ''}
    </div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="fnh-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Licensed Funeral Home, Nigeria.<br>
    MDCN Certified Embalmers &bull; CAC Registered &bull; LSMW Compliant &bull; NDPR Compliant
  </footer>`;
}

export const funeralHomeFuneralHomeSiteTemplate: WebsiteTemplateContract = {
  slug: 'funeral-home-funeral-home-site',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildServices(ctx), buildFaithTraditions(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
