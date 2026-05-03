import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Entitlement {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  value_type?: string;
  default_value?: string;
  is_active?: boolean | number;
}

export default function Entitlements() {
  const [defs, setDefs] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    api.get<{ results: Entitlement[]; total: number }>('/platform-admin/cp/entitlements?limit=200')
      .then(r => { setDefs(r.results); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const categories = ['all', ...Array.from(new Set(defs.map(d => d.category).filter(Boolean)))].sort() as string[];

  const filtered = defs.filter(d => {
    const matchSearch = !search || d.code.includes(search.toLowerCase()) || d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Entitlements</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Platform entitlement definitions. Bind values to plans via the Plans page.</p>
      </header>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search entitlements..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ maxWidth: 200 }}>
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
        </select>
      </div>

      {error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '1rem', borderRadius: 8 }}>{error}</div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Code</th><th>Name</th><th>Category</th><th>Type</th><th>Default</th><th>Status</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="shimmer" style={{ height: 14, width: 80 }} /></td>)}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No entitlements found.</td></tr>
                ) : filtered.map(d => (
                  <tr key={d.id}>
                    <td><code style={{ fontSize: '0.78rem', color: 'var(--info)', background: 'rgba(96,165,250,0.08)', padding: '2px 6px', borderRadius: 4 }}>{d.code}</code></td>
                    <td style={{ fontWeight: 500 }}>{d.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{d.category ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{d.value_type ?? '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.default_value ?? '—'}</td>
                    <td>
                      <span style={{
                        padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                        background: d.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.15)',
                        color: d.is_active ? 'var(--success)' : 'var(--text-muted)',
                      }}>{d.is_active ? 'active' : 'inactive'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {filtered.length} of {defs.length} entitlement definitions
          </div>
        </div>
      )}
    </div>
  );
}
