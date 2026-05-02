/**
 * Simple pagination bar — reused across Search, InPlace, Category pages.
 */
interface Props {
  page: number;
  total: number;   // total items
  limit?: number;
  onChange: (p: number) => void;
}

export default function Pagination({ page, total, limit = 20, onChange }: Props) {
  const pages = Math.ceil(total / limit);
  if (pages <= 1) return null;

  const items: (number | '…')[] = [];
  if (pages <= 7) {
    for (let i = 1; i <= pages; i++) items.push(i);
  } else {
    items.push(1);
    if (page > 3) items.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) items.push(i);
    if (page < pages - 2) items.push('…');
    items.push(pages);
  }

  const btn = (active: boolean, disabled: boolean, onClick: () => void, label: string | number) => (
    <button
      key={String(label) + String(active)}
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        border: active ? '2px solid var(--green)' : '1.5px solid var(--border)',
        background: active ? 'var(--green)' : 'var(--card)',
        color: active ? '#fff' : 'inherit',
        fontWeight: active ? 700 : 400,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        fontSize: '0.875rem',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
      {btn(false, page === 1, () => onChange(page - 1), '← Prev')}
      {items.map((it) =>
        it === '…'
          ? <span key={`ellipsis-${Math.random()}`} style={{ padding: '6px 4px', color: 'var(--muted)' }}>…</span>
          : btn(it === page, false, () => onChange(it), it)
      )}
      {btn(false, page === pages, () => onChange(page + 1), 'Next →')}
    </div>
  );
}
