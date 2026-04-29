/**
 * Book Club / Reading Circle Platform — Pillar 3 Website Template
 * Niche ID: P3-book-club-book-club-platform
 * Vertical: book-club (priority=3, medium)
 * Category: civic/literacy
 * Family: NF-CIV-LIT (standalone)
 * Research brief: docs/templates/research/book-club-book-club-platform-brief.md
 * Nigeria-First Priority: medium
 * Regulatory signals: CAC (association), NLA, NDPR; She Reads Africa & Books & Rhymes Lagos as reference contexts
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to join the book club.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.bkc-hero{text-align:center;padding:3rem 0 2.25rem}
.bkc-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.bkc-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.bkc-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.bkc-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.bkc-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.bkc-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.bkc-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.bkc-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.bkc-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.bkc-section{margin-top:2.75rem}
.bkc-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.bkc-current-book{border:2px solid var(--ww-primary);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap}
.bkc-book-cover{width:90px;height:130px;object-fit:cover;border-radius:4px;border:1px solid var(--ww-border);flex-shrink:0;background:var(--ww-border);display:flex;align-items:center;justify-content:center;font-size:2.5rem}
.bkc-book-details{flex:1 1 180px}
.bkc-book-title{font-weight:800;font-size:1.125rem;margin-bottom:.25rem}
.bkc-book-author{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.5rem}
.bkc-book-session{font-size:.875rem;color:var(--ww-primary);font-weight:600}
.bkc-events-list{display:flex;flex-direction:column;gap:.75rem}
.bkc-event-row{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1rem;background:var(--ww-surface)}
.bkc-event-title{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.bkc-event-meta{font-size:.8125rem;color:var(--ww-text-muted)}
.bkc-genres-row{display:flex;flex-wrap:wrap;gap:.6rem}
.bkc-genre-chip{padding:.35rem .85rem;border-radius:999px;font-size:.8rem;font-weight:600;background:var(--ww-surface);border:1px solid var(--ww-border)}
.bkc-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.bkc-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.bkc-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.bkc-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
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
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="bkc-logo">` : '';
  return `<section class="bkc-hero">
    ${logoHtml}
    <div class="bkc-badge">📚 African Lit · Monthly Picks · Open to All</div>
    <h1>${esc(name)}</h1>
    <p class="bkc-tagline">${esc(tagline ?? 'A Nigerian reading community celebrating African voices, global fiction, and the power of shared stories.')}</p>
    <div class="bkc-ctas">
      ${wa ? `<a href="${wa}" class="bkc-wa-btn" target="_blank" rel="noopener">${waSvg()} Join the Club</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="bkc-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildCurrentRead(ctx: WebsiteRenderContext): string {
  const book = (ctx as unknown as Record<string,unknown>)['currentRead'] as {title:string;author:string;session:string;coverUrl?:string} | undefined;
  const b = book ?? {title:'Bournvita Book',author:'Chimamanda Ngozi Adichie',session:'May 2026 Monthly Pick — discussion on 31 May'};
  const coverHtml = (b as {coverUrl?:string}).coverUrl
    ? `<img src="${safeHref((b as {coverUrl?:string}).coverUrl as string)}" alt="${esc(b.title)} cover" class="bkc-book-cover">`
    : `<div class="bkc-book-cover">📖</div>`;
  return `<section class="bkc-section">
    <h2 class="bkc-section-title">This Month's Read</h2>
    <div class="bkc-current-book">
      ${coverHtml}
      <div class="bkc-book-details">
        <div class="bkc-book-title">${esc(b.title)}</div>
        <div class="bkc-book-author">by ${esc(b.author)}</div>
        <div class="bkc-book-session">📅 ${esc(b.session)}</div>
      </div>
    </div>
  </section>`;
}

function buildEvents(ctx: WebsiteRenderContext): string {
  const events = (ctx as unknown as Record<string,unknown>)['events'] as {title:string;date:string;venue:string}[] | undefined;
  const list = events && events.length > 0 ? events : [
    {title:'Monthly Book Discussion',date:'Last Saturday of every month, 3:00 PM',venue:'Virtual (Zoom) + physical in Lagos'},
    {title:'Author Meet & Greet',date:'Quarterly',venue:'TBC — Lagos or Abuja'},
    {title:'Kids & YA Reading Afternoon',date:'First Sunday of the month',venue:'Community Library, Ikeja'},
  ];
  const rows = list.slice(0,4).map(e => `
    <div class="bkc-event-row">
      <div class="bkc-event-title">📅 ${esc(e.title)}</div>
      <div class="bkc-event-meta">${esc(e.date)} &mdash; 📍 ${esc(e.venue)}</div>
    </div>`).join('');
  return `<section class="bkc-section">
    <h2 class="bkc-section-title">Events & Meetings</h2>
    <div class="bkc-events-list">${rows}</div>
  </section>`;
}

function buildGenres(ctx: WebsiteRenderContext): string {
  const genres = (ctx as unknown as Record<string,unknown>)['genres'] as string[] | undefined;
  const list = genres && genres.length > 0 ? genres : ['African Fiction','Afrobeats Narrative','Crime & Thriller','Non-Fiction','History','YA & Children','Poetry','Business & Finance'];
  const chips = list.map(g => `<span class="bkc-genre-chip">${esc(g)}</span>`).join('');
  return `<section class="bkc-section">
    <h2 class="bkc-section-title">Genres We Explore</h2>
    <div class="bkc-genres-row">${chips}</div>
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
    phone ? `<div class="bkc-contact-row"><span class="bkc-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="bkc-contact-row"><span class="bkc-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="bkc-contact-row"><span class="bkc-contact-label">Meet</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="bkc-contact-row"><span class="bkc-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Join the WhatsApp Group</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="bkc-section">
    <h2 class="bkc-section-title">Get in Touch</h2>
    <div class="bkc-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="bkc-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Reading Circle, Nigeria.<br>
    CAC Registered &bull; NLA Affiliated &bull; NDPR Compliant
  </footer>`;
}

export const bookClubBookClubPlatformTemplate: WebsiteTemplateContract = {
  slug: 'book-club-book-club-platform',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildCurrentRead(ctx), buildEvents(ctx), buildGenres(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
