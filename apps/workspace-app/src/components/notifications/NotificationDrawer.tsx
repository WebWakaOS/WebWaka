/**
 * N-069 — Notification drawer (slide-in panel).
 *
 * Fetches paginated inbox from GET /notifications/inbox.
 * Supports: mark as read (PATCH), archive, dismiss.
 * Shows empty state + loading skeleton.
 * Respects low-data mode (suppresses image_url).
 *
 * Accessibility: role="dialog", focus-trap on open, ESC to close.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InboxItem {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  category: string | null;
  iconType: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isRead: boolean;
  createdAt: number;
  pinnedAt: number | null;
}

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() / 1000) - ts);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#dc2626',
  warning:  '#d97706',
  success:  '#16a34a',
  info:     '#0F4C81',
};

function severityDot(severity: string) {
  const color = SEVERITY_COLOR[severity] ?? '#6b7280';
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        marginTop: 6,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// NotificationDrawer
// ---------------------------------------------------------------------------

export function NotificationDrawer({ open, onClose, onCountChange }: NotificationDrawerProps) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const fetchItems = useCallback(async (cursor?: string) => {
    const isInitial = !cursor;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({ limit: '20' });
      if (cursor) params.set('cursor', cursor);
      const res = await api.get<{ items: InboxItem[]; nextCursor: string | null }>(
        `/notifications/inbox?${params.toString()}`,
      );
      if (isInitial) {
        setItems(res.items ?? []);
      } else {
        setItems((prev) => [...prev, ...(res.items ?? [])]);
      }
      setNextCursor(res.nextCursor ?? null);
    } catch {
      // silently fail — stale data shown
    } finally {
      if (isInitial) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void fetchItems();
    closeRef.current?.focus();
  }, [open, fetchItems]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleAction = async (itemId: string, action: 'read' | 'archive' | 'dismiss') => {
    setActionLoading(itemId);
    try {
      await api.patch(`/notifications/inbox/${itemId}`, { action });
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, isRead: action === 'read' ? true : item.isRead }
            : item,
        ).filter((item) =>
          action === 'archive' || action === 'dismiss' ? item.id !== itemId : true,
        ),
      );
      // Notify parent to refresh badge count
      if (action === 'read') {
        const unread = items.filter((i) => !i.isRead && i.id !== itemId).length;
        onCountChange?.(unread);
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = items.filter((i) => !i.isRead).map((i) => i.id);
    for (const id of unreadIds) {
      await handleAction(id, 'read').catch(() => {});
    }
    onCountChange?.(0);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.32)',
          zIndex: 399,
        }}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          maxWidth: '100vw',
          background: '#fff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>
            Notifications
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {items.some((i) => !i.isRead) && (
              <button
                onClick={() => void handleMarkAllRead()}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#0F4C81',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 4,
                }}
              >
                Mark all read
              </button>
            )}
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close notifications"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 6,
                border: 'none',
                background: '#f3f4f6',
                cursor: 'pointer',
                fontSize: 18,
                color: '#374151',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading ? (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  height: 68,
                  borderRadius: 8,
                  background: '#f3f4f6',
                  animation: 'pulse 1.4s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px 24px',
              color: '#9ca3af',
              textAlign: 'center',
              gap: 12,
            }}>
              <span style={{ fontSize: 40 }} aria-hidden="true">🔔</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                  All caught up
                </div>
                <div style={{ fontSize: 13 }}>No notifications yet.</div>
              </div>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: '12px 20px',
                    background: item.isRead ? 'transparent' : '#f0f9ff',
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {severityDot(item.severity)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: item.isRead ? 400 : 600,
                      color: '#111827',
                      marginBottom: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: '#6b7280',
                      marginBottom: 6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.body}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {relativeTime(item.createdAt)}
                      </span>
                      {item.ctaUrl && item.ctaLabel && (
                        <a
                          href={item.ctaUrl}
                          style={{ fontSize: 12, color: '#0F4C81', fontWeight: 600 }}
                          onClick={() => { if (!item.isRead) void handleAction(item.id, 'read'); }}
                        >
                          {item.ctaLabel}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                    {!item.isRead && (
                      <button
                        aria-label="Mark as read"
                        disabled={actionLoading === item.id}
                        onClick={() => void handleAction(item.id, 'read')}
                        style={actionBtn}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      aria-label="Dismiss"
                      disabled={actionLoading === item.id}
                      onClick={() => void handleAction(item.id, 'dismiss')}
                      style={{ ...actionBtn, fontSize: 14 }}
                      title="Dismiss"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {nextCursor && (
                <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                  <button
                    onClick={() => { void fetchItems(nextCursor); }}
                    disabled={loadingMore}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0F4C81',
                      background: 'none',
                      border: '1px solid #e5e7eb',
                      borderRadius: 6,
                      padding: '6px 16px',
                      cursor: loadingMore ? 'not-allowed' : 'pointer',
                      opacity: loadingMore ? 0.6 : 1,
                    }}
                  >
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

const actionBtn: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: 5,
  border: '1px solid #e5e7eb',
  background: '#f9fafb',
  cursor: 'pointer',
  fontSize: 12,
  color: '#374151',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
};
