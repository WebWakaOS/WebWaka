import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Workspace {
  id: string;
  name?: string;
  tenant_id: string;
  subscription_plan?: string;
  subscription_status?: string;
  created_at?: string;
}

export default function Tenants() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<{ workspaces: Workspace[]; total?: number } | Workspace[]>('/admin/workspaces?limit=100')
      .then(r => {
        const list = Array.isArray(r) ? r : (r as { workspaces: Workspace[] }).workspaces ?? [];
        setWorkspaces(list);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const filtered = workspaces.filter(w =>
    !search ||
    (w.id || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.tenant_id || '').toLowerCase().includes(search.toLowerCase())
  );

  const planColor: Record<string, string> = {
    free: 'var(--text-muted)',
    starter: 'var(--info)',
    growth: 'var(--success)',
    pro: 'var(--warning)',
    enterprise: '#a855f7',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Tenants & Workspaces</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>All workspaces across the platform. Each workspace is a tenant operator.</p>
      </header>

      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="search"
          placeholder="Search by workspace ID, name, or tenant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 500 }}
        />
      </div>

      {error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '1rem', borderRadius: 8 }}>{error}</div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Workspace ID</th><th>Name</th><th>Plan</th><th>Status</th><th>Created</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="shimmer" style={{ height: 14, width: 80 }} /></td>)}</tr>)
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No workspaces found.</td></tr>
                ) : filtered.map(w => (
                  <tr key={w.id}>
                    <td><code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.id}</code></td>
                    <td style={{ fontWeight: 500 }}>{w.name ?? '—'}</td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: planColor[w.subscription_plan ?? ''] ?? 'var(--text-muted)' }}>
                        {w.subscription_plan ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                        background: w.subscription_status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.15)',
                        color: w.subscription_status === 'active' ? 'var(--success)' : 'var(--text-muted)',
                      }}>{w.subscription_status ?? '—'}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {filtered.length} of {workspaces.length} workspaces
          </div>
        </div>
      )}
    </div>
  );
}
