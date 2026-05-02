/**
 * Login page — enter API base, partner ID, JWT.
 * Credentials are saved to localStorage for subsequent sessions.
 */
import { useState, FormEvent } from 'react';
import type { Credentials } from '../lib/api';

interface Props { onLogin: (c: Credentials) => void; }

const LS_KEY = 'pa_creds';

function savedField(field: keyof Credentials): string {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return (JSON.parse(raw) as Credentials)[field] ?? '';
  } catch { /* ignore */ }
  return '';
}

export default function Login({ onLogin }: Props) {
  const [apiBase,    setApiBase]    = useState(() => savedField('apiBase')    || 'https://api.webwaka.com');
  const [partnerId,  setPartnerId]  = useState(() => savedField('partnerId'));
  const [jwt,        setJwt]        = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!partnerId.trim() || !jwt.trim()) { setError('Partner ID and JWT are required.'); return; }
    setError('');
    setLoading(true);
    try {
      // Quick liveness check using credits endpoint
      const res = await fetch(
        `${apiBase.replace(/\/+$/, '')}/partners/${partnerId.trim()}/credits`,
        { headers: { Authorization: `Bearer ${jwt.trim()}`, 'X-Partner-ID': partnerId.trim() } },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        setError(d.error ?? `Auth failed (${res.status})`);
      } else {
        onLogin({ apiBase: apiBase.trim(), partnerId: partnerId.trim(), jwt: jwt.trim() });
      }
    } catch {
      setError('Network error — check API base URL.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1.5rem',
      background: 'var(--bg)',
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '2.5rem 2rem', width: '100%', maxWidth: 420,
      }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 6, color: 'var(--green)' }}>
          WebWaka
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Partner Admin Portal
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontWeight: 600 }}>API Base URL</span>
            <input
              type="url" value={apiBase}
              onChange={e => setApiBase(e.target.value)}
              placeholder="https://api.webwaka.com"
              style={{ width: '100%' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontWeight: 600 }}>Partner ID</span>
            <input
              type="text" value={partnerId}
              onChange={e => setPartnerId(e.target.value)}
              placeholder="partner_xxx"
              autoComplete="username"
              style={{ width: '100%' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontWeight: 600 }}>JWT Token</span>
            <input
              type="password" value={jwt}
              onChange={e => setJwt(e.target.value)}
              placeholder="eyJhbGciOi..."
              autoComplete="current-password"
              style={{ width: '100%' }}
            />
          </label>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: -4 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem', background: 'var(--blue)', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.9375rem',
              opacity: loading ? 0.7 : 1, marginTop: 4,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
