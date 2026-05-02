/**
 * Sub-Partners page — E1-3: Sub-tenant management
 */
import { useEffect, useState, FormEvent } from 'react';
import { partnersApi, type SubPartner } from '../lib/api';

const STATUS_COLOR: Record<string, string> = {
  active:    '#16a34a',
  suspended: '#dc2626',
  pending:   '#d97706',
};

export default function SubPartners() {
  const [all,      setAll]      = useState<SubPartner[]>([]);
  const [filtered, setFiltered] = useState<SubPartner[]>([]);
  const [search,   setSearch]   = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(true);

  // Create form
  const [showForm,  setShowForm]  = useState(false);
  const [tenantId,  setTenantId]  = useState('');
  const [dispName,  setDispName]  = useState('');
  const [creating,  setCreating]  = useState(false);
  const [createMsg, setCreateMsg] = useState('');
  const [createErr, setCreateErr] = useState('');

  async function load() {
    try {
      const d = await partnersApi.subPartners();
      setAll(d.subPartners);
      setFiltered(d.subPartners);
      setError('');
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q
      ? all.filter(s =>
          (s.id || '').toLowerCase().includes(q) ||
          (s.tenant_id || '').toLowerCase().includes(q) ||
          (s.display_name || '').toLowerCase().includes(q)
        )
      : all
    );
  }, [search, all]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!tenantId) { setCreateErr('Tenant ID is required.'); return; }
    setCreateErr(''); setCreateMsg(''); setCreating(true);
    try {
      await partnersApi.createSubPartner({ tenant_id: tenantId, display_name: dispName || undefined });
      setCreateMsg('Sub-partner created!');
      setTenantId(''); setDispName('');
      setTimeout(() => { setShowForm(false); setCreateMsg(''); }, 1500);
      await load();
    } catch (e) { setCreateErr((e as Error).message); } finally { setCreating(false); }
  }

  async function handleToggle(id: string, status: 'active' | 'suspended') {
    try {
      await partnersApi.toggleSubPartner(id, status === 'active' ? 'suspended' : 'active');
      await load();
    } catch (e) { alert((e as Error).message); }
  }

  return (
    <div>
      <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Sub-Partners</h2>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <input
          type="search" placeholder="Search sub-partners..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 220 }}
        />
        <button
          onClick={() => setShowForm(f => !f)}
          style={{
            padding: '0.5rem 1rem', background: 'var(--blue)', color: '#fff',
            border: 'none', borderRadius: 7, fontWeight: 700, fontSize: '0.875rem',
          }}
        >
          + New Sub-Partner
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{
          background: 'var(--dark)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '1.25rem', maxWidth: 460, marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.9375rem' }}>Create Sub-Partner</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <input
              type="text" placeholder="Tenant ID *" value={tenantId}
              onChange={e => setTenantId(e.target.value)} style={{ width: '100%' }}
            />
            <input
              type="text" placeholder="Display name (optional)" value={dispName}
              onChange={e => setDispName(e.target.value)} style={{ width: '100%' }}
            />
            {createErr && <p style={{ color: '#ef4444', fontSize: '0.8125rem' }}>{createErr}</p>}
            {createMsg && <p style={{ color: 'var(--green)', fontSize: '0.8125rem' }}>{createMsg}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
              <button
                type="submit" disabled={creating}
                style={{
                  padding: '0.5rem 1rem', background: '#15803d', color: '#fff',
                  border: 'none', borderRadius: 7, fontWeight: 700, fontSize: '0.875rem',
                  opacity: creating ? 0.7 : 1,
                }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button" onClick={() => setShowForm(false)}
                style={{
                  padding: '0.5rem 1rem', background: 'transparent',
                  color: 'var(--muted)', border: '1px solid var(--border)',
                  borderRadius: 7, fontWeight: 600, fontSize: '0.875rem',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {error   && <p style={{ color: '#ef4444' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}
      {!loading && filtered.length === 0 && !error && (
        <p style={{ color: 'var(--muted)' }}>No sub-partners found.</p>
      )}
      {filtered.map(s => (
        <div key={s.id} style={{
          display: 'flex', alignItems: 'center', gap: '0.875rem',
          padding: '0.875rem 0', borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <strong style={{ fontSize: '0.9375rem' }}>{s.display_name || s.tenant_id || s.id}</strong>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
              ID: {s.id} · Tenant: {s.tenant_id || '—'}
            </div>
          </div>
          <span style={{
            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
            color: STATUS_COLOR[s.status] ?? '#6b7280',
          }}>
            {s.status}
          </span>
          <button
            onClick={() => handleToggle(s.id, s.status as 'active' | 'suspended')}
            style={{
              padding: '4px 12px', border: 'none', borderRadius: 6,
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              ...(s.status === 'active'
                ? { background: '#fee2e2', color: '#dc2626' }
                : { background: '#dcfce7', color: '#15803d' }),
            }}
          >
            {s.status === 'active' ? 'Suspend' : 'Activate'}
          </button>
        </div>
      ))}
    </div>
  );
}
