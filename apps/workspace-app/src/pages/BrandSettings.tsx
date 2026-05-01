/**
 * Brand Settings Page
 * Wave 2 — Batch 2 (C2-1 through C2-5)
 *
 * Features:
 * - Theme picker — preset colour themes
 * - Business logo upload + preview
 * - Custom domain input with DNS instructions
 * - Social links manager (WhatsApp, Instagram, Twitter, Facebook, TikTok, YouTube)
 * - SEO settings (meta title, description, keywords)
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BrandProfile {
  theme_key: string | null;
  primary_color: string | null;
  logo_url: string | null;
  custom_domain: string | null;
  social_whatsapp: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}

// ─── Preset themes ───────────────────────────────────────────────────────────

const THEMES = [
  { key: 'waka_blue',   label: 'Waka Blue',    primary: '#0F4C81', secondary: '#E8F4FD', accent: '#F59E0B' },
  { key: 'midnight',    label: 'Midnight',     primary: '#1e1b4b', secondary: '#ede9fe', accent: '#8b5cf6' },
  { key: 'forest',      label: 'Forest',       primary: '#14532d', secondary: '#dcfce7', accent: '#f59e0b' },
  { key: 'terracotta',  label: 'Terracotta',   primary: '#9a3412', secondary: '#fff7ed', accent: '#0F4C81' },
  { key: 'slate',       label: 'Slate',        primary: '#0f172a', secondary: '#f1f5f9', accent: '#06b6d4' },
  { key: 'rose',        label: 'Rose Gold',    primary: '#881337', secondary: '#fff1f2', accent: '#d97706' },
  { key: 'ocean',       label: 'Ocean',        primary: '#0c4a6e', secondary: '#e0f2fe', accent: '#10b981' },
  { key: 'earth',       label: 'Earth',        primary: '#78350f', secondary: '#fef3c7', accent: '#16a34a' },
];

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px', marginBottom: 20 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 18px' }}>{subtitle}</p>}
      {!subtitle && <div style={{ marginBottom: 18 }} />}
      {children}
    </div>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BrandSettings() {
  const { user } = useAuth();
  const workspaceId = user?.workspaceId;

  const [brand, setBrand] = useState<BrandProfile>({
    theme_key: 'waka_blue', primary_color: null, logo_url: null, custom_domain: null,
    social_whatsapp: null, social_instagram: null, social_twitter: null,
    social_facebook: null, social_tiktok: null, social_youtube: null,
    seo_title: null, seo_description: null, seo_keywords: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const loadBrand = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await api.get<BrandProfile>(`/brand-settings/${workspaceId}`);
      setBrand(prev => ({ ...prev, ...res }));
    } catch {
      // New workspace — use defaults
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { loadBrand(); }, [loadBrand]);

  const save = async (section: string, data: Partial<BrandProfile>) => {
    if (!workspaceId) return;
    setSaving(section);
    try {
      await api.patch(`/brand-settings/${workspaceId}`, data);
      setBrand(prev => ({ ...prev, ...data }));
      toast.success('Saved!');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!workspaceId) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setLogoUploading(true);
    try {
      // Encode as base64 data URL and send to API
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await api.post<{ url: string }>('/brand-settings/logo', {
        workspace_id: workspaceId,
        data_url: dataUrl,
        file_type: file.type,
        file_name: file.name,
      });
      setBrand(prev => ({ ...prev, logo_url: res.url }));
      toast.success('Logo saved!');
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Logo upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  // ─── Local field states ────────────────────────────────────────────────────
  const [domain, setDomain] = useState('');
  const [socials, setSocials] = useState({ whatsapp: '', instagram: '', twitter: '', facebook: '', tiktok: '', youtube: '' });
  const [seo, setSeo] = useState({ title: '', description: '', keywords: '' });

  // Sync from loaded brand
  useEffect(() => {
    if (!loading) {
      setDomain(brand.custom_domain ?? '');
      setSocials({
        whatsapp: brand.social_whatsapp ?? '',
        instagram: brand.social_instagram ?? '',
        twitter: brand.social_twitter ?? '',
        facebook: brand.social_facebook ?? '',
        tiktok: brand.social_tiktok ?? '',
        youtube: brand.social_youtube ?? '',
      });
      setSeo({
        title: brand.seo_title ?? '',
        description: brand.seo_description ?? '',
        keywords: brand.seo_keywords ?? '',
      });
    }
  }, [loading, brand]);

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading brand settings…</div>;

  const selectedTheme = THEMES.find(t => t.key === brand.theme_key) ?? THEMES[0]!;

  return (
    <div id="main-content" style={{ padding: '24px 24px 80px', maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Brand Settings</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Customise how your business looks across WakaPage and the platform.</p>
      </div>

      {/* ── Theme picker ─────────────────────────────────────────── */}
      <Section title="Colour Theme" subtitle="Choose a preset theme for your WakaPage and public profile.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
          {THEMES.map(t => {
            const isSelected = brand.theme_key === t.key;
            return (
              <button key={t.key} onClick={() => setBrand(prev => ({ ...prev, theme_key: t.key }))}
                style={{
                  padding: '12px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${isSelected ? t.primary : '#e5e7eb'}`,
                  background: isSelected ? t.secondary : '#fff',
                  boxShadow: isSelected ? `0 0 0 2px ${t.primary}40` : 'none',
                  transition: 'all 0.15s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
                  {[t.primary, t.secondary, t.accent].map((c, i) => (
                    <div key={i} style={{ width: 18, height: 18, borderRadius: 99, background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 400, color: isSelected ? t.primary : '#374151' }}>{t.label}</div>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Selected: <strong style={{ color: selectedTheme.primary }}>{selectedTheme.label}</strong>
          </span>
          <Button onClick={() => save('theme', { theme_key: brand.theme_key })} disabled={saving === 'theme'}>
            {saving === 'theme' ? 'Saving…' : 'Save Theme'}
          </Button>
        </div>
      </Section>

      {/* ── Logo upload ────────────────────────────────────────────── */}
      <Section title="Business Logo" subtitle="Upload your logo (PNG or JPG, max 2MB). Displayed on your WakaPage and receipts.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Preview */}
          <div style={{
            width: 96, height: 96, borderRadius: 12, border: '2px dashed #d1d5db',
            background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {brand.logo_url ? (
              <img src={brand.logo_url} alt="Business logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: 32 }}>🏢</span>
            )}
          </div>
          <div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }}
            />
            <Button onClick={() => logoInputRef.current?.click()} disabled={logoUploading}>
              {logoUploading ? 'Uploading…' : '📤 Upload Logo'}
            </Button>
            {brand.logo_url && (
              <button onClick={() => save('logo', { logo_url: null })} style={{ marginLeft: 10, fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Remove
              </button>
            )}
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Recommended: square, 512×512px or larger.</p>
          </div>
        </div>
      </Section>

      {/* ── Custom domain ─────────────────────────────────────────── */}
      <Section title="Custom Domain" subtitle="Point your own domain to your WakaPage (e.g. menu.mybusiness.com).">
        <Field label="Custom domain" hint="Enter only the domain — e.g. menu.mybusiness.com (no https://)">
          <Input value={domain} onChange={e => setDomain(e.target.value)} placeholder="menu.mybusiness.com" />
        </Field>
        {domain && (
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 13 }}>
            <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: 8 }}>📋 DNS Setup Instructions</div>
            <p style={{ color: '#0c4a6e', margin: '0 0 6px' }}>Add a <strong>CNAME</strong> record to your DNS provider:</p>
            <div style={{ fontFamily: 'monospace', background: '#fff', border: '1px solid #bae6fd', borderRadius: 6, padding: '6px 10px', marginBottom: 6 }}>
              <div><strong>Type:</strong> CNAME</div>
              <div><strong>Name:</strong> {domain.split('.')[0]}</div>
              <div><strong>Value:</strong> pages.webwaka.com</div>
              <div><strong>TTL:</strong> 3600</div>
            </div>
            <p style={{ color: '#6b7280', margin: 0, fontSize: 12 }}>DNS changes can take up to 48 hours to propagate. SSL is provisioned automatically.</p>
          </div>
        )}
        <Button onClick={() => save('domain', { custom_domain: domain || null })} disabled={saving === 'domain'}>
          {saving === 'domain' ? 'Saving…' : 'Save Domain'}
        </Button>
      </Section>

      {/* ── Social links ──────────────────────────────────────────── */}
      <Section title="Social Links" subtitle="These appear on your WakaPage and public profile.">
        {([
          { key: 'whatsapp',  label: 'WhatsApp',  icon: '📱', placeholder: '+2348000000000' },
          { key: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'https://instagram.com/yourbusiness' },
          { key: 'facebook',  label: 'Facebook',  icon: '👥', placeholder: 'https://facebook.com/yourbusiness' },
          { key: 'twitter',   label: 'Twitter/X', icon: '🐦', placeholder: 'https://x.com/yourbusiness' },
          { key: 'tiktok',    label: 'TikTok',    icon: '🎵', placeholder: 'https://tiktok.com/@yourbusiness' },
          { key: 'youtube',   label: 'YouTube',   icon: '▶️', placeholder: 'https://youtube.com/@yourbusiness' },
        ] as const).map(({ key, label, icon, placeholder }) => (
          <Field key={key} label={`${icon} ${label}`}>
            <Input
              value={socials[key]}
              onChange={e => setSocials(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
            />
          </Field>
        ))}
        <Button onClick={() => save('socials', {
          social_whatsapp: socials.whatsapp || null,
          social_instagram: socials.instagram || null,
          social_twitter: socials.twitter || null,
          social_facebook: socials.facebook || null,
          social_tiktok: socials.tiktok || null,
          social_youtube: socials.youtube || null,
        })} disabled={saving === 'socials'}>
          {saving === 'socials' ? 'Saving…' : 'Save Social Links'}
        </Button>
      </Section>

      {/* ── SEO settings ─────────────────────────────────────────── */}
      <Section title="SEO Settings" subtitle="Improve how your WakaPage appears in Google search results.">
        <Field label="Page title" hint="Shown as the browser tab title and in Google results. 50–60 characters ideal.">
          <Input
            value={seo.title}
            onChange={e => setSeo(prev => ({ ...prev, title: e.target.value }))}
            placeholder={`${user?.businessName ?? 'My Business'} — Quality Services in Lagos`}
            maxLength={70}
          />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, textAlign: 'right' }}>{seo.title.length}/70</div>
        </Field>
        <Field label="Meta description" hint="A short summary shown in Google results. 120–160 characters ideal.">
          <textarea
            value={seo.description}
            onChange={e => setSeo(prev => ({ ...prev, description: e.target.value }))}
            placeholder="We provide high-quality services to customers across Lagos and Nigeria."
            maxLength={200}
            rows={3}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db',
              fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, textAlign: 'right' }}>{seo.description.length}/200</div>
        </Field>
        <Field label="Keywords" hint="Comma-separated keywords. e.g. plumber Lagos, pipe repair, same-day service">
          <Input
            value={seo.keywords}
            onChange={e => setSeo(prev => ({ ...prev, keywords: e.target.value }))}
            placeholder="plumber Lagos, pipe repair, same-day service"
          />
        </Field>
        {/* Google preview */}
        {(seo.title || seo.description) && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 14, background: '#fafafa', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Google Preview</div>
            <div style={{ fontSize: 18, color: '#1a0dab', fontWeight: 400, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {seo.title || 'Your page title'}
            </div>
            <div style={{ fontSize: 13, color: '#006621', marginBottom: 4 }}>https://yourslug.webwaka.page</div>
            <div style={{ fontSize: 14, color: '#4d5156', lineHeight: 1.5, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {seo.description || 'Your meta description will appear here.'}
            </div>
          </div>
        )}
        <Button onClick={() => save('seo', {
          seo_title: seo.title || null,
          seo_description: seo.description || null,
          seo_keywords: seo.keywords || null,
        })} disabled={saving === 'seo'}>
          {saving === 'seo' ? 'Saving…' : 'Save SEO Settings'}
        </Button>
      </Section>
    </div>
  );
}
