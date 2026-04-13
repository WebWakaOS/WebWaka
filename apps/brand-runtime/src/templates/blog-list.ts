/**
 * Blog listing page template — Pillar 2 (P4-A)
 * Renders the blog index with post summaries.
 * P9: no monetary values here.
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: number;
  author_name: string | null;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(unixTs: number): string {
  return new Date(unixTs * 1000).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function blogListBody(posts: BlogPost[], displayName: string): string {
  if (posts.length === 0) {
    return `
      <h1 style="font-size:clamp(1.5rem,4vw,2.25rem);font-weight:800;margin-bottom:1.5rem">Blog</h1>
      <p style="color:var(--ww-text-muted)">No posts published yet. Check back soon.</p>
    `;
  }

  const cards = posts.map((p) => `
    <article class="ww-card" style="padding:1.5rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);margin-bottom:1.5rem">
      <a href="/blog/${escHtml(p.slug)}" style="text-decoration:none;color:inherit">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.5rem;color:var(--ww-primary)">${escHtml(p.title)}</h2>
      </a>
      <p style="font-size:.8125rem;color:var(--ww-text-muted);margin-bottom:.75rem">
        ${p.author_name ? `By ${escHtml(p.author_name)} · ` : ''}${formatDate(p.published_at)}
      </p>
      ${p.excerpt ? `<p style="color:var(--ww-text);line-height:1.6">${escHtml(p.excerpt)}</p>` : ''}
      <a href="/blog/${escHtml(p.slug)}" class="ww-btn" style="margin-top:1rem;display:inline-block">Read more</a>
    </article>
  `).join('');

  return `
    <h1 style="font-size:clamp(1.5rem,4vw,2.25rem);font-weight:800;margin-bottom:1.5rem">
      ${escHtml(displayName)} Blog
    </h1>
    ${cards}
  `;
}
