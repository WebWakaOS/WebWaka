/**
 * Blog post detail page template — Pillar 2 (P4-A)
 * Renders a single blog post with full content.
 */

export interface BlogPostDetail {
  id: string;
  slug: string;
  title: string;
  content: string;
  published_at: number;
  author_name: string | null;
  cover_image_url: string | null;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(s: string): string {
  return encodeURI(s).replace(/"/g, '%22');
}

function formatDate(unixTs: number): string {
  return new Date(unixTs * 1000).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function blogPostBody(post: BlogPostDetail): string {
  return `
    <article itemscope itemtype="https://schema.org/BlogPosting" style="max-width:48rem;margin:0 auto">
      ${post.cover_image_url ? `
        <img src="${escAttr(post.cover_image_url)}" alt="${escHtml(post.title)}"
             style="width:100%;border-radius:var(--ww-radius);margin-bottom:2rem;max-height:400px;object-fit:cover"
             itemprop="image" />
      ` : ''}

      <header style="margin-bottom:2rem">
        <h1 itemprop="headline" style="font-size:clamp(1.75rem,5vw,2.5rem);font-weight:800;line-height:1.2;margin-bottom:1rem">
          ${escHtml(post.title)}
        </h1>
        <p style="font-size:.875rem;color:var(--ww-text-muted)">
          <time itemprop="datePublished" datetime="${new Date(post.published_at * 1000).toISOString()}">
            ${formatDate(post.published_at)}
          </time>
          ${post.author_name ? ` · <span itemprop="author">${escHtml(post.author_name)}</span>` : ''}
        </p>
      </header>

      <div itemprop="articleBody" style="line-height:1.8;font-size:1.0625rem;color:var(--ww-text)">
        ${post.content}
      </div>

      <footer style="margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--ww-border)">
        <a href="/blog" style="color:var(--ww-text-muted);font-size:.875rem">&larr; Back to Blog</a>
      </footer>
    </article>
  `;
}
