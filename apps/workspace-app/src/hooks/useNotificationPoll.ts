/**
 * N-069 — Notification poll hook.
 *
 * Polls GET /notifications/inbox/unread-count every 30s (standard mode)
 * or 120s (low-data mode).  On low-data, full inbox fetch is suppressed
 * until the drawer is explicitly opened.
 *
 * The hook is intentionally polling-only in Phase 5.  The SSE/WebSocket
 * upgrade path is documented in docs/adr/notification-realtime-sse-upgrade-path.md
 * and scheduled for Phase 8.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';

const POLL_INTERVAL_STANDARD = 30_000;   // 30 seconds
const POLL_INTERVAL_LOW_DATA  = 120_000; // 2 minutes

export interface UseNotificationPollOptions {
  enabled?: boolean;
  lowDataMode?: boolean;
}

export interface NotificationPollState {
  unreadCount: number;
  loading: boolean;
  lastPolledAt: number | null;
  refresh: () => Promise<void>;
}

export function useNotificationPoll(
  opts: UseNotificationPollOptions = {},
): NotificationPollState {
  const { enabled = true, lowDataMode = false } = opts;

  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastPolledAt, setLastPolledAt] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchCount = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    try {
      const res = await api.get<{ count: number }>('/notifications/inbox/unread-count');
      if (mountedRef.current) {
        setUnreadCount(res.count ?? 0);
        setLastPolledAt(Date.now());
      }
    } catch {
      // Silently swallow network errors — badge stays at last known count
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) return;

    void fetchCount(); // Initial poll on mount

    const interval = lowDataMode ? POLL_INTERVAL_LOW_DATA : POLL_INTERVAL_STANDARD;
    intervalRef.current = setInterval(() => { void fetchCount(); }, interval);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, lowDataMode, fetchCount]);

  return { unreadCount, loading, lastPolledAt, refresh: fetchCount };
}
