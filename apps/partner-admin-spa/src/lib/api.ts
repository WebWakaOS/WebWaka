/**
 * Partner Admin API client
 * All requests carry the stored JWT + Partner ID.
 */

export interface Credentials {
  apiBase: string;
  partnerId: string;
  jwt: string;
}

let _creds: Credentials | null = null;

export function setCredentials(c: Credentials) {
  _creds = c;
  try { localStorage.setItem('pa_creds', JSON.stringify(c)); } catch { /* ignore */ }
}

export function loadSavedCredentials(): Credentials | null {
  if (_creds) return _creds;
  try {
    const raw = localStorage.getItem('pa_creds');
    if (raw) { _creds = JSON.parse(raw); return _creds; }
  } catch { /* ignore */ }
  return null;
}

export function clearCredentials() {
  _creds = null;
  try { localStorage.removeItem('pa_creds'); } catch { /* ignore */ }
}

function headers() {
  if (!_creds) throw new Error('Not authenticated');
  return {
    Authorization: `Bearer ${_creds.jwt}`,
    'Content-Type': 'application/json',
    'X-Partner-ID': _creds.partnerId,
  };
}

function base() {
  return (_creds?.apiBase ?? '').replace(/\/+$/, '');
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(base() + path, {
    method,
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json() as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data;
}

export const api = {
  get:    <T>(path: string) => req<T>('GET', path),
  post:   <T>(path: string, body: unknown) => req<T>('POST', path, body),
  patch:  <T>(path: string, body: unknown) => req<T>('PATCH', path, body),
  put:    <T>(path: string, body: unknown) => req<T>('PUT', path, body),
  delete: <T>(path: string) => req<T>('DELETE', path),
};

// ─── Typed endpoint helpers ───────────────────────────────────────────────────

export function pid() {
  if (!_creds) throw new Error('Not authenticated');
  return _creds.partnerId;
}

export const partnersApi = {
  overview:         () => Promise.allSettled([
    api.get<UsageData>('/api/usage'),
    api.get<SubPartnersData>(`/partners/${pid()}/sub-partners`),
    api.get<CreditsData>(`/partners/${pid()}/credits`),
  ]),
  credits:          () => api.get<CreditsData>(`/partners/${pid()}/credits`),
  allocateCredits:  (body: AllocateBody) => api.post<AllocateResult>(`/partners/${pid()}/credits/allocate`, body),
  settlements:      () => api.get<SettlementsData>(`/partners/${pid()}/settlements`),
  subPartners:      () => api.get<SubPartnersData>(`/partners/${pid()}/sub-partners`),
  createSubPartner: (body: CreateSubBody) => api.post<SubPartner>(`/partners/${pid()}/sub-partners`, body),
  toggleSubPartner: (subId: string, status: 'active' | 'suspended') =>
    api.patch<SubPartner>(`/partners/${pid()}/sub-partners/${subId}/status`, { status }),
  branding:         () => api.get<BrandingData>(`/partners/${pid()}/branding`),
  saveBranding:     (body: BrandingBody) => api.put<BrandingData>(`/partners/${pid()}/branding`, body),
  notifications:    () => api.get<NotificationsData>(`/partners/${pid()}/notifications`),
  ackNotification:  (id: string) => api.post<void>(`/partners/${pid()}/notifications/${id}/ack`, {}),
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsageData {
  activeGroups?: number;
  totalMembers?: number;
}

export interface SubPartner {
  id: string;
  tenant_id: string;
  display_name?: string;
  status: 'active' | 'suspended' | 'pending';
  created_at?: string;
}

export interface SubPartnersData {
  subPartners: SubPartner[];
}

export interface CreditsData {
  wallet?: { balanceWc: number; lifetimePurchasedWc: number };
  totalAllocatedWc?: number;
}

export interface Settlement {
  id: string;
  period_start: string;
  period_end: string;
  gross_gmv_kobo: number;
  partner_share_kobo: number;
  share_basis_points: number;
  status: 'pending' | 'paid' | 'processing';
}

export interface SettlementsData {
  settlements: Settlement[];
}

export interface BrandingData {
  logo_url?: string;
  primary_color?: string;
  custom_domain?: string;
  support_email?: string;
}

export interface BrandingBody extends BrandingData {}

export interface AllocateBody {
  recipientTenant: string;
  amountWc: number;
  note?: string;
}

export interface AllocateResult {
  amountWc: number;
  recipientTenant: string;
  partnerBalanceAfter: number;
}

export interface CreateSubBody {
  tenant_id: string;
  display_name?: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface NotificationsData {
  notifications: Notification[];
}
