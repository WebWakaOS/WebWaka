export interface AboutPageData {
  displayName: string;
  description: string | null;
  logoUrl: string | null;
  primaryColor: string;
  category: string | null;
  placeName: string | null;
  phone: string | null;
  website: string | null;
}

export function aboutPageBody(data: AboutPageData): string {
  return `
  <section class="ww-about-hero">
    <h1 class="ww-h1">About ${esc(data.displayName)}</h1>
    ${data.category ? `<span class="ww-badge">${esc(data.category)}</span>` : ''}
  </section>

  <section class="ww-about-content">
    ${data.description
      ? `<div class="ww-about-description">
          <p>${esc(data.description)}</p>
        </div>`
      : `<div class="ww-about-description">
          <p>${esc(data.displayName)} is a business on WebWaka, Nigeria's multi-vertical business platform.</p>
        </div>`
    }

    <div class="ww-about-details">
      <h2 class="ww-h2">Contact Information</h2>
      <dl class="ww-detail-list">
        ${data.placeName ? `<div class="ww-detail-item"><dt>Location</dt><dd>${esc(data.placeName)}</dd></div>` : ''}
        ${data.phone ? `<div class="ww-detail-item"><dt>Phone</dt><dd><a href="tel:${esc(data.phone)}">${esc(data.phone)}</a></dd></div>` : ''}
        ${data.website ? `<div class="ww-detail-item"><dt>Website</dt><dd><a href="${safeHref(data.website)}" target="_blank" rel="noopener">${esc(data.website)}</a></dd></div>` : ''}
      </dl>
    </div>
  </section>

  <style>
    .ww-about-hero { text-align: center; padding: 2rem 0 1.5rem; }
    .ww-about-hero .ww-badge { margin-top: 0.75rem; }
    .ww-about-content { max-width: 40rem; margin: 0 auto; }
    .ww-about-description { margin-bottom: 2rem; line-height: 1.8; color: var(--ww-text-muted); }
    .ww-about-details { margin-top: 2rem; }
    .ww-detail-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
    .ww-detail-item { display: flex; gap: 1rem; }
    .ww-detail-item dt { font-weight: 600; min-width: 6rem; color: var(--ww-text); }
    .ww-detail-item dd { color: var(--ww-text-muted); }
    .ww-badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: var(--ww-secondary, #f5a623); color: #fff; }
  </style>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function safeHref(url: string): string {
  try {
    const parsed = new URL(url, 'https://placeholder.invalid');
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return encodeURI(url);
    }
  } catch { /* invalid URL */ }
  return '#';
}
