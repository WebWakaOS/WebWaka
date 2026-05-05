/**
 * Entitlements page — Read-only view of partner entitlements granted by the platform.
 *
 * Entitlements are features/limits granted by WebWaka super-admins.
 * Partners can see them but not modify them.
 */
import { useEffect, useState, useCallback } from 'react';
import { partnersApi, type Entitlement } from '../lib/api';
import { fmtDate } from '../lib/utils';
import { PageLoader, ErrorMsg, EmptyState, Card } from '../lib/components';

const DIMENSION_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  max_sub_partners:         { label: 'Max Sub-Partners',        icon: '🏢', description: 'Maximum number of sub-tenant accounts you can create.' },
  revenue_share_bps:        { label: 'Revenue Share Rate',      icon: '💰', description: 'Your share of GMV in basis points (100 bps = 1%).' },
  white_label:              { label: 'White-Label Access',       icon: '🎨', description: 'Ability to customise the portal with your own branding.' },
  custom_domain:            { label: 'Custom Domain',           icon: '🌐', description: 'Ability to use a custom domain for the white-label portal.' },
  attribution_removal:      { label: 'Attribution Removal',     icon: '🔖', description: 'Remove WebWaka attribution badge from your portal.' },
  api_access:               { label: 'API Access',              icon: '🔌', description: 'Access to the WebWaka Partner API for custom integrations.' },
  credit_pool_wc:           { label: 'Credit Pool Size (WC)',   icon: '💳', description: 'Maximum WakaCreditUnits you can hold in your pool.' },
  priority_support:         { label: 'Priority Support',        icon: '🎯', description: 'Access to priority support SLA.' },
  dedicated_account_manager:{ label: 'Account Manager',         icon: '👤', description: 'Dedicated account manager assigned to your partner account.' },
};

function formatValue(dimension: string, value: string): string {
  if (dimension === 'revenue_share_bps') {
    const bps = parseInt(value, 10);
    if (!isNaN(bps)) return `${(bps / 100).toFixed(2)}% (${bps} bps)`;
  }
  if (value === 'true' || value === '1')  return '✅ Enabled';
  if (value === 'false' || value === '0') return '❌ Disabled';
  if (!isNaN(Number(value)))              return Number(value).toLocaleString();
  return value;
}

export default function Entitlements() {
  const [rows,    setRows]    = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const d = await partnersApi.entitlements();
      setRows(d.entitlements ?? []);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const active  = rows.filter(r => !r.expires_at || new Date(r.expires_at) > new Date());
  const expired = rows.filter(r => r.expires_at && new Date(r.expires_at) <= new Date());

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontWeight: 700, fontSize: '1.3125rem' }}>Entitlements</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: 4 }}>
          Features and limits granted to your partner account by WebWaka. Contact your account manager to request changes.
        </p>
      </div>

      {error && <ErrorMsg message={error} onRetry={load} />}
      {loading && <PageLoader label="Loading entitlements…" />}

      {!loading && rows.length === 0 && !error && (
        <EmptyState
          icon="🔑"
          title="No Entitlements Configured"
          description="Your partner entitlements haven't been set up yet. Contact your WebWaka account manager to get started."
        />
      )}

      {!loading && active.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: '0.875rem' }}>
            Active Entitlements ({active.length})
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
            {active.map(e => {
              const meta = DIMENSION_LABELS[e.dimension] ?? { label: e.dimension, icon: '🔑', description: '' };
              const expiresLabel = e.expires_at
                ? `Expires ${fmtDate(e.expires_at)}`
                : 'No expiry';
              return (
                <Card key={e.id} style={{ position: 'relative', overflow: 'hidden' }}>
                  {/* Accent strip */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg, var(--green), var(--blue))',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingTop: 4 }}>
                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{meta.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{meta.label}</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green)', margin: '4px 0' }}>
                        {formatValue(e.dimension, e.value)}
                      </div>
                      {meta.description && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: 6 }}>
                          {meta.description}
                        </p>
                      )}
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span>Granted {fmtDate(e.granted_at)}</span>
                        <span style={{ color: e.expires_at ? '#fbbf24' : 'var(--muted)' }}>{expiresLabel}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {!loading && expired.length > 0 && (
        <section>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: '0.875rem' }}>
            Expired Entitlements ({expired.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {expired.map(e => {
              const meta = DIMENSION_LABELS[e.dimension] ?? { label: e.dimension, icon: '🔑', description: '' };
              return (
                <div key={e.id} style={{
                  background: 'var(--dark)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '0.75rem 1rem', opacity: 0.6,
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                  <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{meta.icon}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{meta.label}</span>
                    <span style={{ marginLeft: '0.625rem', color: 'var(--muted)', fontSize: '0.8125rem' }}>
                      {formatValue(e.dimension, e.value)}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#f87171' }}>
                    Expired {fmtDate(e.expires_at!)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--dark)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          💡 <strong style={{ color: 'var(--text)' }}>Want more?</strong>{' '}
          Entitlements are managed by WebWaka. To upgrade limits, request additional features, or renew expiring entitlements,
          contact your assigned account manager or email{' '}
          <a href="mailto:partners@webwaka.com">partners@webwaka.com</a>.
        </p>
      </div>
    </div>
  );
}
