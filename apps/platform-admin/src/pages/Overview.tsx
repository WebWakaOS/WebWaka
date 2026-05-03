import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface HealthResponse { status: string; env?: string; ts?: number; }
interface PlanList { results: { id: string; slug: string; name: string; status: string }[]; total: number; }
interface TenantList { workspaces?: { id: string }[]; total?: number; count?: number; }
interface AIUsage { total_requests?: number; total_credits?: number; workspace_count?: number; }

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

function StatCardEl({ card, loading }: { card: StatCard; loading: boolean }) {
  return (
    <article style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: 8 }} aria-hidden>{card.icon}</div>
      {loading ? (
        <div className="shimmer" style={{ height: 28, width: 80, marginBottom: 6 }} />
      ) : (
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: card.color ?? 'var(--text)', marginBottom: 4 }}>
          {card.value}
        </div>
      )}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {card.label}
      </div>
    </article>
  );
}

export default function Overview() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [plans, setPlans] = useState<PlanList | null>(null);
  const [aiUsage, setAiUsage] = useState<AIUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<HealthResponse>('/health'),
      api.get<PlanList>('/platform-admin/cp/plans?status=active&limit=20'),
      api.get<AIUsage>('/admin/ai-usage?period=today').catch(() => ({})),
    ]).then(([h, p, ai]) => {
      if (h.status === 'fulfilled') setHealth(h.value);
      if (p.status === 'fulfilled') setPlans(p.value);
      if (ai.status === 'fulfilled') setAiUsage(ai.value as AIUsage);
      setLoading(false);
    });
  }, []);

  const stats: StatCard[] = [
    { label: 'API Status', value: health?.status === 'ok' ? 'Healthy' : (health ? 'Degraded' : 'Unknown'), icon: '🟢', color: health?.status === 'ok' ? 'var(--success)' : 'var(--warning)' },
    { label: 'Active Plans', value: plans?.total ?? plans?.results?.length ?? '—', icon: '💳' },
    { label: 'AI Requests Today', value: aiUsage?.total_requests ?? '—', icon: '🤖' },
    { label: 'AI Credits Used', value: aiUsage?.total_credits != null ? `${(aiUsage.total_credits / 1000).toFixed(1)}K WC` : '—', icon: '💫' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
          {greeting}, {user?.email?.split('@')[0] ?? 'Admin'} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Platform overview — {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Stats grid */}
      <section aria-label="Platform stats" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {stats.map(s => <StatCardEl key={s.label} card={s} loading={loading} />)}
      </section>

      {/* Active plans */}
      <section style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Active Subscription Plans</span>
          <a href="/plans" style={{ fontSize: '0.8rem', color: 'var(--info)' }}>Manage plans →</a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</div>
          ) : plans?.results && plans.results.length > 0 ? (
            <table>
              <thead>
                <tr><th>Plan</th><th>Slug</th><th>Status</th></tr>
              </thead>
              <tbody>
                {plans.results.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.slug}</td>
                    <td>
                      <span style={{
                        padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                        background: p.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.15)',
                        color: p.status === 'active' ? 'var(--success)' : 'var(--text-muted)',
                      }}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active plans found.</div>
          )}
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {[
            { to: '/plans', icon: '💳', label: 'Manage Plans' },
            { to: '/flags', icon: '🚩', label: 'Feature Flags' },
            { to: '/tenants', icon: '🏢', label: 'Tenants' },
            { to: '/pilots', icon: '🚀', label: 'Pilot Operators' },
            { to: '/audit', icon: '📝', label: 'Audit Log' },
            { to: '/roles', icon: '🛡️', label: 'Roles & Permissions' },
          ].map(q => (
            <a key={q.to} href={q.to} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '1.25rem 1rem', background: 'var(--card)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--card-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--card)'; }}
            >
              <span style={{ fontSize: '1.5rem' }}>{q.icon}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{q.label}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
