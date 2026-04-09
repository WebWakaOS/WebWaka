/**
 * Branded home page template for a tenant's public-facing website.
 * (Pillar 2 — PV-1.1)
 */

export interface BrandedHomeData {
  displayName: string;
  tagline: string | null;
  description: string | null;
  primaryColor: string;
  logoUrl: string | null;
  ctaLabel: string;
  ctaUrl: string;
  offerings: Array<{ name: string; description: string | null; priceKobo: number | null }>;
}

export function brandedHomeBody(data: BrandedHomeData): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const offeringCards =
    data.offerings.length === 0
      ? ''
      : `
  <section style="margin-top:3rem">
    <h2 style="font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)">
      Our Offerings
    </h2>
    <div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
      ${data.offerings
        .map(
          (o) => `
      <div style="border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface)">
        <h3 style="font-size:1rem;font-weight:600;margin-bottom:.375rem">${esc(o.name)}</h3>
        ${o.description ? `<p style="font-size:.875rem;color:var(--ww-text-muted);margin-bottom:.75rem">${esc(o.description)}</p>` : ''}
        ${
          o.priceKobo !== null
            ? `<p style="font-weight:700;color:var(--ww-primary)">₦${(o.priceKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>`
            : ''
        }
      </div>`,
        )
        .join('')}
    </div>
  </section>`;

  return `
  <section style="text-align:center;padding:3rem 0 2rem">
    ${data.logoUrl ? `<img src="${encodeURI(data.logoUrl)}" alt="${esc(data.displayName)} logo" style="height:72px;width:auto;margin-bottom:1.5rem;border-radius:8px" />` : ''}
    <h1 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:800;line-height:1.2;margin-bottom:1rem">
      ${esc(data.displayName)}
    </h1>
    ${data.tagline ? `<p style="font-size:1.125rem;color:var(--ww-text-muted);margin-bottom:1.5rem;max-width:34rem;margin-inline:auto">${esc(data.tagline)}</p>` : ''}
    ${data.description ? `<p style="color:var(--ww-text-muted);max-width:40rem;margin-inline:auto;margin-bottom:2rem;line-height:1.7">${esc(data.description)}</p>` : ''}
    <a class="ww-btn" href="${encodeURI(data.ctaUrl)}" style="font-size:1rem;padding:.875rem 2rem">
      ${esc(data.ctaLabel)}
    </a>
  </section>
  ${offeringCards}
`;
}
