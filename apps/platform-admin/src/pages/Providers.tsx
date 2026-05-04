/**
 * Provider Registry Management Page — BATCH 7
 * Platform admin interface for managing infrastructure providers.
 */

import { useState, useEffect, useCallback } from 'react';

const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

type ProviderStatus = 'active' | 'inactive' | 'testing' | 'failover' | 'deprecated';
type ProviderCategory = 'ai' | 'email' | 'sms' | 'payment' | 'identity' | 'storage';

interface Provider {
  id: string;
  category: ProviderCategory;
  provider_name: string;
  display_name: string;
  status: ProviderStatus;
  scope: string;
  priority: number;
  routing_policy: string;
  health_status: string;
  created_at: number;
}

const CATEGORY_ICONS: Record<ProviderCategory, string> = {
  ai: '🤖', email: '📧', sms: '💬', payment: '💳', identity: '🔐', storage: '📦',
};

const STATUS_COLORS: Record<ProviderStatus, string> = {
  active: '#22c55e', inactive: '#6b7280', testing: '#f59e0b', failover: '#3b82f6', deprecated: '#ef4444',
};

const HEALTH_COLORS: Record<string, string> = {
  healthy: '#22c55e', degraded: '#f59e0b', down: '#ef4444', unknown: '#6b7280',
};

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; message?: string; error?: string; latencyMs?: number } | null>(null);
  const [auditLog, setAuditLog] = useState<unknown[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [keyPool, setKeyPool] = useState<{ keys: unknown[]; pool_health: { total: number; active: number; rateLimited: number } } | null>(null);
  const [credentialForm, setCredentialForm] = useState(false);
  const [credKeys, setCredKeys] = useState('');
  const [credValues, setCredValues] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'all' ? `${API_BASE}/admin/providers` : `${API_BASE}/admin/providers?category=${selectedCategory}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { providers: Provider[] };
      setProviders(data.providers);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => { void fetchProviders(); }, [fetchProviders]);

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    try {
      await fetch(`${API_BASE}/admin/providers/${id}/activate`, { method: 'POST', headers });
      await fetchProviders();
    } catch (e) { alert(String(e)); }
    finally { setActionLoading(null); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this provider?')) return;
    setActionLoading(id);
    try {
      await fetch(`${API_BASE}/admin/providers/${id}/deactivate`, { method: 'POST', headers });
      await fetchProviders();
    } catch (e) { alert(String(e)); }
    finally { setActionLoading(null); }
  };

  const handleTest = async (id: string) => {
    setTestResult(null);
    try {
      const res = await fetch(`${API_BASE}/admin/providers/${id}/test`, { method: 'POST', headers });
      const data = await res.json() as { test: typeof testResult };
      setTestResult(data.test);
    } catch (e) { setTestResult({ ok: false, error: String(e) }); }
  };

  const handleAudit = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/providers/${id}/audit?limit=20`, { headers });
      const data = await res.json() as { audit: unknown[] };
      setAuditLog(data.audit);
      setShowAudit(true);
    } catch (e) { alert(String(e)); }
  };

  const handleKeyPool = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/providers/${id}/keys`, { headers });
      const data = await res.json() as typeof keyPool;
      setKeyPool(data);
    } catch (e) { alert(String(e)); }
  };

  const handleAddKey = async (id: string) => {
    if (!newKey.trim()) return;
    try {
      await fetch(`${API_BASE}/admin/providers/${id}/keys`, {
        method: 'POST', headers,
        body: JSON.stringify({ key: newKey.trim(), label: newKeyLabel || undefined }),
      });
      setNewKey(''); setNewKeyLabel('');
      await handleKeyPool(id);
    } catch (e) { alert(String(e)); }
  };

  const handleRotateCredentials = async (id: string) => {
    const ks = credKeys.split(',').map(k => k.trim()).filter(Boolean);
    const vs = credValues.split(',').map(v => v.trim()).filter(Boolean);
    if (ks.length !== vs.length || ks.length === 0) { alert('Provide equal comma-separated keys and values.'); return; }
    const credentials = Object.fromEntries(ks.map((k, i) => [k, vs[i] as string]));
    try {
      const res = await fetch(`${API_BASE}/admin/providers/${id}/credentials`, { method: 'POST', headers, body: JSON.stringify({ credentials }) });
      if (res.ok) { alert('Credentials rotated.'); setCredentialForm(false); setCredKeys(''); setCredValues(''); }
    } catch (e) { alert(String(e)); }
  };

  const categories = [
    { id: 'all', label: 'All' }, { id: 'ai', label: '🤖 AI' }, { id: 'email', label: '📧 Email' },
    { id: 'sms', label: '💬 SMS' }, { id: 'payment', label: '💳 Payment' }, { id: 'identity', label: '🔐 Identity' },
  ];

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>Provider Registry</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0.25rem 0 0' }}>
          Manage platform infrastructure providers. All credential changes are audit-logged.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)',
            background: selectedCategory === cat.id ? 'var(--primary)' : 'var(--dark-2)',
            color: selectedCategory === cat.id ? '#000' : 'var(--text)', cursor: 'pointer', fontSize: 13,
            fontWeight: selectedCategory === cat.id ? 700 : 400,
          }}>{cat.label}</button>
        ))}
        <button onClick={() => fetchProviders()} style={{
          marginLeft: 'auto', padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)',
          background: 'var(--dark-2)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13,
        }}>↻ Refresh</button>
      </div>

      {error && <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', color: '#fca5a5', fontSize: 14 }}>⚠ {error}</div>}
      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading providers...</div>}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {providers.filter(p => selectedCategory === 'all' || p.category === selectedCategory).map(provider => (
            <div key={provider.id}
              onClick={() => { setSelectedId(selectedId === provider.id ? null : provider.id); setTestResult(null); setShowAudit(false); setKeyPool(null); }}
              style={{
                background: 'var(--dark-2)', border: `1px solid ${selectedId === provider.id ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 10, padding: '1rem', cursor: 'pointer', transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[provider.category]}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{provider.display_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{provider.category} · {provider.scope} · p{provider.priority}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[provider.status] ?? '#6b7280', display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: STATUS_COLORS[provider.status], fontWeight: 600 }}>{provider.status}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: selectedId === provider.id ? '0.75rem' : 0 }}>
                Health: <span style={{ color: HEALTH_COLORS[provider.health_status] ?? '#6b7280' }}>{provider.health_status}</span>
                &nbsp;·&nbsp;{provider.routing_policy}
              </div>

              {selectedId === provider.id && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {provider.status !== 'active' ? (
                      <button onClick={e => { e.stopPropagation(); void handleActivate(provider.id); }} disabled={actionLoading === provider.id}
                        style={{ padding: '5px 12px', fontSize: 12, borderRadius: 5, background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {actionLoading === provider.id ? '...' : '✓ Activate'}
                      </button>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); void handleDeactivate(provider.id); }} disabled={actionLoading === provider.id}
                        style={{ padding: '5px 12px', fontSize: 12, borderRadius: 5, background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {actionLoading === provider.id ? '...' : '✕ Deactivate'}
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); void handleTest(provider.id); }}
                      style={{ padding: '5px 12px', fontSize: 12, borderRadius: 5, background: 'var(--dark)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}>⚡ Test</button>
                    <button onClick={e => { e.stopPropagation(); void handleAudit(provider.id); }}
                      style={{ padding: '5px 12px', fontSize: 12, borderRadius: 5, background: 'var(--dark)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}>📋 Audit</button>
                    {provider.category === 'ai' && (
                      <button onClick={e => { e.stopPropagation(); void handleKeyPool(provider.id); }}
                        style={{ padding: '5px 12px', fontSize: 12, borderRadius: 5, background: 'var(--dark)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}>🔑 Keys</button>
                    )}
                    <button onClick={e => { e.stopPropagation(); setCredentialForm(!credentialForm); }}
                      style={{ padding: '5px 12px', fontSize: 12, borderRadius: 5, background: '#78350f', color: '#fde68a', border: '1px solid #d97706', cursor: 'pointer' }}>🔒 Credentials</button>
                  </div>

                  {testResult && (
                    <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 5, fontSize: 12, background: testResult.ok ? '#14532d' : '#7f1d1d', color: testResult.ok ? '#86efac' : '#fca5a5', border: `1px solid ${testResult.ok ? '#22c55e' : '#ef4444'}` }}>
                      {testResult.ok ? '✓' : '✕'} {testResult.message ?? testResult.error}{testResult.latencyMs ? ` (${testResult.latencyMs}ms)` : ''}
                    </div>
                  )}

                  {credentialForm && (
                    <div style={{ marginTop: 10, padding: '10px', background: 'var(--dark)', borderRadius: 6, border: '1px solid #d97706' }}>
                      <div style={{ fontSize: 12, color: '#fde68a', fontWeight: 600, marginBottom: 6 }}>⚠ Rotate Credentials (audit-logged)</div>
                      <input type="text" placeholder="Key names: api_key,secret" value={credKeys} onChange={e => setCredKeys(e.target.value)}
                        style={{ width: '100%', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--dark-2)', color: 'var(--text)', fontSize: 12, marginBottom: 4, boxSizing: 'border-box' }} />
                      <input type="password" placeholder="Values: val1,val2" value={credValues} onChange={e => setCredValues(e.target.value)}
                        style={{ width: '100%', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--dark-2)', color: 'var(--text)', fontSize: 12, marginBottom: 6, boxSizing: 'border-box' }} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={e => { e.stopPropagation(); void handleRotateCredentials(provider.id); }}
                          style={{ padding: '4px 10px', fontSize: 11, borderRadius: 4, background: '#d97706', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save</button>
                        <button onClick={e => { e.stopPropagation(); setCredentialForm(false); }}
                          style={{ padding: '4px 10px', fontSize: 11, borderRadius: 4, background: 'var(--dark-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {keyPool && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                        Key Pool — {keyPool.pool_health.active} active / {keyPool.pool_health.rateLimited} rate-limited / {keyPool.pool_health.total} total
                      </div>
                      {(keyPool.keys as Array<{ id: string; key_label: string; status: string; successful_requests: number; total_requests: number }>).map(k => (
                        <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 8px', background: 'var(--dark)', borderRadius: 4, marginBottom: 2, fontSize: 11 }}>
                          <span>{k.key_label} — <span style={{ color: k.status === 'active' ? '#22c55e' : '#ef4444' }}>{k.status}</span></span>
                          <span style={{ color: 'var(--text-muted)' }}>{k.successful_requests}/{k.total_requests}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        <input type="password" placeholder="New API key" value={newKey} onChange={e => setNewKey(e.target.value)}
                          style={{ flex: 1, padding: '3px 6px', borderRadius: 3, border: '1px solid var(--border)', background: 'var(--dark-2)', color: 'var(--text)', fontSize: 11 }} />
                        <input type="text" placeholder="Label" value={newKeyLabel} onChange={e => setNewKeyLabel(e.target.value)}
                          style={{ width: 70, padding: '3px 6px', borderRadius: 3, border: '1px solid var(--border)', background: 'var(--dark-2)', color: 'var(--text)', fontSize: 11 }} />
                        <button onClick={e => { e.stopPropagation(); void handleAddKey(provider.id); }}
                          style={{ padding: '3px 8px', fontSize: 11, borderRadius: 3, background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer' }}>+ Add</button>
                      </div>
                    </div>
                  )}

                  {showAudit && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Audit Log (last 20)</div>
                      {(auditLog as Array<{ id: string; action: string; actor_id: string | null; actor_role: string | null; created_at: number }>).map(entry => (
                        <div key={entry.id} style={{ padding: '3px 8px', background: 'var(--dark)', borderRadius: 4, marginBottom: 2, fontSize: 11, color: 'var(--text-muted)' }}>
                          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{entry.action}</span>
                          {' by '}{entry.actor_id?.slice(0, 12) ?? 'system'}{' ('}{entry.actor_role}{') — '}
                          {new Date(entry.created_at * 1000).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {providers.filter(p => selectedCategory === 'all' || p.category === selectedCategory).length === 0 && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No providers found for this category.</div>
          )}
        </div>
      )}
    </div>
  );
}
