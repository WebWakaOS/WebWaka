/**
 * Platform Admin — C5: Super Admin tools merged into workspace-app
 * Role-gated: super_admin only
 */
import React, { useState, useEffect } from 'react';
import AdminHITL from './AdminHITL';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';

// ------------- Types -------------
interface ClaimRequest {
  id: string;
  profileId: string;
  subjectType: string;
  subjectId: string;
  claimState: string;
  requesterEmail: string;
  requesterName: string | null;
  status: string;
  verificationMethod: string | null;
  rejectionReason: string | null;
  expiresAt: number | null;
  createdAt: number;
}

interface ClaimsResponse {
  claims: ClaimRequest[];
  total: number;
}

interface Tenant {
  id: string;
  name: string;
  status: string;
  plan: string;
  createdAt: number;
}

// ------------- Sub-pages -------------

function PlatformOverview() {
  const [stats, setStats] = React.useState<{ tenants: number; partners: number; pendingClaims: number; pendingHITL: number } | null>(null);
  React.useEffect(() => {
    Promise.all([
      api.get<{ total?: number; tenants?: unknown[] }>('/platform/tenants?limit=1').catch(() => null),
      api.get<{ total?: number; partners?: unknown[] }>('/platform/partners?limit=1').catch(() => null),
      api.get<{ claims?: unknown[] }>('/admin/claims?status=pending&limit=50').catch(() => null),
    ]).then(([t, p, cl]) => {
      setStats({
        tenants: (t as { total?: number } | null)?.total ?? (t as { tenants?: unknown[] } | null)?.tenants?.length ?? 0,
        partners: (p as { total?: number } | null)?.total ?? (p as { partners?: unknown[] } | null)?.partners?.length ?? 0,
        pendingClaims: (cl as { claims?: unknown[] } | null)?.claims?.length ?? 0,
        pendingHITL: 0,
      });
    });
  }, []);
  const kpis = [
    { label: 'Total Tenants', value: stats?.tenants ?? '—', color: '#0F4C81', icon: '🏢' },
    { label: 'Partners', value: stats?.partners ?? '—', color: '#7c3aed', icon: '🤝' },
    { label: 'Pending Claims', value: stats?.pendingClaims ?? '—', color: stats?.pendingClaims ? '#dc2626' : '#16a34a', icon: '📋' },
    { label: 'HITL Queue', value: stats?.pendingHITL ?? '—', color: '#d97706', icon: '🤖' },
  ];
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Platform Overview</h2>
      {/* KPI stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28 }} aria-hidden="true">{k.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Claims', icon: '📋', href: '/platform/claims', desc: 'Review claim requests' },
          { label: 'Tenants', icon: '🏢', href: '/platform/tenants', desc: 'Manage organizations' },
          { label: 'Templates', icon: '🧩', href: '/platform/templates', desc: 'Marketplace approvals' },
          { label: 'Support', icon: '🎫', href: '/platform/support', desc: 'Ticket queue' },
          { label: 'Platform Settings', icon: '⚙️', href: '/platform/settings', desc: 'System configuration' },
        ].map(card => (
          <NavLink key={card.href} to={card.href}
            style={{
              textDecoration: 'none', background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 12, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 8,
              transition: 'box-shadow 0.15s',
            }}
          >
            <span style={{ fontSize: 28 }}>{card.icon}</span>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{card.label}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{card.desc}</div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function PlatformClaims() {
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const data = await api.get<ClaimsResponse>(`/admin/claims?status=${statusFilter}&limit=50`);
      setClaims(data.claims ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        toast.error('Access denied — super admin role required');
      } else {
        toast.error('Failed to load claims');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadClaims(); }, [statusFilter]);

  const approveClaim = async (id: string) => {
    setProcessing(id);
    try {
      await api.post(`/admin/claims/${id}/approve`);
      toast.success('Claim approved');
      void loadClaims();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to approve claim');
    } finally { setProcessing(null); }
  };

  const rejectClaim = async (id: string) => {
    setProcessing(id);
    try {
      await api.post(`/admin/claims/${id}/reject`, { reason: 'Rejected by platform admin' });
      toast.success('Claim rejected');
      void loadClaims();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to reject claim');
    } finally { setProcessing(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Claim Requests</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {['pending', 'approved', 'rejected', 'all'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '6px 14px', borderRadius: 16, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', border: '1.5px solid',
              borderColor: statusFilter === s ? '#0F4C81' : '#e5e7eb',
              background: statusFilter === s ? '#0F4C81' : '#fff',
              color: statusFilter === s ? '#fff' : '#374151',
            }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading claims…</p>
      ) : claims.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#f9fafb', borderRadius: 12 }}>
          <p style={{ color: '#6b7280' }}>No {statusFilter} claims found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {claims.map(claim => (
            <div key={claim.id} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                    {claim.requesterName ?? claim.requesterEmail}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 2 }}>
                    Profile: {claim.profileId.slice(0, 16)}… | Type: {claim.subjectType}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>
                    Submitted: {new Date(claim.createdAt * 1000).toLocaleDateString()}
                    {claim.verificationMethod && ` | Method: ${claim.verificationMethod}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 20,
                    background: claim.status === 'pending' ? '#fef9c3' : claim.status === 'approved' ? '#dcfce7' : '#fee2e2',
                    color: claim.status === 'pending' ? '#92400e' : claim.status === 'approved' ? '#166534' : '#991b1b',
                    fontWeight: 700,
                  }}>{claim.status.toUpperCase()}</span>
                  {claim.status === 'pending' && (
                    <>
                      <Button size="sm" loading={processing === claim.id}
                        style={{ background: '#059669', borderColor: '#059669' }}
                        onClick={() => void approveClaim(claim.id)}>✓ Approve</Button>
                      <Button size="sm" variant="danger" loading={processing === claim.id}
                        onClick={() => void rejectClaim(claim.id)}>✕ Reject</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<{ tenants: Tenant[] }>('/platform/tenants?limit=100')
      .then(r => setTenants(r.tenants ?? []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? tenants.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.status?.toLowerCase().includes(search.toLowerCase()))
    : tenants;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Tenants</h2>
        <input
          type="search" placeholder="Search tenants…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, minWidth: 200, outline: 'none' }}
          aria-label="Search tenants"
        />
      </div>
      {loading ? (
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading tenants…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', background: '#f9fafb', borderRadius: 12 }}>
          <p style={{ color: '#6b7280' }}>No tenants found or you lack permission.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(t => (
            <div key={t.id} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{t.name ?? t.id}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>ID: {t.id} | Plan: {t.plan}</div>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 12,
                background: t.status === 'active' ? '#dcfce7' : '#fee2e2',
                color: t.status === 'active' ? '#166534' : '#991b1b',
                fontWeight: 600,
              }}>{t.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------- Platform Settings Page (DB-backed via WALLET_KV) -------------

function PlatformSettings() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Platform bank account (for receiving WebWaka subscription payments)
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [bankSource, setBankSource] = useState<'kv' | 'env' | 'none'>('none');

  // Platform config
  const [platformName, setPlatformName] = useState('WebWaka OS');
  const [ussdShortcode, setUssdShortcode] = useState('*384#');
  const [defaultPlan, setDefaultPlan] = useState('free');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    // Load current platform bank account from /platform-admin/settings/payment
    api.get<{
      bank_account: { bank_name: string; account_number: string; account_name: string; bank_code?: string; sort_code?: string } | null;
      source: 'kv' | 'env' | 'none';
    }>('/platform-admin/settings/payment')
      .then(res => {
        if (res.bank_account) {
          setBankName(res.bank_account.bank_name ?? '');
          setAccountNumber(res.bank_account.account_number ?? '');
          setAccountName(res.bank_account.account_name ?? '');
          setBankCode(res.bank_account.bank_code ?? '');
          setSortCode(res.bank_account.sort_code ?? '');
        }
        setBankSource(res.source);
      })
      .catch(() => { /* silently fail */ })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      toast.error('Bank name, account number, and account name are required');
      return;
    }
    if (!/^\d{10}$/.test(accountNumber.trim())) {
      toast.error('Account number must be exactly 10 digits (Nigerian NUBAN format)');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/platform-admin/settings/payment', {
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        ...(bankCode.trim() ? { bank_code: bankCode.trim() } : {}),
        ...(sortCode.trim() ? { sort_code: sortCode.trim() } : {}),
      });
      setBankSource('kv');
      setSaved(true);
      toast.success('Platform bank account saved');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save bank account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24, color: '#6b7280' }}>Loading settings…</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Platform Settings</h2>

      {/* ── Platform receiving bank account ───────────────────────────── */}
      <form onSubmit={handleSaveBankAccount}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 20, maxWidth: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Platform Receiving Bank Account</h3>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 999,
              background: bankSource === 'kv' ? '#f0fdf4' : bankSource === 'env' ? '#fef9c3' : '#fef2f2',
              color: bankSource === 'kv' ? '#166534' : bankSource === 'env' ? '#92400e' : '#dc2626',
              border: `1px solid ${bankSource === 'kv' ? '#bbf7d0' : bankSource === 'env' ? '#fde68a' : '#fecaca'}`,
              fontWeight: 600,
            }}>
              {bankSource === 'kv' ? 'Saved in KV ✓' : bankSource === 'env' ? 'From env var' : 'Not configured'}
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
            This is the account where <strong>WebWaka</strong> receives subscription payments from workspace owners
            when they upgrade their plan via bank transfer. Different from each business's own customer payment account.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Bank Name *</label>
              <input value={bankName} onChange={e => setBankName(e.target.value)} required placeholder="e.g. Zenith Bank Nigeria"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Account Name *</label>
              <input value={accountName} onChange={e => setAccountName(e.target.value)} required placeholder="WebWaka Technologies Limited"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Account Number * <span style={{ color: '#9ca3af', fontWeight: 400 }}>(10-digit NUBAN)</span></label>
              <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required
                placeholder="0123456789" maxLength={10} pattern="\d{10}"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44, fontFamily: 'monospace', letterSpacing: '0.1em' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Bank Code (optional)</label>
                <input value={bankCode} onChange={e => setBankCode(e.target.value)} placeholder="057"
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Sort Code (optional)</label>
                <input value={sortCode} onChange={e => setSortCode(e.target.value)} placeholder=""
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
              </div>
            </div>
          </div>

          {saved && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#166534' }}>
              ✓ Platform bank account saved to KV storage. Takes effect immediately on all new upgrade requests.
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <Button type="submit" loading={saving} size="md">Save Platform Bank Account</Button>
          </div>
        </div>
      </form>

      {/* ── General platform settings ─────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>General</h3>
        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
          These settings are informational — update the corresponding Cloudflare Worker vars to change runtime behavior.
        </p>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Platform Name</label>
          <input value={platformName} onChange={e => setPlatformName(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>USSD Shortcode</label>
          <input value={ussdShortcode} onChange={e => setUssdShortcode(e.target.value)} placeholder="*384#"
            style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }} />
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>NCC registration pending. Update when approved.</p>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Default Plan for New Tenants</label>
          <select value={defaultPlan} onChange={e => setDefaultPlan(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 15, minHeight: 44 }}>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            role="switch"
            aria-checked={maintenanceMode}
            onClick={() => setMaintenanceMode(v => !v)}
            style={{
              width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
              background: maintenanceMode ? '#dc2626' : '#e5e7eb',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 3, left: maintenanceMode ? 22 : 3,
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s',
            }} />
          </button>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: maintenanceMode ? '#dc2626' : '#111827' }}>
              {maintenanceMode ? 'Maintenance mode ON' : 'Platform operational'}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Toggle via Cloudflare Worker vars for production effect</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------- Main Platform Admin wrapper -------------


// ──────────────────────────────────────────────────────────────────────────────
// Wave 2: Audit Log Viewer
// ──────────────────────────────────────────────────────────────────────────────
function PlatformAuditLog() {
  interface AuditEntry { id: string; actor_email: string; action: string; entity: string; entity_id: string; created_at: number; meta: string | null }
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get<{ log: AuditEntry[] }>('/platform/audit-log?limit=100')
      .then(r => setEntries(r.log ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter(e =>
    !filter || e.actor_email.includes(filter) || e.action.includes(filter) || e.entity.includes(filter)
  );

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Audit Log</h2>
      <Input value={filter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)} placeholder="Filter by actor, action, or entity…" style={{ marginBottom: 16, maxWidth: 360 }} />
      {loading ? <p style={{ color: '#9ca3af' }}>Loading…</p> : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          {filter ? 'No entries match your filter.' : 'No audit log entries yet.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Time', 'Actor', 'Action', 'Entity', 'ID'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '8px 12px', color: '#9ca3af', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {new Date(e.created_at * 1000).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.actor_email}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 500 }}>{e.action}</td>
                  <td style={{ padding: '8px 12px', color: '#6b7280' }}>{e.entity}</td>
                  <td style={{ padding: '8px 12px', color: '#9ca3af', fontFamily: 'monospace', fontSize: 11 }}>{e.entity_id?.slice(0, 8)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Wave 2: Partner Management
// ──────────────────────────────────────────────────────────────────────────────
function PlatformPartners() {
  interface PartnerRow { id: string; name: string; status: string; sub_tenant_count: number; created_at: number }
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ partners: PartnerRow[] }>('/platform/partners?limit=100')
      .then(r => setPartners(r.partners ?? []))
      .catch(() => setPartners([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    setActing(id);
    try {
      await api.patch(`/platform/partners/${id}`, { status: newStatus });
      setPartners(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast.success(`Partner ${newStatus}`);
    } catch {
      toast.error('Action failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Partner Accounts</h2>
      {loading ? <p style={{ color: '#9ca3af' }}>Loading…</p> : partners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
          No partner accounts yet.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Partner', 'Sub-Tenants', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partners.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '10px 12px' }}>{p.sub_tenant_count}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: p.status === 'active' ? '#dcfce7' : '#fee2e2', color: p.status === 'active' ? '#16a34a' : '#dc2626' }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 12 }}>
                  {new Date(p.created_at * 1000).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <button onClick={() => toggle(p.id, p.status)} disabled={acting === p.id}
                    style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid', borderColor: p.status === 'suspended' ? '#d1fae5' : '#fecaca', background: p.status === 'suspended' ? '#f0fdf4' : '#fff5f5', color: p.status === 'suspended' ? '#059669' : '#dc2626' }}>
                    {acting === p.id ? '…' : p.status === 'suspended' ? 'Activate' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Wave 2: Feature Flags
// ──────────────────────────────────────────────────────────────────────────────
// ─── E2-4: Template Marketplace Approval Queue ───────────────────────────────
interface TemplateSubmission {
  id: string;
  name: string;
  vertical: string;
  submitted_by: string;
  status: string;
  created_at: string;
}

function PlatformTemplates() {
  const [items, setItems] = React.useState<TemplateSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [acting, setActing] = React.useState<string | null>(null);

  const load = () => {
    api.get<{ templates: TemplateSubmission[] }>('/platform/templates?status=pending&limit=50')
      .then(r => setItems(r.templates ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };
  React.useEffect(load, []);

  const decide = async (id: string, action: 'approve' | 'reject') => {
    setActing(id);
    try {
      await api.patch(`/platform/templates/${id}`, { status: action === 'approve' ? 'approved' : 'rejected' });
      toast.success(`Template ${action}d`);
      load();
    } catch { toast.error('Action failed'); }
    finally { setActing(null); }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Template Marketplace Approvals</h2>
      {loading ? <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading…</p> : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>&#x2705;</div>
          <p style={{ color: '#6b7280' }}>No templates pending approval.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(t => (
            <div key={t.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Vertical: {t.vertical} · Submitted by: {t.submitted_by}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => void decide(t.id, 'approve')} disabled={acting === t.id}
                  style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#dcfce7', color: '#16a34a', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {acting === t.id ? '…' : 'Approve'}
                </button>
                <button onClick={() => void decide(t.id, 'reject')} disabled={acting === t.id}
                  style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  {acting === t.id ? '…' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── E2-9: Support Ticket Queue ───────────────────────────────────────────────
interface SupportTicket {
  id: string;
  subject: string;
  tenant_name: string;
  priority: string;
  status: string;
  created_at: string;
  last_message?: string;
}

function PlatformSupport() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'open' | 'all'>('open');
  const [replyId, setReplyId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState('');
  const [acting, setActing] = React.useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get<{ tickets: SupportTicket[] }>(`/platform/support-tickets?status=${filter}&limit=50`)
      .then(r => setTickets(r.tickets ?? []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };
  React.useEffect(load, [filter]);

  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setActing(id);
    try {
      await api.post(`/platform/support-tickets/${id}/reply`, { message: replyText });
      toast.success('Reply sent');
      setReplyId(null);
      setReplyText('');
      load();
    } catch { toast.error('Failed to send reply'); }
    finally { setActing(null); }
  };

  const closeTicket = async (id: string) => {
    setActing(id);
    try {
      await api.patch(`/platform/support-tickets/${id}`, { status: 'closed' });
      toast.success('Ticket closed');
      load();
    } catch { toast.error('Failed'); }
    finally { setActing(null); }
  };

  const priorityColor = (p: string) => ({ high: '#dc2626', medium: '#d97706', low: '#16a34a' } as Record<string,string>)[p] ?? '#6b7280';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Support Tickets</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['open', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 14px', borderRadius: 20, border: '1.5px solid', borderColor: filter === f ? '#0F4C81' : '#e5e7eb', background: filter === f ? '#0F4C81' : '#fff', color: filter === f ? '#fff' : '#374151', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              {f === 'open' ? 'Open' : 'All'}
            </button>
          ))}
        </div>
      </div>
      {loading ? <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading…</p> : tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>&#x1F3AB;</div>
          <p style={{ color: '#6b7280' }}>No {filter === 'open' ? 'open ' : ''}support tickets.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tickets.map(t => (
            <div key={t.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.subject}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {t.tenant_name} · <span style={{ color: priorityColor(t.priority), fontWeight: 600 }}>{t.priority ?? 'normal'}</span> · {t.status}
                  </div>
                  {t.last_message && <p style={{ fontSize: 13, color: '#374151', marginTop: 6, fontStyle: 'italic' }}>&ldquo;{t.last_message}&rdquo;</p>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setReplyId(replyId === t.id ? null : t.id); setReplyText(''); }}
                    style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#374151', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                    Reply
                  </button>
                  {t.status !== 'closed' && (
                    <button onClick={() => void closeTicket(t.id)} disabled={acting === t.id}
                      style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                      Close
                    </button>
                  )}
                </div>
              </div>
              {replyId === t.id && (
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply…" rows={2}
                    style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  <button onClick={() => void sendReply(t.id)} disabled={acting === t.id || !replyText.trim()}
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#0F4C81', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    {acting === t.id ? '…' : 'Send'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformFeatureFlags() {
  interface Flag { key: string; label: string; enabled: boolean; description: string }
  const DEFAULT_FLAGS: Flag[] = [
    { key: 'ai_assistant',     label: 'AI Assistant',         enabled: true,  description: 'Enable AI assistant for all tenants' },
    { key: 'wakapage_gallery', label: 'WakaPage Gallery Block', enabled: true, description: 'Allow gallery blocks on WakaPage' },
    { key: 'pos_loyalty',      label: 'POS Loyalty Points',   enabled: true,  description: 'Enable loyalty point earning/redeeming' },
    { key: 'public_discovery', label: 'Public Discovery',     enabled: true,  description: 'Show businesses in public discovery app' },
    { key: 'partner_portal',   label: 'Partner Portal',       enabled: false, description: 'Enable partner portal access' },
    { key: 'e2e_encryption',   label: 'E2E Encryption',       enabled: false, description: 'End-to-end encrypt sensitive workspace data' },
    { key: 'advanced_analytics', label: 'Advanced Analytics', enabled: false, description: 'Extended analytics and export features' },
  ];

  const [flags, setFlags] = useState<Flag[]>(DEFAULT_FLAGS);
  const [saving, setSaving] = useState<string | null>(null);

  const toggle = async (key: string) => {
    const flag = flags.find(f => f.key === key);
    if (!flag) return;
    setSaving(key);
    const newVal = !flag.enabled;
    try {
      await api.patch(`/platform/feature-flags/${key}`, { enabled: newVal });
      setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: newVal } : f));
      toast.success(`Feature "${flag.label}" ${newVal ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update feature flag');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Feature Flags</h2>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Toggle platform-wide features. Changes take effect immediately.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {flags.map(f => (
          <div key={f.key} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{f.label}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{f.description}</div>
              <code style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '1px 6px', borderRadius: 4, marginTop: 4, display: 'inline-block' }}>{f.key}</code>
            </div>
            <button onClick={() => toggle(f.key)} disabled={saving === f.key}
              style={{
                width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', position: 'relative',
                background: f.enabled ? '#0F4C81' : '#e5e7eb', transition: 'background 0.2s', flexShrink: 0,
              }}>
              <div style={{
                width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute',
                top: 3, left: f.enabled ? 24 : 4, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlatformAdmin() {
  const { user } = useAuth();

  if (user?.role !== 'super_admin') {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden="true">🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>Platform Admin requires the super_admin role.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto' }} id="main-content">
      <header style={{ marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }} aria-hidden="true">🛡️</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Platform Admin</h1>
            <p style={{ fontSize: 13, color: '#6b7280' }}>System-level controls for super admins</p>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 4, marginTop: 16, flexWrap: 'wrap' }} aria-label="Platform admin sections">
          {[
            { to: '/platform', label: 'Overview', end: true },
            { to: '/platform/claims', label: 'Claims' },
            { to: '/platform/tenants', label: 'Tenants' },
            { to: '/platform/settings', label: 'Settings' },
            { to: '/platform/partners', label: 'Partners' },
            { to: '/platform/hitl', label: 'HITL Queue' },
            { to: '/platform/templates', label: 'Templates' },
            { to: '/platform/support', label: 'Support' },
            { to: '/platform/audit-log', label: 'Audit Log' },
            { to: '/platform/feature-flags', label: 'Feature Flags' },
          ].map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => ({
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                textDecoration: 'none', border: '1.5px solid',
                borderColor: isActive ? '#0F4C81' : '#e5e7eb',
                background: isActive ? '#0F4C81' : '#fff',
                color: isActive ? '#fff' : '#374151',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Routes>
        <Route index element={<PlatformOverview />} />
        <Route path="claims" element={<PlatformClaims />} />
        <Route path="tenants" element={<PlatformTenants />} />
        <Route path="settings" element={<PlatformSettings />} />
        <Route path="partners" element={<PlatformPartners />} />
        <Route path="hitl" element={<AdminHITL />} />
        <Route path="templates" element={<PlatformTemplates />} />
        <Route path="support" element={<PlatformSupport />} />
        <Route path="audit-log" element={<PlatformAuditLog />} />
        <Route path="feature-flags" element={<PlatformFeatureFlags />} />
        <Route path="*" element={<Navigate to="/platform" replace />} />
      </Routes>
    </div>
  );
}
