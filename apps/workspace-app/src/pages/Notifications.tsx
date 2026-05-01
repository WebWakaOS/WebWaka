/**
 * Notifications page (A2-5)
 *
 * Features:
 * - Full list of notifications with type icons, timestamps, read/unread state
 * - Mark all as read
 * - Filter by type (all, order, alert, system, ai)
 * - Delete individual notifications
 * - Infinite-scroll style pagination (load more)
 */
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

type NotifType = 'order' | 'alert' | 'system' | 'ai' | 'all';

interface Notification {
  id: string;
  type: Omit<NotifType, 'all'>;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

const TYPE_ICONS: Record<string, string> = {
  order: '🛒',
  alert: '⚠️',
  system: '🔔',
  ai: '🤖',
};

const TYPE_COLORS: Record<string, string> = {
  order: '#0F4C81',
  alert: '#d97706',
  system: '#6b7280',
  ai: '#7c3aed',
};

const PRIMARY = '#0F4C81';

function SkeletonItem() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e5e7eb', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ width: '50%', height: 13, background: '#e5e7eb', borderRadius: 4, marginBottom: 6 }} />
        <div style={{ width: '80%', height: 11, background: '#f3f4f6', borderRadius: 4 }} />
      </div>
    </div>
  );
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotifType>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async (pg = 1, append = false) => {
    if (pg === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '20' });
      if (filter !== 'all') params.append('type', filter);
      const data = await api.get<{ notifications: Notification[]; has_more: boolean }>(`/notifications?${params}`);
      const items = data.notifications ?? [];
      setNotifications(prev => append ? [...prev, ...items] : items);
      setHasMore(data.has_more ?? false);
      setPage(pg);
    } catch {
      if (!append) setNotifications([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => { void load(1); }, [load]);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.post('/notifications/mark-all-read', {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
    finally { setMarkingAll(false); }
  };

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { /* silent */ }
  };

  const deleteNotif = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { /* silent */ }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ padding: '28px 24px', maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: 8, background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, padding: '1px 7px', borderRadius: 999 }}>{unreadCount}</span>
            )}
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>All updates about your workspace</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => void markAllRead()}
            disabled={markingAll}
            style={{ fontSize: 13, fontWeight: 600, color: PRIMARY, background: 'none', border: `1px solid ${PRIMARY}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', opacity: markingAll ? 0.6 : 1 }}
          >
            {markingAll ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'order', 'alert', 'system', 'ai'] as NotifType[]).map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: filter === t ? PRIMARY : '#f3f4f6',
            color: filter === t ? '#fff' : '#374151',
            border: 'none', textTransform: 'capitalize',
          }}>{t === 'all' ? 'All' : t}</button>
        ))}
      </div>

      {/* List */}
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} />)
        : notifications.length === 0
          ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔔</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>You're all caught up!</h3>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                {filter === 'all'
                  ? 'No notifications yet. Activity on your workspace will appear here.'
                  : `No ${filter} notifications.`}
              </p>
            </div>
          )
          : (
            <div>
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => { if (!notif.read) void markRead(notif.id); if (notif.action_url) window.location.href = notif.action_url; }}
                  style={{
                    display: 'flex', gap: 12, padding: '14px 12px', borderBottom: '1px solid #f3f4f6',
                    background: notif.read ? 'transparent' : '#eff6ff',
                    borderRadius: notif.read ? 0 : 8, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: (TYPE_COLORS[notif.type as string] ?? '#6b7280') + '1a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {TYPE_ICONS[notif.type as string] ?? '🔔'}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: notif.read ? 500 : 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.title}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{timeAgo(notif.created_at)}</div>
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.body}</div>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={e => { e.stopPropagation(); void deleteNotif(notif.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 16, padding: '0 4px', flexShrink: 0 }}
                    aria-label="Delete notification"
                  >✕</button>
                </div>
              ))}

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <button
                    onClick={() => void load(page + 1, true)}
                    disabled={loadingMore}
                    style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151', opacity: loadingMore ? 0.6 : 1 }}
                  >
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </div>
          )
      }
    </div>
  );
}
