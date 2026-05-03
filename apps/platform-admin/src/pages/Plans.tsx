import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Plan {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived' | 'draft';
  is_public?: boolean;
  sort_order?: number;
  target_audience?: string;
  pricing?: { amount_kobo: number; currency: string; interval_code: string }[];
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  active: { bg: 'rgba(34,197,94,0.12)', color: 'var(--success)' },
  inactive: { bg: 'rgba(107,114,128,0.15)', color: 'var(--text-muted)' },
  archived: { bg: 'rgba(239,68,68,0.12)', color: 'var(--danger)' },
  draft: { bg: 'rgba(245,158,11,0.12)', color: 'var(--warning)' },
};

function Badge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.inactive;
  return (
    <span style={{ padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ slug: '', name: '', description: '', target_audience: '' });
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    const qs = statusFilter !== 'all' ? `?status=${statusFilter}&limit=100` : '?limit=100';
    api.get<{ results: Plan[]; total: number }>(`/platform-admin/cp/plans${qs}`)
      .then(r => { setPlans(r.results); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/platform-admin/cp/plans', { ...form, status: 'draft' });
      setShowCreate(false);
      setForm({ slug: '', name: '', description: '', target_audience: '' });
      load();
    } catch (err) {
      alert(`Failed: ${err instanceof Error ? err.message : err}`);
    } finally { setSaving(false); }
  };

  const activate = async (id: string) => {
    setActionId(id);
    try { await api.post(`/platform-admin/cp/plans/${id}/activate`, {}); load(); }
    catch (err) { alert(`Failed: ${err instanceof Error ? err.message : err}`); }
    finally { setActionId(null); }
  };

  const deactivate = async (id: string) => {
    setActionId(id);
    try { await api.post(`/platform-admin/cp/plans/${id}/deactivate`, {}); load(); }
    catch (err) { alert(`Failed: ${err instanceof Error ? err.message : err}`); }
    finally { setActionId(null); }
  };

  const archive = async (id: string) => {
    if (!confirm('Archive this plan? This cannot be easily undone.')) return;
    setActionId(id);
    try { await api.post(`/platform-admin/cp/plans/${id}/archive`, {}); load(); }
    catch (err) { alert(`Failed: ${err instanceof Error ? err.message : err}`); }
    finally { setActionId(null); }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Plans & Pricing</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage subscription packages, pricing, and plan catalog.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: '0.5rem 1.25rem', background: 'var(--primary)', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', minHeight: 40 }}
        >
          + New Plan
        </button>
      </header>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'active', 'draft', 'inactive', 'archived'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '0.35rem 0.85rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600,
            background: statusFilter === s ? 'var(--primary)' : 'var(--card)',
            color: statusFilter === s ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${statusFilter === s ? 'var(--primary)' : 'var(--border)'}`,
          }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      {/* Table */}
      {error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '1rem', borderRadius: 8 }}>{error}</div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Name</th><th>Slug</th><th>Audience</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j}><div className="shimmer" style={{ height: 16, width: j === 4 ? 120 : 80 }} /></td>
                      ))}
                    </tr>
                  ))
                ) : plans.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No plans found.</td></tr>
                ) : plans.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.slug}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.target_audience ?? '—'}</td>
                    <td><Badge status={p.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {p.status === 'draft' && (
                          <button onClick={() => activate(p.id)} disabled={actionId === p.id} style={{ padding: '0.25rem 0.7rem', background: 'rgba(34,197,94,0.15)', color: 'var(--success)', borderRadius: 5, fontSize: '0.75rem', fontWeight: 600 }}>
                            Activate
                          </button>
                        )}
                        {p.status === 'active' && (
                          <button onClick={() => deactivate(p.id)} disabled={actionId === p.id} style={{ padding: '0.25rem 0.7rem', background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', borderRadius: 5, fontSize: '0.75rem', fontWeight: 600 }}>
                            Deactivate
                          </button>
                        )}
                        {p.status !== 'archived' && (
                          <button onClick={() => archive(p.id)} disabled={actionId === p.id} style={{ padding: '0.25rem 0.7rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: 5, fontSize: '0.75rem', fontWeight: 600 }}>
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }} onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', width: '100%', maxWidth: 480 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Create New Plan</h2>
            <form onSubmit={handleCreate}>
              {[{ id: 'slug', label: 'Slug (e.g. starter)', val: form.slug, key: 'slug' as const },
                { id: 'name', label: 'Display Name', val: form.name, key: 'name' as const },
                { id: 'desc', label: 'Description (optional)', val: form.description, key: 'description' as const },
                { id: 'audience', label: 'Target Audience (optional)', val: form.target_audience, key: 'target_audience' as const }].map(f => (
                <div key={f.id} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 500 }} htmlFor={f.id}>{f.label}</label>
                  <input id={f.id} value={f.val} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={{ width: '100%' }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '0.6rem 1.25rem', background: 'var(--dark)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8 }}>Cancel</button>
                <button type="submit" disabled={saving || !form.slug || !form.name} style={{ padding: '0.6rem 1.25rem', background: 'var(--primary)', color: '#fff', borderRadius: 8, fontWeight: 700 }}>
                  {saving ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
