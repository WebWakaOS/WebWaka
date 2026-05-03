import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface PilotOperator {
  id: string;
  workspace_id: string;
  tenant_id: string;
  operator_name?: string;
  status: string;
  onboarded_at?: string;
  first_txn_at?: string;
}

interface PilotSummary {
  total: number;
  active: number;
  pending: number;
  graduated: number;
  avg_nps?: number;
  feedback_count?: number;
}

export default function Pilots() {
  const [operators, setOperators] = useState<PilotOperator[]>([]);
  const [summary, setSummary] = useState<PilotSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      api.get<{ operators: PilotOperator[] }>('/platform-admin/pilots'),
      api.get<PilotSummary>('/platform-admin/pilots/summary'),
    ]).then(([ops, sum]) => {
      if (ops.status === 'fulfilled') setOperators(ops.value.operators ?? []);
      if (sum.status === 'fulfilled') setSummary(sum.value);
      if (ops.status === 'rejected') setError(ops.reason?.message ?? 'Failed to load pilots');
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/platform-admin/pilots/${id}/status`, { status });
      load();
    } catch (err) { alert(`Failed: ${err instanceof Error ? err.message : err}`); }
  };

  const statusColor: Record<string, { bg: string; color: string }> = {
    active: { bg: 'rgba(34,197,94,0.12)', color: 'var(--success)' },
    pending: { bg: 'rgba(245,158,11,0.12)', color: 'var(--warning)' },
    graduated: { bg: 'rgba(96,165,250,0.12)', color: 'var(--info)' },
    suspended: { bg: 'rgba(239,68,68,0.12)', color: 'var(--danger)' },
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Pilot Operators</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage the controlled pilot cohort before public launch.</p>
      </header>

      {/* Summary stats */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Pilots', value: summary.total, icon: '🚀' },
            { label: 'Active', value: summary.active, icon: '✅' },
            { label: 'Pending', value: summary.pending, icon: '⏳' },
            { label: 'Graduated', value: summary.graduated, icon: '🎓' },
            { label: 'Avg NPS', value: summary.avg_nps != null ? summary.avg_nps.toFixed(1) : '—', icon: '⭐' },
            { label: 'Feedback', value: summary.feedback_count ?? 0, icon: '💬' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', padding: '1rem', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Workspace</th><th>Operator</th><th>Status</th><th>Onboarded</th><th>First Txn</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="shimmer" style={{ height: 14, width: 80 }} /></td>)}</tr>)
              ) : operators.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No pilot operators found.</td></tr>
              ) : operators.map(op => {
                const sc = statusColor[op.status] ?? statusColor.pending;
                return (
                  <tr key={op.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{op.workspace_id.slice(0, 12)}...</td>
                    <td style={{ fontWeight: 500 }}>{op.operator_name ?? '—'}</td>
                    <td><span style={{ padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, background: sc.bg, color: sc.color }}>{op.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{op.onboarded_at ? new Date(op.onboarded_at).toLocaleDateString() : '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{op.first_txn_at ? new Date(op.first_txn_at).toLocaleDateString() : 'None yet'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {op.status !== 'active' && op.status !== 'graduated' && (
                          <button onClick={() => updateStatus(op.id, 'active')} style={{ padding: '0.2rem 0.6rem', background: 'rgba(34,197,94,0.12)', color: 'var(--success)', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>Activate</button>
                        )}
                        {op.status === 'active' && (
                          <button onClick={() => updateStatus(op.id, 'graduated')} style={{ padding: '0.2rem 0.6rem', background: 'rgba(96,165,250,0.12)', color: 'var(--info)', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>Graduate</button>
                        )}
                        {op.status !== 'suspended' && (
                          <button onClick={() => updateStatus(op.id, 'suspended')} style={{ padding: '0.2rem 0.6rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>Suspend</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
