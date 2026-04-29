/**
 * Polling Unit Representative Information Site — Pillar 3 Website Template
 * Niche ID: P3-polling-unit-rep-polling-unit-rep-site
 * Vertical: polling-unit-rep (priority=3, high)
 * Category: politics
 * Family: NF-POL-PU (standalone)
 * Research brief: docs/templates/research/polling-unit-rep-polling-unit-rep-site-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: INEC 2023 BVAS transparency, CAC (if association), NDPR, FOIA
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I have a question about my polling unit or voter registration.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.pur-hero{text-align:center;padding:3rem 0 2.25rem}
.pur-logo{height:80px;width:80px;object-fit:cover;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.pur-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.pur-hero h1{font-size:clamp(1.75rem,4.5vw,2.625rem);font-weight:800;line-height:1.2;margin-bottom:.25rem}
.pur-subtitle{font-size:1rem;color:var(--ww-text-muted);margin-bottom:.75rem;font-weight:600}
.pur-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.pur-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pur-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.pur-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.pur-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.pur-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.pur-section{margin-top:2.75rem}
.pur-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.pur-pu-box{border:2px solid var(--ww-primary);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface)}
.pur-pu-row{display:flex;gap:.75rem;align-items:flex-start;padding:.5rem 0;border-bottom:1px solid var(--ww-border);font-size:.9375rem}
.pur-pu-row:last-child{border-bottom:none}
.pur-pu-label{font-weight:700;min-width:140px;color:var(--ww-primary)}
.pur-results-list{display:flex;flex-direction:column;gap:.5rem}
.pur-result-row{display:flex;gap:.75rem;justify-content:space-between;align-items:center;padding:.75rem 1rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);background:var(--ww-surface);font-size:.9rem;flex-wrap:wrap}
.pur-result-party{font-weight:700}
.pur-result-votes{color:var(--ww-primary);font-weight:700}
.pur-civic-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
.pur-civic-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1rem;background:var(--ww-surface);text-align:center}
.pur-civic-icon{font-size:1.75rem;margin-bottom:.25rem}
.pur-civic-title{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.pur-civic-desc{font-size:.8125rem;color:var(--ww-text-muted)}
.pur-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.pur-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.pur-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.pur-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const rep = (ctx as unknown as Record<string,unknown>)['rep'] as {name?:string;pollingUnit?:string;ward?:string;lga?:string;state?:string} | undefined;
  const wa = whatsappLink(whatsapp ?? phone);
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="Rep photo" class="pur-logo">` : '';
  return `<section class="pur-hero">
    ${logoHtml}
    <div class="pur-badge">🗳️ INEC BVAS Transparent · Voter Information</div>
    <h1>${esc(rep?.name ?? name)}</h1>
    <p class="pur-subtitle">Polling Unit Agent &amp; Community Representative</p>
    <p class="pur-tagline">${esc(tagline ?? 'Your trusted polling unit representative — election result transparency, voter registration guidance, and civic support.')}</p>
    <div class="pur-ctas">
      ${wa ? `<a href="${wa}" class="pur-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp Us</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="pur-primary-btn">📞 Call</a>` : ''}
    </div>
  </section>`;
}

function buildPollingUnitInfo(ctx: WebsiteRenderContext): string {
  const pu = (ctx as unknown as Record<string,unknown>)['pollingUnitInfo'] as Record<string,string> | undefined;
  const info = pu ?? {
    'PU Code':'LA/069/001',
    'Polling Unit Name':'School of Excellence Field, Ikeja',
    'Ward':'Ward 01 — Ifako',
    'LGA':'Ikeja',
    'State':'Lagos',
    'Registered Voters':'1,240',
    'BVAS Serial':'BVAS-2023-LA-00XXX',
  };
  const rows = Object.entries(info).map(([k,v]) => `
    <div class="pur-pu-row">
      <span class="pur-pu-label">${esc(k)}</span>
      <span>${esc(String(v))}</span>
    </div>`).join('');
  return `<section class="pur-section">
    <h2 class="pur-section-title">Polling Unit Information</h2>
    <div class="pur-pu-box">${rows}</div>
    <p style="font-size:.8125rem;color:var(--ww-text-muted);margin-top:.5rem">Data aligned with INEC 2023 BVAS verification. Contact us if you spot any discrepancy.</p>
  </section>`;
}

function buildResults(ctx: WebsiteRenderContext): string {
  const results = (ctx as unknown as Record<string,unknown>)['lastElectionResults'] as {party:string;candidate:string;votes:number}[] | undefined;
  if (!results || results.length === 0) {
    return `<section class="pur-section">
      <h2 class="pur-section-title">Last Election Results (2023)</h2>
      <p style="font-size:.9375rem;color:var(--ww-text-muted)">Official 2023 polling unit results will be published here after INEC data verification. WhatsApp us for your BVAS-verified result sheet.</p>
    </section>`;
  }
  const rows = results.slice(0,6).map(r => `
    <div class="pur-result-row">
      <span class="pur-result-party">${esc(r.party)}</span>
      <span>${esc(r.candidate)}</span>
      <span class="pur-result-votes">${r.votes.toLocaleString()} votes</span>
    </div>`).join('');
  return `<section class="pur-section">
    <h2 class="pur-section-title">2023 Presidential Election — PU Results</h2>
    <div class="pur-results-list">${rows}</div>
  </section>`;
}

function buildCivicServices(): string {
  const services = [
    {icon:'🪪',title:'Voter Registration',desc:'Guide to PVCs, transfer of registration, and INEC My Voter Information portal.'},
    {icon:'📋',title:'Result Collation',desc:'We provide BVAS-verified result sheets for this polling unit on request.'},
    {icon:'📣',title:'Civic Education',desc:'Know your rights — voter rights, security procedures, and accreditation processes.'},
    {icon:'🤝',title:'Community Issues',desc:'Report electoral malpractice, infrastructure gaps, or voter intimidation via WhatsApp.'},
  ];
  const cards = services.map((s: Record<string,unknown>) => `
    <div class="pur-civic-card">
      <div class="pur-civic-icon">${esc(String(s.icon ?? ''))}</div>
      <div class="pur-civic-title">${esc(String(s.title ?? ''))}</div>
      <div class="pur-civic-desc">${esc(String(s.desc ?? ''))}</div>
    </div>`).join('');
  return `<section class="pur-section">
    <h2 class="pur-section-title">Civic Services</h2>
    <div class="pur-civic-grid">${cards}</div>
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
    phone ? `<div class="pur-contact-row"><span class="pur-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="pur-contact-row"><span class="pur-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="pur-contact-row"><span class="pur-contact-label">Address</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="pur-contact-row"><span class="pur-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat Now</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="pur-section">
    <h2 class="pur-section-title">Contact Your Representative</h2>
    <div class="pur-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="pur-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Polling Unit Representative, Nigeria.<br>
    INEC BVAS Aligned &bull; FOIA Compliant &bull; NDPR Compliant
  </footer>`;
}

export const pollingUnitRepPollingUnitRepSiteTemplate: WebsiteTemplateContract = {
  slug: 'polling-unit-rep-polling-unit-rep-site',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildPollingUnitInfo(ctx), buildResults(ctx), buildCivicServices(), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
