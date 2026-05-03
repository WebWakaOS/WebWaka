import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Role {
  id: string;
  slug: string;
  name: string;
  description?: string;
  is_active?: boolean | number;
  scope?: string;
}

interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'roles' | 'permissions'>('roles');

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get<{ results: Role[]; total: number }>('/platform-admin/cp/roles?limit=100'),
      api.get<{ results: Permission[]; total: number }>('/platform-admin/cp/roles/permissions?limit=200'),
    ]).then(([r, p]) => {
      if (r.status === 'fulfilled') setRoles(r.value.results);
      if (p.status === 'fulfilled') setPermissions(p.value.results);
      if (r.status === 'rejected') setError(r.reason?.message ?? 'Failed to load roles');
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Roles & Permissions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Custom roles, permission definitions, and bundles.</p>
      </header>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['roles', 'permissions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.45rem 1.25rem', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600,
            background: tab === t ? 'var(--primary)' : 'var(--card)',
            color: tab === t ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${tab === t ? 'var(--primary)' : 'var(--border)'}`,
          }}>{t === 'roles' ? 'Custom Roles' : 'Permissions'}</button>
        ))}
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {tab === 'roles' ? (
            <table>
              <thead>
                <tr><th>Slug</th><th>Name</th><th>Scope</th><th>Status</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <tr key={i}>{Array.from({ length: 4 }).map((_, j) => <td key={j}><div className="shimmer" style={{ height: 14, width: 80 }} /></td>)}</tr>)
                ) : roles.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No custom roles defined yet. The 7 static roles (super_admin, admin, manager, agent, cashier, member, public) are always present.</td></tr>
                ) : roles.map(r => (
                  <tr key={r.id}>
                    <td><code style={{ fontSize: '0.8rem', color: 'var(--info)' }}>{r.slug}</code></td>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.scope ?? 'workspace'}</td>
                    <td>
                      <span style={{ padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: r.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.15)', color: r.is_active ? 'var(--success)' : 'var(--text-muted)' }}>{r.is_active ? 'active' : 'inactive'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr><th>Code</th><th>Name</th><th>Category</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <tr key={i}>{Array.from({ length: 3 }).map((_, j) => <td key={j}><div className="shimmer" style={{ height: 14, width: 120 }} /></td>)}</tr>)
                ) : permissions.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No permissions found.</td></tr>
                ) : permissions.map(p => (
                  <tr key={p.id}>
                    <td><code style={{ fontSize: '0.78rem', color: 'var(--info)', background: 'rgba(96,165,250,0.08)', padding: '2px 6px', borderRadius: 4 }}>{p.code}</code></td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.category ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {tab === 'roles' ? `${roles.length} custom roles` : `${permissions.length} permission definitions`} (plus 7 built-in static roles)
        </div>
      </div>
    </div>
  );
}
