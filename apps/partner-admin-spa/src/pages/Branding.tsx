/**
 * Branding page — E1-4: White-label branding controls
 */
import { useEffect, useState, FormEvent } from 'react';
import { partnersApi, type BrandingData } from '../lib/api';

export default function Branding() {
  const [logoUrl,      setLogoUrl]      = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0F4C81');
  const [customDomain, setCustomDomain] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState('');
  const [error,    setError]    = useState('');

  useEffect(() => {
    partnersApi.branding().then((d: BrandingData) => {
      if (d.logo_url)      setLogoUrl(d.logo_url);
      if (d.primary_color) setPrimaryColor(d.primary_color);
      if (d.custom_domain) setCustomDomain(d.custom_domain);
      if (d.support_email) setSupportEmail(d.support_email);
      setLoading(false);
    }).catch(e => { setError((e as Error).message); setLoading(false); });
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(''); setError('');
    try {
      await partnersApi.saveBranding({
        logo_url:      logoUrl      || undefined,
        primary_color: primaryColor || undefined,
        custom_domain: customDomain || undefined,
        support_email: supportEmail || undefined,
      });
      setMsg('Branding saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setError((e as Error).message); } finally { setSaving(false); }
  }

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading...</p>;

  return (
    <div>
      <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>White-Label Branding</h2>
      <div style={{
        background: 'var(--dark)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '1.75rem', maxWidth: 520,
      }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={labelStyle}>Logo URL</span>
            <input
              type="url" placeholder="https://..." value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)} style={{ width: '100%' }}
            />
            {logoUrl && (
              <img
                src={logoUrl} alt="Logo preview"
                style={{ maxHeight: 56, maxWidth: 180, marginTop: 6, objectFit: 'contain', borderRadius: 4 }}
                onError={ev => (ev.currentTarget.style.display = 'none')}
              />
            )}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={labelStyle}>Primary Colour</span>
            <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
              <input
                type="color" value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                style={{ width: 44, height: 36, padding: 2, border: '1px solid var(--border)', borderRadius: 6, background: 'none', cursor: 'pointer' }}
              />
              <input
                type="text" value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                style={{ width: 120 }}
                placeholder="#0F4C81"
              />
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: primaryColor, border: '1px solid var(--border)',
              }} />
            </div>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={labelStyle}>Custom Domain</span>
            <input
              type="text" placeholder="portal.yourcompany.com" value={customDomain}
              onChange={e => setCustomDomain(e.target.value)} style={{ width: '100%' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={labelStyle}>Support Email</span>
            <input
              type="email" placeholder="support@yourcompany.com" value={supportEmail}
              onChange={e => setSupportEmail(e.target.value)} style={{ width: '100%' }}
            />
          </label>

          {error && <p style={{ color: '#ef4444', fontSize: '0.8125rem' }}>{error}</p>}
          {msg   && <p style={{ color: 'var(--green)', fontSize: '0.8125rem' }}>{msg}</p>}

          <button
            type="submit" disabled={saving}
            style={{
              padding: '0.625rem', background: 'var(--blue)', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.9375rem',
              opacity: saving ? 0.7 : 1, marginTop: 4,
            }}
          >
            {saving ? 'Saving...' : 'Save Branding'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.8125rem', color: 'var(--muted)', fontWeight: 600,
};
