import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AuditEntry {
  id: string;
  event_type: string;
  actor_id?: string;
  actor_email?: string;
  resource_type?: string;
  resource_id?: string;
  description?: string;
  created_at: string;
  meta?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Audit() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 30;

  const load = (p = 0) => {
    setLoading(true);
    api.get<{ results: AuditEntry[]; total: number }>(`/platform-admin/cp/audit?limit=${PAGE_SIZE}&offset=${p * PAGE_SIZE}`)
      .then(r => { setEntries(r.results); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { load(page); }, [page]);

  const filtered = entries.filter(e =>
    !search ||
    (e.event_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.actor_email || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.resource_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Audit Log</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>All governance and control-plane mutations with actor, resource, and timestamp.</p>
      </header>

      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="search"
          placeholder="Filter by event type, actor, resource..."
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
                <tr><th>Event</th><th>Actor</th><th>Resource</th><th>Description</th><th>Time</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j}><div className="shimmer" style={{ height: 14, width: [100, 120, 80, 200, 60][j] }} /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No audit entries found.</td></tr>
                ) : filtered.map(e => (
                  <tr key={e.id}>
                    <td>
                      <code style={{ fontSize: '0.78rem', color: 'var(--info)', background: 'rgba(96,165,250,0.08)', padding: '2px 6px', borderRadius: 4 }}>{e.event_type}</code>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{e.actor_email ?? e.actor_id ?? '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {e.resource_type && <span style={{ color: 'var(--text-muted)' }}>{e.resource_type}</span>}
                      {e.resource_type && e.resource_id && <span style={{ color: 'var(--border)' }}> / </span>}
                      {e.resource_id && <code style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{e.resource_id.slice(0, 12)}...</code>}
                      {!e.resource_type && !e.resource_id && '—'}
                    </td>
                    <td style={{ color: 'var(--text)', fontSize: '0.85rem', maxWidth: 280 }}>{e.description ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }} title={e.created_at}>{timeAgo(e.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={() => { setPage(p => p - 1); }} disabled={page === 0 || loading} style={{ padding: '0.3rem 0.75rem', background: 'var(--dark)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
              ← Prev
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Page {page + 1}</span>
            <button onClick={() => { setPage(p => p + 1); }} disabled={loading || entries.length < PAGE_SIZE} style={{ padding: '0.3rem 0.75rem', background: 'var(--dark)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
              Next →
            </button>
            <button onClick={() => load(page)} style={{ marginLeft: 'auto', padding: '0.3rem 0.75rem', background: 'var(--card)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.8rem' }}>
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
