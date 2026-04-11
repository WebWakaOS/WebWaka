export interface ServicesPageData {
  displayName: string;
  offerings: Array<{
    name: string;
    description: string | null;
    priceKobo: number | null;
  }>;
}

export function servicesPageBody(data: ServicesPageData): string {
  const offeringCards =
    data.offerings.length === 0
      ? `<p class="ww-empty-state">No offerings listed yet. Check back soon.</p>`
      : `<div class="ww-offerings-grid">
          ${data.offerings
            .map(
              (o) => `
          <div class="ww-offering-card">
            <h3>${esc(o.name)}</h3>
            ${o.description ? `<p class="ww-offering-desc">${esc(o.description)}</p>` : ''}
            ${
              o.priceKobo !== null
                ? `<p class="ww-offering-price">\u20A6${(o.priceKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>`
                : ''
            }
          </div>`,
            )
            .join('')}
        </div>`;

  return `
  <section class="ww-services-hero">
    <h1 class="ww-h1">Our Services &amp; Products</h1>
    <p class="ww-services-sub">Browse what ${esc(data.displayName)} has to offer</p>
  </section>

  <section class="ww-services-content">
    ${offeringCards}
  </section>

  <style>
    .ww-services-hero { text-align: center; padding: 2rem 0 1.5rem; }
    .ww-services-sub { color: var(--ww-text-muted); margin-top: 0.5rem; }
    .ww-services-content { margin-top: 1.5rem; }
    .ww-offerings-grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
    @media (min-width: 768px) { .ww-offerings-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .ww-offerings-grid { grid-template-columns: repeat(3, 1fr); } }
    .ww-offering-card {
      border: 1px solid var(--ww-border);
      border-radius: var(--ww-radius);
      padding: 1.25rem;
      background: var(--ww-bg-surface);
      transition: box-shadow 0.15s ease;
    }
    .ww-offering-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .ww-offering-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.375rem; }
    .ww-offering-desc { font-size: 0.875rem; color: var(--ww-text-muted); margin-bottom: 0.75rem; line-height: 1.5; }
    .ww-offering-price { font-weight: 700; color: var(--ww-primary); font-size: 1rem; }
    .ww-empty-state { color: var(--ww-text-muted); text-align: center; padding: 3rem 1rem; }
  </style>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
