/**
 * useVerticalEngine — Wave 3 B3-4
 * WebWaka OS — Client-side hook for vertical profile CRUD + FSM transitions.
 *
 * Abstracts all fetch logic from page components so they only call:
 *   const { profile, loading, error, update, transition, refresh } = useVerticalEngine(slug, workspaceId);
 *
 * Design:
 *   - Fetches GET /api/v1/{slug}/profile?workspaceId={id} on mount
 *   - update(data) → PATCH /api/v1/{slug}/profile
 *   - transition(to) → POST /api/v1/{slug}/fsm/transition
 *   - refresh() → re-fetches profile
 *   - Manages loading / error state locally
 *   - Accepts optional baseUrl (defaults to '') for SSR / test overrides
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface VerticalProfile {
  id: string;
  slug: string;
  workspaceId: string;
  state: string;
  [field: string]: unknown;
}

export interface UseVerticalEngineOptions {
  /** Override the API base URL (default: '') */
  baseUrl?: string;
  /** Additional headers forwarded on every request (e.g. Authorization) */
  headers?: Record<string, string>;
  /** Disable automatic fetch on mount */
  skipInitialFetch?: boolean;
}

export interface UseVerticalEngineResult {
  profile: VerticalProfile | null;
  loading: boolean;
  error: Error | null;
  update: (data: Record<string, unknown>) => Promise<VerticalProfile>;
  transition: (toState: string, meta?: Record<string, unknown>) => Promise<VerticalProfile>;
  refresh: () => Promise<void>;
}

async function apiFetch<T>(
  url: string,
  options: RequestInit,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extraHeaders,
      ...((options.headers as Record<string, string>) ?? {}),
    },
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function useVerticalEngine(
  slug: string,
  workspaceId: string,
  opts: UseVerticalEngineOptions = {},
): UseVerticalEngineResult {
  const { baseUrl = '', headers: extraHeaders, skipInitialFetch = false } = opts;
  const [profile, setProfile] = useState<VerticalProfile | null>(null);
  const [loading, setLoading]  = useState<boolean>(!skipInitialFetch);
  const [error, setError]      = useState<Error | null>(null);

  const paramsRef = useRef({ slug, workspaceId, baseUrl, extraHeaders });
  paramsRef.current = { slug, workspaceId, baseUrl, extraHeaders };

  const refresh = useCallback(async (): Promise<void> => {
    const { slug, workspaceId, baseUrl, extraHeaders } = paramsRef.current;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<VerticalProfile>(
        `${baseUrl}/api/v1/${slug}/profile?workspaceId=${encodeURIComponent(workspaceId)}`,
        { method: 'GET' },
        extraHeaders,
      );
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!skipInitialFetch) { void refresh(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, workspaceId]);

  const update = useCallback(async (data: Record<string, unknown>): Promise<VerticalProfile> => {
    const { slug, workspaceId, baseUrl, extraHeaders } = paramsRef.current;
    setLoading(true); setError(null);
    try {
      const updated = await apiFetch<VerticalProfile>(
        `${baseUrl}/api/v1/${slug}/profile`,
        { method: 'PATCH', body: JSON.stringify({ workspaceId, ...data }) },
        extraHeaders,
      );
      setProfile(updated);
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e); throw e;
    } finally { setLoading(false); }
  }, []);

  const transition = useCallback(async (toState: string, meta: Record<string, unknown> = {}): Promise<VerticalProfile> => {
    const { slug, workspaceId, baseUrl, extraHeaders } = paramsRef.current;
    setLoading(true); setError(null);
    try {
      const updated = await apiFetch<VerticalProfile>(
        `${baseUrl}/api/v1/${slug}/fsm/transition`,
        { method: 'POST', body: JSON.stringify({ workspaceId, toState, ...meta }) },
        extraHeaders,
      );
      setProfile(updated);
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e); throw e;
    } finally { setLoading(false); }
  }, []);

  return { profile, loading, error, update, transition, refresh };
}
