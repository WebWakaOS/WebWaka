/**
 * Shared React hooks — Partner Admin SPA.
 */
import { useState, useEffect, useCallback } from 'react';
import { partnersApi, loadSavedCredentials, type UsageData } from './api';

// ─── usePartnerProfile ────────────────────────────────────────────────────────

export interface PartnerProfile {
  id?:            string;
  company_name?:  string;
  contact_email?: string;
  status?:        string;
  max_sub_partners?: number;
}

export function usePartnerProfile(): PartnerProfile | null {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);

  useEffect(() => {
    if (!loadSavedCredentials()) return;
    partnersApi.overview().then(([partnerRes]) => {
      if (partnerRes.status === 'fulfilled') {
        const d = partnerRes.value as UsageData;
        setProfile({
          id:              d.id,
          company_name:    d.company_name,
          contact_email:   d.contact_email,
          status:          d.status,
          max_sub_partners: d.max_sub_partners,
        });
      }
    }).catch(() => { /* silent — non-critical */ });
  }, []);

  return profile;
}

// ─── useUnreadCount ───────────────────────────────────────────────────────────

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const d = await partnersApi.unreadCount();
      setCount(d.count ?? 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => { void refresh(); }, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  return { count, refresh };
}

// ─── useToast ─────────────────────────────────────────────────────────────────

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useToast(durationMs = 4000) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), durationMs);
  }, [durationMs]);

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, show, dismiss };
}
