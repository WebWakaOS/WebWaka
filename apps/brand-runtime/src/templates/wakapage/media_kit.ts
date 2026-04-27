/**
 * WakaPage — media_kit block renderer.
 * (Phase 2 — ADR-0041)
 *
 * Downloadable media kit / press pack files.
 * Files are linked directly; sizes displayed when provided.
 * Security: file URLs are encoded; no script injection from config.
 */

import type { MediaKitBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

const FILE_ICONS: Record<string, string> = {
  pdf:   '📄',
  zip:   '🗜',
  image: '🖼',
  doc:   '📝',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function renderMediaKitBlock(config: Partial<MediaKitBlockConfig>, _ctx: RenderContext): string {
  const heading = config.heading ?? 'Media Kit';
  const files = config.files ?? [];
  if (files.length === 0) return '';

  const fileRows = files.map((file) => {
    const icon = FILE_ICONS[file.fileType ?? ''] ?? '📎';
    return `
  <li class="wkp-mk-item">
    <span class="wkp-mk-icon" aria-hidden="true">${icon}</span>
    <div class="wkp-mk-info">
      <span class="wkp-mk-label">${esc(file.label)}</span>
      ${file.sizeBytes ? `<span class="wkp-mk-size">${formatBytes(file.sizeBytes)}</span>` : ''}
    </div>
    <a class="wkp-mk-dl wkp-btn wkp-btn-outline"
       href="${escAttr(file.url)}"
       download
       aria-label="Download ${esc(file.label)}">
      ↓ Download
    </a>
  </li>`;
  }).join('\n');

  return `
<section class="wkp-media-kit wkp-section" aria-label="${esc(heading)}">
  <h2 class="wkp-block-heading">${esc(heading)}</h2>
  <ul class="wkp-mk-list" role="list">
    ${fileRows}
  </ul>
</section>
<style>
.wkp-media-kit{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-mk-list{list-style:none;display:flex;flex-direction:column;gap:.625rem}
.wkp-mk-item{
  display:flex;align-items:center;gap:.75rem;
  padding:.75rem 1rem;
  border:1px solid var(--ww-border,#e5e7eb);
  border-radius:var(--ww-radius,6px);
  background:var(--ww-bg-surface,#f9fafb);
}
.wkp-mk-icon{font-size:1.25rem;flex-shrink:0}
.wkp-mk-info{flex:1;min-width:0}
.wkp-mk-label{display:block;font-size:.9375rem;font-weight:600;color:var(--ww-text,#111827);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wkp-mk-size{display:block;font-size:.75rem;color:var(--ww-text-muted,#6b7280)}
.wkp-mk-dl{
  flex-shrink:0;font-size:.8125rem;padding:.5rem .875rem;min-height:44px;
  border:1.5px solid var(--ww-primary);color:var(--ww-primary);
  background:transparent;border-radius:var(--ww-radius,6px);
  text-decoration:none;font-weight:600;white-space:nowrap;
}
.wkp-mk-dl:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
</style>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function escAttr(url: string): string {
  return encodeURI(url).replace(/"/g,'%22');
}
