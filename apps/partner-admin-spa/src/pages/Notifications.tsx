/**
 * Notifications page — E1-7: Partner notification inbox
 */
import { useEffect, useState, useCallback } from 'react';
import { partnersApi, type Notification } from '../lib/api';

export default function Notifications() {
  const [notifs,   setNotifs]   = useState<Notification[]>([]);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [acking,   setAcking]   = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const d = await partnersApi.notifications();
      setNotifs(d.notifications);
      setError('');
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleAck(id: string) {
    setAcking(s => new Set(s).add(id));
    try {
      await partnersApi.ackNotification(id);
      setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    } catch { /* ignore */ } finally {
      setAcking(s => { const ns = new Set(s); ns.delete(id); return ns; });
    }
  }

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700 }}>Notifications</h2>
        {unread > 0 && (
          <span style={{
            background: '#dc2626', color: '#fff', borderRadius: 20,
            padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700,
          }}>
            {unread} new
          </span>
        )}
      </div>

      {error   && <p style={{ color: '#ef4444' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}
      {!loading && notifs.length === 0 && !error && (
        <p style={{ color: 'var(--muted)' }}>No notifications yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {notifs.map(n => (
          <div key={n.id} style={{
            background: n.read ? 'var(--dark)' : 'var(--card)',
            border: `1px solid ${n.read ? 'var(--border)' : '#1e3a5f'}`,
            borderRadius: 10, padding: '0.875rem 1rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
          }}>
            {!n.read && (
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
                flexShrink: 0, marginTop: 6,
              }} />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: n.read ? 400 : 600, fontSize: '0.875rem', lineHeight: 1.5 }}>
                {n.message}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                {n.type} · {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
            {!n.read && (
              <button
                onClick={() => handleAck(n.id)}
                disabled={acking.has(n.id)}
                style={{
                  flexShrink: 0, padding: '4px 10px',
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 6, color: 'var(--muted)', fontSize: '0.75rem',
                  cursor: 'pointer', fontWeight: 600,
                }}
              >
                {acking.has(n.id) ? '...' : 'Mark read'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
