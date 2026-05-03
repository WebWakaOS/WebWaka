import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Flag {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  value_type?: string;
  default_value?: string;
  is_active?: boolean | number;
  is_kill_switch?: boolean | number;
  rollout_pct?: number;
}

export default function Flags() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '', category: '', default_value: 'true', is_kill_switch: false });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get<{ results: Flag[]; total: number }>('/platform-admin/cp/flags?limit=200')
      .then(r => { setFlags(r.results); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/platform-admin/cp/flags', form);
      setShowCreate(false);
      setForm({ code: '', name: '', description: '', category: '', default_value: 'true', is_kill_switch: false });
      load();
    } catch (err) { alert(`Failed: ${err instanceof Error ? err.message : err}`); }
    finally { setSaving(false); }
  };

  const toggleActive = async (flag: Flag) => {
    setToggling(flag.id);
    try {
      await api.patch(`/platform-admin/cp/flags/${flag.id}`, { is_active: flag.is_active ? 0 : 1 });
      load();
    } catch (err) { alert(`Failed: ${err instanceof Error ? err.message : err}`); }
    finally { setToggling(null); }
  };

  const filtered = flags.filter(f =>
    !search || f.code.includes(search.toLowerCase()) || f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Feature Flags</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Runtime configuration flags — toggle without code deploy.</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding: '0.5rem 1.25rem', background: 'var(--primary)', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: '0.875rem', minHeight: 40 }}>
          + New Flag
        </button>
      </header>

      {/* Search */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="search"
          placeholder="Search flags by code or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 400 }}
        />
      </div>

      {error ? (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '1rem', borderRadius: 8 }}>{error}</div>
      ) : (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Code</th><th>Name</th><th>Category</th><th>Default</th><th>Kill Switch</th><th>Active</th><th>Toggle</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j}><div className="shimmer" style={{ height: 14, width: j === 6 ? 60 : 90 }} /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No flags found.</td></tr>
                ) : filtered.map(f => (
                  <tr key={f.id}>
                    <td><code style={{ fontSize: '0.8rem', color: 'var(--info)', background: 'rgba(96,165,250,0.08)', padding: '2px 6px', borderRadius: 4 }}>{f.code}</code></td>
                    <td style={{ fontWeight: 500 }}>{f.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{f.category ?? '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.default_value ?? '—'}</td>
                    <td>
                      {f.is_kill_switch ? (
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: 'rgba(239,68,68,0.2)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}>KILL SWITCH</span>
                      ) : <span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>no</span>}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                        background: f.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.15)',
                        color: f.is_active ? 'var(--success)' : 'var(--text-muted)',
                      }}>{f.is_active ? 'active' : 'inactive'}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActive(f)}
                        disabled={toggling === f.id}
                        style={{
                          padding: '0.25rem 0.75rem', borderRadius: 5, fontSize: '0.75rem', fontWeight: 600,
                          background: f.is_active ? 'rgba(107,114,128,0.15)' : 'rgba(34,197,94,0.12)',
                          color: f.is_active ? 'var(--text-muted)' : 'var(--success)',
                          border: '1px solid transparent',
                        }}
                      >
                        {toggling === f.id ? '...' : f.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {filtered.length} of {flags.length} flags
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', width: '100%', maxWidth: 480 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Create Feature Flag</h2>
            <form onSubmit={handleCreate}>
              {[{ id: 'code', label: 'Code (snake_case)', key: 'code' as const },
                { id: 'name', label: 'Display Name', key: 'name' as const },
                { id: 'desc', label: 'Description (optional)', key: 'description' as const },
                { id: 'cat', label: 'Category (optional)', key: 'category' as const },
                { id: 'def', label: 'Default Value', key: 'default_value' as const }].map(f => (
                <div key={f.id} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 500 }} htmlFor={f.id}>{f.label}</label>
                  <input id={f.id} value={String((form as Record<string, unknown>)[f.key] ?? '')} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={{ width: '100%' }} />
                </div>
              ))}
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="kill" checked={form.is_kill_switch} onChange={e => setForm(prev => ({ ...prev, is_kill_switch: e.target.checked }))} />
                <label htmlFor="kill" style={{ fontSize: '0.875rem', color: 'var(--text)' }}>Kill switch flag</label>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '0.6rem 1.25rem', background: 'var(--dark)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8 }}>Cancel</button>
                <button type="submit" disabled={saving || !form.code || !form.name} style={{ padding: '0.6rem 1.25rem', background: 'var(--primary)', color: '#fff', borderRadius: 8, fontWeight: 700 }}>
                  {saving ? 'Creating...' : 'Create Flag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
